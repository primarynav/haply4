import { useEffect, useRef, useState } from 'react';
import './styles.css';
import { CHAT_REPLIES, DEMO_PROFILES_ENABLED, INVITE_LINK, LIKES_BACK, POSTS, PROFILES, violatesLanguagePolicy, type Post, type Profile } from './data';
import { absorbMessage, buildIntros, countMatches, describeFilters, emptyProfile, matchmakerReply, profileReady, type Intro, type UserProfile } from './matchmaker';
import {
  acceptTerms,
  appealChat,
  requestHumanReview,
  createComment,
  createPost,
  fetchComments,
  fetchDiscoverPool,
  fetchIsAdmin,
  fetchLatestVerification,
  fetchMatches,
  fetchMessages,
  fetchMyLikeActions,
  markMatchRead,
  sendLikeAction,
  sendMessage,
  fetchPosts,
  joinWaitlist,
  loadProfile,
  onAuth,
  saveProfile,
  setPostLike,
  signInEmail,
  signInProvider,
  signOutBackend,
  signUpEmail,
  submitDivorceVerification,
  TERMS_VERSION,
  type AppealChatMessage,
  type Comment,
  type DbUser,
  type DivorceVerificationFields,
  type JourneyInfo,
  type MatchSummary,
  type VerificationInfo,
  type VerificationSubmission
} from './backend';
import { datingAvailableForStage, type CoParenting, type DivorceStage } from './journey';
import { METRO_OUTSIDE, metroForPostal, type LaunchMetro } from './launchMarkets';
import { captureReferral } from './referral';
import { aiTurn } from './aiMatchmaker';
import type { ProfileTarget } from './avatars';
import { Landing } from './Landing';
import { GetStarted } from './GetStarted';
import { SwitchPage } from './SwitchPage';
import { CommunityPublic } from './CommunityPublic';
import { CommunityProfilePage } from './CommunityProfile';
import { Dashboard } from './Dashboard';
import { AuthModal, ChatDialog, DetailModal, LegalModal, MatchPop, Toast } from './Overlays';
import { IS_STAGING_BACKEND } from './supabaseClient';

export type Page = 'home' | 'get-started' | 'community' | 'dashboard' | 'community-profile' | 'switch';
export type CommSort = 'top' | 'new';
export type DashTab = 'community' | 'discover' | 'ai-match' | 'matches' | 'messages' | 'profile' | 'review';
export type Intent = '' | 'community' | 'dating' | 'both';
export type AuthType = 'login' | 'signup';
/**
 * How the Discover pool got to its current contents, so the empty grid can say
 * which kind of empty it is: still loading, failed to load, or genuinely nobody
 * here yet. 'idle' means we haven't asked — the member isn't verified, so there
 * is nothing to ask for.
 */
export type PoolState = 'idle' | 'loading' | 'ready' | 'error';

export interface User {
  name: string;
  email: string;
  id?: string;
}
export interface ChatMsg {
  from: 'me' | 'them';
  text: string;
  time: string;
}
const nowLabel = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export interface AiMsg {
  from: 'me' | 'ai';
  text: string;
  /** Results as of this turn, so scrolling back shows how the search narrowed. */
  intros?: Intro[];
  /** Hard filters that produced `intros`, in plain words. */
  filters?: string[];
  /** How many members cleared those filters in total. */
  total?: number;
  at?: string;
}
export interface GsErr {
  intent?: boolean;
  gender?: boolean;
  looking?: boolean;
  postal?: boolean;
  confirm?: boolean;
  stage?: boolean;
}

/** Everything the screens need: state + actions, mirroring the prototype's state machine. */
export interface H {
  user: User | null;
  userName: string;
  userEmail: string;
  userInitial: string;
  datingOn: boolean;

  goHome: () => void;
  goGetStarted: () => void;
  goCommunity: () => void;
  goBackFromCommunity: () => void;
  scrollAnchor: (id: string) => void;
  stubPage: () => void;
  invite: () => void;
  pickGroup: (city: string) => void;
  rsvp: (name: string) => void;
  groupToast: () => void;
  settingsToast: () => void;

  openLogin: () => void;
  logout: () => void;

  gsIntent: Intent;
  pickIntent: (v: Intent) => void;
  gsGender: string;
  pickGender: (v: string) => void;
  gsLooking: string;
  pickLooking: (v: string) => void;
  gsPostal: string;
  setGsPostal: (v: string) => void;
  gsConfirm: boolean;
  toggleGsConfirm: () => void;
  gsErr: GsErr;
  gsContinue: () => void;
  /** Where this member is in the divorce journey — decides whether dating is offered at all. */
  gsStage: DivorceStage | '';
  pickStage: (v: DivorceStage) => void;
  /** Set once a postal code resolves outside every launch metro. */
  gsOutOfArea: boolean;
  gsWaitlistEmail: string;
  setGsWaitlistEmail: (v: string) => void;
  gsWaitlistDone: boolean;
  gsWaitlistSubmit: () => void;
  /** Create the account anyway — community is national, only dating waits. */
  gsJoinAnyway: () => void;
  gsBackToPostal: () => void;

  /** Metro, stage and co-parenting for the signed-in member. */
  journey: JourneyInfo;
  saveCoParenting: (c: CoParenting) => void;
  setStage: (s: DivorceStage) => void;
  /** Whether the dating half of the product is open to this member. */
  datingAvailable: boolean;
  /**
   * Why dating is closed, when it is. Stage and location are different answers
   * and the member deserves the real one — telling someone in Boise that their
   * divorce stage is the problem would be false.
   */
  datingBlockedBy: 'stage' | 'location' | null;

  /**
   * Whether this account may review verifications. Answered by the database,
   * never assumed — it only decides whether the tab is offered; every review
   * call is gated server-side regardless.
   */
  isAdmin: boolean;

  /**
   * Whether this member sees other people's photos blurred — true until their
   * own divorce is verified. Cosmetic only: the gate that matters is that they
   * cannot like anyone until they verify.
   */
  photosBlurred: boolean;
  /**
   * Reflect a test-account bypass locally so the UI updates without a reload.
   * The database has already been written by then; this only catches the client
   * up. It cannot grant anything on its own — the badge other members see comes
   * from the profile row, not from here.
   */
  markVerifiedForTesting: (status: 'divorced' | 'legally_separated') => void;

  authOpen: boolean;
  authType: AuthType;
  setAuthType: (t: AuthType) => void;
  authName: string;
  setAuthName: (v: string) => void;
  authEmail: string;
  setAuthEmail: (v: string) => void;
  authPassword: string;
  setAuthPassword: (v: string) => void;
  authTermsChecked: boolean;
  setAuthTermsChecked: (v: boolean) => void;
  authError: string;
  authSubmit: () => void;
  socialAuth: (provider: 'Google' | 'Facebook' | 'Apple') => void;
  closeAuth: () => void;

  legalSection: 'terms' | 'privacy' | null;
  openLegal: (section: 'terms' | 'privacy') => void;
  closeLegal: () => void;

  dashTab: DashTab;
  setDashTab: (t: DashTab) => void;
  tabDiscover: () => void;
  tabAI: () => void;
  turnDatingOn: () => void;
  toggleDating: () => void;

  /**
   * Every member this account may see in Discover, loaded from the database.
   * Empty until a verified member signs in — the app ships with no people in it.
   */
  pool: Profile[];
  poolState: PoolState;
  reloadPool: () => void;

  liked: string[];
  hidden: string[];
  matched: string[];
  /**
   * The people this member has actually matched with.
   *
   * Not derivable from `pool` any more: the discover feed deliberately excludes
   * anyone you have already liked, so a match is never in it. This is the only
   * source of a matched member's name and card.
   */
  matchedProfiles: Profile[];
  doLike: (id: string) => void;
  passProfile: (id: string) => void;
  openChat: (id: string) => void;
  startOver: () => void;

  detailId: string | null;
  openDetail: (id: string) => void;
  closeDetail: () => void;

  chatId: string | null;
  chatDraft: string;
  setChatDraft: (v: string) => void;
  chatTyping: boolean;
  convos: Record<string, ChatMsg[]>;
  sendChat: () => void;
  closeChat: () => void;

  aiMsgs: AiMsg[];
  aiDraft: string;
  setAiDraft: (v: string) => void;
  aiTyping: boolean;
  aiShowMatches: boolean;
  sendAi: () => void;
  userProfile: UserProfile;
  seeking?: string;

  matchPopId: string | null;
  closeMatchPop: () => void;

  commCat: string;
  setCommCat: (c: string) => void;
  commSort: CommSort;
  setCommSort: (s: CommSort) => void;
  posts: Post[];
  postLikes: Record<number, boolean>;
  togglePostLike: (id: number) => void;
  postDraft: string;
  setPostDraft: (v: string) => void;
  submitPost: () => void;

  commentsOpen: Record<number, boolean>;
  comments: Record<number, Comment[]>;
  commentDrafts: Record<number, string>;
  toggleComments: (postId: number) => void;
  setCommentDraft: (postId: number, v: string) => void;
  submitComment: (postId: number) => void;

  viewingProfile: ProfileTarget | null;
  goToProfile: (target: ProfileTarget) => void;
  backFromProfile: () => void;

  verification: VerificationInfo;
  latestVerification: VerificationSubmission | null;
  submitVerification: (fields: DivorceVerificationFields, file: File) => Promise<{ status?: 'approved' | 'more_info_needed' | 'rejected'; message?: string; error?: string }>;
  appealChat: (verificationId: string, messages: AppealChatMessage[]) => Promise<{ reply?: string; escalated?: boolean; error?: string }>;
  requestHumanReview: (verificationId: string) => Promise<{ escalated?: boolean; error?: string }>;

  prof: (id: string) => Profile | undefined;
}

function scrollBottom(elId: string) {
  setTimeout(() => {
    const el = document.getElementById(elId);
    if (el) el.scrollTop = el.scrollHeight;
  }, 60);
}

export default function HaplyApp() {
  const [page, setPage] = useState<Page>('home');
  const [dashTab, setDashTab] = useState<DashTab>('community');
  const [user, setUser] = useState<User | null>(null);
  const [datingOn, setDatingOn] = useState(true);

  const [authOpen, setAuthOpen] = useState(false);
  const [authType, setAuthType] = useState<AuthType>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authTermsChecked, setAuthTermsChecked] = useState(false);
  const [authError, setAuthError] = useState('');
  const [legalSection, setLegalSection] = useState<'terms' | 'privacy' | null>(null);

  const [gsIntent, setGsIntent] = useState<Intent>('');
  const [gsGender, setGsGender] = useState('');
  const [gsLooking, setGsLooking] = useState('');
  const [gsPostal, setGsPostal] = useState('');
  const [gsConfirm, setGsConfirm] = useState(false);
  const [gsErr, setGsErr] = useState<GsErr>({});
  const [gsStage, setGsStage] = useState<DivorceStage | ''>('');
  const [gsOutOfArea, setGsOutOfArea] = useState(false);
  const [gsWaitlistEmail, setGsWaitlistEmail] = useState('');
  const [gsWaitlistDone, setGsWaitlistDone] = useState(false);
  const [gsMetro, setGsMetro] = useState<LaunchMetro | null>(null);
  const [journey, setJourney] = useState<JourneyInfo>({ metro: null, stage: null, coParenting: {} });

  // Likes, matches and conversations are still local demo state driven by
  // CHAT_REPLIES, so they only make sense against the demo profiles they key
  // off. A real account starts empty rather than opening on two matches and two
  // conversations it never had.
  const [liked, setLiked] = useState<string[]>(DEMO_PROFILES_ENABLED ? ['1', '3'] : []);
  const [hidden, setHidden] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>(DEMO_PROFILES_ENABLED ? ['1', '3'] : []);
  const [convos, setConvos] = useState<Record<string, ChatMsg[]>>(DEMO_PROFILES_ENABLED ? {
    1: [
      { from: 'them', text: "Hey! Thanks for the match. How's your day going?", time: '2h ago' },
      { from: 'me', text: "Hi! It's going great, thanks! Love your profile, you seem really interesting.", time: '1h ago' }
    ],
    3: [
      { from: 'me', text: 'Hi there! Your art sounds amazing. Would love to hear more about it!', time: '4h ago' },
      { from: 'them', text: "Thank you! I'd love to share. Do you have any creative hobbies?", time: '3h ago' }
    ]
  } : {});
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatDraft, setChatDraft] = useState('');
  const [chatTyping, setChatTyping] = useState(false);
  const replyIdx = useRef<Record<string, number>>({});
  const chatIdRef = useRef<string | null>(null);
  chatIdRef.current = chatId;

  const [aiMsgs, setAiMsgs] = useState<AiMsg[]>([
    { from: 'ai', text: "Hi — I'm your matchmaker. Tell me about yourself and what you're looking for: your age, your city, kids, what you enjoy. I'll build your intro, save it to your profile, and use it to introduce you to members who fit. You can change anything just by telling me." }
  ]);
  const [aiDraft, setAiDraft] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const [aiShowMatches, setAiShowMatches] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('haply.profile');
      if (saved) return { ...emptyProfile(), ...JSON.parse(saved) };
    } catch {
      /* private-mode or blocked storage: start fresh */
    }
    return emptyProfile();
  });
  useEffect(() => {
    try {
      localStorage.setItem('haply.profile', JSON.stringify(userProfile));
    } catch {
      /* non-persistent environment */
    }
  }, [userProfile]);
  // Read a partner's ?ref= code before anything can navigate it away — it has to
  // survive the whole journey to signup, including the OAuth round trip.
  useEffect(() => {
    captureReferral();
    // /switch has to be a real, linkable URL — it's the target of outreach and
    // search listings, so it can't live behind an in-app click only.
    if (/^\/switch\/?$/i.test(window.location.pathname)) setPage('switch');
  }, []);
  // Signed-in members also get their matchmaker profile saved to their account.
  useEffect(() => {
    const u = userRef.current;
    if (u?.id) void saveProfile(u.id, u.name, userProfile, datingOn, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile, datingOn]);

  /**
   * Dating needs two things: a stage where dating makes sense, and a location
   * dating has reached. Community has neither requirement — it works anywhere,
   * so signup is national.
   *
   * Both are closed only by an answer we actually have. A blank stage or a
   * metro we never determined leaves dating open; only a stage that says "not
   * yet", or a postal code already checked and found outside, closes it.
   */
  const datingOpen = (stage: DivorceStage | null, metro: string | null) =>
    datingAvailableForStage(stage) && metro !== METRO_OUTSIDE;

  const [detailId, setDetailId] = useState<string | null>(null);
  const [matchPopId, setMatchPopId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastT = useRef<ReturnType<typeof setTimeout>>();

  const [commCat, setCommCat] = useState('All Topics');
  const [commSort, setCommSort] = useState<CommSort>('top');
  const [postDraft, setPostDraft] = useState('');
  const [posts, setPosts] = useState<Post[]>(POSTS);
  const [postLikes, setPostLikes] = useState<Record<number, boolean>>({});
  const [commentsOpen, setCommentsOpen] = useState<Record<number, boolean>>({});
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [viewingProfile, setViewingProfile] = useState<ProfileTarget | null>(null);
  const [verification, setVerification] = useState<VerificationInfo>({ divorceVerified: false, divorceStatus: null, divorceVerifiedAt: null });
  const [latestVerification, setLatestVerification] = useState<VerificationSubmission | null>(null);
  const [profileReturnPage, setProfileReturnPage] = useState<Page>('community');

  /**
   * The member pool behind Discover and the matchmaker.
   *
   * Starts as PROFILES, which is empty unless VITE_DEMO_PROFILES=1, and fills
   * from the database once a verified member signs in. Demo profiles stay
   * appended behind the real ones when that flag is on, so a development build
   * still has a populated grid without ever putting invented people in front of
   * a real member in production.
   */
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!user?.id) {
      setIsAdmin(false);
      return;
    }
    let live = true;
    void fetchIsAdmin().then((ok) => {
      if (live) setIsAdmin(ok);
    });
    return () => {
      live = false;
    };
  }, [user?.id]);

  const [pool, setPool] = useState<Profile[]>(PROFILES);
  const [poolState, setPoolState] = useState<PoolState>('idle');
  /** Live matches from the database. Empty for a demo-only build. */
  const [matchRows, setMatchRows] = useState<MatchSummary[]>([]);
  const [poolNonce, setPoolNonce] = useState(0);
  const reloadPool = () => setPoolNonce((n) => n + 1);

  const canBrowse = !!user?.id;
  /**
   * Photos are blurred until a member verifies their own divorce.
   *
   * Everyone *shown* is verified either way — that half of the promise is
   * unchanged. What an unverified member gives up is seeing faces clearly, and
   * being able to like anyone, which is the reason to verify.
   */
  const photosBlurred = !verification.divorceVerified;
  useEffect(() => {
    // Signed out there is nobody to ask as, so don't.
    if (!canBrowse) {
      setPool(PROFILES);
      setPoolState('idle');
      return;
    }
    let live = true;
    setPoolState('loading');
    void fetchDiscoverPool().then((members) => {
      if (!live) return;
      if (!members) {
        setPoolState('error');
        return;
      }
      setPool([...members, ...PROFILES]);
      setPoolState('ready');
    });
    // Who this member has already answered, and who they matched with. The feed
    // excludes both server-side; these keep the buttons and tabs in step.
    void fetchMyLikeActions().then((mine) => {
      if (!live || !mine) return;
      setLiked((l) => [...new Set([...l, ...mine.liked])]);
      setHidden((h2) => [...new Set([...h2, ...mine.passed])]);
    });
    void fetchMatches().then((rows) => {
      if (live && rows) setMatchRows(rows);
    });
    return () => {
      live = false;
    };
  }, [canBrowse, poolNonce]);

  useEffect(() => () => clearTimeout(toastT.current), []);

  const userRef = useRef<User | null>(null);
  userRef.current = user;
  const emailFlowActive = useRef(false);

  const showToast = (msg: string) => {
    clearTimeout(toastT.current);
    setToast(msg);
    toastT.current = setTimeout(() => setToast(null), 2800);
  };

  const nav = (p: Page, extraTab?: DashTab) => {
    window.scrollTo(0, 0);
    setPage(p);
    if (extraTab) setDashTab(extraTab);
  };

  const matchedProfiles = matchRows.map((m) => m.profile);
  // Demo matches live in local state; real ones come back from the database.
  const matchedIds = [...new Set([...matched, ...matchRows.map((m) => m.profile.id)])];
  /** A match is never in the discover feed, so look there too. */
  const prof = (id: string) => pool.find((p) => p.id === id) ?? matchedProfiles.find((p) => p.id === id);
  /**
   * Demo profiles keep the old local-only behaviour. They have no row in the
   * database, so writing a like for one would fail a foreign key; everything
   * about them stays in React state, exactly as before.
   */
  const isDemo = (id: string) => pool.find((p) => p.id === id)?.demo === true;
  const matchIdFor = (profileId: string) => matchRows.find((m) => m.profile.id === profileId)?.matchId;

  const loadConversation = (profileId: string) => {
    const matchId = matchIdFor(profileId);
    if (!matchId) return;
    void fetchMessages(matchId).then((msgs) => {
      if (!msgs) return;
      const myId = userRef.current?.id;
      setConvos((c) => ({
        ...c,
        [profileId]: msgs.map((m) => ({
          from: m.senderId === myId ? 'me' : 'them',
          text: m.body,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        }))
      }));
    });
    void markMatchRead(matchId).then(() => {
      setMatchRows((rows) => rows.map((r) => (r.matchId === matchId ? { ...r, unread: 0 } : r)));
    });
  };

  const scrollAnchor = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  };

  const doLike = (id: string) => {
    if (liked.includes(id)) return;
    // The likes insert policy refuses an unverified member, so without this the
    // click would come back as a generic save failure and tell them nothing.
    if (!isDemo(id) && !verification.divorceVerified) {
      showToast('Verify your divorce to like and match — it takes a couple of minutes');
      setDashTab('profile');
      return;
    }
    setLiked((l) => [...l, id]);

    if (isDemo(id)) {
      if (LIKES_BACK.includes(id) && !matchedIds.includes(id)) {
        setMatched((m) => [...m, id]);
        setConvos((c) => ({ ...c, [id]: c[id] || [] }));
        setMatchPopId(id);
      }
      return;
    }

    // A real like is written before we know whether it matched — only the
    // server can tell us, since the other person's like is not ours to read.
    void sendLikeAction(id, 'like').then((res) => {
      if (!res) {
        setLiked((l) => l.filter((x) => x !== id));
        showToast("That didn't save — please try again.");
        return;
      }
      setMatchRows(res.matches);
      if (res.newMatch) setMatchPopId(id);
    });
  };

  const openChat = (id: string) => {
    if (!matchedIds.includes(id)) {
      showToast("You can only message people you've matched with");
      return;
    }
    setChatId(id);
    setDetailId(null);
    setMatchPopId(null);
    if (!isDemo(id)) loadConversation(id);
  };

  const sendChat = () => {
    const id = chatId;
    const text = chatDraft.trim();
    if (!id || !text) return;
    if (violatesLanguagePolicy(text)) {
      showToast('Our safety bot flagged that wording — Haply runs on kindness. Please rephrase 💛');
      return;
    }
    setConvos((c) => ({ ...c, [id]: [...(c[id] || []), { from: 'me', text, time: 'Just now' }] }));
    setChatDraft('');
    scrollBottom('chatScroll');

    if (!isDemo(id)) {
      // A real conversation with a real person. Nothing replies on a timer, and
      // nothing should pretend to: the message is sent, and the other member
      // answers when they answer.
      const matchId = matchIdFor(id);
      if (!matchId) return;
      void sendMessage(matchId, text).then((ok) => {
        if (!ok) {
          showToast("That message didn't send — please try again.");
          return;
        }
        void fetchMatches().then((rows) => rows && setMatchRows(rows));
      });
      return;
    }

    // Demo profiles only: canned replies so the UI can be shown without an
    // account. Never reachable for a real member.
    setChatTyping(true);
    setTimeout(() => {
      if (chatIdRef.current !== id) {
        setChatTyping(false);
        return;
      }
      const replies = CHAT_REPLIES[id] || ["That's so great to hear!", 'Tell me more about yourself 😊'];
      const idx = replyIdx.current[id] || 0;
      replyIdx.current[id] = idx + 1;
      setChatTyping(false);
      setConvos((c) => ({ ...c, [id]: [...(c[id] || []), { from: 'them', text: replies[idx % replies.length], time: 'Just now' }] }));
      scrollBottom('chatScroll');
    }, 1500);
  };

  /**
   * Claude reads the message when the matchmaker function is available; the
   * local rules engine answers otherwise. Either way the profile it produces is
   * what the app filters on, so preferences are always enforced in code.
   */
  const sendAi = () => {
    const text = aiDraft.trim();
    if (!text || aiTyping) return;
    if (violatesLanguagePolicy(text)) {
      showToast('Our safety bot flagged that wording — Haply runs on kindness. Please rephrase 💛');
      return;
    }
    const history: AiMsg[] = [...aiMsgs, { from: 'me', text, at: nowLabel() }];
    setAiMsgs(history);
    setAiDraft('');
    setAiTyping(true);
    scrollBottom('aiScroll');

    const started = Date.now();
    const finish = (profile: UserProfile, replyText: string) => {
      const ready = profileReady(profile);
      setUserProfile(profile);
      // Snapshot results against the profile THIS turn produced. Deriving them at
      // render time instead would rewrite the whole history on every new message.
      const intros = ready ? buildIntros(pool, profile, gsLooking, 8) : undefined;
      const filters = ready ? describeFilters(profile, gsLooking) : undefined;
      const total = ready ? countMatches(pool, profile, gsLooking) : undefined;
      // Keep a beat of "typing" so a fast reply doesn't snap in unnaturally.
      setTimeout(
        () => {
          setAiMsgs((m) => [...m, { from: 'ai', text: replyText, intros, filters, total, at: nowLabel() }]);
          setAiTyping(false);
          if (ready) setAiShowMatches(true);
          scrollBottom('aiScroll');
        },
        Math.max(0, 700 - (Date.now() - started))
      );
    };

    void aiTurn(history, userProfile).then((ai) => {
      if (ai) {
        finish(ai.profile, ai.reply);
        return;
      }
      const absorbed = absorbMessage(text, userProfile);
      const reply = matchmakerReply(absorbed, profileReady(absorbed.profile) && !aiShowMatches);
      finish({ ...absorbed.profile, lastAsked: reply.lastAsked }, reply.text);
    });
  };

  const refreshPosts = async (uid?: string) => {
    const res = await fetchPosts(uid);
    if (res) {
      setPosts(res.posts);
      setPostLikes(res.myLikes);
    }
  };
  useEffect(() => {
    void refreshPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Bring a signed-in member into the app: load their saved profile, land on the dashboard. */
  const enterAsUser = async (u: DbUser, opts: { toast?: string; intent?: Intent; isNew?: boolean }) => {
    setUser({ name: u.name, email: u.email, id: u.id });
    setAuthOpen(false);
    setAuthError('');
    const loaded = opts.isNew ? null : await loadProfile(u.id);
    if (loaded) {
      setUserProfile((prev) => (profileReady(loaded.profile) || loaded.profile.intro ? loaded.profile : prev));
      setDatingOn(loaded.datingOn);
      setVerification(loaded.verification);
      setJourney(loaded.journey);
      setDashTab('community');
    } else {
      const intent = opts.intent ?? gsIntent;
      const stage: DivorceStage | null = gsStage || null;
      // Dating only opens for someone who said they're ready for it, whatever
      // they picked as their intent — the stage answer is the honest one.
      // Dating needs a launch metro as well as a workable stage. Someone who
      // signed up for dating from outside one still gets an account — community
      // is national — so record what they came for, which is also how we learn
      // where the next metro should be.
      // Record which kind of "no metro" this is: checked and outside, versus
      // never asked. Only the first should ever close dating.
      const metro = gsMetro?.slug ?? (gsPostal ? METRO_OUTSIDE : null);
      const wantsDating = intent !== 'community' && datingOpen(stage, metro);
      if (intent !== 'community' && metro === METRO_OUTSIDE) void joinWaitlist(u.email, gsPostal, 'dating');
      setDatingOn(wantsDating);
      setVerification({ divorceVerified: false, divorceStatus: null, divorceVerifiedAt: null });
      setJourney({ metro, stage, coParenting: {} });
      setDashTab(wantsDating && intent === 'dating' ? 'discover' : 'community');
      void saveProfile(u.id, u.name, userProfile, wantsDating, {
        intent: intent || undefined,
        postal: gsPostal || undefined,
        metro,
        stage
      });
      if (opts.isNew) void acceptTerms(u.id, TERMS_VERSION);
    }
    void fetchLatestVerification(u.id).then(setLatestVerification);
    nav('dashboard');
    if (opts.toast) showToast(opts.toast);
    void refreshPosts(u.id);
  };

  // Surface OAuth failures that come back on the redirect (provider disabled,
  // redirect URL not allowed, consent declined) instead of failing silently.
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const query = new URLSearchParams(window.location.search);
    const detail = hash.get('error_description') || query.get('error_description');
    const code = hash.get('error') || query.get('error');
    if (detail || code) {
      showToast(`Sign-in didn't finish: ${detail || code}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Session restore on load + OAuth redirect handling.
  useEffect(() => {
    const off = onAuth((u) => {
      if (u && !userRef.current && !emailFlowActive.current) {
        void enterAsUser(u, {});
      }
    });
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const authSubmit = async () => {
    if (!authEmail.trim() || !authPassword.trim() || (authType === 'signup' && !authName.trim())) {
      setAuthError('Please fill in all fields to continue.');
      return;
    }
    if (authType === 'signup' && !authTermsChecked) {
      setAuthError('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }
    emailFlowActive.current = true;
    try {
      if (authType === 'signup') {
        const r = await signUpEmail(authName.trim(), authEmail.trim(), authPassword);
        if (r.error) setAuthError(r.error);
        else if (r.needsConfirm) {
          setAuthError('');
          setAuthType('login');
          showToast('Almost there — check your email to confirm your account, then log in 💛');
        } else if (r.user) {
          await enterAsUser(r.user, { toast: `Welcome to Haply, ${r.user.name} — your free account is ready 💛`, intent: gsIntent, isNew: true });
        }
      } else {
        const r = await signInEmail(authEmail.trim(), authPassword);
        if (r.error) setAuthError(r.error);
        else if (r.user) await enterAsUser(r.user, { toast: `Welcome back, ${r.user.name}!` });
      }
    } finally {
      emailFlowActive.current = false;
    }
  };

  const invite = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(INVITE_LINK).catch(() => {});
    showToast('Invite link copied — share it with someone starting over 💛');
  };

  const h: H = {
    user,
    userName: user ? user.name : 'Guest',
    userEmail: user ? user.email : '',
    userInitial: user ? user.name.charAt(0).toUpperCase() : 'G',
    datingOn,

    goHome: () => nav('home'),
    goGetStarted: () => nav('get-started'),
    goCommunity: () => {
      if (user) nav('dashboard', 'community');
      else nav('community');
    },
    goBackFromCommunity: () => nav(user ? 'dashboard' : 'home'),
    scrollAnchor,
    stubPage: () => showToast("This page isn't part of the prototype yet — coming soon!"),
    invite,
    pickGroup: (city) => {
      if (user) nav('dashboard', 'community');
      else showToast(`Join free to enter the ${city} group`);
    },
    rsvp: (name) => showToast(`${name} unlock as your city group grows — we'll let you know 🎟`),
    groupToast: () => showToast('Group chat opens in the full app — coming soon!'),
    settingsToast: () => showToast('Profile settings are not part of this prototype yet.'),

    openLogin: () => {
      setAuthOpen(true);
      setAuthType('login');
      setAuthError('');
    },
    logout: () => {
      void signOutBackend();
      setUser(null);
      setUserProfile(emptyProfile());
      setAiShowMatches(false);
      nav('home');
      showToast('You have been logged out');
    },

    gsIntent,
    pickIntent: (v) => {
      setGsIntent(v);
      setGsErr((e) => ({ ...e, intent: false }));
    },
    gsGender,
    pickGender: (v) => {
      setGsGender(v);
      setGsErr((e) => ({ ...e, gender: false }));
    },
    gsLooking,
    pickLooking: (v) => {
      setGsLooking(v);
      setGsErr((e) => ({ ...e, looking: false }));
    },
    gsPostal,
    setGsPostal: (v) => {
      setGsPostal(v);
      setGsErr((e) => ({ ...e, postal: false }));
    },
    gsConfirm,
    toggleGsConfirm: () => {
      setGsConfirm((c) => !c);
      setGsErr((e) => ({ ...e, confirm: false }));
    },
    gsErr,
    gsContinue: () => {
      const wantsDating = gsIntent === 'dating' || gsIntent === 'both';
      // The wizard only asks who you are and who you'd like to meet once the
      // stage says dating is on the table. Requiring answers it never asked for
      // left "Dating" plus "Just separated" stuck on Continue with nothing on
      // screen to fix — the condition has to match what GetStarted renders.
      const asksDatingQuestions = wantsDating && gsStage === 'ready';
      const metro = metroForPostal(gsPostal);
      const err: GsErr = {
        intent: !gsIntent,
        stage: !gsStage,
        gender: asksDatingQuestions && !gsGender,
        looking: asksDatingQuestions && !gsLooking,
        postal: !metroForPostal(gsPostal) && !/^\d{5}(\d{4})?$/.test(gsPostal.replace(/\s|-/g, '')),
        confirm: !gsConfirm
      };
      if (err.intent || err.stage || err.gender || err.looking || err.postal || err.confirm) {
        setGsErr(err);
        return;
      }
      setGsMetro(metro);
      // Community works anywhere, so a postal code outside the launch metros is
      // no longer a reason to refuse an account. Only dating is metro-gated, so
      // only someone who came for dating needs to hear about it first.
      // Keyed off intent, not off the questions above: someone who came to date
      // deserves to hear that dating isn't open near them whatever stage
      // they're at.
      if (!metro && wantsDating) {
        setGsOutOfArea(true);
        return;
      }
      setAuthOpen(true);
      setAuthType('signup');
      setAuthError('');
    },
    gsStage,
    pickStage: (v) => {
      setGsStage(v);
      setGsErr((e) => ({ ...e, stage: false }));
    },
    gsOutOfArea,
    gsWaitlistEmail,
    setGsWaitlistEmail,
    gsWaitlistDone,
    gsWaitlistSubmit: () => {
      const email = gsWaitlistEmail.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
      void joinWaitlist(email, gsPostal).then((r) => {
        if (r.ok) setGsWaitlistDone(true);
        else showToast("Couldn't save that just now — please try again.");
      });
    },
    gsJoinAnyway: () => {
      setGsOutOfArea(false);
      setAuthOpen(true);
      setAuthType('signup');
      setAuthError('');
    },
    gsBackToPostal: () => {
      setGsOutOfArea(false);
      setGsWaitlistDone(false);
    },

    journey,
    datingAvailable: datingOpen(journey.stage, journey.metro),
    datingBlockedBy: datingOpen(journey.stage, journey.metro) ? null : (!datingAvailableForStage(journey.stage) ? 'stage' : 'location'),
    isAdmin,
    photosBlurred,
    markVerifiedForTesting: (status) => {
      setVerification({ divorceVerified: true, divorceStatus: status, divorceVerifiedAt: new Date().toISOString() });
      showToast('Verified for testing — photos are clear and you can like people now');
    },
    setStage: (s) => {
      setJourney((j) => ({ ...j, stage: s }));
      if (!datingOpen(s, journey.metro)) setDatingOn(false);
      if (user?.id) void saveProfile(user.id, user.name, userProfile, datingOpen(s, journey.metro) && datingOn, { stage: s });
    },
    saveCoParenting: (c) => {
      setJourney((j) => ({ ...j, coParenting: c }));
      if (user?.id) void saveProfile(user.id, user.name, userProfile, datingOn, { coParenting: c });
    },

    authOpen,
    authType,
    setAuthType: (t) => {
      setAuthType(t);
      setAuthError('');
    },
    authName,
    setAuthName,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    authTermsChecked,
    setAuthTermsChecked,
    authError,
    authSubmit,
    socialAuth: (provider) => {
      if (authType === 'signup' && !authTermsChecked) {
        setAuthError('Please agree to the Terms of Service and Privacy Policy to continue.');
        return;
      }
      void signInProvider(provider.toLowerCase() as 'google' | 'facebook' | 'apple').then(({ error }) => {
        if (error) showToast(`${provider} sign-in isn't enabled yet — email works right now.`);
      });
    },
    closeAuth: () => setAuthOpen(false),

    legalSection,
    openLegal: (section) => setLegalSection(section),
    closeLegal: () => setLegalSection(null),

    dashTab,
    setDashTab,
    tabDiscover: () => {
      if (datingOn) setDashTab('discover');
      else showToast("You're in community-only mode — turn on dating from your profile");
    },
    tabAI: () => {
      if (datingOn) setDashTab('ai-match');
      else showToast("You're in community-only mode — turn on dating from your profile");
    },
    turnDatingOn: () => {
      setDatingOn(true);
      setDashTab('discover');
      showToast('Dating is on — welcome to Discover 💛');
    },
    toggleDating: () => {
      const next = !datingOn;
      setDatingOn(next);
      if (!next) setDashTab('community');
      showToast(next ? "Dating is on — you're visible in Discover" : "Community-only mode — you're hidden from daters");
    },

    liked,
    hidden,
    matchedProfiles,
    matched: matchedIds,
    doLike,
    passProfile: (id) => {
      setHidden((hd) => [...hd, id]);
      setDetailId(null);
      const p = prof(id);
      if (p) showToast(`${p.name} hidden from your feed`);
      // Recorded so they stay hidden after a reload, not just this session —
      // but only an account that may write likes can record a pass, so for an
      // unverified member this stays a local hide for the session.
      if (!isDemo(id) && verification.divorceVerified) void sendLikeAction(id, 'pass');
    },
    openChat,
    startOver: () => {
      setHidden([]);
      const el = document.getElementById('feed');
      if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
    },

    detailId,
    openDetail: (id) => setDetailId(id),
    closeDetail: () => setDetailId(null),

    chatId,
    chatDraft,
    setChatDraft,
    chatTyping,
    convos,
    sendChat,
    closeChat: () => {
      setChatId(null);
      setChatTyping(false);
    },

    aiMsgs,
    aiDraft,
    setAiDraft,
    aiTyping,
    aiShowMatches,
    sendAi,
    userProfile,
    seeking: userProfile.seeking,

    matchPopId,
    closeMatchPop: () => setMatchPopId(null),

    commCat,
    setCommCat,
    commSort,
    setCommSort,
    posts,
    postLikes,
    togglePostLike: (id) => {
      if (!user?.id) {
        showToast('Join free to upvote');
        return;
      }
      const nowLiked = !postLikes[id];
      setPostLikes((pl) => ({ ...pl, [id]: nowLiked }));
      void setPostLike(id, user.id, nowLiked);
    },
    postDraft,
    setPostDraft,
    submitPost: () => {
      const text = postDraft.trim();
      if (!text) {
        showToast('Write something first!');
        return;
      }
      if (violatesLanguagePolicy(text)) {
        showToast('Our safety bot flagged that wording — Haply runs on kindness. Please rephrase 💛');
        return;
      }
      const cat = commCat === 'All Topics' ? 'Divorce Support' : commCat;
      const title = text.length > 60 ? text.slice(0, 57) + '…' : text;
      const body = text.length > 60 ? text : 'Posted to the Haply community.';
      setPostDraft('');
      if (user?.id) {
        void createPost(user.id, user.name, cat, title, body).then((row) => {
          if (row) {
            setPosts((ps) => [row, ...ps.filter((p) => !p.time.startsWith('Sending'))]);
            showToast('Posted to the community 💬');
          } else {
            showToast("Couldn't reach the community right now — please try again.");
          }
        });
      } else {
        setPosts((ps) => [{ id: Date.now(), name: 'You', cat, time: 'Just now', title, body, likes: 0, comments: 0 }, ...ps]);
        showToast('Posted to the community 💬');
      }
    },

    commentsOpen,
    comments,
    commentDrafts,
    toggleComments: (postId) => {
      setCommentsOpen((co) => ({ ...co, [postId]: !co[postId] }));
      if (!comments[postId]) {
        void fetchComments(postId).then((cs) => {
          if (cs) setComments((c) => ({ ...c, [postId]: cs }));
        });
      }
    },
    setCommentDraft: (postId, v) => setCommentDrafts((d) => ({ ...d, [postId]: v })),
    submitComment: (postId) => {
      const text = (commentDrafts[postId] || '').trim();
      if (!text || !user?.id) return;
      if (violatesLanguagePolicy(text)) {
        showToast('Our safety bot flagged that wording — Haply runs on kindness. Please rephrase 💛');
        return;
      }
      setCommentDrafts((d) => ({ ...d, [postId]: '' }));
      void createComment(postId, user.id, user.name, text).then((c) => {
        if (c) {
          setComments((cs) => ({ ...cs, [postId]: [...(cs[postId] || []), c] }));
          setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)));
        } else {
          showToast("Couldn't post your reply right now — please try again.");
        }
      });
    },

    viewingProfile,
    goToProfile: (target) => {
      setProfileReturnPage(page);
      setViewingProfile(target);
      nav('community-profile');
    },
    backFromProfile: () => nav(profileReturnPage),

    verification,
    latestVerification,
    submitVerification: async (fields, file) => {
      if (!user?.id) return { error: 'not_signed_in' };
      const result = await submitDivorceVerification(user.id, fields, file);
      if (result.status) {
        void fetchLatestVerification(user.id).then(setLatestVerification);
        if (result.status === 'approved') {
          setVerification({ divorceVerified: true, divorceStatus: fields.statusClaimed, divorceVerifiedAt: new Date().toISOString() });
          showToast("You're verified — your badge is now visible to other members 💛");
        } else {
          setVerification((v) => ({ ...v, divorceVerified: false }));
        }
      }
      return result;
    },
    appealChat: (verificationId, messages) => appealChat(verificationId, messages),
    requestHumanReview: (verificationId) => requestHumanReview(verificationId),

    prof,
    pool,
    poolState,
    reloadPool
  };

  return (
    <>
      {page === 'home' && <Landing h={h} />}
      {page === 'switch' && <SwitchPage h={h} />}
      {page === 'get-started' && <GetStarted h={h} />}
      {page === 'community' && <CommunityPublic h={h} />}
      {page === 'dashboard' && <Dashboard h={h} />}
      {page === 'community-profile' && <CommunityProfilePage h={h} />}
      {authOpen && <AuthModal h={h} />}
      {legalSection && <LegalModal h={h} />}
      {chatId !== null && <ChatDialog h={h} />}
      {detailId !== null && <DetailModal h={h} />}
      {matchPopId !== null && <MatchPop h={h} />}
      {/* A staging build looks exactly like production, so say which one this
          is. Only ever rendered when the backend is not the production one. */}
      {IS_STAGING_BACKEND && (
        <div
          style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999, background: '#211D1A', color: '#FDE68A', fontSize: 12.5, fontWeight: 600, textAlign: 'center', padding: '6px 12px', letterSpacing: '0.02em' }}
        >
          Staging — separate test database. Nothing here is real.
        </div>
      )}
      {toast && <Toast text={toast} />}
    </>
  );
}
