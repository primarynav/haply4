import { supabase } from './supabaseClient';
import type { AiMsg } from './HaplyApp';
import { makeIntro, type Seeking, type UserProfile } from './matchmaker';

interface AiProfile {
  age?: number | null;
  gender?: 'man' | 'woman' | null;
  seeking?: Seeking | null;
  city?: string | null;
  kids?: string | null;
  minAge?: number | null;
  maxAge?: number | null;
  interests?: string[] | null;
  prefLocal?: boolean | null;
  prefSameAge?: boolean | null;
  prefKidsOk?: boolean | null;
  intro?: string | null;
}

/** Shape the profile we send up, so the model sees only fields it owns. */
function toWire(p: UserProfile) {
  return {
    age: p.age ?? null,
    gender: p.gender ?? null,
    seeking: p.seeking ?? null,
    city: p.city ?? null,
    kids: p.kids ?? null,
    minAge: p.minAge ?? null,
    maxAge: p.maxAge ?? null,
    interests: p.interests,
    prefLocal: p.prefLocal ?? null,
    prefSameAge: p.prefSameAge ?? null,
    prefKidsOk: p.prefKidsOk ?? null,
    intro: p.intro ?? null
  };
}

/** Merge the model's profile back, keeping values it left null and validating enums. */
function merge(prev: UserProfile, ai: AiProfile): UserProfile {
  const seeking = ai.seeking === 'women' || ai.seeking === 'men' || ai.seeking === 'anyone' ? ai.seeking : prev.seeking;
  const gender = ai.gender === 'man' || ai.gender === 'woman' ? ai.gender : prev.gender;
  const age = typeof ai.age === 'number' && ai.age >= 21 && ai.age <= 99 ? ai.age : prev.age;
  const interests = Array.isArray(ai.interests)
    ? Array.from(new Set(ai.interests.filter((i) => typeof i === 'string' && i.trim()).map((i) => i.trim()))).slice(0, 12)
    : prev.interests;

  // Age bounds are hard filters, so validate them rather than trusting the model:
  // in range, and min never above max.
  const bound = (v: unknown, prev: number | undefined) =>
    typeof v === 'number' && Number.isFinite(v) && v >= 21 && v <= 99 ? Math.round(v) : prev;
  let minAge = bound(ai.minAge, prev.minAge);
  let maxAge = bound(ai.maxAge, prev.maxAge);
  if (minAge !== undefined && maxAge !== undefined && minAge > maxAge) {
    minAge = prev.minAge;
    maxAge = prev.maxAge;
  }

  const next: UserProfile = {
    ...prev,
    age,
    gender,
    seeking,
    city: typeof ai.city === 'string' && ai.city.trim() ? ai.city.trim() : prev.city,
    minAge,
    maxAge,
    kids: typeof ai.kids === 'string' && ai.kids.trim() ? ai.kids.trim() : prev.kids,
    interests,
    prefLocal: typeof ai.prefLocal === 'boolean' ? ai.prefLocal : prev.prefLocal,
    prefSameAge: typeof ai.prefSameAge === 'boolean' ? ai.prefSameAge : prev.prefSameAge,
    prefKidsOk: typeof ai.prefKidsOk === 'boolean' ? ai.prefKidsOk : prev.prefKidsOk,
    lastAsked: null
  };
  next.intro = typeof ai.intro === 'string' && ai.intro.trim().length > 12 ? ai.intro.trim() : makeIntro(next);
  return next;
}

export interface AiTurn {
  profile: UserProfile;
  reply: string;
}

/**
 * Ask the Claude-backed edge function to read the member's message.
 * Returns null whenever it isn't available, so the caller falls back to the
 * local rules engine and the matchmaker keeps working either way.
 */
export async function aiTurn(messages: AiMsg[], profile: UserProfile): Promise<AiTurn | null> {
  try {
    const { data, error } = await supabase.functions.invoke('matchmaker', {
      body: { messages: messages.map((m) => ({ role: m.from, text: m.text })), profile: toWire(profile) }
    });
    if (error || !data?.result?.reply || typeof data.result.reply !== 'string') return null;
    return { profile: merge(profile, data.result.profile ?? {}), reply: data.result.reply.trim() };
  } catch {
    return null;
  }
}
