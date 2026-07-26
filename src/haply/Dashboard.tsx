import { useRef } from 'react';
import { EVENTS, PROFILES } from './data';
import type { DashTab, H } from './HaplyApp';
import { CatPills, Composer, PostCard, filteredPosts } from './CommunityPublic';
import { Ic, Logo, serif } from './ui';
import type { Intro } from './matchmaker';

const feedH = 'calc(100vh - 185px)';

export function Dashboard({ h }: { h: H }) {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F4' }}>
      <header style={{ background: '#FAF7F4', borderBottom: '1px solid #EDE6DF', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 clamp(16px,4vw,32px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Logo size={28} color="#e11d48" />
            <h1 style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, margin: 0 }}>Haply</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#44403C', fontSize: 15 }} data-rs-hide="1">
              Hi, {h.userName}{' '}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>
                <Ic name="verified" fill size={13} />
                Verified
              </span>
            </span>
            <button onClick={h.invite} className="hvc-rose" style={{ background: 'none', border: 'none', color: '#44403C', fontSize: 14, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Ic name="person_add" size={17} />
              Invite
            </button>
            <button onClick={() => h.setDashTab('profile')} className="hvc-rose" style={{ background: 'none', border: 'none', color: '#44403C', fontSize: 14, cursor: 'pointer', padding: 0 }}>
              Profile
            </button>
            <button onClick={h.logout} className="hvb-sand" style={{ background: '#fff', border: '1px solid #D6CCC2', borderRadius: 999, padding: '7px 16px', fontSize: 14, fontWeight: 500, color: '#211D1A', cursor: 'pointer' }}>
              Log out
            </button>
          </div>
        </div>
      </header>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px clamp(16px,4vw,32px)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', background: '#F0E9E2', borderRadius: 24, padding: 4, gap: 4, marginBottom: 24, maxWidth: 720 }}>
          <TabBtn h={h} tab="community" icon="diversity_1" label="Community" onClick={() => h.setDashTab('community')} />
          <TabBtn h={h} tab="discover" icon="explore" label="Discover" onClick={h.tabDiscover} />
          <TabBtn h={h} tab="ai-match" icon="forum" label="Matchmaker" onClick={h.tabAI} />
          <TabBtn h={h} tab="matches" icon="favorite" label="Matches" onClick={() => h.setDashTab('matches')} />
          <TabBtn h={h} tab="messages" icon="chat_bubble" label="Messages" onClick={() => h.setDashTab('messages')} />
        </div>

        {h.dashTab === 'community' && <CommunityTab h={h} />}
        {h.dashTab === 'discover' && <DiscoverTab h={h} />}
        {h.dashTab === 'ai-match' && <MatchmakerTab h={h} />}
        {h.dashTab === 'matches' && <MatchesTab h={h} />}
        {h.dashTab === 'messages' && <MessagesTab h={h} />}
        {h.dashTab === 'profile' && <ProfileTab h={h} />}
      </div>
    </div>
  );
}

function TabBtn({ h, tab, icon, label, onClick }: { h: H; tab: DashTab; icon: string; label: string; onClick: () => void }) {
  const on = h.dashTab === tab;
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        border: 'none',
        borderRadius: 999,
        padding: 9,
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        background: on ? '#fff' : 'transparent',
        color: on ? '#211D1A' : '#78716C',
        boxShadow: on ? '0 1px 3px rgba(33,29,26,0.12)' : 'none'
      }}
    >
      <Ic name={icon} size={17} />
      {label}
    </button>
  );
}

function CommunityTab({ h }: { h: H }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }} data-rs="1">
      <div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <CatPills h={h} small />
        </div>
        <Composer h={h} dash />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredPosts(h).map((po, i) => (
            <PostCard key={po.id} post={po} index={i} h={h} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #EDE6DF', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ic name="location_on" fill size={20} color="#e11d48" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Seattle group</div>
              <div style={{ fontSize: 12, color: '#78716C' }}>your city's community · you're in</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#57534E', margin: '0 0 12px', lineHeight: 1.5 }}>Divorced locals, real meetups. Say hello in the group chat — someone will be glad you did.</p>
          <button onClick={h.groupToast} className="hvb-ink2" style={{ width: '100%', background: '#211D1A', color: '#fff', border: 'none', borderRadius: 999, padding: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Open group chat
          </button>
        </div>
        <div style={{ background: '#fff', border: '1px solid #EDE6DF', borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px' }}>Meetups to look forward to</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {EVENTS.map((de) => (
              <div key={de.name} onClick={() => h.rsvp(de.name)} className="hvb-cream" style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', borderRadius: 10, padding: 4, margin: -4 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Ic name={de.icon} fill size={19} color="#b45309" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{de.name}</div>
                  <div style={{ fontSize: 12, color: '#78716C' }}>{de.sub}</div>
                </div>
                <Ic name="arrow_forward" size={18} color="#A8A29E" />
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg,#e11d48,#be123c)', borderRadius: 16, padding: 20, color: '#fff' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px' }}>Know someone starting over?</h3>
          <p style={{ fontSize: 13, margin: '0 0 14px', opacity: 0.9, lineHeight: 1.5 }}>Most members are here because a friend sent them. Pass it on.</p>
          <button onClick={h.invite} className="hvb-rose50" style={{ width: '100%', background: '#fff', color: '#be123c', border: 'none', borderRadius: 999, padding: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <Ic name="content_copy" size={16} />
            Copy invite link
          </button>
        </div>
        {!h.datingOn && (
          <div style={{ background: '#fff', border: '1px solid #EDE6DF', borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px' }}>Ready to date?</h3>
            <p style={{ fontSize: 13, color: '#57534E', margin: '0 0 14px', lineHeight: 1.5 }}>You're in community-only mode. Flip dating on whenever it feels right.</p>
            <button onClick={h.turnDatingOn} className="hvb-rose100" style={{ width: '100%', background: '#FFF1F2', color: '#be123c', border: '1px solid #FECDD3', borderRadius: 999, padding: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Turn on dating
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DiscoverTab({ h }: { h: H }) {
  const feed = PROFILES.filter((p) => !h.hidden.includes(p.id));
  return (
    <div id="feed" style={{ height: feedH, minHeight: 520, overflowY: 'auto', scrollSnapType: 'y mandatory', borderRadius: 18 }}>
      {feed.map((p) => {
        const liked = h.liked.includes(p.id);
        const matched = h.matched.includes(p.id);
        return (
          <div key={p.id} style={{ position: 'relative', height: feedH, minHeight: 520, scrollSnapAlign: 'start', overflow: 'hidden' }}>
            <div onClick={() => h.openDetail(p.id)} style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}>
              <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent,transparent 55%,rgba(20,16,14,0.72))' }} />
              <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', color: '#fff', fontSize: 12, padding: '6px 12px', borderRadius: 999 }}>Sample profile · tap to view</div>
            </div>
            {matched && (
              <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#e11d48', color: '#fff', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 999 }}>
                  <Ic name="favorite" fill size={12} />
                  Mutual match
                </span>
              </div>
            )}
            <div style={{ position: 'absolute', right: 16, bottom: 96, display: 'flex', flexDirection: 'column', gap: 14, zIndex: 10 }}>
              <button
                onClick={() => h.doLike(p.id)}
                title="Like"
                className="hvb-rose"
                style={{ width: 56, height: 56, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', transition: 'all .2s', background: liked ? '#e11d48' : 'rgba(255,255,255,0.2)', border: liked ? '1px solid #fb7185' : '1px solid rgba(255,255,255,0.3)' }}
              >
                <Ic name="favorite" fill={liked} size={28} color="#fff" />
              </button>
              <button
                onClick={() => h.passProfile(p.id)}
                title="Pass"
                className="hvb-white30"
                style={{ width: 56, height: 56, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.3)' }}
              >
                <Ic name="close" size={28} color="#fff" />
              </button>
              <button
                onClick={() => h.openChat(p.id)}
                title="Message"
                className="hvb-white35"
                style={{ width: 56, height: 56, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', transition: 'all .2s', background: matched ? 'rgba(225,29,72,0.75)' : 'rgba(255,255,255,0.2)', border: matched ? '1px solid #fb7185' : '1px solid rgba(255,255,255,0.3)' }}
              >
                <Ic name="chat_bubble" size={28} color="#fff" />
              </button>
            </div>
            <div style={{ position: 'absolute', bottom: 32, left: 24, right: 96, color: '#fff', zIndex: 10 }}>
              <h2 style={{ fontFamily: serif, fontSize: 32, fontWeight: 600, margin: '0 0 6px' }}>
                {p.name}, {p.age}
              </h2>
              <p style={{ fontSize: 17, margin: '0 0 10px', opacity: 0.9 }}>{p.location}</p>
              <p style={{ fontSize: 15, lineHeight: 1.6, maxWidth: 430, margin: '0 0 12px' }}>{p.bio}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {p.interests.map((i) => (
                  <span key={i} style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 999 }}>
                    {i}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(22,101,52,0.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', borderRadius: 999, padding: '6px 14px', border: '1px solid rgba(74,222,128,0.4)', margin: 0 }}>
                <Ic name="verified" fill size={15} color="#4ade80" />
                <span style={{ fontWeight: 600 }}>Verified divorced · {p.divorceYear}</span>
              </p>
            </div>
            <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>Scroll for more</span>
              <div style={{ width: 4, height: 24, background: 'rgba(255,255,255,0.4)', borderRadius: 999, animation: 'pulse 2s infinite' }} />
            </div>
          </div>
        );
      })}
      <div style={{ height: feedH, minHeight: 520, scrollSnapAlign: 'start', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0E9E2' }}>
        <div style={{ textAlign: 'center', padding: 32 }}>
          <Ic name="favorite" size={64} color="#e11d48" />
          <h3 style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, margin: '20px 0 12px' }}>You've met everyone for now</h3>
          <p style={{ color: '#57534E', margin: '0 0 24px', fontSize: 16 }}>New verified members join every day. Meanwhile, the community's always on.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={h.startOver} className="hvb-rosedeep" style={{ background: '#e11d48', color: '#fff', border: 'none', borderRadius: 999, padding: '11px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Start over
            </button>
            <button onClick={() => h.setDashTab('community')} className="hvb-cream" style={{ background: '#fff', color: '#211D1A', border: '1px solid #D6CCC2', borderRadius: 999, padding: '11px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Visit community
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** One member, as a compact card in an inline result row. */
function IntroCard({ h, intro }: { h: H; intro: Intro }) {
  const p = intro.profile;
  const liked = h.liked.includes(p.id);
  const matched = h.matched.includes(p.id);
  return (
    <div
      style={{
        flex: '0 0 232px',
        scrollSnapAlign: 'start',
        background: '#fff',
        borderRadius: 14,
        border: '1px solid #EDE6DF',
        overflow: 'hidden',
        boxShadow: '0 4px 14px -8px rgba(33,29,26,0.18)'
      }}
    >
      <div style={{ position: 'relative' }}>
        <img src={p.image} alt={p.name} style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
        <button
          onClick={() => h.doLike(p.id)}
          aria-label={liked ? `Unlike ${p.name}` : `Like ${p.name}`}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Ic name="favorite" fill={liked} size={17} color={liked ? '#e11d48' : '#57534E'} />
        </button>
        <span
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            background: 'rgba(33,29,26,0.82)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 999
          }}
        >
          {intro.pct}
        </span>
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        {/* Name + age is the headline, the way price leads a listing card. */}
        <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>
          {p.name}, {p.age}
        </div>
        <div style={{ fontSize: 12.5, color: '#57534E', margin: '4px 0 0', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <span>{p.children && p.children !== 'None' ? 'has kids' : 'no kids'}</span>
          <span aria-hidden>·</span>
          <span>{p.interests.slice(0, 2).join(', ')}</span>
        </div>
        <div style={{ fontSize: 12.5, color: '#78716C', marginTop: 3 }}>{p.location}</div>
        <div style={{ fontSize: 11.5, color: '#A8A29E', marginTop: 6, lineHeight: 1.4, minHeight: 30 }}>{intro.reason}</div>
        <button
          onClick={() => h.openDetail(p.id)}
          className="hvb-cream"
          style={{
            marginTop: 8,
            width: '100%',
            background: matched ? '#FECDD3' : '#fff',
            border: '1px solid #D6CCC2',
            borderRadius: 999,
            padding: '7px 0',
            fontSize: 13,
            fontWeight: 600,
            color: matched ? '#be123c' : '#44403C',
            cursor: 'pointer'
          }}
        >
          {matched ? 'Matched — view' : 'View profile'}
        </button>
      </div>
    </div>
  );
}

/** Horizontally scrolling result row, with a chevron once it overflows. */
function IntroRow({ h, intros }: { h: H; intros: Intro[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const scroll = () => ref.current?.scrollBy({ left: 250, behavior: 'smooth' });
  return (
    <div style={{ position: 'relative', margin: '10px 0 2px' }}>
      <div
        ref={ref}
        style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 6, scrollbarWidth: 'thin' }}
      >
        {intros.map((intro) => (
          <IntroCard key={intro.profile.id} h={h} intro={intro} />
        ))}
      </div>
      {intros.length > 2 && (
        <button
          onClick={scroll}
          aria-label="More introductions"
          style={{
            position: 'absolute',
            top: 75,
            right: -6,
            width: 30,
            height: 30,
            borderRadius: '50%',
            border: '1px solid #EDE6DF',
            background: '#fff',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(33,29,26,0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Ic name="chevron_right" size={19} color="#44403C" />
        </button>
      )}
    </div>
  );
}

function MatchmakerTab({ h }: { h: H }) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 190px)', minHeight: 520 }}>
      <p style={{ fontSize: 11.5, color: '#A8A29E', lineHeight: 1.5, margin: '0 0 12px', textAlign: 'center' }}>
        Your matchmaker is AI-assisted. Preferences you state — who you want to meet, ages, city — are applied as filters by Haply, not left to the model.
      </p>

      <div id="aiScroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18, padding: '4px 8px 8px' }}>
        {h.aiMsgs.map((m, i) => {
          const me = m.from === 'me';
          return (
            <div key={i}>
              <div style={{ display: 'flex', gap: 10, flexDirection: me ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                {!me && (
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#211D1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <Ic name="forum" size={16} color="#fff" />
                  </div>
                )}
                <div style={{ maxWidth: me ? '78%' : '100%', flex: me ? '0 1 auto' : 1 }}>
                  {!me && <div style={{ fontSize: 11.5, color: '#A8A29E', fontWeight: 600, marginBottom: 4 }}>Your matchmaker</div>}
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '11px 15px',
                      fontSize: 14.5,
                      lineHeight: 1.55,
                      background: me ? '#e11d48' : '#F0E9E2',
                      color: me ? '#fff' : '#211D1A',
                      borderRadius: me ? '16px 16px 4px 16px' : '4px 16px 16px 16px'
                    }}
                  >
                    {m.text}
                  </div>

                  {/* Applied filters, stated rather than implied. */}
                  {!me && m.filters && m.filters.length > 0 && (
                    <div style={{ fontSize: 12.5, color: '#57534E', margin: '9px 0 0', lineHeight: 1.5 }}>
                      {typeof m.total === 'number' && (
                        <strong style={{ fontWeight: 700 }}>
                          {m.total} {m.total === 1 ? 'member' : 'members'}
                        </strong>
                      )}{' '}
                      matched on{' '}
                      {m.filters.map((f, k) => (
                        <span
                          key={k}
                          style={{ display: 'inline-block', background: '#F5F5F4', border: '1px solid #EDE6DF', borderRadius: 999, padding: '2px 9px', margin: '3px 4px 0 0', fontSize: 12 }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  {!me && m.intros && m.intros.length > 0 && <IntroRow h={h} intros={m.intros} />}
                  {!me && m.intros && m.intros.length === 0 && (
                    <div style={{ margin: '10px 0 0', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '11px 14px', fontSize: 13, color: '#92400E', lineHeight: 1.5 }}>
                      No one currently matches every filter. Try widening the age range or the city — tell me and I&apos;ll update it.
                    </div>
                  )}

                  {m.at && <div style={{ fontSize: 11, color: '#C4BDB6', marginTop: 6, textAlign: me ? 'right' : 'left' }}>{m.at}</div>}
                </div>
              </div>
            </div>
          );
        })}

        {h.aiTyping && (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 30, height: 30, background: '#211D1A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ic name="forum" size={16} color="#fff" />
            </div>
            <div style={{ background: '#F0E9E2', padding: 13, borderRadius: 14, borderTopLeftRadius: 4, display: 'flex', gap: 5, alignItems: 'center' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#A8A29E', animation: 'blink 1.2s infinite' }} />
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#A8A29E', animation: 'blink 1.2s .2s infinite' }} />
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#A8A29E', animation: 'blink 1.2s .4s infinite' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '12px 8px 0', display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Tell the matchmaker what you're looking for..."
          value={h.aiDraft}
          onChange={(e) => h.setAiDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') h.sendAi();
          }}
          className="fc-rose"
          style={{ flex: 1, background: '#fff', border: '1px solid #D6CCC2', borderRadius: 999, padding: '12px 20px', fontSize: 15, outline: 'none' }}
        />
        <button
          onClick={h.sendAi}
          className="hvb-rosedeep"
          aria-label="Send"
          style={{ background: '#e11d48', color: '#fff', border: 'none', width: 46, height: 46, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <Ic name="send" size={20} />
        </button>
      </div>
    </div>
  );
}

function MatchesTab({ h }: { h: H }) {
  const matchList = PROFILES.filter((p) => h.matched.includes(p.id));
  return (
    <div style={{ background: '#fff', border: '1px solid #EDE6DF', borderRadius: 18 }}>
      <div style={{ padding: '24px 24px 0' }}>
        <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, margin: 0 }}>Your matches ({matchList.length})</h2>
      </div>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: 20 }}>
          {matchList.map((mt) => (
            <div key={mt.id} onClick={() => h.openChat(mt.id)} className="hv-matchcard" style={{ border: '1px solid #EDE6DF', borderRadius: 14, padding: 16, cursor: 'pointer', transition: 'all .2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img src={mt.image} alt={mt.name} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                    {mt.name}, {mt.age} <Ic name="verified" fill size={14} color="#16a34a" />
                  </h3>
                  <p style={{ fontSize: 13, color: '#78716C', margin: '2px 0 8px' }}>{mt.location}</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FFF1F2', color: '#be123c', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999 }}>
                    <Ic name="favorite" fill size={12} />
                    Mutual match
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessagesTab({ h }: { h: H }) {
  const msgList = PROFILES.filter((p) => h.matched.includes(p.id)).map((p) => {
    const msgs = h.convos[p.id] || [];
    const lastM = msgs[msgs.length - 1];
    return { ...p, last: lastM ? lastM.text : 'Start a conversation', time: lastM ? lastM.time : '' };
  });
  return (
    <div style={{ background: '#fff', border: '1px solid #EDE6DF', borderRadius: 18 }}>
      <div style={{ padding: '24px 24px 0' }}>
        <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, margin: 0 }}>Messages</h2>
      </div>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgList.map((mg) => (
          <div key={mg.id} onClick={() => h.openChat(mg.id)} className="hvb-cream" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', border: '1px solid #EDE6DF', borderRadius: 14, cursor: 'pointer', transition: 'background .15s' }}>
            <img src={mg.image} alt={mg.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                {mg.name} <Ic name="verified" fill size={13} color="#16a34a" />
              </h3>
              <p style={{ fontSize: 14, color: '#57534E', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mg.last}</p>
            </div>
            <div style={{ fontSize: 12, color: '#78716C', whiteSpace: 'nowrap' }}>{mg.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileTab({ h }: { h: H }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EDE6DF', borderRadius: 18 }}>
      <div style={{ padding: '24px 24px 0' }}>
        <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, margin: 0 }}>Your profile</h2>
      </div>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 92, height: 92, borderRadius: '50%', background: '#FFE4E6', color: '#be123c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700 }}>{h.userInitial}</div>
          <div>
            <h3 style={{ fontSize: 24, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              {h.userName}{' '}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>
                <Ic name="verified" fill size={13} />
                Verified member
              </span>
            </h3>
            <p style={{ color: '#78716C', margin: '4px 0 10px', fontSize: 14 }}>{h.userEmail} · Seattle group</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={h.settingsToast} className="hvb-cream" style={{ background: '#fff', border: '1px solid #D6CCC2', borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#211D1A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Ic name="settings" size={15} />
                Edit profile
              </button>
              <button onClick={h.toggleDating} style={{ border: 'none', borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, background: h.datingOn ? '#F0FDF4' : '#F0E9E2', color: h.datingOn ? '#166534' : '#44403C' }}>
                <Ic name={h.datingOn ? 'toggle_on' : 'toggle_off'} size={16} />
                {h.datingOn ? 'Dating: on' : 'Community-only'}
              </button>
            </div>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>My intro</h4>
          <p style={{ color: '#44403C', margin: 0, fontSize: 15, lineHeight: 1.65, maxWidth: 640 }}>
            {h.userProfile.intro || "Recently divorced and ready for what's next. I believe in second chances and new beginnings — looking for people who understand the journey."}
          </p>
          <p style={{ color: '#78716C', margin: '8px 0 0', fontSize: 13 }}>Written by your matchmaker from what you've shared — chat with it any time to update this.</p>
        </div>
        {(h.userProfile.age || h.userProfile.city || h.userProfile.kids) && (
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>My details</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {h.userProfile.age && <span style={{ background: '#F0E9E2', color: '#44403C', fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 999 }}>Age {h.userProfile.age}</span>}
              {h.userProfile.city && <span style={{ background: '#F0E9E2', color: '#44403C', fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 999 }}>{h.userProfile.city}</span>}
              {h.userProfile.kids && <span style={{ background: '#F0E9E2', color: '#44403C', fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 999 }}>{h.userProfile.kids === 'No kids' ? 'No kids' : `Kids: ${h.userProfile.kids}`}</span>}
            </div>
          </div>
        )}
        <div>
          <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>My interests</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(h.userProfile.interests.length ? h.userProfile.interests : ['Tell the matchmaker what you enjoy']).map((i) => (
              <span key={i} style={{ background: '#F0E9E2', color: '#44403C', fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 999 }}>
                {i}
              </span>
            ))}
          </div>
        </div>
        {(h.userProfile.seeking || h.userProfile.prefLocal || h.userProfile.prefSameAge || h.userProfile.prefKidsOk) && (
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>Looking for</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {h.userProfile.seeking && (
                <span style={{ background: '#be123c', color: '#fff', fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 999 }}>
                  {h.userProfile.seeking === 'anyone' ? 'Anyone' : h.userProfile.seeking === 'women' ? 'Women' : 'Men'}
                </span>
              )}
              {h.userProfile.prefLocal && <span style={{ background: '#FFF1F2', color: '#be123c', fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 999 }}>Someone local</span>}
              {h.userProfile.prefSameAge && <span style={{ background: '#FFF1F2', color: '#be123c', fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 999 }}>Around the same age</span>}
              {h.userProfile.prefKidsOk && <span style={{ background: '#FFF1F2', color: '#be123c', fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 999 }}>With or without kids</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
