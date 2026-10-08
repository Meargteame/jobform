import React from 'react';

/**
 * BetterForm Design System Button Component
 * Follows section 5 of the design system:
 * - Height 44px, padding 0 20px, weight 600, radius 8px
 * - Primary (on light): ink fill (#0B0B0C) / paper text (#F2F1EC)
 * - Primary (on dark): green signal fill (#13E884) / ink text (#0B0B0C)
 * - Secondary: 1px ink border (#0B0B0C), no fill (transparent)
 * - Tertiary: 1px hairline line border, muted text
 * - Compact variant: 36px height, 14px padding for tables and dense toolbars
 */
export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'dark' | 'tertiary' | 'signal'
  size = 'default',     // 'default' (44px) | 'compact' (36px)
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  as: Component = 'button',
  ...rest
}) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-sans font-semibold leading-none rounded-[8px] transition-colors cursor-pointer select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses =
    size === 'compact'
      ? 'h-[36px] px-[14px] text-[13px]'
      : 'h-[44px] px-[20px] text-[14px]';

  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses = 'bg-ink text-paper hover:bg-[#202022] active:bg-black border border-ink';
      break;
    case 'dark':
    case 'signal':
      variantClasses = 'bg-signal text-ink hover:bg-[#11d377] active:bg-[#0fc26d] border border-signal';
      break;
    case 'secondary':
      variantClasses = 'bg-transparent text-ink border border-ink hover:bg-ink/5 active:bg-ink/10';
      break;
    case 'tertiary':
      variantClasses = 'bg-transparent text-muted hover:text-ink hover:bg-paper-2 border border-line';
      break;
    default:
      variantClasses = 'bg-ink text-paper hover:bg-[#202022] active:bg-black border border-ink';
  }

  return (
    <Component
      type={Component === 'button' ? type : undefined}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Component>
  );
}
