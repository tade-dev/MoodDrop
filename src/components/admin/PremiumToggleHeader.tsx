
import React from 'react';
import { Crown, Shield } from 'lucide-react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PremiumToggleHeaderProps {
  premiumEnabled: boolean;
}

const PremiumToggleHeader = ({ premiumEnabled }: PremiumToggleHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="text-white flex items-center space-x-2">
        <Crown className="w-5 h-5 text-yellow-400" />
        <span>Premium Features Control</span>
        <Badge variant={premiumEnabled ? "default" : "secondary"}>
          {premiumEnabled ? "RESTRICTED MODE" : "FREE ACCESS MODE"}
        </Badge>
        <Tooltip>
          <TooltipTrigger asChild>
            <Shield className="w-4 h-4 text-green-400 ml-auto" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Secure Admin Access</p>
          </TooltipContent>
        </Tooltip>
      </CardTitle>
    </CardHeader>
  );
};

export default PremiumToggleHeader;
