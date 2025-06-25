
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown } from 'lucide-react';
import GoPremiumButton from '@/components/GoPremiumButton';

interface DropLimitAlertProps {
  thisMonthDropCount: number;
  canCreateDrop: boolean;
}

const DropLimitAlert = ({ thisMonthDropCount, canCreateDrop }: DropLimitAlertProps) => {
  return (
    <Alert className="mb-6 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-400/30">
      <Crown className="h-4 w-4 text-amber-400" />
      <AlertDescription className="text-amber-200">
        <div className="flex items-center justify-between">
          <span>
            Monthly drops: {thisMonthDropCount}/3 {!canCreateDrop && '(Limit reached)'}
          </span>
          <GoPremiumButton size="sm" variant="minimal" />
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default DropLimitAlert;
