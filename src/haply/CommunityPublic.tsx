import { AV_COLORS, CATS, type Post } from './data';
import type { H } from './HaplyApp';
import { Ic, Logo, serif } from './ui';

export function filteredPosts(h: H): Post[] {
  return h.commCat === 'All Topics' ? h.posts : h.posts.filter((p) => p.cat === h.commCat);
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

export function PostCard({ post, index, h }: { post: Post; index: number; h: H }) {
  const liked = !!h.postLikes[post.id];
  const av = AV_COLORS[index % AV_COLORS.length];
  return (
    <div style={{ background: '#fff', border: '1px solid #EDE6DF', borderRadius: 16, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, background: av[0], color: av[1] }}>{post.name.charAt(0)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#211D1A', display: 'flex', alignItems: 'center', gap: 5 }}>
            {post.name}
            <Ic name="verified" fill size={14} color="#16a34a" />
          </div>
          <div style={{ fontSize: 12, color: '#78716C' }}>{post.time}</div>
        </div>
        <span style={{ background: '#FFF1F2', color: '#be123c', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999 }}>{post.cat}</span>
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 6px', color: '#211D1A' }}>{post.title}</h3>
      <p style={{ fontSize: 15, color: '#44403C', margin: '0 0 14px', lineHeight: 1.6 }}>{post.body}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <button onClick={() => h.togglePostLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 0, color: liked ? '#e11d48' : '#78716C' }}>
          <Ic name="favorite" fill={liked} size={18} />
          {post.likes + (liked ? 1 : 0)}
        </button>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#78716C' }}>
          <Ic name="chat_bubble" size={18} />
          {post.comments}
        </span>
      </div>
    </div>
  );
}

export function Composer({ h, dash }: { h: H; dash?: boolean }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EDE6DF', borderRadius: 16, padding: 16, marginBottom: dash ? 20 : 24 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FFE4E6', color: '#be123c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{h.userInitial}</div>
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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          <CatPills h={h} />
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
          {filteredPosts(h).map((po, i) => (
            <PostCard key={po.id} post={po} index={i} h={h} />
          ))}
        </div>
      </div>
    </div>
  );
}
