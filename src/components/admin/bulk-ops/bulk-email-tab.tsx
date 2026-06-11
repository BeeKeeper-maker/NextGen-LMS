'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Send,
  Eye,
  Clock,
  Users,
  Search,
  Bold,
  Italic,
  List,
  Link2,
  Image,
  ChevronDown,
  RefreshCw,
  Download,
  Filter,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { demoCourses, bulkUsers, bulkEmailHistory } from '@/lib/mock-data';

type RecipientType = 'all' | 'course' | 'role' | 'custom';

interface EmailVariable {
  key: string;
  label: string;
  example: string;
}

const emailVariables: EmailVariable[] = [
  { key: '{{user.name}}', label: 'User Name', example: 'John Doe' },
  { key: '{{user.email}}', label: 'User Email', example: 'john@example.com' },
  { key: '{{course.title}}', label: 'Course Title', example: 'Advanced React & Next.js' },
  { key: '{{platform.name}}', label: 'Platform Name', example: 'NextGen Academy' },
  { key: '{{enrollment.date}}', label: 'Enrollment Date', example: 'Oct 14, 2024' },
];

export function BulkEmailTab() {
  // Sub-tab
  const [subTab, setSubTab] = useState<'compose' | 'history'>('compose');
  // Compose state
  const [recipientType, setRecipientType] = useState<RecipientType>('all');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [scheduleType, setScheduleType] = useState<'now' | 'scheduled'>('now');
  const [scheduledTime, setScheduledTime] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendComplete, setSendComplete] = useState(false);
  // Test email
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSent, setTestSent] = useState(false);
  // History filters
  const [dateFilter, setDateFilter] = useState('all');

  // Estimate recipient count
  const recipientCount = useMemo(() => {
    switch (recipientType) {
      case 'all':
        return 3847;
      case 'course':
        return demoCourses.find((c) => c.id === selectedCourse)?.enrollmentCount || 0;
      case 'role':
        return bulkUsers.filter((u) => u.role === selectedRole).length * 257;
      case 'custom':
        return 156;
      default:
        return 0;
    }
  }, [recipientType, selectedCourse, selectedRole]);

  // Insert variable into subject
  const insertVariable = useCallback(
    (variable: string, target: 'subject' | 'body') => {
      if (target === 'subject') {
        setSubject((prev) => prev + variable);
      } else {
        setBody((prev) => prev + variable);
      }
    },
    []
  );

  // Toolbar actions (simulated)
  const toolbarActions = [
    { icon: Bold, label: 'Bold', action: () => setBody((b) => `**${b}**`) },
    { icon: Italic, label: 'Italic', action: () => setBody((b) => `_${b}_`) },
    { icon: List, label: 'List', action: () => setBody((b) => b + '\n- Item 1\n- Item 2') },
    { icon: Link2, label: 'Link', action: () => setBody((b) => b + ' [link text](https://)') },
    { icon: Image, label: 'Image', action: () => setBody((b) => b + ' ![alt](image-url)') },
  ];

  const handleSendEmail = useCallback(() => {
    setShowSendConfirm(false);
    setIsSending(true);
    setSendProgress(0);
    const total = recipientCount;
    let sent = 0;
    const interval = setInterval(() => {
      sent += Math.floor(Math.random() * 200) + 50;
      if (sent >= total) sent = total;
      setSendProgress(Math.round((sent / total) * 100));
      if (sent >= total) {
        clearInterval(interval);
        setTimeout(() => {
          setSendComplete(true);
          setIsSending(false);
        }, 500);
      }
    }, 300);
  }, [recipientCount]);

  const handleSendTest = useCallback(() => {
    setTestSent(true);
    setTimeout(() => {
      setShowTestDialog(false);
      setTestSent(false);
    }, 2000);
  }, []);

  // Preview content with variable substitution
  const previewSubject = subject
    .replace(/\{\{user\.name\}\}/g, 'John Doe')
    .replace(/\{\{user\.email\}\}/g, 'john@example.com')
    .replace(/\{\{course\.title\}\}/g, 'Advanced React & Next.js Masterclass')
    .replace(/\{\{platform\.name\}\}/g, 'NextGen Academy')
    .replace(/\{\{enrollment\.date\}\}/g, 'Oct 14, 2024');

  const previewBody = body
    .replace(/\{\{user\.name\}\}/g, 'John Doe')
    .replace(/\{\{user\.email\}\}/g, 'john@example.com')
    .replace(/\{\{course\.title\}\}/g, 'Advanced React & Next.js Masterclass')
    .replace(/\{\{platform\.name\}\}/g, 'NextGen Academy')
    .replace(/\{\{enrollment\.date\}\}/g, 'Oct 14, 2024');

  const filteredHistory = bulkEmailHistory.filter((e) => {
    if (dateFilter === 'all') return true;
    if (dateFilter === 'week') {
      const d = new Date(e.sentDate);
      const now = new Date();
      return now.getTime() - d.getTime() < 7 * 86400000;
    }
    if (dateFilter === 'month') {
      const d = new Date(e.sentDate);
      const now = new Date();
      return now.getTime() - d.getTime() < 30 * 86400000;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <Tabs value={subTab} onValueChange={(v) => setSubTab(v as 'compose' | 'history')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compose" className="gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Email History
          </TabsTrigger>
        </TabsList>

        {/* ─── COMPOSE TAB ─────────────────────────────── */}
        <TabsContent value="compose" className="space-y-4 mt-4">
          {sendComplete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-12 space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              >
                <CheckCircle2 className="h-16 w-16 text-emerald-500" />
              </motion.div>
              <h3 className="text-lg font-semibold">Email Sent Successfully!</h3>
              <p className="text-sm text-muted-foreground">{recipientCount} recipients notified</p>
              <Button
                onClick={() => {
                  setSendComplete(false);
                  setSubject('');
                  setBody('');
                  setRecipientType('all');
                  setSelectedCourse('');
                  setSelectedRole('');
                }}
                variant="outline"
              >
                Compose Another
              </Button>
            </motion.div>
          ) : isSending ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-12 space-y-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="h-12 w-12 text-emerald-500" />
              </motion.div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">Sending Emails...</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {Math.round((sendProgress / 100) * recipientCount)} / {recipientCount} sent
                </p>
              </div>
              <div className="w-full max-w-sm">
                <Progress value={sendProgress} className="h-3" />
                <p className="text-xs text-muted-foreground text-center mt-2">{sendProgress}%</p>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Recipient Selector */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-500" />
                  Recipients
                </Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { key: 'all', label: 'All Users', count: 3847 },
                    { key: 'course', label: 'By Course', count: null },
                    { key: 'role', label: 'By Role', count: null },
                    { key: 'custom', label: 'Custom', count: 156 },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setRecipientType(opt.key as RecipientType)}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-3 transition-all duration-200 ${
                        recipientType === opt.key
                          ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 shadow-sm'
                          : 'border-border hover:border-emerald-300'
                      }`}
                    >
                      <span className="text-sm font-medium">{opt.label}</span>
                      {opt.count && (
                        <span className="text-xs text-muted-foreground">{opt.count.toLocaleString()} users</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Conditional selectors */}
                {recipientType === 'course' && (
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course..." />
                    </SelectTrigger>
                    <SelectContent>
                      {demoCourses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title} ({c.enrollmentCount} students)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {recipientType === 'role' && (
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="learner">Learners</SelectItem>
                      <SelectItem value="instructor">Instructors</SelectItem>
                      <SelectItem value="content_creator">Content Creators</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    ~{recipientCount.toLocaleString()} recipients
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Subject with variable support */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Subject Line</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email subject... (use {{variables}} for personalization)"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {emailVariables.map((v) => (
                    <button
                      key={v.key}
                      onClick={() => insertVariable(v.key, 'subject')}
                      className="rounded-md border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 px-2 py-0.5 text-[11px] text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition-colors"
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body with toolbar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Email Body</Label>
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setShowPreview(!showPreview)}>
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-1 rounded-t-md border border-b-0 bg-muted/30 p-1.5">
                  {toolbarActions.map((tool) => (
                    <Button key={tool.label} variant="ghost" size="icon" className="h-7 w-7" onClick={tool.action} title={tool.label}>
                      <tool.icon className="h-3.5 w-3.5" />
                    </Button>
                  ))}
                  <Separator orientation="vertical" className="h-5 mx-1" />
                  {emailVariables.map((v) => (
                    <Button
                      key={v.key}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[11px] px-1.5"
                      onClick={() => insertVariable(v.key, 'body')}
                      title={`Insert ${v.label}`}
                    >
                      {`{${v.label}}`}
                    </Button>
                  ))}
                </div>

                <Textarea
                  placeholder="Write your email content here... Use {{user.name}}, {{course.title}}, etc. for personalization."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-[180px] rounded-t-none font-mono text-sm"
                />

                {/* Preview */}
                <AnimatePresence>
                  {showPreview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-lg border bg-white dark:bg-slate-900 p-4 space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview</p>
                        <div className="rounded-md border p-3 bg-muted/20">
                          <p className="text-sm font-semibold">{previewSubject || '(No subject)'}</p>
                          <Separator className="my-2" />
                          <div className="text-sm whitespace-pre-wrap">{previewBody || '(No content)'}</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Separator />

              {/* Scheduling */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  Schedule
                </Label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="send-now"
                      name="schedule"
                      checked={scheduleType === 'now'}
                      onChange={() => setScheduleType('now')}
                      className="accent-emerald-600"
                    />
                    <Label htmlFor="send-now" className="text-sm cursor-pointer">Send Now</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="send-scheduled"
                      name="schedule"
                      checked={scheduleType === 'scheduled'}
                      onChange={() => setScheduleType('scheduled')}
                      className="accent-emerald-600"
                    />
                    <Label htmlFor="send-scheduled" className="text-sm cursor-pointer">Schedule</Label>
                  </div>
                  {scheduleType === 'scheduled' && (
                    <Input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-52 h-8 text-sm"
                    />
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowTestDialog(true)} className="text-xs">
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Send Test Email
                </Button>
                <Button
                  onClick={() => setShowSendConfirm(true)}
                  disabled={!subject || !body || recipientCount === 0}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
                >
                  <Send className="h-4 w-4 mr-1.5" />
                  {scheduleType === 'now' ? 'Send' : 'Schedule'} Email to {recipientCount.toLocaleString()} Users
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        {/* ─── HISTORY TAB ─────────────────────────────── */}
        <TabsContent value="history" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5" />
              {filteredHistory.length} emails
            </div>
          </div>

          {/* Email History Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-center">Recipients</TableHead>
                  <TableHead>Sent Date</TableHead>
                  <TableHead className="text-center">Open Rate</TableHead>
                  <TableHead className="text-center">Click Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((email) => (
                  <TableRow key={email.id}>
                    <TableCell className="text-sm font-medium max-w-[200px] truncate">{email.subject}</TableCell>
                    <TableCell className="text-sm text-center">{email.recipients.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{email.sentDate}</TableCell>
                    <TableCell className="text-center">
                      <span className={`text-sm font-medium ${email.openRate > 60 ? 'text-emerald-600' : email.openRate > 40 ? 'text-amber-600' : 'text-red-600'}`}>
                        {email.openRate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`text-sm font-medium ${email.clickRate > 25 ? 'text-emerald-600' : email.clickRate > 15 ? 'text-amber-600' : 'text-red-600'}`}>
                        {email.clickRate}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          email.status === 'sent'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : email.status === 'partial'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                        }`}
                      >
                        {email.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {email.status === 'partial' && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Resend failed">
                            <RefreshCw className="h-3.5 w-3.5 text-amber-500" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="View details">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Test Email Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test email to preview how it will look for recipients.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Recipient Email</Label>
              <Input
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                type="email"
              />
            </div>
            {testSent && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-3"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <p className="text-sm text-emerald-700 dark:text-emerald-300">Test email sent to {testEmail}!</p>
              </motion.div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendTest} disabled={!testEmail} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Send className="h-4 w-4 mr-1.5" />
              Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Confirmation Dialog */}
      <Dialog open={showSendConfirm} onOpenChange={setShowSendConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Confirm Email Send
            </DialogTitle>
            <DialogDescription>
              You are about to send this email to <strong>{recipientCount.toLocaleString()} recipients</strong>.
              {scheduleType === 'scheduled' && ` Scheduled for ${scheduledTime}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg bg-muted/50 p-3">
            <p className="text-sm"><strong>Subject:</strong> {subject}</p>
            <p className="text-xs text-muted-foreground line-clamp-3">{body}</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSendConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg">
              <Send className="h-4 w-4 mr-1.5" />
              {scheduleType === 'now' ? 'Send Now' : 'Schedule Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
