'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Edit3, Trash2, Eye, Download, Ban,
  Award, FileText, Image as ImageIcon, Calendar, QrCode, PenTool,
  Type, Palette, Settings2, Save, X, CheckCircle2,
  ChevronLeft, GripVertical, Sparkles, Shield, Layout,
  Clock, User, BookOpen, Hash,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { demoCourses } from '@/lib/mock-data';
import type { Certificate, CertificateAward } from '@/types';

// ---- Mock Certificate Templates ----
interface CertTemplate extends Certificate {
  elements: CertElement[];
  bg_color: string;
  font_family: string;
  width: number;
  height: number;
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
}

const defaultElements: CertElement[] = [
  { id: 'el-1', type: 'text', label: 'Header', x: 50, y: 10, fontSize: 28, fontWeight: 'bold', color: '#1e293b', value: 'Certificate of Completion' },
  { id: 'el-2', type: 'text', label: 'Subheader', x: 50, y: 22, fontSize: 14, fontWeight: 'normal', color: '#64748b', value: 'This is to certify that' },
  { id: 'el-3', type: 'text', label: 'Recipient Name', x: 50, y: 35, fontSize: 24, fontWeight: 'bold', color: '#059669', value: '{{recipient_name}}' },
  { id: 'el-4', type: 'text', label: 'Course Label', x: 50, y: 48, fontSize: 12, fontWeight: 'normal', color: '#64748b', value: 'has successfully completed the course' },
  { id: 'el-5', type: 'text', label: 'Course Name', x: 50, y: 58, fontSize: 20, fontWeight: 'bold', color: '#7c3aed', value: '{{course_name}}' },
  { id: 'el-6', type: 'date', label: 'Issue Date', x: 30, y: 75, fontSize: 12, fontWeight: 'normal', color: '#475569', value: '{{issue_date}}' },
  { id: 'el-7', type: 'text', label: 'Verification', x: 70, y: 75, fontSize: 10, fontWeight: 'normal', color: '#94a3b8', value: 'Verification: {{verification_code}}' },
  { id: 'el-8', type: 'signature_line', label: 'Signature Line', x: 70, y: 85, fontSize: 12, fontWeight: 'normal', color: '#475569', value: 'Instructor Signature' },
  { id: 'el-9', type: 'qr_code', label: 'QR Code', x: 88, y: 72, fontSize: 12, fontWeight: 'normal', color: '#000', value: 'QR Verification' },
  { id: 'el-10', type: 'image', label: 'Tenant Logo', x: 50, y: 5, fontSize: 12, fontWeight: 'normal', color: '#000', value: 'NextGen LMS' },
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

// ---- Mock Issued Certificates ----
const demoIssuedCerts: (CertificateAward & { recipientName: string; courseName: string; certName: string })[] = [
  {
    id: 'award-1', userId: 'user-2', certificateId: 'cert-tpl-1', tenantId: 'demo-tenant-1', courseId: 'course-1',
    verificationCode: 'NG-LMS-2024-A1B2C3', issuedAt: '2024-09-15T00:00:00Z',
    recipientName: 'Emma Rodriguez', courseName: 'Advanced React & Next.js Masterclass', certName: 'Classic Completion Certificate',
  },
  {
    id: 'award-2', userId: 'user-3', certificateId: 'cert-tpl-1', tenantId: 'demo-tenant-1', courseId: 'course-2',
    verificationCode: 'NG-LMS-2024-D4E5F6', issuedAt: '2024-09-20T00:00:00Z',
    recipientName: 'David Park', courseName: 'AI-Powered Full Stack Development', certName: 'Classic Completion Certificate',
  },
  {
    id: 'award-3', userId: 'user-5', certificateId: 'cert-tpl-2', tenantId: 'demo-tenant-1', courseId: 'course-4',
    verificationCode: 'NG-LMS-2024-G7H8I9', issuedAt: '2024-10-01T00:00:00Z',
    recipientName: 'Lisa Wang', courseName: 'Data Visualization & Analytics', certName: 'Modern Achievement Award',
  },
  {
    id: 'award-4', userId: 'user-6', certificateId: 'cert-tpl-1', tenantId: 'demo-tenant-1', courseId: 'course-1',
    verificationCode: 'NG-LMS-2024-J0K1L2', issuedAt: '2024-10-05T00:00:00Z',
    recipientName: 'Alex Johnson', courseName: 'Advanced React & Next.js Masterclass', certName: 'Classic Completion Certificate',
  },
  {
    id: 'award-5', userId: 'user-7', certificateId: 'cert-tpl-2', tenantId: 'demo-tenant-1', courseId: 'course-3',
    verificationCode: 'NG-LMS-2024-M3N4O5', issuedAt: '2024-10-10T00:00:00Z',
    recipientName: 'Jordan Lee', courseName: 'System Design for Senior Engineers', certName: 'Modern Achievement Award',
  },
  {
    id: 'award-6', userId: 'user-8', certificateId: 'cert-tpl-1', tenantId: 'demo-tenant-1', courseId: 'course-5',
    verificationCode: 'NG-LMS-2024-P6Q7R8', issuedAt: '2024-10-12T00:00:00Z',
    recipientName: 'Priya Sharma', courseName: 'UX/UI Design Principles', certName: 'Classic Completion Certificate',
  },
];

// ---- Element palette icon ----
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

// ==========================
// CERTIFICATE TEMPLATES LIST
// ==========================
function TemplatesList({
  templates,
  onEdit,
  onCreateNew,
}: {
  templates: CertTemplate[];
  onEdit: (t: CertTemplate) => void;
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
        <Button onClick={onCreateNew} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
          <Plus className="h-4 w-4" /> Create Template
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((template, idx) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <Card className="overflow-hidden group hover:shadow-lg transition-shadow h-full flex flex-col shadow-sm">
              {/* Certificate preview thumbnail */}
              <div
                className="h-48 relative overflow-hidden"
                style={{
                  background: template.bg_color === '#0f172a'
                    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                    : template.bg_color === '#fefefe'
                    ? 'linear-gradient(135deg, #fefefe 0%, #f1f5f9 100%)'
                    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                }}
              >
                {/* Decorative border */}
                <div className="absolute inset-3 border-2 border-dashed rounded-md" style={{
                  borderColor: template.bg_color === '#0f172a' ? '#334155' : '#cbd5e1',
                }}>
                  <div className="absolute inset-1 border rounded-sm" style={{
                    borderColor: template.bg_color === '#0f172a' ? '#475569' : '#e2e8f0',
                  }} />
                </div>
                {/* Preview text overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="mb-1 opacity-60">
                    <Award className={`h-6 w-6 ${template.bg_color === '#0f172a' ? 'text-amber-400' : 'text-violet-500'}`} />
                  </div>
                  <div className={`text-xs font-bold mb-0.5 ${template.bg_color === '#0f172a' ? 'text-slate-100' : 'text-slate-800'}`}
                    style={{ fontFamily: template.font_family }}>
                    {template.elements.find(e => e.label === 'Header')?.value ?? 'Certificate'}
                  </div>
                  <div className={`text-[8px] ${template.bg_color === '#0f172a' ? 'text-emerald-400' : 'text-emerald-600'} font-semibold`}>
                    John Doe
                  </div>
                  <div className={`text-[7px] ${template.bg_color === '#0f172a' ? 'text-violet-400' : 'text-violet-600'} font-medium mt-0.5`}>
                    Course Name
                  </div>
                </div>

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
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Badge variant="outline" className="text-[10px]">{template.template}</Badge>
                  <span>{template.width}×{template.height}</span>
                  <span>{template.elements.length} elements</span>
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
        ))}
      </div>
    </div>
  );
}

// ==========================
// CERTIFICATE BUILDER
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
  const [dragType, setDragType] = useState<CertElement['type'] | null>(null);

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
  const isDark = form.bg_color === '#0f172a';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Certificate Builder</h2>
            <p className="text-sm text-muted-foreground">{form.name || 'New Template'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={() => onSave(form)}>
            <Save className="h-4 w-4" /> Save Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ minHeight: '600px' }}>
        {/* Left panel: Element palette + element list */}
        <div className="lg:col-span-3 space-y-4">
          {/* Settings */}
          <Card className="shadow-sm">
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
                <Label className="text-xs">Background</Label>
                <Select value={form.bg_color} onValueChange={v => updateField('bg_color', v)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#fefefe">White (Classic)</SelectItem>
                    <SelectItem value="#f8fafc">Light Gray (Modern)</SelectItem>
                    <SelectItem value="#0f172a">Dark (Professional)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Font</Label>
                <Select value={form.font_family} onValueChange={v => updateField('font_family', v)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Georgia, serif">Georgia (Serif)</SelectItem>
                    <SelectItem value="system-ui, sans-serif">System UI (Sans)</SelectItem>
                    <SelectItem value="'Courier New', monospace">Courier (Mono)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Active</Label>
                <Switch checked={form.isActive} onCheckedChange={v => updateField('isActive', v)} />
              </div>
            </CardContent>
          </Card>

          {/* Element palette */}
          <Card>
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Elements ({form.elements.length})</CardTitle>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto space-y-1">
              {form.elements.map(el => (
                <div
                  key={el.id}
                  onClick={() => setSelectedElement(el.id)}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer text-xs transition-colors ${
                    selectedElement === el.id
                      ? 'bg-violet-100 dark:bg-violet-950/30 border border-violet-300 dark:border-violet-700'
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
            <Card>
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
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Font Size</Label>
                    <Input type="number" min={8} max={72} value={selectedEl.fontSize ?? 14} onChange={e => updateElement(selectedEl.id, { fontSize: Number(e.target.value) })} className="h-8 text-sm" />
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
                  <Label className="text-xs">Color</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={selectedEl.color ?? '#1e293b'} onChange={e => updateElement(selectedEl.id, { color: e.target.value })} className="h-8 w-8 rounded border cursor-pointer" />
                    <Input value={selectedEl.color ?? '#1e293b'} onChange={e => updateElement(selectedEl.id, { color: e.target.value })} className="h-8 text-sm flex-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right panel: Certificate Preview */}
        <div className="lg:col-span-9">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-600" /> Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-6 bg-slate-100 dark:bg-slate-900/50 rounded-b-lg min-h-[500px]">
              <div
                className="relative shadow-2xl rounded-lg overflow-hidden"
                style={{
                  width: '100%',
                  maxWidth: `${form.width}px`,
                  aspectRatio: `${form.width}/${form.height}`,
                  background: form.bg_color === '#0f172a'
                    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
                    : form.bg_color === '#fefefe'
                    ? 'linear-gradient(135deg, #fefefe 0%, #fafbfc 50%, #f1f5f9 100%)'
                    : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
                  fontFamily: form.font_family,
                }}
              >
                {/* Decorative border */}
                <div className="absolute inset-4 border-2 rounded-sm" style={{ borderColor: isDark ? '#334155' : '#c7d2da' }}>
                  <div className="absolute inset-1.5 border rounded-sm" style={{ borderColor: isDark ? '#475569' : '#d4dce4' }} />
                  {/* Corner ornaments */}
                  {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                    <div key={i} className={`absolute ${pos} w-6 h-6`}>
                      <div className={`w-full h-full ${isDark ? 'text-amber-500/40' : 'text-violet-400/50'}`}>
                        <Sparkles className="h-4 w-4 absolute" style={{ [pos.includes('left') ? 'left' : 'right']: '4px', [pos.includes('top') ? 'top' : 'bottom']: '4px' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Decorative line at top */}
                <div className="absolute top-10 left-16 right-16 h-0.5" style={{
                  background: isDark ? 'linear-gradient(to right, transparent, #7c3aed, #10b981, transparent)' : 'linear-gradient(to right, transparent, #7c3aed, #10b981, transparent)',
                  opacity: 0.5,
                }} />

                {/* Elements */}
                {form.elements.map(el => {
                  const isSelected = selectedElement === el.id;
                  return (
                    <div
                      key={el.id}
                      className={`absolute cursor-pointer transition-all ${isSelected ? 'ring-2 ring-violet-500 ring-offset-1 rounded' : 'hover:ring-1 hover:ring-violet-300 hover:rounded'}`}
                      style={{
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: `${(el.fontSize ?? 14) * 0.65}px`,
                        fontWeight: el.fontWeight ?? 'normal',
                        color: el.color ?? '#1e293b',
                        textAlign: 'center',
                        maxWidth: '80%',
                        whiteSpace: el.type === 'text' ? 'pre-wrap' : 'nowrap',
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

                {/* Decorative line at bottom */}
                <div className="absolute bottom-10 left-16 right-16 h-0.5" style={{
                  background: isDark ? 'linear-gradient(to right, transparent, #7c3aed, #10b981, transparent)' : 'linear-gradient(to right, transparent, #7c3aed, #10b981, transparent)',
                  opacity: 0.5,
                }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ==========================
// ISSUED CERTIFICATES TABLE
// ==========================
function IssuedCertificatesTable() {
  const [search, setSearch] = useState('');
  const [certs] = useState(demoIssuedCerts);

  const filtered = certs.filter(c =>
    c.recipientName.toLowerCase().includes(search.toLowerCase()) ||
    c.courseName.toLowerCase().includes(search.toLowerCase()) ||
    c.verificationCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Issued Certificates</h2>
          <p className="text-muted-foreground text-sm mt-1">Track and manage all issued certificates</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search certificates..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64" />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Issued', value: certs.length, icon: Award, color: 'text-violet-600' },
          { label: 'This Month', value: 3, icon: Calendar, color: 'text-emerald-600' },
          { label: 'Active', value: certs.length, icon: CheckCircle2, color: 'text-amber-600' },
          { label: 'Templates', value: demoTemplates.length, icon: FileText, color: 'text-rose-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
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

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Certificate</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead>Verification Code</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No certificates found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((cert, idx) => (
                    <motion.tr
                      key={cert.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-700 dark:text-violet-400 text-xs font-bold">
                            {cert.recipientName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-sm">{cert.recipientName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{cert.courseName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs gap-1">
                          <Award className="h-3 w-3" /> {cert.certName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{cert.verificationCode}</code>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                                  <Ban className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Revoke</TooltipContent>
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
    </div>
  );
}

// ==========================
// MAIN COMPONENT
// ==========================
export function AdminCertificates() {
  const [templates, setTemplates] = useState<CertTemplate[]>(demoTemplates);
  const [activeTab, setActiveTab] = useState('templates');
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

  return (
    <div className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="templates" className="gap-1.5">
            <Award className="h-4 w-4" /> Templates
          </TabsTrigger>
          <TabsTrigger value="builder" className="gap-1.5" disabled={!editingTemplate}>
            <Layout className="h-4 w-4" /> Builder
          </TabsTrigger>
          <TabsTrigger value="issued" className="gap-1.5">
            <FileText className="h-4 w-4" /> Issued
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {activeTab === 'templates' && (
              <TemplatesList templates={templates} onEdit={handleEdit} onCreateNew={handleCreateNew} />
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
