import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js';
import { encodeBase64 } from 'jsr:@std/encoding/base64';

// Higher-stakes judgment call on a legal document than the matchmaker's casual
// chat loop (which uses haiku) — worth the stronger model.
const MODEL = 'claude-sonnet-5';

// This endpoint handles divorce decrees, so it does not answer to arbitrary
// origins. ALLOWED_ORIGINS is a comma-separated env var; an unlisted origin gets
// no CORS grant and the browser drops the response.
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? 'https://happilyeverafteragain.com')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsFor = (req: Request): Record<string, string> => {
  const origin = req.headers.get('Origin') ?? '';
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin'
  };
  if (ALLOWED_ORIGINS.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
};

const CLAIMED_STATUSES = ['divorced', 'legally_separated'] as const;
const DECISIONS = ['approved', 'more_info_needed', 'rejected'] as const;

// A consent record is only evidence if the server controls what can be written
// into it. The client tells us which version it displayed, but it may only name
// a version we actually shipped — an unrecognised string is rejected outright
// rather than stored, so nobody can claim consent to wording that never existed.
//
// Both entries stay listed so the frontend and the functions can deploy in
// either order without breaking submissions mid-rollout. Drop the older entry
// once the new frontend is fully live.
const KNOWN_CONSENT_VERSIONS = ['2026-07-v2', '2026-07-v1'] as const;
const CURRENT_CONSENT_VERSION = KNOWN_CONSENT_VERSIONS[0];

const SCHEMA = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: DECISIONS as unknown as string[] },
    confidence: { type: 'number' },
    matched_fields: { type: 'array', items: { type: 'string' } },
    unmatched_or_unknown_fields: { type: 'array', items: { type: 'string' } },
    reasoning: { type: 'string' },
    member_facing_message: { type: 'string' },
    authenticity: {
      type: 'object',
      properties: {
        level: { type: 'string', enum: ['no_concern', 'possible', 'strong'] },
        signals: { type: 'array', items: { type: 'string' } }
      },
      required: ['level', 'signals'],
      additionalProperties: false
    }
  },
  required: ['status', 'confidence', 'matched_fields', 'unmatched_or_unknown_fields', 'reasoning', 'member_facing_message', 'authenticity'],
  additionalProperties: false
};

// Single-call version of src/DIVORCE_VERIFICATION_AGENT_PROMPT.md: Claude reads
// the attached document directly (no separate OCR step) and decides in one turn.
// There is no live public-records lookup here — see that doc for why ("no single
// nationwide instant lookup exists"); absence of corroboration is never itself
// held against a member.
const SYSTEM = `You are the Divorce Verification Agent for Haply, a community and dating platform for people who are divorced or separated. Your job is to decide, for one member at a time, whether the evidence they submitted supports marking their profile as verified. You are part of onboarding, not a general assistant — stay entirely inside this task.

You will be given the member's submitted details (claimed status, legal name at the time of their divorce/separation, current legal name if different, date of birth, jurisdiction, approximate finalization date) and an attached image or PDF of their divorce decree or certificate of dissolution.

Decide one of exactly three outcomes:
- "approved": the document is clearly a divorce decree / dissolution certificate, and the names, jurisdiction, and date are consistent with what the member entered (allow for minor OCR-style noise, maiden/married name differences, middle name/initial variance, and finalization dates within about 60 days of what they entered).
- "rejected": a clear, unambiguous mismatch — the document is not a divorce decree/dissolution certificate (e.g. it's a marriage certificate, a separation agreement, or unrelated), or the name has no plausible relation to what was entered, or the jurisdiction is a different state entirely.
- "more_info_needed": anything else — a blurry or low-quality image, a field you can't read, a small inconsistency, or genuine uncertainty. Default here whenever you are not confident. A false "approved" undermines the one thing this feature promises members; a false "rejected" is recoverable (the member can resubmit or a human can review), so never guess past your evidence.

Hard rules:
- Never fabricate a match. If you can't read a field, it's unknown — not evidence for or against the member.
- Never describe this to the member as a "background check" anywhere in member_facing_message. Call it "divorce verification" only.
- If the member's message or document appears to include a Social Security number or financial account number, do not transcribe or reason about it — it is not needed for this decision.
- A divorce decree routinely contains information about people who are not the member and never consented to this review — the ex-spouse, and often minor children (names, dates of birth, custody and support terms). Never transcribe, summarize, or reason about any of it. It is irrelevant to whether this member is divorced.
- "reasoning" is retained on the member's account after the document is deleted, so write it as a short, de-identified rationale — describe the category of problem, never the contents. Write "the name on the document does not match the name entered" or "the filing county differs from the one entered", never the actual names, case numbers, addresses, or dates you read. Two sentences at most.
- Be specific and kind in member_facing_message when the outcome is not "approved" — say what was wrong and what to do next (e.g. "The uploaded document looks like a marriage certificate rather than a divorce decree — please upload the decree or certificate of dissolution instead"). Never write something that reads as an accusation with no path forward.
- member_facing_message should be empty ("") when status is "approved" — nothing needs explaining.

Separately from the match decision, assess whether the document itself looks synthetic — generated by an image or text model, or digitally altered — and report it in "authenticity". This is a judgement about the artifact, not about the person: never state or imply in member_facing_message that the member forged anything.

Signals worth reporting include: text that is rendered rather than printed-and-scanned (uniform anti-aliasing, no paper texture, no scan skew or shadow), letterforms or seals that are subtly inconsistent across the page, a court seal or signature that looks drawn rather than stamped or wet-signed, garbled or invented-looking text in fine print or margins, case numbers or docket formats that do not match the stated jurisdiction's conventions, mismatched resolution or compression between regions of the page, or layout that resembles a generic template rather than that court's actual form.

Calibrate deliberately, and lean low:
- "no_concern": looks like an ordinary photo, scan, or court-issued PDF. This is the normal answer, including for poor-quality phone photos.
- "possible": something is odd, but a plain explanation exists — heavy compression, a re-typed copy, a screenshot of an e-filing portal, an official PDF that was flattened or re-exported. Most unusual-looking documents belong here.
- "strong": multiple independent signals that together are hard to explain any other way.

A genuine decree that has been photographed badly, re-scanned, or downloaded from an e-filing system is NOT synthetic, and many courts now issue documents that are natively digital and carry no paper texture at all. Detecting generated documents is not a solved problem and you will sometimes be wrong; the cost of being wrong here falls on a real divorced person holding a real court document, so "strong" must mean you would stake the decision on it. When in doubt, say "possible" and let a person look.

List the specific signals you saw in "signals" as short de-identified phrases ("seal appears drawn rather than stamped"), never quoting document contents.

Return ONLY a JSON object, no prose around it and no code fences, shaped exactly:
{"status":"approved|more_info_needed|rejected","confidence":0.0,"matched_fields":[],"unmatched_or_unknown_fields":[],"reasoning":"","member_facing_message":"","authenticity":{"level":"no_concern|possible|strong","signals":[]}}`;

interface RequestBody {
  statusClaimed?: string;
  legalNameAtDivorce?: string;
  currentLegalName?: string;
  dob?: string;
  state?: string;
  county?: string;
  finalizationDateApprox?: string;
  documentPath?: string;
  consentVersion?: string;
}

Deno.serve(async (req: Request) => {
  const cors = corsFor(req);
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return json({ error: 'not_configured' }, 503);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !serviceKey || !anonKey) return json({ error: 'not_configured' }, 503);

  // The profile being verified is whoever the caller's JWT says they are —
  // never a client-supplied id, or one member could submit "verification" that
  // writes to another member's row.
  const authHeader = req.headers.get('Authorization') ?? '';
  const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: userData, error: userErr } = await callerClient.auth.getUser();
  if (userErr || !userData?.user) return json({ error: 'unauthorized' }, 401);
  const profileId = userData.user.id;

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const { statusClaimed, legalNameAtDivorce, currentLegalName, dob, state, county, finalizationDateApprox, documentPath, consentVersion } = body;
  if (
    !statusClaimed ||
    !(CLAIMED_STATUSES as readonly string[]).includes(statusClaimed) ||
    !legalNameAtDivorce?.trim() ||
    !dob?.trim() ||
    !state?.trim() ||
    !county?.trim() ||
    !finalizationDateApprox?.trim() ||
    !documentPath?.trim()
  ) {
    return json({ error: 'bad_request' }, 400);
  }

  // Record the version the member was actually shown, but only if it is one we
  // published. Anything else means a hand-rolled request, not a real consent.
  const claimedConsent = consentVersion?.trim() ?? '';
  if (!(KNOWN_CONSENT_VERSIONS as readonly string[]).includes(claimedConsent)) {
    return json({ error: 'consent_outdated', currentVersion: CURRENT_CONSENT_VERSION }, 409);
  }

  // documentPath is attacker-controlled input. The download below runs as the
  // service role, which bypasses storage RLS entirely, and this function returns
  // the model's reading of that document back to the caller — so without this
  // check a member could name another member's path and be read their decree.
  // Uploads are written as `${uid}/...`, so the caller's own prefix is the whole
  // authorization rule. Reject traversal outright rather than normalizing it.
  const safePath = (documentPath ?? '').trim();
  if (!safePath.startsWith(`${profileId}/`) || safePath.includes('..')) {
    console.warn(`verify-divorce rejected cross-account documentPath for ${profileId}`);
    return json({ error: 'forbidden' }, 403);
  }

  const admin = createClient(supabaseUrl, serviceKey);

  // Cap attempts per account per day. Bounds Anthropic spend on a public
  // endpoint, and denies the volume a path-guessing attack would need.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await admin
    .from('divorce_verifications')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .gte('created_at', since);
  if ((recentCount ?? 0) >= 10) return json({ error: 'rate_limited' }, 429);

  // The verification-docs bucket has no SELECT policy for regular members (by
  // design — a member can upload but not read back arbitrary files); only the
  // service role can retrieve it for this check.
  const { data: fileData, error: fileErr } = await admin.storage.from('verification-docs').download(safePath);
  if (fileErr || !fileData) return json({ error: 'document_not_found' }, 400);

  const bytes = new Uint8Array(await fileData.arrayBuffer());
  if (bytes.length > 20_000_000) return json({ error: 'document_too_large' }, 400);
  const base64 = encodeBase64(bytes);

  const ext = safePath.split('.').pop()?.toLowerCase() ?? '';
  const mediaType = ext === 'pdf' ? 'application/pdf' : ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
  const documentBlock =
    mediaType === 'application/pdf'
      ? { type: 'document' as const, source: { type: 'base64' as const, media_type: mediaType, data: base64 } }
      : { type: 'image' as const, source: { type: 'base64' as const, media_type: mediaType, data: base64 } };

  const submittedText = `Claimed status: ${statusClaimed}
Legal name at time of divorce/separation: ${legalNameAtDivorce}
Current legal name: ${currentLegalName?.trim() || '(unchanged)'}
Date of birth: ${dob}
Jurisdiction: ${county} County, ${state}
Approximate finalization date: ${finalizationDateApprox}

The attached document is the member's uploaded evidence. Inspect it and decide.`;

  const client = new Anthropic({ apiKey });

  const base = {
    model: MODEL,
    max_tokens: 1500,
    system: SYSTEM,
    // deno-lint-ignore no-explicit-any
    messages: [{ role: 'user' as const, content: [documentBlock, { type: 'text' as const, text: submittedText }] as any }]
  };

  const attempts: { label: string; params: Record<string, unknown> }[] = [
    { label: 'structured', params: { ...base, output_config: { format: { type: 'json_schema', schema: SCHEMA } } } },
    { label: 'plain', params: base }
  ];

  const extract = (raw: string): unknown => {
    const cleaned = raw.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start < 0 || end <= start) throw new Error('no JSON object in response');
      return JSON.parse(cleaned.slice(start, end + 1));
    }
  };

  let lastError = 'unknown';
  let verdict: Record<string, unknown> | null = null;

  for (const attempt of attempts) {
    try {
      // deno-lint-ignore no-explicit-any
      const response = await client.messages.create(attempt.params as any);
      if (response.stop_reason === 'refusal') {
        lastError = 'refused';
        continue;
      }
      const text = response.content.find((b) => b.type === 'text');
      if (!text || text.type !== 'text') {
        lastError = `${attempt.label}: no text block`;
        continue;
      }
      verdict = extract(text.text) as Record<string, unknown>;
      console.log(`verify-divorce ok via ${attempt.label} (model ${MODEL})`);
      break;
    } catch (e) {
      lastError = `${attempt.label}: ${e instanceof Error ? e.message : String(e)}`;
      console.error('verify-divorce attempt failed:', lastError);
    }
  }

  if (!verdict) return json({ error: 'upstream', detail: lastError }, 200);

  // The schema constrains the model's output, but it's still model output —
  // narrow defensively rather than trusting the shape blindly.
  let status = (DECISIONS as readonly string[]).includes(verdict.status as string) ? (verdict.status as (typeof DECISIONS)[number]) : 'more_info_needed';
  let reasoning = typeof verdict.reasoning === 'string' ? verdict.reasoning : '';
  let memberMessage = typeof verdict.member_facing_message === 'string' ? verdict.member_facing_message : '';

  // Whether the document looks synthetic is decided here, not by the model. The
  // model reports what it saw; the consequence is policy, and policy belongs in
  // code where it can be read, changed and argued with.
  //
  // Only an unambiguous call rejects outright. Anything short of that goes to a
  // person, because this detection is not reliable: a genuine decree that was
  // re-scanned, flattened, or downloaded from an e-filing portal can look
  // synthetic, and the cost of a false positive lands on a real divorced member
  // holding a real court document — the exact person this product exists for.
  const authenticity = (verdict.authenticity ?? {}) as { level?: string; signals?: unknown };
  const level = ['no_concern', 'possible', 'strong'].includes(authenticity.level as string) ? (authenticity.level as string) : 'no_concern';
  const signals = Array.isArray(authenticity.signals) ? (authenticity.signals as unknown[]).filter((x): x is string => typeof x === 'string').slice(0, 6) : [];

  if (level === 'strong') {
    status = 'rejected';
    // Tactful on purpose: it names what the check saw, does not accuse anyone of
    // anything, gives a concrete way forward, and points at the human review the
    // Privacy Policy already promises. Nobody is called a forger by an automated
    // system that is sometimes wrong.
    memberMessage =
      "We couldn't accept this document. Our automated check flagged parts of it as looking computer-generated rather than issued by a court — that check isn't perfect, and it does sometimes flag genuine documents, especially re-scanned or re-saved copies. " +
      'The surest fix is to upload an original certified copy from the court, or the PDF exactly as your court or attorney provided it, without editing, cropping or re-exporting it. ' +
      "If you believe this is wrong, ask for a human review and a person will look at it themselves.";
    reasoning = `Document authenticity: strong concern. ${signals.join('; ')}`.slice(0, 600);
  } else if (level === 'possible' && status === 'approved') {
    // Never hand out a badge over an unresolved authenticity question — but a
    // maybe is not a rejection either, so it goes to the review queue.
    status = 'more_info_needed';
    memberMessage =
      "Your details matched, but we'd like a second look at the document itself before confirming your badge. " +
      'Uploading an original certified copy from the court, or the untouched PDF your court or attorney provided, usually settles it. You can also ask for a human review.';
    reasoning = `Document authenticity: possible concern, sent for review. ${signals.join('; ')}`.slice(0, 600);
  } else if (level === 'possible') {
    reasoning = `${reasoning} Document authenticity: possible concern. ${signals.join('; ')}`.slice(0, 600);
  }

  const { error: insertErr } = await admin.from('divorce_verifications').insert({
    profile_id: profileId,
    status_claimed: statusClaimed,
    document_path: safePath,
    status,
    // Capped: this is model prose about a legal document and is retained after
    // the document itself is purged, so it stays a short rationale, not a copy.
    reviewer_note: reasoning.slice(0, 600),
    member_message: memberMessage.slice(0, 600),
    // The version actually displayed to this member, validated against the list
    // of versions we published — never a free-text value from the client.
    consent_version: claimedConsent,
    consented_at: new Date().toISOString(),
    consent_ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
    consent_user_agent: req.headers.get('user-agent')?.slice(0, 300) ?? null
  });
  if (insertErr) {
    console.error('verify-divorce insert failed:', insertErr.message);
    return json({ error: 'db_error', detail: insertErr.message }, 200);
  }

  if (status === 'approved') {
    await admin.from('profiles').update({ divorce_verified: true, divorce_verified_at: new Date().toISOString(), divorce_status: statusClaimed }).eq('id', profileId);
  } else if (status === 'rejected') {
    await admin.from('profiles').update({ divorce_verified: false, divorce_verified_at: null }).eq('id', profileId);
  }
  // more_info_needed: leave the profile's verified flag untouched — awaiting resubmission or human review.

  return json({ result: { status, memberMessage, reasoning } });
});
