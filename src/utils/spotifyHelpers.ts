
export const getSpotifyEmbedUrl = (spotifyUrl: string, dropType?: string) => {
  try {
    const url = new URL(spotifyUrl);
    const pathParts = url.pathname.split('/');
    
    if (pathParts.length < 3) return null;
    
    const type = pathParts[1]; // track, playlist, or album
    let id = pathParts[2];
    
    // Remove any query parameters from the ID
    if (id?.includes('?')) {
      id = id.split('?')[0];
    }
    
    if (!id) return null;
    
    // Validate the type is supported
    if (!['track', 'playlist', 'album'].includes(type)) {
      console.warn(`Unsupported Spotify URL type: ${type}`);
      return null;
    }
    
    // Validate the type matches expected drop type if provided
    const typeMap = {
      'song': 'track',
      'album': 'album',
      'playlist': 'playlist'
    };
    
    if (dropType && typeMap[dropType as keyof typeof typeMap] !== type) {
      console.warn(`Drop type "${dropType}" doesn't match Spotify URL type "${type}"`);
    }
    
    // For playlists, we need to use a different embed format
    if (type === 'playlist') {
      return `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`;
    }
    
    // Return the embed URL for tracks and albums
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  } catch (error) {
    console.error('Invalid Spotify URL:', error);
    return null;
  }
};

export const validateSpotifyUrl = (url: string): { isValid: boolean; type?: string; error?: string } => {
  try {
    const urlObj = new URL(url);
    
    if (urlObj.hostname !== 'open.spotify.com') {
      return { isValid: false, error: 'Must be a Spotify URL (open.spotify.com)' };
    }
    
    const pathParts = urlObj.pathname.split('/');
    if (pathParts.length < 3) {
      return { isValid: false, error: 'Invalid Spotify URL format' };
    }
    
    const type = pathParts[1];
    let id = pathParts[2];
    
    // Remove query parameters from ID for validation
    if (id?.includes('?')) {
      id = id.split('?')[0];
    }
    
    if (!['track', 'playlist', 'album'].includes(type)) {
      return { isValid: false, error: 'URL must be for a track, playlist, or album' };
    }
    
    if (!id || id.length < 10) {
      return { isValid: false, error: 'Invalid Spotify ID' };
    }
    
    return { isValid: true, type };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

export const getDropTypeFromSpotifyUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const type = urlObj.pathname.split('/')[1];
    
    const typeMap = {
      'track': 'song',
      'album': 'album',
      'playlist': 'playlist'
    };
    
    return typeMap[type as keyof typeof typeMap] || 'song';
  } catch (error) {
    return 'song';
  }
};
