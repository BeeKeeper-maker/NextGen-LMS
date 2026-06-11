'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  Search, Filter, Plus, Edit3, Trash2, Eye, GripVertical,
  ChevronRight, ChevronLeft, ChevronDown, Clock, Target, Shuffle,
  CheckCircle2, XCircle, HelpCircle, Code, FileText,
  ArrowUpDown, Play, Save, Send, RotateCcw, X,
  AlertCircle, MoreHorizontal, Copy, Settings2,
  ListChecks, Timer, Award, BookOpen, Type, Hash,
  TrendingUp, TrendingDown, BarChart3, Layers, EyeOff,
  ArrowUp, ArrowDown, Database, Sparkles, Users,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { demoAssessments, demoCourses } from '@/lib/mock-data';
import type { Assessment, Question } from '@/types';

// ---- Helper types ----
type ViewMode = 'list' | 'builder' | 'preview' | 'analytics';
type SortField = 'name' | 'date' | 'submissions' | 'avgScore';

interface QuestionFormData {
  type: Question['type'];
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
  difficulty: Question['difficulty'];
  poolGroup: string;
  timeLimit: number;
  section: string;
}

interface QuestionBankItem extends Question {
  category: string;
  timesAnswered: number;
  correctPercent: number;
  avgTimeSeconds: number;
  discriminationIndex: number;
  distractorCounts: Record<string, number>;
}

const emptyQuestionForm: QuestionFormData = {
  type: 'multiple_choice',
  question: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  explanation: '',
  points: 1,
  difficulty: 'medium',
  poolGroup: '',
  timeLimit: 0,
  section: '',
};

// ---- Demo Question Bank Data ----
const questionBank: QuestionBankItem[] = [
  {
    id: 'bank-1', assessmentId: '', type: 'multiple_choice',
    question: 'What is the virtual DOM in React?',
    options: ['A direct copy of the browser DOM', 'A lightweight representation of the real DOM', 'A CSS framework', 'A testing tool'],
    correctAnswer: '1', explanation: 'The virtual DOM is a lightweight copy of the actual DOM that React uses for efficient updates.',
    points: 2, orderIndex: 0, difficulty: 'easy', poolGroup: 'React Basics', category: 'Web Development',
    timesAnswered: 245, correctPercent: 78, avgTimeSeconds: 32, discriminationIndex: 0.65,
    distractorCounts: { '0': 45, '2': 8, '3': 1 },
  },
  {
    id: 'bank-2', assessmentId: '', type: 'multiple_choice',
    question: 'Which hook is used for side effects in React?',
    options: ['useState', 'useEffect', 'useContext', 'useReducer'],
    correctAnswer: '1', explanation: 'useEffect is the hook designed for handling side effects like data fetching, subscriptions, etc.',
    points: 2, orderIndex: 1, difficulty: 'easy', poolGroup: 'React Hooks', category: 'Web Development',
    timesAnswered: 312, correctPercent: 89, avgTimeSeconds: 18, discriminationIndex: 0.72,
    distractorCounts: { '0': 22, '2': 10, '3': 3 },
  },
  {
    id: 'bank-3', assessmentId: '', type: 'true_false',
    question: 'React Server Components can use useState hook.',
    options: ['True', 'False'],
    correctAnswer: '1', explanation: 'Server Components cannot use hooks like useState as they run only on the server.',
    points: 1, orderIndex: 2, difficulty: 'medium', poolGroup: 'RSC', category: 'Web Development',
    timesAnswered: 178, correctPercent: 42, avgTimeSeconds: 45, discriminationIndex: 0.81,
    distractorCounts: { '0': 103 },
  },
  {
    id: 'bank-4', assessmentId: '', type: 'multiple_choice',
    question: 'What is the time complexity of accessing an element in a hash map?',
    options: ['O(n)', 'O(1) average', 'O(log n)', 'O(n log n)'],
    correctAnswer: '1', explanation: 'Hash maps provide O(1) average time complexity for lookups.',
    points: 2, orderIndex: 3, difficulty: 'hard', poolGroup: 'Data Structures', category: 'Computer Science',
    timesAnswered: 198, correctPercent: 67, avgTimeSeconds: 55, discriminationIndex: 0.88,
    distractorCounts: { '0': 32, '2': 28, '3': 5 },
  },
  {
    id: 'bank-5', assessmentId: '', type: 'short_answer',
    question: 'What does SQL stand for?',
    correctAnswer: 'Structured Query Language',
    explanation: 'SQL stands for Structured Query Language, used for managing relational databases.',
    points: 1, orderIndex: 4, difficulty: 'easy', poolGroup: 'Databases', category: 'Computer Science',
    timesAnswered: 420, correctPercent: 91, avgTimeSeconds: 12, discriminationIndex: 0.45,
    distractorCounts: {},
  },
  {
    id: 'bank-6', assessmentId: '', type: 'multiple_choice',
    question: 'Which HTTP method is idempotent?',
    options: ['POST', 'PUT', 'PATCH', 'None of the above'],
    correctAnswer: '1', explanation: 'PUT is idempotent - making the same request multiple times produces the same result.',
    points: 3, orderIndex: 5, difficulty: 'hard', poolGroup: 'APIs', category: 'Web Development',
    timesAnswered: 156, correctPercent: 38, avgTimeSeconds: 68, discriminationIndex: 0.91,
    distractorCounts: { '0': 52, '2': 40, '3': 5 },
  },
  {
    id: 'bank-7', assessmentId: '', type: 'multiple_choice',
    question: 'What is the purpose of the keyof operator in TypeScript?',
    options: ['Create new keys', 'Extract union of keys from a type', 'Delete keys from objects', 'Iterate over keys'],
    correctAnswer: '1', explanation: 'keyof creates a union type from the keys of a given type.',
    points: 2, orderIndex: 6, difficulty: 'medium', poolGroup: 'TypeScript', category: 'Web Development',
    timesAnswered: 134, correctPercent: 56, avgTimeSeconds: 40, discriminationIndex: 0.77,
    distractorCounts: { '0': 18, '2': 32, '3': 9 },
  },
  {
    id: 'bank-8', assessmentId: '', type: 'true_false',
    question: 'Prisma ORM supports MongoDB as a database provider.',
    options: ['True', 'False'],
    correctAnswer: '0', explanation: 'Prisma does support MongoDB as a database provider since version 3.0.',
    points: 1, orderIndex: 7, difficulty: 'easy', poolGroup: 'Databases', category: 'Web Development',
    timesAnswered: 89, correctPercent: 35, avgTimeSeconds: 22, discriminationIndex: 0.58,
    distractorCounts: { '1': 58 },
  },
];

// ---- Glassmorphism Card Utility ----
const glassCard = 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg';

// ---- Animated Counter ----
function AnimatedCounter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return <>{display}</>;
}

// ---- Icon helpers ----
function TypeIcon({ type, className = 'h-4 w-4' }: { type: string; className?: string }) {
  switch (type) {
    case 'quiz': return <ListChecks className={className} />;
    case 'assignment': return <FileText className={className} />;
    case 'peer_review': return <HelpCircle className={className} />;
    case 'coding': return <Code className={className} />;
    case 'file_upload': return <BookOpen className={className} />;
    case 'multiple_choice': return <ListChecks className={className} />;
    case 'true_false': return <CheckCircle2 className={className} />;
    case 'short_answer': return <Type className={className} />;
    case 'long_answer': return <FileText className={className} />;
    default: return <HelpCircle className={className} />;
  }
}

const difficultyStyles: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  expert: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
};

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return <Badge variant="outline" className={`${difficultyStyles[difficulty] ?? ''} text-xs font-medium`}>{difficulty}</Badge>;
}

const typeBadgeStyles: Record<string, string> = {
  quiz: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800',
  assignment: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  peer_review: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  coding: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  file_upload: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
};

const questionTypeStyles: Record<string, string> = {
  multiple_choice: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  true_false: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800',
  short_answer: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  long_answer: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800',
  coding: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  file_upload: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
};

function AssessmentTypeBadge({ type }: { type: string }) {
  return (
    <Badge variant="outline" className={`${typeBadgeStyles[type] ?? ''} text-xs gap-1`}>
      <TypeIcon type={type} className="h-3 w-3" />
      {type.replace('_', ' ')}
    </Badge>
  );
}

function QuestionTypeBadge({ type }: { type: string }) {
  return (
    <Badge variant="outline" className={`${questionTypeStyles[type] ?? ''} text-xs gap-1`}>
      <TypeIcon type={type} className="h-3 w-3" />
      {type.replace('_', ' ')}
    </Badge>
  );
}

function StatusBadge({ isPublished }: { isPublished: boolean }) {
  return isPublished
    ? (
      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs gap-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        Active
      </Badge>
    )
    : <Badge variant="outline" className="text-xs text-muted-foreground">Draft</Badge>;
}

function getCourseTitle(courseId: string) {
  return demoCourses.find(c => c.id === courseId)?.title ?? 'Unknown Course';
}

function getCourseCategory(courseId: string) {
  return demoCourses.find(c => c.id === courseId)?.category ?? '';
}

// ---- Difficulty Distribution Chart ----
function DifficultyDistributionChart({ questions }: { questions: Question[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    questions.forEach(q => { counts[q.difficulty] = (counts[q.difficulty] || 0) + 1; });
    return [
      { name: 'Easy', value: counts.easy, color: '#10b981' },
      { name: 'Medium', value: counts.medium, color: '#f59e0b' },
      { name: 'Hard', value: counts.hard, color: '#ef4444' },
    ];
  }, [questions]);

  if (questions.length === 0) return null;

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={48}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <RechartsTooltip
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---- Per-Question Statistics ----
function QuestionStatsPanel({ questions }: { questions: Question[] }) {
  // Generate simulated stats for each question
  const stats = useMemo(() => {
    return questions.map((q, idx) => {
      const seed = q.id.charCodeAt(q.id.length - 1);
      const timesAnswered = 45 + (seed * 13) % 200;
      const correctPercent = q.difficulty === 'easy' ? 70 + (seed % 25) : q.difficulty === 'medium' ? 45 + (seed % 30) : 20 + (seed % 35);
      const avgTime = q.difficulty === 'easy' ? 15 + (seed % 20) : q.difficulty === 'medium' ? 30 + (seed % 40) : 50 + (seed % 60);
      const discriminationIndex = +(0.3 + ((seed * 7) % 60) / 100).toFixed(2);
      const distractorCounts: Record<string, number> = {};
      if (q.type === 'multiple_choice' && q.options) {
        q.options.forEach((_, oi) => {
          if (String(oi) !== q.correctAnswer) {
            distractorCounts[String(oi)] = Math.floor((100 - correctPercent) * (0.2 + ((oi * 13 + seed) % 50) / 100));
          }
        });
      }
      return { ...q, timesAnswered, correctPercent, avgTime, discriminationIndex, distractorCounts, idx };
    });
  }, [questions]);

  const getColorClass = (pct: number) => {
    if (pct > 80) return 'text-emerald-600 dark:text-emerald-400';
    if (pct >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getBgClass = (pct: number) => {
    if (pct > 80) return 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800';
    if (pct >= 50) return 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800';
    return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
  };

  const getDiscriminationLabel = (di: number) => {
    if (di >= 0.7) return { text: 'Excellent', cls: 'text-emerald-600 dark:text-emerald-400' };
    if (di >= 0.4) return { text: 'Good', cls: 'text-amber-600 dark:text-amber-400' };
    return { text: 'Poor', cls: 'text-red-600 dark:text-red-400' };
  };

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
      {stats.map((s, i) => {
        const disc = getDiscriminationLabel(s.discriminationIndex);
        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-3 rounded-lg border ${getBgClass(s.correctPercent)} transition-all hover:shadow-md`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">Q{s.idx + 1}</span>
                  <QuestionTypeBadge type={s.type} />
                  <DifficultyBadge difficulty={s.difficulty} />
                </div>
                <p className="text-sm font-medium truncate">{s.question}</p>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-lg font-bold ${getColorClass(s.correctPercent)}`}>{s.correctPercent}%</div>
                <div className="text-xs text-muted-foreground">correct</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-2 pt-2 border-t border-black/5 dark:border-white/5">
              <div className="text-center">
                <div className="text-sm font-semibold">{s.timesAnswered}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Users className="h-3 w-3" /> answered
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">{s.avgTime}s</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" /> avg time
                </div>
              </div>
              <div className="text-center">
                <div className={`text-sm font-semibold ${disc.cls}`}>{s.discriminationIndex}</div>
                <div className="text-xs text-muted-foreground">{disc.text}</div>
              </div>
            </div>

            {/* Distractor analysis */}
            {s.type === 'multiple_choice' && s.options && Object.keys(s.distractorCounts).length > 0 && (
              <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5">
                <div className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Distractor Analysis
                </div>
                <div className="space-y-1">
                  {Object.entries(s.distractorCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([optIdx, count]) => (
                      <div key={optIdx} className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="truncate max-w-[180px] text-muted-foreground">
                          {s.options?.[Number(optIdx)] ?? `Option ${Number(optIdx) + 1}`}
                        </span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-red-400/60 rounded-full" style={{ width: `${Math.min(100, (count / s.timesAnswered) * 200)}%` }} />
                        </div>
                        <span className="text-muted-foreground shrink-0">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ==========================
// QUESTION DIFFICULTY ANALYSIS PANEL
// ==========================
function QuestionDifficultyAnalysis({ assessment, onClose }: { assessment: Assessment; onClose: () => void }) {
  const questions = assessment.questions ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-rose-500 bg-clip-text text-transparent">
              Question Analytics
            </h2>
            <p className="text-sm text-muted-foreground">{assessment.title}</p>
          </div>
        </div>
      </div>

      {questions.length === 0 ? (
        <Card className={glassCard}>
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">No questions to analyze. Add questions to see analytics.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="distribution" className="space-y-4">
          <TabsList>
            <TabsTrigger value="distribution" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" /> Distribution
            </TabsTrigger>
            <TabsTrigger value="details" className="gap-1.5">
              <ListChecks className="h-3.5 w-3.5" /> Per-Question Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="distribution">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Difficulty Distribution Chart */}
              <Card className={glassCard}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                    Difficulty Distribution
                  </CardTitle>
                  <CardDescription>Breakdown of question difficulty levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <DifficultyDistributionChart questions={questions} />
                  <div className="flex items-center justify-center gap-4 mt-2">
                    {[
                      { label: 'Easy', color: 'bg-emerald-500', count: questions.filter(q => q.difficulty === 'easy').length },
                      { label: 'Medium', color: 'bg-amber-500', count: questions.filter(q => q.difficulty === 'medium').length },
                      { label: 'Hard', color: 'bg-red-500', count: questions.filter(q => q.difficulty === 'hard').length },
                    ].map(d => (
                      <div key={d.label} className="flex items-center gap-1.5 text-xs">
                        <div className={`w-2.5 h-2.5 rounded ${d.color}`} />
                        <span>{d.label}: {d.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Summary Stats */}
              <Card className={glassCard}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
                    Quick Insights
                  </CardTitle>
                  <CardDescription>Key metrics at a glance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Total Questions', value: questions.length, icon: HelpCircle, gradient: 'from-violet-500 to-purple-500' },
                      { label: 'Total Points', value: questions.reduce((s, q) => s + q.points, 0), icon: Target, gradient: 'from-amber-500 to-orange-500' },
                      { label: 'Question Types', value: new Set(questions.map(q => q.type)).size, icon: Layers, gradient: 'from-emerald-500 to-teal-500' },
                      { label: 'Hardest Question', value: questions.filter(q => q.difficulty === 'hard').length > 0 ? 'Hard' : questions.filter(q => q.difficulty === 'medium').length > 0 ? 'Medium' : 'Easy', icon: AlertCircle, gradient: 'from-rose-500 to-red-500' },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className={`p-3 rounded-lg ${glassCard}`}
                      >
                        <div className={`h-7 w-7 rounded-md bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-1.5`}>
                          <stat.icon className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div className="text-lg font-bold">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Point Distribution */}
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">Points by Difficulty</div>
                    {['easy', 'medium', 'hard'].map(d => {
                      const pts = questions.filter(q => q.difficulty === d).reduce((s, q) => s + q.points, 0);
                      const totalPts = questions.reduce((s, q) => s + q.points, 0) || 1;
                      return (
                        <div key={d} className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs capitalize w-14">{d}</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(pts / totalPts) * 100}%` }}
                              transition={{ duration: 0.8, delay: 0.3 }}
                              className={`h-full rounded-full ${d === 'easy' ? 'bg-emerald-500' : d === 'medium' ? 'bg-amber-500' : 'bg-red-500'}`}
                            />
                          </div>
                          <span className="text-xs font-medium w-8 text-right">{pts}pt{pts !== 1 ? 's' : ''}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details">
            <Card className={glassCard}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
                  Per-Question Performance
                </CardTitle>
                <CardDescription>
                  Detailed statistics for each question. Color indicates correctness rate: green (&gt;80%), yellow (50-80%), red (&lt;50%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuestionStatsPanel questions={questions} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
}

// ==========================
// ASSESSMENT LIST VIEW (ENHANCED)
// ==========================
function AssessmentList({
  assessments,
  onEdit,
  onPreview,
  onCreateNew,
  onViewAnalytics,
}: {
  assessments: Assessment[];
  onEdit: (a: Assessment) => void;
  onPreview: (a: Assessment) => void;
  onCreateNew: () => void;
  onViewAnalytics: (a: Assessment) => void;
}) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [quickPreviewId, setQuickPreviewId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  const filtered = assessments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || a.type === typeFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'published' && a.isPublished) ||
      (statusFilter === 'draft' && !a.isPublished);
    return matchesSearch && matchesType && matchesStatus;
  });

  // Simulated stats
  const getSimStats = (a: Assessment) => {
    const seed = a.id.charCodeAt(a.id.length - 1);
    return {
      submissions: 12 + (seed * 7) % 156,
      avgScore: 55 + (seed * 3) % 35,
      passRate: 50 + (seed * 5) % 40,
    };
  };

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    const sa = getSimStats(a);
    const sb = getSimStats(b);
    switch (sortField) {
      case 'name': cmp = a.title.localeCompare(b.title); break;
      case 'date': cmp = a.id.localeCompare(b.id); break;
      case 'submissions': cmp = sa.submissions - sb.submissions; break;
      case 'avgScore': cmp = sa.avgScore - sb.avgScore; break;
    }
    return sortAsc ? cmp : -cmp;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };



  const totalSubmissions = assessments.reduce((s, a) => s + getSimStats(a).submissions, 0);
  const avgScore = Math.round(assessments.reduce((s, a) => s + getSimStats(a).avgScore, 0) / (assessments.length || 1));
  const passRate = Math.round(assessments.reduce((s, a) => s + getSimStats(a).passRate, 0) / (assessments.length || 1));

  return (
    <div className="space-y-6">
      {/* Gradient Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-rose-500 bg-clip-text text-transparent">
            Assessments
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Create and manage quizzes, assignments, and coding challenges</p>
        </div>
        <Button onClick={onCreateNew} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white gap-2 shadow-lg shadow-violet-500/20">
          <Plus className="h-4 w-4" /> Create Assessment
        </Button>
      </div>

      {/* Animated Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Assessments', value: assessments.length, icon: ListChecks, gradient: 'from-violet-500 to-purple-500' },
          { label: 'Total Submissions', value: totalSubmissions, icon: Send, gradient: 'from-emerald-500 to-teal-500' },
          { label: 'Avg Score', value: avgScore, icon: Target, gradient: 'from-amber-500 to-orange-500', suffix: '%' },
          { label: 'Pass Rate', value: passRate, icon: Award, gradient: 'from-rose-500 to-pink-500', suffix: '%' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.1, type: 'spring', stiffness: 200 }}
          >
            <Card className={`${glassCard} overflow-hidden group hover:shadow-xl transition-all duration-300`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    <AnimatedCounter value={stat.value} />
                    {stat.suffix ?? ''}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className={glassCard}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assessments..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="peer_review">Peer Review</SelectItem>
                <SelectItem value="coding">Coding</SelectItem>
                <SelectItem value="file_upload">File Upload</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
              <Button variant={viewMode === 'cards' ? 'default' : 'ghost'} size="sm" className="h-7 px-2.5" onClick={() => setViewMode('cards')}>
                <Layers className="h-3.5 w-3.5" />
              </Button>
              <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="sm" className="h-7 px-2.5" onClick={() => setViewMode('table')}>
                <ListChecks className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-black/5 dark:border-white/5">
            <span className="text-xs text-muted-foreground">Sort by:</span>
            {([
              { field: 'name' as SortField, label: 'Name' },
              { field: 'date' as SortField, label: 'Date' },
              { field: 'submissions' as SortField, label: 'Submissions' },
              { field: 'avgScore' as SortField, label: 'Avg Score' },
            ]).map(s => (
              <Button key={s.field} variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => toggleSort(s.field)}>
                {sortField !== s.field ? <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" /> : sortAsc ? <ArrowUp className="h-3 w-3 text-violet-600" /> : <ArrowDown className="h-3 w-3 text-violet-600" />} {s.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {sorted.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full">
                <Card className={glassCard}>
                  <CardContent className="p-8 text-center">
                    <Search className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-muted-foreground">No assessments found</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              sorted.map((assessment, idx) => {
                const stats = getSimStats(assessment);
                const category = getCourseCategory(assessment.courseId);
                const isQuickPreview = quickPreviewId === assessment.id;
                return (
                  <motion.div
                    key={assessment.id}
                    layout
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05, type: 'spring', stiffness: 180 }}
                  >
                    <Card className={`${glassCard} group hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
                      {/* Gradient top accent */}
                      <div className={`h-1 bg-gradient-to-r ${
                        assessment.type === 'quiz' ? 'from-violet-500 to-purple-500' :
                        assessment.type === 'coding' ? 'from-amber-500 to-orange-500' :
                        assessment.type === 'peer_review' ? 'from-emerald-500 to-teal-500' :
                        'from-rose-500 to-pink-500'
                      }`} />
                      <CardHeader className="pb-2 pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-semibold truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                              {assessment.title || 'Untitled Assessment'}
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5 line-clamp-1">
                              {assessment.description || getCourseTitle(assessment.courseId)}
                            </CardDescription>
                          </div>
                          <StatusBadge isPublished={assessment.isPublished} />
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap mt-2">
                          <AssessmentTypeBadge type={assessment.type} />
                          {category && (
                            <Badge variant="outline" className="text-xs gap-1 bg-slate-50 dark:bg-slate-800/50">
                              <BookOpen className="h-3 w-3" /> {category}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 pb-4">
                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {[
                            { label: 'Submissions', value: stats.submissions, icon: Users },
                            { label: 'Avg Score', value: `${stats.avgScore}%`, icon: Target },
                            { label: 'Pass Rate', value: `${stats.passRate}%`, icon: Award },
                          ].map(s => (
                            <div key={s.label} className="text-center p-2 rounded-lg bg-muted/50">
                              <s.icon className="h-3.5 w-3.5 mx-auto mb-0.5 text-muted-foreground" />
                              <div className="text-sm font-bold">{s.value}</div>
                              <div className="text-[10px] text-muted-foreground">{s.label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1"><HelpCircle className="h-3 w-3" /> {assessment.questions?.length ?? 0} Qs</span>
                          <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {assessment.passingScore}%</span>
                          {assessment.timeLimit && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {assessment.timeLimit}m</span>}
                        </div>

                        {/* Quick preview */}
                        {isQuickPreview && assessment.questions && assessment.questions.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mb-3 overflow-hidden"
                          >
                            <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar p-2 bg-muted/30 rounded-lg">
                              {assessment.questions.map((q, qi) => (
                                <div key={q.id} className="flex items-center gap-2 text-xs">
                                  <span className="font-mono text-muted-foreground">{qi + 1}.</span>
                                  <span className="truncate">{q.question}</span>
                                  <DifficultyBadge difficulty={q.difficulty} />
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setQuickPreviewId(isQuickPreview ? null : assessment.id)}>
                                  {isQuickPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                  {isQuickPreview ? 'Hide' : 'Preview'}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Quick Preview</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => onPreview(assessment)}>
                                  <Play className="h-3.5 w-3.5" /> Take
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Take Quiz Preview</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div className="flex-1" />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onViewAnalytics(assessment)}>
                                  <BarChart3 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Analytics</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(assessment)}>
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card className={glassCard}>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">
                      <Button variant="ghost" size="sm" className="h-6 px-1 text-xs gap-1 -ml-1" onClick={() => toggleSort('name')}>
                        Title {sortField !== 'name' ? <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" /> : sortAsc ? <ArrowUp className="h-3 w-3 text-violet-600" /> : <ArrowDown className="h-3 w-3 text-violet-600" />}
                      </Button>
                    </TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Passing</TableHead>
                    <TableHead className="text-center">
                      <Button variant="ghost" size="sm" className="h-6 px-1 text-xs gap-1" onClick={() => toggleSort('submissions')}>
                        Subs {sortField !== 'submissions' ? <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" /> : sortAsc ? <ArrowUp className="h-3 w-3 text-violet-600" /> : <ArrowDown className="h-3 w-3 text-violet-600" />}
                      </Button>
                    </TableHead>
                    <TableHead className="text-center">
                      <Button variant="ghost" size="sm" className="h-6 px-1 text-xs gap-1" onClick={() => toggleSort('avgScore')}>
                        Avg {sortField !== 'avgScore' ? <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" /> : sortAsc ? <ArrowUp className="h-3 w-3 text-violet-600" /> : <ArrowDown className="h-3 w-3 text-violet-600" />}
                      </Button>
                    </TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-muted-foreground/50" />
                          <span>No assessments found</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sorted.map((assessment, idx) => {
                      const stats = getSimStats(assessment);
                      return (
                        <motion.tr
                          key={assessment.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-semibold text-foreground">{assessment.title}</div>
                              {assessment.description && (
                                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{assessment.description}</div>
                              )}
                              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                <span>{assessment.questions?.length ?? 0} Qs</span>
                                {getCourseCategory(assessment.courseId) && (
                                  <Badge variant="outline" className="text-[10px] px-1 py-0">{getCourseCategory(assessment.courseId)}</Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {getCourseTitle(assessment.courseId)}
                          </TableCell>
                          <TableCell><AssessmentTypeBadge type={assessment.type} /></TableCell>
                          <TableCell className="text-center text-sm">{assessment.passingScore}%</TableCell>
                          <TableCell className="text-center text-sm font-medium">{stats.submissions}</TableCell>
                          <TableCell className="text-center text-sm font-medium">{stats.avgScore}%</TableCell>
                          <TableCell className="text-center text-sm">
                            {assessment.timeLimit ? `${assessment.timeLimit}m` : '—'}
                          </TableCell>
                          <TableCell><StatusBadge isPublished={assessment.isPublished} /></TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onViewAnalytics(assessment)}>
                                      <BarChart3 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Analytics</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPreview(assessment)}>
                                      <Play className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Preview Quiz</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(assessment)}>
                                      <Edit3 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==========================
// ASSESSMENT BUILDER VIEW (ENHANCED)
// ==========================
function AssessmentBuilder({
  assessment,
  onBack,
  onSave,
}: {
  assessment: Assessment;
  onBack: () => void;
  onSave: (a: Assessment) => void;
}) {
  const [form, setForm] = useState<Assessment>({ ...assessment });
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionIdx, setEditingQuestionIdx] = useState<number | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionFormData>(emptyQuestionForm);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [bankTypeFilter, setBankTypeFilter] = useState<string>('all');
  const [bankDiffFilter, setBankDiffFilter] = useState<string>('all');
  const [bankCatFilter, setBankCatFilter] = useState<string>('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const questions = form.questions ?? [];

  const updateField = useCallback(<K extends keyof Assessment>(key: K, value: Assessment[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const openAddQuestion = () => {
    setEditingQuestionIdx(null);
    setQuestionForm(emptyQuestionForm);
    setShowQuestionForm(true);
  };

  const openEditQuestion = (idx: number) => {
    const q = questions[idx];
    if (!q) return;
    setEditingQuestionIdx(idx);
    setQuestionForm({
      type: q.type,
      question: q.question,
      options: q.options ?? (q.type === 'multiple_choice' ? ['', '', '', ''] : []),
      correctAnswer: q.correctAnswer ?? '',
      explanation: q.explanation ?? '',
      points: q.points,
      difficulty: q.difficulty,
      poolGroup: q.poolGroup ?? '',
      timeLimit: 0,
      section: '',
    });
    setShowQuestionForm(true);
  };

  const saveQuestion = () => {
    if (!questionForm.question.trim()) return;
    const newQ: Question = {
      id: editingQuestionIdx !== null ? (questions[editingQuestionIdx]?.id ?? `q-${Date.now()}`) : `q-${Date.now()}`,
      assessmentId: form.id,
      type: questionForm.type,
      question: questionForm.question,
      options: ['multiple_choice', 'true_false'].includes(questionForm.type) ? questionForm.options.filter(o => o.trim()) : undefined,
      correctAnswer: questionForm.correctAnswer,
      explanation: questionForm.explanation || undefined,
      points: questionForm.points,
      orderIndex: editingQuestionIdx !== null ? (questions[editingQuestionIdx]?.orderIndex ?? 0) : questions.length,
      difficulty: questionForm.difficulty,
      poolGroup: questionForm.poolGroup || undefined,
    };

    const updatedQuestions = [...questions];
    if (editingQuestionIdx !== null) {
      updatedQuestions[editingQuestionIdx] = newQ;
    } else {
      updatedQuestions.push(newQ);
    }
    updateField('questions', updatedQuestions);
    setShowQuestionForm(false);
  };

  const deleteQuestion = (idx: number) => {
    const updated = [...questions];
    updated.splice(idx, 1);
    updated.forEach((q, i) => { q.orderIndex = i; });
    updateField('questions', updated);
  };

  const moveQuestion = (from: number, to: number) => {
    if (to < 0 || to >= questions.length) return;
    const updated = [...questions];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    updated.forEach((q, i) => { q.orderIndex = i; });
    updateField('questions', updated);
  };

  const importFromBank = (bankQ: QuestionBankItem) => {
    const newQ: Question = {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      assessmentId: form.id,
      type: bankQ.type,
      question: bankQ.question,
      options: bankQ.options,
      correctAnswer: bankQ.correctAnswer,
      explanation: bankQ.explanation,
      points: bankQ.points,
      orderIndex: questions.length,
      difficulty: bankQ.difficulty,
      poolGroup: bankQ.poolGroup || undefined,
    };
    updateField('questions', [...questions, newQ]);
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const estimatedTime = questions.reduce((sum, q) => {
    const base = q.type === 'coding' ? 5 : q.type === 'long_answer' ? 4 : q.type === 'short_answer' ? 2 : 1;
    const diffMultiplier = q.difficulty === 'hard' ? 1.5 : q.difficulty === 'easy' ? 0.8 : 1;
    return sum + Math.round(base * diffMultiplier);
  }, 0);

  // Group questions by section (poolGroup)
  const sections = useMemo(() => {
    const sectionMap: Record<string, Question[]> = {};
    const ungrouped: Question[] = [];
    questions.forEach(q => {
      if (q.poolGroup) {
        sectionMap[q.poolGroup] = sectionMap[q.poolGroup] || [];
        sectionMap[q.poolGroup].push(q);
      } else {
        ungrouped.push(q);
      }
    });
    return { sectionMap, ungrouped };
  }, [questions]);

  // Question bank filter
  const filteredBank = useMemo(() => {
    return questionBank.filter(q => {
      const matchSearch = q.question.toLowerCase().includes(bankSearch.toLowerCase()) ||
        q.category.toLowerCase().includes(bankSearch.toLowerCase());
      const matchType = bankTypeFilter === 'all' || q.type === bankTypeFilter;
      const matchDiff = bankDiffFilter === 'all' || q.difficulty === bankDiffFilter;
      const matchCat = bankCatFilter === 'all' || q.category === bankCatFilter;
      return matchSearch && matchType && matchDiff && matchCat;
    });
  }, [bankSearch, bankTypeFilter, bankDiffFilter, bankCatFilter]);

  const categories = [...new Set(questionBank.map(q => q.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-rose-500 bg-clip-text text-transparent">
              Assessment Builder
            </h2>
            <p className="text-sm text-muted-foreground">{form.title || 'New Assessment'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Cancel
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => onSave({ ...form, isPublished: false })}>
            <Save className="h-4 w-4" /> Save Draft
          </Button>
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white gap-2 shadow-lg shadow-emerald-500/20" onClick={() => onSave({ ...form, isPublished: true })}>
            <Send className="h-4 w-4" /> Publish
          </Button>
        </div>
      </div>

      {/* Summary Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-xl ${glassCard} flex flex-wrap items-center gap-4`}
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <HelpCircle className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold">{questions.length}</div>
            <div className="text-xs text-muted-foreground">Questions</div>
          </div>
        </div>
        <Separator orientation="vertical" className="h-8" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Target className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold">{totalPoints}</div>
            <div className="text-xs text-muted-foreground">Total Points</div>
          </div>
        </div>
        <Separator orientation="vertical" className="h-8" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Clock className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold">~{estimatedTime}m</div>
            <div className="text-xs text-muted-foreground">Est. Time</div>
          </div>
        </div>
        <Separator orientation="vertical" className="h-8" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
            <Target className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold">{form.passingScore}%</div>
            <div className="text-xs text-muted-foreground">Pass Score</div>
          </div>
        </div>
        <div className="flex-1" />
        <StatusBadge isPublished={form.isPublished} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Settings */}
        <div className="lg:col-span-1 space-y-4">
          <Card className={`${glassCard} group`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <Settings2 className="h-3.5 w-3.5 text-white" />
                </div>
                Assessment Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="Assessment title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={form.description ?? ''} onChange={e => updateField('description', e.target.value)} placeholder="Describe this assessment" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Course</Label>
                <Select value={form.courseId} onValueChange={v => updateField('courseId', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {demoCourses.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => updateField('type', v as Assessment['type'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="peer_review">Peer Review</SelectItem>
                    <SelectItem value="coding">Coding</SelectItem>
                    <SelectItem value="file_upload">File Upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="passingScore" className="flex items-center gap-1">
                    <Target className="h-3 w-3" /> Passing Score
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input id="passingScore" type="number" min={0} max={100} value={form.passingScore} onChange={e => updateField('passingScore', Number(e.target.value))} />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAttempts" className="flex items-center gap-1">
                    <RotateCcw className="h-3 w-3" /> Max Attempts
                  </Label>
                  <Input id="maxAttempts" type="number" min={1} max={10} value={form.maxAttempts} onChange={e => updateField('maxAttempts', Number(e.target.value))} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeLimit" className="flex items-center gap-1">
                  <Timer className="h-3 w-3" /> Time Limit (minutes)
                </Label>
                <Input id="timeLimit" type="number" min={0} placeholder="0 = no limit" value={form.timeLimit ?? ''} onChange={e => updateField('timeLimit', e.target.value ? Number(e.target.value) : undefined)} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="shuffle" className="flex items-center gap-1">
                  <Shuffle className="h-3 w-3" /> Shuffle Questions
                </Label>
                <Switch id="shuffle" checked={form.shuffleQuestions} onCheckedChange={v => updateField('shuffleQuestions', v)} />
              </div>
            </CardContent>
          </Card>

          {/* Summary card */}
          <Card className={glassCard}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" /> Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Questions</span>
                <span className="font-medium">{questions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Points</span>
                <span className="font-medium">{totalPoints}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Est. Time</span>
                <span className="font-medium">~{estimatedTime} min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Passing Score</span>
                <span className="font-medium">{form.passingScore}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge isPublished={form.isPublished} />
              </div>
              <Separator />
              {/* Difficulty breakdown */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">Difficulty Breakdown</div>
                {['easy', 'medium', 'hard'].map(d => {
                  const count = questions.filter(q => q.difficulty === d).length;
                  const pct = questions.length ? (count / questions.length) * 100 : 0;
                  return (
                    <div key={d} className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs capitalize w-14">{d}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6 }}
                          className={`h-full rounded-full ${d === 'easy' ? 'bg-emerald-500' : d === 'medium' ? 'bg-amber-500' : 'bg-red-500'}`}
                        />
                      </div>
                      <span className="text-xs font-medium w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Questions */}
        <div className="lg:col-span-2 space-y-4">
          <Card className={glassCard}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                    <HelpCircle className="h-3.5 w-3.5 text-white" />
                  </div>
                  Questions ({questions.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowQuestionBank(true)} className="gap-1.5">
                    <Database className="h-4 w-4" /> Import from Bank
                  </Button>
                  <Button size="sm" onClick={openAddQuestion} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white gap-1 shadow-lg shadow-violet-500/20">
                    <Plus className="h-4 w-4" /> Add Question
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <HelpCircle className="h-12 w-12 mb-3 opacity-30" />
                  </motion.div>
                  <p className="text-sm">No questions yet</p>
                  <p className="text-xs mt-1">Click &quot;Add Question&quot; or &quot;Import from Bank&quot; to start building</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Grouped sections */}
                  {Object.entries(sections.sectionMap).map(([sectionName, sectionQuestions]) => {
                    const isExpanded = expandedSections[sectionName] !== false;
                    return (
                      <div key={sectionName} className="border border-dashed border-violet-300 dark:border-violet-700 rounded-lg overflow-hidden">
                        <button
                          className="w-full flex items-center gap-2 p-2.5 bg-violet-50 dark:bg-violet-950/20 text-sm font-medium text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-950/30 transition-colors"
                          onClick={() => setExpandedSections(prev => ({ ...prev, [sectionName]: !isExpanded }))}
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                          <Layers className="h-4 w-4" />
                          {sectionName}
                          <Badge variant="outline" className="text-[10px] ml-1">{sectionQuestions.length} Qs</Badge>
                        </button>
                        {isExpanded && (
                          <div className="p-2 space-y-1.5">
                            {sectionQuestions.map((q) => {
                              const idx = questions.findIndex(x => x.id === q.id);
                              return (
                                <QuestionRow key={q.id} q={q} idx={idx} dragIdx={dragIdx} setDragIdx={setDragIdx} moveQuestion={moveQuestion} openEditQuestion={openEditQuestion} deleteQuestion={deleteQuestion} />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Ungrouped questions */}
                  {sections.ungrouped.length > 0 && (
                    Object.keys(sections.sectionMap).length > 0 ? (
                      <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
                        <button
                          className="w-full flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/20 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/30 transition-colors"
                          onClick={() => setExpandedSections(prev => ({ ...prev, _ungrouped: prev._ungrouped === false }))}
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections._ungrouped !== false ? '' : '-rotate-90'}`} />
                          Unassigned
                          <Badge variant="outline" className="text-[10px] ml-1">{sections.ungrouped.length} Qs</Badge>
                        </button>
                        {expandedSections._ungrouped !== false && (
                          <div className="p-2 space-y-1.5">
                            {sections.ungrouped.map((q) => {
                              const idx = questions.findIndex(x => x.id === q.id);
                              return (
                                <QuestionRow key={q.id} q={q} idx={idx} dragIdx={dragIdx} setDragIdx={setDragIdx} moveQuestion={moveQuestion} openEditQuestion={openEditQuestion} deleteQuestion={deleteQuestion} />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      sections.ungrouped.map((q) => {
                        const idx = questions.findIndex(x => x.id === q.id);
                        return (
                          <QuestionRow key={q.id} q={q} idx={idx} dragIdx={dragIdx} setDragIdx={setDragIdx} moveQuestion={moveQuestion} openEditQuestion={openEditQuestion} deleteQuestion={deleteQuestion} />
                        );
                      })
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Question Form Dialog */}
      <Dialog open={showQuestionForm} onOpenChange={setShowQuestionForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestionIdx !== null ? 'Edit Question' : 'Add Question'}</DialogTitle>
            <DialogDescription>
              {editingQuestionIdx !== null ? 'Modify the question details below.' : 'Fill in the question details below.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select value={questionForm.type} onValueChange={v => {
                  const t = v as Question['type'];
                  setQuestionForm(prev => ({
                    ...prev,
                    type: t,
                    options: t === 'multiple_choice' ? (prev.options.length > 0 ? prev.options : ['', '', '', '']) :
                             t === 'true_false' ? ['True', 'False'] : [],
                    correctAnswer: t === 'true_false' ? '' : prev.correctAnswer,
                  }));
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True / False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                    <SelectItem value="long_answer">Long Answer</SelectItem>
                    <SelectItem value="coding">Coding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={questionForm.difficulty} onValueChange={v => setQuestionForm(prev => ({ ...prev, difficulty: v as Question['difficulty'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Question Text</Label>
              <Textarea
                value={questionForm.question}
                onChange={e => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Enter your question..."
                rows={3}
              />
            </div>

            {/* Options for multiple choice */}
            {questionForm.type === 'multiple_choice' && (
              <div className="space-y-3">
                <Label>Answer Options</Label>
                {questionForm.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${questionForm.correctAnswer === String(i) ? 'border-emerald-500 bg-emerald-500' : 'border-muted-foreground/30'}`}
                      onClick={() => setQuestionForm(prev => ({ ...prev, correctAnswer: String(i) }))}
                    >
                      {questionForm.correctAnswer === String(i) && <div className="h-2 w-2 rounded-full bg-card" />}
                    </div>
                    <Input
                      value={opt}
                      onChange={e => {
                        const updated = [...questionForm.options];
                        updated[i] = e.target.value;
                        setQuestionForm(prev => ({ ...prev, options: updated }));
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1"
                    />
                    {questionForm.options.length > 2 && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => {
                        const updated = questionForm.options.filter((_, idx) => idx !== i);
                        setQuestionForm(prev => ({ ...prev, options: updated, correctAnswer: prev.correctAnswer === String(i) ? '' : prev.correctAnswer }));
                      }}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setQuestionForm(prev => ({ ...prev, options: [...prev.options, ''] }))} className="gap-1">
                  <Plus className="h-3 w-3" /> Add Option
                </Button>
              </div>
            )}

            {/* True/False selector */}
            {questionForm.type === 'true_false' && (
              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <div className="flex gap-3">
                  {['True', 'False'].map(ans => (
                    <Button
                      key={ans}
                      variant={questionForm.correctAnswer === ans ? 'default' : 'outline'}
                      className={questionForm.correctAnswer === ans ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                      onClick={() => setQuestionForm(prev => ({ ...prev, correctAnswer: ans }))}
                    >
                      {ans === 'True' ? <CheckCircle2 className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                      {ans}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Short answer / coding correct answer */}
            {(questionForm.type === 'short_answer' || questionForm.type === 'coding') && (
              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <Input
                  value={questionForm.correctAnswer}
                  onChange={e => setQuestionForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                  placeholder="Expected answer"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Explanation (optional)</Label>
              <Textarea
                value={questionForm.explanation}
                onChange={e => setQuestionForm(prev => ({ ...prev, explanation: e.target.value }))}
                placeholder="Explain why this is the correct answer..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Points</Label>
                <Input type="number" min={1} max={100} value={questionForm.points} onChange={e => setQuestionForm(prev => ({ ...prev, points: Number(e.target.value) || 1 }))} />
              </div>
              <div className="space-y-2">
                <Label>Time Limit (seconds, 0 = none)</Label>
                <Input type="number" min={0} value={questionForm.timeLimit} onChange={e => setQuestionForm(prev => ({ ...prev, timeLimit: Number(e.target.value) || 0 }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Section / Pool Group (optional)</Label>
                <Input
                  value={questionForm.poolGroup}
                  onChange={e => setQuestionForm(prev => ({ ...prev, poolGroup: e.target.value }))}
                  placeholder="e.g. Module 1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionForm(false)}>Cancel</Button>
            <Button onClick={saveQuestion} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white" disabled={!questionForm.question.trim()}>
              {editingQuestionIdx !== null ? 'Save Changes' : 'Add Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Bank Dialog */}
      <Dialog open={showQuestionBank} onOpenChange={setShowQuestionBank}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-violet-600" /> Question Bank
            </DialogTitle>
            <DialogDescription>Browse and import questions from the question bank</DialogDescription>
          </DialogHeader>

          {/* Bank filters */}
          <div className="flex flex-wrap gap-2 pb-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={bankSearch}
                onChange={e => setBankSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={bankTypeFilter} onValueChange={setBankTypeFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="true_false">True / False</SelectItem>
                <SelectItem value="short_answer">Short Answer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bankDiffFilter} onValueChange={setBankDiffFilter}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bankCatFilter} onValueChange={setBankCatFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Bank questions list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
            {filteredBank.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No matching questions found</p>
              </div>
            ) : (
              filteredBank.map((bq, i) => (
                <motion.div
                  key={bq.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-3 rounded-lg border border-border hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <QuestionTypeBadge type={bq.type} />
                        <DifficultyBadge difficulty={bq.difficulty} />
                        <Badge variant="outline" className="text-[10px] bg-slate-50 dark:bg-slate-800/50">{bq.category}</Badge>
                      </div>
                      <p className="text-sm font-medium">{bq.question}</p>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {bq.timesAnswered} answered</span>
                        <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {bq.correctPercent}% correct</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {bq.avgTimeSeconds}s avg</span>
                        <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> DI: {bq.discriminationIndex}</span>
                      </div>
                      {bq.type === 'multiple_choice' && bq.options && (
                        <div className="grid grid-cols-2 gap-1 mt-2">
                          {bq.options.map((opt, oi) => (
                            <div key={oi} className={`text-xs px-2 py-1 rounded ${String(oi) === bq.correctAnswer ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                              {String(oi) === bq.correctAnswer && '✓ '}{opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0 gap-1" onClick={() => importFromBank(bq)}>
                      <Plus className="h-3.5 w-3.5" /> Import
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionBank(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- Question Row Component for Builder ----
function QuestionRow({
  q, idx, dragIdx, setDragIdx, moveQuestion, openEditQuestion, deleteQuestion,
}: {
  q: Question; idx: number; dragIdx: number | null;
  setDragIdx: (i: number | null) => void;
  moveQuestion: (from: number, to: number) => void;
  openEditQuestion: (i: number) => void;
  deleteQuestion: (i: number) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.02 }}
      className={`flex items-start gap-2 p-3 rounded-lg border transition-all hover:shadow-sm ${dragIdx === idx ? 'border-violet-400 bg-violet-50 dark:bg-violet-950/20 shadow-md' : 'border-border hover:bg-muted/50'}`}
      draggable
      onDragStart={() => setDragIdx(idx)}
      onDragOver={e => e.preventDefault()}
      onDrop={() => {
        if (dragIdx !== null && dragIdx !== idx) moveQuestion(dragIdx, idx);
        setDragIdx(null);
      }}
      onDragEnd={() => setDragIdx(null)}
    >
      <div className="flex items-center gap-2 pt-0.5">
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
        <span className="text-xs font-mono text-muted-foreground w-5">{idx + 1}.</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <QuestionTypeBadge type={q.type} />
          <span className="text-sm font-medium truncate">{q.question}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DifficultyBadge difficulty={q.difficulty} />
          <Badge variant="outline" className="text-xs">{q.points} pt{q.points !== 1 ? 's' : ''}</Badge>
          {q.poolGroup && <Badge variant="outline" className="text-xs text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800">Section: {q.poolGroup}</Badge>}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditQuestion(idx)}>
                <Edit3 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => deleteQuestion(idx)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  );
}

// ==========================
// QUIZ TAKING PREVIEW (ENHANCED)
// ==========================
function QuizPreview({
  assessment,
  onClose,
}: {
  assessment: Assessment;
  onClose: () => void;
}) {
  const questions = assessment.questions ?? [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(assessment.timeLimit ? assessment.timeLimit * 60 : null);
  const [showStudentView, setShowStudentView] = useState(true);
  const [showExplanations, setShowExplanations] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setSubmitted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, submitted]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx];
  if (!currentQ) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>No Questions</DialogTitle>
            <DialogDescription>This assessment has no questions to preview.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitted(true);
  };

  let score = 0;
  let maxScore = 0;
  if (submitted) {
    questions.forEach(q => {
      maxScore += q.points;
      if (answers[q.id] === q.correctAnswer) score += q.points;
    });
  }

  const answeredCount = Object.keys(answers).length;
  const progressPct = questions.length ? (answeredCount / questions.length) * 100 : 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex h-full">
          {/* Question Navigation Sidebar */}
          <div className="w-56 border-r border-border bg-muted/30 flex flex-col">
            <div className="p-3 border-b border-border">
              <h3 className="text-sm font-semibold truncate">{assessment.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{questions.length} Questions</p>
            </div>

            {/* Timer */}
            {timeLeft !== null && (
              <div className="p-3 border-b border-border">
                <div className={`text-center py-2 px-3 rounded-lg text-sm font-mono font-bold ${
                  timeLeft < 60 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse' :
                  timeLeft < 180 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  <Clock className="h-3.5 w-3.5 inline mr-1.5" />
                  {formatTime(timeLeft)}
                </div>
              </div>
            )}

            {/* Progress */}
            <div className="px-3 py-2 border-b border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{answeredCount}/{questions.length}</span>
              </div>
              <Progress value={progressPct} className="h-1.5" />
            </div>

            {/* Question grid */}
            <ScrollArea className="flex-1">
              <div className="p-3 grid grid-cols-4 gap-1.5">
                {questions.map((q, i) => {
                  const isAnswered = !!answers[q.id];
                  const isCurrent = i === currentIdx;
                  const isCorrect = submitted && answers[q.id] === q.correctAnswer;
                  const isWrong = submitted && answers[q.id] && answers[q.id] !== q.correctAnswer;
                  return (
                    <TooltipProvider key={q.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setCurrentIdx(i)}
                            className={`h-8 w-8 rounded-md text-xs font-medium flex items-center justify-center transition-all hover:scale-110 ${
                              isCurrent ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' :
                              isCorrect ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                              isWrong ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              isAnswered ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                              'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            {i + 1}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[200px]">
                          <p className="text-xs truncate">{q.question}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </ScrollArea>

            {/* View Mode Toggle */}
            <div className="p-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs"
                onClick={() => setShowStudentView(!showStudentView)}
              >
                {showStudentView ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {showStudentView ? 'Student View' : 'Admin View'}
              </Button>
              {submitted && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-xs mt-1.5"
                  onClick={() => setShowExplanations(!showExplanations)}
                >
                  {showExplanations ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showExplanations ? 'Hide Explanations' : 'Show Explanations'}
                </Button>
              )}
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-border bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">{assessment.title}</h2>
                  {assessment.description && <p className="text-xs text-muted-foreground mt-0.5">{assessment.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs gap-1">
                    <HelpCircle className="h-3 w-3" /> Q{currentIdx + 1}/{questions.length}
                  </Badge>
                  {!showStudentView && currentQ && (
                    <div className="flex items-center gap-1.5">
                      <QuestionTypeBadge type={currentQ.type} />
                      <DifficultyBadge difficulty={currentQ.difficulty} />
                    </div>
                  )}
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Question {currentIdx + 1} of {questions.length}</span>
                  <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}% navigated</span>
                </div>
                <Progress value={((currentIdx + 1) / questions.length) * 100} className="h-1.5" />
              </div>
            </div>

            {/* Question content */}
            <div className="flex-1 p-4">
              {!submitted ? (
                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Admin info (hidden in student view) */}
                  {!showStudentView && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs">
                      <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-amber-700 dark:text-amber-400">Admin View — Correct answer: <strong>{currentQ.type === 'multiple_choice' ? (currentQ.options?.[Number(currentQ.correctAnswer)] ?? currentQ.correctAnswer) : currentQ.correctAnswer || 'N/A'}</strong></span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {showStudentView && <TypeIcon type={currentQ.type} className="h-4 w-4 text-violet-600" />}
                    {showStudentView && <DifficultyBadge difficulty={currentQ.difficulty} />}
                    <Badge variant="outline" className="text-xs">{currentQ.points} pt{currentQ.points !== 1 ? 's' : ''}</Badge>
                  </div>
                  <h3 className="text-base font-semibold">{currentQ.question}</h3>

                  {/* Multiple choice */}
                  {currentQ.type === 'multiple_choice' && currentQ.options && (
                    <div className="space-y-2">
                      {currentQ.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: String(i) }))}
                          className={`w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3 ${
                            answers[currentQ.id] === String(i)
                              ? 'border-violet-400 bg-violet-50 dark:bg-violet-950/20 shadow-sm'
                              : 'border-border hover:bg-muted/50 hover:border-violet-200 dark:hover:border-violet-800'
                          }`}
                        >
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            answers[currentQ.id] === String(i) ? 'border-violet-500 bg-violet-500' : 'border-muted-foreground/30'
                          }`}>
                            {answers[currentQ.id] === String(i) && <div className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                          <span className="text-sm">{opt}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* True/False */}
                  {currentQ.type === 'true_false' && (
                    <div className="flex gap-3">
                      {['True', 'False'].map(ans => (
                        <button
                          key={ans}
                          onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: ans }))}
                          className={`flex-1 p-4 rounded-lg border transition-all flex items-center justify-center gap-2 font-medium ${
                            answers[currentQ.id] === ans
                              ? ans === 'True'
                                ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 shadow-sm'
                                : 'border-red-400 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 shadow-sm'
                              : 'border-border hover:bg-muted/50'
                          }`}
                        >
                          {ans === 'True' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                          {ans}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Short answer / coding */}
                  {(currentQ.type === 'short_answer' || currentQ.type === 'coding') && (
                    <div className="space-y-2">
                      <Input
                        value={answers[currentQ.id] ?? ''}
                        onChange={e => setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                        placeholder={currentQ.type === 'coding' ? 'Enter your code...' : 'Type your answer...'}
                      />
                    </div>
                  )}

                  {/* Long answer */}
                  {currentQ.type === 'long_answer' && (
                    <Textarea
                      value={answers[currentQ.id] ?? ''}
                      onChange={e => setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                      placeholder="Write your detailed answer..."
                      rows={5}
                    />
                  )}
                </motion.div>
              ) : (
                /* Submitted results */
                <div className="space-y-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`p-6 rounded-xl text-center ${
                      score / maxScore * 100 >= assessment.passingScore
                        ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20'
                        : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20'
                    }`}
                  >
                    <div className="text-4xl font-bold mb-1">
                      {score}/{maxScore}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {Math.round(score / maxScore * 100)}% — {score / maxScore * 100 >= assessment.passingScore ? 'Passed! 🎉' : 'Not Passed'}
                    </div>
                    <div className="text-xs text-muted-foreground">Passing score: {assessment.passingScore}%</div>
                  </motion.div>

                  {questions.map((q, i) => {
                    const isCorrect = answers[q.id] === q.correctAnswer;
                    return (
                      <motion.div
                        key={q.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`p-3 rounded-lg border transition-all ${
                          isCorrect
                            ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/10'
                            : 'border-red-300 bg-red-50/50 dark:bg-red-950/10'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {isCorrect ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" /> : <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-mono text-muted-foreground">Q{i + 1}</span>
                              <QuestionTypeBadge type={q.type} />
                            </div>
                            <p className="text-sm font-medium">{q.question}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Your answer: {q.type === 'multiple_choice' ? (q.options?.[Number(answers[q.id])] ?? answers[q.id]) : answers[q.id] || 'No answer'}
                            </p>
                            {!isCorrect && q.correctAnswer && (
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                                Correct: {q.type === 'multiple_choice' ? (q.options?.[Number(q.correctAnswer)] ?? q.correctAnswer) : q.correctAnswer}
                              </p>
                            )}
                            {showExplanations && q.explanation && (
                              <motion.p
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="text-xs text-muted-foreground mt-1 italic bg-muted/50 p-2 rounded"
                              >
                                💡 {q.explanation}
                              </motion.p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer navigation */}
            <div className="p-4 border-t border-border flex items-center justify-between">
              {!submitted ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                    disabled={currentIdx === 0}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    {answeredCount} of {questions.length} answered
                  </div>
                  {currentIdx < questions.length - 1 ? (
                    <Button onClick={() => setCurrentIdx(currentIdx + 1)} className="gap-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} className="gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20">
                      Submit Quiz
                    </Button>
                  )}
                </>
              ) : (
                <Button onClick={onClose} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
                  Close Preview
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==========================
// MAIN COMPONENT
// ==========================
export function AdminAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>(demoAssessments);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [previewAssessment, setPreviewAssessment] = useState<Assessment | null>(null);
  const [analyticsAssessment, setAnalyticsAssessment] = useState<Assessment | null>(null);

  const handleEdit = (a: Assessment) => {
    setSelectedAssessment({ ...a, questions: a.questions?.map(q => ({ ...q })) });
    setViewMode('builder');
  };

  const handleCreateNew = () => {
    const newAssessment: Assessment = {
      id: `assess-${Date.now()}`,
      courseId: demoCourses[0].id,
      tenantId: 'demo-tenant-1',
      title: '',
      description: '',
      type: 'quiz',
      passingScore: 70,
      maxAttempts: 3,
      timeLimit: 30,
      isPublished: false,
      shuffleQuestions: false,
      questions: [],
    };
    setSelectedAssessment(newAssessment);
    setViewMode('builder');
  };

  const handleSave = (a: Assessment) => {
    const idx = assessments.findIndex(x => x.id === a.id);
    if (idx >= 0) {
      const updated = [...assessments];
      updated[idx] = a;
      setAssessments(updated);
    } else {
      setAssessments(prev => [...prev, a]);
    }
    setViewMode('list');
    setSelectedAssessment(null);
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedAssessment(null);
    setAnalyticsAssessment(null);
  };

  return (
    <div className="p-6">
      <AnimatePresence mode="wait">
        {viewMode === 'list' && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AssessmentList
              assessments={assessments}
              onEdit={handleEdit}
              onPreview={a => setPreviewAssessment(a)}
              onCreateNew={handleCreateNew}
              onViewAnalytics={a => setAnalyticsAssessment(a)}
            />
          </motion.div>
        )}
        {viewMode === 'builder' && selectedAssessment && (
          <motion.div key="builder" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <AssessmentBuilder
              assessment={selectedAssessment}
              onBack={handleBack}
              onSave={handleSave}
            />
          </motion.div>
        )}
        {viewMode === 'analytics' && analyticsAssessment && (
          <motion.div key="analytics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <QuestionDifficultyAnalysis
              assessment={analyticsAssessment}
              onClose={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {previewAssessment && (
        <QuizPreview
          assessment={previewAssessment}
          onClose={() => setPreviewAssessment(null)}
        />
      )}
    </div>
  );
}
