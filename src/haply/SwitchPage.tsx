import { useEffect } from 'react';
import type { H } from './HaplyApp';
import { metroListSentence } from './launchMarkets';
import { noteSource } from './referral';
import { Ic, Logo, serif } from './ui';

/**
 * Landing page for people whose dating site closed or is closing.
 *
 * EliteSingles shut down on 30 April 2026 and Spark Networks — parent of
 * SilverSingles, EliteSingles, JDate and ChristianMingle — entered insolvency
 * proceedings in Germany in January 2026. That has displaced a large number of
 * paying, serious-intent, 45+ daters who match this product exactly, and who
 * are actively looking for somewhere to go. They are the cheapest high-intent
 * users this business will ever get, and the window is measured in months.
 *
 * The copy stays factual about the closures and honest about our own size.
 * Overstating a member base to people who just got burned by a site that
 * vanished would be a very short-lived trick — and the empty-city problem is
 * exactly what the launch-metro focus exists to solve.
 */

const CHECK = ({ on }: { on: boolean }) => <Ic name={on ? 'check_circle' : 'remove'} fill={on} size={19} color={on ? '#16a34a' : '#D6CCC2'} />;

const ROWS: { label: string; haply: boolean; note: string }[] = [
  { label: 'Divorce verified against a document', haply: true, note: 'Optional, free, and shown as a badge' },
  { label: 'Built only for divorced and separated people', haply: true, note: 'Not a filter bolted onto a general app' },
  { label: 'Co-parenting and custody filters', haply: true, note: 'Custody split, and whether either of you wants more children' },
  { label: 'A community you can use before you date', haply: true, note: 'Dating stays switched off until you say otherwise' },
  { label: 'No swiping', haply: true, note: 'Search and filters, like a grown-up' }
];

export function SwitchPage({ h }: { h: H }) {
  useEffect(() => {
    noteSource('switch');
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F4' }}>
      <div style={{ borderBottom: '1px solid #EDE6DF' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '16px clamp(16px,4vw,32px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={h.goHome} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Logo size={26} color="#e11d48" />
            <span style={{ fontFamily: serif, fontSize: 19, fontWeight: 700, color: '#211D1A' }}>Haply</span>
          </button>
          <button onClick={h.openLogin} className="hvc-rose" style={{ background: 'none', border: 'none', color: '#44403C', fontSize: 14, cursor: 'pointer', padding: 0 }}>
            Log in
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '56px clamp(16px,4vw,32px) 72px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FFF1F2', border: '1px solid #FECDD3', color: '#be123c', padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
          <Ic name="swap_horiz" size={16} />
          For members of sites that are closing
        </div>

        <h1 style={{ fontFamily: serif, fontSize: 'clamp(32px,5.5vw,46px)', fontWeight: 600, lineHeight: 1.1, margin: '0 0 18px', letterSpacing: '-0.01em' }}>
          Your dating site is closing. You don't have to start over alone.
        </h1>

        <p style={{ fontSize: 17, color: '#44403C', lineHeight: 1.7, margin: '0 0 16px' }}>
          EliteSingles closed on 30 April 2026, and its parent company — which also runs SilverSingles, JDate and ChristianMingle — entered insolvency
          proceedings earlier this year. If you were paying one of them to meet someone serious, that's a genuinely annoying place to be left.
        </p>
        <p style={{ fontSize: 17, color: '#44403C', lineHeight: 1.7, margin: '0 0 32px' }}>
          Haply is built for one group of people: those who are divorced or separated. Not a general dating app with a filter for it — the whole product
          assumes it.
        </p>

        <div style={{ background: '#fff', border: '1px solid #EDE6DF', borderRadius: 18, padding: 'clamp(20px,4vw,28px)', marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 18px' }}>What you get here</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {ROWS.map((r) => (
              <div key={r.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <CHECK on={r.haply} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#211D1A' }}>{r.label}</div>
                  <div style={{ fontSize: 13.5, color: '#78716C', marginTop: 2, lineHeight: 1.5 }}>{r.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Being straight about our size. The audience for this page has just
            been let down by a platform; overselling would be the fastest way to
            lose them a second time. */}
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 16, padding: 'clamp(18px,4vw,24px)', marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ic name="info" fill size={19} color="#b45309" />
            Where we honestly are
          </h2>
          <p style={{ fontSize: 14.5, color: '#44403C', lineHeight: 1.65, margin: 0 }}>
            We're new, and we're open in {metroListSentence()} only. We'd rather be genuinely useful in a few cities than thin everywhere — a dating site with
            nobody near you is the thing you've just experienced. If you're somewhere else, leave your email and we'll tell you when we reach you. Joining is
            free, and there's nothing to cancel.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={h.goGetStarted}
            className="hvb-rosedeep"
            style={{ background: '#e11d48', color: '#fff', border: 'none', borderRadius: 999, padding: '15px 30px', fontSize: 16.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            Join free
            <Ic name="arrow_forward" size={20} />
          </button>
          <button onClick={h.goCommunity} className="hvb-cream" style={{ background: '#fff', border: '1px solid #D6CCC2', borderRadius: 999, padding: '15px 26px', fontSize: 16, fontWeight: 600, color: '#211D1A', cursor: 'pointer' }}>
            Look around first
          </button>
        </div>

        <p style={{ fontSize: 12.5, color: '#A8A29E', lineHeight: 1.6, margin: '28px 0 0' }}>
          Haply is not affiliated with, endorsed by, or connected to EliteSingles, SilverSingles, Spark Networks or any of their brands. Company names are used
          only to describe publicly reported events.
        </p>
      </div>
    </div>
  );
}
