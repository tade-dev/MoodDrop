
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface PremiumToggleSwitchProps {
  premiumEnabled: boolean;
  onToggle: (checked: boolean) => void;
  isUpdating: boolean;
}

const PremiumToggleSwitch = ({ premiumEnabled, onToggle, isUpdating }: PremiumToggleSwitchProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-white font-medium">Enable Premium Restrictions</h3>
        <p className="text-gray-400 text-sm">
          When enabled, only subscribers and admin have premium access
        </p>
      </div>
      <Switch
        checked={premiumEnabled || false}
        onCheckedChange={onToggle}
        disabled={isUpdating}
        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
      />
    </div>
  );
};

export default PremiumToggleSwitch;
