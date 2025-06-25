
-- Create comments table for Vibe Threads
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drop_id UUID NOT NULL REFERENCES public.drops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- Add contributors and collaboration fields to playlists
ALTER TABLE public.playlists 
ADD COLUMN contributors UUID[] DEFAULT '{}',
ADD COLUMN is_collab BOOLEAN DEFAULT false;

-- Create playlist_tracks table for collaborative playlists
CREATE TABLE public.playlist_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  drop_id UUID NOT NULL REFERENCES public.drops(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, drop_id)
);

-- Add RLS policies for playlist_tracks
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read playlist tracks" ON public.playlist_tracks
  FOR SELECT USING (true);

-- RLS: only contributors can insert into playlist_tracks where playlist.is_collab = true
CREATE POLICY "Contributors can add tracks to collab playlists" ON public.playlist_tracks
  FOR INSERT WITH CHECK (
    auth.uid() = added_by AND
    EXISTS (
      SELECT 1 FROM public.playlists p 
      WHERE p.id = playlist_id 
      AND (p.is_collab = true AND auth.uid() = ANY(p.contributors))
    )
  );

CREATE POLICY "Contributors can remove tracks from collab playlists" ON public.playlist_tracks
  FOR DELETE USING (
    auth.uid() = added_by OR
    EXISTS (
      SELECT 1 FROM public.playlists p 
      WHERE p.id = playlist_id 
      AND p.created_by = auth.uid()
    )
  );

-- Create challenges table for Weekly Mood Challenge
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt TEXT NOT NULL,
  mood_id UUID NOT NULL REFERENCES public.moods(id) ON DELETE CASCADE,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  winner_drop_id UUID REFERENCES public.drops(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for challenges
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read challenges" ON public.challenges
  FOR SELECT USING (true);

CREATE POLICY "Super admin can manage challenges" ON public.challenges
  FOR ALL USING (public.is_super_admin());

-- Add winner badge column to drops
ALTER TABLE public.drops 
ADD COLUMN challenge_winner BOOLEAN DEFAULT false,
ADD COLUMN challenge_id UUID REFERENCES public.challenges(id) ON DELETE SET NULL;

-- Enable realtime for comments
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- Enable realtime for playlist_tracks
ALTER TABLE public.playlist_tracks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.playlist_tracks;

-- Enable realtime for challenges
ALTER TABLE public.challenges REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenges;

-- Create function to get current active challenge
CREATE OR REPLACE FUNCTION public.get_current_challenge()
RETURNS TABLE(
  id UUID,
  prompt TEXT,
  mood_id UUID,
  mood_name TEXT,
  mood_emoji TEXT,
  start_at TIMESTAMP WITH TIME ZONE,
  end_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.prompt,
    c.mood_id,
    m.name as mood_name,
    m.emoji as mood_emoji,
    c.start_at,
    c.end_at
  FROM public.challenges c
  JOIN public.moods m ON c.mood_id = m.id
  WHERE c.start_at <= NOW() AND c.end_at > NOW()
  ORDER BY c.created_at DESC
  LIMIT 1;
END;
$$;

-- Create function to create weekly challenge (will be called by cron)
CREATE OR REPLACE FUNCTION public.create_weekly_challenge()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  random_mood RECORD;
  challenge_prompts TEXT[] := ARRAY[
    'Drop the track that defines your week',
    'Share a song that makes you move',
    'What song matches this mood perfectly?',
    'Drop your current obsession',
    'Share a track that tells your story',
    'What song gives you energy?',
    'Drop something that makes you feel alive'
  ];
  selected_prompt TEXT;
BEGIN
  -- Get a random mood
  SELECT * INTO random_mood
  FROM public.moods
  WHERE is_custom = false
  ORDER BY RANDOM()
  LIMIT 1;
  
  -- Select a random prompt
  selected_prompt := challenge_prompts[floor(random() * array_length(challenge_prompts, 1) + 1)];
  
  -- Create the challenge
  INSERT INTO public.challenges (prompt, mood_id, start_at, end_at)
  VALUES (
    selected_prompt,
    random_mood.id,
    date_trunc('week', NOW()) + INTERVAL '1 week', -- Next Monday
    date_trunc('week', NOW()) + INTERVAL '1 week' + INTERVAL '7 days' -- Following Monday
  );
END;
$$;

-- Create function to finalize challenge and pick winner
CREATE OR REPLACE FUNCTION public.finalize_challenge(challenge_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  winner_drop RECORD;
BEGIN
  -- Find the drop with most votes for this challenge
  SELECT d.* INTO winner_drop
  FROM public.drops d
  LEFT JOIN public.votes v ON d.id = v.drop_id
  WHERE d.challenge_id = challenge_id
  GROUP BY d.id
  ORDER BY COUNT(v.id) DESC, d.created_at ASC
  LIMIT 1;
  
  IF winner_drop.id IS NOT NULL THEN
    -- Update challenge with winner
    UPDATE public.challenges
    SET winner_drop_id = winner_drop.id
    WHERE id = challenge_id;
    
    -- Mark drop as challenge winner
    UPDATE public.drops
    SET challenge_winner = true
    WHERE id = winner_drop.id;
  END IF;
END;
$$;
