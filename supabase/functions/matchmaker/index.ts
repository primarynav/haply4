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
        interests: { type: 'array', items: { type: 'string' } },
        prefLocal: nullable('boolean'),
        prefSameAge: nullable('boolean'),
        prefKidsOk: nullable('boolean'),
        intro: nullable('string')
      },
      required: ['age', 'gender', 'seeking', 'city', 'kids', 'interests', 'prefLocal', 'prefSameAge', 'prefKidsOk', 'intro'],
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
- kids: their own children in plain words, e.g. "2 boys (15 and 13)" or "No kids".
- interests: short title-case labels, e.g. ["Travel","Hiking","Cooking"]. Keep previously known ones.
- prefLocal / prefSameAge / prefKidsOk: true when they say they want someone nearby / close to their age / that kids are fine either way.
- intro: a warm 2-3 sentence first-person profile intro built from what you know. Rewrite it as the profile grows. If the member dictates their own intro ("change my intro to ..."), use their words.

Reply guidance:
- Confirm briefly what you just learned and that you saved it to their profile.
- If you set or changed "seeking", state plainly that you will only introduce them to that group.
- Then ask ONE natural follow-up for the most useful thing still missing (age, city, kids, interests, or what matters in a partner).
- Two or three sentences. Warm, plain language, no bullet points, no emoji spam. Never invent members or claim specific people are waiting.`;

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

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM,
      // Haiku 4.5 supports structured outputs but not `effort` — sending it 400s.
      output_config: {
        format: { type: 'json_schema', schema: SCHEMA }
      },
      messages: [
        {
          role: 'user',
          content: `Profile so far (JSON):\n${JSON.stringify(body.profile ?? {}, null, 2)}\n\nConversation so far:\n${history
            .map((m) => `${m.role === 'me' ? 'Member' : 'Matchmaker'}: ${m.text}`)
            .join('\n')}\n\nUpdate the profile from the member's latest message and reply to them.`
        }
      ]
    });

    if (response.stop_reason === 'refusal') return json({ error: 'refused' }, 200);

    const text = response.content.find((b) => b.type === 'text');
    if (!text || text.type !== 'text') return json({ error: 'empty' }, 200);

    return json({ result: JSON.parse(text.text) });
  } catch (e) {
    console.error('matchmaker failed:', e);
    return json({ error: 'upstream' }, 200);
  }
});
