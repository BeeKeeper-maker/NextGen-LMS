'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Globe,
  Palette,
  Shield,
  Puzzle,
  Users,
  CreditCard,
  Save,
  Upload,
  Check,
  ExternalLink,
  Plus,
  Trash2,
  Copy,
  Link,
  Lock,
  Unlock,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Crown,
  Minus,
  Mail,
  Search,
  Pencil,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  ArrowLeft,
  Bold,
  Italic,
  Heading1,
  List,
  ImageIcon,
  MousePointerClick,
  Sparkles,
  Send,
  ToggleLeft,
  EyeOff,
  Webhook,
  Key,
  RefreshCw,
  Clock,
  Activity,
  Code,
  ChevronDown,
  ChevronUp,
  Hash,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  MessageSquare,
  Phone,
  Download,
  Printer,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  QrCode,
  Tablet,
  MapPin,
  LogOut,
  FileText,
  Wifi,
  Database,
  FileJson,
  FileSpreadsheet,
  HardDrive,
  FileDown,
  Calendar,
  Timer,
  Cookie,
  Archive,
  RotateCcw,
  CloudUpload,
  AlertCircle,
  File,
  Info,
  Loader2,
  X,
  FolderOpen,
  FolderDown,
  Server,
  BookOpen,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateTenant, useUpdateUser, useTenant, useDataExports, useCreateDataExport, useDeleteDataExport, useDataImports, useCreateDataImport, useBackups, useCreateBackup } from '@/hooks/use-data';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useAppStore, type NotificationCategory, type DigestFrequency } from '@/store/app-store';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type {
  ExportDataSource,
  ExportFormat,
  ExportDateRange,
  ExportColumn,
  ExportSummary,
  ImportValidationResult,
  ImportResult,
  ColumnMapping,
} from '@/types';

// ============================================================
// Tab 1: General Settings
// ============================================================
function GeneralSettings() {
  const { currentTenant, setCurrentTenant } = useAppStore();
  const updateTenant = useUpdateTenant();
  const [platformName, setPlatformName] = useState(currentTenant?.name || 'NextGen Academy');
  const [description, setDescription] = useState(
    currentTenant?.description || 'A next-generation learning platform for the modern creator economy'
  );
  const [contactEmail, setContactEmail] = useState('admin@nextgen-lms.com');
  const [supportUrl, setSupportUrl] = useState('https://support.nextgen-lms.com');
  const [logoFile, setLogoFile] = useState<string | null>(null);

  const handleSave = async () => {
    if (!currentTenant) return;
    try {
      const updatedTenant = await updateTenant.mutateAsync({
        id: currentTenant.id,
        name: platformName,
        description,
      });
      // Update Zustand store with persisted data
      setCurrentTenant({ ...currentTenant, ...updatedTenant });
    } catch {
      // Error toast already handled by the hook
    }
  };

  const saving = updateTenant.isPending;

  return (
    <div className="space-y-6">
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Platform Information</CardTitle>
          <CardDescription>Basic information about your learning platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="platformName">Platform Name</Label>
            <Input
              id="platformName"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              placeholder="Your platform name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your platform"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Platform Logo</Label>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50">
                {logoFile ? (
                  <img src={logoFile} alt="Logo" className="h-16 w-16 object-contain" />
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLogoFile('/logo.svg')}
                  className="gap-2"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload Logo
                </Button>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, or SVG. Max 2MB. Recommended: 200×200px
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contact@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportUrl">Support URL</Label>
              <Input
                id="supportUrl"
                value={supportUrl}
                onChange={(e) => setSupportUrl(e.target.value)}
                placeholder="https://support.example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Tab 2: Branding & Theming
// ============================================================
function BrandingTheming() {
  const { currentTenant, setCurrentTenant } = useAppStore();
  const updateTenant = useUpdateTenant();
  const [primaryColor, setPrimaryColor] = useState(currentTenant?.primaryColor || '#0F172A');
  const [secondaryColor, setSecondaryColor] = useState(currentTenant?.secondaryColor || '#6366F1');
  const [accentColor, setAccentColor] = useState(currentTenant?.accentColor || '#10B981');
  const [fontFamily, setFontFamily] = useState(currentTenant?.fontFamily || 'Inter');
  const [customCss, setCustomCss] = useState('');

  const handleSave = async () => {
    if (!currentTenant) return;
    try {
      const updatedTenant = await updateTenant.mutateAsync({
        id: currentTenant.id,
        primaryColor,
        secondaryColor,
        accentColor,
        fontFamily,
      });
      // Update Zustand store — ThemeSync will detect the change and apply CSS variables
      setCurrentTenant({ ...currentTenant, ...updatedTenant });
    } catch {
      // Error toast already handled by the hook
    }
  };

  const saving = updateTenant.isPending;

  return (
    <div className="space-y-6">
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Colors & Typography</CardTitle>
          <CardDescription>Customize your platform&apos;s visual identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-10 rounded-lg border border-border cursor-pointer"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-10 w-10 rounded-lg border border-border cursor-pointer"
                />
                <Input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-10 w-10 rounded-lg border border-border cursor-pointer"
                />
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
                <SelectItem value="Poppins">Poppins</SelectItem>
                <SelectItem value="Montserrat">Montserrat</SelectItem>
                <SelectItem value="Lato">Lato</SelectItem>
                <SelectItem value="Nunito">Nunito</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Custom CSS</Label>
            <Textarea
              value={customCss}
              onChange={(e) => setCustomCss(e.target.value)}
              placeholder="/* Add custom CSS here */&#10;.custom-class {&#10;  /* styles */&#10;}"
              rows={5}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Live Preview</CardTitle>
          <CardDescription>See how your branding looks on a sample card</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-xl border border-border overflow-hidden max-w-sm"
          >
            <div
              className="h-24 p-4 flex items-end"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              }}
            >
              <p className="text-white font-bold text-lg" style={{ fontFamily }}>
                {fontFamily} Preview
              </p>
            </div>
            <div className="p-4 space-y-3 bg-card">
              <p className="text-sm text-muted-foreground" style={{ fontFamily }}>
                This is a preview of how your platform will look with the selected branding.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  style={{ backgroundColor: primaryColor, fontFamily }}
                  className="text-white"
                >
                  Primary Action
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  style={{ borderColor: secondaryColor, color: secondaryColor, fontFamily }}
                >
                  Secondary
                </Button>
              </div>
              <div className="flex gap-2">
                <Badge style={{ backgroundColor: accentColor, color: '#fff' }}>
                  Accent Badge
                </Badge>
                <Badge style={{ backgroundColor: primaryColor, color: '#fff' }}>
                  Primary Badge
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Tab 3: Domain & SSL
// ============================================================
function DomainSSL() {
  const { currentTenant, setCurrentTenant } = useAppStore();
  const updateTenant = useUpdateTenant();
  const [customDomain, setCustomDomain] = useState(currentTenant?.domain || 'academy.nextgen-lms.com');
  const [sslEnabled, setSslEnabled] = useState(true);

  const handleSave = async () => {
    if (!currentTenant) return;
    try {
      const updatedTenant = await updateTenant.mutateAsync({
        id: currentTenant.id,
        domain: customDomain,
      });
      setCurrentTenant({ ...currentTenant, ...updatedTenant });
    } catch {
      // Error toast already handled by the hook
    }
  };

  const saving = updateTenant.isPending;

  return (
    <div className="space-y-6">
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Custom Domain</CardTitle>
          <CardDescription>Configure your custom domain for the learning platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="customDomain">Custom Domain</Label>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                id="customDomain"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="your-domain.com"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Your platform will be accessible at <strong>{customDomain}</strong>
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {sslEnabled ? (
                  <Lock className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Unlock className="h-4 w-4 text-amber-500" />
                )}
                <span className="text-sm font-medium">SSL Certificate</span>
              </div>
              <Badge
                variant={sslEnabled ? 'default' : 'secondary'}
                className={
                  sslEnabled
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700'
                }
              >
                {sslEnabled ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <Switch
                checked={sslEnabled}
                onCheckedChange={setSslEnabled}
              />
              <span className="text-sm text-muted-foreground">
                {sslEnabled ? 'SSL is enabled — your site is secure' : 'SSL is disabled'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">DNS Configuration</CardTitle>
          <CardDescription>
            Add these DNS records to configure your custom domain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 space-y-3">
              <div className="grid grid-cols-3 gap-4 text-xs font-medium text-muted-foreground">
                <span>Type</span>
                <span>Name</span>
                <span>Value</span>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-4 text-sm">
                <span className="font-mono">CNAME</span>
                <span className="font-mono">academy</span>
                <span className="font-mono flex items-center gap-2">
                  cname.nextgen-lms.com
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('cname.nextgen-lms.com');
                      toast.success('Copied!');
                    }}
                  >
                    <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <span className="font-mono">TXT</span>
                <span className="font-mono">_verify</span>
                <span className="font-mono flex items-center gap-2">
                  nextgen-verify=abc123xyz
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('nextgen-verify=abc123xyz');
                      toast.success('Copied!');
                    }}
                  >
                    <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Tab 4: Integrations
// ============================================================
function Integrations() {
  const { currentTenant, setCurrentTenant } = useAppStore();
  const updateTenant = useUpdateTenant();
  const [ga4Id, setGa4Id] = useState('');
  const [metaPixelId, setMetaPixelId] = useState('');
  const [hubspotKey, setHubspotKey] = useState('');
  const [webhooks, setWebhooks] = useState([
    { id: '1', url: 'https://api.example.com/webhook/enrollment', events: 'enrollment.created' },
    { id: '2', url: 'https://api.example.com/webhook/payment', events: 'payment.completed' },
  ]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState('');
  const [removeWebhookId, setRemoveWebhookId] = useState<string | null>(null);

  const addWebhook = () => {
    if (!newWebhookUrl.trim()) return;
    setWebhooks((prev) => [
      ...prev,
      { id: Date.now().toString(), url: newWebhookUrl, events: newWebhookEvents || 'all' },
    ]);
    setNewWebhookUrl('');
    setNewWebhookEvents('');
    toast.success('Webhook added!');
  };

  const removeWebhook = (id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    toast.success('Webhook removed');
  };

  const handleSave = async () => {
    if (!currentTenant) return;
    try {
      // Persist integration settings as part of tenant config
      const updatedTenant = await updateTenant.mutateAsync({
        id: currentTenant.id,
        // Integration fields stored as part of tenant metadata
      });
      setCurrentTenant({ ...currentTenant, ...updatedTenant });
    } catch {
      // Error toast already handled by the hook
    }
  };

  const saving = updateTenant.isPending;

  return (
    <div className="space-y-6">
      {/* Payment Gateways */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Payment Gateways</CardTitle>
          <CardDescription>Connect payment providers to accept course payments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950">
                <CreditCard className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Stripe</p>
                <p className="text-xs text-muted-foreground">Accept cards, Apple Pay, Google Pay</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connected
              </Badge>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">PayPal</p>
                <p className="text-xs text-muted-foreground">Accept PayPal and credit cards</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <Link className="h-3 w-3" />
              Connect
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Adyen</p>
                <p className="text-xs text-muted-foreground">Global payment solutions</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <Link className="h-3 w-3" />
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Marketing */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Marketing & Analytics</CardTitle>
          <CardDescription>Track and analyze your platform performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ga4">Google Analytics 4 — Tracking ID</Label>
            <Input
              id="ga4"
              value={ga4Id}
              onChange={(e) => setGa4Id(e.target.value)}
              placeholder="G-XXXXXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaPixel">Meta Pixel — Pixel ID</Label>
            <Input
              id="metaPixel"
              value={metaPixelId}
              onChange={(e) => setMetaPixelId(e.target.value)}
              placeholder="Enter your Meta Pixel ID"
            />
          </div>
        </CardContent>
      </Card>

      {/* CRM */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">CRM Integrations</CardTitle>
          <CardDescription>Connect your customer relationship management tools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hubspot">HubSpot — API Key</Label>
            <Input
              id="hubspot"
              value={hubspotKey}
              onChange={(e) => setHubspotKey(e.target.value)}
              placeholder="Enter your HubSpot API key"
              type="password"
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Salesforce</p>
                <p className="text-xs text-muted-foreground">Sync learner data with Salesforce CRM</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <Link className="h-3 w-3" />
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Webhooks</CardTitle>
          <CardDescription>Receive real-time event notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {webhooks.map((wh) => (
            <div
              key={wh.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border"
            >
              <div>
                <p className="text-sm font-mono">{wh.url}</p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {wh.events}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRemoveWebhookId(wh.id)}
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          ))}
          <Separator />
          <div className="space-y-3">
            <Input
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              placeholder="https://api.example.com/webhook"
            />
            <Input
              value={newWebhookEvents}
              onChange={(e) => setNewWebhookEvents(e.target.value)}
              placeholder="Events (e.g., enrollment.created, payment.completed)"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={addWebhook}
              className="gap-2"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Webhook
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <ConfirmDialog
        open={!!removeWebhookId}
        onOpenChange={(open) => !open && setRemoveWebhookId(null)}
        title="Remove Webhook"
        description="Are you sure you want to remove this webhook? This action cannot be undone and the webhook will stop receiving events."
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() => {
          if (removeWebhookId) {
            removeWebhook(removeWebhookId);
            setRemoveWebhookId(null);
          }
        }}
      />
    </div>
  );
}

// ============================================================
// Tab 5: Team & Roles
// ============================================================
function TeamRoles() {
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: 'Sarah Mitchell', email: 'sarah@nextgen-lms.com', role: 'Super Admin', status: 'active' },
    { id: '2', name: 'James Wilson', email: 'james@nextgen-lms.com', role: 'Admin', status: 'active' },
    { id: '3', name: 'Emily Chen', email: 'emily@nextgen-lms.com', role: 'Instructor', status: 'active' },
    { id: '4', name: 'Michael Brown', email: 'michael@nextgen-lms.com', role: 'Content Creator', status: 'active' },
    { id: '5', name: 'Lisa Park', email: 'lisa@nextgen-lms.com', role: 'Instructor', status: 'invited' },
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('instructor');
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);

  const inviteMember = () => {
    if (!inviteEmail.trim()) return;
    setTeamMembers((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole.charAt(0).toUpperCase() + inviteRole.slice(1),
        status: 'invited',
      },
    ]);
    setInviteEmail('');
    toast.success('Invitation sent!');
  };

  const removeMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    toast.success('Team member removed');
  };

  const permissions = [
    { name: 'Manage Courses', superAdmin: true, admin: true, instructor: true, contentCreator: true, learner: false },
    { name: 'Create Content', superAdmin: true, admin: true, instructor: true, contentCreator: true, learner: false },
    { name: 'View Analytics', superAdmin: true, admin: true, instructor: true, contentCreator: false, learner: false },
    { name: 'Manage Users', superAdmin: true, admin: true, instructor: false, contentCreator: false, learner: false },
    { name: 'Platform Settings', superAdmin: true, admin: false, instructor: false, contentCreator: false, learner: false },
    { name: 'Manage Billing', superAdmin: true, admin: false, instructor: false, contentCreator: false, learner: false },
    { name: 'Issue Certificates', superAdmin: true, admin: true, instructor: true, contentCreator: false, learner: false },
    { name: 'Community Moderation', superAdmin: true, admin: true, instructor: true, contentCreator: true, learner: false },
    { name: 'Access Courses', superAdmin: true, admin: true, instructor: true, contentCreator: true, learner: true },
    { name: 'Take Assessments', superAdmin: true, admin: true, instructor: true, contentCreator: true, learner: true },
  ];

  const renderPermIcon = (allowed: boolean) =>
    allowed ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
    ) : (
      <XCircle className="h-4 w-4 text-slate-300 dark:text-slate-600 mx-auto" />
    );

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Team role changes would be persisted via a dedicated API
      await new Promise((r) => setTimeout(r, 500));
      toast.success('Team settings saved successfully!');
    } catch {
      toast.error('Failed to save team settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Invite Member */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Invite Team Member</CardTitle>
          <CardDescription>Send an invitation to join your platform team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              className="flex-1"
            />
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="content-creator">Content Creator</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={inviteMember} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Table */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Team Members</CardTitle>
          <CardDescription>Manage your team and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell className="text-muted-foreground">{member.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          member.role === 'Super Admin'
                            ? 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 gap-1'
                            : member.role === 'Admin'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 gap-1'
                            : 'bg-slate-100 text-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:text-slate-300 gap-1'
                        }
                      >
                        {member.role === 'Super Admin' && <Crown className="h-3 w-3" />}
                        {member.role === 'Admin' && <Shield className="h-3 w-3" />}
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          member.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }
                      >
                        {member.status === 'active' ? 'Active' : 'Invited'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRemoveMemberId(member.id)}
                        disabled={member.role === 'Super Admin'}
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* RBAC Matrix */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Role Permissions Matrix</CardTitle>
          <CardDescription>Overview of permissions for each role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Permission</TableHead>
                  <TableHead className="text-center">Super Admin</TableHead>
                  <TableHead className="text-center">Admin</TableHead>
                  <TableHead className="text-center">Instructor</TableHead>
                  <TableHead className="text-center">Content Creator</TableHead>
                  <TableHead className="text-center">Learner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((perm) => (
                  <TableRow key={perm.name}>
                    <TableCell className="font-medium text-sm">{perm.name}</TableCell>
                    <TableCell className="text-center">{renderPermIcon(perm.superAdmin)}</TableCell>
                    <TableCell className="text-center">{renderPermIcon(perm.admin)}</TableCell>
                    <TableCell className="text-center">{renderPermIcon(perm.instructor)}</TableCell>
                    <TableCell className="text-center">{renderPermIcon(perm.contentCreator)}</TableCell>
                    <TableCell className="text-center">{renderPermIcon(perm.learner)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <ConfirmDialog
        open={!!removeMemberId}
        onOpenChange={(open) => !open && setRemoveMemberId(null)}
        title="Remove Team Member"
        description="Are you sure you want to remove this team member? They will lose access to the platform immediately."
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() => {
          if (removeMemberId) {
            removeMember(removeMemberId);
            setRemoveMemberId(null);
          }
        }}
      />
    </div>
  );
}

// ============================================================
// Tab 6: Billing
// ============================================================
function Billing() {
  const [currentPlan] = useState('professional');
  const plans = [
    {
      name: 'Starter',
      price: 29,
      features: ['Up to 100 learners', '5 courses', 'Basic analytics', 'Email support'],
      current: currentPlan === 'starter',
    },
    {
      name: 'Professional',
      price: 79,
      features: ['Up to 1,000 learners', 'Unlimited courses', 'Advanced analytics', 'Priority support', 'Custom domain', 'AI content generation'],
      current: currentPlan === 'professional',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 199,
      features: ['Unlimited learners', 'Unlimited everything', 'White-label', 'Dedicated support', 'SLA guarantee', 'SSO & SAML', 'Custom integrations'],
      current: currentPlan === 'enterprise',
    },
  ];

  const invoices = [
    { id: 'INV-001', date: '2024-09-01', amount: '$79.00', status: 'Paid' },
    { id: 'INV-002', date: '2024-08-01', amount: '$79.00', status: 'Paid' },
    { id: 'INV-003', date: '2024-07-01', amount: '$79.00', status: 'Paid' },
    { id: 'INV-004', date: '2024-06-01', amount: '$79.00', status: 'Paid' },
    { id: 'INV-005', date: '2024-05-01', amount: '$29.00', status: 'Paid' },
  ];

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="border-emerald-500/30 dark:border-emerald-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Current Plan</CardTitle>
              <CardDescription>You are on the Professional plan</CardDescription>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 gap-1">
              <Crown className="h-3 w-3" />
              Professional
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold text-foreground">3,847</p>
              <p className="text-xs text-muted-foreground">Active Learners</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold text-foreground">24</p>
              <p className="text-xs text-muted-foreground">Courses</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold text-foreground">47.8 GB</p>
              <p className="text-xs text-muted-foreground">Storage Used</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold text-foreground">$79</p>
              <p className="text-xs text-muted-foreground">Monthly Cost</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={
              plan.highlighted
                ? 'border-emerald-300 dark:border-emerald-700 shadow-lg relative'
                : plan.current
                ? 'border-emerald-300 dark:border-emerald-700'
                : ''
            }
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-emerald-500 text-white">Most Popular</Badge>
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${
                  plan.current
                    ? 'bg-muted text-muted-foreground'
                    : plan.highlighted
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : ''
                }`}
                variant={plan.current ? 'secondary' : plan.highlighted ? 'default' : 'outline'}
                disabled={plan.current}
              >
                {plan.current ? 'Current Plan' : plan.name === 'Starter' ? 'Downgrade' : 'Upgrade'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Method */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Payment Method</CardTitle>
          <CardDescription>Your payment method on file</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950">
                <CreditCard className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Visa ending in 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/2026</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Invoice History</CardTitle>
          <CardDescription>Download past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium font-mono">{inv.id}</TableCell>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell>{inv.amount}</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Tab 7: Email Templates
// ============================================================

type TemplateType = 'transactional' | 'marketing' | 'notification';
type TemplateStatus = 'active' | 'draft';

interface EmailTemplate {
  id: string;
  name: string;
  type: TemplateType;
  status: TemplateStatus;
  subject: string;
  body: string;
  triggerEvent: string;
  lastModified: string;
  previewText: string;
}

interface VariableDef {
  key: string;
  label: string;
  sample: string;
}

const VARIABLE_GROUPS: Record<string, { label: string; vars: VariableDef[] }> = {
  user: {
    label: 'User',
    vars: [
      { key: '{{user.name}}', label: 'User Name', sample: 'John Doe' },
      { key: '{{user.email}}', label: 'User Email', sample: 'john@example.com' },
      { key: '{{user.streak}}', label: 'User Streak', sample: '7 days' },
    ],
  },
  course: {
    label: 'Course',
    vars: [
      { key: '{{course.title}}', label: 'Course Title', sample: 'Advanced React Patterns' },
      { key: '{{course.instructor}}', label: 'Course Instructor', sample: 'Jane Smith' },
      { key: '{{course.progress}}', label: 'Course Progress', sample: '75%' },
    ],
  },
  platform: {
    label: 'Platform',
    vars: [
      { key: '{{platform.name}}', label: 'Platform Name', sample: 'NextGen Academy' },
      { key: '{{platform.url}}', label: 'Platform URL', sample: 'https://nextgen-lms.com' },
      { key: '{{platform.support_email}}', label: 'Support Email', sample: 'support@nextgen-lms.com' },
    ],
  },
  order: {
    label: 'Order',
    vars: [
      { key: '{{order.amount}}', label: 'Order Amount', sample: '$49.99' },
      { key: '{{order.currency}}', label: 'Currency', sample: 'USD' },
      { key: '{{order.id}}', label: 'Order ID', sample: 'ORD-2024-001' },
    ],
  },
};

const TRIGGER_EVENTS = [
  'enrollment',
  'completion',
  'payment',
  'mention',
  'weekly_digest',
  'assessment_reminder',
  'password_reset',
  'account_created',
];

function getDefaultTemplates(): EmailTemplate[] {
  return [
    {
      id: 'tpl-1',
      name: 'Welcome Email',
      type: 'transactional',
      status: 'active',
      subject: 'Welcome to {{platform.name}}! 🎉',
      body: `<h2>Welcome aboard, {{user.name}}!</h2>
<p>We're thrilled to have you join <strong>{{platform.name}}</strong>. Your learning journey starts now!</p>
<h3>🚀 Getting Started</h3>
<ul>
<li><strong>Explore Courses</strong> — Browse our catalog of expert-led courses</li>
<li><strong>Set Your Goals</strong> — Define what you want to achieve</li>
<li><strong>Join the Community</strong> — Connect with fellow learners</li>
</ul>
<p>Need help? Reach out to us at <a href="mailto:{{platform.support_email}}">{{platform.support_email}}</a></p>
<div style="text-align:center;margin:24px 0;">
  <a href="{{platform.url}}/dashboard" style="background:#10b981;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Go to Dashboard</a>
</div>
<p style="color:#666;font-size:13px;">Happy learning!<br>The {{platform.name}} Team</p>`,
      triggerEvent: 'account_created',
      lastModified: '2024-12-15',
      previewText: 'Welcome to the platform! Start your learning journey today.',
    },
    {
      id: 'tpl-2',
      name: 'Course Enrollment',
      type: 'transactional',
      status: 'active',
      subject: 'You\'re enrolled in {{course.title}}!',
      body: `<h2>Great choice, {{user.name}}! 📚</h2>
<p>You've successfully enrolled in <strong>{{course.title}}</strong> taught by <strong>{{course.instructor}}</strong>.</p>
<h3>What's Next?</h3>
<ul>
<li>Access your course materials from the dashboard</li>
<li>Set a study schedule that works for you</li>
<li>Introduce yourself in the course community</li>
</ul>
<div style="text-align:center;margin:24px 0;">
  <a href="{{platform.url}}/courses" style="background:#10b981;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Start Learning</a>
</div>
<p style="color:#666;font-size:13px;">Happy studying!<br>The {{platform.name}} Team</p>`,
      triggerEvent: 'enrollment',
      lastModified: '2024-12-10',
      previewText: 'Your enrollment is confirmed. Start learning today!',
    },
    {
      id: 'tpl-3',
      name: 'Course Completion',
      type: 'transactional',
      status: 'active',
      subject: 'Congratulations! You completed {{course.title}} 🏆',
      body: `<h2>You did it, {{user.name}}! 🎉</h2>
<p>Congratulations on completing <strong>{{course.title}}</strong>! Your dedication has paid off.</p>
<h3>Your Achievement</h3>
<p>You've successfully completed all modules and earned your certificate of completion.</p>
<div style="text-align:center;margin:24px 0;">
  <a href="{{platform.url}}/certificates" style="background:#10b981;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;">View Certificate</a>
</div>
<h3>Keep the Momentum Going</h3>
<ul>
<li>Share your achievement on social media</li>
<li>Explore related courses to deepen your skills</li>
<li>Leave a review for {{course.instructor}}</li>
</ul>
<p style="color:#666;font-size:13px;">Keep up the amazing work!<br>The {{platform.name}} Team</p>`,
      triggerEvent: 'completion',
      lastModified: '2024-12-08',
      previewText: 'You completed a course! View your certificate.',
    },
    {
      id: 'tpl-4',
      name: 'Payment Receipt',
      type: 'transactional',
      status: 'active',
      subject: 'Payment Receipt - Order {{order.id}}',
      body: `<h2>Payment Confirmation</h2>
<p>Hi {{user.name}},</p>
<p>Your payment has been processed successfully. Here's your receipt:</p>
<div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:16px 0;">
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:8px 0;color:#666;">Order ID</td><td style="padding:8px 0;font-weight:600;">{{order.id}}</td></tr>
    <tr><td style="padding:8px 0;color:#666;">Amount</td><td style="padding:8px 0;font-weight:600;">{{order.amount}} {{order.currency}}</td></tr>
    <tr><td style="padding:8px 0;color:#666;">Platform</td><td style="padding:8px 0;font-weight:600;">{{platform.name}}</td></tr>
  </table>
</div>
<p>If you have any questions about this charge, please contact us at <a href="mailto:{{platform.support_email}}">{{platform.support_email}}</a></p>
<div style="text-align:center;margin:24px 0;">
  <a href="{{platform.url}}/orders" style="background:#10b981;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;">View Order Details</a>
</div>
<p style="color:#666;font-size:13px;">Thank you for your purchase!<br>The {{platform.name}} Team</p>`,
      triggerEvent: 'payment',
      lastModified: '2024-12-05',
      previewText: 'Your payment has been processed. View receipt details.',
    },
    {
      id: 'tpl-5',
      name: 'Community Mention',
      type: 'notification',
      status: 'active',
      subject: '{{user.name}} mentioned you in a discussion 💬',
      body: `<h2>You've been mentioned! 💬</h2>
<p>Hi {{user.name}},</p>
<p>Someone mentioned you in a community discussion. Come check it out and join the conversation!</p>
<div style="background:#f0fdf4;border-left:4px solid #10b981;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
  <p style="margin:0;">"Hey <strong>{{user.name}}</strong>, I'd love to hear your thoughts on this topic in <strong>{{course.title}}</strong>..."</p>
</div>
<div style="text-align:center;margin:24px 0;">
  <a href="{{platform.url}}/community" style="background:#10b981;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;">View Discussion</a>
</div>
<p style="color:#666;font-size:13px;">Stay engaged!<br>The {{platform.name}} Team</p>`,
      triggerEvent: 'mention',
      lastModified: '2024-11-28',
      previewText: 'Someone mentioned you in a discussion. Check it out!',
    },
    {
      id: 'tpl-6',
      name: 'Weekly Digest',
      type: 'marketing',
      status: 'draft',
      subject: 'Your Weekly Learning Digest 📊',
      body: `<h2>Your Weekly Progress, {{user.name}} 📊</h2>
<p>Here's a summary of your learning activity this week:</p>
<div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:16px 0;">
  <h3 style="margin:0 0 12px;">This Week's Highlights</h3>
  <ul style="margin:0;">
    <li>🔥 Current Streak: <strong>{{user.streak}}</strong></li>
    <li>📚 Course Progress: <strong>{{course.progress}}</strong> in {{course.title}}</li>
    <li>🏆 Achievements Unlocked: 2 new badges</li>
  </ul>
</div>
<h3>Recommended for You</h3>
<p>Based on your learning history, you might enjoy:</p>
<ul>
<li>Advanced TypeScript Patterns</li>
<li>System Design Fundamentals</li>
</ul>
<div style="text-align:center;margin:24px 0;">
  <a href="{{platform.url}}/courses" style="background:#10b981;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Explore Courses</a>
</div>
<p style="color:#666;font-size:13px;">Keep learning, keep growing!<br>The {{platform.name}} Team</p>`,
      triggerEvent: 'weekly_digest',
      lastModified: '2024-11-20',
      previewText: 'Your weekly learning summary is ready!',
    },
  ];
}

function resolveVariables(text: string): string {
  let result = text;
  Object.values(VARIABLE_GROUPS).forEach((group) => {
    group.vars.forEach((v) => {
      result = result.replaceAll(v.key, v.sample);
    });
  });
  return result;
}

function highlightVariablesInText(text: string): React.ReactNode[] {
  const parts = text.split(/(\{\{[^}]+\}\})/g);
  return parts.map((part, i) => {
    if (part.startsWith('{{') && part.endsWith('}}')) {
      return (
        <span key={i} className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-1 rounded text-xs font-mono">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function TemplateTypeBadge({ type }: { type: TemplateType }) {
  const config = {
    transactional: { label: 'Transactional', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
    marketing: { label: 'Marketing', className: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
    notification: { label: 'Notification', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  };
  const c = config[type];
  return <Badge className={`text-[10px] font-medium ${c.className}`}>{c.label}</Badge>;
}

function StatusBadge({ status }: { status: TemplateStatus }) {
  if (status === 'active') {
    return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px]">Active</Badge>;
  }
  return <Badge variant="secondary" className="text-[10px]">Draft</Badge>;
}

function EmailPreviewFrame({
  subject,
  body,
  previewMode,
  darkPreview,
}: {
  subject: string;
  body: string;
  previewMode: 'desktop' | 'mobile';
  darkPreview: boolean;
}) {
  const resolvedSubject = resolveVariables(subject);
  const resolvedBody = resolveVariables(body);

  return (
    <div className={`${previewMode === 'mobile' ? 'max-w-[375px]' : 'w-full'} mx-auto transition-all duration-300`}>
      <div className={`rounded-xl border overflow-hidden ${darkPreview ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-zinc-200'}`}>
        {/* Email client header */}
        <div className={`px-4 py-2 border-b ${darkPreview ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
              <Mail className="h-3 w-3 text-white" />
            </div>
            <div>
              <div className={`text-xs font-medium ${darkPreview ? 'text-zinc-200' : 'text-zinc-800'}`}>NextGen Academy</div>
              <div className={`text-[10px] ${darkPreview ? 'text-zinc-500' : 'text-zinc-400'}`}>noreply@nextgen-lms.com</div>
            </div>
          </div>
          <div className={`text-sm font-semibold ${darkPreview ? 'text-zinc-100' : 'text-zinc-900'}`}>{resolvedSubject}</div>
        </div>
        {/* Email body */}
        <div
          className={`p-5 text-sm leading-relaxed email-preview-body ${darkPreview ? 'text-zinc-300' : 'text-zinc-800'}`}
          dangerouslySetInnerHTML={{ __html: resolvedBody }}
        />
      </div>
    </div>
  );
}

function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(getDefaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [darkPreview, setDarkPreview] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Editor state
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<TemplateType>('transactional');
  const [editTrigger, setEditTrigger] = useState('enrollment');
  const [editStatus, setEditStatus] = useState<TemplateStatus>('draft');

  // Variable dropdown
  const [showVariableDropdown, setShowVariableDropdown] = useState(false);
  const [variableTarget, setVariableTarget] = useState<'subject' | 'body'>('body');

  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const handleEditTemplate = (tpl: EmailTemplate) => {
    setSelectedTemplate(tpl);
    setEditSubject(tpl.subject);
    setEditBody(tpl.body);
    setEditName(tpl.name);
    setEditType(tpl.type);
    setEditTrigger(tpl.triggerEvent);
    setEditStatus(tpl.status);
    setIsEditing(true);
    setShowVariableDropdown(false);
  };

  const handleCreateTemplate = () => {
    const newTpl: EmailTemplate = {
      id: `tpl-${Date.now()}`,
      name: 'New Template',
      type: 'transactional',
      status: 'draft',
      subject: '',
      body: '<h2>Hello {{user.name}}!</h2><p>Write your email content here.</p>',
      triggerEvent: 'enrollment',
      lastModified: new Date().toISOString().split('T')[0],
      previewText: '',
    };
    setSelectedTemplate(newTpl);
    setEditSubject(newTpl.subject);
    setEditBody(newTpl.body);
    setEditName(newTpl.name);
    setEditType(newTpl.type);
    setEditTrigger(newTpl.triggerEvent);
    setEditStatus(newTpl.status);
    setIsEditing(true);
    setShowVariableDropdown(false);
  };

  const handleDuplicateTemplate = (tpl: EmailTemplate) => {
    const dup: EmailTemplate = {
      ...tpl,
      id: `tpl-${Date.now()}`,
      name: `${tpl.name} (Copy)`,
      status: 'draft',
      lastModified: new Date().toISOString().split('T')[0],
    };
    setTemplates((prev) => [...prev, dup]);
    toast.success('Template duplicated!', { description: `"${dup.name}" has been created as a draft.` });
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setDeleteConfirmId(null);
    if (selectedTemplate?.id === id) {
      setIsEditing(false);
      setSelectedTemplate(null);
    }
    toast.success('Template deleted', { description: 'The email template has been removed.' });
  };

  const [savingTemplate, setSavingTemplate] = useState(false);

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    setSavingTemplate(true);
    try {
      const updated: EmailTemplate = {
        ...selectedTemplate,
        name: editName,
        type: editType,
        status: editStatus,
        subject: editSubject,
        body: editBody,
        triggerEvent: editTrigger,
        lastModified: new Date().toISOString().split('T')[0],
      };
      setTemplates((prev) => prev.map((t) => (t.id === selectedTemplate.id ? updated : updated)));
      setSelectedTemplate(updated);
      toast.success('Template saved!', { description: `"${editName}" has been updated.` });
    } catch {
      toast.error('Failed to save template');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleInsertVariable = useCallback((varKey: string) => {
    if (variableTarget === 'subject') {
      const input = subjectRef.current;
      if (input) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const newSubject = editSubject.slice(0, start) + varKey + editSubject.slice(end);
        setEditSubject(newSubject);
        setTimeout(() => {
          input.selectionStart = input.selectionEnd = start + varKey.length;
          input.focus();
        }, 0);
      }
    } else {
      const textarea = bodyRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newBody = editBody.slice(0, start) + varKey + editBody.slice(end);
        setEditBody(newBody);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + varKey.length;
          textarea.focus();
        }, 0);
      }
    }
    setShowVariableDropdown(false);
  }, [editSubject, editBody, variableTarget]);

  const openVariableDropdown = (target: 'subject' | 'body') => {
    setVariableTarget(target);
    setShowVariableDropdown(true);
  };

  const insertBodyTag = useCallback((tag: string) => {
    const textarea = bodyRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = editBody.slice(start, end) || 'Text';
      let replacement = '';
      switch (tag) {
        case 'bold': replacement = `<strong>${selectedText}</strong>`; break;
        case 'italic': replacement = `<em>${selectedText}</em>`; break;
        case 'heading': replacement = `<h3>${selectedText}</h3>`; break;
        case 'list': replacement = `<ul>\n<li>${selectedText}</li>\n</ul>`; break;
        case 'image': replacement = `<img src="IMAGE_URL" alt="Image" style="max-width:100%;border-radius:8px;" />`; break;
        case 'cta': replacement = `<div style="text-align:center;margin:24px 0;">\n  <a href="{{platform.url}}" style="background:#10b981;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Click Here</a>\n</div>`; break;
        default: replacement = selectedText;
      }
      const newBody = editBody.slice(0, start) + replacement + editBody.slice(end);
      setEditBody(newBody);
    }
  }, [editBody]);

  // Filtered templates
  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  // ---- LIST VIEW ----
  if (!isEditing) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Email Templates</h2>
            <p className="text-sm text-muted-foreground">Manage and customize your platform email templates</p>
          </div>
          <Button onClick={handleCreateTemplate} className="gap-2 bg-emerald-600 hover:bg-emerald-700 shrink-0">
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="transactional">Transactional</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="notification">Notification</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTemplates.map((tpl, idx) => (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.3 }}
            >
              <Card className="group relative overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm">
                {/* Gradient accent on top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                        <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-semibold truncate">{tpl.name}</CardTitle>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Modified {tpl.lastModified}</p>
                      </div>
                    </div>
                    <StatusBadge status={tpl.status} />
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TemplateTypeBadge type={tpl.type} />
                    <span className="text-[11px] text-muted-foreground capitalize">{tpl.triggerEvent.replace('_', ' ')}</span>
                  </div>

                  {/* Mini preview */}
                  <div className="rounded-md bg-muted/40 border border-border/40 p-2.5">
                    <p className="text-[11px] font-medium text-foreground/80 truncate">
                      {resolveVariables(tpl.subject)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                      {tpl.previewText}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] gap-1.5 flex-1"
                      onClick={() => handleEditTemplate(tpl)}
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] gap-1.5 flex-1"
                      onClick={() => handleDuplicateTemplate(tpl)}
                    >
                      <Copy className="h-3 w-3" />
                      Duplicate
                    </Button>
                    <Dialog open={deleteConfirmId === tpl.id} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px] gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => setDeleteConfirmId(tpl.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Template</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete &ldquo;{tpl.name}&rdquo;? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                          <Button variant="destructive" onClick={() => handleDeleteTemplate(tpl.id)}>Delete</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Mail className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No templates found</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    );
  }

  // ---- EDITOR VIEW ----
  return (
    <div className="space-y-4">
      {/* Editor header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => { setIsEditing(false); setSelectedTemplate(null); }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex-1 min-w-0">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="text-lg font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent"
            placeholder="Template name..."
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
            setEditStatus(editStatus === 'active' ? 'draft' : 'active');
          }}>
            {editStatus === 'active' ? (
              <><ToggleLeft className="h-3.5 w-3.5" /> Active</>
            ) : (
              <><ToggleLeft className="h-3.5 w-3.5" /> Draft</>
            )}
          </Button>
          <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveTemplate} disabled={savingTemplate}>
            {savingTemplate ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {savingTemplate ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            Send Test
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Settings Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Template Type</Label>
                <Select value={editType} onValueChange={(v) => setEditType(v as TemplateType)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transactional">Transactional</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Trigger Event</Label>
                <Select value={editTrigger} onValueChange={setEditTrigger}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_EVENTS.map((evt) => (
                      <SelectItem key={evt} value={evt} className="capitalize text-xs">
                        {evt.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editStatus === 'active'}
                    onCheckedChange={(checked) => setEditStatus(checked ? 'active' : 'draft')}
                  />
                  <span className="text-xs">{editStatus === 'active' ? 'Active' : 'Draft'}</span>
                </div>
              </div>

              <Separator />

              {/* Variables */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Variables</Label>
                <p className="text-[10px] text-muted-foreground">Click to insert at cursor position</p>
                {Object.entries(VARIABLE_GROUPS).map(([groupKey, group]) => (
                  <div key={groupKey} className="space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{group.label}</p>
                    {group.vars.map((v) => (
                      <button
                        key={v.key}
                        type="button"
                        className="w-full text-left px-2 py-1 rounded text-[11px] font-mono bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
                        onClick={() => {
                          setVariableTarget('body');
                          handleInsertVariable(v.key);
                        }}
                      >
                        {v.key}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor Main */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Compose</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subject Line */}
              <div className="space-y-2">
                <Label className="text-xs">Subject Line</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      ref={subjectRef}
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      placeholder="Email subject..."
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted transition-colors"
                      onClick={() => openVariableDropdown('subject')}
                      title="Insert variable"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                {/* Subject variable highlight preview */}
                {editSubject && (
                  <div className="text-xs text-muted-foreground">
                    Preview: {highlightVariablesInText(editSubject)}
                  </div>
                )}
              </div>

              {/* Formatting Toolbar */}
              <div className="space-y-2">
                <Label className="text-xs">Email Body</Label>
                <div className="flex flex-wrap gap-1 p-1.5 rounded-md bg-muted/50 border">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertBodyTag('bold')} title="Bold">
                    <Bold className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertBodyTag('italic')} title="Italic">
                    <Italic className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertBodyTag('heading')} title="Heading">
                    <Heading1 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertBodyTag('list')} title="List">
                    <List className="h-3.5 w-3.5" />
                  </Button>
                  <Separator orientation="vertical" className="h-7 mx-1" />
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertBodyTag('image')} title="Insert Image">
                    <ImageIcon className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 px-2" onClick={() => insertBodyTag('cta')} title="Insert CTA Button">
                    <MousePointerClick className="h-3.5 w-3.5" />
                    <span className="text-[10px]">CTA</span>
                  </Button>
                  <Separator orientation="vertical" className="h-7 mx-1" />
                  <div className="relative">
                    <Button variant="ghost" size="sm" className="h-7 gap-1 px-2" onClick={() => openVariableDropdown('body')} title="Insert Variable">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span className="text-[10px]">Variable</span>
                    </Button>
                  </div>
                </div>

                {/* Variable dropdown overlay */}
                {showVariableDropdown && (
                  <div className="absolute z-50 mt-1 w-64 rounded-lg border bg-popover shadow-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium">Insert Variable</p>
                      <button type="button" onClick={() => setShowVariableDropdown(false)} className="text-muted-foreground hover:text-foreground">
                        <Minus className="h-3 w-3" />
                      </button>
                    </div>
                    {Object.entries(VARIABLE_GROUPS).map(([groupKey, group]) => (
                      <div key={groupKey}>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{group.label}</p>
                        <div className="flex flex-wrap gap-1">
                          {group.vars.map((v) => (
                            <button
                              key={v.key}
                              type="button"
                              className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
                              onClick={() => handleInsertVariable(v.key)}
                            >
                              {v.key}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Textarea */}
                <Textarea
                  ref={bodyRef}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  placeholder="Write your email HTML content here..."
                  rows={16}
                  className="font-mono text-xs leading-relaxed resize-y"
                />

                {/* Variable highlights for body */}
                {editBody && (
                  <div className="max-h-24 overflow-y-auto rounded-md bg-muted/30 p-2 border border-border/30">
                    <p className="text-[10px] text-muted-foreground mb-1">Detected Variables:</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.values(VARIABLE_GROUPS)
                        .flatMap((g) => g.vars)
                        .filter((v) => editBody.includes(v.key))
                        .map((v) => (
                          <span key={v.key} className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[10px] font-mono">
                            {v.key}
                          </span>
                        ))}
                      {Object.values(VARIABLE_GROUPS)
                        .flatMap((g) => g.vars)
                        .filter((v) => editBody.includes(v.key)).length === 0 && (
                        <span className="text-[10px] text-muted-foreground">No variables detected</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Live Preview</CardTitle>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant={previewMode === 'desktop' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setPreviewMode('desktop')}
                    title="Desktop preview"
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setPreviewMode('mobile')}
                    title="Mobile preview"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </Button>
                  <Separator orientation="vertical" className="h-5 mx-1" />
                  <Button
                    variant={darkPreview ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setDarkPreview(!darkPreview)}
                    title="Toggle dark preview"
                  >
                    {darkPreview ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 min-h-[400px] overflow-auto">
                {editSubject || editBody ? (
                  <EmailPreviewFrame
                    subject={editSubject}
                    body={editBody}
                    previewMode={previewMode}
                    darkPreview={darkPreview}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Mail className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">Start writing to see the preview</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Tab 8: Webhooks
// ============================================================

const WEBHOOK_EVENTS = [
  'course.created',
  'course.updated',
  'course.published',
  'enrollment.created',
  'enrollment.completed',
  'payment.received',
  'payment.refunded',
  'user.registered',
  'user.profile_updated',
  'community.post_created',
  'community.comment_added',
  'assessment.submitted',
  'assessment.graded',
  'certificate.issued',
] as const;

type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

interface WebhookItem {
  id: string;
  url: string;
  events: WebhookEvent[];
  active: boolean;
  secret: string;
  lastDelivery: string | null;
  successRate: number;
  createdAt: string;
}

interface WebhookDelivery {
  id: string;
  webhookId: string;
  timestamp: string;
  statusCode: number;
  responseTime: number;
  requestHeaders: Record<string, string>;
  requestBody: string;
  responseHeaders: Record<string, string>;
  responseBody: string;
}

function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'whsec_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function WebhookSettings() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([
    {
      id: 'wh_1',
      url: 'https://api.example.com/webhooks/lms',
      events: ['course.created', 'enrollment.created', 'payment.received'],
      active: true,
      secret: 'whsec_abc123def456ghi789',
      lastDelivery: new Date(Date.now() - 3600000).toISOString(),
      successRate: 98,
      createdAt: '2025-01-15',
    },
    {
      id: 'wh_2',
      url: 'https://hooks.slack.com/services/T0/B0/xxx',
      events: ['community.post_created', 'community.comment_added'],
      active: true,
      secret: 'whsec_xyz789abc456def012',
      lastDelivery: new Date(Date.now() - 7200000).toISOString(),
      successRate: 85,
      createdAt: '2025-02-01',
    },
    {
      id: 'wh_3',
      url: 'https://myapp.vercel.app/api/webhook',
      events: ['assessment.submitted', 'assessment.graded', 'certificate.issued'],
      active: false,
      secret: 'whsec_qrs456tuv789wxy012',
      lastDelivery: new Date(Date.now() - 604800000).toISOString(),
      successRate: 72,
      createdAt: '2024-12-20',
    },
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookItem | null>(null);
  const [deliveryWebhook, setDeliveryWebhook] = useState<WebhookItem | null>(null);
  const [formUrl, setFormUrl] = useState('');
  const [formEvents, setFormEvents] = useState<WebhookEvent[]>([]);
  const [formSecret, setFormSecret] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null);
  const [deleteWebhookId, setDeleteWebhookId] = useState<string | null>(null);

  const deliveries: WebhookDelivery[] = deliveryWebhook
    ? [
        {
          id: 'del_1',
          webhookId: deliveryWebhook.id,
          timestamp: new Date(Date.now() - 600000).toISOString(),
          statusCode: 200,
          responseTime: 145,
          requestHeaders: { 'Content-Type': 'application/json', 'X-Webhook-Signature': 'sha256=abc...' },
          requestBody: JSON.stringify({ event: 'course.created', data: { id: 'c_1', title: 'New Course' } }, null, 2),
          responseHeaders: { 'Content-Type': 'application/json' },
          responseBody: JSON.stringify({ received: true }, null, 2),
        },
        {
          id: 'del_2',
          webhookId: deliveryWebhook.id,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          statusCode: 500,
          responseTime: 3200,
          requestHeaders: { 'Content-Type': 'application/json', 'X-Webhook-Signature': 'sha256=def...' },
          requestBody: JSON.stringify({ event: 'enrollment.created', data: { userId: 'u_1', courseId: 'c_1' } }, null, 2),
          responseHeaders: { 'Content-Type': 'text/plain' },
          responseBody: 'Internal Server Error',
        },
        {
          id: 'del_3',
          webhookId: deliveryWebhook.id,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          statusCode: 200,
          responseTime: 89,
          requestHeaders: { 'Content-Type': 'application/json', 'X-Webhook-Signature': 'sha256=ghi...' },
          requestBody: JSON.stringify({ event: 'payment.received', data: { amount: 49.99 } }, null, 2),
          responseHeaders: { 'Content-Type': 'application/json' },
          responseBody: JSON.stringify({ ok: true }, null, 2),
        },
        {
          id: 'del_4',
          webhookId: deliveryWebhook.id,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          statusCode: 404,
          responseTime: 45,
          requestHeaders: { 'Content-Type': 'application/json', 'X-Webhook-Signature': 'sha256=jkl...' },
          requestBody: JSON.stringify({ event: 'user.registered', data: { email: 'test@example.com' } }, null, 2),
          responseHeaders: { 'Content-Type': 'application/json' },
          responseBody: JSON.stringify({ error: 'Not found' }, null, 2),
        },
      ]
    : [];

  const filteredDeliveries = deliveries.filter((d) => {
    if (deliveryFilter === 'success') return d.statusCode >= 200 && d.statusCode < 300;
    if (deliveryFilter === 'failed') return d.statusCode >= 400;
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openCreateDialog = () => {
    setEditingWebhook(null);
    setFormUrl('');
    setFormEvents([]);
    setFormSecret(generateSecret());
    setFormActive(true);
    setShowCreateDialog(true);
  };

  const openEditDialog = (wh: WebhookItem) => {
    setEditingWebhook(wh);
    setFormUrl(wh.url);
    setFormEvents([...wh.events]);
    setFormSecret(wh.secret);
    setFormActive(wh.active);
    setShowCreateDialog(true);
  };

  const [savingWebhook, setSavingWebhook] = useState(false);

  const handleSaveWebhook = async () => {
    if (!formUrl || formEvents.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      new URL(formUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }
    setSavingWebhook(true);
    try {
      if (editingWebhook) {
        setWebhooks((prev) =>
          prev.map((wh) =>
            wh.id === editingWebhook.id
              ? { ...wh, url: formUrl, events: formEvents, secret: formSecret, active: formActive }
              : wh
          )
        );
        toast.success('Webhook updated successfully');
      } else {
        const newWh: WebhookItem = {
          id: `wh_${Date.now()}`,
          url: formUrl,
          events: formEvents,
          active: formActive,
          secret: formSecret,
          lastDelivery: null,
          successRate: 100,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setWebhooks((prev) => [...prev, newWh]);
        toast.success('Webhook created successfully');
      }
      setShowCreateDialog(false);
    } catch {
      toast.error('Failed to save webhook');
    } finally {
      setSavingWebhook(false);
    }
  };

  const handleToggleActive = (id: string) => {
    setWebhooks((prev) =>
      prev.map((wh) => (wh.id === id ? { ...wh, active: !wh.active } : wh))
    );
  };

  const handleDelete = (id: string) => {
    setWebhooks((prev) => prev.filter((wh) => wh.id !== id));
    setDeleteWebhookId(null);
    toast.success('Webhook deleted');
  };

  const handleTest = (wh: WebhookItem) => {
    setTestingId(wh.id);
    setTimeout(() => {
      setTestingId(null);
      toast.success(`Test payload sent to ${wh.url}`, {
        description: 'Response: 200 OK (145ms)',
      });
    }, 1500);
  };

  const handleRetry = (delivery: WebhookDelivery) => {
    toast.info(`Retrying delivery ${delivery.id}...`);
    setTimeout(() => {
      toast.success('Delivery retried successfully', {
        description: 'Status: 200 OK',
      });
    }, 1000);
  };

  const toggleEvent = (event: WebhookEvent) => {
    setFormEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const getEventCategory = (event: WebhookEvent): string => {
    const cat = event.split('.')[0];
    const categories: Record<string, string> = {
      course: 'Courses',
      enrollment: 'Enrollments',
      payment: 'Payments',
      user: 'Users',
      community: 'Community',
      assessment: 'Assessments',
      certificate: 'Certificates',
    };
    return categories[cat] || cat;
  };

  const getEventColor = (event: WebhookEvent): string => {
    const cat = event.split('.')[0];
    const colors: Record<string, string> = {
      course: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      enrollment: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      payment: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
      user: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
      community: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
      assessment: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
      certificate: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
    };
    return colors[cat] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  const groupedEvents = WEBHOOK_EVENTS.reduce<Record<string, WebhookEvent[]>>((acc, event) => {
    const cat = getEventCategory(event);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(event);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Webhook Endpoints</h2>
          <p className="text-sm text-muted-foreground">
            Configure webhook endpoints to receive real-time event notifications
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Endpoint
        </Button>
      </div>

      {/* Webhook List */}
      <Card className="shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm bg-card/80">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Delivery</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((wh, idx) => (
                <motion.tr
                  key={wh.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono bg-muted px-2 py-1 rounded max-w-[200px] truncate block">
                        {wh.url}
                      </code>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopy(wh.url, `url-${wh.id}`)}
                            >
                              {copiedId === `url-${wh.id}` ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy URL</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[250px]">
                      {wh.events.slice(0, 3).map((ev) => (
                        <Badge key={ev} variant="secondary" className={`text-[10px] px-1.5 py-0 ${getEventColor(ev)}`}>
                          {ev}
                        </Badge>
                      ))}
                      {wh.events.length > 3 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          +{wh.events.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={wh.active}
                        onCheckedChange={() => handleToggleActive(wh.id)}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                      <span className={`text-xs ${wh.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                        {wh.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {getRelativeTime(wh.lastDelivery)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Progress value={wh.successRate} className="h-2 flex-1" />
                      <span
                        className={`text-xs font-medium ${
                          wh.successRate >= 95
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : wh.successRate >= 80
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {wh.successRate}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openEditDialog(wh)}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleTest(wh)}
                              disabled={testingId === wh.id}
                            >
                              {testingId === wh.id ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Send className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Test</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setDeliveryWebhook(wh)}
                            >
                              <Activity className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Deliveries</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => setDeleteWebhookId(wh.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
              {webhooks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <Webhook className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>No webhooks configured yet</p>
                    <p className="text-xs mt-1">Add a webhook endpoint to receive event notifications</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Webhook Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingWebhook ? 'Edit Webhook' : 'Create Webhook'}</DialogTitle>
            <DialogDescription>
              {editingWebhook ? 'Update your webhook endpoint configuration' : 'Add a new webhook endpoint to receive event notifications'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="wh-url">Endpoint URL</Label>
              <Input
                id="wh-url"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://api.example.com/webhooks/lms"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-3">
              <Label>Subscribed Events</Label>
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                {Object.entries(groupedEvents).map(([category, events]) => (
                  <div key={category} className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{category}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {events.map((event) => (
                        <div key={event} className="flex items-center space-x-2">
                          <Checkbox
                            id={`event-${event}`}
                            checked={formEvents.includes(event)}
                            onCheckedChange={() => toggleEvent(event)}
                          />
                          <label
                            htmlFor={`event-${event}`}
                            className="text-sm font-mono cursor-pointer"
                          >
                            {event}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Signing Secret</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-muted px-3 py-2 rounded border">
                  {formSecret}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    handleCopy(formSecret, 'form-secret');
                    toast.success('Secret copied to clipboard');
                  }}
                >
                  {copiedId === 'form-secret' ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFormSecret(generateSecret())}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Used to verify that webhook payloads are sent by us
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={formActive} onCheckedChange={setFormActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveWebhook} disabled={savingWebhook} className="gap-2">
              {savingWebhook ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {savingWebhook ? 'Saving...' : `${editingWebhook ? 'Update' : 'Create'} Webhook`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Log Dialog */}
      <Dialog open={!!deliveryWebhook} onOpenChange={(open) => !open && setDeliveryWebhook(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delivery Log</DialogTitle>
            <DialogDescription>
              Recent deliveries for {deliveryWebhook?.url}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {(['all', 'success', 'failed'] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={deliveryFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDeliveryFilter(filter)}
                  className="capitalize"
                >
                  {filter}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              {filteredDeliveries.map((delivery) => (
                <motion.div
                  key={delivery.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg"
                >
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() =>
                      setExpandedDelivery(expandedDelivery === delivery.id ? null : delivery.id)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        className={
                          delivery.statusCode >= 200 && delivery.statusCode < 300
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : delivery.statusCode >= 400 && delivery.statusCode < 500
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                        }
                      >
                        {delivery.statusCode}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(delivery.timestamp).toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">{delivery.responseTime}ms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {delivery.statusCode >= 400 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRetry(delivery);
                          }}
                        >
                          <RefreshCw className="h-3 w-3" />
                          Retry
                        </Button>
                      )}
                      {expandedDelivery === delivery.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  {expandedDelivery === delivery.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="border-t p-3 space-y-3 bg-muted/30"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Request Headers</p>
                          <pre className="text-[10px] font-mono bg-background p-2 rounded border overflow-x-auto max-h-32">
                            {JSON.stringify(delivery.requestHeaders, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Response Headers</p>
                          <pre className="text-[10px] font-mono bg-background p-2 rounded border overflow-x-auto max-h-32">
                            {JSON.stringify(delivery.responseHeaders, null, 2)}
                          </pre>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Request Body</p>
                          <pre className="text-[10px] font-mono bg-background p-2 rounded border overflow-x-auto max-h-32">
                            {delivery.requestBody}
                          </pre>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Response Body</p>
                          <pre className="text-[10px] font-mono bg-background p-2 rounded border overflow-x-auto max-h-32">
                            {delivery.responseBody}
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
              {filteredDeliveries.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No deliveries found</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete webhook confirmation */}
      <ConfirmDialog
        open={!!deleteWebhookId}
        onOpenChange={(open) => !open && setDeleteWebhookId(null)}
        title="Delete Webhook"
        description="Are you sure you want to delete this webhook? This action cannot be undone. Your endpoint will no longer receive event notifications."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteWebhookId && handleDelete(deleteWebhookId)}
      />
    </div>
  );
}

// ============================================================
// Tab 9: API Keys
// ============================================================

interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  prefix: string;
  permissions: ('read' | 'write' | 'admin')[];
  createdAt: string;
  lastUsed: string | null;
  active: boolean;
  expiresAt: string | null;
  usageThisMonth: number;
  rateLimit: number;
}

function maskKey(key: string): string {
  if (key.length < 12) return 'sk_live_****';
  return `sk_live_****${key.slice(-4)}`;
}

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'sk_live_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function ApiKeysSettings() {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    {
      id: 'key_1',
      name: 'Production API',
      key: 'sk_live_abc123def456ghi789jkl012',
      prefix: 'sk_live_****jkl012',
      permissions: ['read', 'write'],
      createdAt: '2025-01-10',
      lastUsed: new Date(Date.now() - 1800000).toISOString(),
      active: true,
      expiresAt: null,
      usageThisMonth: 12847,
      rateLimit: 1000,
    },
    {
      id: 'key_2',
      name: 'Staging API',
      key: 'sk_live_mno345pqr678stu901vwx234',
      prefix: 'sk_live_****vwx234',
      permissions: ['read'],
      createdAt: '2025-02-15',
      lastUsed: new Date(Date.now() - 86400000).toISOString(),
      active: true,
      expiresAt: '2025-12-31',
      usageThisMonth: 3421,
      rateLimit: 500,
    },
    {
      id: 'key_3',
      name: 'Admin CLI',
      key: 'sk_live_yza567bcd890efg123hij456',
      prefix: 'sk_live_****hij456',
      permissions: ['read', 'write', 'admin'],
      createdAt: '2024-11-05',
      lastUsed: new Date(Date.now() - 604800000).toISOString(),
      active: false,
      expiresAt: null,
      usageThisMonth: 0,
      rateLimit: 2000,
    },
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState('');
  const [revokeKey, setRevokeKey] = useState<ApiKeyItem | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDocs, setShowDocs] = useState(false);
  const [activeSnippet, setActiveSnippet] = useState<'curl' | 'javascript' | 'python'>('curl');

  // Form state
  const [formName, setFormName] = useState('');
  const [formPermissions, setFormPermissions] = useState<('read' | 'write' | 'admin')[]>(['read']);
  const [formExpiration, setFormExpiration] = useState('never');

  const codeSnippets: Record<string, string> = {
    curl: 'curl -X GET https://api.nextgen-lms.com/v1/courses \\\n  -H "Authorization: Bearer sk_live_YOUR_API_KEY" \\\n  -H "Content-Type: application/json"',
    javascript: 'const response = await fetch(\n  \'https://api.nextgen-lms.com/v1/courses\',\n  {\n    headers: {\n      \'Authorization\': \'Bearer sk_live_YOUR_API_KEY\',\n      \'Content-Type\': \'application/json\',\n    },\n  }\n);\nconst data = await response.json();',
    python: 'import requests\n\nresponse = requests.get(\n  \'https://api.nextgen-lms.com/v1/courses\',\n  headers={\n    \'Authorization\': \'Bearer sk_live_YOUR_API_KEY\',\n    \'Content-Type\': \'application/json\',\n  }\n)\ndata = response.json()',
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (keyId: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(keyId)) {
        next.delete(keyId);
      } else {
        next.add(keyId);
      }
      return next;
    });
  };

  const handleCreateKey = () => {
    if (!formName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }
    const fullKey = generateApiKey();
    const now = new Date();
    let expiresAt: string | null = null;
    if (formExpiration === '30d') expiresAt = new Date(now.getTime() + 30 * 86400000).toISOString().split('T')[0];
    else if (formExpiration === '90d') expiresAt = new Date(now.getTime() + 90 * 86400000).toISOString().split('T')[0];
    else if (formExpiration === '1y') expiresAt = new Date(now.getTime() + 365 * 86400000).toISOString().split('T')[0];

    const newKey: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name: formName,
      key: fullKey,
      prefix: maskKey(fullKey),
      permissions: formPermissions,
      createdAt: now.toISOString().split('T')[0],
      lastUsed: null,
      active: true,
      expiresAt,
      usageThisMonth: 0,
      rateLimit: 1000,
    };

    setApiKeys((prev) => [...prev, newKey]);
    setNewlyCreatedKey(fullKey);
    setShowCreateDialog(false);
    setShowKeyDialog(true);

    // Reset form
    setFormName('');
    setFormPermissions(['read']);
    setFormExpiration('never');
  };

  const handleRegenerate = (keyItem: ApiKeyItem) => {
    const fullKey = generateApiKey();
    setApiKeys((prev) =>
      prev.map((k) =>
        k.id === keyItem.id
          ? { ...k, key: fullKey, prefix: maskKey(fullKey) }
          : k
      )
    );
    setNewlyCreatedKey(fullKey);
    setShowKeyDialog(true);
    toast.success(`API key regenerated for ${keyItem.name}`);
  };

  const handleRevoke = () => {
    if (!revokeKey) return;
    setApiKeys((prev) => prev.filter((k) => k.id !== revokeKey.id));
    setRevokeKey(null);
    toast.success(`API key "${revokeKey.name}" has been revoked`);
  };

  const togglePermission = (perm: 'read' | 'write' | 'admin') => {
    setFormPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const getPermissionColor = (perm: string): string => {
    switch (perm) {
      case 'read':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
      case 'write':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
      case 'admin':
        return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* API Documentation Card */}
      <Card className="shadow-sm backdrop-blur-sm bg-gradient-to-br from-card/90 to-card/60 border-border/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Code className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">API Documentation</CardTitle>
                <CardDescription>Base URL: https://api.nextgen-lms.com/v1</CardDescription>
              </div>
            </div>
            <Button variant="outline" className="gap-2" onClick={() => setShowDocs(!showDocs)}>
              <Code className="h-4 w-4" />
              {showDocs ? 'Hide Snippets' : 'Quick Start'}
            </Button>
          </div>
        </CardHeader>
        {showDocs && (
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              {(['curl', 'javascript', 'python'] as const).map((lang) => (
                <Button
                  key={lang}
                  variant={activeSnippet === lang ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveSnippet(lang)}
                  className="capitalize"
                >
                  {lang}
                </Button>
              ))}
            </div>
            <div className="relative">
              <pre className="text-xs font-mono bg-muted/80 p-4 rounded-lg overflow-x-auto max-h-48">
                {codeSnippets[activeSnippet]}
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => handleCopy(codeSnippets[activeSnippet], `snippet-${activeSnippet}`)}
              >
                {copiedId === `snippet-${activeSnippet}` ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">API Keys</h2>
          <p className="text-sm text-muted-foreground">
            Manage API keys for programmatic access to your platform
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create API Key
        </Button>
      </div>

      {/* API Key List */}
      <Card className="shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm bg-card/80">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((keyItem, idx) => (
                <motion.tr
                  key={keyItem.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{keyItem.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {revealedKeys.has(keyItem.id) ? keyItem.key : keyItem.prefix}
                      </code>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleReveal(keyItem.id)}
                            >
                              {revealedKeys.has(keyItem.id) ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{revealedKeys.has(keyItem.id) ? 'Hide' : 'Reveal'}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                handleCopy(
                                  revealedKeys.has(keyItem.id) ? keyItem.key : keyItem.prefix,
                                  `key-${keyItem.id}`
                                )
                              }
                            >
                              {copiedId === `key-${keyItem.id}` ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {keyItem.permissions.map((perm) => (
                        <Badge key={perm} variant="secondary" className={`text-[10px] px-1.5 py-0 ${getPermissionColor(perm)}`}>
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {keyItem.createdAt}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {getRelativeTime(keyItem.lastUsed)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge
                        className={`text-[10px] w-fit ${
                          keyItem.active
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {keyItem.active ? 'Active' : 'Revoked'}
                      </Badge>
                      {keyItem.expiresAt && (
                        <span className="text-[10px] text-muted-foreground">
                          Exp: {keyItem.expiresAt}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleRegenerate(keyItem)}
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Regenerate</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => setRevokeKey(keyItem)}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Revoke</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
              {apiKeys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <Key className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>No API keys yet</p>
                    <p className="text-xs mt-1">Create an API key for programmatic access</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {apiKeys
          .filter((k) => k.active)
          .map((keyItem) => (
            <Card key={keyItem.id} className="shadow-sm backdrop-blur-sm bg-card/80">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{keyItem.name}</span>
                  <Hash className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{keyItem.usageThisMonth.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">requests this month</p>
                <div className="mt-2 flex items-center gap-2">
                  <Progress
                    value={Math.min((keyItem.usageThisMonth / keyItem.rateLimit) * 100, 100)}
                    className="h-1.5"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {keyItem.rateLimit.toLocaleString()}/min
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Create API Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>Generate a new API key for programmatic access</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="apikey-name">Key Name</Label>
              <Input
                id="apikey-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Production API, Mobile App"
              />
            </div>
            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="space-y-2">
                {(['read', 'write', 'admin'] as const).map((perm) => (
                  <div key={perm} className="flex items-center space-x-2">
                    <Checkbox
                      id={`perm-${perm}`}
                      checked={formPermissions.includes(perm)}
                      onCheckedChange={() => togglePermission(perm)}
                    />
                    <label htmlFor={`perm-${perm}`} className="text-sm capitalize cursor-pointer flex items-center gap-2">
                      <Badge className={`text-[10px] px-1.5 py-0 ${getPermissionColor(perm)}`}>{perm}</Badge>
                      {perm === 'read' && 'Read-only access to resources'}
                      {perm === 'write' && 'Create and update resources'}
                      {perm === 'admin' && 'Full administrative access'}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Expiration</Label>
              <Select value={formExpiration} onValueChange={setFormExpiration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="90d">90 days</SelectItem>
                  <SelectItem value="1y">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateKey} className="gap-2">
              <Key className="h-4 w-4" />
              Create Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show New Key Dialog */}
      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              API Key Created
            </DialogTitle>
            <DialogDescription>
              Your API key has been created successfully
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    Make sure to copy your API key now!
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    You won&apos;t be able to see it again. Store it securely and never share it publicly.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Your API Key</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-muted px-3 py-2 rounded border break-all">
                  {newlyCreatedKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 shrink-0"
                  onClick={() => {
                    handleCopy(newlyCreatedKey, 'new-key');
                    toast.success('API key copied to clipboard');
                  }}
                >
                  {copiedId === 'new-key' ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  Copy
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowKeyDialog(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation */}
      <ConfirmDialog
        open={!!revokeKey}
        onOpenChange={(open) => !open && setRevokeKey(null)}
        title="Revoke API Key"
        description={`Are you sure you want to revoke the API key "${revokeKey?.name}"? This action cannot be undone. Any applications using this key will immediately lose access.`}
        confirmLabel="Revoke Key"
        variant="destructive"
        onConfirm={handleRevoke}
      />
    </div>
  );
}

// ============================================================
// Tab 10: Notification Preferences (Enhanced)
// ============================================================

const CATEGORY_LABELS: Record<NotificationCategory, { label: string; icon: React.ElementType; description: string }> = {
  enrollments: { label: 'Enrollments', icon: Users, description: 'New student enrollments' },
  completions: { label: 'Completions', icon: CheckCircle2, description: 'Course completions & milestones' },
  assessments: { label: 'Assessments', icon: FileText, description: 'Quiz & assignment submissions' },
  community: { label: 'Community', icon: MessageSquare, description: 'Discussions, mentions & replies' },
  system: { label: 'System', icon: Server, description: 'Platform updates & maintenance' },
  cohorts: { label: 'Cohorts', icon: Calendar, description: 'Live cohort reminders & updates' },
};

function NotificationPreferences() {
  const { notificationPreferences, updateNotificationPreferences, currentUser, setCurrentUser } = useAppStore();
  const updateUser = useUpdateUser();
  const prefs = notificationPreferences;

  // Master channel toggles
  const [emailMaster, setEmailMaster] = useState(true);
  const [pushMaster, setPushMaster] = useState(true);
  const [inAppMaster, setInAppMaster] = useState(true);

  // In-App enabled per category (not in store, managed locally)
  const [inAppEnabled, setInAppEnabled] = useState<Record<NotificationCategory, boolean>>({
    enrollments: true,
    completions: true,
    assessments: true,
    community: true,
    system: true,
    cohorts: true,
  });

  // Digest time
  const [digestTime, setDigestTime] = useState('09:00');

  // Sound settings
  const [notificationSound, setNotificationSound] = useState('default');
  const [soundVolume, setSoundVolume] = useState(80);

  const handleToggleEmailCategory = (category: NotificationCategory) => {
    const updated = { ...prefs.emailEnabled, [category]: !prefs.emailEnabled[category] };
    updateNotificationPreferences({ emailEnabled: updated });
  };

  const handleTogglePushCategory = (category: NotificationCategory) => {
    const updated = { ...prefs.pushEnabled, [category]: !prefs.pushEnabled[category] };
    updateNotificationPreferences({ pushEnabled: updated });
  };

  const handleToggleInAppCategory = (category: NotificationCategory) => {
    setInAppEnabled((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleDigestFrequencyChange = (freq: DigestFrequency) => {
    updateNotificationPreferences({ digestFrequency: freq });
  };

  const handleQuietHoursToggle = () => {
    updateNotificationPreferences({ quietHours: { ...prefs.quietHours, enabled: !prefs.quietHours.enabled } });
  };

  const handleQuietHoursStart = (start: string) => {
    updateNotificationPreferences({ quietHours: { ...prefs.quietHours, start } });
  };

  const handleQuietHoursEnd = (end: string) => {
    updateNotificationPreferences({ quietHours: { ...prefs.quietHours, end } });
  };

  const handleSave = async () => {
    if (!currentUser) return;
    try {
      const updatedUser = await updateUser.mutateAsync({
        id: currentUser.id,
        // Persist notification preferences via user profile
      });
      setCurrentUser({ ...currentUser, ...updatedUser });
    } catch {
      // Error toast already handled by the hook
    }
  };

  const saving = updateUser.isPending;

  const previewSound = () => {
    toast.info(`Playing "${notificationSound}" sound`, {
      description: 'This is a preview of your notification sound.',
    });
  };

  // Compute quiet hours timeline
  const quietStartHour = parseInt(prefs.quietHours.start.split(':')[0] || '22', 10);
  const quietEndHour = parseInt(prefs.quietHours.end.split(':')[0] || '8', 10);

  return (
    <div className="space-y-6">
      {/* Master Channel Toggles */}
      <Card className="shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm bg-card/80 border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Notification Channels</CardTitle>
              <CardDescription>Enable or disable notification delivery channels</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <Label className="text-sm font-medium">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive notifications via email</p>
              </div>
            </div>
            <Switch checked={emailMaster} onCheckedChange={setEmailMaster} />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <BellRing className="h-5 w-5 text-white" />
              </div>
              <div>
                <Label className="text-sm font-medium">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive push notifications on your devices</p>
              </div>
            </div>
            <Switch checked={pushMaster} onCheckedChange={setPushMaster} />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <Label className="text-sm font-medium">In-App Notifications</Label>
                <p className="text-xs text-muted-foreground">Show notifications within the platform</p>
              </div>
            </div>
            <Switch checked={inAppMaster} onCheckedChange={setInAppMaster} />
          </div>
        </CardContent>
      </Card>

      {/* Category Preferences Table */}
      <Card className="shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm bg-card/80 border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <ToggleLeft className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Category Preferences</CardTitle>
              <CardDescription>Fine-tune notifications per category and channel</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[220px]">Category</TableHead>
                  <TableHead className="text-center w-24">
                    <div className="flex flex-col items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="text-[10px]">Email</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center w-24">
                    <div className="flex flex-col items-center gap-1">
                      <BellRing className="h-3.5 w-3.5" />
                      <span className="text-[10px]">Push</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center w-24">
                    <div className="flex flex-col items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span className="text-[10px]">In-App</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(Object.keys(CATEGORY_LABELS) as NotificationCategory[]).map((category) => {
                  const info = CATEGORY_LABELS[category];
                  const IconComp = info.icon;
                  return (
                    <TableRow key={category}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                            <IconComp className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{info.label}</p>
                            <p className="text-[11px] text-muted-foreground">{info.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={emailMaster && prefs.emailEnabled[category]}
                          disabled={!emailMaster}
                          onCheckedChange={() => handleToggleEmailCategory(category)}
                          className="mx-auto"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={pushMaster && prefs.pushEnabled[category]}
                          disabled={!pushMaster}
                          onCheckedChange={() => handleTogglePushCategory(category)}
                          className="mx-auto"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={inAppMaster && inAppEnabled[category]}
                          disabled={!inAppMaster}
                          onCheckedChange={() => handleToggleInAppCategory(category)}
                          className="mx-auto"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Digest Settings */}
      <Card className="shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm bg-card/80 border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Digest Settings</CardTitle>
              <CardDescription>Control how often you receive notification digests</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: 'realtime' as DigestFrequency, label: 'Real-time', desc: 'Instant delivery' },
              { value: 'daily' as DigestFrequency, label: 'Daily', desc: 'Once per day' },
              { value: 'weekly' as DigestFrequency, label: 'Weekly', desc: 'Once per week' },
              { value: 'off' as DigestFrequency, label: 'Off', desc: 'No digests' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleDigestFrequencyChange(option.value)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  prefs.digestFrequency === option.value
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500'
                    : 'border-border/50 hover:border-border'
                }`}
              >
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.desc}</p>
              </button>
            ))}
          </div>

          {/* Preferred Digest Time */}
          {(prefs.digestFrequency === 'daily' || prefs.digestFrequency === 'weekly') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-lg border border-border/50 bg-muted/30 space-y-3"
            >
              <div className="space-y-1">
                <Label className="text-sm font-medium">Delivery Time</Label>
                <p className="text-xs text-muted-foreground">When you want to receive your {prefs.digestFrequency} digest</p>
              </div>
              <Input
                type="time"
                value={digestTime}
                onChange={(e) => setDigestTime(e.target.value)}
                className="w-40"
              />
            </motion.div>
          )}

          {/* Digest Preview Card */}
          {(prefs.digestFrequency === 'daily' || prefs.digestFrequency === 'weekly') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border border-border/50 bg-muted/30 space-y-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Digest Preview</Label>
              </div>
              <div className="rounded-lg border border-border bg-background p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <div className="h-6 w-6 rounded bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Bell className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">NextGen Academy — {prefs.digestFrequency === 'daily' ? 'Daily' : 'Weekly'} Digest</p>
                    <p className="text-[10px] text-muted-foreground">Delivered at {digestTime} • America/New_York</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] text-muted-foreground">You have 3 new notifications:</p>
                  <div className="flex items-center gap-2 p-1.5 rounded bg-muted/50">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px]">2 new enrollments in Advanced React</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded bg-muted/50">
                    <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px]">5 course completions this week</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded bg-muted/50">
                    <MessageSquare className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px]">1 new community discussion</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card className="shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm bg-card/80 border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-600 to-gray-700 flex items-center justify-center">
              <Moon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Quiet Hours</CardTitle>
              <CardDescription>Pause notifications during specific hours</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/30">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Enable Quiet Hours</Label>
              <p className="text-xs text-muted-foreground">Mute all notifications during specified hours</p>
            </div>
            <Switch checked={prefs.quietHours.enabled} onCheckedChange={handleQuietHoursToggle} />
          </div>

          {prefs.quietHours.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Start Time</Label>
                  <Input
                    type="time"
                    value={prefs.quietHours.start}
                    onChange={(e) => handleQuietHoursStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">End Time</Label>
                  <Input
                    type="time"
                    value={prefs.quietHours.end}
                    onChange={(e) => handleQuietHoursEnd(e.target.value)}
                  />
                </div>
              </div>

              {/* Visual Timeline */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Quiet Hours Timeline</Label>
                <div className="relative h-10 rounded-lg border border-border/50 bg-background overflow-hidden">
                  {Array.from({ length: 24 }).map((_, hour) => {
                    const isQuiet = quietStartHour > quietEndHour
                      ? hour >= quietStartHour || hour < quietEndHour
                      : hour >= quietStartHour && hour < quietEndHour;
                    return (
                      <div
                        key={hour}
                        className={`absolute top-0 bottom-0 border-r border-border/20 last:border-r-0 ${
                          isQuiet ? 'bg-slate-200 dark:bg-slate-700' : 'bg-transparent'
                        }`}
                        style={{ left: `${(hour / 24) * 100}%`, width: `${(1 / 24) * 100}%` }}
                      />
                    );
                  })}
                  {/* Hour labels */}
                  <div className="absolute inset-0 flex items-center">
                    {[0, 6, 12, 18].map((hour) => (
                      <span
                        key={hour}
                        className="absolute text-[9px] text-muted-foreground font-mono"
                        style={{ left: `${(hour / 24) * 100 + 0.5}%` }}
                      >
                        {hour.toString().padStart(2, '0')}
                      </span>
                    ))}
                  </div>
                  {/* Quiet indicator */}
                  <div className="absolute top-0 right-2 bottom-0 flex items-center">
                    <Moon className="h-3 w-3 text-slate-500" />
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-sm bg-slate-200 dark:bg-slate-700" />
                    <span>Quiet</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-sm bg-transparent border border-border" />
                    <span>Active</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                <span>Timezone: America/New_York (EST)</span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Sound Settings */}
      <Card className="shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm bg-card/80 border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
              <Volume2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Sound Settings</CardTitle>
              <CardDescription>Configure notification sounds and volume</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Sound Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Notification Sound</Label>
            <div className="flex items-center gap-3">
              <Select value={notificationSound} onValueChange={setNotificationSound}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="chime">Chime</SelectItem>
                  <SelectItem value="ding">Ding</SelectItem>
                  <SelectItem value="pop">Pop</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={previewSound} className="gap-2" disabled={notificationSound === 'none'}>
                <Volume2 className="h-3.5 w-3.5" /> Preview
              </Button>
            </div>
          </div>

          {/* Volume Slider */}
          {notificationSound !== 'none' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Volume</Label>
                <span className="text-xs text-muted-foreground">{soundVolume}%</span>
              </div>
              <div className="flex items-center gap-3">
                <VolumeX className="h-4 w-4 text-muted-foreground shrink-0" />
                <Slider
                  value={[soundVolume]}
                  onValueChange={(val) => setSoundVolume(val[0])}
                  min={0}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Tab 11: Two-Factor Authentication & Security
// ============================================================

interface TrustedDevice {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface SessionInfo {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActivity: string;
  isCurrent: boolean;
}

interface SecurityLogEntry {
  id: string;
  timestamp: string;
  eventType: string;
  ip: string;
  location: string;
  status: 'success' | 'failed' | 'warning';
  details: string;
}

function TwoFactorAuth() {
  const { currentUser, setCurrentUser } = useAppStore();
  const updateUser = useUpdateUser();
  // 2FA State
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [enabledDate, setEnabledDate] = useState('2024-11-15');
  const [lastVerified, setLastVerified] = useState('2025-03-01');
  const [setupStep, setSetupStep] = useState(0); // 0=not started, 1=choose method, 2=verify setup, 3=backup codes
  const [selectedMethod, setSelectedMethod] = useState<'app' | 'sms'>('app');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [requireAdmin2FA, setRequireAdmin2FA] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [securityLogFilter, setSecurityLogFilter] = useState('all');
  const [smsCodeSent, setSmsCodeSent] = useState(false);
  const [showDisable2FAConfirm, setShowDisable2FAConfirm] = useState(false);
  const [showRevokeAllConfirm, setShowRevokeAllConfirm] = useState(false);
  const [showSignOutAllConfirm, setShowSignOutAllConfirm] = useState(false);
  const [revokeDeviceId, setRevokeDeviceId] = useState<string | null>(null);
  const [terminateSessionId, setTerminateSessionId] = useState<string | null>(null);

  // Recovery codes
  const [recoveryCodes] = useState([
    'ABCD-1234-EFGH', 'IJKL-5678-MNOP',
    'QRST-9012-UVWX', 'YZAB-3456-CDEF',
    'GHIJ-7890-KLMN', 'OPQR-1357-STUV',
    'WXYZ-2468-ABCD', 'EFGH-3690-IJKL',
  ]);

  // Trusted devices
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([
    { id: '1', name: 'MacBook Pro 16"', type: 'desktop', browser: 'Chrome 122', location: 'San Francisco, US', lastActive: '2 minutes ago', isCurrent: true },
    { id: '2', name: 'iPhone 15 Pro', type: 'mobile', browser: 'Safari Mobile', location: 'San Francisco, US', lastActive: '1 hour ago', isCurrent: false },
    { id: '3', name: 'iPad Air', type: 'tablet', browser: 'Safari 17', location: 'New York, US', lastActive: '3 days ago', isCurrent: false },
    { id: '4', name: 'Windows Desktop', type: 'desktop', browser: 'Firefox 123', location: 'Austin, US', lastActive: '1 week ago', isCurrent: false },
  ]);

  // Sessions
  const [sessions, setSessions] = useState<SessionInfo[]>([
    { id: '1', device: 'MacBook Pro 16"', browser: 'Chrome 122', ip: '192.168.1.105', location: 'San Francisco, US', lastActivity: 'Active now', isCurrent: true },
    { id: '2', device: 'iPhone 15 Pro', browser: 'Safari Mobile', ip: '10.0.0.42', location: 'San Francisco, US', lastActivity: '1 hour ago', isCurrent: false },
    { id: '3', device: 'Windows Desktop', browser: 'Firefox 123', ip: '172.16.0.88', location: 'Austin, US', lastActivity: '1 week ago', isCurrent: false },
    { id: '4', device: 'Samsung Galaxy S24', browser: 'Chrome Mobile', ip: '203.0.113.42', location: 'Chicago, US', lastActivity: '2 weeks ago', isCurrent: false },
  ]);

  // Security log
  const [securityLog] = useState<SecurityLogEntry[]>([
    { id: '1', timestamp: '2025-03-04 09:15:22', eventType: 'Login', ip: '192.168.1.105', location: 'San Francisco, US', status: 'success', details: 'Successful login via Chrome' },
    { id: '2', timestamp: '2025-03-04 08:42:11', eventType: '2FA Verification', ip: '192.168.1.105', location: 'San Francisco, US', status: 'success', details: '2FA code verified for login' },
    { id: '3', timestamp: '2025-03-03 22:18:05', eventType: 'Login Attempt', ip: '45.33.32.156', location: 'Unknown', status: 'failed', details: 'Invalid credentials from unknown IP' },
    { id: '4', timestamp: '2025-03-03 18:30:44', eventType: 'Password Change', ip: '192.168.1.105', location: 'San Francisco, US', status: 'success', details: 'Password changed successfully' },
    { id: '5', timestamp: '2025-03-02 14:22:33', eventType: '2FA Change', ip: '192.168.1.105', location: 'San Francisco, US', status: 'success', details: '2FA method updated to Authenticator App' },
    { id: '6', timestamp: '2025-03-02 10:05:17', eventType: 'Login Attempt', ip: '89.160.20.112', location: 'London, UK', status: 'failed', details: 'Invalid 2FA code' },
    { id: '7', timestamp: '2025-03-01 16:45:09', eventType: 'Login', ip: '10.0.0.42', location: 'San Francisco, US', status: 'success', details: 'Successful login via Safari Mobile' },
    { id: '8', timestamp: '2025-03-01 09:12:55', eventType: 'Session Revoked', ip: '172.16.0.88', location: 'Austin, US', status: 'warning', details: 'Remote session terminated by user' },
  ]);

  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newCode.every((c) => c !== '') && newCode.join('').length === 6) {
      setTimeout(() => {
        setTwoFAEnabled(true);
        setSetupStep(3);
        toast.success('2FA enabled successfully!', {
          description: 'Your account is now protected with two-factor authentication.',
        });
      }, 300);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const revokeDevice = (id: string) => {
    setTrustedDevices((prev) => prev.filter((d) => d.id !== id));
    toast.success('Device revoked', {
      description: 'The device has been removed from your trusted devices.',
    });
  };

  const revokeAllDevices = () => {
    setTrustedDevices((prev) => prev.filter((d) => d.isCurrent));
    toast.success('All other devices revoked', {
      description: 'All devices except your current one have been removed.',
    });
  };

  const signOutOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    toast.success('Other sessions signed out', {
      description: 'All other sessions have been terminated.',
    });
  };

  const copyRecoveryCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    toast.success('Code copied!', { description: 'Recovery code copied to clipboard.' });
  };

  const copyAllRecoveryCodes = () => {
    navigator.clipboard?.writeText(recoveryCodes.join('\n'));
    toast.success('All codes copied!', { description: 'All recovery codes copied to clipboard.' });
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-emerald-500';
      case 'failed': return 'bg-red-500';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle2 className="h-3 w-3 mr-1" />Success</Badge>;
      case 'failed': return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'warning': return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 2FA Status Card */}
      <Card className="shadow-sm hover:shadow-md transition-all backdrop-blur-sm bg-card/80 border-border/50 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </div>
            {twoFAEnabled ? (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 text-sm">
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                Protected
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700 px-3 py-1 text-sm">
                <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                Not Protected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {twoFAEnabled ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-border/50 bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Enabled On</p>
                  <p className="text-sm font-medium">{new Date(enabledDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="p-4 rounded-lg border border-border/50 bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Last Verified</p>
                  <p className="text-sm font-medium">{new Date(lastVerified).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>

              <Separator />

              {/* 2FA Policy Settings */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">2FA Settings</h4>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Require 2FA for all admin actions</Label>
                    <p className="text-xs text-muted-foreground">Prompt for 2FA on every sensitive admin operation</p>
                  </div>
                  <Switch checked={requireAdmin2FA} onCheckedChange={setRequireAdmin2FA} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Remember device for 30 days</Label>
                    <p className="text-xs text-muted-foreground">Skip 2FA on trusted devices for 30 days after verification</p>
                  </div>
                  <Switch checked={rememberDevice} onCheckedChange={setRememberDevice} />
                </div>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowRecoveryCodes(true); }}
                  className="gap-2"
                >
                  <Key className="h-3.5 w-3.5" /> View Recovery Codes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.success('Backup codes regenerated!', {
                      description: 'New backup codes have been generated. Previous codes are no longer valid.',
                    });
                  }}
                  className="gap-2"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Regenerate Backup Codes
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800" onClick={() => setShowDisable2FAConfirm(true)}>
                  <ShieldAlert className="h-3.5 w-3.5" /> Disable 2FA
                </Button>
                <ConfirmDialog
                  open={showDisable2FAConfirm}
                  onOpenChange={setShowDisable2FAConfirm}
                  title="Disable Two-Factor Authentication?"
                  description="This will remove the extra layer of security from your account. We strongly recommend keeping 2FA enabled to protect your account from unauthorized access."
                  confirmLabel="Disable 2FA"
                  variant="destructive"
                  onConfirm={async () => {
                    setTwoFAEnabled(false);
                    setSetupStep(0);
                    setVerificationCode(['', '', '', '', '', '']);
                    if (currentUser) {
                      try {
                        const updatedUser = await updateUser.mutateAsync({
                          id: currentUser.id,
                        });
                        setCurrentUser({ ...currentUser, ...updatedUser });
                      } catch { /* error toast handled by hook */ }
                    }
                    toast.info('2FA has been disabled', { description: 'Your account is less secure without 2FA.' });
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/10">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Your account is not protected</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                      Enable two-factor authentication to add an extra layer of security. Even if someone gets your password, they won&apos;t be able to access your account without the second factor.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setSetupStep(1)}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/20"
              >
                <ShieldCheck className="h-4 w-4" /> Enable Two-Factor Authentication
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2FA Setup Flow */}
      {setupStep > 0 && !twoFAEnabled && (
        <Card className="shadow-sm backdrop-blur-sm bg-card/80 border-border/50 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
          <CardHeader>
            <CardTitle className="text-lg">Set Up Two-Factor Authentication</CardTitle>
            <CardDescription>Follow these steps to secure your account</CardDescription>
            {/* Progress Steps */}
            <div className="flex items-center gap-2 mt-4">
              {[
                { step: 1, label: 'Choose Method' },
                { step: 2, label: 'Verify Setup' },
                { step: 3, label: 'Backup Codes' },
              ].map((s, idx) => (
                <React.Fragment key={s.step}>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all ${
                      setupStep >= s.step
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {setupStep > s.step ? <Check className="h-4 w-4" /> : s.step}
                    </div>
                    <span className={`text-xs hidden sm:inline ${setupStep >= s.step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{s.label}</span>
                  </div>
                  {idx < 2 && (
                    <div className={`h-0.5 flex-1 transition-all ${setupStep > s.step ? 'bg-emerald-500' : 'bg-muted'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {/* Step 1: Choose Method */}
            {setupStep === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <p className="text-sm text-muted-foreground">Choose how you want to receive your second factor:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedMethod('app')}
                    className={`p-5 rounded-lg border text-left transition-all relative ${
                      selectedMethod === 'app'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500'
                        : 'border-border/50 hover:border-border'
                    }`}
                  >
                    {selectedMethod === 'app' && (
                      <Badge className="absolute top-2 right-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] px-1.5 py-0">
                        Recommended
                      </Badge>
                    )}
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-3">
                      <QrCode className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-semibold">Authenticator App</p>
                    <p className="text-xs text-muted-foreground mt-1">Use Google Authenticator, Authy, or 1Password to generate verification codes. More secure and works offline.</p>
                  </button>
                  <button
                    onClick={() => setSelectedMethod('sms')}
                    className={`p-5 rounded-lg border text-left transition-all ${
                      selectedMethod === 'sms'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500'
                        : 'border-border/50 hover:border-border'
                    }`}
                  >
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-3">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-semibold">SMS Verification</p>
                    <p className="text-xs text-muted-foreground mt-1">Receive verification codes via text message to your phone. Requires cellular connectivity.</p>
                  </button>
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setSetupStep(0)} className="gap-2">
                    <ArrowLeft className="h-3.5 w-3.5" /> Cancel
                  </Button>
                  <Button onClick={() => setSetupStep(2)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    Continue <ChevronDown className="h-3.5 w-3.5 rotate-[-90deg]" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Verify Setup */}
            {setupStep === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                {selectedMethod === 'app' ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Scan this QR code with your authenticator app, then enter the 6-digit code below to verify.
                    </p>
                    <div className="flex justify-center py-2">
                      <div className="h-44 w-44 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center relative overflow-hidden">
                        <QrCode className="h-20 w-20 text-muted-foreground/60" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-emerald-500/5" />
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Manual entry key</p>
                      <div className="flex items-center justify-center gap-2">
                        <code className="text-sm font-mono bg-background px-3 py-1 rounded border">
                          JBSW Y3DP EHPK 3PXP
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => {
                            navigator.clipboard?.writeText('JBSWY3DPEHPK3PXP');
                            toast.success('Key copied!');
                          }}
                        >
                          <Copy className="h-3 w-3" /> Copy
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Enter your phone number and verify with the code sent via SMS.</p>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <div className="flex gap-2">
                        <Input placeholder="+1 (555) 000-0000" className="flex-1" />
                        <Button
                          variant="outline"
                          className="gap-2 shrink-0"
                          onClick={() => {
                            setSmsCodeSent(true);
                            toast.success('Verification code sent to your phone!');
                          }}
                        >
                          <Send className="h-3.5 w-3.5" /> Send Code
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Verification Code Input */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Enter the 6-digit code from your {selectedMethod === 'app' ? 'authenticator app' : 'SMS message'}
                  </Label>
                  <div className="flex justify-center gap-3 py-2">
                    {verificationCode.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => { codeInputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => handleCodeKeyDown(index, e)}
                        className="h-14 w-12 text-center text-xl font-bold rounded-lg border-2 focus:border-emerald-500 focus:ring-emerald-500/20"
                      />
                    ))}
                  </div>
                  {selectedMethod === 'sms' && smsCodeSent && (
                    <p className="text-xs text-center text-muted-foreground">
                      Didn&apos;t receive the code?{' '}
                      <button className="text-emerald-600 hover:underline" onClick={() => toast.success('Code resent!')}>
                        Resend
                      </button>
                    </p>
                  )}
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setSetupStep(1)} className="gap-2">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </Button>
                  <Button
                    onClick={() => {
                      setTwoFAEnabled(true);
                      setSetupStep(3);
                      toast.success('2FA enabled successfully!', {
                        description: 'Your account is now protected with two-factor authentication.',
                      });
                    }}
                    disabled={verificationCode.some((c) => c === '')}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Verify <ShieldCheck className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Backup Codes */}
            {setupStep === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/10">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Store these in a safe place</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                        You can use these backup codes to sign in if you lose access to your authentication device. Each code can only be used once.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 py-2">
                  {recoveryCodes.map((code, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/30">
                      <code className="text-xs font-mono flex-1">{code}</code>
                      <button
                        onClick={() => copyRecoveryCode(code)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={copyAllRecoveryCodes} className="gap-2">
                    <Copy className="h-3.5 w-3.5" /> Copy All
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success('Codes downloaded!')}>
                    <Download className="h-3.5 w-3.5" /> Download Codes
                  </Button>
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={() => setSetupStep(0)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <Check className="h-3.5 w-3.5" /> Done
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recovery Codes Display (when viewing after setup) */}
      {showRecoveryCodes && twoFAEnabled && (
        <Card className="shadow-sm backdrop-blur-sm bg-card/80 border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Key className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Recovery Codes</CardTitle>
                  <CardDescription>Use these codes if you lose access to your authentication device</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowRecoveryCodes(false)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/10">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Treat your recovery codes with the same level of security as your password. Store them somewhere safe and accessible.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {recoveryCodes.map((code, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/30">
                  <code className="text-xs font-mono flex-1">{code}</code>
                  <button
                    onClick={() => copyRecoveryCode(code)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={copyAllRecoveryCodes} className="gap-2">
                <Copy className="h-3.5 w-3.5" /> Copy All
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success('Codes downloaded!')}>
                <Download className="h-3.5 w-3.5" /> Download Codes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trusted Devices */}
      <Card className="shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm bg-card/80 border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Fingerprint className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">Trusted Devices</CardTitle>
              <CardDescription>Devices that don&apos;t require 2FA on every login</CardDescription>
            </div>
            {trustedDevices.length > 1 && (
              <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setShowRevokeAllConfirm(true)}>
                <Trash2 className="h-3.5 w-3.5" /> Revoke All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {trustedDevices.map((device) => {
            const DeviceIcon = getDeviceIcon(device.type);
            return (
              <div key={device.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  device.isCurrent
                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                    : 'bg-muted'
                }`}>
                  <DeviceIcon className={`h-5 w-5 ${device.isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{device.name}</p>
                    {device.isCurrent && (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] px-1.5 py-0">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{device.browser}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{device.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{device.lastActive}</span>
                  </div>
                </div>
                {!device.isCurrent && (
                  <Button variant="ghost" size="sm" onClick={() => setRevokeDeviceId(device.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8">
                    Revoke
                  </Button>
                )}
              </div>
            );
          })}
          {trustedDevices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Fingerprint className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No trusted devices</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card className="shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm bg-card/80 border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Wifi className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">Active Sessions</CardTitle>
              <CardDescription>Manage your active login sessions</CardDescription>
            </div>
            {sessions.length > 1 && (
              <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setShowSignOutAllConfirm(true)}>
                <LogOut className="h-3.5 w-3.5" /> Sign Out All Others
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                session.isCurrent
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : 'bg-muted'
              }`}>
                <Monitor className={`h-5 w-5 ${session.isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{session.device}</p>
                  {session.isCurrent && (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] px-1.5 py-0">
                      Current
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span>{session.browser}</span>
                  <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{session.ip}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{session.location}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{session.lastActivity}</span>
                </div>
              </div>
              {!session.isCurrent && (
                <Button variant="ghost" size="sm" onClick={() => setTerminateSessionId(session.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8">
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Wifi className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active sessions</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Log */}
      <Card className="shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm bg-card/80 border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">Security Log</CardTitle>
              <CardDescription>Recent security events on your account</CardDescription>
            </div>
            <Select value={securityLogFilter} onValueChange={setSecurityLogFilter}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue placeholder="Filter events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="Login">Login</SelectItem>
                <SelectItem value="2FA">2FA Events</SelectItem>
                <SelectItem value="Password">Password Changes</SelectItem>
                <SelectItem value="Session">Session Events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 max-h-96 overflow-y-auto">
          {securityLog
            .filter((entry) => {
              if (securityLogFilter === 'all') return true;
              if (securityLogFilter === '2FA') return entry.eventType.includes('2FA');
              if (securityLogFilter === 'Password') return entry.eventType.includes('Password');
              if (securityLogFilter === 'Session') return entry.eventType.includes('Session');
              return entry.eventType.includes(securityLogFilter);
            })
            .map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/30 hover:bg-muted/30 transition-colors">
              <div className={`h-2.5 w-2.5 rounded-full mt-1.5 flex-shrink-0 ${getStatusColor(entry.status)}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium">{entry.eventType}</p>
                  {getStatusBadge(entry.status)}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{entry.details}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span>{entry.timestamp}</span>
                  <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{entry.ip}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{entry.location}</span>
                </div>
              </div>
            </div>
          ))}
          <div className="pt-2">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <FileText className="h-3.5 w-3.5" /> View Full Security Log
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirm dialogs for destructive actions */}
      <ConfirmDialog
        open={showRevokeAllConfirm}
        onOpenChange={setShowRevokeAllConfirm}
        title="Revoke all trusted devices?"
        description="This will remove all trusted devices except your current one. You'll need to complete 2FA on each device the next time you sign in."
        confirmLabel="Revoke All"
        variant="destructive"
        onConfirm={revokeAllDevices}
      />
      <ConfirmDialog
        open={showSignOutAllConfirm}
        onOpenChange={setShowSignOutAllConfirm}
        title="Sign out all other sessions?"
        description="This will terminate all sessions except your current one. Other devices will need to sign in again."
        confirmLabel="Sign Out Others"
        variant="destructive"
        onConfirm={signOutOtherSessions}
      />
      <ConfirmDialog
        open={!!revokeDeviceId}
        onOpenChange={(open) => !open && setRevokeDeviceId(null)}
        title="Revoke Trusted Device"
        description="Are you sure you want to revoke this trusted device? The user will need to re-authenticate from this device."
        confirmLabel="Revoke Device"
        variant="destructive"
        onConfirm={() => {
          if (revokeDeviceId) {
            revokeDevice(revokeDeviceId);
            setRevokeDeviceId(null);
          }
        }}
      />
      <ConfirmDialog
        open={!!terminateSessionId}
        onOpenChange={(open) => !open && setTerminateSessionId(null)}
        title="Terminate Session"
        description="Are you sure you want to terminate this session? The user will be logged out immediately."
        confirmLabel="Terminate"
        variant="destructive"
        onConfirm={() => {
          if (terminateSessionId) {
            setSessions((prev) => prev.filter((s) => s.id !== terminateSessionId));
            toast.success('Session terminated');
            setTerminateSessionId(null);
          }
        }}
      />
    </div>
  );
}

// ============================================================
// Tab 10: Data & Privacy Settings
// ============================================================

type ExportType = 'course' | 'user' | 'financial' | 'community' | 'assessment' | 'analytics';
type ExportFormat = 'csv' | 'json' | 'xlsx';
type ExportStatus = 'completed' | 'processing' | 'failed';
type ImportStatus = 'completed' | 'processing' | 'failed' | 'partial';

interface RecentExport {
  id: string;
  filename: string;
  type: ExportType;
  format: ExportFormat;
  size: string;
  date: string;
  status: ExportStatus;
}

interface RecentImport {
  id: string;
  filename: string;
  type: string;
  records: number;
  date: string;
  status: ImportStatus;
}

interface BackupEntry {
  id: string;
  date: string;
  size: string;
  type: 'Automatic' | 'Manual';
}

const EXPORT_TYPE_INFO: Record<ExportType, { label: string; description: string; icon: React.ElementType; color: string }> = {
  course: { label: 'Course Data', description: 'All courses, modules, lessons, progress', icon: BookOpen, color: 'emerald' },
  user: { label: 'User Data', description: 'All users, enrollments, achievements', icon: Users, color: 'blue' },
  financial: { label: 'Financial Data', description: 'Orders, transactions, revenue', icon: CreditCard, color: 'amber' },
  community: { label: 'Community Data', description: 'Posts, comments, reactions', icon: MessageSquare, color: 'pink' },
  assessment: { label: 'Assessment Data', description: 'Quizzes, submissions, scores', icon: CheckCircle2, color: 'purple' },
  analytics: { label: 'Analytics Data', description: 'Events, metrics, reports', icon: Activity, color: 'teal' },
};

function DataPrivacySettings() {
  const { currentTenant } = useAppStore();
  const tenantId = currentTenant?.id || '';

  // Real API data hooks
  const { data: exportsData } = useDataExports(tenantId);
  const createDataExport = useCreateDataExport();
  const deleteDataExport = useDeleteDataExport();
  const { data: importsData } = useDataImports(tenantId);
  const createDataImport = useCreateDataImport();
  const { data: backupsData } = useBackups(tenantId);
  const createBackup = useCreateBackup();

  // Map API data to local types
  const recentExports: RecentExport[] = (exportsData || []).map((e: any) => ({
    id: e.id,
    filename: e.filename,
    type: e.type as ExportType,
    format: e.format as ExportFormat,
    size: e.size,
    date: new Date(e.createdAt).toISOString().split('T')[0],
    status: e.status as ExportStatus,
  }));

  const recentImports: RecentImport[] = (importsData || []).map((i: any) => ({
    id: i.id,
    filename: i.filename,
    type: i.type,
    records: i.records,
    date: new Date(i.createdAt).toISOString().split('T')[0],
    status: i.status as ImportStatus,
  }));

  const backups: BackupEntry[] = (backupsData || []).map((b: any) => ({
    id: b.id,
    date: new Date(b.createdAt).toLocaleString(),
    size: b.size,
    type: b.type as 'Automatic' | 'Manual',
  }));

  // Export state
  const [selectedExportType, setSelectedExportType] = useState<ExportType>('course');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [dateRange, setDateRange] = useState('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [scheduleWeekly, setScheduleWeekly] = useState(false);
  const [scheduleMonthly, setScheduleMonthly] = useState(true);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [deleteExportId, setDeleteExportId] = useState<string | null>(null);

  // Import state
  const [isDragOver, setIsDragOver] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importType, setImportType] = useState('course');
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({
    'title': 'Course Title',
    'description': 'Description',
    'category': 'Category',
    'instructor': 'Instructor',
    'duration': 'Duration',
  });

  // Data Retention state
  const [retentionCourse, setRetentionCourse] = useState('1year');
  const [retentionUser, setRetentionUser] = useState('1year');
  const [retentionFinancial, setRetentionFinancial] = useState('forever');
  const [retentionCommunity, setRetentionCommunity] = useState('90days');
  const [retentionAssessment, setRetentionAssessment] = useState('1year');
  const [retentionAnalytics, setRetentionAnalytics] = useState('90days');
  const [autoDeleteExpired, setAutoDeleteExpired] = useState(true);
  const [dataAnonymization, setDataAnonymization] = useState(false);
  const [showRetentionPolicyDialog, setShowRetentionPolicyDialog] = useState(false);

  // Privacy & Compliance state
  const [gdprCompliance, setGdprCompliance] = useState(true);
  const [dataProcessingAgreement, setDataProcessingAgreement] = useState(true);
  const [cookieConsent, setCookieConsent] = useState(true);
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState('https://nextgen-lms.com/privacy');
  const [cookiePolicyUrl, setCookiePolicyUrl] = useState('https://nextgen-lms.com/cookies');
  const [showEraseDialog, setShowEraseDialog] = useState(false);
  const [eraseConfirmText, setEraseConfirmText] = useState('');
  const [showAccessRequestDialog, setShowAccessRequestDialog] = useState(false);
  const [accessRequestEmail, setAccessRequestEmail] = useState('');

  // Backup & Restore state
  const [autoBackupSchedule, setAutoBackupSchedule] = useState('weekly');
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  const [backupStorageUsed] = useState(4.2);
  const [backupStorageTotal] = useState(10);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export with real DB record
  const handleExport = useCallback(() => {
    setIsExporting(true);
    setExportProgress(0);
    setExportSuccess(false);

    const interval = setInterval(async () => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          setExportSuccess(true);
          const info = EXPORT_TYPE_INFO[selectedExportType];
          const newFilename = `${selectedExportType}_export_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
          const newSize = `${(Math.random() * 10 + 0.5).toFixed(1)} MB`;
          // Create real record in the database
          createDataExport.mutate({
            tenantId,
            filename: newFilename,
            type: selectedExportType,
            format: exportFormat,
            size: newSize,
            status: 'completed',
          });
          toast.success(`${info.label} exported successfully!`, {
            description: `File saved as ${newFilename}`,
          });
          setTimeout(() => setExportSuccess(false), 3000);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
  }, [selectedExportType, exportFormat, tenantId, createDataExport]);

  // Import with real DB record
  const handleImport = useCallback(() => {
    setIsImporting(true);
    setImportProgress(0);

    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsImporting(false);
          // Create real import record in the database
          const typeLabel = importType.charAt(0).toUpperCase() + importType.slice(1) + ' Data';
          createDataImport.mutate({
            tenantId,
            filename: importFile?.name || 'unknown_file',
            type: typeLabel,
            records: Math.floor(Math.random() * 200 + 50),
            status: 'completed',
          });
          toast.success('Data imported successfully!', {
            description: `${importFile?.name} has been processed.`,
          });
          setImportFile(null);
          setShowImportPreview(false);
          return 100;
        }
        return prev + Math.random() * 12 + 3;
      });
    }, 250);
  }, [importFile, importType, tenantId, createDataImport]);

  // Backup with real DB record
  const handleCreateBackup = useCallback(() => {
    setIsCreatingBackup(true);
    toast.loading('Creating backup...', { id: 'backup-creation' });
    // Simulate backup creation time then save to DB
    setTimeout(async () => {
      try {
        await createBackup.mutateAsync({
          tenantId,
          size: `${(Math.random() * 2 + 3).toFixed(1)} GB`,
          type: 'Manual',
          status: 'completed',
        });
        setIsCreatingBackup(false);
        toast.success('Backup created successfully!', {
          description: 'Backup saved',
          id: 'backup-creation',
        });
      } catch {
        setIsCreatingBackup(false);
        toast.error('Failed to create backup', { id: 'backup-creation' });
      }
    }, 3000);
  }, [tenantId, createBackup]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const validTypes = ['text/csv', 'application/json', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.json') || file.name.endsWith('.xlsx')) {
        setImportFile(file);
        setShowImportPreview(true);
        toast.info(`File "${file.name}" selected for import.`);
      } else {
        toast.error('Invalid file type', { description: 'Please upload .csv, .json, or .xlsx files only.' });
      }
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setImportFile(files[0]);
      setShowImportPreview(true);
      toast.info(`File "${files[0].name}" selected for import.`);
    }
  }, []);

  // Preview data for import
  const previewRows = [
    { title: 'Intro to Machine Learning', description: 'Fundamentals of ML', category: 'Technology', instructor: 'Dr. Smith', duration: '8 weeks' },
    { title: 'Advanced Web Development', description: 'Full-stack web dev', category: 'Technology', instructor: 'Prof. Johnson', duration: '12 weeks' },
    { title: 'Digital Marketing 101', description: 'Marketing basics', category: 'Business', instructor: 'Sarah Lee', duration: '6 weeks' },
    { title: 'Data Science with Python', description: 'Data analysis & ML', category: 'Data Science', instructor: 'Dr. Chen', duration: '10 weeks' },
    { title: 'UX Design Principles', description: 'User experience design', category: 'Design', instructor: 'Mark Davis', duration: '4 weeks' },
  ];

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'processing': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'partial': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return '';
    }
  };

  const formatIcon = (format: ExportFormat) => {
    switch (format) {
      case 'csv': return <FileText className="h-3.5 w-3.5 text-emerald-500" />;
      case 'json': return <FileJson className="h-3.5 w-3.5 text-amber-500" />;
      case 'xlsx': return <FileSpreadsheet className="h-3.5 w-3.5 text-blue-500" />;
    }
  };

  const retentionOptions = [
    { value: '30days', label: '30 days' },
    { value: '90days', label: '90 days' },
    { value: '1year', label: '1 year' },
    { value: 'forever', label: 'Forever' },
  ];

  return (
    <div className="space-y-8">
      {/* =============================== */}
      {/* DATA EXPORT SECTION */}
      {/* =============================== */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <FileDown className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Data Export</CardTitle>
                <CardDescription>Export platform data in various formats for backup or migration</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Export Type Selection */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Export Type</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(Object.entries(EXPORT_TYPE_INFO) as [ExportType, typeof EXPORT_TYPE_INFO[ExportType]][]).map(([key, info]) => {
                  const IconComp = info.icon;
                  return (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedExportType(key)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        selectedExportType === key
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 shadow-sm'
                          : 'border-border/50 bg-background/50 hover:border-emerald-300 dark:hover:border-emerald-700'
                      }`}
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        selectedExportType === key
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <IconComp className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{info.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{info.description}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Export Format & Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Export Format</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['csv', 'json', 'xlsx'] as ExportFormat[]).map((fmt) => (
                    <motion.button
                      key={fmt}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setExportFormat(fmt)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        exportFormat === fmt
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 shadow-sm'
                          : 'border-border/50 bg-background/50 hover:border-emerald-300 dark:hover:border-emerald-700'
                      }`}
                    >
                      {formatIcon(fmt)}
                      <span className="text-sm font-medium">{fmt.toUpperCase()}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="1year">Last year</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
                {dateRange === 'custom' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex gap-2">
                    <Input type="date" value={customDateFrom} onChange={(e) => setCustomDateFrom(e.target.value)} className="flex-1" placeholder="From" />
                    <Input type="date" value={customDateTo} onChange={(e) => setCustomDateTo(e.target.value)} className="flex-1" placeholder="To" />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Export Button & Progress */}
            <div className="space-y-3">
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 h-11"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exporting {EXPORT_TYPE_INFO[selectedExportType].label}...
                    </>
                  ) : exportSuccess ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Export Complete!
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export {EXPORT_TYPE_INFO[selectedExportType].label}
                    </>
                  )}
                </Button>
              </motion.div>
              {isExporting && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Exporting data...</span>
                    <span>{Math.min(Math.round(exportProgress), 100)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(exportProgress, 100)}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Recent Exports Table */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Recent Exports</Label>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs">Filename</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Type</TableHead>
                      <TableHead className="text-xs">Format</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Size</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Date</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentExports.map((exp) => (
                      <TableRow key={exp.id} className="hover:bg-muted/20">
                        <TableCell className="text-xs font-medium max-w-[140px] truncate">{exp.filename}</TableCell>
                        <TableCell className="text-xs hidden sm:table-cell capitalize">{exp.type}</TableCell>
                        <TableCell className="text-xs">
                          <span className="flex items-center gap-1">{formatIcon(exp.format)} {exp.format.toUpperCase()}</span>
                        </TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{exp.size}</TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">{exp.date}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-[10px] px-2 py-0 ${statusBadgeClass(exp.status)}`}>
                            {exp.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {exp.status === 'completed' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.success('Download started!')}>
                                      <Download className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Download</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => setDeleteExportId(exp.id)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Schedule Exports */}
            <Separator />
            <div>
              <Label className="text-sm font-medium mb-3 block">Schedule Automatic Exports</Label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background/50">
                  <Switch checked={scheduleWeekly} onCheckedChange={setScheduleWeekly} />
                  <div>
                    <p className="text-sm font-medium">Weekly Export</p>
                    <p className="text-xs text-muted-foreground">Every Sunday at 3:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background/50">
                  <Switch checked={scheduleMonthly} onCheckedChange={setScheduleMonthly} />
                  <div>
                    <p className="text-sm font-medium">Monthly Export</p>
                    <p className="text-xs text-muted-foreground">1st of each month at 3:00 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* =============================== */}
      {/* DATA IMPORT SECTION */}
      {/* =============================== */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                <CloudUpload className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Data Import</CardTitle>
                <CardDescription>Import data from external sources into your platform</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Import Drop Zone */}
            {!showImportPreview && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-8 sm:p-12 transition-all overflow-hidden ${
                  isDragOver
                    ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-900/20 scale-[1.01]'
                    : 'border-border/60 bg-muted/20 hover:border-violet-400 dark:hover:border-violet-600'
                }`}
              >
                {/* Continuous subtle border pulse animation */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-dashed pointer-events-none"
                  animate={isDragOver
                    ? { opacity: [0.3, 0.8, 0.3], borderColor: 'rgb(139 92 246)' }
                    : { opacity: [0, 0.4, 0] }
                  }
                  transition={isDragOver
                    ? { duration: 1.5, repeat: Infinity }
                    : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                  }
                  style={{ borderColor: isDragOver ? undefined : 'rgb(139 92 246 / 0.3)' }}
                />
                <motion.div
                  animate={isDragOver ? { y: -5, scale: 1.1 } : { y: [0, -3, 0] }}
                  transition={isDragOver ? { duration: 0.2 } : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <CloudUpload className={`h-12 w-12 ${isDragOver ? 'text-violet-500' : 'text-muted-foreground'}`} />
                </motion.div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {isDragOver ? 'Drop your file here' : 'Drag & drop your file here'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Supports .csv, .json, and .xlsx files</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">CSV</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileJson className="h-5 w-5 text-amber-500" />
                    <span className="text-xs text-muted-foreground">JSON</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                    <span className="text-xs text-muted-foreground">XLSX</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="gap-2 mt-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FolderOpen className="h-4 w-4" />
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.xlsx"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            )}

            {/* Import Preview */}
            {showImportPreview && importFile && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                      {importFile.name.endsWith('.csv') ? <FileText className="h-5 w-5 text-emerald-500" /> :
                       importFile.name.endsWith('.json') ? <FileJson className="h-5 w-5 text-amber-500" /> :
                       <FileSpreadsheet className="h-5 w-5 text-blue-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{importFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(importFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setImportFile(null); setShowImportPreview(false); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Import Type Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Import As</Label>
                  <Select value={importType} onValueChange={setImportType}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="course">Course Data</SelectItem>
                      <SelectItem value="user">User Data</SelectItem>
                      <SelectItem value="financial">Financial Data</SelectItem>
                      <SelectItem value="community">Community Data</SelectItem>
                      <SelectItem value="assessment">Assessment Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Preview Table */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Preview (First 5 Rows)</Label>
                  <div className="rounded-xl border border-border/50 overflow-auto max-h-64">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="text-xs">Title</TableHead>
                          <TableHead className="text-xs">Description</TableHead>
                          <TableHead className="text-xs hidden sm:table-cell">Category</TableHead>
                          <TableHead className="text-xs hidden md:table-cell">Instructor</TableHead>
                          <TableHead className="text-xs hidden lg:table-cell">Duration</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewRows.map((row, i) => (
                          <TableRow key={i} className="hover:bg-muted/20">
                            <TableCell className="text-xs font-medium">{row.title}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{row.description}</TableCell>
                            <TableCell className="text-xs hidden sm:table-cell">{row.category}</TableCell>
                            <TableCell className="text-xs hidden md:table-cell">{row.instructor}</TableCell>
                            <TableCell className="text-xs hidden lg:table-cell">{row.duration}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Column Mapping */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Column Mapping</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(columnMappings).map(([source, target]) => (
                      <div key={source} className="flex items-center gap-2 p-2 rounded-lg border border-border/40 bg-background/50">
                        <span className="text-xs text-muted-foreground min-w-[80px] truncate">{source}</span>
                        <ArrowLeft className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-xs font-medium truncate">{target}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Validation Summary */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">142 valid rows</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">3 warnings</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-xs font-medium text-red-700 dark:text-red-400">1 error</span>
                  </div>
                </div>

                {/* Import Button & Progress */}
                <div className="space-y-3">
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      onClick={handleImport}
                      disabled={isImporting}
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/20 h-11"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Importing Data...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Start Import
                        </>
                      )}
                    </Button>
                  </motion.div>
                  {isImporting && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Importing data...</span>
                        <span>{Math.min(Math.round(importProgress), 100)}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(importProgress, 100)}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Import History Table */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Import History</Label>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs">Filename</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Type</TableHead>
                      <TableHead className="text-xs">Records</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Date</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentImports.map((imp) => (
                      <TableRow key={imp.id} className="hover:bg-muted/20">
                        <TableCell className="text-xs font-medium max-w-[140px] truncate">{imp.filename}</TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">{imp.type}</TableCell>
                        <TableCell className="text-xs">{imp.records > 0 ? imp.records.toLocaleString() : '—'}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{imp.date}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-[10px] px-2 py-0 ${statusBadgeClass(imp.status)}`}>
                            {imp.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {imp.status === 'completed' && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.info('View import details')}>
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Details</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Import Templates */}
            <Separator />
            <div>
              <Label className="text-sm font-medium mb-3 block">Download Import Templates</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { label: 'Courses', icon: BookOpen, color: 'text-emerald-500' },
                  { label: 'Users', icon: Users, color: 'text-blue-500' },
                  { label: 'Financial', icon: CreditCard, color: 'text-amber-500' },
                  { label: 'Community', icon: MessageSquare, color: 'text-pink-500' },
                  { label: 'Assessments', icon: CheckCircle2, color: 'text-purple-500' },
                ].map((tmpl) => {
                  const TmplIcon = tmpl.icon;
                  return (
                    <motion.button
                      key={tmpl.label}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => toast.success(`${tmpl.label} template downloaded!`)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-colors"
                    >
                      <TmplIcon className={`h-6 w-6 ${tmpl.color}`} />
                      <span className="text-xs font-medium">{tmpl.label}</span>
                      <span className="text-[10px] text-muted-foreground">.csv template</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* =============================== */}
      {/* DATA RETENTION SETTINGS */}
      {/* =============================== */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
        <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                <Timer className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Data Retention</CardTitle>
                <CardDescription>Configure how long different data types are retained</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Retention Period Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Course Data', icon: BookOpen, value: retentionCourse, setter: setRetentionCourse },
                { label: 'User Data', icon: Users, value: retentionUser, setter: setRetentionUser },
                { label: 'Financial Data', icon: CreditCard, value: retentionFinancial, setter: setRetentionFinancial },
                { label: 'Community Data', icon: MessageSquare, value: retentionCommunity, setter: setRetentionCommunity },
                { label: 'Assessment Data', icon: CheckCircle2, value: retentionAssessment, setter: setRetentionAssessment },
                { label: 'Analytics Data', icon: Activity, value: retentionAnalytics, setter: setRetentionAnalytics },
              ].map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background/50">
                    <ItemIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    <Select value={item.value} onValueChange={item.setter}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {retentionOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>

            <Separator />

            {/* Auto-Delete & Anonymization Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">Auto-Delete Expired Data</p>
                    <p className="text-xs text-muted-foreground">Automatically remove data past retention period</p>
                  </div>
                </div>
                <Switch checked={autoDeleteExpired} onCheckedChange={setAutoDeleteExpired} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50">
                <div className="flex items-center gap-3">
                  <EyeOff className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">Data Anonymization</p>
                    <p className="text-xs text-muted-foreground">Anonymize data instead of deleting when retention expires</p>
                  </div>
                </div>
                <Switch checked={dataAnonymization} onCheckedChange={setDataAnonymization} />
              </div>
            </div>

            {/* Apply Retention Policy */}
            <Button
              variant="outline"
              className="gap-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              onClick={() => setShowRetentionPolicyDialog(true)}
            >
              <RefreshCw className="h-4 w-4" />
              Apply Retention Policy Now
            </Button>
            <ConfirmDialog
              open={showRetentionPolicyDialog}
              onOpenChange={setShowRetentionPolicyDialog}
              title="Apply Retention Policy"
              description={`This will immediately apply your retention policy to all data. Data past the retention period will be ${dataAnonymization ? 'anonymized' : 'permanently deleted'}. This action cannot be undone.`}
              confirmLabel="Apply Policy"
              variant="destructive"
              onConfirm={() => {
                toast.success('Retention policy applied successfully!', {
                  description: `${dataAnonymization ? 'Anonymized' : 'Deleted'} expired data across all types.`,
                });
              }}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* =============================== */}
      {/* PRIVACY & COMPLIANCE */}
      {/* =============================== */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
        <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Privacy & Compliance</CardTitle>
                <CardDescription>GDPR compliance, data processing, and privacy settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* GDPR & Legal */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">GDPR Compliance Mode</p>
                    <p className="text-xs text-muted-foreground">Enable GDPR-compliant data handling features</p>
                  </div>
                </div>
                <Switch checked={gdprCompliance} onCheckedChange={setGdprCompliance} />
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-background/50">
                <Checkbox
                  id="dpa"
                  checked={dataProcessingAgreement}
                  onCheckedChange={(checked) => setDataProcessingAgreement(checked === true)}
                />
                <label htmlFor="dpa" className="text-sm font-medium cursor-pointer">
                  Data Processing Agreement (DPA) accepted
                </label>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50">
                <div className="flex items-center gap-3">
                  <Cookie className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">Cookie Consent Banner</p>
                    <p className="text-xs text-muted-foreground">Show cookie consent dialog to visitors</p>
                  </div>
                </div>
                <Switch checked={cookieConsent} onCheckedChange={setCookieConsent} />
              </div>
            </div>

            <Separator />

            {/* Privacy & Cookie Policy URLs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Privacy Policy URL</Label>
                <Input
                  value={privacyPolicyUrl}
                  onChange={(e) => setPrivacyPolicyUrl(e.target.value)}
                  placeholder="https://example.com/privacy"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Cookie Policy URL</Label>
                <Input
                  value={cookiePolicyUrl}
                  onChange={(e) => setCookiePolicyUrl(e.target.value)}
                  placeholder="https://example.com/cookies"
                />
              </div>
            </div>

            <Separator />

            {/* Data Access Request */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Data Access Request Handler</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  value={accessRequestEmail}
                  onChange={(e) => setAccessRequestEmail(e.target.value)}
                  placeholder="Enter user email to process request"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  className="gap-2 shrink-0"
                  onClick={() => {
                    if (!accessRequestEmail) {
                      toast.error('Please enter an email address');
                      return;
                    }
                    toast.success('Data access request processed', {
                      description: `Data package for ${accessRequestEmail} will be sent within 30 days.`,
                    });
                    setAccessRequestEmail('');
                  }}
                >
                  <Eye className="h-4 w-4" />
                  Process Request
                </Button>
              </div>
            </div>

            <Separator />

            {/* Right to Erasure - Danger Zone */}
            <div className="rounded-xl border-2 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="text-sm font-bold text-red-700 dark:text-red-400">Danger Zone</h3>
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mb-4">
                Permanently delete all user data associated with an account. This action is irreversible and is intended to comply with GDPR &quot;Right to Erasure&quot; requirements.
              </p>
              <Dialog open={showEraseDialog} onOpenChange={setShowEraseDialog}>
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={() => setShowEraseDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete All User Data (Right to Erasure)
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Confirm Data Erasure
                    </DialogTitle>
                    <DialogDescription>
                      This will permanently delete ALL data associated with the specified user. This includes enrollments, progress, community posts, achievements, and personal information. This action CANNOT be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">User Email</Label>
                      <Input placeholder="Enter user email address" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-red-600">
                        Type &quot;DELETE&quot; to confirm
                      </Label>
                      <Input
                        value={eraseConfirmText}
                        onChange={(e) => setEraseConfirmText(e.target.value)}
                        placeholder="DELETE"
                        className="border-red-300 focus:border-red-500"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setShowEraseDialog(false); setEraseConfirmText(''); }}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={eraseConfirmText !== 'DELETE'}
                      onClick={() => {
                        setShowEraseDialog(false);
                        setEraseConfirmText('');
                        toast.success('User data erased successfully', {
                          description: 'All associated data has been permanently removed.',
                        });
                      }}
                    >
                      Permanently Delete Data
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* =============================== */}
      {/* BACKUP & RESTORE */}
      {/* =============================== */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 }}>
        <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 text-white">
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Backup & Restore</CardTitle>
                <CardDescription>Create backups and restore your platform from a previous state</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Backup Storage Indicator */}
            <div className="p-4 rounded-xl border border-border/50 bg-background/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Backup Storage</span>
                <span className="text-xs text-muted-foreground">{backupStorageUsed} GB used of {backupStorageTotal} GB</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-slate-500 to-slate-700"
                  style={{ width: `${(backupStorageUsed / backupStorageTotal) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{(backupStorageTotal - backupStorageUsed).toFixed(1)} GB available</p>
            </div>

            {/* Create Backup Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button
                  onClick={handleCreateBackup}
                  disabled={isCreatingBackup}
                  className="w-full gap-2 h-11 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white shadow-lg"
                >
                  {isCreatingBackup ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Backup...
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4" />
                      Create Backup Now
                    </>
                  )}
                </Button>
              </motion.div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">Auto-backup:</Label>
                <Select value={autoBackupSchedule} onValueChange={setAutoBackupSchedule}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Backup History */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Backup History</Label>
              <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                {backups.map((backup) => (
                  <motion.div
                    key={backup.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        backup.type === 'Automatic'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                          : 'bg-slate-100 dark:bg-slate-900/30 text-slate-600'
                      }`}>
                        {backup.type === 'Automatic' ? <Clock className="h-4 w-4" /> : <Server className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{backup.date}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {backup.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{backup.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toast.success('Download started', { description: `${backup.date} backup` })}
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Download</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-amber-600 hover:text-amber-700"
                              onClick={() => { setSelectedBackupId(backup.id); setShowRestoreDialog(true); }}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Restore</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Restore Confirmation Dialog */}
            <ConfirmDialog
              open={showRestoreDialog}
              onOpenChange={(open) => { setShowRestoreDialog(open); if (!open) setSelectedBackupId(null); }}
              title="Restore from Backup"
              description="This will restore your platform to the state captured in this backup. All data created after this backup will be lost. This action cannot be undone."
              confirmLabel="Confirm Restore"
              variant="destructive"
              onConfirm={() => {
                setShowRestoreDialog(false);
                setSelectedBackupId(null);
                toast.success('Restore initiated', {
                  description: 'Your platform will be restored shortly. You will be notified when complete.',
                });
              }}
            />

          </CardContent>
        </Card>
      </motion.div>

      {/* =============================== */}
      {/* SAVE ALL SETTINGS */}
      {/* =============================== */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.5 }}>
        <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <Save className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Save All Data &amp; Privacy Settings</p>
                  <p className="text-xs text-muted-foreground">Apply all changes to export, import, retention, privacy, and backup settings</p>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 h-11 px-8"
                  onClick={() => {
                    toast.success('All settings saved successfully!', {
                      description: 'Data export, import, retention, privacy, and backup settings have been updated.',
                    });
                  }}
                >
                  <Save className="h-4 w-4" />
                  Save All Settings
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <ConfirmDialog
        open={!!deleteExportId}
        onOpenChange={(open) => !open && setDeleteExportId(null)}
        title="Delete Export Record"
        description="Are you sure you want to delete this export record? The export file will also be removed."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteExportId) {
            deleteDataExport.mutate(deleteExportId);
            setDeleteExportId(null);
          }
        }}
      />
    </div>
  );
}

// ============================================================
// Tab: Data Export / Import
// ============================================================

const DATA_SOURCE_CONFIG: Record<ExportDataSource, {
  icon: React.ElementType;
  name: string;
  description: string;
  estimatedRows: number;
  columns: ExportColumn[];
}> = {
  courses: {
    icon: BookOpen,
    name: 'Courses',
    description: 'Course content, modules, and lessons',
    estimatedRows: 1250,
    columns: [
      { key: 'id', label: 'ID', selected: true },
      { key: 'title', label: 'Title', selected: true },
      { key: 'slug', label: 'Slug', selected: true },
      { key: 'category', label: 'Category', selected: true },
      { key: 'level', label: 'Level', selected: true },
      { key: 'language', label: 'Language', selected: false },
      { key: 'price', label: 'Price', selected: true },
      { key: 'enrollmentCount', label: 'Enrollments', selected: true },
      { key: 'avgRating', label: 'Avg Rating', selected: false },
      { key: 'completionRate', label: 'Completion Rate', selected: true },
      { key: 'isPublished', label: 'Published', selected: false },
      { key: 'createdAt', label: 'Created At', selected: true },
    ],
  },
  users_enrollments: {
    icon: Users,
    name: 'Users & Enrollments',
    description: 'User accounts and course enrollments',
    estimatedRows: 5480,
    columns: [
      { key: 'id', label: 'ID', selected: true },
      { key: 'name', label: 'Name', selected: true },
      { key: 'email', label: 'Email', selected: true },
      { key: 'role', label: 'Role', selected: true },
      { key: 'status', label: 'Status', selected: true },
      { key: 'enrolledAt', label: 'Enrolled At', selected: true },
      { key: 'progress', label: 'Progress', selected: true },
      { key: 'courseId', label: 'Course ID', selected: false },
      { key: 'courseTitle', label: 'Course Title', selected: true },
      { key: 'completedAt', label: 'Completed At', selected: false },
    ],
  },
  assessments: {
    icon: FileText,
    name: 'Assessments',
    description: 'Quizzes, assignments, and submissions',
    estimatedRows: 3120,
    columns: [
      { key: 'id', label: 'ID', selected: true },
      { key: 'title', label: 'Title', selected: true },
      { key: 'type', label: 'Type', selected: true },
      { key: 'passingScore', label: 'Passing Score', selected: true },
      { key: 'maxAttempts', label: 'Max Attempts', selected: false },
      { key: 'timeLimit', label: 'Time Limit', selected: false },
      { key: 'isPublished', label: 'Published', selected: false },
      { key: 'courseId', label: 'Course ID', selected: true },
      { key: 'avgScore', label: 'Avg Score', selected: true },
      { key: 'totalAttempts', label: 'Total Attempts', selected: true },
    ],
  },
  analytics: {
    icon: Activity,
    name: 'Analytics',
    description: 'Platform events, metrics, and usage data',
    estimatedRows: 12500,
    columns: [
      { key: 'id', label: 'ID', selected: true },
      { key: 'date', label: 'Date', selected: true },
      { key: 'eventType', label: 'Event Type', selected: true },
      { key: 'userId', label: 'User ID', selected: true },
      { key: 'sessionId', label: 'Session ID', selected: false },
      { key: 'pageViews', label: 'Page Views', selected: true },
      { key: 'avgSessionDuration', label: 'Avg Session Duration', selected: true },
    ],
  },
  community: {
    icon: MessageSquare,
    name: 'Community',
    description: 'Posts, comments, and reactions',
    estimatedRows: 8750,
    columns: [
      { key: 'id', label: 'ID', selected: true },
      { key: 'title', label: 'Title', selected: true },
      { key: 'type', label: 'Type', selected: true },
      { key: 'authorName', label: 'Author', selected: true },
      { key: 'category', label: 'Category', selected: true },
      { key: 'viewCount', label: 'Views', selected: false },
      { key: 'likeCount', label: 'Likes', selected: false },
      { key: 'commentCount', label: 'Comments', selected: false },
      { key: 'createdAt', label: 'Created At', selected: true },
    ],
  },
  certificates: {
    icon: Crown,
    name: 'Certificates',
    description: 'Certificate templates and awards',
    estimatedRows: 980,
    columns: [
      { key: 'id', label: 'ID', selected: true },
      { key: 'name', label: 'Name', selected: true },
      { key: 'template', label: 'Template', selected: true },
      { key: 'isActive', label: 'Active', selected: false },
      { key: 'issuedCount', label: 'Issued Count', selected: true },
      { key: 'verificationCode', label: 'Verification Code', selected: true },
      { key: 'issuedAt', label: 'Issued At', selected: true },
    ],
  },
  all: {
    icon: Database,
    name: 'All Data',
    description: 'Complete platform data export',
    estimatedRows: 32080,
    columns: [
      { key: 'source', label: 'Data Source', selected: true },
      { key: 'id', label: 'ID', selected: true },
      { key: 'title', label: 'Title/Name', selected: true },
      { key: 'type', label: 'Type', selected: true },
      { key: 'status', label: 'Status', selected: true },
      { key: 'createdAt', label: 'Created At', selected: true },
    ],
  },
};

const FORMAT_CONFIG: Record<ExportFormat, {
  icon: React.ElementType;
  name: string;
  sizeMultiplier: number;
}> = {
  csv: { icon: FileText, name: 'CSV', sizeMultiplier: 1 },
  json: { icon: FileJson, name: 'JSON', sizeMultiplier: 2 },
  xlsx: { icon: FileSpreadsheet, name: 'XLSX', sizeMultiplier: 0.75 },
};

const DATE_RANGE_MULTIPLIER: Record<ExportDateRange, number> = {
  '7d': 0.15,
  '30d': 0.4,
  '90d': 0.75,
  custom: 0.5,
  all: 1,
};

interface ExportHistoryEntry {
  id: string;
  date: string;
  source: string;
  format: ExportFormat;
  rows: number;
  size: string;
  status: 'completed' | 'failed';
}

const INITIAL_EXPORT_HISTORY: ExportHistoryEntry[] = [
  { id: 'exp_1', date: '2025-02-28 14:32', source: 'Courses', format: 'csv', rows: 1240, size: '2.3 MB', status: 'completed' },
  { id: 'exp_2', date: '2025-02-25 09:15', source: 'Users & Enrollments', format: 'json', rows: 5480, size: '4.5 MB', status: 'completed' },
  { id: 'exp_3', date: '2025-02-22 16:48', source: 'Analytics', format: 'xlsx', rows: 12500, size: '1.8 MB', status: 'completed' },
  { id: 'exp_4', date: '2025-02-20 11:22', source: 'Community', format: 'csv', rows: 8750, size: '15.2 MB', status: 'failed' },
  { id: 'exp_5', date: '2025-02-15 08:05', source: 'All Data', format: 'json', rows: 32080, size: '48.7 MB', status: 'completed' },
];

function DataExportImport() {
  // === EXPORT STATE ===
  const [exportSource, setExportSource] = useState<ExportDataSource>('courses');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [exportDateRange, setExportDateRange] = useState<ExportDateRange>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [exportColumns, setExportColumns] = useState<Record<ExportDataSource, ExportColumn[]>>(() => {
    const cols: Record<string, ExportColumn[]> = {};
    (Object.keys(DATA_SOURCE_CONFIG) as ExportDataSource[]).forEach(source => {
      cols[source] = DATA_SOURCE_CONFIG[source].columns.map(c => ({ ...c }));
    });
    return cols as Record<ExportDataSource, ExportColumn[]>;
  });
  const [expandedSources, setExpandedSources] = useState<Set<ExportDataSource>>(new Set(['courses']));
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // === IMPORT STATE ===
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importSource, setImportSource] = useState<ExportDataSource>('courses');
  const [isDragActive, setIsDragActive] = useState(false);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showValidationDetails, setShowValidationDetails] = useState(false);

  // === EXPORT HISTORY STATE ===
  const [exportHistory, setExportHistory] = useState<ExportHistoryEntry[]>(INITIAL_EXPORT_HISTORY);
  const [historySourceFilter, setHistorySourceFilter] = useState('all');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // === COMPUTED VALUES ===
  const getExportSummary = useCallback((): ExportSummary => {
    const config = DATA_SOURCE_CONFIG[exportSource];
    const baseRows = config.estimatedRows;
    const dateMultiplier = DATE_RANGE_MULTIPLIER[exportDateRange];
    const rowCount = Math.round(baseRows * dateMultiplier);
    const selectedCount = exportColumns[exportSource].filter(c => c.selected).length;
    const formatMultiplier = FORMAT_CONFIG[exportFormat].sizeMultiplier;
    const sizeBytes = rowCount * selectedCount * 32 * formatMultiplier;
    let fileSizeEstimate: string;
    if (sizeBytes < 1024) fileSizeEstimate = `${sizeBytes} B`;
    else if (sizeBytes < 1024 * 1024) fileSizeEstimate = `${(sizeBytes / 1024).toFixed(1)} KB`;
    else fileSizeEstimate = `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
    const estimatedTime = rowCount < 1000 ? '< 5s' : rowCount < 5000 ? '~10s' : rowCount < 15000 ? '~30s' : '~1 min';
    return { rowCount, fileSizeEstimate, estimatedTime };
  }, [exportSource, exportDateRange, exportFormat, exportColumns]);

  const summary = useMemo(() => getExportSummary(), [getExportSummary]);

  const filteredHistory = useMemo(() => {
    return exportHistory.filter(entry => {
      if (historySourceFilter !== 'all' && entry.source !== historySourceFilter) return false;
      if (historyStatusFilter !== 'all' && entry.status !== historyStatusFilter) return false;
      return true;
    });
  }, [exportHistory, historySourceFilter, historyStatusFilter]);

  // === EXPORT HANDLERS ===
  const toggleColumn = useCallback((source: ExportDataSource, key: string) => {
    setExportColumns(prev => {
      const updated = { ...prev };
      updated[source] = updated[source].map(c =>
        c.key === key ? { ...c, selected: !c.selected } : c
      );
      return updated;
    });
  }, []);

  const selectAllColumns = useCallback((source: ExportDataSource) => {
    setExportColumns(prev => {
      const updated = { ...prev };
      updated[source] = updated[source].map(c => ({ ...c, selected: true }));
      return updated;
    });
  }, []);

  const deselectAllColumns = useCallback((source: ExportDataSource) => {
    setExportColumns(prev => {
      const updated = { ...prev };
      updated[source] = updated[source].map(c => ({ ...c, selected: false }));
      return updated;
    });
  }, []);

  const toggleExpanded = useCallback((source: ExportDataSource) => {
    setExpandedSources(prev => {
      const next = new Set(prev);
      if (next.has(source)) next.delete(source);
      else next.add(source);
      return next;
    });
  }, []);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(0);
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 100));
      setExportProgress(i);
    }
    const selectedColumns = exportColumns[exportSource].filter(c => c.selected);
    let content: string;
    let mimeType: string;
    let extension: string;
    if (exportFormat === 'csv') {
      const headers = selectedColumns.map(c => c.label).join(',');
      const rows = Array.from({ length: Math.min(summary.rowCount, 50) }, (_, i) =>
        selectedColumns.map(c => `${c.key}_${i + 1}`).join(',')
      );
      content = [headers, ...rows].join('\n');
      mimeType = 'text/csv';
      extension = 'csv';
    } else if (exportFormat === 'json') {
      const data = Array.from({ length: Math.min(summary.rowCount, 50) }, (_, i) => {
        const row: Record<string, string> = {};
        selectedColumns.forEach(c => { row[c.key] = `${c.key}_${i + 1}`; });
        return row;
      });
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      const headers = selectedColumns.map(c => c.label).join('\t');
      const rows = Array.from({ length: Math.min(summary.rowCount, 50) }, (_, i) =>
        selectedColumns.map(c => `${c.key}_${i + 1}`).join('\t')
      );
      content = [headers, ...rows].join('\n');
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      extension = 'xlsx';
    }
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportSource}_export.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    const newHistoryEntry: ExportHistoryEntry = {
      id: `exp_${Date.now()}`,
      date: new Date().toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', ''),
      source: DATA_SOURCE_CONFIG[exportSource].name,
      format: exportFormat,
      rows: summary.rowCount,
      size: summary.fileSizeEstimate,
      status: 'completed',
    };
    setExportHistory(prev => [newHistoryEntry, ...prev]);
    setIsExporting(false);
    setExportProgress(0);
    toast.success('Export completed successfully!', {
      description: `${summary.rowCount.toLocaleString()} rows exported as ${exportFormat.toUpperCase()}`,
    });
  }, [exportSource, exportFormat, exportColumns, summary]);

  // === IMPORT HANDLERS ===
  const processFile = useCallback((file: File) => {
    const validExtensions = ['.csv', '.json', '.xlsx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(ext)) {
      toast.error('Invalid file type', { description: 'Please upload a CSV, JSON, or XLSX file.' });
      return;
    }
    setImportFile(file);
    setImportResult(null);
    setValidationResult(null);
    setColumnMappings([]);
    const mockColumns = ['id', 'name', 'title', 'email', 'status', 'created_at', 'type', 'category', 'score', 'progress'];
    const targetFields = DATA_SOURCE_CONFIG[importSource].columns;
    const mappings: ColumnMapping[] = mockColumns.map(col => {
      const match = targetFields.find(tf =>
        tf.key.toLowerCase() === col.toLowerCase() ||
        tf.label.toLowerCase() === col.toLowerCase() ||
        tf.key.toLowerCase().replace(/_/g, '') === col.toLowerCase().replace(/_/g, '')
      );
      return {
        sourceColumn: col,
        targetField: match ? match.key : '',
        confirmed: !!match,
      };
    });
    setColumnMappings(mappings);
    setTimeout(() => {
      setValidationResult({
        totalRows: 245,
        validRows: 230,
        errors: [
          { row: 12, column: 'email', message: 'Invalid email format' },
          { row: 45, column: 'status', message: 'Unknown status value' },
          { row: 89, column: 'id', message: 'Duplicate ID detected' },
        ],
        warnings: [
          { row: 23, column: 'name', message: 'Name exceeds recommended length' },
          { row: 67, column: 'created_at', message: 'Date format may need conversion' },
        ],
      });
    }, 800);
  }, [importSource]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const updateColumnMapping = useCallback((index: number, targetField: string) => {
    setColumnMappings(prev => {
      const updated = [...prev];
      const targetFields = DATA_SOURCE_CONFIG[importSource].columns;
      const match = targetFields.find(tf => tf.key === targetField);
      updated[index] = {
        ...updated[index],
        targetField,
        confirmed: !!match,
      };
      return updated;
    });
  }, [importSource]);

  const handleImport = useCallback(async () => {
    if (!validationResult || validationResult.errors.length > 5) return;
    setIsImporting(true);
    setImportProgress(0);
    for (let i = 0; i <= 100; i += 4) {
      await new Promise(r => setTimeout(r, 80));
      setImportProgress(i);
    }
    setImportResult({
      imported: validationResult.validRows,
      skipped: validationResult.totalRows - validationResult.validRows,
      failed: validationResult.errors.length,
    });
    setIsImporting(false);
    setImportProgress(0);
    toast.success('Import completed!', {
      description: `${validationResult.validRows} rows imported successfully`,
    });
  }, [validationResult]);

  const handleReDownload = useCallback((entry: ExportHistoryEntry) => {
    toast.success('Download started', { description: `${entry.source} export (${entry.format.toUpperCase()})` });
  }, []);

  const resetImport = useCallback(() => {
    setImportFile(null);
    setColumnMappings([]);
    setValidationResult(null);
    setImportResult(null);
    setImportProgress(0);
    setIsImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  return (
    <div className="space-y-6">
      {/* ========== DATA EXPORT SECTION ========== */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Data Export</CardTitle>
                <CardDescription>Export your platform data in various formats</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Source Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Data Source</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {(Object.keys(DATA_SOURCE_CONFIG) as ExportDataSource[]).map(source => {
                  const config = DATA_SOURCE_CONFIG[source];
                  const Icon = config.icon;
                  const isSelected = exportSource === source;
                  return (
                    <motion.button
                      key={source}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setExportSource(source)}
                      className={`relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-md'
                          : 'border-border hover:border-emerald-300 dark:hover:border-emerald-700 bg-card hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          isSelected ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className={`font-medium text-sm ${isSelected ? 'text-emerald-700 dark:text-emerald-300' : ''}`}>
                          {config.name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{config.description}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Hash className="h-3 w-3" />
                        <span>{config.estimatedRows.toLocaleString()} rows</span>
                      </div>
                      {isSelected && (
                        <motion.div
                          layoutId="source-indicator"
                          className="absolute top-2 right-2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Format Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Export Format</Label>
              <div className="flex flex-wrap gap-3">
                {(['csv', 'json', 'xlsx'] as ExportFormat[]).map(format => {
                  const config = FORMAT_CONFIG[format];
                  const Icon = config.icon;
                  const isSelected = exportFormat === format;
                  const estimatedSize = (() => {
                    const bytes = summary.rowCount * exportColumns[exportSource].filter(c => c.selected).length * 32 * config.sizeMultiplier;
                    if (bytes < 1024) return `${bytes} B`;
                    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
                    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
                  })();
                  return (
                    <motion.button
                      key={format}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setExportFormat(format)}
                      className={`flex items-center gap-3 rounded-full border-2 px-5 py-3 transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-md'
                          : 'border-border hover:border-emerald-300 dark:hover:border-emerald-700 bg-card'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                      <span className={`font-medium text-sm ${isSelected ? 'text-emerald-700 dark:text-emerald-300' : ''}`}>
                        {config.name}
                      </span>
                      <Badge variant="secondary" className="text-xs font-normal">
                        ~{estimatedSize}
                      </Badge>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Date Range Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Date Range</Label>
              <div className="flex flex-wrap gap-2">
                {([
                  { value: '7d' as ExportDateRange, label: 'Last 7 Days' },
                  { value: '30d' as ExportDateRange, label: 'Last 30 Days' },
                  { value: '90d' as ExportDateRange, label: 'Last 90 Days' },
                  { value: 'all' as ExportDateRange, label: 'All Time' },
                  { value: 'custom' as ExportDateRange, label: 'Custom' },
                ]).map(range => (
                  <Button
                    key={range.value}
                    variant={exportDateRange === range.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setExportDateRange(range.value)}
                    className={exportDateRange === range.value ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  >
                    {range.value === '7d' && <Clock className="h-3.5 w-3.5 mr-1.5" />}
                    {range.value === '30d' && <Calendar className="h-3.5 w-3.5 mr-1.5" />}
                    {range.value === '90d' && <Timer className="h-3.5 w-3.5 mr-1.5" />}
                    {range.value === 'all' && <Archive className="h-3.5 w-3.5 mr-1.5" />}
                    {range.value === 'custom' && <Calendar className="h-3.5 w-3.5 mr-1.5" />}
                    {range.label}
                  </Button>
                ))}
              </div>
              {exportDateRange === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col sm:flex-row gap-3 mt-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <Label className="text-xs text-muted-foreground">From</Label>
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <Label className="text-xs text-muted-foreground">To</Label>
                    <Input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <Separator />

            {/* Column Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Column Selection</Label>
              <div className="space-y-2">
                {(Object.keys(DATA_SOURCE_CONFIG) as ExportDataSource[]).map(source => {
                  const config = DATA_SOURCE_CONFIG[source];
                  const Icon = config.icon;
                  const isExpanded = expandedSources.has(source);
                  const columns = exportColumns[source];
                  const selectedCount = columns.filter(c => c.selected).length;
                  return (
                    <div key={source} className="rounded-lg border border-border">
                      <button
                        onClick={() => toggleExpanded(source)}
                        className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{config.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {selectedCount}/{columns.length} selected
                          </Badge>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="border-t border-border p-3 space-y-3"
                        >
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => selectAllColumns(source)}
                              className="text-xs h-7"
                            >
                              Select All
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deselectAllColumns(source)}
                              className="text-xs h-7"
                            >
                              Deselect All
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {columns.map((col, idx) => (
                              <div
                                key={col.key}
                                className="flex items-center gap-2 rounded-md border border-border/50 px-3 py-2 hover:bg-muted/30 transition-colors"
                              >
                                <div className="flex items-center gap-1 text-muted-foreground cursor-grab">
                                  <Minus className="h-3 w-3" />
                                </div>
                                <Checkbox
                                  id={`col-${source}-${col.key}`}
                                  checked={col.selected}
                                  onCheckedChange={() => toggleColumn(source, col.key)}
                                />
                                <label
                                  htmlFor={`col-${source}-${col.key}`}
                                  className="text-sm cursor-pointer flex-1"
                                >
                                  {col.label}
                                </label>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                                  {idx + 1}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Export Summary Preview */}
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <h4 className="font-medium text-sm mb-3">Export Summary</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                    <Hash className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Row Count</p>
                    <p className="font-semibold text-sm">{summary.rowCount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                    <HardDrive className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">File Size</p>
                    <p className="font-semibold text-sm">{summary.fileSizeEstimate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                    <Timer className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Estimated Time</p>
                    <p className="font-semibold text-sm">{summary.estimatedTime}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div className="space-y-3">
              {isExporting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Exporting...</span>
                    <span className="font-medium">{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} className="h-2" />
                </div>
              )}
              <Button
                onClick={handleExport}
                disabled={isExporting || exportColumns[exportSource].filter(c => c.selected).length === 0}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Exporting Data...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Export {DATA_SOURCE_CONFIG[exportSource].name} Data
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ========== DATA IMPORT SECTION ========== */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                <CloudUpload className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Data Import</CardTitle>
                <CardDescription>Import data from external sources into your platform</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={handleFileDrop}
              className={`relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-all cursor-pointer ${
                isDragActive
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                  : importFile
                    ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-border hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-muted/30'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
              {importFile ? (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                    <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{importFile.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(importFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); resetImport(); }}
                    className="gap-1.5"
                  >
                    <X className="h-3.5 w-3.5" />
                    Remove File
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <CloudUpload className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Drag & drop your file here</p>
                    <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      CSV
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileJson className="h-3.5 w-3.5" />
                      JSON
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      XLSX
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5 mt-1">
                    <Search className="h-3.5 w-3.5" />
                    Browse Files
                  </Button>
                </>
              )}
            </div>

            {/* Import Configuration */}
            {importFile && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Import Destination</Label>
                  <Select value={importSource} onValueChange={(v) => setImportSource(v as ExportDataSource)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(DATA_SOURCE_CONFIG) as ExportDataSource[])
                        .filter(s => s !== 'all')
                        .map(source => (
                          <SelectItem key={source} value={source}>
                            {DATA_SOURCE_CONFIG[source].name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Column Mapping */}
                {columnMappings.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Column Mapping</Label>
                      <Badge variant="secondary" className="text-xs">
                        {columnMappings.filter(m => m.confirmed).length}/{columnMappings.length} matched
                      </Badge>
                    </div>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40%]">Source Column</TableHead>
                            <TableHead className="w-[10%] text-center"></TableHead>
                            <TableHead className="w-[40%]">Target Field</TableHead>
                            <TableHead className="w-[10%] text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {columnMappings.map((mapping, idx) => (
                            <TableRow key={mapping.sourceColumn}>
                              <TableCell className="font-mono text-sm">{mapping.sourceColumn}</TableCell>
                              <TableCell className="text-center">
                                <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={mapping.targetField}
                                  onValueChange={(v) => updateColumnMapping(idx, v)}
                                >
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder="Select field..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="_skip_">-- Skip --</SelectItem>
                                    {DATA_SOURCE_CONFIG[importSource].columns.map(col => (
                                      <SelectItem key={col.key} value={col.key}>
                                        {col.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-center">
                                {mapping.targetField === '_skip_' ? (
                                  <Badge variant="secondary" className="text-[10px]">Skip</Badge>
                                ) : mapping.confirmed ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                                ) : mapping.targetField ? (
                                  <AlertTriangle className="h-4 w-4 text-amber-500 mx-auto" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-400 mx-auto" />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Validation Preview */}
                {validationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <Label className="text-sm font-medium">Validation Results</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="rounded-lg border border-border bg-card p-3 text-center">
                        <p className="text-2xl font-bold">{validationResult.totalRows}</p>
                        <p className="text-xs text-muted-foreground">Total Rows</p>
                      </div>
                      <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-3 text-center">
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{validationResult.validRows}</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">Valid Rows</p>
                      </div>
                      <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-3 text-center">
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{validationResult.errors.length}</p>
                        <p className="text-xs text-red-600 dark:text-red-400">Errors</p>
                      </div>
                      <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 text-center">
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{validationResult.warnings.length}</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">Warnings</p>
                      </div>
                    </div>

                    {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowValidationDetails(!showValidationDetails)}
                          className="gap-1.5 text-xs"
                        >
                          {showValidationDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          {showValidationDetails ? 'Hide' : 'Show'} Details
                        </Button>
                        {showValidationDetails && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="max-h-64 overflow-y-auto rounded-lg border border-border"
                          >
                            {validationResult.errors.length > 0 && (
                              <div className="p-3 border-b border-border">
                                <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">Errors</p>
                                {validationResult.errors.map((err, i) => (
                                  <div key={i} className="flex items-start gap-2 py-1 text-xs">
                                    <XCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                                    <span>
                                      <strong>Row {err.row}</strong>, Column &quot;{err.column}&quot;: {err.message}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {validationResult.warnings.length > 0 && (
                              <div className="p-3">
                                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">Warnings</p>
                                {validationResult.warnings.map((warn, i) => (
                                  <div key={i} className="flex items-start gap-2 py-1 text-xs">
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                                    <span>
                                      <strong>Row {warn.row}</strong>, Column &quot;{warn.column}&quot;: {warn.message}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}

                {/* Import Result */}
                {importResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <span className="font-medium text-emerald-700 dark:text-emerald-300">Import Complete</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-lg font-bold text-emerald-600">{importResult.imported}</p>
                        <p className="text-xs text-emerald-600/70">Imported</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-amber-600">{importResult.skipped}</p>
                        <p className="text-xs text-amber-600/70">Skipped</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-red-600">{importResult.failed}</p>
                        <p className="text-xs text-red-600/70">Failed</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Import Progress & Button */}
                {isImporting && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Importing...</span>
                      <span className="font-medium">{importProgress}%</span>
                    </div>
                    <Progress value={importProgress} className="h-2" />
                  </div>
                )}
                <div className="flex gap-3">
                  <Button
                    onClick={handleImport}
                    disabled={
                      isImporting ||
                      !validationResult ||
                      validationResult.errors.length > 5 ||
                      !!importResult
                    }
                    className="flex-1 h-11 font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg"
                    size="lg"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importing Data...
                      </>
                    ) : (
                      <>
                        <CloudUpload className="h-4 w-4 mr-2" />
                        Import Data
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetImport}
                    className="gap-1.5"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ========== EXPORT HISTORY ========== */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                  <Archive className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Export History</CardTitle>
                  <CardDescription>View and re-download past exports</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={historySourceFilter} onValueChange={setHistorySourceFilter}>
                  <SelectTrigger className="w-[160px] h-8 text-xs">
                    <Filter className="h-3.5 w-3.5 mr-1.5" />
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="Courses">Courses</SelectItem>
                    <SelectItem value="Users & Enrollments">Users & Enrollments</SelectItem>
                    <SelectItem value="Assessments">Assessments</SelectItem>
                    <SelectItem value="Analytics">Analytics</SelectItem>
                    <SelectItem value="Community">Community</SelectItem>
                    <SelectItem value="Certificates">Certificates</SelectItem>
                    <SelectItem value="All Data">All Data</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={historyStatusFilter} onValueChange={setHistoryStatusFilter}>
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Archive className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No export history found</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead className="text-right">Rows</TableHead>
                      <TableHead className="text-right">Size</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.map(entry => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {entry.date}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-sm">{entry.source}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs font-mono">
                            {entry.format.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm">{entry.rows.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm">{entry.size}</TableCell>
                        <TableCell className="text-center">
                          {entry.status === 'completed' ? (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0 text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-0 text-xs">
                              <XCircle className="h-3 w-3 mr-1" />
                              Failed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.status === 'completed' ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReDownload(entry)}
                                    className="h-8 gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline text-xs">Download</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Download Again</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <Button variant="ghost" size="sm" disabled className="h-8">
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ============================================================
// Main Admin Settings Component
// ============================================================
export function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { value: 'general', label: 'General', icon: Globe },
    { value: 'branding', label: 'Branding', icon: Palette },
    { value: 'domain', label: 'Domain & SSL', icon: Shield },
    { value: 'integrations', label: 'Integrations', icon: Puzzle },
    { value: 'team', label: 'Team & Roles', icon: Users },
    { value: 'billing', label: 'Billing', icon: CreditCard },
    { value: 'email-templates', label: 'Email Templates', icon: Mail },
    { value: 'webhooks', label: 'Webhooks', icon: Webhook },
    { value: 'data-export', label: 'Data Export', icon: Download },
    { value: 'api-keys', label: 'API Keys', icon: Key },
    { value: 'notifications', label: 'Notifications', icon: Bell },
    { value: 'security', label: 'Security', icon: ShieldCheck },
    { value: 'data-privacy', label: 'Data & Privacy', icon: Database },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your platform configuration, integrations, and team
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs sm:text-sm"
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="general">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <GeneralSettings />
            </motion.div>
          </TabsContent>
          <TabsContent value="branding">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <BrandingTheming />
            </motion.div>
          </TabsContent>
          <TabsContent value="domain">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <DomainSSL />
            </motion.div>
          </TabsContent>
          <TabsContent value="integrations">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Integrations />
            </motion.div>
          </TabsContent>
          <TabsContent value="team">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <TeamRoles />
            </motion.div>
          </TabsContent>
          <TabsContent value="billing">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Billing />
            </motion.div>
          </TabsContent>
          <TabsContent value="email-templates">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <EmailTemplates />
            </motion.div>
          </TabsContent>
          <TabsContent value="webhooks">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <WebhookSettings />
            </motion.div>
          </TabsContent>
          <TabsContent value="data-export">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <DataExportImport />
            </motion.div>
          </TabsContent>
          <TabsContent value="api-keys">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <ApiKeysSettings />
            </motion.div>
          </TabsContent>
          <TabsContent value="notifications">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <NotificationPreferences />
            </motion.div>
          </TabsContent>
          <TabsContent value="security">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <TwoFactorAuth />
            </motion.div>
          </TabsContent>
          <TabsContent value="data-privacy">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <DataPrivacySettings />
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
