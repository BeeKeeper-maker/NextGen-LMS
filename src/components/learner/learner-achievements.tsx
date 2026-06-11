'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { demoAchievements, leaderboardData } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Define which achievements are earned
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

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Animated progress
function AnimatedProgress({ value, className }: { value: number; className?: string }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 150);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={cn('relative h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700', className)}>
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-emerald-500"
        initial={{ width: 0 }}
        animate={{ width: `${animatedValue}%` }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
      />
    </div>
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
  const levelProgress = Math.round((earnedCount / totalAchievements) * 100);

  // Level calculation
  const currentLevel = Math.floor(totalPoints / 200) + 1;
  const pointsInCurrentLevel = totalPoints % 200;
  const pointsForNextLevel = 200;

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

        {/* ============ ACHIEVEMENT SUMMARY ============ */}
        <Section delay={0.05}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Points */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <Card className="border-yellow-200 dark:border-yellow-800/40 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 h-20 w-20 -translate-y-6 translate-x-6 rounded-full bg-yellow-200/30 dark:bg-yellow-800/20 blur-xl" />
                <CardContent className="p-5 relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-900/40">
                      <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Points</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                        {totalPoints.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements Earned */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="border-violet-200 dark:border-violet-800/40 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 h-20 w-20 -translate-y-6 translate-x-6 rounded-full bg-violet-200/30 dark:bg-violet-800/20 blur-xl" />
                <CardContent className="p-5 relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/40">
                      <Trophy className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Achievements</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                        {earnedCount} <span className="text-base font-normal text-muted-foreground">/ {totalAchievements}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Current Level */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <Card className="border-emerald-500/30 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 h-20 w-20 -translate-y-6 translate-x-6 rounded-full bg-emerald-200/30 dark:bg-emerald-800/20 blur-xl" />
                <CardContent className="p-5 relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                      <Crown className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Level</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                        Level {currentLevel}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Streak */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border-orange-200 dark:border-orange-800/40 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 h-20 w-20 -translate-y-6 translate-x-6 rounded-full bg-orange-200/30 dark:bg-orange-800/20 blur-xl" />
                <CardContent className="p-5 relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/40">
                      <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Learning Streak</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                        {currentUser?.streakDays || 7} Days
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </Section>

        {/* Level Progress Bar */}
        <Section delay={0.1}>
          <Card className="border-border dark:border-slate-800">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-violet-500" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    Level {currentLevel} Progress
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {pointsInCurrentLevel} / {pointsForNextLevel} pts to Level {currentLevel + 1}
                </span>
              </div>
              <AnimatedProgress value={(pointsInCurrentLevel / pointsForNextLevel) * 100} />
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  {totalPoints} total points earned
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  {Math.round((totalPoints / maxPoints) * 100)}% of all achievement points
                </span>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* ============ ACHIEVEMENT GRID ============ */}
        <Section delay={0.15}>
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {demoAchievements.map((achievement, i) => {
              const earnedStatus = earnedAchievementIds[achievement.id];
              const isEarned = earnedStatus?.earned || false;

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.06 * i }}
                >
                  <Card
                    className={cn(
                      'relative overflow-hidden transition-all duration-300 group',
                      isEarned
                        ? 'border-emerald-500/30 dark:border-emerald-800/60 hover:shadow-lg hover:shadow-emerald-500/10'
                        : 'border-border dark:border-slate-800 opacity-70 hover:opacity-90'
                    )}
                  >
                    {/* Glow effect for earned achievements */}
                    {isEarned && (
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-violet-500/5 dark:from-emerald-500/10 dark:to-violet-500/10" />
                    )}

                    <CardContent className="p-5 text-center relative">
                      {/* Large emoji icon */}
                      <div className={cn(
                        'mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition-transform group-hover:scale-110',
                        isEarned
                          ? 'bg-gradient-to-br from-emerald-100 to-violet-100 dark:from-emerald-900/40 dark:to-violet-900/40 shadow-lg shadow-emerald-500/10'
                          : 'bg-slate-100 dark:bg-slate-800 grayscale'
                      )}>
                        {achievement.icon}
                      </div>

                      {/* Achievement name */}
                      <h3 className={cn(
                        'text-sm font-semibold mb-1',
                        isEarned
                          ? 'text-slate-900 dark:text-slate-50'
                          : 'text-slate-500 dark:text-slate-400'
                      )}>
                        {achievement.name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {achievement.description}
                      </p>

                      {/* Points */}
                      <div className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                        isEarned
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      )}>
                        <Star className="h-3 w-3" />
                        {achievement.points} pts
                      </div>

                      {/* Status indicator */}
                      {isEarned ? (
                        <div className="mt-3 flex items-center justify-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Earned {formatDate(earnedStatus.earnedAt)}</span>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center justify-center gap-1 text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
                          <Lock className="h-3 w-3" />
                          <span>Locked</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </Section>

        {/* ============ FULL LEADERBOARD ============ */}
        <Section delay={0.2}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Global Leaderboard
            </h2>
            <Badge variant="secondary" className="text-xs">This Week</Badge>
          </div>
          <Card className="border-border dark:border-slate-800 overflow-hidden">
            <CardContent className="p-0">
              {/* Header row */}
              <div className="flex items-center gap-4 px-5 py-3 border-b border-border dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs font-medium text-muted-foreground">
                <div className="w-10 text-center">Rank</div>
                <div className="flex-1">Name</div>
                <div className="w-20 text-right hidden sm:block">Points</div>
                <div className="w-16 text-right hidden sm:block">Streak</div>
                <div className="w-24 text-right hidden md:block">Courses</div>
              </div>

              {/* Leaderboard entries */}
              {leaderboardData.map((entry, i) => {
                const isCurrentUser = entry.name === 'Alex Johnson';
                const medalEmojis = ['🥇', '🥈', '🥉'];

                return (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * i }}
                    className={cn(
                      'flex items-center gap-4 px-5 py-4 border-b border-slate-100 dark:border-slate-800/50 last:border-0 transition-colors',
                      isCurrentUser
                        ? 'bg-emerald-50 dark:bg-emerald-950/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                    )}
                  >
                    {/* Rank */}
                    <div className="w-10 text-center">
                      {entry.rank <= 3 ? (
                        <span className="text-lg">{medalEmojis[entry.rank - 1]}</span>
                      ) : (
                        <span className={cn(
                          'inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                          isCurrentUser
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        )}>
                          {entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Name + avatar placeholder */}
                    <div className="flex-1 flex items-center gap-3 min-w-0">
                      <div className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                        entry.rank === 1 && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
                        entry.rank === 2 && 'bg-slate-200 text-slate-700 dark:text-slate-300 dark:bg-slate-700 dark:text-slate-300',
                        entry.rank === 3 && 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                        entry.rank > 3 && isCurrentUser && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                        entry.rank > 3 && !isCurrentUser && 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                      )}>
                        {entry.name.split(' ').map(n => n[0]).join('')}
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

                    {/* Courses completed */}
                    <div className="w-24 text-right hidden md:flex md:items-center md:justify-end md:gap-1">
                      <GraduationCap className="h-3.5 w-3.5 text-violet-500" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{entry.coursesCompleted}</span>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </Section>

        {/* Bottom spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
}
