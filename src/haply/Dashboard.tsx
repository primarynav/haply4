import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EVENTS, PROFILES, type Profile } from './data';
import type { DashTab, H } from './HaplyApp';
import { CatPills, Composer, PostCard, filteredPosts } from './CommunityPublic';
import { generatedAvatarDataUri } from './avatars';
import { Ic, Logo, serif } from './ui';
import type { Intro, UserProfile } from './matchmaker';
import { detectByIp, detectPrecise, detectQuietly, type DetectedLocation } from './geolocate';
import { AGE_FLOOR, AGE_CEIL, RADIUS_STEPS, activeFilterCount, applyFilters, emptyFilters, filtersFromProfile, interestOptions, suggestRelax, type DiscoverFilters } from './discoverFilters';


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
          {filteredPosts(h).map((po) => (
            <PostCard key={po.id} post={po} h={h} />
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

const CHIP = (on: boolean): React.CSSProperties => ({
  border: on ? '1px solid #e11d48' : '1px solid #D6CCC2',
  background: on ? '#e11d48' : '#fff',
  color: on ? '#fff' : '#44403C',
  borderRadius: 999,
  padding: '6px 13px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap'
});

const FIELD_LABEL: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#78716C', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 7 };

const BAR_BTN: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: '#fff',
  border: '1px solid #D6CCC2',
  borderRadius: 999,
  padding: '8px 14px',
  fontSize: 13.5,
  fontWeight: 600,
  color: '#211D1A',
  cursor: 'pointer',
  whiteSpace: 'nowrap'
};

/** A filter-bar control that drops a small panel below itself. */
function BarMenu({ label, active, children }: { label: string; active?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen((v) => !v)} style={{ ...BAR_BTN, borderColor: active ? '#e11d48' : '#D6CCC2', color: active ? '#be123c' : '#211D1A' }}>
        {label}
        <Ic name={open ? 'expand_less' : 'expand_more'} size={17} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 41, background: '#fff', border: '1px solid #EDE6DF', borderRadius: 14, boxShadow: '0 16px 40px -16px rgba(33,29,26,0.3)', padding: 16, minWidth: 262 }}>
            {children}
          </div>
        </>
      )}
    </div>
  );
}

/** Key filters inline, staged until Search is pressed. */
function FilterBar({
  draft,
  setDraft,
  onSearch,
  dirty,
  onOpenAi,
  aiOpen,
  detected,
  locating,
  locError,
  onUseCurrentLocation
}: {
  draft: DiscoverFilters;
  setDraft: (v: DiscoverFilters) => void;
  onSearch: () => void;
  dirty: boolean;
  onOpenAi: () => void;
  aiOpen: boolean;
  detected: DetectedLocation | null;
  locating: boolean;
  locError: string | null;
  onUseCurrentLocation: () => void;
}) {
  const set = (patch: Partial<DiscoverFilters>) => setDraft({ ...draft, ...patch });
  const opts = useMemo(() => interestOptions(14), []);
  const cities = useMemo(() => {
    const seen = new Map<string, { lat: number; lng: number }>();
    for (const x of PROFILES) if (x.lat !== undefined && x.lng !== undefined && !seen.has(x.location)) seen.set(x.location, { lat: x.lat, lng: x.lng });
    return [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, []);
  const d = emptyFilters();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', marginBottom: 14 }}>
      <button
        onClick={onOpenAi}
        style={{
          ...BAR_BTN,
          background: aiOpen ? '#211D1A' : '#F0E9E2',
          color: aiOpen ? '#fff' : '#211D1A',
          border: 'none',
          fontWeight: 700
        }}
      >
        <Ic name="auto_awesome" size={17} />
        AI Search
      </button>

      <BarMenu label={draft.gender === 'anyone' ? 'Show: anyone' : `Show: ${draft.gender}`} active={draft.gender !== d.gender}>
        <div style={FIELD_LABEL}>Show me</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {(['women', 'men', 'anyone'] as const).map((g) => (
            <button key={g} onClick={() => set({ gender: g })} style={CHIP(draft.gender === g)}>
              {g}
            </button>
          ))}
        </div>
      </BarMenu>

      <BarMenu label={`Age ${draft.minAge}–${draft.maxAge}`} active={draft.minAge !== d.minAge || draft.maxAge !== d.maxAge}>
        <div style={FIELD_LABEL}>
          Age range · {draft.minAge}–{draft.maxAge}
        </div>
        <label style={{ fontSize: 12, color: '#78716C' }}>Minimum</label>
        <input type="range" min={AGE_FLOOR} max={AGE_CEIL} value={draft.minAge} onChange={(e) => set({ minAge: Math.min(Number(e.target.value), draft.maxAge) })} style={{ width: '100%', accentColor: '#e11d48' }} />
        <label style={{ fontSize: 12, color: '#78716C' }}>Maximum</label>
        <input type="range" min={AGE_FLOOR} max={AGE_CEIL} value={draft.maxAge} onChange={(e) => set({ maxAge: Math.max(Number(e.target.value), draft.minAge) })} style={{ width: '100%', accentColor: '#e11d48' }} />
      </BarMenu>

      <BarMenu label={draft.originLabel ? `${draft.originLabel.split(',')[0]}${draft.radius ? ` · ${draft.radius} mi` : ''}` : 'Anywhere'} active={!!draft.originLabel}>
        <div style={FIELD_LABEL}>Near</div>

        {/* Precise location is requested only by this click — never on load. */}
        <button
          onClick={onUseCurrentLocation}
          disabled={locating}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            width: '100%',
            background: 'none',
            border: 'none',
            borderRadius: 9,
            padding: '9px 8px',
            marginBottom: 6,
            fontSize: 14,
            fontWeight: 600,
            color: locating ? '#A8A29E' : '#0369a1',
            cursor: locating ? 'default' : 'pointer',
            textAlign: 'left'
          }}
        >
          <Ic name="near_me" size={18} />
          {locating ? 'Locating…' : 'Current location'}
        </button>
        {locError && !locating && (
          <div style={{ fontSize: 12, color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 9, padding: '8px 10px', margin: '0 0 10px', lineHeight: 1.45 }}>{locError}</div>
        )}
        {detected && !locating && !locError && (
          <div style={{ fontSize: 11.5, color: '#A8A29E', margin: '-2px 0 10px 8px', lineHeight: 1.45 }}>
            {detected.source === 'gps' ? 'From your device' : 'Estimated from your connection'} · nearest members are in {detected.label}
            {detected.offBy >= 1 ? `, ${Math.round(detected.offBy)} mi away` : ''}
          </div>
        )}

        <div style={{ ...FIELD_LABEL, marginTop: 2 }}>Or pick a city</div>
        <select
          value={draft.originLabel ?? ''}
          onChange={(e) => {
            const city = cities.find(([name]) => name === e.target.value);
            set(city ? { originLabel: city[0], originLat: city[1].lat, originLng: city[1].lng, radius: draft.radius || 100 } : { originLabel: undefined, originLat: undefined, originLng: undefined, radius: 0 });
          }}
          style={{ width: '100%', border: '1px solid #D6CCC2', borderRadius: 10, padding: '8px 10px', fontSize: 13.5, background: '#fff' }}
        >
          <option value="">Anywhere in the US</option>
          {cities.map(([name]) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        {draft.originLabel && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {RADIUS_STEPS.map((r) => (
              <button key={r} onClick={() => set({ radius: r })} style={{ ...CHIP(draft.radius === r), padding: '5px 11px', fontSize: 12.5 }}>
                {r === 0 ? 'Any' : `${r} mi`}
              </button>
            ))}
          </div>
        )}
      </BarMenu>

      <BarMenu label="Lifestyle" active={draft.kids !== d.kids || draft.smoking !== d.smoking || draft.drinking !== d.drinking || draft.education !== d.education}>
        <div style={FIELD_LABEL}>Children</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
          {([['any', 'Either'], ['has', 'Has kids'], ['none', 'No kids']] as const).map(([v, label]) => (
            <button key={v} onClick={() => set({ kids: v })} style={CHIP(draft.kids === v)}>
              {label}
            </button>
          ))}
        </div>
        <div style={FIELD_LABEL}>Smoking</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
          {([['any', 'Either'], ['no', 'Non-smokers']] as const).map(([v, label]) => (
            <button key={v} onClick={() => set({ smoking: v })} style={CHIP(draft.smoking === v)}>
              {label}
            </button>
          ))}
        </div>
        <div style={FIELD_LABEL}>Drinking</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
          {([['any', 'Either'], ['not-regularly', 'Not regularly'], ['never', 'Never']] as const).map(([v, label]) => (
            <button key={v} onClick={() => set({ drinking: v })} style={CHIP(draft.drinking === v)}>
              {label}
            </button>
          ))}
        </div>
        <div style={FIELD_LABEL}>Education</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {([['any', 'Any'], ['college', 'College+'], ['grad', 'Grad school']] as const).map(([v, label]) => (
            <button key={v} onClick={() => set({ education: v })} style={CHIP(draft.education === v)}>
              {label}
            </button>
          ))}
        </div>
      </BarMenu>

      <BarMenu label={draft.interests.length ? `Interests · ${draft.interests.length}` : 'Interests'} active={draft.interests.length > 0}>
        <div style={FIELD_LABEL}>Shares at least one</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', maxWidth: 300 }}>
          {opts.map((i) => (
            <button
              key={i}
              onClick={() => set({ interests: draft.interests.includes(i) ? draft.interests.filter((x) => x !== i) : [...draft.interests, i] })}
              style={{ ...CHIP(draft.interests.includes(i)), fontSize: 12.5, padding: '5px 11px' }}
            >
              {i}
            </button>
          ))}
        </div>
      </BarMenu>

      <button
        onClick={onSearch}
        className="hvb-rosedeep"
        style={{ background: dirty ? '#e11d48' : '#F0E9E2', color: dirty ? '#fff' : '#A8A29E', border: 'none', borderRadius: 999, padding: '9px 22px', fontSize: 14, fontWeight: 700, cursor: dirty ? 'pointer' : 'default' }}
      >
        Search
      </button>

      {activeFilterCount(draft) > 0 && (
        <button onClick={() => setDraft(emptyFilters())} style={{ background: 'none', border: 'none', color: '#e11d48', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Clear all
        </button>
      )}
    </div>
  );
}

/** Grid card: photo on top, then the facts the filters act on. */
function GridCard({ h, p, miles }: { h: H; p: Profile; miles?: number }) {
  const liked = h.liked.includes(p.id);
  const matched = h.matched.includes(p.id);
  const isParent = !!p.children && p.children !== 'None' && !/^no\b/i.test(p.children);
  return (
    <div style={{ background: '#fff', border: '1px solid #EDE6DF', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => h.openDetail(p.id)}>
        <img src={p.image} alt={p.name} loading="lazy" style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block', background: '#F0E9E2' }} />
        {matched && (
          <span style={{ position: 'absolute', top: 8, left: 8, background: '#e11d48', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 9px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Ic name="favorite" fill size={11} />
            Mutual match
          </span>
        )}
        {!matched && miles !== undefined && (
          <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(33,29,26,0.8)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 9px', borderRadius: 6 }}>
            {miles < 1 ? 'Same city' : `${Math.round(miles)} mi`}
          </span>
        )}
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              h.doLike(p.id);
            }}
            aria-label={`Like ${p.name}`}
            title="Like"
            style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ic name="favorite" fill={liked} size={16} color={liked ? '#e11d48' : '#57534E'} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              h.passProfile(p.id);
            }}
            aria-label={`Dislike ${p.name}`}
            title="Dislike"
            style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ic name="close" size={16} color="#57534E" />
          </button>
        </div>
      </div>
      <div style={{ padding: '11px 13px 13px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {p.name}, {p.age}
        </div>
        <div style={{ fontSize: 13, color: '#57534E', marginTop: 5, display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          <span>{isParent ? 'Has kids' : 'No kids'}</span>
          <span aria-hidden>·</span>
          <span>Smokes: {p.smoking ?? '—'}</span>
          <span aria-hidden>·</span>
          <span>Drinks: {p.drinking ?? '—'}</span>
        </div>
        <div style={{ fontSize: 13, color: '#78716C', marginTop: 3 }}>{p.location}</div>
        {p.education && <div style={{ fontSize: 12, color: '#A8A29E', marginTop: 3 }}>{p.education}</div>}
        <div style={{ fontSize: 12, color: '#57534E', marginTop: 8, borderTop: '1px solid #F5F1ED', paddingTop: 8 }}>{p.interests.slice(0, 3).join(' · ')}</div>
      </div>
    </div>
  );
}

/** Right-hand sheet running the same matchmaker conversation, wired to the grid. */
function AiSearchSheet({ h, onClose, onFilters }: { h: H; onClose: () => void; onFilters: (p: UserProfile) => void }) {
  const lastSeen = useRef(h.aiMsgs.length);
  useEffect(() => {
    if (h.aiMsgs.length !== lastSeen.current) {
      lastSeen.current = h.aiMsgs.length;
      onFilters(h.userProfile);
    }
  }, [h.aiMsgs.length, h.userProfile, onFilters]);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(20,16,14,0.35)', zIndex: 60 }} />
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(430px, 100vw)',
          background: '#FAF7F4',
          borderLeft: '1px solid #EDE6DF',
          zIndex: 61,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-14px 0 40px -20px rgba(33,29,26,0.4)'
        }}
      >
        <div style={{ background: '#211D1A', color: '#fff', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Ic name="auto_awesome" size={19} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>AI Search</div>
            <div style={{ fontSize: 12, color: '#A8A29E' }}>Describe who you want — I&apos;ll filter the results</div>
          </div>
          <button onClick={onClose} aria-label="Close AI Search" style={{ background: 'rgba(255,255,255,0.14)', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ic name="close" size={17} color="#fff" />
          </button>
        </div>
        <MatchmakerConversation h={h} scrollId="aiSheetScroll" />
      </aside>
    </>
  );
}

const PAGE = 24;

function DiscoverTab({ h }: { h: H }) {
  const [draft, setDraft] = useState<DiscoverFilters>(emptyFilters);
  const [applied, setApplied] = useState<DiscoverFilters>(emptyFilters);
  const [shown, setShown] = useState(PAGE);
  const [aiOpen, setAiOpen] = useState(false);
  const [detected, setDetected] = useState<DetectedLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const results = useMemo(() => applyFilters(applied, h.hidden), [applied, h.hidden]);
  const relax = useMemo(() => (results.length === 0 && activeFilterCount(applied) > 0 ? suggestRelax(applied, h.hidden) : null), [results.length, applied, h.hidden]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(applied);

  // Coarse IP-based prefill on first load. It fills the draft only — nothing is
  // applied until Search, and no permission prompt is raised.
  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current) return;
    prefilled.current = true;
    let live = true;
    void detectQuietly().then((loc) => {
      if (!live || !loc) return;
      setDetected(loc);
      setDraft((d) => (d.originLabel ? d : { ...d, originLabel: loc.label, originLat: loc.lat, originLng: loc.lng, radius: d.radius || 100 }));
    });
    return () => {
      live = false;
    };
  }, []);

  const useCurrentLocation = useCallback(async () => {
    setLocating(true);
    setLocError(null);
    // Ask the device first; fall back to the coarse estimate if declined.
    const loc = (await detectPrecise()) ?? (await detectByIp());
    setLocating(false);
    if (!loc) {
      setLocError('Could not determine your location — pick a city below.');
      return;
    }
    setDetected(loc);
    const next = { originLabel: loc.label, originLat: loc.lat, originLng: loc.lng, radius: 100 };
    setDraft((d) => ({ ...d, ...next }));
    setApplied((a) => ({ ...a, ...next }));
    setShown(PAGE);
  }, []);

  const applyFromAi = useCallback((p: UserProfile) => {
    setApplied((prev) => {
      const next = filtersFromProfile(p, prev);
      setDraft(next);
      return next;
    });
    setShown(PAGE);
  }, []);

  const visible = results.slice(0, shown);

  return (
    <div>
      <FilterBar
        draft={draft}
        setDraft={setDraft}
        dirty={dirty}
        onSearch={() => {
          setApplied(draft);
          setShown(PAGE);
        }}
        onOpenAi={() => setAiOpen((v) => !v)}
        aiOpen={aiOpen}
        detected={detected}
        locating={locating}
        locError={locError}
        onUseCurrentLocation={useCurrentLocation}
      />

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
          {results.length.toLocaleString()} {results.length === 1 ? 'member' : 'members'}
          {applied.originLabel && applied.radius > 0 ? ` within ${applied.radius} mi of ${applied.originLabel.split(',')[0]}` : ''}
        </h2>
        {dirty && <span style={{ fontSize: 13, color: '#be123c', fontWeight: 600 }}>Filters changed — press Search to apply</span>}
      </div>

      {results.length === 0 ? (
        <div style={{ background: '#fff', border: '1.5px dashed #D6CCC2', borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
          <Ic name="search_off" size={40} color="#D6CCC2" />
          <p style={{ color: '#44403C', fontSize: 16, fontWeight: 600, margin: '12px 0 4px' }}>No one matches all of those filters</p>
          <p style={{ color: '#78716C', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
            {relax ? `Widening ${relax.label} would show ${relax.count.toLocaleString()} ${relax.count === 1 ? 'person' : 'people'}.` : 'Try clearing a filter or two.'}
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(232px,1fr))', gap: 16 }}>
            {visible.map(({ profile, miles }) => (
              <GridCard key={profile.id} h={h} p={profile} miles={miles} />
            ))}
          </div>
          {shown < results.length && (
            <div style={{ textAlign: 'center', padding: '22px 0 4px' }}>
              <button onClick={() => setShown((n) => n + PAGE)} className="hvb-cream" style={{ background: '#fff', border: '1px solid #D6CCC2', borderRadius: 999, padding: '11px 26px', fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#211D1A' }}>
                Show more · {visible.length} of {results.length.toLocaleString()}
              </button>
            </div>
          )}
        </>
      )}

      {aiOpen && <AiSearchSheet h={h} onClose={() => setAiOpen(false)} onFilters={applyFromAi} />}
    </div>
  );
}

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

/** The matchmaker conversation: message list, inline results, composer. Shared by
 *  the Matchmaker tab and the Discover AI Search sheet so they behave identically. */
function MatchmakerConversation({ h, scrollId = 'aiScroll' }: { h: H; scrollId?: string }) {
  return (
    <>
      <div id={scrollId} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18, padding: '12px 12px 8px' }}>
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
                <div style={{ maxWidth: me ? '82%' : '100%', flex: me ? '0 1 auto' : 1, minWidth: 0 }}>
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

                  {!me && m.filters && m.filters.length > 0 && (
                    <div style={{ fontSize: 12.5, color: '#57534E', margin: '9px 0 0', lineHeight: 1.5 }}>
                      {typeof m.total === 'number' && (
                        <strong style={{ fontWeight: 700 }}>
                          {m.total} {m.total === 1 ? 'member' : 'members'}
                        </strong>
                      )}{' '}
                      matched on{' '}
                      {m.filters.map((f, k) => (
                        <span key={k} style={{ display: 'inline-block', background: '#F5F5F4', border: '1px solid #EDE6DF', borderRadius: 999, padding: '2px 9px', margin: '3px 4px 0 0', fontSize: 12 }}>
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

      <div style={{ padding: 12, borderTop: '1px solid #EDE6DF', display: 'flex', gap: 8, background: '#FAF7F4' }}>
        <input
          type="text"
          placeholder="Tell the matchmaker what you're looking for..."
          value={h.aiDraft}
          onChange={(e) => h.setAiDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') h.sendAi();
          }}
          className="fc-rose"
          style={{ flex: 1, minWidth: 0, background: '#fff', border: '1px solid #D6CCC2', borderRadius: 999, padding: '11px 18px', fontSize: 14.5, outline: 'none' }}
        />
        <button onClick={h.sendAi} className="hvb-rosedeep" aria-label="Send" style={{ background: '#e11d48', color: '#fff', border: 'none', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Ic name="send" size={20} />
        </button>
      </div>
    </>
  );
}

function MatchmakerTab({ h }: { h: H }) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 190px)', minHeight: 520 }}>
      <p style={{ fontSize: 11.5, color: '#A8A29E', lineHeight: 1.5, margin: '0 0 8px', textAlign: 'center' }}>
        Your matchmaker is AI-assisted. Preferences you state — who you want to meet, ages, city — are applied as filters by Haply, not left to the model.
      </p>
      <MatchmakerConversation h={h} />
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
          <img src={generatedAvatarDataUri(h.user?.id || h.userName, h.userInitial)} alt="" style={{ width: 92, height: 92, borderRadius: '50%', flexShrink: 0 }} />
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
