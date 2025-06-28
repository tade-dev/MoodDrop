
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { prompt, userId } = await req.json();

    console.log('Generating AI playlist for prompt:', prompt);

    // Call OpenAI to generate playlist
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a music curator for MoodDrop. Generate a playlist based on the user's mood/feeling. 
            Return a JSON response with:
            - title: A catchy playlist title
            - description: Brief description of the mood/vibe
            - songs: Array of 10-15 songs with "title" and "artist" fields
            - spotify_search_query: A search query that could find a similar playlist on Spotify
            
            Make it fun and match the mood described. Focus on popular, well-known songs that would likely be on Spotify.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
      }),
    });

    const openAIData = await openAIResponse.json();
    
    if (!openAIData.choices?.[0]?.message?.content) {
      throw new Error('Failed to generate playlist from OpenAI');
    }

    let playlistData;
    try {
      playlistData = JSON.parse(openAIData.choices[0].message.content);
    } catch (e) {
      // If JSON parsing fails, create a structured response
      playlistData = {
        title: "AI Generated Playlist",
        description: "A playlist curated based on your mood",
        songs: [],
        spotify_search_query: prompt
      };
    }

    console.log('Generated playlist data:', playlistData);

    // Save to database
    const { data: aiPlaylist, error: insertError } = await supabase
      .from('ai_playlists')
      .insert({
        user_id: userId,
        prompt: prompt,
        playlist_data: playlistData,
        spotify_url: null // We'll update this if we get a Spotify link
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving playlist:', insertError);
      throw insertError;
    }

    console.log('Saved AI playlist:', aiPlaylist);

    return new Response(JSON.stringify(aiPlaylist), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-ai-playlist function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
