import type { H } from './HaplyApp';
import { useResolvedIdentity } from './CommunityIdentity';
import { PostCard } from './CommunityPublic';
import { Ic, Logo, serif } from './ui';

/** Full community profile page — a demo post's matched persona, or a real member's public identity. */
export function CommunityProfilePage({ h }: { h: H }) {
  const target = h.viewingProfile;
  const identity = useResolvedIdentity(target, !!h.user);
  if (!target || !identity) return null;

  const authoredPosts = h.posts.filter((p) => (target.kind === 'demo' ? p.name === target.displayName : p.userId === target.uid));

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F4' }}>
      <div style={{ borderBottom: '1px solid #EDE6DF', background: '#fff' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={h.backFromProfile} className="hvc-rose" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#57534E', fontSize: 15, cursor: 'pointer', padding: 0 }}>
            <Ic name="arrow_back" size={20} />
            <span>Back</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Logo size={22} color="#e11d48" />
            <h1 style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, margin: 0 }}>Haply Community</h1>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px 60px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #EDE6DF', borderRadius: 18, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <img src={identity.avatarSrc} alt={identity.name} style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            <div>
              <h2 style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, margin: 0 }}>
                {identity.name}
                {identity.age ? `, ${identity.age}` : ''}
              </h2>
              <p style={{ color: '#78716C', margin: '4px 0 0', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Ic name="verified" fill size={14} color="#16a34a" />
                Haply member{identity.city ? ` · ${identity.city}` : ''}
              </p>
            </div>
          </div>
          {identity.status === 'gated' && (
            <p style={{ color: '#78716C', fontSize: 15, margin: '20px 0 0' }}>
              <button onClick={h.goGetStarted} className="hvc-rose" style={{ background: 'none', border: 'none', color: '#e11d48', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: 15 }}>
                Join free
              </button>{' '}
              to see {identity.name}'s full community profile.
            </p>
          )}
          {identity.status === 'loading' && <p style={{ color: '#78716C', fontSize: 15, margin: '20px 0 0' }}>Loading…</p>}
          {identity.status === 'empty' && <p style={{ color: '#78716C', fontSize: 15, margin: '20px 0 0' }}>This member hasn't shared a bio yet.</p>}
          {identity.status === 'ready' && (
            <>
              {identity.intro && <p style={{ color: '#44403C', fontSize: 15, lineHeight: 1.65, margin: '20px 0 0' }}>{identity.intro}</p>}
              {identity.interests.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '16px 0 0' }}>
                  {identity.interests.map((i) => (
                    <span key={i} style={{ background: '#F0E9E2', color: '#44403C', fontSize: 13, fontWeight: 600, padding: '5px 12px', borderRadius: 999 }}>
                      {i}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {authoredPosts.length > 0 && (
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px' }}>Posts by {identity.name}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {authoredPosts.map((p) => (
                <PostCard key={p.id} post={p} h={h} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
