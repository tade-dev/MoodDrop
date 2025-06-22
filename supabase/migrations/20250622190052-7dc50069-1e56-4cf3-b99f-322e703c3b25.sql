
-- First, let's check if there are proper RLS policies for global_settings
-- Drop existing policies if they exist and recreate them properly
DROP POLICY IF EXISTS "Super admin can manage global settings" ON public.global_settings;
DROP POLICY IF EXISTS "Everyone can read global settings" ON public.global_settings;

-- Create policy for super admin to manage global settings
CREATE POLICY "Super admin can manage global settings" 
  ON public.global_settings 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = auth.users.id 
      AND auth.users.email = 'akintadeseun816@gmail.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = auth.users.id 
      AND auth.users.email = 'akintadeseun816@gmail.com'
    )
  );

-- Create policy for everyone to read global settings (for premium feature checks)
CREATE POLICY "Everyone can read global settings" 
  ON public.global_settings 
  FOR SELECT 
  USING (true);
