
-- Fix the get_grouped_drops_feed function to handle type mismatches
CREATE OR REPLACE FUNCTION public.get_grouped_drops_feed(
  page_limit INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0,
  mood_filter UUID DEFAULT NULL
)
RETURNS TABLE(
  group_id UUID,
  spotify_url TEXT,
  song_title TEXT,
  artist_name TEXT,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  moods JSONB,
  total_votes BIGINT,
  total_comments BIGINT,
  drop_ids UUID[]
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH grouped_drops AS (
    SELECT 
      d.group_id,
      d.spotify_url,
      d.song_title,
      d.artist_name,
      d.caption,
      MAX(d.created_at) as created_at,
      d.user_id,
      p.username,
      p.avatar_url,
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'id', m.id,
          'name', m.name,
          'emoji', m.emoji,
          'drop_id', d.id
        ) ORDER BY m.name
      ) as moods,
      COALESCE(SUM(vote_counts.vote_count)::BIGINT, 0) as total_votes,
      COALESCE(SUM(comment_counts.comment_count)::BIGINT, 0) as total_comments,
      ARRAY_AGG(d.id ORDER BY d.created_at) as drop_ids
    FROM public.drops d
    LEFT JOIN public.profiles p ON d.user_id = p.id
    LEFT JOIN public.moods m ON d.mood_id = m.id
    LEFT JOIN (
      SELECT drop_id, COUNT(*)::BIGINT as vote_count
      FROM public.votes
      GROUP BY drop_id
    ) vote_counts ON d.id = vote_counts.drop_id
    LEFT JOIN (
      SELECT drop_id, COUNT(*)::BIGINT as comment_count
      FROM public.comments
      GROUP BY drop_id
    ) comment_counts ON d.id = comment_counts.drop_id
    WHERE (mood_filter IS NULL OR d.mood_id = mood_filter)
    GROUP BY d.group_id, d.spotify_url, d.song_title, d.artist_name, d.caption, d.user_id, p.username, p.avatar_url
  )
  SELECT *
  FROM grouped_drops
  ORDER BY created_at DESC
  LIMIT page_limit OFFSET page_offset;
END;
$function$;
