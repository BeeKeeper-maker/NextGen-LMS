'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map,
  Check,
  Lock,
  Clock,
  BookOpen,
  Users,
  Star,
  ArrowRight,
  Trophy,
  Award,
  Flag,
  Play,
  Circle,
  ChevronRight,
  Search,
  Sparkles,
  Zap,
  Target,
  RotateCcw,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useLearningPaths } from '@/hooks/use-data';
import { useAppStore } from '@/store/app-store';
import { useQueryClient } from '@tanstack/react-query';
import { apiPost } from '@/lib/api';
import { toast } from 'sonner';

// ---- Types ----
type CourseStatus = 'completed' | 'current' | 'locked';

interface LearnerCourse {
  id: string;
  title: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  status: CourseStatus;
  isRequired: boolean;
  prerequisiteIds: string[];
  milestone?: string;
  progress?: number;
}

interface LearnerPath {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  courses: LearnerCourse[];
  enrolledAt: string;
  estimatedDuration: number;
  overallProgress: number;
  certificateEarned: boolean;
  nextCourse?: string;
}

interface AvailablePath {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  courseCount: number;
  enrolledCount: number;
  estimatedDuration: number;
  rating: number;
}

// ---- Helper to map API path data to LearnerPath ----
function mapApiPathToLearnerPath(apiPath: any, userEnrollment: any): LearnerPath {
  const progress = userEnrollment?.progress || 0;
  const courses: LearnerCourse[] = (apiPath.courses || []).map((pc: any, idx: number) => {
    const course = pc.course || {};
    let status: CourseStatus = 'locked';
    if (progress >= 100 || (userEnrollment?.status === 'completed')) {
      status = 'completed';
    } else if (idx === 0 || progress > (idx / apiPath.courses.length) * 100) {
      const courseProgress = Math.min(100, Math.max(0, Math.round((progress - (idx / apiPath.courses.length) * 100) / (1 / apiPath.courses.length) * 100)));
      if (courseProgress >= 100) status = 'completed';
      else status = 'current';
    }
    return {
      id: pc.id || course.id || `c-${idx}`,
      title: course.title || 'Untitled Course',
      duration: Math.round(course.durationHours || 0),
      level: (course.level || 'beginner') as LearnerCourse['level'],
      status,
      isRequired: pc.isRequired ?? true,
      prerequisiteIds: pc.prerequisiteIds ? pc.prerequisiteIds.split(',') : [],
      milestone: pc.milestone || undefined,
      progress: status === 'completed' ? 100 : status === 'current' ? Math.round((progress % (100 / apiPath.courses.length)) / (100 / apiPath.courses.length) * 100) : undefined,
    };
  });
  const currentCourse = courses.find(c => c.status === 'current');
  return {
    id: apiPath.id,
    name: apiPath.title,
    description: apiPath.description || '',
    category: apiPath.category || 'General',
    difficulty: (apiPath.level || 'beginner') as LearnerPath['difficulty'],
    courses,
    enrolledAt: userEnrollment?.startedAt || new Date().toISOString(),
    estimatedDuration: apiPath.estimatedDuration || 0,
    overallProgress: Math.round(progress),
    certificateEarned: userEnrollment?.status === 'completed',
    nextCourse: currentCourse?.title,
  };
}

function mapApiPathToAvailablePath(apiPath: any): AvailablePath {
  return {
    id: apiPath.id,
    name: apiPath.title,
    description: apiPath.description || '',
    category: apiPath.category || 'General',
    difficulty: (apiPath.level || 'beginner') as AvailablePath['difficulty'],
    courseCount: apiPath.courseCount || 0,
    enrolledCount: apiPath.enrolledCount || 0,
    estimatedDuration: apiPath.estimatedDuration || 0,
    rating: 4.5, // Default rating since API doesn't provide this
  };
}

// ---- Helper Components ----

function ProgressRing({ progress, size = 48, strokeWidth = 4 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-xs font-bold">{progress}%</span>
    </div>
  );
}

function RoadmapNode({ course, index, total }: { course: LearnerCourse; index: number; total: number }) {
  const statusConfig = {
    completed: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/50',
      border: 'border-emerald-300 dark:border-emerald-700',
      icon: <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
      lineColor: 'bg-emerald-400',
      text: 'text-emerald-700 dark:text-emerald-300',
      glow: '',
    },
    current: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      border: 'border-amber-300 dark:border-amber-700',
      icon: <Play className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
      lineColor: 'bg-amber-400',
      text: 'text-amber-700 dark:text-amber-300',
      glow: 'shadow-amber-200 dark:shadow-amber-900/50 shadow-lg',
    },
    locked: {
      bg: 'bg-slate-100 dark:bg-slate-800/50',
      border: 'border-slate-200 dark:border-slate-700',
      icon: <Lock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />,
      lineColor: 'bg-slate-200 dark:bg-slate-700',
      text: 'text-slate-500 dark:text-slate-400',
      glow: '',
    },
  };

  const config = statusConfig[course.status];
  const isLast = index === total - 1;

  return (
    <div className="flex gap-4">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1, type: 'spring', stiffness: 300, damping: 20 }}
          className={cn(
            'h-10 w-10 rounded-full flex items-center justify-center border-2 shrink-0',
            config.bg,
            config.border,
            config.glow,
            course.status === 'current' && 'animate-pulse'
          )}
        >
          {config.icon}
        </motion.div>
        {!isLast && (
          <div className={cn('w-0.5 flex-1 min-h-[40px] my-1', config.lineColor,
            course.status === 'locked' ? 'border-l-2 border-dashed border-slate-200 dark:border-slate-700 bg-transparent' : ''
          )} />
        )}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 + 0.05 }}
        className={cn(
          'flex-1 pb-6 min-w-0',
          isLast && 'pb-0'
        )}
      >
        <div className={cn(
          'rounded-xl border p-3 transition-all',
          config.bg,
          config.border,
          course.status === 'current' && 'ring-2 ring-amber-300/50 dark:ring-amber-700/50'
        )}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn('text-sm font-medium', config.text)}>{course.title}</span>
                {course.isRequired ? (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                    Required
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                    Optional
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" /> {course.duration}h
                </span>
                <span className="text-[10px] text-muted-foreground capitalize">{course.level}</span>
                {course.status === 'locked' && course.prerequisiteIds.length > 0 && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5" /> Complete prerequisites to unlock
                  </span>
                )}
              </div>
              {course.status === 'current' && course.progress !== undefined && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-1.5" />
                </div>
              )}
            </div>
            {course.status !== 'locked' && (
              <Button
                variant={course.status === 'current' ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'shrink-0 h-7 text-xs gap-1',
                  course.status === 'current' && 'bg-amber-500 hover:bg-amber-600 text-white'
                )}
              >
                {course.status === 'current' ? (
                  <><Play className="h-3 w-3" /> Continue</>
                ) : (
                  <><RotateCcw className="h-3 w-3" /> Review</>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Milestone */}
        {course.milestone && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className="mt-2 ml-2"
          >
            <div className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
              course.status === 'completed'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                : course.status === 'current'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            )}>
              <Flag className="h-3 w-3" />
              {course.milestone}
              {course.status === 'completed' && <Check className="h-3 w-3" />}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function PathCard({ path, onClick }: { path: LearnerPath; onClick: () => void }) {
  const completedCourses = path.courses.filter((c) => c.status === 'completed').length;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="cursor-pointer border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
        onClick={onClick}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <ProgressRing progress={path.overallProgress} />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate">{path.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{path.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <BookOpen className="h-3 w-3" /> {completedCourses}/{path.courses.length} courses
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {path.estimatedDuration}h
                </span>
              </div>
              {path.nextCourse && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                  <Play className="h-2.5 w-2.5" /> Next: {path.nextCourse}
                </div>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-foreground transition-colors" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AvailablePathCard({ path, onEnroll }: { path: AvailablePath; onEnroll: (id: string) => void }) {
  const difficultyColor = {
    beginner: 'text-emerald-600',
    intermediate: 'text-amber-600',
    advanced: 'text-rose-600',
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-cyan-400" />
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold">{path.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{path.description}</p>
          <div className="flex items-center gap-3 mt-3">
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">{path.category}</Badge>
            <span className={cn('text-[10px] font-medium', difficultyColor[path.difficulty])}>
              {path.difficulty.charAt(0).toUpperCase() + path.difficulty.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {path.courseCount} courses</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {path.enrolledCount}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {path.estimatedDuration}h</span>
            <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" /> {path.rating}</span>
          </div>
          <Button
            size="sm"
            className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 gap-1.5 h-8 text-xs"
            onClick={() => onEnroll(path.id)}
          >
            <Zap className="h-3 w-3" /> Enroll Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PathDetailView({ path, onBack }: { path: LearnerPath; onBack: () => void }) {
  const completedCourses = path.courses.filter((c) => c.status === 'completed').length;
  const currentCourse = path.courses.find((c) => c.status === 'current');
  const earnedMilestones = path.courses.filter((c) => c.milestone && c.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 mb-2 -ml-2 text-muted-foreground">
            <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Back to Paths
          </Button>
          <h2 className="text-xl font-bold">{path.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">{path.description}</p>
        </div>
        <ProgressRing progress={path.overallProgress} size={64} strokeWidth={5} />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Progress', value: `${path.overallProgress}%`, icon: Target, color: 'text-emerald-600' },
          { label: 'Completed', value: `${completedCourses}/${path.courses.length}`, icon: Check, color: 'text-emerald-600' },
          { label: 'Est. Time Left', value: `${Math.round(path.estimatedDuration * (1 - path.overallProgress / 100))}h`, icon: Clock, color: 'text-amber-600' },
          { label: 'Milestones', value: `${earnedMilestones.length}`, icon: Flag, color: 'text-purple-600' },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-3 text-center">
              <stat.icon className={cn('h-4 w-4 mx-auto mb-1', stat.color)} />
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Course Callout */}
      {currentCourse && (
        <Card className="border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Play className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Continue Learning</span>
                </div>
                <p className="text-sm text-foreground">{currentCourse.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-muted-foreground">{currentCourse.duration}h</span>
                  {currentCourse.progress !== undefined && (
                    <span className="text-[10px] font-medium text-amber-600">{currentCourse.progress}% complete</span>
                  )}
                </div>
              </div>
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1">
                <Play className="h-3.5 w-3.5" /> Resume
              </Button>
            </div>
            {currentCourse.progress !== undefined && (
              <Progress value={currentCourse.progress} className="h-1.5 mt-3" />
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roadmap */}
        <div className="lg:col-span-2">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Map className="h-4 w-4 text-emerald-600" /> Your Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {path.courses.map((course, idx) => (
                  <RoadmapNode key={course.id} course={course} index={idx} total={path.courses.length} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Milestones & Achievements */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-600" /> Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {path.courses.filter((c) => c.milestone).map((course) => (
                <div
                  key={course.id}
                  className={cn(
                    'flex items-center gap-3 p-2.5 rounded-lg',
                    course.status === 'completed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30'
                      : course.status === 'current'
                      ? 'bg-amber-50 dark:bg-amber-950/30'
                      : 'bg-slate-50 dark:bg-slate-800/30'
                  )}
                >
                  <div className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                    course.status === 'completed'
                      ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600'
                      : course.status === 'current'
                      ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                  )}>
                    {course.status === 'completed' ? (
                      <Check className="h-4 w-4" />
                    ) : course.status === 'current' ? (
                      <Flag className="h-4 w-4" />
                    ) : (
                      <Lock className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-xs font-medium',
                      course.status === 'locked' && 'text-muted-foreground'
                    )}>
                      {course.milestone}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{course.title}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Certificate */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" /> Certificate
              </CardTitle>
            </CardHeader>
            <CardContent>
              {path.certificateEarned ? (
                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 rounded-xl">
                  <Award className="h-10 w-10 mx-auto text-amber-500 mb-2" />
                  <p className="text-sm font-semibold">Certificate Earned!</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Full-Stack Web Developer</p>
                  <Button variant="outline" size="sm" className="mt-3 h-7 text-xs gap-1">
                    View Certificate
                  </Button>
                </div>
              ) : (
                <div className="text-center p-4 bg-muted/30 rounded-xl">
                  <Award className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">Complete all required courses to earn your certificate</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {path.courses.filter((c) => c.status !== 'completed' && c.isRequired).length} courses remaining
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course List */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Course List</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {path.courses.map((course, idx) => (
                <div
                  key={course.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg text-xs',
                    course.status === 'current' && 'bg-amber-50 dark:bg-amber-950/30'
                  )}
                >
                  <span className={cn(
                    'h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0',
                    course.status === 'completed' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
                    course.status === 'current' && 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
                    course.status === 'locked' && 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                  )}>
                    {course.status === 'completed' ? '✓' : idx + 1}
                  </span>
                  <span className={cn(
                    'flex-1 truncate',
                    course.status === 'locked' && 'text-muted-foreground'
                  )}>
                    {course.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{course.duration}h</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---- Main Component ----
export function LearnerLearningPaths() {
  const { currentUser, currentTenant } = useAppStore();
  const userId = currentUser?.id || '';
  const tenantId = currentTenant?.id || '';
  const queryClient = useQueryClient();

  const { data: learningPathsData, isLoading } = useLearningPaths(tenantId);

  // Derive enrolled and available paths from API data
  const { enrolled, availablePaths } = useMemo(() => {
    if (!learningPathsData) return { enrolled: [] as LearnerPath[], availablePaths: [] as AvailablePath[] };
    const enrolledList: LearnerPath[] = [];
    const availableList: AvailablePath[] = [];
    learningPathsData.forEach((apiPath: any) => {
      const userEnrollment = apiPath.enrollments?.find((e: any) => {
        return e.userId === currentUser?.id;
      });
      if (userEnrollment) {
        enrolledList.push(mapApiPathToLearnerPath(apiPath, userEnrollment));
      }
      if (apiPath.isPublished) {
        availableList.push(mapApiPathToAvailablePath(apiPath));
      }
    });
    return { enrolled: enrolledList, availablePaths: availableList };
  }, [learningPathsData, currentUser?.id]);

  const recommendedPaths = useMemo(() => availablePaths.slice(0, 2), [availablePaths]);

  const [activeTab, setActiveTab] = useState('enrolled');
  const [selectedPath, setSelectedPath] = useState<LearnerPath | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollDialogId, setEnrollDialogId] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const filteredAvailable = availablePaths.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEnroll = (id: string) => {
    setEnrollDialogId(id);
  };

  const confirmEnroll = async () => {
    if (!enrollDialogId || !userId || !tenantId) return;
    setIsEnrolling(true);
    try {
      await apiPost('/learning-paths/enroll', {
        learningPathId: enrollDialogId,
        userId,
        tenantId,
      });
      toast.success('Enrolled in learning path!');
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
      setEnrollDialogId(null);
    } catch {
      toast.error('Failed to enroll in learning path');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (selectedPath) {
    return (
      <div className="p-4 sm:p-6">
        <PathDetailView path={selectedPath} onBack={() => setSelectedPath(null)} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Map className="h-6 w-6 text-emerald-600" /> Learning Paths
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Follow guided roadmaps to master new skills</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="border-border/50 bg-card/80 backdrop-blur-sm animate-pulse">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-5 w-10 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-1.5 w-full bg-muted" />
              <CardContent className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded" />
                <div className="h-3 w-1/3 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Map className="h-6 w-6 text-emerald-600" /> Learning Paths
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Follow guided roadmaps to master new skills</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Enrolled Paths', value: enrolled.length, icon: Map, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'In Progress', value: enrolled.filter((p) => p.overallProgress > 0 && p.overallProgress < 100).length, icon: Play, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
          { label: 'Completed', value: enrolled.filter((p) => p.overallProgress === 100).length, icon: Check, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Certificates', value: enrolled.filter((p) => p.certificateEarned).length, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('h-4 w-4', stat.color)} />
              </div>
              <div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommended */}
      {recommendedPaths.length > 0 && activeTab !== 'browse' && (
        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Recommended for You</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendedPaths.map((path) => (
                <div
                  key={path.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-background/50 border border-border/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{path.name}</p>
                    <p className="text-[10px] text-muted-foreground">{path.courseCount} courses · {path.estimatedDuration}h</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 h-7 text-[10px] ml-2 gap-1"
                    onClick={() => handleEnroll(path.id)}
                  >
                    <Zap className="h-3 w-3" /> Enroll
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="enrolled" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> My Paths
          </TabsTrigger>
          <TabsTrigger value="browse" className="gap-1.5">
            <Search className="h-3.5 w-3.5" /> Browse All
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="mt-4">
          {enrolled.length === 0 ? (
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-sm font-medium">No learning paths yet</p>
                <p className="text-xs text-muted-foreground mt-1">Browse available paths and enroll to start your journey</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-1.5"
                  onClick={() => setActiveTab('browse')}
                >
                  <Search className="h-3.5 w-3.5" /> Browse Paths
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolled.map((path) => (
                <PathCard key={path.id} path={path} onClick={() => setSelectedPath(path)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="browse" className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search available paths..."
              className="h-9 pl-9"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredAvailable.map((path) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AvailablePathCard path={path} onEnroll={handleEnroll} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredAvailable.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No paths found matching your search</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Enroll Confirmation Dialog */}
      <Dialog open={!!enrollDialogId} onOpenChange={() => setEnrollDialogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll in Learning Path</DialogTitle>
            <DialogDescription>
              Are you sure you want to enroll in &quot;{availablePaths.find((p) => p.id === enrollDialogId)?.name || 'this path'}&quot;?
              You&apos;ll be guided through each course in sequence.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEnrollDialogId(null)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-1.5" onClick={confirmEnroll} disabled={isEnrolling}>
              <Zap className="h-4 w-4" /> {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
