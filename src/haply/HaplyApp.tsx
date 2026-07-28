import { useEffect, useRef, useState } from 'react';
import './styles.css';
import { CHAT_REPLIES, INVITE_LINK, LIKES_BACK, POSTS, PROFILES, violatesLanguagePolicy, type Post, type Profile } from './data';
import { absorbMessage, buildIntros, countMatches, describeFilters, emptyProfile, matchmakerReply, profileReady, type Intro, type UserProfile } from './matchmaker';
import {
  createComment,
  createPost,
  fetchComments,
  fetchPosts,
  loadProfile,
  onAuth,
  saveProfile,
  setPostLike,
  signInEmail,
  signInProvider,
  signOutBackend,
  signUpEmail,
  type Comment,
  type DbUser
} from './backend';
import { aiTurn } from './aiMatchmaker';
import type { ProfileTarget } from './avatars';
import { Landing } from './Landing';
import { GetStarted } from './GetStarted';
import { CommunityPublic } from './CommunityPublic';
import { CommunityProfilePage } from './CommunityProfile';
import { Dashboard } from './Dashboard';
import { AuthModal, ChatDialog, DetailModal, MatchPop, Toast } from './Overlays';

export type Page = 'home' | 'get-started' | 'community' | 'dashboard' | 'community-profile';
export type CommSort = 'top' | 'new';
export type DashTab = 'community' | 'discover' | 'ai-match' | 'matches' | 'messages' | 'profile';
export type Intent = '' | 'community' | 'dating' | 'both';
export type AuthType = 'login' | 'signup';

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

  authOpen: boolean;
  authType: AuthType;
  setAuthType: (t: AuthType) => void;
  authName: string;
  setAuthName: (v: string) => void;
  authEmail: string;
  setAuthEmail: (v: string) => void;
  authPassword: string;
  setAuthPassword: (v: string) => void;
  authError: string;
  authSubmit: () => void;
  socialAuth: (provider: 'Google' | 'Facebook' | 'Apple') => void;
  closeAuth: () => void;

  dashTab: DashTab;
  setDashTab: (t: DashTab) => void;
  tabDiscover: () => void;
  tabAI: () => void;
  turnDatingOn: () => void;
  toggleDating: () => void;

  liked: number[];
  hidden: number[];
  matched: number[];
  doLike: (id: number) => void;
  passProfile: (id: number) => void;
  openChat: (id: number) => void;
  startOver: () => void;

  detailId: number | null;
  openDetail: (id: number) => void;
  closeDetail: () => void;

  chatId: number | null;
  chatDraft: string;
  setChatDraft: (v: string) => void;
  chatTyping: boolean;
  convos: Record<number, ChatMsg[]>;
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

  matchPopId: number | null;
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

  prof: (id: number) => Profile | undefined;
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
  const [authError, setAuthError] = useState('');

  const [gsIntent, setGsIntent] = useState<Intent>('');
  const [gsGender, setGsGender] = useState('');
  const [gsLooking, setGsLooking] = useState('');
  const [gsPostal, setGsPostal] = useState('');
  const [gsConfirm, setGsConfirm] = useState(false);
  const [gsErr, setGsErr] = useState<GsErr>({});

  const [liked, setLiked] = useState<number[]>([1, 3]);
  const [hidden, setHidden] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([1, 3]);
  const [convos, setConvos] = useState<Record<number, ChatMsg[]>>({
    1: [
      { from: 'them', text: "Hey! Thanks for the match. How's your day going?", time: '2h ago' },
      { from: 'me', text: "Hi! It's going great, thanks! Love your profile, you seem really interesting.", time: '1h ago' }
    ],
    3: [
      { from: 'me', text: 'Hi there! Your art sounds amazing. Would love to hear more about it!', time: '4h ago' },
      { from: 'them', text: "Thank you! I'd love to share. Do you have any creative hobbies?", time: '3h ago' }
    ]
  });
  const [chatId, setChatId] = useState<number | null>(null);
  const [chatDraft, setChatDraft] = useState('');
  const [chatTyping, setChatTyping] = useState(false);
  const replyIdx = useRef<Record<number, number>>({});
  const chatIdRef = useRef<number | null>(null);
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
  // Signed-in members also get their matchmaker profile saved to their account.
  useEffect(() => {
    const u = userRef.current;
    if (u?.id) void saveProfile(u.id, u.name, userProfile, datingOn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile, datingOn]);

  const [detailId, setDetailId] = useState<number | null>(null);
  const [matchPopId, setMatchPopId] = useState<number | null>(null);
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
  const [profileReturnPage, setProfileReturnPage] = useState<Page>('community');

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

  const prof = (id: number) => PROFILES.find((p) => p.id === id);

  const scrollAnchor = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  };

  const doLike = (id: number) => {
    if (liked.includes(id)) return;
    setLiked((l) => [...l, id]);
    if (LIKES_BACK.includes(id) && !matched.includes(id)) {
      setMatched((m) => [...m, id]);
      setConvos((c) => ({ ...c, [id]: c[id] || [] }));
      setMatchPopId(id);
    }
  };

  const openChat = (id: number) => {
    if (matched.includes(id)) {
      setChatId(id);
      setDetailId(null);
      setMatchPopId(null);
    } else {
      showToast("You can only message people you've matched with");
    }
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
    setChatTyping(true);
    scrollBottom('chatScroll');
    setTimeout(() => {
      if (chatIdRef.current !== id) {
        setChatTyping(false);
        return;
      }
      const pool = CHAT_REPLIES[id] || ["That's so great to hear!", 'Tell me more about yourself 😊'];
      const idx = replyIdx.current[id] || 0;
      replyIdx.current[id] = idx + 1;
      setChatTyping(false);
      setConvos((c) => ({ ...c, [id]: [...(c[id] || []), { from: 'them', text: pool[idx % pool.length], time: 'Just now' }] }));
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
      const intros = ready ? buildIntros(profile, gsLooking, 8) : undefined;
      const filters = ready ? describeFilters(profile, gsLooking) : undefined;
      const total = ready ? countMatches(profile, gsLooking) : undefined;
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
      setDashTab('community');
    } else {
      const intent = opts.intent ?? gsIntent;
      setDatingOn(intent !== 'community');
      setDashTab(intent === 'dating' ? 'discover' : 'community');
      void saveProfile(u.id, u.name, userProfile, intent !== 'community', intent || undefined, gsPostal || undefined);
    }
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
      const showDating = gsIntent === 'dating' || gsIntent === 'both';
      const err: GsErr = {
        intent: !gsIntent,
        gender: showDating && !gsGender,
        looking: showDating && !gsLooking,
        postal: !/^[A-Za-z0-9\s-]{3,10}$/.test(gsPostal),
        confirm: !gsConfirm
      };
      if (err.intent || err.gender || err.looking || err.postal || err.confirm) {
        setGsErr(err);
        return;
      }
      setAuthOpen(true);
      setAuthType('signup');
      setAuthError('');
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
    authError,
    authSubmit,
    socialAuth: (provider) => {
      void signInProvider(provider.toLowerCase() as 'google' | 'facebook' | 'apple').then(({ error }) => {
        if (error) showToast(`${provider} sign-in isn't enabled yet — email works right now.`);
      });
    },
    closeAuth: () => setAuthOpen(false),

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
    matched,
    doLike,
    passProfile: (id) => {
      setHidden((hd) => [...hd, id]);
      setDetailId(null);
      const p = prof(id);
      if (p) showToast(`${p.name} hidden from your feed`);
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

    prof
  };

  return (
    <>
      {page === 'home' && <Landing h={h} />}
      {page === 'get-started' && <GetStarted h={h} />}
      {page === 'community' && <CommunityPublic h={h} />}
      {page === 'dashboard' && <Dashboard h={h} />}
      {page === 'community-profile' && <CommunityProfilePage h={h} />}
      {authOpen && <AuthModal h={h} />}
      {chatId !== null && <ChatDialog h={h} />}
      {detailId !== null && <DetailModal h={h} />}
      {matchPopId !== null && <MatchPop h={h} />}
      {toast && <Toast text={toast} />}
    </>
  );
}
