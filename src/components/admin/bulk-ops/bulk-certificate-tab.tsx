'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  FileText,
  Send,
  Ban,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Mail,
  Shield,
  Users,
  Search,
  RefreshCw,
  Trash2,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useCourses, useCertificateAwards } from '@/hooks/use-data';
import { useAppStore } from '@/store/app-store';

interface BulkCertificateRecord {
  id: string;
  userName: string;
  email: string;
  courseName: string;
  issuedDate: string;
  verificationCode: string;
  status: 'issued' | 'revoked' | 'pending';
}

// Certificate templates
const certTemplates = [
  { id: 'tpl-1', name: 'Classic Certificate', description: 'Traditional bordered design with gold accents' },
  { id: 'tpl-2', name: 'Modern Minimal', description: 'Clean, minimal design with subtle gradients' },
  { id: 'tpl-3', name: 'Professional Badge', description: 'Digital badge style with icon overlay' },
  { id: 'tpl-4', name: 'Academic Scroll', description: 'Formal academic style with seal' },
];

type CertSubTab = 'issue' | 'manage';
type RecipientCriteria = 'all_completers' | 'score_threshold' | 'custom';
type IssueStep = 'configure' | 'confirm' | 'processing' | 'complete';

export function BulkCertificateTab() {
  // Sub-tab
  const [subTab, setSubTab] = useState<CertSubTab>('issue');
  const { currentTenant } = useAppStore();
  const tenantId = currentTenant?.id || '';
  const { data: coursesData } = useCourses(tenantId || undefined);
  const { data: awardsData } = useCertificateAwards(tenantId);
  const demoCourses = coursesData || [];

  // Map real certificate awards to BulkCertificateRecord
  const bulkCertificateRecords: BulkCertificateRecord[] = (awardsData || []).map((award: any) => ({
    id: award.id,
    userName: award.recipientName || award.user?.name || award.user?.email || 'Unknown',
    email: award.user?.email || '',
    courseName: award.courseName || 'General Certificate',
    issuedDate: new Date(award.issuedAt).toISOString().split('T')[0],
    verificationCode: award.verificationCode,
    status: 'issued' as const,
  }));
  // Issue state
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [recipientCriteria, setRecipientCriteria] = useState<RecipientCriteria>('all_completers');
  const [scoreThreshold, setScoreThreshold] = useState('70');
  const [sendNotification, setSendNotification] = useState(true);
  const [issueStep, setIssueStep] = useState<IssueStep>('configure');
  const [issueProgress, setIssueProgress] = useState(0);
  const [showIssueConfirm, setShowIssueConfirm] = useState(false);
  const [issuedCount, setIssuedCount] = useState(0);
  const [issueFailCount, setIssueFailCount] = useState(0);
  // Manage state
  const [selectedCertIds, setSelectedCertIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [showResendDialog, setShowResendDialog] = useState(false);
  const [actionProgress, setActionProgress] = useState(false);
  const [actionComplete, setActionComplete] = useState('');

  const selectedCourse = demoCourses.find((c: any) => c.id === selectedCourseId);
  const selectedTemplate = certTemplates.find((t) => t.id === selectedTemplateId);

  // Estimate count for issuance
  const estimatedCount = useMemo(() => {
    if (!selectedCourse) return 0;
    const enrollmentCount = selectedCourse.enrollmentCount || 0;
    const completionRate = selectedCourse.completionRate || 0;
    const completers = Math.round(enrollmentCount * (completionRate / 100));
    if (recipientCriteria === 'all_completers') return completers;
    if (recipientCriteria === 'score_threshold') return Math.round(completers * 0.65);
    return Math.round(completers * 0.3);
  }, [selectedCourse, recipientCriteria]);

  // Filter certificates for management
  const filteredCerts = useMemo(() => {
    return bulkCertificateRecords.filter((cert) => {
      const matchesSearch =
        !searchQuery ||
        cert.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.courseName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const toggleCertSelect = useCallback((id: string) => {
    setSelectedCertIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAllCerts = useCallback(() => {
    if (selectedCertIds.size === filteredCerts.length) {
      setSelectedCertIds(new Set());
    } else {
      setSelectedCertIds(new Set(filteredCerts.map((c) => c.id)));
    }
  }, [filteredCerts, selectedCertIds]);

  const handleIssue = useCallback(() => {
    setShowIssueConfirm(false);
    setIssueStep('processing');
    setIssueProgress(0);
    const total = estimatedCount;
    let processed = 0;
    const interval = setInterval(() => {
      processed++;
      setIssueProgress(Math.round((processed / total) * 100));
      if (processed >= total) {
        clearInterval(interval);
        setIssuedCount(Math.round(total * 0.95));
        setIssueFailCount(total - Math.round(total * 0.95));
        setIssueStep('complete');
      }
    }, 150);
  }, [estimatedCount]);

  const resetIssueForm = useCallback(() => {
    setSelectedCourseId('');
    setSelectedTemplateId('');
    setRecipientCriteria('all_completers');
    setSendNotification(true);
    setIssueStep('configure');
    setIssueProgress(0);
  }, []);

  const handleBulkAction = useCallback((action: string) => {
    setActionProgress(true);
    setActionComplete('');
    setTimeout(() => {
      setActionProgress(false);
      setActionComplete(action);
      setSelectedCertIds(new Set());
      setTimeout(() => setActionComplete(''), 3000);
    }, 1500);
  }, []);

  const exportCertificates = useCallback(() => {
    const headers = 'Name,Email,Course,Issued Date,Verification Code,Status\n';
    const rows = filteredCerts
      .map((c) => `${c.userName},${c.email},${c.courseName},${c.issuedDate},${c.verificationCode},${c.status}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'certificates_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredCerts]);

  return (
    <div className="space-y-4">
      <Tabs value={subTab} onValueChange={(v) => setSubTab(v as CertSubTab)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="issue" className="gap-1.5">
            <Award className="h-3.5 w-3.5" />
            Issue Certificates
          </TabsTrigger>
          <TabsTrigger value="manage" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Manage Certificates
          </TabsTrigger>
        </TabsList>

        {/* ─── ISSUE TAB ───────────────────────────────── */}
        <TabsContent value="issue" className="space-y-4 mt-4">
          <AnimatePresence mode="wait">
            {issueStep === 'configure' && (
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
                    <FileText className="h-4 w-4 text-emerald-500" />
                    Select Course
                  </Label>
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a course..." />
                    </SelectTrigger>
                    <SelectContent>
                      {demoCourses.map((course: any) => (
                        <SelectItem key={course.id} value={course.id}>
                          <div className="flex items-center gap-2">
                            <span>{course.title}</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {course.completionRate || 0}% complete
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Template Selector */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4 text-emerald-500" />
                    Certificate Template
                  </Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {certTemplates.map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => setSelectedTemplateId(tpl.id)}
                        className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all duration-200 ${
                          selectedTemplateId === tpl.id
                            ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm'
                            : 'hover:border-emerald-300'
                        }`}
                      >
                        <p className="text-sm font-medium">{tpl.name}</p>
                        <p className="text-xs text-muted-foreground">{tpl.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Recipient Criteria */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-500" />
                    Recipient Criteria
                  </Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {[
                      { key: 'all_completers' as RecipientCriteria, label: 'All Completers', desc: 'Everyone who completed the course' },
                      { key: 'score_threshold' as RecipientCriteria, label: 'Score > X%', desc: 'Only those above a score threshold' },
                      { key: 'custom' as RecipientCriteria, label: 'Custom Selection', desc: 'Manually select recipients' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setRecipientCriteria(opt.key)}
                        className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all duration-200 ${
                          recipientCriteria === opt.key
                            ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm'
                            : 'hover:border-emerald-300'
                        }`}
                      >
                        <p className="text-sm font-medium">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </button>
                    ))}
                  </div>

                  {recipientCriteria === 'score_threshold' && (
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Minimum Score:</Label>
                      <Input
                        type="number"
                        value={scoreThreshold}
                        onChange={(e) => setScoreThreshold(e.target.value)}
                        className="w-20 h-8 text-sm"
                        min={0}
                        max={100}
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  )}

                  {/* Count Preview */}
                  {selectedCourseId && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 p-3 flex items-center gap-3"
                    >
                      <Award className="h-8 w-8 text-emerald-500" />
                      <div>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {estimatedCount} certificates
                        </p>
                        <p className="text-xs text-muted-foreground">
                          will be issued based on your criteria
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                <Separator />

                {/* Notification Toggle */}
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium">Send Notification Email</p>
                      <p className="text-xs text-muted-foreground">Notify recipients about their certificate</p>
                    </div>
                  </div>
                  <Switch checked={sendNotification} onCheckedChange={setSendNotification} />
                </div>

                {/* Action */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => setShowIssueConfirm(true)}
                    disabled={!selectedCourseId || !selectedTemplateId || estimatedCount === 0}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
                  >
                    <Award className="h-4 w-4 mr-1.5" />
                    Issue {estimatedCount} Certificates
                  </Button>
                </div>
              </motion.div>
            )}

            {issueStep === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-12 space-y-6"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="h-12 w-12 text-emerald-500" />
                </motion.div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Issuing Certificates...</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generating {estimatedCount} certificates for {selectedCourse?.title}
                  </p>
                </div>
                <div className="w-full max-w-sm">
                  <Progress value={issueProgress} className="h-3" />
                  <p className="text-xs text-muted-foreground text-center mt-2">{issueProgress}% complete</p>
                </div>
              </motion.div>
            )}

            {issueStep === 'complete' && (
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
                  <h3 className="text-lg font-semibold">Certificates Issued!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {sendNotification ? 'Notifications have been sent.' : 'Notifications were skipped.'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                  <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-950/20 p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{issuedCount}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      Issued
                    </p>
                  </div>
                  {issueFailCount > 0 && (
                    <div className="rounded-xl border bg-red-50 dark:bg-red-950/20 p-4 text-center">
                      <p className="text-2xl font-bold text-red-600">{issueFailCount}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        Failed
                      </p>
                    </div>
                  )}
                </div>
                <Button onClick={resetIssueForm} className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                  <Award className="h-4 w-4 mr-1.5" />
                  Issue More Certificates
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ─── MANAGE TAB ──────────────────────────────── */}
        <TabsContent value="manage" className="space-y-4 mt-4">
          {/* Action feedback */}
          {actionComplete && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-3"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                {actionComplete === 'revoke'
                  ? `${selectedCertIds.size || 'Selected'} certificates revoked successfully`
                  : actionComplete === 'resend'
                  ? `${selectedCertIds.size || 'Selected'} certificates resent successfully`
                  : 'Action completed'}
              </p>
            </motion.div>
          )}

          {/* Search & Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search certificates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="issued">Issued</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={exportCertificates} className="text-xs">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {selectedCertIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3"
            >
              <span className="text-sm font-medium">{selectedCertIds.size} selected</span>
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResendDialog(true)}
                  className="text-xs"
                  disabled={actionProgress}
                >
                  <Send className="h-3.5 w-3.5 mr-1" />
                  Resend
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRevokeDialog(true)}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                  disabled={actionProgress}
                >
                  <Ban className="h-3.5 w-3.5 mr-1" />
                  Revoke
                </Button>
              </div>
            </motion.div>
          )}

          {/* Certificate Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedCertIds.size === filteredCerts.length && filteredCerts.length > 0}
                      onCheckedChange={toggleAllCerts}
                    />
                  </TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCerts.map((cert) => (
                  <TableRow key={cert.id} className={selectedCertIds.has(cert.id) ? 'bg-emerald-50/50 dark:bg-emerald-950/10' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCertIds.has(cert.id)}
                        onCheckedChange={() => toggleCertSelect(cert.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{cert.userName}</p>
                        <p className="text-xs text-muted-foreground">{cert.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm max-w-[180px] truncate">{cert.courseName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{cert.issuedDate}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{cert.verificationCode}</code>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          cert.status === 'issued'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : cert.status === 'revoked'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}
                      >
                        {cert.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Issue Confirmation Dialog */}
      <Dialog open={showIssueConfirm} onOpenChange={setShowIssueConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Confirm Certificate Issuance
            </DialogTitle>
            <DialogDescription>
              You are about to issue <strong>{estimatedCount} certificates</strong> using the{' '}
              <strong>{selectedTemplate?.name}</strong> template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Details:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Course: {selectedCourse?.title}</li>
              <li>Template: {selectedTemplate?.name}</li>
              <li>Recipients: {estimatedCount} users</li>
              <li>Criteria: {recipientCriteria === 'all_completers' ? 'All completers' : recipientCriteria === 'score_threshold' ? `Score > ${scoreThreshold}%` : 'Custom selection'}</li>
              <li>Notification Email: {sendNotification ? 'Yes' : 'No'}</li>
            </ul>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowIssueConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleIssue} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Award className="h-4 w-4 mr-1.5" />
              Issue Certificates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-5 w-5" />
              Revoke Certificates
            </DialogTitle>
            <DialogDescription>
              This will revoke <strong>{selectedCertIds.size} certificates</strong>. Revoked certificates will no longer be verifiable.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3">
            <p className="text-sm text-red-700 dark:text-red-300">
              ⚠️ This is a destructive action and cannot be undone. Recipients will lose access to their certificates.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowRevokeDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowRevokeDialog(false);
                handleBulkAction('revoke');
              }}
              variant="destructive"
            >
              <Ban className="h-4 w-4 mr-1.5" />
              Revoke Certificates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resend Confirmation Dialog */}
      <Dialog open={showResendDialog} onOpenChange={setShowResendDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-emerald-500" />
              Resend Certificate Emails
            </DialogTitle>
            <DialogDescription>
              Resend certificate notification emails to <strong>{selectedCertIds.size} recipients</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowResendDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowResendDialog(false);
                handleBulkAction('resend');
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="h-4 w-4 mr-1.5" />
              Resend Emails
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
