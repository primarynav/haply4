import type { CSSProperties } from 'react';

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
