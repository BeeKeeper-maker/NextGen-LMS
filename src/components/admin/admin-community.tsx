'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, LayoutGrid, List, Pin, Lock, Unlock, Trash2, Eye,
  MessageSquare, Heart, Clock, Tag, Megaphone, HelpCircle, Star,
  Edit3, X, Filter
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
import { demoCommunityPosts } from '@/lib/mock-data';
import type { CommunityPost, CommunityCategory } from '@/types';

// Category data for display
const communityCategories: CommunityCategory[] = [
  { id: 'cat-1', tenantId: 'demo-tenant-1', name: 'General Discussion', description: 'Open discussions about anything', icon: '💬', color: '#10B981', orderIndex: 0, isDefault: true },
  { id: 'cat-2', tenantId: 'demo-tenant-1', name: 'Q&A Support', description: 'Get help and ask questions', icon: '❓', color: '#8B5CF6', orderIndex: 1, isDefault: false },
  { id: 'cat-3', tenantId: 'demo-tenant-1', name: 'Announcements', description: 'Official announcements', icon: '📢', color: '#F59E0B', orderIndex: 2, isDefault: false },
  { id: 'cat-4', tenantId: 'demo-tenant-1', name: 'Show & Tell', description: 'Share your work and projects', icon: '🌟', color: '#EC4899', orderIndex: 3, isDefault: false },
];

// Post counts per category
const categoryPostCounts: Record<string, number> = {
  'cat-1': 24,
  'cat-2': 18,
  'cat-3': 7,
  'cat-4': 12,
};

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
    case 'discussion': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
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

export function AdminCommunity() {
  const [posts, setPosts] = useState<CommunityPost[]>(demoCommunityPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CommunityCategory | null>(null);
  const [newPost, setNewPost] = useState({ title: '', content: '', type: 'discussion' as CommunityPost['type'], categoryId: 'cat-1', tags: '' });
  const [newCategory, setNewCategory] = useState({ name: '', icon: '💬', color: '#10B981' });

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

  // Stats
  const totalPosts = posts.length;
  const activeDiscussions = posts.filter(p => !p.isLocked).length;
  const engagementRate = Math.round((posts.reduce((sum, p) => sum + p.likeCount + p.commentCount, 0) / (posts.reduce((sum, p) => sum + p.viewCount, 0) || 1)) * 100);

  const handleCreatePost = () => {
    const post: CommunityPost = {
      id: `post-${Date.now()}`,
      tenantId: 'demo-tenant-1',
      authorId: 'demo-admin-1',
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
        id: 'demo-admin-1',
        tenantId: 'demo-tenant-1',
        email: 'admin@nextgen-lms.com',
        name: 'Sarah Mitchell',
        role: 'tenant_admin',
        timezone: 'America/New_York',
        locale: 'en',
        streakDays: 14,
        totalPoints: 2850,
        isActive: true,
        createdAt: '2024-01-15T00:00:00Z',
      },
      createdAt: new Date().toISOString(),
    };
    setPosts([post, ...posts]);
    setShowCreateDialog(false);
    setNewPost({ title: '', content: '', type: 'discussion', categoryId: 'cat-1', tags: '' });
  };

  const handleTogglePin = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, isPinned: !p.isPinned } : p));
  };

  const handleToggleLock = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, isLocked: !p.isLocked } : p));
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  const handleAddCategory = () => {
    const category: CommunityCategory = {
      id: `cat-${Date.now()}`,
      tenantId: 'demo-tenant-1',
      name: newCategory.name,
      icon: newCategory.icon,
      color: newCategory.color,
      orderIndex: communityCategories.length,
      isDefault: false,
    };
    communityCategories.push(category);
    categoryPostCounts[category.id] = 0;
    setShowCategoryDialog(false);
    setNewCategory({ name: '', icon: '💬', color: '#10B981' });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Community Management</h1>
          <p className="text-slate-500 mt-1">Moderate posts, manage categories, and track engagement</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shrink-0">
          <Megaphone className="h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {/* Top Bar: Search, Filters, View Toggle */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-slate-200 focus:border-emerald-400"
              />
            </div>
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px] border-slate-200">
                  <Filter className="h-3.5 w-3.5 mr-1 text-slate-400" />
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
                <SelectTrigger className="w-[140px] border-slate-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pinned">📌 Pinned</SelectItem>
                  <SelectItem value="locked">🔒 Locked</SelectItem>
                  <SelectItem value="active">✅ Active</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[170px] border-slate-200">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {communityCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* View Toggle */}
              <div className="flex border border-slate-200 rounded-md overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-slate-900 text-white rounded-none' : 'rounded-none'}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-slate-900 text-white rounded-none' : 'rounded-none'}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Posts', value: totalPosts, icon: MessageSquare, color: 'emerald' },
          { label: 'Active Discussions', value: activeDiscussions, icon: Eye, color: 'violet' },
          { label: 'Engagement Rate', value: `${engagementRate}%`, icon: Heart, color: 'pink' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-slate-200 hover:shadow-md transition-shadow">
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
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Posts Grid/List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Posts ({filteredPosts.length})</h2>
        </div>
        <AnimatePresence mode="popLayout">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPosts.map((post, i) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={i}
                  onTogglePin={handleTogglePin}
                  onToggleLock={handleToggleLock}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPosts.map((post, i) => (
                <PostListItem
                  key={post.id}
                  post={post}
                  index={i}
                  onTogglePin={handleTogglePin}
                  onToggleLock={handleToggleLock}
                  onDelete={handleDeletePost}
                />
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

      {/* Category Management */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900">Category Management</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingCategory(null);
                setNewCategory({ name: '', icon: '💬', color: '#10B981' });
                setShowCategoryDialog(true);
              }}
              className="gap-1.5 border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {communityCategories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: cat.color + '20', color: cat.color }}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">{cat.name}</p>
                    <p className="text-xs text-slate-400">{categoryPostCounts[cat.id] || 0} posts</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-slate-400 hover:text-violet-600"
                      onClick={() => {
                        setEditingCategory(cat);
                        setNewCategory({ name: cat.name, icon: cat.icon || '💬', color: cat.color || '#10B981' });
                        setShowCategoryDialog(true);
                      }}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Post Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Create New Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-slate-700 mb-1.5">Title</Label>
              <Input
                placeholder="Enter post title..."
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="border-slate-200 focus:border-emerald-400"
              />
            </div>
            <div>
              <Label className="text-slate-700 mb-1.5">Content</Label>
              <Textarea
                placeholder="Write your post content..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={4}
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
                    {communityCategories.map(cat => (
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Create Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-slate-700 mb-1.5">Name</Label>
              <Input
                placeholder="Category name..."
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="border-slate-200 focus:border-emerald-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-700 mb-1.5">Icon (emoji)</Label>
                <Input
                  placeholder="💬"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  className="border-slate-200 focus:border-emerald-400"
                />
              </div>
              <div>
                <Label className="text-slate-700 mb-1.5">Color</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="h-9 w-9 rounded border border-slate-200 cursor-pointer"
                  />
                  <Input
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="border-slate-200 flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)} className="border-slate-200">
              Cancel
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={!newCategory.name.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {editingCategory ? 'Save Changes' : 'Add Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Post Card (Grid View) ────────────────────────────────────────────────────

function PostCard({
  post,
  index,
  onTogglePin,
  onToggleLock,
  onDelete,
}: {
  post: CommunityPost;
  index: number;
  onTogglePin: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const cat = communityCategories.find(c => c.id === post.categoryId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`border-slate-200 hover:shadow-lg transition-all h-full flex flex-col ${post.isPinned ? 'ring-2 ring-emerald-200 border-emerald-200' : ''}`}>
        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Top: Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {post.isPinned && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs gap-1">
                <Pin className="h-3 w-3" /> Pinned
              </Badge>
            )}
            {post.isLocked && (
              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-xs gap-1">
                <Lock className="h-3 w-3" /> Locked
              </Badge>
            )}
            <Badge variant="outline" className={`text-xs gap-1 ${getTypeColor(post.type)}`}>
              {getTypeEmoji(post.type)} {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-base leading-snug mb-1.5 line-clamp-2">
            {post.title}
          </h3>

          {/* Content preview */}
          <p className="text-slate-500 text-sm leading-relaxed mb-3 line-clamp-2 flex-1">
            {post.content}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200">
                  <Tag className="h-2.5 w-2.5 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Category */}
          {cat && (
            <div className="mb-3">
              <span
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: (cat.color || '#10B981') + '15', color: cat.color || '#10B981' }}
              >
                {cat.icon} {cat.name}
              </span>
            </div>
          )}

          {/* Author & Stats */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-medium">
                  {post.author?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-slate-600 font-medium">{post.author?.name || 'Unknown'}</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {timeAgo(post.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{post.viewCount}</span>
              <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" />{post.likeCount}</span>
              <span className="flex items-center gap-0.5"><MessageSquare className="h-3 w-3" />{post.commentCount}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 mt-3 pt-2 border-t border-slate-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTogglePin(post.id)}
              className={`h-8 text-xs gap-1 ${post.isPinned ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Pin className="h-3 w-3" />
              {post.isPinned ? 'Unpin' : 'Pin'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleLock(post.id)}
              className={`h-8 text-xs gap-1 ${post.isLocked ? 'text-red-600 hover:text-red-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {post.isLocked ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {post.isLocked ? 'Unlock' : 'Lock'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1 text-slate-500 hover:text-slate-700"
            >
              <Eye className="h-3 w-3" />
              View
            </Button>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(post.id)}
              className="h-8 text-xs gap-1 text-slate-400 hover:text-red-600"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Post List Item ───────────────────────────────────────────────────────────

function PostListItem({
  post,
  index,
  onTogglePin,
  onToggleLock,
  onDelete,
}: {
  post: CommunityPost;
  index: number;
  onTogglePin: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const cat = communityCategories.find(c => c.id === post.categoryId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`border-slate-200 hover:shadow-md transition-all ${post.isPinned ? 'ring-2 ring-emerald-200 border-emerald-200' : ''}`}>
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
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs gap-1">
                    <Pin className="h-3 w-3" /> Pinned
                  </Badge>
                )}
                {post.isLocked && (
                  <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-xs gap-1">
                    <Lock className="h-3 w-3" /> Locked
                  </Badge>
                )}
                <Badge variant="outline" className={`text-xs gap-1 ${getTypeColor(post.type)}`}>
                  {getTypeEmoji(post.type)} {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                </Badge>
                {cat && (
                  <span
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: (cat.color || '#10B981') + '15', color: cat.color || '#10B981' }}
                  >
                    {cat.icon} {cat.name}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{post.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-1 mb-2">{post.content}</p>
              <div className="flex items-center gap-3 flex-wrap">
                {post.tags && post.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 text-slate-500">
                    {tag}
                  </Badge>
                ))}
                <span className="text-xs text-slate-400">by {post.author?.name}</span>
                <span className="text-xs text-slate-400 flex items-center gap-0.5">
                  <Clock className="h-3 w-3" /> {timeAgo(post.createdAt)}
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTogglePin(post.id)}
                  className={`h-7 w-7 p-0 ${post.isPinned ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Pin className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleLock(post.id)}
                  className={`h-7 w-7 p-0 ${post.isLocked ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {post.isLocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600">
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(post.id)}
                  className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                >
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
