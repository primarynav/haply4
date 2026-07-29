import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js';

const MODEL = 'claude-sonnet-5';

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

const SCHEMA = {
  type: 'object',
  properties: {
    reply: { type: 'string' },
    escalate: { type: 'boolean' }
  },
  required: ['reply', 'escalate'],
  additionalProperties: false
};

// This assistant must not invent a service level. Escalation records a request
// for human review (escalated_at) and nothing more — there is no staffed queue
// standing behind it, so the copy here promises only what the code actually
// does: the request is logged and the member is emailed at SUPPORT_EMAIL if
// they want to chase it. Telling a member "a specialist will email you within
// 24 hours" when no specialist exists is a false statement made to a consumer
// at their most aggrieved moment; it is also the sentence that gets quoted back
// in a complaint. Keep this prompt and the member-facing copy in sync.
// Must match SUPPORT_EMAIL in src/haply/legalContent.ts — the Terms, the Privacy
// Policy and this chat all name it as the route to a human, so a drift between
// them would send some members to an address nobody reads. The env var is an
// override for other environments; the default is the live address.
const SUPPORT_EMAIL = Deno.env.get('SUPPORT_EMAIL') ?? 'support@happilyeverafteragain.com';

const SYSTEM = `You are Haply's verification support assistant. You are an AI assistant, not a human, and you say so plainly if asked. You are talking with a member whose divorce-verification submission did not come back "approved". You are part of onboarding support, not a general assistant — stay entirely inside this task.

You'll be told the claimed status, the decision status, and the reasoning from the original automated check, plus the conversation so far.

Your job:
- Explain plainly, in your own words, why the submission didn't pass — don't just repeat the reasoning verbatim.
- If the issue is fixable (blurry photo, wrong document uploaded, a field that didn't match, an expired or partial scan), tell them exactly what to do and that they can resubmit through the verification form again. This covers the large majority of cases.
- Set "escalate" to true whenever the member asks for a person to look at this, or when you believe there may be a real error in the original decision that you cannot resolve in this chat. A member is always entitled to human review of an automated decision — never talk them out of it, never require them to justify the request, and never tell them escalation is unnecessary.
- If this conversation was already escalated (you'll be told), don't escalate again — just confirm the request is recorded.

Hard rules:
- Never claim to be human, and never say "background check" — call it "divorce verification" only.
- Never state or imply a deadline, turnaround time, or service level. You do not know when anyone will respond. Do not say "within 24 hours", "shortly", "soon", or "a specialist will follow up" — none of that is something you can promise. When you escalate, say only that you have recorded a request for human review and that they can email ${SUPPORT_EMAIL} to follow up.
- Never tell the member their document was, or will be, deleted, kept, or shared — you do not know, and our retention terms are in the Privacy Policy.
- Never ask for or reason about a Social Security number or financial account number.
- Never ask the member to re-send, describe, or type out contents of the decree in chat, and never ask about their ex-spouse or children. If they volunteer such details, do not repeat them back.
- Keep replies short: 2-4 sentences, warm, concrete, no bullet-point lists.

Return ONLY a JSON object, no prose around it and no code fences, shaped exactly:
{"reply":"...","escalate":false}`;

interface ChatMsg {
  role: 'me' | 'agent';
  text: string;
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

  const authHeader = req.headers.get('Authorization') ?? '';
  const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: userData, error: userErr } = await callerClient.auth.getUser();
  if (userErr || !userData?.user) return json({ error: 'unauthorized' }, 401);
  const profileId = userData.user.id;

  let body: { verificationId?: string; messages?: ChatMsg[]; action?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const verificationId = body.verificationId;

  // A member's right to human review of an automated decision cannot depend on
  // an AI agreeing to grant it. This path records the request directly, with no
  // model in the loop and no justification required.
  if (body.action === 'request_human_review') {
    if (!verificationId) return json({ error: 'bad_request' }, 400);
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: row, error: rowErr } = await admin
      .from('divorce_verifications')
      .select('id, escalated_at')
      .eq('id', verificationId)
      .eq('profile_id', profileId)
      .maybeSingle();
    if (rowErr || !row) return json({ error: 'not_found' }, 404);
    if (!row.escalated_at) {
      await admin.from('divorce_verifications').update({ escalated_at: new Date().toISOString() }).eq('id', verificationId);
    }
    return json({ escalated: true });
  }

  const history = (body.messages ?? []).slice(-20).filter((m) => (m.role === 'me' || m.role === 'agent') && typeof m.text === 'string' && m.text.trim());
  if (!verificationId || !history.length) return json({ error: 'bad_request' }, 400);

  const admin = createClient(supabaseUrl, serviceKey);

  // Scoped to this caller's own submission even though the service role would
  // bypass RLS — never trust verificationId alone.
  const { data: verification, error: fetchErr } = await admin
    .from('divorce_verifications')
    .select('id, status, status_claimed, reviewer_note, escalated_at')
    .eq('id', verificationId)
    .eq('profile_id', profileId)
    .maybeSingle();
  if (fetchErr || !verification) return json({ error: 'not_found' }, 404);

  const alreadyEscalated = !!verification.escalated_at;

  const contextText = `Claimed status: ${verification.status_claimed}
Decision status: ${verification.status}
Original reasoning: ${verification.reviewer_note || '(none recorded)'}
Already escalated: ${alreadyEscalated ? 'yes' : 'no'}`;

  const client = new Anthropic({ apiKey });

  const base = {
    model: MODEL,
    max_tokens: 800,
    system: `${SYSTEM}\n\nContext for this conversation:\n${contextText}`,
    messages: history.map((m) => ({ role: m.role === 'me' ? ('user' as const) : ('assistant' as const), content: m.text }))
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
  let turn: { reply?: unknown; escalate?: unknown } | null = null;

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
      turn = extract(text.text) as { reply?: unknown; escalate?: unknown };
      console.log(`verification-appeal-chat ok via ${attempt.label}`);
      break;
    } catch (e) {
      lastError = `${attempt.label}: ${e instanceof Error ? e.message : String(e)}`;
      console.error('verification-appeal-chat attempt failed:', lastError);
    }
  }

  if (!turn) return json({ error: 'upstream', detail: lastError }, 200);

  const reply = typeof turn.reply === 'string' && turn.reply.trim() ? turn.reply : "I'm here to help — could you tell me a bit more about what happened?";
  const shouldEscalate = turn.escalate === true && !alreadyEscalated;

  if (shouldEscalate) {
    await admin.from('divorce_verifications').update({ escalated_at: new Date().toISOString() }).eq('id', verificationId);
  }

  return json({ reply, escalated: shouldEscalate || alreadyEscalated });
});
