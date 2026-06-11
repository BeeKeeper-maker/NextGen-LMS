'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { demoCourses, demoEnrollments } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { VideoPlayer } from '@/components/shared/video-player';
import type { Chapter } from '@/components/shared/video-player';
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
  Send,
  BookOpen,
  Award,
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

// ─── Mock lesson progress ──────────────────────────────────
const lessonProgressMap: Record<string, 'completed' | 'in_progress' | 'not_started'> = {
  'les-1-1-1': 'completed',
  'les-1-1-2': 'completed',
  'les-1-1-3': 'in_progress',
  'les-1-2-1': 'not_started',
  'les-1-2-2': 'not_started',
};

// ─── Demo chapters for video player ────────────────────────────
const demoChapters: Chapter[] = [
  { time: 0, title: 'Introduction' },
  { time: 45, title: 'Core Concepts' },
  { time: 120, title: 'Setting Up the Environment' },
  { time: 180, title: 'Building Your First Component' },
  { time: 240, title: 'Summary & Key Takeaways' },
];

// ─── Resume positions for lessons (simulated) ─────────────────
const resumePositions: Record<string, number> = {
  'les-1-1-3': 120, // Resume from 2 min
  'les-1-2-1': 0,
  'les-1-2-2': 0,
};

// ─── Mock discussion threads ───────────────────────────────
const discussionThreads = [
  {
    id: 'thread-1',
    author: 'Mike Chen',
    avatar: 'MC',
    title: 'How do Server Components interact with client state?',
    content: 'I\'m confused about how Server Components can trigger client-side state updates. Can someone explain the data flow?',
    likes: 12,
    replies: 5,
    time: '2 hours ago',
  },
  {
    id: 'thread-2',
    author: 'Emma Rodriguez',
    avatar: 'ER',
    title: 'Best pattern for loading states in App Router?',
    content: 'What\'s the recommended way to handle loading.tsx vs Suspense boundaries for complex pages?',
    likes: 8,
    replies: 3,
    time: '5 hours ago',
  },
  {
    id: 'thread-3',
    author: 'David Park',
    avatar: 'DP',
    title: 'TypeScript generic patterns for API routes',
    content: 'I\'ve been experimenting with typed API routes. Here\'s my approach to type-safe server actions...',
    likes: 15,
    replies: 7,
    time: '1 day ago',
  },
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

// ─── Animation variants ────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ─── Module Section Component ──────────────────────────────
function ModuleSection({ module: mod, moduleIndex, onLessonClick, progressMap }: { module: Module; moduleIndex: number; onLessonClick: (lesson: Lesson) => void; progressMap: Record<string, 'completed' | 'in_progress' | 'not_started'> }) {
  const [isOpen, setIsOpen] = useState(moduleIndex === 0);
  const lessons = mod.lessons || [];
  const completedLessons = lessons.filter(
    (l) => progressMap[l.id] === 'completed'
  ).length;
  const totalDuration = lessons.reduce((sum, l) => sum + (l.videoDuration || 0), 0);

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Module Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="text-muted-foreground">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
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
            <div className="border-t bg-muted/20">
              {lessons.map((lesson, lessonIdx) => {
                const status = progressMap[lesson.id] || 'not_started';
                return (
                  <div
                    key={lesson.id}
                    className={cn(
                      'flex items-center justify-between p-3 pl-12 hover:bg-muted/40 transition-colors',
                      lessonIdx < lessons.length - 1 && 'border-b border-border/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Status Icon */}
                      {status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      ) : status === 'in_progress' ? (
                        <div className="h-5 w-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
                      )}

                      {/* Content Type Icon */}
                      <ContentTypeIcon type={lesson.contentType} className="h-4 w-4 text-muted-foreground shrink-0" />

                      {/* Lesson Info */}
                      <div>
                        <p className={cn(
                          'text-sm font-medium',
                          status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'
                        )}>
                          {lesson.title}
                        </p>
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
                        <Button size="sm" className="h-7 text-xs gap-1 bg-amber-600 hover:bg-amber-700" onClick={() => onLessonClick(lesson)}>
                          <Play className="h-3 w-3" /> Continue
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
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────
export function LearnerCourse() {
  const { currentUser } = useAppStore();
  const course = demoCourses[0]; // React & Next.js Masterclass
  const enrollment = demoEnrollments[0]; // Active enrollment for this course
  const modules = course.modules || [];
  const [activeTab, setActiveTab] = useState('curriculum');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeLessonModuleName, setActiveLessonModuleName] = useState('');
  const [lessonProgressState, setLessonProgressState] = useState(lessonProgressMap);

  // Calculate total lessons and completed
  const allLessons = modules.flatMap(m => m.lessons || []);
  const completedCount = allLessons.filter(l => lessonProgressState[l.id] === 'completed').length;
  const totalLessons = allLessons.length;

  // Handle clicking a lesson
  const handleLessonClick = (lesson: Lesson) => {
    setActiveLesson(lesson);
    // Find the module name for this lesson
    const parentModule = modules.find(m => m.lessons?.some(l => l.id === lesson.id));
    setActiveLessonModuleName(parentModule?.title || '');
  };

  // Handle marking a lesson as complete
  const handleMarkComplete = (lessonId: string) => {
    setLessonProgressState(prev => ({ ...prev, [lessonId]: 'completed' }));
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

  // If a lesson is active, show the enhanced Video Player
  if (activeLesson) {
    return (
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
            // Store resume position
            resumePositions[activeLesson.id] = currentTime;
          }}
        />
      </div>
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
                <span className="font-semibold text-emerald-600">{enrollment.progress}%</span>
              </div>
              <Progress value={enrollment.progress} className="h-2.5" />
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{completedCount} of {totalLessons} lessons completed</span>
                {enrollment.lastAccessedAt && (
                  <span>Last accessed {new Date(enrollment.lastAccessedAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Play className="h-4 w-4" />
                Continue Learning
              </Button>
              <Button variant="outline" className="gap-2">
                <Award className="h-4 w-4" />
                View Certificate
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Course Content Tabs ──────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="curriculum" className="gap-1.5">
              <BookOpen className="h-4 w-4" />
              Curriculum
            </TabsTrigger>
            <TabsTrigger value="community" className="gap-1.5">
              <MessageSquare className="h-4 w-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-1.5">
              <Download className="h-4 w-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-1.5">
              <Star className="h-4 w-4" />
              Reviews
            </TabsTrigger>
          </TabsList>

          {/* ─── Tab 1: Curriculum ─────────────────────────── */}
          <TabsContent value="curriculum" className="mt-6">
            <div className="space-y-3">
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
                // Find the current in-progress or next lesson
                const inProgressLesson = allLessons.find(l => lessonProgressState[l.id] === 'in_progress');
                const nextLesson = allLessons.find(l => lessonProgressState[l.id] === 'not_started');
                const currentLesson = inProgressLesson || nextLesson;
                const currentModule = currentLesson ? modules.find(m => m.lessons?.some(l => l.id === currentLesson.id)) : null;

                if (!currentLesson) return null;

                return (
                  <Card className="overflow-hidden border-emerald-200 dark:border-emerald-800/50">
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
                              resumePositions[currentLesson.id] = currentTime;
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
                            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
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
            </div>
          </TabsContent>

          {/* ─── Tab 2: Community ──────────────────────────── */}
          <TabsContent value="community" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Course Discussions</h3>
                  <p className="text-sm text-muted-foreground">Ask questions and share insights with fellow learners</p>
                </div>
                <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                  <Send className="h-3.5 w-3.5" />
                  Ask a Question
                </Button>
              </div>

              <div className="space-y-3">
                {discussionThreads.map((thread) => (
                  <Card key={thread.id} className="hover:shadow-sm transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                            {thread.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">{thread.author}</span>
                            <span className="text-xs text-muted-foreground">· {thread.time}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-foreground mb-1">{thread.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">{thread.content}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                              <ThumbsUp className="h-3 w-3" /> {thread.likes}
                            </button>
                            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                              <MessageSquare className="h-3 w-3" /> {thread.replies} replies
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button variant="outline" className="w-full">View All Discussions</Button>
            </div>
          </TabsContent>

          {/* ─── Tab 3: Resources ─────────────────────────── */}
          <TabsContent value="resources" className="mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground">Course Resources</h3>
                <p className="text-sm text-muted-foreground">Downloadable files, links, and code repositories</p>
              </div>

              {/* Downloads */}
              <Card>
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
              <Card>
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
              <Card>
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
            </div>
          </TabsContent>

          {/* ─── Tab 4: Reviews ───────────────────────────── */}
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              {/* Overall Rating */}
              <Card>
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
                            <div
                              className="h-full bg-amber-400 rounded-full"
                              style={{ width: `${(dist.count / totalReviews) * 100}%` }}
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
                  <Card key={review.id}>
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
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
