import React from 'react';
import { ZoneCategory } from '../../types';
import { getZoneBadgeConfig } from '../../utils/zoneClassifier';

interface RiskBadgeProps {
  zone: ZoneCategory;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullLabel?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  zone,
  showIcon = true,
  size = 'md',
  fullLabel = false,
}) => {
  const config = getZoneBadgeConfig(zone);

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  return (
    <span
      id={`risk-badge-${zone}`}
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs transition-colors whitespace-nowrap ${config.bgClass} ${sizeClasses[size]}`}
      title={config.description}
    >
      {showIcon && (
        <span
          className="w-2 h-2 rounded-full ring-2 ring-white/40 shrink-0 animate-pulse"
          style={{ backgroundColor: config.hex }}
        />
      )}
      <span>{fullLabel ? config.label : config.shortLabel}</span>
    </span>
  );
};
