'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  Video,
  FileText,
  Headphones,
  File,
  Radio,
  Eye,
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
import { demoCourses } from '@/lib/mock-data';
import type { Course, Module, Lesson } from '@/types';

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

// ─── Tab 4: Visual Course Builder ───────────────────────────

const builderModuleGradients = [
  'from-emerald-500 to-teal-500',
  'from-violet-500 to-purple-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-sky-500',
  'from-fuchsia-500 to-pink-500',
];

type BuilderModule = Module & { lessons: BuilderLesson[] };
type BuilderLesson = Lesson;

function VisualCourseBuilderTab() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(demoCourses[0].id);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [addLessonModuleId, setAddLessonModuleId] = useState<string | null>(null);
  const [courseSettingsOpen, setCourseSettingsOpen] = useState(false);
  const [editingModuleTitle, setEditingModuleTitle] = useState<string | null>(null);
  const [editingLessonTitle, setEditingLessonTitle] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<{ type: 'module' | 'lesson'; id: string } | null>(null);

  // Local mutable modules state
  const [modules, setModules] = useState<BuilderModule[]>(() => {
    const c = demoCourses[0];
    return (c.modules || []).map((m) => ({
      ...m,
      lessons: [...(m.lessons || [])],
    })) as BuilderModule[];
  });

  const selectedCourse = useMemo(
    () => demoCourses.find((c) => c.id === selectedCourseId) || demoCourses[0],
    [selectedCourseId]
  );

  // Sync modules when course changes
  const handleCourseChange = useCallback((courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedModuleId(null);
    const c = demoCourses.find((co) => co.id === courseId) || demoCourses[0];
    setModules(
      (c.modules || []).map((m) => ({
        ...m,
        lessons: [...(m.lessons || [])],
      })) as BuilderModule[]
    );
    setExpandedModules(new Set());
  }, []);

  // Module DnD sensors
  const moduleSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Lesson DnD sensors
  const lessonSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Module drag handlers
  const handleModuleDragStart = (event: DragStartEvent) => {
    setActiveModuleId(event.active.id as string);
  };

  const handleModuleDragEnd = (event: DragEndEvent) => {
    setActiveModuleId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setModules((prev) => {
        const oldIndex = prev.findIndex((m) => m.id === active.id);
        const newIndex = prev.findIndex((m) => m.id === over.id);
        const moved = arrayMove(prev, oldIndex, newIndex);
        return moved.map((m, i) => ({ ...m, orderIndex: i }));
      });
    }
  };

  // Lesson drag handlers
  const handleLessonDragStart = (event: DragStartEvent) => {
    setActiveLessonId(event.active.id as string);
  };

  const handleLessonDragEnd = (moduleId: string) => (event: DragEndEvent) => {
    setActiveLessonId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setModules((prev) =>
        prev.map((mod) => {
          if (mod.id !== moduleId) return mod;
          const lessons = [...mod.lessons];
          const oldIndex = lessons.findIndex((l) => l.id === active.id);
          const newIndex = lessons.findIndex((l) => l.id === over.id);
          const moved = arrayMove(lessons, oldIndex, newIndex);
          return { ...mod, lessons: moved.map((l, i) => ({ ...l, orderIndex: i })) };
        })
      );
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const selectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    if (!expandedModules.has(moduleId)) {
      toggleModule(moduleId);
    }
  };

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
    };
    setModules((prev) => [...prev, newMod]);
    setAddModuleOpen(false);
    setExpandedModules((prev) => new Set([...prev, newMod.id]));
    setSelectedModuleId(newMod.id);
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
      videoDuration: contentType === 'video' ? durationMin * 60 : contentType === 'audio' ? durationMin * 60 : undefined,
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
  };

  // Delete module
  const handleDeleteModule = (moduleId: string) => {
    setModules((prev) => prev.filter((m) => m.id !== moduleId).map((m, i) => ({ ...m, orderIndex: i })));
    if (selectedModuleId === moduleId) setSelectedModuleId(null);
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
    setDeleteConfirmId(null);
  };

  // Toggle module published
  const toggleModulePublished = (moduleId: string) => {
    setModules((prev) =>
      prev.map((mod) => (mod.id === moduleId ? { ...mod, isPublished: !mod.isPublished } : mod))
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

  const selectedModule = useMemo(
    () => modules.find((m) => m.id === selectedModuleId) || null,
    [modules, selectedModuleId]
  );

  const totalLessons = useMemo(() => modules.reduce((acc, m) => acc + m.lessons.length, 0), [modules]);
  const totalDurationSec = useMemo(
    () => modules.reduce((acc, m) => acc + m.lessons.reduce((a, l) => a + (l.videoDuration || 0), 0), 0),
    [modules]
  );

  return (
    <div className="space-y-4">
      {/* Course selector & header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Select value={selectedCourseId} onValueChange={handleCourseChange}>
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
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-md px-2.5 py-1.5">
            <Layers className="h-3 w-3" /> {modules.length} modules
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-md px-2.5 py-1.5">
            <BookOpen className="h-3 w-3" /> {totalLessons} lessons
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-md px-2.5 py-1.5">
            <Clock className="h-3 w-3" /> {formatDuration(totalDurationSec)}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setCourseSettingsOpen(true)}
          >
            <Settings className="h-3.5 w-3.5" /> Settings
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            onClick={() => setAddModuleOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" /> Add Module
          </Button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-4 min-h-[640px]">
        {/* Left panel: Sortable Module List */}
        <Card className="overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Modules</h3>
              <span className="text-[10px] text-muted-foreground">Drag to reorder</span>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3">
              {modules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Layers className="h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm font-medium">No modules yet</p>
                  <p className="text-xs mt-1">Click &quot;Add Module&quot; to start building</p>
                  <Button
                    size="sm"
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                    onClick={() => setAddModuleOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add First Module
                  </Button>
                </div>
              ) : (
                <DndContext
                  sensors={moduleSensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleModuleDragStart}
                  onDragEnd={handleModuleDragEnd}
                >
                  <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      <AnimatePresence>
                        {modules.map((mod, idx) => (
                          <SortableModuleCard
                            key={mod.id}
                            module={mod}
                            index={idx}
                            isExpanded={expandedModules.has(mod.id)}
                            isSelected={selectedModuleId === mod.id}
                            isEditingTitle={editingModuleTitle === mod.id}
                            onToggle={() => toggleModule(mod.id)}
                            onSelect={() => selectModule(mod.id)}
                            onEditTitle={() => setEditingModuleTitle(mod.id)}
                            onUpdateTitle={(t) => updateModuleTitle(mod.id, t)}
                            onCancelEditTitle={() => setEditingModuleTitle(null)}
                            onTogglePublished={() => toggleModulePublished(mod.id)}
                            onDelete={() => setDeleteConfirmId({ type: 'module', id: mod.id })}
                            onAddLesson={() => { setAddLessonModuleId(mod.id); setAddLessonOpen(true); }}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </SortableContext>
                  <DragOverlay>
                    {activeModuleId ? (
                      <ModuleDragOverlayItem
                        module={modules.find((m) => m.id === activeModuleId)!}
                        index={modules.findIndex((m) => m.id === activeModuleId)}
                      />
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Right panel: Lesson Editor for selected module */}
        <Card className="overflow-hidden flex flex-col">
          {selectedModule ? (
            <>
              <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-8 rounded-full bg-gradient-to-r ${builderModuleGradients[modules.findIndex((m) => m.id === selectedModule.id) % builderModuleGradients.length]}`} />
                    <h3 className="text-sm font-semibold text-foreground">{selectedModule.title}</h3>
                    <Badge variant="outline" className="text-[10px]">
                      {selectedModule.lessons.length} lessons
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 h-7 text-xs"
                    onClick={() => { setAddLessonModuleId(selectedModule.id); setAddLessonOpen(true); }}
                  >
                    <Plus className="h-3 w-3" /> Add Lesson
                  </Button>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4">
                  {selectedModule.lessons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <BookOpen className="h-10 w-10 mb-3 opacity-30" />
                      <p className="text-sm font-medium">No lessons yet</p>
                      <p className="text-xs mt-1">Add lessons to build this module&apos;s content</p>
                      <Button
                        size="sm"
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                        onClick={() => { setAddLessonModuleId(selectedModule.id); setAddLessonOpen(true); }}
                      >
                        <Plus className="h-3.5 w-3.5" /> Add First Lesson
                      </Button>
                    </div>
                  ) : (
                    <DndContext
                      sensors={lessonSensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleLessonDragStart}
                      onDragEnd={handleLessonDragEnd(selectedModule.id)}
                    >
                      <SortableContext items={selectedModule.lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-1.5">
                          <AnimatePresence>
                            {selectedModule.lessons
                              .sort((a, b) => a.orderIndex - b.orderIndex)
                              .map((lesson) => (
                                <SortableLessonRow
                                  key={lesson.id}
                                  lesson={lesson}
                                  moduleId={selectedModule.id}
                                  isEditingTitle={editingLessonTitle === lesson.id}
                                  onEditTitle={() => setEditingLessonTitle(lesson.id)}
                                  onUpdateTitle={(t) => updateLessonTitle(selectedModule.id, lesson.id, t)}
                                  onCancelEditTitle={() => setEditingLessonTitle(null)}
                                  onTogglePublished={() => toggleLessonPublished(selectedModule.id, lesson.id)}
                                  onDelete={() => setDeleteConfirmId({ type: 'lesson', id: lesson.id })}
                                  deleteConfirmId={deleteConfirmId}
                                />
                              ))}
                          </AnimatePresence>
                        </div>
                      </SortableContext>
                      <DragOverlay>
                        {activeLessonId ? (
                          <LessonDragOverlayItem
                            lesson={selectedModule.lessons.find((l) => l.id === activeLessonId)!}
                          />
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
              <Sparkles className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-lg font-medium">Select a module</p>
              <p className="text-sm">Choose a module from the left panel to manage its lessons</p>
            </div>
          )}
        </Card>
      </div>

      {/* Add Module Dialog */}
      <AddModuleDialog open={addModuleOpen} onOpenChange={setAddModuleOpen} onAdd={handleAddModule} />

      {/* Add Lesson Dialog */}
      <AddLessonDialog
        open={addLessonOpen}
        onOpenChange={(open) => { setAddLessonOpen(open); if (!open) setAddLessonModuleId(null); }}
        onAdd={(title, type, dur) => addLessonModuleId && handleAddLesson(addLessonModuleId, title, type, dur)}
      />

      {/* Course Settings Dialog */}
      <CourseSettingsDialog
        open={courseSettingsOpen}
        onOpenChange={setCourseSettingsOpen}
        course={selectedCourse}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
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

// ─── Sortable Module Card ──────────────────────────────────

function SortableModuleCard({
  module,
  index,
  isExpanded,
  isSelected,
  isEditingTitle,
  onToggle,
  onSelect,
  onEditTitle,
  onUpdateTitle,
  onCancelEditTitle,
  onTogglePublished,
  onDelete,
  onAddLesson,
}: {
  module: BuilderModule;
  index: number;
  isExpanded: boolean;
  isSelected: boolean;
  isEditingTitle: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onEditTitle: () => void;
  onUpdateTitle: (title: string) => void;
  onCancelEditTitle: () => void;
  onTogglePublished: () => void;
  onDelete: () => void;
  onAddLesson: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: module.id });
  const gradient = builderModuleGradients[index % builderModuleGradients.length];
  const lessonCount = module.lessons.length;
  const publishedLessons = module.lessons.filter((l) => l.isPublished).length;
  const modDurationSec = module.lessons.reduce((a, l) => a + (l.videoDuration || 0), 0);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`group rounded-xl border transition-all duration-200 overflow-hidden ${
          isSelected
            ? 'border-emerald-300 dark:border-emerald-700 shadow-md shadow-emerald-100/50 dark:shadow-emerald-900/20'
            : 'border-border hover:border-emerald-200 dark:hover:border-emerald-800'
        } ${isDragging ? 'shadow-xl' : ''}`}
        onClick={onSelect}
      >
        {/* Gradient left border */}
        <div className="flex">
          <div className={`w-1.5 bg-gradient-to-b ${gradient} shrink-0`} />

          <div className="flex-1 backdrop-blur-sm bg-card/80">
            {/* Module header */}
            <div className="p-3">
              <div className="flex items-center gap-2">
                {/* Drag handle */}
                <button
                  className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-muted/60 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  {...attributes}
                  {...listeners}
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="h-4 w-4" />
                </button>

                {/* Module number badge */}
                <div className={`h-6 w-6 rounded-md bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
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
                    <p className="text-sm font-medium text-foreground truncate">{module.title}</p>
                  )}
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

              {/* Module meta */}
              <div className="flex items-center gap-3 mt-1.5 ml-8 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" /> {lessonCount} lessons
                </span>
                {modDurationSec > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {formatDuration(modDurationSec)}
                  </span>
                )}
                <span>{publishedLessons}/{lessonCount} published</span>
              </div>
            </div>

            {/* Expanded: lessons preview & actions */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 space-y-1">
                    <div className="border-t border-border/50 pt-2" />
                    {module.lessons.length > 0 ? (
                      module.lessons
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .map((lesson) => {
                          const typeColor = lessonTypeColors[lesson.contentType] || lessonTypeColors.text;
                          return (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/40 transition-colors text-xs"
                            >
                              <div className={`h-5 w-5 rounded flex items-center justify-center shrink-0 ${typeColor.bg}`}>
                                <ContentTypeIcon type={lesson.contentType} className={`h-3 w-3 ${typeColor.text}`} />
                              </div>
                              <span className="flex-1 truncate text-foreground">{lesson.title}</span>
                              {lesson.videoDuration && (
                                <span className="text-muted-foreground shrink-0">{formatDuration(lesson.videoDuration)}</span>
                              )}
                              {lesson.isPublished ? (
                                <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                              ) : (
                                <Circle className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                              )}
                            </div>
                          );
                        })
                    ) : (
                      <p className="text-xs text-muted-foreground py-2 text-center">No lessons yet</p>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[11px] gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 w-full"
                        onClick={(e) => { e.stopPropagation(); onAddLesson(); }}
                      >
                        <Plus className="h-3 w-3" /> Add Lesson
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[11px] gap-1 text-destructive hover:text-destructive shrink-0"
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                      >
                        <Trash2 className="h-3 w-3" />
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

// ─── Module Drag Overlay ───────────────────────────────────

function ModuleDragOverlayItem({ module, index }: { module: BuilderModule; index: number }) {
  const gradient = builderModuleGradients[index % builderModuleGradients.length];
  return (
    <div className="rounded-xl border shadow-2xl bg-card/95 backdrop-blur-md scale-[1.02] overflow-hidden">
      <div className="flex">
        <div className={`w-1.5 bg-gradient-to-b ${gradient} shrink-0`} />
        <div className="p-3">
          <div className="flex items-center gap-2">
            <div className={`h-6 w-6 rounded-md bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-[10px] font-bold text-white">{index + 1}</span>
            </div>
            <p className="text-sm font-medium text-foreground">{module.title}</p>
            <Badge variant="outline" className="text-[10px]">
              {module.lessons.length} lessons
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Lesson type colors ────────────────────────────────────

const lessonTypeColors: Record<string, { bg: string; text: string }> = {
  video: { bg: 'bg-sky-100 dark:bg-sky-950', text: 'text-sky-600 dark:text-sky-400' },
  text: { bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-600 dark:text-emerald-400' },
  document: { bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-600 dark:text-emerald-400' },
  audio: { bg: 'bg-violet-100 dark:bg-violet-950', text: 'text-violet-600 dark:text-violet-400' },
  live_session: { bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-600 dark:text-amber-400' },
};

// ─── Sortable Lesson Row ───────────────────────────────────

function SortableLessonRow({
  lesson,
  moduleId,
  isEditingTitle,
  onEditTitle,
  onUpdateTitle,
  onCancelEditTitle,
  onTogglePublished,
  onDelete,
  deleteConfirmId,
}: {
  lesson: BuilderLesson;
  moduleId: string;
  isEditingTitle: boolean;
  onEditTitle: () => void;
  onUpdateTitle: (title: string) => void;
  onCancelEditTitle: () => void;
  onTogglePublished: () => void;
  onDelete: () => void;
  deleteConfirmId: { type: 'module' | 'lesson'; id: string } | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });
  const typeColor = lessonTypeColors[lesson.contentType] || lessonTypeColors.text;
  const isDeleteConfirming = deleteConfirmId?.type === 'lesson' && deleteConfirmId.id === lesson.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.15 }}
    >
      <div
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all duration-200 ${
          isDragging
            ? 'border-emerald-300 dark:border-emerald-700 shadow-lg bg-card/95 backdrop-blur-sm'
            : 'border-border/60 hover:border-border hover:bg-muted/20'
        } group`}
      >
        {/* Drag handle */}
        <button
          className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-muted/60 text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Lesson type icon */}
        <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${typeColor.bg}`}>
          <ContentTypeIcon type={lesson.contentType} className={`h-3.5 w-3.5 ${typeColor.text}`} />
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0" onDoubleClick={onEditTitle}>
          {isEditingTitle ? (
            <Input
              autoFocus
              defaultValue={lesson.title}
              onBlur={(e) => onUpdateTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onUpdateTitle((e.target as HTMLInputElement).value);
                if (e.key === 'Escape') onCancelEditTitle();
              }}
              className="h-6 text-sm px-1 py-0"
            />
          ) : (
            <p className="text-sm text-foreground truncate cursor-default">{lesson.title}</p>
          )}
        </div>

        {/* Duration badge */}
        {lesson.videoDuration && (
          <Badge variant="outline" className="text-[10px] shrink-0 gap-1">
            <Clock className="h-2.5 w-2.5" /> {formatDuration(lesson.videoDuration)}
          </Badge>
        )}

        {/* Preview badge */}
        {lesson.isPreview && (
          <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400 shrink-0">
            Preview
          </Badge>
        )}

        {/* Published toggle */}
        <button
          onClick={onTogglePublished}
          className="shrink-0 hover:scale-110 transition-transform"
          title={lesson.isPublished ? 'Unpublish' : 'Publish'}
        >
          {lesson.isPublished ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground" />
          )}
        </button>

        {/* Delete button - visible on hover */}
        {isDeleteConfirming ? (
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="destructive"
              size="sm"
              className="h-6 text-[10px] px-2"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              Confirm
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] px-2"
              onClick={(e) => { e.stopPropagation(); /* closes via parent */ }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Lesson Drag Overlay ───────────────────────────────────

function LessonDragOverlayItem({ lesson }: { lesson: BuilderLesson }) {
  const typeColor = lessonTypeColors[lesson.contentType] || lessonTypeColors.text;
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-emerald-300 dark:border-emerald-700 shadow-2xl bg-card/95 backdrop-blur-md scale-[1.02]">
      <GripVertical className="h-4 w-4 text-muted-foreground/50" />
      <div className={`h-7 w-7 rounded-md flex items-center justify-center ${typeColor.bg}`}>
        <ContentTypeIcon type={lesson.contentType} className={`h-3.5 w-3.5 ${typeColor.text}`} />
      </div>
      <p className="text-sm font-medium text-foreground">{lesson.title}</p>
      {lesson.videoDuration && (
        <Badge variant="outline" className="text-[10px] gap-1">
          <Clock className="h-2.5 w-2.5" /> {formatDuration(lesson.videoDuration)}
        </Badge>
      )}
    </div>
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
              {([
                { value: 'video' as const, icon: Video, label: 'Video', color: 'sky' },
                { value: 'text' as const, icon: FileText, label: 'Document', color: 'emerald' },
                { value: 'audio' as const, icon: Headphones, label: 'Audio', color: 'violet' },
                { value: 'live_session' as const, icon: Radio, label: 'Live Session', color: 'amber' },
              ]).map((type) => (
                <button
                  key={type.value}
                  onClick={() => setContentType(type.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all ${
                    contentType === type.value
                      ? `border-${type.color}-300 bg-${type.color}-50 dark:bg-${type.color}-950/50 text-${type.color}-700 dark:text-${type.color}-300`
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

// ─── Course Settings Dialog ────────────────────────────────

function CourseSettingsDialog({
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
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            Course Settings
          </DialogTitle>
          <DialogDescription>
            Configure the course details, visibility, and metadata.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
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

            {/* Course title */}
            <div className="grid gap-2">
              <Label htmlFor="settings-title">Course Title</Label>
              <Input id="settings-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="settings-desc">Description</Label>
              <Textarea id="settings-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="resize-none" />
            </div>

            <Separator />

            {/* Category & Level */}
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* Language */}
            <div className="grid gap-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
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
                <Save className="h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
