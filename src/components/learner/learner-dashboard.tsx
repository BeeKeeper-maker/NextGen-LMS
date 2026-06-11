'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
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
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Users,
  BarChart3,
  Lightbulb,
  PartyPopper,
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
  const colorMap: Record<string, { bg: string; text: string; border: string; gradient: string; ring: string }> = {
    'book-open': { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', gradient: 'from-emerald-500/10 to-emerald-500/5', ring: '#10b981' },
    'graduation-cap': { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/20', gradient: 'from-violet-500/10 to-violet-500/5', ring: '#8b5cf6' },
    flame: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20', gradient: 'from-orange-500/10 to-orange-500/5', ring: '#f97316' },
    star: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20', gradient: 'from-yellow-500/10 to-yellow-500/5', ring: '#eab308' },
    award: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', gradient: 'from-emerald-500/10 to-emerald-500/5', ring: '#10b981' },
    'message-circle': { bg: 'bg-sky-500/10', text: 'text-sky-500', border: 'border-sky-500/20', gradient: 'from-sky-500/10 to-sky-500/5', ring: '#0ea5e9' },
  };
  return colorMap[iconName] || { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20', gradient: 'from-slate-500/10 to-slate-500/5', ring: '#64748b' };
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

// Course color for gradient overlay icons
function getCourseColor(category?: string) {
  const colors: Record<string, string> = {
    'Web Development': '#10b981',
    'AI & ML': '#8b5cf6',
    'Data Science': '#0ea5e9',
    Design: '#ec4899',
    Business: '#f59e0b',
    Marketing: '#f43f5e',
  };
  return colors[category || ''] || '#64748b';
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

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Time of day greeting
function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Time of day motivational message
function getMotivationalMessage(streakDays: number) {
  const hour = new Date().getHours();
  if (streakDays >= 7) {
    if (hour < 12) return "Your streak is on fire! Keep the momentum going today.";
    if (hour < 17) return "A full week of learning! You're building something amazing.";
    return "Another day, another streak. You're unstoppable!";
  }
  if (hour < 12) return "Start your day with a lesson — consistency builds mastery.";
  if (hour < 17) return "Perfect time to dive into a course and make progress.";
  return "Evening sessions are great for retention. Keep it up!";
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

// ─── Animated Counter ─────────────────────────────
function AnimatedCounter({ value, duration = 1.5 }: { value: string; duration?: number }) {
  const displayRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const el = displayRef.current;
    if (!el) return;

    // Extract numeric part
    const numericMatch = value.match(/[\d,]+/);
    if (!numericMatch) {
      el.textContent = value;
      return;
    }
    const numericStr = numericMatch[0].replace(/,/g, '');
    const target = parseInt(numericStr, 10);
    if (isNaN(target)) {
      el.textContent = value;
      return;
    }

    const prefix = value.substring(0, value.indexOf(numericMatch[0]));
    const suffix = value.substring(value.indexOf(numericMatch[0]) + numericMatch[0].length);
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      const formatted = current.toLocaleString();
      if (displayRef.current) {
        displayRef.current.textContent = `${prefix}${formatted}${suffix}`;
      }
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span ref={displayRef}>0</span>;
}

// ─── Mini Circular Progress Ring ──────────────────
function MiniProgressRing({ percentage, size = 36, strokeWidth = 3, color = '#10b981' }: { percentage: number; size?: number; strokeWidth?: number; color?: string }) {
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercent(percentage), 200);
    return () => clearTimeout(timer);
  }, [percentage]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercent / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-slate-200 dark:text-slate-700"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  );
}

// ─── Confetti Particle ────────────────────────────
function ConfettiParticle({ delay, x, color, size }: { delay: number; x: number; color: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-sm"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left: `${x}%`,
        top: 0,
      }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{ y: 80, opacity: 0, rotate: 360 }}
      transition={{ duration: 1.5, delay, ease: 'easeOut' }}
    />
  );
}

// ─── Streak Fire Effect (Enhanced) ────────────────
function StreakFireBadge({ days }: { days: number }) {
  const showConfetti = days >= 7 && days % 7 === 0;
  const confettiColors = ['#f97316', '#eab308', '#ef4444', '#8b5cf6', '#10b981', '#0ea5e9'];

  return (
    <div className="relative inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 dark:bg-orange-950/40">
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          filter: [
            'brightness(1) drop-shadow(0 0 0px transparent)',
            'brightness(1.4) drop-shadow(0 0 10px rgba(249, 115, 22, 0.7))',
            'brightness(1) drop-shadow(0 0 0px transparent)',
          ],
        }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
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
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Confetti on milestone */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 overflow-visible pointer-events-none">
            {confettiColors.map((color, i) => (
              <ConfettiParticle
                key={i}
                delay={i * 0.1}
                x={10 + i * 15}
                color={color}
                size={4 + (i % 3) * 2}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Daily Goal Progress Ring ─────────────────────
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
    <Card className="border-border dark:border-slate-800">
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
            <motion.span
              className="text-xl font-bold text-foreground"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
            >
              {percentage}%
            </motion.span>
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

// ─── Parallax Tilt Card ──────────────────────────
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

// Activity feed items (enhanced with type colors and timestamps)
const activityItems = [
  {
    id: 'act-1',
    type: 'lesson' as const,
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500',
    title: 'Completed Lesson: Server Components Architecture',
    detail: 'Advanced React & Next.js Masterclass',
    time: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'act-2',
    type: 'achievement' as const,
    icon: Trophy,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
    title: 'Earned Achievement: Streak Starter 🔥',
    detail: '+25 points earned',
    time: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: 'act-3',
    type: 'community' as const,
    icon: MessageCircle,
    color: 'text-sky-500',
    bgColor: 'bg-sky-500',
    title: 'Posted in Community: How do you handle state management in large Next.js apps?',
    detail: '12 replies',
    time: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'act-4',
    type: 'quiz' as const,
    icon: Zap,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500',
    title: 'Quiz Score: 92% on React Fundamentals',
    detail: 'Advanced React & Next.js',
    time: new Date(Date.now() - 90000000).toISOString(),
  },
  {
    id: 'act-5',
    type: 'lesson' as const,
    icon: Play,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500',
    title: 'Started Lesson: Prompt Engineering Mastery',
    detail: 'AI-Powered Full Stack Development',
    time: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'act-6',
    type: 'achievement' as const,
    icon: Sparkles,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
    title: 'Reached 1,000 points milestone!',
    detail: 'Keep going for 2,500!',
    time: new Date(Date.now() - 259200000).toISOString(),
  },
];

// ─── KPI Circular Progress ────────────────────────
function KPICircularProgress({ value, color, size = 48, strokeWidth = 4 }: { value: number; color: string; size?: number; strokeWidth?: number }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 150);
    return () => clearTimeout(timer);
  }, [value]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-slate-200/50 dark:text-slate-700/50"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
      />
    </svg>
  );
}

// Helper: get KPI percentage for circular progress (deterministic based on KPI data)
function getKPIPercentage(kpi: DashboardKPI): number {
  const valueMap: Record<string, number> = {
    'Courses Enrolled': 67,
    'Courses Completed': 33,
    'Learning Streak': 100,
    'Total Points': 50,
    'Certificates Earned': 40,
    'Community Posts': 46,
  };
  return valueMap[kpi.label] || 50;
}

// Recommendation reasons based on course
function getRecommendationReason(courseId: string): string {
  const reasons: Record<string, string> = {
    'course-3': 'Popular in Web Dev',
    'course-6': 'Trending Now',
  };
  return reasons[courseId] || 'Based on your interests';
}

// Difficulty color and label
function getDifficultyStyle(level: string) {
  const styles: Record<string, { bg: string; text: string; dot: string }> = {
    beginner: { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
    intermediate: { bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
    advanced: { bg: 'bg-orange-100 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
    expert: { bg: 'bg-red-100 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
  };
  return styles[level] || styles.beginner;
}

// Star rating display
function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            size <= 12 ? 'h-3 w-3' : 'h-4 w-4',
            star <= Math.floor(rating)
              ? 'text-yellow-500 fill-yellow-500'
              : star <= rating
                ? 'text-yellow-500 fill-yellow-500/50'
                : 'text-slate-300 dark:text-slate-600'
          )}
        />
      ))}
    </div>
  );
}

// ─── Resume Button with Play Animation ────────────
function ResumeButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Button
      size="sm"
      className="h-8 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs px-3 shadow-sm shadow-emerald-600/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={isHovered ? { scale: [1, 1.3, 1], rotate: [0, -10, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Play className="h-3 w-3" />
      </motion.div>
      Resume
    </Button>
  );
}

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

// Leaderboard rank badge colors
function getRankBadgeStyle(rank: number) {
  if (rank === 1) return { bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600', text: 'text-yellow-900', icon: '🥇' };
  if (rank === 2) return { bg: 'bg-gradient-to-br from-slate-300 to-slate-400', text: 'text-slate-700', icon: '🥈' };
  if (rank === 3) return { bg: 'bg-gradient-to-br from-amber-500 to-amber-700', text: 'text-amber-900', icon: '🥉' };
  return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', icon: '' };
}

// Avatar initial colors (deterministic based on name)
function getAvatarColor(name: string) {
  const colors = [
    'from-emerald-400 to-emerald-600',
    'from-violet-400 to-violet-600',
    'from-sky-400 to-sky-600',
    'from-amber-400 to-amber-600',
    'from-rose-400 to-rose-600',
    'from-teal-400 to-teal-600',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

// Get initials from name
function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

// Deterministic point change for leaderboard
function getPointChange(rank: number): { change: number; direction: 'up' | 'down' | 'same' } {
  const changes: Record<number, { change: number; direction: 'up' | 'down' | 'same' }> = {
    1: { change: 120, direction: 'up' },
    2: { change: 85, direction: 'up' },
    3: { change: 60, direction: 'same' },
    4: { change: 45, direction: 'up' },
    5: { change: 30, direction: 'down' },
  };
  return changes[rank] || { change: 0, direction: 'same' };
}

// Next lesson for enrolled courses (deterministic based on course modules)
function getNextLesson(enrollment: { course?: { modules?: { lessons?: { title: string; id: string }[] }[] }; progress: number }) {
  const modules = enrollment.course?.modules;
  if (!modules || modules.length === 0) return null;
  for (const mod of modules) {
    if (mod.lessons && mod.lessons.length > 0) {
      return mod.lessons[0].title;
    }
  }
  return null;
}

// Count total and completed lessons (deterministic based on progress)
function getLessonCounts(enrollment: { progress: number; course?: { modules?: { lessons?: unknown[] }[] } }) {
  const modules = enrollment.course?.modules;
  let total = 0;
  if (modules) {
    for (const mod of modules) {
      if (mod.lessons) total += mod.lessons.length;
    }
  }
  if (total === 0) total = 10; // fallback
  const completed = Math.round((enrollment.progress / 100) * total);
  return { total, completed };
}

export function LearnerDashboard() {
  const { currentUser } = useAppStore();
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [hoveredRecommendation, setHoveredRecommendation] = useState<string | null>(null);

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

  const greeting = getTimeGreeting();
  const motivationalMessage = getMotivationalMessage(streakDays);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
        {/* ============ WELCOME HEADER (ENHANCED) ============ */}
        <Section delay={0}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <motion.h1
                className="text-2xl font-bold text-slate-900 dark:text-slate-50 sm:text-3xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {greeting}, {firstName}! 👋
              </motion.h1>
              <motion.p
                className="mt-1 text-sm text-muted-foreground max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {motivationalMessage}
              </motion.p>
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
            <div className="flex items-center gap-3">
              {/* Mini daily goal indicator in header */}
              <motion.div
                className="hidden sm:flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-border px-3 py-2 shadow-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <MiniProgressRing percentage={dailyPercent} size={32} strokeWidth={3} color="#10b981" />
                <div>
                  <p className="text-xs font-medium text-foreground">Daily Goal</p>
                  <p className="text-[10px] text-muted-foreground">{dailyMinutes}/{dailyGoal} min</p>
                </div>
              </motion.div>
              {mostRecentEnrollment && (
                <Button
                  size="lg"
                  className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                  onClick={() => {}}
                >
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ x: 2 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Play className="h-4 w-4" />
                    Resume Learning
                  </motion.div>
                </Button>
              )}
            </div>
          </div>
        </Section>

        {/* ============ KPI STATS ROW (ENHANCED) ============ */}
        <Section delay={0.05}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {learnerKPIs.map((kpi: DashboardKPI, i: number) => {
              const Icon = getKPIIcon(kpi.icon);
              const colors = getKPIColor(kpi.icon);
              const kpiPercent = getKPIPercentage(kpi);
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.05 * i }}
                >
                  <Card className={cn(
                    'relative overflow-hidden border transition-shadow hover:shadow-md group',
                    colors.border
                  )}>
                    {/* Subtle gradient background */}
                    <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300', colors.gradient)} />
                    <CardContent className="relative p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', colors.bg)}>
                          <Icon className={cn('h-4 w-4', colors.text)} />
                        </div>
                        {/* Circular progress indicator */}
                        <div className="relative">
                          <KPICircularProgress value={kpiPercent} color={colors.ring} size={40} strokeWidth={3} />
                          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                            {kpiPercent}%
                          </span>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                        <AnimatedCounter value={String(kpi.value)} />
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{kpi.label}</p>
                      <div className="mt-2 flex items-center gap-1">
                        <motion.span
                          className={cn(
                            'text-xs font-medium flex items-center gap-0.5',
                            kpi.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                          )}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.05 }}
                        >
                          {kpi.change >= 0 ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {kpi.change >= 0 ? '+' : ''}{kpi.change}
                        </motion.span>
                        <span className="text-xs text-muted-foreground">{kpi.changeLabel}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </Section>

        {/* ============ CONTINUE LEARNING SECTION (ENHANCED) ============ */}
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
              {activeEnrollments.map((enrollment, i) => {
                const nextLesson = getNextLesson(enrollment);
                const { total, completed } = getLessonCounts(enrollment);
                const courseColor = getCourseColor(enrollment.course?.category);

                return (
                  <motion.div
                    key={enrollment.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * i }}
                    className="min-w-[300px] sm:min-w-[340px]"
                  >
                    <TiltCard>
                      <Card className="overflow-hidden border-border dark:border-slate-800 hover:shadow-lg transition-shadow group">
                        {/* Course colored header with gradient overlay */}
                        <div className="relative">
                          <div className={cn(
                            'bg-gradient-to-r p-4 h-24 flex items-end',
                            getCourseAccent(enrollment.course?.category)
                          )}>
                            {/* Gradient overlay pattern */}
                            <div className="absolute inset-0 bg-black/10" />
                            {/* Course icon/watermark */}
                            <div className="absolute top-3 right-3 opacity-20">
                              <BookOpen className="h-16 w-16 text-white" />
                            </div>
                            <div className="relative flex w-full items-center justify-between z-10">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm">
                                  {enrollment.course?.level}
                                </Badge>
                                <span className="text-xs text-white/70">
                                  {enrollment.course?.durationHours}h
                                </span>
                              </div>
                              {/* Circular progress ring on card */}
                              <div className="relative">
                                <MiniProgressRing
                                  percentage={enrollment.progress}
                                  size={44}
                                  strokeWidth={3}
                                  color="white"
                                />
                                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">
                                  {enrollment.progress}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4 space-y-3">
                          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-50 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {enrollment.course?.title}
                          </h3>

                          {/* Mini curriculum progress bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground">{completed} of {total} lessons</span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{enrollment.progress}%</span>
                            </div>
                            <AnimatedProgress value={enrollment.progress} />
                          </div>

                          {/* Next lesson preview */}
                          {nextLesson && (
                            <div className="flex items-center gap-2 rounded-md bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5">
                              <Play className="h-3 w-3 text-emerald-500 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[10px] text-muted-foreground">Next up</p>
                                <p className="text-xs font-medium text-foreground truncate">{nextLesson}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {getRelativeTime(enrollment.lastAccessedAt)}
                            </span>
                            <ResumeButton />
                          </div>
                        </CardContent>
                      </Card>
                    </TiltCard>
                  </motion.div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ============ COMPLETED COURSES (ENHANCED) ============ */}
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
                  <Card className="overflow-hidden border-border dark:border-slate-800 hover:shadow-lg transition-shadow group relative">
                    {/* Celebration badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <motion.div
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5 + i * 0.1, type: 'spring', stiffness: 200 }}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </motion.div>
                    </div>
                    {/* Course colored header */}
                    <div className={cn(
                      'bg-gradient-to-r p-4 h-20 flex items-end relative',
                      getCourseAccent(enrollment.course?.category)
                    )}>
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="relative z-10">
                        <Badge className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm">
                          {enrollment.course?.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-50 pr-10 line-clamp-2">
                        {enrollment.course?.title}
                      </h3>
                      {/* Star rating */}
                      <div className="flex items-center gap-2">
                        <StarRating rating={enrollment.course?.avgRating || 0} />
                        <span className="text-xs text-muted-foreground">
                          {enrollment.course?.avgRating} ({enrollment.course?.totalRatings})
                        </span>
                      </div>
                      {/* Completion info */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          100% complete
                        </span>
                        {enrollment.completedAt && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(enrollment.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-7 gap-1 text-xs px-3 border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40">
                          <Award className="h-3 w-3" />
                          View Certificate
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
          {/* Activity Feed (ENHANCED - Timeline style) */}
          <Section delay={0.2}>
            <Card className="border-border dark:border-slate-800 h-full">
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
                      const isLast = i === (showAllActivities ? activityItems.length - 1 : 3);
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.05 * i }}
                          className="relative flex items-start gap-3 py-3"
                        >
                          {/* Timeline dot and line */}
                          <div className="flex flex-col items-center shrink-0">
                            <div className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-full z-10',
                              'bg-slate-100 dark:bg-slate-800 ring-2 ring-white dark:ring-slate-900'
                            )}>
                              <ActivityIcon className={cn('h-4 w-4', activity.color)} />
                            </div>
                            {/* Connecting line */}
                            {!isLast && (
                              <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 mt-1" />
                            )}
                          </div>
                          {/* Activity colored type indicator */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <div className={cn('h-1.5 w-1.5 rounded-full', activity.bgColor)} />
                              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                {activity.type}
                              </span>
                            </div>
                            <p className="text-sm text-slate-900 dark:text-slate-100 line-clamp-2">
                              {activity.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-muted-foreground">{getRelativeTime(activity.time)}</p>
                              {activity.detail && (
                                <>
                                  <span className="text-xs text-muted-foreground">·</span>
                                  <p className="text-xs text-muted-foreground">{activity.detail}</p>
                                </>
                              )}
                            </div>
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

          {/* Leaderboard Preview (ENHANCED) */}
          <Section delay={0.25}>
            <Card className="border-border dark:border-slate-800 h-full">
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
                    const rankStyle = getRankBadgeStyle(entry.rank);
                    const avatarGradient = getAvatarColor(entry.name);
                    const initials = getInitials(entry.name);
                    const pointChange = getPointChange(entry.rank);

                    return (
                      <motion.div
                        key={entry.rank}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.08 * i }}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                          isCurrentUser
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 dark:border-emerald-800'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        )}
                      >
                        {/* Rank badge */}
                        <div className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                          rankStyle.bg,
                          rankStyle.text
                        )}>
                          {entry.rank <= 3 ? rankStyle.icon : entry.rank}
                        </div>
                        {/* Avatar initials */}
                        <div className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white text-xs font-bold',
                          avatarGradient
                        )}>
                          {initials}
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
                        {/* Point change indicator */}
                        <div className="flex flex-col items-end shrink-0">
                          {pointChange.direction === 'up' && (
                            <motion.span
                              className="flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 + i * 0.1 }}
                            >
                              <ArrowUpRight className="h-3 w-3" />
                              +{pointChange.change}
                            </motion.span>
                          )}
                          {pointChange.direction === 'down' && (
                            <motion.span
                              className="flex items-center gap-0.5 text-xs font-medium text-red-500"
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 + i * 0.1 }}
                            >
                              <ArrowDownRight className="h-3 w-3" />
                              -{pointChange.change}
                            </motion.span>
                          )}
                          {pointChange.direction === 'same' && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
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

              {/* Streak Card (Enhanced) */}
              <Card className="border-border dark:border-slate-800 overflow-hidden">
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
                          <motion.div
                            className={cn(
                              'w-full rounded-sm transition-all',
                              isActive
                                ? 'bg-white/80'
                                : 'bg-white/20'
                            )}
                            initial={{ height: isActive ? 0 : 8 }}
                            animate={{ height: isActive ? 24 : 8 }}
                            transition={{ duration: 0.5, delay: 0.1 * idx }}
                          />
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

        {/* ============ RECOMMENDED COURSES (ENHANCED) ============ */}
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
              {recommendedCourses.map((course, i) => {
                const difficultyStyle = getDifficultyStyle(course.level);
                const isHovered = hoveredRecommendation === course.id;
                const reason = getRecommendationReason(course.id);

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * i }}
                    onMouseEnter={() => setHoveredRecommendation(course.id)}
                    onMouseLeave={() => setHoveredRecommendation(null)}
                  >
                    <TiltCard>
                      <Card className="overflow-hidden border-border dark:border-slate-800 hover:shadow-lg transition-shadow group cursor-pointer relative">
                        {/* Course colored header */}
                        <div className="relative">
                          <div className={cn(
                            'bg-gradient-to-r p-4 h-24 flex items-end relative',
                            getCourseAccent(course.category)
                          )}>
                            <div className="absolute inset-0 bg-black/10" />
                            <div className="absolute top-3 right-3 opacity-20">
                              <BookOpen className="h-16 w-16 text-white" />
                            </div>
                            <div className="relative z-10 flex w-full items-center justify-between">
                              <div className="flex items-center gap-2">
                                {/* Difficulty indicator */}
                                <Badge className={cn('border-0 text-xs gap-1', difficultyStyle.bg, difficultyStyle.text)}>
                                  <span className={cn('h-1.5 w-1.5 rounded-full', difficultyStyle.dot)} />
                                  {course.level}
                                </Badge>
                                {course.isFeatured && (
                                  <Badge className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm gap-1">
                                    <Star className="h-3 w-3 fill-white" />
                                    Featured
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {/* "Why recommended" tag */}
                          <div className="absolute bottom-0 left-0 right-0">
                            <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 border-t border-white/20 dark:border-slate-800/50">
                              <Lightbulb className="h-3 w-3 text-violet-500 shrink-0" />
                              <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400">{reason}</span>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4 space-y-3">
                          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-50 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {course.title}
                          </h3>
                          {/* Hover-to-reveal description */}
                          <div className="relative h-0 overflow-hidden transition-all duration-300 group-hover:h-12">
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {course.description}
                            </p>
                          </div>
                          {/* Star rating */}
                          <div className="flex items-center gap-2">
                            <StarRating rating={course.avgRating} />
                            <span className="text-xs text-muted-foreground">
                              {course.avgRating} ({course.totalRatings})
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {course.enrollmentCount.toLocaleString()}
                              </span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <BarChart3 className="h-3 w-3" />
                                {course.completionRate}% finish
                              </span>
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
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TiltCard>
                  </motion.div>
                );
              })}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
