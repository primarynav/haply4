import { supabase } from './supabaseClient';
import { initialsAvatar, profileFromMember, type MemberRow, type Post, type Profile } from './data';
import { metroBySlug } from './launchMarkets';
import type { CoParenting, CustodySchedule, DivorceStage, KidsAgeBand, WantsMoreKids } from './journey';
import { emptyProfile, type UserProfile } from './matchmaker';
import { clearReferral, storedReferral } from './referral';

export interface DbUser {
  id: string;
  name: string;
  email: string;
}

function toDbUser(u: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null): DbUser | null {
  if (!u) return null;
  const email = u.email || '';
  const metaName = typeof u.user_metadata?.name === 'string' ? (u.user_metadata.name as string) : '';
  const name = metaName || email.split('@')[0] || 'Member';
  return { id: u.id, name: name.charAt(0).toUpperCase() + name.slice(1), email };
}

export async function fetchSession(): Promise<DbUser | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return toDbUser(data.session?.user ?? null);
  } catch {
    return null;
  }
}

export function onAuth(cb: (u: DbUser | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(toDbUser(session?.user ?? null)));
  return () => data.subscription.unsubscribe();
}

export async function signUpEmail(name: string, email: string, password: string): Promise<{ user?: DbUser; needsConfirm?: boolean; error?: string }> {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
  if (error) return { error: error.message };
  if (!data.session) return { needsConfirm: true };
  return { user: toDbUser(data.user)! };
}

export async function signInEmail(email: string, password: string): Promise<{ user?: DbUser; error?: string }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message === 'Invalid login credentials' ? 'Email or password is incorrect.' : error.message };
  return { user: toDbUser(data.user)! };
}

export async function signInProvider(provider: 'google' | 'facebook' | 'apple'): Promise<{ error?: string }> {
  const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
  return error ? { error: error.message } : {};
}

export async function signOutBackend(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {
    /* already signed out */
  }
}

/** Current version of the site-wide Terms of Service / Privacy Policy a member agrees to at signup. */
export const TERMS_VERSION = '2026-07-v1';

export async function acceptTerms(uid: string, version: string = TERMS_VERSION): Promise<void> {
  try {
    await supabase.from('profiles').upsert({ id: uid, terms_accepted_at: new Date().toISOString(), terms_version: version });
  } catch {
    /* best-effort; the checkbox itself already gated account creation client-side */
  }
}

interface ProfileRow {
  id: string;
  name: string;
  gender: string | null;
  seeking: string | null;
  age: number | null;
  city: string | null;
  kids: string | null;
  interests: string[] | null;
  pref_local: boolean | null;
  pref_same_age: boolean | null;
  pref_kids_ok: boolean | null;
  intro: string | null;
  custom_intro: boolean | null;
  dating_on: boolean | null;
  divorce_verified: boolean | null;
  divorce_status: string | null;
  divorce_verified_at: string | null;
  metro: string | null;
  divorce_stage: string | null;
  kids_at_home: boolean | null;
  kids_age_bands: string[] | null;
  custody_schedule: string | null;
  wants_more_kids: string | null;
}

export type ClaimedStatus = 'divorced' | 'legally_separated';

export interface VerificationInfo {
  divorceVerified: boolean;
  divorceStatus: ClaimedStatus | null;
  divorceVerifiedAt: string | null;
}

export interface JourneyInfo {
  metro: string | null;
  stage: DivorceStage | null;
  coParenting: CoParenting;
}

export async function loadProfile(uid: string): Promise<{ profile: UserProfile; datingOn: boolean; verification: VerificationInfo; journey: JourneyInfo } | null> {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle<ProfileRow>();
    if (error || !data) return null;
    return {
      profile: {
        ...emptyProfile(),
        age: data.age ?? undefined,
        gender: (data.gender as UserProfile['gender']) ?? undefined,
        seeking: (data.seeking as UserProfile['seeking']) ?? undefined,
        city: data.city ?? undefined,
        kids: data.kids ?? undefined,
        interests: data.interests ?? [],
        prefLocal: data.pref_local ?? undefined,
        prefSameAge: data.pref_same_age ?? undefined,
        prefKidsOk: data.pref_kids_ok ?? undefined,
        intro: data.intro ?? undefined,
        customIntro: data.custom_intro ?? undefined
      },
      datingOn: data.dating_on ?? true,
      verification: {
        divorceVerified: data.divorce_verified ?? false,
        divorceStatus: (data.divorce_status as ClaimedStatus) ?? null,
        divorceVerifiedAt: data.divorce_verified_at ?? null
      },
      journey: {
        metro: data.metro ?? null,
        stage: (data.divorce_stage as DivorceStage) ?? null,
        coParenting: {
          kidsAtHome: data.kids_at_home ?? undefined,
          kidsAgeBands: (data.kids_age_bands as KidsAgeBand[]) ?? undefined,
          custodySchedule: (data.custody_schedule as CustodySchedule) ?? undefined,
          wantsMoreKids: (data.wants_more_kids as WantsMoreKids) ?? undefined
        }
      }
    };
  } catch {
    return null;
  }
}

export interface SaveProfileExtras {
  intent?: string;
  postal?: string;
  metro?: string | null;
  stage?: DivorceStage | null;
  coParenting?: CoParenting;
}

export async function saveProfile(uid: string, name: string, p: UserProfile, datingOn: boolean, extras: SaveProfileExtras = {}): Promise<void> {
  const { intent, postal, metro, stage, coParenting } = extras;
  // First write after signup carries the partner code that brought them here.
  const { code: referralCode, source: referralSource } = storedReferral();
  try {
    await supabase.from('profiles').upsert({
      id: uid,
      name,
      gender: p.gender ?? null,
      seeking: p.seeking ?? null,
      age: p.age ?? null,
      city: p.city ?? null,
      kids: p.kids ?? null,
      interests: p.interests,
      pref_local: p.prefLocal ?? false,
      pref_same_age: p.prefSameAge ?? false,
      pref_kids_ok: p.prefKidsOk ?? false,
      intro: p.intro ?? null,
      custom_intro: p.customIntro ?? false,
      dating_on: datingOn,
      ...(intent ? { intent } : {}),
      ...(postal ? { postal } : {}),
      ...(metro !== undefined ? { metro } : {}),
      ...(stage !== undefined ? { divorce_stage: stage } : {}),
      ...(coParenting
        ? {
            kids_at_home: coParenting.kidsAtHome ?? null,
            kids_age_bands: coParenting.kidsAgeBands ?? null,
            custody_schedule: coParenting.custodySchedule ?? null,
            wants_more_kids: coParenting.wantsMoreKids ?? null
          }
        : {}),
      // Source is recorded even with no partner code — the switch landing page
      // has a source but no code, and it still needs to be measurable.
      ...(referralCode || referralSource ? { referral_code: referralCode, referral_source: referralSource } : {}),
      updated_at: new Date().toISOString()
    });
    // Only drop the stored attribution once it is safely on the row, so a
    // failed write doesn't silently lose a partner's credit.
    if (referralCode || referralSource) clearReferral();
  } catch {
    /* saved locally regardless; retried on next change */
  }
}

/**
 * Someone outside a launch metro. We take an email and where they are, so the
 * next market is chosen from demand rather than intuition.
 */
export async function joinWaitlist(email: string, postal: string, metroRequested?: string): Promise<{ ok?: boolean; error?: string }> {
  const { code } = storedReferral();
  try {
    const { error } = await supabase.from('waitlist').insert({
      email: email.trim().toLowerCase(),
      postal: postal.trim() || null,
      metro_requested: metroRequested ?? null,
      referral_code: code
    });
    // Already on the list is a success from the member's point of view.
    if (error && !/duplicate|unique/i.test(error.message)) return { error: error.message };
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'unknown' };
  }
}

function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 90) return 'Just now';
  if (s < 3600) return `${Math.round(s / 60)} minutes ago`;
  if (s < 86400) return `${Math.round(s / 3600)} hours ago`;
  return `${Math.round(s / 86400)} days ago`;
}

interface PostRow {
  id: number;
  user_id: string | null;
  author_name: string;
  cat: string;
  title: string;
  body: string;
  pinned: boolean;
  created_at: string;
  post_likes: { count: number }[];
  comments: { count: number }[];
}

export async function fetchPosts(uid?: string): Promise<{ posts: Post[]; myLikes: Record<number, boolean> } | null> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('id, user_id, author_name, cat, title, body, pinned, created_at, post_likes(count), comments(count)')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);
    if (error || !data) return null;
    const myLikes: Record<number, boolean> = {};
    if (uid) {
      const { data: likes } = await supabase.from('post_likes').select('post_id').eq('user_id', uid);
      for (const l of likes ?? []) myLikes[l.post_id as number] = true;
    }
    const posts: Post[] = (data as unknown as PostRow[]).map((r) => ({
      id: r.id,
      name: r.author_name,
      userId: r.user_id ?? undefined,
      cat: r.cat,
      time: r.pinned ? 'Pinned' : timeAgo(r.created_at),
      title: r.title,
      body: r.body,
      // the UI adds +1 for the viewer's own like, so keep base counts exclusive of it
      likes: Math.max(0, (r.post_likes?.[0]?.count ?? 0) - (myLikes[r.id] ? 1 : 0)),
      comments: r.comments?.[0]?.count ?? 0
    }));
    return { posts, myLikes };
  } catch {
    return null;
  }
}

export async function createPost(uid: string, authorName: string, cat: string, title: string, body: string): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({ user_id: uid, author_name: authorName, cat, title, body })
      .select('id, author_name, cat, title, body, created_at')
      .single();
    if (error || !data) return null;
    return { id: data.id, name: data.author_name, userId: uid, cat: data.cat, time: 'Just now', title: data.title, body: data.body, likes: 0, comments: 0 };
  } catch {
    return null;
  }
}

export async function setPostLike(postId: number, uid: string, liked: boolean): Promise<void> {
  try {
    if (liked) await supabase.from('post_likes').upsert({ post_id: postId, user_id: uid });
    else await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', uid);
  } catch {
    /* optimistic UI already applied */
  }
}

export interface Comment {
  id: number;
  postId: number;
  name: string;
  userId: string;
  body: string;
  time: string;
}

interface CommentRow {
  id: number;
  post_id: number;
  author_name: string;
  user_id: string;
  body: string;
  created_at: string;
}

export async function fetchComments(postId: number): Promise<Comment[] | null> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('id, post_id, author_name, user_id, body, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error || !data) return null;
    return (data as CommentRow[]).map((r) => ({ id: r.id, postId: r.post_id, name: r.author_name, userId: r.user_id, body: r.body, time: timeAgo(r.created_at) }));
  } catch {
    return null;
  }
}

export async function createComment(postId: number, uid: string, authorName: string, body: string): Promise<Comment | null> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: uid, author_name: authorName, body })
      .select('id, post_id, author_name, user_id, body, created_at')
      .single();
    if (error || !data) return null;
    return { id: data.id, postId: data.post_id, name: data.author_name, userId: data.user_id, body: data.body, time: 'Just now' };
  } catch {
    return null;
  }
}

export interface PublicProfile {
  name: string;
  age?: number;
  city?: string;
  kids?: string;
  intro?: string;
  interests: string[];
  divorceVerified: boolean;
  divorceStatus: ClaimedStatus | null;
}

/**
 * Read-only card shown when tapping another real member's name in the community.
 * Goes through the `get_community_profile` RPC rather than querying `profiles`
 * directly — profiles are only readable row-by-row for yourself or a mutual
 * verified dating match, so a plain select here would silently return nothing
 * for most members. The RPC is a SECURITY DEFINER function scoped to return
 * only these safe columns, never full rows (see migration
 * tighten_profile_read_policy) — including the verification badge, since
 * showing that badge to other members is the entire point of the feature.
 */
export async function fetchPublicProfile(uid: string): Promise<PublicProfile | null> {
  try {
    const { data, error } = await supabase.rpc('get_community_profile', { member_id: uid });
    const row = data?.[0];
    if (error || !row) return null;
    return {
      name: row.name,
      age: row.age ?? undefined,
      city: row.city ?? undefined,
      kids: row.kids ?? undefined,
      intro: row.intro ?? undefined,
      interests: row.interests ?? [],
      divorceVerified: row.divorce_verified ?? false,
      divorceStatus: (row.divorce_status as ClaimedStatus) ?? null
    };
  } catch {
    return null;
  }
}

/**
 * Every member the signed-in member is allowed to see in Discover.
 *
 * Goes through `get_discover_feed`, which is the only read path that returns
 * other people's profiles: the row policy on `profiles` limits a plain select to
 * your own row, so the RPC carries the gating instead — both sides verified,
 * target not banned, paused or dating-off, neither having blocked the other —
 * and returns an explicit column list rather than whole rows.
 *
 * The whole visible pool is fetched once and filtered in the browser. That keeps
 * the filter bar instant while adjusting a slider, and it is the only way the
 * radius, smoking, drinking and education filters can work at all, since those
 * are client-side notions with no column behind them. The RPC also takes the
 * coarse filters as arguments; start passing them, and paging with `total_count`,
 * when a metro outgrows one page.
 *
 * Returns null on failure so the caller can tell "couldn't load" from "nobody
 * matches yet" — an empty launch metro is a normal state here, not an error.
 */
export async function fetchDiscoverPool(): Promise<Profile[] | null> {
  try {
    const { data, error } = await supabase.rpc('get_discover_feed', { p_limit: 200 });
    if (error || !data) return null;
    return (data as MemberRow[]).map((row) => {
      const m = metroBySlug(row.metro);
      return profileFromMember(row, m ? { lat: m.lat, lng: m.lng } : undefined);
    });
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Likes, matches and messages                                         */
/* ------------------------------------------------------------------ */

/** A live match: who it's with, and enough of the last message to list it. */
export interface MatchSummary {
  matchId: string;
  profile: Profile;
  matchedAt: string;
  lastBody?: string;
  lastAt?: string;
  lastSenderId?: string;
  unread: number;
}

export interface DbMessage {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
}

/**
 * Record a like or a pass.
 *
 * Both are stored: a pass is how Discover knows not to show someone again, and
 * the unique constraint on the pair means answering twice is a no-op rather
 * than an error. Whether this created a match is not something the client can
 * work out for itself — a member can only read their own likes, so the other
 * person's is invisible by design — so the answer comes from re-reading the
 * match list, which the caller needs refreshed anyway.
 */
export async function sendLikeAction(targetId: string, action: 'like' | 'pass'): Promise<{ matches: MatchSummary[]; newMatch: boolean } | null> {
  try {
    const { error } = await supabase.from('likes').upsert(
      { liker_id: (await supabase.auth.getUser()).data.user?.id, liked_id: targetId, action },
      { onConflict: 'liker_id,liked_id' }
    );
    if (error) return null;
    const matches = (await fetchMatches()) ?? [];
    return { matches, newMatch: action === 'like' && matches.some((m) => m.profile.id === targetId) };
  } catch {
    return null;
  }
}

/**
 * Everyone this member has already answered, so Discover and the grid agree
 * about who has been dealt with. The feed excludes them server-side too; this
 * is what keeps the like and pass buttons in the right state for anyone still
 * on screen.
 */
export async function fetchMyLikeActions(): Promise<{ liked: string[]; passed: string[] } | null> {
  try {
    const { data, error } = await supabase.from('likes').select('liked_id, action');
    if (error || !data) return null;
    return {
      liked: data.filter((r) => r.action === 'like').map((r) => r.liked_id as string),
      passed: data.filter((r) => r.action === 'pass').map((r) => r.liked_id as string)
    };
  } catch {
    return null;
  }
}

/**
 * Live matches with the other member's card.
 *
 * Goes through get_my_matches rather than the profiles table: holding a match
 * row does not let you read the other person's profile, since that policy is
 * own-row-only. Matched members are also deliberately absent from the discover
 * feed, so this is the only place their details come from.
 */
export async function fetchMatches(): Promise<MatchSummary[] | null> {
  try {
    const { data, error } = await supabase.rpc('get_my_matches');
    if (error || !data) return null;
    return (data as MatchRow[]).map((row) => ({
      matchId: row.match_id,
      matchedAt: row.matched_at,
      lastBody: row.last_body ?? undefined,
      lastAt: row.last_at ?? undefined,
      lastSenderId: row.last_sender_id ?? undefined,
      unread: Number(row.unread_count ?? 0),
      profile: {
        id: row.other_id,
        name: row.name || 'Member',
        // Gender isn't returned: you already know who you matched with, and the
        // card doesn't show it. Defaulted rather than guessed at.
        gender: 'woman',
        age: row.age ?? 0,
        location: row.city || '',
        image: initialsAvatar(row.name || 'Member', row.other_id),
        bio: row.intro || '',
        divorceYear: 0,
        interests: row.interests ?? [],
        divorceVerified: true
      }
    }));
  } catch {
    return null;
  }
}

interface MatchRow {
  match_id: string;
  other_id: string;
  name: string | null;
  age: number | null;
  city: string | null;
  intro: string | null;
  interests: string[] | null;
  matched_at: string;
  last_body: string | null;
  last_at: string | null;
  last_sender_id: string | null;
  unread_count: number;
}

export async function fetchMessages(matchId: string): Promise<DbMessage[] | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id, sender_id, body, created_at')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true })
      .limit(200);
    if (error || !data) return null;
    return data.map((m) => ({ id: m.id as string, senderId: m.sender_id as string, body: m.body as string, createdAt: m.created_at as string }));
  } catch {
    return null;
  }
}

export async function sendMessage(matchId: string, body: string): Promise<boolean> {
  try {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (!uid) return false;
    const { error } = await supabase.from('messages').insert({ match_id: matchId, sender_id: uid, body });
    return !error;
  } catch {
    return false;
  }
}

/** Clear the unread count on everything the other person sent in this match. */
export async function markMatchRead(matchId: string): Promise<void> {
  try {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (!uid) return;
    await supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('match_id', matchId).neq('sender_id', uid).is('read_at', null);
  } catch {
    /* a stale unread badge is not worth surfacing */
  }
}

/** Current version of the divorce-verification-specific consent (AI processing + public badge display) shown before upload. */
export const VERIFICATION_CONSENT_VERSION = '2026-07-v2';

export interface VerificationSubmission {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'more_info_needed';
  statusClaimed: ClaimedStatus;
  /** Internal rationale. Kept for the support chat's context — not shown to the member. */
  reviewerNote: string | null;
  /** The explanation written for the member. This is what the UI displays. */
  memberMessage: string | null;
  escalatedAt: string | null;
  createdAt: string;
}

/** The member's most recent verification attempt, if any — drives what the onboarding card shows. */
export async function fetchLatestVerification(uid: string): Promise<VerificationSubmission | null> {
  try {
    const { data, error } = await supabase
      .from('divorce_verifications')
      .select('id, status, status_claimed, reviewer_note, member_message, escalated_at, created_at')
      .eq('profile_id', uid)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id,
      status: data.status,
      statusClaimed: data.status_claimed,
      reviewerNote: data.reviewer_note,
      memberMessage: data.member_message,
      escalatedAt: data.escalated_at,
      createdAt: data.created_at
    };
  } catch {
    return null;
  }
}

export interface DivorceVerificationFields {
  statusClaimed: ClaimedStatus;
  legalNameAtDivorce: string;
  currentLegalName?: string;
  dob: string;
  state: string;
  county: string;
  finalizationDateApprox: string;
}

/**
 * Uploads the decree to the private verification-docs bucket (member can write
 * their own folder, not read it back — only the edge function's service role
 * can), then invokes verify-divorce, which downloads it, runs the Claude
 * vision check, and writes the decision itself. See supabase/functions/
 * verify-divorce and src/DIVORCE_VERIFICATION_AGENT_PROMPT.md.
 */
export async function submitDivorceVerification(uid: string, fields: DivorceVerificationFields, file: File): Promise<{ status?: 'approved' | 'more_info_needed' | 'rejected'; message?: string; error?: string }> {
  try {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${uid}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('verification-docs').upload(path, file, { upsert: false });
    if (uploadError) return { error: uploadError.message };

    const { data, error } = await supabase.functions.invoke('verify-divorce', {
      body: { ...fields, documentPath: path, consentVersion: VERIFICATION_CONSENT_VERSION }
    });
    if (error) return { error: error.message };
    if (data?.error) return { error: data.error };
    if (!data?.result) return { error: 'no_result' };
    return { status: data.result.status, message: data.result.memberMessage || data.result.reasoning || '' };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'unknown' };
  }
}

export interface AppealChatMessage {
  from: 'me' | 'agent';
  text: string;
}

/**
 * Records a member's request for a person to review an automated verification
 * decision. Deliberately not routed through the chat model — the right to human
 * review has to be exercisable directly, not granted at an AI's discretion.
 *
 * This marks escalated_at for someone to action. It is a logged request, not a
 * live handoff, so no copy anywhere may promise a response time.
 */
export async function requestHumanReview(verificationId: string): Promise<{ escalated?: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('verification-appeal-chat', {
      body: { verificationId, action: 'request_human_review' }
    });
    if (error) return { error: error.message };
    if (data?.error) return { error: data.error };
    return { escalated: !!data?.escalated };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'unknown' };
  }
}

/**
 * Support chat for a member whose verification was rejected or needs more info —
 * helps them fix and resubmit. It may also record a human-review request; there
 * is no staffed review queue, so that is a logged intent, not a live handoff,
 * and neither this chat nor the UI may state a turnaround time.
 */
export async function appealChat(verificationId: string, messages: AppealChatMessage[]): Promise<{ reply?: string; escalated?: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('verification-appeal-chat', {
      body: { verificationId, messages: messages.map((m) => ({ role: m.from, text: m.text })) }
    });
    if (error) return { error: error.message };
    if (data?.error) return { error: data.error };
    return { reply: data?.reply, escalated: data?.escalated };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'unknown' };
  }
}
