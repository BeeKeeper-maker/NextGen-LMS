'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Mail,
  Award,
  Zap,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BulkEnrollmentTab } from './bulk-enrollment-tab';
import { BulkEmailTab } from './bulk-email-tab';
import { BulkCertificateTab } from './bulk-certificate-tab';

interface BulkOperationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'enroll' | 'email' | 'certificates';
}

export function BulkOperationsDialog({ open, onOpenChange, defaultTab = 'enroll' }: BulkOperationsDialogProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Glassmorphism header */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-violet-500/10 dark:from-emerald-500/5 dark:to-violet-500/5" />
          <DialogHeader className="relative p-6 pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md">
                <Zap className="h-4 w-4" />
              </div>
              Bulk Operations
            </DialogTitle>
            <DialogDescription>
              Perform bulk enrollment, email, and certificate operations across your platform
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Tabs */}
        <div className="flex-1 overflow-hidden flex flex-col px-6 pb-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'enroll' | 'email' | 'certificates')} className="flex flex-col flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-3 shrink-0">
              <TabsTrigger value="enroll" className="gap-1.5 text-xs sm:text-sm">
                <UserPlus className="h-3.5 w-3.5" />
                Enroll
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-1.5 text-xs sm:text-sm">
                <Mail className="h-3.5 w-3.5" />
                Email
              </TabsTrigger>
              <TabsTrigger value="certificates" className="gap-1.5 text-xs sm:text-sm">
                <Award className="h-3.5 w-3.5" />
                Certificates
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4 pr-1">
              <TabsContent value="enroll" className="mt-0">
                <BulkEnrollmentTab />
              </TabsContent>
              <TabsContent value="email" className="mt-0">
                <BulkEmailTab />
              </TabsContent>
              <TabsContent value="certificates" className="mt-0">
                <BulkCertificateTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
