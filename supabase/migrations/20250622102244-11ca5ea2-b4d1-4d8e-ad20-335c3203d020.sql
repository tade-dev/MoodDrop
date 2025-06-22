
-- Add a column to track if a mood is custom (created by user) or default (system-wide)
-- (Skip if column already exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'moods' AND column_name = 'is_custom') THEN
        ALTER TABLE public.moods ADD COLUMN is_custom BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Anyone can view moods" ON public.moods;
DROP POLICY IF EXISTS "Users can create custom moods" ON public.moods;
DROP POLICY IF EXISTS "Users can update their own custom moods" ON public.moods;
DROP POLICY IF EXISTS "Users can delete their own custom moods" ON public.moods;

-- Policy to allow everyone to view all moods (both default and custom)
CREATE POLICY "Anyone can view moods" 
  ON public.moods 
  FOR SELECT 
  USING (true);

-- Policy to allow authenticated users to create custom moods
CREATE POLICY "Users can create custom moods" 
  ON public.moods 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by AND is_custom = true);

-- Policy to allow users to update their own custom moods
CREATE POLICY "Users can update their own custom moods" 
  ON public.moods 
  FOR UPDATE 
  USING (auth.uid() = created_by AND is_custom = true);

-- Policy to allow users to delete their own custom moods
CREATE POLICY "Users can delete their own custom moods" 
  ON public.moods 
  FOR DELETE 
  USING (auth.uid() = created_by AND is_custom = true);

-- Insert some default moods that everyone can see (only if they don't exist)
INSERT INTO public.moods (name, emoji, is_custom, created_by) 
SELECT name, emoji, is_custom, created_by::uuid
FROM (VALUES
    ('Happy', '😊', false, NULL),
    ('Sad', '😢', false, NULL),
    ('Energetic', '⚡', false, NULL),
    ('Chill', '😎', false, NULL),
    ('Romantic', '💕', false, NULL),
    ('Angry', '😠', false, NULL),
    ('Nostalgic', '🌅', false, NULL),
    ('Party', '🎉', false, NULL),
    ('Focused', '🎯', false, NULL),
    ('Dreamy', '☁️', false, NULL)
) AS new_moods(name, emoji, is_custom, created_by)
WHERE NOT EXISTS (
    SELECT 1 FROM public.moods WHERE moods.name = new_moods.name
);
