'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Edit3, Trash2, Eye, Download, Ban,
  Award, FileText, Image as ImageIcon, Calendar, QrCode, PenTool,
  Type, Settings2, Save, X, CheckCircle2,
  ChevronLeft, GripVertical, Sparkles, Shield, Layout,
  Clock, BookOpen, Share2, Check,
  ZoomIn, ZoomOut, RotateCcw, TrendingUp, TrendingDown,
  BarChart3, Star, Droplets,
  Send, FileDown, AlertTriangle, ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
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
import type { Certificate, CertificateAward } from '@/types';

// ---- Extended Types ----
interface CertTemplate extends Certificate {
  elements: CertElement[];
  bg_color: string;
  font_family: string;
  width: number;
  height: number;
  borderStyle?: string;
  sealType?: string;
  hasWatermark?: boolean;
  backgroundTemplate?: string;
}

interface CertElement {
  id: string;
  type: 'text' | 'image' | 'date' | 'qr_code' | 'signature_line';
  label: string;
  x: number;
  y: number;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  value: string;
  fontFamily?: string;
  size?: 'S' | 'M' | 'L' | 'XL';
  align?: 'left' | 'center' | 'right';
}

type VerificationStatus = 'verified' | 'pending' | 'revoked';

interface IssuedCert extends CertificateAward {
  recipientName: string;
  courseName: string;
  certName: string;
  status: VerificationStatus;
}

// ---- Constants ----
const FONT_FAMILIES = [
  { value: 'Georgia, serif', label: 'Serif (Georgia)' },
  { value: 'system-ui, sans-serif', label: 'Sans-serif (System)' },
  { value: "'Brush Script MT', 'Segoe Script', cursive", label: 'Script (Brush)' },
  { value: "'Courier New', monospace", label: 'Monospace (Courier)' },
];

const ELEMENT_SIZES: Record<string, number> = { S: 0.5, M: 0.65, L: 0.85, XL: 1.1 };
const ALIGN_OPTIONS = ['left', 'center', 'right'] as const;

const BORDER_STYLES = [
  { value: 'classic', label: 'Classic Double' },
  { value: 'elegant', label: 'Elegant Filigree' },
  { value: 'modern', label: 'Modern Minimal' },
  { value: 'ornate', label: 'Ornate Baroque' },
  { value: 'simple', label: 'Simple Line' },
];

const SEAL_TYPES = [
  { value: 'gold', label: 'Gold Seal', color: '#d4a017' },
  { value: 'silver', label: 'Silver Seal', color: '#a8a9ad' },
  { value: 'bronze', label: 'Bronze Seal', color: '#cd7f32' },
  { value: 'custom', label: 'Custom Seal', color: '#7c3aed' },
];

const BG_TEMPLATES = [
  { value: 'classic', label: 'Classic', bg: 'linear-gradient(135deg, #fefefe 0%, #fafbfc 50%, #f1f5f9 100%)' },
  { value: 'modern', label: 'Modern', bg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)' },
  { value: 'elegant', label: 'Elegant', bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)' },
  { value: 'minimal', label: 'Minimal', bg: 'linear-gradient(135deg, #ffffff 0%, #fafafa 50%, #f5f5f5 100%)' },
  { value: 'bold', label: 'Bold', bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' },
];

const TEMPLATE_LIBRARY = [
  {
    id: 'tpl-academic',
    name: 'Academic Excellence',
    category: 'Academic',
    description: 'Traditional academic certificate with formal styling and classic borders',
    bgTemplate: 'classic',
    borderStyle: 'classic',
    sealType: 'gold',
    fontFamily: 'Georgia, serif',
  },
  {
    id: 'tpl-professional',
    name: 'Professional Certification',
    category: 'Professional',
    description: 'Sleek professional design for industry certifications and credentials',
    bgTemplate: 'modern',
    borderStyle: 'modern',
    sealType: 'silver',
    fontFamily: 'system-ui, sans-serif',
  },
  {
    id: 'tpl-completion',
    name: 'Course Completion',
    category: 'Completion',
    description: 'Warm and inviting design for course completion acknowledgments',
    bgTemplate: 'elegant',
    borderStyle: 'elegant',
    sealType: 'bronze',
    fontFamily: 'Georgia, serif',
  },
  {
    id: 'tpl-achievement',
    name: 'Outstanding Achievement',
    category: 'Achievement',
    description: 'Bold design celebrating exceptional accomplishments',
    bgTemplate: 'bold',
    borderStyle: 'ornate',
    sealType: 'gold',
    fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
  },
  {
    id: 'tpl-participation',
    name: 'Participation Award',
    category: 'Participation',
    description: 'Clean and modern design for participation and attendance',
    bgTemplate: 'minimal',
    borderStyle: 'simple',
    sealType: 'silver',
    fontFamily: 'system-ui, sans-serif',
  },
  {
    id: 'tpl-excellence',
    name: 'Excellence Award',
    category: 'Excellence',
    description: 'Premium design for top-tier excellence recognition',
    bgTemplate: 'elegant',
    borderStyle: 'ornate',
    sealType: 'gold',
    fontFamily: 'Georgia, serif',
  },
];

// ---- Mock Data ----
const defaultElements: CertElement[] = [
  { id: 'el-1', type: 'text', label: 'Header', x: 50, y: 10, fontSize: 28, fontWeight: 'bold', color: '#1e293b', value: 'Certificate of Completion', fontFamily: 'Georgia, serif', size: 'XL', align: 'center' },
  { id: 'el-2', type: 'text', label: 'Subheader', x: 50, y: 22, fontSize: 14, fontWeight: 'normal', color: '#64748b', value: 'This is to certify that', fontFamily: 'system-ui, sans-serif', size: 'M', align: 'center' },
  { id: 'el-3', type: 'text', label: 'Recipient Name', x: 50, y: 35, fontSize: 24, fontWeight: 'bold', color: '#059669', value: '{{recipient_name}}', fontFamily: 'Georgia, serif', size: 'L', align: 'center' },
  { id: 'el-4', type: 'text', label: 'Course Label', x: 50, y: 48, fontSize: 12, fontWeight: 'normal', color: '#64748b', value: 'has successfully completed the course', fontFamily: 'system-ui, sans-serif', size: 'S', align: 'center' },
  { id: 'el-5', type: 'text', label: 'Course Name', x: 50, y: 58, fontSize: 20, fontWeight: 'bold', color: '#7c3aed', value: '{{course_name}}', fontFamily: 'system-ui, sans-serif', size: 'L', align: 'center' },
  { id: 'el-6', type: 'date', label: 'Issue Date', x: 30, y: 75, fontSize: 12, fontWeight: 'normal', color: '#475569', value: '{{issue_date}}', fontFamily: 'system-ui, sans-serif', size: 'S', align: 'left' },
  { id: 'el-7', type: 'text', label: 'Verification', x: 70, y: 75, fontSize: 10, fontWeight: 'normal', color: '#94a3b8', value: 'Verification: {{verification_code}}', fontFamily: "'Courier New', monospace", size: 'S', align: 'right' },
  { id: 'el-8', type: 'signature_line', label: 'Signature Line', x: 70, y: 85, fontSize: 12, fontWeight: 'normal', color: '#475569', value: 'Instructor Signature', fontFamily: 'system-ui, sans-serif', size: 'S', align: 'center' },
  { id: 'el-9', type: 'qr_code', label: 'QR Code', x: 88, y: 72, fontSize: 12, fontWeight: 'normal', color: '#000', value: 'QR Verification', fontFamily: 'system-ui, sans-serif', size: 'S', align: 'center' },
  { id: 'el-10', type: 'image', label: 'Tenant Logo', x: 50, y: 5, fontSize: 12, fontWeight: 'normal', color: '#000', value: 'NextGen LMS', fontFamily: 'system-ui, sans-serif', size: 'S', align: 'center' },
];

const demoTemplates: CertTemplate[] = [
  {
    id: 'cert-tpl-1',
    tenantId: 'demo-tenant-1',
    name: 'Classic Completion Certificate',
    template: 'classic',
    backgroundUrl: '',
    isActive: true,
    bg_color: '#fefefe',
    font_family: 'Georgia, serif',
    width: 800,
    height: 600,
    borderStyle: 'classic',
    sealType: 'gold',
    hasWatermark: false,
    backgroundTemplate: 'classic',
    elements: defaultElements,
  },
  {
    id: 'cert-tpl-2',
    tenantId: 'demo-tenant-1',
    name: 'Modern Achievement Award',
    template: 'modern',
    backgroundUrl: '',
    isActive: true,
    bg_color: '#f8fafc',
    font_family: 'system-ui, sans-serif',
    width: 800,
    height: 600,
    borderStyle: 'modern',
    sealType: 'silver',
    hasWatermark: false,
    backgroundTemplate: 'modern',
    elements: defaultElements.map(el => ({
      ...el,
      color: el.type === 'text' && el.label === 'Header' ? '#7c3aed' : el.color,
      value: el.label === 'Header' ? 'Achievement Award' : el.value,
    })),
  },
  {
    id: 'cert-tpl-3',
    tenantId: 'demo-tenant-1',
    name: 'Professional Certification',
    template: 'professional',
    backgroundUrl: '',
    isActive: false,
    bg_color: '#0f172a',
    font_family: 'system-ui, sans-serif',
    width: 800,
    height: 600,
    borderStyle: 'ornate',
    sealType: 'gold',
    hasWatermark: true,
    backgroundTemplate: 'bold',
    elements: defaultElements.map(el => ({
      ...el,
      color: el.label === 'Header' ? '#f8fafc' :
             el.label === 'Recipient Name' ? '#10b981' :
             el.label === 'Course Name' ? '#a78bfa' :
             el.color?.startsWith('#64748b') ? '#94a3b8' :
             el.color?.startsWith('#475569') ? '#94a3b8' :
             el.color,
      value: el.label === 'Header' ? 'Professional Certification' : el.value,
    })),
  },
];

const demoIssuedCerts: IssuedCert[] = [
  {
    id: 'award-1', userId: 'user-2', certificateId: 'cert-tpl-1', tenantId: 'demo-tenant-1', courseId: 'course-1',
    verificationCode: 'NG-LMS-2024-A1B2C3', issuedAt: '2024-09-15T00:00:00Z',
    recipientName: 'Emma Rodriguez', courseName: 'Advanced React & Next.js Masterclass', certName: 'Classic Completion Certificate',
    status: 'verified',
  },
  {
    id: 'award-2', userId: 'user-3', certificateId: 'cert-tpl-1', tenantId: 'demo-tenant-1', courseId: 'course-2',
    verificationCode: 'NG-LMS-2024-D4E5F6', issuedAt: '2024-09-20T00:00:00Z',
    recipientName: 'David Park', courseName: 'AI-Powered Full Stack Development', certName: 'Classic Completion Certificate',
    status: 'verified',
  },
  {
    id: 'award-3', userId: 'user-5', certificateId: 'cert-tpl-2', tenantId: 'demo-tenant-1', courseId: 'course-4',
    verificationCode: 'NG-LMS-2024-G7H8I9', issuedAt: '2024-10-01T00:00:00Z',
    recipientName: 'Lisa Wang', courseName: 'Data Visualization & Analytics', certName: 'Modern Achievement Award',
    status: 'pending',
  },
  {
    id: 'award-4', userId: 'user-6', certificateId: 'cert-tpl-1', tenantId: 'demo-tenant-1', courseId: 'course-1',
    verificationCode: 'NG-LMS-2024-J0K1L2', issuedAt: '2024-10-05T00:00:00Z',
    recipientName: 'Alex Johnson', courseName: 'Advanced React & Next.js Masterclass', certName: 'Classic Completion Certificate',
    status: 'verified',
  },
  {
    id: 'award-5', userId: 'user-7', certificateId: 'cert-tpl-2', tenantId: 'demo-tenant-1', courseId: 'course-3',
    verificationCode: 'NG-LMS-2024-M3N4O5', issuedAt: '2024-10-10T00:00:00Z',
    recipientName: 'Jordan Lee', courseName: 'System Design for Senior Engineers', certName: 'Modern Achievement Award',
    status: 'revoked',
  },
  {
    id: 'award-6', userId: 'user-8', certificateId: 'cert-tpl-1', tenantId: 'demo-tenant-1', courseId: 'course-5',
    verificationCode: 'NG-LMS-2024-P6Q7R8', issuedAt: '2024-10-12T00:00:00Z',
    recipientName: 'Priya Sharma', courseName: 'UX/UI Design Principles', certName: 'Classic Completion Certificate',
    status: 'verified',
  },
  {
    id: 'award-7', userId: 'user-9', certificateId: 'cert-tpl-3', tenantId: 'demo-tenant-1', courseId: 'course-2',
    verificationCode: 'NG-LMS-2024-S9T0U1', issuedAt: '2024-11-01T00:00:00Z',
    recipientName: 'Marcus Chen', courseName: 'AI-Powered Full Stack Development', certName: 'Professional Certification',
    status: 'pending',
  },
  {
    id: 'award-8', userId: 'user-10', certificateId: 'cert-tpl-2', tenantId: 'demo-tenant-1', courseId: 'course-4',
    verificationCode: 'NG-LMS-2024-V2W3X4', issuedAt: '2024-11-15T00:00:00Z',
    recipientName: 'Sofia Anderson', courseName: 'Data Visualization & Analytics', certName: 'Modern Achievement Award',
    status: 'verified',
  },
];

const MONTHLY_ISSUANCE = [
  { month: 'Jun', count: 2 },
  { month: 'Jul', count: 4 },
  { month: 'Aug', count: 3 },
  { month: 'Sep', count: 5 },
  { month: 'Oct', count: 4 },
  { month: 'Nov', count: 6 },
  { month: 'Dec', count: 8 },
];

// ---- Helper: Element Icon ----
function ElementIcon({ type }: { type: CertElement['type'] }) {
  switch (type) {
    case 'text': return <Type className="h-4 w-4" />;
    case 'image': return <ImageIcon className="h-4 w-4" />;
    case 'date': return <Calendar className="h-4 w-4" />;
    case 'qr_code': return <QrCode className="h-4 w-4" />;
    case 'signature_line': return <PenTool className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
}

// ---- Helper: Animated Counter ----
function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    prevTarget.current = target;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count}</span>;
}

// ---- Helper: Certificate Border Renderer ----
function CertificateBorder({ style, isDark }: { style: string; isDark: boolean }) {
  const c = isDark ? '#475569' : '#c7d2da';
  const c2 = isDark ? '#334155' : '#d4dce4';
  const c3 = isDark ? '#64748b' : '#94a3b8';

  switch (style) {
    case 'classic':
      return (
        <>
          <div className="absolute inset-3 border-2 rounded-sm" style={{ borderColor: c }}>
            <div className="absolute inset-1.5 border rounded-sm" style={{ borderColor: c2 }} />
          </div>
        </>
      );
    case 'elegant':
      return (
        <div className="absolute inset-3 border-2 rounded-lg" style={{ borderColor: c, borderStyle: 'double' }}>
          <div className="absolute inset-2 border rounded-md" style={{ borderColor: c3, borderStyle: 'dotted' }} />
        </div>
      );
    case 'modern':
      return (
        <>
          <div className="absolute top-3 left-3 right-3 h-0.5" style={{ background: `linear-gradient(to right, transparent, ${c}, transparent)` }} />
          <div className="absolute bottom-3 left-3 right-3 h-0.5" style={{ background: `linear-gradient(to right, transparent, ${c}, transparent)` }} />
          <div className="absolute left-3 top-3 bottom-3 w-0.5" style={{ background: `linear-gradient(to bottom, transparent, ${c}, transparent)` }} />
          <div className="absolute right-3 top-3 bottom-3 w-0.5" style={{ background: `linear-gradient(to bottom, transparent, ${c}, transparent)` }} />
        </>
      );
    case 'ornate':
      return (
        <>
          <div className="absolute inset-2 border-4 rounded-sm" style={{ borderColor: c }}>
            <div className="absolute inset-1.5 border-2 rounded-sm" style={{ borderColor: c2 }}>
              <div className="absolute inset-1 border rounded-sm" style={{ borderColor: c3 }} />
            </div>
          </div>
          {/* Corner ornaments */}
          {['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-5 h-5`}>
              <div className={`w-full h-full ${isDark ? 'text-amber-400/50' : 'text-amber-600/40'}`}>
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
          ))}
        </>
      );
    case 'simple':
    default:
      return (
        <div className="absolute inset-4 border rounded-sm" style={{ borderColor: c2 }} />
      );
  }
}

// ---- Helper: Seal Renderer ----
function SealRenderer({ type, isDark }: { type: string; isDark: boolean }) {
  const seal = SEAL_TYPES.find(s => s.value === type) || SEAL_TYPES[0];
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
        style={{
          background: `conic-gradient(from 0deg, ${seal.color}, ${seal.color}dd, ${seal.color}, ${seal.color}dd, ${seal.color})`,
          border: `2px solid ${seal.color}`,
        }}
      >
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-white/90'}`}>
          <Star className="h-5 w-5" style={{ color: seal.color }} />
        </div>
      </div>
      <span className="text-[6px] font-bold uppercase tracking-wider" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Certified</span>
    </div>
  );
}

// ==========================
// STATS DASHBOARD
// ==========================
function StatsDashboard() {
  const stats = [
    {
      label: 'Total Issued',
      value: demoIssuedCerts.length,
      icon: Award,
      trend: 12,
      trendLabel: 'vs last month',
      gradient: 'from-amber-500/10 to-amber-600/5',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'This Month',
      value: 3,
      icon: Calendar,
      trend: 8,
      trendLabel: 'vs last month',
      gradient: 'from-emerald-500/10 to-emerald-600/5',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Verification Rate',
      value: 87,
      icon: Shield,
      trend: 5,
      trendLabel: 'improvement',
      gradient: 'from-violet-500/10 to-violet-600/5',
      iconBg: 'bg-violet-100 dark:bg-violet-900/30',
      iconColor: 'text-violet-600 dark:text-violet-400',
      suffix: '%',
    },
    {
      label: 'Top Course',
      value: 0,
      icon: BookOpen,
      trend: 0,
      trendLabel: '',
      gradient: 'from-rose-500/10 to-rose-600/5',
      iconBg: 'bg-rose-100 dark:bg-rose-900/30',
      iconColor: 'text-rose-600 dark:text-rose-400',
      textValue: 'Advanced React',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
        >
          <Card className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} backdrop-blur-sm border-white/20 dark:border-white/10`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                {stat.trend !== 0 && (
                  <div className={`flex items-center gap-0.5 text-xs font-medium ${stat.trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {stat.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stat.trend > 0 ? '+' : ''}{stat.trend}%
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-foreground">
                {stat.textValue || <AnimatedCounter target={stat.value} />}
                {stat.suffix && <span className="text-lg">{stat.suffix}</span>}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              {stat.trendLabel && (
                <div className="text-[10px] text-muted-foreground/60 mt-0.5">{stat.trendLabel}</div>
              )}
            </CardContent>
            {/* Glassmorphism shine effect */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full" />
          </Card>
        </motion.div>
      ))}

      {/* Monthly trend chart card */}
      <motion.div
        className="col-span-2 lg:col-span-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-600/5 backdrop-blur-sm border-white/20 dark:border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Monthly Issuance Trend</h3>
                <p className="text-xs text-muted-foreground">Certificates issued per month</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" /> +33% growth
              </div>
            </div>
            <div className="flex items-end gap-2 h-20">
              {MONTHLY_ISSUANCE.map((d, i) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    className="w-full rounded-t-md bg-gradient-to-t from-amber-500 to-amber-300 dark:from-amber-600 dark:to-amber-400"
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.count / 8) * 100}%` }}
                    transition={{ delay: 0.6 + i * 0.08, duration: 0.5 }}
                    style={{ minHeight: '4px' }}
                  />
                  <span className="text-[9px] text-muted-foreground">{d.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ==========================
// TEMPLATE LIBRARY
// ==========================
function TemplateLibrary({ onUseTemplate }: { onUseTemplate: (arg: typeof TEMPLATE_LIBRARY[number]) => void }) {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const categoryColors: Record<string, string> = {
    Academic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Professional: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    Completion: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Achievement: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Participation: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    Excellence: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };

  const previewTemplate = TEMPLATE_LIBRARY.find(t => t.id === previewId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Template Library</h2>
        <p className="text-muted-foreground text-sm mt-1">Browse and use professionally designed certificate templates</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATE_LIBRARY.map((tpl, idx) => (
          <motion.div
            key={tpl.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className="overflow-hidden group h-full flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 border-white/30 dark:border-white/10">
              {/* Thumbnail preview */}
              <div
                className="h-40 relative overflow-hidden cursor-pointer"
                style={{ background: BG_TEMPLATES.find(b => b.value === tpl.bgTemplate)?.bg }}
                onClick={() => setPreviewId(tpl.id)}
              >
                <CertificateBorder style={tpl.borderStyle} isDark={tpl.bgTemplate === 'bold'} />
                {/* Mini certificate content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none">
                  <Award className={`h-5 w-5 mb-1 ${tpl.bgTemplate === 'bold' ? 'text-amber-400' : 'text-amber-600'}`} />
                  <div className={`text-[10px] font-bold mb-0.5 ${tpl.bgTemplate === 'bold' ? 'text-slate-100' : 'text-slate-800'}`} style={{ fontFamily: tpl.fontFamily }}>
                    {tpl.name}
                  </div>
                  <div className={`text-[8px] font-semibold ${tpl.bgTemplate === 'bold' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    Jane Doe
                  </div>
                  <div className={`text-[7px] mt-0.5 ${tpl.bgTemplate === 'bold' ? 'text-violet-400' : 'text-violet-600'}`}>
                    Course Name
                  </div>
                </div>
                {/* Seal */}
                <div className="absolute bottom-2 right-2 pointer-events-none">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: SEAL_TYPES.find(s => s.value === tpl.sealType)?.color }}>
                    <Star className="h-3 w-3 text-white" />
                  </div>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="h-8 w-8 text-white drop-shadow-lg" />
                  </motion.div>
                </div>
              </div>

              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`text-[10px] ${categoryColors[tpl.category] || ''}`}>{tpl.category}</Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{tpl.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 flex-1">{tpl.description}</p>
                <div className="flex items-center gap-2 mt-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1"
                    onClick={() => setPreviewId(tpl.id)}
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                    onClick={() => setConfirmId(tpl.id)}
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Use
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewId} onOpenChange={() => setPreviewId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" /> {previewTemplate?.name}
            </DialogTitle>
            <DialogDescription>{previewTemplate?.description}</DialogDescription>
          </DialogHeader>
          <div
            className="relative rounded-lg overflow-hidden shadow-2xl"
            style={{
              aspectRatio: '800/600',
              background: BG_TEMPLATES.find(b => b.value === previewTemplate?.bgTemplate)?.bg,
            }}
          >
            <CertificateBorder style={previewTemplate?.borderStyle || 'classic'} isDark={previewTemplate?.bgTemplate === 'bold'} />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <Award className={`h-8 w-8 mb-2 ${previewTemplate?.bgTemplate === 'bold' ? 'text-amber-400' : 'text-amber-600'}`} />
              <div className={`text-lg font-bold mb-1 ${previewTemplate?.bgTemplate === 'bold' ? 'text-slate-100' : 'text-slate-800'}`} style={{ fontFamily: previewTemplate?.fontFamily }}>
                {previewTemplate?.name}
              </div>
              <div className={`text-sm mb-0.5 ${previewTemplate?.bgTemplate === 'bold' ? 'text-slate-300' : 'text-slate-500'}`}>This is to certify that</div>
              <div className={`text-xl font-bold ${previewTemplate?.bgTemplate === 'bold' ? 'text-emerald-400' : 'text-emerald-600'}`}>Jane Doe</div>
              <div className={`text-sm mt-1 ${previewTemplate?.bgTemplate === 'bold' ? 'text-slate-300' : 'text-slate-500'}`}>has successfully completed</div>
              <div className={`text-base font-semibold mt-0.5 ${previewTemplate?.bgTemplate === 'bold' ? 'text-violet-400' : 'text-violet-600'}`}>Advanced Course Title</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewId(null)}>Close</Button>
            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white gap-2" onClick={() => {
              if (previewTemplate) onUseTemplate(previewTemplate);
              setPreviewId(null);
            }}>
              <Sparkles className="h-4 w-4" /> Use This Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Use Dialog */}
      <Dialog open={!!confirmId} onOpenChange={() => setConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Use Template</DialogTitle>
            <DialogDescription>
              This will create a new certificate template based on &ldquo;{TEMPLATE_LIBRARY.find(t => t.id === confirmId)?.name}&rdquo;. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmId(null)}>Cancel</Button>
            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white gap-2" onClick={() => {
              const tpl = TEMPLATE_LIBRARY.find(t => t.id === confirmId);
              if (tpl) onUseTemplate(tpl);
              setConfirmId(null);
            }}>
              <CheckCircle2 className="h-4 w-4" /> Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==========================
// CERTIFICATE TEMPLATES LIST
// ==========================
function TemplatesList({
  templates,
  onEdit,
  onCreateNew,
}: {
  templates: CertTemplate[];
  onEdit: (arg: CertTemplate) => void;
  onCreateNew: () => void;
}) {
  const [search, setSearch] = useState('');

  const filtered = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Certificate Templates</h2>
          <p className="text-muted-foreground text-sm mt-1">Design and manage certificate templates for your courses</p>
        </div>
        <Button onClick={onCreateNew} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white gap-2 shadow-md">
          <Plus className="h-4 w-4" /> Create Template
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((template, idx) => {
          const isDark = template.bg_color === '#0f172a' || template.backgroundTemplate === 'bold';
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 h-full flex flex-col shadow-sm border-white/30 dark:border-white/10">
                {/* Certificate preview thumbnail */}
                <div
                  className="h-48 relative overflow-hidden cursor-pointer"
                  style={{
                    background: BG_TEMPLATES.find(b => b.value === template.backgroundTemplate)?.bg ||
                      (template.bg_color === '#0f172a'
                        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                        : template.bg_color === '#fefefe'
                        ? 'linear-gradient(135deg, #fefefe 0%, #f1f5f9 100%)'
                        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'),
                  }}
                >
                  <CertificateBorder style={template.borderStyle || 'classic'} isDark={isDark} />

                  {/* Preview text overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <div className="mb-1 opacity-70">
                      <Award className={`h-6 w-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                    </div>
                    <div className={`text-xs font-bold mb-0.5 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}
                      style={{ fontFamily: template.font_family }}>
                      {template.elements.find(e => e.label === 'Header')?.value ?? 'Certificate'}
                    </div>
                    <div className={`text-[8px] ${isDark ? 'text-emerald-400' : 'text-emerald-600'} font-semibold`}>
                      John Doe
                    </div>
                    <div className={`text-[7px] ${isDark ? 'text-violet-400' : 'text-violet-600'} font-medium mt-0.5`}>
                      Course Name
                    </div>
                  </div>

                  {/* Seal preview */}
                  {template.sealType && (
                    <div className="absolute bottom-2 right-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: SEAL_TYPES.find(s => s.value === template.sealType)?.color }}>
                        <Star className="h-2.5 w-2.5 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Watermark indicator */}
                  {template.hasWatermark && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[9px] gap-0.5">
                        <Droplets className="h-2.5 w-2.5" /> WM
                      </Badge>
                    </div>
                  )}

                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    {template.isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px]">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">Inactive</Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">{template.template}</Badge>
                    <span>{template.width}×{template.height}</span>
                    <span>{template.elements.length} elements</span>
                    {template.borderStyle && <span className="capitalize">{template.borderStyle}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => onEdit(template)}>
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => { /* sample download */ }}>
                            <Download className="h-3.5 w-3.5" /> Sample
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download Sample</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Preview</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================
// CERTIFICATE BUILDER (Visual Template Designer)
// ==========================
function CertificateBuilder({
  template,
  onBack,
  onSave,
}: {
  template: CertTemplate;
  onBack: () => void;
  onSave: (t: CertTemplate) => void;
}) {
  const [form, setForm] = useState<CertTemplate>({ ...template, elements: template.elements.map(e => ({ ...e })) });
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [zoom, setZoom] = useState(75);

  const updateField = useCallback(<K extends keyof CertTemplate>(key: K, value: CertTemplate[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateElement = (id: string, updates: Partial<CertElement>) => {
    setForm(prev => ({
      ...prev,
      elements: prev.elements.map(el => el.id === id ? { ...el, ...updates } : el),
    }));
  };

  const addElement = (type: CertElement['type']) => {
    const labels: Record<string, string> = { text: 'Text Block', image: 'Image', date: 'Date', qr_code: 'QR Code', signature_line: 'Signature Line' };
    const newEl: CertElement = {
      id: `el-${Date.now()}`,
      type,
      label: labels[type] ?? type,
      x: 50,
      y: 50,
      fontSize: 14,
      fontWeight: 'normal',
      color: '#1e293b',
      value: type === 'text' ? 'New Text' : type === 'date' ? '{{issue_date}}' : type === 'qr_code' ? 'QR Code' : type === 'signature_line' ? 'Signature' : 'Image',
      fontFamily: 'system-ui, sans-serif',
      size: 'M',
      align: 'center',
    };
    setForm(prev => ({ ...prev, elements: [...prev.elements, newEl] }));
    setSelectedElement(newEl.id);
  };

  const removeElement = (id: string) => {
    setForm(prev => ({ ...prev, elements: prev.elements.filter(el => el.id !== id) }));
    if (selectedElement === id) setSelectedElement(null);
  };

  const paletteItems: { type: CertElement['type']; icon: React.ReactNode; label: string }[] = [
    { type: 'text', icon: <Type className="h-4 w-4" />, label: 'Text' },
    { type: 'image', icon: <ImageIcon className="h-4 w-4" />, label: 'Image' },
    { type: 'date', icon: <Calendar className="h-4 w-4" />, label: 'Date' },
    { type: 'qr_code', icon: <QrCode className="h-4 w-4" />, label: 'QR Code' },
    { type: 'signature_line', icon: <PenTool className="h-4 w-4" />, label: 'Signature' },
  ];

  const selectedEl = form.elements.find(el => el.id === selectedElement);
  const isDark = form.bg_color === '#0f172a' || form.backgroundTemplate === 'bold';
  const zoomLevels = [50, 75, 100, 150];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Visual Template Designer</h2>
            <p className="text-sm text-muted-foreground">{form.name || 'New Template'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white gap-2 shadow-md" onClick={() => onSave(form)}>
            <Save className="h-4 w-4" /> Save Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ minHeight: '600px' }}>
        {/* Left panel: Settings + Element palette + Element list + Properties */}
        <div className="lg:col-span-3 space-y-3">
          {/* Template Settings */}
          <Card className="shadow-sm border-white/30 dark:border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-violet-600" /> Template Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Template Name</Label>
                <Input value={form.name} onChange={e => updateField('name', e.target.value)} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Background Template</Label>
                <Select value={form.backgroundTemplate || 'classic'} onValueChange={v => {
                  const bg = BG_TEMPLATES.find(b => b.value === v);
                  updateField('backgroundTemplate', v);
                  if (v === 'bold') updateField('bg_color', '#0f172a');
                  else if (v === 'elegant') updateField('bg_color', '#fef9e7');
                  else if (v === 'minimal') updateField('bg_color', '#ffffff');
                  else if (v === 'modern') updateField('bg_color', '#f8fafc');
                  else updateField('bg_color', '#fefefe');
                }}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BG_TEMPLATES.map(bg => (
                      <SelectItem key={bg.value} value={bg.value}>{bg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Base Font</Label>
                <Select value={form.font_family} onValueChange={v => updateField('font_family', v)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FONT_FAMILIES.map(f => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Border Style</Label>
                <Select value={form.borderStyle || 'classic'} onValueChange={v => updateField('borderStyle', v)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BORDER_STYLES.map(b => (
                      <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Seal / Badge</Label>
                <Select value={form.sealType || 'gold'} onValueChange={v => updateField('sealType', v)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SEAL_TYPES.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs flex items-center gap-1">
                  <Droplets className="h-3 w-3" /> Watermark
                </Label>
                <Switch checked={form.hasWatermark || false} onCheckedChange={v => updateField('hasWatermark', v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Active</Label>
                <Switch checked={form.isActive} onCheckedChange={v => updateField('isActive', v)} />
              </div>
            </CardContent>
          </Card>

          {/* Element palette */}
          <Card className="shadow-sm border-white/30 dark:border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layout className="h-4 w-4 text-emerald-600" /> Add Elements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {paletteItems.map(item => (
                  <Button
                    key={item.type}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 h-9 text-xs"
                    onClick={() => addElement(item.type)}
                  >
                    {item.icon} {item.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Element list */}
          <Card className="shadow-sm border-white/30 dark:border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Elements ({form.elements.length})</CardTitle>
            </CardHeader>
            <CardContent className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
              {form.elements.map(el => (
                <div
                  key={el.id}
                  onClick={() => setSelectedElement(el.id)}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer text-xs transition-colors ${
                    selectedElement === el.id
                      ? 'bg-gradient-to-r from-violet-100 to-amber-50 dark:from-violet-950/30 dark:to-amber-950/20 border border-violet-300 dark:border-violet-700'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
                  <ElementIcon type={el.type} />
                  <span className="flex-1 truncate">{el.label}</span>
                  <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0 text-red-500" onClick={e => { e.stopPropagation(); removeElement(el.id); }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Selected element properties */}
          {selectedEl && (
            <Card className="shadow-sm border-white/30 dark:border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-amber-600" /> Element Properties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Label</Label>
                  <Input value={selectedEl.label} onChange={e => updateElement(selectedEl.id, { label: e.target.value })} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Value</Label>
                  <Input value={selectedEl.value} onChange={e => updateElement(selectedEl.id, { value: e.target.value })} className="h-8 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Position X (%)</Label>
                    <Input type="number" min={0} max={100} value={selectedEl.x} onChange={e => updateElement(selectedEl.id, { x: Number(e.target.value) })} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Position Y (%)</Label>
                    <Input type="number" min={0} max={100} value={selectedEl.y} onChange={e => updateElement(selectedEl.id, { y: Number(e.target.value) })} className="h-8 text-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Font Family</Label>
                  <Select value={selectedEl.fontFamily || 'system-ui, sans-serif'} onValueChange={v => updateElement(selectedEl.id, { fontFamily: v })}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FONT_FAMILIES.map(f => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Size</Label>
                    <Select value={selectedEl.size || 'M'} onValueChange={v => updateElement(selectedEl.id, { size: v as CertElement['size'] })}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="S">Small</SelectItem>
                        <SelectItem value="M">Medium</SelectItem>
                        <SelectItem value="L">Large</SelectItem>
                        <SelectItem value="XL">Extra Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Weight</Label>
                    <Select value={selectedEl.fontWeight ?? 'normal'} onValueChange={v => updateElement(selectedEl.id, { fontWeight: v })}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Alignment</Label>
                  <div className="flex gap-1">
                    {ALIGN_OPTIONS.map(a => (
                      <Button
                        key={a}
                        variant={selectedEl.align === a ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1 h-7 text-xs capitalize"
                        onClick={() => updateElement(selectedEl.id, { align: a })}
                      >
                        {a === 'left' ? '←' : a === 'center' ? '↔' : '→'} {a}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Color</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={selectedEl.color ?? '#1e293b'} onChange={e => updateElement(selectedEl.id, { color: e.target.value })} className="h-8 w-8 rounded border cursor-pointer" />
                    <Input value={selectedEl.color ?? '#1e293b'} onChange={e => updateElement(selectedEl.id, { color: e.target.value })} className="h-8 text-sm flex-1" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Custom Font Size</Label>
                  <Input type="number" min={6} max={72} value={selectedEl.fontSize ?? 14} onChange={e => updateElement(selectedEl.id, { fontSize: Number(e.target.value) })} className="h-8 text-sm" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right panel: Certificate Preview with Zoom */}
        <div className="lg:col-span-9">
          <Card className="h-full shadow-sm border-white/30 dark:border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-600" /> Live Preview
                </CardTitle>
                <div className="flex items-center gap-2">
                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 bg-muted/50 rounded-md p-0.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.max(50, zoom - 25))}>
                      <ZoomOut className="h-3.5 w-3.5" />
                    </Button>
                    {zoomLevels.map(z => (
                      <Button
                        key={z}
                        variant={zoom === z ? 'default' : 'ghost'}
                        size="sm"
                        className={`h-7 text-xs px-2 ${zoom === z ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' : ''}`}
                        onClick={() => setZoom(z)}
                      >
                        {z}%
                      </Button>
                    ))}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.min(150, zoom + 25))}>
                      <ZoomIn className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Separator orientation="vertical" className="h-6" />
                  {/* Download Sample */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                          <Download className="h-3.5 w-3.5" /> Download Sample
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download a sample certificate</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-6 bg-slate-100/80 dark:bg-slate-900/50 rounded-b-lg min-h-[500px] overflow-auto">
              <div
                className="relative shadow-2xl rounded-lg overflow-hidden transition-transform duration-300"
                style={{
                  width: '100%',
                  maxWidth: `${form.width * (zoom / 100)}px`,
                  aspectRatio: `${form.width}/${form.height}`,
                  background: BG_TEMPLATES.find(b => b.value === form.backgroundTemplate)?.bg ||
                    (isDark
                      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
                      : form.bg_color === '#fefefe'
                      ? 'linear-gradient(135deg, #fefefe 0%, #fafbfc 50%, #f1f5f9 100%)'
                      : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'),
                  fontFamily: form.font_family,
                }}
              >
                {/* Border */}
                <CertificateBorder style={form.borderStyle || 'classic'} isDark={isDark} />

                {/* Decorative line at top */}
                <div className="absolute top-10 left-16 right-16 h-0.5" style={{
                  background: 'linear-gradient(to right, transparent, #7c3aed, #10b981, transparent)',
                  opacity: 0.5,
                }} />

                {/* Watermark */}
                {form.hasWatermark && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.04 }}>
                    <div className="text-[80px] font-bold text-foreground -rotate-45" style={{ fontFamily: form.font_family }}>
                      NEXTGEN LMS
                    </div>
                  </div>
                )}

                {/* Elements */}
                {form.elements.map(el => {
                  const isSelected = selectedElement === el.id;
                  const sizeMultiplier = ELEMENT_SIZES[el.size || 'M'];
                  return (
                    <div
                      key={el.id}
                      className={`absolute cursor-pointer transition-all ${isSelected ? 'ring-2 ring-amber-500 ring-offset-1 rounded' : 'hover:ring-1 hover:ring-amber-300 hover:rounded'}`}
                      style={{
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: `${(el.fontSize ?? 14) * sizeMultiplier * 0.65}px`,
                        fontWeight: el.fontWeight ?? 'normal',
                        color: el.color ?? '#1e293b',
                        textAlign: el.align || 'center',
                        maxWidth: '80%',
                        whiteSpace: el.type === 'text' ? 'pre-wrap' : 'nowrap',
                        fontFamily: el.fontFamily || form.font_family,
                      }}
                      onClick={() => setSelectedElement(el.id)}
                    >
                      {el.type === 'image' && (
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                            <Shield className={`h-6 w-6 ${isDark ? 'text-amber-400' : 'text-violet-600'}`} />
                          </div>
                          <span className="text-[8px]" style={{ color: isDark ? '#94a3b8' : '#94a3b8' }}>{el.value}</span>
                        </div>
                      )}
                      {el.type === 'qr_code' && (
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-10 h-10 rounded border ${isDark ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'} flex items-center justify-center`}>
                            <QrCode className={`h-7 w-7 ${isDark ? 'text-slate-300' : 'text-slate-700'}`} />
                          </div>
                          <span className="text-[7px]" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Verify</span>
                        </div>
                      )}
                      {el.type === 'signature_line' && (
                        <div className="flex flex-col items-center gap-1 min-w-[100px]">
                          <div className="w-20 h-0.5" style={{ backgroundColor: isDark ? '#475569' : '#94a3b8' }} />
                          <span className="text-[8px]" style={{ color: isDark ? '#64748b' : '#64748b' }}>{el.value}</span>
                        </div>
                      )}
                      {el.type === 'date' && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 opacity-50" style={{ color: el.color }} />
                          <span>{el.value.includes('{{') ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : el.value}</span>
                        </div>
                      )}
                      {el.type === 'text' && <span>{el.value.includes('{{recipient_name}}') ? 'Jane Doe' : el.value.includes('{{course_name}}') ? 'Advanced Course Title' : el.value.includes('{{verification_code}}') ? 'NG-LMS-2024-ABC123' : el.value.includes('{{issue_date}}') ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : el.value}</span>}
                    </div>
                  );
                })}

                {/* Seal */}
                {form.sealType && (
                  <div className="absolute bottom-8 left-8">
                    <SealRenderer type={form.sealType} isDark={isDark} />
                  </div>
                )}

                {/* Decorative line at bottom */}
                <div className="absolute bottom-10 left-16 right-16 h-0.5" style={{
                  background: 'linear-gradient(to right, transparent, #7c3aed, #10b981, transparent)',
                  opacity: 0.5,
                }} />

                {/* Corner ornaments */}
                {form.borderStyle === 'ornate' && ['top-6 left-6', 'top-6 right-6', 'bottom-6 left-6', 'bottom-6 right-6'].map((pos, i) => (
                  <div key={i} className={`absolute ${pos} w-4 h-4`}>
                    <Sparkles className={`h-3 w-3 ${isDark ? 'text-amber-400/40' : 'text-amber-600/30'}`} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ==========================
// ISSUED CERTIFICATES TABLE (Enhanced)
// ==========================
function IssuedCertificatesTable() {
  const [search, setSearch] = useState('');
  const [certs, setCerts] = useState(demoIssuedCerts);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [verifyDialogId, setVerifyDialogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('');

  const filtered = certs.filter(c => {
    const matchSearch = c.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      c.courseName.toLowerCase().includes(search.toLowerCase()) ||
      c.verificationCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchDate = !dateFilter || c.issuedAt.startsWith(dateFilter);
    return matchSearch && matchStatus && matchDate;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(c => c.id)));
    }
  };

  const handleBulkRevoke = () => {
    setCerts(prev => prev.map(c => selectedIds.has(c.id) ? { ...c, status: 'revoked' as VerificationStatus } : c));
    setSelectedIds(new Set());
  };

  const handleBulkResend = () => {
    // Simulate resend
    setSelectedIds(new Set());
  };

  const handleCopyLink = (code: string, id: string) => {
    const link = `https://lms.nextgen.dev/verify/${code}`;
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Recipient', 'Course', 'Certificate', 'Issued Date', 'Verification Code', 'Status'];
    const rows = filtered.map(c => [
      c.recipientName, c.courseName, c.certName,
      new Date(c.issuedAt).toLocaleDateString('en-US'),
      c.verificationCode, c.status,
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'certificates.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const verifyCert = certs.find(c => c.id === verifyDialogId);

  const statusColors: Record<VerificationStatus, string> = {
    verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    revoked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const rowBg: Record<VerificationStatus, string> = {
    verified: '',
    pending: 'bg-amber-50/40 dark:bg-amber-950/10',
    revoked: 'bg-red-50/40 dark:bg-red-950/10',
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Issued Certificates</h2>
          <p className="text-muted-foreground text-sm mt-1">Track and manage all issued certificates</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={handleExportCSV}>
            <FileDown className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by recipient, course, code..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
          </SelectContent>
        </Select>
        <Input type="month" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-40 h-9 text-sm" placeholder="Filter by date" />
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
        >
          <span className="text-sm font-medium text-amber-800 dark:text-amber-300">{selectedIds.size} selected</span>
          <Button size="sm" variant="outline" className="gap-1.5 h-8 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30" onClick={handleBulkRevoke}>
            <Ban className="h-3.5 w-3.5" /> Revoke Selected
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 h-8 text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/30" onClick={handleBulkResend}>
            <Send className="h-3.5 w-3.5" /> Resend Selected
          </Button>
        </motion.div>
      )}

      <Card className="shadow-sm border-white/30 dark:border-white/10 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedIds.size === filtered.length && filtered.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Certificate</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verification Code</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No certificates found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((cert, idx) => (
                    <motion.tr
                      key={cert.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`border-b transition-colors hover:bg-muted/50 ${rowBg[cert.status]}`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(cert.id)}
                          onCheckedChange={() => toggleSelect(cert.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {cert.recipientName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-sm">{cert.recipientName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">{cert.courseName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs gap-1">
                          <Award className="h-3 w-3" /> {cert.certName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] gap-0.5 ${statusColors[cert.status]}`}>
                          {cert.status === 'verified' && <CheckCircle2 className="h-3 w-3" />}
                          {cert.status === 'pending' && <Clock className="h-3 w-3" />}
                          {cert.status === 'revoked' && <AlertTriangle className="h-3 w-3" />}
                          {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{cert.verificationCode}</code>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setVerifyDialogId(cert.id)}>
                                  <Shield className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Verify</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyLink(cert.verificationCode, cert.id)}>
                                  {copiedId === cert.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{copiedId === cert.id ? 'Copied!' : 'Share / Copy Link'}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Download PDF</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {cert.status !== 'revoked' && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => {
                                    setCerts(prev => prev.map(c => c.id === cert.id ? { ...c, status: 'revoked' as VerificationStatus } : c));
                                  }}>
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Revoke</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {cert.status === 'revoked' && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500 hover:text-emerald-600" onClick={() => {
                                    setCerts(prev => prev.map(c => c.id === cert.id ? { ...c, status: 'verified' as VerificationStatus } : c));
                                  }}>
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Reactivate</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
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

      {/* Verify Dialog */}
      <Dialog open={!!verifyDialogId} onOpenChange={() => setVerifyDialogId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" /> Certificate Verification
            </DialogTitle>
            <DialogDescription>Verification details for this certificate</DialogDescription>
          </DialogHeader>
          {verifyCert && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${verifyCert.status === 'verified' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : verifyCert.status === 'pending' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {verifyCert.status === 'verified' ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : verifyCert.status === 'pending' ? <Clock className="h-5 w-5 text-amber-600" /> : <AlertTriangle className="h-5 w-5 text-red-600" />}
                  <span className="font-semibold capitalize">{verifyCert.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {verifyCert.status === 'verified' && 'This certificate has been verified and is authentic.'}
                  {verifyCert.status === 'pending' && 'This certificate is awaiting verification.'}
                  {verifyCert.status === 'revoked' && 'This certificate has been revoked and is no longer valid.'}
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recipient</span>
                  <span className="font-medium">{verifyCert.recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Course</span>
                  <span className="font-medium text-right max-w-[200px] truncate">{verifyCert.courseName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Certificate</span>
                  <span className="font-medium">{verifyCert.certName}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Code</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{verifyCert.verificationCode}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issued</span>
                  <span>{new Date(verifyCert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialogId(null)}>Close</Button>
            {verifyCert && (
              <Button className="gap-1.5" onClick={() => { handleCopyLink(verifyCert.verificationCode, verifyCert.id); setVerifyDialogId(null); }}>
                <ExternalLink className="h-4 w-4" /> Copy Verify Link
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==========================
// MAIN COMPONENT
// ==========================
export function AdminCertificates() {
  const [templates, setTemplates] = useState<CertTemplate[]>(demoTemplates);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingTemplate, setEditingTemplate] = useState<CertTemplate | null>(null);

  const handleEdit = (t: CertTemplate) => {
    setEditingTemplate({ ...t, elements: t.elements.map(e => ({ ...e })) });
    setActiveTab('builder');
  };

  const handleCreateNew = () => {
    const newTemplate: CertTemplate = {
      id: `cert-tpl-${Date.now()}`,
      tenantId: 'demo-tenant-1',
      name: '',
      template: 'custom',
      backgroundUrl: '',
      isActive: false,
      bg_color: '#fefefe',
      font_family: 'Georgia, serif',
      width: 800,
      height: 600,
      borderStyle: 'classic',
      sealType: 'gold',
      hasWatermark: false,
      backgroundTemplate: 'classic',
      elements: [...defaultElements],
    };
    setEditingTemplate(newTemplate);
    setActiveTab('builder');
  };

  const handleSave = (t: CertTemplate) => {
    const idx = templates.findIndex(x => x.id === t.id);
    if (idx >= 0) {
      const updated = [...templates];
      updated[idx] = t;
      setTemplates(updated);
    } else {
      setTemplates(prev => [...prev, t]);
    }
    setEditingTemplate(null);
    setActiveTab('templates');
  };

  const handleBackFromBuilder = () => {
    setEditingTemplate(null);
    setActiveTab('templates');
  };

  const handleUseLibraryTemplate = (tpl: typeof TEMPLATE_LIBRARY[number]) => {
    const newTemplate: CertTemplate = {
      id: `cert-tpl-${Date.now()}`,
      tenantId: 'demo-tenant-1',
      name: tpl.name,
      template: tpl.category.toLowerCase(),
      backgroundUrl: '',
      isActive: true,
      bg_color: tpl.bgTemplate === 'bold' ? '#0f172a' : tpl.bgTemplate === 'elegant' ? '#fef9e7' : tpl.bgTemplate === 'minimal' ? '#ffffff' : tpl.bgTemplate === 'modern' ? '#f8fafc' : '#fefefe',
      font_family: tpl.fontFamily,
      width: 800,
      height: 600,
      borderStyle: tpl.borderStyle,
      sealType: tpl.sealType,
      hasWatermark: false,
      backgroundTemplate: tpl.bgTemplate,
      elements: defaultElements.map(el => ({
        ...el,
        fontFamily: tpl.fontFamily,
        color: tpl.bgTemplate === 'bold'
          ? (el.label === 'Header' ? '#f8fafc' : el.label === 'Recipient Name' ? '#10b981' : el.label === 'Course Name' ? '#a78bfa' : el.color?.startsWith('#64748b') ? '#94a3b8' : el.color?.startsWith('#475569') ? '#94a3b8' : el.color)
          : el.color,
      })),
    };
    setEditingTemplate(newTemplate);
    setActiveTab('builder');
  };

  return (
    <div className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard" className="gap-1.5">
            <BarChart3 className="h-4 w-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5">
            <Award className="h-4 w-4" /> Templates
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-1.5">
            <Sparkles className="h-4 w-4" /> Library
          </TabsTrigger>
          <TabsTrigger value="builder" className="gap-1.5" disabled={!editingTemplate}>
            <Layout className="h-4 w-4" /> Designer
          </TabsTrigger>
          <TabsTrigger value="issued" className="gap-1.5">
            <FileText className="h-4 w-4" /> Issued
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {activeTab === 'dashboard' && <StatsDashboard />}
            {activeTab === 'templates' && (
              <TemplatesList templates={templates} onEdit={handleEdit} onCreateNew={handleCreateNew} />
            )}
            {activeTab === 'library' && (
              <TemplateLibrary onUseTemplate={handleUseLibraryTemplate} />
            )}
            {activeTab === 'builder' && editingTemplate && (
              <CertificateBuilder template={editingTemplate} onBack={handleBackFromBuilder} onSave={handleSave} />
            )}
            {activeTab === 'issued' && (
              <IssuedCertificatesTable />
            )}
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
