
-- Create ai_playlists table for storing AI-generated playlists
CREATE TABLE public.ai_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  playlist_data JSONB NOT NULL, -- Store playlist info (songs, spotify link, etc)
  spotify_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.ai_playlists ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_playlists
CREATE POLICY "Users can view all ai playlists" 
  ON public.ai_playlists 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own ai playlists" 
  ON public.ai_playlists 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ai playlists" 
  ON public.ai_playlists 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ai playlists" 
  ON public.ai_playlists 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create ai_playlist_reactions table for reactions on AI playlists
CREATE TABLE public.ai_playlist_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ai_playlist_id UUID NOT NULL REFERENCES public.ai_playlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('fire', 'heart', 'chill')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ai_playlist_id, user_id)
);

-- Add RLS for reactions
ALTER TABLE public.ai_playlist_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all ai playlist reactions" 
  ON public.ai_playlist_reactions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create reactions" 
  ON public.ai_playlist_reactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions" 
  ON public.ai_playlist_reactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" 
  ON public.ai_playlist_reactions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create ai_playlist_comments table for comments on AI playlists
CREATE TABLE public.ai_playlist_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ai_playlist_id UUID NOT NULL REFERENCES public.ai_playlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for comments
ALTER TABLE public.ai_playlist_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all ai playlist comments" 
  ON public.ai_playlist_comments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create comments" 
  ON public.ai_playlist_comments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
  ON public.ai_playlist_comments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
  ON public.ai_playlist_comments 
  FOR DELETE 
  USING (auth.uid() = user_id);
