'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Plus, Edit3, Trash2, Eye, GripVertical,
  ChevronRight, ChevronLeft, Clock, Target, Shuffle,
  CheckCircle2, XCircle, HelpCircle, Code, FileText,
  ArrowUpDown, Play, Save, Send, RotateCcw, X,
  AlertCircle, MoreHorizontal, Copy, Settings2,
  ListChecks, Timer, Award, BookOpen, Type, Hash,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { demoAssessments, demoCourses } from '@/lib/mock-data';
import type { Assessment, Question } from '@/types';

// ---- Helper types ----
type ViewMode = 'list' | 'builder' | 'preview';

interface QuestionFormData {
  type: Question['type'];
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
  difficulty: Question['difficulty'];
  poolGroup: string;
}

const emptyQuestionForm: QuestionFormData = {
  type: 'multiple_choice',
  question: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  explanation: '',
  points: 1,
  difficulty: 'medium',
  poolGroup: '',
};

// ---- Icon helpers ----
function TypeIcon({ type, className = 'h-4 w-4' }: { type: string; className?: string }) {
  switch (type) {
    case 'quiz': return <ListChecks className={className} />;
    case 'assignment': return <FileText className={className} />;
    case 'peer_review': return <HelpCircle className={className} />;
    case 'coding': return <Code className={className} />;
    case 'file_upload': return <BookOpen className={className} />;
    case 'multiple_choice': return <ListChecks className={className} />;
    case 'true_false': return <CheckCircle2 className={className} />;
    case 'short_answer': return <Type className={className} />;
    case 'long_answer': return <FileText className={className} />;
    case 'coding': return <Code className={className} />;
    default: return <HelpCircle className={className} />;
  }
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles: Record<string, string> = {
    easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return <Badge variant="outline" className={`${styles[difficulty] ?? ''} text-xs font-medium`}>{difficulty}</Badge>;
}

function AssessmentTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    quiz: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    assignment: 'bg-slate-100 text-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:text-slate-300',
    peer_review: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    coding: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    file_upload: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };
  return (
    <Badge variant="outline" className={`${styles[type] ?? ''} text-xs gap-1`}>
      <TypeIcon type={type} className="h-3 w-3" />
      {type.replace('_', ' ')}
    </Badge>
  );
}

function StatusBadge({ isPublished }: { isPublished: boolean }) {
  return isPublished
    ? <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs">Published</Badge>
    : <Badge variant="outline" className="text-xs text-muted-foreground">Draft</Badge>;
}

function getCourseTitle(courseId: string) {
  return demoCourses.find(c => c.id === courseId)?.title ?? 'Unknown Course';
}

// ==========================
// ASSESSMENT LIST VIEW
// ==========================
function AssessmentList({
  assessments,
  onEdit,
  onPreview,
  onCreateNew,
}: {
  assessments: Assessment[];
  onEdit: (a: Assessment) => void;
  onPreview: (a: Assessment) => void;
  onCreateNew: () => void;
}) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = assessments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || a.type === typeFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'published' && a.isPublished) ||
      (statusFilter === 'draft' && !a.isPublished);
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Assessments</h2>
          <p className="text-muted-foreground text-sm mt-1">Create and manage quizzes, assignments, and coding challenges</p>
        </div>
        <Button onClick={onCreateNew} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
          <Plus className="h-4 w-4" /> Create Assessment
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assessments..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="peer_review">Peer Review</SelectItem>
                <SelectItem value="coding">Coding</SelectItem>
                <SelectItem value="file_upload">File Upload</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px]">Title</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Passing</TableHead>
                  <TableHead className="text-center">Attempts</TableHead>
                  <TableHead className="text-center">Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-muted-foreground/50" />
                        <span>No assessments found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((assessment, idx) => (
                    <motion.tr
                      key={assessment.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold text-foreground">{assessment.title}</div>
                          {assessment.description && (
                            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{assessment.description}</div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {assessment.questions?.length ?? 0} question{(assessment.questions?.length ?? 0) !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {getCourseTitle(assessment.courseId)}
                      </TableCell>
                      <TableCell><AssessmentTypeBadge type={assessment.type} /></TableCell>
                      <TableCell className="text-center text-sm">{assessment.passingScore}%</TableCell>
                      <TableCell className="text-center text-sm">{assessment.maxAttempts}</TableCell>
                      <TableCell className="text-center text-sm">
                        {assessment.timeLimit ? `${assessment.timeLimit}m` : '—'}
                      </TableCell>
                      <TableCell><StatusBadge isPublished={assessment.isPublished} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPreview(assessment)}>
                                  <Play className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Preview Quiz</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(assessment)}>
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Assessments', value: assessments.length, icon: ListChecks, color: 'text-violet-600' },
          { label: 'Published', value: assessments.filter(a => a.isPublished).length, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Total Questions', value: assessments.reduce((sum, a) => sum + (a.questions?.length ?? 0), 0), icon: HelpCircle, color: 'text-amber-600' },
          { label: 'Avg. Passing Score', value: `${Math.round(assessments.reduce((sum, a) => sum + a.passingScore, 0) / assessments.length)}%`, icon: Target, color: 'text-rose-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ==========================
// ASSESSMENT BUILDER VIEW
// ==========================
function AssessmentBuilder({
  assessment,
  onBack,
  onSave,
}: {
  assessment: Assessment;
  onBack: () => void;
  onSave: (a: Assessment) => void;
}) {
  const [form, setForm] = useState<Assessment>({ ...assessment });
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionIdx, setEditingQuestionIdx] = useState<number | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionFormData>(emptyQuestionForm);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const updateField = useCallback(<K extends keyof Assessment>(key: K, value: Assessment[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const openAddQuestion = () => {
    setEditingQuestionIdx(null);
    setQuestionForm(emptyQuestionForm);
    setShowQuestionForm(true);
  };

  const openEditQuestion = (idx: number) => {
    const q = form.questions?.[idx];
    if (!q) return;
    setEditingQuestionIdx(idx);
    setQuestionForm({
      type: q.type,
      question: q.question,
      options: q.options ?? (q.type === 'multiple_choice' ? ['', '', '', ''] : []),
      correctAnswer: q.correctAnswer ?? '',
      explanation: q.explanation ?? '',
      points: q.points,
      difficulty: q.difficulty,
      poolGroup: q.poolGroup ?? '',
    });
    setShowQuestionForm(true);
  };

  const saveQuestion = () => {
    if (!questionForm.question.trim()) return;
    const newQ: Question = {
      id: editingQuestionIdx !== null ? (form.questions?.[editingQuestionIdx]?.id ?? `q-${Date.now()}`) : `q-${Date.now()}`,
      assessmentId: form.id,
      type: questionForm.type,
      question: questionForm.question,
      options: ['multiple_choice', 'true_false'].includes(questionForm.type) ? questionForm.options.filter(o => o.trim()) : undefined,
      correctAnswer: questionForm.correctAnswer,
      explanation: questionForm.explanation || undefined,
      points: questionForm.points,
      orderIndex: editingQuestionIdx !== null ? (form.questions?.[editingQuestionIdx]?.orderIndex ?? 0) : (form.questions?.length ?? 0),
      difficulty: questionForm.difficulty,
      poolGroup: questionForm.poolGroup || undefined,
    };

    const updatedQuestions = [...(form.questions ?? [])];
    if (editingQuestionIdx !== null) {
      updatedQuestions[editingQuestionIdx] = newQ;
    } else {
      updatedQuestions.push(newQ);
    }
    updateField('questions', updatedQuestions);
    setShowQuestionForm(false);
  };

  const deleteQuestion = (idx: number) => {
    const updated = [...(form.questions ?? [])];
    updated.splice(idx, 1);
    updated.forEach((q, i) => { q.orderIndex = i; });
    updateField('questions', updated);
  };

  const moveQuestion = (from: number, to: number) => {
    if (to < 0 || to >= (form.questions?.length ?? 0)) return;
    const updated = [...(form.questions ?? [])];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    updated.forEach((q, i) => { q.orderIndex = i; });
    updateField('questions', updated);
  };

  const totalPoints = (form.questions ?? []).reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Assessment Builder</h2>
            <p className="text-sm text-muted-foreground">{form.title || 'New Assessment'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Cancel
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => onSave({ ...form, isPublished: false })}>
            <Save className="h-4 w-4" /> Save Draft
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={() => onSave({ ...form, isPublished: true })}>
            <Send className="h-4 w-4" /> Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Settings */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-violet-600" /> Assessment Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="Assessment title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={form.description ?? ''} onChange={e => updateField('description', e.target.value)} placeholder="Describe this assessment" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Course</Label>
                <Select value={form.courseId} onValueChange={v => updateField('courseId', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {demoCourses.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => updateField('type', v as Assessment['type'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="peer_review">Peer Review</SelectItem>
                    <SelectItem value="coding">Coding</SelectItem>
                    <SelectItem value="file_upload">File Upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="passingScore" className="flex items-center gap-1">
                    <Target className="h-3 w-3" /> Passing Score
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input id="passingScore" type="number" min={0} max={100} value={form.passingScore} onChange={e => updateField('passingScore', Number(e.target.value))} />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAttempts" className="flex items-center gap-1">
                    <RotateCcw className="h-3 w-3" /> Max Attempts
                  </Label>
                  <Input id="maxAttempts" type="number" min={1} max={10} value={form.maxAttempts} onChange={e => updateField('maxAttempts', Number(e.target.value))} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeLimit" className="flex items-center gap-1">
                  <Timer className="h-3 w-3" /> Time Limit (minutes)
                </Label>
                <Input id="timeLimit" type="number" min={0} placeholder="0 = no limit" value={form.timeLimit ?? ''} onChange={e => updateField('timeLimit', e.target.value ? Number(e.target.value) : undefined)} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="shuffle" className="flex items-center gap-1">
                  <Shuffle className="h-3 w-3" /> Shuffle Questions
                </Label>
                <Switch id="shuffle" checked={form.shuffleQuestions} onCheckedChange={v => updateField('shuffleQuestions', v)} />
              </div>
            </CardContent>
          </Card>

          {/* Summary card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Questions</span>
                <span className="font-medium">{form.questions?.length ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Points</span>
                <span className="font-medium">{totalPoints}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Passing Score</span>
                <span className="font-medium">{form.passingScore}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge isPublished={form.isPublished} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Questions */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-violet-600" /> Questions ({form.questions?.length ?? 0})
                </CardTitle>
                <Button size="sm" onClick={openAddQuestion} className="bg-violet-600 hover:bg-violet-700 text-white gap-1">
                  <Plus className="h-4 w-4" /> Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(form.questions ?? []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <HelpCircle className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">No questions yet</p>
                  <p className="text-xs mt-1">Click &quot;Add Question&quot; to start building your assessment</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(form.questions ?? []).map((q, idx) => (
                    <motion.div
                      key={q.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`flex items-start gap-2 p-3 rounded-lg border transition-colors hover:bg-muted/50 ${dragIdx === idx ? 'border-violet-400 bg-violet-50 dark:bg-violet-950/20' : 'border-border'}`}
                      draggable
                      onDragStart={() => setDragIdx(idx)}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => {
                        if (dragIdx !== null && dragIdx !== idx) moveQuestion(dragIdx, idx);
                        setDragIdx(null);
                      }}
                      onDragEnd={() => setDragIdx(null)}
                    >
                      <div className="flex items-center gap-2 pt-0.5">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <span className="text-xs font-mono text-muted-foreground w-5">{idx + 1}.</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <TypeIcon type={q.type} className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium truncate">{q.question}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <DifficultyBadge difficulty={q.difficulty} />
                          <Badge variant="outline" className="text-xs">{q.points} pt{q.points !== 1 ? 's' : ''}</Badge>
                          {q.poolGroup && <Badge variant="outline" className="text-xs text-violet-600">Pool: {q.poolGroup}</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditQuestion(idx)}>
                                <Edit3 className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => deleteQuestion(idx)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Question Form Dialog */}
      <Dialog open={showQuestionForm} onOpenChange={setShowQuestionForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestionIdx !== null ? 'Edit Question' : 'Add Question'}</DialogTitle>
            <DialogDescription>
              {editingQuestionIdx !== null ? 'Modify the question details below.' : 'Fill in the question details below.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select value={questionForm.type} onValueChange={v => {
                  const t = v as Question['type'];
                  setQuestionForm(prev => ({
                    ...prev,
                    type: t,
                    options: t === 'multiple_choice' ? (prev.options.length > 0 ? prev.options : ['', '', '', '']) :
                             t === 'true_false' ? ['True', 'False'] : [],
                    correctAnswer: t === 'true_false' ? '' : prev.correctAnswer,
                  }));
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True / False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                    <SelectItem value="long_answer">Long Answer</SelectItem>
                    <SelectItem value="coding">Coding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={questionForm.difficulty} onValueChange={v => setQuestionForm(prev => ({ ...prev, difficulty: v as Question['difficulty'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Question Text</Label>
              <Textarea
                value={questionForm.question}
                onChange={e => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Enter your question..."
                rows={3}
              />
            </div>

            {/* Options for multiple choice */}
            {questionForm.type === 'multiple_choice' && (
              <div className="space-y-3">
                <Label>Answer Options</Label>
                {questionForm.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${questionForm.correctAnswer === String(i) ? 'border-emerald-500 bg-emerald-500' : 'border-muted-foreground/30'}`}
                      onClick={() => setQuestionForm(prev => ({ ...prev, correctAnswer: String(i) }))}
                    >
                      {questionForm.correctAnswer === String(i) && <div className="h-2 w-2 rounded-full bg-card" />}
                    </div>
                    <Input
                      value={opt}
                      onChange={e => {
                        const updated = [...questionForm.options];
                        updated[i] = e.target.value;
                        setQuestionForm(prev => ({ ...prev, options: updated }));
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1"
                    />
                    {questionForm.options.length > 2 && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => {
                        const updated = questionForm.options.filter((_, idx) => idx !== i);
                        setQuestionForm(prev => ({ ...prev, options: updated, correctAnswer: prev.correctAnswer === String(i) ? '' : prev.correctAnswer }));
                      }}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setQuestionForm(prev => ({ ...prev, options: [...prev.options, ''] }))} className="gap-1">
                  <Plus className="h-3 w-3" /> Add Option
                </Button>
              </div>
            )}

            {/* True/False selector */}
            {questionForm.type === 'true_false' && (
              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <div className="flex gap-3">
                  {['True', 'False'].map(ans => (
                    <Button
                      key={ans}
                      variant={questionForm.correctAnswer === ans ? 'default' : 'outline'}
                      className={questionForm.correctAnswer === ans ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                      onClick={() => setQuestionForm(prev => ({ ...prev, correctAnswer: ans }))}
                    >
                      {ans === 'True' ? <CheckCircle2 className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                      {ans}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Short answer / coding correct answer */}
            {(questionForm.type === 'short_answer' || questionForm.type === 'coding') && (
              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <Input
                  value={questionForm.correctAnswer}
                  onChange={e => setQuestionForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                  placeholder="Expected answer"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Explanation (optional)</Label>
              <Textarea
                value={questionForm.explanation}
                onChange={e => setQuestionForm(prev => ({ ...prev, explanation: e.target.value }))}
                placeholder="Explain why this is the correct answer..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Points</Label>
                <Input type="number" min={1} max={100} value={questionForm.points} onChange={e => setQuestionForm(prev => ({ ...prev, points: Number(e.target.value) || 1 }))} />
              </div>
              <div className="space-y-2">
                <Label>Pool Group (optional)</Label>
                <Input
                  value={questionForm.poolGroup}
                  onChange={e => setQuestionForm(prev => ({ ...prev, poolGroup: e.target.value }))}
                  placeholder="e.g. Module 1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionForm(false)}>Cancel</Button>
            <Button onClick={saveQuestion} className="bg-violet-600 hover:bg-violet-700 text-white" disabled={!questionForm.question.trim()}>
              {editingQuestionIdx !== null ? 'Save Changes' : 'Add Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==========================
// QUIZ TAKING PREVIEW
// ==========================
function QuizPreview({
  assessment,
  onClose,
}: {
  assessment: Assessment;
  onClose: () => void;
}) {
  const questions = assessment.questions ?? [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(assessment.timeLimit ? assessment.timeLimit * 60 : null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setSubmitted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, submitted]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx];
  if (!currentQ) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>No Questions</DialogTitle>
            <DialogDescription>This assessment has no questions to preview.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitted(true);
  };

  let score = 0;
  let maxScore = 0;
  if (submitted) {
    questions.forEach(q => {
      maxScore += q.points;
      if (answers[q.id] === q.correctAnswer) score += q.points;
    });
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg">{assessment.title}</DialogTitle>
              <DialogDescription>{assessment.description}</DialogDescription>
            </div>
            {timeLeft !== null && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-bold ${timeLeft < 60 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 text-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:text-slate-300'}`}>
                <Clock className="h-4 w-4" /> {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Question {currentIdx + 1} of {questions.length}</span>
            <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}% complete</span>
          </div>
          <Progress value={((currentIdx + 1) / questions.length) * 100} className="h-2" />
        </div>

        {/* Question navigation dots */}
        <div className="flex flex-wrap gap-1.5">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(i)}
              className={`h-7 w-7 rounded-full text-xs font-medium flex items-center justify-center transition-colors ${
                i === currentIdx
                  ? 'bg-violet-600 text-white'
                  : answers[q.id]
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <Separator />

        {/* Question content */}
        {!submitted ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TypeIcon type={currentQ.type} className="h-4 w-4 text-violet-600" />
              <DifficultyBadge difficulty={currentQ.difficulty} />
              <Badge variant="outline" className="text-xs">{currentQ.points} pt{currentQ.points !== 1 ? 's' : ''}</Badge>
            </div>
            <h3 className="text-base font-semibold">{currentQ.question}</h3>

            {/* Multiple choice */}
            {currentQ.type === 'multiple_choice' && currentQ.options && (
              <div className="space-y-2">
                {currentQ.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: String(i) }))}
                    className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center gap-3 ${
                      answers[currentQ.id] === String(i)
                        ? 'border-violet-400 bg-violet-50 dark:bg-violet-950/20'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      answers[currentQ.id] === String(i) ? 'border-violet-500' : 'border-muted-foreground/30'
                    }`}>
                      {answers[currentQ.id] === String(i) && <div className="h-2 w-2 rounded-full bg-violet-500" />}
                    </div>
                    <span className="text-sm">{opt}</span>
                  </button>
                ))}
              </div>
            )}

            {/* True/False */}
            {currentQ.type === 'true_false' && (
              <div className="flex gap-3">
                {['True', 'False'].map(ans => (
                  <button
                    key={ans}
                    onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: ans }))}
                    className={`flex-1 p-4 rounded-lg border transition-colors flex items-center justify-center gap-2 font-medium ${
                      answers[currentQ.id] === ans
                        ? ans === 'True'
                          ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                          : 'border-red-400 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    {ans === 'True' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    {ans}
                  </button>
                ))}
              </div>
            )}

            {/* Short answer / coding */}
            {(currentQ.type === 'short_answer' || currentQ.type === 'coding') && (
              <div className="space-y-2">
                <Input
                  value={answers[currentQ.id] ?? ''}
                  onChange={e => setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                  placeholder={currentQ.type === 'coding' ? 'Enter your code...' : 'Type your answer...'}
                />
              </div>
            )}

            {/* Long answer */}
            {currentQ.type === 'long_answer' && (
              <Textarea
                value={answers[currentQ.id] ?? ''}
                onChange={e => setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                placeholder="Write your detailed answer..."
                rows={5}
              />
            )}
          </div>
        ) : (
          /* Submitted results */
          <div className="space-y-4">
            <div className={`p-6 rounded-xl text-center ${score / maxScore * 100 >= assessment.passingScore ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
              <div className="text-4xl font-bold mb-1">
                {score}/{maxScore}
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                {Math.round(score / maxScore * 100)}% — {score / maxScore * 100 >= assessment.passingScore ? 'Passed! 🎉' : 'Not Passed'}
              </div>
              <div className="text-xs text-muted-foreground">Passing score: {assessment.passingScore}%</div>
            </div>

            {questions.map((q, i) => {
              const isCorrect = answers[q.id] === q.correctAnswer;
              return (
                <div key={q.id} className={`p-3 rounded-lg border ${isCorrect ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/10' : 'border-red-300 bg-red-50/50 dark:bg-red-950/10'}`}>
                  <div className="flex items-start gap-2">
                    {isCorrect ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" /> : <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{q.question}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your answer: {q.type === 'multiple_choice' ? (q.options?.[Number(answers[q.id])] ?? answers[q.id]) : answers[q.id] || 'No answer'}
                      </p>
                      {!isCorrect && q.correctAnswer && (
                        <p className="text-xs text-emerald-600 mt-0.5">
                          Correct: {q.type === 'multiple_choice' ? (q.options?.[Number(q.correctAnswer)] ?? q.correctAnswer) : q.correctAnswer}
                        </p>
                      )}
                      {q.explanation && <p className="text-xs text-muted-foreground mt-1 italic">💡 {q.explanation}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter className="flex items-center justify-between">
          {!submitted ? (
            <>
              <Button
                variant="outline"
                onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                disabled={currentIdx === 0}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              {currentIdx < questions.length - 1 ? (
                <Button onClick={() => setCurrentIdx(currentIdx + 1)} className="gap-1 bg-violet-600 hover:bg-violet-700 text-white">
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                  Submit Quiz
                </Button>
              )}
            </>
          ) : (
            <Button onClick={onClose}>Close Preview</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==========================
// MAIN COMPONENT
// ==========================
export function AdminAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>(demoAssessments);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [previewAssessment, setPreviewAssessment] = useState<Assessment | null>(null);

  const handleEdit = (a: Assessment) => {
    setSelectedAssessment({ ...a, questions: a.questions?.map(q => ({ ...q })) });
    setViewMode('builder');
  };

  const handleCreateNew = () => {
    const newAssessment: Assessment = {
      id: `assess-${Date.now()}`,
      courseId: demoCourses[0].id,
      tenantId: 'demo-tenant-1',
      title: '',
      description: '',
      type: 'quiz',
      passingScore: 70,
      maxAttempts: 3,
      timeLimit: 30,
      isPublished: false,
      shuffleQuestions: false,
      questions: [],
    };
    setSelectedAssessment(newAssessment);
    setViewMode('builder');
  };

  const handleSave = (a: Assessment) => {
    const idx = assessments.findIndex(x => x.id === a.id);
    if (idx >= 0) {
      const updated = [...assessments];
      updated[idx] = a;
      setAssessments(updated);
    } else {
      setAssessments(prev => [...prev, a]);
    }
    setViewMode('list');
    setSelectedAssessment(null);
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedAssessment(null);
  };

  return (
    <div className="p-6">
      <AnimatePresence mode="wait">
        {viewMode === 'list' && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AssessmentList
              assessments={assessments}
              onEdit={handleEdit}
              onPreview={a => setPreviewAssessment(a)}
              onCreateNew={handleCreateNew}
            />
          </motion.div>
        )}
        {viewMode === 'builder' && selectedAssessment && (
          <motion.div key="builder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AssessmentBuilder
              assessment={selectedAssessment}
              onBack={handleBack}
              onSave={handleSave}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {previewAssessment && (
        <QuizPreview
          assessment={previewAssessment}
          onClose={() => setPreviewAssessment(null)}
        />
      )}
    </div>
  );
}
