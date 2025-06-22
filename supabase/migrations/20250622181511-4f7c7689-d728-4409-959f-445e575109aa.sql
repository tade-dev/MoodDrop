
-- First, let's ensure the global_settings table has proper RLS policies for admin access
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Admin can view global settings" ON public.global_settings;
DROP POLICY IF EXISTS "Admin can update global settings" ON public.global_settings;

-- Create policy to allow admin to view global settings
CREATE POLICY "Admin can view global settings" ON public.global_settings
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = auth.users.id 
      AND auth.users.email = 'akintadeseun816@gmail.com'
    )
  );

-- Create policy to allow admin to update global settings
CREATE POLICY "Admin can update global settings" ON public.global_settings
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = auth.users.id 
      AND auth.users.email = 'akintadeseun816@gmail.com'
    )
  );

-- Also ensure there's a default row in global_settings if it doesn't exist
INSERT INTO public.global_settings (id, premium_enabled) 
VALUES (1, false) 
ON CONFLICT (id) DO NOTHING;
