import { useEffect, useState, type CSSProperties } from 'react';

/** True when the viewer asked their OS to reduce motion. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/** Material Symbols icon. `fill` renders the filled variant (.msf). */
export function Ic({ name, fill, size, color, style }: { name: string; fill?: boolean; size: number; color?: string; style?: CSSProperties }) {
  return (
    <span className={fill ? 'msf' : 'mso'} style={{ fontSize: size, color, ...style }}>
      {name}
    </span>
  );
}

/** Haply heart-with-smile logo mark. */
export function Logo({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ color }}>
      <path d="M12 6c-2-4-8-2-8 2s8 10 8 10 8-6 8-10-6-6-8-2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M6 20c0 0 3-1 6-1s6 1 6 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export const serif = "'Source Serif 4',Georgia,serif";

/**
 * The one place a "Verified" badge is allowed to render for another member.
 *
 * A badge is an invitation to rely, so it must track a real approved
 * verification and nothing else: never a hardcoded literal, never a demo
 * profile, never "everyone in this list". Sample profiles get an unmistakable
 * "Example profile" chip instead so nobody mistakes seeded data for a
 * vetted member.
 *
 * `verified` should come from the profile's own divorceVerified field.
 */
export function TrustChip({ verified, demo, size = 13 }: { verified?: boolean; demo?: boolean; size?: number }) {
  if (demo) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#F5F5F4', color: '#57534E', border: '1px solid #E7E5E4', borderRadius: 999, padding: '3px 10px', fontSize: size, fontWeight: 600 }}>
        <Ic name="info" size={size} />
        Example profile
      </span>
    );
  }
  if (!verified) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', borderRadius: 999, padding: '3px 10px', fontSize: size, fontWeight: 600 }}>
      <Ic name="verified" fill size={size} />
      Verified
    </span>
  );
}
