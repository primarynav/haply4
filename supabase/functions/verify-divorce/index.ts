import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js';
import { encodeBase64 } from 'jsr:@std/encoding/base64';

// Higher-stakes judgment call on a legal document than the matchmaker's casual
// chat loop (which uses haiku) — worth the stronger model.
const MODEL = 'claude-sonnet-5';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const CLAIMED_STATUSES = ['divorced', 'legally_separated'] as const;
const DECISIONS = ['approved', 'more_info_needed', 'rejected'] as const;

const SCHEMA = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: DECISIONS as unknown as string[] },
    confidence: { type: 'number' },
    matched_fields: { type: 'array', items: { type: 'string' } },
    unmatched_or_unknown_fields: { type: 'array', items: { type: 'string' } },
    reasoning: { type: 'string' },
    member_facing_message: { type: 'string' }
  },
  required: ['status', 'confidence', 'matched_fields', 'unmatched_or_unknown_fields', 'reasoning', 'member_facing_message'],
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
- Be specific and kind in member_facing_message when the outcome is not "approved" — say what was wrong and what to do next (e.g. "The uploaded document looks like a marriage certificate rather than a divorce decree — please upload the decree or certificate of dissolution instead"). Never write something that reads as an accusation with no path forward.
- member_facing_message should be empty ("") when status is "approved" — nothing needs explaining.

Return ONLY a JSON object, no prose around it and no code fences, shaped exactly:
{"status":"approved|more_info_needed|rejected","confidence":0.0,"matched_fields":[],"unmatched_or_unknown_fields":[],"reasoning":"","member_facing_message":""}`;

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

  const admin = createClient(supabaseUrl, serviceKey);

  // The verification-docs bucket has no SELECT policy for regular members (by
  // design — a member can upload but not read back arbitrary files); only the
  // service role can retrieve it for this check.
  const { data: fileData, error: fileErr } = await admin.storage.from('verification-docs').download(documentPath);
  if (fileErr || !fileData) return json({ error: 'document_not_found' }, 400);

  const bytes = new Uint8Array(await fileData.arrayBuffer());
  if (bytes.length > 20_000_000) return json({ error: 'document_too_large' }, 400);
  const base64 = encodeBase64(bytes);

  const ext = documentPath.split('.').pop()?.toLowerCase() ?? '';
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
  const status = (DECISIONS as readonly string[]).includes(verdict.status as string) ? (verdict.status as (typeof DECISIONS)[number]) : 'more_info_needed';
  const reasoning = typeof verdict.reasoning === 'string' ? verdict.reasoning : '';
  const memberMessage = typeof verdict.member_facing_message === 'string' ? verdict.member_facing_message : '';

  const { error: insertErr } = await admin.from('divorce_verifications').insert({
    profile_id: profileId,
    status_claimed: statusClaimed,
    document_path: documentPath,
    status,
    reviewer_note: reasoning,
    consent_version: consentVersion?.trim() || 'v1',
    consented_at: new Date().toISOString()
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
