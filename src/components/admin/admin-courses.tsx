'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  GripVertical,
  Star,
  Users,
  Clock,
  Copy,
  Archive,
  Pencil,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Video,
  FileText,
  Headphones,
  File,
  Radio,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  BookOpen,
  Layers,
  LayoutList,
  CheckCircle2,
  Circle,
  MoreVertical,
  Settings,
  HelpCircle,
  Image as ImageIcon,
  Save,
  Sparkles,
  Trophy,
  MessageSquare,
  ShieldCheck,
  Flag,
  ThumbsUp,
  Download,
  Send,
  X,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Bold,
  Italic,
  Heading1,
  List,
  Code2,
  Link2,
  Palette,
  ExternalLink,
  Minus,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { demoCourses } from '@/lib/mock-data';
import { courseReviews as allMockReviews, reviewTags } from '@/lib/mock-data';
import type { CourseReview } from '@/lib/mock-data';
import type { Course, Module, Lesson } from '@/types';
import { cn } from '@/lib/utils';

// ─── Helpers ────────────────────────────────────────────────

const categoryGradients: Record<string, string> = {
  'Web Development': 'from-emerald-500 to-teal-600',
  'AI & ML': 'from-violet-500 to-purple-600',
  'Data Science': 'from-amber-500 to-orange-600',
  Design: 'from-rose-500 to-pink-600',
  Business: 'from-slate-500 to-gray-600',
  Marketing: 'from-fuchsia-500 to-violet-600',
};

const categoryBadgeColors: Record<string, string> = {
  'Web Development': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'AI & ML': 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  'Data Science': 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Design: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  Business: 'bg-slate-100 text-slate-700 dark:text-slate-300 dark:bg-slate-950 dark:text-slate-300',
  Marketing: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300',
};

const levelBadgeColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  advanced: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  expert: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}



function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3 w-3 ${
            s <= Math.round(rating)
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating}</span>
    </div>
  );
}

// ─── Tab 1: Course Catalog ──────────────────────────────────

function CourseCatalogTab() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(demoCourses.map((c) => c.category).filter(Boolean)))],
    []
  );

  const levels = ['all', 'beginner', 'intermediate', 'advanced', 'expert'];

  const filtered = demoCourses.filter((c) => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchLevel = levelFilter === 'all' || c.level === levelFilter;
    return matchSearch && matchCategory && matchLevel;
  });

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat!}>
                {cat === 'all' ? 'All Categories' : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            {levels.map((lvl) => (
              <SelectItem key={lvl} value={lvl}>
                {lvl === 'all' ? 'All Levels' : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <NewCourseDialog />
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {demoCourses.length} courses
      </p>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <BookOpen className="h-12 w-12 mb-4 opacity-40" />
          <p className="text-lg font-medium">No courses found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const gradient = categoryGradients[course.category || ''] || 'from-slate-500 to-slate-600';
  const catBadge = categoryBadgeColors[course.category || ''] || 'bg-slate-100 text-slate-700 dark:text-slate-300 dark:bg-slate-950 dark:text-slate-300';
  const lvlBadge = levelBadgeColors[course.level] || 'bg-slate-100 text-slate-700 dark:text-slate-300 dark:bg-slate-950 dark:text-slate-300';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full shadow-sm flex flex-col">
        {/* Colored header band */}
        <div className={`h-24 bg-gradient-to-r ${gradient} relative`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={`${catBadge} text-[10px] font-medium px-2 py-0.5`}>
              {course.category}
            </Badge>
            <Badge className={`${lvlBadge} text-[10px] font-medium px-2 py-0.5`}>
              {course.level}
            </Badge>
          </div>
          {course.isFeatured && (
            <Badge className="absolute top-3 right-3 bg-amber-400 text-amber-900 text-[10px] font-semibold px-2 py-0.5">
              Featured
            </Badge>
          )}
        </div>

        <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
          {/* Title & Description */}
          <div>
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {course.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {course.description}
            </p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {course.enrollmentCount.toLocaleString()}
            </span>
            {renderStars(course.avgRating)}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {course.durationHours}h
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">${course.price}</span>
            {course.compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${course.compareAtPrice}
              </span>
            )}
          </div>

          {/* Completion rate */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Completion Rate</span>
              <span className="font-medium text-foreground">{course.completionRate}%</span>
            </div>
            <Progress value={course.completionRate} className="h-1.5" />
          </div>

          {/* Status & Actions */}
          <div className="flex items-center justify-between pt-1">
            <Badge
              variant="outline"
              className={`text-[10px] ${
                course.isPublished
                  ? 'border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400'
                  : 'border-yellow-300 text-yellow-600 dark:border-yellow-700 dark:text-yellow-400'
              }`}
            >
              {course.isPublished ? 'Published' : 'Draft'}
            </Badge>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Archive className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function NewCourseDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shrink-0 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          New Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Add a new course to your learning platform. You can configure details and curriculum after creation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="course-title">Course Title</Label>
            <Input id="course-title" placeholder="e.g. Advanced TypeScript Patterns" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="course-desc">Description</Label>
            <Textarea id="course-desc" placeholder="Brief description of the course..." rows={3} className="resize-none" />
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="web-dev">Web Development</SelectItem>
                  <SelectItem value="ai-ml">AI & ML</SelectItem>
                  <SelectItem value="data-science">Data Science</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Level</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="course-price">Price ($)</Label>
              <Input id="course-price" type="number" placeholder="0" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course-compare">Compare-at Price ($)</Label>
              <Input id="course-compare" type="number" placeholder="0" />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={() => setOpen(false)}>
            <BookOpen className="h-4 w-4" />
            Create Course
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tab 2: Course Builder ──────────────────────────────────

function CourseBuilderTab() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(demoCourses[0].id);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(demoCourses[0].modules?.map((m) => m.id) || [])
  );

  const selectedCourse = useMemo(
    () => demoCourses.find((c) => c.id === selectedCourseId) || demoCourses[0],
    [selectedCourseId]
  );

  const selectedLesson = useMemo(() => {
    if (!selectedLessonId) return null;
    for (const mod of selectedCourse.modules || []) {
      const found = mod.lessons?.find((l) => l.id === selectedLessonId);
      if (found) return found;
    }
    return null;
  }, [selectedLessonId, selectedCourse]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const totalLessons = useMemo(
    () =>
      (selectedCourse.modules || []).reduce(
        (acc, m) => acc + (m.lessons?.length || 0),
        0
      ),
    [selectedCourse]
  );

  const totalDurationSec = useMemo(
    () =>
      (selectedCourse.modules || []).reduce(
        (acc, m) =>
          acc +
          (m.lessons || []).reduce(
            (a, l) => a + (l.videoDuration || 0),
            0
          ),
        0
      ),
    [selectedCourse]
  );

  return (
    <div className="space-y-4">
      {/* Course selector */}
      <div className="flex items-center gap-3">
        <Label className="text-sm font-medium shrink-0">Course:</Label>
        <Select value={selectedCourseId} onValueChange={(v) => { setSelectedCourseId(v); setSelectedLessonId(null); }}>
          <SelectTrigger className="w-full sm:w-[320px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {demoCourses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 min-h-[600px]">
        {/* Left panel: Module & Lesson Tree */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Curriculum</h3>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                  <Plus className="h-3 w-3" /> Module
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>{(selectedCourse.modules || []).length} modules</span>
              <span>{totalLessons} lessons</span>
              <span>{formatDuration(totalDurationSec)}</span>
            </div>
          </div>

          <ScrollArea className="h-[540px]">
            <div className="p-2">
              {(selectedCourse.modules || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Layers className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No modules yet</p>
                  <p className="text-xs">Add a module to start building</p>
                </div>
              ) : (
                (selectedCourse.modules || [])
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((mod) => (
                    <ModuleTreeItem
                      key={mod.id}
                      module={mod}
                      isExpanded={expandedModules.has(mod.id)}
                      onToggle={() => toggleModule(mod.id)}
                      selectedLessonId={selectedLessonId}
                      onSelectLesson={setSelectedLessonId}
                    />
                  ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Right panel: Content Editor */}
        <Card className="overflow-hidden">
          {selectedLesson ? (
            <LessonEditor lesson={selectedLesson} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
              <BookOpen className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-lg font-medium">Select a lesson</p>
              <p className="text-sm">Choose a lesson from the curriculum tree to edit its content</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function ModuleTreeItem({
  module,
  isExpanded,
  onToggle,
  selectedLessonId,
  onSelectLesson,
}: {
  module: Module;
  isExpanded: boolean;
  onToggle: () => void;
  selectedLessonId: string | null;
  onSelectLesson: (id: string) => void;
}) {
  const lessonCount = module.lessons?.length || 0;
  const publishedLessons = module.lessons?.filter((l) => l.isPublished).length || 0;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle} className="mb-1">
      <div className="flex items-center gap-1">
        <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab shrink-0" />
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 flex-1 rounded-md px-2 py-2 text-sm font-medium hover:bg-muted/60 transition-colors text-left">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate flex-1 text-foreground">{module.title}</span>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {publishedLessons}/{lessonCount}
            </span>
            {module.isPublished ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            )}
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="ml-6 pl-3 border-l border-border">
          {(module.lessons || [])
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((lesson) => (
              <LessonTreeItem
                key={lesson.id}
                lesson={lesson}
                isSelected={selectedLessonId === lesson.id}
                onSelect={() => onSelectLesson(lesson.id)}
              />
            ))}
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 mt-1 text-xs gap-1 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 justify-start"
          >
            <Plus className="h-3 w-3" /> Add Lesson
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ContentTypeIcon({ type, className }: { type: Lesson['contentType']; className?: string }) {
  switch (type) {
    case 'video': return <Video className={className} />;
    case 'text': return <FileText className={className} />;
    case 'audio': return <Headphones className={className} />;
    case 'document': return <File className={className} />;
    case 'live_session': return <Radio className={className} />;
    default: return <FileText className={className} />;
  }
}

function LessonTreeItem({
  lesson,
  isSelected,
  onSelect,
}: {
  lesson: Lesson;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 cursor-grab shrink-0" />
      <button
        onClick={onSelect}
        className={`flex items-center gap-2 flex-1 rounded-md px-2 py-1.5 text-xs transition-colors text-left ${
          isSelected
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
            : 'hover:bg-muted/60 text-muted-foreground'
        }`}
      >
        <ContentTypeIcon type={lesson.contentType} className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate flex-1">{lesson.title}</span>
        {lesson.videoDuration && (
          <span className="text-[10px] text-muted-foreground shrink-0">
            {formatDuration(lesson.videoDuration)}
          </span>
        )}
        {lesson.isPreview && (
          <Eye className="h-3 w-3 text-amber-500 shrink-0" />
        )}
        {lesson.isPublished ? (
          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
        ) : (
          <Circle className="h-3 w-3 text-muted-foreground shrink-0" />
        )}
      </button>
    </div>
  );
}

function LessonEditor({ lesson }: { lesson: Lesson }) {
  const [title, setTitle] = useState(lesson.title);
  const [contentType, setContentType] = useState(lesson.contentType);
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || '');
  const [textContent, setTextContent] = useState(lesson.content || '');
  const [duration, setDuration] = useState(lesson.videoDuration ? Math.floor(lesson.videoDuration / 60) : 0);
  const [isPreview, setIsPreview] = useState(lesson.isPreview);
  const [isPublished, setIsPublished] = useState(lesson.isPublished);
  const [resources, setResources] = useState<string[]>(
    lesson.resources ? lesson.resources.split(',').filter(Boolean) : []
  );

  return (
    <div className="flex flex-col h-full">
      {/* Editor header */}
      <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ContentTypeIcon type={contentType} className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-foreground">Edit Lesson</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs">Cancel</Button>
          <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
            <CheckCircle2 className="h-3 w-3" /> Save
          </Button>
        </div>
      </div>

      {/* Editor body */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6 max-w-2xl">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="lesson-title">Lesson Title</Label>
            <Input
              id="lesson-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter lesson title..."
            />
          </div>

          {/* Content Type */}
          <div className="grid gap-2">
            <Label>Content Type</Label>
            <Select value={contentType} onValueChange={(v) => setContentType(v as Lesson['contentType'])}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">
                  <span className="flex items-center gap-2"><Video className="h-3.5 w-3.5" /> Video</span>
                </SelectItem>
                <SelectItem value="text">
                  <span className="flex items-center gap-2"><FileText className="h-3.5 w-3.5" /> Text</span>
                </SelectItem>
                <SelectItem value="audio">
                  <span className="flex items-center gap-2"><Headphones className="h-3.5 w-3.5" /> Audio</span>
                </SelectItem>
                <SelectItem value="document">
                  <span className="flex items-center gap-2"><File className="h-3.5 w-3.5" /> Document</span>
                </SelectItem>
                <SelectItem value="live_session">
                  <span className="flex items-center gap-2"><Radio className="h-3.5 w-3.5" /> Live Session</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional fields based on content type */}
          {contentType === 'video' && (
            <div className="grid gap-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4 or embed URL"
              />
              <p className="text-xs text-muted-foreground">
                Supports MP4, YouTube, Vimeo, and Loom embed URLs
              </p>
            </div>
          )}

          {contentType === 'text' && (
            <div className="grid gap-2">
              <Label htmlFor="text-content">Content</Label>
              <Textarea
                id="text-content"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Write your lesson content here... Supports rich text formatting."
                rows={8}
                className="min-h-[200px]"
              />
            </div>
          )}

          {contentType === 'audio' && (
            <div className="grid gap-2">
              <Label htmlFor="audio-url">Audio URL</Label>
              <Input
                id="audio-url"
                placeholder="https://example.com/audio.mp3"
              />
            </div>
          )}

          {contentType === 'document' && (
            <div className="grid gap-2">
              <Label>Document</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOCX, PPTX up to 50MB
                </p>
              </div>
            </div>
          )}

          {contentType === 'live_session' && (
            <div className="grid gap-2">
              <Label htmlFor="session-url">Meeting URL</Label>
              <Input
                id="session-url"
                placeholder="https://zoom.us/j/... or Google Meet link"
              />
            </div>
          )}

          <Separator />

          {/* Duration */}
          <div className="grid gap-2">
            <Label htmlFor="lesson-duration">Duration (minutes)</Label>
            <Input
              id="lesson-duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={0}
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center justify-between gap-4 flex-1 rounded-lg border p-3">
              <div>
                <Label className="text-sm">Preview Available</Label>
                <p className="text-xs text-muted-foreground">Allow free preview of this lesson</p>
              </div>
              <Switch checked={isPreview} onCheckedChange={setIsPreview} />
            </div>
            <div className="flex items-center justify-between gap-4 flex-1 rounded-lg border p-3">
              <div>
                <Label className="text-sm">Published</Label>
                <p className="text-xs text-muted-foreground">Make visible to learners</p>
              </div>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
          </div>

          <Separator />

          {/* Resources */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label>Resources</Label>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Upload className="h-3 w-3" /> Upload
              </Button>
            </div>
            {resources.length > 0 ? (
              <div className="space-y-2">
                {resources.map((res, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <span className="text-sm text-foreground">{res}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-2">
                No resources attached. Click Upload to add files.
              </p>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Tab 3: Curriculum Overview ─────────────────────────────

function CurriculumOverviewTab() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(demoCourses[0].id);

  const selectedCourse = useMemo(
    () => demoCourses.find((c) => c.id === selectedCourseId) || demoCourses[0],
    [selectedCourseId]
  );

  const modules = useMemo(
    () => (selectedCourse.modules || []).sort((a, b) => a.orderIndex - b.orderIndex),
    [selectedCourse]
  );

  const totalLessons = useMemo(
    () => modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0),
    [modules]
  );

  const totalDurationSec = useMemo(
    () =>
      modules.reduce(
        (acc, m) =>
          acc + (m.lessons || []).reduce((a, l) => a + (l.videoDuration || 0), 0),
        0
      ),
    [modules]
  );

  const publishedLessons = useMemo(
    () =>
      modules.reduce(
        (acc, m) => acc + (m.lessons?.filter((l) => l.isPublished).length || 0),
        0
      ),
    [modules]
  );

  return (
    <div className="space-y-6">
      {/* Course selector & quick stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
          <SelectTrigger className="w-full sm:w-[320px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {demoCourses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-950 flex items-center justify-center">
              <Layers className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{modules.length}</p>
              <p className="text-[10px] text-muted-foreground">Modules</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{totalLessons}</p>
              <p className="text-[10px] text-muted-foreground">Lessons</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{formatDuration(totalDurationSec)}</p>
              <p className="text-[10px] text-muted-foreground">Duration</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-slate-600 dark:text-slate-400 dark:text-slate-500" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{publishedLessons}/{totalLessons}</p>
              <p className="text-[10px] text-muted-foreground">Published</p>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Flow */}
      {modules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <LayoutList className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-lg font-medium">No curriculum yet</p>
          <p className="text-sm">Add modules and lessons to build the course curriculum</p>
        </div>
      ) : (
        <div className="relative space-y-0">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border hidden sm:block" />

          {modules.map((mod, modIdx) => {
            const gradient = categoryGradients[selectedCourse.category || ''] || 'from-slate-500 to-slate-600';
            const modLessons = (mod.lessons || []).sort((a, b) => a.orderIndex - b.orderIndex);
            const modDurationSec = modLessons.reduce((a, l) => a + (l.videoDuration || 0), 0);

            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: modIdx * 0.1 }}
                className="relative sm:pl-12 pb-6"
              >
                {/* Timeline dot */}
                <div className="hidden sm:flex absolute left-3 top-6 h-5 w-5 rounded-full bg-gradient-to-r from-emerald-500 to-violet-500 items-center justify-center ring-4 ring-background z-10">
                  <span className="text-[9px] font-bold text-white">{modIdx + 1}</span>
                </div>

                <Card className="overflow-hidden">
                  {/* Module header */}
                  <div className={`px-6 py-3 bg-gradient-to-r ${gradient} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-white/60 cursor-grab" />
                      <h3 className="text-sm font-semibold text-white">{mod.title}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/70">
                        {modLessons.length} lessons &middot; {formatDuration(modDurationSec)}
                      </span>
                      {mod.isPublished ? (
                        <Badge className="bg-white/20 text-white text-[10px] border-0">Published</Badge>
                      ) : (
                        <Badge className="bg-white/10 text-white/70 text-[10px] border-0">Draft</Badge>
                      )}
                    </div>
                  </div>

                  {/* Lessons list */}
                  <div className="divide-y divide-border">
                    {modLessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors"
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-grab shrink-0" />
                          <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                            <ContentTypeIcon type={lesson.contentType} className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">{lesson.title}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {lesson.isPreview && (
                              <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400">
                                Preview
                              </Badge>
                            )}
                            {lesson.videoDuration && (
                              <span className="text-xs text-muted-foreground">
                                {formatDuration(lesson.videoDuration)}
                              </span>
                            )}
                            {lesson.isPublished ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                    ))}
                    {modLessons.length === 0 && (
                      <div className="px-6 py-6 text-center text-sm text-muted-foreground">
                        No lessons in this module
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Tab 4: Visual Course Builder (Enhanced) ────────────────

const moduleAccentColors = [
  { name: 'Emerald', bar: 'bg-emerald-500', gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', ring: 'ring-emerald-200 dark:ring-emerald-800' },
  { name: 'Sky', bar: 'bg-sky-500', gradient: 'from-sky-500 to-cyan-500', bg: 'bg-sky-50 dark:bg-sky-950/30', ring: 'ring-sky-200 dark:ring-sky-800' },
  { name: 'Violet', bar: 'bg-violet-500', gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-50 dark:bg-violet-950/30', ring: 'ring-violet-200 dark:ring-violet-800' },
  { name: 'Amber', bar: 'bg-amber-500', gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-950/30', ring: 'ring-amber-200 dark:ring-amber-800' },
  { name: 'Rose', bar: 'bg-rose-500', gradient: 'from-rose-500 to-pink-500', bg: 'bg-rose-50 dark:bg-rose-950/30', ring: 'ring-rose-200 dark:ring-rose-800' },
  { name: 'Teal', bar: 'bg-teal-500', gradient: 'from-teal-500 to-cyan-500', bg: 'bg-teal-50 dark:bg-teal-950/30', ring: 'ring-teal-200 dark:ring-teal-800' },
];

const lessonTypeColors: Record<string, { bg: string; text: string; border: string }> = {
  video: { bg: 'bg-sky-100 dark:bg-sky-950', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800' },
  text: { bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  document: { bg: 'bg-orange-100 dark:bg-orange-950', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  audio: { bg: 'bg-violet-100 dark:bg-violet-950', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
  live_session: { bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
};

const lessonTypeLabels: Record<string, string> = {
  video: 'Video',
  text: 'Text',
  document: 'Document',
  audio: 'Audio',
  live_session: 'Live Session',
};

type BuilderModule = Module & { lessons: BuilderLesson[]; accentColor?: number; description?: string };
type BuilderLesson = Lesson & { content?: string; videoUrl?: string; resources?: BuilderResource[] };
type BuilderResource = { id: string; name: string; type: 'file' | 'link' | 'document'; url?: string };
type ViewDensity = 'compact' | 'comfortable' | 'spacious';

function VisualCourseBuilderTab() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(demoCourses[0].id);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [addLessonModuleId, setAddLessonModuleId] = useState<string | null>(null);
  const [courseSettingsOpen, setCourseSettingsOpen] = useState(false);
  const [editingModuleTitle, setEditingModuleTitle] = useState<string | null>(null);
  const [editingModuleDesc, setEditingModuleDesc] = useState<string | null>(null);
  const [editingLessonTitle, setEditingLessonTitle] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<{ type: 'module' | 'lesson'; id: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [viewDensity, setViewDensity] = useState<ViewDensity>('comfortable');
  const [lastSaved, setLastSaved] = useState<string>('just now');
  const [courseTitle, setCourseTitle] = useState(demoCourses[0].title);
  const [isCoursePublished, setIsCoursePublished] = useState(demoCourses[0].isPublished);

  // Local mutable modules state
  const [modules, setModules] = useState<BuilderModule[]>(() => {
    const c = demoCourses[0];
    return (c.modules || []).map((m, i) => ({
      ...m,
      lessons: [...(m.lessons || [])].map((l) => ({
        ...l,
        content: l.content || '',
        videoUrl: l.videoUrl || '',
        resources: [] as BuilderResource[],
      })),
      accentColor: i % moduleAccentColors.length,
      description: m.description || '',
    })) as BuilderModule[];
  });

  const selectedCourse = useMemo(
    () => demoCourses.find((c) => c.id === selectedCourseId) || demoCourses[0],
    [selectedCourseId]
  );

  // Auto-save simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSaved(`${Math.floor(Math.random() * 5) + 1} min ago`);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync modules when course changes
  const handleCourseChange = useCallback((courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedLessonId(null);
    const c = demoCourses.find((co) => co.id === courseId) || demoCourses[0];
    setCourseTitle(c.title);
    setIsCoursePublished(c.isPublished);
    setModules(
      (c.modules || []).map((m, i) => ({
        ...m,
        lessons: [...(m.lessons || [])].map((l) => ({
          ...l,
          content: l.content || '',
          videoUrl: l.videoUrl || '',
          resources: [] as BuilderResource[],
        })),
        accentColor: i % moduleAccentColors.length,
        description: m.description || '',
      })) as BuilderModule[]
    );
    setExpandedModules(new Set());
  }, []);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  // Move module up/down
  const moveModule = useCallback((moduleId: string, direction: 'up' | 'down') => {
    setModules((prev) => {
      const idx = prev.findIndex((m) => m.id === moduleId);
      if (idx < 0) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      const tmp = arr[idx];
      arr[idx] = arr[newIdx];
      arr[newIdx] = tmp;
      return arr.map((m, i) => ({ ...m, orderIndex: i }));
    });
  }, []);

  // Move lesson up/down within module
  const moveLesson = useCallback((moduleId: string, lessonId: string, direction: 'up' | 'down') => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        const lessons = [...mod.lessons].sort((a, b) => a.orderIndex - b.orderIndex);
        const idx = lessons.findIndex((l) => l.id === lessonId);
        if (idx < 0) return mod;
        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= lessons.length) return mod;
        const tmp = lessons[idx];
        lessons[idx] = lessons[newIdx];
        lessons[newIdx] = tmp;
        return { ...mod, lessons: lessons.map((l, i) => ({ ...l, orderIndex: i })) };
      })
    );
  }, []);

  // Move lesson to different module
  const moveLessonToModule = useCallback((fromModuleId: string, lessonId: string, toModuleId: string) => {
    setModules((prev) => {
      const fromMod = prev.find((m) => m.id === fromModuleId);
      if (!fromMod) return prev;
      const lesson = fromMod.lessons.find((l) => l.id === lessonId);
      if (!lesson) return prev;
      return prev.map((mod) => {
        if (mod.id === fromModuleId) {
          return { ...mod, lessons: mod.lessons.filter((l) => l.id !== lessonId).map((l, i) => ({ ...l, orderIndex: i })) };
        }
        if (mod.id === toModuleId) {
          const newLessons = [...mod.lessons, { ...lesson, moduleId: toModuleId, orderIndex: mod.lessons.length }];
          return { ...mod, lessons: newLessons };
        }
        return mod;
      });
    });
    setSelectedLessonId(null);
  }, []);

  // Add module
  const handleAddModule = (title: string, description: string) => {
    const newMod: BuilderModule = {
      id: `mod-new-${Date.now()}`,
      courseId: selectedCourseId,
      title,
      description: description || undefined,
      orderIndex: modules.length,
      isPublished: false,
      lessons: [],
      accentColor: modules.length % moduleAccentColors.length,
    };
    setModules((prev) => [...prev, newMod]);
    setAddModuleOpen(false);
    setExpandedModules((prev) => new Set([...prev, newMod.id]));
  };

  // Add lesson
  const handleAddLesson = (moduleId: string, title: string, contentType: Lesson['contentType'], durationMin: number) => {
    const newLesson: BuilderLesson = {
      id: `les-new-${Date.now()}`,
      moduleId,
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      contentType,
      orderIndex: 0,
      isPreview: false,
      isPublished: false,
      videoDuration: contentType === 'video' || contentType === 'audio' ? durationMin * 60 : undefined,
      content: '',
      videoUrl: '',
      resources: [],
    };
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        const lessons = [...mod.lessons, { ...newLesson, orderIndex: mod.lessons.length }];
        return { ...mod, lessons };
      })
    );
    setAddLessonOpen(false);
    setAddLessonModuleId(null);
    setSelectedLessonId(newLesson.id);
  };

  // Delete module
  const handleDeleteModule = (moduleId: string) => {
    setModules((prev) => prev.filter((m) => m.id !== moduleId).map((m, i) => ({ ...m, orderIndex: i })));
    setDeleteConfirmId(null);
  };

  // Delete lesson
  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        return { ...mod, lessons: mod.lessons.filter((l) => l.id !== lessonId).map((l, i) => ({ ...l, orderIndex: i })) };
      })
    );
    if (selectedLessonId === lessonId) setSelectedLessonId(null);
    setDeleteConfirmId(null);
  };

  // Toggle module published
  const toggleModulePublished = (moduleId: string) => {
    setModules((prev) =>
      prev.map((mod) => (mod.id === moduleId ? { ...mod, isPublished: !mod.isPublished } : mod))
    );
  };

  // Toggle lesson preview
  const toggleLessonPreview = (moduleId: string, lessonId: string) => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        return {
          ...mod,
          lessons: mod.lessons.map((l) => (l.id === lessonId ? { ...l, isPreview: !l.isPreview } : l)),
        };
      })
    );
  };

  // Toggle lesson published
  const toggleLessonPublished = (moduleId: string, lessonId: string) => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        return {
          ...mod,
          lessons: mod.lessons.map((l) => (l.id === lessonId ? { ...l, isPublished: !l.isPublished } : l)),
        };
      })
    );
  };

  // Update module title
  const updateModuleTitle = (moduleId: string, newTitle: string) => {
    if (!newTitle.trim()) { setEditingModuleTitle(null); return; }
    setModules((prev) =>
      prev.map((mod) => (mod.id === moduleId ? { ...mod, title: newTitle } : mod))
    );
    setEditingModuleTitle(null);
  };

  // Update module description
  const updateModuleDesc = (moduleId: string, newDesc: string) => {
    setModules((prev) =>
      prev.map((mod) => (mod.id === moduleId ? { ...mod, description: newDesc } : mod))
    );
    setEditingModuleDesc(null);
  };

  // Update lesson title
  const updateLessonTitle = (moduleId: string, lessonId: string, newTitle: string) => {
    if (!newTitle.trim()) { setEditingLessonTitle(null); return; }
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        return {
          ...mod,
          lessons: mod.lessons.map((l) =>
            l.id === lessonId ? { ...l, title: newTitle, slug: newTitle.toLowerCase().replace(/\s+/g, '-') } : l
          ),
        };
      })
    );
    setEditingLessonTitle(null);
  };

  // Update lesson content
  const updateLessonContent = (moduleId: string, lessonId: string, field: string, value: string | number | boolean) => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        return {
          ...mod,
          lessons: mod.lessons.map((l) =>
            l.id === lessonId ? { ...l, [field]: value } : l
          ),
        };
      })
    );
  };

  // Change module accent color
  const changeModuleAccent = (moduleId: string, colorIndex: number) => {
    setModules((prev) =>
      prev.map((mod) => (mod.id === moduleId ? { ...mod, accentColor: colorIndex } : mod))
    );
  };

  // Find selected lesson and its module
  const selectedLessonData = (() => {
    if (!selectedLessonId) return null;
    for (const mod of modules) {
      const lesson = mod.lessons.find((l) => l.id === selectedLessonId);
      if (lesson) return { lesson, moduleId: mod.id };
    }
    return null;
  })();

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalDurationSec = modules.reduce((acc, m) => acc + m.lessons.reduce((a, l) => a + (l.videoDuration || 0), 0), 0);
  const publishedLessons = modules.reduce((acc, m) => acc + m.lessons.filter((l) => l.isPublished).length, 0);
  const completionPct = totalLessons > 0 ? Math.round((publishedLessons / totalLessons) * 100) : 0;

  const densityClasses = (() => {
    switch (viewDensity) {
      case 'compact': return { gap: 'gap-2', py: 'py-2', px: 'px-3', text: 'text-xs', lessonPy: 'py-1.5' };
      case 'spacious': return { gap: 'gap-4', py: 'py-5', px: 'px-5', text: 'text-sm', lessonPy: 'py-3' };
      default: return { gap: 'gap-3', py: 'py-3', px: 'px-4', text: 'text-sm', lessonPy: 'py-2' };
    }
  })();

  return (
    <div className="space-y-4">
      {/* ─── Builder Toolbar ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl border bg-card/80 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Input
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            className="h-8 text-sm font-semibold border-dashed hover:border-solid max-w-[260px]"
          />
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Layers className="h-3 w-3" /> {modules.length} modules
            <span className="mx-1">·</span>
            <BookOpen className="h-3 w-3" /> {totalLessons} lessons
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </Button>
          <div className="flex items-center gap-1 rounded-lg border px-2 py-1">
            <Button
              variant={isCoursePublished ? 'default' : 'outline'}
              size="sm"
              className={`h-6 text-[11px] gap-1 ${isCoursePublished ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
              onClick={() => setIsCoursePublished(!isCoursePublished)}
            >
              {isCoursePublished ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
              {isCoursePublished ? 'Published' : 'Draft'}
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8"
            onClick={() => { setLastSaved('just now'); }}
          >
            <Save className="h-3.5 w-3.5" /> Save Draft
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCourseSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <div className="flex items-center border rounded-lg overflow-hidden">
            {(['compact', 'comfortable', 'spacious'] as ViewDensity[]).map((d) => (
              <button
                key={d}
                onClick={() => setViewDensity(d)}
                className={`px-2 py-1 text-[10px] capitalize transition-colors ${
                  viewDensity === d ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {d.slice(0, 4)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground whitespace-nowrap">
            <Save className="h-3 w-3" /> Auto-saved: {lastSaved}
          </div>
        </div>
      </div>

      {/* ─── Three-Panel Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_340px] gap-4 min-h-[640px]">
        {/* ─── Left: Course Overview Sidebar ─── */}
        <Card className="overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground">Course Overview</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {/* Thumbnail */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted/50 border">
                {selectedCourse.thumbnailUrl ? (
                  <img src={selectedCourse.thumbnailUrl} alt={selectedCourse.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Modules</span>
                  <span className="font-medium">{modules.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Lessons</span>
                  <span className="font-medium">{totalLessons}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{formatDuration(totalDurationSec)}</span>
                </div>
                <Separator />
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-medium">{completionPct}%</span>
                  </div>
                  <Progress value={completionPct} className="h-1.5" />
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 h-8 text-xs"
                  onClick={() => setPreviewOpen(true)}
                >
                  <Eye className="h-3.5 w-3.5" /> Preview Course
                </Button>
                <Button
                  size="sm"
                  className={`w-full gap-1.5 h-8 text-xs ${isCoursePublished ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
                  onClick={() => setIsCoursePublished(!isCoursePublished)}
                >
                  {isCoursePublished ? (
                    <><CheckCircle2 className="h-3.5 w-3.5" /> Publish Course</>
                  ) : (
                    <><EyeOff className="h-3.5 w-3.5" /> Unpublish</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 h-8 text-xs"
                  onClick={() => setCourseSettingsOpen(true)}
                >
                  <Settings className="h-3.5 w-3.5" /> Course Settings
                </Button>
              </div>

              <Separator />

              {/* Module outline */}
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Outline</p>
                {modules.length === 0 ? (
                  <p className="text-xs text-muted-foreground/60 italic">No modules</p>
                ) : (
                  modules.map((mod, idx) => {
                    const accent = moduleAccentColors[mod.accentColor ?? idx % moduleAccentColors.length];
                    return (
                      <button
                        key={mod.id}
                        onClick={() => { if (!expandedModules.has(mod.id)) toggleModule(mod.id); }}
                        className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md hover:bg-muted/60 transition-colors text-xs"
                      >
                        <div className={`h-1.5 w-1.5 rounded-full ${accent.bar} shrink-0`} />
                        <span className="truncate flex-1 text-foreground/80">{mod.title}</span>
                        <Badge variant="outline" className="text-[9px] h-4 px-1 shrink-0">
                          {mod.lessons.length}
                        </Badge>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </ScrollArea>
        </Card>

        {/* ─── Center: Module & Lesson List ─── */}
        <Card className="overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Curriculum Builder</h3>
            <Select value={selectedCourseId} onValueChange={handleCourseChange}>
              <SelectTrigger className="w-[200px] h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {demoCourses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="flex-1">
            <div className={`p-4 ${densityClasses.gap} space-y-3`}>
              {modules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950 flex items-center justify-center mb-4">
                    <Layers className="h-8 w-8 text-emerald-400 dark:text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium">No modules yet</p>
                  <p className="text-xs mt-1 text-muted-foreground/70">Add your first module to start building!</p>
                  <Button
                    size="sm"
                    className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white gap-1.5 shadow-md"
                    onClick={() => setAddModuleOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add First Module
                  </Button>
                </div>
              ) : (
                <AnimatePresence>
                  {modules.map((mod, idx) => (
                    <BuilderModuleCard
                      key={mod.id}
                      module={mod}
                      index={idx}
                      isExpanded={expandedModules.has(mod.id)}
                      isEditingTitle={editingModuleTitle === mod.id}
                      isEditingDesc={editingModuleDesc === mod.id}
                      selectedLessonId={selectedLessonId}
                      onToggle={() => toggleModule(mod.id)}
                      onEditTitle={() => setEditingModuleTitle(mod.id)}
                      onUpdateTitle={(t) => updateModuleTitle(mod.id, t)}
                      onCancelEditTitle={() => setEditingModuleTitle(null)}
                      onEditDesc={() => setEditingModuleDesc(mod.id)}
                      onUpdateDesc={(d) => updateModuleDesc(mod.id, d)}
                      onCancelEditDesc={() => setEditingModuleDesc(null)}
                      onTogglePublished={() => toggleModulePublished(mod.id)}
                      onDelete={() => setDeleteConfirmId({ type: 'module', id: mod.id })}
                      onAddLesson={() => { setAddLessonModuleId(mod.id); setAddLessonOpen(true); }}
                      onMoveUp={() => moveModule(mod.id, 'up')}
                      onMoveDown={() => moveModule(mod.id, 'down')}
                      canMoveUp={idx > 0}
                      canMoveDown={idx < modules.length - 1}
                      onChangeAccent={(c) => changeModuleAccent(mod.id, c)}
                      onSelectLesson={(lid) => setSelectedLessonId(lid)}
                      onToggleLessonPreview={(lid) => toggleLessonPreview(mod.id, lid)}
                      onToggleLessonPublished={(lid) => toggleLessonPublished(mod.id, lid)}
                      onEditLessonTitle={(lid) => setEditingLessonTitle(lid)}
                      onUpdateLessonTitle={(lid, t) => updateLessonTitle(mod.id, lid, t)}
                      onCancelEditLessonTitle={() => setEditingLessonTitle(null)}
                      onDeleteLesson={(lid) => setDeleteConfirmId({ type: 'lesson', id: lid })}
                      onMoveLessonUp={(lid) => moveLesson(mod.id, lid, 'up')}
                      onMoveLessonDown={(lid) => moveLesson(mod.id, lid, 'down')}
                      onMoveLessonToModule={(lid, toModId) => moveLessonToModule(mod.id, lid, toModId)}
                      allModules={modules}
                      editingLessonTitle={editingLessonTitle}
                      density={densityClasses}
                    />
                  ))}
                </AnimatePresence>
              )}

              {/* Add Module Button */}
              {modules.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full h-10 border-dashed gap-1.5 text-muted-foreground hover:text-foreground bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 hover:from-emerald-100/50 hover:to-teal-100/50 dark:hover:from-emerald-950/30 dark:hover:to-teal-950/30"
                  onClick={() => setAddModuleOpen(true)}
                >
                  <Plus className="h-4 w-4" /> Add Module
                </Button>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* ─── Right: Lesson Content Editor Panel ─── */}
        <Card className="overflow-hidden flex flex-col">
          {selectedLessonData ? (
            <LessonContentEditor
              lesson={selectedLessonData.lesson}
              moduleId={selectedLessonData.moduleId}
              onUpdate={(field, value) => updateLessonContent(selectedLessonData.moduleId, selectedLessonData.lesson.id, field, value)}
              onTogglePreview={() => toggleLessonPreview(selectedLessonData.moduleId, selectedLessonData.lesson.id)}
              onTogglePublished={() => toggleLessonPublished(selectedLessonData.moduleId, selectedLessonData.lesson.id)}
              onClose={() => setSelectedLessonId(null)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
              <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                <Pencil className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium">Lesson Editor</p>
              <p className="text-xs mt-1 text-muted-foreground/70">Select a lesson to edit its content</p>
            </div>
          )}
        </Card>
      </div>

      {/* ─── Dialogs ─── */}
      <AddModuleDialog open={addModuleOpen} onOpenChange={setAddModuleOpen} onAdd={handleAddModule} />
      <AddLessonDialog
        open={addLessonOpen}
        onOpenChange={(open) => { setAddLessonOpen(open); if (!open) setAddLessonModuleId(null); }}
        onAdd={(title, type, dur) => addLessonModuleId && handleAddLesson(addLessonModuleId, title, type, dur)}
      />
      <EnhancedCourseSettingsDialog
        open={courseSettingsOpen}
        onOpenChange={setCourseSettingsOpen}
        course={selectedCourse}
      />
      <CoursePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        course={selectedCourse}
        modules={modules}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              {deleteConfirmId?.type === 'module'
                ? 'This will delete the module and all its lessons. This action cannot be undone.'
                : 'This will delete this lesson. This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!deleteConfirmId) return;
                if (deleteConfirmId.type === 'module') {
                  handleDeleteModule(deleteConfirmId.id);
                } else {
                  const mod = modules.find((m) => m.lessons.some((l) => l.id === deleteConfirmId.id));
                  if (mod) handleDeleteLesson(mod.id, deleteConfirmId.id);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Builder Module Card ───────────────────────────────────

function BuilderModuleCard({
  module,
  index,
  isExpanded,
  isEditingTitle,
  isEditingDesc,
  selectedLessonId,
  onToggle,
  onEditTitle,
  onUpdateTitle,
  onCancelEditTitle,
  onEditDesc,
  onUpdateDesc,
  onCancelEditDesc,
  onTogglePublished,
  onDelete,
  onAddLesson,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onChangeAccent,
  onSelectLesson,
  onToggleLessonPreview,
  onToggleLessonPublished,
  onEditLessonTitle,
  onUpdateLessonTitle,
  onCancelEditLessonTitle,
  onDeleteLesson,
  onMoveLessonUp,
  onMoveLessonDown,
  onMoveLessonToModule,
  allModules,
  editingLessonTitle,
  density,
}: {
  module: BuilderModule;
  index: number;
  isExpanded: boolean;
  isEditingTitle: boolean;
  isEditingDesc: boolean;
  selectedLessonId: string | null;
  onToggle: () => void;
  onEditTitle: () => void;
  onUpdateTitle: (title: string) => void;
  onCancelEditTitle: () => void;
  onEditDesc: () => void;
  onUpdateDesc: (desc: string) => void;
  onCancelEditDesc: () => void;
  onTogglePublished: () => void;
  onDelete: () => void;
  onAddLesson: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChangeAccent: (colorIndex: number) => void;
  onSelectLesson: (lessonId: string) => void;
  onToggleLessonPreview: (lessonId: string) => void;
  onToggleLessonPublished: (lessonId: string) => void;
  onEditLessonTitle: (lessonId: string) => void;
  onUpdateLessonTitle: (lessonId: string, title: string) => void;
  onCancelEditLessonTitle: () => void;
  onDeleteLesson: (lessonId: string) => void;
  onMoveLessonUp: (lessonId: string) => void;
  onMoveLessonDown: (lessonId: string) => void;
  onMoveLessonToModule: (lessonId: string, toModuleId: string) => void;
  allModules: BuilderModule[];
  editingLessonTitle: string | null;
  density: { gap: string; py: string; px: string; text: string; lessonPy: string };
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const accent = moduleAccentColors[module.accentColor ?? index % moduleAccentColors.length];
  const lessonCount = module.lessons.length;
  const modDurationSec = module.lessons.reduce((a, l) => a + (l.videoDuration || 0), 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, layout: { duration: 0.2 } }}
    >
      <div className="group rounded-xl border border-border/70 hover:border-border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md backdrop-blur-sm bg-card/90">
        <div className="flex">
          {/* Color accent bar */}
          <div className="relative w-1.5 shrink-0">
            <div className={`absolute inset-0 bg-gradient-to-b ${accent.gradient}`} />
            {/* Color picker trigger */}
            <button
              className="absolute bottom-1 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-black/50 border border-white/20 flex items-center justify-center"
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <Palette className="h-2 w-2 text-foreground/60" />
            </button>
          </div>

          {/* Color picker popup */}
          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute left-5 top-2 z-10 bg-popover border rounded-lg shadow-lg p-1.5 flex gap-1"
              >
                {moduleAccentColors.map((c, i) => (
                  <button
                    key={c.name}
                    onClick={() => { onChangeAccent(i); setShowColorPicker(false); }}
                    className={`h-5 w-5 rounded-full ${c.bar} transition-transform hover:scale-110 ${
                      (module.accentColor ?? index % moduleAccentColors.length) === i ? 'ring-2 ring-offset-1 ring-foreground/30' : ''
                    }`}
                    title={c.name}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1">
            {/* Module header */}
            <div className={`${density.px} ${density.py}`}>
              <div className="flex items-center gap-2">
                {/* Drag handle */}
                <div className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-muted/60 text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0">
                  <GripVertical className="h-4 w-4" />
                </div>

                {/* Module number badge */}
                <div className={`h-6 w-6 rounded-md bg-gradient-to-br ${accent.gradient} flex items-center justify-center shrink-0`}>
                  <span className="text-[10px] font-bold text-white">{index + 1}</span>
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0" onDoubleClick={(e) => { e.stopPropagation(); onEditTitle(); }}>
                  {isEditingTitle ? (
                    <Input
                      autoFocus
                      defaultValue={module.title}
                      onBlur={(e) => onUpdateTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onUpdateTitle((e.target as HTMLInputElement).value);
                        if (e.key === 'Escape') onCancelEditTitle();
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="h-6 text-sm px-1 py-0"
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground truncate cursor-default">{module.title}</p>
                  )}
                </div>

                {/* Lesson count badge */}
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 shrink-0 gap-1">
                  <BookOpen className="h-2.5 w-2.5" /> {lessonCount}
                </Badge>

                {/* Reorder buttons */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-6 w-6 ${!canMoveUp ? 'opacity-20' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                    onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                    disabled={!canMoveUp}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-6 w-6 ${!canMoveDown ? 'opacity-20' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                    onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                    disabled={!canMoveDown}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>

                {/* Status */}
                <button
                  onClick={(e) => { e.stopPropagation(); onTogglePublished(); }}
                  className="shrink-0"
                >
                  {module.isPublished ? (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] px-1.5 py-0 border-0">
                      Published
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-[10px] px-1.5 py-0 border-0">
                      Draft
                    </Badge>
                  )}
                </button>

                {/* Delete */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>

                {/* Expand/collapse toggle */}
                <motion.button
                  onClick={(e) => { e.stopPropagation(); onToggle(); }}
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-0.5 rounded hover:bg-muted/60 text-muted-foreground shrink-0"
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Description */}
              <div className="ml-8 mt-1" onDoubleClick={(e) => { e.stopPropagation(); onEditDesc(); }}>
                {isEditingDesc ? (
                  <Input
                    autoFocus
                    defaultValue={module.description || ''}
                    placeholder="Add description..."
                    onBlur={(e) => onUpdateDesc(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onUpdateDesc((e.target as HTMLInputElement).value);
                      if (e.key === 'Escape') onCancelEditDesc();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="h-5 text-xs px-1 py-0"
                  />
                ) : (
                  <p className="text-[11px] text-muted-foreground/70 truncate cursor-default">
                    {module.description || 'Double-click to add description...'}
                  </p>
                )}
              </div>

              {/* Module meta */}
              <div className="flex items-center gap-3 mt-1.5 ml-8 text-[11px] text-muted-foreground">
                {modDurationSec > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {formatDuration(modDurationSec)}
                  </span>
                )}
                <span>{module.lessons.filter((l) => l.isPublished).length}/{lessonCount} published</span>
              </div>
            </div>

            {/* Expanded: Lesson cards */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className={`${density.px} pb-3 space-y-1.5`}>
                    <div className="border-t border-border/50 pt-2" />

                    {/* Vertical line connector */}
                    <div className="relative ml-4">
                      <div className="absolute left-3 top-0 bottom-0 w-px bg-border/40" />

                      {module.lessons.length > 0 ? (
                        module.lessons
                          .sort((a, b) => a.orderIndex - b.orderIndex)
                          .map((lesson, lIdx) => {
                            const typeColor = lessonTypeColors[lesson.contentType] || lessonTypeColors.text;
                            const isSelected = selectedLessonId === lesson.id;
                            const isEditing = editingLessonTitle === lesson.id;
                            const canLUp = lIdx > 0;
                            const canLDown = lIdx < module.lessons.length - 1;
                            const otherModules = allModules.filter((m) => m.id !== module.id);

                            return (
                              <motion.div
                                key={lesson.id}
                                layout
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 8 }}
                                transition={{ duration: 0.15 }}
                                className={`relative flex items-center gap-2 ${density.lessonPy} px-3 ml-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                                  isSelected
                                    ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm'
                                    : 'border-border/40 hover:border-border hover:bg-muted/20'
                                }`}
                                onClick={() => onSelectLesson(lesson.id)}
                              >
                                {/* Connector dot */}
                                <div className={`absolute -left-5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full border-2 ${
                                  isSelected ? `border-emerald-400 bg-emerald-400` : 'border-border bg-background'
                                }`} />

                                {/* Content type badge */}
                                <div className={`h-6 w-6 rounded flex items-center justify-center shrink-0 ${typeColor.bg}`}>
                                  <ContentTypeIcon type={lesson.contentType} className={`h-3 w-3 ${typeColor.text}`} />
                                </div>

                                {/* Title */}
                                <div className="flex-1 min-w-0" onDoubleClick={(e) => { e.stopPropagation(); onEditLessonTitle(lesson.id); }}>
                                  {isEditing ? (
                                    <Input
                                      autoFocus
                                      defaultValue={lesson.title}
                                      onBlur={(e) => onUpdateLessonTitle(lesson.id, e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') onUpdateLessonTitle(lesson.id, (e.target as HTMLInputElement).value);
                                        if (e.key === 'Escape') onCancelEditLessonTitle();
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="h-5 text-xs px-1 py-0"
                                    />
                                  ) : (
                                    <p className="text-xs text-foreground truncate">{lesson.title}</p>
                                  )}
                                </div>

                                {/* Content type label */}
                                <Badge variant="outline" className={`text-[9px] h-4 px-1 shrink-0 ${typeColor.border} ${typeColor.text}`}>
                                  {lessonTypeLabels[lesson.contentType] || lesson.contentType}
                                </Badge>

                                {/* Duration */}
                                {lesson.videoDuration && (
                                  <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-0.5">
                                    <Clock className="h-2.5 w-2.5" /> {formatDuration(lesson.videoDuration)}
                                  </span>
                                )}

                                {/* Preview toggle */}
                                <button
                                  onClick={(e) => { e.stopPropagation(); onToggleLessonPreview(lesson.id); }}
                                  className={`shrink-0 p-0.5 rounded transition-colors ${lesson.isPreview ? 'text-amber-500' : 'text-muted-foreground/30 hover:text-muted-foreground'}`}
                                  title={lesson.isPreview ? 'Remove preview' : 'Mark as preview'}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>

                                {/* Published toggle */}
                                <button
                                  onClick={(e) => { e.stopPropagation(); onToggleLessonPublished(lesson.id); }}
                                  className="shrink-0 hover:scale-110 transition-transform"
                                  title={lesson.isPublished ? 'Unpublish' : 'Publish'}
                                >
                                  {lesson.isPublished ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                  ) : (
                                    <Circle className="h-3.5 w-3.5 text-muted-foreground/40 hover:text-muted-foreground" />
                                  )}
                                </button>

                                {/* Lesson reorder buttons */}
                                <div className="flex items-center gap-0 shrink-0 opacity-0 group-hover:opacity-0" style={{ opacity: 1 }}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-5 w-5 ${!canLUp ? 'opacity-20' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); onMoveLessonUp(lesson.id); }}
                                    disabled={!canLUp}
                                  >
                                    <ChevronUp className="h-2.5 w-2.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-5 w-5 ${!canLDown ? 'opacity-20' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); onMoveLessonDown(lesson.id); }}
                                    disabled={!canLDown}
                                  >
                                    <ChevronDown className="h-2.5 w-2.5" />
                                  </Button>
                                </div>

                                {/* Move to module dropdown */}
                                {otherModules.length > 0 && (
                                  <Select
                                    onValueChange={(val) => { onMoveLessonToModule(lesson.id, val); }}
                                  >
                                    <SelectTrigger
                                      className="h-5 w-5 p-0 border-0 bg-transparent shrink-0"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="h-3 w-3 text-muted-foreground/50" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="__header__" disabled className="text-[10px] text-muted-foreground">
                                        Move to module...
                                      </SelectItem>
                                      {otherModules.map((m) => (
                                        <SelectItem key={m.id} value={m.id} className="text-xs">
                                          {m.title}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}

                                {/* Delete */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 opacity-0 hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
                                  style={{ opacity: undefined }}
                                  onClick={(e) => { e.stopPropagation(); onDeleteLesson(lesson.id); }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </motion.div>
                            );
                          })
                      ) : (
                        <div className="ml-4 py-4 text-center">
                          <p className="text-xs text-muted-foreground/60">No lessons yet</p>
                        </div>
                      )}
                    </div>

                    {/* Add Lesson Button */}
                    <div className="ml-8 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px] gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 w-full border border-dashed border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700"
                        onClick={(e) => { e.stopPropagation(); onAddLesson(); }}
                      >
                        <Plus className="h-3 w-3" /> Add Lesson
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Lesson Content Editor Panel ───────────────────────────

function LessonContentEditor({
  lesson,
  moduleId,
  onUpdate,
  onTogglePreview,
  onTogglePublished,
  onClose,
}: {
  lesson: BuilderLesson;
  moduleId: string;
  onUpdate: (field: string, value: string | number | boolean) => void;
  onTogglePreview: () => void;
  onTogglePublished: () => void;
  onClose: () => void;
}) {
  const [showToolbar, setShowToolbar] = useState(true);
  const typeColor = lessonTypeColors[lesson.contentType] || lessonTypeColors.text;

  return (
    <>
      <div className="p-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`h-6 w-6 rounded flex items-center justify-center shrink-0 ${typeColor.bg}`}>
              <ContentTypeIcon type={lesson.contentType} className={`h-3 w-3 ${typeColor.text}`} />
            </div>
            <h3 className="text-sm font-semibold text-foreground truncate">{lesson.title}</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Title */}
          <div className="grid gap-1.5">
            <Label className="text-xs">Title</Label>
            <Input
              value={lesson.title}
              onChange={(e) => onUpdate('title', e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          {/* Content Type */}
          <div className="grid gap-1.5">
            <Label className="text-xs">Content Type</Label>
            <Select value={lesson.contentType} onValueChange={(v) => onUpdate('contentType', v)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="live_session">Live Session</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rich Text Editor */}
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Content</Label>
              <Button variant="ghost" size="sm" className="h-5 text-[10px] gap-1" onClick={() => setShowToolbar(!showToolbar)}>
                <Pencil className="h-2.5 w-2.5" /> {showToolbar ? 'Hide' : 'Show'} toolbar
              </Button>
            </div>
            {showToolbar && (
              <div className="flex items-center gap-0.5 p-1 border rounded-t-md bg-muted/30">
                {[
                  { icon: Bold, label: 'Bold' },
                  { icon: Italic, label: 'Italic' },
                  { icon: Heading1, label: 'Heading' },
                  { icon: List, label: 'List' },
                  { icon: Code2, label: 'Code' },
                  { icon: Link2, label: 'Link' },
                  { icon: ImageIcon, label: 'Image' },
                ].map(({ icon: Icon, label }) => (
                  <Button key={label} variant="ghost" size="icon" className="h-6 w-6" title={label}>
                    <Icon className="h-3 w-3" />
                  </Button>
                ))}
              </div>
            )}
            <Textarea
              value={lesson.content || ''}
              onChange={(e) => onUpdate('content', e.target.value)}
              placeholder="Write your lesson content here..."
              rows={8}
              className={`text-sm resize-none ${showToolbar ? 'rounded-t-none' : ''}`}
            />
          </div>

          {/* Video URL */}
          {(lesson.contentType === 'video' || lesson.contentType === 'live_session') && (
            <div className="grid gap-1.5">
              <Label className="text-xs">Video URL</Label>
              <div className="flex gap-2">
                <Input
                  value={lesson.videoUrl || ''}
                  onChange={(e) => onUpdate('videoUrl', e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or Vimeo URL"
                  className="h-8 text-xs flex-1"
                />
                <Button variant="outline" size="sm" className="h-8 px-2 shrink-0">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
              {/* Embed Preview */}
              {lesson.videoUrl && (lesson.videoUrl.includes('youtube') || lesson.videoUrl.includes('vimeo')) && (
                <div className="aspect-video rounded-lg border bg-muted/30 flex items-center justify-center">
                  <div className="text-center">
                    <Video className="h-8 w-8 text-muted-foreground/30 mx-auto mb-1" />
                    <p className="text-[10px] text-muted-foreground">Video embed preview</p>
                    <p className="text-[10px] text-muted-foreground/60 truncate max-w-[200px]">{lesson.videoUrl}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Duration */}
          <div className="grid gap-1.5">
            <Label className="text-xs">Duration (minutes)</Label>
            <Input
              type="number"
              value={lesson.videoDuration ? Math.round(lesson.videoDuration / 60) : 0}
              onChange={(e) => onUpdate('videoDuration', (parseInt(e.target.value) || 0) * 60)}
              min={0}
              className="h-8 text-xs w-24"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Eye className={`h-4 w-4 ${lesson.isPreview ? 'text-amber-500' : 'text-muted-foreground/50'}`} />
                <div>
                  <Label className="text-xs">Mark as Preview</Label>
                  <p className="text-[10px] text-muted-foreground">Allow free access before purchase</p>
                </div>
              </div>
              <Switch checked={lesson.isPreview} onCheckedChange={onTogglePreview} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                {lesson.isPublished ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/50" />
                )}
                <div>
                  <Label className="text-xs">Published</Label>
                  <p className="text-[10px] text-muted-foreground">{lesson.isPublished ? 'Visible to learners' : 'Hidden (draft)'}</p>
                </div>
              </div>
              <Switch checked={lesson.isPublished} onCheckedChange={onTogglePublished} />
            </div>
          </div>

          {/* Resources */}
          <div className="grid gap-1.5">
            <Label className="text-xs">Resources</Label>
            {lesson.resources && lesson.resources.length > 0 ? (
              <div className="space-y-1">
                {lesson.resources.map((r) => (
                  <div key={r.id} className="flex items-center gap-2 text-xs p-2 rounded-md border bg-muted/30">
                    {r.type === 'file' && <Upload className="h-3 w-3 text-muted-foreground" />}
                    {r.type === 'link' && <Link2 className="h-3 w-3 text-muted-foreground" />}
                    {r.type === 'document' && <File className="h-3 w-3 text-muted-foreground" />}
                    <span className="flex-1 truncate">{r.name}</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0">
                      <X className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground/60 italic">No resources attached</p>
            )}
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 flex-1">
                <Upload className="h-2.5 w-2.5" /> File
              </Button>
              <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 flex-1">
                <Link2 className="h-2.5 w-2.5" /> Link
              </Button>
              <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 flex-1">
                <File className="h-2.5 w-2.5" /> Document
              </Button>
            </div>
          </div>

          {/* Save button */}
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-9 text-xs">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </Button>
        </div>
      </ScrollArea>
    </>
  );
}

// ─── Add Module Dialog ─────────────────────────────────────

function AddModuleDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (title: string, description: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) {
      setTitleError('Module title is required');
      return;
    }
    onAdd(title.trim(), description.trim());
    setTitle('');
    setDescription('');
    setTitleError('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTitle('');
      setDescription('');
      setTitleError('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Plus className="h-3.5 w-3.5 text-white" />
            </div>
            Add New Module
          </DialogTitle>
          <DialogDescription>
            Create a new module to organize your course content. You can add lessons after creating the module.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="module-title">Module Title *</Label>
            <Input
              id="module-title"
              placeholder="e.g. Introduction to React Hooks"
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (titleError) setTitleError(''); }}
              autoFocus
            />
            {titleError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-destructive"
              >
                {titleError}
              </motion.p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="module-desc">Description (optional)</Label>
            <Textarea
              id="module-desc"
              placeholder="Brief description of what this module covers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={handleSubmit}>
            <Plus className="h-3.5 w-3.5" /> Create Module
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Lesson Dialog ─────────────────────────────────────

function AddLessonDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (title: string, type: Lesson['contentType'], durationMin: number) => void;
}) {
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState<Lesson['contentType']>('video');
  const [duration, setDuration] = useState('');
  const [titleError, setTitleError] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) {
      setTitleError('Lesson title is required');
      return;
    }
    onAdd(title.trim(), contentType, parseInt(duration) || 0);
    setTitle('');
    setContentType('video');
    setDuration('');
    setTitleError('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTitle('');
      setContentType('video');
      setDuration('');
      setTitleError('');
    }
    onOpenChange(newOpen);
  };

  const contentTypes = [
    { value: 'video' as const, icon: Video, label: 'Video', bg: 'bg-sky-50 dark:bg-sky-950/50', border: 'border-sky-300 dark:border-sky-700', text: 'text-sky-700 dark:text-sky-300' },
    { value: 'text' as const, icon: FileText, label: 'Text', bg: 'bg-emerald-50 dark:bg-emerald-950/50', border: 'border-emerald-300 dark:border-emerald-700', text: 'text-emerald-700 dark:text-emerald-300' },
    { value: 'audio' as const, icon: Headphones, label: 'Audio', bg: 'bg-violet-50 dark:bg-violet-950/50', border: 'border-violet-300 dark:border-violet-700', text: 'text-violet-700 dark:text-violet-300' },
    { value: 'document' as const, icon: File, label: 'Document', bg: 'bg-orange-50 dark:bg-orange-950/50', border: 'border-orange-300 dark:border-orange-700', text: 'text-orange-700 dark:text-orange-300' },
    { value: 'live_session' as const, icon: Radio, label: 'Live Session', bg: 'bg-amber-50 dark:bg-amber-950/50', border: 'border-amber-300 dark:border-amber-700', text: 'text-amber-700 dark:text-amber-300' },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center">
              <BookOpen className="h-3.5 w-3.5 text-white" />
            </div>
            Add New Lesson
          </DialogTitle>
          <DialogDescription>
            Add a lesson to this module. Choose the content type and set the estimated duration.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="lesson-title">Lesson Title *</Label>
            <Input
              id="lesson-title"
              placeholder="e.g. Getting Started with Hooks"
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (titleError) setTitleError(''); }}
              autoFocus
            />
            {titleError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-destructive"
              >
                {titleError}
              </motion.p>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Content Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {contentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setContentType(type.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all ${
                    contentType === type.value
                      ? `${type.border} ${type.bg} ${type.text}`
                      : 'border-border hover:border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lesson-duration">Duration (minutes)</Label>
            <Input
              id="lesson-duration"
              type="number"
              placeholder="e.g. 15"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min={0}
            />
            <p className="text-xs text-muted-foreground">Estimated duration for this lesson</p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={handleSubmit}>
            <Plus className="h-3.5 w-3.5" /> Add Lesson
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Enhanced Course Settings Dialog ───────────────────────

function EnhancedCourseSettingsDialog({
  open,
  onOpenChange,
  course,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
}) {
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description || '');
  const [category, setCategory] = useState(course.category || '');
  const [level, setLevel] = useState(course.level);
  const [language, setLanguage] = useState(course.language);
  const [isPublished, setIsPublished] = useState(course.isPublished);
  const [price, setPrice] = useState(course.price.toString());
  const [compareAtPrice, setCompareAtPrice] = useState(course.compareAtPrice?.toString() || '');
  const [certificateTemplate, setCertificateTemplate] = useState(course.certificateTemplateId || '');
  const [metaTitle, setMetaTitle] = useState(course.title);
  const [metaDescription, setMetaDescription] = useState(course.description?.slice(0, 160) || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onOpenChange(false);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            Course Settings
          </DialogTitle>
          <DialogDescription>
            Configure the course details, pricing, SEO, and metadata.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh]">
          <div className="grid gap-5 py-4">
            {/* Thumbnail upload area */}
            <div className="grid gap-2">
              <Label>Course Thumbnail</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors cursor-pointer">
                <div className="h-20 w-28 mx-auto bg-muted/50 rounded-lg flex items-center justify-center mb-3">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">Click or drag to upload thumbnail</p>
                <p className="text-xs text-muted-foreground mt-1">Recommended: 1280×720, max 2MB</p>
              </div>
            </div>

            <Separator />

            {/* Course title & description */}
            <div className="grid gap-2">
              <Label htmlFor="settings-title">Course Title</Label>
              <Input id="settings-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="settings-desc">Description</Label>
              <Textarea id="settings-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="resize-none" />
            </div>

            <Separator />

            {/* Category, Level, Language */}
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="AI & ML">AI & ML</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Level</Label>
                <Select value={level} onValueChange={(v) => setLevel(v as Course['level'])}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div>
              <Label className="text-sm font-medium">Pricing</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">Price ($)</Label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">Compare-at price ($)</Label>
                  <Input
                    type="number"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Certificate template */}
            <div className="grid gap-2">
              <Label>Certificate Template</Label>
              <Select value={certificateTemplate} onValueChange={setCertificateTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic Certificate</SelectItem>
                  <SelectItem value="modern">Modern Certificate</SelectItem>
                  <SelectItem value="minimal">Minimal Certificate</SelectItem>
                  <SelectItem value="premium">Premium Certificate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* SEO */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5" /> SEO
              </Label>
              <div className="grid gap-3 mt-2">
                <div className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">Meta Title</Label>
                  <Input
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="SEO title..."
                    maxLength={70}
                  />
                  <p className="text-[10px] text-muted-foreground">{metaTitle.length}/70 characters</p>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">Meta Description</Label>
                  <Textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="SEO description..."
                    rows={2}
                    className="resize-none"
                    maxLength={160}
                  />
                  <p className="text-[10px] text-muted-foreground">{metaDescription.length}/160 characters</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Publish toggle */}
            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div className="flex items-center gap-3">
                {isPublished ? (
                  <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                    <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                )}
                <div>
                  <Label className="text-sm">Course Status</Label>
                  <p className="text-xs text-muted-foreground">
                    {isPublished ? 'Visible to learners' : 'Hidden from learners (Draft)'}
                  </p>
                </div>
              </div>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className={`gap-1.5 transition-all duration-300 ${
              saved
                ? 'bg-emerald-500 hover:bg-emerald-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            onClick={handleSave}
          >
            {saved ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </motion.div>
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Settings
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Course Preview Dialog ─────────────────────────────────

function CoursePreviewDialog({
  open,
  onOpenChange,
  course,
  modules,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  modules: BuilderModule[];
}) {
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalDuration = modules.reduce((acc, m) => acc + m.lessons.reduce((a, l) => a + (l.videoDuration || 0), 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-muted-foreground" />
            Course Preview
          </DialogTitle>
          <DialogDescription>
            This is how learners will see your course.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Hero */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-bold text-foreground">{course.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{course.description}</p>
                <div className="flex items-center justify-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> {modules.length} modules</span>
                  <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {totalLessons} lessons</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDuration(totalDuration)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Module list */}
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-2">
              {modules.map((mod, idx) => {
                const accent = moduleAccentColors[mod.accentColor ?? idx % moduleAccentColors.length];
                return (
                  <div key={mod.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className={`h-8 w-8 rounded-md bg-gradient-to-br ${accent.gradient} flex items-center justify-center shrink-0`}>
                      <span className="text-[10px] font-bold text-white">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{mod.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {mod.lessons.length} lessons · {formatDuration(mod.lessons.reduce((a, l) => a + (l.videoDuration || 0), 0))}
                      </p>
                    </div>
                    {mod.isPublished ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close Preview</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Review Management Tab ──────────────────────────────────

function ReviewManagementTab() {
  const [reviews, setReviews] = useState<CourseReview[]>(allMockReviews);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyReviewId, setReplyReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchSearch =
        !search ||
        r.userName.toLowerCase().includes(search.toLowerCase()) ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.content.toLowerCase().includes(search.toLowerCase());
      const matchCourse = courseFilter === 'all' || r.courseId === courseFilter;
      const matchRating = ratingFilter === 'all' || r.rating.toString() === ratingFilter;
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchCourse && matchRating && matchStatus;
    });
  }, [reviews, search, courseFilter, ratingFilter, statusFilter]);

  // Stats
  const totalReviews = reviews.length;
  const flaggedCount = reviews.filter((r) => r.status === 'flagged').length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1)
    : '0';
  const responseRate = totalReviews > 0
    ? Math.round((reviews.filter((r) => r.instructorReply).length / totalReviews) * 100)
    : 0;

  // Flag/unflag review
  const handleToggleFlag = (id: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === 'flagged' ? 'published' : 'flagged' }
          : r
      )
    );
  };

  // Hide review
  const handleHideReview = (id: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === 'hidden' ? 'published' : 'hidden' }
          : r
      )
    );
  };

  // Submit reply
  const handleSubmitReply = () => {
    if (!replyReviewId || !replyText.trim()) return;
    setReviews((prev) =>
      prev.map((r) =>
        r.id === replyReviewId
          ? {
              ...r,
              instructorReply: {
                instructorName: 'Sarah Mitchell',
                content: replyText.trim(),
                date: new Date().toISOString(),
              },
            }
          : r
      )
    );
    setReplyText('');
    setReplyReviewId(null);
    setReplyDialogOpen(false);
  };

  // Delete review
  const handleDeleteReview = () => {
    if (!deleteReviewId) return;
    setReviews((prev) => prev.filter((r) => r.id !== deleteReviewId));
    setDeleteReviewId(null);
    setDeleteDialogOpen(false);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Course', 'Reviewer', 'Rating', 'Title', 'Content', 'Date', 'Status', 'Helpful', 'Tags'];
    const courseMap = Object.fromEntries(demoCourses.map((c) => [c.id, c.title]));
    const rows = filteredReviews.map((r) => [
      courseMap[r.courseId] || r.courseId,
      r.userName,
      r.rating,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.content.replace(/"/g, '""')}"`,
      new Date(r.date).toLocaleDateString(),
      r.status,
      r.helpfulCount,
      r.tags.join('; '),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course-reviews.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays < 1) return 'Today';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString();
  };

  const statusColors: Record<string, string> = {
    published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    flagged: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    hidden: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reviews', value: totalReviews, icon: MessageSquare, color: 'text-amber-600' },
          { label: 'Flagged', value: flaggedCount, icon: Flag, color: 'text-red-600' },
          { label: 'Avg. Rating', value: avgRating, icon: Star, color: 'text-amber-500' },
          { label: 'Response Rate', value: `${responseRate}%`, icon: Send, color: 'text-emerald-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {demoCourses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title.length > 30 ? c.title.slice(0, 30) + '...' : c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                {[5, 4, 3, 2, 1].map((r) => (
                  <SelectItem key={r} value={r.toString()}>
                    {r} Star{r > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportCSV}>
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Review List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredReviews.length} of {totalReviews} reviews
          </p>
        </div>
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-3 pr-4">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => {
                const courseName = demoCourses.find((c) => c.id === review.courseId)?.title || 'Unknown Course';
                return (
                  <Card key={review.id} className={cn(
                    'transition-all',
                    review.status === 'flagged' && 'border-red-200 dark:border-red-800/50',
                    review.status === 'hidden' && 'opacity-60',
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="text-xs bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 dark:from-amber-900/40 dark:to-amber-800/40 dark:text-amber-300">
                            {review.userAvatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center flex-wrap gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">{review.userName}</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {courseName.length > 25 ? courseName.slice(0, 25) + '...' : courseName}
                            </Badge>
                            <Badge className={cn('text-[10px] px-1.5 py-0', statusColors[review.status])}>
                              {review.status === 'flagged' && <Flag className="h-2.5 w-2.5 mr-0.5" />}
                              {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">· {formatDate(review.date)}</span>
                          </div>

                          {/* Stars + Helpful */}
                          <div className="flex items-center gap-3 mb-1.5">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={cn(
                                    'h-3.5 w-3.5',
                                    s <= review.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-muted-foreground/30'
                                  )}
                                />
                              ))}
                            </div>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <ThumbsUp className="h-3 w-3" /> {review.helpfulCount}
                            </span>
                            {review.isVerifiedPurchase && (
                              <span className="flex items-center gap-0.5 text-[10px] text-emerald-600">
                                <ShieldCheck className="h-3 w-3" /> Verified
                              </span>
                            )}
                          </div>

                          {/* Title & Content */}
                          <h4 className="text-sm font-semibold text-foreground mb-0.5">{review.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{review.content}</p>

                          {/* Tags */}
                          {review.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {review.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Instructor Reply indicator */}
                          {review.instructorReply && (
                            <div className="flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 mb-2">
                              <MessageSquare className="h-3 w-3" />
                              <span>Instructor replied: &quot;{review.instructorReply.content.slice(0, 50)}...&quot;</span>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                'h-7 text-xs gap-1',
                                review.status === 'flagged'
                                  ? 'text-red-600 hover:text-red-700'
                                  : 'text-muted-foreground hover:text-foreground'
                              )}
                              onClick={() => handleToggleFlag(review.id)}
                            >
                              <Flag className="h-3.5 w-3.5" />
                              {review.status === 'flagged' ? 'Unflag' : 'Flag'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                'h-7 text-xs gap-1',
                                review.status === 'hidden'
                                  ? 'text-amber-600 hover:text-amber-700'
                                  : 'text-muted-foreground hover:text-foreground'
                              )}
                              onClick={() => handleHideReview(review.id)}
                            >
                              {review.status === 'hidden' ? (
                                <><Eye className="h-3.5 w-3.5" /> Unhide</>
                              ) : (
                                <><Eye className="h-3.5 w-3.5" /> Hide</>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                setReplyReviewId(review.id);
                                setReplyText('');
                                setReplyDialogOpen(true);
                              }}
                            >
                              <Send className="h-3.5 w-3.5" />
                              Reply
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs gap-1 text-muted-foreground hover:text-red-600"
                              onClick={() => {
                                setDeleteReviewId(review.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No reviews match your filters.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-violet-500" />
              Reply to Review
            </DialogTitle>
            <DialogDescription>
              Your reply will be visible to all learners as an instructor response.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {replyReviewId && (() => {
              const review = reviews.find((r) => r.id === replyReviewId);
              if (!review) return null;
              return (
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{review.userName}</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            'h-3 w-3',
                            s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{review.content.slice(0, 100)}...</p>
                </div>
              );
            })()}
            <Textarea
              placeholder="Write your instructor response..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReply}
              disabled={!replyText.trim()}
              className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Send className="h-4 w-4" />
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Review
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The review will be permanently removed from the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteReview}>
              Delete Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function AdminCourses() {
  const [activeTab, setActiveTab] = useState('catalog');

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Course Management</h1>
        <p className="text-muted-foreground mt-1">
          Create, manage, and organize your course catalog and curriculum
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="catalog" className="gap-1.5">
            <LayoutList className="h-3.5 w-3.5" />
            Course Catalog
          </TabsTrigger>
          <TabsTrigger value="builder" className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            Course Builder
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            Curriculum Overview
          </TabsTrigger>
          <TabsTrigger value="visual-builder" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Visual Builder
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Reviews
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <TabsContent value="catalog" forceMount={activeTab === 'catalog'} hidden={activeTab !== 'catalog'}>
              <CourseCatalogTab />
            </TabsContent>
            <TabsContent value="builder" forceMount={activeTab === 'builder'} hidden={activeTab !== 'builder'}>
              <CourseBuilderTab />
            </TabsContent>
            <TabsContent value="curriculum" forceMount={activeTab === 'curriculum'} hidden={activeTab !== 'curriculum'}>
              <CurriculumOverviewTab />
            </TabsContent>
            <TabsContent value="visual-builder" forceMount={activeTab === 'visual-builder'} hidden={activeTab !== 'visual-builder'}>
              <VisualCourseBuilderTab />
            </TabsContent>
            <TabsContent value="reviews" forceMount={activeTab === 'reviews'} hidden={activeTab !== 'reviews'}>
              <ReviewManagementTab />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
