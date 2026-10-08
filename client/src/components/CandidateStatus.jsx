import React from 'react';

/**
 * Candidate Status Component
 * Adheres strictly to Section 5 of BetterForm Design System:
 * - "Candidate states: 'new' = ink dot, 'qualified / selected' = green dot, 'rejected' = hollow ring."
 * - "The dot is the brand's unit of meaning; reuse it as a bullet and status marker."
 * - Labels use DM Mono, 12px, uppercase, letter-spacing 0.12em.
 */
export function CandidateDot({ status, size = 8 }) {
  const normalized = (status || '').toLowerCase();

  if (normalized === 'shortlisted' || normalized === 'qualified' || normalized === 'selected') {
    return (
      <span
        style={{ width: size, height: size }}
        className="rounded-full bg-signal inline-block shrink-0 ring-1 ring-ink/20"
        title="Qualified / Selected"
      />
    );
  }

  if (normalized === 'rejected') {
    return (
      <span
        style={{ width: size, height: size }}
        className="rounded-full border border-ink bg-transparent inline-block shrink-0"
        title="Rejected"
      />
    );
  }

  // Default: 'applied' / 'new' -> ink dot
  return (
    <span
      style={{ width: size, height: size }}
      className="rounded-full bg-ink inline-block shrink-0"
      title="New / Applied"
    />
  );
}

export default function CandidateStatusBadge({ status, showLabel = true, className = '' }) {
  const normalized = (status || '').toLowerCase();
  
  let label = 'Applied';
  if (normalized === 'shortlisted') label = 'Shortlisted';
  if (normalized === 'rejected') label = 'Rejected';

  return (
    <span className={`inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.12em] font-normal text-ink ${className}`}>
      <CandidateDot status={status} size={8} />
      {showLabel && <span>{label}</span>}
    </span>
  );
}
