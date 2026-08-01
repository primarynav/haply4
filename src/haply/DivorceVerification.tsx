import { useEffect, useState } from 'react';
import type { H } from './HaplyApp';
import { bypassVerification, fetchCanBypassVerification, type AppealChatMessage, type ClaimedStatus } from './backend';
import { SUPPORT_EMAIL, VERIFICATION_CONSENT } from './legalContent';
import { Ic, serif } from './ui';

type Step = 'idle' | 'consent' | 'form' | 'submitting' | 'appeal';

const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', background: '#FAF7F4', border: '1.5px solid transparent', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none' };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 };
const cardStyle: React.CSSProperties = { background: '#fff', border: '1px solid #EDE6DF', borderRadius: 18, padding: 24 };

function StatusBadge({ status }: { status: 'more_info_needed' | 'rejected' | 'pending' }) {
  const map = {
    more_info_needed: { bg: '#FEF3C7', fg: '#92400e', label: 'Needs more info' },
    rejected: { bg: '#FEE2E2', fg: '#991b1b', label: 'Not verified' },
    pending: { bg: '#F0E9E2', fg: '#44403C', label: 'Reviewing' }
  } as const;
  const s = map[status];
  return <span style={{ background: s.bg, color: s.fg, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999 }}>{s.label}</span>;
}

/** Onboarding card: verify your divorce/separation status with an uploaded decree, reviewed by Claude. Shows a real badge state (verified / needs more info / not verified / never submitted) rather than a modal. */
export function DivorceVerification({ h }: { h: H }) {
  const [step, setStep] = useState<Step>('idle');
  // Only ever true for accounts deliberately listed in test_accounts. The RPC
  // behind the button re-checks, so revealing it wrongly grants nothing.
  const [canBypass, setCanBypass] = useState(false);
  const [bypassing, setBypassing] = useState(false);
  useEffect(() => {
    void fetchCanBypassVerification().then(setCanBypass);
  }, []);
  const [consentAi, setConsentAi] = useState(false);
  const [consentBadge, setConsentBadge] = useState(false);
  const [consentRedact, setConsentRedact] = useState(false);

  const [statusClaimed, setStatusClaimed] = useState<ClaimedStatus>('divorced');
  const [legalNameAtDivorce, setLegalNameAtDivorce] = useState('');
  const [currentLegalName, setCurrentLegalName] = useState('');
  const [dob, setDob] = useState('');
  const [stateField, setStateField] = useState('');
  const [county, setCounty] = useState('');
  const [finalizationDateApprox, setFinalizationDateApprox] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');

  const [appealMessages, setAppealMessages] = useState<AppealChatMessage[]>([]);
  const [appealDraft, setAppealDraft] = useState('');
  const [appealSending, setAppealSending] = useState(false);
  const [escalated, setEscalated] = useState(false);

  const [humanReviewRequested, setHumanReviewRequested] = useState(!!h.latestVerification?.escalatedAt);
  const [requestingHuman, setRequestingHuman] = useState(false);

  const v = h.verification;
  const latest = h.latestVerification;

  const askForHuman = async () => {
    if (!latest || requestingHuman) return;
    setRequestingHuman(true);
    const res = await h.requestHumanReview(latest.id);
    setRequestingHuman(false);
    if (!res.error) setHumanReviewRequested(true);
  };

  if (v.divorceVerified) {
    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Ic name="verified" fill size={22} color="#16a34a" />
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
            Verified {v.divorceStatus === 'legally_separated' ? 'legally separated' : 'divorced'}
          </h3>
        </div>
        <p style={{ color: '#57534E', fontSize: 14, margin: '8px 0 0' }}>Your badge is visible to other members. Nothing else to do here.</p>
      </div>
    );
  }

  const bypassCard = canBypass ? (
    <div style={{ ...cardStyle, border: '1.5px dashed #D6CCC2', background: '#FFFBEB', marginBottom: 14 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>Test account</h3>
      <p style={{ color: '#57534E', fontSize: 13, margin: '0 0 12px', lineHeight: 1.55 }}>
        This account is on the test list, so it can take the badge without a document. Nothing is reviewed and no submission is recorded — it exists to
        exercise the rest of the app, and it is logged.
      </p>
      <button
        disabled={bypassing}
        onClick={async () => {
          setBypassing(true);
          const res = await bypassVerification(statusClaimed);
          setBypassing(false);
          if (res.ok) h.markVerifiedForTesting(statusClaimed);
        }}
        style={{ background: '#211D1A', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: bypassing ? 'default' : 'pointer', opacity: bypassing ? 0.6 : 1 }}
      >
        {bypassing ? 'Verifying…' : 'Skip verification (test only)'}
      </button>
    </div>
  ) : null;

  if (step === 'appeal' && latest) {
    const send = async () => {
      const text = appealDraft.trim();
      if (!text || appealSending) return;
      const nextMessages: AppealChatMessage[] = [...appealMessages, { from: 'me', text }];
      setAppealMessages(nextMessages);
      setAppealDraft('');
      setAppealSending(true);
      const res = await h.appealChat(latest.id, nextMessages);
      setAppealSending(false);
      if (res.error) {
        setAppealMessages((m) => [...m, { from: 'agent', text: "Sorry, support chat isn't available right now — please try again in a bit." }]);
        return;
      }
      if (res.reply) setAppealMessages((m) => [...m, { from: 'agent', text: res.reply! }]);
      if (res.escalated) setEscalated(true);
    };
    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Verification support</h3>
          <button onClick={() => setStep('idle')} className="hvc-ink" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716C', display: 'flex' }}>
            <Ic name="close" size={20} />
          </button>
        </div>
        {escalated && (
          <p style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', fontSize: 13, borderRadius: 10, padding: '8px 12px', margin: '0 0 12px', lineHeight: 1.5 }}>
            Your request for human review has been recorded. We can't promise a turnaround time — to follow up, email{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: '#166534', fontWeight: 600 }}>
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 280, overflowY: 'auto', marginBottom: 12 }}>
          {appealMessages.length === 0 && <p style={{ color: '#78716C', fontSize: 13, margin: 0 }}>Ask about your verification result — I can help you fix it or resubmit.</p>}
          {appealMessages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '85%', padding: '8px 12px', fontSize: 14, lineHeight: 1.5, borderRadius: m.from === 'me' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: m.from === 'me' ? '#e11d48' : '#FAF7F4', color: m.from === 'me' ? '#fff' : '#211D1A' }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Type a message..."
            value={appealDraft}
            onChange={(e) => setAppealDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void send();
            }}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={() => void send()} disabled={appealSending} className="hvb-rosedeep" style={{ background: '#e11d48', color: '#fff', border: 'none', borderRadius: 10, padding: '0 16px', fontSize: 14, fontWeight: 600, cursor: appealSending ? 'default' : 'pointer', opacity: appealSending ? 0.6 : 1 }}>
            {appealSending ? '…' : 'Send'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'consent') {
    const canContinue = consentAi && consentBadge && consentRedact;
    return (
      <div style={cardStyle}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>Before you upload</h3>
        <p style={{ color: '#78716C', fontSize: 13, margin: '0 0 16px' }}>Please read these — then we'll ask for your details and document.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
          {VERIFICATION_CONSENT.map((s) => (
            <div key={s.heading}>
              <h4 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 3px' }}>{s.heading}</h4>
              <p style={{ fontSize: 13, color: '#57534E', margin: 0, lineHeight: 1.5 }}>{s.body}</p>
            </div>
          ))}
        </div>
        <button onClick={() => setConsentAi(!consentAi)} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, marginBottom: 10, width: '100%' }}>
          <Ic name={consentAi ? 'check_circle' : 'radio_button_unchecked'} fill={consentAi} size={19} color={consentAi ? '#16a34a' : '#A8A29E'} style={{ marginTop: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#44403C', lineHeight: 1.5 }}>I consent to Haply using AI to review the details and document I submit, and I understand no person reviews it first.</span>
        </button>
        <button onClick={() => setConsentBadge(!consentBadge)} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, marginBottom: 10, width: '100%' }}>
          <Ic name={consentBadge ? 'check_circle' : 'radio_button_unchecked'} fill={consentBadge} size={19} color={consentBadge ? '#16a34a' : '#A8A29E'} style={{ marginTop: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#44403C', lineHeight: 1.5 }}>I understand my badge will be shown to other members, and that it does not verify my identity.</span>
        </button>
        <button onClick={() => setConsentRedact(!consentRedact)} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, marginBottom: 18, width: '100%' }}>
          <Ic name={consentRedact ? 'check_circle' : 'radio_button_unchecked'} fill={consentRedact} size={19} color={consentRedact ? '#16a34a' : '#A8A29E'} style={{ marginTop: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#44403C', lineHeight: 1.5 }}>I've blacked out Social Security and account numbers, and any children's details.</span>
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setStep('idle')} className="hvb-cream" style={{ background: '#fff', border: '1px solid #D6CCC2', borderRadius: 999, padding: '10px 18px', fontSize: 14, fontWeight: 600, color: '#44403C', cursor: 'pointer' }}>
            Back
          </button>
          <button
            onClick={() => canContinue && setStep('form')}
            className="hvb-rosedeep"
            style={{ flex: 1, background: canContinue ? '#e11d48' : '#FECDD3', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: canContinue ? 'pointer' : 'default' }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === 'form' || step === 'submitting') {
    const submitting = step === 'submitting';
    const submit = async () => {
      if (!legalNameAtDivorce.trim() || !dob.trim() || !stateField.trim() || !county.trim() || !finalizationDateApprox.trim() || !file) {
        setFormError('Please fill in every field and choose a file.');
        return;
      }
      setFormError('');
      setStep('submitting');
      const res = await h.submitVerification(
        { statusClaimed, legalNameAtDivorce: legalNameAtDivorce.trim(), currentLegalName: currentLegalName.trim() || undefined, dob, state: stateField.trim(), county: county.trim(), finalizationDateApprox },
        file
      );
      if (res.error) {
        const message =
          res.error === 'not_configured'
            ? 'Verification is temporarily unavailable — please try again later.'
            : res.error === 'consent_outdated'
              ? 'Our verification terms have been updated — please reload the page and read them before submitting.'
              : res.error === 'rate_limited'
                ? "You've made several attempts today — please try again tomorrow, or ask for a human review."
                : 'Something went wrong submitting your verification — please try again.';
        setFormError(message);
        setStep('form');
        return;
      }
      setStep('idle');
    };
    return (
      <div style={cardStyle}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Verify your status</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>I am</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {(['divorced', 'legally_separated'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusClaimed(s)}
                  style={{ padding: '9px 10px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: statusClaimed === s ? '2px solid #e11d48' : '1.5px solid #EDE6DF', background: statusClaimed === s ? '#FFF1F2' : '#fff', color: statusClaimed === s ? '#be123c' : '#44403C' }}
                >
                  {s === 'divorced' ? 'Divorced' : 'Legally separated'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Legal name at time of {statusClaimed === 'divorced' ? 'divorce' : 'separation'}</label>
            <input type="text" value={legalNameAtDivorce} onChange={(e) => setLegalNameAtDivorce(e.target.value)} className="fcb-rose" style={inputStyle} placeholder="As it appears on the document" />
          </div>
          <div>
            <label style={labelStyle}>Current legal name, if different</label>
            <input type="text" value={currentLegalName} onChange={(e) => setCurrentLegalName(e.target.value)} className="fcb-rose" style={inputStyle} placeholder="Leave blank if unchanged" />
          </div>
          <div>
            <label style={labelStyle}>Date of birth</label>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="fcb-rose" style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>State</label>
              <input type="text" value={stateField} onChange={(e) => setStateField(e.target.value)} className="fcb-rose" style={inputStyle} placeholder="e.g. Washington" />
            </div>
            <div>
              <label style={labelStyle}>County</label>
              <input type="text" value={county} onChange={(e) => setCounty(e.target.value)} className="fcb-rose" style={inputStyle} placeholder="e.g. King" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Approximate finalization date</label>
            <input type="date" value={finalizationDateApprox} onChange={(e) => setFinalizationDateApprox(e.target.value)} className="fcb-rose" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Upload your decree or certificate of dissolution</label>
            <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} style={{ fontSize: 13 }} />
          </div>
          {formError && <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>{formError}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep('idle')} disabled={submitting} className="hvb-cream" style={{ background: '#fff', border: '1px solid #D6CCC2', borderRadius: 999, padding: '10px 18px', fontSize: 14, fontWeight: 600, color: '#44403C', cursor: submitting ? 'default' : 'pointer' }}>
              Cancel
            </button>
            <button
              onClick={() => void submit()}
              disabled={submitting}
              className="hvb-rosedeep"
              style={{ flex: 1, background: '#e11d48', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? 'Reviewing…' : 'Submit for review'}
            </button>
          </div>
          <p style={{ fontSize: 12, color: '#A8A29E', margin: 0, lineHeight: 1.5 }}>
            An AI reviews this, usually in under a minute. If you disagree with the result you can ask for a person to review it.
          </p>
        </div>
      </div>
    );
  }

  // step === 'idle': derive the view from the latest submission, if any.
  if (latest && latest.status !== 'approved') {
    const status = latest.status === 'pending' ? 'pending' : latest.status;
    return (
      <>
      {bypassCard}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Verify your status</h3>
          <StatusBadge status={status} />
        </div>
        {/* The member-facing explanation, not the internal rationale. */}
        {latest.memberMessage && <p style={{ color: '#57534E', fontSize: 14, margin: '0 0 16px', lineHeight: 1.55 }}>{latest.memberMessage}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setStep('consent')} className="hvb-rosedeep" style={{ background: '#e11d48', color: '#fff', border: 'none', borderRadius: 999, padding: '9px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Try again
          </button>
          <button
            onClick={() => {
              setAppealMessages([]);
              setEscalated(false);
              setStep('appeal');
            }}
            className="hvb-cream"
            style={{ background: '#fff', border: '1px solid #D6CCC2', borderRadius: 999, padding: '9px 18px', fontSize: 14, fontWeight: 600, color: '#44403C', cursor: 'pointer' }}
          >
            Chat with support
          </button>
        </div>
        {/* An AI made this decision, so the route to a person must be visible
            here and not buried behind a conversation with another AI. */}
        <div style={{ borderTop: '1px solid #F0E9E2', marginTop: 16, paddingTop: 12 }}>
          {humanReviewRequested ? (
            <p style={{ fontSize: 13, color: '#166534', margin: 0, lineHeight: 1.5 }}>
              Human review requested. We can't promise a turnaround time — to follow up, email{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: '#166534', fontWeight: 600 }}>
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          ) : (
            <p style={{ fontSize: 13, color: '#78716C', margin: 0, lineHeight: 1.5 }}>
              This decision was made by an AI.{' '}
              <button
                onClick={() => void askForHuman()}
                disabled={requestingHuman}
                style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: '#e11d48', fontWeight: 600, textDecoration: 'underline', cursor: requestingHuman ? 'default' : 'pointer' }}
              >
                {requestingHuman ? 'Requesting…' : 'Request human review'}
              </button>{' '}
              — no reason needed.
            </p>
          )}
        </div>
      </div>
      </>
    );
  }

  return (
    <>
    {bypassCard}
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Ic name="verified" size={22} color="#A8A29E" />
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, fontFamily: serif }}>Not verified yet</h3>
      </div>
      <p style={{ color: '#57534E', fontSize: 14, margin: '8px 0 16px', lineHeight: 1.55 }}>
        Upload your divorce decree or certificate of dissolution and we'll review it — usually in under a minute. Verified members get a badge other members can see.
      </p>
      <button onClick={() => setStep('consent')} className="hvb-rosedeep" style={{ background: '#e11d48', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
        Verify now
      </button>
    </div>
    </>
  );
}
