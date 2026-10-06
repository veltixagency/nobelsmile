import React from 'react';

interface NobleLogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const NobleLogo: React.FC<NobleLogoProps> = ({
  className = '',
  variant = 'light',
  size = 'md',
  showTagline = true,
}) => {
  const isDark = variant === 'dark';

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl',
  };

  const studioSizes = {
    sm: 'text-[9px] tracking-widest',
    md: 'text-[10px] tracking-[0.22em]',
    lg: 'text-xs tracking-[0.25em]',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Premium Emblem: Harmonious fusion of a noble crown crest, aesthetic smile contour, and dental tooth silhouette */}
      <div
        className={`${iconSizes[size]} rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform`}
      >
        <svg
          className="w-3/5 h-3/5 drop-shadow-xs"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle background glow arc */}
          <circle cx="16" cy="16" r="14" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          {/* Dental Tooth Outline */}
          <path
            d="M9 11C9 7.68629 11.6863 5 15 5H17C20.3137 5 23 7.68629 23 11C23 14 21.5 17.5 20.5 21C19.8 23.5 18.5 27 16.5 27C15.2 27 14.8 24 14.2 22C13.5 20 12 17.5 11.5 15C10 13.5 9 12.2 9 11Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Noble Smile Arc */}
          <path
            d="M12 14.5C13.5 17 18.5 17 20 14.5"
            stroke="#6ee7b7"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Noble Crown Triad / Sparkle at the top */}
          <circle cx="16" cy="9" r="1.25" fill="#fef08a" />
          <circle cx="12.5" cy="10" r="0.9" fill="#fef08a" />
          <circle cx="19.5" cy="10" r="0.9" fill="#fef08a" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-tight">
          <span
            className={`font-black tracking-tight ${titleSizes[size]} ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Noble Smile
          </span>
          <span
            className={`font-black uppercase text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full ${studioSizes[size]}`}
          >
            STUDIO
          </span>
        </div>
        {showTagline && (
          <span
            className={`text-[11px] font-medium leading-tight ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Dental Clinic • Ahmedabad
          </span>
        )}
      </div>
    </div>
  );
};
