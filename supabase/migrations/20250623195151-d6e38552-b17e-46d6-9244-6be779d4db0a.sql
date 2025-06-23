
-- Drop the existing problematic RLS policies
DROP POLICY IF EXISTS "Super admin can manage global settings" ON public.global_settings;
DROP POLICY IF EXISTS "Everyone can read global settings" ON public.global_settings;

-- Create a security definer function to check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Check if the current user's email in profiles table matches the super admin email
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND email = 'akintadeseun816@gmail.com'
  );
END;
$$;

-- Create policy for super admin to manage global settings using the function
CREATE POLICY "Super admin can manage global settings" 
  ON public.global_settings 
  FOR ALL 
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Create policy for everyone to read global settings (for premium feature checks)
CREATE POLICY "Everyone can read global settings" 
  ON public.global_settings 
  FOR SELECT 
  USING (true);

-- Also update the admin functions to use the same pattern
CREATE OR REPLACE FUNCTION public.get_all_users_admin(page_limit INTEGER DEFAULT 20, page_offset INTEGER DEFAULT 0)
RETURNS TABLE(
  id UUID,
  email TEXT,
  username TEXT,
  flagged BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  drops_count BIGINT,
  total_votes BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is super admin using profiles table
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Super admin only';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.username,
    p.flagged,
    p.created_at,
    COALESCE(d.drops_count, 0) as drops_count,
    COALESCE(v.total_votes, 0) as total_votes
  FROM public.profiles p
  LEFT JOIN (
    SELECT user_id, COUNT(*) as drops_count
    FROM public.drops
    GROUP BY user_id
  ) d ON p.id = d.user_id
  LEFT JOIN (
    SELECT d.user_id, COUNT(v.id) as total_votes
    FROM public.drops d
    LEFT JOIN public.votes v ON d.id = v.drop_id
    GROUP BY d.user_id
  ) v ON p.id = v.user_id
  ORDER BY p.created_at DESC
  LIMIT page_limit OFFSET page_offset;
END;
$$;

-- Update other admin functions to use the new is_super_admin function
CREATE OR REPLACE FUNCTION public.admin_flag_user(user_id UUID, flag_status BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is super admin
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Super admin only';
  END IF;

  UPDATE public.profiles 
  SET flagged = flag_status 
  WHERE id = user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_drops_admin(page_limit INTEGER DEFAULT 20, page_offset INTEGER DEFAULT 0, mood_filter UUID DEFAULT NULL)
RETURNS TABLE(
  id UUID,
  song_title TEXT,
  artist_name TEXT,
  spotify_url TEXT,
  caption TEXT,
  mood_name TEXT,
  mood_emoji TEXT,
  username TEXT,
  user_email TEXT,
  vote_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is super admin
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Super admin only';
  END IF;

  RETURN QUERY
  SELECT 
    d.id,
    d.song_title,
    d.artist_name,
    d.spotify_url,
    d.caption,
    m.name as mood_name,
    m.emoji as mood_emoji,
    p.username,
    p.email as user_email,
    COUNT(v.id) as vote_count,
    d.created_at
  FROM public.drops d
  LEFT JOIN public.moods m ON d.mood_id = m.id
  LEFT JOIN public.profiles p ON d.user_id = p.id
  LEFT JOIN public.votes v ON d.id = v.drop_id
  WHERE (mood_filter IS NULL OR d.mood_id = mood_filter)
  GROUP BY d.id, d.song_title, d.artist_name, d.spotify_url, d.caption, m.name, m.emoji, p.username, p.email, d.created_at
  ORDER BY d.created_at DESC
  LIMIT page_limit OFFSET page_offset;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_moods_admin()
RETURNS TABLE(
  id UUID,
  name TEXT,
  emoji TEXT,
  is_custom BOOLEAN,
  created_by UUID,
  creator_username TEXT,
  drops_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is super admin
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Super admin only';
  END IF;

  RETURN QUERY
  SELECT 
    m.id,
    m.name,
    m.emoji,
    m.is_custom,
    m.created_by,
    p.username as creator_username,
    COUNT(d.id) as drops_count,
    m.created_at
  FROM public.moods m
  LEFT JOIN public.profiles p ON m.created_by = p.id
  LEFT JOIN public.drops d ON m.id = d.mood_id
  GROUP BY m.id, m.name, m.emoji, m.is_custom, m.created_by, p.username, m.created_at
  ORDER BY drops_count DESC, m.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_subscriptions()
RETURNS TABLE(
  id UUID,
  user_email TEXT,
  username TEXT,
  plan TEXT,
  status TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is super admin
  IF NOT public.is_super_admin() THEN
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
