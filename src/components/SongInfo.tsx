
import React from 'react';

interface SongInfoProps {
  songTitle: string;
  artistName: string;
  caption: string;
}

const SongInfo = ({ songTitle, artistName, caption }: SongInfoProps) => {
  return (
    <div className="mb-4">
      <h4 className="text-lg font-bold text-white mb-1">{songTitle}</h4>
      <p className="text-gray-400">{artistName}</p>
      {caption && (
        <p className="text-gray-300 mt-2">{caption}</p>
      )}
    </div>
  );
};

export default SongInfo;
