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
}

export async function loadProfile(uid: string): Promise<{ profile: UserProfile; datingOn: boolean } | null> {
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
      datingOn: data.dating_on ?? true
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
}

/**
 * Read-only card shown when tapping another real member's name in the community.
 * Goes through the `get_community_profile` RPC rather than querying `profiles`
 * directly — profiles are only readable row-by-row for yourself or a mutual
 * verified dating match, so a plain select here would silently return nothing
 * for most members. The RPC is a SECURITY DEFINER function scoped to return
 * only these six public-safe columns, never full rows (see migration
 * tighten_profile_read_policy).
 */
export async function fetchPublicProfile(uid: string): Promise<PublicProfile | null> {
  try {
    const { data, error } = await supabase.rpc('get_community_profile', { member_id: uid });
    const row = data?.[0];
    if (error || !row) return null;
    return { name: row.name, age: row.age ?? undefined, city: row.city ?? undefined, kids: row.kids ?? undefined, intro: row.intro ?? undefined, interests: row.interests ?? [] };
  } catch {
    return null;
  }
}
