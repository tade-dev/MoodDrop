
-- Update RLS policies for ai_playlists to ensure users only see their own playlists
DROP POLICY IF EXISTS "Users can view all ai playlists" ON public.ai_playlists;

CREATE POLICY "Users can view their own ai playlists" 
  ON public.ai_playlists 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Update RLS policies for ai_playlist_reactions to ensure users only see reactions on playlists they can access
DROP POLICY IF EXISTS "Users can view all ai playlist reactions" ON public.ai_playlist_reactions;

CREATE POLICY "Users can view ai playlist reactions on accessible playlists" 
  ON public.ai_playlist_reactions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_playlists 
      WHERE id = ai_playlist_reactions.ai_playlist_id 
      AND user_id = auth.uid()
    )
  );

-- Update RLS policies for ai_playlist_comments to ensure users only see comments on playlists they can access
DROP POLICY IF EXISTS "Users can view all ai playlist comments" ON public.ai_playlist_comments;

CREATE POLICY "Users can view ai playlist comments on accessible playlists" 
  ON public.ai_playlist_comments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_playlists 
      WHERE id = ai_playlist_comments.ai_playlist_id 
      AND user_id = auth.uid()
    )
  );
