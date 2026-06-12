'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const termsContent = `
## Terms of Service

**Last Updated: January 2025**

### 1. Acceptance of Terms

By accessing and using NextGen LMS ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.

### 2. Description of Service

NextGen LMS is a learning management platform that enables creators and organizations to create, manage, and sell online courses, run live cohorts, manage communities, and issue certificates. The Platform is provided as a Software-as-a-Service (SaaS) solution.

### 3. User Accounts

You must create an account to access certain features of the Platform. You are responsible for:

- Providing accurate and complete registration information
- Maintaining the security of your account credentials
- All activities that occur under your account
- Notifying us immediately of any unauthorized use

### 4. Acceptable Use

You agree not to:

- Use the Platform for any unlawful purpose
- Upload content that infringes on others' intellectual property
- Attempt to gain unauthorized access to other users' accounts or the Platform's systems
- Use automated scripts or bots to access the Platform without authorization
- Share your account credentials with third parties

### 5. Content Ownership

- You retain ownership of content you create and upload to the Platform
- By uploading content, you grant NextGen LMS a limited license to host, display, and distribute your content as part of the Platform's functionality
- You are responsible for ensuring you have the rights to any content you upload

### 6. Payment and Billing

- Paid plans are billed on a recurring basis (monthly or annually)
- Prices are subject to change with 30 days' notice
- Refunds are handled according to our refund policy
- Transaction fees may apply depending on your plan

### 7. Intellectual Property

- The Platform and its original content, features, and functionality are owned by NextGen LMS
- Our trademarks and trade dress may not be used without prior written permission
- Course creators retain ownership of their educational content

### 8. Termination

- We may terminate or suspend accounts that violate these Terms
- You may terminate your account at any time
- Upon termination, your right to use the Platform ceases immediately
- We will retain certain data as required by law or for legitimate business purposes

### 9. Limitation of Liability

The Platform is provided "as is" without warranties of any kind. We are not liable for:

- Any indirect, incidental, or consequential damages
- Loss of data, revenue, or profits
- Service interruptions or downtime
- Content posted by users

### 10. Changes to Terms

We reserve the right to modify these Terms at any time. Material changes will be communicated via email or Platform notification at least 30 days before they take effect.

### 11. Governing Law

These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles.

### 12. Contact

For questions about these Terms, please contact us at legal@nextgen-lms.com.
`;

const privacyContent = `
## Privacy Policy

**Last Updated: January 2025**

### 1. Information We Collect

We collect the following types of information:

**Personal Information:**
- Name, email address, and contact details when you create an account
- Payment information processed securely through our payment providers
- Profile information you choose to provide (bio, avatar, timezone)

**Usage Data:**
- Course progress, completion rates, and assessment scores
- Community interactions (posts, comments, reactions)
- Login frequency and session duration
- Device information and browser type

**Cookies and Tracking:**
- Essential cookies for authentication and security
- Analytics cookies to improve Platform performance
- You can manage cookie preferences in your browser settings

### 2. How We Use Your Information

We use your information to:

- Provide and improve our services
- Process transactions and send related notifications
- Personalize your learning experience
- Send important updates about our services
- Respond to your inquiries and support requests
- Monitor and analyze usage patterns to improve the Platform
- Detect and prevent fraud and abuse

### 3. Information Sharing

We do not sell your personal information. We may share information with:

- **Service Providers:** Companies that help us operate the Platform (hosting, payment processing, analytics)
- **Course Instructors:** Limited enrollment data necessary for course management
- **Legal Requirements:** When required by law or to protect our rights
- **Business Transfers:** In connection with a merger, acquisition, or sale of assets

### 4. Data Security

We implement industry-standard security measures including:

- Encryption of data in transit (TLS/SSL)
- Secure storage of payment information via PCI-compliant processors
- Regular security audits and penetration testing
- Access controls and authentication requirements
- Regular data backups

### 5. Your Rights

You have the right to:

- Access your personal data
- Correct inaccurate data
- Request deletion of your data
- Export your data in a standard format
- Opt out of marketing communications
- Restrict or object to certain processing activities

### 6. Data Retention

- Account data is retained while your account is active
- Course progress data is retained for the duration of enrollment plus 2 years
- Anonymized analytics data may be retained indefinitely
- Deleted data is removed from backups within 90 days

### 7. International Data Transfers

If you are located outside the United States, your data may be transferred to and processed in the United States. We ensure appropriate safeguards are in place for such transfers.

### 8. Children's Privacy

The Platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.

### 9. Changes to Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of material changes via email or Platform notification at least 30 days before they take effect.

### 10. Contact

For privacy-related inquiries or to exercise your data rights, contact us at privacy@nextgen-lms.com.
`;

function MarkdownContent({ content }: { content: string }) {
  // Simple markdown-like rendering
  const lines = content.trim().split('\n');
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <br key={i} />;
        if (trimmed.startsWith('## ')) return <h2 key={i} className="text-lg font-bold mt-4 mb-2">{trimmed.slice(3)}</h2>;
        if (trimmed.startsWith('### ')) return <h3 key={i} className="text-base font-semibold mt-3 mb-1">{trimmed.slice(4)}</h3>;
        if (trimmed.startsWith('- ')) return <li key={i} className="ml-4 text-sm">{trimmed.slice(2)}</li>;
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) return <p key={i} className="font-semibold text-sm mt-2">{trimmed.slice(2, -2)}</p>;
        return <p key={i} className="text-sm leading-relaxed">{trimmed}</p>;
      })}
    </div>
  );
}

export function LegalContentDialog({
  open,
  onOpenChange,
  type,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'terms' | 'privacy';
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{type === 'terms' ? 'Terms of Service' : 'Privacy Policy'}</DialogTitle>
          <DialogDescription>
            {type === 'terms'
              ? 'Please read our terms of service carefully.'
              : 'Learn how we collect, use, and protect your data.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <MarkdownContent content={type === 'terms' ? termsContent : privacyContent} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// A lightweight component for use in footer areas
export function LegalLinks() {
  const [openType, setOpenType] = useState<'terms' | 'privacy' | null>(null);

  return (
    <>
      <button
        onClick={() => setOpenType('privacy')}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        Privacy Policy
      </button>
      <button
        onClick={() => setOpenType('terms')}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        Terms of Service
      </button>
      <LegalContentDialog
        open={openType !== null}
        onOpenChange={(v) => { if (!v) setOpenType(null); }}
        type={openType || 'terms'}
      />
    </>
  );
}
