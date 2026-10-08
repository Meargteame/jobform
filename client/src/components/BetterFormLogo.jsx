import React from 'react';

/**
 * BetterForm Official Vector Brand Logo & Symbol
 * Rendered from the exact vector geometry in betterform-logo-horizontal.svg and betterform-symbol.svg
 * ViewBox 480x96 for horizontal lockup, 96x96 for standalone symbol.
 */
export default function BetterFormLogo({
  variant = 'horizontal', // 'horizontal' | 'symbol'
  theme = 'light',        // 'light' (#0B0B0C text/body) | 'dark' (#F2F1EC text/body)
  height = 32,            // Height in pixels (default 32px)
  className = '',
}) {
  const isDark = theme === 'dark';
  const bodyColor = isDark ? '#F2F1EC' : '#0B0B0C';
  const textColor = isDark ? '#F2F1EC' : '#0B0B0C';
  const dotColor = '#13E884';

  if (variant === 'symbol') {
    return (
      <svg
        width={height}
        height={height}
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
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
  }

  // Exact 480x96 horizontal vector lockup from master asset
  const width = Math.round(height * (480 / 96));

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 480 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="BetterForm logo"
    >
      <g transform="translate(0 0)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill={bodyColor}
          d="M12 0H48A48 48 0 0 1 96 48V84A12 12 0 0 1 84 96H12A12 12 0 0 1 0 84V12A12 12 0 0 1 12 0ZM20 22h24v12H20ZM20 42h40v12H20ZM20 62h56v12H20ZM67 30a7 7 0 1 0 14 0a7 7 0 1 0-14 0Z"
        />
      </g>
      <circle cx="74" cy="30" r="7" fill={dotColor} />
      <text
        x="124"
        y="68"
        fontFamily="'Hanken Grotesk', 'Helvetica Neue', Arial, sans-serif"
        fontSize="64"
        letterSpacing="-2.9"
        fill={textColor}
      >
        <tspan fontWeight="500">Better</tspan>
        <tspan fontWeight="700">Form</tspan>
      </text>
    </svg>
  );
}
