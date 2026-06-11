'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';

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
      <Card>
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
      <Card>
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
      <Card>
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
      <Card>
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

      <Card>
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
      <Card>
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
      <Card>
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
      <Card>
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
      <Card>
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
      <Card>
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
      <Card>
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
                            ? 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
                            : member.role === 'Admin'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }
                      >
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
      <Card>
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
      <Card className="border-emerald-200 dark:border-emerald-800">
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
      <Card>
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
      <Card>
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
        </div>
      </Tabs>
    </div>
  );
}
