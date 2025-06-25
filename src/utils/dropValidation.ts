
import { validateSpotifyUrl } from './spotifyHelpers';

export interface DropFormData {
  spotifyUrl: string;
  artistName: string;
  songTitle: string;
  caption: string;
  selectedMoods: string[];
  dropType: string;
}

export const validateDropForm = (formData: DropFormData) => {
  const { spotifyUrl, selectedMoods } = formData;
  
  if (selectedMoods.length === 0) {
    return { isValid: false, error: 'Please select at least one mood for your drop' };
  }

  const validation = validateSpotifyUrl(spotifyUrl);
  if (!validation.isValid) {
    return { isValid: false, error: validation.error || 'Please enter a valid Spotify URL' };
  }

  return { isValid: true };
};
