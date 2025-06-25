
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, ExternalLink } from 'lucide-react';
import { getSpotifyEmbedUrl } from '@/utils/spotifyHelpers';

interface SpotifyPlayerProps {
  spotifyUrl: string;
  songTitle: string;
  artistName: string;
  className?: string;
}

const SpotifyPlayer = ({ spotifyUrl, songTitle, artistName, className = '' }: SpotifyPlayerProps) => {
  const [showEmbed, setShowEmbed] = useState(false);
  const embedUrl = getSpotifyEmbedUrl(spotifyUrl);

  const handlePlayClick = () => {
    setShowEmbed(true);
  };

  const handleOpenSpotify = () => {
    window.open(spotifyUrl, '_blank');
  };

  if (!embedUrl) {
    return (
      <div className={`flex items-center justify-between p-4 bg-green-600/20 rounded-lg border border-green-500/30 ${className}`}>
        <div className="flex-1">
          <p className="text-white font-medium">{songTitle}</p>
          <p className="text-gray-300 text-sm">{artistName}</p>
        </div>
        <Button
          onClick={handleOpenSpotify}
          className="bg-green-500 hover:bg-green-600 text-white"
          size="sm"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Open Spotify
        </Button>
      </div>
    );
  }

  if (showEmbed) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-white font-medium text-sm">{songTitle}</p>
            <p className="text-gray-300 text-xs">{artistName}</p>
          </div>
          <Button
            onClick={handleOpenSpotify}
            variant="ghost"
            size="sm"
            className="text-green-400 hover:text-green-300"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Spotify
          </Button>
        </div>
        <div className="rounded-lg overflow-hidden">
          <iframe
            src={embedUrl}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-lg"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between p-4 bg-green-600/20 rounded-lg border border-green-500/30 hover:bg-green-600/30 transition-colors ${className}`}>
      <div className="flex-1">
        <p className="text-white font-medium">{songTitle}</p>
        <p className="text-gray-300 text-sm">{artistName}</p>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          onClick={handlePlayClick}
          className="bg-green-500 hover:bg-green-600 text-white"
          size="sm"
        >
          <Play className="w-4 h-4 mr-1" />
          Play
        </Button>
        <Button
          onClick={handleOpenSpotify}
          variant="ghost"
          size="sm"
          className="text-green-400 hover:text-green-300"
        >
          <ExternalLink className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export default SpotifyPlayer;
