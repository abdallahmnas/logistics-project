import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  withText?: boolean;
  variant?: 'dark' | 'light';
}

export const Logo: React.FC<LogoProps> = ({ className = '', withText = true, variant = 'dark' }) => {
  const isLight = variant === 'light';

  return (
    <Link to="/" className={`flex items-center gap-2.5 group ${className}`}>
      <div className="w-9 h-9 rounded-lg bg-brand-navy flex items-center justify-center font-bold text-brand-orange text-lg border border-slate-700/50 group-hover:scale-105 transition-transform duration-200">
        H
      </div>
      {withText && (
        <span className={`font-bold text-xl tracking-tight ${isLight ? 'text-white' : 'text-brand-navy'}`}>
          HAMZA<span className="text-brand-orange">RMB</span>
        </span>
      )}
    </Link>
  );
};
