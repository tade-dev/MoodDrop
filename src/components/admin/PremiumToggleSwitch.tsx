
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useIsMobile } from '@/hooks/use-mobile';

interface PremiumToggleSwitchProps {
  premiumEnabled: boolean;
  onToggle: (checked: boolean) => void;
  isUpdating: boolean;
}

const PremiumToggleSwitch = ({ premiumEnabled, onToggle, isUpdating }: PremiumToggleSwitchProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "flex items-center justify-between gap-4",
      isMobile && "flex-col items-start space-y-4"
    )}>
      <div className="flex-1">
        <h3 className={cn(
          "text-white font-medium",
          isMobile ? "text-base" : "text-lg"
        )}>
          Enable Premium Restrictions
        </h3>
        <p className={cn(
          "text-gray-400 mt-1",
          isMobile ? "text-sm" : "text-base"
        )}>
          When enabled, only subscribers and admin have premium access
        </p>
        
        {/* Mobile status indicator */}
        {isMobile && (
          <div className="mt-2 p-2 bg-blue-500/10 rounded border border-blue-400/20">
            <p className="text-blue-300 text-xs">
              <strong>Current Status:</strong> {premiumEnabled 
                ? 'Premium features are RESTRICTED to subscribers only'
                : 'Everyone gets FREE access to all premium features'
              }
            </p>
          </div>
        )}
      </div>
      
      <div className={cn(
        "flex items-center space-x-3",
        isMobile && "w-full justify-between"
      )}>
        {isUpdating && (
          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
        )}
        <div className="flex items-center space-x-2">
          {isMobile && (
            <span className="text-sm text-gray-300">
              {premiumEnabled ? 'RESTRICTED' : 'FREE ACCESS'}
            </span>
          )}
          <Switch
            checked={premiumEnabled || false}
            onCheckedChange={onToggle}
            disabled={isUpdating}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
          />
        </div>
      </div>
    </div>
  );
};

export default PremiumToggleSwitch;
