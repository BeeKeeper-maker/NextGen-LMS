'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import {
  useCourse,
  useEnrollments,
  useLessonProgress,
  useUpdateProgress,
  useEnroll,
  useCourses,
} from '@/hooks/use-data';
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

// ─── Demo chapters for video player ────────────────────────────
const demoChapters: Chapter[] = [
  { time: 0, title: 'Introduction' },
  { time: 45, title: 'Core Concepts' },
  { time: 120, title: 'Setting Up the Environment' },
  { time: 180, title: 'Building Your First Component' },
  { time: 240, title: 'Summary & Key Takeaways' },
];

// ─── Default resume positions (overridden by API progress data) ─
const defaultResumePositions: Record<string, number> = {};

// ─── Enhanced Mock discussion threads with Q&A ────────────────
interface DiscussionReply {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
  upvotes: number;
  downvotes: number;
  isInstructor: boolean;
  isAnswer: boolean;
}

interface DiscussionQuestion {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  lessonRef: string;
  lessonId: string;
  upvotes: number;
  downvotes: number;
  time: string;
  isAnswered: boolean;
  replies: DiscussionReply[];
}

const discussionQuestions: DiscussionQuestion[] = [
  {
    id: 'q-1',
    author: 'Mike Chen',
    avatar: 'MC',
    title: 'How do Server Components interact with client state?',
    content: 'I\'m confused about how Server Components can trigger client-side state updates. Can someone explain the data flow? I\'ve read the docs but still struggling with the mental model.',
    lessonRef: 'Server Components Architecture',
    lessonId: 'les-1-1-2',
    upvotes: 24,
    downvotes: 1,
    time: '2 hours ago',
    isAnswered: true,
    replies: [
      {
        id: 'r-1-1',
        author: 'Sarah Mitchell',
        avatar: 'SM',
        content: 'Great question! Server Components don\'t directly interact with client state. Instead, they pass data as props to Client Components. Think of it as a one-way data flow: Server → Client. You can use Server Actions to mutate data on the server, which then triggers a re-render.',
        time: '1 hour ago',
        upvotes: 18,
        downvotes: 0,
        isInstructor: true,
        isAnswer: true,
      },
      {
        id: 'r-1-2',
        author: 'Emma Rodriguez',
        avatar: 'ER',
        content: 'This clicked for me when I started thinking of Server Components as "data fetchers" and Client Components as "interaction handlers". The pattern is: Server Component fetches → passes as props → Client Component handles events → Server Action mutates → revalidation.',
        time: '45 min ago',
        upvotes: 12,
        downvotes: 0,
        isInstructor: false,
        isAnswer: false,
      },
    ],
  },
  {
    id: 'q-2',
    author: 'Emma Rodriguez',
    avatar: 'ER',
    title: 'Best pattern for loading states in App Router?',
    content: 'What\'s the recommended way to handle loading.tsx vs Suspense boundaries for complex pages? I have a dashboard with multiple data sources and want to show progressive loading.',
    lessonRef: 'App Router Architecture',
    lessonId: 'les-1-2-1',
    upvotes: 16,
    downvotes: 0,
    time: '5 hours ago',
    isAnswered: false,
    replies: [
      {
        id: 'r-2-1',
        author: 'David Park',
        avatar: 'DP',
        content: 'For dashboards, I recommend using multiple Suspense boundaries with individual loading skeletons. This way each section loads independently. Don\'t rely solely on loading.tsx as it\'s page-level.',
        time: '3 hours ago',
        upvotes: 8,
        downvotes: 0,
        isInstructor: false,
        isAnswer: false,
      },
    ],
  },
  {
    id: 'q-3',
    author: 'David Park',
    avatar: 'DP',
    title: 'TypeScript generic patterns for API routes',
    content: 'I\'ve been experimenting with typed API routes. Here\'s my approach to type-safe server actions - has anyone found a better pattern for inferring return types?',
    lessonRef: 'TypeScript Advanced Patterns',
    lessonId: 'les-1-1-3',
    upvotes: 31,
    downvotes: 2,
    time: '1 day ago',
    isAnswered: true,
    replies: [
      {
        id: 'r-3-1',
        author: 'Sarah Mitchell',
        avatar: 'SM',
        content: 'Excellent question! I cover this in detail in Module 3. The key is using Zod for runtime validation + TypeScript inference. This gives you end-to-end type safety. Here\'s the pattern: `const schema = z.object({...}); type Input = z.infer<typeof schema>;`',
        time: '20 hours ago',
        upvotes: 22,
        downvotes: 0,
        isInstructor: true,
        isAnswer: true,
      },
      {
        id: 'r-3-2',
        author: 'Alex Kim',
        avatar: 'AK',
        content: 'I\'ve been using tRPC-style patterns with server actions and it\'s been great. The type inference works beautifully.',
        time: '18 hours ago',
        upvotes: 5,
        downvotes: 1,
        isInstructor: false,
        isAnswer: false,
      },
    ],
  },
  {
    id: 'q-4',
    author: 'Lisa Wang',
    avatar: 'LW',
    title: 'When should I use "use client" vs keeping components as Server Components?',
    content: 'I\'m not sure about the boundary between server and client components. Is there a rule of thumb for when a component should be a client component?',
    lessonRef: 'React 19 New Features Deep Dive',
    lessonId: 'les-1-1-1',
    upvotes: 19,
    downvotes: 0,
    time: '2 days ago',
    isAnswered: false,
    replies: [],
  },
  {
    id: 'q-5',
    author: 'Tom Williams',
    avatar: 'TW',
    title: 'Server Actions error handling best practices?',
    content: 'How should I handle errors in Server Actions? Should I use try/catch or rely on error boundaries? What about validation errors vs server errors?',
    lessonRef: 'Server Actions & Data Mutation',
    lessonId: 'les-1-2-2',
    upvotes: 11,
    downvotes: 1,
    time: '3 days ago',
    isAnswered: false,
    replies: [
      {
        id: 'r-5-1',
        author: 'Sarah Mitchell',
        avatar: 'SM',
        content: 'For Server Actions, I recommend returning a result object: `{ success: boolean, data?: T, error?: string }`. This lets the client component handle both success and error states gracefully. Error boundaries are for unexpected errors, not validation.',
        time: '2 days ago',
        upvotes: 14,
        downvotes: 0,
        isInstructor: true,
        isAnswer: false,
      },
    ],
  },
];

// ─── Mock Notes Data ───────────────────────────────────────
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

const mockNotes: Note[] = [
  {
    id: 'note-1',
    lessonId: 'les-1-1-1',
    lessonTitle: 'React 19 New Features Deep Dive',
    content: '**Key Takeaways:**\n- React 19 introduces the `use()` hook for promises\n- Server Components are the default in Next.js\n- Actions replace traditional form handling\n\nThe `use()` hook is a game changer for data fetching patterns.',
    category: 'study_guide',
    timestamp: 45,
    createdAt: '2024-10-15T10:30:00Z',
    updatedAt: '2024-10-15T10:35:00Z',
  },
  {
    id: 'note-2',
    lessonId: 'les-1-1-1',
    lessonTitle: 'React 19 New Features Deep Dive',
    content: '```typescript\n// Server Component example\nasync function UserProfile({ id }: { id: string }) {\n  const user = await db.user.findUnique({ where: { id } });\n  return <div>{user.name}</div>;\n}\n```',
    category: 'code_snippet',
    timestamp: 120,
    createdAt: '2024-10-15T11:00:00Z',
    updatedAt: '2024-10-15T11:05:00Z',
  },
  {
    id: 'note-3',
    lessonId: 'les-1-1-2',
    lessonTitle: 'Server Components Architecture',
    content: 'Need to revisit: How does streaming work with Suspense boundaries? The instructor mentioned partial hydration - need to understand this better for the quiz.',
    category: 'question',
    createdAt: '2024-10-16T09:15:00Z',
    updatedAt: '2024-10-16T09:20:00Z',
  },
  {
    id: 'note-4',
    lessonId: 'les-1-1-2',
    lessonTitle: 'Server Components Architecture',
    content: 'Server Components render on the server and send HTML to the client. They CANNOT:\n- Use useState, useEffect\n- Handle event listeners\n- Use browser-only APIs\n\nThey CAN:\n- Fetch data directly\n- Access server resources\n- Pass data to Client Components',
    category: 'study_guide',
    timestamp: 180,
    createdAt: '2024-10-16T09:30:00Z',
    updatedAt: '2024-10-16T09:35:00Z',
  },
  {
    id: 'note-5',
    lessonId: 'les-1-1-3',
    lessonTitle: 'TypeScript Advanced Patterns',
    content: 'My personal approach to generics: Start simple, add constraints only when needed. The KISS principle applies especially to TypeScript generics.',
    category: 'personal',
    createdAt: '2024-10-17T14:00:00Z',
    updatedAt: '2024-10-17T14:05:00Z',
  },
];

// ─── Mock Progress Timeline Data ───────────────────────────
interface TimelineEvent {
  id: string;
  lessonId: string;
  lessonTitle: string;
  moduleName: string;
  date: string;
  timeSpent: number;
  quizScore?: number;
  type: 'completed' | 'started' | 'quiz';
}

const timelineEvents: TimelineEvent[] = [
  { id: 'te-1', lessonId: 'les-1-1-1', lessonTitle: 'React 19 New Features Deep Dive', moduleName: 'Foundations of Modern React', date: '2024-10-14', timeSpent: 47, quizScore: 92, type: 'completed' },
  { id: 'te-2', lessonId: 'les-1-1-1', lessonTitle: 'React 19 New Features Deep Dive', moduleName: 'Foundations of Modern React', date: '2024-10-14', timeSpent: 47, quizScore: 92, type: 'quiz' },
  { id: 'te-3', lessonId: 'les-1-1-2', lessonTitle: 'Server Components Architecture', moduleName: 'Foundations of Modern React', date: '2024-10-16', timeSpent: 52, quizScore: 88, type: 'completed' },
  { id: 'te-4', lessonId: 'les-1-1-2', lessonTitle: 'Server Components Architecture', moduleName: 'Foundations of Modern React', date: '2024-10-16', timeSpent: 52, quizScore: 88, type: 'quiz' },
  { id: 'te-5', lessonId: 'les-1-1-3', lessonTitle: 'TypeScript Advanced Patterns', moduleName: 'Foundations of Modern React', date: '2024-10-17', timeSpent: 35, type: 'started' },
];

const weeklyActivity = [
  { day: 'Mon', hours: 1.5 },
  { day: 'Tue', hours: 2.0 },
  { day: 'Wed', hours: 0.5 },
  { day: 'Thu', hours: 1.8 },
  { day: 'Fri', hours: 2.2 },
  { day: 'Sat', hours: 0.8 },
  { day: 'Sun', hours: 0 },
];

const milestones = [
  { id: 'ms-1', title: 'First Lesson Completed', description: 'Completed your first lesson', icon: '🎯', date: 'Oct 14', achieved: true },
  { id: 'ms-2', title: 'Quick Learner', description: 'Completed 2 lessons in one day', icon: '⚡', date: 'Oct 14', achieved: true },
  { id: 'ms-3', title: 'Module Master', description: 'Complete all lessons in a module', icon: '🏆', date: '', achieved: false },
  { id: 'ms-4', title: 'Quiz Ace', description: 'Score 95%+ on any quiz', icon: '🎓', date: '', achieved: false },
  { id: 'ms-5', title: 'Streak Champion', description: 'Maintain a 7-day learning streak', icon: '🔥', date: '', achieved: false },
  { id: 'ms-6', title: 'Course Graduate', description: 'Complete the entire course', icon: '🏅', date: '', achieved: false },
];

// ─── Mock resources ────────────────────────────────────────
const courseResources = [
  { id: 'res-1', title: 'React 19 Cheat Sheet', type: 'pdf', size: '2.4 MB' },
  { id: 'res-2', title: 'Next.js App Router Diagram', type: 'pdf', size: '1.1 MB' },
  { id: 'res-3', title: 'Course Code Repository', type: 'repo', url: 'github.com/nextgen-lms/react-masterclass' },
  { id: 'res-4', title: 'TypeScript Best Practices Guide', type: 'pdf', size: '3.8 MB' },
  { id: 'res-5', title: 'Official React Documentation', type: 'link', url: 'react.dev' },
  { id: 'res-6', title: 'Next.js Documentation', type: 'link', url: 'nextjs.org/docs' },
];

// ─── Mock reviews ──────────────────────────────────────────
const courseReviews = [
  { id: 'rev-1', author: 'Sarah K.', avatar: 'SK', rating: 5, date: '2 weeks ago', content: 'Absolutely incredible course! The section on Server Components completely changed how I think about React architecture. Highly recommended for anyone serious about modern web development.' },
  { id: 'rev-2', author: 'James L.', avatar: 'JL', rating: 5, date: '1 month ago', content: 'Best React course I\'ve ever taken. The instructor explains complex concepts in a way that\'s easy to follow. The hands-on projects really solidify the learning.' },
  { id: 'rev-3', author: 'Priya S.', avatar: 'PS', rating: 4, date: '1 month ago', content: 'Great content overall. The TypeScript patterns section was excellent. Would have liked more content on testing patterns, but still very much worth the investment.' },
  { id: 'rev-4', author: 'Alex M.', avatar: 'AM', rating: 5, date: '2 months ago', content: 'This course is a game-changer. I went from struggling with React concepts to building production apps confidently. The community support is amazing too.' },
  { id: 'rev-5', author: 'Tom W.', avatar: 'TW', rating: 4, date: '3 months ago', content: 'Very comprehensive course. The App Router deep-dive was particularly helpful. Some sections could be a bit more beginner-friendly, but the depth is appreciated.' },
];

// ─── Rating distribution ───────────────────────────────────
const ratingDistribution = [
  { stars: 5, count: 186 },
  { stars: 4, count: 89 },
  { stars: 3, count: 24 },
  { stars: 2, count: 9 },
  { stars: 1, count: 4 },
];
const totalReviews = ratingDistribution.reduce((s, r) => s + r.count, 0);

// ─── Q&A Discussion Data ──────────────────────────────────
interface QAAnswer {
  id: string;
  author: { name: string; avatar: string; role: 'instructor' | 'learner' };
  content: string;
  upvotes: number;
  downvotes: number;
  isAccepted: boolean;
  createdAt: string;
  replies: QAReply[];
}

interface QAReply {
  id: string;
  author: { name: string; avatar: string; role: 'instructor' | 'learner' };
  content: string;
  upvotes: number;
  createdAt: string;
}

interface QAQuestion {
  id: string;
  lessonId: string;
  title: string;
  content: string;
  author: { name: string; avatar: string; role: 'instructor' | 'learner' };
  tags: string[];
  upvotes: number;
  answerCount: number;
  resolved: boolean;
  createdAt: string;
  answers: QAAnswer[];
}

const mockQAData: QAQuestion[] = [
  {
    id: 'q1',
    lessonId: 'les-1-1-1',
    title: 'How does useMemo differ from useCallback?',
    content: 'I understand both are for optimization, but when should I use one vs the other? The docs say useMemo memoizes a value and useCallback memoizes a function, but I need a practical example to really understand the difference.',
    author: { name: 'Alex Johnson', avatar: 'AJ', role: 'learner' },
    tags: ['concept', 'hooks'],
    upvotes: 12,
    answerCount: 3,
    resolved: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    answers: [
      {
        id: 'a1-1',
        author: { name: 'Sarah Mitchell', avatar: 'SM', role: 'instructor' },
        content: 'Great question! Think of it this way:\n\n- `useMemo` caches a **computed value** — use it when you want to avoid recalculating something expensive.\n- `useCallback` caches a **function reference** — use it when you want to avoid recreating a function on every render.\n\nExample:\n```tsx\nconst computedValue = useMemo(() => expensiveCalc(a, b), [a, b]);\nconst handleClick = useCallback(() => doSomething(id), [id]);\n```',
        upvotes: 18,
        downvotes: 0,
        isAccepted: true,
        createdAt: new Date(Date.now() - 80000000).toISOString(),
        replies: [
          { id: 'r1-1-1', author: { name: 'Alex Johnson', avatar: 'AJ', role: 'learner' }, content: 'This makes so much sense now! The value vs function distinction is the key. Thank you!', upvotes: 3, createdAt: new Date(Date.now() - 72000000).toISOString() },
        ],
      },
      {
        id: 'a1-2',
        author: { name: 'Emma Rodriguez', avatar: 'ER', role: 'learner' },
        content: 'A rule of thumb I follow: if you\'re passing a function as a prop to a child component, use `useCallback`. If you\'re computing a value, use `useMemo`. Both prevent unnecessary re-renders.',
        upvotes: 7,
        downvotes: 0,
        isAccepted: false,
        createdAt: new Date(Date.now() - 70000000).toISOString(),
        replies: [],
      },
    ],
  },
  {
    id: 'q2',
    lessonId: 'les-1-1-2',
    title: 'Can Server Components access browser APIs like localStorage?',
    content: 'I keep getting errors when trying to use localStorage in my Server Component. Are Server Components completely isolated from the browser? What\'s the workaround for client-specific logic?',
    author: { name: 'Mike Chen', avatar: 'MC', role: 'learner' },
    tags: ['bug', 'server-components'],
    upvotes: 8,
    answerCount: 2,
    resolved: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    answers: [
      {
        id: 'a2-1',
        author: { name: 'Sarah Mitchell', avatar: 'SM', role: 'instructor' },
        content: 'Server Components run on the server and have no access to browser APIs like `localStorage`, `window`, or `document`. The solution is to move any client-side logic into a Client Component (with `"use client"`) and import it into your Server Component.',
        upvotes: 10,
        downvotes: 0,
        isAccepted: false,
        createdAt: new Date(Date.now() - 160000000).toISOString(),
        replies: [],
      },
    ],
  },
  {
    id: 'q3',
    lessonId: 'les-1-1-3',
    title: 'TypeScript utility type for omitting nested keys?',
    content: 'Is there a clean way to create a utility type that omits nested keys in TypeScript? `Omit<T, K>` only works at the top level. I need something like `DeepOmit<User, "profile.age">`.',
    author: { name: 'Lisa Wang', avatar: 'LW', role: 'learner' },
    tags: ['concept', 'typescript'],
    upvotes: 15,
    answerCount: 1,
    resolved: false,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    answers: [
      {
        id: 'a3-1',
        author: { name: 'David Park', avatar: 'DP', role: 'learner' },
        content: 'You can create a recursive `DeepOmit` type like this:\n```typescript\ntype DeepOmit<T, Path extends string> =\n  Path extends `${infer Key}.${infer Rest}`\n    ? { [K in keyof T]: K extends Key ? DeepOmit<T[K], Rest> : T[K] }\n    : Omit<T, Path>;\n```\nThis uses template literal types to split the path string recursively.',
        upvotes: 6,
        downvotes: 1,
        isAccepted: false,
        createdAt: new Date(Date.now() - 240000000).toISOString(),
        replies: [],
      },
    ],
  },
  {
    id: 'q4',
    lessonId: 'les-1-1-1',
    title: 'Why does my useEffect run twice in development?',
    content: 'When I use useEffect in development mode, it fires twice. Is this a bug or expected behavior? It works fine in production. This is really confusing for beginners.',
    author: { name: 'Tom Williams', avatar: 'TW', role: 'learner' },
    tags: ['bug', 'video-timestamp'],
    upvotes: 21,
    answerCount: 2,
    resolved: true,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    answers: [
      {
        id: 'a4-1',
        author: { name: 'Sarah Mitchell', avatar: 'SM', role: 'instructor' },
        content: 'This is expected behavior in React 18+ with Strict Mode enabled. React intentionally double-invokes effects in development to help you find side effects that aren\'t properly cleaned up. Your cleanup function should undo whatever the effect did.\n\nDon\'t worry — this only happens in development, not production.',
        upvotes: 25,
        downvotes: 0,
        isAccepted: true,
        createdAt: new Date(Date.now() - 330000000).toISOString(),
        replies: [
          { id: 'r4-1-1', author: { name: 'Tom Williams', avatar: 'TW', role: 'learner' }, content: 'Ah, so it\'s a feature, not a bug! Thanks for the explanation. I\'ll make sure my cleanup functions are solid.', upvotes: 4, createdAt: new Date(Date.now() - 320000000).toISOString() },
        ],
      },
    ],
  },
  {
    id: 'q5',
    lessonId: 'les-1-2-1',
    title: 'How to implement progressive loading with Suspense?',
    content: 'I have a dashboard page with 4 independent data sections. How do I use Suspense boundaries so each section loads independently rather than the whole page waiting?',
    author: { name: 'Emma Rodriguez', avatar: 'ER', role: 'learner' },
    tags: ['concept', 'app-router'],
    upvotes: 9,
    answerCount: 1,
    resolved: false,
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    answers: [
      {
        id: 'a5-1',
        author: { name: 'Mike Chen', avatar: 'MC', role: 'learner' },
        content: 'Wrap each section in its own `<Suspense>` boundary with a unique fallback. Next.js will stream each section as it resolves:\n```tsx\n<Suspense fallback={<ChartSkeleton />}>\n  <RevenueChart />\n</Suspense>\n<Suspense fallback={<TableSkeleton />}>\n  <RecentOrders />\n</Suspense>\n```',
        upvotes: 5,
        downvotes: 0,
        isAccepted: false,
        createdAt: new Date(Date.now() - 400000000).toISOString(),
        replies: [],
      },
    ],
  },
  {
    id: 'q6',
    lessonId: 'les-1-1-2',
    title: 'Server Actions vs API routes — when to use which?',
    content: 'The course mentions both Server Actions and API routes. Are Server Actions meant to replace API routes entirely, or do they serve different purposes? What about external API integrations?',
    author: { name: 'David Park', avatar: 'DP', role: 'learner' },
    tags: ['concept', 'server-actions'],
    upvotes: 18,
    answerCount: 2,
    resolved: true,
    createdAt: new Date(Date.now() - 518400000).toISOString(),
    answers: [
      {
        id: 'a6-1',
        author: { name: 'Sarah Mitchell', avatar: 'SM', role: 'instructor' },
        content: 'Server Actions are great for mutations from your own frontend (forms, buttons). API routes are better when you need:\n- External consumers (mobile apps, third parties)\n- Webhooks\n- File uploads with specific content types\n- CORS requirements\n\nYou can absolutely use both in the same project!',
        upvotes: 22,
        downvotes: 0,
        isAccepted: true,
        createdAt: new Date(Date.now() - 500000000).toISOString(),
        replies: [],
      },
      {
        id: 'a6-2',
        author: { name: 'Lisa Wang', avatar: 'LW', role: 'learner' },
        content: 'I found that Server Actions make the DX much smoother for internal mutations. But for anything that needs to be called from outside the Next.js app, stick with API routes.',
        upvotes: 8,
        downvotes: 0,
        isAccepted: false,
        createdAt: new Date(Date.now() - 480000000).toISOString(),
        replies: [],
      },
    ],
  },
  {
    id: 'q7',
    lessonId: 'les-1-2-2',
    title: 'Error boundary not catching Server Action errors?',
    content: 'My error.tsx boundary doesn\'t seem to catch errors thrown in Server Actions. The errors just show up in the console. Am I missing something about how error handling works with Server Actions?',
    author: { name: 'Alex Johnson', avatar: 'AJ', role: 'learner' },
    tags: ['bug', 'server-actions'],
    upvotes: 6,
    answerCount: 0,
    resolved: false,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    answers: [],
  },
  {
    id: 'q8',
    lessonId: 'les-1-1-3',
    title: 'What is the satisfies operator and when should I use it?',
    content: 'TypeScript 4.9 introduced the `satisfies` operator. How is it different from type annotations (`:`) and when should I prefer one over the other?',
    author: { name: 'Mike Chen', avatar: 'MC', role: 'learner' },
    tags: ['concept', 'typescript'],
    upvotes: 11,
    answerCount: 1,
    resolved: false,
    createdAt: new Date(Date.now() - 691200000).toISOString(),
    answers: [
      {
        id: 'a8-1',
        author: { name: 'Lisa Wang', avatar: 'LW', role: 'learner' },
        content: 'With `: Type`, the variable gets widened to the type. With `satisfies Type`, TypeScript checks the value matches the type but preserves the literal types. Example:\n```typescript\nconst config: Record<string, string> = { host: "localhost", port: "3000" };\n// config.host is string\n\nconst config2 = { host: "localhost", port: "3000" } satisfies Record<string, string>;\n// config2.host is "localhost" (literal preserved!)\n```',
        upvotes: 9,
        downvotes: 0,
        isAccepted: false,
        createdAt: new Date(Date.now() - 660000000).toISOString(),
        replies: [],
      },
    ],
  },
  {
    id: 'q9',
    lessonId: 'les-1-2-1',
    title: 'Best practices for organizing App Router file structure?',
    content: 'As my Next.js project grows, the app directory is getting messy with lots of route groups, layouts, and loading files. Any tips for keeping things organized?',
    author: { name: 'Emma Rodriguez', avatar: 'ER', role: 'learner' },
    tags: ['concept', 'app-router'],
    upvotes: 14,
    answerCount: 0,
    resolved: false,
    createdAt: new Date(Date.now() - 777600000).toISOString(),
    answers: [],
  },
];

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

// ─── What You'll Learn ─────────────────────────────────────
const whatYouLearn = [
  { id: 'wyl-1', text: 'Build production-ready React 19 applications', completed: true },
  { id: 'wyl-2', text: 'Master Server Components and streaming SSR', completed: true },
  { id: 'wyl-3', text: 'Implement advanced TypeScript patterns', completed: false },
  { id: 'wyl-4', text: 'Architect Next.js 16 App Router applications', completed: false },
  { id: 'wyl-5', text: 'Build type-safe API routes with Server Actions', completed: false },
  { id: 'wyl-6', text: 'Deploy and optimize for production', completed: false },
  { id: 'wyl-7', text: 'Implement authentication and authorization patterns', completed: false },
  { id: 'wyl-8', text: 'Master state management in modern React', completed: false },
];

// ─── Prerequisites ─────────────────────────────────────────
const prerequisites = [
  'Basic knowledge of HTML, CSS, and JavaScript',
  'Familiarity with React fundamentals (components, props, state)',
  'Basic understanding of TypeScript',
  'Node.js installed on your machine',
];

// ─── Students Also Taking ──────────────────────────────────
const studentsAlsoTaking = [
  { id: 'sat-1', title: 'AI-Powered Full Stack Development', level: 'intermediate', rating: 4.9, students: 623, price: 149 },
  { id: 'sat-2', title: 'UX/UI Design Principles', level: 'beginner', rating: 4.5, students: 567, price: 99 },
  { id: 'sat-3', title: 'DevOps & Cloud Architecture', level: 'advanced', rating: 4.8, students: 298, price: 179 },
];

// ─── Instructor Profile ────────────────────────────────────
const instructorProfile = {
  name: 'Sarah Mitchell',
  avatar: 'SM',
  title: 'Senior Software Engineer & Educator',
  bio: 'Former tech lead at Meta with 12+ years of experience in React and web performance. Published author, conference speaker, and passionate about making complex topics accessible.',
  courses: 6,
  students: 12847,
  rating: 4.9,
  otherCourses: ['AI-Powered Full Stack Development', 'System Design for Senior Engineers'],
};

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
                          <Download className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground cursor-pointer transition-colors" />
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
function DiscussionTab({ questions }: { questions: DiscussionQuestion[] }) {
  const [sortBy, setSortBy] = useState<'recent' | 'upvoted' | 'unanswered'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [showAskForm, setShowAskForm] = useState(false);
  const [askTitle, setAskTitle] = useState('');
  const [askContent, setAskContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const unansweredCount = questions.filter(q => !q.isAnswered).length;

  const sortedQuestions = [...questions].sort((a, b) => {
    if (sortBy === 'recent') return 0;
    if (sortBy === 'upvoted') return b.upvotes - a.upvotes;
    if (sortBy === 'unanswered') return a.isAnswered === b.isAnswered ? 0 : a.isAnswered ? 1 : -1;
    return 0;
  });

  const filteredQuestions = sortedQuestions.filter(q =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  placeholder="What's your question?"
                  value={askTitle}
                  onChange={(e) => setAskTitle(e.target.value)}
                  className="font-medium"
                />
                <Textarea
                  placeholder="Provide more details about your question... (Supports **bold**, *italic*, `code`)"
                  value={askContent}
                  onChange={(e) => setAskContent(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    <span>Supports Markdown formatting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setShowAskForm(false)}>Cancel</Button>
                    <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowAskForm(false)}>
                      <Send className="h-3 w-3" /> Post Question
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
          {filteredQuestions.map((question) => (
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
                question.isAnswered && 'border-emerald-200 dark:border-emerald-800/40'
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Vote column */}
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <button className="p-1 rounded hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-semibold text-foreground">{question.upvotes}</span>
                      <button className="p-1 rounded hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0" onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {question.isAnswered && (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] gap-0.5">
                            <CheckCircle2 className="h-3 w-3" /> Answered
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] gap-0.5">
                          <BookOpen className="h-2.5 w-2.5" /> {question.lessonRef}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">{question.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{question.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[8px] bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                              {question.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-foreground">{question.author}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">· {question.time}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageCircle className="h-3 w-3" /> {question.replies.length}
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
                          {question.replies.map((reply) => (
                            <div key={reply.id} className={cn(
                              'ml-8 p-3 rounded-lg',
                              reply.isAnswer ? 'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30' : 'bg-muted/30'
                            )}>
                              <div className="flex items-center gap-2 mb-1.5">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className={cn(
                                    'text-[9px]',
                                    reply.isInstructor
                                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                  )}>
                                    {reply.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium text-foreground">{reply.author}</span>
                                {reply.isInstructor && (
                                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[9px] px-1.5 py-0 gap-0.5">
                                    <GraduationCap className="h-2.5 w-2.5" /> Instructor
                                  </Badge>
                                )}
                                {reply.isAnswer && (
                                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px] px-1.5 py-0 gap-0.5">
                                    <CheckCircle2 className="h-2.5 w-2.5" /> Best Answer
                                  </Badge>
                                )}
                                <span className="text-[10px] text-muted-foreground">· {reply.time}</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed ml-8">{reply.content}</p>
                              <div className="flex items-center gap-3 mt-2 ml-8">
                                <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                                  <ThumbsUp className="h-3 w-3" /> {reply.upvotes}
                                </button>
                                <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                                  <ThumbsDown className="h-3 w-3" /> {reply.downvotes}
                                </button>
                              </div>
                            </div>
                          ))}

                          {/* Reply input */}
                          <div className="ml-8 flex gap-2">
                            <Input
                              placeholder="Write a reply..."
                              value={replyingTo === question.id ? replyContent : ''}
                              onChange={(e) => { setReplyingTo(question.id); setReplyContent(e.target.value); }}
                              className="h-8 text-xs"
                              onFocus={() => setReplyingTo(question.id)}
                            />
                            <Button
                              size="sm"
                              className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 shrink-0"
                              onClick={() => { setReplyContent(''); setReplyingTo(null); }}
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Button variant="outline" className="w-full">View All Discussions</Button>
    </div>
  );
}

// ─── Q&A Discussion Tab ────────────────────────────────────
function QADiscussionTab({ questions, modules }: { questions: QAQuestion[]; modules: Module[] }) {
  const [selectedLessonId, setSelectedLessonId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'voted' | 'unresolved' | 'resolved'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'my' | 'unresolved' | 'resolved'>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<QAQuestion | null>(null);
  const [upvotedQuestions, setUpvotedQuestions] = useState<Set<string>>(new Set());
  const [upvotedAnswers, setUpvotedAnswers] = useState<Set<string>>(new Set());
  const [downvotedAnswers, setDownvotedAnswers] = useState<Set<string>>(new Set());
  const [showAskDialog, setShowAskDialog] = useState(false);
  const [askTitle, setAskTitle] = useState('');
  const [askContent, setAskContent] = useState('');
  const [askTags, setAskTags] = useState('');
  const [askLessonId, setAskLessonId] = useState<string>(selectedLessonId === 'all' ? '' : selectedLessonId);
  const [answerContent, setAnswerContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(modules.map(m => m.id)));
  const [answerSortBy, setAnswerSortBy] = useState<'votes' | 'newest'>('votes');

  // Build lesson map from modules
  const lessonMap = new Map<string, { title: string; moduleId: string; moduleTitle: string }>();
  modules.forEach(mod => {
    (mod.lessons || []).forEach(lesson => {
      lessonMap.set(lesson.id, { title: lesson.title, moduleId: mod.id, moduleTitle: mod.title });
    });
  });

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    if (selectedLessonId !== 'all' && q.lessonId !== selectedLessonId) return false;
    if (filterBy === 'my' && q.author.name !== 'Alex Johnson') return false;
    if (filterBy === 'unresolved' && q.resolved) return false;
    if (filterBy === 'resolved' && !q.resolved) return false;
    if (searchQuery) {
      const lq = searchQuery.toLowerCase();
      if (!q.title.toLowerCase().includes(lq) && !q.content.toLowerCase().includes(lq) && !q.tags.some(t => t.toLowerCase().includes(lq))) return false;
    }
    return true;
  });

  // Sort questions
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'voted') return b.upvotes - a.upvotes;
    if (sortBy === 'unresolved') return a.resolved === b.resolved ? 0 : a.resolved ? 1 : -1;
    if (sortBy === 'resolved') return a.resolved === b.resolved ? 0 : a.resolved ? -1 : 1;
    return 0;
  });

  // Sort answers
  const sortAnswers = (answers: QAAnswer[]) => {
    return [...answers].sort((a, b) => {
      if (answerSortBy === 'votes') return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const handleUpvoteQuestion = (qId: string) => {
    setUpvotedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const handleUpvoteAnswer = (aId: string) => {
    setUpvotedAnswers(prev => {
      const next = new Set(prev);
      if (next.has(aId)) next.delete(aId);
      else next.add(aId);
      return next;
    });
    setDownvotedAnswers(prev => { const n = new Set(prev); n.delete(aId); return n; });
  };

  const handleDownvoteAnswer = (aId: string) => {
    setDownvotedAnswers(prev => {
      const next = new Set(prev);
      if (next.has(aId)) next.delete(aId);
      else next.add(aId);
      return next;
    });
    setUpvotedAnswers(prev => { const n = new Set(prev); n.delete(aId); return n; });
  };

  // Count questions per lesson
  const questionCountsByLesson = new Map<string, number>();
  const unresolvedCountsByLesson = new Map<string, number>();
  questions.forEach(q => {
    questionCountsByLesson.set(q.lessonId, (questionCountsByLesson.get(q.lessonId) || 0) + 1);
    if (!q.resolved) unresolvedCountsByLesson.set(q.lessonId, (unresolvedCountsByLesson.get(q.lessonId) || 0) + 1);
  });

  const unresolvedTotal = questions.filter(q => !q.resolved).length;

  // Render code blocks in content
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
      // Handle inline code
      const inlineParts = part.split(/(`[^`]+`)/g);
      return (
        <span key={i}>
          {inlineParts.map((ip, j) => {
            if (ip.startsWith('`') && ip.endsWith('`')) {
              return <code key={j} className="bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded text-xs font-mono">{ip.slice(1, -1)}</code>;
            }
            // Handle bold
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

  // ─── Thread Detail View ─────────────────────────────────
  if (selectedQuestion) {
    const q = selectedQuestion;
    const isUpvoted = upvotedQuestions.has(q.id);
    const sortedAnswers = sortAnswers(q.answers);
    const acceptedAnswer = sortedAnswers.find(a => a.isAccepted);

    return (
      <div className="space-y-4">
        {/* Back button */}
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => setSelectedQuestion(null)}>
          <ChevronDown className="h-4 w-4 rotate-90" />
          Back to Questions
        </Button>

        {/* Question Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={cn(glassCard, 'border-orange-200/50 dark:border-orange-800/30')}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Upvote column */}
                <div className="flex flex-col items-center gap-1 pt-1">
                  <button
                    className={cn('p-1.5 rounded-lg transition-all duration-200', isUpvoted ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground')}
                    onClick={() => handleUpvoteQuestion(q.id)}
                  >
                    <ChevronUp className="h-5 w-5" />
                  </button>
                  <span className={cn('text-sm font-bold', isUpvoted ? 'text-emerald-600' : 'text-foreground')}>{q.upvotes + (isUpvoted ? 1 : 0)}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {q.resolved ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] gap-0.5">
                        <CheckCircle2 className="h-3 w-3" /> Resolved
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] gap-0.5">
                        <Circle className="h-3 w-3" /> Unresolved
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] gap-0.5">
                      <BookOpen className="h-2.5 w-2.5" /> {lessonMap.get(q.lessonId)?.title || 'Unknown Lesson'}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{q.title}</h3>
                  <div className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {renderContent(q.content)}
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    {q.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[10px] gap-0.5">
                        <Tag className="h-2.5 w-2.5" /> {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className={cn('text-[9px]', q.author.role === 'instructor' ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300')}>
                          {q.author.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-foreground">{q.author.name}</span>
                      {q.author.role === 'instructor' && (
                        <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] px-1.5 py-0 gap-0.5 border-0">
                          <GraduationCap className="h-2.5 w-2.5" /> Instructor
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">· {timeAgo(q.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {q.author.name === 'Alex Johnson' && (
                        <>
                          {!q.resolved && (
                            <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 text-emerald-600 border-emerald-200 dark:border-emerald-800">
                              <Check className="h-3 w-3" /> Mark Resolved
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-7 text-[10px] gap-1">
                            <Edit3 className="h-3 w-3" /> Edit
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-[10px] gap-1 text-red-500 hover:text-red-600">
                            <Trash2 className="h-3 w-3" /> Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Answers Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground text-sm">
              {q.answers.length} {q.answers.length === 1 ? 'Answer' : 'Answers'}
            </h4>
            <div className="flex gap-1">
              {(['votes', 'newest'] as const).map(opt => (
                <Button
                  key={opt}
                  size="sm"
                  variant={answerSortBy === opt ? 'default' : 'outline'}
                  className={cn('text-xs h-7', answerSortBy === opt && 'bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700')}
                  onClick={() => setAnswerSortBy(opt)}
                >
                  {opt === 'votes' ? 'Most Voted' : 'Newest'}
                </Button>
              ))}
            </div>
          </div>

          {/* Accepted Answer first */}
          {acceptedAnswer && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className={cn(glassCard, 'border-emerald-300 dark:border-emerald-700/50 shadow-emerald-500/5 shadow-lg')}>
                <CardContent className="p-5">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <button
                        className={cn('p-1 rounded transition-all duration-200', upvotedAnswers.has(acceptedAnswer.id) ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'hover:bg-muted/50 text-muted-foreground')}
                        onClick={() => handleUpvoteAnswer(acceptedAnswer.id)}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <span className={cn('text-xs font-bold', upvotedAnswers.has(acceptedAnswer.id) ? 'text-emerald-600' : 'text-foreground')}>{acceptedAnswer.upvotes + (upvotedAnswers.has(acceptedAnswer.id) ? 1 : 0) - (downvotedAnswers.has(acceptedAnswer.id) ? 1 : 0)}</span>
                      <button
                        className={cn('p-1 rounded transition-all duration-200', downvotedAnswers.has(acceptedAnswer.id) ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'hover:bg-muted/50 text-muted-foreground')}
                        onClick={() => handleDownvoteAnswer(acceptedAnswer.id)}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className={cn('text-[9px]', acceptedAnswer.author.role === 'instructor' ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300')}>
                            {acceptedAnswer.author.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-foreground">{acceptedAnswer.author.name}</span>
                        {acceptedAnswer.author.role === 'instructor' && (
                          <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] px-1.5 py-0 gap-0.5 border-0">
                            <GraduationCap className="h-2.5 w-2.5" /> Instructor
                          </Badge>
                        )}
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px] px-1.5 py-0 gap-0.5">
                          <Check className="h-2.5 w-2.5" /> Accepted Answer
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">· {timeAgo(acceptedAnswer.createdAt)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {renderContent(acceptedAnswer.content)}
                      </div>

                      {/* Replies */}
                      {acceptedAnswer.replies.length > 0 && (
                        <div className="mt-3 ml-4 space-y-2 border-l-2 border-emerald-200 dark:border-emerald-800/50 pl-3">
                          {acceptedAnswer.replies.map(reply => (
                            <div key={reply.id} className="py-2">
                              <div className="flex items-center gap-1.5 mb-1">
                                <Avatar className="h-4 w-4">
                                  <AvatarFallback className="text-[7px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{reply.author.avatar}</AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] font-medium text-foreground">{reply.author.name}</span>
                                <span className="text-[10px] text-muted-foreground">· {timeAgo(reply.createdAt)}</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply button */}
                      <div className="mt-2">
                        {replyingTo === acceptedAnswer.id ? (
                          <div className="flex gap-2 mt-2">
                            <Input placeholder="Write a reply..." value={replyContent} onChange={e => setReplyContent(e.target.value)} className="h-7 text-xs" />
                            <Button size="sm" className="h-7 gap-1 bg-emerald-600 hover:bg-emerald-700 shrink-0" onClick={() => { setReplyContent(''); setReplyingTo(null); }}>
                              <Send className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7" onClick={() => setReplyingTo(null)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors" onClick={() => setReplyingTo(acceptedAnswer.id)}>
                            <MessageCircle className="h-3 w-3" /> Reply
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Other answers */}
          {sortedAnswers.filter(a => !a.isAccepted).map((answer, idx) => (
            <motion.div key={answer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * (idx + 1) }}>
              <Card className={cn(glassCard, answer.author.role === 'instructor' && 'border-amber-200/50 dark:border-amber-800/30')}>
                <CardContent className="p-5">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <button
                        className={cn('p-1 rounded transition-all duration-200', upvotedAnswers.has(answer.id) ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'hover:bg-muted/50 text-muted-foreground')}
                        onClick={() => handleUpvoteAnswer(answer.id)}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <span className={cn('text-xs font-bold', upvotedAnswers.has(answer.id) ? 'text-emerald-600' : 'text-foreground')}>{answer.upvotes + (upvotedAnswers.has(answer.id) ? 1 : 0) - (downvotedAnswers.has(answer.id) ? 1 : 0)}</span>
                      <button
                        className={cn('p-1 rounded transition-all duration-200', downvotedAnswers.has(answer.id) ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'hover:bg-muted/50 text-muted-foreground')}
                        onClick={() => handleDownvoteAnswer(answer.id)}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className={cn('text-[9px]', answer.author.role === 'instructor' ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300')}>
                            {answer.author.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-foreground">{answer.author.name}</span>
                        {answer.author.role === 'instructor' && (
                          <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] px-1.5 py-0 gap-0.5 border-0">
                            <GraduationCap className="h-2.5 w-2.5" /> Instructor
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground">· {timeAgo(answer.createdAt)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {renderContent(answer.content)}
                      </div>

                      {/* Replies */}
                      {answer.replies.length > 0 && (
                        <div className="mt-3 ml-4 space-y-2 border-l-2 border-border/50 pl-3">
                          {answer.replies.map(reply => (
                            <div key={reply.id} className="py-2">
                              <div className="flex items-center gap-1.5 mb-1">
                                <Avatar className="h-4 w-4">
                                  <AvatarFallback className="text-[7px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{reply.author.avatar}</AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] font-medium text-foreground">{reply.author.name}</span>
                                <span className="text-[10px] text-muted-foreground">· {timeAgo(reply.createdAt)}</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-2">
                        {replyingTo === answer.id ? (
                          <div className="flex gap-2 flex-1">
                            <Input placeholder="Write a reply..." value={replyContent} onChange={e => setReplyContent(e.target.value)} className="h-7 text-xs" />
                            <Button size="sm" className="h-7 gap-1 bg-emerald-600 hover:bg-emerald-700 shrink-0" onClick={() => { setReplyContent(''); setReplyingTo(null); }}>
                              <Send className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7" onClick={() => setReplyingTo(null)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors" onClick={() => setReplyingTo(answer.id)}>
                            <MessageCircle className="h-3 w-3" /> Reply
                          </button>
                        )}
                        {q.author.name === 'Alex Johnson' && !q.resolved && (
                          <button className="flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-700 transition-colors">
                            <Check className="h-3 w-3" /> Mark as Accepted
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* No answers */}
          {q.answers.length === 0 && (
            <div className="text-center py-8">
              <MessageCircleQuestion className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No answers yet. Be the first to help!</p>
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
              onChange={e => setAnswerContent(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Tag className="h-3 w-3" />
                <span>Supports Markdown formatting</span>
              </div>
              <Button size="sm" className="gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/20" onClick={() => setAnswerContent('')}>
                <Send className="h-3 w-3" /> Submit Answer
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
                <label className="text-sm font-medium text-foreground mb-1.5 block">Question Title</label>
                <Input
                  placeholder="What's your question?"
                  value={askTitle}
                  onChange={e => setAskTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Details</label>
                {/* Formatting toolbar */}
                <div className="flex items-center gap-1 mb-2 p-1 rounded-lg border bg-muted/30">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Bold className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Italic className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Code2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Link2 className="h-3.5 w-3.5" /></Button>
                </div>
                <Textarea
                  placeholder="Provide more details about your question... Supports **bold**, *italic*, `code`"
                  value={askContent}
                  onChange={e => setAskContent(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Related Lesson</label>
                <Select value={askLessonId} onValueChange={setAskLessonId}>
                  <SelectTrigger className="h-9">
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
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Tags (comma-separated)</label>
                <Input
                  placeholder="e.g., concept, hooks, bug"
                  value={askTags}
                  onChange={e => setAskTags(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button className="gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/20" onClick={() => setShowAskDialog(false)}>
                <Send className="h-3.5 w-3.5" /> Submit Question
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
                    <Badge variant="secondary" className="text-[9px] h-4 px-1">{questions.length}</Badge>
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
            {sortedQuestions.map((question, idx) => {
              const isUpvoted = upvotedQuestions.has(question.id);
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
                      question.resolved ? 'border-emerald-200/50 dark:border-emerald-800/30' : 'border-orange-100/50 dark:border-orange-800/20'
                    )}
                    onClick={() => setSelectedQuestion(question)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Vote column */}
                        <div className="flex flex-col items-center gap-1 pt-1" onClick={e => e.stopPropagation()}>
                          <button
                            className={cn('p-1 rounded transition-all duration-200', isUpvoted ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground')}
                            onClick={() => handleUpvoteQuestion(question.id)}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <span className={cn('text-sm font-semibold', isUpvoted ? 'text-emerald-600' : 'text-foreground')}>{question.upvotes + (isUpvoted ? 1 : 0)}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {question.resolved ? (
                              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] gap-0.5">
                                <Check className="h-3 w-3" /> Resolved
                              </Badge>
                            ) : (
                              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] gap-0.5">
                                <Circle className="h-2.5 w-2.5" /> Unresolved
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-[10px] gap-0.5">
                              <BookOpen className="h-2.5 w-2.5" /> {lessonMap.get(question.lessonId)?.title || 'Unknown'}
                            </Badge>
                          </div>
                          <h4 className="text-sm font-semibold text-foreground mb-1 line-clamp-1">{question.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{question.content}</p>

                          {/* Tags */}
                          <div className="flex items-center gap-1 mb-2 flex-wrap">
                            {question.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-[9px] gap-0.5 h-4 px-1.5">
                                <Tag className="h-2 w-2" /> {tag}
                              </Badge>
                            ))}
                          </div>

                          {/* Meta row */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Avatar className="h-4 w-4">
                                <AvatarFallback className={cn('text-[7px]', question.author.role === 'instructor' ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300')}>
                                  {question.author.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-foreground">{question.author.name}</span>
                              {question.author.role === 'instructor' && (
                                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[8px] px-1 py-0 gap-0.5 border-0 h-3.5">
                                  <GraduationCap className="h-2 w-2" />
                                </Badge>
                              )}
                            </div>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {timeAgo(question.createdAt)}
                            </span>
                            <span className={cn('flex items-center gap-1', question.resolved ? 'text-emerald-600' : '')}>
                              {question.resolved ? <Check className="h-3 w-3" /> : <MessageCircle className="h-3 w-3" />}
                              {question.answerCount} {question.answerCount === 1 ? 'answer' : 'answers'}
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
function NotesTab({ notes: initialNotes, onJumpToTimestamp }: { notes: Note[]; onJumpToTimestamp?: (time: number) => void }) {
  const [notes, setNotes] = useState(initialNotes);
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
    }, 800);
  }, []);

  const handleExportNotes = () => {
    const text = filteredNotes.map(n =>
      `--- ${n.lessonTitle} [${noteCategoryConfig[n.category].label}] ---\n${n.content}\n`
    ).join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
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
                  <p><strong>Key Topics Covered:</strong> React 19 features (use hook, Server Components), Server/Client component boundaries, TypeScript generic patterns, and Server Actions error handling.</p>
                  <p><strong>Areas to Review:</strong> Streaming with Suspense boundaries and partial hydration concepts need more attention based on your question notes.</p>
                  <p><strong>Progress Insight:</strong> You have a good mix of study guides and code snippets. Consider adding more code practice exercises for TypeScript patterns.</p>
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
              <div className="space-y-1">
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
                  const lessonTitle = lessonNotes[0]?.lessonTitle || lessonId;
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
                <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => { setNewNoteContent(''); handleSaveNote(); }}>
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
                          <Button size="sm" className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => { setEditingNote(null); handleSaveNote(); }}>
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
function ProgressTab({ events, enrollmentProgress }: { events: TimelineEvent[]; enrollmentProgress: number }) {
  const [streak] = useState(7);
  const [totalTime] = useState(134); // minutes
  const [learningPace] = useState<'ahead' | 'on_track' | 'behind'>('on_track');

  const paceConfig = {
    ahead: { label: 'Ahead of Schedule', color: 'text-emerald-600 dark:text-emerald-400', icon: <TrendingUp className="h-4 w-4" />, bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
    on_track: { label: 'On Track', color: 'text-amber-600 dark:text-amber-400', icon: <Minus className="h-4 w-4" />, bg: 'bg-amber-50 dark:bg-amber-900/10' },
    behind: { label: 'Behind Schedule', color: 'text-red-600 dark:text-red-400', icon: <TrendingDown className="h-4 w-4" />, bg: 'bg-red-50 dark:bg-red-900/10' },
  };

  const pace = paceConfig[learningPace];

  // Calculate estimated completion date
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + Math.ceil((100 - enrollmentProgress) / 5));

  const maxHours = Math.max(...weeklyActivity.map(d => d.hours));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <Card className={cn(glassCard)}>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold text-foreground">{streak}</span>
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
                    animate={{ height: `${maxHours > 0 ? (day.hours / maxHours) * 100 : 0}%` }}
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
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-amber-500 to-slate-300 dark:to-slate-600" />

            <div className="space-y-4">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-10"
                >
                  {/* Timeline node */}
                  <div className={cn(
                    'absolute left-2.5 top-1 w-3 h-3 rounded-full border-2',
                    event.type === 'completed' ? 'bg-emerald-500 border-emerald-300' :
                    event.type === 'quiz' ? 'bg-violet-500 border-violet-300' :
                    'bg-amber-500 border-amber-300'
                  )} />

                  <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn(
                        'text-[9px]',
                        event.type === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        event.type === 'quiz' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      )}>
                        {event.type === 'completed' ? '✓ Completed' : event.type === 'quiz' ? '📝 Quiz' : '▶ Started'}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{event.date}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{event.lessonTitle}</p>
                    <p className="text-xs text-muted-foreground">{event.moduleName}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {event.timeSpent} min</span>
                      {event.quizScore !== undefined && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {event.quizScore}% score
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
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

// ─── Main Component ────────────────────────────────────────
export function LearnerCourse() {
  const userId = useAppStore(s => s.currentUser?.id) || '';
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

  // Mutations
  const updateProgress = useUpdateProgress();
  const enrollMutation = useEnroll();

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
    const map: Record<string, number> = { ...defaultResumePositions };
    if (progressData && Array.isArray(progressData)) {
      progressData.forEach((p: any) => {
        if (p.resumePosition !== undefined && p.resumePosition !== null) {
          map[p.lessonId] = p.resumePosition;
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
            chapters={demoChapters}
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
            // Unenroll logic would go here
            setShowUnenrollConfirm(false);
          }}
        />
      </>
    );
  }

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
                  <AvatarFallback className="text-[10px] bg-slate-200 dark:bg-slate-700">SM</AvatarFallback>
                </Avatar>
                <span>Sarah Mitchell</span>
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
              {discussionQuestions.filter(q => !q.isAnswered).length > 0 && (
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[9px] px-1 py-0 ml-1">
                  {discussionQuestions.filter(q => !q.isAnswered).length}
                </Badge>
              )}
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
              {mockQAData.filter(q => !q.resolved).length > 0 && (
                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-[9px] px-1 py-0 ml-1">
                  {mockQAData.filter(q => !q.resolved).length}
                </Badge>
              )}
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
                  </CardContent>
                </Card>

                {/* Difficulty Meter + Prerequisites row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className={cn(glassCard)}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-600" />
                        Course Difficulty
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DifficultyMeter level={course.level} />
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Prerequisites</p>
                        {prerequisites.map((prereq, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-xs text-muted-foreground">{prereq}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Instructor Profile Card */}
                  <Card className={cn(glassCard)}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-amber-600" />
                        Your Instructor
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-3">
                        <Avatar className="h-14 w-14 shrink-0">
                          <AvatarFallback className="text-base bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold">
                            {instructorProfile.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground text-sm">{instructorProfile.name}</h4>
                          <p className="text-xs text-muted-foreground">{instructorProfile.title}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {instructorProfile.rating}</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {instructorProfile.students.toLocaleString()}</span>
                            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {instructorProfile.courses} courses</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-3">{instructorProfile.bio}</p>
                      {instructorProfile.otherCourses.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Other courses by this instructor</p>
                          {instructorProfile.otherCourses.map((c, i) => (
                            <div key={i} className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer">
                              <ArrowRight className="h-3 w-3" /> {c}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Students Also Taking */}
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
                              chapters={demoChapters}
                              compact
                              totalDuration={currentLesson.videoDuration || 300}
                              onProgress={(progress, currentTime) => {
                                // Track progress for API persistence
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
                <DiscussionTab questions={discussionQuestions} />
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
                <NotesTab notes={mockNotes} />
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
                <ProgressTab events={timelineEvents} enrollmentProgress={enrollmentProgress} />
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

                {/* Downloads */}
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
                            <p className="text-xs text-muted-foreground">PDF · {res.size}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                          <Download className="h-3 w-3" /> Download
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* External Links */}
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
                            <p className="text-xs text-muted-foreground">{res.url}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                          Visit <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Code Repos */}
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
                                animate={{ width: `${(dist.count / totalReviews) * 100}%` }}
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
                  {courseReviews.map((review) => (
                    <Card key={review.id} className={cn(glassCard, 'hover:shadow-md transition-all duration-200')}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              {review.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-foreground">{review.author}</span>
                              <span className="text-xs text-muted-foreground">· {review.date}</span>
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
                  ))}
                </div>

                <Button variant="outline" className="w-full">Load More Reviews</Button>
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
                <QADiscussionTab questions={mockQAData} modules={modules} />
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
