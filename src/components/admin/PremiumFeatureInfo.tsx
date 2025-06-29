
import React from 'react';
import { Loader2 } from 'lucide-react';

interface PremiumFeatureInfoProps {
  premiumEnabled: boolean;
  isUpdating: boolean;
  lastUpdated?: string;
}

const PremiumFeatureInfo = ({ premiumEnabled, isUpdating, lastUpdated }: PremiumFeatureInfoProps) => {
  return (
    <>
      <div className="mt-4 p-4 bg-black/20 rounded-lg border border-white/10">
        <h4 className="text-white font-medium mb-2">Current Mode:</h4>
        <p className="text-gray-300 text-sm mb-3">
          Premium restrictions are currently <strong>{premiumEnabled ? 'ENABLED' : 'DISABLED'}</strong>.
        </p>
        
        <h4 className="text-white font-medium mb-2">How This Works:</h4>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• <strong>Admin:</strong> Always has full access to everything</li>
          <li>• <strong>When DISABLED (Free Access):</strong> All users get premium features for free</li>
          <li>• <strong>When ENABLED (Restricted):</strong> Only subscribers + admin have premium access</li>
        </ul>
        
        <div className="mt-3 p-3 bg-blue-500/10 rounded border border-blue-400/20">
          <p className="text-blue-300 text-sm">
            <strong>Current Effect:</strong> {premiumEnabled 
              ? 'Only paying subscribers and admin can use premium features'
              : 'Everyone gets free access to all premium features'
            }
          </p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-black/20 rounded-lg border border-white/10">
        <h4 className="text-white font-medium mb-2">Premium Features Include:</h4>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• AI Playlist Generator</li>
          <li>• Collaborative Playlists</li>
          <li>• Unlimited drops per day</li>
          <li>• Custom mood creation</li>
          <li>• Advanced analytics</li>
        </ul>
      </div>

      {isUpdating && (
        <div className="flex items-center justify-center p-2">
          <Loader2 className="w-4 h-4 animate-spin text-purple-400 mr-2" />
          <span className="text-gray-400 text-sm">Updating settings...</span>
        </div>
      )}

      <div className="text-xs text-gray-500 border-t border-white/10 pt-3">
        <p>Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'}</p>
        <p>Authorized admin: akintadeseun816@gmail.com</p>
        <p>Security: Protected by RLS policies</p>
      </div>
    </>
  );
};

export default PremiumFeatureInfo;
