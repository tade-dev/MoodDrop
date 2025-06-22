
-- Create follows table for user following functionality
CREATE TABLE public.follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  followed_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, followed_id)
);

-- Create bookmarks table for saving/bookmarking drops
CREATE TABLE public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  drop_id UUID REFERENCES public.drops(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, drop_id)
);

-- Add drop_type column to existing drops table
ALTER TABLE public.drops 
ADD COLUMN drop_type TEXT DEFAULT 'song' CHECK (drop_type IN ('song', 'album', 'playlist'));

-- Add RLS policies for follows table
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all follows" 
  ON public.follows 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own follows" 
  ON public.follows 
  FOR INSERT 
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" 
  ON public.follows 
  FOR DELETE 
  USING (auth.uid() = follower_id);

-- Add RLS policies for bookmarks table
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks" 
  ON public.bookmarks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" 
  ON public.bookmarks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" 
  ON public.bookmarks 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to get user profile with follow stats
CREATE OR REPLACE FUNCTION public.get_user_profile_with_stats(profile_user_id UUID)
RETURNS TABLE(
  id UUID,
  username TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  followers_count BIGINT,
  following_count BIGINT,
  drops_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.email,
    p.avatar_url,
    p.created_at,
    COALESCE(followers.count, 0) as followers_count,
    COALESCE(following.count, 0) as following_count,
    COALESCE(drops.count, 0) as drops_count
  FROM public.profiles p
  LEFT JOIN (
    SELECT followed_id, COUNT(*) as count 
    FROM public.follows 
    WHERE followed_id = profile_user_id
    GROUP BY followed_id
  ) followers ON p.id = followers.followed_id
  LEFT JOIN (
    SELECT follower_id, COUNT(*) as count 
    FROM public.follows 
    WHERE follower_id = profile_user_id
    GROUP BY follower_id
  ) following ON p.id = following.follower_id
  LEFT JOIN (
    SELECT user_id, COUNT(*) as count 
    FROM public.drops 
    WHERE user_id = profile_user_id
    GROUP BY user_id
  ) drops ON p.id = drops.user_id
  WHERE p.id = profile_user_id;
END;
$$;
