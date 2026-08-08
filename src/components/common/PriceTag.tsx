import React from 'react';
import { formatNaira, formatRmb } from '../../utils/formatters';

interface PriceTagProps {
  amount: number;
  currency?: 'NGN' | 'CNY';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const PriceTag: React.FC<PriceTagProps> = ({ 
  amount, 
  currency = 'NGN', 
  className = '',
  size = 'md'
}) => {
  const formatted = currency === 'NGN' ? formatNaira(amount) : formatRmb(amount);
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl font-bold',
  };

  return (
    <span className={`font-semibold text-slate-800 ${sizeClasses[size]} ${className}`}>
      {formatted}
    </span>
  );
};
