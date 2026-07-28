import { supabase } from './supabaseClient';
import type { Post } from './data';
import { emptyProfile, type UserProfile } from './matchmaker';

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
}

export type ClaimedStatus = 'divorced' | 'legally_separated';

export interface VerificationInfo {
  divorceVerified: boolean;
  divorceStatus: ClaimedStatus | null;
  divorceVerifiedAt: string | null;
}

export async function loadProfile(uid: string): Promise<{ profile: UserProfile; datingOn: boolean; verification: VerificationInfo } | null> {
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
      }
    };
  } catch {
    return null;
  }
}

export async function saveProfile(uid: string, name: string, p: UserProfile, datingOn: boolean, intent?: string, postal?: string): Promise<void> {
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
      updated_at: new Date().toISOString()
    });
  } catch {
    /* saved locally regardless; retried on next change */
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

/** Current version of the divorce-verification-specific consent (AI processing + public badge display) shown before upload. */
export const VERIFICATION_CONSENT_VERSION = '2026-07-v1';

export interface VerificationSubmission {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'more_info_needed';
  statusClaimed: ClaimedStatus;
  reviewerNote: string | null;
  createdAt: string;
}

/** The member's most recent verification attempt, if any — drives what the onboarding card shows. */
export async function fetchLatestVerification(uid: string): Promise<VerificationSubmission | null> {
  try {
    const { data, error } = await supabase
      .from('divorce_verifications')
      .select('id, status, status_claimed, reviewer_note, created_at')
      .eq('profile_id', uid)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return { id: data.id, status: data.status, statusClaimed: data.status_claimed, reviewerNote: data.reviewer_note, createdAt: data.created_at };
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
 * Support chat for a member whose verification was rejected or needs more info —
 * helps them fix and resubmit, or as a last resort tells them it's been escalated
 * (logged on the verification row for a human to eventually see; there is no
 * staffed review queue built yet, so this is a logged intent, not a live handoff).
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
