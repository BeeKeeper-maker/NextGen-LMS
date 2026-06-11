'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { demoAchievements, leaderboardData } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Star,
  Lock,
  Flame,
  Award,
  TrendingUp,
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  Crown,
  ChevronDown,
  ChevronUp,
  Zap,
  Users,
  BookOpen,
  Target,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────
// Types & Constants
// ─────────────────────────────────────────────────────────────

type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';
type AchievementCategory = 'learning' | 'streak' | 'social' | 'mastery' | 'community' | 'special';

interface AchievementMeta {
  tier: BadgeTier;
  category: AchievementCategory;
}

const tierConfig: Record<BadgeTier, { label: string; colors: string; border: string; glow: string }> = {
  bronze: {
    label: 'Bronze',
    colors: 'from-amber-600 to-orange-700',
    border: 'border-amber-500',
    glow: 'shadow-amber-500/30',
  },
  silver: {
    label: 'Silver',
    colors: 'from-slate-300 to-slate-500',
    border: 'border-slate-400',
    glow: 'shadow-slate-400/30',
  },
  gold: {
    label: 'Gold',
    colors: 'from-yellow-400 to-amber-500',
    border: 'border-yellow-400',
    glow: 'shadow-yellow-400/30',
  },
  platinum: {
    label: 'Platinum',
    colors: 'from-cyan-300 to-teal-500',
    border: 'border-cyan-400',
    glow: 'shadow-cyan-400/30',
  },
};

const categoryConfig: Record<AchievementCategory, { label: string; emoji: string; gradient: string; headerBg: string }> = {
  learning: { label: 'Learning', emoji: '📚', gradient: 'from-emerald-500 to-teal-600', headerBg: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30' },
  streak: { label: 'Streak', emoji: '🔥', gradient: 'from-orange-500 to-red-500', headerBg: 'from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30' },
  social: { label: 'Social', emoji: '💬', gradient: 'from-pink-500 to-rose-500', headerBg: 'from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30' },
  mastery: { label: 'Mastery', emoji: '🏆', gradient: 'from-yellow-500 to-amber-600', headerBg: 'from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30' },
  community: { label: 'Community', emoji: '🤝', gradient: 'from-violet-500 to-purple-600', headerBg: 'from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30' },
  special: { label: 'Special', emoji: '⚡', gradient: 'from-cyan-500 to-blue-600', headerBg: 'from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30' },
};

// Map each achievement to its tier and category
const achievementMeta: Record<string, AchievementMeta> = {
  'ach-1': { tier: 'bronze', category: 'learning' },
  'ach-2': { tier: 'silver', category: 'learning' },
  'ach-3': { tier: 'bronze', category: 'streak' },
  'ach-4': { tier: 'gold', category: 'streak' },
  'ach-5': { tier: 'gold', category: 'mastery' },
  'ach-6': { tier: 'silver', category: 'community' },
  'ach-7': { tier: 'platinum', category: 'learning' },
  'ach-8': { tier: 'platinum', category: 'mastery' },
};

// Earned achievements map
const earnedAchievementIds: Record<string, { earned: boolean; earnedAt?: string }> = {
  'ach-1': { earned: true, earnedAt: '2024-08-16T00:00:00Z' },
  'ach-2': { earned: true, earnedAt: '2024-09-10T00:00:00Z' },
  'ach-3': { earned: true, earnedAt: '2024-09-05T00:00:00Z' },
  'ach-4': { earned: true, earnedAt: '2024-10-12T00:00:00Z' },
  'ach-5': { earned: false },
  'ach-6': { earned: true, earnedAt: '2024-09-20T00:00:00Z' },
  'ach-7': { earned: true, earnedAt: '2024-08-20T00:00:00Z' },
  'ach-8': { earned: false },
};

// Milestones
const milestones = [
  { id: 'm1', label: 'First Lesson', xp: 10, icon: BookOpen },
  { id: 'm2', label: 'Course Complete', xp: 150, icon: GraduationCap },
  { id: 'm3', label: '5 Courses', xp: 500, icon: Target },
  { id: 'm4', label: '100 Day Streak', xp: 300, icon: Flame },
  { id: 'm5', label: 'Community Leader', xp: 200, icon: Users },
  { id: 'm6', label: 'Master Learner', xp: 1000, icon: Crown },
];
const completedMilestones = 4; // First 4 are completed, 5th is current

// Weekly change data for leaderboard
const weeklyChanges: Record<string, number> = {
  'Emma Rodriguez': 1,
  'David Park': -1,
  'Sarah Mitchell': 2,
  'Lisa Wang': 0,
  'Alex Johnson': 3,
  'Mike Chen': -2,
  'Jordan Lee': 1,
  'Priya Sharma': 0,
  'Tom Wilson': -1,
  'Nina Kovac': 2,
};

// ─────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─────────────────────────────────────────────────────────────
// Animated Counter
// ─────────────────────────────────────────────────────────────

function AnimatedCounter({ target, duration = 1.5 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let rafId: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return <>{count.toLocaleString()}</>;
}

// ─────────────────────────────────────────────────────────────
// Progress Ring Component (SVG)
// ─────────────────────────────────────────────────────────────

function ProgressRing({
  size = 120,
  strokeWidth = 8,
  progress = 0,
  gradientId = 'ring-gradient',
  animate = true,
  label,
  sublabel,
}: {
  size?: number;
  strokeWidth?: number;
  progress?: number;
  gradientId?: string;
  animate?: boolean;
  label?: string;
  sublabel?: string;
}) {
  const [animatedProgress, setAnimatedProgress] = useState(animate ? 0 : progress);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setAnimatedProgress(progress), 200);
    return () => clearTimeout(timer);
  }, [progress, animate]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-700"
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <span className="text-lg font-bold text-slate-900 dark:text-slate-50">
            {Math.round(animatedProgress)}%
          </span>
        )}
        {sublabel && (
          <span className="text-[10px] text-muted-foreground leading-tight text-center">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Achievement Badge Tile
// ─────────────────────────────────────────────────────────────

function BadgeTile({
  achievement,
  isEarned,
  earnedAt,
  index,
}: {
  achievement: typeof demoAchievements[0];
  isEarned: boolean;
  earnedAt?: string;
  index: number;
}) {
  const meta = achievementMeta[achievement.id] || { tier: 'bronze' as BadgeTier, category: 'learning' as AchievementCategory };
  const tier = tierConfig[meta.tier];
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.06 * index }}
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <motion.div
        whileHover={{ scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className={cn(
          'relative flex flex-col items-center rounded-2xl p-4 transition-all duration-300',
          isEarned
            ? cn('bg-white dark:bg-slate-900 border-2', tier.border, 'shadow-lg', tier.glow)
            : 'bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700'
        )}
      >
        {/* Glow effect for earned */}
        {isEarned && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 dark:from-emerald-500/10 dark:to-cyan-500/10" />
        )}

        {/* Tier badge indicator */}
        {isEarned && (
          <div className={cn(
            'absolute -top-2 -right-2 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white bg-gradient-to-r',
            tier.colors
          )}>
            {tier.label}
          </div>
        )}

        {/* Badge shape - circular with gradient border */}
        <div className="relative mb-3">
          {isEarned ? (
            <>
              {/* Sparkle animation */}
              <motion.div
                className="absolute -top-1 -right-1 z-10"
                animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
              </motion.div>
              {/* Gradient border circle */}
              <div className={cn(
                'flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br p-[2px] shadow-lg',
                tier.colors
              )}>
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-slate-900 text-2xl">
                  {achievement.icon}
                </div>
              </div>
            </>
          ) : (
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 grayscale">
              <span className="text-2xl opacity-40">{achievement.icon}</span>
              {/* Lock overlay */}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/30">
                <Lock className="h-5 w-5 text-slate-300" />
              </div>
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className={cn(
          'text-xs font-semibold text-center mb-1 line-clamp-1',
          isEarned ? 'text-slate-900 dark:text-slate-50' : 'text-slate-400 dark:text-slate-500'
        )}>
          {achievement.name}
        </h3>

        {/* Points */}
        <div className={cn(
          'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
          isEarned
            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
        )}>
          <Star className="h-2.5 w-2.5" />
          {achievement.points}
        </div>

        {/* Category label */}
        <div className={cn(
          'mt-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium',
          isEarned
            ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            : 'bg-slate-50 text-slate-400 dark:bg-slate-900 dark:text-slate-600'
        )}>
          {categoryConfig[meta.category].emoji} {categoryConfig[meta.category].label}
        </div>
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-3 pointer-events-none"
          >
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-50 mb-1">
              {achievement.name}
            </p>
            <p className="text-[10px] text-muted-foreground mb-1.5">
              {achievement.description}
            </p>
            {isEarned && earnedAt && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-2.5 w-2.5" />
                Earned {formatDate(earnedAt)}
              </p>
            )}
            {!isEarned && (
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <Lock className="h-2.5 w-2.5" />
                Locked
              </p>
            )}
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="h-2.5 w-2.5 rotate-45 bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Category Section
// ─────────────────────────────────────────────────────────────

function CategorySection({
  category,
  achievements,
  earnedMap,
  delay = 0,
}: {
  category: AchievementCategory;
  achievements: typeof demoAchievements;
  earnedMap: typeof earnedAchievementIds;
  delay?: number;
}) {
  const config = categoryConfig[category];
  const [isExpanded, setIsExpanded] = useState(true);
  const earnedInCategory = achievements.filter((a) => earnedMap[a.id]?.earned).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {/* Category Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between rounded-xl px-4 py-3 mb-3 bg-gradient-to-r',
          config.headerBg
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.emoji}</span>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            {config.label}
          </span>
          <Badge variant="secondary" className="text-[10px] h-5">
            {earnedInCategory}/{achievements.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {/* Mini progress ring */}
          <ProgressRing
            size={32}
            strokeWidth={4}
            progress={achievements.length > 0 ? (earnedInCategory / achievements.length) * 100 : 0}
            gradientId={`cat-ring-${category}`}
            animate={false}
          />
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Category Badges Grid */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 pb-4">
              {achievements.map((achievement, i) => {
                const earnedStatus = earnedMap[achievement.id];
                return (
                  <BadgeTile
                    key={achievement.id}
                    achievement={achievement}
                    isEarned={earnedStatus?.earned || false}
                    earnedAt={earnedStatus?.earnedAt}
                    index={i}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Milestone Tracker
// ─────────────────────────────────────────────────────────────

function MilestoneTracker() {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-center min-w-[600px] sm:min-w-0 px-2">
        {milestones.map((milestone, i) => {
          const isCompleted = i < completedMilestones;
          const isCurrent = i === completedMilestones;
          const isUpcoming = i > completedMilestones;
          const Icon = milestone.icon;

          return (
            <div key={milestone.id} className="flex items-center flex-1">
              {/* Node */}
              <div className="flex flex-col items-center relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                  className={cn(
                    'relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 transition-all',
                    isCompleted && 'border-emerald-500 bg-emerald-500 text-white',
                    isCurrent && 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
                    isUpcoming && 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}

                  {/* Pulsing ring for current */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-amber-500"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </motion.div>

                {/* Label */}
                <span className={cn(
                  'mt-1.5 text-[10px] sm:text-xs font-medium text-center max-w-[80px] leading-tight',
                  isCompleted && 'text-emerald-700 dark:text-emerald-400',
                  isCurrent && 'text-amber-700 dark:text-amber-400',
                  isUpcoming && 'text-slate-400 dark:text-slate-500'
                )}>
                  {milestone.label}
                </span>

                {/* XP reward */}
                <span className={cn(
                  'mt-0.5 text-[9px] font-medium flex items-center gap-0.5',
                  isCompleted && 'text-emerald-600 dark:text-emerald-400',
                  isCurrent && 'text-amber-600 dark:text-amber-400',
                  isUpcoming && 'text-slate-400 dark:text-slate-500'
                )}>
                  <Zap className="h-2.5 w-2.5" />
                  {milestone.xp} XP
                </span>
              </div>

              {/* Connector line */}
              {i < milestones.length - 1 && (
                <div className="flex-1 mx-1 sm:mx-2 relative h-0.5 min-w-[24px]">
                  {/* Background line */}
                  <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  {/* Animated progress line */}
                  <motion.div
                    className={cn(
                      'absolute inset-y-0 left-0 rounded-full',
                      i < completedMilestones
                        ? 'bg-emerald-500'
                        : i === completedMilestones
                          ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                          : 'bg-transparent'
                    )}
                    initial={{ width: '0%' }}
                    animate={{ width: i < completedMilestones ? '100%' : i === completedMilestones ? '50%' : '0%' }}
                    transition={{ duration: 1, delay: 0.3 + 0.15 * i, ease: 'easeOut' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Podium Display (Top 3)
// ─────────────────────────────────────────────────────────────

function PodiumDisplay() {
  const top3 = leaderboardData.slice(0, 3);
  // Reorder: 2nd, 1st, 3rd for podium visual
  const podiumOrder = [top3[1], top3[0], top3[2]];
  const podiumPositions = [2, 1, 3] as const;
  const podiumColors = [
    { border: 'from-slate-300 to-slate-500', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300', barBg: 'bg-gradient-to-r from-slate-400 to-slate-500', height: 'h-16' },
    { border: 'from-yellow-400 to-amber-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30', text: 'text-yellow-600 dark:text-yellow-400', barBg: 'bg-gradient-to-r from-yellow-400 to-amber-500', height: 'h-24' },
    { border: 'from-amber-600 to-orange-700', bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', barBg: 'bg-gradient-to-r from-amber-600 to-orange-700', height: 'h-12' },
  ];

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6 pt-6 pb-2">
      {podiumOrder.map((entry, i) => {
        if (!entry) return null;
        const pos = podiumPositions[i];
        const style = podiumColors[i];
        const isCenter = pos === 1;
        const change = weeklyChanges[entry.name] || 0;

        return (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * i + 0.2 }}
            className="flex flex-col items-center"
          >
            {/* Avatar */}
            <div className="relative mb-2">
              {isCenter && (
                <motion.div
                  className="absolute -top-5 left-1/2 -translate-x-1/2"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Crown className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                </motion.div>
              )}
              <div className={cn(
                'flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full text-sm font-bold bg-gradient-to-br p-[2px] shadow-lg',
                style.border
              )}>
                <div className={cn('flex h-full w-full items-center justify-center rounded-full', style.bg, style.text)}>
                  {entry.name.split(' ').map((n) => n[0]).join('')}
                </div>
              </div>
            </div>

            {/* Name */}
            <p className={cn('text-xs sm:text-sm font-semibold text-center', style.text)}>
              {entry.name.split(' ')[0]}
            </p>

            {/* Points */}
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {entry.points.toLocaleString()} pts
            </p>

            {/* Weekly change */}
            <div className={cn(
              'mt-0.5 flex items-center gap-0.5 text-[9px] font-medium',
              change > 0 ? 'text-emerald-500' : change < 0 ? 'text-red-500' : 'text-slate-400'
            )}>
              {change > 0 && <ArrowUp className="h-2.5 w-2.5" />}
              {change < 0 && <ArrowDown className="h-2.5 w-2.5" />}
              {change === 0 && <Minus className="h-2.5 w-2.5" />}
              {change !== 0 ? Math.abs(change) : '–'}
            </div>

            {/* XP Bar */}
            <div className="mt-1.5 w-16 sm:w-20">
              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <motion.div
                  className={cn('h-full rounded-full', style.barBg)}
                  initial={{ width: 0 }}
                  animate={{ width: `${(entry.points / 4250) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 + 0.1 * i }}
                />
              </div>
            </div>

            {/* Podium block */}
            <div className={cn('mt-2 w-16 sm:w-20 rounded-t-lg flex items-start justify-center pt-1.5', style.height, style.barBg)}>
              <span className="text-white text-sm font-bold">#{pos}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section Animation Wrapper
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export function LearnerAchievements() {
  const { currentUser } = useAppStore();

  // Calculate achievement stats
  const totalAchievements = demoAchievements.length;
  const earnedCount = demoAchievements.filter(
    (a) => earnedAchievementIds[a.id]?.earned
  ).length;
  const totalPoints = demoAchievements.reduce((sum, a) => {
    return sum + (earnedAchievementIds[a.id]?.earned ? a.points : 0);
  }, 0);
  const maxPoints = demoAchievements.reduce((sum, a) => sum + a.points, 0);
  const overallProgress = Math.round((earnedCount / totalAchievements) * 100);

  // Level calculation
  const currentLevel = Math.floor(totalPoints / 200) + 1;
  const pointsInCurrentLevel = totalPoints % 200;
  const pointsForNextLevel = 200;

  // Group achievements by category
  const groupedAchievements = useCallback(() => {
    const groups: Record<AchievementCategory, typeof demoAchievements> = {
      learning: [],
      streak: [],
      social: [],
      mastery: [],
      community: [],
      special: [],
    };
    demoAchievements.forEach((a) => {
      const meta = achievementMeta[a.id];
      if (meta) {
        groups[meta.category].push(a);
      }
    });
    return groups;
  }, [])();

  // Category progress for rings
  const categoryProgress: Record<AchievementCategory, number> = {
    learning: groupedAchievements.learning.length > 0
      ? Math.round((groupedAchievements.learning.filter((a) => earnedAchievementIds[a.id]?.earned).length / groupedAchievements.learning.length) * 100)
      : 0,
    streak: groupedAchievements.streak.length > 0
      ? Math.round((groupedAchievements.streak.filter((a) => earnedAchievementIds[a.id]?.earned).length / groupedAchievements.streak.length) * 100)
      : 0,
    social: groupedAchievements.social.length > 0
      ? Math.round((groupedAchievements.social.filter((a) => earnedAchievementIds[a.id]?.earned).length / groupedAchievements.social.length) * 100)
      : 0,
    mastery: groupedAchievements.mastery.length > 0
      ? Math.round((groupedAchievements.mastery.filter((a) => earnedAchievementIds[a.id]?.earned).length / groupedAchievements.mastery.length) * 100)
      : 0,
    community: groupedAchievements.community.length > 0
      ? Math.round((groupedAchievements.community.filter((a) => earnedAchievementIds[a.id]?.earned).length / groupedAchievements.community.length) * 100)
      : 0,
    special: groupedAchievements.special.length > 0
      ? Math.round((groupedAchievements.special.filter((a) => earnedAchievementIds[a.id]?.earned).length / groupedAchievements.special.length) * 100)
      : 0,
  };

  // Global rank (Alex Johnson is #5)
  const globalRank = 5;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
        {/* ============ HEADER ============ */}
        <Section delay={0}>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => useAppStore.getState().setView('learner-dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                Achievements & Leaderboard
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Track your progress, earn badges, and compete with others
              </p>
            </div>
          </div>
        </Section>

        {/* ============ STATS SUMMARY CARDS (Glassmorphism) ============ */}
        <Section delay={0.05}>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {/* Total XP */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <div className="relative overflow-hidden rounded-2xl border border-yellow-200/50 dark:border-yellow-800/30 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-lg">
                <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-yellow-400/20 blur-2xl" />
                <div className="p-4 sm:p-5 relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-md">
                      <Star className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">Total XP</p>
                      <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                        <AnimatedCounter target={totalPoints} />
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    +340 this week
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Current Level */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="relative overflow-hidden rounded-2xl border border-emerald-200/50 dark:border-emerald-800/30 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-lg">
                <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-emerald-400/20 blur-2xl" />
                <div className="p-4 sm:p-5 relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md">
                      <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">Level</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                          {currentLevel}
                        </p>
                        <span className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                          LVL
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(pointsInCurrentLevel / pointsForNextLevel) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Achievements Unlocked */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <div className="relative overflow-hidden rounded-2xl border border-violet-200/50 dark:border-violet-800/30 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-lg">
                <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-violet-400/20 blur-2xl" />
                <div className="p-4 sm:p-5 relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 shadow-md">
                      <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">Unlocked</p>
                      <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                        {earnedCount}<span className="text-sm font-normal text-muted-foreground">/{totalAchievements}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${overallProgress}%` }}
                      transition={{ duration: 1, delay: 0.6 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Global Rank */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="relative overflow-hidden rounded-2xl border border-cyan-200/50 dark:border-cyan-800/30 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-lg">
                <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-cyan-400/20 blur-2xl" />
                <div className="p-4 sm:p-5 relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-md">
                      <Award className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">Global Rank</p>
                      <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                        #{globalRank}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                    <ArrowUp className="h-3 w-3" />
                    Up 3 this week
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Section>

        {/* ============ OVERALL PROGRESS RING + LEVEL ============ */}
        <Section delay={0.1}>
          <Card className="border-border dark:border-slate-800 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Large progress ring */}
                <div className="flex-shrink-0">
                  <ProgressRing
                    size={140}
                    strokeWidth={10}
                    progress={overallProgress}
                    gradientId="overall-ring"
                    sublabel="Overall"
                  />
                </div>

                {/* Level & progress details */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500">
                      <Crown className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-50">
                      Level {currentLevel}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {pointsInCurrentLevel}/{pointsForNextLevel} XP
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Earn {pointsForNextLevel - pointsInCurrentLevel} more XP to reach Level {currentLevel + 1}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {totalPoints} total points earned
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      {Math.round((totalPoints / maxPoints) * 100)}% of all achievement points
                    </span>
                  </div>

                  {/* Per-category mini rings */}
                  <div className="mt-4 flex items-center gap-4 justify-center sm:justify-start">
                    {(Object.keys(categoryConfig) as AchievementCategory[]).map((cat) => {
                      const config = categoryConfig[cat];
                      const progress = categoryProgress[cat];
                      if (groupedAchievements[cat].length === 0) return null;
                      return (
                        <div key={cat} className="flex flex-col items-center gap-1">
                          <ProgressRing
                            size={44}
                            strokeWidth={4}
                            progress={progress}
                            gradientId={`mini-ring-${cat}`}
                          />
                          <span className="text-[9px] text-muted-foreground">{config.emoji}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* ============ MILESTONE TRACKER ============ */}
        <Section delay={0.15}>
          <Card className="border-border dark:border-slate-800 overflow-hidden">
            <Card className="border-0 shadow-none">
              <CardContent className="p-5 pb-0">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Target className="h-5 w-5 text-emerald-500" />
                    Learning Path
                  </h2>
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    {completedMilestones}/{milestones.length} completed
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <CardContent className="px-5 pb-5 pt-2">
              <MilestoneTracker />
            </CardContent>
          </Card>
        </Section>

        {/* ============ ACHIEVEMENT BADGES BY CATEGORY ============ */}
        <Section delay={0.2}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Award className="h-5 w-5 text-violet-500" />
              Achievement Badges
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                {earnedCount} Earned
              </Badge>
              <Badge variant="secondary" className="text-xs gap-1">
                <Lock className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                {totalAchievements - earnedCount} Locked
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            {(Object.keys(categoryConfig) as AchievementCategory[]).map((category, i) => {
              const categoryAchievements = groupedAchievements[category];
              if (categoryAchievements.length === 0) return null;
              return (
                <CategorySection
                  key={category}
                  category={category}
                  achievements={categoryAchievements}
                  earnedMap={earnedAchievementIds}
                  delay={0.05 * i}
                />
              );
            })}
          </div>
        </Section>

        {/* ============ LEADERBOARD WITH PODIUM ============ */}
        <Section delay={0.25}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Global Leaderboard
            </h2>
            <Badge variant="secondary" className="text-xs">This Week</Badge>
          </div>

          <Card className="border-border dark:border-slate-800 overflow-hidden">
            <CardContent className="p-0">
              {/* Podium for top 3 */}
              <div className="bg-gradient-to-b from-yellow-50/50 to-transparent dark:from-yellow-950/10 dark:to-transparent pb-4">
                <PodiumDisplay />
              </div>

              {/* Divider */}
              <div className="h-px bg-border dark:bg-slate-800" />

              {/* Remaining leaderboard entries (4-10) */}
              <div>
                {/* Header row */}
                <div className="flex items-center gap-4 px-5 py-3 border-b border-border dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs font-medium text-muted-foreground">
                  <div className="w-10 text-center">Rank</div>
                  <div className="flex-1">Name</div>
                  <div className="w-20 text-right hidden sm:block">Points</div>
                  <div className="w-16 text-right hidden sm:block">Streak</div>
                  <div className="w-24 text-right hidden md:block">Courses</div>
                  <div className="w-10 text-center hidden sm:block">Change</div>
                </div>

                {leaderboardData.slice(3).map((entry, i) => {
                  const isCurrentUser = entry.name === 'Alex Johnson';
                  const change = weeklyChanges[entry.name] || 0;

                  return (
                    <motion.div
                      key={entry.rank}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 * i }}
                      className={cn(
                        'flex items-center gap-4 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/50 last:border-0 transition-colors',
                        isCurrentUser
                          ? 'bg-emerald-50 dark:bg-emerald-950/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                      )}
                    >
                      {/* Rank */}
                      <div className="w-10 text-center">
                        <span className={cn(
                          'inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                          isCurrentUser
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        )}>
                          {entry.rank}
                        </span>
                      </div>

                      {/* Name + avatar */}
                      <div className="flex-1 flex items-center gap-3 min-w-0">
                        <div className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold border-2',
                          isCurrentUser
                            ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white border-emerald-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        )}>
                          {entry.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className={cn(
                            'text-sm font-medium truncate',
                            isCurrentUser ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-slate-100'
                          )}>
                            {entry.name}
                            {isCurrentUser && (
                              <span className="ml-1.5 text-xs font-normal text-emerald-500">(You)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {entry.points.toLocaleString()} pts · 🔥 {entry.streak}
                          </p>
                        </div>
                      </div>

                      {/* Points */}
                      <div className="w-20 text-right hidden sm:block">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {entry.points.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground ml-0.5">pts</span>
                      </div>

                      {/* Streak */}
                      <div className="w-16 text-right hidden sm:flex sm:items-center sm:justify-end sm:gap-1">
                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{entry.streak}</span>
                      </div>

                      {/* Courses */}
                      <div className="w-24 text-right hidden md:flex md:items-center md:justify-end md:gap-1">
                        <GraduationCap className="h-3.5 w-3.5 text-violet-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{entry.coursesCompleted}</span>
                      </div>

                      {/* Weekly Change */}
                      <div className="w-10 text-center hidden sm:flex sm:items-center sm:justify-center">
                        <span className={cn(
                          'inline-flex items-center gap-0.5 text-xs font-medium',
                          change > 0 ? 'text-emerald-500' : change < 0 ? 'text-red-500' : 'text-slate-400'
                        )}>
                          {change > 0 && <ArrowUp className="h-3 w-3" />}
                          {change < 0 && <ArrowDown className="h-3 w-3" />}
                          {change === 0 && <Minus className="h-3 w-3" />}
                          {change !== 0 ? Math.abs(change) : ''}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Bottom spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
}
