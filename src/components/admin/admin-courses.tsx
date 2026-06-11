'use client';

import { useState, useMemo } from 'react';
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
  Business: 'bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-300',
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
  const catBadge = categoryBadgeColors[course.category || ''] || 'bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-300';
  const lvlBadge = levelBadgeColors[course.level] || 'bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-300';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
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

        <CardContent className="p-6 space-y-4">
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
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Add a new course to your learning platform. You can configure details and curriculum after creation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="course-title">Course Title</Label>
            <Input id="course-title" placeholder="e.g. Advanced TypeScript Patterns" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="course-desc">Description</Label>
            <Textarea id="course-desc" placeholder="Brief description of the course..." rows={3} />
          </div>
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
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setOpen(false)}>
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
              <CheckCircle2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
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
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
