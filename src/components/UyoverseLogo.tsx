import React from 'react';

interface LogoProps {
  variant?: 'app_icon' | 'landscape_banner' | 'emblem_only' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export const UyoverseLogo: React.FC<LogoProps> = ({
  variant = 'app_icon',
  size = 'md',
  className = '',
  showTagline = true,
}) => {
  if (variant === 'app_icon') {
    // Matches IMG-20261010-WA0000.jpg:
    // Orange squircle, white outer ring, orbital ring with satellite, white 'U', dark green circle in the bowl
    const dim = size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-14 h-14' : size === 'lg' ? 'w-24 h-24' : 'w-40 h-40';
    return (
      <div className={`relative flex-shrink-0 ${dim} ${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="uyoOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff7a18" />
              <stop offset="50%" stopColor="#f26522" />
              <stop offset="100%" stopColor="#d94b08" />
            </linearGradient>
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
            </filter>
          </defs>
          {/* Orange Squircle */}
          <rect
            x="4"
            y="4"
            width="192"
            height="192"
            rx="56"
            ry="56"
            fill="url(#uyoOrangeGrad)"
          />
          {/* Main outer circle ring */}
          <circle
            cx="100"
            cy="100"
            r="60"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.2"
          />
          {/* Tilted orbital ring */}
          <ellipse
            cx="100"
            cy="100"
            rx="64"
            ry="24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.4"
            transform="rotate(-15, 100, 100)"
            opacity="0.95"
          />
          {/* Orbiting satellite sphere on right node */}
          <circle
            cx="160"
            cy="91"
            r="4.5"
            fill="#ffffff"
            filter="url(#glowEffect)"
          />
          {/* White stylized 'U' with rounded caps */}
          <path
            d="M 75 75 L 75 110 C 75 128 85 138 100 138 C 115 138 125 128 125 110 L 125 75"
            fill="none"
            stroke="#ffffff"
            strokeWidth="11"
            strokeLinecap="round"
          />
          {/* Center dark green dot */}
          <circle
            cx="100"
            cy="108"
            r="12.5"
            fill="#0d522c"
          />
        </svg>
      </div>
    );
  }

  if (variant === 'landscape_banner') {
    // Matches IMG-20261010-WA0001.jpg:
    // Dark green background (#0e4726), centered circular badge with orange border and orbital U, UYOVERSE text, LAND OF PROMISE tagline
    return (
      <div className={`relative flex flex-col items-center justify-center bg-[#0b381e] p-8 rounded-2xl border border-[#1b6b38]/40 shadow-2xl ${className}`}>
        {/* Emblem */}
        <div className="relative w-28 h-28 mb-4">
          <svg viewBox="0 0 160 160" className="w-full h-full">
            <defs>
              <filter id="bannerGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#f26522" floodOpacity="0.3" />
              </filter>
            </defs>
            {/* Outer orange circular border */}
            <circle
              cx="80"
              cy="80"
              r="48"
              fill="none"
              stroke="#f26522"
              strokeWidth="2.5"
            />
            {/* Tilted orbital ring */}
            <ellipse
              cx="80"
              cy="80"
              rx="54"
              ry="20"
              fill="none"
              stroke="#f4f1ea"
              strokeWidth="1.8"
              transform="rotate(-18, 80, 80)"
              opacity="0.85"
            />
            {/* Orbit satellite node */}
            <circle
              cx="130"
              cy="72"
              r="3.5"
              fill="#f26522"
            />
            {/* White 'U' */}
            <path
              d="M 62 60 L 62 86 C 62 100 70 108 80 108 C 90 108 98 100 98 86 L 98 60"
              fill="none"
              stroke="#ffffff"
              strokeWidth="8.5"
              strokeLinecap="round"
            />
            {/* Orange core dot */}
            <circle
              cx="80"
              cy="84"
              r="9"
              fill="#f26522"
            />
          </svg>
        </div>

        {/* Text Wordmark */}
        <h1 className="font-orbitron font-extrabold tracking-[0.25em] text-white text-3xl md:text-4xl uppercase text-center mb-1">
          UYOVERSE
        </h1>
        {showTagline && (
          <p className="font-space font-semibold tracking-[0.45em] text-[#f26522] text-xs md:text-sm uppercase text-center">
            LAND OF PROMISE
          </p>
        )}
      </div>
    );
  }

  // Horizontal Header Badge (Compact)
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-[#f26522]/20">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <rect x="0" y="0" width="200" height="200" rx="44" fill="#f26522" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="#ffffff" strokeWidth="3.5" />
          <ellipse cx="100" cy="100" rx="66" ry="24" fill="none" stroke="#ffffff" strokeWidth="2.5" transform="rotate(-15, 100, 100)" />
          <circle cx="160" cy="91" r="5" fill="#ffffff" />
          <path d="M 75 75 L 75 110 C 75 128 85 138 100 138 C 115 138 125 128 125 110 L 125 75" fill="none" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" />
          <circle cx="100" cy="108" r="13" fill="#0d522c" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="font-orbitron font-bold tracking-wider text-base text-white leading-tight">
          UYOVERSE
        </span>
        <span className="font-space tracking-[0.2em] text-[10px] text-[#f26522] font-semibold uppercase leading-tight">
          LAND OF PROMISE
        </span>
      </div>
    </div>
  );
};
