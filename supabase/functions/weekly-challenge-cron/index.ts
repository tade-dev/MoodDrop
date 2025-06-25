
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting weekly challenge cron job...');

    // Check if there's already an active challenge
    const { data: currentChallenge } = await supabase.rpc('get_current_challenge');
    
    if (currentChallenge && currentChallenge.length > 0) {
      console.log('Active challenge already exists, skipping creation');
      return new Response(
        JSON.stringify({ message: 'Active challenge already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Finalize any past challenges that haven't been finalized
    const { data: pastChallenges } = await supabase
      .from('challenges')
      .select('id, end_at, winner_drop_id')
      .lt('end_at', new Date().toISOString())
      .is('winner_drop_id', null);

    if (pastChallenges && pastChallenges.length > 0) {
      console.log(`Finalizing ${pastChallenges.length} past challenge(s)`);
      
      for (const challenge of pastChallenges) {
        await supabase.rpc('finalize_challenge', { challenge_id: challenge.id });
        console.log(`Finalized challenge ${challenge.id}`);
      }
    }

    // Create new weekly challenge
    const { error: createError } = await supabase.rpc('create_weekly_challenge');
    
    if (createError) {
      console.error('Error creating weekly challenge:', createError);
      throw createError;
    }

    console.log('Weekly challenge created successfully');

    return new Response(
      JSON.stringify({ 
        message: 'Weekly challenge cron job completed successfully',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in weekly challenge cron:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to run weekly challenge cron job',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
