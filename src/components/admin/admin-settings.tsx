'use client';

import React, { useState, useRef, useCallback } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ============================================================
// Tab 1: General Settings
// ============================================================
function GeneralSettings() {
  const [platformName, setPlatformName] = useState('NextGen Academy');
  const [description, setDescription] = useState(
    'A next-generation learning platform for the modern creator economy'
  );
  const [contactEmail, setContactEmail] = useState('admin@nextgen-lms.com');
  const [supportUrl, setSupportUrl] = useState('https://support.nextgen-lms.com');
  const [logoFile, setLogoFile] = useState<string | null>(null);

  const handleSave = () => {
    toast.success('General settings saved successfully!', {
      description: 'Your platform settings have been updated.',
    });
  };

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
        <Button onClick={handleSave} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Tab 2: Branding & Theming
// ============================================================
function BrandingTheming() {
  const [primaryColor, setPrimaryColor] = useState('#10b981');
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6');
  const [accentColor, setAccentColor] = useState('#0f172a');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [customCss, setCustomCss] = useState('');

  const handleSave = () => {
    toast.success('Branding settings saved successfully!', {
      description: 'Your platform branding has been updated.',
    });
  };

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
        <Button onClick={handleSave} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Tab 3: Domain & SSL
// ============================================================
function DomainSSL() {
  const [customDomain, setCustomDomain] = useState('academy.nextgen-lms.com');
  const [sslEnabled, setSslEnabled] = useState(true);

  const handleSave = () => {
    toast.success('Domain settings saved successfully!');
  };

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
        <Button onClick={handleSave} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Tab 4: Integrations
// ============================================================
function Integrations() {
  const [ga4Id, setGa4Id] = useState('');
  const [metaPixelId, setMetaPixelId] = useState('');
  const [hubspotKey, setHubspotKey] = useState('');
  const [webhooks, setWebhooks] = useState([
    { id: '1', url: 'https://api.example.com/webhook/enrollment', events: 'enrollment.created' },
    { id: '2', url: 'https://api.example.com/webhook/payment', events: 'payment.completed' },
  ]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState('');

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

  const handleSave = () => {
    toast.success('Integration settings saved successfully!');
  };

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
                onClick={() => removeWebhook(wh.id)}
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
        <Button onClick={handleSave} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
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

  const handleSave = () => {
    toast.success('Team settings saved successfully!');
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
                        onClick={() => removeMember(member.id)}
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
        <Button onClick={handleSave} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
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

  const handleSaveTemplate = () => {
    if (!selectedTemplate) return;
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
          <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveTemplate}>
            <Save className="h-3.5 w-3.5" />
            Save
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

  const handleSaveWebhook = () => {
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
  };

  const handleToggleActive = (id: string) => {
    setWebhooks((prev) =>
      prev.map((wh) => (wh.id === id ? { ...wh, active: !wh.active } : wh))
    );
  };

  const handleDelete = (id: string) => {
    setWebhooks((prev) => prev.filter((wh) => wh.id !== id));
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
                              onClick={() => handleDelete(wh.id)}
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
            <Button onClick={handleSaveWebhook} className="gap-2">
              <Save className="h-4 w-4" />
              {editingWebhook ? 'Update' : 'Create'} Webhook
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
      <AlertDialog open={!!revokeKey} onOpenChange={(open) => !open && setRevokeKey(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Revoke API Key
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke the API key &ldquo;{revokeKey?.name}&rdquo;? This action cannot
              be undone. Any applications using this key will immediately lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Revoke Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
    { value: 'api-keys', label: 'API Keys', icon: Key },
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
          <TabsContent value="api-keys">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <ApiKeysSettings />
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
