import Anthropic from 'npm:@anthropic-ai/sdk';

// Claude understands what the member says and writes the reply; the app applies
// the extracted preferences as filters. Matching itself is never left to the
// model — a member who asks for women must never be shown men.
const MODEL = 'claude-haiku-4-5-20251001';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const nullable = (type: string) => ({ anyOf: [{ type }, { type: 'null' }] });

const SCHEMA = {
  type: 'object',
  properties: {
    profile: {
      type: 'object',
      properties: {
        age: nullable('integer'),
        gender: { anyOf: [{ type: 'string', enum: ['man', 'woman'] }, { type: 'null' }] },
        seeking: { anyOf: [{ type: 'string', enum: ['women', 'men', 'anyone'] }, { type: 'null' }] },
        city: nullable('string'),
        kids: nullable('string'),
        minAge: nullable('integer'),
        maxAge: nullable('integer'),
        interests: { type: 'array', items: { type: 'string' } },
        prefLocal: nullable('boolean'),
        prefSameAge: nullable('boolean'),
        prefKidsOk: nullable('boolean'),
        intro: nullable('string')
      },
      required: ['age', 'gender', 'seeking', 'city', 'kids', 'minAge', 'maxAge', 'interests', 'prefLocal', 'prefSameAge', 'prefKidsOk', 'intro'],
      additionalProperties: false
    },
    reply: { type: 'string' }
  },
  required: ['profile', 'reply'],
  additionalProperties: false
};

const SYSTEM = `You are the matchmaker for Haply, a dating community for divorced and separated people (21+).

Your job each turn is to (1) update the member's profile from what they just said, and (2) write a short, warm reply.

Return the COMPLETE updated profile every time — carry forward every value the member already gave you, and change only what this message actually adds or corrects. Use null for anything still unknown.

Field guidance:
- age: the member's own age (21-99).
- gender: the member's own gender. Only set this from self-description ("I'm a divorced man"). Never infer it from who they want to meet.
- seeking: who they want to be introduced to. "women", "men", or "anyone". This is a hard filter the app enforces, so only set it when they actually express a preference.
- city: where they live, e.g. "Chicago" or "Buffalo Grove, IL". A bare city name in reply to your question counts.
- minAge / maxAge: age bounds for who they want to MEET, when they state one ("50 and above" -> minAge 50; "under 45" -> maxAge 45; "between 40 and 55" -> both). These are hard filters the app enforces, so only set them when the member actually asks. Never set them from the member's own age.
- kids: their own children in plain words, e.g. "2 boys (15 and 13)" or "No kids".
- interests: short title-case labels, e.g. ["Travel","Hiking","Cooking"]. Keep previously known ones.
- prefLocal / prefSameAge / prefKidsOk: true when they say they want someone nearby / close to their age / that kids are fine either way.
- intro: a warm 2-3 sentence first-person profile intro built from what you know. Rewrite it as the profile grows. If the member dictates their own intro ("change my intro to ..."), use their words.

Reply guidance:
- Confirm briefly what you just learned and that you saved it to their profile.
- If you set or changed "seeking", "minAge" or "maxAge", state plainly that you will only introduce them to people matching it.
- Never claim to have saved a preference that has no field above. If they ask for something you cannot store, say so plainly instead.
- Then ask ONE natural follow-up for the most useful thing still missing (age, city, kids, interests, or what matters in a partner).
- Two or three sentences. Warm, plain language, no bullet points, no emoji spam. Never invent members or claim specific people are waiting.

Return ONLY a JSON object, no prose around it and no code fences, shaped exactly:
{"profile":{"age":null,"gender":null,"seeking":null,"city":null,"kids":null,"minAge":null,"maxAge":null,"interests":[],"prefLocal":null,"prefSameAge":null,"prefKidsOk":null,"intro":null},"reply":"..."}`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  // Not configured yet: tell the client so it can fall back to its local engine.
  if (!apiKey) return json({ error: 'not_configured' }, 503);

  let body: { messages?: { role: string; text: string }[]; profile?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const history = (body.messages ?? []).slice(-20).filter((m) => typeof m.text === 'string' && m.text.trim());
  if (!history.length) return json({ error: 'bad_request' }, 400);

  const client = new Anthropic({ apiKey });

  const prompt = `Profile so far (JSON):\n${JSON.stringify(body.profile ?? {}, null, 2)}\n\nConversation so far:\n${history
    .map((m) => `${m.role === 'me' ? 'Member' : 'Matchmaker'}: ${m.text}`)
    .join('\n')}\n\nUpdate the profile from the member's latest message and reply to them.`;

  const base = {
    model: MODEL,
    max_tokens: 2000,
    system: SYSTEM,
    messages: [{ role: 'user' as const, content: prompt }]
  };

  // Structured outputs give a hard shape guarantee, but parameter support varies
  // by model — a rejected field 400s the whole call. Fall back to plain JSON so a
  // model that won't take output_config still works instead of dropping the turn.
  const attempts: { label: string; params: Record<string, unknown> }[] = [
    { label: 'structured', params: { ...base, output_config: { format: { type: 'json_schema', schema: SCHEMA } } } },
    { label: 'plain', params: base }
  ];

  // Tolerate a model that wraps JSON in prose or code fences.
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

  for (const attempt of attempts) {
    try {
      // deno-lint-ignore no-explicit-any
      const response = await client.messages.create(attempt.params as any);

      if (response.stop_reason === 'refusal') return json({ error: 'refused' }, 200);

      const text = response.content.find((b) => b.type === 'text');
      if (!text || text.type !== 'text') {
        lastError = `${attempt.label}: no text block`;
        continue;
      }

      console.log(`matchmaker ok via ${attempt.label} (model ${MODEL})`);
      return json({ result: extract(text.text) });
    } catch (e) {
      lastError = `${attempt.label}: ${e instanceof Error ? e.message : String(e)}`;
      console.error('matchmaker attempt failed:', lastError);
    }
  }

  // Detail is echoed back so the failure is visible without reading logs; the
  // client still falls back to its local engine on any non-result response.
  return json({ error: 'upstream', detail: lastError }, 200);
});
