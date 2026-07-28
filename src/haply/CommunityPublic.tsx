import { avatarForPost, generatedAvatarDataUri } from './avatars';
import { IdentityLink } from './CommunityIdentity';
import { CATS, type Post } from './data';
import type { H } from './HaplyApp';
import { Ic, Logo, serif } from './ui';

/** A post's combined engagement — upvotes plus replies — used to rank the "Top" sort. */
function engagementScore(h: H, p: Post): number {
  return p.likes + (h.postLikes[p.id] ? 1 : 0) + p.comments;
}

export function filteredPosts(h: H): Post[] {
  const byCat = h.commCat === 'All Topics' ? h.posts : h.posts.filter((p) => p.cat === h.commCat);
  // Pinned posts (staff announcements) always lead, regardless of sort — same convention as a subreddit's sticky post.
  const pinned = byCat.filter((p) => p.time === 'Pinned');
  const rest = byCat.filter((p) => p.time !== 'Pinned');
  if (h.commSort === 'new') return [...pinned, ...rest];
  return [...pinned, ...rest.sort((a, b) => engagementScore(h, b) - engagementScore(h, a))];
}

export function CatPills({ h, small }: { h: H; small?: boolean }) {
  return (
    <>
      {CATS.map((c) => {
        const on = h.commCat === c;
        return (
          <button
            key={c}
            onClick={() => h.setCommCat(c)}
            style={{
              borderRadius: 999,
              padding: small ? '7px 15px' : '8px 16px',
              fontSize: small ? 13 : 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all .15s',
              background: on ? '#211D1A' : '#fff',
              color: on ? '#fff' : '#44403C',
              border: on ? '1px solid #211D1A' : '1px solid #D6CCC2'
            }}
          >
            {c}
          </button>
        );
      })}
    </>
  );
}

export function SortToggle({ h }: { h: H }) {
  const options = [
    { key: 'top' as const, label: 'Top', icon: 'trending_up' },
    { key: 'new' as const, label: 'New', icon: 'schedule' }
  ];
  return (
    <div style={{ display: 'flex', gap: 4, background: '#F0E9E2', borderRadius: 999, padding: 4, flexShrink: 0 }}>
      {options.map((o) => {
        const on = h.commSort === o.key;
        return (
          <button
            key={o.key}
            onClick={() => h.setCommSort(o.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: 'none',
              borderRadius: 999,
              padding: '7px 14px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              background: on ? '#fff' : 'transparent',
              color: on ? '#211D1A' : '#78716C',
              boxShadow: on ? '0 1px 3px rgba(33,29,26,0.12)' : 'none'
            }}
          >
            <Ic name={o.icon} size={15} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function PostCard({ post, h }: { post: Post; h: H }) {
  const liked = !!h.postLikes[post.id];
  const av = avatarForPost(post);
  const open = !!h.commentsOpen[post.id];
  const list = h.comments[post.id] || [];
  const nameBlock = (
    <>
      <img src={av.src} alt={post.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, background: '#F0E9E2' }} />
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#211D1A', display: 'flex', alignItems: 'center', gap: 5 }}>
          {post.name}
          <Ic name="verified" fill size={14} color="#16a34a" />
        </div>
        <div style={{ fontSize: 12, color: '#78716C' }}>{post.time}</div>
      </div>
    </>
  );
  return (
    <div style={{ background: '#fff', border: '1px solid #EDE6DF', borderRadius: 16, display: 'flex' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '18px 10px', width: 48, flexShrink: 0, borderRight: '1px solid #F0E9E2' }}>
        <button
          onClick={() => h.togglePostLike(post.id)}
          title="Upvote"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', color: liked ? '#e11d48' : '#A8A29E' }}
        >
          <Ic name="arrow_upward" fill={liked} size={22} />
        </button>
        <span style={{ fontSize: 13, fontWeight: 700, color: liked ? '#e11d48' : '#44403C' }}>{post.likes + (liked ? 1 : 0)}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0, padding: '20px 24px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          {av.target ? (
            <IdentityLink h={h} target={av.target} style={{ flex: 1 }}>
              {nameBlock}
            </IdentityLink>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>{nameBlock}</div>
          )}
          <span style={{ background: '#FFF1F2', color: '#be123c', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999 }}>{post.cat}</span>
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 6px', color: '#211D1A' }}>{post.title}</h3>
        <p style={{ fontSize: 15, color: '#44403C', margin: '0 0 14px', lineHeight: 1.6 }}>{post.body}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={() => h.toggleComments(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#78716C', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Ic name="chat_bubble" size={18} />
            {post.comments}
          </button>
        </div>
        {open && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #F0E9E2', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map((c) => {
            const cav = generatedAvatarDataUri(c.userId, c.name.charAt(0));
            return (
              <div key={c.id} style={{ display: 'flex', gap: 10 }}>
                <IdentityLink h={h} target={{ kind: 'member', uid: c.userId, name: c.name }} style={{ flexShrink: 0 }}>
                  <img src={cav} alt={c.name} style={{ width: 30, height: 30, borderRadius: '50%' }} />
                </IdentityLink>
                <div style={{ background: '#FAF7F4', borderRadius: 12, padding: '8px 12px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <IdentityLink h={h} target={{ kind: 'member', uid: c.userId, name: c.name }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                    </IdentityLink>
                    <span style={{ fontSize: 11, color: '#A8A29E' }}>{c.time}</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#44403C', margin: '2px 0 0', lineHeight: 1.5 }}>{c.body}</p>
                </div>
              </div>
            );
          })}
          {list.length === 0 && <p style={{ fontSize: 13, color: '#A8A29E', margin: 0 }}>No replies yet — be the first.</p>}
          {h.user ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <img src={generatedAvatarDataUri(h.user.id || h.userName, h.userInitial)} alt="" style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Write a reply..."
                value={h.commentDrafts[post.id] || ''}
                onChange={(e) => h.setCommentDraft(post.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') h.submitComment(post.id);
                }}
                className="fcb-rose"
                style={{ flex: 1, border: '1px solid #EDE6DF', borderRadius: 999, padding: '8px 14px', fontSize: 14, outline: 'none', background: '#FAF7F4' }}
              />
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#78716C', margin: 0 }}>
              <button onClick={h.goGetStarted} className="hvc-rose" style={{ background: 'none', border: 'none', color: '#e11d48', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: 13 }}>
                Join free
              </button>{' '}
              to reply.
            </p>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

export function Composer({ h, dash }: { h: H; dash?: boolean }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EDE6DF', borderRadius: 16, padding: 16, marginBottom: dash ? 20 : 24 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <img src={generatedAvatarDataUri(h.user?.id || h.userName, h.userInitial)} alt="" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
        <textarea
          placeholder={dash ? "What's on your mind? The community's listening…" : 'Share something with the community...'}
          value={h.postDraft}
          onChange={(e) => h.setPostDraft(e.target.value)}
          className="fcb-rose"
          style={{ flex: 1, border: '1px solid #EDE6DF', borderRadius: 10, padding: '10px 12px', fontSize: 15, resize: 'none', minHeight: dash ? 56 : 60, outline: 'none', background: '#FAF7F4' }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
        <button onClick={h.submitPost} className="hvb-rosedeep" style={{ background: '#e11d48', color: '#fff', border: 'none', borderRadius: 999, padding: dash ? '8px 20px' : '9px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Post
        </button>
      </div>
    </div>
  );
}

export function CommunityPublic({ h }: { h: H }) {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F4' }}>
      <div style={{ background: '#FAF7F4', borderBottom: '1px solid #EDE6DF', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px,4vw,32px)', display: 'flex', alignItems: 'center', gap: 16, height: 64 }}>
          <button onClick={h.goBackFromCommunity} className="hvc-rose" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#57534E', fontSize: 15, cursor: 'pointer', padding: 0 }}>
            <Ic name="arrow_back" size={20} />
            <span>Back</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
            <Logo size={26} color="#e11d48" />
            <div>
              <h1 style={{ fontFamily: serif, fontSize: 18, fontWeight: 700, margin: 0 }}>Haply Community</h1>
              <p style={{ fontSize: 12, color: '#78716C', margin: 0 }}>The divorced dating community</p>
            </div>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '36px clamp(16px,4vw,32px)' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <CatPills h={h} />
          </div>
          <SortToggle h={h} />
        </div>
        {h.user ? (
          <Composer h={h} />
        ) : (
          <div style={{ background: '#fff', border: '1.5px dashed #FECDD3', borderRadius: 16, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>Join the conversation</h3>
              <p style={{ margin: 0, fontSize: 14, color: '#57534E' }}>Membership is free — verified divorced people only.</p>
            </div>
            <button onClick={h.goGetStarted} className="hvb-rosedeep" style={{ background: '#e11d48', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Join free
            </button>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredPosts(h).map((po) => (
            <PostCard key={po.id} post={po} h={h} />
          ))}
        </div>
      </div>
    </div>
  );
}
