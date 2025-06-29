
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

    // Call OpenAI to generate playlist with actual Spotify song recommendations
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
            content: `You are a music curator for MoodDrop. Based on the user's mood/feeling, recommend REAL, POPULAR Spotify songs that match their mood. 
            
            IMPORTANT: Only recommend songs that actually exist on Spotify. Use well-known, popular tracks that users can easily find and listen to.
            
            Return a JSON response with:
            - title: A catchy playlist title based on the mood
            - description: Brief description of the mood/vibe (2-3 sentences)
            - songs: Array of 8-12 REAL songs with exact "title" and "artist" fields
            - mood_suggestion: Suggest a mood name that fits (like "Melancholic", "Energetic", "Chill", etc.)
            
            Focus on popular, well-known songs from various eras that would definitely be on Spotify. Make sure song titles and artist names are spelled correctly.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
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
      // If JSON parsing fails, create a structured response with some default songs
      playlistData = {
        title: "AI Curated Playlist",
        description: "A personalized playlist based on your mood and preferences.",
        songs: [
          { title: "Bohemian Rhapsody", artist: "Queen" },
          { title: "Hotel California", artist: "Eagles" },
          { title: "Imagine", artist: "John Lennon" }
        ],
        mood_suggestion: "Mixed"
      };
    }

    // Ensure we have the required fields
    if (!playlistData.songs || !Array.isArray(playlistData.songs)) {
      playlistData.songs = [];
    }

    console.log('Generated playlist data:', playlistData);

    // Save to database with can_create_drops flag
    const { data: aiPlaylist, error: insertError } = await supabase
      .from('ai_playlists')
      .insert({
        user_id: userId,
        prompt: prompt,
        playlist_data: {
          ...playlistData,
          can_create_drops: true // Flag to indicate these can be turned into drops
        }
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
