'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { useAssessment, useSubmitQuiz } from '@/hooks/use-data';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Clock,
  AlertTriangle,
  Play,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Bookmark,
  Flag,
  Award,
  Timer,
  ArrowRight,
  Loader2,
  FileCheck,
  RotateCcw,
  Home,
  HelpCircle,
  Zap,
  Target,
  Eye,
  BookOpen,
  Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────
interface QuestionData {
  id: string;
  type: string;
  question: string;
  options?: string | null;
  correctAnswer?: string | null;
  explanation?: string | null;
  points: number;
  orderIndex: number;
  difficulty?: string;
}

interface AssessmentData {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  passingScore: number;
  maxAttempts: number;
  timeLimit?: number | null;
  isPublished: boolean;
  shuffleQuestions: boolean;
  questions: QuestionData[];
  submissions?: any[];
  _count?: { submissions: number; questions: number };
}

interface GradedQuestion {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  points: number;
  earned: number;
}

interface QuizResults {
  submission: any;
  grading: {
    totalPoints: number;
    earnedPoints: number;
    percentScore: number;
    passed: boolean;
    questionResults: GradedQuestion[];
  };
}

type PlayerPhase = 'start' | 'taking' | 'review' | 'results';

interface AssessmentPlayerProps {
  assessmentId: string;
  onClose: () => void;
  previousSubmissions?: any[];
}

// ─── Animation variants ─────────────────────────────────────
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 60 : -60,
    opacity: 0,
  }),
};

const fadeVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const glassCard = 'backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/30';

// ─── Format time helper ─────────────────────────────────────
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Parse options from JSON ────────────────────────────────
function parseOptions(optionsStr: string | null | undefined): string[] {
  if (!optionsStr) return [];
  try {
    const parsed = JSON.parse(optionsStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ─── Parse correct answer from JSON ─────────────────────────
function parseCorrectAnswer(answerStr: string | null | undefined): string | string[] {
  if (!answerStr) return '';
  try {
    const parsed = JSON.parse(answerStr);
    if (Array.isArray(parsed)) return parsed;
    return String(parsed);
  } catch {
    return answerStr;
  }
}

// ─── Difficulty badge color ─────────────────────────────────
function getDifficultyStyle(difficulty?: string) {
  switch (difficulty) {
    case 'easy':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'medium':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'hard':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800/30 dark:text-slate-400';
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export function AssessmentPlayer({ assessmentId, onClose, previousSubmissions = [] }: AssessmentPlayerProps) {
  const currentUser = useAppStore((s) => s.currentUser);
  const currentTenant = useAppStore((s) => s.currentTenant);
  const userId = currentUser?.id || '';
  const tenantId = currentTenant?.id || '';

  const { data: assessment, isLoading: assessmentLoading, error: assessmentError } = useAssessment(assessmentId);
  const submitQuiz = useSubmitQuiz();

  const [phase, setPhase] = useState<PlayerPhase>('start');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [direction, setDirection] = useState(1);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const typedAssessment = assessment as AssessmentData | null;
  const questions = typedAssessment?.questions || [];
  const currentQuestion = questions[currentQuestionIdx];

  // ─── Timer logic ────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'taking' || !typedAssessment?.timeLimit) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Auto-submit when timer expires
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const handleAutoSubmit = useCallback(() => {
    toast.warning('Time is up! Your quiz has been auto-submitted.');
    handleSubmit(true);
  }, [answers, userId, tenantId, assessmentId]);

  // ─── Start quiz ─────────────────────────────────────────
  const handleStartQuiz = () => {
    if (!typedAssessment) return;
    setPhase('taking');
    setStartTime(Date.now());
    setCurrentQuestionIdx(0);
    setAnswers({});
    setMarkedForReview(new Set());

    if (typedAssessment.timeLimit) {
      setTimeRemaining(typedAssessment.timeLimit * 60);
    }
  };

  // ─── Answer handling ────────────────────────────────────
  const setAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const toggleReviewMark = (questionId: string) => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  // ─── Navigation ─────────────────────────────────────────
  const goToQuestion = (idx: number) => {
    setDirection(idx > currentQuestionIdx ? 1 : -1);
    setCurrentQuestionIdx(idx);
  };

  const goNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setDirection(1);
      setCurrentQuestionIdx((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (currentQuestionIdx > 0) {
      setDirection(-1);
      setCurrentQuestionIdx((i) => i - 1);
    }
  };

  // ─── Submit quiz ────────────────────────────────────────
  const handleSubmit = async (isAutoSubmit = false) => {
    if (!isAutoSubmit && !showSubmitDialog) {
      setShowSubmitDialog(true);
      return;
    }

    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    try {
      const result = await submitQuiz.mutateAsync({
        assessmentId,
        userId,
        tenantId,
        answers,
        timeTaken,
      });
      setResults(result as QuizResults);
      setPhase('results');
      setShowSubmitDialog(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Retake quiz ────────────────────────────────────────
  const handleRetake = () => {
    setPhase('start');
    setCurrentQuestionIdx(0);
    setAnswers({});
    setMarkedForReview(new Set());
    setResults(null);
  };

  // ─── Computed values ────────────────────────────────────
  const answeredCount = Object.keys(answers).filter((k) => answers[k]?.trim()).length;
  const unansweredCount = questions.length - answeredCount;
  const reviewCount = markedForReview.size;
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const previousAttempts = previousSubmissions?.length || 0;
  const attemptsRemaining = (typedAssessment?.maxAttempts || 3) - previousAttempts;

  // Timer color
  const timerUrgent = typedAssessment?.timeLimit ? timeRemaining <= 300 && timeRemaining > 0 : false;
  const timerCritical = typedAssessment?.timeLimit ? timeRemaining <= 60 && timeRemaining > 0 : false;

  // ─── Loading state ──────────────────────────────────────
  if (assessmentLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="rounded-xl overflow-hidden">
          <div className="h-32 md:h-40 bg-gradient-to-r from-violet-600 to-purple-800 animate-pulse" />
          <div className="p-6 space-y-4">
            <div className="h-5 bg-muted rounded animate-pulse w-1/3" />
            <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            <div className="h-2.5 bg-muted rounded animate-pulse w-full" />
            <div className="flex gap-3">
              <div className="h-10 w-40 bg-muted rounded animate-pulse" />
              <div className="h-10 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl p-4 bg-muted/30 animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (assessmentError || !typedAssessment) {
    return (
      <div className="p-6 text-center">
        <Card className={cn(glassCard, 'max-w-md mx-auto')}>
          <CardContent className="p-8">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Assessment</h3>
            <p className="text-sm text-muted-foreground mb-4">There was an error loading this assessment. Please try again later.</p>
            <Button variant="outline" onClick={onClose}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if max attempts reached
  if (attemptsRemaining <= 0 && phase === 'start') {
    return (
      <div className="p-6 text-center">
        <Card className={cn(glassCard, 'max-w-md mx-auto')}>
          <CardContent className="p-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Attempts Remaining</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You&apos;ve used all {typedAssessment.maxAttempts} allowed attempt{typedAssessment.maxAttempts > 1 ? 's' : ''} for this assessment.
            </p>
            <Button variant="outline" onClick={onClose}>
              Back to Course
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE: START
  // ═══════════════════════════════════════════════════════════
  if (phase === 'start') {
    return (
      <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="p-4 md:p-6">
        {/* Header Banner */}
        <div className="relative rounded-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-violet-600 to-purple-800 p-6 md:p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Badge className="bg-white/20 text-white hover:bg-white/30 mb-3">
                  <FileCheck className="h-3 w-3 mr-1" />
                  {typedAssessment.type === 'quiz' ? 'Quiz' : typedAssessment.type.charAt(0).toUpperCase() + typedAssessment.type.slice(1)}
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{typedAssessment.title}</h2>
                {typedAssessment.description && (
                  <p className="text-white/80 text-sm md:text-base max-w-2xl">{typedAssessment.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card className={cn(glassCard)}>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-5 w-5 text-violet-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{questions.length}</div>
              <div className="text-xs text-muted-foreground">Questions</div>
            </CardContent>
          </Card>
          <Card className={cn(glassCard)}>
            <CardContent className="p-4 text-center">
              <Target className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{totalPoints}</div>
              <div className="text-xs text-muted-foreground">Total Points</div>
            </CardContent>
          </Card>
          <Card className={cn(glassCard)}>
            <CardContent className="p-4 text-center">
              <Timer className="h-5 w-5 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {typedAssessment.timeLimit ? `${typedAssessment.timeLimit}m` : '∞'}
              </div>
              <div className="text-xs text-muted-foreground">Time Limit</div>
            </CardContent>
          </Card>
          <Card className={cn(glassCard)}>
            <CardContent className="p-4 text-center">
              <Award className="h-5 w-5 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{typedAssessment.passingScore}%</div>
              <div className="text-xs text-muted-foreground">Pass Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Info & Warnings */}
        <Card className={cn(glassCard, 'mb-6')}>
          <CardContent className="p-4 md:p-6 space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Before you begin</p>
                <ul className="text-xs text-amber-700 dark:text-amber-400 mt-1 space-y-1">
                  {typedAssessment.timeLimit && (
                    <li>&#8226; This quiz has a {typedAssessment.timeLimit}-minute time limit. The timer starts when you click &quot;Start Quiz&quot;.</li>
                  )}
                  <li>&#8226; Do not navigate away from this page or your progress may be lost.</li>
                  <li>&#8226; You have {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining out of {typedAssessment.maxAttempts}.</li>
                  <li>&#8226; You need {typedAssessment.passingScore}% to pass.</li>
                </ul>
              </div>
            </div>

            {previousAttempts > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40">
                <HelpCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Previous Attempts</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    You&apos;ve taken this quiz {previousAttempts} time{previousAttempts > 1 ? 's' : ''} before. Your best attempt will be recorded.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {questions.some((q) => q.type === 'multiple_choice') && (
                <Badge variant="secondary" className="text-xs">Multiple Choice</Badge>
              )}
              {questions.some((q) => q.type === 'true_false') && (
                <Badge variant="secondary" className="text-xs">True / False</Badge>
              )}
              {questions.some((q) => q.type === 'short_answer') && (
                <Badge variant="secondary" className="text-xs">Short Answer</Badge>
              )}
              {questions.some((q) => q.type === 'multiple_select') && (
                <Badge variant="secondary" className="text-xs">Multiple Select</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleStartQuiz}
            size="lg"
            className="gap-2 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white"
          >
            <Play className="h-4 w-4" />
            Start Quiz
          </Button>
          <Button variant="outline" onClick={onClose} size="lg">
            Cancel
          </Button>
        </div>
      </motion.div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE: TAKING
  // ═══════════════════════════════════════════════════════════
  if (phase === 'taking') {
    return (
      <div className="p-4 md:p-6">
        {/* Top Bar: Timer + Progress */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold truncate max-w-xs md:max-w-md">{typedAssessment.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress indicator */}
            <div className="text-xs text-muted-foreground">
              {answeredCount}/{questions.length} answered
            </div>
            {/* Timer */}
            {typedAssessment.timeLimit && (
              <div
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-semibold',
                  timerCritical
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
                    : timerUrgent
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300'
                )}
              >
                <Clock className="h-3.5 w-3.5" />
                {formatTime(timeRemaining)}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPhase('review')}
              className="gap-1.5"
            >
              <Eye className="h-3.5 w-3.5" />
              Review
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={(answeredCount / questions.length) * 100} className="h-1.5 mb-4" />

        <div className="flex gap-4 md:gap-6">
          {/* Question Navigation Sidebar */}
          <Card className={cn(glassCard, 'hidden md:block w-56 shrink-0 self-start sticky top-4')}>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id]?.trim();
                  const isCurrent = idx === currentQuestionIdx;
                  const isMarked = markedForReview.has(q.id);

                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(idx)}
                      className={cn(
                        'h-8 w-8 rounded-md text-xs font-medium transition-all relative',
                        isCurrent
                          ? 'bg-violet-600 text-white shadow-md'
                          : isAnswered
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50'
                      )}
                      title={`Question ${idx + 1}${isMarked ? ' (marked for review)' : ''}`}
                    >
                      {idx + 1}
                      {isMarked && (
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              <Separator className="my-3" />

              {/* Legend */}
              <div className="space-y-1.5 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded bg-violet-600" /> Current
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded bg-emerald-100 dark:bg-emerald-900/30" /> Answered
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded bg-slate-100 dark:bg-slate-800/50" /> Unanswered
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-amber-500" /> Marked for review
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Question Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentQuestionIdx}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
              >
                <Card className={cn(glassCard)}>
                  <CardHeader className="p-4 md:p-6 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            Question {currentQuestionIdx + 1} of {questions.length}
                          </Badge>
                          <Badge className={cn('text-xs', getDifficultyStyle(currentQuestion?.difficulty))}>
                            {currentQuestion?.difficulty || 'medium'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {currentQuestion?.points} pt{currentQuestion?.points !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <CardTitle className="text-base md:text-lg leading-relaxed">
                          {currentQuestion?.question}
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => currentQuestion && toggleReviewMark(currentQuestion.id)}
                        className={cn(
                          'shrink-0 gap-1',
                          currentQuestion && markedForReview.has(currentQuestion.id)
                            ? 'text-amber-600'
                            : 'text-muted-foreground'
                        )}
                      >
                        <Bookmark className={cn('h-4 w-4', currentQuestion && markedForReview.has(currentQuestion.id) && 'fill-current')} />
                        <span className="hidden sm:inline text-xs">
                          {currentQuestion && markedForReview.has(currentQuestion.id) ? 'Marked' : 'Mark'}
                        </span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0">
                    {/* Answer Area */}
                    {currentQuestion && (
                      <AnswerInput
                        question={currentQuestion}
                        answer={answers[currentQuestion.id] || ''}
                        onAnswerChange={(val) => setAnswer(currentQuestion.id, val)}
                      />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                onClick={goPrev}
                disabled={currentQuestionIdx === 0}
                className="gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {/* Mobile question navigation */}
              <div className="flex md:hidden items-center gap-1">
                <span className="text-sm text-muted-foreground">
                  {currentQuestionIdx + 1}/{questions.length}
                </span>
              </div>

              {currentQuestionIdx === questions.length - 1 ? (
                <Button
                  onClick={() => setPhase('review')}
                  className="gap-1.5 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white"
                >
                  <Eye className="h-4 w-4" />
                  Review & Submit
                </Button>
              ) : (
                <Button onClick={goNext} className="gap-1.5">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Mobile Question Navigation Grid */}
            <Card className={cn(glassCard, 'md:hidden mt-4')}>
              <CardContent className="p-3">
                <div className="flex flex-wrap gap-1.5">
                  {questions.map((q, idx) => {
                    const isAnswered = answers[q.id]?.trim();
                    const isCurrent = idx === currentQuestionIdx;
                    const isMarked = markedForReview.has(q.id);

                    return (
                      <button
                        key={q.id}
                        onClick={() => goToQuestion(idx)}
                        className={cn(
                          'h-8 w-8 rounded-md text-xs font-medium transition-all relative',
                          isCurrent
                            ? 'bg-violet-600 text-white shadow-md'
                            : isAnswered
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400'
                        )}
                      >
                        {idx + 1}
                        {isMarked && (
                          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE: REVIEW
  // ═══════════════════════════════════════════════════════════
  if (phase === 'review') {
    return (
      <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Review Your Answers</h2>
            <p className="text-sm text-muted-foreground">Make sure you&apos;ve answered all questions before submitting.</p>
          </div>
          {typedAssessment.timeLimit && (
            <div
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-semibold',
                timerCritical
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
                  : timerUrgent
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300'
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          <Card className={cn(glassCard, 'border-emerald-200/50 dark:border-emerald-800/30')}>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-600">{answeredCount}</div>
              <div className="text-xs text-muted-foreground">Answered</div>
            </CardContent>
          </Card>
          <Card className={cn(glassCard, 'border-slate-200/50 dark:border-slate-700/30')}>
            <CardContent className="p-4 text-center">
              <Circle className="h-5 w-5 text-slate-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">{unansweredCount}</div>
              <div className="text-xs text-muted-foreground">Unanswered</div>
            </CardContent>
          </Card>
          <Card className={cn(glassCard, 'border-amber-200/50 dark:border-amber-800/30')}>
            <CardContent className="p-4 text-center">
              <Flag className="h-5 w-5 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-600">{reviewCount}</div>
              <div className="text-xs text-muted-foreground">Marked for Review</div>
            </CardContent>
          </Card>
        </div>

        {/* Question Review List */}
        <Card className={cn(glassCard)}>
          <CardContent className="p-0">
            <ScrollArea className="max-h-96">
              <div className="divide-y divide-border/50">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id]?.trim();
                  const isMarked = markedForReview.has(q.id);

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentQuestionIdx(idx);
                        setPhase('taking');
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors text-left"
                    >
                      <div
                        className={cn(
                          'h-8 w-8 rounded-md text-xs font-medium flex items-center justify-center shrink-0',
                          isAnswered
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400'
                        )}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{q.question}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {isAnswered ? (
                            <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              Answered
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">
                              Unanswered
                            </Badge>
                          )}
                          {isMarked && (
                            <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              <Flag className="h-2.5 w-2.5 mr-0.5" />
                              Review
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {unansweredCount > 0 && (
          <div className="flex items-start gap-3 p-3 mt-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}. Unanswered questions will be marked as incorrect.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" onClick={() => setPhase('taking')} className="gap-1.5">
            <ChevronLeft className="h-4 w-4" />
            Back to Quiz
          </Button>
          <Button
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="gap-1.5 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileCheck className="h-4 w-4" />
            )}
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        </div>

        {/* Submit Confirmation Dialog */}
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Confirm Submission
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to submit your quiz? This action cannot be undone.
              </p>
              {unansweredCount > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    ⚠️ You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 rounded bg-muted/50">
                  <span className="text-muted-foreground">Answered:</span>{' '}
                  <span className="font-medium text-emerald-600">{answeredCount}</span>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <span className="text-muted-foreground">Unanswered:</span>{' '}
                  <span className="font-medium text-slate-600">{unansweredCount}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="gap-1.5 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck className="h-4 w-4" />}
                Submit Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE: RESULTS
  // ═══════════════════════════════════════════════════════════
  if (phase === 'results' && results) {
    const { grading } = results;
    const passed = grading.passed;
    const timeTaken = results.submission?.timeTaken;

    return (
      <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="p-4 md:p-6">
        {/* Results Banner */}
        <div
          className={cn(
            'relative rounded-xl overflow-hidden mb-6',
            passed
              ? 'bg-gradient-to-r from-emerald-600 to-green-700'
              : 'bg-gradient-to-r from-red-600 to-rose-700'
          )}
        >
          <div className="p-6 md:p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            >
              {passed ? (
                <Award className="h-16 w-16 text-white mx-auto mb-4" />
              ) : (
                <XCircle className="h-16 w-16 text-white mx-auto mb-4" />
              )}
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {passed ? 'Congratulations! You Passed!' : 'You Did Not Pass'}
            </h2>
            <p className="text-white/80 text-sm md:text-base">
              {passed
                ? `You scored ${grading.percentScore}% on "${typedAssessment.title}"`
                : `You scored ${grading.percentScore}%. You need ${typedAssessment.passingScore}% to pass.`}
            </p>
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card className={cn(glassCard)}>
            <CardContent className="p-4 text-center">
              <Target className="h-5 w-5 text-violet-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {grading.earnedPoints}/{grading.totalPoints}
              </div>
              <div className="text-xs text-muted-foreground">Points Earned</div>
            </CardContent>
          </Card>
          <Card className={cn(glassCard)}>
            <CardContent className="p-4 text-center">
              <Zap className="h-5 w-5 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{grading.percentScore}%</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </CardContent>
          </Card>
          <Card className={cn(glassCard)}>
            <CardContent className="p-4 text-center">
              <Timer className="h-5 w-5 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{timeTaken ? formatTime(timeTaken) : 'N/A'}</div>
              <div className="text-xs text-muted-foreground">Time Taken</div>
            </CardContent>
          </Card>
          <Card className={cn(glassCard)}>
            <CardContent className="p-4 text-center">
              {passed ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-emerald-600">Passed</div>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">Failed</div>
                </>
              )}
              <div className="text-xs text-muted-foreground">Status</div>
            </CardContent>
          </Card>
        </div>

        {/* Question-by-Question Review */}
        <Card className={cn(glassCard)}>
          <CardHeader className="p-4 md:p-6 pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-violet-600" />
              Question Review
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const questionResult = grading.questionResults.find((r) => r.questionId === q.id);
                  const isCorrect = questionResult?.isCorrect ?? false;
                  const userAnswer = questionResult?.userAnswer || '';
                  const correctAnswer = parseCorrectAnswer(q.correctAnswer);
                  const options = parseOptions(q.options);

                  return (
                    <div
                      key={q.id}
                      className={cn(
                        'p-4 rounded-lg border',
                        isCorrect
                          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/40 dark:bg-emerald-900/10'
                          : 'border-red-200 bg-red-50/50 dark:border-red-800/40 dark:bg-red-900/10'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-muted-foreground">Q{idx + 1}</span>
                            <Badge className={cn('text-[10px]', getDifficultyStyle(q.difficulty))}>{q.difficulty}</Badge>
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-[10px]',
                                isCorrect
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              )}
                            >
                              {isCorrect ? `+${q.points}` : '0'} / {q.points} pts
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mb-2">{q.question}</p>

                          {/* Show options for multiple choice / true false / multiple select */}
                          {(q.type === 'multiple_choice' || q.type === 'true_false' || q.type === 'multiple_select') && options.length > 0 && (
                            <div className="space-y-1.5 mb-2">
                              {options.map((opt, optIdx) => {
                                const optionLabel = String.fromCharCode(65 + optIdx);
                                const isUserChoice = q.type === 'multiple_select'
                                  ? userAnswer.split(',').map((a: string) => a.trim()).includes(opt)
                                  : userAnswer === opt;
                                const isCorrectOption = Array.isArray(correctAnswer)
                                  ? correctAnswer.includes(opt)
                                  : correctAnswer === opt;

                                return (
                                  <div
                                    key={optIdx}
                                    className={cn(
                                      'flex items-center gap-2 text-xs px-2 py-1 rounded',
                                      isCorrectOption && isUserChoice
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                        : isUserChoice && !isCorrectOption
                                          ? 'bg-red-100 dark:bg-red-900/30'
                                          : isCorrectOption
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20'
                                            : 'bg-muted/30'
                                    )}
                                  >
                                    <span className="font-medium">{optionLabel}.</span>
                                    <span>{opt}</span>
                                    {isCorrectOption && (
                                      <CheckCircle2 className="h-3 w-3 text-emerald-600 ml-auto" />
                                    )}
                                    {isUserChoice && !isCorrectOption && (
                                      <XCircle className="h-3 w-3 text-red-600 ml-auto" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Short answer display */}
                          {q.type === 'short_answer' && (
                            <div className="space-y-1.5 mb-2">
                              <div className="text-xs">
                                <span className="text-muted-foreground">Your answer: </span>
                                <span className={cn('font-medium', isCorrect ? 'text-emerald-600' : 'text-red-600')}>
                                  {userAnswer || <em className="text-muted-foreground">No answer</em>}
                                </span>
                              </div>
                              {!isCorrect && (
                                <div className="text-xs">
                                  <span className="text-muted-foreground">Correct answer: </span>
                                  <span className="font-medium text-emerald-600">
                                    {Array.isArray(correctAnswer) ? correctAnswer.join(', ') : correctAnswer}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Explanation */}
                          {q.explanation && (
                            <div className="mt-2 p-2 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40">
                              <p className="text-xs text-blue-700 dark:text-blue-400">
                                <span className="font-medium">Explanation:</span> {q.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
          {attemptsRemaining > 1 && (
            <Button variant="outline" onClick={handleRetake} className="gap-1.5 w-full sm:w-auto">
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </Button>
          )}
          <Button onClick={onClose} className="gap-1.5 w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white">
            <Home className="h-4 w-4" />
            Back to Course
          </Button>
        </div>
      </motion.div>
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════
// ANSWER INPUT COMPONENT
// ═══════════════════════════════════════════════════════════
function AnswerInput({
  question,
  answer,
  onAnswerChange,
}: {
  question: QuestionData;
  answer: string;
  onAnswerChange: (val: string) => void;
}) {
  const options = parseOptions(question.options);

  switch (question.type) {
    case 'multiple_choice':
      return (
        <RadioGroup value={answer} onValueChange={onAnswerChange} className="space-y-2">
          {options.map((opt, idx) => {
            const optionLabel = String.fromCharCode(65 + idx);
            return (
              <Label
                key={idx}
                htmlFor={`q-${question.id}-${idx}`}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                  answer === opt
                    ? 'border-violet-300 bg-violet-50 dark:border-violet-700 dark:bg-violet-900/20'
                    : 'border-border/50 hover:border-violet-200 hover:bg-muted/30 dark:hover:border-violet-800/50'
                )}
              >
                <RadioGroupItem value={opt} id={`q-${question.id}-${idx}`} />
                <span className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-muted-foreground">{optionLabel}.</span>
                  {opt}
                </span>
              </Label>
            );
          })}
        </RadioGroup>
      );

    case 'true_false':
      return (
        <RadioGroup value={answer} onValueChange={onAnswerChange} className="flex gap-4">
          <Label
            htmlFor={`q-${question.id}-true`}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border cursor-pointer transition-all',
              answer === 'True'
                ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20'
                : 'border-border/50 hover:border-emerald-200 hover:bg-muted/30 dark:hover:border-emerald-800/50'
            )}
          >
            <RadioGroupItem value="True" id={`q-${question.id}-true`} />
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium">True</span>
          </Label>
          <Label
            htmlFor={`q-${question.id}-false`}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border cursor-pointer transition-all',
              answer === 'False'
                ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                : 'border-border/50 hover:border-red-200 hover:bg-muted/30 dark:hover:border-red-800/50'
            )}
          >
            <RadioGroupItem value="False" id={`q-${question.id}-false`} />
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium">False</span>
          </Label>
        </RadioGroup>
      );

    case 'short_answer':
      return (
        <div className="space-y-2">
          <Input
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            className="text-sm"
          />
          <p className="text-[10px] text-muted-foreground">Type your answer in the field above. Be as specific as possible.</p>
        </div>
      );

    case 'multiple_select': {
      const selectedAnswers = answer ? answer.split(',').filter(Boolean) : [];
      const handleToggle = (opt: string) => {
        const next = selectedAnswers.includes(opt)
          ? selectedAnswers.filter((a) => a !== opt)
          : [...selectedAnswers, opt];
        onAnswerChange(next.join(','));
      };

      return (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground mb-2">Select all that apply:</p>
          {options.map((opt, idx) => {
            const optionLabel = String.fromCharCode(65 + idx);
            const isChecked = selectedAnswers.includes(opt);

            return (
              <Label
                key={idx}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                  isChecked
                    ? 'border-violet-300 bg-violet-50 dark:border-violet-700 dark:bg-violet-900/20'
                    : 'border-border/50 hover:border-violet-200 hover:bg-muted/30 dark:hover:border-violet-800/50'
                )}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => handleToggle(opt)}
                />
                <span className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-muted-foreground">{optionLabel}.</span>
                  {opt}
                </span>
              </Label>
            );
          })}
        </div>
      );
    }

    default:
      return (
        <Input
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your answer here..."
          className="text-sm"
        />
      );
  }
}
