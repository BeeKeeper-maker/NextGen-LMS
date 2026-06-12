'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Map,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Copy,
  Trash2,
  Eye,
  GripVertical,
  X,
  Check,
  Lock,
  Unlock,
  Flag,
  ArrowRight,
  Users,
  BookOpen,
  Clock,
  TrendingUp,
  BarChart3,
  Save,
  Globe,
  Target,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { validateFields, required, minLength } from '@/lib/validations';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  useLearningPaths,
  useCourses,
  useCreateLearningPath,
  useUpdateLearningPath,
  useDeleteLearningPath,
} from '@/hooks/use-data';
import { useAppStore } from '@/store/app-store';

// ---- Types ----
interface PathCourse {
  id: string;
  title: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  isRequired: boolean;
  prerequisiteIds: string[];
  milestone?: string;
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'published' | 'draft' | 'archived';
  thumbnailUrl?: string;
  courseCount: number;
  enrolledCount: number;
  completionRate: number;
  estimatedDuration: number;
  courses: PathCourse[];
  createdAt: string;
}

// ---- Chart Data (static analytics mock) ----
const enrollmentTrendData = [
  { month: 'Jul', enrollments: 45 },
  { month: 'Aug', enrollments: 62 },
  { month: 'Sep', enrollments: 78 },
  { month: 'Oct', enrollments: 95 },
  { month: 'Nov', enrollments: 120 },
  { month: 'Dec', enrollments: 156 },
  { month: 'Jan', enrollments: 189 },
  { month: 'Feb', enrollments: 234 },
];

const dropoffData = [
  { course: 'HTML & CSS', dropoff: 12 },
  { course: 'JavaScript', dropoff: 28 },
  { course: 'React', dropoff: 35 },
  { course: 'TypeScript', dropoff: 22 },
  { course: 'Node.js', dropoff: 18 },
  { course: 'Next.js', dropoff: 42 },
];

const completionPieData = [
  { name: 'Completed', value: 68, color: '#10b981' },
  { name: 'In Progress', value: 22, color: '#f59e0b' },
  { name: 'Not Started', value: 10, color: '#94a3b8' },
];

// ---- API Data Mappers ----
function mapApiPathToLearningPath(apiPath: any): LearningPath {
  return {
    id: apiPath.id,
    name: apiPath.title,
    description: apiPath.description || '',
    category: apiPath.category || '',
    difficulty: (apiPath.level as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
    status: apiPath.isPublished ? 'published' : 'draft',
    thumbnailUrl: apiPath.thumbnailUrl || undefined,
    courseCount: apiPath.courseCount ?? apiPath.courses?.length ?? 0,
    enrolledCount: apiPath.enrolledCount ?? apiPath.enrollments?.length ?? 0,
    completionRate: apiPath.completionRate ?? 0,
    estimatedDuration: apiPath.estimatedDuration ?? 0,
    courses: (apiPath.courses || []).map((pc: any) => ({
      id: pc.courseId || pc.course?.id,
      title: pc.course?.title || '',
      duration: pc.course?.durationHours || 0,
      level: (pc.course?.level as 'beginner' | 'intermediate' | 'advanced' | 'expert') || 'beginner',
      isRequired: pc.isRequired ?? true,
      prerequisiteIds: pc.prerequisiteIds ? pc.prerequisiteIds.split(',').filter(Boolean) : [],
      milestone: pc.milestone || undefined,
    })),
    createdAt: apiPath.createdAt,
  };
}

function mapApiCourseToPathCourseSource(apiCourse: any) {
  return {
    id: apiCourse.id,
    title: apiCourse.title,
    duration: apiCourse.durationHours || 0,
    level: (apiCourse.level as 'beginner' | 'intermediate' | 'advanced' | 'expert') || 'beginner',
  };
}

// ---- Sub-Components ----

function PathCard({ path, onEdit, onDuplicate, onDelete, onView }: {
  path: LearningPath;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onView: () => void;
}) {
  const statusColor = {
    published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    archived: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };

  const difficultyColor = {
    beginner: 'text-emerald-600',
    intermediate: 'text-amber-600',
    advanced: 'text-rose-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        {/* Gradient accent bar */}
        <div className={cn(
          'h-1.5 w-full',
          path.status === 'published' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
          path.status === 'draft' ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
          'bg-gradient-to-r from-slate-400 to-slate-500'
        )} />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold truncate">{path.name}</CardTitle>
              <CardDescription className="text-xs mt-1 line-clamp-2">{path.description}</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={onView}><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}><Edit3 className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={onDelete}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className={cn('text-[10px] px-2 py-0.5', statusColor[path.status])}>
              {path.status.charAt(0).toUpperCase() + path.status.slice(1)}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
              {path.category}
            </Badge>
            <span className={cn('text-[10px] font-medium', difficultyColor[path.difficulty])}>
              {path.difficulty.charAt(0).toUpperCase() + path.difficulty.slice(1)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400">
                <BookOpen className="h-3.5 w-3.5" />
                <span className="text-sm font-bold">{path.courseCount}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Courses</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400">
                <Users className="h-3.5 w-3.5" />
                <span className="text-sm font-bold">{path.enrolledCount}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Enrolled</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-sm font-bold">{path.completionRate}%</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Complete</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{path.estimatedDuration}h estimated</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PathVisualPreview({ courses }: { courses: PathCourse[] }) {
  return (
    <div className="relative p-4 overflow-x-auto">
      <div className="flex items-center gap-0 min-w-max">
        {courses.map((course, idx) => {
          const hasPrereq = course.prerequisiteIds.length > 0;
          return (
            <div key={course.id} className="flex items-center">
              {idx > 0 && (
                <div className="flex items-center mx-1">
                  <div className="w-6 h-0.5 bg-border" />
                  {hasPrereq && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground mx-0.5" />
                  )}
                  <div className="w-6 h-0.5 bg-border" />
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-xl border min-w-[100px] max-w-[120px]',
                  'bg-card/80 backdrop-blur-sm border-border/50',
                  course.isRequired ? 'border-emerald-300 dark:border-emerald-700' : 'border-amber-300 dark:border-amber-700 border-dashed'
                )}
              >
                <div className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold',
                  course.isRequired
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                )}>
                  {idx + 1}
                </div>
                <span className="text-[10px] font-medium text-center leading-tight line-clamp-2">{course.title}</span>
                <span className="text-[9px] text-muted-foreground">{course.duration}h</span>
                {course.milestone && (
                  <Badge className="text-[8px] px-1.5 py-0 h-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                    <Flag className="h-2.5 w-2.5 mr-0.5" />
                    {course.milestone}
                  </Badge>
                )}
                {!course.isRequired && (
                  <Badge variant="outline" className="text-[8px] px-1 py-0 h-4">
                    Optional
                  </Badge>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PathBuilderPanel({
  editingPath,
  onSave,
  onCancel,
  availableCourses,
}: {
  editingPath: LearningPath | null;
  onSave: (path: LearningPath) => void;
  onCancel: () => void;
  availableCourses: { id: string; title: string; duration: number; level: 'beginner' | 'intermediate' | 'advanced' | 'expert' }[];
}) {
  const [name, setName] = useState(editingPath?.name || '');
  const [description, setDescription] = useState(editingPath?.description || '');
  const [category, setCategory] = useState(editingPath?.category || '');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>(editingPath?.difficulty || 'beginner');
  const [status, setStatus] = useState<'published' | 'draft'>(editingPath?.status === 'archived' ? 'draft' : (editingPath?.status as 'published' | 'draft') || 'draft');
  const [courses, setCourses] = useState<PathCourse[]>(editingPath?.courses || []);
  const [courseSearch, setCourseSearch] = useState('');
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [selectedCourseForPrereq, setSelectedCourseForPrereq] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = (isPublish: boolean = false): boolean => {
    const errs = validateFields({
      name: [required(name, 'Path name'), minLength(name, 3, 'Path name')],
    });
    if (isPublish && courses.length === 0) {
      errs.courses = 'At least 1 course is required to publish';
    }
    setFormErrors(errs);
    setTouched({ name: true });
    return Object.keys(errs).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errs = validateFields({
      name: [required(name, 'Path name'), minLength(name, 3, 'Path name')],
    });
    setFormErrors(prev => {
      const next = { ...prev };
      if (touched[field] || errs[field]) {
        next[field] = errs[field] || '';
        if (!next[field]) delete next[field];
      }
      return next;
    });
  };

  const filteredAvailableCourses = availableCourses.filter(
    (c) => !courses.find((pc) => pc.id === c.id) &&
      c.title.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const addCourse = (courseId: string) => {
    const course = availableCourses.find((c) => c.id === courseId);
    if (!course) return;
    const newCourse: PathCourse = {
      id: course.id,
      title: course.title,
      duration: course.duration,
      level: course.level,
      isRequired: true,
      prerequisiteIds: courses.length > 0 ? [courses[courses.length - 1].id] : [],
    };
    setCourses([...courses, newCourse]);
    setCourseSearch('');
    setShowCourseDropdown(false);
  };

  const removeCourse = (courseId: string) => {
    setCourses(courses.filter((c) => c.id !== courseId).map((c) => ({
      ...c,
      prerequisiteIds: c.prerequisiteIds.filter((pid) => pid !== courseId),
    })));
  };

  const toggleRequired = (courseId: string) => {
    setCourses(courses.map((c) => c.id === courseId ? { ...c, isRequired: !c.isRequired } : c));
  };

  const setMilestone = (courseId: string, milestone: string) => {
    setCourses(courses.map((c) => c.id === courseId ? { ...c, milestone: milestone || undefined } : c));
  };

  const togglePrerequisite = (courseId: string, prereqId: string) => {
    setCourses(courses.map((c) => {
      if (c.id !== courseId) return c;
      const hasPrereq = c.prerequisiteIds.includes(prereqId);
      return {
        ...c,
        prerequisiteIds: hasPrereq
          ? c.prerequisiteIds.filter((p) => p !== prereqId)
          : [...c.prerequisiteIds, prereqId],
      };
    }));
  };

  const totalDuration = courses.reduce((sum, c) => sum + c.duration, 0);

  const handleSave = (publishStatus: 'published' | 'draft') => {
    if (!validate(publishStatus === 'published')) return;
    const path: LearningPath = {
      id: editingPath?.id || `lp-${Date.now()}`,
      name,
      description,
      category,
      difficulty,
      status: publishStatus,
      courseCount: courses.length,
      enrolledCount: editingPath?.enrolledCount || 0,
      completionRate: editingPath?.completionRate || 0,
      estimatedDuration: totalDuration,
      courses,
      createdAt: editingPath?.createdAt || new Date().toISOString(),
    };
    onSave(path);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{editingPath ? 'Edit Learning Path' : 'Create Learning Path'}</h2>
          <p className="text-sm text-muted-foreground">Design a guided course sequence for your learners</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleSave('draft')} className={cn(status === 'draft' && 'border-amber-500')}>
            <Save className="h-4 w-4 mr-1" /> Save Draft
          </Button>
          <Button size="sm" onClick={() => handleSave('published')} className="bg-emerald-600 hover:bg-emerald-700">
            <Globe className="h-4 w-4 mr-1" /> Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Path Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Path Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="e.g., Full-Stack Developer"
                  className={`h-9 ${formErrors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {formErrors.name && <p className="text-sm text-destructive mt-1">{formErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this learning path..."
                  rows={3}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Backend">Backend</SelectItem>
                    <SelectItem value="DevOps">DevOps</SelectItem>
                    <SelectItem value="Mobile">Mobile</SelectItem>
                    <SelectItem value="AI/ML">AI/ML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as 'beginner' | 'intermediate' | 'advanced')}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Label className="text-xs">Status</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={status === 'published'}
                    onCheckedChange={(checked) => setStatus(checked ? 'published' : 'draft')}
                  />
                  <span className="text-xs text-muted-foreground">
                    {status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Courses</span>
                <span className="font-semibold">{courses.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Required</span>
                <span className="font-semibold">{courses.filter((c) => c.isRequired).length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Optional</span>
                <span className="font-semibold">{courses.filter((c) => !c.isRequired).length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Est. Duration</span>
                <span className="font-semibold">{totalDuration}h</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1"><Flag className="h-3 w-3" /> Milestones</span>
                <span className="font-semibold">{courses.filter((c) => c.milestone).length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Course Builder */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Course Sequence</CardTitle>
                {formErrors.courses && (
                  <span className="text-xs text-destructive">{formErrors.courses}</span>
                )}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCourseDropdown(!showCourseDropdown)}
                    className="gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Course
                  </Button>
                  {showCourseDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-64 bg-card border border-border rounded-lg shadow-lg z-20 p-2">
                      <Input
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                        placeholder="Search courses..."
                        className="h-8 text-sm mb-2"
                        autoFocus
                      />
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {filteredAvailableCourses.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-2">No courses found</p>
                        ) : (
                          filteredAvailableCourses.map((course) => (
                            <button
                              key={course.id}
                              onClick={() => addCourse(course.id)}
                              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-muted text-xs flex items-center justify-between"
                            >
                              <span>{course.title}</span>
                              <span className="text-muted-foreground">{course.duration}h</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Map className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No courses added yet</p>
                  <p className="text-xs mt-1">Click &quot;Add Course&quot; to start building your path</p>
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={courses}
                  onReorder={setCourses}
                  className="space-y-2"
                >
                  {courses.map((course, idx) => (
                    <Reorder.Item
                      key={course.id}
                      value={course}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 cursor-grab active:cursor-grabbing group"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-xs font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{course.title}</span>
                          {course.milestone && (
                            <Badge className="text-[8px] px-1.5 py-0 h-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shrink-0">
                              <Flag className="h-2.5 w-2.5 mr-0.5" />
                              {course.milestone}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-muted-foreground">{course.duration}h</span>
                          <span className="text-[10px] text-muted-foreground capitalize">{course.level}</span>
                          {course.prerequisiteIds.length > 0 && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Lock className="h-2.5 w-2.5" />
                              Requires: {course.prerequisiteIds.map((pid) => courses.find((c) => c.id === pid)?.title).filter(Boolean).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => toggleRequired(course.id)}
                          title={course.isRequired ? 'Mark optional' : 'Mark required'}
                        >
                          {course.isRequired ? (
                            <Lock className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Unlock className="h-3.5 w-3.5 text-amber-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            const milestone = course.milestone || '';
                            const newMilestone = prompt('Enter milestone label (leave empty to remove):', milestone);
                            if (newMilestone !== null) setMilestone(course.id, newMilestone);
                          }}
                          title="Set milestone"
                        >
                          <Flag className={cn('h-3.5 w-3.5', course.milestone ? 'text-purple-500' : 'text-muted-foreground')} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setSelectedCourseForPrereq(selectedCourseForPrereq === course.id ? null : course.id)}
                          title="Edit prerequisites"
                        >
                          <Target className={cn('h-3.5 w-3.5', selectedCourseForPrereq === course.id ? 'text-blue-500' : 'text-muted-foreground')} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600"
                          onClick={() => removeCourse(course.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}

              {/* Prerequisites Editor */}
              <AnimatePresence>
                {selectedCourseForPrereq && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 border border-border/50 rounded-xl p-4 bg-muted/20"
                  >
                    <h4 className="text-sm font-medium mb-3">
                      Prerequisites for: {courses.find((c) => c.id === selectedCourseForPrereq)?.title}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {courses
                        .filter((c) => c.id !== selectedCourseForPrereq)
                        .map((c) => {
                          const isSelected = courses.find((cc) => cc.id === selectedCourseForPrereq)?.prerequisiteIds.includes(c.id);
                          return (
                            <button
                              key={c.id}
                              onClick={() => togglePrerequisite(selectedCourseForPrereq, c.id)}
                              className={cn(
                                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                                isSelected
                                  ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700'
                                  : 'bg-background text-muted-foreground border-border hover:border-blue-300'
                              )}
                            >
                              {isSelected && <Check className="h-3 w-3 inline mr-1" />}
                              {c.title}
                            </button>
                          );
                        })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Visual Preview */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" /> Visual Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Add courses to see the visual roadmap</p>
              ) : (
                <PathVisualPreview courses={courses} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PathAnalyticsPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Path Analytics</h2>
        <p className="text-sm text-muted-foreground">Track enrollment, completion, and dropoff metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Enrollments', value: '479', change: '+18%', icon: Users, color: 'text-emerald-600' },
          { label: 'Avg Completion', value: '58%', change: '+5%', icon: Target, color: 'text-amber-600' },
          { label: 'Avg Time to Complete', value: '42 days', change: '-3 days', icon: Clock, color: 'text-blue-600' },
          { label: 'Active Paths', value: '3', change: '+1', icon: Map, color: 'text-purple-600' },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className={cn('h-4 w-4', kpi.color)} />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-xl font-bold">{kpi.value}</span>
                <span className="text-[10px] text-emerald-600 font-medium mb-0.5">{kpi.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" /> Enrollment Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                  />
                  <Line type="monotone" dataKey="enrollments" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-600" /> Completion Rate (Full-Stack Path)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {completionPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2">
              {completionPieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-[10px] text-muted-foreground">{entry.name} ({entry.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dropoff Points */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-rose-600" /> Dropoff Points (Full-Stack Path)
            </CardTitle>
            <CardDescription className="text-xs">Courses where most learners stop progressing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dropoffData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="course" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="dropoff" fill="#ef4444" radius={[4, 4, 0, 0]} name="Dropoff %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---- Loading Skeletons ----

function PathCardSkeleton() {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <div className="h-1.5 w-full bg-gradient-to-r from-muted to-muted/50" />
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-3 w-full" />
        <div className="flex items-center gap-2 mt-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-4 w-8 mx-auto mb-1" />
              <Skeleton className="h-2.5 w-12 mx-auto" />
            </div>
          ))}
        </div>
        <Skeleton className="h-3 w-24 mt-3" />
      </CardContent>
    </Card>
  );
}

function PathListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <PathCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ---- Main Component ----
export function AdminLearningPaths() {
  const tenant = useAppStore((s) => s.currentTenant);
  const tenantId = tenant?.id || '';

  // API data hooks
  const { data: apiPaths, isLoading: pathsLoading, error: pathsError } = useLearningPaths(tenantId);
  const { data: apiCourses } = useCourses(tenantId);
  const createPathMutation = useCreateLearningPath();
  const updatePathMutation = useUpdateLearningPath();
  const deletePathMutation = useDeleteLearningPath();

  // Map API data to component interfaces
  const paths: LearningPath[] = useMemo(
    () => (apiPaths || []).map(mapApiPathToLearningPath),
    [apiPaths]
  );

  const availableCourses = useMemo(
    () => (apiCourses || []).map(mapApiCourseToPathCourseSource),
    [apiCourses]
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('paths');
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredPaths = paths.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(paths.map((p) => p.category).filter(Boolean))];

  const handleSave = useCallback(async (path: LearningPath) => {
    const isEdit = paths.some((p) => p.id === path.id);
    const payload = {
      tenantId,
      title: path.name,
      description: path.description || null,
      category: path.category || null,
      level: path.difficulty,
      isPublished: path.status === 'published',
      courses: path.courses.map((c, i) => ({
        courseId: c.id,
        orderIndex: i,
        isRequired: c.isRequired,
        milestone: c.milestone || null,
        prerequisiteIds: c.prerequisiteIds.length > 0 ? c.prerequisiteIds.join(',') : null,
      })),
    };

    try {
      if (isEdit) {
        await updatePathMutation.mutateAsync({ id: path.id, ...payload });
      } else {
        await createPathMutation.mutateAsync(payload);
      }
      setEditingPath(null);
      setIsCreating(false);
    } catch {
      // Error is handled by mutation hooks with toast
    }
  }, [paths, tenantId, createPathMutation, updatePathMutation]);

  const handleDuplicate = useCallback(async (path: LearningPath) => {
    const payload = {
      tenantId,
      title: `${path.name} (Copy)`,
      description: path.description || null,
      category: path.category || null,
      level: path.difficulty,
      isPublished: false, // Duplicates are always drafts
      courses: path.courses.map((c, i) => ({
        courseId: c.id,
        orderIndex: i,
        isRequired: c.isRequired,
        milestone: c.milestone || null,
        prerequisiteIds: c.prerequisiteIds.length > 0 ? c.prerequisiteIds.join(',') : null,
      })),
    };

    try {
      await createPathMutation.mutateAsync(payload);
    } catch {
      // Error is handled by mutation hooks
    }
  }, [tenantId, createPathMutation]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deletePathMutation.mutateAsync(id);
      setDeleteConfirmId(null);
    } catch {
      // Error is handled by mutation hooks
    }
  }, [deletePathMutation]);

  if (isCreating || editingPath) {
    return (
      <div className="p-4 sm:p-6">
        <PathBuilderPanel
          editingPath={editingPath}
          onSave={handleSave}
          onCancel={() => { setEditingPath(null); setIsCreating(false); }}
          availableCourses={availableCourses}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Map className="h-6 w-6 text-emerald-600" /> Learning Paths
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage guided course sequences</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
          <Plus className="h-4 w-4" /> Create Path
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="paths" className="gap-1.5">
            <Map className="h-3.5 w-3.5" /> All Paths
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paths" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search learning paths..."
                className="h-9 pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-36">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {pathsLoading && <PathListSkeleton />}

          {/* Error State */}
          {pathsError && (
            <div className="text-center py-12">
              <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-sm text-muted-foreground">Failed to load learning paths</p>
              <p className="text-xs text-muted-foreground mt-1">Please try again later</p>
            </div>
          )}

          {/* Path Grid */}
          {!pathsLoading && !pathsError && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredPaths.map((path) => (
                  <PathCard
                    key={path.id}
                    path={path}
                    onEdit={() => setEditingPath(path)}
                    onDuplicate={() => handleDuplicate(path)}
                    onDelete={() => setDeleteConfirmId(path.id)}
                    onView={() => setEditingPath(path)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Empty State */}
          {!pathsLoading && !pathsError && filteredPaths.length === 0 && (
            <div className="text-center py-12">
              <Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              {paths.length === 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">No learning paths yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Create your first learning path to guide your learners</p>
                  <Button
                    onClick={() => setIsCreating(true)}
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700 gap-1.5"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" /> Create Path
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">No learning paths found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or create a new path</p>
                </>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <PathAnalyticsPanel />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Learning Path</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this learning path? This action cannot be undone. All enrolled learners will lose access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={deletePathMutation.isPending}
            >
              {deletePathMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
