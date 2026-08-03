import { useEffect, useState } from 'react';
import { fetchLikesInbox, fetchWhoLikedMe, type Admirer } from './backend';
import type { H } from './HaplyApp';
import { Ic, serif } from './ui';
import { initialsAvatar } from './data';

/**
 * Who liked you — the first thing a subscription unlocks.
 *
 * The count is shown to everyone and the names only to subscribers. That split
 * is enforced in the database, not here: `count_who_liked_me` answers anyone,
 * `get_who_liked_me` returns nothing without a live subscription. This
 * component would leak nothing even if it were wrong.
 */
export function LikesInbox({ h }: { h: H }) {
  const [count, setCount] = useState<number | null>(null);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [people, setPeople] = useState<Admirer[]>([]);

  useEffect(() => {
    let live = true;
    void fetchLikesInbox().then(({ count: c, isSubscriber: sub }) => {
      if (!live) return;
      setCount(c);
      setIsSubscriber(sub);
      if (sub) void fetchWhoLikedMe().then((rows) => live && rows && setPeople(rows));
    });
    return () => {
      live = false;
    };
  }, []);

  if (count === null || count === 0) return null;

  const card: React.CSSProperties = { background: '#fff', border: '1px solid #EDE6DF', borderRadius: 18, padding: 22, marginBottom: 18 };

  if (!isSubscriber) {
    return (
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Ic name="favorite" fill size={22} color="#e11d48" />
          <h2 style={{ fontFamily: serif, fontSize: 21, fontWeight: 600, margin: 0 }}>
            {count === 1 ? '1 person likes you' : `${count} people like you`}
          </h2>
        </div>
        <p style={{ color: '#57534E', fontSize: 14.5, lineHeight: 1.6, margin: '0 0 16px' }}>
          {count === 1 ? 'They have' : "They've"} already said yes. Haply Plus shows you who, so you can decide rather than wait to be found.
        </p>
        <Upgrade h={h} />
      </div>
    );
  }

  return (
    <div style={card}>
      <h2 style={{ fontFamily: serif, fontSize: 21, fontWeight: 600, margin: '0 0 14px' }}>
        {people.length === 1 ? '1 person likes you' : `${people.length} people like you`}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
        {people.map((p) => (
          <button
            key={p.id}
            onClick={() => h.doLike(p.id)}
            style={{ display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left', background: '#FAF7F4', border: '1px solid #EDE6DF', borderRadius: 14, padding: 12, cursor: 'pointer' }}
          >
            <img src={initialsAvatar(p.name, p.id)} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>
                {p.name}
                {p.age ? `, ${p.age}` : ''}
              </div>
              {p.city && <div style={{ fontSize: 13, color: '#78716C' }}>{p.city}</div>}
              <div style={{ fontSize: 12.5, color: '#be123c', fontWeight: 600, marginTop: 3 }}>Like back to match</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * The PayPal subscription button.
 *
 * Renders only when both the client id and plan id are configured, so an
 * unconfigured build shows an honest "not open yet" rather than a button that
 * fails on click. `custom_id` carries the member's profile id — it is how the
 * webhook knows whose subscription this is, and there is no other link.
 */
function Upgrade({ h }: { h: H }) {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const planId = import.meta.env.VITE_PAYPAL_PLAN_ID;
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const uid = h.user?.id;

  useEffect(() => {
    if (!clientId || !planId || !uid) return;
    const id = 'paypal-sdk';
    if (document.getElementById(id)) {
      setReady(true);
      return;
    }
    const s = document.createElement('script');
    s.id = id;
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&vault=true&intent=subscription`;
    s.onload = () => setReady(true);
    document.body.appendChild(s);
  }, [clientId, planId, uid]);

  useEffect(() => {
    if (!ready || done || !planId || !uid) return;
    const paypal = (window as unknown as { paypal?: Record<string, (o: unknown) => { render: (sel: string) => void }> }).paypal;
    if (!paypal?.Buttons) return;
    paypal
      .Buttons({
        style: { shape: 'pill', label: 'subscribe' },
        createSubscription: (_d: unknown, actions: { subscription: { create: (o: unknown) => Promise<string> } }) =>
          actions.subscription.create({ plan_id: planId, custom_id: uid }),
        // Approval is not payment. The webhook is what grants access, so say
        // that plainly rather than showing a badge that might not arrive.
        onApprove: () => setDone(true)
      } as unknown as Record<string, unknown>)
      .render('#paypal-subscribe');
  }, [ready, done, planId, uid]);

  if (!clientId || !planId) {
    return (
      <p style={{ background: '#FAF7F4', borderRadius: 12, padding: '12px 14px', fontSize: 13.5, color: '#57534E', margin: 0, lineHeight: 1.55 }}>
        Haply Plus isn't open for sign-ups yet. Nothing is charged and nothing is stored — we'll say so here when it is.
      </p>
    );
  }

  if (done) {
    return (
      <p style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '12px 14px', fontSize: 13.5, color: '#166534', margin: 0, lineHeight: 1.55 }}>
        Thanks — PayPal has your subscription. It can take a moment to confirm; refresh and these names will be here.
      </p>
    );
  }

  return <div id="paypal-subscribe" />;
}
