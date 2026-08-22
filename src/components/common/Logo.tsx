import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  withText?: boolean;
  variant?: 'color' | 'light' | 'dark' | 'black';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const LogoEmblem: React.FC<{
  size?: number;
  className?: string;
  variant?: 'color' | 'light' | 'dark' | 'black';
}> = ({ size = 48, className = '', variant = 'color' }) => {
  const isLight = variant === 'light';
  const isBlack = variant === 'black';

  const primaryColor = isLight ? '#FFFFFF' : isBlack ? '#000000' : '#0D2240'; // Navy or White or Black
  const secondaryColor = isLight ? '#FFFFFF' : isBlack ? '#000000' : '#C0262D'; // Crimson Red or White or Black

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Globe Semi-Circle Arc */}
      <path
        d="M 35 105 A 65 65 0 1 1 165 105"
        stroke={primaryColor}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Globe Inner Grid Lines */}
      <path
        d="M 50 80 Q 100 45 150 80 M 65 55 Q 100 30 135 55 M 100 38 V 105 M 72 45 Q 100 80 100 105 M 128 45 Q 100 80 100 105"
        stroke={primaryColor}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />

      {/* Airplane (Top-Right of Globe Arc Taking Off) */}
      <g transform="translate(142, 28) rotate(-20) scale(0.95)">
        <path
          d="M 12 0 C 14 0, 17 4, 19 14 L 38 20 V 25 L 21 22 L 19 36 L 26 41 V 45 L 16 42 L 6 45 V 41 L 13 36 L 11 22 L -6 25 V 20 L 13 14 C 15 4, 10 0, 12 0 Z"
          fill={secondaryColor}
        />
      </g>

      {/* Heavy Stylized 'H' Monogram */}
      <path
        d="M 54 72 L 72 72 L 67 104 L 91 104 L 96 72 L 114 72 L 103 138 L 85 138 L 90 120 L 66 120 L 61 138 L 43 138 Z"
        fill={primaryColor}
      />

      {/* Heavy Stylized 'R' Monogram */}
      <path
        d="M 108 72 L 138 72 C 156 72 166 81 162 97 C 158 110 147 117 133 118 L 148 138 L 127 138 L 115 119 L 111 119 L 108 138 L 90 138 Z M 117 86 L 113 105 L 130 105 C 138 105 143 101 144 95 C 146 88 142 86 133 86 Z"
        fill={secondaryColor}
      />

      {/* Cargo Ship (Bottom Left) */}
      <g transform="translate(18, 122) scale(0.62)">
        <path
          d="M 10 25 L 80 25 C 75 42, 45 48, 20 45 Z M 20 12 H 35 V 23 H 20 Z M 38 8 H 58 V 23 H 38 Z M 25 2 H 32 V 10 H 25 Z"
          fill={primaryColor}
        />
        <path d="M 5 38 C 25 36, 65 37, 90 42 C 70 52, 25 50, 5 38 Z" fill={primaryColor} />
      </g>

      {/* Delivery Truck (Bottom Right) */}
      <g transform="translate(136, 122) scale(0.62)">
        <path
          d="M 5 5 H 48 V 35 H 5 Z M 51 16 H 65 L 75 26 V 35 H 51 Z"
          fill={secondaryColor}
        />
        {/* Wheels */}
        <circle cx="18" cy="37" r="7.5" fill={isLight ? '#0D2240' : '#FFFFFF'} stroke={secondaryColor} strokeWidth="3" />
        <circle cx="60" cy="37" r="7.5" fill={isLight ? '#0D2240' : '#FFFFFF'} stroke={secondaryColor} strokeWidth="3" />
      </g>

      {/* Dual Swoosh Road Arc */}
      <path
        d="M 38 152 C 75 170, 135 170, 175 141 C 145 162, 85 163, 42 147 Z"
        fill={secondaryColor}
      />
      <path
        d="M 28 143 C 65 159, 125 159, 162 133 C 135 152, 75 153, 32 139 Z"
        fill={secondaryColor}
        opacity="0.8"
      />
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  className = '',
  withText = true,
  variant = 'color',
  size = 'md',
}) => {
  const isLight = variant === 'light';

  // Height mappings based on size
  const heightClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-13 sm:h-15',
    xl: 'h-16 sm:h-20',
  };

  const currentHeightClass = heightClasses[size] || 'h-10 sm:h-12';
  const logoSrc = isLight ? '/logo-dark.png' : '/logo-light.png';

  if (!withText) {
    const emblemSizes = { sm: 36, md: 44, lg: 52, xl: 64 };
    return (
      <Link to="/" className={`inline-flex items-center group select-none ${className}`}>
        <LogoEmblem size={emblemSizes[size] || 44} variant={variant} />
      </Link>
    );
  }

  return (
    <Link to="/" className={`inline-flex items-center group select-none ${className}`}>
      <img
        src={logoSrc}
        alt="HAMZA RMB GLOBAL — Bridging China & Nigeria, Connecting the World"
        className={`${currentHeightClass} w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]`}
      />
    </Link>
  );
};

export default Logo;
