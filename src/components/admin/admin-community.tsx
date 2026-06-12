'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, LayoutGrid, List, Pin, Lock, Unlock, Trash2, Eye,
  MessageSquare, Heart, Clock, Tag, Megaphone, HelpCircle, Star,
  Edit3, X, Filter, Flag, CheckCircle2, XCircle, ChevronUp, ChevronDown,
  Shield, Image as ImageIcon, Bold, Italic, Heading, ListOrdered, Code,
  Link2, Flame, Users, TrendingUp, BarChart3, AlertTriangle, BookOpen,
  Calendar, ArrowUpDown, CheckSquare, Square, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  useCommunityPosts,
  useCreateCommunityPost,
  useUpdateCommunityPost,
  useDeleteCommunityPost,
  useCommunityReviews,
  useModerateReview,
  useRespondToReview,
} from '@/hooks/use-data';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useAppStore } from '@/store/app-store';
import { validateFields, required, minLength } from '@/lib/validations';
import type { CommunityPost, CommunityCategory } from '@/types';

// ─── Review Types ────────────────────────────────────────────────────────────
// Types derived from the CourseReview Prisma model + API includes

type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

interface CourseReview {
  id: string;
  courseName: string;
  courseThumbnail: string;
  reviewer: string;
  reviewerEmail: string;
  reviewerAvatar: string;
  reviewerEnrollDate: string;
  reviewerCoursesEnrolled: number;
  courseInstructor: string;
  courseAvgRating: number;
  rating: number;
  text: string;
  status: ReviewStatus;
  date: string;
  flagged: boolean;
  flagReason?: string;
  adminResponse?: string;
  moderationHistory: { action: string; by: string; date: string; reason?: string }[];
}

// Map API review data to the component's CourseReview interface
function mapApiReviewToCourseReview(apiReview: any): CourseReview {
  let moderationHistory: CourseReview['moderationHistory'] = [];
  if (apiReview.moderationHistory) {
    try {
      moderationHistory = JSON.parse(apiReview.moderationHistory);
    } catch {
      moderationHistory = [];
    }
  }

  const authorName = apiReview.author?.name || 'Unknown';
  const nameParts = authorName.split(' ');
  const avatarInitials = nameParts.length >= 2
    ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
    : authorName.substring(0, 2).toUpperCase();

  return {
    id: apiReview.id,
    courseName: apiReview.course?.title || 'Unknown Course',
    courseThumbnail: apiReview.course?.thumbnailUrl || '',
    reviewer: authorName,
    reviewerEmail: apiReview.author?.email || '',
    reviewerAvatar: avatarInitials,
    reviewerEnrollDate: apiReview.author?.createdAt
      ? new Date(apiReview.author.createdAt).toISOString().split('T')[0]
      : '',
    reviewerCoursesEnrolled: apiReview.author?._count?.enrollments || 0,
    courseInstructor: '', // Not stored directly in review; could be derived from course data
    courseAvgRating: apiReview.course?.avgRating || 0,
    rating: apiReview.rating,
    text: apiReview.content,
    status: apiReview.status as ReviewStatus,
    date: apiReview.createdAt ? new Date(apiReview.createdAt).toISOString().split('T')[0] : '',
    flagged: apiReview.flagged || false,
    flagReason: apiReview.flagReason || undefined,
    adminResponse: apiReview.adminResponse || undefined,
    moderationHistory,
  };
}

// Fallback reviews used when API returns no data yet (empty DB)
const fallbackReviews: CourseReview[] = [
  {
    id: 'r1', courseName: 'Advanced React & Next.js Masterclass', courseThumbnail: '/courses/react-next.jpg',
    reviewer: 'Mike Chen', reviewerEmail: 'mike.chen@email.com', reviewerAvatar: 'MC',
    reviewerEnrollDate: '2025-09-15', reviewerCoursesEnrolled: 4,
    courseInstructor: 'Dr. Sarah Wilson', courseAvgRating: 4.7,
    rating: 5, text: 'Excellent course! The instructor explains complex concepts in a way that is easy to understand. The real-world projects were incredibly helpful for building my portfolio. I particularly enjoyed the section on server components and data fetching patterns. Highly recommended for anyone looking to level up their React skills.',
    status: 'pending', date: '2026-06-10', flagged: false, moderationHistory: []
  },
  {
    id: 'r2', courseName: 'Data Visualization & Analytics', courseThumbnail: '/courses/data-viz.jpg',
    reviewer: 'Sarah Lopez', reviewerEmail: 'sarah.l@email.com', reviewerAvatar: 'SL',
    reviewerEnrollDate: '2025-11-02', reviewerCoursesEnrolled: 2,
    courseInstructor: 'Prof. James Lee', courseAvgRating: 3.8,
    rating: 2, text: 'The content was outdated and several examples didn\'t work with the latest version of the library. The instructor seems knowledgeable but the course needs a major update. Also, some of the quiz questions have incorrect answers marked as correct.',
    status: 'flagged', date: '2026-06-09', flagged: true, flagReason: 'Inappropriate',
    moderationHistory: [{ action: 'Flagged', by: 'System', date: '2026-06-09', reason: 'Auto-flagged: multiple user reports' }]
  },
  {
    id: 'r3', courseName: 'Python for Data Science', courseThumbnail: '/courses/python-ds.jpg',
    reviewer: 'Alex Kumar', reviewerEmail: 'alex.k@email.com', reviewerAvatar: 'AK',
    reviewerEnrollDate: '2025-07-20', reviewerCoursesEnrolled: 6,
    courseInstructor: 'Dr. Maya Patel', courseAvgRating: 4.5,
    rating: 4, text: 'Great foundational course for data science with Python. The pandas and numpy sections are particularly well done. I would have liked more coverage of machine learning libraries, but as a starting point it\'s solid. The coding exercises are practical and relevant.',
    status: 'approved', date: '2026-06-08', flagged: false, adminResponse: 'Thank you for the feedback, Alex! We\'re adding ML content in the next update.',
    moderationHistory: [{ action: 'Approved', by: 'Admin', date: '2026-06-08' }]
  },
  {
    id: 'r4', courseName: 'UI/UX Design Fundamentals', courseThumbnail: '/courses/uiux.jpg',
    reviewer: 'Emma Wilson', reviewerEmail: 'emma.w@email.com', reviewerAvatar: 'EW',
    reviewerEnrollDate: '2026-01-10', reviewerCoursesEnrolled: 1,
    courseInstructor: 'Lisa Chang', courseAvgRating: 4.2,
    rating: 1, text: 'BUY MY COURSE INSTEAD!!! Visit spam-site.com for the REAL design course at 90% off!!! Limited time offer!!! Don\'t waste your money here!!!',
    status: 'flagged', date: '2026-06-08', flagged: true, flagReason: 'Spam',
    moderationHistory: [{ action: 'Flagged', by: 'System', date: '2026-06-08', reason: 'Auto-flagged: spam detected' }]
  },
  {
    id: 'r5', courseName: 'Cloud Architecture with AWS', courseThumbnail: '/courses/aws.jpg',
    reviewer: 'David Park', reviewerEmail: 'david.p@email.com', reviewerAvatar: 'DP',
    reviewerEnrollDate: '2025-06-05', reviewerCoursesEnrolled: 5,
    courseInstructor: 'Tom Richards', courseAvgRating: 4.6,
    rating: 5, text: 'This is the most comprehensive AWS course I\'ve taken. The hands-on labs are incredible and the architecture patterns section alone is worth the price. Tom is an excellent instructor who clearly has real-world experience. The section on cost optimization saved my company thousands.',
    status: 'pending', date: '2026-06-07', flagged: false, moderationHistory: []
  },
  {
    id: 'r6', courseName: 'Machine Learning A-Z', courseThumbnail: '/courses/ml.jpg',
    reviewer: 'Priya Sharma', reviewerEmail: 'priya.s@email.com', reviewerAvatar: 'PS',
    reviewerEnrollDate: '2025-08-22', reviewerCoursesEnrolled: 3,
    courseInstructor: 'Dr. Raj Gupta', courseAvgRating: 4.4,
    rating: 3, text: 'Decent course but could be better organized. Some sections assume prior knowledge that isn\'t mentioned in prerequisites. The math explanations are too brief for beginners. However, the project-based approach in the second half is really good.',
    status: 'pending', date: '2026-06-06', flagged: false, moderationHistory: []
  },
  {
    id: 'r7', courseName: 'Advanced React & Next.js Masterclass', courseThumbnail: '/courses/react-next.jpg',
    reviewer: 'Jordan Blake', reviewerEmail: 'jordan.b@email.com', reviewerAvatar: 'JB',
    reviewerEnrollDate: '2025-12-01', reviewerCoursesEnrolled: 2,
    courseInstructor: 'Dr. Sarah Wilson', courseAvgRating: 4.7,
    rating: 4, text: 'Very good course overall. The instructor is clearly an expert. I docked one star because some of the code examples in the middleware section have typos, and the community forum response time could be better. Otherwise, learned a ton!',
    status: 'approved', date: '2026-06-05', flagged: false,
    moderationHistory: [{ action: 'Approved', by: 'Admin', date: '2026-06-05' }]
  },
  {
    id: 'r8', courseName: 'DevOps Engineering Bootcamp', courseThumbnail: '/courses/devops.jpg',
    reviewer: 'Chris Nguyen', reviewerEmail: 'chris.n@email.com', reviewerAvatar: 'CN',
    reviewerEnrollDate: '2025-10-18', reviewerCoursesEnrolled: 7,
    courseInstructor: 'Kevin Miller', courseAvgRating: 4.3,
    rating: 2, text: 'Way too basic for an "advanced" bootcamp. The title is misleading. Most of the content is available for free on YouTube. The Docker section is okay but the Kubernetes part is severely lacking.',
    status: 'rejected', date: '2026-06-04', flagged: false,
    moderationHistory: [{ action: 'Rejected', by: 'Admin', date: '2026-06-04', reason: 'Off-topic' }]
  },
  {
    id: 'r9', courseName: 'TypeScript Deep Dive', courseThumbnail: '/courses/typescript.jpg',
    reviewer: 'Rachel Torres', reviewerEmail: 'rachel.t@email.com', reviewerAvatar: 'RT',
    reviewerEnrollDate: '2026-02-14', reviewerCoursesEnrolled: 3,
    courseInstructor: 'Anna Kowalski', courseAvgRating: 4.8,
    rating: 5, text: 'Anna is an incredible teacher! The way she breaks down advanced TypeScript concepts like conditional types and mapped types makes them accessible. The real-world project at the end ties everything together perfectly. Best TypeScript course on the platform.',
    status: 'pending', date: '2026-06-03', flagged: false, moderationHistory: []
  },
  {
    id: 'r10', courseName: 'Cybersecurity Essentials', courseThumbnail: '/courses/cyber.jpg',
    reviewer: 'Marcus Lee', reviewerEmail: 'marcus.l@email.com', reviewerAvatar: 'ML',
    reviewerEnrollDate: '2025-05-30', reviewerCoursesEnrolled: 4,
    courseInstructor: 'Col. Ret. Smith', courseAvgRating: 3.9,
    rating: 3, text: 'The content is okay but feels very theoretical. I expected more hands-on labs and practical exercises. The section on penetration testing is basically just definitions with no actual practice. Good for beginners wanting an overview, not for practitioners.',
    status: 'pending', date: '2026-06-02', flagged: false, moderationHistory: []
  },
];

// ─── Category Fallback Data ──────────────────────────────────────────────────────

const fallbackCategories: CommunityCategory[] = [
  { id: 'cat-1', tenantId: 'demo-tenant-1', name: 'General Discussion', description: 'Open discussions about anything related to learning', icon: '💬', color: '#10B981', orderIndex: 0, isDefault: true },
  { id: 'cat-2', tenantId: 'demo-tenant-1', name: 'Q&A Support', description: 'Get help and ask questions about courses', icon: '❓', color: '#8B5CF6', orderIndex: 1, isDefault: false },
  { id: 'cat-3', tenantId: 'demo-tenant-1', name: 'Announcements', description: 'Official announcements from the team', icon: '📢', color: '#F59E0B', orderIndex: 2, isDefault: false },
  { id: 'cat-4', tenantId: 'demo-tenant-1', name: 'Show & Tell', description: 'Share your work and projects with the community', icon: '🌟', color: '#EC4899', orderIndex: 3, isDefault: false },
];

const categoryPostCounts: Record<string, number> = {
  'cat-1': 24, 'cat-2': 18, 'cat-3': 7, 'cat-4': 12,
};

const presetColors = ['#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#EF4444', '#3B82F6'];
const presetIcons = ['💬', '❓', '📢', '🌟', '📚', '💡', '🎯', '🏆'];

// ─── Helper Functions ───────────────────────────────────────────────────────────

function getTypeIcon(type: CommunityPost['type']) {
  switch (type) {
    case 'discussion': return <MessageSquare className="h-4 w-4" />;
    case 'question': return <HelpCircle className="h-4 w-4" />;
    case 'announcement': return <Megaphone className="h-4 w-4" />;
    case 'resource': return <Star className="h-4 w-4" />;
  }
}

function getTypeEmoji(type: CommunityPost['type']) {
  switch (type) {
    case 'discussion': return '💬';
    case 'question': return '❓';
    case 'announcement': return '📢';
    case 'resource': return '🌟';
  }
}

function getTypeColor(type: CommunityPost['type']) {
  switch (type) {
    case 'discussion': return 'bg-emerald-100 text-emerald-700 border-emerald-500/30';
    case 'question': return 'bg-violet-100 text-violet-700 border-violet-200';
    case 'announcement': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'resource': return 'bg-pink-100 text-pink-700 border-pink-200';
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

function getReadingTime(text: string): number {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}

function getRoleBadge(role: string) {
  switch (role) {
    case 'tenant_admin': return { label: 'Admin', color: 'bg-emerald-100 text-emerald-700' };
    case 'instructor': return { label: 'Instructor', color: 'bg-violet-100 text-violet-700' };
    case 'learner': return { label: 'Learner', color: 'bg-slate-100 text-slate-600' };
    default: return { label: 'Member', color: 'bg-slate-100 text-slate-600' };
  }
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export function AdminCommunity() {
  const currentTenant = useAppStore((s) => s.currentTenant);
  const currentUser = useAppStore((s) => s.currentUser);
  const tenantId = currentTenant?.id || '';
  const userId = currentUser?.id || '';

  // ── Real API data hooks ──
  const { data: communityData, isLoading: postsLoading, refetch: refetchPosts } = useCommunityPosts(tenantId);
  const posts = useMemo(() => communityData?.posts || [], [communityData?.posts]);
  const apiCategories = useMemo(() => communityData?.categories || [], [communityData?.categories]);

  const createPostMutation = useCreateCommunityPost();
  const updatePostMutation = useUpdateCommunityPost();
  const deletePostMutation = useDeleteCommunityPost();

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CommunityCategory | null>(null);
  const [newPost, setNewPost] = useState({
    title: '', content: '', type: 'discussion' as CommunityPost['type'],
    categoryId: 'cat-1', tags: '', isPinned: false, isLocked: false, scheduledDate: '', featuredImage: ''
  });
  const [newCategory, setNewCategory] = useState({ name: '', description: '', icon: '💬', color: '#10B981', isDefault: false });
  const [postDialogTab, setPostDialogTab] = useState<'compose' | 'preview'>('compose');
  const [activeMainTab, setActiveMainTab] = useState('posts');
  const [postErrors, setPostErrors] = useState<Record<string, string>>({});
  const [postTouched, setPostTouched] = useState<Record<string, boolean>>({});

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; postId: string; postTitle: string }>({
    open: false, postId: '', postTitle: ''
  });

  // Category list: derive from API data, fall back to defaults
  // Local additions are tracked separately so they merge with API categories
  const [localCategories, setLocalCategories] = useState<CommunityCategory[]>([]);
  const categories = apiCategories.length > 0 ? [...apiCategories, ...localCategories] : [...fallbackCategories, ...localCategories];

  // Review moderation state
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string>('all');
  const [reviewCourseFilter, setReviewCourseFilter] = useState<string>('all');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<string>('all');
  const [reviewSort, setReviewSort] = useState<string>('newest');
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [showReviewDetailDialog, setShowReviewDetailDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState<CourseReview | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [adminResponse, setAdminResponse] = useState('');

  // Review moderation — real API data
  const { data: reviewsData, isLoading: reviewsLoading } = useCommunityReviews({
    status: reviewStatusFilter,
    sort: reviewSort,
    tenantId: tenantId || undefined,
  });
  const reviews = useMemo(() => {
    if (reviewsData?.reviews && reviewsData.reviews.length > 0) {
      return reviewsData.reviews.map(mapApiReviewToCourseReview);
    }
    return fallbackReviews;
  }, [reviewsData]);

  const moderateReviewMutation = useModerateReview();
  const respondToReviewMutation = useRespondToReview();

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || post.type === typeFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pinned' && post.isPinned) ||
      (statusFilter === 'locked' && post.isLocked) ||
      (statusFilter === 'active' && !post.isPinned && !post.isLocked);
    const matchesCategory = categoryFilter === 'all' || post.categoryId === categoryFilter;
    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  // Filter reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];
    if (reviewStatusFilter !== 'all') result = result.filter(r => r.status === reviewStatusFilter);
    if (reviewCourseFilter !== 'all') result = result.filter(r => r.courseName === reviewCourseFilter);
    if (reviewRatingFilter !== 'all') result = result.filter(r => r.rating === Number(reviewRatingFilter));
    switch (reviewSort) {
      case 'newest': result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); break;
      case 'oldest': result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); break;
      case 'highest': result.sort((a, b) => b.rating - a.rating); break;
      case 'lowest': result.sort((a, b) => a.rating - b.rating); break;
      case 'flagged': result.sort((a, b) => (b.flagged ? 1 : 0) - (a.flagged ? 1 : 0)); break;
    }
    return result;
  }, [reviews, reviewStatusFilter, reviewCourseFilter, reviewRatingFilter, reviewSort]);

  // Unique course names for filter
  const courseNames = useMemo(() => [...new Set(reviews.map(r => r.courseName))], [reviews]);

  // Review analytics
  const reviewAnalytics = useMemo(() => {
    const totalThisMonth = reviews.filter(r => new Date(r.date).getMonth() === 5).length;
    const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0';
    const responseRate = reviews.length > 0 ? Math.round((reviews.filter(r => r.adminResponse).length / reviews.length) * 100) : 0;
    const flaggedCount = reviews.filter(r => r.flagged).length;
    const ratingDist = [5, 4, 3, 2, 1].map(star => ({ star, count: reviews.filter(r => r.rating === star).length }));
    return { totalThisMonth, avgRating, responseRate, flaggedCount, ratingDist };
  }, [reviews]);

  // Stats
  const totalPosts = posts.length;
  const activeDiscussions = posts.filter(p => !p.isLocked).length;
  const engagementRate = Math.round((posts.reduce((sum, p) => sum + p.likeCount + p.commentCount, 0) / (posts.reduce((sum, p) => sum + p.viewCount, 0) || 1)) * 100);

  // ── CRUD handlers using real API mutations ──

  const handleCreatePost = useCallback(() => {
    const errs = validateFields({
      title: [required(newPost.title, 'Title'), minLength(newPost.title, 3, 'Title')],
      content: [required(newPost.content, 'Content'), minLength(newPost.content, 10, 'Content')],
      categoryId: [required(newPost.categoryId, 'Category')],
    });
    setPostErrors(errs);
    setPostTouched({ title: true, content: true, categoryId: true });
    if (Object.keys(errs).length > 0) return;

    const tags = newPost.tags ? newPost.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    createPostMutation.mutate({
      tenantId,
      authorId: userId,
      title: newPost.title,
      content: newPost.content,
      type: newPost.type,
      categoryId: newPost.categoryId,
      tags,
      isPinned: newPost.isPinned,
      isLocked: newPost.isLocked,
    }, {
      onSuccess: () => {
        setShowCreateDialog(false);
        setNewPost({ title: '', content: '', type: 'discussion', categoryId: 'cat-1', tags: '', isPinned: false, isLocked: false, scheduledDate: '', featuredImage: '' });
        setPostDialogTab('compose');
        setPostErrors({});
        setPostTouched({});
      },
    });
  }, [createPostMutation, newPost, tenantId, userId]);

  const handleTogglePin = useCallback((postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    updatePostMutation.mutate({ id: postId, isPinned: !post.isPinned });
  }, [posts, updatePostMutation]);

  const handleToggleLock = useCallback((postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    updatePostMutation.mutate({ id: postId, isLocked: !post.isLocked });
  }, [posts, updatePostMutation]);

  const handleDeleteRequest = useCallback((postId: string) => {
    const post = posts.find(p => p.id === postId);
    setDeleteConfirm({
      open: true,
      postId,
      postTitle: post?.title || 'this post',
    });
  }, [posts]);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteConfirm.postId) {
      deletePostMutation.mutate(deleteConfirm.postId, {
        onSuccess: () => {
          setDeleteConfirm({ open: false, postId: '', postTitle: '' });
        },
      });
    }
  }, [deleteConfirm.postId, deletePostMutation]);

  const handleAddCategory = () => {
    const category: CommunityCategory = {
      id: `cat-${Date.now()}`,
      tenantId: tenantId || 'demo-tenant-1',
      name: newCategory.name,
      description: newCategory.description,
      icon: newCategory.icon,
      color: newCategory.color,
      orderIndex: categories.length,
      isDefault: newCategory.isDefault,
    };
    setLocalCategories([...localCategories, category]);
    categoryPostCounts[category.id] = 0;
    setShowCategoryDialog(false);
    setNewCategory({ name: '', description: '', icon: '💬', color: '#10B981', isDefault: false });
  };

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;
    // For reorder, we rebuild the full list as a local override
    const updated = [...categories];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((c, i) => c.orderIndex = i);
    // Store the reordered list as the new local categories (replacing API order)
    setLocalCategories(updated);
  };

  // Review moderation handlers — real API mutations
  const handleReviewAction = useCallback((reviewId: string, action: 'approved' | 'rejected' | 'flagged', reason?: string) => {
    moderateReviewMutation.mutate({
      reviewId,
      action,
      reason,
      adminName: currentUser?.name || 'Admin',
    });
  }, [moderateReviewMutation, currentUser?.name]);

  const handleBulkAction = useCallback((action: 'approved' | 'rejected' | 'flagged') => {
    selectedReviews.forEach(id => {
      moderateReviewMutation.mutate({
        reviewId: id,
        action,
        reason: action === 'flagged' ? 'Bulk flagged by admin' : undefined,
        adminName: currentUser?.name || 'Admin',
      });
    });
    setSelectedReviews([]);
  }, [selectedReviews, moderateReviewMutation, currentUser?.name]);

  const handleRespondToReview = useCallback((reviewId: string, response: string) => {
    if (!response.trim()) return;
    respondToReviewMutation.mutate({
      reviewId,
      adminResponse: response,
    }, {
      onSuccess: () => {
        setAdminResponse('');
      },
    });
  }, [respondToReviewMutation, setAdminResponse]);

  const toggleReviewSelection = (id: string) => {
    setSelectedReviews(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAllReviews = () => {
    if (selectedReviews.length === filteredReviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(filteredReviews.map(r => r.id));
    }
  };

  // Determine if any mutation is in progress
  const isMutating = createPostMutation.isPending || updatePostMutation.isPending || deletePostMutation.isPending;
  const isReviewMutating = moderateReviewMutation.isPending || respondToReviewMutation.isPending;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">Community Management</h1>
          <p className="text-slate-500 mt-1">Moderate posts, manage categories, review ratings, and track engagement</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shrink-0">
          <Megaphone className="h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {/* Community Analytics Card */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Members', value: '2,847', icon: Users, color: 'emerald', change: '+12%' },
          { label: 'Active This Week', value: '1,203', icon: TrendingUp, color: 'violet', change: '+8%' },
          { label: 'Posts This Week', value: '156', icon: MessageSquare, color: 'pink', change: '+23%' },
          { label: 'Avg Response Time', value: '2.4h', icon: Clock, color: 'amber', change: '-15%' },
          { label: 'Engagement Rate', value: '89%', icon: Heart, color: 'rose', change: '+5%' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border hover:shadow-md transition-shadow">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                    stat.color === 'violet' ? 'bg-violet-100 text-violet-600' :
                    stat.color === 'pink' ? 'bg-pink-100 text-pink-600' :
                    stat.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                    'bg-rose-100 text-rose-600'
                  }`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs text-emerald-600 font-medium">{stat.change}</span>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-4">
        <TabsList className="bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="posts" className="gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            <MessageSquare className="h-4 w-4" /> Posts
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            <Tag className="h-4 w-4" /> Categories
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            <Shield className="h-4 w-4" /> Review Moderation
            {reviews.filter(r => r.status === 'pending').length > 0 && (
              <Badge className="bg-amber-500 text-white text-xs px-1.5 py-0 ml-1">{reviews.filter(r => r.status === 'pending').length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ─── Posts Tab ─────────────────────────────────────────────────────── */}
        <TabsContent value="posts" className="space-y-4">
          {/* Search & Filters */}
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input placeholder="Search posts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 border-border focus:border-emerald-400" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px] border-border">
                      <Filter className="h-3.5 w-3.5 mr-1 text-slate-400 dark:text-slate-500" />
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="discussion">💬 Discussion</SelectItem>
                      <SelectItem value="question">❓ Question</SelectItem>
                      <SelectItem value="announcement">📢 Announcement</SelectItem>
                      <SelectItem value="resource">🌟 Resource</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] border-border"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pinned">📌 Pinned</SelectItem>
                      <SelectItem value="locked">🔒 Locked</SelectItem>
                      <SelectItem value="active">✅ Active</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[170px] border-border"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex border border-border rounded-md overflow-hidden">
                    <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'bg-slate-900 text-white rounded-none' : 'rounded-none'}>
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-slate-900 text-white rounded-none' : 'rounded-none'}>
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Post Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Posts', value: totalPosts, icon: MessageSquare, color: 'emerald' },
              { label: 'Active Discussions', value: activeDiscussions, icon: Eye, color: 'violet' },
              { label: 'Engagement Rate', value: `${engagementRate}%`, icon: Heart, color: 'pink' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                      stat.color === 'violet' ? 'bg-violet-100 text-violet-600' :
                      'bg-pink-100 text-pink-600'
                    }`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Loading State */}
          {postsLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
              <span className="ml-3 text-slate-500">Loading posts...</span>
            </div>
          )}

          {/* Posts Grid/List */}
          {!postsLoading && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Posts ({filteredPosts.length})</h2>
              </div>
              <AnimatePresence mode="popLayout">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredPosts.map((post, i) => (
                      <PostCard key={post.id} post={post} index={i} categories={categories} onTogglePin={handleTogglePin} onToggleLock={handleToggleLock} onDelete={handleDeleteRequest} isMutating={isMutating} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPosts.map((post, i) => (
                      <PostListItem key={post.id} post={post} index={i} categories={categories} onTogglePin={handleTogglePin} onToggleLock={handleToggleLock} onDelete={handleDeleteRequest} isMutating={isMutating} />
                    ))}
                  </div>
                )}
              </AnimatePresence>
              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-lg">No posts match your filters</p>
                  <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* ─── Categories Tab ────────────────────────────────────────────────── */}
        <TabsContent value="categories" className="space-y-4">
          <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4 text-emerald-500" />
                  Category Management
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => { setEditingCategory(null); setNewCategory({ name: '', description: '', icon: '💬', color: '#10B981', isDefault: false }); setShowCategoryDialog(true); }}
                  className="gap-1.5 border-border text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-500/30">
                  <Plus className="h-3.5 w-3.5" /> Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map((cat, i) => (
                  <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-border hover:shadow-sm transition-all group">
                      {/* Reorder buttons */}
                      <div className="flex flex-col gap-0.5">
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-slate-400 hover:text-slate-600" disabled={i === 0} onClick={() => handleMoveCategory(i, 'up')}>
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-slate-400 hover:text-slate-600" disabled={i === categories.length - 1} onClick={() => handleMoveCategory(i, 'down')}>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                      {/* Color + Icon */}
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: cat.color + '20', color: cat.color }}>
                        {cat.icon}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 dark:text-slate-50 text-sm truncate">{cat.name}</p>
                          {cat.isDefault && <Badge className="bg-emerald-100 text-emerald-700 text-xs">Default</Badge>}
                        </div>
                        <p className="text-xs text-slate-400 truncate">{cat.description || 'No description'}</p>
                      </div>
                      {/* Post count */}
                      <div className="text-center px-3">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{categoryPostCounts[cat.id] || 0}</p>
                        <p className="text-xs text-slate-400">posts</p>
                      </div>
                      {/* Color dot */}
                      <div className="w-4 h-4 rounded-full shrink-0 border border-border" style={{ backgroundColor: cat.color }} />
                      {/* Actions */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-violet-600"
                          onClick={() => { setEditingCategory(cat); setNewCategory({ name: cat.name, description: cat.description || '', icon: cat.icon || '💬', color: cat.color || '#10B981', isDefault: cat.isDefault }); setShowCategoryDialog(true); }}>
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-red-600">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Review Moderation Tab ─────────────────────────────────────────── */}
        <TabsContent value="reviews" className="space-y-4">
          {/* Loading State */}
          {reviewsLoading && (
            <div className="space-y-4">
              {/* Skeleton analytics cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="border-border">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse">
                          <div className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="h-6 w-12 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mb-1" />
                      <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Skeleton review cards */}
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse shrink-0 mt-1" />
                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="flex gap-2">
                            <div className="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                            <div className="h-5 w-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                          </div>
                          <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                          <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Review Analytics */}
          {!reviewsLoading && (
          <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: 'Reviews This Month', value: reviewAnalytics.totalThisMonth, icon: Star, color: 'emerald' },
              { label: 'Average Rating', value: reviewAnalytics.avgRating, icon: TrendingUp, color: 'violet' },
              { label: 'Response Rate', value: `${reviewAnalytics.responseRate}%`, icon: MessageSquare, color: 'pink' },
              { label: 'Flagged Reviews', value: reviewAnalytics.flaggedCount, icon: AlertTriangle, color: 'amber' },
              { label: 'Rating Distribution', value: '', icon: BarChart3, color: 'slate', custom: true },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={stat.custom ? 'col-span-2 lg:col-span-1' : ''}>
                <Card className="border-border hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                        stat.color === 'violet' ? 'bg-violet-100 text-violet-600' :
                        stat.color === 'pink' ? 'bg-pink-100 text-pink-600' :
                        stat.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        <stat.icon className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                    {stat.custom && (
                      <div className="mt-2 space-y-1">
                        {reviewAnalytics.ratingDist.map(rd => (
                          <div key={rd.star} className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-500 w-4">{rd.star}</span>
                            <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
                            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div className="h-full rounded-full bg-amber-400" style={{ width: `${reviews.length > 0 ? (rd.count / reviews.length) * 100 : 0}%` }} />
                            </div>
                            <span className="text-xs text-slate-400 w-3">{rd.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Review Filters & Bulk Actions */}
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex flex-wrap gap-2 flex-1">
                  <Select value={reviewStatusFilter} onValueChange={setReviewStatusFilter}>
                    <SelectTrigger className="w-[140px] border-border">
                      <Filter className="h-3.5 w-3.5 mr-1 text-slate-400" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">⏳ Pending</SelectItem>
                      <SelectItem value="approved">✅ Approved</SelectItem>
                      <SelectItem value="rejected">❌ Rejected</SelectItem>
                      <SelectItem value="flagged">🚩 Flagged</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={reviewCourseFilter} onValueChange={setReviewCourseFilter}>
                    <SelectTrigger className="w-[200px] border-border">
                      <BookOpen className="h-3.5 w-3.5 mr-1 text-slate-400" />
                      <SelectValue placeholder="Course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courseNames.map(name => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={reviewRatingFilter} onValueChange={setReviewRatingFilter}>
                    <SelectTrigger className="w-[120px] border-border">
                      <Star className="h-3.5 w-3.5 mr-1 text-slate-400" />
                      <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      {[5, 4, 3, 2, 1].map(r => (
                        <SelectItem key={r} value={String(r)}>{r} Star{r > 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={reviewSort} onValueChange={setReviewSort}>
                    <SelectTrigger className="w-[160px] border-border">
                      <ArrowUpDown className="h-3.5 w-3.5 mr-1 text-slate-400" />
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="highest">Highest Rating</SelectItem>
                      <SelectItem value="lowest">Lowest Rating</SelectItem>
                      <SelectItem value="flagged">Most Flagged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Bulk Actions */}
                {selectedReviews.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <span className="text-sm text-emerald-700 font-medium">{selectedReviews.length} selected</span>
                    <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleBulkAction('approved')} disabled={isReviewMutating}>
                      {isReviewMutating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />} Approve
                    </Button>
                    <Button size="sm" className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white" onClick={() => handleBulkAction('rejected')} disabled={isReviewMutating}>
                      <XCircle className="h-3 w-3 mr-1" /> Reject
                    </Button>
                    <Button size="sm" className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white" onClick={() => handleBulkAction('flagged')} disabled={isReviewMutating}>
                      <Flag className="h-3 w-3 mr-1" /> Flag
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Review Queue */}
          <div className="space-y-3">
            {/* Select All */}
            <div className="flex items-center gap-2 px-1">
              <Checkbox checked={selectedReviews.length === filteredReviews.length && filteredReviews.length > 0} onCheckedChange={toggleAllReviews} />
              <span className="text-sm text-slate-500">Select all ({filteredReviews.length} reviews)</span>
            </div>
            <AnimatePresence>
              {filteredReviews.map((review, i) => (
                <motion.div key={review.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03 }}>
                  <Card className={`border-border hover:shadow-md transition-all ${
                    review.status === 'flagged' ? 'ring-1 ring-amber-500/40 border-amber-500/30' :
                    review.status === 'rejected' ? 'opacity-70' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Checkbox */}
                        <div className="flex items-start pt-1">
                          <Checkbox checked={selectedReviews.includes(review.id)} onCheckedChange={() => toggleReviewSelection(review.id)} />
                        </div>
                        {/* Course thumbnail placeholder */}
                        <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          <BookOpen className="h-6 w-6 text-slate-400" />
                        </div>
                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {/* Status Badge */}
                            <Badge variant="outline" className={`text-xs gap-1 ${
                              review.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              review.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              review.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                              'bg-orange-50 text-orange-700 border-orange-200'
                            }`}>
                              {review.status === 'pending' && <Clock className="h-3 w-3" />}
                              {review.status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
                              {review.status === 'rejected' && <XCircle className="h-3 w-3" />}
                              {review.status === 'flagged' && <Flag className="h-3 w-3" />}
                              {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                            </Badge>
                            {review.flagged && (
                              <Badge className="bg-orange-100 text-orange-700 text-xs gap-1">
                                <AlertTriangle className="h-3 w-3" /> {review.flagReason}
                              </Badge>
                            )}
                            {/* Star Rating */}
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                              ))}
                            </div>
                          </div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-sm">{review.courseName}</h3>
                          <p className="text-slate-500 text-sm mt-1 line-clamp-2">{review.text}</p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">{review.reviewerAvatar}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-slate-600 font-medium">{review.reviewer}</span>
                            </div>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {review.date}
                            </span>
                            {review.adminResponse && (
                              <span className="text-xs text-emerald-600 flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" /> Responded
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Actions */}
                        <div className="shrink-0 flex items-start gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700" onClick={() => { setSelectedReview(review); setShowReviewDetailDialog(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-700" onClick={() => handleReviewAction(review.id, 'approved')} disabled={isReviewMutating}>
                            {isReviewMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-600" onClick={() => handleReviewAction(review.id, 'rejected')} disabled={isReviewMutating}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredReviews.length === 0 && (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-lg">No reviews match your filters</p>
                <p className="text-slate-400 text-sm mt-1">Try adjusting your status or course filters</p>
              </div>
            )}
          </div>
          </>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── Create/Edit Post Dialog (Enhanced) ──────────────────────────────── */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-50">Create New Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Compose/Preview Tabs */}
            <div className="flex border-b border-border">
              <Button variant="ghost" className={`rounded-none border-b-2 ${postDialogTab === 'compose' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500'}`}
                onClick={() => setPostDialogTab('compose')}>
                Edit
              </Button>
              <Button variant="ghost" className={`rounded-none border-b-2 ${postDialogTab === 'preview' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500'}`}
                onClick={() => setPostDialogTab('preview')}>
                Preview
              </Button>
            </div>

            {postDialogTab === 'compose' ? (
              <>
                <div>
                  <Label className="text-slate-700 dark:text-slate-300 mb-1.5">Title</Label>
                  <Input placeholder="Enter post title..." value={newPost.title} onChange={(e) => { setNewPost({ ...newPost, title: e.target.value }); if (postErrors.title) setPostErrors(prev => { const n = {...prev}; delete n.title; return n; }); }} onBlur={() => { setPostTouched(prev => ({...prev, title: true})); const e = validateFields({ title: [required(newPost.title, 'Title'), minLength(newPost.title, 3, 'Title')] }); if (e.title) setPostErrors(prev => ({...prev, title: e.title})); }} className={`border-border focus:border-emerald-400 ${postErrors.title ? 'border-destructive focus:border-destructive' : ''}`} />
                  {postErrors.title && <p className="text-sm text-destructive mt-1">{postErrors.title}</p>}
                </div>
                {/* Rich Text Toolbar */}
                <div>
                  <Label className="text-slate-700 dark:text-slate-300 mb-1.5">Content</Label>
                  <div className={`border border-border rounded-lg overflow-hidden focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400 ${postErrors.content ? 'border-destructive focus-within:border-destructive focus-within:ring-destructive' : ''}`}>
                    <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-900 border-b border-border flex-wrap">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700"><Bold className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700"><Italic className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700"><Heading className="h-3.5 w-3.5" /></Button>
                      <Separator orientation="vertical" className="h-5" />
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700"><ListOrdered className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700"><Code className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700"><Link2 className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700"><ImageIcon className="h-3.5 w-3.5" /></Button>
                    </div>
                    <Textarea placeholder="Write your post content..." value={newPost.content} onChange={(e) => { setNewPost({ ...newPost, content: e.target.value }); if (postErrors.content) setPostErrors(prev => { const n = {...prev}; delete n.content; return n; }); }} onBlur={() => { setPostTouched(prev => ({...prev, content: true})); const e = validateFields({ content: [required(newPost.content, 'Content'), minLength(newPost.content, 10, 'Content')] }); if (e.content) setPostErrors(prev => ({...prev, content: e.content})); }} rows={6} className="border-0 focus-visible:ring-0 resize-none" />
                  </div>
                  {postErrors.content && <p className="text-sm text-destructive mt-1">{postErrors.content}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-slate-700 dark:text-slate-300 mb-1.5">Type</Label>
                    <Select value={newPost.type} onValueChange={(v) => setNewPost({ ...newPost, type: v as CommunityPost['type'] })}>
                      <SelectTrigger className="border-border"><SelectValue /></SelectTrigger>
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
                    <Select value={newPost.categoryId} onValueChange={(v) => { setNewPost({ ...newPost, categoryId: v }); if (postErrors.categoryId) setPostErrors(prev => { const n = {...prev}; delete n.categoryId; return n; }); }}>
                      <SelectTrigger className={`border-border ${postErrors.categoryId ? 'border-destructive' : ''}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {postErrors.categoryId && <p className="text-sm text-destructive mt-1">{postErrors.categoryId}</p>}
                  </div>
                </div>
                <div>
                  <Label className="text-slate-700 dark:text-slate-300 mb-1.5">Tags (comma separated)</Label>
                  <Input placeholder="e.g., nextjs, react, tips" value={newPost.tags} onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })} className="border-border focus:border-emerald-400" />
                </div>
                {/* Featured Image */}
                <div>
                  <Label className="text-slate-700 dark:text-slate-300 mb-1.5">Featured Image</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                    <ImageIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>
                {/* Toggles */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={newPost.isPinned} onCheckedChange={(v) => setNewPost({ ...newPost, isPinned: v })} />
                    <Label className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Pin className="h-3.5 w-3.5" /> Pin Post
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={newPost.isLocked} onCheckedChange={(v) => setNewPost({ ...newPost, isLocked: v })} />
                    <Label className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Lock className="h-3.5 w-3.5" /> Lock Comments
                    </Label>
                  </div>
                </div>
                {/* Scheduled Posting */}
                <div>
                  <Label className="text-slate-700 dark:text-slate-300 mb-1.5">Schedule Post (optional)</Label>
                  <Input type="datetime-local" value={newPost.scheduledDate} onChange={(e) => setNewPost({ ...newPost, scheduledDate: e.target.value })} className="border-border focus:border-emerald-400" />
                </div>
              </>
            ) : (
              /* Preview */
              <div className="border border-border rounded-lg p-6 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {newPost.isPinned && <Badge className="bg-emerald-50 text-emerald-700 text-xs gap-1"><Pin className="h-3 w-3" /> Pinned</Badge>}
                  {newPost.isLocked && <Badge className="bg-red-50 text-red-600 text-xs gap-1"><Lock className="h-3 w-3" /> Locked</Badge>}
                  <Badge className={`text-xs gap-1 ${getTypeColor(newPost.type)}`}>{getTypeEmoji(newPost.type)} {newPost.type.charAt(0).toUpperCase() + newPost.type.slice(1)}</Badge>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{newPost.title || 'Untitled Post'}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Avatar className="h-5 w-5"><AvatarFallback className="bg-violet-100 text-violet-700 text-xs">S</AvatarFallback></Avatar>
                  <span>Sarah Mitchell</span>
                  <span>·</span>
                  <span>Just now</span>
                  {newPost.content && <span>· {getReadingTime(newPost.content)} min read</span>}
                </div>
                {newPost.content && <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{newPost.content}</p>}
                {newPost.tags && (
                  <div className="flex flex-wrap gap-1.5">
                    {newPost.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 text-slate-600"><Tag className="h-2.5 w-2.5 mr-1" />{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); setPostDialogTab('compose'); }} className="border-border">Cancel</Button>
            <Button onClick={handleCreatePost} disabled={createPostMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {createPostMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {newPost.scheduledDate ? 'Schedule Post' : 'Create Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add/Edit Category Dialog (Enhanced) ─────────────────────────────── */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-50">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-slate-700 dark:text-slate-300 mb-1.5">Name</Label>
              <Input placeholder="Category name..." value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} className="border-border focus:border-emerald-400" />
            </div>
            <div>
              <Label className="text-slate-700 dark:text-slate-300 mb-1.5">Description</Label>
              <Input placeholder="Brief description..." value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} className="border-border focus:border-emerald-400" />
            </div>
            <div>
              <Label className="text-slate-700 dark:text-slate-300 mb-2">Icon</Label>
              <div className="flex flex-wrap gap-2">
                {presetIcons.map(icon => (
                  <Button key={icon} variant="outline" size="sm" className={`h-9 w-9 p-0 text-lg ${newCategory.icon === icon ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-border'}`}
                    onClick={() => setNewCategory({ ...newCategory, icon })}>
                    {icon}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-slate-700 dark:text-slate-300 mb-2">Color</Label>
              <div className="flex flex-wrap gap-2">
                {presetColors.map(color => (
                  <button key={color} className={`w-8 h-8 rounded-full border-2 transition-all ${newCategory.color === color ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }} onClick={() => setNewCategory({ ...newCategory, color })} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={newCategory.isDefault} onCheckedChange={(v) => setNewCategory({ ...newCategory, isDefault: v })} />
              <Label className="text-sm text-slate-700 dark:text-slate-300">Set as Default Category</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)} className="border-border">Cancel</Button>
            <Button onClick={handleAddCategory} disabled={!newCategory.name.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {editingCategory ? 'Save Changes' : 'Add Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Review Detail Dialog ────────────────────────────────────────────── */}
      <Dialog open={showReviewDetailDialog} onOpenChange={setShowReviewDetailDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedReview && (
            <>
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-slate-50">Review Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-2">
                {/* Review Content */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`h-5 w-5 ${s <= selectedReview.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                      ))}
                    </div>
                    <Badge variant="outline" className={`text-xs gap-1 ${
                      selectedReview.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      selectedReview.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      selectedReview.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                      'bg-orange-50 text-orange-700 border-orange-200'
                    }`}>
                      {selectedReview.status.charAt(0).toUpperCase() + selectedReview.status.slice(1)}
                    </Badge>
                    {selectedReview.flagged && (
                      <Badge className="bg-orange-100 text-orange-700 text-xs gap-1">
                        <AlertTriangle className="h-3 w-3" /> {selectedReview.flagReason}
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedReview.text}</p>
                </div>

                <Separator />

                {/* Reviewer Info */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">Reviewer</h4>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-violet-100 text-violet-700">{selectedReview.reviewerAvatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-50">{selectedReview.reviewer}</p>
                      <p className="text-xs text-slate-500">{selectedReview.reviewerEmail}</p>
                      <p className="text-xs text-slate-400">Enrolled: {selectedReview.reviewerEnrollDate} · {selectedReview.reviewerCoursesEnrolled} courses</p>
                    </div>
                  </div>
                </div>

                {/* Course Info */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">Course</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <BookOpen className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-50">{selectedReview.courseName}</p>
                      <p className="text-xs text-slate-500">Instructor: {selectedReview.courseInstructor} · Avg Rating: {selectedReview.courseAvgRating}/5</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Admin Response */}
                {selectedReview.adminResponse && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs text-emerald-700 font-medium mb-1">Admin Response</p>
                    <p className="text-sm text-emerald-800 dark:text-emerald-300">{selectedReview.adminResponse}</p>
                  </div>
                )}

                {/* Respond to Review */}
                <div>
                  <Label className="text-slate-700 dark:text-slate-300 mb-1.5">Respond to Review</Label>
                  <Textarea placeholder="Write your response..." value={adminResponse} onChange={(e) => setAdminResponse(e.target.value)} rows={3} className="border-border focus:border-emerald-400 resize-none" />
                  <Button size="sm" className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleRespondToReview(selectedReview.id, adminResponse)} disabled={!adminResponse.trim() || respondToReviewMutation.isPending}>
                    {respondToReviewMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <MessageSquare className="h-3.5 w-3.5 mr-1" />} Send Response
                  </Button>
                </div>

                <Separator />

                {/* Moderation History */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">Moderation History</h4>
                  {selectedReview.moderationHistory.length === 0 ? (
                    <p className="text-xs text-slate-400">No moderation actions yet</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedReview.moderationHistory.map((h, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <div className={`w-2 h-2 rounded-full ${
                            h.action === 'Approved' ? 'bg-emerald-500' :
                            h.action === 'Rejected' ? 'bg-red-500' :
                            'bg-amber-500'
                          }`} />
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{h.action}</span>
                          <span className="text-slate-400">by {h.by}</span>
                          <span className="text-slate-400">· {h.date}</span>
                          {h.reason && <span className="text-slate-500">({h.reason})</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Moderation Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={() => { handleReviewAction(selectedReview.id, 'approved'); setShowReviewDetailDialog(false); }} disabled={isReviewMutating}>
                    {isReviewMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Approve
                  </Button>
                  <Button className="bg-red-600 hover:bg-red-700 text-white gap-1.5" onClick={() => { handleReviewAction(selectedReview.id, 'rejected', rejectReason || 'Inappropriate'); setShowReviewDetailDialog(false); }} disabled={isReviewMutating}>
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5" onClick={() => { handleReviewAction(selectedReview.id, 'flagged', 'Flagged by admin'); setShowReviewDetailDialog(false); }} disabled={isReviewMutating}>
                    <Flag className="h-4 w-4" /> Flag for Review
                  </Button>
                </div>
                {/* Reject Reason */}
                <div>
                  <Label className="text-slate-700 dark:text-slate-300 mb-1.5">Rejection Reason (if rejecting)</Label>
                  <Select value={rejectReason} onValueChange={setRejectReason}>
                    <SelectTrigger className="border-border"><SelectValue placeholder="Select reason..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spam">Spam</SelectItem>
                      <SelectItem value="Inappropriate">Inappropriate</SelectItem>
                      <SelectItem value="Off-topic">Off-topic</SelectItem>
                      <SelectItem value="Conflict of Interest">Conflict of Interest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Delete Post Confirmation Dialog ─────────────────────────────────── */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, postId: '', postTitle: '' })}
        title="Delete Post"
        description={`Are you sure you want to delete "${deleteConfirm.postTitle}"? This action cannot be undone. All comments and reactions on this post will also be permanently removed.`}
        confirmLabel={deletePostMutation.isPending ? 'Deleting...' : 'Delete Post'}
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
    </div>
  );
}

// ─── Enhanced Post Card (Grid View) ────────────────────────────────────────────

function PostCard({
  post, index, categories, onTogglePin, onToggleLock, onDelete, isMutating,
}: {
  post: CommunityPost; index: number; categories: CommunityCategory[];
  onTogglePin: (id: string) => void; onToggleLock: (id: string) => void; onDelete: (id: string) => void;
  isMutating?: boolean;
}) {
  const cat = categories.find(c => c.id === post.categoryId);
  const role = post.author?.role || 'learner';
  const roleBadge = getRoleBadge(role);
  const isHot = (post.likeCount + (post.reactions?.length || 0)) >= 10;
  const readingTime = getReadingTime(post.content);

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.05 }}>
      <Card className={`border-border hover:shadow-lg transition-all h-full flex flex-col ${post.isPinned ? 'ring-2 ring-emerald-500/30 border-emerald-500/30' : ''}`}>
        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Top: Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {post.isPinned && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-500/30 text-xs gap-1">
                <Pin className="h-3 w-3" /> Pinned
              </Badge>
            )}
            {post.isLocked && (
              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-xs gap-1">
                <Lock className="h-3 w-3" /> Locked
              </Badge>
            )}
            {isHot && (
              <Badge className="bg-red-100 text-red-600 text-xs gap-1">
                <Flame className="h-3 w-3" /> Hot
              </Badge>
            )}
            <Badge variant="outline" className={`text-xs gap-1 ${getTypeColor(post.type)}`}>
              {getTypeEmoji(post.type)} {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base leading-snug mb-1.5 line-clamp-2">
            {post.title}
          </h3>

          {/* Content preview */}
          <p className="text-slate-500 text-sm leading-relaxed mb-3 line-clamp-2 flex-1" title={post.content}>
            {post.content}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200">
                  <Tag className="h-2.5 w-2.5 mr-1" /> {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Category */}
          {cat && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: (cat.color || '#10B981') + '15', color: cat.color || '#10B981' }}>
                {cat.icon} {cat.name}
              </span>
            </div>
          )}

          {/* Author & Stats */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-medium">
                  {post.author?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-slate-600 font-medium">{post.author?.name || 'Unknown'}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${roleBadge.color}`}>{roleBadge.label}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{timeAgo(post.createdAt)}</span>
              <span className="flex items-center gap-0.5"><BookOpen className="h-3 w-3" />{readingTime}m</span>
            </div>
          </div>

          {/* Engagement stats */}
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{post.viewCount}</span>
            <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" />{post.likeCount}</span>
            <span className="flex items-center gap-0.5"><MessageSquare className="h-3 w-3" />{post.commentCount}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 mt-3 pt-2 border-t border-border/50">
            <Button variant="ghost" size="sm" onClick={() => onTogglePin(post.id)} disabled={isMutating}
              className={`h-8 text-xs gap-1 ${post.isPinned ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>
              <Pin className="h-3 w-3" />{post.isPinned ? 'Unpin' : 'Pin'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onToggleLock(post.id)} disabled={isMutating}
              className={`h-8 text-xs gap-1 ${post.isLocked ? 'text-red-600 hover:text-red-700' : 'text-slate-500 hover:text-slate-700'}`}>
              {post.isLocked ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {post.isLocked ? 'Unlock' : 'Lock'}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-slate-500 hover:text-slate-700">
              <Eye className="h-3 w-3" /> View
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" onClick={() => onDelete(post.id)} disabled={isMutating} className="h-8 text-xs gap-1 text-slate-400 hover:text-red-600">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Enhanced Post List Item ───────────────────────────────────────────────────

function PostListItem({
  post, index, categories, onTogglePin, onToggleLock, onDelete, isMutating,
}: {
  post: CommunityPost; index: number; categories: CommunityCategory[];
  onTogglePin: (id: string) => void; onToggleLock: (id: string) => void; onDelete: (id: string) => void;
  isMutating?: boolean;
}) {
  const cat = categories.find(c => c.id === post.categoryId);
  const role = post.author?.role || 'learner';
  const roleBadge = getRoleBadge(role);
  const isHot = (post.likeCount + (post.reactions?.length || 0)) >= 10;
  const readingTime = getReadingTime(post.content);

  return (
    <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: index * 0.05 }}>
      <Card className={`border-border hover:shadow-md transition-all ${post.isPinned ? 'ring-2 ring-emerald-500/30 border-emerald-500/30' : ''}`}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Left: Type icon */}
            <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm ${
              post.type === 'discussion' ? 'bg-emerald-100 text-emerald-600' :
              post.type === 'question' ? 'bg-violet-100 text-violet-600' :
              post.type === 'announcement' ? 'bg-amber-100 text-amber-600' :
              'bg-pink-100 text-pink-600'
            }`}>
              {getTypeEmoji(post.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {post.isPinned && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-500/30 text-xs gap-1">
                    <Pin className="h-3 w-3" /> Pinned
                  </Badge>
                )}
                {post.isLocked && (
                  <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-xs gap-1">
                    <Lock className="h-3 w-3" /> Locked
                  </Badge>
                )}
                {isHot && (
                  <Badge className="bg-red-100 text-red-600 text-xs gap-1">
                    <Flame className="h-3 w-3" /> Hot
                  </Badge>
                )}
                <Badge variant="outline" className={`text-xs gap-1 ${getTypeColor(post.type)}`}>
                  {getTypeEmoji(post.type)} {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                </Badge>
                {cat && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: (cat.color || '#10B981') + '15', color: cat.color || '#10B981' }}>
                    {cat.icon} {cat.name}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm mb-1">{post.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-1 mb-2">{post.content}</p>
              <div className="flex items-center gap-3 flex-wrap">
                {post.tags && post.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 text-slate-500">{tag}</Badge>
                ))}
                <span className="text-xs text-slate-600 font-medium">{post.author?.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${roleBadge.color}`}>{roleBadge.label}</span>
                <span className="text-xs text-slate-400 flex items-center gap-0.5">
                  <Clock className="h-3 w-3" /> {timeAgo(post.createdAt)}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-0.5">
                  <BookOpen className="h-3 w-3" /> {readingTime}m
                </span>
              </div>
            </div>

            {/* Right: Stats + Actions */}
            <div className="shrink-0 flex flex-col items-end justify-between">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{post.viewCount}</span>
                <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" />{post.likeCount}</span>
                <span className="flex items-center gap-0.5"><MessageSquare className="h-3 w-3" />{post.commentCount}</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Button variant="ghost" size="sm" onClick={() => onTogglePin(post.id)} disabled={isMutating}
                  className={`h-7 w-7 p-0 ${post.isPinned ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  <Pin className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onToggleLock(post.id)} disabled={isMutating}
                  className={`h-7 w-7 p-0 ${post.isLocked ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'}`}>
                  {post.isLocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600">
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(post.id)} disabled={isMutating} className="h-7 w-7 p-0 text-slate-400 hover:text-red-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
