
-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own subscription
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Allow admin to view all subscriptions
CREATE POLICY "Admin can view all subscriptions" ON public.subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = auth.users.id 
      AND auth.users.email = 'akintadeseun816@gmail.com'
    )
  );

-- Allow edge functions to insert/update subscriptions
CREATE POLICY "Edge functions can manage subscriptions" ON public.subscriptions
  FOR ALL USING (true);

-- Create function to check if user is premium
CREATE OR REPLACE FUNCTION public.is_user_premium(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  premium_enabled BOOLEAN;
  user_subscription RECORD;
BEGIN
  -- Check if premium is globally enabled
  SELECT gs.premium_enabled INTO premium_enabled
  FROM public.global_settings gs
  WHERE gs.id = 1;
  
  IF NOT premium_enabled THEN
    RETURN FALSE;
  END IF;
  
  -- Check user's subscription status
  SELECT * INTO user_subscription
  FROM public.subscriptions
  WHERE user_id = check_user_id
    AND status IN ('active', 'trialing')
    AND (current_period_end IS NULL OR current_period_end > now());
  
  RETURN user_subscription IS NOT NULL;
END;
$$;

-- Create function to get user's subscription details
CREATE OR REPLACE FUNCTION public.get_user_subscription(check_user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
  id UUID,
  plan TEXT,
  status TEXT,
  current_period_end TIMESTAMPTZ,
  is_premium BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.plan,
    s.status,
    s.current_period_end,
    public.is_user_premium(check_user_id) as is_premium
  FROM public.subscriptions s
  WHERE s.user_id = check_user_id
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$;

-- Create function to get admin subscription overview
CREATE OR REPLACE FUNCTION public.get_admin_subscriptions()
RETURNS TABLE(
  id UUID,
  user_email TEXT,
  username TEXT,
  plan TEXT,
  status TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is super admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = auth.users.id 
    AND auth.users.email = 'akintadeseun816@gmail.com'
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin only';
  END IF;

  RETURN QUERY
  SELECT 
    s.id,
    p.email as user_email,
    p.username,
    s.plan,
    s.status,
    s.current_period_end,
    s.created_at
  FROM public.subscriptions s
  JOIN public.profiles p ON s.user_id = p.id
  ORDER BY s.created_at DESC;
END;
$$;

-- Add daily drop limit tracking
CREATE TABLE public.daily_drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  drop_date DATE NOT NULL DEFAULT CURRENT_DATE,
  drop_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, drop_date)
);

-- Enable RLS on daily_drops
ALTER TABLE public.daily_drops ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own daily drops
CREATE POLICY "Users can view own daily drops" ON public.daily_drops
  FOR SELECT USING (auth.uid() = user_id);

-- Allow edge functions to manage daily drops
CREATE POLICY "Edge functions can manage daily drops" ON public.daily_drops
  FOR ALL USING (true);

-- Function to check if user can create drop
CREATE OR REPLACE FUNCTION public.can_user_create_drop(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_premium BOOLEAN;
  today_drops INTEGER;
BEGIN
  -- Check if user is premium
  SELECT public.is_user_premium(check_user_id) INTO is_premium;
  
  -- Premium users have unlimited drops
  IF is_premium THEN
    RETURN TRUE;
  END IF;
  
  -- Check today's drop count for free users
  SELECT COALESCE(drop_count, 0) INTO today_drops
  FROM public.daily_drops
  WHERE user_id = check_user_id AND drop_date = CURRENT_DATE;
  
  -- Free users limited to 3 drops per day
  RETURN today_drops < 3;
END;
$$;

-- Function to increment daily drop count
CREATE OR REPLACE FUNCTION public.increment_daily_drop_count(check_user_id UUID DEFAULT auth.uid())
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.daily_drops (user_id, drop_date, drop_count)
  VALUES (check_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, drop_date)
  DO UPDATE SET drop_count = daily_drops.drop_count + 1;
END;
$$;
