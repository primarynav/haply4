import type { H } from './HaplyApp';
import { LEGAL_LAST_UPDATED, PRIVACY_POLICY, TERMS_OF_SERVICE } from './legalContent';
import { Ic, Logo, TrustChip, serif } from './ui';

const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', background: '#FAF7F4', border: '1.5px solid transparent', borderRadius: 12, padding: '12px 14px', fontSize: 15, outline: 'none' };
const labelStyle: React.CSSProperties = { fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 };

export function AuthModal({ h }: { h: H }) {
  const isSignup = h.authType === 'signup';
  const tabOn: React.CSSProperties = { background: '#fff', color: '#211D1A', boxShadow: '0 1px 3px rgba(33,29,26,0.12)' };
  const tabOff: React.CSSProperties = { background: 'transparent', color: '#78716C', boxShadow: 'none' };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420, padding: 32, position: 'relative', animation: 'popin .25s ease', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={h.closeAuth} className="hvc-ink" style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#78716C', padding: 4, display: 'flex' }}>
          <Ic name="close" size={22} />
        </button>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Logo size={38} color="#e11d48" />
          <h2 style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, margin: '8px 0 4px' }}>{isSignup ? 'Create your free account' : 'Welcome back'}</h2>
          <p style={{ color: '#57534E', margin: 0, fontSize: 15 }}>{isSignup ? 'Free forever — no credit card, ever' : 'Good to see you again'}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#F0E9E2', borderRadius: 999, padding: 4, gap: 4, marginBottom: 20 }}>
          <button onClick={() => h.setAuthType('login')} style={{ border: 'none', borderRadius: 999, padding: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', ...(isSignup ? tabOff : tabOn) }}>
            Log in
          </button>
          <button onClick={() => h.setAuthType('signup')} style={{ border: 'none', borderRadius: 999, padding: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', ...(isSignup ? tabOn : tabOff) }}>
            Sign up
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isSignup && (
            <div>
              <label style={labelStyle}>Full name</label>
              <input type="text" placeholder="Your name" value={h.authName} onChange={(e) => h.setAuthName(e.target.value)} className="fcb-rose" style={inputStyle} />
            </div>
          )}
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" placeholder="you@example.com" value={h.authEmail} onChange={(e) => h.setAuthEmail(e.target.value)} className="fcb-rose" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={h.authPassword}
              onChange={(e) => h.setAuthPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') h.authSubmit();
              }}
              className="fcb-rose"
              style={inputStyle}
            />
          </div>
          {isSignup && (
            <button
              onClick={() => h.setAuthTermsChecked(!h.authTermsChecked)}
              style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
            >
              <Ic name={h.authTermsChecked ? 'check_circle' : 'radio_button_unchecked'} fill={h.authTermsChecked} size={19} color={h.authTermsChecked ? '#16a34a' : '#A8A29E'} style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#57534E', lineHeight: 1.5 }}>
                I agree to the{' '}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    h.openLegal('terms');
                  }}
                  className="hvc-rose"
                  style={{ color: '#e11d48', fontWeight: 600, textDecoration: 'underline' }}
                >
                  Terms of Service
                </span>{' '}
                and{' '}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    h.openLegal('privacy');
                  }}
                  className="hvc-rose"
                  style={{ color: '#e11d48', fontWeight: 600, textDecoration: 'underline' }}
                >
                  Privacy Policy
                </span>
                .
              </span>
            </button>
          )}
          {h.authError && <p style={{ fontSize: 14, color: '#dc2626', margin: 0 }}>{h.authError}</p>}
          <button onClick={h.authSubmit} className="hvb-rosedeep" style={{ width: '100%', background: '#e11d48', color: '#fff', border: 'none', borderRadius: 999, padding: 13, fontSize: 16, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}>
            {isSignup ? 'Create account' : 'Log in'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#A8A29E', fontSize: 13 }}>
            <span style={{ flex: 1, height: 1, background: '#EDE6DF' }} />
            or continue with
            <span style={{ flex: 1, height: 1, background: '#EDE6DF' }} />
          </div>
          <button onClick={() => h.socialAuth('Google')} className="hvb-cream" style={{ width: '100%', background: '#fff', border: '1px solid #D6CCC2', borderRadius: 999, padding: 12, fontSize: 15, fontWeight: 600, color: '#211D1A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
          <button onClick={() => h.socialAuth('Facebook')} className="hvb-cream" style={{ width: '100%', background: '#fff', border: '1px solid #D6CCC2', borderRadius: 999, padding: 12, fontSize: 15, fontWeight: 600, color: '#211D1A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#1877F2" d="M24 12.073C24 5.446 18.627.073 12 .073S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continue with Facebook
          </button>
          <button onClick={() => h.socialAuth('Apple')} className="hvb-cream" style={{ width: '100%', background: '#fff', border: '1px solid #D6CCC2', borderRadius: 999, padding: 12, fontSize: 15, fontWeight: 600, color: '#211D1A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#000000" d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.954 4.45z" />
            </svg>
            Continue with Apple
          </button>
          <p style={{ textAlign: 'center', fontSize: 14, color: '#57534E', margin: '8px 0 0' }}>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => h.setAuthType(isSignup ? 'login' : 'signup')} className="hvc-rose" style={{ background: 'none', border: 'none', color: '#e11d48', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
              {isSignup ? 'Log in' : 'Sign up free'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/** Terms of Service / Privacy Policy content, layered above AuthModal (or anything else) rather than navigating away from it. */
export function LegalModal({ h }: { h: H }) {
  const section = h.legalSection;
  if (!section) return null;
  const sections = section === 'terms' ? TERMS_OF_SERVICE : PRIVACY_POLICY;
  const title = section === 'terms' ? 'Terms of Service' : 'Privacy Policy';
  return (
    <div onClick={h.closeLegal} style={{ position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.65)', zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto', padding: 32, position: 'relative', animation: 'popin .25s ease' }}>
        <button onClick={h.closeLegal} className="hvc-ink" style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#78716C', padding: 4, display: 'flex' }}>
          <Ic name="close" size={22} />
        </button>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button onClick={() => h.openLegal('terms')} style={{ border: 'none', borderRadius: 999, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: section === 'terms' ? '#211D1A' : '#F0E9E2', color: section === 'terms' ? '#fff' : '#44403C' }}>
            Terms
          </button>
          <button onClick={() => h.openLegal('privacy')} style={{ border: 'none', borderRadius: 999, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: section === 'privacy' ? '#211D1A' : '#F0E9E2', color: section === 'privacy' ? '#fff' : '#44403C' }}>
            Privacy
          </button>
        </div>
        <h2 style={{ fontFamily: serif, fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>{title}</h2>
        <p style={{ fontSize: 12, color: '#A8A29E', margin: '0 0 20px' }}>
          Haply · divorce and legal-separation community · last updated {LEGAL_LAST_UPDATED}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {sections.map((s) => (
            <div key={s.heading}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px' }}>{s.heading}</h3>
              <p style={{ fontSize: 14, color: '#44403C', lineHeight: 1.6, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChatDialog({ h }: { h: H }) {
  const p = h.chatId != null ? h.prof(h.chatId) : undefined;
  if (!p) return null;
  const msgs = h.convos[p.id] || [];
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, height: 600, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'popin .25s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #EDE6DF' }}>
          <img src={p.image} alt={p.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
              {p.name}{p.age ? `, ${p.age}` : ''}
            </h3>
            <p style={{ fontSize: 12, color: '#78716C', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrustChip verified={p.divorceVerified} demo={p.demo} size={11} />
              {p.location}
            </p>
          </div>
          <button onClick={h.closeChat} className="hvc-ink" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716C', padding: 4, display: 'flex' }}>
            <Ic name="close" size={22} />
          </button>
        </div>
        <div id="chatScroll" style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: '#FAF7F4' }}>
          {msgs.length === 0 && (
            <div style={{ textAlign: 'center', margin: 'auto 0' }}>
              <Ic name="favorite" fill size={40} color="#FDA4AF" />
              <p style={{ color: '#57534E', fontSize: 14, margin: '8px 0 0' }}>You matched with {p.name}! Say hello 👋</p>
            </div>
          )}
          {msgs.map((cm, i) => {
            const me = cm.from === 'me';
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: me ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '75%', padding: '10px 14px', fontSize: 14, lineHeight: 1.5, background: me ? '#e11d48' : '#fff', color: me ? '#fff' : '#211D1A', borderRadius: me ? '16px 16px 4px 16px' : '16px 16px 16px 4px', border: me ? 'none' : '1px solid #EDE6DF' }}>{cm.text}</div>
                <span style={{ fontSize: 11, color: '#A8A29E', margin: '4px 6px 0' }}>{cm.time}</span>
              </div>
            );
          })}
          {h.chatTyping && (
            <div style={{ display: 'flex' }}>
              <div style={{ background: '#fff', border: '1px solid #EDE6DF', padding: '12px 14px', borderRadius: 16, borderBottomLeftRadius: 4, display: 'flex', gap: 5, alignItems: 'center' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#A8A29E', animation: 'blink 1.2s infinite' }} />
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#A8A29E', animation: 'blink 1.2s .2s infinite' }} />
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#A8A29E', animation: 'blink 1.2s .4s infinite' }} />
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: '14px 16px', borderTop: '1px solid #EDE6DF', display: 'flex', gap: 8, background: '#fff' }}>
          <input
            type="text"
            placeholder="Type a message..."
            value={h.chatDraft}
            onChange={(e) => h.setChatDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') h.sendChat();
            }}
            className="fcb-rose"
            style={{ flex: 1, background: '#FAF7F4', border: '1.5px solid transparent', borderRadius: 999, padding: '10px 18px', fontSize: 14, outline: 'none' }}
          />
          <button onClick={h.sendChat} className="hvb-rosedeep" style={{ width: 42, height: 42, background: '#e11d48', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ic name="send" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function DetailModal({ h }: { h: H }) {
  const p = h.detailId != null ? h.prof(h.detailId) : undefined;
  if (!p) return null;
  const liked = h.liked.includes(p.id);
  const matched = h.matched.includes(p.id);
  const rows = (
    [
      ['work', 'Occupation', p.occupation],
      ['school', 'Education', p.education],
      ['straighten', 'Height', p.height],
      ['child_care', 'Children', p.children],
      ['favorite', 'Looking for', p.lookingFor]
    ] as const
  ).filter((r) => r[2]);
  return (
    <div onClick={h.closeDetail} style={{ position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 760, maxHeight: '90vh', overflow: 'hidden', display: 'grid', gridTemplateColumns: '300px 1fr', animation: 'popin .25s ease' }} data-rs="1">
        {/* Same rule as the grid: a member who hasn't verified their own divorce
            doesn't get a clear look at anyone else's photo. */}
        <img data-rs-img="1" src={p.image} alt={h.photosBlurred ? `${p.name} — photo hidden until you verify` : p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 420, ...(h.photosBlurred ? { filter: 'blur(18px)', transform: 'scale(1.06)' } : {}) }} />
        <div style={{ padding: 28, overflowY: 'auto', position: 'relative' }}>
          <button onClick={h.closeDetail} className="hvc-ink" style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#78716C', padding: 4, display: 'flex' }}>
            <Ic name="close" size={22} />
          </button>
          <h2 style={{ fontFamily: serif, fontSize: 28, fontWeight: 600, margin: 0 }}>
            {p.name}{p.age ? `, ${p.age}` : ''}
          </h2>
          <p style={{ color: '#57534E', margin: '4px 0 0', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Ic name="location_on" size={16} />
            {p.location}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0 0' }}>
            <TrustChip verified={p.divorceVerified} demo={p.demo} size={13} />
            {p.divorceYear > 0 && <span style={{ color: '#78716C', fontSize: 13 }}>Divorced {p.divorceYear} (self-reported)</span>}
          </div>
          {/* Stated where the badge is actually relied on, not only in the Terms:
              a member deciding whether to meet someone should see the limits of
              what "Verified" was ever checking. */}
          <p style={{ fontSize: 12, color: '#A8A29E', margin: '8px 0 0', lineHeight: 1.5 }}>
            {p.divorceVerified
              ? 'Verified means a document was reviewed — not an identity or background check. Haply does not screen members for criminal history.'
              : 'Haply does not screen members for criminal history. Meet in public and tell someone where you’re going.'}
          </p>
          <p style={{ color: '#44403C', fontSize: 15, lineHeight: 1.65, margin: '16px 0 0' }}>{p.bio}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '14px 0 0' }}>
            {p.interests.map((di) => (
              <span key={di} style={{ background: '#FFF1F2', color: '#be123c', fontSize: 13, fontWeight: 600, padding: '5px 12px', borderRadius: 999 }}>
                {di}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '18px 0 0', borderTop: '1px solid #F0E9E2', paddingTop: 18 }}>
            {rows.map(([icon, label, value]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <Ic name={icon} size={18} color="#A8A29E" style={{ marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 12, color: '#78716C', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                  <div style={{ fontSize: 14, color: '#211D1A' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <button onClick={() => h.doLike(p.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 'none', borderRadius: 999, padding: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', background: liked ? '#FECDD3' : '#e11d48', color: liked ? '#be123c' : '#fff' }}>
              <Ic name="favorite" fill={liked} size={18} />
              {matched ? 'Matched!' : liked ? 'Liked' : 'Like'}
            </button>
            <button onClick={() => h.passProfile(p.id)} className="hvb-cream" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', border: '1px solid #D6CCC2', borderRadius: 999, padding: '12px 18px', fontSize: 15, fontWeight: 600, color: '#44403C', cursor: 'pointer' }}>
              <Ic name="close" size={18} />
              Pass
            </button>
            <button onClick={() => h.openChat(p.id)} className="hvb-cream" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', border: '1px solid #D6CCC2', borderRadius: 999, padding: '12px 18px', fontSize: 15, fontWeight: 600, color: '#44403C', cursor: 'pointer' }}>
              <Ic name="chat_bubble" size={18} />
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MatchPop({ h }: { h: H }) {
  const p = h.matchPopId != null ? h.prof(h.matchPopId) : undefined;
  if (!p) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.7)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#FAF7F4', borderRadius: 24, width: '100%', maxWidth: 400, padding: '40px 32px', textAlign: 'center', animation: 'popin .3s ease' }}>
        <div style={{ fontSize: 44, lineHeight: 1 }}>🎉</div>
        <h2 style={{ fontFamily: serif, fontSize: 32, fontWeight: 600, color: '#e11d48', margin: '12px 0 4px' }}>It's a match!</h2>
        <p style={{ color: '#57534E', fontSize: 15, margin: '0 0 24px' }}>You and {p.name} liked each other</p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 28 }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#FECDD3', color: '#be123c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700, border: '4px solid #fff', boxShadow: '0 8px 16px rgba(33,29,26,0.12)' }}>{h.userInitial}</div>
          <Ic name="favorite" fill size={28} color="#e11d48" style={{ margin: '0 -6px', position: 'relative', zIndex: 2 }} />
          <img src={p.image} alt={p.name} style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 8px 16px rgba(33,29,26,0.12)' }} />
        </div>
        <button onClick={() => h.openChat(p.id)} className="hvb-rosedeep" style={{ width: '100%', background: '#e11d48', color: '#fff', border: 'none', borderRadius: 999, padding: 13, fontSize: 16, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>
          Send a message
        </button>
        <button onClick={h.closeMatchPop} className="hvc-ink" style={{ width: '100%', background: 'transparent', color: '#57534E', border: 'none', padding: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Keep browsing
        </button>
      </div>
    </div>
  );
}

export function Toast({ text }: { text: string }) {
  return (
    <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 200, background: '#211D1A', color: '#fff', borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 500, boxShadow: '0 10px 25px rgba(0,0,0,0.25)', animation: 'popin .2s ease', maxWidth: '90vw' }}>{text}</div>
  );
}
