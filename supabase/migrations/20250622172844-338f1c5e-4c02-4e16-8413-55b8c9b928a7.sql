
-- Create global settings table for premium toggle
CREATE TABLE public.global_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  premium_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT single_row_constraint CHECK (id = 1)
);

-- Insert default settings row
INSERT INTO public.global_settings (id, premium_enabled) VALUES (1, false);

-- Add flagged column to profiles table for user flagging
ALTER TABLE public.profiles ADD COLUMN flagged BOOLEAN NOT NULL DEFAULT false;

-- Enable RLS on global_settings
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for super admin to manage global settings
CREATE POLICY "Super admin can manage global settings" 
  ON public.global_settings 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = auth.users.id 
      AND auth.users.email = 'akintadeseun816@gmail.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = auth.users.id 
      AND auth.users.email = 'akintadeseun816@gmail.com'
    )
  );

-- Create policy for everyone to read global settings (for premium feature checks)
CREATE POLICY "Everyone can read global settings" 
  ON public.global_settings 
  FOR SELECT 
  USING (true);

-- Create admin function to get all users with stats
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

-- Create admin function to get all drops with details
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
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = auth.users.id 
    AND auth.users.email = 'akintadeseun816@gmail.com'
  ) THEN
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

-- Create admin function to get mood statistics
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
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = auth.users.id 
    AND auth.users.email = 'akintadeseun816@gmail.com'
  ) THEN
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

-- Create admin function to flag/unflag users
CREATE OR REPLACE FUNCTION public.admin_flag_user(user_id UUID, flag_status BOOLEAN)
RETURNS VOID
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

  UPDATE public.profiles 
  SET flagged = flag_status 
  WHERE id = user_id;
END;
$$;

-- Create admin function to delete user and their content
CREATE OR REPLACE FUNCTION public.admin_delete_user(user_id UUID)
RETURNS VOID
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

  -- Delete user's votes
  DELETE FROM public.votes WHERE user_id = user_id;
  
  -- Delete user's drops (this will cascade to votes on those drops)
  DELETE FROM public.drops WHERE user_id = user_id;
  
  -- Delete user's follows
  DELETE FROM public.follows WHERE follower_id = user_id OR followed_id = user_id;
  
  -- Delete user's bookmarks
  DELETE FROM public.bookmarks WHERE user_id = user_id;
  
  -- Delete user profile
  DELETE FROM public.profiles WHERE id = user_id;
END;
$$;

-- Create admin function to delete drops
CREATE OR REPLACE FUNCTION public.admin_delete_drop(drop_id UUID)
RETURNS VOID
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

  -- Delete votes on this drop
  DELETE FROM public.votes WHERE drop_id = drop_id;
  
  -- Delete bookmarks for this drop
  DELETE FROM public.bookmarks WHERE drop_id = drop_id;
  
  -- Delete the drop
  DELETE FROM public.drops WHERE id = drop_id;
END;
$$;

-- Create admin function to delete custom moods
CREATE OR REPLACE FUNCTION public.admin_delete_mood(mood_id UUID)
RETURNS VOID
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

  -- Only allow deletion of custom moods
  IF NOT EXISTS (SELECT 1 FROM public.moods WHERE id = mood_id AND is_custom = true) THEN
    RAISE EXCEPTION 'Can only delete custom moods';
  END IF;

  -- Delete drops using this mood (or reassign to default)
  -- For now, we'll prevent deletion if there are drops using this mood
  IF EXISTS (SELECT 1 FROM public.drops WHERE mood_id = mood_id) THEN
    RAISE EXCEPTION 'Cannot delete mood that has associated drops';
  END IF;
  
  -- Delete the mood
  DELETE FROM public.moods WHERE id = mood_id AND is_custom = true;
END;
$$;
