'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import {
  useCourse,
  useEnrollments,
  useLessonProgress,
  useUpdateProgress,
  useEnroll,
  useCourses,
  useCommunityPosts,
  useAddComment,
  useToggleReaction,
  useCommunityReviews,
  useLessonDiscussions,
  useCreateDiscussion,
} from '@/hooks/use-data';
import { validateFields, required, minLength } from '@/lib/validations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VideoPlayer } from '@/components/shared/video-player';
import type { Chapter } from '@/components/shared/video-player';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  Play,
  FileText,
  Headphones,
  Video,
  Monitor,
  Clock,
  Star,
  Users,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Eye,
  MessageSquare,
  Download,
  ExternalLink,
  GitBranch,
  ThumbsUp,
  ThumbsDown,
  Send,
  BookOpen,
  Award,
  Search,
  Filter,
  Pin,
  Tag,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Calendar,
  Zap,
  Target,
  Trophy,
  ArrowRight,
  Copy,
  Sparkles,
  StickyNote,
  Code2,
  HelpCircle,
  Bookmark,
  Edit3,
  Check,
  X,
  ChevronUp,
  MessageCircle,
  GraduationCap,
  Globe,
  Briefcase,
  Heart,
  Share2,
  MoreHorizontal,
  ArrowUpRight,
  Loader2,
  FileCode,
  Notebook,
  Timer,
  Activity,
  Milestone,
  MessageCircleQuestion,
  Plus,
  Bold,
  Italic,
  Link2,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Lesson, Module } from '@/types';

// ─── Content type icon mapping ─────────────────────────────
function ContentTypeIcon({ type, className }: { type: Lesson['contentType']; className?: string }) {
  switch (type) {
    case 'video':
      return <Video className={className} />;
    case 'text':
      return <FileText className={className} />;
    case 'audio':
      return <Headphones className={className} />;
    case 'document':
      return <FileText className={className} />;
    case 'live_session':
      return <Monitor className={className} />;
    default:
      return <FileText className={className} />;
  }
}

// ─── Format duration ───────────────────────────────────────
function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}h ${remainMins}m`;
}

// ─── Level color mapping ───────────────────────────────────
function getLevelColor(level: string) {
  const colors: Record<string, string> = {
    beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    advanced: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    expert: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[level] || 'bg-slate-100 text-slate-700';
}

function getLevelAccent(level: string) {
  const accents: Record<string, string> = {
    beginner: 'from-emerald-600 to-emerald-800',
    intermediate: 'from-amber-600 to-amber-800',
    advanced: 'from-orange-600 to-orange-800',
    expert: 'from-red-600 to-red-800',
  };
  return accents[level] || 'from-slate-600 to-slate-800';
}

// ─── LocalStorage Notes Hook ─────────────────────────────────
interface Note {
  id: string;
  lessonId: string;
  lessonTitle: string;
  content: string;
  category: 'personal' | 'study_guide' | 'code_snippet' | 'question';
  timestamp?: number;
  createdAt: string;
  updatedAt: string;
}

function useLessonNotes(courseId: string | undefined) {
  const storageKey = `lms-notes-${courseId || 'default'}`;

  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const persistNotes = useCallback((updated: Note[]) => {
    setNotes(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {
        // ignore quota errors
      }
    }
  }, [storageKey]);

  const addNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    persistNotes([...notes, newNote]);
    return newNote;
  }, [notes, persistNotes]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    const updated = notes.map(n =>
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    );
    persistNotes(updated);
  }, [notes, persistNotes]);

  const deleteNote = useCallback((id: string) => {
    persistNotes(notes.filter(n => n.id !== id));
  }, [notes, persistNotes]);

  return { notes, addNote, updateNote, deleteNote };
}

// ─── Animation variants ────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const tabContentVariants = {
  hidden: { opacity: 0, x: 10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.2 } },
};

// ─── Glassmorphism card class ─────────────────────────────
const glassCard = 'backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/30';

// ─── Note Category Config ──────────────────────────────────
const noteCategoryConfig: Record<Note['category'], { label: string; icon: React.ReactNode; color: string }> = {
  personal: { label: 'Personal', icon: <StickyNote className="h-3.5 w-3.5" />, color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  study_guide: { label: 'Study Guide', icon: <BookOpen className="h-3.5 w-3.5" />, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  code_snippet: { label: 'Code Snippet', icon: <Code2 className="h-3.5 w-3.5" />, color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  question: { label: 'Question', icon: <HelpCircle className="h-3.5 w-3.5" />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

// ─── Time ago helper ──────────────────────────────────────
function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// ─── Difficulty Meter Component ────────────────────────────
function DifficultyMeter({ level }: { level: string }) {
  const levelValues: Record<string, number> = {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100,
  };
  const value = levelValues[level] || 25;
  const gradientClass = level === 'beginner' ? 'from-emerald-400 to-emerald-600'
    : level === 'intermediate' ? 'from-amber-400 to-amber-600'
    : level === 'advanced' ? 'from-orange-400 to-orange-600'
    : 'from-red-400 to-red-600';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Difficulty</span>
        <span className={cn('font-semibold capitalize', getLevelColor(level).replace('bg-', 'text-').split(' ')[0])}>{level}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full bg-gradient-to-r', gradientClass)}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Easy</span>
        <span>Expert</span>
      </div>
    </div>
  );
}

// ─── Module Section Component (Enhanced) ───────────────────
function ModuleSection({ module: mod, moduleIndex, onLessonClick, progressMap }: { module: Module; moduleIndex: number; onLessonClick: (lesson: Lesson) => void; progressMap: Record<string, 'completed' | 'in_progress' | 'not_started'> }) {
  const [isOpen, setIsOpen] = useState(moduleIndex === 0);
  const lessons = mod.lessons || [];
  const completedLessons = lessons.filter(
    (l) => progressMap[l.id] === 'completed'
  ).length;
  const totalDuration = lessons.reduce((sum, l) => sum + (l.videoDuration || 0), 0);
  const moduleProgress = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

  return (
    <motion.div
      className={cn('rounded-xl overflow-hidden', glassCard)}
      whileHover={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.2 }}
    >
      {/* Module Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: isOpen ? 0 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-muted-foreground"
          >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Module {moduleIndex + 1}</span>
              {mod.isPublished ? (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Published</Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">Draft</Badge>
              )}
            </div>
            <h4 className="font-semibold text-foreground text-sm mt-0.5">{mod.title}</h4>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {lessons.length} lessons</span>
          {totalDuration > 0 && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDuration(totalDuration)}</span>}
          {/* Module progress percentage */}
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  moduleProgress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-400 to-amber-600'
                )}
                style={{ width: `${moduleProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-medium">{moduleProgress}%</span>
          </div>
          {completedLessons > 0 && (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px]">
              {completedLessons}/{lessons.length} done
            </Badge>
          )}
        </div>
      </button>

      {/* Module Lessons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 dark:border-slate-700/20 bg-muted/10">
              {lessons.map((lesson, lessonIdx) => {
                const status = progressMap[lesson.id] || 'not_started';
                const isNextUp = status === 'in_progress';
                return (
                  <div
                    key={lesson.id}
                    className={cn(
                      'flex items-center justify-between p-3 pl-12 hover:bg-muted/30 transition-all duration-200',
                      lessonIdx < lessons.length - 1 && 'border-b border-border/30',
                      isNextUp && 'bg-amber-50/50 dark:bg-amber-900/10 border-l-2 border-l-amber-500'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Status Icon with animated fill */}
                      {status === 'completed' ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                        </motion.div>
                      ) : status === 'in_progress' ? (
                        <div className="h-5 w-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
                      )}

                      {/* Content Type Icon */}
                      <ContentTypeIcon type={lesson.contentType} className="h-4 w-4 text-muted-foreground shrink-0" />

                      {/* Lesson Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            'text-sm font-medium',
                            status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'
                          )}>
                            {lesson.title}
                          </p>
                          {isNextUp && (
                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[9px] px-1.5 py-0 gap-0.5">
                              <Play className="h-2.5 w-2.5" /> Next Up
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {lesson.videoDuration && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {formatDuration(lesson.videoDuration)}
                            </span>
                          )}
                          {lesson.isPreview && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5">
                              <Eye className="h-2.5 w-2.5" /> Preview
                            </Badge>
                          )}
                          {/* Download icon for downloadable resources */}
                          {lesson.resources && <Download className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground cursor-pointer transition-colors" />}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      {status === 'completed' ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 dark:border-emerald-800 text-xs">
                            Completed
                          </Badge>
                          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-700" onClick={() => onLessonClick(lesson)}>
                            <Play className="h-3 w-3" /> Rewatch
                          </Button>
                        </div>
                      ) : status === 'in_progress' ? (
                        <Button size="sm" className="h-8 text-xs gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-500/20" onClick={() => onLessonClick(lesson)}>
                          <Play className="h-3 w-3" fill="currentColor" /> Resume
                        </Button>
                      ) : lesson.isPreview ? (
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onLessonClick(lesson)}>
                          <Play className="h-3 w-3" /> Preview
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onLessonClick(lesson)}>
                          <Play className="h-3 w-3" /> Start
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Discussion Q&A Tab ────────────────────────────────────
function DiscussionTab({ courseId, userId }: { courseId: string; userId: string }) {
  const { data: discussionsData, isLoading } = useLessonDiscussions({ courseId });
  const createDiscussion = useCreateDiscussion();

  const [sortBy, setSortBy] = useState<'recent' | 'upvoted' | 'unanswered'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [showAskForm, setShowAskForm] = useState(false);
  const [askTitle, setAskTitle] = useState('');
  const [askContent, setAskContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [discussionErrors, setDiscussionErrors] = useState<Record<string, string>>({});

  const discussions = discussionsData?.discussions || [];

  // Separate top-level questions from replies & build reply map
  const { topLevelDiscussions, repliesMap } = useMemo(() => {
    const top: any[] = [];
    const map: Record<string, any[]> = {};
    discussions.forEach((d: any) => {
      if (d.parentId) {
        if (!map[d.parentId]) map[d.parentId] = [];
        map[d.parentId].push(d);
      } else {
        top.push(d);
      }
    });
    return { topLevelDiscussions: top, repliesMap: map };
  }, [discussions]);

  const unansweredCount = topLevelDiscussions.filter((q: any) => !(repliesMap[q.id]?.length > 0)).length;

  const sortedQuestions = [...topLevelDiscussions].sort((a: any, b: any) => {
    if (sortBy === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'upvoted') return 0;
    if (sortBy === 'unanswered') {
      const aReplies = repliesMap[a.id]?.length || 0;
      const bReplies = repliesMap[b.id]?.length || 0;
      return aReplies === bReplies ? 0 : aReplies > bReplies ? 1 : -1;
    }
    return 0;
  });

  const filteredQuestions = sortedQuestions.filter((q: any) =>
    q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.lesson?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePostQuestion = () => {
    const errs = validateFields({
      askContent: [required(askContent, 'Content'), minLength(askContent, 5, 'Content')],
    });
    setDiscussionErrors(errs);
    if (Object.keys(errs).length > 0) return;
    createDiscussion.mutate({
      lessonId: discussions[0]?.lessonId || '',
      userId,
      content: askTitle ? `**${askTitle}**\n\n${askContent}` : askContent,
    }, {
      onSuccess: () => {
        setAskTitle('');
        setAskContent('');
        setShowAskForm(false);
        setDiscussionErrors({});
      },
    });
  };

  const handleReply = (parentId: string) => {
    const errs = validateFields({
      replyContent: [required(replyContent, 'Reply'), minLength(replyContent, 5, 'Reply')],
    });
    setDiscussionErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const parent = discussions.find((d: any) => d.id === parentId);
    createDiscussion.mutate({
      lessonId: parent?.lessonId || '',
      userId,
      content: replyContent,
      parentId,
    }, {
      onSuccess: () => {
        setReplyContent('');
        setReplyingTo(null);
        setDiscussionErrors({});
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4 bg-muted/30 animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-3 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Lesson Discussions</h3>
            {unansweredCount > 0 && (
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px]">
                {unansweredCount} unanswered
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Ask questions and share insights with fellow learners</p>
        </div>
        <Button size="sm" className="gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/20" onClick={() => setShowAskForm(!showAskForm)}>
          <Send className="h-3.5 w-3.5" />
          Ask a Question
        </Button>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <div className="flex gap-1.5">
          {[
            { key: 'recent' as const, label: 'Most Recent' },
            { key: 'upvoted' as const, label: 'Most Upvoted' },
            { key: 'unanswered' as const, label: 'Unanswered' },
          ].map((opt) => (
            <Button
              key={opt.key}
              size="sm"
              variant={sortBy === opt.key ? 'default' : 'outline'}
              className={cn('text-xs h-9', sortBy === opt.key && 'bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700')}
              onClick={() => setSortBy(opt.key)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Ask Question Form */}
      <AnimatePresence>
        {showAskForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card className={cn('border-emerald-200 dark:border-emerald-800/50', glassCard)}>
              <CardContent className="p-4 space-y-3">
                <Input
                  placeholder="What's your question? (optional title)"
                  value={askTitle}
                  onChange={(e) => setAskTitle(e.target.value)}
                  className="font-medium"
                />
                <Textarea
                  placeholder="Provide more details about your question... (Supports **bold**, *italic*, `code`)"
                  value={askContent}
                  onChange={(e) => { setAskContent(e.target.value); if (discussionErrors.askContent) setDiscussionErrors({}); }}
                  rows={4}
                  className={`resize-none ${discussionErrors.askContent ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {discussionErrors.askContent && <p className="text-sm text-destructive mt-1">{discussionErrors.askContent}</p>}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    <span>Supports Markdown formatting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setShowAskForm(false)}>Cancel</Button>
                    <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={handlePostQuestion} disabled={createDiscussion.isPending}>
                      {createDiscussion.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />} Post Question
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredQuestions.map((question: any) => {
            const qReplies = repliesMap[question.id] || [];
            const isAnswered = qReplies.length > 0;
            return (
              <motion.div
                key={question.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className={cn(
                  'hover:shadow-md transition-all duration-200 cursor-pointer',
                  glassCard,
                  isAnswered && 'border-emerald-200 dark:border-emerald-800/40'
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Vote column */}
                      <div className="flex flex-col items-center gap-1 pt-1">
                        <button className="p-1 rounded hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-semibold text-foreground">{qReplies.length}</span>
                        <button className="p-1 rounded hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0" onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {isAnswered && (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] gap-0.5">
                              <CheckCircle2 className="h-3 w-3" /> Answered
                            </Badge>
                          )}
                          {question.lesson?.title && (
                            <Badge variant="outline" className="text-[10px] gap-0.5">
                              <BookOpen className="h-2.5 w-2.5" /> {question.lesson.title}
                            </Badge>
                          )}
                          {question.isPinned && (
                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] gap-0.5">
                              <Pin className="h-2.5 w-2.5" /> Pinned
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">{question.content}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground">· {timeAgo(question.createdAt)}</span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MessageCircle className="h-3 w-3" /> {qReplies.length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Replies */}
                    <AnimatePresence>
                      {expandedQuestion === question.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                            {qReplies.map((reply: any) => (
                              <div key={reply.id} className={cn('ml-8 p-3 rounded-lg bg-muted/30')}>
                                <p className="text-xs text-muted-foreground leading-relaxed">{reply.content}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-[10px] text-muted-foreground">{timeAgo(reply.createdAt)}</span>
                                  <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                                    <ThumbsUp className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))}

                            {/* Reply input */}
                            <div className="ml-8 flex gap-2">
                              <div className="flex-1">
                                <Input
                                  placeholder="Write a reply..."
                                  value={replyingTo === question.id ? replyContent : ''}
                                  onChange={(e) => { setReplyingTo(question.id); setReplyContent(e.target.value); if (discussionErrors.replyContent) setDiscussionErrors({}); }}
                                  className={`h-8 text-xs ${discussionErrors.replyContent && replyingTo === question.id ? 'border-destructive' : ''}`}
                                  onFocus={() => setReplyingTo(question.id)}
                                />
                                {discussionErrors.replyContent && replyingTo === question.id && <p className="text-xs text-destructive mt-0.5">{discussionErrors.replyContent}</p>}
                              </div>
                              <Button
                                size="sm"
                                className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 shrink-0"
                                onClick={() => handleReply(question.id)}
                                disabled={createDiscussion.isPending}
                              >
                                {createDiscussion.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-8">
          <MessageCircleQuestion className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No discussions yet. Be the first to ask a question!</p>
        </div>
      )}

      <Button variant="outline" className="w-full">View All Discussions</Button>
    </div>
  );
}

// ─── Q&A Discussion Tab ────────────────────────────────────
function QADiscussionTab({ courseId, userId, modules }: { courseId: string; userId: string; modules: Module[] }) {
  const { data: discussionsData, isLoading } = useLessonDiscussions({ courseId });
  const createDiscussion = useCreateDiscussion();

  const [selectedLessonId, setSelectedLessonId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'voted' | 'unresolved' | 'resolved'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'my' | 'unresolved' | 'resolved'>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [showAskDialog, setShowAskDialog] = useState(false);
  const [askContent, setAskContent] = useState('');
  const [askLessonId, setAskLessonId] = useState<string>(selectedLessonId === 'all' ? '' : selectedLessonId);
  const [answerContent, setAnswerContent] = useState('');
  const [qaErrors, setQaErrors] = useState<Record<string, string>>({});
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(modules.map(m => m.id)));

  const discussions = discussionsData?.discussions || [];

  // Separate top-level from replies & build reply map
  const { qaTopLevel, repliesMap } = useMemo(() => {
    const top: any[] = [];
    const map: Record<string, any[]> = {};
    discussions.forEach((d: any) => {
      if (d.parentId) {
        if (!map[d.parentId]) map[d.parentId] = [];
        map[d.parentId].push(d);
      } else {
        top.push(d);
      }
    });
    return { qaTopLevel: top, repliesMap: map };
  }, [discussions]);

  // Build lesson map from modules
  const lessonMap = new Map<string, { title: string; moduleId: string; moduleTitle: string }>();
  modules.forEach(mod => {
    (mod.lessons || []).forEach(lesson => {
      lessonMap.set(lesson.id, { title: lesson.title, moduleId: mod.id, moduleTitle: mod.title });
    });
  });

  // Filter questions
  const filteredQuestions = qaTopLevel.filter((q: any) => {
    if (selectedLessonId !== 'all' && q.lessonId !== selectedLessonId) return false;
    if (filterBy === 'my' && q.userId !== userId) return false;
    const qReplies = repliesMap[q.id] || [];
    const isResolved = qReplies.length > 0;
    if (filterBy === 'unresolved' && isResolved) return false;
    if (filterBy === 'resolved' && !isResolved) return false;
    if (searchQuery) {
      const lq = searchQuery.toLowerCase();
      if (!q.content.toLowerCase().includes(lq)) return false;
    }
    return true;
  });

  // Sort questions
  const sortedQuestions = [...filteredQuestions].sort((a: any, b: any) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'voted') return (repliesMap[b.id]?.length || 0) - (repliesMap[a.id]?.length || 0);
    if (sortBy === 'unresolved') {
      const aResolved = (repliesMap[a.id]?.length || 0) > 0;
      const bResolved = (repliesMap[b.id]?.length || 0) > 0;
      return aResolved === bResolved ? 0 : aResolved ? 1 : -1;
    }
    if (sortBy === 'resolved') {
      const aResolved = (repliesMap[a.id]?.length || 0) > 0;
      const bResolved = (repliesMap[b.id]?.length || 0) > 0;
      return aResolved === bResolved ? 0 : aResolved ? -1 : 1;
    }
    return 0;
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  // Count questions per lesson
  const questionCountsByLesson = new Map<string, number>();
  const unresolvedCountsByLesson = new Map<string, number>();
  qaTopLevel.forEach((q: any) => {
    questionCountsByLesson.set(q.lessonId, (questionCountsByLesson.get(q.lessonId) || 0) + 1);
    if (!(repliesMap[q.id]?.length > 0)) unresolvedCountsByLesson.set(q.lessonId, (unresolvedCountsByLesson.get(q.lessonId) || 0) + 1);
  });

  const unresolvedTotal = qaTopLevel.filter((q: any) => !(repliesMap[q.id]?.length > 0)).length;

  // Render content with markdown
  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeContent = part.slice(3, -3).replace(/^\w+\n/, '');
        return (
          <pre key={i} className="bg-slate-900 dark:bg-slate-950 text-green-400 p-3 rounded-lg text-xs font-mono overflow-x-auto my-2 leading-relaxed">
            <code>{codeContent}</code>
          </pre>
        );
      }
      const inlineParts = part.split(/(`[^`]+`)/g);
      return (
        <span key={i}>
          {inlineParts.map((ip, j) => {
            if (ip.startsWith('`') && ip.endsWith('`')) {
              return <code key={j} className="bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded text-xs font-mono">{ip.slice(1, -1)}</code>;
            }
            const boldParts = ip.split(/(\*\*[^*]+\*\*)/g);
            return boldParts.map((bp, k) => {
              if (bp.startsWith('**') && bp.endsWith('**')) {
                return <strong key={`${j}-${k}`} className="font-semibold text-foreground">{bp.slice(2, -2)}</strong>;
              }
              return <span key={`${j}-${k}`}>{bp}</span>;
            });
          })}
        </span>
      );
    });
  };

  // Handle submit question
  const handleSubmitQuestion = () => {
    const errs = validateFields({
      askContent: [required(askContent, 'Question'), minLength(askContent, 5, 'Question')],
    });
    if (!askLessonId) errs.askLessonId = 'Please select a lesson';
    setQaErrors(errs);
    if (Object.keys(errs).length > 0) return;
    createDiscussion.mutate({
      lessonId: askLessonId,
      userId,
      content: askContent,
    }, {
      onSuccess: () => {
        setAskContent('');
        setShowAskDialog(false);
        setQaErrors({});
      },
    });
  };

  // Handle submit answer
  const handleSubmitAnswer = () => {
    const errs = validateFields({
      answerContent: [required(answerContent, 'Answer'), minLength(answerContent, 5, 'Answer')],
    });
    setQaErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (!selectedQuestion) return;
    createDiscussion.mutate({
      lessonId: selectedQuestion.lessonId,
      userId,
      content: answerContent,
      parentId: selectedQuestion.id,
    }, {
      onSuccess: () => {
        setAnswerContent('');
        setQaErrors({});
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4 bg-muted/30 animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-3 bg-muted rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  // ─── Thread Detail View ─────────────────────────────────
  if (selectedQuestion) {
    const q = selectedQuestion;
    const qReplies = repliesMap[q.id] || [];
    const isResolved = qReplies.length > 0;

    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => setSelectedQuestion(null)}>
          <ChevronDown className="h-4 w-4 rotate-90" />
          Back to Questions
        </Button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={cn(glassCard, 'border-orange-200/50 dark:border-orange-800/30')}>
            <CardContent className="p-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {isResolved ? (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] gap-0.5">
                      <CheckCircle2 className="h-3 w-3" /> Resolved
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] gap-0.5">
                      <Circle className="h-3 w-3" /> Unresolved
                    </Badge>
                  )}
                  {q.lesson?.title && (
                    <Badge variant="outline" className="text-[10px] gap-0.5">
                      <BookOpen className="h-2.5 w-2.5" /> {q.lesson.title}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {renderContent(q.content)}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{timeAgo(q.createdAt)}</span>
                  <span>· {qReplies.length} {qReplies.length === 1 ? 'reply' : 'replies'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Replies */}
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground text-sm">
            {qReplies.length} {qReplies.length === 1 ? 'Reply' : 'Replies'}
          </h4>

          {qReplies.map((reply: any) => (
            <motion.div key={reply.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={cn(glassCard)}>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {renderContent(reply.content)}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-muted-foreground">{timeAgo(reply.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {qReplies.length === 0 && (
            <div className="text-center py-8">
              <MessageCircleQuestion className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No replies yet. Be the first to help!</p>
            </div>
          )}
        </div>

        {/* Add Answer Form */}
        <Card className={cn(glassCard, 'border-dashed')}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Your Answer</span>
            </div>
            <Textarea
              placeholder="Write your answer... Supports **bold**, *italic*, and `code`"
              value={answerContent}
              onChange={e => { setAnswerContent(e.target.value); if (qaErrors.answerContent) setQaErrors({}); }}
              rows={4}
              className={`resize-none ${qaErrors.answerContent ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
            {qaErrors.answerContent && <p className="text-sm text-destructive mt-1">{qaErrors.answerContent}</p>}
            <div className="flex items-center justify-end">
              <Button size="sm" className="gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/20" onClick={handleSubmitAnswer} disabled={createDiscussion.isPending}>
                {createDiscussion.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />} Submit Answer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Question List View ─────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Q&amp;A Discussion</h3>
            {unresolvedTotal > 0 && (
              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-[10px]">
                {unresolvedTotal} unresolved
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Ask questions and get answers from peers and instructors</p>
        </div>
        <Dialog open={showAskDialog} onOpenChange={setShowAskDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/20">
              <Plus className="h-3.5 w-3.5" />
              Ask Question
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircleQuestion className="h-5 w-5 text-emerald-600" />
                Ask a Question
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Details</label>
                <div className="flex items-center gap-1 mb-2 p-1 rounded-lg border bg-muted/30">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Bold className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Italic className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Code2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Link2 className="h-3.5 w-3.5" /></Button>
                </div>
                <Textarea
                  placeholder="Provide more details about your question... Supports **bold**, *italic*, `code`"
                  value={askContent}
                  onChange={e => { setAskContent(e.target.value); if (qaErrors.askContent) setQaErrors({}); }}
                  rows={5}
                  className={`resize-none ${qaErrors.askContent ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {qaErrors.askContent && <p className="text-sm text-destructive mt-1">{qaErrors.askContent}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Related Lesson</label>
                <Select value={askLessonId} onValueChange={(v) => { setAskLessonId(v); if (qaErrors.askLessonId) setQaErrors({}); }}>
                  <SelectTrigger className={`h-9 ${qaErrors.askLessonId ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select a lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map(mod => (
                      (mod.lessons || []).map(lesson => (
                        <SelectItem key={lesson.id} value={lesson.id}>
                          {mod.title} → {lesson.title}
                        </SelectItem>
                      ))
                    ))}
                  </SelectContent>
                </Select>
                {qaErrors.askLessonId && <p className="text-sm text-destructive mt-1">{qaErrors.askLessonId}</p>}
              </div>
            </div>
            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button className="gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/20" onClick={handleSubmitQuestion} disabled={createDiscussion.isPending}>
                {createDiscussion.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Submit Question
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel - Lesson Selector */}
        <div className="lg:w-64 shrink-0">
          <Card className={cn(glassCard, 'sticky top-4')}>
            <CardContent className="p-3">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Filter by Lesson</h4>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                <button
                  className={cn(
                    'w-full text-left p-2 rounded-lg text-xs transition-all duration-200',
                    selectedLessonId === 'all' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium' : 'hover:bg-muted/50 text-muted-foreground'
                  )}
                  onClick={() => setSelectedLessonId('all')}
                >
                  <div className="flex items-center justify-between">
                    <span>All Questions</span>
                    <Badge variant="secondary" className="text-[9px] h-4 px-1">{qaTopLevel.length}</Badge>
                  </div>
                </button>
                {modules.map(mod => {
                  const isExpanded = expandedModules.has(mod.id);
                  const lessons = mod.lessons || [];
                  return (
                    <div key={mod.id}>
                      <button
                        className="w-full flex items-center gap-1.5 p-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => toggleModule(mod.id)}
                      >
                        {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        <span className="line-clamp-1">{mod.title}</span>
                      </button>
                      {isExpanded && (
                        <div className="ml-4 space-y-0.5">
                          {lessons.map(lesson => {
                            const qCount = questionCountsByLesson.get(lesson.id) || 0;
                            const unresolved = unresolvedCountsByLesson.get(lesson.id) || 0;
                            const isActive = selectedLessonId === lesson.id;
                            return (
                              <button
                                key={lesson.id}
                                className={cn(
                                  'w-full text-left p-2 rounded-lg text-xs transition-all duration-200',
                                  isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium' : 'hover:bg-muted/50 text-muted-foreground'
                                )}
                                onClick={() => setSelectedLessonId(lesson.id)}
                              >
                                <div className="flex items-center gap-1.5">
                                  {unresolved > 0 && <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />}
                                  <span className="line-clamp-1 flex-1">{lesson.title}</span>
                                  {qCount > 0 && (
                                    <Badge variant="secondary" className="text-[9px] h-4 px-1 ml-auto shrink-0">{qCount}</Badge>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Q&A Threads */}
        <div className="flex-1 space-y-3">
          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto">
              {([
                { key: 'newest' as const, label: 'Newest' },
                { key: 'voted' as const, label: 'Most Voted' },
                { key: 'unresolved' as const, label: 'Unresolved' },
                { key: 'resolved' as const, label: 'Resolved' },
              ]).map(opt => (
                <Button
                  key={opt.key}
                  size="sm"
                  variant={sortBy === opt.key ? 'default' : 'outline'}
                  className={cn('text-xs h-9 shrink-0', sortBy === opt.key && 'bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700')}
                  onClick={() => setSortBy(opt.key)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Filter Row */}
          <div className="flex gap-1.5 overflow-x-auto">
            {([
              { key: 'all' as const, label: 'All' },
              { key: 'my' as const, label: 'My Questions' },
              { key: 'unresolved' as const, label: 'Unresolved' },
              { key: 'resolved' as const, label: 'Resolved' },
            ]).map(opt => (
              <Button
                key={opt.key}
                size="sm"
                variant={filterBy === opt.key ? 'secondary' : 'ghost'}
                className={cn('text-xs h-7 shrink-0', filterBy === opt.key && 'font-medium')}
                onClick={() => setFilterBy(opt.key)}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          {/* Thread Cards */}
          <AnimatePresence mode="popLayout">
            {sortedQuestions.map((question: any, idx: number) => {
              const qReplies = repliesMap[question.id] || [];
              const isResolved = qReplies.length > 0;
              return (
                <motion.div
                  key={question.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    className={cn(
                      'hover:shadow-md transition-all duration-200 cursor-pointer',
                      glassCard,
                      isResolved ? 'border-emerald-200/50 dark:border-emerald-800/30' : 'border-orange-100/50 dark:border-orange-800/20'
                    )}
                    onClick={() => setSelectedQuestion(question)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Vote column */}
                        <div className="flex flex-col items-center gap-1 pt-1" onClick={e => e.stopPropagation()}>
                          <button className="p-1 rounded transition-all duration-200 hover:bg-muted/50 text-muted-foreground hover:text-foreground">
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-semibold text-foreground">{qReplies.length}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {isResolved ? (
                              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] gap-0.5">
                                <Check className="h-3 w-3" /> Resolved
                              </Badge>
                            ) : (
                              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] gap-0.5">
                                <Circle className="h-2.5 w-2.5" /> Unresolved
                              </Badge>
                            )}
                            {question.lesson?.title && (
                              <Badge variant="outline" className="text-[10px] gap-0.5">
                                <BookOpen className="h-2.5 w-2.5" /> {question.lesson.title}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{question.content}</p>

                          {/* Meta row */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {timeAgo(question.createdAt)}
                            </span>
                            <span className={cn('flex items-center gap-1', isResolved ? 'text-emerald-600' : '')}>
                              {isResolved ? <Check className="h-3 w-3" /> : <MessageCircle className="h-3 w-3" />}
                              {qReplies.length} {qReplies.length === 1 ? 'reply' : 'replies'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {sortedQuestions.length === 0 && (
            <div className="text-center py-12">
              <MessageCircleQuestion className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No questions found. Be the first to ask!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Notes Tab ─────────────────────────────────────────────
function NotesTab({ notes, onAddNote, onUpdateNote, onDeleteNote, allLessons, onJumpToTimestamp }: {
  notes: Note[];
  onAddNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
  allLessons: { id: string; title: string }[];
  onJumpToTimestamp?: (time: number) => void;
}) {
  const [selectedLesson, setSelectedLesson] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Note['category'] | 'all'>('all');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<Note['category']>('personal');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showAiSummary, setShowAiSummary] = useState(false);

  // Group notes by lesson
  const lessonsWithNotes = Array.from(new Set(notes.map(n => n.lessonId)));

  const filteredNotes = notes.filter(n => {
    if (selectedLesson !== 'all' && n.lessonId !== selectedLesson) return false;
    if (selectedCategory !== 'all' && n.category !== selectedCategory) return false;
    if (searchQuery && !n.content.toLowerCase().includes(searchQuery.toLowerCase()) && !n.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSaveNote = useCallback(() => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 400);
  }, []);

  const handleExportNotes = () => {
    const text = filteredNotes.map(n =>
      `--- ${n.lessonTitle} [${noteCategoryConfig[n.category].label}] ---\n${n.content}\n`
    ).join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    // Find the current lesson for context
    const currentLesson = selectedLesson !== 'all'
      ? allLessons.find(l => l.id === selectedLesson)
      : allLessons[0];
    onAddNote({
      lessonId: currentLesson?.id || '',
      lessonTitle: currentLesson?.title || 'Unknown Lesson',
      content: newNoteContent,
      category: newNoteCategory,
    });
    setNewNoteContent('');
    handleSaveNote();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">My Notes</h3>
          <p className="text-sm text-muted-foreground">{notes.length} notes across {lessonsWithNotes.length} lessons</p>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 text-xs text-amber-600"
            >
              <Loader2 className="h-3 w-3 animate-spin" /> Saving...
            </motion.div>
          )}
          {saveStatus === 'saved' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 text-xs text-emerald-600"
            >
              <Check className="h-3 w-3" /> Saved
            </motion.div>
          )}
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowAiSummary(!showAiSummary)}>
            <Sparkles className="h-3.5 w-3.5" /> AI Summarize
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={handleExportNotes}>
            <Copy className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* AI Summary */}
      <AnimatePresence>
        {showAiSummary && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className={cn('border-violet-200 dark:border-violet-800/40', glassCard)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                  <span className="text-sm font-semibold text-foreground">AI Summary of Your Notes</span>
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                  {notes.length > 0 ? (
                    <>
                      <p><strong>Total Notes:</strong> {notes.length} across {lessonsWithNotes.length} lessons</p>
                      <p><strong>Categories:</strong> {Object.entries(
                        notes.reduce((acc, n) => { acc[n.category] = (acc[n.category] || 0) + 1; return acc; }, {} as Record<string, number>)
                      ).map(([k, v]) => `${noteCategoryConfig[k as Note['category']].label} (${v})`).join(', ')}</p>
                      <p><strong>Tip:</strong> Consider adding more code snippets for hands-on practice!</p>
                    </>
                  ) : (
                    <p>Start taking notes to get personalized AI summaries and study insights.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            className="text-xs h-9 shrink-0"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          {Object.entries(noteCategoryConfig).map(([key, config]) => (
            <Button
              key={key}
              size="sm"
              variant={selectedCategory === key ? 'default' : 'outline'}
              className="text-xs h-9 gap-1 shrink-0"
              onClick={() => setSelectedCategory(key as Note['category'])}
            >
              {config.icon} {config.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar - Lesson Navigation */}
        <div className="lg:w-56 shrink-0">
          <Card className={glassCard}>
            <CardContent className="p-3">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Lessons</h4>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                <button
                  className={cn(
                    'w-full text-left p-2 rounded-lg text-xs transition-colors',
                    selectedLesson === 'all' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-muted-foreground'
                  )}
                  onClick={() => setSelectedLesson('all')}
                >
                  All Notes ({notes.length})
                </button>
                {lessonsWithNotes.map((lessonId) => {
                  const lessonNotes = notes.filter(n => n.lessonId === lessonId);
                  const lessonTitle = lessonNotes[0]?.lessonTitle || allLessons.find(l => l.id === lessonId)?.title || lessonId;
                  return (
                    <button
                      key={lessonId}
                      className={cn(
                        'w-full text-left p-2 rounded-lg text-xs transition-colors',
                        selectedLesson === lessonId ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-muted-foreground'
                      )}
                      onClick={() => setSelectedLesson(lessonId)}
                    >
                      <span className="line-clamp-1">{lessonTitle}</span>
                      <span className="text-[10px] text-muted-foreground">{lessonNotes.length} notes</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes Content */}
        <div className="flex-1 space-y-3">
          {/* New Note Input */}
          <Card className={cn('border-dashed', glassCard)}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Add a Note</span>
              </div>
              <Textarea
                placeholder="Write your note here... Supports **bold**, *italic*, and `code`"
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {Object.entries(noteCategoryConfig).map(([key, config]) => (
                    <Button
                      key={key}
                      size="sm"
                      variant={newNoteCategory === key ? 'default' : 'outline'}
                      className="text-[10px] h-6 gap-1 px-2"
                      onClick={() => setNewNoteCategory(key as Note['category'])}
                    >
                      {config.icon} {config.label}
                    </Button>
                  ))}
                </div>
                <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={handleAddNote}>
                  <Bookmark className="h-3 w-3" /> Save Note
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes List */}
          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className={cn(glassCard, 'hover:shadow-md transition-all duration-200')}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={cn('text-[10px] gap-0.5', noteCategoryConfig[note.category].color)}>
                          {noteCategoryConfig[note.category].icon} {noteCategoryConfig[note.category].label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{note.lessonTitle}</span>
                        {note.timestamp !== undefined && (
                          <button
                            className="flex items-center gap-1 text-[10px] text-violet-600 hover:text-violet-700 dark:text-violet-400 transition-colors"
                            onClick={() => onJumpToTimestamp?.(note.timestamp!)}
                          >
                            <Clock className="h-2.5 w-2.5" /> {formatDuration(note.timestamp * 60)}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setEditingNote(note.id); setEditContent(note.content); }}>
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-600" onClick={() => onDeleteNote(note.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {editingNote === note.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={4}
                          className="resize-none text-sm"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingNote(null)}>
                            <X className="h-3 w-3" /> Cancel
                          </Button>
                          <Button size="sm" className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => { onUpdateNote(note.id, { content: editContent }); setEditingNote(null); handleSaveNote(); }}>
                            <Check className="h-3 w-3" /> Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                      <span>Created {new Date(note.createdAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredNotes.length === 0 && (
            <div className="text-center py-8">
              <Notebook className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No notes found. Start taking notes!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Progress Timeline Tab ─────────────────────────────────
function ProgressTab({ progressData, enrollmentProgress, course, streakDays }: {
  progressData: any[];
  enrollmentProgress: number;
  course: any;
  streakDays: number;
}) {
  // Derive timeline events from progress data
  const timelineEvents = useMemo(() => {
    if (!progressData || !course) return [];
    const events: { id: string; lessonTitle: string; moduleName: string; date: string; timeSpent: number; type: 'completed' | 'started' }[] = [];

    // Build lesson lookup from course modules
    const lessonLookup = new Map<string, { title: string; moduleName: string }>();
    (course.modules || []).forEach((mod: any) => {
      (mod.lessons || []).forEach((lesson: any) => {
        lessonLookup.set(lesson.id, { title: lesson.title, moduleName: mod.title });
      });
    });

    progressData.forEach((p: any) => {
      const lessonInfo = lessonLookup.get(p.lessonId);
      if (!lessonInfo) return;

      const date = p.completedAt
        ? new Date(p.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : new Date(p.updatedAt || p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      events.push({
        id: p.id,
        lessonTitle: lessonInfo.title,
        moduleName: lessonInfo.moduleName,
        date,
        timeSpent: Math.round((p.timeSpent || 0) / 60),
        type: p.status === 'completed' ? 'completed' : 'started',
      });
    });

    // Sort by date (most recent first)
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return events;
  }, [progressData, course]);

  // Compute weekly activity from progress
  const weeklyActivity = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    return days.map((day, i) => {
      const date = new Date(now);
      date.setDate(now.getDate() + mondayOffset + i);
      const dateStr = date.toDateString();

      let totalMinutes = 0;
      progressData?.forEach((p: any) => {
        const updatedDate = new Date(p.updatedAt || p.createdAt).toDateString();
        if (updatedDate === dateStr) {
          totalMinutes += (p.timeSpent || 0) / 60;
        }
      });

      return { day, hours: Math.round(totalMinutes * 10) / 10 };
    });
  }, [progressData]);

  // Compute milestones from progress data
  const completedCount = progressData?.filter((p: any) => p.status === 'completed').length || 0;
  const totalLessons = (course?.modules || []).flatMap((m: any) => m.lessons || []).length;
  const modulesComplete = (course?.modules || []).filter((mod: any) =>
    (mod.lessons || []).every((l: any) => progressData?.some((p: any) => p.lessonId === l.id && p.status === 'completed'))
  ).length;

  const milestones = [
    { id: 'ms-1', title: 'First Lesson Completed', description: 'Completed your first lesson', icon: '🎯', achieved: completedCount >= 1, date: completedCount >= 1 ? timelineEvents.find(e => e.type === 'completed')?.date || '' : '' },
    { id: 'ms-2', title: 'Quick Learner', description: 'Complete 2 lessons', icon: '⚡', achieved: completedCount >= 2, date: '' },
    { id: 'ms-3', title: 'Module Master', description: 'Complete all lessons in a module', icon: '🏆', achieved: modulesComplete > 0, date: '' },
    { id: 'ms-4', title: 'Halfway There', description: 'Complete 50% of the course', icon: '🎓', achieved: enrollmentProgress >= 50, date: '' },
    { id: 'ms-5', title: 'Streak Champion', description: 'Maintain a 7-day learning streak', icon: '🔥', achieved: streakDays >= 7, date: '' },
    { id: 'ms-6', title: 'Course Graduate', description: 'Complete the entire course', icon: '🏅', achieved: enrollmentProgress >= 100, date: '' },
  ];

  const totalTime = Math.round(progressData?.reduce((sum: number, p: any) => sum + (p.timeSpent || 0), 0) / 60) || 0;
  const maxHours = Math.max(...weeklyActivity.map(d => d.hours), 0.1);

  const learningPace = enrollmentProgress >= 50 ? 'ahead' as const : enrollmentProgress >= 20 ? 'on_track' as const : 'behind' as const;
  const paceConfig = {
    ahead: { label: 'Ahead of Schedule', color: 'text-emerald-600 dark:text-emerald-400', icon: <TrendingUp className="h-4 w-4" />, bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
    on_track: { label: 'On Track', color: 'text-amber-600 dark:text-amber-400', icon: <Minus className="h-4 w-4" />, bg: 'bg-amber-50 dark:bg-amber-900/10' },
    behind: { label: 'Behind Schedule', color: 'text-red-600 dark:text-red-400', icon: <TrendingDown className="h-4 w-4" />, bg: 'bg-red-50 dark:bg-red-900/10' },
  };
  const pace = paceConfig[learningPace];

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + Math.ceil((100 - enrollmentProgress) / 5));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <Card className={cn(glassCard)}>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold text-foreground">{streakDays}</span>
              </div>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <Card className={cn(glassCard)}>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Timer className="h-5 w-5 text-violet-500" />
                <span className="text-2xl font-bold text-foreground">{Math.floor(totalTime / 60)}h {totalTime % 60}m</span>
              </div>
              <p className="text-xs text-muted-foreground">Time Invested</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <Card className={cn(glassCard)}>
            <CardContent className="p-4 text-center">
              <div className={cn('flex items-center justify-center gap-1.5 mb-1', pace.color)}>
                {pace.icon}
                <span className="text-sm font-bold">{pace.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">Learning Pace</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <Card className={cn(glassCard)}>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Calendar className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-bold text-foreground">{estimatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <p className="text-xs text-muted-foreground">Est. Completion</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Activity Chart */}
      <Card className={cn(glassCard)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-violet-600" />
            Weekly Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {weeklyActivity.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">{day.hours}h</span>
                <div className="w-full bg-muted rounded-t-sm overflow-hidden" style={{ height: '80px' }}>
                  <motion.div
                    className={cn(
                      'w-full rounded-t-sm bg-gradient-to-t',
                      day.hours > 1.5 ? 'from-emerald-500 to-emerald-400' : day.hours > 0 ? 'from-amber-500 to-amber-400' : 'from-slate-300 to-slate-200 dark:from-slate-600 dark:to-slate-500'
                    )}
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.hours / maxHours) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{ marginTop: 'auto' }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">{day.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Timeline */}
      <Card className={cn(glassCard)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-600" />
            Learning Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timelineEvents.length > 0 ? (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-amber-500 to-slate-300 dark:to-slate-600" />
              <div className="space-y-4">
                {timelineEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-10"
                  >
                    <div className={cn(
                      'absolute left-2.5 top-1 w-3 h-3 rounded-full border-2',
                      event.type === 'completed' ? 'bg-emerald-500 border-emerald-300' : 'bg-amber-500 border-amber-300'
                    )} />
                    <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={cn(
                          'text-[9px]',
                          event.type === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        )}>
                          {event.type === 'completed' ? '✓ Completed' : '▶ Started'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{event.date}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{event.lessonTitle}</p>
                      <p className="text-xs text-muted-foreground">{event.moduleName}</p>
                      {event.timeSpent > 0 && (
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {event.timeSpent} min</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No learning activity yet. Start a lesson to track your progress!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card className={cn(glassCard)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-600" />
            Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {milestones.map((milestone) => (
              <motion.div
                key={milestone.id}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                  milestone.achieved
                    ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30'
                    : 'bg-muted/20 border-border/50'
                )}
              >
                <span className="text-2xl">{milestone.icon}</span>
                <div className="flex-1">
                  <p className={cn('text-sm font-medium', milestone.achieved ? 'text-foreground' : 'text-muted-foreground')}>
                    {milestone.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{milestone.description}</p>
                  {milestone.achieved && milestone.date && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Achieved {milestone.date}</p>
                  )}
                </div>
                {milestone.achieved ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/30 shrink-0" />
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Skeleton for loading states ──────────────────────────────
function SectionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl p-4 bg-muted/30 animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-3 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────
export function LearnerCourse() {
  const userId = useAppStore(s => s.currentUser?.id) || '';
  const currentUser = useAppStore(s => s.currentUser);
  const tenantId = useAppStore(s => s.currentTenant?.id) || '';
  const [showUnenrollConfirm, setShowUnenrollConfirm] = useState(false);

  // Fetch courses to determine the first course ID
  const { data: coursesData, isLoading: coursesLoading } = useCourses();
  const firstCourseId = coursesData && coursesData.length > 0 ? coursesData[0].id : null;

  // Fetch course with modules/lessons
  const { data: course, isLoading: courseLoading } = useCourse(firstCourseId);

  // Fetch enrollments for this user
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useEnrollments(userId || undefined);

  // Fetch lesson progress for this user
  const { data: progressData, isLoading: progressLoading } = useLessonProgress(userId || undefined);

  // Fetch course reviews
  const { data: reviewsData, isLoading: reviewsLoading } = useCommunityReviews(
    firstCourseId ? { courseId: firstCourseId, status: 'approved' } : undefined
  );

  // Mutations
  const updateProgress = useUpdateProgress();
  const enrollMutation = useEnroll();

  // Notes via localStorage
  const { notes, addNote, updateNote, deleteNote } = useLessonNotes(firstCourseId || undefined);

  // Find enrollment for this course
  const enrollment = useMemo(() => {
    if (!enrollmentsData || !course) return null;
    return enrollmentsData.find((e: any) => e.courseId === course.id) || null;
  }, [enrollmentsData, course]);

  // Build lesson progress map from API data
  const lessonProgressState = useMemo<Record<string, 'completed' | 'in_progress' | 'not_started'>>(() => {
    const map: Record<string, 'completed' | 'in_progress' | 'not_started'> = {};
    if (progressData && Array.isArray(progressData)) {
      progressData.forEach((p: any) => {
        const status = p.status === 'completed' ? 'completed'
          : p.progressPercent > 0 ? 'in_progress'
          : 'not_started';
        map[p.lessonId] = status;
      });
    }
    return map;
  }, [progressData]);

  // Build resume positions from progress data
  const resumePositions = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    if (progressData && Array.isArray(progressData)) {
      progressData.forEach((p: any) => {
        if (p.lastPosition !== undefined && p.lastPosition !== null) {
          map[p.lessonId] = p.lastPosition;
        }
      });
    }
    return map;
  }, [progressData]);

  const modules = course?.modules || [];
  const [activeTab, setActiveTab] = useState('overview');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeLessonModuleName, setActiveLessonModuleName] = useState('');
  const curriculumRef = useRef<HTMLDivElement>(null);

  // Calculate total lessons and completed
  const allLessons = modules.flatMap((m: any) => m.lessons || []);
  const completedCount = allLessons.filter((l: any) => lessonProgressState[l.id] === 'completed').length;
  const totalLessons = allLessons.length;

  // Calculate enrollment progress percentage from lesson progress
  const enrollmentProgress = useMemo(() => {
    if (enrollment?.progress !== undefined && enrollment?.progress !== null) return enrollment.progress;
    if (totalLessons === 0) return 0;
    return Math.round((completedCount / totalLessons) * 100);
  }, [enrollment, completedCount, totalLessons]);

  // Derive chapters from course modules/lessons
  const courseChapters = useMemo<Chapter[]>(() => {
    if (!allLessons.length) return [];
    const chapters: Chapter[] = [];
    let cumulativeTime = 0;
    allLessons.forEach((lesson: any) => {
      chapters.push({ time: cumulativeTime, title: lesson.title });
      cumulativeTime += (lesson.videoDuration || 300); // default 5 min if no duration
    });
    return chapters;
  }, [allLessons]);

  // Derive resources from lesson data
  const courseResources = useMemo(() => {
    const resources: { id: string; title: string; type: string; size?: string; url?: string; lessonTitle: string }[] = [];
    allLessons.forEach((lesson: any) => {
      if (lesson.resources) {
        try {
          const parsed = JSON.parse(lesson.resources);
          if (Array.isArray(parsed)) {
            parsed.forEach((res: any, idx: number) => {
              resources.push({
                id: `res-${lesson.id}-${idx}`,
                title: res.title || `Resource from ${lesson.title}`,
                type: res.type || 'pdf',
                size: res.size,
                url: res.url,
                lessonTitle: lesson.title,
              });
            });
          }
        } catch {
          // Not valid JSON, skip
        }
      }
    });
    return resources;
  }, [allLessons]);

  // Derive "What You'll Learn" from module titles
  const whatYouLearn = useMemo(() => {
    return modules.map((mod: any, i: number) => ({
      id: `wyl-${i}`,
      text: `Master ${mod.title}`,
      completed: (mod.lessons || []).some((l: any) => lessonProgressState[l.id] === 'completed'),
    }));
  }, [modules, lessonProgressState]);

  // Derive other courses for "Students Also Taking"
  const { data: otherCourses } = useCourses();
  const studentsAlsoTaking = useMemo(() => {
    if (!otherCourses || !course) return [];
    return otherCourses
      .filter((c: any) => c.id !== course.id && c.isPublished)
      .slice(0, 3)
      .map((c: any) => ({
        id: c.id,
        title: c.title,
        level: c.level,
        rating: c.avgRating,
        students: c.enrollmentCount,
        price: c.price,
      }));
  }, [otherCourses, course]);

  // Compute rating distribution from reviews
  const reviews = reviewsData?.reviews || [];
  const ratingDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0]; // 1-5 stars
    reviews.forEach((r: any) => {
      if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++;
    });
    return [5, 4, 3, 2, 1].map((stars, i) => ({ stars, count: dist[stars - 1] }));
  }, [reviews]);
  const totalReviews = ratingDistribution.reduce((s, r) => s + r.count, 0);

  // Combined loading state
  const isLoading = coursesLoading || courseLoading || enrollmentsLoading || progressLoading;

  // Handle clicking a lesson
  const handleLessonClick = (lesson: Lesson) => {
    setActiveLesson(lesson);
    const parentModule = modules.find((m: any) => m.lessons?.some((l: any) => l.id === lesson.id));
    setActiveLessonModuleName(parentModule?.title || '');

    // Track that user started the lesson (mark as in_progress)
    if (userId && lessonProgressState[lesson.id] !== 'completed') {
      updateProgress.mutate({
        userId,
        lessonId: lesson.id,
        courseId: course?.id,
        status: 'in_progress',
        progressPercent: lessonProgressState[lesson.id] === 'in_progress' ? undefined : 0,
      });
    }
  };

  // Handle marking a lesson as complete - persist to API via useUpdateProgress
  const handleMarkComplete = (lessonId: string) => {
    if (!userId) return;
    updateProgress.mutate({
      userId,
      lessonId,
      courseId: course?.id,
      status: 'completed',
      progressPercent: 100,
    });
  };

  // Handle enrolling in the course
  const handleEnroll = () => {
    if (!userId || !course?.id || !tenantId) return;
    enrollMutation.mutate({ userId, courseId: course.id, tenantId });
  };

  // Handle unenroll
  const handleUnenroll = () => {
    setShowUnenrollConfirm(true);
  };

  // Get next lessons for the sidebar
  const getNextLessons = (): { id: string; title: string; moduleName: string; duration: number; contentType: Lesson['contentType'] }[] => {
    if (!activeLesson) return [];
    const currentIdx = allLessons.findIndex(l => l.id === activeLesson.id);
    const next: { id: string; title: string; moduleName: string; duration: number; contentType: Lesson['contentType'] }[] = [];
    for (let i = currentIdx + 1; i < Math.min(currentIdx + 4, allLessons.length); i++) {
      const l = allLessons[i];
      const mod = modules.find(m => m.lessons?.some(ml => ml.id === l.id));
      next.push({ id: l.id, title: l.title, moduleName: mod?.title || '', duration: l.videoDuration || 0, contentType: l.contentType });
    }
    return next;
  };

  // ─── Loading State ────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="rounded-xl overflow-hidden">
          <div className="h-32 md:h-40 bg-gradient-to-r from-slate-600 to-slate-800 animate-pulse" />
          <div className="p-6 space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
            <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            <div className="h-2.5 bg-muted rounded animate-pulse w-full" />
            <div className="flex gap-3">
              <div className="h-10 w-40 bg-muted rounded animate-pulse" />
              <div className="h-10 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl p-4 bg-muted/30 animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── No Course Found ──────────────────────────────────────
  if (!course) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground">No course found. Please check back later.</p>
        </div>
      </div>
    );
  }

  // If a lesson is active, show the enhanced Video Player
  if (activeLesson) {
    return (
      <>
        <div className="p-4 md:p-6">
          <VideoPlayer
            title={activeLesson.title}
            lesson={activeLesson}
            moduleName={activeLessonModuleName}
            nextLessons={getNextLessons()}
            onMarkComplete={handleMarkComplete}
            onNextLesson={(lessonId) => {
              const found = allLessons.find(l => l.id === lessonId);
              if (found) handleLessonClick(found);
            }}
            onBack={() => setActiveLesson(null)}
            isCompleted={lessonProgressState[activeLesson.id] === 'completed'}
            initialPosition={resumePositions[activeLesson.id] || 0}
            chapters={courseChapters}
            onProgress={(progress, currentTime) => {
              // Periodically save progress to API (every ~30 seconds of playback)
              if (userId && Math.floor(currentTime) % 30 === 0 && currentTime > 0) {
                updateProgress.mutate({
                  userId,
                  lessonId: activeLesson.id,
                  courseId: course?.id,
                  status: 'in_progress',
                  progressPercent: Math.round(progress),
                  resumePosition: currentTime,
                });
              }
            }}
          />
        </div>
        <ConfirmDialog
          open={showUnenrollConfirm}
          onOpenChange={setShowUnenrollConfirm}
          title="Unenroll from Course"
          description="Are you sure you want to unenroll? Your progress will be saved, but you will lose access to the course content. This action can be undone by re-enrolling."
          confirmLabel="Unenroll"
          variant="destructive"
          onConfirm={() => {
            setShowUnenrollConfirm(false);
          }}
        />
      </>
    );
  }

  // Compute unanswered discussion count for tab badge
  const unansweredDiscussionCount = 0; // will be computed inside DiscussionTab

  return (
    <motion.div
      className="p-4 md:p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Course Header ────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          {/* Gradient Banner */}
          <div className={cn(
            'h-32 md:h-40 bg-gradient-to-r flex items-end p-6',
            getLevelAccent(course.level)
          )}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs">
                  {course.category}
                </Badge>
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs capitalize">
                  {course.level}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{course.title}</h1>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Course Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1.5">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px] bg-slate-200 dark:bg-slate-700">
                    {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span>{currentUser?.name || 'Instructor'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">{course.avgRating}</span>
                <span>({course.totalRatings} ratings)</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.enrollmentCount.toLocaleString()} enrolled</span>
              </div>
              {course.durationHours && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.durationHours} hours</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm mb-5 max-w-3xl">{course.description}</p>

            {/* Progress */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Your Progress</span>
                <span className="font-semibold text-emerald-600">{enrollmentProgress}%</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${enrollmentProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{completedCount} of {totalLessons} lessons completed</span>
                {enrollment?.lastAccessedAt && (
                  <span>Last accessed {new Date(enrollment.lastAccessedAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {!enrollment ? (
                <Button
                  className="gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/20 text-white"
                  onClick={handleEnroll}
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
                  {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
                </Button>
              ) : (
                <>
                  <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/20 text-white">
                    <Play className="h-4 w-4" />
                    Continue Learning
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Award className="h-4 w-4" />
                    View Certificate
                  </Button>
                  <Button variant="ghost" className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10" onClick={handleUnenroll}>
                    <Trash2 className="h-4 w-4" />
                    Unenroll
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Course Content Tabs ──────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="overview" className="gap-1.5 shrink-0">
              <BookOpen className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="gap-1.5 shrink-0">
              <BookOpen className="h-4 w-4" />
              Curriculum
            </TabsTrigger>
            <TabsTrigger value="discussion" className="gap-1.5 shrink-0">
              <MessageSquare className="h-4 w-4" />
              Discussion
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1.5 shrink-0">
              <StickyNote className="h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-1.5 shrink-0">
              <BarChart3 className="h-4 w-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-1.5 shrink-0">
              <Download className="h-4 w-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-1.5 shrink-0">
              <Star className="h-4 w-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="qa" className="gap-1.5 shrink-0">
              <MessageCircleQuestion className="h-4 w-4" />
              Q&amp;A
            </TabsTrigger>
          </TabsList>

          {/* ─── Tab: Overview ────────────────────────────── */}
          <TabsContent value="overview" className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="overview"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                {/* What You'll Learn */}
                <Card className={cn(glassCard)}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4 text-emerald-600" />
                      What You&apos;ll Learn
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {whatYouLearn.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {whatYouLearn.map((item) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                          >
                            {item.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                            )}
                            <span className={cn('text-sm', item.completed ? 'text-muted-foreground line-through' : 'text-foreground')}>
                              {item.text}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Target className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Course learning objectives will appear here.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Difficulty Meter + Course Info row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className={cn(glassCard)}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-600" />
                        Course Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DifficultyMeter level={course.level} />
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Globe className="h-3.5 w-3.5" />
                          <span>Language: {course.language || 'English'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Duration: {course.durationHours || '—'} hours</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>{totalLessons} lessons across {modules.length} modules</span>
                        </div>
                        {course.completionRate > 0 && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Trophy className="h-3.5 w-3.5" />
                            <span>{Math.round(course.completionRate)}% completion rate</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Instructor Card */}
                  <Card className={cn(glassCard)}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-amber-600" />
                        Course Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-3">
                        <Avatar className="h-14 w-14 shrink-0">
                          <AvatarFallback className="text-base bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold">
                            {course.category?.[0]?.toUpperCase() || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground text-sm">{course.title}</h4>
                          <p className="text-xs text-muted-foreground capitalize">{course.level} · {course.category || 'General'}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {course.avgRating}</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.enrollmentCount.toLocaleString()}</span>
                            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {modules.length} modules</span>
                          </div>
                        </div>
                      </div>
                      {course.description && (
                        <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-3">{course.description}</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Students Also Taking */}
                {studentsAlsoTaking.length > 0 && (
                  <Card className={cn(glassCard)}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4 text-violet-600" />
                        Students Also Taking
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {studentsAlsoTaking.map((sat) => (
                          <motion.div
                            key={sat.id}
                            whileHover={{ y: -3, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
                            transition={{ duration: 0.2 }}
                            className="p-3 rounded-lg border border-border/50 hover:border-border cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={cn('text-[9px] capitalize', getLevelColor(sat.level))}>{sat.level}</Badge>
                              <div className="flex items-center gap-0.5">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="text-[10px] font-medium">{sat.rating}</span>
                              </div>
                            </div>
                            <h5 className="text-xs font-semibold text-foreground line-clamp-2 mb-1">{sat.title}</h5>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground">{sat.students} students</span>
                              <span className="text-xs font-bold text-foreground">${sat.price}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ─── Tab: Curriculum ─────────────────────────── */}
          <TabsContent value="curriculum" className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="curriculum"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-3"
                ref={curriculumRef}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Course Curriculum</h3>
                    <p className="text-sm text-muted-foreground">
                      {modules.length} modules · {totalLessons} lessons · {formatDuration(allLessons.reduce((s, l) => s + (l.videoDuration || 0), 0))} total
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    Expand All
                  </Button>
                </div>

                {/* ─── Continue Learning / Video Player Section ──── */}
                {(() => {
                  const inProgressLesson = allLessons.find(l => lessonProgressState[l.id] === 'in_progress');
                  const nextLesson = allLessons.find(l => lessonProgressState[l.id] === 'not_started');
                  const currentLesson = inProgressLesson || nextLesson;
                  const currentModule = currentLesson ? modules.find(m => m.lessons?.some(l => l.id === currentLesson.id)) : null;

                  if (!currentLesson) return null;

                  return (
                    <Card className={cn('overflow-hidden border-emerald-200 dark:border-emerald-800/50', glassCard)}>
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Video Player - Compact */}
                          <div className="md:w-1/2">
                            <VideoPlayer
                              title={currentLesson.title}
                              lesson={currentLesson}
                              moduleName={currentModule?.title || ''}
                              onMarkComplete={handleMarkComplete}
                              isCompleted={lessonProgressState[currentLesson.id] === 'completed'}
                              initialPosition={resumePositions[currentLesson.id] || 0}
                              chapters={courseChapters}
                              compact
                              totalDuration={currentLesson.videoDuration || 300}
                              onProgress={(progress, currentTime) => {
                                if (userId && Math.floor(currentTime) % 30 === 0 && currentTime > 0) {
                                  updateProgress.mutate({
                                    userId,
                                    lessonId: currentLesson.id,
                                    courseId: course?.id,
                                    status: 'in_progress',
                                    progressPercent: Math.round(progress),
                                    resumePosition: currentTime,
                                  });
                                }
                              }}
                            />
                          </div>
                          {/* Lesson Info Sidebar */}
                          <div className="md:w-1/2 p-4 md:p-6 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2">
                              {inProgressLesson ? (
                                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px]">
                                  <Play className="h-3 w-3 mr-1" /> In Progress
                                </Badge>
                              ) : (
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px]">
                                  Up Next
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-[10px]">
                                {currentModule?.title}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-foreground text-lg mb-2">{currentLesson.title}</h3>
                            {currentLesson.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{currentLesson.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDuration(currentLesson.videoDuration)}</span>
                              <span className="flex items-center gap-1">
                                <ContentTypeIcon type={currentLesson.contentType} className="h-3 w-3" />
                                {currentLesson.contentType.charAt(0).toUpperCase() + currentLesson.contentType.slice(1).replace('_', ' ')}
                              </span>
                            </div>
                            <Button
                              onClick={() => handleLessonClick(currentLesson)}
                              className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/20 text-white"
                            >
                              <Play className="h-4 w-4" fill="currentColor" />
                              {inProgressLesson ? 'Continue Lesson' : 'Start Lesson'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}

                {modules.length > 0 ? (
                  modules.map((mod, idx) => (
                    <ModuleSection key={mod.id} module={mod} moduleIndex={idx} onLessonClick={handleLessonClick} progressMap={lessonProgressState} />
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">No curriculum content available yet.</p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ─── Tab: Discussion Q&A ─────────────────────── */}
          <TabsContent value="discussion" className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="discussion"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <DiscussionTab courseId={course.id} userId={userId} />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ─── Tab: Notes ──────────────────────────────── */}
          <TabsContent value="notes" className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="notes"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <NotesTab
                  notes={notes}
                  onAddNote={addNote}
                  onUpdateNote={updateNote}
                  onDeleteNote={deleteNote}
                  allLessons={allLessons.map((l: any) => ({ id: l.id, title: l.title }))}
                />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ─── Tab: Progress ───────────────────────────── */}
          <TabsContent value="progress" className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="progress"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <ProgressTab
                  progressData={progressData || []}
                  enrollmentProgress={enrollmentProgress}
                  course={course}
                  streakDays={currentUser?.streakDays || 0}
                />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ─── Tab: Resources ──────────────────────────── */}
          <TabsContent value="resources" className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="resources"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                <div>
                  <h3 className="font-semibold text-foreground">Course Resources</h3>
                  <p className="text-sm text-muted-foreground">Downloadable files, links, and code repositories</p>
                </div>

                {courseResources.length > 0 ? (
                  <>
                    {/* Downloads */}
                    {courseResources.filter(r => r.type === 'pdf').length > 0 && (
                      <Card className={cn(glassCard)}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Download className="h-4 w-4 text-emerald-600" />
                            Downloadable Files
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {courseResources.filter(r => r.type === 'pdf').map((res) => (
                            <div key={res.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                                  <FileText className="h-4 w-4 text-red-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{res.title}</p>
                                  <p className="text-xs text-muted-foreground">PDF · {res.size || 'N/A'} · {res.lessonTitle}</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                                <Download className="h-3 w-3" /> Download
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* External Links */}
                    {courseResources.filter(r => r.type === 'link').length > 0 && (
                      <Card className={cn(glassCard)}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 text-violet-600" />
                            External Links
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {courseResources.filter(r => r.type === 'link').map((res) => (
                            <div key={res.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/20">
                                  <ExternalLink className="h-4 w-4 text-violet-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{res.title}</p>
                                  <p className="text-xs text-muted-foreground">{res.url} · {res.lessonTitle}</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                                Visit <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Code Repos */}
                    {courseResources.filter(r => r.type === 'repo').length > 0 && (
                      <Card className={cn(glassCard)}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <GitBranch className="h-4 w-4 text-amber-600" />
                            Code Repositories
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {courseResources.filter(r => r.type === 'repo').map((res) => (
                            <div key={res.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20">
                                  <GitBranch className="h-4 w-4 text-amber-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{res.title}</p>
                                  <p className="text-xs text-muted-foreground">{res.url}</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                                <GitBranch className="h-3 w-3" /> Clone
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* All other resource types */}
                    {courseResources.filter(r => !['pdf', 'link', 'repo'].includes(r.type)).length > 0 && (
                      <Card className={cn(glassCard)}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <FileCode className="h-4 w-4 text-slate-600" />
                            Other Resources
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {courseResources.filter(r => !['pdf', 'link', 'repo'].includes(r.type)).map((res) => (
                            <div key={res.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/20">
                                  <FileText className="h-4 w-4 text-slate-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{res.title}</p>
                                  <p className="text-xs text-muted-foreground">{res.type} · {res.lessonTitle}</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                                <Download className="h-3 w-3" /> Download
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Download className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">No resources available for this course yet.</p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ─── Tab: Reviews ────────────────────────────── */}
          <TabsContent value="reviews" className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="reviews"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                {reviewsLoading ? (
                  <SectionSkeleton count={3} />
                ) : (
                  <>
                    {/* Overall Rating */}
                    <Card className={cn(glassCard)}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                          <div className="text-center">
                            <p className="text-5xl font-bold text-foreground">{course.avgRating}</p>
                            <div className="flex items-center gap-0.5 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    'h-5 w-5',
                                    star <= Math.round(course.avgRating)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-muted-foreground/30'
                                  )}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{course.totalRatings} ratings</p>
                          </div>

                          {/* Rating Distribution */}
                          <div className="flex-1 w-full space-y-1.5">
                            {ratingDistribution.map((dist) => (
                              <div key={dist.stars} className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground w-8 text-right">{dist.stars}★</span>
                                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${totalReviews > 0 ? (dist.count / totalReviews) * 100 : 0}%` }}
                                    transition={{ duration: 0.5 }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground w-8">{dist.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Individual Reviews */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-foreground">Recent Reviews</h3>
                      {reviews.length > 0 ? (
                        reviews.slice(0, 10).map((review: any) => (
                          <Card key={review.id} className={cn(glassCard, 'hover:shadow-md transition-all duration-200')}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-9 w-9 shrink-0">
                                  <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    {review.author?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-foreground">{review.author?.name || 'Anonymous'}</span>
                                    <span className="text-xs text-muted-foreground">· {timeAgo(review.createdAt)}</span>
                                  </div>
                                  <div className="flex items-center gap-0.5 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={cn(
                                          'h-3.5 w-3.5',
                                          star <= review.rating
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-muted-foreground/30'
                                        )}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>
                                  <div className="flex items-center gap-3 mt-3">
                                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                      <ThumbsUp className="h-3 w-3" /> Helpful
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Card>
                          <CardContent className="p-8 text-center">
                            <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground">No reviews yet. Be the first to review this course!</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {reviews.length > 10 && (
                      <Button variant="outline" className="w-full">Load More Reviews</Button>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ─── Tab: Q&A Discussion ──────────────────────── */}
          <TabsContent value="qa" className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="qa"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <QADiscussionTab courseId={course.id} userId={userId} modules={modules} />
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ConfirmDialog for destructive actions */}
      <ConfirmDialog
        open={showUnenrollConfirm}
        onOpenChange={setShowUnenrollConfirm}
        title="Unenroll from Course"
        description="Are you sure you want to unenroll? Your progress will be saved, but you will lose access to the course content. This action can be undone by re-enrolling."
        confirmLabel="Unenroll"
        variant="destructive"
        onConfirm={() => {
          setShowUnenrollConfirm(false);
        }}
      />
    </motion.div>
  );
}
