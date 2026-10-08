import React from 'react';

/**
 * BetterForm Official Brand Logo & Symbol
 * Based strictly on BetterForm Design System specifications:
 * - Symbol geometry on 96x96 grid with compound path
 * - Top-right radius 48, three field progression rows, candidate signal dot at (74,30)
 * - Wordmark: "Better" Hanken Grotesk 500 + "Form" Hanken Grotesk 700, -0.045em tracking
 */
export default function BetterFormLogo({ 
  variant = 'horizontal', // 'horizontal' | 'symbol'
  theme = 'light',        // 'light' (on light bgs) | 'dark' (on dark bgs)
  size = 32,             // symbol height in px
  showWordmark = true,
  className = ''
}) {
  const isDark = theme === 'dark';
  const bodyColor = isDark ? '#F2F1EC' : '#0B0B0C';
  const textColor = isDark ? '#F2F1EC' : '#0B0B0C';
  const dotColor = '#13E884';

  const symbolElement = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-label="BetterForm mark"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill={bodyColor}
        d="M12 0H48A48 48 0 0 1 96 48V84A12 12 0 0 1 84 96H12A12 12 0 0 1 0 84V12A12 12 0 0 1 12 0ZM20 22h24v12H20ZM20 42h40v12H20ZM20 62h56v12H20ZM67 30a7 7 0 1 0 14 0a7 7 0 1 0-14 0Z"
      />
      <circle cx="74" cy="30" r="7" fill={dotColor} />
    </svg>
  );

  if (variant === 'symbol' || !showWordmark) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {symbolElement}
      </div>
    );
  }

  // Wordmark font size proportional to symbol height (symbol height ~ 1.15x cap-to-descender)
  const textSizeClass = size >= 40 ? 'text-2xl' : size >= 32 ? 'text-xl' : 'text-lg';

  return (
    <div className={`inline-flex items-center gap-[0.3em] select-none ${className}`}>
      {symbolElement}
      <span
        className={`font-sans ${textSizeClass} leading-none tracking-[-0.045em]`}
        style={{ color: textColor }}
      >
        <span className="font-medium">Better</span>
        <span className="font-bold">Form</span>
      </span>
    </div>
  );
}
