'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { learnerKPIs, demoEnrollments, demoCourses, leaderboardData } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  GraduationCap,
  Flame,
  Star,
  Award,
  MessageCircle,
  Play,
  Trophy,
  Clock,
  CheckCircle2,
  Download,
  Sparkles,
  ArrowRight,
  Zap,
  TrendingUp,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardKPI } from '@/types';

// Map icon string from KPI data to lucide component
function getKPIIcon(iconName: string) {
  const iconMap: Record<string, React.ElementType> = {
    'book-open': BookOpen,
    'graduation-cap': GraduationCap,
    flame: Flame,
    star: Star,
    award: Award,
    'message-circle': MessageCircle,
  };
  return iconMap[iconName] || Star;
}

// Color map for KPI cards
function getKPIColor(iconName: string) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    'book-open': { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
    'graduation-cap': { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/20' },
    flame: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' },
    star: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' },
    award: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
    'message-circle': { bg: 'bg-sky-500/10', text: 'text-sky-500', border: 'border-sky-500/20' },
  };
  return colorMap[iconName] || { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20' };
}

// Course color accent by category
function getCourseAccent(category?: string) {
  const accents: Record<string, string> = {
    'Web Development': 'from-emerald-600 to-emerald-800',
    'AI & ML': 'from-violet-600 to-violet-800',
    'Data Science': 'from-sky-600 to-sky-800',
    Design: 'from-pink-600 to-pink-800',
    Business: 'from-amber-600 to-amber-800',
    Marketing: 'from-rose-600 to-rose-800',
  };
  return accents[category || ''] || 'from-slate-600 to-slate-800';
}

// Relative time helper
function getRelativeTime(dateStr?: string) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Animated progress bar with shimmer
function AnimatedProgress({ value, className }: { value: number; className?: string }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700', className)}>
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 overflow-hidden"
        initial={{ width: 0 }}
        animate={{ width: `${animatedValue}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
            animate={{ x: ['-100%', '500%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 1.5 }}
          />
        </div>
      </motion.div>
    </div>
  );
}

// ─── Streak Fire Effect ──────────────────────────────────────
function StreakFireBadge({ days }: { days: number }) {
  return (
    <div className="relative inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 dark:bg-orange-950/40">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          filter: [
            'brightness(1) drop-shadow(0 0 0px transparent)',
            'brightness(1.3) drop-shadow(0 0 8px rgba(249, 115, 22, 0.6))',
            'brightness(1) drop-shadow(0 0 0px transparent)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Flame className="h-4 w-4 text-orange-500" />
      </motion.div>
      <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
        {days} day streak
      </span>
      {/* Glow effect behind badge */}
      <motion.div
        className="absolute inset-0 rounded-full bg-orange-400/20 blur-md -z-10"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

// ─── Daily Goal Progress Ring ────────────────────────────────
function DailyGoalRing({ percentage, minutes, goal }: { percentage: number; minutes: number; goal: number }) {
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercent(percentage), 200);
    return () => clearTimeout(timer);
  }, [percentage]);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercent / 100) * circumference;

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Target className="h-4 w-4 text-emerald-500" />
          Daily Goal
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center pb-4">
        <div className="relative">
          <svg width="100" height="100" className="-rotate-90">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-slate-200 dark:text-slate-700"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="url(#goalGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            />
            <defs>
              <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-foreground">{percentage}%</span>
            <span className="text-[10px] text-muted-foreground">complete</span>
          </div>
        </div>
        <div className="mt-3 text-center">
          <p className="text-sm text-foreground font-medium">
            {minutes} of {goal} min
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {percentage >= 100 ? 'Goal reached! 🎉' : `${goal - minutes} min to go`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Parallax Tilt Card ─────────────────────────────────────
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxTilt = 5;
    const newRotateX = ((y - centerY) / centerY) * -maxTilt;
    const newRotateY = ((x - centerX) / centerX) * maxTilt;
    setRotateX(newRotateX);
    setRotateY(newRotateY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.15s ease-out',
      }}
    >
      {children}
    </div>
  );
}

// Activity feed items
const activityItems = [
  {
    id: 'act-1',
    type: 'lesson' as const,
    icon: CheckCircle2,
    color: 'text-emerald-500',
    title: 'Completed Lesson: Server Components Architecture',
    time: '2 hours ago',
  },
  {
    id: 'act-2',
    type: 'achievement' as const,
    icon: Trophy,
    color: 'text-yellow-500',
    title: 'Earned Achievement: Streak Starter 🔥',
    time: '5 hours ago',
  },
  {
    id: 'act-3',
    type: 'community' as const,
    icon: MessageCircle,
    color: 'text-sky-500',
    title: 'Posted in Community: How do you handle state management in large Next.js apps?',
    time: '1 day ago',
  },
  {
    id: 'act-4',
    type: 'quiz' as const,
    icon: Zap,
    color: 'text-violet-500',
    title: 'Quiz Score: 92% on React Fundamentals',
    time: '1 day ago',
  },
  {
    id: 'act-5',
    type: 'lesson' as const,
    icon: Play,
    color: 'text-emerald-500',
    title: 'Started Lesson: Prompt Engineering Mastery',
    time: '2 days ago',
  },
  {
    id: 'act-6',
    type: 'achievement' as const,
    icon: Sparkles,
    color: 'text-orange-500',
    title: 'Reached 1,000 points milestone!',
    time: '3 days ago',
  },
];

// Section animation wrapper
function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

export function LearnerDashboard() {
  const { currentUser } = useAppStore();
  const [showAllActivities, setShowAllActivities] = useState(false);

  const firstName = currentUser?.name?.split(' ')[0] || 'Learner';
  const streakDays = currentUser?.streakDays || 7;

  // Filter enrollments
  const activeEnrollments = demoEnrollments.filter((e) => e.status === 'active');
  const completedEnrollments = demoEnrollments.filter((e) => e.status === 'completed');

  // Most recently accessed course
  const mostRecentEnrollment = [...activeEnrollments].sort((a, b) => {
    const aTime = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
    const bTime = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
    return bTime - aTime;
  })[0];

  // Courses not enrolled in
  const enrolledCourseIds = new Set(demoEnrollments.map((e) => e.courseId));
  const recommendedCourses = demoCourses.filter((c) => !enrolledCourseIds.has(c.id));

  // Leaderboard top 5
  const topFive = leaderboardData.slice(0, 5);

  // Daily goal data
  const dailyMinutes = 22;
  const dailyGoal = 30;
  const dailyPercent = Math.round((dailyMinutes / dailyGoal) * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
        {/* ============ WELCOME HEADER ============ */}
        <Section delay={0}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 sm:text-3xl">
                Welcome back, {firstName}! 👋
              </h1>
              <div className="mt-2 flex items-center gap-3">
                <StreakFireBadge days={streakDays} />
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 dark:bg-emerald-950/40">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    340 pts this week
                  </span>
                </div>
              </div>
            </div>
            {mostRecentEnrollment && (
              <Button
                size="lg"
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                onClick={() => {}}
              >
                <Play className="h-4 w-4" />
                Resume Learning
              </Button>
            )}
          </div>
        </Section>

        {/* ============ KPI STATS ROW ============ */}
        <Section delay={0.05}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {learnerKPIs.map((kpi: DashboardKPI, i: number) => {
              const Icon = getKPIIcon(kpi.icon);
              const colors = getKPIColor(kpi.icon);
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.05 * i }}
                >
                  <Card className={cn(
                    'relative overflow-hidden border transition-shadow hover:shadow-md',
                    colors.border
                  )}>
                    <CardContent className="p-4">
                      <div className={cn('mb-3 flex h-9 w-9 items-center justify-center rounded-lg', colors.bg)}>
                        <Icon className={cn('h-4 w-4', colors.text)} />
                      </div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{kpi.value}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{kpi.label}</p>
                      <div className="mt-2 flex items-center gap-1">
                        <span className={cn(
                          'text-xs font-medium',
                          kpi.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                        )}>
                          {kpi.change >= 0 ? '+' : ''}{kpi.change}
                        </span>
                        <span className="text-xs text-muted-foreground">{kpi.changeLabel}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </Section>

        {/* ============ CONTINUE LEARNING SECTION ============ */}
        {activeEnrollments.length > 0 && (
          <Section delay={0.1}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <Play className="h-5 w-5 text-emerald-500" />
                Continue Learning
              </h2>
              <Badge variant="secondary" className="text-xs">
                {activeEnrollments.length} active
              </Badge>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
              {activeEnrollments.map((enrollment, i) => (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                  className="min-w-[280px] sm:min-w-[320px]"
                >
                  <TiltCard>
                    <Card className="overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow group">
                      {/* Course colored header */}
                      <div className={cn(
                        'bg-gradient-to-r p-4 h-20 flex items-end',
                        getCourseAccent(enrollment.course?.category)
                      )}>
                        <div className="flex w-full items-center justify-between">
                          <Badge className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm">
                            {enrollment.course?.level}
                          </Badge>
                          <span className="text-xs text-white/70">
                            {enrollment.course?.durationHours}h
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-50 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {enrollment.course?.title}
                        </h3>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{enrollment.progress}%</span>
                          </div>
                          <AnimatedProgress value={enrollment.progress} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {getRelativeTime(enrollment.lastAccessedAt)}
                          </span>
                          <Button size="sm" className="h-7 gap-1 bg-emerald-600 text-white hover:bg-emerald-700 text-xs px-3">
                            <Play className="h-3 w-3" />
                            Continue
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* ============ COMPLETED COURSES ============ */}
        {completedEnrollments.length > 0 && (
          <Section delay={0.15}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-violet-500" />
                Completed Courses
              </h2>
              <Badge variant="secondary" className="text-xs">
                {completedEnrollments.length} completed
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {completedEnrollments.map((enrollment, i) => (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                >
                  <Card className="overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow group relative">
                    {/* Completion badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    </div>
                    {/* Course colored header */}
                    <div className={cn(
                      'bg-gradient-to-r p-4 h-20 flex items-end',
                      getCourseAccent(enrollment.course?.category)
                    )}>
                      <Badge className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm">
                        {enrollment.course?.category}
                      </Badge>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-50 pr-8 line-clamp-2">
                        {enrollment.course?.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          {enrollment.course?.avgRating}
                        </span>
                        <span>·</span>
                        <span>100% complete</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-7 gap-1 text-xs px-3 border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40">
                          <Download className="h-3 w-3" />
                          Certificate
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs px-3 text-muted-foreground">
                          Review Course
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* ============ MIDDLE ROW: ACTIVITY FEED + LEADERBOARD + DAILY GOAL ============ */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Activity Feed */}
          <Section delay={0.2}>
            <Card className="border-slate-200 dark:border-slate-800 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                <div className="max-h-96 overflow-y-auto scrollbar-thin">
                  <AnimatePresence>
                    {(showAllActivities ? activityItems : activityItems.slice(0, 4)).map((activity, i) => {
                      const ActivityIcon = activity.icon;
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.05 * i }}
                          className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0"
                        >
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                            <ActivityIcon className={cn('h-4 w-4', activity.color)} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-slate-900 dark:text-slate-100 line-clamp-2">
                              {activity.title}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
                {activityItems.length > 4 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full text-xs text-muted-foreground"
                    onClick={() => setShowAllActivities(!showAllActivities)}
                  >
                    {showAllActivities ? 'Show less' : 'View all activity'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </Section>

          {/* Leaderboard Preview */}
          <Section delay={0.25}>
            <Card className="border-slate-200 dark:border-slate-800 h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Leaderboard
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">This Week</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-0">
                <div className="space-y-1">
                  {topFive.map((entry, i) => {
                    const isCurrentUser = entry.name === 'Alex Johnson';
                    return (
                      <motion.div
                        key={entry.rank}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.08 * i }}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                          isCurrentUser
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        )}
                      >
                        {/* Rank */}
                        <div className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                          entry.rank === 1 && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
                          entry.rank === 2 && 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
                          entry.rank === 3 && 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                          entry.rank > 3 && 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                        )}>
                          {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                        </div>
                        {/* Name & details */}
                        <div className="min-w-0 flex-1">
                          <p className={cn(
                            'text-sm font-medium truncate',
                            isCurrentUser ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-slate-100'
                          )}>
                            {entry.name}
                            {isCurrentUser && (
                              <span className="ml-1.5 text-xs font-normal text-emerald-500">(You)</span>
                            )}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{entry.points.toLocaleString()} pts</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5">
                              <Flame className="h-3 w-3 text-orange-400" />
                              {entry.streak}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full text-xs gap-1"
                  onClick={() => useAppStore.getState().setView('learner-achievements')}
                >
                  View Full Leaderboard
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          </Section>

          {/* Daily Goal Ring + Quick Stats */}
          <Section delay={0.3}>
            <div className="space-y-4">
              <DailyGoalRing percentage={dailyPercent} minutes={dailyMinutes} goal={dailyGoal} />

              {/* Streak Card */}
              <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-4 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                      <Flame className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-100">Learning Streak</p>
                      <p className="text-2xl font-bold">{streakDays} Days</p>
                    </div>
                  </div>
                  {/* Streak visual - last 7 days */}
                  <div className="flex items-end gap-1.5 mt-2">
                    {Array.from({ length: 7 }, (_, idx) => {
                      const isActive = idx < streakDays % 7 || (streakDays >= 7 && true);
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <div className={cn(
                            'w-full rounded-sm transition-all',
                            isActive
                              ? 'bg-white/80 h-6'
                              : 'bg-white/20 h-2'
                          )} />
                          <span className="text-[9px] text-emerald-200">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 rounded-lg bg-violet-50 dark:bg-violet-950/30 p-2.5">
                    <Sparkles className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                    <p className="text-[11px] text-violet-700 dark:text-violet-300">
                      <strong>Streak Master</strong> unlocked! +100 pts
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>
        </div>

        {/* ============ RECOMMENDED COURSES ============ */}
        {recommendedCourses.length > 0 && (
          <Section delay={0.35}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-500" />
                Recommended For You
              </h2>
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground">
                Browse All <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedCourses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                >
                  <TiltCard>
                    <Card className="overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow group cursor-pointer">
                      {/* Course colored header */}
                      <div className={cn(
                        'bg-gradient-to-r p-4 h-20 flex items-end relative',
                        getCourseAccent(course.category)
                      )}>
                        {course.isFeatured && (
                          <Badge className="absolute top-3 right-3 bg-white/20 text-white border-0 text-xs backdrop-blur-sm gap-1">
                            <Star className="h-3 w-3 fill-white" />
                            Featured
                          </Badge>
                        )}
                        <Badge className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm">
                          {course.level}
                        </Badge>
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-50 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              {course.avgRating}
                            </span>
                            <span>({course.totalRatings})</span>
                            <span>·</span>
                            <span>{course.enrollmentCount} students</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-50">${course.price}</span>
                            {course.compareAtPrice && (
                              <span className="text-xs text-muted-foreground line-through">${course.compareAtPrice}</span>
                            )}
                          </div>
                          <Button size="sm" className="h-7 gap-1 bg-emerald-600 text-white hover:bg-emerald-700 text-xs px-3">
                            Enroll Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
