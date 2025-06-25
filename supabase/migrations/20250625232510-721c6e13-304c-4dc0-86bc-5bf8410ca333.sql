
-- Add a moods array column to drops table to support multiple moods
ALTER TABLE public.drops ADD COLUMN mood_ids UUID[] DEFAULT '{}';

-- Create an index on the mood_ids array for better query performance
CREATE INDEX idx_drops_mood_ids ON public.drops USING GIN(mood_ids);

-- Update existing drops to migrate single mood_id to mood_ids array
UPDATE public.drops 
SET mood_ids = ARRAY[mood_id] 
WHERE mood_ids = '{}' AND mood_id IS NOT NULL;

-- We'll keep mood_id for backward compatibility for now, but mood_ids will be the primary field
