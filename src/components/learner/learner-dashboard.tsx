'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { apiPost } from '@/lib/api';
import { useEnrollments, useCourses, useUser, useUsers, useAchievements } from '@/hooks/use-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Timer,
  Gift,
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

// Color map for KPI cards - enhanced with glassmorphism gradients
function getKPIColor(iconName: string) {
  const colorMap: Record<string, { bg: string; text: string; border: string; gradient: string; ring: string; meshGradient: string; shimmerFrom: string; shimmerTo: string }> = {
    'book-open': {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-500',
      border: 'border-emerald-500/20',
      gradient: 'from-emerald-500/10 to-emerald-500/5',
      ring: '#10b981',
      meshGradient: 'from-emerald-500/20 via-teal-500/10 to-emerald-600/5',
      shimmerFrom: 'from-emerald-400/30',
      shimmerTo: 'to-emerald-300/5',
    },
    'graduation-cap': {
      bg: 'bg-violet-500/10',
      text: 'text-violet-500',
      border: 'border-violet-500/20',
      gradient: 'from-violet-500/10 to-violet-500/5',
      ring: '#8b5cf6',
      meshGradient: 'from-violet-500/20 via-purple-500/10 to-violet-600/5',
      shimmerFrom: 'from-violet-400/30',
      shimmerTo: 'to-violet-300/5',
    },
    flame: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-500',
      border: 'border-orange-500/20',
      gradient: 'from-orange-500/10 to-orange-500/5',
      ring: '#f97316',
      meshGradient: 'from-orange-500/20 via-amber-500/10 to-orange-600/5',
      shimmerFrom: 'from-orange-400/30',
      shimmerTo: 'to-orange-300/5',
    },
    star: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-500',
      border: 'border-yellow-500/20',
      gradient: 'from-yellow-500/10 to-yellow-500/5',
      ring: '#eab308',
      meshGradient: 'from-yellow-500/20 via-amber-400/10 to-yellow-600/5',
      shimmerFrom: 'from-yellow-400/30',
      shimmerTo: 'to-yellow-300/5',
    },
    award: {
      bg: 'bg-teal-500/10',
      text: 'text-teal-500',
      border: 'border-teal-500/20',
      gradient: 'from-teal-500/10 to-teal-500/5',
      ring: '#14b8a6',
      meshGradient: 'from-teal-500/20 via-cyan-500/10 to-teal-600/5',
      shimmerFrom: 'from-teal-400/30',
      shimmerTo: 'to-teal-300/5',
    },
    'message-circle': {
      bg: 'bg-sky-500/10',
      text: 'text-sky-500',
      border: 'border-sky-500/20',
      gradient: 'from-sky-500/10 to-sky-500/5',
      ring: '#0ea5e9',
      meshGradient: 'from-sky-500/20 via-blue-500/10 to-sky-600/5',
      shimmerFrom: 'from-sky-400/30',
      shimmerTo: 'to-sky-300/5',
    },
  };
  return colorMap[iconName] || {
    bg: 'bg-slate-500/10',
    text: 'text-slate-500',
    border: 'border-slate-500/20',
    gradient: 'from-slate-500/10 to-slate-500/5',
    ring: '#64748b',
    meshGradient: 'from-slate-500/20 via-slate-400/10 to-slate-600/5',
    shimmerFrom: 'from-slate-400/30',
    shimmerTo: 'to-slate-300/5',
  };
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
function AnimatedProgress({ value, className, barColor = 'from-emerald-500 to-emerald-400' }: { value: number; className?: string; barColor?: string }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700', className)}>
      <motion.div
        className={cn('absolute inset-y-0 left-0 rounded-full bg-gradient-to-r overflow-hidden', barColor)}
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

// ─── Floating Geometric Shape ─────────────────────
function FloatingShape({ type, className, delay, duration }: { type: 'circle' | 'square' | 'triangle' | 'diamond'; className?: string; delay?: number; duration?: number }) {
  const shapeClass = cn(
    'absolute opacity-[0.07] dark:opacity-[0.05]',
    type === 'circle' && 'rounded-full',
    type === 'square' && 'rounded-lg rotate-12',
    type === 'diamond' && 'rounded-md rotate-45',
    className,
  );

  return (
    <motion.div
      className={shapeClass}
      initial={{ y: 0, rotate: type === 'square' ? 12 : type === 'diamond' ? 45 : 0 }}
      animate={{
        y: [-10, 10, -10],
        rotate: type === 'square' ? [12, 24, 12] : type === 'diamond' ? [45, 55, 45] : [0, 5, 0],
      }}
      transition={{
        duration: duration || 6,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay || 0,
      }}
    />
  );
}

// ─── Streak Fire Effect (Enhanced with pulsing glow) ────────────
function StreakFireBadge({ days }: { days: number }) {
  const showConfetti = days >= 7 && days % 7 === 0;
  const confettiColors = ['#f97316', '#eab308', '#ef4444', '#8b5cf6', '#10b981', '#0ea5e9'];

  return (
    <div className="relative inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 dark:bg-orange-950/40">
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          filter: [
            'brightness(1) drop-shadow(0 0 0px transparent)',
            'brightness(1.5) drop-shadow(0 0 14px rgba(249, 115, 22, 0.8))',
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
      {/* Pulsing glow effect behind badge */}
      <motion.div
        className="absolute inset-0 rounded-full bg-orange-400/20 blur-lg -z-10"
        animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.05, 1] }}
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
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-slate-200 dark:text-slate-700"
            />
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
                <stop offset="100%" stopColor="#14b8a6" />
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
    bgCircle: 'bg-emerald-100 dark:bg-emerald-950/40',
    title: 'Completed Lesson: Server Components Architecture',
    detail: 'Advanced React & Next.js Masterclass',
    time: new Date(Date.now() - 7200000).toISOString(),
    expandedDetail: 'You completed this lesson in 18 minutes. Great pace! Your average for this course is 22 minutes per lesson.',
  },
  {
    id: 'act-2',
    type: 'achievement' as const,
    icon: Trophy,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
    bgCircle: 'bg-yellow-100 dark:bg-yellow-950/40',
    title: 'Earned Achievement: Streak Starter 🔥',
    detail: '+25 points earned',
    time: new Date(Date.now() - 18000000).toISOString(),
    expandedDetail: 'You maintained a 7-day learning streak! This achievement is earned by only 34% of learners.',
  },
  {
    id: 'act-3',
    type: 'community' as const,
    icon: MessageCircle,
    color: 'text-sky-500',
    bgColor: 'bg-sky-500',
    bgCircle: 'bg-sky-100 dark:bg-sky-950/40',
    title: 'Posted in Community: How do you handle state management in large Next.js apps?',
    detail: '12 replies',
    time: new Date(Date.now() - 86400000).toISOString(),
    expandedDetail: 'Your post received 12 replies and 8 likes. It was marked as helpful by 3 community members.',
  },
  {
    id: 'act-4',
    type: 'quiz' as const,
    icon: Zap,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500',
    bgCircle: 'bg-violet-100 dark:bg-violet-950/40',
    title: 'Quiz Score: 92% on React Fundamentals',
    detail: 'Advanced React & Next.js',
    time: new Date(Date.now() - 90000000).toISOString(),
    expandedDetail: 'You scored 23/25 correct answers. You missed questions on Suspense boundaries and error boundaries.',
  },
  {
    id: 'act-5',
    type: 'lesson' as const,
    icon: Play,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500',
    bgCircle: 'bg-emerald-100 dark:bg-emerald-950/40',
    title: 'Started Lesson: Prompt Engineering Mastery',
    detail: 'AI-Powered Full Stack Development',
    time: new Date(Date.now() - 172800000).toISOString(),
    expandedDetail: 'You spent 8 minutes on this lesson so far. Estimated 15 minutes remaining.',
  },
  {
    id: 'act-6',
    type: 'achievement' as const,
    icon: Sparkles,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
    bgCircle: 'bg-orange-100 dark:bg-orange-950/40',
    title: 'Reached 1,000 points milestone!',
    detail: 'Keep going for 2,500!',
    time: new Date(Date.now() - 259200000).toISOString(),
    expandedDetail: 'You\'ve joined the top 20% of point earners! Next milestone at 2,500 points unlocks the Scholar badge.',
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

// Helper: get KPI percentage for circular progress
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

// ─── Resume Button with Gradient Glow ────────────
function ResumeButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Button
      size="sm"
      className="relative h-8 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs px-3 shadow-sm shadow-emerald-600/20 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient glow on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 opacity-0"
        animate={{ opacity: isHovered ? 0.3 : 0 }}
        transition={{ duration: 0.3 }}
      />
      <motion.div
        animate={isHovered ? { scale: [1, 1.3, 1], rotate: [0, -10, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <Play className="h-3 w-3" />
      </motion.div>
      <span className="relative">Resume</span>
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
  if (rank === 1) return { bg: 'bg-gradient-to-br from-yellow-400 to-amber-600', text: 'text-yellow-900', icon: '🥇', shadow: 'shadow-lg shadow-yellow-500/30' };
  if (rank === 2) return { bg: 'bg-gradient-to-br from-slate-300 to-slate-500', text: 'text-slate-700', icon: '🥈', shadow: 'shadow-lg shadow-slate-400/30' };
  if (rank === 3) return { bg: 'bg-gradient-to-br from-amber-500 to-amber-700', text: 'text-amber-900', icon: '🥉', shadow: 'shadow-lg shadow-amber-500/30' };
  return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', icon: '', shadow: '' };
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

// Next lesson for enrolled courses
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

// Count total and completed lessons
function getLessonCounts(enrollment: { progress: number; course?: { modules?: { lessons?: unknown[] }[] } }) {
  const modules = enrollment.course?.modules;
  let total = 0;
  if (modules) {
    for (const mod of modules) {
      if (mod.lessons) total += mod.lessons.length;
    }
  }
  if (total === 0) total = 10;
  const completed = Math.round((enrollment.progress / 100) * total);
  return { total, completed };
}

// ─── Daily Challenge Widget ────────────────────────
function DailyChallengeWidget() {
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [challengeProgress, setChallengeProgress] = useState(0);
  const challengeGoal = 2;

  useEffect(() => {
    if (challengeStarted && challengeProgress < challengeGoal) {
      const timer = setTimeout(() => setChallengeProgress(1), 2000);
      return () => clearTimeout(timer);
    }
  }, [challengeStarted, challengeProgress]);

  // Time remaining calculation
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const remainingMs = endOfDay.getTime() - now.getTime();
  const remainingHours = Math.floor(remainingMs / 3600000);
  const remainingMins = Math.floor((remainingMs % 3600000) / 60000);

  return (
    <Card className="relative overflow-hidden border-0">
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'conic-gradient(from 0deg, #10b981, #14b8a6, #8b5cf6, #f97316, #eab308, #10b981)',
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      <div className="relative m-[2px] rounded-[10px] bg-white dark:bg-slate-900">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.div
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Zap className="h-4 w-4 text-white" />
              </motion.div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Daily Challenge</h3>
                <p className="text-xs text-muted-foreground">Complete {challengeGoal} lessons today</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 text-xs gap-1">
              <Gift className="h-3 w-3" />
              +50 XP
            </Badge>
          </div>

          {/* Progress indicator */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{challengeProgress}/{challengeGoal}</span>
            </div>
            <AnimatedProgress value={(challengeProgress / challengeGoal) * 100} barColor="from-emerald-500 to-teal-400" />
          </div>

          {/* Time remaining */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Timer className="h-3 w-3" />
            <span>{remainingHours}h {remainingMins}m remaining</span>
          </div>

          {/* Start/Continue Challenge button */}
          <Button
            className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 relative overflow-hidden"
            onClick={() => setChallengeStarted(true)}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <span className="relative">
              {challengeStarted ? (challengeProgress >= challengeGoal ? 'Challenge Complete! 🎉' : 'Continue Challenge') : 'Start Challenge'}
            </span>
            {!challengeStarted && <ArrowRight className="h-3 w-3 relative" />}
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}

// ─── Weekly Learning Stats Card ────────────────────
function WeeklyLearningStats() {
  const dailyMinutes = [45, 30, 60, 25, 50, 15, 35]; // Mon-Sun
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxMinutes = Math.max(...dailyMinutes);
  const totalMinutes = dailyMinutes.reduce((sum, m) => sum + m, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const weekIncrease = 12;

  return (
    <Card className="border-border dark:border-slate-800 h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-teal-500" />
            This Week
          </CardTitle>
          <Badge variant="secondary" className="text-xs gap-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-0">
            <TrendingUp className="h-3 w-3" />
            +{weekIncrease}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mini bar chart */}
        <div className="flex items-end gap-1.5 h-24">
          {dailyMinutes.map((mins, i) => {
            const heightPercent = maxMinutes > 0 ? (mins / maxMinutes) * 100 : 0;
            const isToday = i === new Date().getDay() - 1 || (new Date().getDay() === 0 && i === 6);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  className={cn(
                    'w-full rounded-t-sm transition-all',
                    isToday
                      ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                      : 'bg-slate-200 dark:bg-slate-700'
                  )}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(heightPercent, 8)}%` }}
                  transition={{ duration: 0.6, delay: 0.1 * i, ease: 'easeOut' }}
                />
                <span className={cn(
                  'text-[9px]',
                  isToday ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted-foreground'
                )}>
                  {dayLabels[i]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Stats summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total learned</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">{totalHours} hours</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">vs last week</span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">+{weekIncrease}% more</span>
          </div>
        </div>

        {/* Streak continuity */}
        <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 p-2.5">
          <Flame className="h-4 w-4 text-orange-500 shrink-0" />
          <div>
            <p className="text-xs font-medium text-slate-900 dark:text-slate-50">7-day streak active</p>
            <p className="text-[10px] text-muted-foreground">Keep going to maintain it!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── XP Progress Bar with shimmer ──────────────────
function XPProgressBar({ current, max }: { current: number; max: number }) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-emerald-200 font-medium">Level {Math.floor(current / 500) + 1}</span>
        <span className="text-emerald-200/70">{current.toLocaleString()} / {max.toLocaleString()} XP</span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300 overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
        >
          <div className="absolute inset-0">
            <motion.div
              className="absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
              animate={{ x: ['-100%', '500%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 2 }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── KPI Card Shimmer Effect ───────────────────────
function KPIShimmer({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn('absolute inset-0 overflow-hidden rounded-lg', className)}
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"
        animate={{ x: ['-100%', '500%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
    </motion.div>
  );
}

export function LearnerDashboard() {
  const userId = useAppStore(s => s.currentUser?.id) || '';
  const tenantId = useAppStore(s => s.currentTenant?.id) || '';
  const { currentUser, currentTenant } = useAppStore();
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [hoveredRecommendation, setHoveredRecommendation] = useState<string | null>(null);
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch real data from API via React Query hooks
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useEnrollments(userId || undefined);
  const { data: coursesData, isLoading: coursesLoading } = useCourses();
  const { data: userData, isLoading: userLoading } = useUser(userId || null);
  const { data: usersData, isLoading: usersLoading } = useUsers(tenantId || undefined);
  const { data: achievementsData, isLoading: achievementsLoading } = useAchievements(tenantId || undefined);

  // Derived data from API responses
  const enrollments = useMemo(() => (Array.isArray(enrollmentsData) ? enrollmentsData : []), [enrollmentsData]);
  const courses = useMemo(() => (Array.isArray(coursesData) ? coursesData : []), [coursesData]);
  const user = userData as any;
  const tenantUsers = useMemo(() => {
    if (!usersData?.users) return [];
    return usersData.users;
  }, [usersData]);
  const achievements = useMemo(() => (Array.isArray(achievementsData) ? achievementsData : []), [achievementsData]);

  // Loading state
  const isLoading = enrollmentsLoading || coursesLoading || userLoading;

  const firstName = currentUser?.name?.split(' ')[0] || 'Learner';
  const streakDays = user?.streakDays ?? currentUser?.streakDays ?? 0;
  const totalPoints = user?.totalPoints ?? currentUser?.totalPoints ?? 0;
  const completedCourses = useMemo(() => enrollments.filter((e: any) => e.status === 'completed').length, [enrollments]);
  const totalCertificates = user?.stats?.totalCertificates ?? completedCourses;
  const communityPosts = user?._count?.communityPosts ?? 0;

  // Compute KPIs from real data
  const kpis = useMemo<DashboardKPI[]>(() => [
    { label: 'Courses Enrolled', value: String(enrollments.length), change: enrollments.length > 0 ? 1 : 0, changeLabel: 'new this month', icon: 'book-open' },
    { label: 'Courses Completed', value: String(completedCourses), change: completedCourses > 0 ? 1 : 0, changeLabel: 'this month', icon: 'graduation-cap' },
    { label: 'Learning Streak', value: `${streakDays} days`, change: streakDays > 0 ? 2 : 0, changeLabel: 'days longer', icon: 'flame' },
    { label: 'Total Points', value: totalPoints.toLocaleString(), change: totalPoints > 0 ? 340 : 0, changeLabel: 'earned this week', icon: 'star' },
    { label: 'Certificates Earned', value: String(totalCertificates), change: totalCertificates > 0 ? 1 : 0, changeLabel: 'new', icon: 'award' },
    { label: 'Community Posts', value: String(communityPosts), change: communityPosts > 0 ? 5 : 0, changeLabel: 'this week', icon: 'message-circle' },
  ], [enrollments.length, completedCourses, streakDays, totalPoints, totalCertificates, communityPosts]);

  // Track dashboard view event
  useEffect(() => {
    if (currentTenant?.id) {
      apiPost('/analytics/events', {
        tenantId: currentTenant.id,
        userId: currentUser?.id,
        eventType: 'dashboard_view',
        eventData: { view: 'learner-dashboard' },
      }).catch(() => {/* silent */});
    }
  }, [currentTenant?.id, currentUser?.id]);

  // Filter enrollments
  const activeEnrollments = useMemo(() => enrollments.filter((e: any) => e.status === 'active'), [enrollments]);
  const completedEnrollments = useMemo(() => enrollments.filter((e: any) => e.status === 'completed'), [enrollments]);

  // Most recently accessed course
  const mostRecentEnrollment = useMemo(() => {
    return [...activeEnrollments].sort((a: any, b: any) => {
      const aTime = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
      const bTime = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
      return bTime - aTime;
    })[0];
  }, [activeEnrollments]);

  // Courses not enrolled in
  const enrolledCourseIds = useMemo(() => new Set(enrollments.map((e: any) => e.courseId)), [enrollments]);
  const recommendedCourses = useMemo(() => courses.filter((c: any) => !enrolledCourseIds.has(c.id)), [courses, enrolledCourseIds]);

  // Leaderboard: top 5 users by totalPoints from tenant
  const leaderboardEntries = useMemo(() => {
    return tenantUsers
      .map((u: any, idx: number) => ({
        rank: idx + 1,
        name: u.name || 'Anonymous',
        points: u.totalPoints || 0,
        streak: u.streakDays || 0,
        coursesCompleted: u._count?.enrollments ?? 0,
        avatar: u.avatarUrl || '',
      }))
      .sort((a: any, b: any) => b.points - a.points)
      .slice(0, 5)
      .map((entry: any, idx: number) => ({ ...entry, rank: idx + 1 }));
  }, [tenantUsers]);
  const topFive = leaderboardEntries;
  const maxLeaderboardPoints = topFive.length > 0 ? topFive[0].points : 1;

  // Daily goal data
  const dailyMinutes = 22;
  const dailyGoal = 30;
  const dailyPercent = Math.round((dailyMinutes / dailyGoal) * 100);
  const dailyLessonsCompleted = 3;
  const dailyLessonsGoal = 5;

  const greeting = getTimeGreeting();
  const motivationalMessage = getMotivationalMessage(streakDays);

  // Estimated time to complete based on progress
  function getEstimatedTime(enrollment: { progress: number; course?: { durationHours?: number } }) {
    const totalHours = enrollment.course?.durationHours || 10;
    const remainingHours = totalHours * (1 - enrollment.progress / 100);
    if (remainingHours < 1) return `${Math.round(remainingHours * 60)}m`;
    return `${remainingHours.toFixed(1)}h`;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
          {/* Welcome hero skeleton */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 h-52 animate-pulse" />
          {/* KPI skeleton */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
          {/* Content skeleton */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-80 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="h-60 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-60 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">

        {/* ============ WELCOME HERO (ENHANCED - Gradient Mesh) ============ */}
        <Section delay={0}>
          <div className="relative overflow-hidden rounded-2xl">
            {/* Gradient mesh background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700" />
            {/* Mesh overlay pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.15),transparent_50%)]" />
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.1),transparent_50%)]" />
              <div className="absolute top-1/2 left-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.2),transparent_50%)]" />
            </div>

            {/* Floating geometric shapes */}
            <FloatingShape type="circle" className="w-20 h-20 bg-white top-4 right-20" delay={0} duration={7} />
            <FloatingShape type="square" className="w-14 h-14 bg-white top-12 right-60" delay={1} duration={8} />
            <FloatingShape type="diamond" className="w-10 h-10 bg-white bottom-8 right-32" delay={2} duration={6} />
            <FloatingShape type="circle" className="w-8 h-8 bg-white bottom-16 right-80" delay={0.5} duration={9} />
            <FloatingShape type="square" className="w-6 h-6 bg-white top-20 right-96" delay={1.5} duration={7} />

            {/* Content */}
            <div className="relative z-10 p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <motion.h1
                    className="text-2xl font-bold text-white sm:text-3xl"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {greeting}, {firstName}! 👋
                  </motion.h1>
                  <motion.p
                    className="mt-1 text-sm text-emerald-100/90 max-w-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    {motivationalMessage}
                  </motion.p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <StreakFireBadge days={streakDays} />
                    <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
                      <TrendingUp className="h-4 w-4 text-emerald-200" />
                      <span className="text-sm font-medium text-white">
                        340 pts this week
                      </span>
                    </div>
                  </div>

                  {/* XP Progress Bar */}
                  <div className="mt-4 max-w-xs">
                    <XPProgressBar current={1250} max={2000} />
                  </div>

                  {/* Daily Goal mini progress indicator */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
                      <Target className="h-3.5 w-3.5 text-emerald-200" />
                      <span className="text-xs font-medium text-white">
                        {dailyLessonsCompleted}/{dailyLessonsGoal} lessons today
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Mini daily goal indicator in header */}
                  <motion.div
                    className="hidden sm:flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-3 py-2 backdrop-blur-sm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <MiniProgressRing percentage={dailyPercent} size={32} strokeWidth={3} color="#ffffff" />
                    <div>
                      <p className="text-xs font-medium text-white">Daily Goal</p>
                      <p className="text-[10px] text-emerald-200/70">{dailyMinutes}/{dailyGoal} min</p>
                    </div>
                  </motion.div>
                  {mostRecentEnrollment && (
                    <Button
                      size="lg"
                      className="relative gap-2 bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg shadow-emerald-900/30 overflow-hidden group"
                      onClick={() => {}}
                    >
                      {/* Gradient glow on hover */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-teal-400/30 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                      <motion.div
                        className="relative flex items-center gap-2"
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
            </div>
          </div>
        </Section>

        {/* ============ KPI STATS ROW (ENHANCED - Glassmorphism) ============ */}
        <Section delay={0.05}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {kpis.map((kpi: DashboardKPI, i: number) => {
              const Icon = getKPIIcon(kpi.icon);
              const colors = getKPIColor(kpi.icon);
              const kpiPercent = getKPIPercentage(kpi);
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.06 * i, type: 'spring', stiffness: 200 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <Card className={cn(
                    'relative overflow-hidden border transition-all duration-300 group cursor-pointer',
                    'hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50',
                    'backdrop-blur-sm',
                    colors.border
                  )}>
                    {/* Gradient mesh background */}
                    <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-80 transition-opacity duration-300', colors.meshGradient)} />
                    {/* Shimmer effect */}
                    <KPIShimmer />
                    {/* Sparkle on icon background */}
                    <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <motion.div
                        className="absolute top-2 right-2"
                        animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className={cn('h-4 w-4', colors.text)} />
                      </motion.div>
                    </div>
                    <CardContent className="relative p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg relative', colors.bg)}>
                          <Icon className={cn('h-4 w-4', colors.text)} />
                          {/* Icon shimmer */}
                          <motion.div
                            className="absolute inset-0 rounded-lg"
                            animate={{ boxShadow: [`0 0 0px ${colors.ring}00`, `0 0 8px ${colors.ring}40`, `0 0 0px ${colors.ring}00`] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                          />
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
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {activeEnrollments.length} active
                </Badge>
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 group">
                  View All Courses
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ArrowRight className="h-3 w-3" />
                  </motion.span>
                </Button>
              </div>
            </div>
            <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
              {activeEnrollments.map((enrollment, i) => {
                const nextLesson = getNextLesson(enrollment);
                const { total, completed } = getLessonCounts(enrollment);
                const courseColor = getCourseColor(enrollment.course?.category);
                const isHovered = hoveredCourse === enrollment.id;
                const estimatedTime = getEstimatedTime(enrollment);

                return (
                  <motion.div
                    key={enrollment.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * i }}
                    className="min-w-[300px] sm:min-w-[340px]"
                    onMouseEnter={() => setHoveredCourse(enrollment.id)}
                    onMouseLeave={() => setHoveredCourse(null)}
                  >
                    <TiltCard>
                      <Card className="overflow-hidden border-border dark:border-slate-800 hover:shadow-xl transition-all duration-300 group relative">
                        {/* Course colored header with gradient overlay */}
                        <div className="relative">
                          <div className={cn(
                            'bg-gradient-to-r p-4 h-24 flex items-end transition-all duration-300',
                            getCourseAccent(enrollment.course?.category)
                          )}>
                            {/* Gradient overlay pattern */}
                            <div className="absolute inset-0 bg-black/10" />
                            {/* Course icon/watermark */}
                            <div className="absolute top-3 right-3 opacity-20">
                              <BookOpen className="h-16 w-16 text-white" />
                            </div>
                            {/* Mini play button overlay on hover */}
                            <AnimatePresence>
                              {isHovered && (
                                <motion.div
                                  className="absolute inset-0 flex items-center justify-center bg-black/20 z-20"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <motion.div
                                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                  >
                                    <Play className="h-5 w-5 text-emerald-600 ml-0.5" />
                                  </motion.div>
                                </motion.div>
                              )}
                            </AnimatePresence>
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

                          {/* Mini curriculum progress bar with shimmer */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground">{completed} of {total} lessons</span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{enrollment.progress}%</span>
                            </div>
                            <AnimatedProgress value={enrollment.progress} barColor="from-emerald-500 to-teal-400" />
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
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {getRelativeTime(enrollment.lastAccessedAt)}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Timer className="h-3 w-3" />
                                ~{estimatedTime} left
                              </span>
                            </div>
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

        {/* ============ DAILY CHALLENGE + WEEKLY STATS ROW ============ */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Section delay={0.17}>
            <DailyChallengeWidget />
          </Section>
          <Section delay={0.19}>
            <WeeklyLearningStats />
          </Section>
        </div>

        {/* ============ MIDDLE ROW: ACTIVITY FEED + LEADERBOARD + DAILY GOAL ============ */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Activity Feed (ENHANCED - Timeline style with expandable details) */}
          <Section delay={0.2}>
            <Card className="border-border dark:border-slate-800 h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Recent Activity
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground h-6 px-2">
                    View All
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-0">
                <div className="max-h-96 overflow-y-auto scrollbar-thin">
                  <AnimatePresence>
                    {(showAllActivities ? activityItems : activityItems.slice(0, 4)).map((activity, i) => {
                      const ActivityIcon = activity.icon;
                      const isLast = i === (showAllActivities ? activityItems.length - 1 : 3);
                      const isExpanded = expandedActivity === activity.id;
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.05 * i }}
                          className="relative"
                        >
                          <div
                            className="relative flex items-start gap-3 py-3 cursor-pointer group"
                            onClick={() => setExpandedActivity(isExpanded ? null : activity.id)}
                          >
                            {/* Timeline dot and animated line */}
                            <div className="flex flex-col items-center shrink-0">
                              <motion.div
                                className={cn(
                                  'flex h-8 w-8 items-center justify-center rounded-full z-10',
                                  activity.bgCircle,
                                  'ring-2 ring-white dark:ring-slate-900'
                                )}
                                whileHover={{ scale: 1.1 }}
                              >
                                <ActivityIcon className={cn('h-4 w-4', activity.color)} />
                              </motion.div>
                              {/* Animated connecting line */}
                              {!isLast && (
                                <motion.div
                                  className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 mt-1 origin-top"
                                  initial={{ scaleY: 0 }}
                                  animate={{ scaleY: 1 }}
                                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                                />
                              )}
                            </div>
                            {/* Activity content */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <div className={cn('h-1.5 w-1.5 rounded-full', activity.bgColor)} />
                                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                  {activity.type}
                                </span>
                                {/* Relative time badge */}
                                <Badge variant="secondary" className="text-[9px] h-4 px-1.5 ml-auto shrink-0">
                                  {getRelativeTime(activity.time)}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-900 dark:text-slate-100 line-clamp-2">
                                {activity.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {activity.detail && (
                                  <p className="text-xs text-muted-foreground">{activity.detail}</p>
                                )}
                              </div>
                              {/* Expand indicator */}
                              <motion.span
                                className="text-[10px] text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 inline-flex items-center gap-0.5"
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                              >
                                <ChevronRight className="h-3 w-3" />
                                {isExpanded ? 'Hide details' : 'Show details'}
                              </motion.span>
                            </div>
                          </div>
                          {/* Expandable details */}
                          <AnimatePresence>
                            {isExpanded && activity.expandedDetail && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden ml-11 mb-2"
                              >
                                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs text-muted-foreground border border-slate-100 dark:border-slate-700">
                                  {activity.expandedDetail}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
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

          {/* Leaderboard Preview (ENHANCED with score bars and period toggle) */}
          <Section delay={0.25}>
            <Card className="border-border dark:border-slate-800 h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Leaderboard
                  </CardTitle>
                  {/* Weekly/Monthly toggle */}
                  <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5">
                    <button
                      className={cn(
                        'px-2 py-0.5 text-[10px] font-medium rounded-md transition-all',
                        leaderboardPeriod === 'weekly'
                          ? 'bg-white dark:bg-slate-700 text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                      onClick={() => setLeaderboardPeriod('weekly')}
                    >
                      Weekly
                    </button>
                    <button
                      className={cn(
                        'px-2 py-0.5 text-[10px] font-medium rounded-md transition-all',
                        leaderboardPeriod === 'monthly'
                          ? 'bg-white dark:bg-slate-700 text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                      onClick={() => setLeaderboardPeriod('monthly')}
                    >
                      Monthly
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-0">
                <div className="space-y-1">
                  {topFive.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Trophy className="h-8 w-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">No leaderboard data yet</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Complete lessons to appear here!</p>
                    </div>
                  ) : (
                  topFive.map((entry, i) => {
                    const isCurrentUser = entry.name === currentUser?.name;
                    const rankStyle = getRankBadgeStyle(entry.rank);
                    const avatarGradient = getAvatarColor(entry.name);
                    const initials = getInitials(entry.name);
                    const pointChange = getPointChange(entry.rank);
                    const scorePercent = maxLeaderboardPoints > 0 ? (entry.points / maxLeaderboardPoints) * 100 : 0;

                    return (
                      <motion.div
                        key={entry.rank}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * i, type: 'spring', stiffness: 150 }}
                        className={cn(
                          'relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
                          isCurrentUser
                            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-500/30 dark:border-emerald-800'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        )}
                      >
                        {/* Rank badge with gradient and shadow */}
                        <div className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                          rankStyle.bg,
                          rankStyle.text,
                          rankStyle.shadow
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
                        {/* Name & score bar */}
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
                          {/* Score bar */}
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <motion.div
                                className={cn(
                                  'h-full rounded-full',
                                  isCurrentUser
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                    : 'bg-gradient-to-r from-slate-400 to-slate-300 dark:from-slate-500 dark:to-slate-400'
                                )}
                                initial={{ width: 0 }}
                                animate={{ width: `${scorePercent}%` }}
                                transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground shrink-0">{entry.points.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
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
                  })
                  )}
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
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-4 text-white">
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

        {/* ============ RECOMMENDED COURSES (ENHANCED - Horizontal Scrollable) ============ */}
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
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
              {recommendedCourses.map((course, i) => {
                const difficultyStyle = getDifficultyStyle(course.level);
                const isHovered = hoveredRecommendation === course.id;
                const reason = getRecommendationReason(course.id);

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * i }}
                    className="min-w-[280px] sm:min-w-[320px]"
                    onMouseEnter={() => setHoveredRecommendation(course.id)}
                    onMouseLeave={() => setHoveredRecommendation(null)}
                  >
                    <TiltCard>
                      <Card className="overflow-hidden border-border dark:border-slate-800 hover:shadow-xl transition-all duration-300 group cursor-pointer relative">
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
