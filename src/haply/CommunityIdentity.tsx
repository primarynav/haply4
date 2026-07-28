import { useEffect, useRef, useState } from 'react';
import type { H } from './HaplyApp';
import { generatedAvatarDataUri, type ProfileTarget } from './avatars';
import { fetchPublicProfile, type PublicProfile } from './backend';
import { Ic } from './ui';

const memberCache = new Map<string, PublicProfile | null>();
const memberInflight = new Map<string, Promise<PublicProfile | null>>();

function getMemberProfile(uid: string): Promise<PublicProfile | null> {
  if (memberCache.has(uid)) return Promise.resolve(memberCache.get(uid) ?? null);
  if (memberInflight.has(uid)) return memberInflight.get(uid)!;
  const p = fetchPublicProfile(uid).then((r) => {
    memberCache.set(uid, r);
    memberInflight.delete(uid);
    return r;
  });
  memberInflight.set(uid, p);
  return p;
}

export interface ResolvedIdentity {
  name: string;
  avatarSrc: string;
  status: 'ready' | 'loading' | 'gated' | 'empty';
  age?: number;
  city?: string;
  intro?: string;
  interests: string[];
  /** Demo/pool profiles are always shown verified (that's the whole pool's premise); real members reflect their actual divorce_verified status. */
  divorceVerified: boolean;
}

/**
 * Resolves a ProfileTarget to display data — synchronously for a demo post (the
 * matched pool profile is already local), or via the safe `get_community_profile`
 * RPC for a real member, cached across every hover card/profile page in the session
 * so revisiting the same member never re-fetches. Pass `target: null` to skip
 * resolving (e.g. before a hover card has opened).
 */
export function useResolvedIdentity(target: ProfileTarget | null, canFetch: boolean): ResolvedIdentity | null {
  const [, forceRender] = useState(0);
  useEffect(() => {
    if (!target || target.kind !== 'member' || !canFetch || memberCache.has(target.uid)) return;
    let cancelled = false;
    void getMemberProfile(target.uid).then(() => {
      if (!cancelled) forceRender((n) => n + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [target, canFetch]);

  if (!target) return null;
  if (target.kind === 'demo') {
    return {
      name: target.displayName,
      avatarSrc: target.profile.image,
      status: 'ready',
      age: target.profile.age,
      city: target.profile.location,
      intro: target.profile.bio,
      interests: target.profile.interests,
      divorceVerified: true
    };
  }
  const avatarSrc = generatedAvatarDataUri(target.uid, target.name.charAt(0));
  if (!canFetch) return { name: target.name, avatarSrc, status: 'gated', interests: [], divorceVerified: false };
  if (!memberCache.has(target.uid)) return { name: target.name, avatarSrc, status: 'loading', interests: [], divorceVerified: false };
  const p = memberCache.get(target.uid);
  if (!p) return { name: target.name, avatarSrc, status: 'empty', interests: [], divorceVerified: false };
  return { name: target.name, avatarSrc, status: 'ready', age: p.age, city: p.city, intro: p.intro, interests: p.interests, divorceVerified: p.divorceVerified };
}

/**
 * Reddit-style username link: hover shows a preview card after a short delay,
 * click navigates to the full community profile page. `children` is whatever
 * the caller wants as the visible trigger (avatar + name block, typically).
 */
export function IdentityLink({ h, target, style, children }: { h: H; target: ProfileTarget; style?: React.CSSProperties; children: React.ReactNode }) {
  const [hovering, setHovering] = useState(false);
  const openTimer = useRef<number>();
  const closeTimer = useRef<number>();
  const identity = useResolvedIdentity(hovering ? target : null, !!h.user);

  useEffect(
    () => () => {
      window.clearTimeout(openTimer.current);
      window.clearTimeout(closeTimer.current);
    },
    []
  );

  const scheduleOpen = () => {
    window.clearTimeout(closeTimer.current);
    openTimer.current = window.setTimeout(() => setHovering(true), 300);
  };
  const scheduleClose = () => {
    window.clearTimeout(openTimer.current);
    closeTimer.current = window.setTimeout(() => setHovering(false), 150);
  };
  const keepOpen = () => window.clearTimeout(closeTimer.current);

  return (
    <span
      style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', ...style }}
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
      onClick={() => h.goToProfile(target)}
    >
      {children}
      {hovering && identity && (
        <div
          onMouseEnter={keepOpen}
          onMouseLeave={scheduleClose}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 10,
            width: 300,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 12px 32px rgba(33,29,26,0.18)',
            border: '1px solid #EDE6DF',
            padding: 18,
            zIndex: 30,
            cursor: 'default'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={identity.avatarSrc} alt={identity.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                {identity.name}
                {identity.age ? `, ${identity.age}` : ''}
              </div>
              <div style={{ fontSize: 12, color: identity.status === 'ready' && identity.divorceVerified ? '#78716C' : '#A8A29E', display: 'flex', alignItems: 'center', gap: 4 }}>
                {identity.status === 'ready' && identity.divorceVerified && <Ic name="verified" fill size={12} color="#16a34a" />}
                {identity.status === 'ready' ? (identity.divorceVerified ? 'Verified' : 'Not verified') : 'Haply member'}
                {identity.city ? ` · ${identity.city}` : ''}
              </div>
            </div>
          </div>
          {identity.status === 'gated' && (
            <p style={{ color: '#78716C', fontSize: 13, margin: '14px 0 0', lineHeight: 1.5 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  h.goGetStarted();
                }}
                className="hvc-rose"
                style={{ background: 'none', border: 'none', color: '#e11d48', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: 13 }}
              >
                Join free
              </button>{' '}
              to see {identity.name}'s community profile.
            </p>
          )}
          {identity.status === 'loading' && <p style={{ color: '#78716C', fontSize: 13, margin: '14px 0 0' }}>Loading…</p>}
          {identity.status === 'empty' && <p style={{ color: '#78716C', fontSize: 13, margin: '14px 0 0' }}>Hasn't shared a bio yet.</p>}
          {identity.status === 'ready' && (
            <>
              {identity.intro && (
                <p style={{ color: '#44403C', fontSize: 13, lineHeight: 1.5, margin: '12px 0 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {identity.intro}
                </p>
              )}
              {identity.interests.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '12px 0 0' }}>
                  {identity.interests.slice(0, 3).map((i) => (
                    <span key={i} style={{ background: '#F0E9E2', color: '#44403C', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 999 }}>
                      {i}
                    </span>
                  ))}
                </div>
              )}
              <p style={{ color: '#e11d48', fontSize: 12, fontWeight: 600, margin: '14px 0 0' }}>View full profile →</p>
            </>
          )}
        </div>
      )}
    </span>
  );
}
