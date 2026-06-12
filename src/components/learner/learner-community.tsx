'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  Plus, Heart, MessageSquare, Share2, Bookmark, ChevronDown,
  ChevronUp, Clock, Tag, Send, Flame, Trophy, TrendingUp,
  Megaphone, HelpCircle, Star, MessageCircle, X, Pin,
  Bold, Italic, Code, Link2, Eye, EyeOff, Smile, Sparkles,
  Users, Activity, Zap, Trash2, Loader2
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
import {
  useCommunityPosts,
  useCreateCommunityPost,
  useUpdateCommunityPost,
  useDeleteCommunityPost,
  useAddComment,
  useToggleReaction,
  useUsers,
} from '@/hooks/use-data';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useAppStore } from '@/store/app-store';
import { validateFields, required, minLength } from '@/lib/validations';
import type { CommunityPost } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const EMOJI_REACTIONS = ['❤️', '👍', '🎉', '🤔', '💡', '🚀'] as const;
type EmojiType = typeof EMOJI_REACTIONS[number];

const EMOJI_PICKER_LIST = [
  '😀', '😂', '🥳', '😎', '🤩', '😊', '🥰', '😍',
  '🤔', '💡', '🔥', '⭐', '🎉', '👏', '💪', '🙌',
  '👍', '❤️', '💯', '🎯', '🚀', '✨', '🌟', '💻',
  '📚', '🎓', '✅', '❓', '📢', '💬', '🙏', '🤝',
];

const MARKDOWN_TOOLBAR = [
  { icon: Bold, label: 'Bold', prefix: '**', suffix: '**' },
  { icon: Italic, label: 'Italic', prefix: '_', suffix: '_' },
  { icon: Code, label: 'Code', prefix: '`', suffix: '`' },
  { icon: Link2, label: 'Link', prefix: '[', suffix: '](url)' },
];

const TOPIC_TAGS = [
  'nextjs', 'react', 'ai', 'typescript', 'fullstack',
  'design-system', 'authentication', 'state-management',
  'tailwind', 'prisma', 'api', 'testing'
];

const trendingTopics = [
  { tag: 'nextjs', count: 42, sparkline: [20, 25, 30, 28, 35, 38, 42] },
  { tag: 'react', count: 38, sparkline: [30, 28, 32, 35, 33, 36, 38] },
  { tag: 'ai', count: 35, sparkline: [10, 15, 18, 22, 28, 32, 35] },
  { tag: 'typescript', count: 29, sparkline: [18, 20, 22, 25, 27, 28, 29] },
  { tag: 'fullstack', count: 24, sparkline: [12, 14, 18, 20, 22, 23, 24] },
  { tag: 'design-system', count: 18, sparkline: [8, 10, 12, 14, 15, 17, 18] },
  { tag: 'authentication', count: 15, sparkline: [5, 7, 9, 11, 12, 14, 15] },
  { tag: 'state-management', count: 12, sparkline: [6, 7, 8, 9, 10, 11, 12] },
];

// Reaction type ↔ emoji mapping
const reactionTypeToEmoji: Record<string, string> = {
  'like': '👍',
  'love': '❤️',
  'celebrate': '🎉',
  'insightful': '💡',
};

const emojiToReactionType: Record<string, string> = {
  '❤️': 'love',
  '👍': 'like',
  '🎉': 'celebrate',
  '🤔': 'insightful',
  '💡': 'insightful',
  '🚀': 'celebrate',
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

function normalizePost(raw: any): CommunityPost {
  return {
    ...raw,
    tags: raw.tags
      ? (typeof raw.tags === 'string' ? raw.tags.split(',').filter(Boolean) : raw.tags)
      : [],
    type: raw.type || 'discussion',
  };
}

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
    case 'discussion': return 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-500/30';
    case 'question': return 'bg-gradient-to-r from-violet-100 to-violet-50 text-violet-700 border-violet-200';
    case 'announcement': return 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border-amber-200';
    case 'resource': return 'bg-gradient-to-r from-pink-100 to-pink-50 text-pink-700 border-pink-200';
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

function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

function getEngagementScore(post: CommunityPost): number {
  return post.viewCount + (post.likeCount * 3) + (post.commentCount * 5);
}

function isToday(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

// ─── Animated Counter Component ───────────────────────────────────────────────

function AnimatedCounter({ target, duration = 1.5 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count.toLocaleString()}</span>;
}

// ─── Sparkline Chart Component ────────────────────────────────────────────────

function SparklineChart({ data, color = '#10B981', width = 48, height = 20 }: { data: number[]; color?: string; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <svg width={width} height={height} className="shrink-0">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Floating +1 Animation ────────────────────────────────────────────────────

function FloatingPlusOne({ emoji }: { emoji: string }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 0.5 }}
      animate={{ opacity: 0, y: -30, scale: 1.2 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none text-sm font-bold z-10"
    >
      {emoji}+1
    </motion.div>
  );
}

// ─── Heart Burst Animation ────────────────────────────────────────────────────

function HeartBurst({ x, y }: { x: number; y: number }) {
  const hearts = ['❤️', '💕', '💖', '💗', '💓'];
  return (
    <div className="fixed pointer-events-none z-50" style={{ left: x, top: y }}>
      {hearts.map((heart, i) => {
        const angle = (i / hearts.length) * Math.PI * 2;
        const distance = 40 + Math.random() * 30;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
            animate={{
              opacity: 0,
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance - 20,
              scale: 1.5,
            }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute text-lg"
          >
            {heart}
          </motion.span>
        );
      })}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function CommunitySkeleton() {
  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      {/* Stats Banner Skeleton */}
      <div className="mb-5">
        <div className="rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-violet-600 p-[1px]">
          <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-violet-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="h-8 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-56 bg-slate-200 dark:bg-slate-700 rounded mt-1 animate-pulse" />
              </div>
              <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3 bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-lg p-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  <div>
                    <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mt-1 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills Skeleton */}
      <div className="mb-6 flex gap-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
        ))}
      </div>

      {/* Post Cards Skeleton */}
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  <div>
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded mt-1 animate-pulse" />
                  </div>
                </div>
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
                <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Sidebar Skeleton */}
        <div className="hidden lg:block w-80 shrink-0 space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-border">
              <CardContent className="p-4">
                <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-3" />
                {[1, 2, 3, 4, 5].map(j => (
                  <div key={j} className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    <div className="h-4 flex-1 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LearnerCommunity() {
  const userId = useAppStore(s => s.currentUser?.id) || '';
  const tenantId = useAppStore(s => s.currentTenant?.id) || '';
  const { currentUser, currentTenant } = useAppStore();

  // ── Data Hooks ─────────────────────────────────────────────────────────────
  const { data: communityData, isLoading } = useCommunityPosts();
  const { data: usersData } = useUsers(tenantId);

  // ── Mutation Hooks ─────────────────────────────────────────────────────────
  const createPostMutation = useCreateCommunityPost();
  const deletePostMutation = useDeleteCommunityPost();
  const addCommentMutation = useAddComment();
  const toggleReactionMutation = useToggleReaction();

  // ── Derived Data ───────────────────────────────────────────────────────────
  const posts = useMemo<CommunityPost[]>(() => {
    return (communityData?.posts || []).map(normalizePost);
  }, [communityData]);

  const categories = useMemo(() => {
    const apiCats = (communityData?.categories || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon || '💬',
      color: cat.color || '#64748B',
    }));
    return [
      { id: 'all', name: 'All', icon: '🏠', color: '#64748B' },
      ...apiCats,
    ];
  }, [communityData?.categories]);

  // Compute reaction counts per post from API data
  const computedReactions = useMemo<Record<string, Record<string, number>>>(() => {
    const result: Record<string, Record<string, number>> = {};
    posts.forEach(post => {
      const postReactions: Record<string, number> = {};
      EMOJI_REACTIONS.forEach(emoji => { postReactions[emoji] = 0; });
      (post.reactions || []).forEach((r: any) => {
        const emoji = reactionTypeToEmoji[r.type];
        if (emoji) postReactions[emoji] = (postReactions[emoji] || 0) + 1;
      });
      result[post.id] = postReactions;
    });
    return result;
  }, [posts]);

  // Compute user's own reactions from API data
  const computedUserReactions = useMemo<Record<string, Set<string>>>(() => {
    const result: Record<string, Set<string>> = {};
    posts.forEach(post => {
      const userEmojis = new Set<string>();
      (post.reactions || []).forEach((r: any) => {
        if (r.userId === userId) {
          const emoji = reactionTypeToEmoji[r.type];
          if (emoji) userEmojis.add(emoji);
        }
      });
      result[post.id] = userEmojis;
    });
    return result;
  }, [posts, userId]);

  // Compute liked posts (has 'like' reaction from current user)
  const likedPosts = useMemo<Set<string>>(() => {
    const result = new Set<string>();
    posts.forEach(post => {
      const hasLike = (post.reactions || []).some(
        (r: any) => r.userId === userId && r.type === 'like'
      );
      if (hasLike) result.add(post.id);
    });
    return result;
  }, [posts, userId]);

  // Top contributors from users data
  const topContributors = useMemo(() => {
    const users = (usersData?.users || [])
      .slice()
      .sort((a: any, b: any) => (b.totalPoints || 0) - (a.totalPoints || 0))
      .slice(0, 5);
    return users.map((user: any, idx: number) => ({
      rank: idx + 1,
      name: user.name || 'Unknown',
      points: user.totalPoints || 0,
      streak: user.streakDays || 0,
    }));
  }, [usersData?.users]);

  // Community stats from real data
  const totalMembers = usersData?.users?.length || 0;
  const postsToday = posts.filter(p => isToday(p.createdAt)).length;
  const activeNow = (usersData?.users || []).filter((u: any) => u.isActive).length;

  // ── UI State ───────────────────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    type: 'discussion' as CommunityPost['type'],
    categoryId: '',
    tags: '',
  });

  // Set default category when categories load
  useEffect(() => {
    if (categories.length > 1 && !newPost.categoryId) {
      setNewPost(prev => ({ ...prev, categoryId: categories[1].id }));
    }
  }, [categories]);

  // Floating +1 animations
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; postId: string; emoji: string }[]>([]);

  // Heart burst state
  const [heartBursts, setHeartBursts] = useState<{ id: string; x: number; y: number }[]>([]);

  // Create post dialog state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [composerFocused, setComposerFocused] = useState(false);
  const [postErrors, setPostErrors] = useState<Record<string, string>>({});

  // Delete confirmation state
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

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
    toggleReactionMutation.mutate({ postId, userId, type: 'like' });
  };

  const toggleBookmark = (postId: string) => {
    setBookmarkedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const handleEmojiReaction = (postId: string, emoji: EmojiType) => {
    const reactionType = emojiToReactionType[emoji];
    if (!reactionType || !userId) return;

    // Show floating +1 animation
    const floatId = `${postId}-${emoji}-${Date.now()}`;
    setFloatingEmojis(prev => [...prev, { id: floatId, postId, emoji }]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(f => f.id !== floatId));
    }, 800);

    // Persist reaction toggle to API
    toggleReactionMutation.mutate({ postId, userId, type: reactionType });
  };

  const handleHeartBurst = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const id = `burst-${Date.now()}`;
    setHeartBursts(prev => [...prev, { id, x: rect.left + rect.width / 2, y: rect.top }]);
    setTimeout(() => {
      setHeartBursts(prev => prev.filter(b => b.id !== id));
    }, 700);
  };

  const handleCreatePost = () => {
    const errs = validateFields({
      title: [required(newPost.title, 'Title'), minLength(newPost.title, 3, 'Title')],
      content: [required(newPost.content, 'Content'), minLength(newPost.content, 10, 'Content')],
    });
    setPostErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const tags = selectedTags.length > 0
      ? selectedTags
      : (newPost.tags ? newPost.tags.split(',').map(t => t.trim()).filter(Boolean) : []);

    createPostMutation.mutate(
      {
        tenantId: tenantId || currentTenant?.id || '',
        authorId: userId || currentUser?.id || '',
        title: newPost.title,
        content: newPost.content,
        type: newPost.type,
        categoryId: newPost.categoryId,
        tags,
      },
      {
        onSuccess: () => {
          setShowCreateDialog(false);
          setNewPost({ title: '', content: '', type: 'discussion', categoryId: categories.length > 1 ? categories[1].id : '', tags: '' });
          setSelectedTags([]);
          setPostErrors({});
        },
      }
    );
  };

  const handleDeletePost = () => {
    if (deletePostId) {
      deletePostMutation.mutate(deletePostId, {
        onSuccess: () => {
          setDeletePostId(null);
        },
      });
    }
  };

  const handleAddComment = (postId: string, content: string) => {
    if (!content.trim() || !userId) return;
    addCommentMutation.mutate({
      postId,
      authorId: userId,
      content: content.trim(),
    });
  };

  const insertMarkdown = (prefix: string, suffix: string) => {
    const textarea = document.getElementById('post-content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = newPost.content.substring(start, end);
    const before = newPost.content.substring(0, start);
    const after = newPost.content.substring(end);
    const newContent = before + prefix + (selected || 'text') + suffix + after;
    setNewPost({ ...newPost, content: newContent });
  };

  const insertEmoji = (emoji: string) => {
    setNewPost({ ...newPost, content: newPost.content + emoji });
    setShowEmojiPicker(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const charCount = newPost.content.length;
  const maxChars = 2000;
  const charColor = charCount > maxChars * 0.9 ? 'text-red-500' : charCount > maxChars * 0.7 ? 'text-amber-500' : 'text-emerald-500';

  // Simple markdown preview
  const renderMarkdownPreview = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 rounded text-sm">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-emerald-600 underline">$1</a>')
      .replace(/\n/g, '<br/>');
  };

  // ── Loading State ──────────────────────────────────────────────────────────
  if (isLoading) {
    return <CommunitySkeleton />;
  }

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      {/* Community Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-5"
      >
        <div className="rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-violet-600 p-[1px]">
          <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-violet-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">Community</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Connect, share, and learn together</p>
              </div>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shrink-0"
              >
                <Plus className="h-4 w-4" />
                New Post
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="flex items-center gap-3 bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-lg p-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50"><AnimatedCounter target={totalMembers} /></p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Members</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-lg p-3">
                <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50"><AnimatedCounter target={postsToday} duration={0.8} /></p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Posts Today</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-lg p-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center relative">
                  <Activity className="h-5 w-5 text-amber-600" />
                  <motion.span
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-800"
                  />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50"><AnimatedCounter target={activeNow} duration={1} /></p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Active Now</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-lg p-3">
                <div className="h-10 w-10 rounded-full bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50"><AnimatedCounter target={posts.reduce((s, p) => s + p.likeCount, 0)} duration={1.2} /></p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Reactions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category Pills */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                activeCategory === cat.id
                  ? 'text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
              style={activeCategory === cat.id ? { backgroundColor: cat.color } : undefined}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </motion.button>
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
                reactions={computedReactions[post.id] || {}}
                userReactions={computedUserReactions[post.id] || new Set()}
                floatingEmojis={floatingEmojis.filter(f => f.postId === post.id)}
                onToggleComments={() => toggleComments(post.id)}
                onToggleLike={() => toggleLike(post.id)}
                onToggleBookmark={() => toggleBookmark(post.id)}
                onEmojiReaction={(emoji) => handleEmojiReaction(post.id, emoji)}
                onHeartBurst={handleHeartBurst}
                onDelete={() => setDeletePostId(post.id)}
                onAddComment={(content) => handleAddComment(post.id, content)}
                currentUserId={userId}
                isDeleting={deletePostMutation.isPending}
                isAddingComment={addCommentMutation.isPending}
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
          <Card className="border-border overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-violet-50 dark:from-emerald-950/30 dark:to-violet-950/30">
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Trending Topics
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  className="text-base"
                >
                  🔥
                </motion.span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-1.5">
                {trendingTopics.map((topic, idx) => (
                  <motion.div
                    key={topic.tag}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:underline decoration-emerald-500 underline-offset-2 transition-all">
                        #{topic.tag}
                      </span>
                      {idx < 3 && (
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                          className="text-xs"
                        >
                          🔥
                        </motion.span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <SparklineChart
                        data={topic.sparkline}
                        color={idx < 3 ? '#10B981' : '#94A3B8'}
                      />
                      <span className="text-xs text-slate-400 dark:text-slate-500 min-w-[42px] text-right">{topic.count}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Contributors */}
          <Card className="border-border overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-violet-50 to-pink-50 dark:from-violet-950/30 dark:to-pink-950/30">
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-violet-600" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                {topContributors.length > 0 ? topContributors.map((user) => (
                  <div
                    key={user.name}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
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
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">{user.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 flex items-center gap-0.5">
                          <Flame className="h-3 w-3 text-orange-400" />
                          {user.streak}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{user.points.toLocaleString()} pts</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-slate-400">No contributors yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20">
                  <p className="text-xl font-bold text-emerald-700"><AnimatedCounter target={posts.reduce((s, p) => s + p.likeCount, 0)} duration={0.8} /></p>
                  <p className="text-xs text-emerald-600">Total Likes</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/20">
                  <p className="text-xl font-bold text-violet-700"><AnimatedCounter target={posts.reduce((s, p) => s + p.commentCount, 0)} duration={0.8} /></p>
                  <p className="text-xs text-violet-600">Comments</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20">
                  <p className="text-xl font-bold text-amber-700"><AnimatedCounter target={posts.reduce((s, p) => s + p.viewCount, 0)} duration={0.8} /></p>
                  <p className="text-xs text-amber-600">Views</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/20">
                  <p className="text-xl font-bold text-pink-700"><AnimatedCounter target={posts.length} duration={0.5} /></p>
                  <p className="text-xs text-pink-600">Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Heart Burst Animations */}
      <AnimatePresence>
        {heartBursts.map(burst => (
          <HeartBurst key={burst.id} x={burst.x} y={burst.y} />
        ))}
      </AnimatePresence>

      {/* Delete Post Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletePostId}
        onOpenChange={(open) => { if (!open) setDeletePostId(null); }}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone and all comments and reactions will be removed."
        confirmLabel="Delete"
        onConfirm={handleDeletePost}
        variant="destructive"
      />

      {/* Create Post Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-emerald-600" />
              Create a Post
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-slate-700 dark:text-slate-300 mb-1.5">Title</Label>
              <Input
                placeholder="What's on your mind?"
                value={newPost.title}
                onChange={(e) => { setNewPost({ ...newPost, title: e.target.value }); if (postErrors.title) setPostErrors(prev => { const n = {...prev}; delete n.title; return n; }); }}
                className={`border-border focus:border-emerald-400 ${postErrors.title ? 'border-destructive focus:border-destructive' : ''}`}
              />
              {postErrors.title && <p className="text-sm text-destructive mt-1">{postErrors.title}</p>}
            </div>

            {/* Content with Markdown Toolbar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-slate-700 dark:text-slate-300">Content</Label>
                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  {isPreviewMode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {isPreviewMode ? 'Edit' : 'Preview'}
                </button>
              </div>

              {/* Gradient border wrapper on focus */}
              <div className={`rounded-lg transition-all duration-300 p-[1px] ${composerFocused ? 'bg-gradient-to-r from-emerald-500 via-violet-500 to-pink-500' : 'bg-transparent'}`}>
                {isPreviewMode ? (
                  <div className="min-h-[120px] p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(newPost.content) || '<span class="text-slate-400">Nothing to preview</span>' }} />
                  </div>
                ) : (
                  <>
                    {/* Markdown Toolbar */}
                    <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-t-lg border border-b-0 border-slate-200 dark:border-slate-700">
                      {MARKDOWN_TOOLBAR.map((tool) => (
                        <button
                          key={tool.label}
                          onClick={() => insertMarkdown(tool.prefix, tool.suffix)}
                          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          title={tool.label}
                        >
                          <tool.icon className="h-4 w-4" />
                        </button>
                      ))}
                      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
                      <div className="relative">
                        <button
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          title="Emoji"
                        >
                          <Smile className="h-4 w-4" />
                        </button>
                        <AnimatePresence>
                          {showEmojiPicker && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -5 }}
                              className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-2 z-50 w-64"
                            >
                              <div className="grid grid-cols-8 gap-1">
                                {EMOJI_PICKER_LIST.map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => insertEmoji(emoji)}
                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-base"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <Textarea
                      id="post-content-textarea"
                      placeholder="Share your thoughts, questions, or resources... (Markdown supported)"
                      value={newPost.content}
                      onChange={(e) => { setNewPost({ ...newPost, content: e.target.value }); if (postErrors.content) setPostErrors(prev => { const n = {...prev}; delete n.content; return n; }); }}
                      onFocus={() => setComposerFocused(true)}
                      onBlur={() => setComposerFocused(false)}
                      rows={5}
                      className={`border-border focus:border-emerald-400 resize-none rounded-t-none border-t-0 focus:ring-0 ${postErrors.content ? 'border-destructive focus:border-destructive' : ''}`}
                    />
                  </>
                )}
              </div>
              {/* Character Count */}
              <div className="flex justify-between mt-1">
                {postErrors.content && <span className="text-xs text-destructive">{postErrors.content}</span>}
                {!postErrors.content && <span />}
                <span className={`text-xs font-medium ${charColor}`}>
                  {charCount}/{maxChars}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-700 dark:text-slate-300 mb-1.5">Type</Label>
                <Select value={newPost.type} onValueChange={(v) => setNewPost({ ...newPost, type: v as CommunityPost['type'] })}>
                  <SelectTrigger className="border-border">
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
                <Label className="text-slate-700 dark:text-slate-300 mb-1.5">Category</Label>
                <Select value={newPost.categoryId} onValueChange={(v) => setNewPost({ ...newPost, categoryId: v })}>
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.id !== 'all').map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Topic Tags Selector */}
            <div>
              <Label className="text-slate-700 dark:text-slate-300 mb-1.5">Topic Tags</Label>
              <div className="flex flex-wrap gap-2">
                {TOPIC_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/30 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-slate-700 dark:text-slate-300 mb-1.5">Additional Tags (comma separated)</Label>
              <Input
                placeholder="e.g., nextjs, react, tips"
                value={newPost.tags}
                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                className="border-border focus:border-emerald-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-border">
              Cancel
            </Button>
            <Button
              onClick={handleCreatePost}
              disabled={createPostMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              {createPostMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {createPostMutation.isPending ? 'Posting...' : 'Post'}
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
  reactions,
  userReactions,
  floatingEmojis,
  onToggleComments,
  onToggleLike,
  onToggleBookmark,
  onEmojiReaction,
  onHeartBurst,
  onDelete,
  onAddComment,
  currentUserId,
  isDeleting,
  isAddingComment,
}: {
  post: CommunityPost;
  index: number;
  isExpanded: boolean;
  isLiked: boolean;
  isBookmarked: boolean;
  reactions: Record<string, number>;
  userReactions: Set<string>;
  floatingEmojis: { id: string; postId: string; emoji: string }[];
  onToggleComments: () => void;
  onToggleLike: () => void;
  onToggleBookmark: () => void;
  onEmojiReaction: (emoji: EmojiType) => void;
  onHeartBurst: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onAddComment: (content: string) => void;
  currentUserId: string;
  isDeleting?: boolean;
  isAddingComment?: boolean;
}) {
  const roleBadge = getRoleBadge(post.author?.role || 'learner');
  const readingTime = estimateReadingTime(post.content);
  const engagementScore = getEngagementScore(post);

  // Find most popular reaction
  const topReaction = Object.entries(reactions).sort((a, b) => b[1] - a[1])[0];

  // Gradient border state
  const [isHovered, setIsHovered] = useState(false);

  // Comment input state
  const [commentText, setCommentText] = useState('');

  const isOwner = currentUserId && post.authorId === currentUserId;

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      onAddComment(commentText);
      setCommentText('');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient border on hover */}
      <div className={`rounded-xl transition-all duration-300 p-[1px] ${isHovered ? 'bg-gradient-to-r from-emerald-500 via-violet-500 to-pink-500' : 'bg-transparent'}`}>
        <Card className={`border-border transition-all overflow-hidden backdrop-blur-md bg-white/80 dark:bg-white/5 ${post.isPinned ? 'ring-2 ring-amber-400/50' : ''}`}>
          <CardContent className="p-0">
            {/* Author Header */}
            <div className="p-4 pb-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 ring-2 ring-slate-100 dark:ring-slate-700">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-violet-500 text-white font-semibold text-sm">
                        {post.author?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online status indicator */}
                    {post.author?.isActive && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-900" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 dark:text-slate-50 text-sm">{post.author?.name || 'Unknown'}</span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${roleBadge.class} border-0`}>
                        {roleBadge.label}
                      </Badge>
                      {post.isPinned && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                        >
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-400/50 gap-1">
                            <Pin className="h-2.5 w-2.5" /> Pinned
                          </Badge>
                        </motion.div>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo(post.createdAt)}
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="flex items-center gap-0.5">
                        <Flame className="h-3 w-3 text-amber-400" />
                        {engagementScore}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span>{readingTime} min read</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className={`text-xs gap-1 ${getTypeBadgeStyle(post.type)}`}>
                    {getTypeEmoji(post.type)} {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                  </Badge>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDelete}
                      disabled={isDeleting}
                      className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full"
                      title="Delete post"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 pt-3 pb-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base leading-snug mb-1.5">{post.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{post.content}</p>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {post.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 hover:from-slate-100 hover:to-slate-200 cursor-pointer transition-all dark:from-slate-800 dark:to-slate-700 dark:text-slate-400"
                  >
                    <Tag className="h-2.5 w-2.5 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Emoji Reaction Bar */}
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 flex-wrap">
                {EMOJI_REACTIONS.map(emoji => {
                  const count = reactions[emoji] || 0;
                  const isUserReacted = userReactions.has(emoji);
                  const isTop = topReaction && topReaction[0] === emoji && topReaction[1] > 0;
                  return (
                    <motion.button
                      key={emoji}
                      onClick={() => onEmojiReaction(emoji)}
                      whileTap={{ scale: 0.85 }}
                      className={`relative flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all ${
                        isUserReacted
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 ring-1 ring-emerald-500/30'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      } ${isTop ? 'ring-1 ring-amber-400/50 bg-amber-50 dark:bg-amber-900/20' : ''}`}
                    >
                      <motion.span
                        animate={isUserReacted ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ type: 'spring', stiffness: 500, damping: 10 }}
                        className="text-base"
                      >
                        {emoji}
                      </motion.span>
                      {count > 0 && (
                        <span className={`text-xs font-medium ${isTop ? 'text-amber-600' : 'text-slate-500 dark:text-slate-400'}`}>
                          {count}
                        </span>
                      )}
                      {/* Floating +1 animations */}
                      <AnimatePresence>
                        {floatingEmojis.filter(f => f.emoji === emoji).map(f => (
                          <FloatingPlusOne key={f.id} emoji={emoji} />
                        ))}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Stats Row */}
            <div className="px-4 py-1.5 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-4 dark:border-slate-800">
              <span className="flex items-center gap-1"><Flame className="h-3 w-3" />{post.viewCount} views</span>
              <span>{post.likeCount} likes</span>
              <span>{post.commentCount} comments</span>
            </div>

            {/* Action Bar */}
            <div className="px-2 py-1 border-t border-slate-100 flex items-center dark:border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { onToggleLike(); onHeartBurst(e); }}
                className={`flex-1 gap-1.5 text-sm rounded-lg ${
                  isLiked ? 'text-red-500 hover:text-red-600 hover:bg-red-50' : 'text-slate-500 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <motion.div
                  animate={isLiked ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ type: 'spring', stiffness: 500, damping: 10 }}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                </motion.div>
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
                <motion.div
                  animate={isBookmarked ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ type: 'spring', stiffness: 500, damping: 10 }}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </motion.div>
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
                  <div className="border-t border-border bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="p-4 space-y-3">
                      {/* Real comments from API */}
                      {(post.comments && post.comments.length > 0) ? post.comments.map((comment, idx) => (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                          className="flex gap-3"
                        >
                          <Avatar className="h-7 w-7 shrink-0">
                            <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                              {comment.author?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-semibold text-slate-900 dark:text-slate-50">{comment.author?.name || 'Unknown'}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">{timeAgo(comment.createdAt)}</span>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>
                            <button className="text-xs text-slate-400 hover:text-red-500 mt-1 flex items-center gap-1">
                              <Heart className="h-3 w-3" /> {comment.likeCount}
                            </button>
                          </div>
                        </motion.div>
                      )) : (
                        <div className="text-center py-3">
                          <p className="text-xs text-slate-400">No comments yet. Be the first to comment!</p>
                        </div>
                      )}

                      {/* Comment Input */}
                      <div className="flex gap-2 pt-2">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-medium">
                            {currentUserId ? 'U' : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex gap-2">
                          <Input
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleCommentSubmit();
                              }
                            }}
                            className="text-sm border-border focus:border-emerald-400 h-8"
                            disabled={isAddingComment}
                          />
                          <Button
                            size="sm"
                            onClick={handleCommentSubmit}
                            disabled={!commentText.trim() || isAddingComment}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 shrink-0"
                          >
                            {isAddingComment ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Send className="h-3 w-3" />
                            )}
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
      </div>
    </motion.div>
  );
}
