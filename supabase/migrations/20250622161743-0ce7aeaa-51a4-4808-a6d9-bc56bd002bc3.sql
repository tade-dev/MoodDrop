
-- Add featured flag to handle playlists (assuming we need a playlists table)
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_art_url TEXT,
  mood_id UUID REFERENCES public.moods(id),
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  follower_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add location fields to drops table for nearby vibes
ALTER TABLE public.drops 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_name TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_drops_created_at ON public.drops(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON public.votes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drops_location ON public.drops(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_playlists_featured ON public.playlists(is_featured, created_at DESC) WHERE is_featured = true;

-- RLS policies for playlists
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view playlists" 
  ON public.playlists 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own playlists" 
  ON public.playlists 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own playlists" 
  ON public.playlists 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Create view for creator leaderboard
CREATE OR REPLACE VIEW public.creator_leaderboard AS
SELECT 
  p.id,
  p.username,
  p.avatar_url,
  COUNT(v.id) as upvote_count,
  p.created_at
FROM public.profiles p
LEFT JOIN public.drops d ON p.id = d.user_id
LEFT JOIN public.votes v ON d.id = v.drop_id 
WHERE v.vote_type IN ('up', 'fire') 
  AND v.created_at >= NOW() - INTERVAL '7 days'
GROUP BY p.id, p.username, p.avatar_url, p.created_at
ORDER BY upvote_count DESC;

-- Create RPC function for trending moods
CREATE OR REPLACE FUNCTION get_trending_moods(hours_back INTEGER DEFAULT 24, result_limit INTEGER DEFAULT 6)
RETURNS TABLE (
  id UUID,
  name TEXT,
  emoji TEXT,
  drop_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.name,
    m.emoji,
    COUNT(d.id) as drop_count
  FROM public.moods m
  LEFT JOIN public.drops d ON m.id = d.mood_id
  WHERE d.created_at >= NOW() - (hours_back || ' hours')::INTERVAL
  GROUP BY m.id, m.name, m.emoji
  ORDER BY drop_count DESC
  LIMIT result_limit;
END;
$$;

-- Create RPC function for hot drops
CREATE OR REPLACE FUNCTION get_hot_drops(hours_back INTEGER DEFAULT 24, result_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  song_title TEXT,
  artist_name TEXT,
  spotify_url TEXT,
  caption TEXT,
  mood_name TEXT,
  mood_emoji TEXT,
  username TEXT,
  vote_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
AS $$
BEGIN
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
    COUNT(v.id) as vote_count,
    d.created_at
  FROM public.drops d
  LEFT JOIN public.moods m ON d.mood_id = m.id
  LEFT JOIN public.profiles p ON d.user_id = p.id
  LEFT JOIN public.votes v ON d.id = v.drop_id
  WHERE d.created_at >= NOW() - (hours_back || ' hours')::INTERVAL
  GROUP BY d.id, d.song_title, d.artist_name, d.spotify_url, d.caption, m.name, m.emoji, p.username, d.created_at
  ORDER BY vote_count DESC, d.created_at DESC
  LIMIT result_limit;
END;
$$;

-- Create RPC function for nearby drops
CREATE OR REPLACE FUNCTION get_nearby_drops(
  user_lat DECIMAL, 
  user_lng DECIMAL, 
  radius_km INTEGER DEFAULT 50,
  result_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  song_title TEXT,
  artist_name TEXT,
  spotify_url TEXT,
  caption TEXT,
  mood_name TEXT,
  mood_emoji TEXT,
  username TEXT,
  distance_km DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
AS $$
BEGIN
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
    (6371 * acos(cos(radians(user_lat)) * cos(radians(d.latitude)) * cos(radians(d.longitude) - radians(user_lng)) + sin(radians(user_lat)) * sin(radians(d.latitude))))::DECIMAL as distance_km,
    d.created_at
  FROM public.drops d
  LEFT JOIN public.moods m ON d.mood_id = m.id
  LEFT JOIN public.profiles p ON d.user_id = p.id
  WHERE d.latitude IS NOT NULL 
    AND d.longitude IS NOT NULL
    AND (6371 * acos(cos(radians(user_lat)) * cos(radians(d.latitude)) * cos(radians(d.longitude) - radians(user_lng)) + sin(radians(user_lat)) * sin(radians(d.latitude)))) <= radius_km
  ORDER BY distance_km ASC, d.created_at DESC
  LIMIT result_limit;
END;
$$;
