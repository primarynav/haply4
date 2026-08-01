import { useCallback, useEffect, useState } from 'react';
import { decideVerification, fetchReviewQueue, openVerificationDocument, type ReviewItem } from './backend';
import { Ic, serif } from './ui';

/**
 * The human review queue.
 *
 * Only two kinds of submission reach it: ones the member escalated themselves,
 * and ones the automated check could not settle. A clean automated approval is
 * never opened by a person, which is what lets the product keep telling members
 * their document is not read by staff as a matter of course.
 *
 * The component fetches its own data rather than going through the app-wide
 * state object — nothing else in the app needs a review queue, and keeping it
 * self-contained means an ordinary member's session never holds any of it.
 */
export function AdminReview() {
  const [items, setItems] = useState<ReviewItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    setFailed(false);
    void fetchReviewQueue().then((rows) => {
      if (rows) setItems(rows);
      else {
        setItems([]);
        setFailed(true);
      }
    });
  }, []);

  useEffect(load, [load]);

  const viewDocument = async (id: string) => {
    setMsg(null);
    const { url, error } = await openVerificationDocument(id);
    if (error || !url) {
      setMsg(error || 'Could not open the document.');
      return;
    }
    // Opened in a new tab rather than embedded: the link is short-lived and
    // nothing about the decree should end up cached in this page.
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const decide = async (id: string, decision: 'approved' | 'rejected' | 'more_info_needed') => {
    if (decision !== 'approved' && !note.trim()) {
      setMsg('Add a note saying why — the member is told the outcome, so the reason should exist somewhere.');
      return;
    }
    setBusy(true);
    const { error } = await decideVerification(id, decision, note.trim());
    setBusy(false);
    if (error) {
      setMsg(error);
      return;
    }
    setMsg(decision === 'approved' ? 'Approved — their badge is live.' : 'Recorded.');
    setOpenId(null);
    setNote('');
    load();
  };

  const card: React.CSSProperties = { background: '#fff', border: '1px solid #EDE6DF', borderRadius: 14, padding: 18, marginBottom: 14 };
  const btn = (bg: string, fg: string): React.CSSProperties => ({
    background: bg, color: fg, border: 'none', borderRadius: 999, padding: '9px 18px', fontSize: 14, fontWeight: 600, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1
  });

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>Verification review</h2>
      <p style={{ color: '#78716C', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 18px' }}>
        Submissions a member escalated, or that the automated check couldn't settle. Opening a document is recorded against your account.
      </p>

      {msg && (
        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#9A3412', borderRadius: 12, padding: '10px 14px', fontSize: 13.5, marginBottom: 14 }}>{msg}</div>
      )}

      {items === null ? (
        <p style={{ color: '#78716C', fontSize: 14 }}>Loading…</p>
      ) : failed ? (
        <div style={{ ...card, textAlign: 'center' }}>
          <p style={{ margin: '0 0 12px', color: '#44403C', fontSize: 15 }}>Couldn't load the queue.</p>
          <button onClick={load} style={btn('#fff', '#44403C')}>Try again</button>
        </div>
      ) : items.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', color: '#78716C', fontSize: 14.5 }}>
          Nothing waiting. Escalations and unresolved checks show up here.
        </div>
      ) : (
        items.map((it) => (
          <div key={it.verificationId} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{it.memberName}</h3>
                <p style={{ fontSize: 13, color: '#78716C', margin: '3px 0 0' }}>
                  Claims: {it.statusClaimed === 'divorced' ? 'divorced' : 'legally separated'} · automated result: {it.status.replace(/_/g, ' ')}
                </p>
                <p style={{ fontSize: 13, color: '#78716C', margin: '3px 0 0' }}>
                  {it.reason} · submitted {new Date(it.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => setOpenId(openId === it.verificationId ? null : it.verificationId)} style={btn('#F0E9E2', '#44403C')}>
                {openId === it.verificationId ? 'Close' : 'Review'}
              </button>
            </div>

            {it.memberMessage && (
              <p style={{ background: '#FAF7F4', borderRadius: 10, padding: '10px 12px', fontSize: 14, color: '#44403C', margin: '12px 0 0', lineHeight: 1.55 }}>
                “{it.memberMessage}”
              </p>
            )}

            {openId === it.verificationId && (
              <div style={{ marginTop: 14, borderTop: '1px solid #F5F1ED', paddingTop: 14 }}>
                {it.documentPurged ? (
                  <p style={{ fontSize: 13.5, color: '#9A3412', margin: '0 0 12px' }}>
                    The document has been deleted under the 90-day retention rule. Decide on what the member has told you, or ask them to resubmit.
                  </p>
                ) : (
                  <button onClick={() => viewDocument(it.verificationId)} style={{ ...btn('#fff', '#44403C'), border: '1px solid #D6CCC2', display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                    <Ic name="description" size={16} />
                    Open document
                  </button>
                )}

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Note — why this decision. Required unless approving."
                  rows={3}
                  style={{ width: '100%', boxSizing: 'border-box', background: '#FAF7F4', border: '1.5px solid transparent', borderRadius: 12, padding: '10px 12px', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                />

                <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                  <button disabled={busy} onClick={() => decide(it.verificationId, 'approved')} style={btn('#166534', '#fff')}>Approve</button>
                  <button disabled={busy} onClick={() => decide(it.verificationId, 'more_info_needed')} style={btn('#F0E9E2', '#44403C')}>Needs more info</button>
                  <button disabled={busy} onClick={() => decide(it.verificationId, 'rejected')} style={btn('#fff', '#be123c')}>Reject</button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
