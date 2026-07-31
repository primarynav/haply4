import type { CSSProperties } from 'react';
import type { H } from './HaplyApp';
import { STAGES } from './journey';
import { metroListSentence } from './launchMarkets';
import { Ic, serif } from './ui';

const selOn = { background: '#FFF1F2', border: '2px solid #e11d48', color: '#be123c' };
const selOff = { background: '#fff', border: '2px solid #EDE6DF', color: '#44403C' };

const errText: CSSProperties = { fontSize: 13, color: '#dc2626', margin: '6px 0 0' };

function pickStyle(active: boolean): CSSProperties {
  return active ? selOn : selOff;
}

/**
 * Shown when a ZIP falls outside every launch metro. We take an email instead of
 * creating an account into an empty city — and the list is how the next metro
 * gets chosen from real demand rather than a hunch.
 */
function OutOfArea({ h }: { h: H }) {
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(h.gsWaitlistEmail.trim());
  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F4', display: 'flex', justifyContent: 'center', padding: '64px 16px' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ background: '#fff', border: '1px solid #EDE6DF', borderRadius: 20, boxShadow: '0 20px 40px -20px rgba(33,29,26,0.15)', padding: 32 }}>
          {h.gsWaitlistDone ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Ic name="check_circle" fill size={26} color="#16a34a" />
                <h1 style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, margin: 0 }}>You're on the list</h1>
              </div>
              <p style={{ color: '#57534E', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
                We'll email you the moment Haply opens near you. We open a new city when enough people there are waiting — so you've just made yours more
                likely.
              </p>
            </>
          ) : (
            <>
              <h1 style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, margin: '0 0 10px' }}>Dating isn't open near you yet</h1>
              <p style={{ color: '#57534E', fontSize: 15, lineHeight: 1.6, margin: '0 0 16px' }}>
                Dating needs enough people nearby to be worth anything, so it opens city by city — right now {metroListSentence()}. The community doesn't have
                that problem: it works wherever you are, and you can join it today.
              </p>
              <button
                onClick={h.gsJoinAnyway}
                className="hvb-rosedeep"
                style={{ width: '100%', background: '#e11d48', color: '#fff', border: 'none', borderRadius: 999, padding: 14, fontSize: 16, fontWeight: 600, cursor: 'pointer', marginBottom: 18 }}
              >
                Join the community — free
              </button>
              <p style={{ color: '#57534E', fontSize: 14, lineHeight: 1.6, margin: '0 0 12px' }}>
                We'll turn dating on for you the moment it reaches your area. Signing up puts your ZIP on that list — or just leave your email if you'd rather
                wait.
              </p>
              <input
                type="email"
                placeholder="you@example.com"
                value={h.gsWaitlistEmail}
                onChange={(e) => h.setGsWaitlistEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && emailOk) h.gsWaitlistSubmit();
                }}
                className="fcb-rose"
                style={{ width: '100%', boxSizing: 'border-box', background: '#FAF7F4', border: '1.5px solid transparent', borderRadius: 12, padding: '12px 14px', fontSize: 15, outline: 'none', marginBottom: 12 }}
              />
              <button
                onClick={h.gsWaitlistSubmit}
                disabled={!emailOk}
                className="hvb-rosedeep"
                style={{ width: '100%', background: emailOk ? '#e11d48' : '#FECDD3', color: '#fff', border: 'none', borderRadius: 999, padding: 14, fontSize: 16, fontWeight: 600, cursor: emailOk ? 'pointer' : 'default' }}
              >
                Tell me when you're here
              </button>
            </>
          )}
          <button onClick={h.gsBackToPostal} className="hvc-rose" style={{ background: 'none', border: 'none', color: '#78716C', fontSize: 14, cursor: 'pointer', padding: '16px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Ic name="arrow_back" size={17} />
            Use a different ZIP code
          </button>
        </div>
      </div>
    </div>
  );
}

export function GetStarted({ h }: { h: H }) {
  // Dating questions only appear once someone has said they're actually open to
  // it. Asking a person six weeks out of a separation who they'd like to date
  // is the thing every other app gets wrong about this audience.
  const showDating = (h.gsIntent === 'dating' || h.gsIntent === 'both') && h.gsStage === 'ready';
  if (h.gsOutOfArea) return <OutOfArea h={h} />;
  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F4' }}>
      <div style={{ borderBottom: '1px solid #EDE6DF', background: '#FAF7F4' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={h.goHome} className="hvc-rose" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#57534E', fontSize: 15, cursor: 'pointer', padding: 0 }}>
            <Ic name="arrow_back" size={20} />
            <span>Back</span>
          </button>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#166534', fontWeight: 600 }}>
            <Ic name="verified" fill size={15} />
            The divorced dating community · 21+
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 16px 72px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ fontFamily: serif, fontSize: 32, fontWeight: 600, margin: '0 0 8px' }}>Join the community</h1>
            <p style={{ color: '#57534E', margin: 0, fontSize: 16 }}>Free forever. Dating is optional — always.</p>
          </div>
          <div style={{ background: '#fff', border: '1px solid #EDE6DF', borderRadius: 20, boxShadow: '0 20px 40px -20px rgba(33,29,26,0.15)', padding: 32, display: 'flex', flexDirection: 'column', gap: 26 }}>
            <div>
              <label style={{ color: '#211D1A', marginBottom: 12, display: 'block', fontSize: 16, fontWeight: 600 }}>I'm here for…</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={() => h.pickIntent('community')} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, textAlign: 'left', cursor: 'pointer', fontSize: 15, transition: 'all .15s', ...pickStyle(h.gsIntent === 'community'), display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Ic name="diversity_1" fill size={20} />
                  <span style={{ flex: 1 }}>
                    <strong>Community</strong> — support, groups & meetups
                    <span style={{ display: 'block', fontSize: 12, color: '#78716C', fontWeight: 400 }}>Most people start here</span>
                  </span>
                </button>
                <button onClick={() => h.pickIntent('dating')} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, textAlign: 'left', cursor: 'pointer', fontSize: 15, transition: 'all .15s', ...pickStyle(h.gsIntent === 'dating'), display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Ic name="favorite" fill size={20} />
                  <span>
                    <strong>Dating</strong> — I'm ready to meet someone
                  </span>
                </button>
                <button onClick={() => h.pickIntent('both')} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, textAlign: 'left', cursor: 'pointer', fontSize: 15, transition: 'all .15s', ...pickStyle(h.gsIntent === 'both'), display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Ic name="all_inclusive" fill size={20} />
                  <span>
                    <strong>Both</strong> — community now, open to dating
                  </span>
                </button>
              </div>
              {h.gsErr.intent && <p style={errText}>Choose what brings you here</p>}
            </div>
            <div style={{ borderTop: '1px dashed #EDE6DF', paddingTop: 22 }}>
              <label style={{ color: '#211D1A', marginBottom: 4, display: 'block', fontSize: 16, fontWeight: 600 }}>Where are you in all this?</label>
              <p style={{ fontSize: 13, color: '#78716C', margin: '0 0 12px', lineHeight: 1.5 }}>
                There's no right answer, and you can change it whenever. It just decides what we put in front of you.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {STAGES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => h.pickStage(s.value)}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, textAlign: 'left', cursor: 'pointer', fontSize: 15, transition: 'all .15s', ...pickStyle(h.gsStage === s.value), display: 'flex', alignItems: 'flex-start', gap: 12 }}
                  >
                    <Ic name={s.icon} fill size={20} style={{ marginTop: 1, flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>
                      <strong>{s.label}</strong>
                      <span style={{ display: 'block', fontSize: 12.5, color: '#78716C', fontWeight: 400, lineHeight: 1.45, marginTop: 2 }}>{s.blurb}</span>
                    </span>
                  </button>
                ))}
              </div>
              {h.gsErr.stage && <p style={errText}>Let us know where you're at</p>}
              {h.gsStage && h.gsStage !== 'ready' && (
                <p style={{ fontSize: 13, color: '#166534', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '10px 12px', margin: '12px 0 0', lineHeight: 1.5 }}>
                  We'll keep dating switched off for now. The community is where most people start — turn dating on yourself whenever you're ready.
                </p>
              )}
            </div>
            {showDating && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22, borderTop: '1px dashed #EDE6DF', paddingTop: 22 }}>
                <div>
                  <label style={{ color: '#211D1A', marginBottom: 10, display: 'block', fontSize: 15, fontWeight: 600 }}>I am a divorced…</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button onClick={() => h.pickGender('woman')} style={{ padding: 13, borderRadius: 12, textAlign: 'center', cursor: 'pointer', fontSize: 15, transition: 'all .15s', ...pickStyle(h.gsGender === 'woman') }}>
                      Woman
                    </button>
                    <button onClick={() => h.pickGender('man')} style={{ padding: 13, borderRadius: 12, textAlign: 'center', cursor: 'pointer', fontSize: 15, transition: 'all .15s', ...pickStyle(h.gsGender === 'man') }}>
                      Man
                    </button>
                  </div>
                  {h.gsErr.gender && <p style={errText}>Please select your gender</p>}
                </div>
                <div>
                  <label style={{ color: '#211D1A', marginBottom: 10, display: 'block', fontSize: 15, fontWeight: 600 }}>Interested in divorced…</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <button onClick={() => h.pickLooking('woman')} style={{ padding: 13, borderRadius: 12, textAlign: 'center', cursor: 'pointer', fontSize: 15, transition: 'all .15s', ...pickStyle(h.gsLooking === 'woman') }}>
                      Women
                    </button>
                    <button onClick={() => h.pickLooking('man')} style={{ padding: 13, borderRadius: 12, textAlign: 'center', cursor: 'pointer', fontSize: 15, transition: 'all .15s', ...pickStyle(h.gsLooking === 'man') }}>
                      Men
                    </button>
                    <button onClick={() => h.pickLooking('any')} style={{ padding: 13, borderRadius: 12, textAlign: 'center', cursor: 'pointer', fontSize: 15, transition: 'all .15s', ...pickStyle(h.gsLooking === 'any') }}>
                      Anyone
                    </button>
                  </div>
                  {h.gsErr.looking && <p style={errText}>Please select who you're interested in</p>}
                </div>
              </div>
            )}
            <div>
              <label style={{ color: '#211D1A', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600 }}>
                <Ic name="location_on" size={17} />
                Postal code
              </label>
              <input
                type="text"
                placeholder="e.g., 98101"
                value={h.gsPostal}
                onChange={(e) => h.setGsPostal(e.target.value)}
                className="fcb-rose"
                style={{ width: '100%', boxSizing: 'border-box', background: '#FAF7F4', border: `1.5px solid ${h.gsErr.postal ? '#ef4444' : 'transparent'}`, borderRadius: 12, padding: '12px 14px', fontSize: 15, outline: 'none' }}
              />
              {h.gsErr.postal && <p style={errText}>Please enter a valid 5-digit ZIP code</p>}
              <p style={{ fontSize: 13, color: '#78716C', margin: '6px 0 0', lineHeight: 1.5 }}>
                We're building city by city — open now in {metroListSentence()}. Anywhere else, we'll add you to the list.
              </p>
            </div>
            <button
              onClick={h.toggleGsConfirm}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                background: h.gsConfirm ? '#F0FDF4' : '#FAF7F4',
                border: `1.5px solid ${h.gsErr.confirm ? '#ef4444' : h.gsConfirm ? '#BBF7D0' : '#EDE6DF'}`,
                borderRadius: 12,
                padding: '14px 16px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all .15s'
              }}
            >
              <Ic name={h.gsConfirm ? 'check_circle' : 'radio_button_unchecked'} fill={h.gsConfirm} size={22} color={h.gsConfirm ? '#16a34a' : '#A8A29E'} style={{ marginTop: 1 }} />
              <span style={{ fontSize: 14, color: '#44403C', lineHeight: 1.5 }}>
                I confirm I'm <strong>21 or older</strong> and <strong>divorced or legally separated</strong>. Haply is built on trust — being honest here keeps this community real.
              </span>
            </button>
            {h.gsErr.confirm && <p style={{ ...errText, margin: '-16px 0 0' }}>You must confirm to join — it's what keeps this community real</p>}
            <button onClick={h.gsContinue} className="hvb-rosedeep" style={{ width: '100%', background: '#e11d48', color: '#fff', border: 'none', borderRadius: 999, padding: 15, fontSize: 17, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span>Continue</span>
              <Ic name="arrow_forward" size={20} />
            </button>
          </div>
          <p style={{ fontSize: 13, color: '#78716C', textAlign: 'center', margin: '16px 0 0', lineHeight: 1.6 }}>
            Next step: create your free account with Google, Facebook, or Apple.
            <br />
            Trust and privacy first — your details are never shown publicly.
          </p>
        </div>
      </div>
    </div>
  );
}
