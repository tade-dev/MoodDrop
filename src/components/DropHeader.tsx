
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface DropHeaderProps {
  userId: string;
  username: string;
  avatarUrl: string;
  createdAt: string;
}

const DropHeader = ({ userId, username, avatarUrl, createdAt }: DropHeaderProps) => {
  return (
    <div className="flex items-center gap-3 mb-4">
      <Avatar className="w-10 h-10">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="bg-purple-600 text-white">
          {username?.[0]?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h3 className="font-semibold text-white">{username}</h3>
        <p className="text-sm text-gray-400">
          {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default DropHeader;
