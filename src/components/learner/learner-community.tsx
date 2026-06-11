'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Heart, MessageSquare, Share2, Bookmark, ChevronDown,
  ChevronUp, Clock, Tag, Send, Flame, Trophy, TrendingUp,
  Megaphone, HelpCircle, Star, MessageCircle, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { demoCommunityPosts, leaderboardData } from '@/lib/mock-data';
import type { CommunityPost } from '@/types';

// Category pills data
const categoryPills = [
  { id: 'all', name: 'All', icon: '🏠', color: '#64748B' },
  { id: 'cat-1', name: 'General Discussion', icon: '💬', color: '#10B981' },
  { id: 'cat-2', name: 'Q&A Support', icon: '❓', color: '#8B5CF6' },
  { id: 'cat-3', name: 'Announcements', icon: '📢', color: '#F59E0B' },
  { id: 'cat-4', name: 'Show & Tell', icon: '🌟', color: '#EC4899' },
];

// Sample comments
const sampleComments = [
  { id: 'c1', author: 'Emma Rodriguez', content: 'Great question! I\'ve been using Zustand for client state and TanStack Query for server state. Works really well.', likeCount: 5, timeAgo: '1h ago' },
  { id: 'c2', author: 'David Park', content: 'I recommend checking out Jotai if you want something lighter than Redux but more structured than Context.', likeCount: 3, timeAgo: '45m ago' },
  { id: 'c3', author: 'Lisa Wang', content: 'This is exactly what I needed! The React docs on data fetching have some good patterns too.', likeCount: 2, timeAgo: '30m ago' },
];

// Trending topics
const trendingTopics = [
  { tag: 'nextjs', count: 42 },
  { tag: 'react', count: 38 },
  { tag: 'ai', count: 35 },
  { tag: 'typescript', count: 29 },
  { tag: 'fullstack', count: 24 },
  { tag: 'design-system', count: 18 },
  { tag: 'authentication', count: 15 },
  { tag: 'state-management', count: 12 },
];

function getTypeEmoji(type: CommunityPost['type']) {
  switch (type) {
    case 'discussion': return '💬';
    case 'question': return '❓';
    case 'announcement': return '📢';
    case 'resource': return '🌟';
  }
}

function getTypeBadgeStyle(type: CommunityPost['type']) {
  switch (type) {
    case 'discussion': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'question': return 'bg-violet-100 text-violet-700 border-violet-200';
    case 'announcement': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'resource': return 'bg-pink-100 text-pink-700 border-pink-200';
  }
}

function getRoleBadge(role: string) {
  switch (role) {
    case 'tenant_admin': return { label: 'Admin', class: 'bg-emerald-100 text-emerald-700' };
    case 'instructor': return { label: 'Instructor', class: 'bg-violet-100 text-violet-700' };
    case 'content_creator': return { label: 'Creator', class: 'bg-pink-100 text-pink-700' };
    default: return { label: 'Learner', class: 'bg-slate-100 text-slate-600' };
  }
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export function LearnerCommunity() {
  const [posts, setPosts] = useState<CommunityPost[]>(demoCommunityPosts);
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    type: 'discussion' as CommunityPost['type'],
    categoryId: 'cat-1',
    tags: '',
  });

  // Filter posts by category
  const filteredPosts = posts.filter((post) => {
    return activeCategory === 'all' || post.categoryId === activeCategory;
  });

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return { ...p, likeCount: likedPosts.has(postId) ? p.likeCount - 1 : p.likeCount + 1 };
      }
      return p;
    }));
  };

  const toggleBookmark = (postId: string) => {
    setBookmarkedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const handleCreatePost = () => {
    const post: CommunityPost = {
      id: `post-${Date.now()}`,
      tenantId: 'demo-tenant-1',
      authorId: 'demo-learner-1',
      categoryId: newPost.categoryId,
      title: newPost.title,
      content: newPost.content,
      type: newPost.type,
      isPinned: false,
      isLocked: false,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      tags: newPost.tags ? newPost.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      author: {
        id: 'demo-learner-1',
        tenantId: 'demo-tenant-1',
        email: 'learner@example.com',
        name: 'Alex Johnson',
        role: 'learner',
        timezone: 'America/New_York',
        locale: 'en',
        streakDays: 7,
        totalPoints: 1250,
        isActive: true,
        createdAt: '2024-03-10T00:00:00Z',
      },
      createdAt: new Date().toISOString(),
    };
    setPosts([post, ...posts]);
    setShowCreateDialog(false);
    setNewPost({ title: '', content: '', type: 'discussion', categoryId: 'cat-1', tags: '' });
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Community</h1>
          <p className="text-slate-500 mt-0.5">Connect, share, and learn together</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Category Pills */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categoryPills.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                activeCategory === cat.id
                  ? 'text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              style={activeCategory === cat.id ? { backgroundColor: cat.color } : undefined}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Feed + Sidebar */}
      <div className="flex gap-6">
        {/* Activity Feed */}
        <div className="flex-1 min-w-0 space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post, i) => (
              <PostFeedCard
                key={post.id}
                post={post}
                index={i}
                isExpanded={expandedComments.has(post.id)}
                isLiked={likedPosts.has(post.id)}
                isBookmarked={bookmarkedPosts.has(post.id)}
                onToggleComments={() => toggleComments(post.id)}
                onToggleLike={() => toggleLike(post.id)}
                onToggleBookmark={() => toggleBookmark(post.id)}
              />
            ))}
          </AnimatePresence>
          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-lg">No posts in this category</p>
              <p className="text-slate-400 text-sm mt-1">Be the first to start a conversation!</p>
            </div>
          )}
        </div>

        {/* Trending Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-80 shrink-0 space-y-4">
          {/* Trending Topics */}
          <Card className="border-slate-200 overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-violet-50">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-1.5">
                {trendingTopics.map((topic, idx) => (
                  <div
                    key={topic.tag}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}</span>
                      <span className="text-sm font-medium text-slate-700">#{topic.tag}</span>
                    </div>
                    <span className="text-xs text-slate-400">{topic.count} posts</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Contributors */}
          <Card className="border-slate-200 overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-violet-50 to-pink-50">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-violet-600" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                {leaderboardData.slice(0, 5).map((user) => (
                  <div
                    key={user.name}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      user.rank === 1 ? 'bg-amber-500' :
                      user.rank === 2 ? 'bg-slate-400' :
                      user.rank === 3 ? 'bg-amber-700' :
                      'bg-slate-300'
                    }`}>
                      {user.rank}
                    </div>
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 flex items-center gap-0.5">
                          <Flame className="h-3 w-3 text-orange-400" />
                          {user.streak}
                        </span>
                        <span className="text-xs text-slate-400">{user.points.toLocaleString()} pts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-emerald-50">
                  <p className="text-xl font-bold text-emerald-700">{posts.reduce((s, p) => s + p.likeCount, 0)}</p>
                  <p className="text-xs text-emerald-600">Total Likes</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-violet-50">
                  <p className="text-xl font-bold text-violet-700">{posts.reduce((s, p) => s + p.commentCount, 0)}</p>
                  <p className="text-xs text-violet-600">Comments</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-50">
                  <p className="text-xl font-bold text-amber-700">{posts.reduce((s, p) => s + p.viewCount, 0)}</p>
                  <p className="text-xs text-amber-600">Views</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-pink-50">
                  <p className="text-xl font-bold text-pink-700">{posts.length}</p>
                  <p className="text-xs text-pink-600">Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Post Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-emerald-600" />
              Create a Post
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-slate-700 mb-1.5">Title</Label>
              <Input
                placeholder="What's on your mind?"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="border-slate-200 focus:border-emerald-400"
              />
            </div>
            <div>
              <Label className="text-slate-700 mb-1.5">Content</Label>
              <Textarea
                placeholder="Share your thoughts, questions, or resources..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={5}
                className="border-slate-200 focus:border-emerald-400 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-700 mb-1.5">Type</Label>
                <Select value={newPost.type} onValueChange={(v) => setNewPost({ ...newPost, type: v as CommunityPost['type'] })}>
                  <SelectTrigger className="border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discussion">💬 Discussion</SelectItem>
                    <SelectItem value="question">❓ Question</SelectItem>
                    <SelectItem value="announcement">📢 Announcement</SelectItem>
                    <SelectItem value="resource">🌟 Resource</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-700 mb-1.5">Category</Label>
                <Select value={newPost.categoryId} onValueChange={(v) => setNewPost({ ...newPost, categoryId: v })}>
                  <SelectTrigger className="border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryPills.filter(c => c.id !== 'all').map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-slate-700 mb-1.5">Tags (comma separated)</Label>
              <Input
                placeholder="e.g., nextjs, react, tips"
                value={newPost.tags}
                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                className="border-slate-200 focus:border-emerald-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-slate-200">
              Cancel
            </Button>
            <Button
              onClick={handleCreatePost}
              disabled={!newPost.title.trim() || !newPost.content.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Post Feed Card ───────────────────────────────────────────────────────────

function PostFeedCard({
  post,
  index,
  isExpanded,
  isLiked,
  isBookmarked,
  onToggleComments,
  onToggleLike,
  onToggleBookmark,
}: {
  post: CommunityPost;
  index: number;
  isExpanded: boolean;
  isLiked: boolean;
  isBookmarked: boolean;
  onToggleComments: () => void;
  onToggleLike: () => void;
  onToggleBookmark: () => void;
}) {
  const roleBadge = getRoleBadge(post.author?.role || 'learner');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`border-slate-200 hover:shadow-md transition-all overflow-hidden ${post.isPinned ? 'ring-2 ring-emerald-200 border-emerald-200' : ''}`}>
        <CardContent className="p-0">
          {/* Author Header */}
          <div className="p-4 pb-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-slate-100">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-violet-500 text-white font-semibold text-sm">
                    {post.author?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{post.author?.name || 'Unknown'}</span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${roleBadge.class} border-0`}>
                      {roleBadge.label}
                    </Badge>
                    {post.isPinned && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200">
                        📌 Pinned
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeAgo(post.createdAt)}
                  </span>
                </div>
              </div>
              <Badge variant="outline" className={`text-xs gap-1 ${getTypeBadgeStyle(post.type)}`}>
                {getTypeEmoji(post.type)} {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 pt-3 pb-2">
            <h3 className="font-bold text-slate-900 text-base leading-snug mb-1.5">{post.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{post.content}</p>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {post.tags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  <Tag className="h-2.5 w-2.5 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats Row */}
          <div className="px-4 py-1.5 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-4">
            <span className="flex items-center gap-1"><Flame className="h-3 w-3" />{post.viewCount} views</span>
            <span>{post.likeCount} likes</span>
            <span>{post.commentCount} comments</span>
          </div>

          {/* Action Bar */}
          <div className="px-2 py-1 border-t border-slate-100 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleLike}
              className={`flex-1 gap-1.5 text-sm rounded-lg ${
                isLiked ? 'text-red-500 hover:text-red-600 hover:bg-red-50' : 'text-slate-500 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post.likeCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleComments}
              className="flex-1 gap-1.5 text-sm text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{post.commentCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 gap-1.5 text-sm text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleBookmark}
              className={`flex-1 gap-1.5 text-sm rounded-lg ${
                isBookmarked ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-500 hover:text-amber-500 hover:bg-amber-50'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>{isBookmarked ? 'Saved' : 'Save'}</span>
            </Button>
          </div>

          {/* Expandable Comments Section */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-slate-200 bg-slate-50/50">
                  <div className="p-4 space-y-3">
                    {sampleComments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                            {comment.author.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-slate-900">{comment.author}</span>
                            <span className="text-[10px] text-slate-400">{comment.timeAgo}</span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>
                          <button className="text-xs text-slate-400 hover:text-red-500 mt-1 flex items-center gap-1">
                            <Heart className="h-3 w-3" /> {comment.likeCount}
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Comment Input */}
                    <div className="flex gap-2 pt-2">
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-medium">
                          A
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Input
                          placeholder="Write a comment..."
                          className="text-sm border-slate-200 focus:border-emerald-400 h-8"
                        />
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 shrink-0">
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
