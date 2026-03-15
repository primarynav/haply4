import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Avatar } from './ui/avatar';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Separator } from './ui/separator';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share,
  Plus,
  Image,
  Video,
  Users,
  Clock,
  ArrowUp,
  ArrowDown,
  Reply,
  Bookmark,
  Search,
  Filter,
  MoreHorizontal,
  Flag,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CommunityPageProps {
  onBack: () => void;
  user?: { name: string; email: string } | null;
  onGetStarted: () => void;
}

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  content: string;
  timestamp: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  replies: Comment[];
  collapsed?: boolean;
}

interface Post {
  id: string;
  author: {
    name: string;
    avatar?: string;
    verified: boolean;
    karma?: number;
  };
  title?: string;
  content: string;
  image?: string;
  link?: string;
  timestamp: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  commentCount: number;
  flair: 'support' | 'success' | 'advice' | 'venting' | 'question' | 'celebration' | 'general';
  bookmarked?: boolean;
  type: 'text' | 'image' | 'link';
  comments: Comment[];
  showComments?: boolean;
}

export function CommunityPage({ onBack, user, onGetStarted }: CommunityPageProps) {
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top' | 'controversial'>('hot');
  const [filterFlair, setFilterFlair] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPost, setNewPost] = useState({
    type: 'text' as 'text' | 'image' | 'link',
    title: '',
    content: '',
    flair: 'general' as Post['flair'],
    link: ''
  });
  const [showNewPost, setShowNewPost] = useState(false);
  const [newComment, setNewComment] = useState<{[postId: string]: string}>({});
  const [replyTo, setReplyTo] = useState<{postId: string, commentId?: string} | null>(null);

  // Sample community posts
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      type: 'text',
      author: {
        name: 'Sarah M.',
        verified: true,
        karma: 2847
      },
      title: 'Success Story: Found love again after 6 months! 💕',
      content: 'Just wanted to share that after 6 months on Haply, I finally found someone special! To everyone still looking - don\'t give up. Your person is out there, and they\'re worth the wait. Thank you to this amazing community for all the support!\n\nWe met through a mutual love of hiking, and our first date was a 3-hour walk that felt like 30 minutes. Sometimes the best connections happen when you least expect them.',
      timestamp: '2 hours ago',
      upvotes: 89,
      downvotes: 2,
      commentCount: 23,
      flair: 'success',
      userVote: null,
      bookmarked: false,
      comments: [
        {
          id: 'c1',
          author: { name: 'Alex T.', verified: false },
          content: 'This gives me so much hope! Thank you for sharing your story.',
          timestamp: '1 hour ago',
          upvotes: 12,
          downvotes: 0,
          userVote: null,
          replies: [
            {
              id: 'c1r1',
              author: { name: 'Sarah M.', verified: true },
              content: 'Hang in there! Your time will come ❤️',
              timestamp: '45 minutes ago',
              upvotes: 8,
              downvotes: 0,
              userVote: null,
              replies: []
            }
          ]
        }
      ]
    },
    {
      id: '2',
      type: 'text',
      author: {
        name: 'Mike R.',
        verified: false,
        karma: 156
      },
      title: 'Struggling with the quiet weekends',
      content: 'Having a tough day today. Kids are with their dad this weekend and the house feels so quiet. Anyone else struggle with the alone time? How do you cope with those moments when the silence gets too loud?\n\nI know I should be grateful for the me-time, but sometimes it just hits different.',
      timestamp: '4 hours ago',
      upvotes: 47,
      downvotes: 1,
      commentCount: 31,
      flair: 'support',
      userVote: 'up',
      bookmarked: true,
      comments: [
        {
          id: 'c2',
          author: { name: 'Lisa P.', verified: false },
          content: 'I feel this so much. What helps me is having a "weekend self-care list" ready - movies I want to watch, books to read, crafts to do. Having a plan makes the quiet feel more intentional.',
          timestamp: '3 hours ago',
          upvotes: 23,
          downvotes: 0,
          userVote: null,
          replies: []
        }
      ]
    },
    {
      id: '3',
      type: 'text',
      author: {
        name: 'Jennifer K.',
        verified: true,
        karma: 5432
      },
      title: 'Dating Safety Tips - Learned the Hard Way',
      content: 'Pro tip for first dates after divorce: Always meet in public, let a friend know where you\'re going, and most importantly - trust your gut! If something feels off, it probably is. Your safety and peace of mind come first. 🛡️\n\nI had an experience recently that reminded me why these rules exist. Stay safe out there, everyone.',
      timestamp: '1 day ago',
      upvotes: 156,
      downvotes: 3,
      commentCount: 18,
      flair: 'advice',
      userVote: null,
      bookmarked: false,
      comments: []
    },
    {
      id: '4',
      type: 'text',
      author: {
        name: 'David L.',
        verified: false,
        karma: 89
      },
      title: 'When to introduce new partner to kids?',
      content: 'Question for the parents here: How do you navigate introducing someone new to your kids? My daughter is 8 and I\'ve been seeing someone for 3 months. When is the right time? Any advice would be greatly appreciated.\n\nMy ex and I have a good co-parenting relationship, so that\'s not an issue. Just want to do this right.',
      timestamp: '2 days ago',
      upvotes: 67,
      downvotes: 2,
      commentCount: 42,
      flair: 'question',
      userVote: null,
      bookmarked: false,
      comments: []
    }
  ]);

  const handleVote = (postId: string, voteType: 'up' | 'down') => {
    if (!user) {
      onGetStarted();
      return;
    }

    setPosts(posts.map(post => {
      if (post.id === postId) {
        const currentVote = post.userVote;
        let newUpvotes = post.upvotes;
        let newDownvotes = post.downvotes;
        let newUserVote: 'up' | 'down' | null = voteType;

        // Remove previous vote
        if (currentVote === 'up') newUpvotes--;
        if (currentVote === 'down') newDownvotes--;

        // Add new vote or remove if same
        if (currentVote === voteType) {
          newUserVote = null;
        } else {
          if (voteType === 'up') newUpvotes++;
          if (voteType === 'down') newDownvotes++;
        }

        return {
          ...post,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          userVote: newUserVote
        };
      }
      return post;
    }));
  };

  const handleBookmark = (postId: string) => {
    if (!user) {
      onGetStarted();
      return;
    }
    
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, bookmarked: !post.bookmarked }
        : post
    ));
  };

  const toggleComments = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, showComments: !post.showComments }
        : post
    ));
  };

  const handleNewPostClick = () => {
    if (!user) {
      onGetStarted();
      return;
    }
    setShowNewPost(true);
  };

  const handleSubmitPost = () => {
    if ((!newPost.content.trim() && newPost.type === 'text') || !user) return;
    
    const post: Post = {
      id: Date.now().toString(),
      type: newPost.type,
      author: {
        name: user.name,
        verified: false,
        karma: 0
      },
      title: newPost.title || undefined,
      content: newPost.content,
      link: newPost.link || undefined,
      timestamp: 'Just now',
      upvotes: 1,
      downvotes: 0,
      commentCount: 0,
      flair: newPost.flair,
      userVote: 'up',
      bookmarked: false,
      comments: []
    };
    
    setPosts([post, ...posts]);
    setNewPost({
      type: 'text',
      title: '',
      content: '',
      flair: 'general',
      link: ''
    });
    setShowNewPost(false);
  };

  const handleSubmitComment = (postId: string) => {
    if (!newComment[postId]?.trim() || !user) return;
    
    const comment: Comment = {
      id: `c${Date.now()}`,
      author: {
        name: user.name,
        verified: false
      },
      content: newComment[postId],
      timestamp: 'Just now',
      upvotes: 1,
      downvotes: 0,
      userVote: 'up',
      replies: []
    };

    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            comments: [...post.comments, comment],
            commentCount: post.commentCount + 1
          }
        : post
    ));
    
    setNewComment({ ...newComment, [postId]: '' });
  };

  const sortedAndFilteredPosts = () => {
    let filtered = filterFlair === 'all' 
      ? posts 
      : posts.filter(post => post.flair === filterFlair);

    if (searchQuery.trim()) {
      filtered = filtered.filter(post => 
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'new':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'top':
          return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        case 'controversial':
          return (Math.min(a.upvotes, a.downvotes) * 2) - (Math.min(b.upvotes, b.downvotes) * 2);
        case 'hot':
        default:
          const aScore = (a.upvotes - a.downvotes) + (a.commentCount * 0.5);
          const bScore = (b.upvotes - b.downvotes) + (b.commentCount * 0.5);
          return bScore - aScore;
      }
    });
  };

  const getFlairColor = (flair: string) => {
    switch (flair) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'support':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'advice':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'venting':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'question':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'celebration':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVoteScore = (upvotes: number, downvotes: number) => {
    const score = upvotes - downvotes;
    if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
    return score.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Community</h1>
                <p className="text-sm text-gray-600">Connect, support, and share your journey</p>
              </div>
            </div>
            
            <Button
              onClick={handleNewPostClick}
              className="bg-rose-600 hover:bg-rose-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>{user ? 'New Post' : 'Sign Up to Post'}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Community Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <Users className="h-6 w-6 text-rose-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">1,247</p>
            <p className="text-sm text-gray-600">Active Members</p>
          </Card>
          <Card className="p-4 text-center">
            <MessageCircle className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">856</p>
            <p className="text-sm text-gray-600">Posts This Week</p>
          </Card>
          <Card className="p-4 text-center">
            <Heart className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">142</p>
            <p className="text-sm text-gray-600">Success Stories</p>
          </Card>
        </div>

        {/* Search and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option value="hot">🔥 Hot</option>
              <option value="new">🆕 New</option>
              <option value="top">⬆️ Top</option>
              <option value="controversial">⚡ Controversial</option>
            </select>
            
            <select
              value={filterFlair}
              onChange={(e) => setFilterFlair(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option value="all">All Flairs</option>
              <option value="support">Support</option>
              <option value="success">Success</option>
              <option value="advice">Advice</option>
              <option value="venting">Venting</option>
              <option value="question">Question</option>
              <option value="celebration">Celebration</option>
            </select>
          </div>
        </div>

        {/* Guest User Message */}
        {!user && (
          <Card className="p-6 mb-6 border-rose-200 bg-rose-50">
            <div className="text-center">
              <Heart className="h-12 w-12 text-rose-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Join the Haply Community</h3>
              <p className="text-gray-600 mb-4">
                Connect with other divorced singles, share your journey, and find support from people who understand. 
                Create a free account to start posting and engaging with the community.
              </p>
              <Button 
                onClick={onGetStarted}
                className="bg-rose-600 hover:bg-rose-700"
              >
                Sign Up for Free
              </Button>
            </div>
          </Card>
        )}

        {/* New Post Modal */}
        {showNewPost && user && (
          <Card className="p-6 mb-6 border-rose-200">
            <h3 className="text-lg font-semibold mb-4">Create a Post</h3>
            
            {/* Post Type Selector */}
            <div className="flex space-x-2 mb-4">
              {[
                { type: 'text' as const, icon: MessageCircle, label: 'Text' },
                { type: 'image' as const, icon: Image, label: 'Image' },
                { type: 'link' as const, icon: LinkIcon, label: 'Link' }
              ].map(({ type, icon: Icon, label }) => (
                <Button
                  key={type}
                  variant={newPost.type === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewPost({ ...newPost, type })}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Button>
              ))}
            </div>

            {/* Title Input */}
            <Input
              placeholder="Title"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="mb-4"
            />

            {/* Flair Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Flair</label>
              <select
                value={newPost.flair}
                onChange={(e) => setNewPost({ ...newPost, flair: e.target.value as Post['flair'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
              >
                <option value="general">General</option>
                <option value="support">Support</option>
                <option value="success">Success Story</option>
                <option value="advice">Advice</option>
                <option value="venting">Venting</option>
                <option value="question">Question</option>
                <option value="celebration">Celebration</option>
              </select>
            </div>

            {/* Link Input for Link Posts */}
            {newPost.type === 'link' && (
              <Input
                placeholder="https://example.com"
                value={newPost.link}
                onChange={(e) => setNewPost({ ...newPost, link: e.target.value })}
                className="mb-4"
              />
            )}

            {/* Content Input */}
            <Textarea
              placeholder={
                newPost.type === 'text' 
                  ? "What's on your mind? Share your thoughts, ask for advice, or celebrate a success..."
                  : "Tell us more about this..."
              }
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className="min-h-[120px] mb-4"
            />

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Remember to be kind and supportive to fellow community members
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowNewPost(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitPost}
                  className="bg-rose-600 hover:bg-rose-700"
                  disabled={!newPost.title.trim() || (!newPost.content.trim() && newPost.type === 'text')}
                >
                  Post
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Posts Feed */}
        <div className="space-y-4">
          {sortedAndFilteredPosts().map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <div className="flex">
                {/* Vote Section */}
                <div className="flex flex-col items-center p-4 bg-gray-50 border-r">
                  <button
                    onClick={() => handleVote(post.id, 'up')}
                    className={`p-1 rounded transition-colors ${
                      post.userVote === 'up' 
                        ? 'text-orange-600 bg-orange-100' 
                        : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                    title={!user ? "Sign up to vote" : "Upvote"}
                  >
                    <ArrowUp className="h-5 w-5" />
                  </button>
                  
                  <span className={`text-sm font-medium py-1 ${
                    post.userVote === 'up' ? 'text-orange-600' : 
                    post.userVote === 'down' ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {getVoteScore(post.upvotes, post.downvotes)}
                  </span>
                  
                  <button
                    onClick={() => handleVote(post.id, 'down')}
                    className={`p-1 rounded transition-colors ${
                      post.userVote === 'down' 
                        ? 'text-blue-600 bg-blue-100' 
                        : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    title={!user ? "Sign up to vote" : "Downvote"}
                  >
                    <ArrowDown className="h-5 w-5" />
                  </button>
                </div>

                {/* Post Content */}
                <div className="flex-1 p-4">
                  {/* Post Header */}
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={`text-xs border ${getFlairColor(post.flair)}`}>
                      {post.flair}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Posted by u/{post.author.name}
                    </span>
                    {post.author.verified && (
                      <Badge variant="secondary" className="text-xs">
                        ✓ Verified
                      </Badge>
                    )}
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="h-3 w-3 mr-1" />
                      {post.timestamp}
                    </div>
                    {post.author.karma && (
                      <span className="text-xs text-gray-500">
                        {post.author.karma} karma
                      </span>
                    )}
                  </div>

                  {/* Post Title */}
                  {post.title && (
                    <h3 className="font-medium text-gray-900 mb-2 leading-tight">
                      {post.title}
                    </h3>
                  )}

                  {/* Post Content */}
                  <div className="text-gray-800 mb-4 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </div>

                  {/* Link Preview */}
                  {post.link && (
                    <div className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <a 
                        href={post.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        🔗 {post.link}
                      </a>
                    </div>
                  )}

                  {/* Post Image */}
                  {post.image && (
                    <div className="mb-4">
                      <ImageWithFallback
                        src={post.image}
                        alt="Post image"
                        className="rounded-lg max-h-96 w-full object-cover"
                      />
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center space-x-4 text-sm">
                    <button
                      onClick={() => user ? toggleComments(post.id) : onGetStarted()}
                      className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.commentCount} comments</span>
                    </button>

                    <button
                      onClick={() => user ? handleBookmark(post.id) : onGetStarted()}
                      className={`flex items-center space-x-1 transition-colors ${
                        post.bookmarked ? 'text-yellow-600' : 'text-gray-500 hover:text-yellow-600'
                      }`}
                    >
                      <Bookmark className={`h-4 w-4 ${post.bookmarked ? 'fill-current' : ''}`} />
                      <span>Save</span>
                    </button>

                    <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors">
                      <Share className="h-4 w-4" />
                      <span>Share</span>
                    </button>

                    <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors">
                      <Flag className="h-4 w-4" />
                      <span>Report</span>
                    </button>

                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Comments Section */}
                  {post.showComments && (
                    <div className="mt-4 border-t pt-4">
                      {/* Add Comment */}
                      {user && (
                        <div className="mb-4">
                          <Textarea
                            placeholder="Add a comment..."
                            value={newComment[post.id] || ''}
                            onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                            className="min-h-[80px] mb-2"
                          />
                          <Button
                            onClick={() => handleSubmitComment(post.id)}
                            size="sm"
                            className="bg-rose-600 hover:bg-rose-700"
                            disabled={!newComment[post.id]?.trim()}
                          >
                            Comment
                          </Button>
                        </div>
                      )}

                      {/* Comments List */}
                      <div className="space-y-4">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm text-gray-900">
                                u/{comment.author.name}
                              </span>
                              {comment.author.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  ✓
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">{comment.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-800 mb-2">{comment.content}</p>
                            <div className="flex items-center space-x-3 text-xs">
                              <div className="flex items-center space-x-1">
                                <button className="text-gray-400 hover:text-orange-600">
                                  <ArrowUp className="h-3 w-3" />
                                </button>
                                <span className="text-gray-600">
                                  {comment.upvotes - comment.downvotes}
                                </span>
                                <button className="text-gray-400 hover:text-blue-600">
                                  <ArrowDown className="h-3 w-3" />
                                </button>
                              </div>
                              <button className="text-gray-500 hover:text-gray-700">
                                Reply
                              </button>
                            </div>

                            {/* Nested Replies */}
                            {comment.replies.length > 0 && (
                              <div className="mt-3 ml-4 space-y-3">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="border-l-2 border-gray-100 pl-3">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-medium text-sm text-gray-900">
                                        u/{reply.author.name}
                                      </span>
                                      {reply.author.verified && (
                                        <Badge variant="secondary" className="text-xs">
                                          ✓
                                        </Badge>
                                      )}
                                      <span className="text-xs text-gray-500">{reply.timestamp}</span>
                                    </div>
                                    <p className="text-sm text-gray-800 mb-2">{reply.content}</p>
                                    <div className="flex items-center space-x-3 text-xs">
                                      <div className="flex items-center space-x-1">
                                        <button className="text-gray-400 hover:text-orange-600">
                                          <ArrowUp className="h-3 w-3" />
                                        </button>
                                        <span className="text-gray-600">
                                          {reply.upvotes - reply.downvotes}
                                        </span>
                                        <button className="text-gray-400 hover:text-blue-600">
                                          <ArrowDown className="h-3 w-3" />
                                        </button>
                                      </div>
                                      <button className="text-gray-500 hover:text-gray-700">
                                        Reply
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" className="px-8">
            Load More Posts
          </Button>
        </div>
      </div>
    </div>
  );
}