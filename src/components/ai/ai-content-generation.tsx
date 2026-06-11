'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookOpen,
  HelpCircle,
  FileText,
  ClipboardCheck,
  Mail,
  Sparkles,
  Copy,
  RotateCcw,
  Edit3,
  Check,
  Loader2,
  ArrowLeft,
  Users,
  BarChart3,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================
// Types
// ============================================================
type ContentType = 'outline' | 'quiz' | 'transcript' | 'assessment' | 'email';

interface ContentTypeInfo {
  type: ContentType;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
}

const contentTypes: ContentTypeInfo[] = [
  {
    type: 'outline',
    title: 'Course Outline',
    description: 'Generate a structured course outline from a topic',
    icon: BookOpen,
    color: 'text-emerald-600',
    bgGradient: 'from-emerald-500/10 to-emerald-600/10',
  },
  {
    type: 'quiz',
    title: 'Quiz Questions',
    description: 'Create quiz questions from a topic or lesson',
    icon: HelpCircle,
    color: 'text-violet-600',
    bgGradient: 'from-violet-500/10 to-violet-600/10',
  },
  {
    type: 'transcript',
    title: 'Lesson Transcript',
    description: 'Generate a lesson transcript from a video URL',
    icon: FileText,
    color: 'text-slate-600',
    bgGradient: 'from-slate-500/10 to-slate-600/10',
  },
  {
    type: 'assessment',
    title: 'Assessment',
    description: 'Create an assessment from course content',
    icon: ClipboardCheck,
    color: 'text-amber-600',
    bgGradient: 'from-amber-500/10 to-amber-600/10',
  },
  {
    type: 'email',
    title: 'Email Template',
    description: 'Generate course announcement emails',
    icon: Mail,
    color: 'text-rose-600',
    bgGradient: 'from-rose-500/10 to-rose-600/10',
  },
];

// ============================================================
// Main Component
// ============================================================
export function AIContentGeneration() {
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [copied, setCopied] = useState(false);

  // Form state
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('beginner');
  const [difficulty, setDifficulty] = useState('beginner');
  const [numModules, setNumModules] = useState('6');
  const [numQuestions, setNumQuestions] = useState('5');
  const [questionTypes, setQuestionTypes] = useState({
    multipleChoice: true,
    trueFalse: true,
    shortAnswer: false,
  });
  const [videoUrl, setVideoUrl] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailAudience, setEmailAudience] = useState('all');

  const resetForm = () => {
    setGeneratedContent(null);
    setIsEditing(false);
    setEditedContent('');
    setTopic('');
    setTargetAudience('beginner');
    setDifficulty('beginner');
    setNumModules('6');
    setNumQuestions('5');
    setQuestionTypes({ multipleChoice: true, trueFalse: true, shortAnswer: false });
    setVideoUrl('');
    setEmailSubject('');
    setEmailAudience('all');
  };

  const buildPrompt = (): string => {
    switch (selectedType) {
      case 'outline':
        return `Create a detailed course outline for the topic: "${topic}". Target audience: ${targetAudience}. Difficulty level: ${difficulty}. Include ${numModules} modules with lesson titles and brief descriptions for each. Format with clear headings and bullet points.`;
      case 'quiz':
        return `Generate ${numQuestions} quiz questions about: "${topic}". Question types: ${questionTypes.multipleChoice ? 'Multiple Choice, ' : ''}${questionTypes.trueFalse ? 'True/False, ' : ''}${questionTypes.shortAnswer ? 'Short Answer, ' : ''}Difficulty: ${difficulty}. For each question, include the question, options (if applicable), the correct answer, and a brief explanation.`;
      case 'transcript':
        return `Generate a detailed lesson transcript based on this video concept: "${videoUrl || topic}". Include a clear introduction, main content sections with examples, and a summary. Make it educational and engaging with a natural speaking tone.`;
      case 'assessment':
        return `Create a comprehensive assessment for the course/topic: "${topic}". Include a mix of question types (multiple choice, true/false, short answer, and one essay question). Difficulty: ${difficulty}. Include a grading rubric and point values for each question.`;
      case 'email':
        return `Write a professional email template for a course announcement. Subject: "${emailSubject || topic}". Target audience: ${emailAudience}. Include a compelling subject line, greeting, main announcement body, call-to-action, and professional sign-off. Make it engaging and actionable.`;
      default:
        return topic;
    }
  };

  const handleGenerate = async () => {
    if (!topic && selectedType !== 'transcript') {
      toast.error('Please enter a topic');
      return;
    }
    if (selectedType === 'transcript' && !videoUrl && !topic) {
      toast.error('Please enter a video URL or topic');
      return;
    }

    setIsGenerating(true);
    setGeneratedContent(null);
    setIsEditing(false);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: buildPrompt(),
          context: `Content generation - ${selectedType}`,
        }),
      });

      if (!res.ok) throw new Error('Generation failed');

      const data = await res.json();
      setGeneratedContent(data.response);
      setEditedContent(data.response);
    } catch {
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    const contentToCopy = isEditing ? editedContent : generatedContent || '';
    await navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseContent = () => {
    toast.success('Content ready to use in Course Builder!', {
      description: 'The generated content has been prepared for your course.',
    });
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleSaveEdit = () => {
    setGeneratedContent(editedContent);
    setIsEditing(false);
    toast.success('Content updated!');
  };

  const selectedTypeInfo = contentTypes.find((ct) => ct.type === selectedType);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Content Generation</h1>
        <p className="text-muted-foreground mt-1">
          Generate course content, quizzes, assessments, and more with AI assistance
        </p>
      </div>

      <Separator />

      {/* Back button when content type selected */}
      {selectedType && !generatedContent && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedType(null);
            resetForm();
          }}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to content types
        </Button>
      )}

      {/* Step 1: Content Type Selector */}
      {!selectedType && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">
            What would you like to generate?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentTypes.map((ct) => (
              <Card
                key={ct.type}
                className="cursor-pointer hover:border-emerald-300 hover:shadow-lg transition-all group"
                onClick={() => setSelectedType(ct.type)}
              >
                <CardContent className="p-6">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${ct.bgGradient} mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <ct.icon className={`h-6 w-6 ${ct.color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground">{ct.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{ct.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 2: Generation Form */}
      {selectedType && !generatedContent && !isGenerating && selectedTypeInfo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${selectedTypeInfo.bgGradient}`}
                >
                  <selectedTypeInfo.icon className={`h-5 w-5 ${selectedTypeInfo.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{selectedTypeInfo.title}</CardTitle>
                  <CardDescription>{selectedTypeInfo.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Common: Topic */}
              {selectedType !== 'transcript' && (
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic / Subject</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Introduction to React Hooks"
                  />
                </div>
              )}

              {/* Course Outline Form */}
              {selectedType === 'outline' && (
                <>
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Select value={targetAudience} onValueChange={setTargetAudience}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginners</SelectItem>
                        <SelectItem value="intermediate">Intermediate Learners</SelectItem>
                        <SelectItem value="advanced">Advanced Practitioners</SelectItem>
                        <SelectItem value="professional">Working Professionals</SelectItem>
                        <SelectItem value="students">College Students</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty Level</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numModules">Number of Modules</Label>
                    <Select value={numModules} onValueChange={setNumModules}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4 Modules</SelectItem>
                        <SelectItem value="6">6 Modules</SelectItem>
                        <SelectItem value="8">8 Modules</SelectItem>
                        <SelectItem value="10">10 Modules</SelectItem>
                        <SelectItem value="12">12 Modules</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Quiz Questions Form */}
              {selectedType === 'quiz' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="numQuestions">Number of Questions</Label>
                    <Select value={numQuestions} onValueChange={setNumQuestions}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Questions</SelectItem>
                        <SelectItem value="5">5 Questions</SelectItem>
                        <SelectItem value="10">10 Questions</SelectItem>
                        <SelectItem value="15">15 Questions</SelectItem>
                        <SelectItem value="20">20 Questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label>Question Types</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="mc"
                          checked={questionTypes.multipleChoice}
                          onCheckedChange={(v) =>
                            setQuestionTypes((prev) => ({
                              ...prev,
                              multipleChoice: v === true,
                            }))
                          }
                        />
                        <Label htmlFor="mc" className="text-sm font-normal cursor-pointer">
                          Multiple Choice
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="tf"
                          checked={questionTypes.trueFalse}
                          onCheckedChange={(v) =>
                            setQuestionTypes((prev) => ({
                              ...prev,
                              trueFalse: v === true,
                            }))
                          }
                        />
                        <Label htmlFor="tf" className="text-sm font-normal cursor-pointer">
                          True / False
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="sa"
                          checked={questionTypes.shortAnswer}
                          onCheckedChange={(v) =>
                            setQuestionTypes((prev) => ({
                              ...prev,
                              shortAnswer: v === true,
                            }))
                          }
                        />
                        <Label htmlFor="sa" className="text-sm font-normal cursor-pointer">
                          Short Answer
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty Level</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Transcript Form */}
              {selectedType === 'transcript' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Video URL or Topic</Label>
                    <Input
                      id="videoUrl"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="e.g., https://youtube.com/watch?v=... or topic name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topicTranscript">Additional Context (optional)</Label>
                    <Input
                      id="topicTranscript"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Any additional context for the transcript"
                    />
                  </div>
                </>
              )}

              {/* Assessment Form */}
              {selectedType === 'assessment' && (
                <div className="space-y-2">
                  <Label>Assessment Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Email Template Form */}
              {selectedType === 'email' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="emailSubject">Email Subject / Announcement</Label>
                    <Input
                      id="emailSubject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="e.g., New Course Launch: Advanced React Patterns"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Select value={emailAudience} onValueChange={setEmailAudience}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Students</SelectItem>
                        <SelectItem value="enrolled">Enrolled Students</SelectItem>
                        <SelectItem value="new">New Prospects</SelectItem>
                        <SelectItem value="inactive">Inactive Students</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Button
                onClick={handleGenerate}
                className="w-full bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white gap-2"
                size="lg"
              >
                <Sparkles className="h-4 w-4" />
                Generate {selectedTypeInfo.title}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-2xl"
        >
          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="h-16 w-16 rounded-full border-4 border-emerald-200 border-t-emerald-500"
                  />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-emerald-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground">
                    Generating your {selectedTypeInfo?.title.toLowerCase()}...
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI is crafting high-quality content for you
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    className="h-3 w-3 rounded-full bg-emerald-500"
                  />
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="h-3 w-3 rounded-full bg-violet-500"
                  />
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="h-3 w-3 rounded-full bg-emerald-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Generated Content Preview */}
      {generatedContent && selectedTypeInfo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  resetForm();
                  setSelectedType(null);
                }}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                New Generation
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-2"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="gap-2"
              >
                <Edit3 className="h-3.5 w-3.5" />
                {isEditing ? 'Preview' : 'Edit'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                className="gap-2"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Regenerate
              </Button>
              <Button
                size="sm"
                onClick={handleUseContent}
                className="gap-2 bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Use This Content
              </Button>
            </div>
          </div>

          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${selectedTypeInfo.bgGradient}`}
                >
                  <selectedTypeInfo.icon className={`h-5 w-5 ${selectedTypeInfo.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Generated {selectedTypeInfo.title}
                  </CardTitle>
                  <CardDescription>
                    {isEditing ? 'Edit the content below' : 'AI-generated content ready for review'}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="ml-auto gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI Generated
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                    {generatedContent}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
