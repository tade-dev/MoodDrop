
-- Add group_id column to drops table
ALTER TABLE public.drops ADD COLUMN group_id UUID;

-- Create index for efficient grouping queries
CREATE INDEX idx_drops_group_id_created_at ON public.drops(group_id, created_at DESC);

-- Migration function to assign group_ids to existing drops
CREATE OR REPLACE FUNCTION migrate_existing_drops_to_groups()
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
  drop_group RECORD;
  new_group_id UUID;
BEGIN
  -- Group existing drops by user_id, spotify_url, and created_at within 5 seconds
  FOR drop_group IN 
    SELECT 
      user_id,
      spotify_url,
      caption,
      DATE_TRUNC('minute', created_at) as time_bucket,
      ARRAY_AGG(id ORDER BY created_at) as drop_ids
    FROM public.drops 
    WHERE group_id IS NULL
    GROUP BY user_id, spotify_url, caption, DATE_TRUNC('minute', created_at)
    HAVING COUNT(*) >= 1
  LOOP
    -- Generate new group_id for this group
    new_group_id := gen_random_uuid();
    
    -- Update all drops in this group
    UPDATE public.drops 
    SET group_id = new_group_id 
    WHERE id = ANY(drop_group.drop_ids);
  END LOOP;
  
  -- For any remaining drops without group_id, assign individual group_ids
  UPDATE public.drops 
  SET group_id = gen_random_uuid() 
  WHERE group_id IS NULL;
END;
$function$;

-- Run the migration
SELECT migrate_existing_drops_to_groups();

-- Make group_id NOT NULL now that all rows have values
ALTER TABLE public.drops ALTER COLUMN group_id SET NOT NULL;

-- Function to get grouped drops for feed
CREATE OR REPLACE FUNCTION get_grouped_drops_feed(
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
      COALESCE(SUM(vote_counts.vote_count), 0) as total_votes,
      COALESCE(SUM(comment_counts.comment_count), 0) as total_comments,
      ARRAY_AGG(d.id ORDER BY d.created_at) as drop_ids
    FROM public.drops d
    LEFT JOIN public.profiles p ON d.user_id = p.id
    LEFT JOIN public.moods m ON d.mood_id = m.id
    LEFT JOIN (
      SELECT drop_id, COUNT(*) as vote_count
      FROM public.votes
      GROUP BY drop_id
    ) vote_counts ON d.id = vote_counts.drop_id
    LEFT JOIN (
      SELECT drop_id, COUNT(*) as comment_count
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
