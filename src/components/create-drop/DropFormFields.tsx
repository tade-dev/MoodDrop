
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DropFormFieldsProps {
  spotifyUrl: string;
  setSpotifyUrl: (value: string) => void;
  dropType: string;
  setDropType: (value: string) => void;
  artistName: string;
  setArtistName: (value: string) => void;
  songTitle: string;
  setSongTitle: (value: string) => void;
  caption: string;
  setCaption: (value: string) => void;
}

const DropFormFields = ({
  spotifyUrl,
  setSpotifyUrl,
  dropType,
  setDropType,
  artistName,
  setArtistName,
  songTitle,
  setSongTitle,
  caption,
  setCaption
}: DropFormFieldsProps) => {
  return (
    <>
      <div>
        <Input
          type="url"
          placeholder="Enter Spotify URL"
          value={spotifyUrl}
          onChange={(e) => setSpotifyUrl(e.target.value)}
          className="bg-black/80 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-purple-500"
        />
      </div>

      <div>
        <Select onValueChange={setDropType} defaultValue="song">
          <SelectTrigger className="bg-black/80 border-white/20 text-white placeholder:text-gray-400 w-full justify-between">
            <SelectValue placeholder="Select drop type" />
          </SelectTrigger>
          <SelectContent className="bg-black/80 border-white/20 text-white">
            <SelectItem value="song">🎵 Song</SelectItem>
            <SelectItem value="album">💿 Album</SelectItem>
            <SelectItem value="playlist">📋 Playlist</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Input
          type="text"
          placeholder="Artist Name"
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
          className="bg-black/80 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-purple-500"
        />
      </div>

      <div>
        <Input
          type="text"
          placeholder="Song Title"
          value={songTitle}
          onChange={(e) => setSongTitle(e.target.value)}
          className="bg-black/80 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-purple-500"
        />
      </div>
      
      <div>
        <Textarea
          placeholder="Add a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="bg-black/80 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-purple-500 resize-none"
        />
      </div>
    </>
  );
};

export default DropFormFields;
