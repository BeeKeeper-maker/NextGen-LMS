'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ThumbsUp,
  CheckCircle2,
  Flag,
  MessageSquare,
  ChevronDown,
  Pencil,
  Trash2,
  X,
  Send,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  courseReviews as allMockReviews,
  reviewRatingDistribution,
  reviewTags,
  demoCourses,
} from '@/lib/mock-data';
import type { CourseReview } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

// ─── Animation variants ────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ─── Animated Counter ──────────────────────────────────────
function AnimatedCounter({ value, decimals = 1 }: { value: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const duration = 800;

  useState(() => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(value * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  });

  return <span>{displayValue.toFixed(decimals)}</span>;
}

// ─── Star Rating Display ───────────────────────────────────
function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClass,
            star <= Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : star - 0.5 <= rating
                ? 'fill-amber-400/50 text-amber-400'
                : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );
}

// ─── Interactive Star Selector ──────────────────────────────
function StarSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={cn(
              'h-8 w-8 transition-colors duration-150',
              star <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground/30'
            )}
          />
        </motion.button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-medium text-amber-600 dark:text-amber-400">
          {value === 1 ? 'Poor' : value === 2 ? 'Fair' : value === 3 ? 'Good' : value === 4 ? 'Very Good' : 'Excellent'}
        </span>
      )}
    </div>
  );
}

// ─── Rating Summary Card ────────────────────────────────────
function RatingSummaryCard({
  courseId,
  avgRating,
  totalRatings,
}: {
  courseId: string;
  avgRating: number;
  totalRatings: number;
}) {
  const distribution = reviewRatingDistribution[courseId] || reviewRatingDistribution['course-1'];

  // Compute "would recommend" = (4+5 star) / total * 100
  const wouldRecommend = useMemo(() => {
    const positive = distribution.filter(d => d.stars >= 4).reduce((s, d) => s + d.count, 0);
    const total = distribution.reduce((s, d) => s + d.count, 0);
    return total > 0 ? Math.round((positive / total) * 100) : 0;
  }, [distribution]);

  // Compute top tags from reviews for this course
  const topTags = useMemo(() => {
    const courseReviews = allMockReviews.filter(r => r.courseId === courseId);
    const tagCount: Record<string, number> = {};
    courseReviews.forEach(r => r.tags.forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; }));
    return Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([tag, count]) => ({ tag, count }));
  }, [courseId]);

  return (
    <motion.div variants={itemVariants}>
      <Card className="overflow-hidden backdrop-blur-sm bg-card/80 border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Big Rating */}
            <div className="text-center lg:text-left lg:w-48 shrink-0">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <p className="text-5xl font-bold text-foreground">
                  <AnimatedCounter value={avgRating} />
                </p>
                <div>
                  <StarRating rating={avgRating} size="md" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {totalRatings.toLocaleString()} ratings
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center lg:justify-start gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {wouldRecommend}% would recommend
                </span>
              </div>
            </div>

            {/* Middle: Distribution Bars */}
            <div className="flex-1 space-y-2">
              <h4 className="text-sm font-semibold text-foreground mb-3">Rating Distribution</h4>
              {distribution.map((dist) => (
                <div key={dist.stars} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-8 text-right font-medium">
                    {dist.stars}★
                  </span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dist.percentage}%` }}
                      transition={{ duration: 0.8, delay: (5 - dist.stars) * 0.1, ease: 'easeOut' }}
                      className={cn(
                        'h-full rounded-full',
                        dist.stars >= 4
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                          : dist.stars === 3
                            ? 'bg-gradient-to-r from-amber-300 to-amber-400'
                            : 'bg-gradient-to-r from-orange-300 to-orange-400'
                      )}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {dist.count} ({dist.percentage}%)
                  </span>
                </div>
              ))}
            </div>

            {/* Right: Top Tags */}
            <div className="lg:w-48 shrink-0">
              <h4 className="text-sm font-semibold text-foreground mb-3">Top Tags</h4>
              <div className="flex flex-wrap gap-2">
                {topTags.map(({ tag, count }) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                  >
                    {tag} ({count})
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Single Review Card ─────────────────────────────────────
function ReviewCard({
  review,
  onHelpful,
  onEdit,
  onDelete,
}: {
  review: CourseReview;
  onHelpful: (id: string) => void;
  onEdit: (review: CourseReview) => void;
  onDelete: (id: string) => void;
}) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays < 1) return 'Today';
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div variants={itemVariants} layout>
      <Card className="overflow-hidden backdrop-blur-sm bg-card/80 border-border/50 hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="text-xs bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 dark:from-amber-900/40 dark:to-amber-800/40 dark:text-amber-300">
                {review.userAvatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              {/* Header Row */}
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <span className="text-sm font-semibold text-foreground">{review.userName}</span>
                {review.isVerifiedPurchase && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 gap-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
                {review.isOwnReview && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    Your Review
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">· {formatDate(review.date)}</span>
              </div>

              {/* Star Rating + Progress */}
              <div className="flex items-center gap-3 mb-2">
                <StarRating rating={review.rating} size="sm" />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Progress value={review.courseProgress} className="h-1.5 w-16" />
                  <span>{review.courseProgress}% complete</span>
                </div>
              </div>

              {/* Title */}
              <h4 className="text-sm font-semibold text-foreground mb-1">{review.title}</h4>

              {/* Content */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{review.content}</p>

              {/* Tags */}
              {review.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {review.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-[10px] px-2 py-0.5 bg-amber-50/80 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Instructor Reply */}
              {review.instructorReply && (
                <div className="ml-2 pl-4 border-l-2 border-amber-300 dark:border-amber-700 mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="text-[10px] px-1.5 py-0 gap-0.5 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800">
                      <ShieldCheck className="h-3 w-3" />
                      Instructor
                    </Badge>
                    <span className="text-xs font-medium text-foreground">
                      {review.instructorReply.instructorName}
                    </span>
                    <span className="text-xs text-muted-foreground">· {formatDate(review.instructorReply.date)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.instructorReply.content}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-7 text-xs gap-1.5',
                    review.isHelpful
                      ? 'text-amber-600 hover:text-amber-700'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  onClick={() => onHelpful(review.id)}
                >
                  <ThumbsUp className={cn('h-3.5 w-3.5', review.isHelpful && 'fill-amber-400')} />
                  Helpful ({review.helpfulCount})
                </Button>

                {review.isOwnReview && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                      onClick={() => onEdit(review)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-red-600"
                      onClick={() => onDelete(review.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Write Review Dialog ────────────────────────────────────
function WriteReviewDialog({
  open,
  onClose,
  onSubmit,
  editingReview,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (review: Partial<CourseReview>) => void;
  editingReview: CourseReview | null;
}) {
  const [rating, setRating] = useState(editingReview?.rating || 0);
  const [title, setTitle] = useState(editingReview?.title || '');
  const [content, setContent] = useState(editingReview?.content || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(editingReview?.tags || []);
  const [submitted, setSubmitted] = useState(false);

  const charCount = content.length;
  const maxChars = 2000;
  const minChars = 20;
  const canSubmit = rating > 0 && title.trim().length > 0 && charCount >= minChars;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      rating,
      title: title.trim(),
      content: content.trim(),
      tags: selectedTags,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setTitle('');
      setContent('');
      setSelectedTags([]);
      onClose();
    }, 1500);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="py-12 flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              >
                <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
              </motion.div>
              <h3 className="text-lg font-semibold text-foreground">Review Submitted!</h3>
              <p className="text-sm text-muted-foreground mt-1">Thank you for your feedback</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400" />
                  {editingReview ? 'Edit Your Review' : 'Write a Review'}
                </DialogTitle>
                <DialogDescription>
                  Share your experience with this course. Your feedback helps other learners make informed decisions.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 mt-4">
                {/* Star Rating */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Your Rating <span className="text-red-500">*</span>
                  </label>
                  <StarSelector value={rating} onChange={setRating} />
                </div>

                {/* Review Title */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Review Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Summarize your experience"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                  />
                </div>

                {/* Review Body */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Your Review <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder={`Share your detailed experience (minimum ${minChars} characters)...`}
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, maxChars))}
                    rows={5}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className={cn(
                        'text-xs',
                        charCount < minChars
                          ? 'text-red-500'
                          : charCount > maxChars * 0.9
                            ? 'text-amber-600'
                            : 'text-muted-foreground'
                      )}
                    >
                      {charCount < minChars
                        ? `${minChars - charCount} more characters needed`
                        : `${charCount}/${maxChars} characters`}
                    </span>
                    {charCount >= minChars && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Tags (select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {reviewTags.map((tag) => (
                      <motion.button
                        key={tag}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
                          selectedTags.includes(tag)
                            ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700'
                            : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                        )}
                      >
                        {tag}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6 gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Send className="h-4 w-4" />
                  {editingReview ? 'Update Review' : 'Submit Review'}
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirmation Dialog ─────────────────────────────
function DeleteReviewDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Review</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your review? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main CourseReviews Component ───────────────────────────
export function CourseReviews({
  courseId,
  avgRating,
  totalRatings,
}: {
  courseId: string;
  avgRating: number;
  totalRatings: number;
}) {
  const [reviews, setReviews] = useState<CourseReview[]>(allMockReviews);
  const [sortBy, setSortBy] = useState('most_recent');
  const [filterStars, setFilterStars] = useState<number | null>(null);
  const [showWriteDialog, setShowWriteDialog] = useState(false);
  const [editingReview, setEditingReview] = useState<CourseReview | null>(null);
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);

  // Filter and sort reviews for current course
  const filteredReviews = useMemo(() => {
    let result = reviews.filter((r) => r.courseId === courseId);

    // Filter by star rating
    if (filterStars !== null) {
      result = result.filter((r) => r.rating === filterStars);
    }

    // Sort
    switch (sortBy) {
      case 'most_recent':
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'most_helpful':
        result.sort((a, b) => b.helpfulCount - a.helpfulCount);
        break;
      case 'highest_rated':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest_rated':
        result.sort((a, b) => a.rating - b.rating);
        break;
    }

    return result;
  }, [reviews, courseId, filterStars, sortBy]);

  // Visible reviews for pagination
  const visibleReviews = filteredReviews.slice(0, visibleCount);
  const hasMore = visibleCount < filteredReviews.length;

  // Handle helpful click
  const handleHelpful = useCallback((id: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              isHelpful: !r.isHelpful,
              helpfulCount: r.isHelpful ? r.helpfulCount - 1 : r.helpfulCount + 1,
            }
          : r
      )
    );
  }, []);

  // Handle write/edit review submit
  const handleSubmitReview = useCallback(
    (data: Partial<CourseReview>) => {
      if (editingReview) {
        // Update existing review
        setReviews((prev) =>
          prev.map((r) =>
            r.id === editingReview.id
              ? { ...r, ...data, date: new Date().toISOString() }
              : r
          )
        );
        setEditingReview(null);
      } else {
        // Create new review
        const newReview: CourseReview = {
          id: `rev-new-${Date.now()}`,
          courseId,
          userId: 'demo-learner-1',
          userName: 'You',
          userAvatar: 'YO',
          rating: data.rating || 5,
          title: data.title || '',
          content: data.content || '',
          date: new Date().toISOString(),
          helpfulCount: 0,
          isHelpful: false,
          courseProgress: 68,
          isVerifiedPurchase: true,
          tags: data.tags || [],
          status: 'published',
          isOwnReview: true,
        };
        setReviews((prev) => [newReview, ...prev]);
      }
    },
    [editingReview, courseId]
  );

  // Handle edit review
  const handleEdit = useCallback((review: CourseReview) => {
    setEditingReview(review);
    setShowWriteDialog(true);
  }, []);

  // Handle delete review
  const handleDelete = useCallback(() => {
    if (deleteReviewId) {
      setReviews((prev) => prev.filter((r) => r.id !== deleteReviewId));
      setDeleteReviewId(null);
    }
  }, [deleteReviewId]);

  // Distribution click to filter
  const handleDistributionClick = useCallback((stars: number) => {
    setFilterStars((prev) => (prev === stars ? null : stars));
    setVisibleCount(5);
  }, []);

  const courseName = demoCourses.find(c => c.id === courseId)?.title || 'Course';

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground text-lg">Course Reviews</h3>
          <p className="text-sm text-muted-foreground">
            What learners are saying about {courseName}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingReview(null);
            setShowWriteDialog(true);
          }}
          className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Star className="h-4 w-4" />
          Write a Review
        </Button>
      </motion.div>

      {/* Rating Summary Card */}
      <RatingSummaryCard courseId={courseId} avgRating={avgRating} totalRatings={totalRatings} />

      {/* Filter / Sort Bar */}
      <motion.div variants={itemVariants}>
        <Card className="backdrop-blur-sm bg-card/80 border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Star Filter Indicator */}
              {filterStars !== null && (
                <Badge
                  variant="secondary"
                  className="gap-1.5 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 cursor-pointer"
                  onClick={() => setFilterStars(null)}
                >
                  {filterStars} Star{filterStars > 1 ? 's' : ''} Only
                  <X className="h-3 w-3" />
                </Badge>
              )}

              {/* Filter by Distribution (clickable) */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Filter:</span>
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleDistributionClick(star)}
                    className={cn(
                      'px-2 py-1 rounded-md transition-colors',
                      filterStars === star
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'hover:bg-muted'
                    )}
                  >
                    {star}★
                  </button>
                ))}
              </div>

              <div className="sm:ml-auto">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="most_recent">Most Recent</SelectItem>
                    <SelectItem value="most_helpful">Most Helpful</SelectItem>
                    <SelectItem value="highest_rated">Highest Rated</SelectItem>
                    <SelectItem value="lowest_rated">Lowest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reviews List */}
      <AnimatePresence mode="wait">
        {filteredReviews.length > 0 ? (
          <motion.div
            key={`${filterStars}-${sortBy}`}
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {visibleReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onHelpful={handleHelpful}
                onEdit={handleEdit}
                onDelete={setDeleteReviewId}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {filterStars
                ? `No ${filterStars}-star reviews found. Try a different filter.`
                : 'No reviews yet. Be the first to review!'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load More */}
      {hasMore && (
        <motion.div variants={itemVariants} className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setVisibleCount((prev) => prev + 5)}
            className="gap-2"
          >
            <ChevronDown className="h-4 w-4" />
            Load More Reviews ({filteredReviews.length - visibleCount} remaining)
          </Button>
        </motion.div>
      )}

      {/* Write/Edit Review Dialog */}
      <WriteReviewDialog
        open={showWriteDialog}
        onClose={() => {
          setShowWriteDialog(false);
          setEditingReview(null);
        }}
        onSubmit={handleSubmitReview}
        editingReview={editingReview}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteReviewDialog
        open={!!deleteReviewId}
        onClose={() => setDeleteReviewId(null)}
        onConfirm={handleDelete}
      />
    </motion.div>
  );
}
