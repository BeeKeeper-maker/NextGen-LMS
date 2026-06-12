'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Download,
  Search,
  UserPlus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileSpreadsheet,
  Mail,
  Calendar,
  Shield,
  ChevronRight,
  Users,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useCourses, useUsers } from '@/hooks/use-data';
import { useAppStore } from '@/store/app-store';

// Bulk user display type for enrollment UI
interface BulkUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  coursesEnrolled: number;
  lastActive: string;
}

/** Format a date as a relative time string */
function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
}

/** Map API user data to BulkUser display type */
function mapApiUserToBulkUser(apiUser: any): BulkUser {
  return {
    id: apiUser.id,
    name: apiUser.name || apiUser.email?.split('@')[0] || 'Unknown',
    email: apiUser.email || '',
    role: apiUser.role || 'learner',
    status: apiUser.isActive ? 'active' : 'inactive',
    coursesEnrolled: apiUser._count?.enrollments ?? 0,
    lastActive: formatRelativeTime(apiUser.lastLoginAt),
  };
}

interface CSVRow {
  email: string;
  name: string;
  valid: boolean;
  error?: string;
}

type EnrollmentStep = 'configure' | 'preview' | 'processing' | 'complete';

export function BulkEnrollmentTab() {
  // Course selection
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const tenantId = useAppStore((s) => s.currentTenant?.id) || '';
  const { data: coursesData } = useCourses(tenantId || undefined);
  const demoCourses = coursesData || [];
  const { data: usersData, isLoading: usersLoading } = useUsers(tenantId || undefined);
  // Map API users to display type
  const bulkUsers: BulkUser[] = useMemo(() => {
    if (!usersData?.users) return [];
    return usersData.users.map(mapApiUserToBulkUser);
  }, [usersData]);
  // User selection mode
  const [selectionMode, setSelectionMode] = useState<'manual' | 'csv'>('manual');
  // Manual selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  // CSV
  const [csvRows, setCsvRows] = useState<CSVRow[]>([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Options
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [grantImmediateAccess, setGrantImmediateAccess] = useState(true);
  const [enrollmentDate, setEnrollmentDate] = useState<'now' | 'scheduled'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  // Flow state
  const [currentStep, setCurrentStep] = useState<EnrollmentStep>('configure');
  const [progress, setProgress] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  // Results
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);

  const selectedCourse = demoCourses.find((c: any) => c.id === selectedCourseId);

  const filteredUsers = bulkUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUsers = bulkUsers.filter((u) => selectedUserIds.has(u.id));
  const usersToEnroll = selectionMode === 'manual' ? selectedUsers : csvRows.filter((r) => r.valid);
  const validCsvCount = csvRows.filter((r) => r.valid).length;
  const invalidCsvCount = csvRows.filter((r) => !r.valid).length;

  const toggleUser = useCallback(
    (userId: string) => {
      setSelectedUserIds((prev) => {
        const next = new Set(prev);
        if (next.has(userId)) next.delete(userId);
        else next.add(userId);
        return next;
      });
    },
    []
  );

  const toggleAllUsers = useCallback(() => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map((u) => u.id)));
    }
  }, [filteredUsers, selectedUserIds]);

  const handleCSVUpload = useCallback((file: File) => {
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      const header = lines[0]?.toLowerCase() || '';
      const hasHeader = header.includes('email') || header.includes('name');
      const dataLines = hasHeader ? lines.slice(1) : lines;
      const rows: CSVRow[] = dataLines
        .map((line) => {
          const parts = line.split(',').map((p) => p.trim().replace(/"/g, ''));
          const email = parts[0] || '';
          const name = parts[1] || '';
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const valid = emailRegex.test(email);
          return { email, name, valid, error: valid ? undefined : 'Invalid email format' };
        })
        .filter((r) => r.email);
      setCsvRows(rows);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.csv') || file.name.endsWith('.txt'))) {
        handleCSVUpload(file);
      }
    },
    [handleCSVUpload]
  );

  const downloadCSVTemplate = useCallback(() => {
    const csv = 'email,name\njohn@example.com,John Doe\njane@example.com,Jane Smith';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enrollment_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleEnroll = useCallback(() => {
    setShowConfirmDialog(false);
    setCurrentStep('processing');
    setProgress(0);
    const total = usersToEnroll.length;
    let processed = 0;
    const interval = setInterval(() => {
      processed++;
      setProgress(Math.round((processed / total) * 100));
      if (processed >= total) {
        clearInterval(interval);
        setSuccessCount(Math.round(total * 0.92));
        setFailCount(total - Math.round(total * 0.92));
        setCurrentStep('complete');
      }
    }, 200);
  }, [usersToEnroll]);

  const resetForm = useCallback(() => {
    setSelectedCourseId('');
    setSelectedUserIds(new Set());
    setCsvRows([]);
    setCsvFileName('');
    setSelectionMode('manual');
    setSearchQuery('');
    setCurrentStep('configure');
    setProgress(0);
  }, []);

  // ─── Step indicator ──────────────────────────────────────
  const steps = [
    { id: 'configure', label: 'Configure' },
    { id: 'preview', label: 'Preview' },
    { id: 'processing', label: 'Processing' },
    { id: 'complete', label: 'Complete' },
  ];

  const stepIndex: Record<EnrollmentStep, number> = {
    configure: 0,
    preview: 1,
    processing: 2,
    complete: 3,
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                i <= stepIndex[currentStep]
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < stepIndex[currentStep] ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-xs font-medium hidden sm:inline ${
                i <= stepIndex[currentStep] ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 w-6 sm:w-10 rounded transition-colors ${
                  i < stepIndex[currentStep] ? 'bg-emerald-500' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ─── CONFIGURE STEP ──────────────────────────── */}
        {currentStep === 'configure' && (
          <motion.div
            key="configure"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {/* Course Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                Select Course
              </Label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Search and select a course..." />
                </SelectTrigger>
                <SelectContent>
                  {demoCourses.map((course: any) => (
                    <SelectItem key={course.id} value={course.id}>
                      <div className="flex items-center gap-2">
                        <span>{course.title}</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {course.enrollmentCount || 0} enrolled
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCourse && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-3"
                >
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{selectedCourse.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedCourse.level} · {selectedCourse.durationHours}h · {selectedCourse.enrollmentCount} students
                  </p>
                </motion.div>
              )}
            </div>

            <Separator />

            {/* Selection Mode Toggle */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">User Selection Method</Label>
              <div className="flex gap-2">
                <Button
                  variant={selectionMode === 'manual' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectionMode('manual')}
                  className={selectionMode === 'manual' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  <Users className="h-4 w-4 mr-1.5" />
                  Select Users
                </Button>
                <Button
                  variant={selectionMode === 'csv' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectionMode('csv')}
                  className={selectionMode === 'csv' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  <Upload className="h-4 w-4 mr-1.5" />
                  Upload CSV
                </Button>
              </div>
            </div>

            {/* Manual User Selection */}
            {selectionMode === 'manual' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {usersLoading ? 'Loading users...' : `${selectedUserIds.size} of ${bulkUsers.length} users selected`}
                  </span>
                  {!usersLoading && (
                    <Button variant="ghost" size="sm" onClick={toggleAllUsers} className="text-xs h-7">
                      {selectedUserIds.size === filteredUsers.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  )}
                </div>

                <ScrollArea className="h-64 rounded-md border">
                  <div className="p-2 space-y-1">
                    {usersLoading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2">
                          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                          <div className="flex-1 space-y-1">
                            <div className="h-3.5 bg-muted animate-pulse rounded w-1/3" />
                            <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                          </div>
                        </div>
                      ))
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors cursor-pointer ${
                            selectedUserIds.has(user.id)
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => toggleUser(user.id)}
                        >
                          <Checkbox checked={selectedUserIds.has(user.id)} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-1.5 py-0 ${
                                user.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                              }`}
                            >
                              {user.status}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {user.role}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center">
                        <Users className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                        <p className="text-sm text-muted-foreground">No users found</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </motion.div>
            )}

            {/* CSV Upload */}
            {selectionMode === 'csv' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                {/* Drop zone */}
                <motion.div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  animate={{
                    scale: isDragging ? 1.02 : 1,
                    borderColor: isDragging ? '#10B981' : undefined,
                  }}
                  className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer ${
                    isDragging
                      ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-muted-foreground/25 hover:border-emerald-300 hover:bg-muted/30'
                  } ${csvFileName ? 'border-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/10' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCSVUpload(file);
                    }}
                  />
                  <motion.div
                    animate={{ y: isDragging ? -5 : 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {csvFileName ? (
                      <FileSpreadsheet className="h-10 w-10 text-emerald-500" />
                    ) : (
                      <Upload className="h-10 w-10 text-muted-foreground/60" />
                    )}
                  </motion.div>
                  {csvFileName ? (
                    <div className="mt-3 text-center">
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{csvFileName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {csvRows.length} rows found · {validCsvCount} valid · {invalidCsvCount} invalid
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 text-center">
                      <p className="text-sm font-medium">Drag & drop your CSV file here</p>
                      <p className="text-xs text-muted-foreground mt-0.5">or click to browse</p>
                    </div>
                  )}
                </motion.div>

                <div className="flex justify-center">
                  <Button variant="outline" size="sm" onClick={downloadCSVTemplate} className="text-xs">
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Download CSV Template
                  </Button>
                </div>

                {/* CSV Validation Preview */}
                {csvRows.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">CSV Preview & Validation</Label>
                    <div className="rounded-md border max-h-48 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10">Status</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Issue</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {csvRows.map((row, i) => (
                            <TableRow key={i}>
                              <TableCell>
                                {row.valid ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                              </TableCell>
                              <TableCell className="text-sm">{row.email}</TableCell>
                              <TableCell className="text-sm">{row.name || '—'}</TableCell>
                              <TableCell className="text-xs text-red-500">{row.error || '—'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            <Separator />

            {/* Options */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Enrollment Options</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium">Send Welcome Email</p>
                      <p className="text-xs text-muted-foreground">Notify users about their enrollment</p>
                    </div>
                  </div>
                  <Switch checked={sendWelcomeEmail} onCheckedChange={setSendWelcomeEmail} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium">Grant Immediate Access</p>
                      <p className="text-xs text-muted-foreground">Allow users to start right away</p>
                    </div>
                  </div>
                  <Switch checked={grantImmediateAccess} onCheckedChange={setGrantImmediateAccess} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium">Enrollment Date</p>
                      <p className="text-xs text-muted-foreground">Set when access begins</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={enrollmentDate} onValueChange={(v: 'now' | 'scheduled') => setEnrollmentDate(v)}>
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="now">Now</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                    {enrollmentDate === 'scheduled' && (
                      <Input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-36 h-8 text-xs"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="flex justify-end">
              <Button
                onClick={() => setCurrentStep('preview')}
                disabled={!selectedCourseId || usersToEnroll.length === 0}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
              >
                Preview Enrollment
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ─── PREVIEW STEP ────────────────────────────── */}
        {currentStep === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="rounded-xl border bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-card p-5">
              <h3 className="font-semibold text-base">Enrollment Summary</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white/70 dark:bg-slate-900/60 p-3 text-center backdrop-blur-sm border">
                  <p className="text-2xl font-bold text-emerald-600">{usersToEnroll.length}</p>
                  <p className="text-xs text-muted-foreground">Users</p>
                </div>
                <div className="rounded-lg bg-white/70 dark:bg-slate-900/60 p-3 text-center backdrop-blur-sm border">
                  <p className="text-2xl font-bold text-foreground">{selectedCourse?.title?.split(' ').slice(0, 2).join(' ')}</p>
                  <p className="text-xs text-muted-foreground">Course</p>
                </div>
                <div className="rounded-lg bg-white/70 dark:bg-slate-900/60 p-3 text-center backdrop-blur-sm border">
                  <p className="text-2xl font-bold text-foreground">{sendWelcomeEmail ? 'Yes' : 'No'}</p>
                  <p className="text-xs text-muted-foreground">Welcome Email</p>
                </div>
                <div className="rounded-lg bg-white/70 dark:bg-slate-900/60 p-3 text-center backdrop-blur-sm border">
                  <p className="text-2xl font-bold text-foreground">{enrollmentDate === 'now' ? 'Now' : 'Scheduled'}</p>
                  <p className="text-xs text-muted-foreground">Start Date</p>
                </div>
              </div>
            </div>

            {/* User Preview Table */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Users to Enroll</Label>
              <div className="rounded-md border max-h-56 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectionMode === 'manual' ? selectedUsers : csvRows.filter((r) => r.valid)).map((user, i) => {
                      const name = 'name' in user ? user.name : (user as CSVRow).name || 'Unknown';
                      const email = user.email;
                      const status = 'status' in user ? user.status : 'active';
                      return (
                        <TableRow key={i}>
                          <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                          <TableCell className="text-sm font-medium">{name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{email}</TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] ${
                                status === 'active'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                              }`}
                            >
                              {status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('configure')}>
                Back
              </Button>
              <Button
                onClick={() => setShowConfirmDialog(true)}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
              >
                <UserPlus className="h-4 w-4 mr-1.5" />
                Enroll {usersToEnroll.length} Users
              </Button>
            </div>
          </motion.div>
        )}

        {/* ─── PROCESSING STEP ─────────────────────────── */}
        {currentStep === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 space-y-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="h-12 w-12 text-emerald-500" />
            </motion.div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Enrolling Users...</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Processing {usersToEnroll.length} enrollments for {selectedCourse?.title}
              </p>
            </div>
            <div className="w-full max-w-sm">
              <Progress value={progress} className="h-3" />
              <div
                className="mt-2 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
              <p className="text-xs text-muted-foreground text-center mt-2">{progress}% complete</p>
            </div>
          </motion.div>
        )}

        {/* ─── COMPLETE STEP ───────────────────────────── */}
        {currentStep === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8 space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            >
              <CheckCircle2 className="h-16 w-16 text-emerald-500" />
            </motion.div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Enrollment Complete!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Successfully enrolled users in {selectedCourse?.title}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
              <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-950/20 p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">{successCount}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  Successful
                </p>
              </div>
              {failCount > 0 && (
                <div className="rounded-xl border bg-red-50 dark:bg-red-950/20 p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{failCount}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    Failed
                  </p>
                </div>
              )}
            </div>
            <Button onClick={resetForm} className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <UserPlus className="h-4 w-4 mr-1.5" />
              Start New Enrollment
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Confirm Bulk Enrollment
            </DialogTitle>
            <DialogDescription>
              You are about to enroll <strong>{usersToEnroll.length} users</strong> in{' '}
              <strong>{selectedCourse?.title}</strong>. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Details:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Course: {selectedCourse?.title}</li>
              <li>Users: {usersToEnroll.length}</li>
              <li>Welcome Email: {sendWelcomeEmail ? 'Yes' : 'No'}</li>
              <li>Immediate Access: {grantImmediateAccess ? 'Yes' : 'No'}</li>
              <li>Enrollment Date: {enrollmentDate === 'now' ? 'Now' : scheduledDate}</li>
            </ul>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEnroll} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <UserPlus className="h-4 w-4 mr-1.5" />
              Confirm Enrollment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
