import { useEffect, useState } from 'react';
import { EVENTS, GROUPS, HERO_SLIDES } from './data';
import type { H } from './HaplyApp';
import { metroCountSentence } from './launchMarkets';
import { Ic, Logo, serif, usePrefersReducedMotion } from './ui';

const container: React.CSSProperties = { maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px,4vw,32px)' };
const eyebrow: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 };
const h2: React.CSSProperties = { fontFamily: serif, fontSize: 'clamp(30px,4.5vw,42px)', fontWeight: 600, margin: '0 0 14px', lineHeight: 1.15 };

export function Landing({ h }: { h: H }) {
  return (
    <div>
      {/* utility strip */}
      <div style={{ background: '#211D1A', color: '#E7E0DA', padding: '9px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, fontSize: 13 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Ic name="verified" fill size={15} color="#4ade80" />
          Real sign-ins, real people
        </span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span>21+ only</span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span>Moderated for respect</span>
      </div>

      {/* sticky nav */}
      <div style={{ background: '#FAF7F4', borderBottom: '1px solid #EDE6DF', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ ...container, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 68 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={h.goHome}>
            <Logo size={30} color="#e11d48" />
            <div>
              <h1 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>Haply</h1>
              <p style={{ fontSize: 11, color: '#78716C', margin: 0, letterSpacing: '.02em' }}>The divorced dating community</p>
            </div>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }} data-rs-hide="1">
            {(
              [
                ['Community', 'community-anchor'],
                ['City groups', 'groups-anchor'],
                ['Trust & privacy', 'trust-anchor'],
                ['Dating', 'dating-anchor']
              ] as const
            ).map(([label, anchor]) => (
              <button key={anchor} onClick={() => h.scrollAnchor(anchor)} className="hvc-rose" style={{ background: 'none', border: 'none', fontSize: 15, color: '#44403C', cursor: 'pointer', padding: '4px 0' }}>
                {label}
              </button>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={h.openLogin} className="hvb-sand" style={{ background: 'none', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 15, fontWeight: 500, color: '#211D1A', cursor: 'pointer' }}>
              Log in
            </button>
            <button onClick={h.goGetStarted} className="hvb-rosedeep" style={{ background: '#e11d48', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 22px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Join free
            </button>
          </div>
        </div>
      </div>

      {/* hero */}
      <section style={{ padding: '72px 0 64px', background: '#FAF7F4' }}>
        <div style={{ ...container, display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 56, alignItems: 'center' }} data-rs="1">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', padding: '7px 14px', borderRadius: 999, alignSelf: 'flex-start', fontSize: 13, fontWeight: 600 }}>
              <Ic name="verified" fill size={15} />
              Divorce verified · 21+ · {metroCountSentence()}
            </div>
            <h1 style={{ fontFamily: serif, fontSize: 'clamp(38px,7vw,62px)', fontWeight: 600, lineHeight: 1.05, margin: 0, letterSpacing: '-0.01em' }}>
              Divorced.
              <br />
              Not done.
            </h1>
            {/* Verification leads. It is the one concrete, checkable claim we can
                make in a category where nobody believes anything — and the only
                thing here a general dating app can't say. Wording stays inside
                the limits set in the Terms: a reviewed document, nothing more. */}
            <p style={{ fontSize: 19, color: '#57534E', lineHeight: 1.65, margin: 0, maxWidth: 520 }}>
              The dating community where members can <strong style={{ color: '#211D1A' }}>prove they're actually divorced</strong>. Upload your decree, get a
              verified badge, and stop wondering. Join free for the community — date only when you're ready.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button onClick={h.goGetStarted} className="hvb-rosedeep" style={{ background: '#e11d48', color: '#fff', border: 'none', borderRadius: 999, padding: '15px 32px', fontSize: 17, fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 24px rgba(225,29,72,0.25)' }}>
                Join the community — free
              </button>
              <button onClick={() => h.scrollAnchor('dating-anchor')} className="hvb-sand" style={{ background: 'transparent', color: '#211D1A', border: '1.5px solid #D6CCC2', borderRadius: 999, padding: '14px 28px', fontSize: 17, fontWeight: 500, cursor: 'pointer' }}>
                I'm ready to date
              </button>
            </div>
            <p style={{ fontSize: 13, color: '#78716C', margin: 0, lineHeight: 1.6 }}>
              Free — no credit card, ever. Verification is optional and free too; your document is never shown to other members, is only ever opened by a person if you ask us to review a decision, and is deleted after 90 days.
            </p>
          </div>
          <HeroShowcase />
        </div>
      </section>

      {/* value band */}
      <section style={{ background: '#211D1A', color: '#FAF7F4', padding: '36px 0' }}>
        <div style={{ ...container, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, textAlign: 'center' }} data-rs-2="1">
          {(
            [
              // Each of these has to be something the product actually does.
              // "Human review" used to sit here and there is no human review.
              ['Verified', 'members can prove their divorce'],
              ['Free', 'community membership, forever'],
              ['No swiping', 'search and filters, not a card game'],
              ['Private', 'your document is never shown to other members']
            ] as const
          ).map(([num, label]) => (
            <div key={label}>
              <div style={{ fontFamily: serif, fontSize: 34, fontWeight: 600 }}>{num}</div>
              <div style={{ fontSize: 14, color: '#A8A29E' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* community preview */}
      <section id="community-anchor" style={{ padding: '88px 0', background: '#FAF7F4' }}>
        <div style={container}>
          <div style={{ maxWidth: 640, marginBottom: 40 }}>
            <div style={eyebrow}>The community</div>
            <h2 style={h2}>You're among people who get it</h2>
            <p style={{ fontSize: 18, color: '#57534E', lineHeight: 1.6, margin: 0 }}>
              Co-parenting advice, first-date nerves, paperwork wins — talk it through with people who've been there. No explaining your story from scratch. Everyone here has one too.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: 20 }}>
            {(
              [
                ['diversity_1', '#FFF1F2', '#e11d48', 'Divorce Support', 'A soft place to land', 'Process the hard days with people who understand — from paperwork to the first holiday on your own.'],
                ['child_care', '#F0FDF4', '#16a34a', 'Co-Parenting', 'Parenting across two homes', 'Schedules, introductions, and raising great kids after divorce — advice from parents living it.'],
                ['favorite', '#FEF3C7', '#b45309', 'Dating Again', 'Ready when you are', 'First-date nerves to new beginnings — cheer each other on. No judgment, no pressure, no deadline.']
              ] as const
            ).map(([icon, iconBg, iconColor, cat, title, body]) => (
              <div key={cat} onClick={h.goCommunity} className="hv-lift" style={{ background: '#fff', border: '1px solid #EDE6DF', borderRadius: 16, padding: 24, cursor: 'pointer', transition: 'all .2s', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: iconBg }}>
                    <Ic name={icon} fill size={20} color={iconColor} />
                  </div>
                  <span style={{ background: '#FFF1F2', color: '#be123c', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, marginLeft: 'auto' }}>{cat}</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 600, margin: 0, lineHeight: 1.35 }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#57534E', margin: 0, lineHeight: 1.6 }}>{body}</p>
                <div style={{ display: 'flex', gap: 6, fontSize: 13, color: '#e11d48', fontWeight: 600, marginTop: 'auto', alignItems: 'center' }}>
                  Join the conversation
                  <Ic name="arrow_forward" size={15} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <button onClick={h.goCommunity} className="hvb-rose50" style={{ background: 'transparent', color: '#e11d48', border: '1.5px solid #FECDD3', borderRadius: 999, padding: '12px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Browse the community →
            </button>
          </div>
        </div>
      </section>

      {/* how it works */}
      <section style={{ padding: '0 0 88px', background: '#FAF7F4' }}>
        <div style={container}>
          <div style={{ background: '#fff', border: '1px solid #EDE6DF', borderRadius: 24, padding: 'clamp(24px,5vw,56px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 40 }}>
            {(
              [
                ['#F0FDF4', '#16a34a', 'verified', 'STEP 1', 'Sign up free in seconds', "Continue with Google, Facebook, or Apple — real accounts keep the community real. Confirm you're 21+ and divorced or separated, and you're in."],
                ['#FFF1F2', '#e11d48', 'diversity_1', 'STEP 2', "Join your city's group", "Post topics, comment, and meet people nearby who've been through it. Community is free — no pressure to date, ever."],
                ['#FEF3C7', '#b45309', 'favorite', 'STEP 3', "Date when you're ready", 'Flip on dating whenever it feels right. Everyone you meet signed up the same way you did — no explaining, no judgment.']
              ] as const
            ).map(([bg, color, icon, step, title, body]) => (
              <div key={step} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ic name={icon} fill size={26} color={color} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#A8A29E' }}>{step}</div>
                <h3 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, margin: 0 }}>{title}</h3>
                <p style={{ fontSize: 15, color: '#57534E', lineHeight: 1.6, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* trust & privacy */}
      <section id="trust-anchor" style={{ background: '#1C2B22', color: '#F2F7F3', padding: '88px 0' }}>
        <div style={{ ...container, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} data-rs="1">
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Trust & privacy</div>
            <h2 style={{ fontFamily: serif, fontSize: 'clamp(30px,4.5vw,42px)', fontWeight: 600, margin: '0 0 18px', lineHeight: 1.15 }}>Built on trust. Designed for privacy.</h2>
            <p style={{ fontSize: 17, color: '#B7C8BC', lineHeight: 1.7, margin: '0 0 28px' }}>
              A community like this only works if it feels safe. That's why every account is tied to a real sign-in, every space is watched over, and your business stays your business.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {(
                [
                  ['task_alt', 'Verified sign-in', 'Every member joins with a real Google, Facebook, or Apple account — no anonymous throwaways.'],
                  // Says only what the product does today: an automated language
                  // check runs on every post. There is no moderation team and no
                  // report queue yet, so neither is claimed here.
                  ['shield_person', 'Automated language screening', 'Every post is checked for unsafe or disrespectful language before it goes up, and members can leave any space at any time.'],
                  ['lock', 'Private by default', 'We never sell your data. What you share on Haply stays on Haply — and daters only see you if you opt in.']
                ] as const
              ).map(([icon, title, body]) => (
                <div key={icon} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <Ic name={icon} fill size={22} color="#4ade80" style={{ marginTop: 1 }} />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 14, color: '#B7C8BC', lineHeight: 1.55 }}>{body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: '#233829', border: '1px solid #2F4A37', borderRadius: 20, padding: 36, maxWidth: 380, width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1C2B22', border: '3px solid #4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Logo size={32} color="#4ade80" />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>Every Haply profile</div>
                  <div style={{ fontSize: 13, color: '#B7C8BC' }}>the same protections, for everyone</div>
                </div>
              </div>
              {(
                [
                  ['verified', 'Real sign-in required', 'Google, Facebook, or Apple ID'],
                  ['badge', '21+ and divorced or separated', 'Confirmed at signup'],
                  ['lock', 'Members-only visibility', 'Your profile is never public on the web']
                ] as const
              ).map(([icon, title, sub], i) => (
                <div key={icon} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#1C2B22', border: '1px solid #2F4A37', borderRadius: 12, padding: '14px 16px', marginBottom: i < 2 ? 12 : 0 }}>
                  <Ic name={icon} fill size={22} color="#4ade80" />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
                    <div style={{ fontSize: 12, color: '#B7C8BC' }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* city groups */}
      <section id="groups-anchor" style={{ padding: '88px 0', background: '#FAF7F4' }}>
        <div style={container}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, gap: 24 }}>
            <div style={{ maxWidth: 560 }}>
              <div style={eyebrow}>City groups</div>
              <h2 style={h2}>Your people, nearby</h2>
              <p style={{ fontSize: 18, color: '#57534E', lineHeight: 1.6, margin: 0 }}>Local groups built around real-world meetups — dinners, hikes, book clubs. Because the best thing after divorce is a full calendar.</p>
            </div>
            <button onClick={h.goGetStarted} className="hvb-ink2" style={{ background: '#211D1A', color: '#fff', border: 'none', borderRadius: 999, padding: '13px 26px', fontSize: 15, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Find your city
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: 20, marginBottom: 24 }}>
            {GROUPS.map((g) => (
              <div key={g.city} onClick={() => h.pickGroup(g.city)} className="hv-groupcard" style={{ background: '#fff', border: '1px solid #EDE6DF', borderRadius: 16, padding: '22px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'all .2s' }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ic name="location_on" fill size={22} color="#e11d48" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{g.city}</div>
                  <div style={{ fontSize: 13, color: '#78716C' }}>{g.vibe}</div>
                </div>
                <Ic name="arrow_forward" size={20} color="#A8A29E" />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {EVENTS.map((ev) => (
              <div key={ev.name} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F0E9E2', borderRadius: 999, padding: '9px 18px 9px 12px' }}>
                <Ic name={ev.icon} fill size={18} color="#b45309" />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{ev.name}</span>
                <span style={{ fontSize: 13, color: '#78716C' }}>{ev.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* dating */}
      <section id="dating-anchor" style={{ padding: '0 0 88px', background: '#FAF7F4' }}>
        <div style={{ ...container, display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 64, alignItems: 'center' }} data-rs="1">
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 20, overflow: 'hidden', aspectRatio: '4/4.6', boxShadow: '0 30px 60px -20px rgba(33,29,26,0.3)' }}>
              <img src="/images/hero-1.jpg" alt="Couple on a date" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24, background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ic name="favorite" fill size={24} color="#e11d48" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Dating, on your terms <Ic name="verified" fill size={15} color="#16a34a" />
                </div>
                <div style={{ fontSize: 13, color: '#57534E' }}>Opt in when you're ready · community comes first</div>
              </div>
            </div>
          </div>
          <div>
            <div style={eyebrow}>When you're ready</div>
            <h2 style={{ ...h2, margin: '0 0 18px' }}>Date on your timeline, not an algorithm's</h2>
            <p style={{ fontSize: 17, color: '#57534E', lineHeight: 1.7, margin: '0 0 28px' }}>
              Dating on Haply is opt-in. Keep a community-only profile as long as you like — and when you flip dating on, everyone you meet understands the journey, because they're on it too.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 32 }}>
              {(
                [
                  ['toggle_on', 'Community-only mode', 'Be here to heal and connect — invisible to daters until you choose otherwise.'],
                  ['forum', 'A matchmaker you can talk to', 'Tell our AI matchmaker what matters — kids, values, pace — and it introduces people who fit. No endless swiping.'],
                  ['verified', 'Trust, front and center', 'Moderated spaces, and members who can verify their divorce against an actual document — not just tick a box.']
                ] as const
              ).map(([icon, title, body]) => (
                <div key={icon} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <Ic name={icon} fill size={22} color="#e11d48" style={{ marginTop: 1 }} />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 14, color: '#57534E', lineHeight: 1.55 }}>{body}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={h.goGetStarted} className="hvb-rosedeep" style={{ background: '#e11d48', color: '#fff', border: 'none', borderRadius: 999, padding: '14px 30px', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
              Start your second chapter
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq-anchor" style={{ padding: '0 0 88px', background: '#FAF7F4' }}>
        <div style={container}>
          <div style={{ maxWidth: 640, marginBottom: 36 }}>
            <div style={eyebrow}>Questions</div>
            <h2 style={{ ...h2, margin: 0 }}>Fair questions, straight answers</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
            {(
              [
                ['Who can join Haply?', 'Divorced or legally separated people aged 21 and over. Membership is free — sign up with Google, Facebook, or Apple in seconds.'],
                ['Is Haply free?', 'Yes. Joining, posting, city groups, and meeting people are free. Optional premium features may come later, but community membership stays free.'],
                ['How does Haply keep members safe?', 'Members sign in with a real Google, Facebook, Apple or email account, every post is automatically screened for unsafe or disrespectful language, and members can verify their divorce against a court document so you know who you are talking to. We are a small new team — we do not yet have round-the-clock human moderators, and we would rather tell you that than imply otherwise.'],
                ['What about my privacy?', 'Trust and privacy come first. Your data is never sold, your posts stay inside the community, and daters only see you if you turn dating on.']
              ] as const
            ).map(([q, a]) => (
              <div key={q} style={{ background: '#fff', border: '1px solid #EDE6DF', borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>{q}</h3>
                <p style={{ fontSize: 15, color: '#57534E', lineHeight: 1.65, margin: 0 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* invite growth strip */}
      <section style={{ padding: '0 0 88px', background: '#FAF7F4' }}>
        <div style={container}>
          <div style={{ background: 'linear-gradient(135deg,#e11d48,#be123c)', borderRadius: 24, padding: 'clamp(28px,5vw,56px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 32, color: '#fff' }}>
            <div style={{ maxWidth: 600 }}>
              <h2 style={{ fontFamily: serif, fontSize: 32, fontWeight: 600, margin: '0 0 10px', lineHeight: 1.2 }}>Know someone starting over?</h2>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: 0, opacity: 0.9 }}>The best communities grow friend by friend. Give someone a place to land — membership is free.</p>
            </div>
            <button onClick={h.invite} className="hvb-rose50" style={{ background: '#fff', color: '#be123c', border: 'none', borderRadius: 999, padding: '15px 30px', fontSize: 16, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Ic name="content_copy" size={20} />
              Copy invite link
            </button>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer style={{ background: '#211D1A', color: '#FAF7F4', padding: '56px 0 40px' }}>
        <div style={container}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Logo size={26} color="#fb7185" />
                <span style={{ fontFamily: serif, fontSize: 20, fontWeight: 700 }}>Haply</span>
              </div>
              <p style={{ color: '#A8A29E', margin: 0, fontSize: 14, lineHeight: 1.6, maxWidth: 300 }}>The divorced dating community. Real people, real support, and second chances — free to join, for people 21 and over.</p>
            </div>
            <FooterCol
              title="Community"
              links={[
                ['Conversations', h.goCommunity],
                ['City groups', () => h.scrollAnchor('groups-anchor')],
                ['Meetups & events', h.stubPage],
                ['Community rules', h.stubPage]
              ]}
            />
            <FooterCol
              title="Dating"
              links={[
                ['Trust & privacy', () => h.scrollAnchor('trust-anchor')],
                ['How dating works', () => h.scrollAnchor('dating-anchor')],
                ['Success stories', h.stubPage]
              ]}
            />
            <FooterCol
              title="Support"
              links={[
                ['Help center', h.stubPage],
                ['Safety', h.stubPage],
                ['Privacy', h.stubPage],
                ['Contact', h.stubPage]
              ]}
            />
          </div>
          <div style={{ borderTop: '1px solid #3A342F', paddingTop: 24, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', alignItems: 'center', color: '#A8A29E', fontSize: 13 }}>
            <span>© 2026 Haply. Made with love for second chances.</span>
            <span>21+ only · Free to join · Moderated for respect</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Hero photo rotation: crossfades between HERO_SLIDES, pausing on hover and for reduced motion. */
function HeroShowcase() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || paused || HERO_SLIDES.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(t);
  }, [reduced, paused]);

  const slide = HERO_SLIDES[idx];

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', aspectRatio: '4/4.4', boxShadow: '0 30px 60px -20px rgba(33,29,26,0.35)', background: '#F0E9E2' }}>
        {HERO_SLIDES.map((s, i) => (
          <img
            key={s.src}
            src={s.src}
            alt={i === idx ? s.alt : ''}
            aria-hidden={i !== idx}
            loading={i === 0 ? 'eager' : 'lazy'}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: i === idx ? 1 : 0,
              transition: reduced ? 'none' : 'opacity .8s ease'
            }}
          />
        ))}
        <div role="tablist" aria-label="Choose a photo" style={{ position: 'absolute', bottom: 16, right: 18, display: 'flex', alignItems: 'center', gap: 8, zIndex: 3 }}>
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.src}
              role="tab"
              aria-selected={i === idx}
              aria-label={s.label}
              title={s.label}
              onClick={() => setIdx(i)}
              style={{
                width: i === idx ? 24 : 10,
                height: 10,
                padding: 0,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                background: i === idx ? '#e11d48' : 'rgba(255,255,255,0.8)',
                boxShadow: '0 1px 4px rgba(33,29,26,0.35)',
                transition: reduced ? 'none' : 'width .3s ease, background .3s ease'
              }}
            />
          ))}
        </div>
      </div>
      <div data-rs-cardr="1" style={{ position: 'absolute', top: 24, right: -20, background: '#fff', borderRadius: 14, boxShadow: '0 12px 32px rgba(33,29,26,0.16)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #F0E9E2' }}>
        <Ic name="location_on" fill size={20} color="#16a34a" />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Your city group</div>
          <div style={{ fontSize: 12, color: '#78716C' }}>divorced locals, real meetups</div>
        </div>
      </div>
      <div data-rs-cardl="1" style={{ position: 'absolute', bottom: -28, left: -28, background: '#fff', borderRadius: 14, boxShadow: '0 12px 32px rgba(33,29,26,0.16)', padding: '16px 18px', maxWidth: 290, border: '1px solid #F0E9E2' }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, minHeight: 40 }}>{slide.caption}</div>
        <div style={{ fontSize: 12, color: '#78716C', marginBottom: 8 }}>{slide.sub}</div>
        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#78716C' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Ic name="favorite" fill size={14} color="#e11d48" />
            cheer each other on
          </span>
        </div>
      </div>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, () => void][] }) {
  return (
    <div>
      <h4 style={{ fontWeight: 600, margin: '0 0 14px', fontSize: 15 }}>{title}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#A8A29E', fontSize: 14 }}>
        {links.map(([label, fn]) => (
          <span key={label} onClick={fn} className="hvc-rose300" style={{ cursor: 'pointer' }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
