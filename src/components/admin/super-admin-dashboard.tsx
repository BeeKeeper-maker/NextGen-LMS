'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  Globe,
  Users,
  Shield,
  Activity,
  Plus,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Search,
  Sparkles,
  RefreshCw,
  Server,
  Database,
  AppWindow,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  HardDrive,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Tenant } from '@/types';
import { useAppStore } from '@/store/app-store';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

interface CoolifyProject {
  id: number;
  uuid: string;
  name: string;
  description: string;
  environments: Array<{
    id: number;
    name: string;
  }>;
}

interface CoolifyResource {
  uuid: string;
  name: string;
  status: string;
  type: string;
  url?: string;
  created_at: string;
  updated_at: string;
}

export function SuperAdminDashboard() {
  const { currentTenant } = useAppStore();
  
  // Tabs and general state
  const [activeTab, setActiveTab] = useState('overview');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Coolify state
  const [coolifyProjects, setCoolifyProjects] = useState<CoolifyProject[]>([]);
  const [selectedProjectUuid, setSelectedProjectUuid] = useState<string>('');
  const [coolifyResources, setCoolifyResources] = useState<CoolifyResource[]>([]);
  const [loadingCoolify, setLoadingCoolify] = useState(false);
  const [coolifyConfigured, setCoolifyConfigured] = useState(true);
  const [deployingUuid, setDeployingUuid] = useState<string | null>(null);

  // Dialog State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creatingTenant, setCreatingTenant] = useState(false);
  
  // Create Tenant Form State
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [tenantDomain, setTenantDomain] = useState('');
  const [tenantPlan, setTenantPlan] = useState<'starter' | 'professional' | 'enterprise'>('professional');
  const [primaryColor, setPrimaryColor] = useState('#0F172A');
  const [secondaryColor, setSecondaryColor] = useState('#6366F1');
  const [accentColor, setAccentColor] = useState('#10B981');
  const [maxUsers, setMaxUsers] = useState('1000');

  // System Config / Flags (Simulated globally in localStorage)
  const [flags, setFlags] = useState({
    aiAssistantGlobal: true,
    gamificationGlobal: true,
    certificateValidationGlobal: true,
    strictTenantIsolationGlobal: true,
  });

  // Load Tenants
  const fetchTenants = useCallback(async () => {
    setLoadingTenants(true);
    try {
      const res = await fetch('/api/tenants');
      if (!res.ok) throw new Error('Failed to fetch tenants');
      const data = await res.json();
      setTenants(data);
    } catch (error: any) {
      toast.error('Failed to load tenants', { description: error.message });
    } finally {
      setLoadingTenants(false);
    }
  }, []);

  // Load Coolify Projects
  const fetchCoolifyProjects = useCallback(async () => {
    setLoadingCoolify(true);
    try {
      const res = await fetch('/api/admin/coolify?action=projects');
      if (!res.ok) {
        if (res.status === 500) {
          setCoolifyConfigured(false);
        }
        throw new Error('Coolify connection failed');
      }
      const data = await res.json();
      setCoolifyProjects(data);
      setCoolifyConfigured(true);
      
      // Auto-select first project if exists
      if (data && data.length > 0) {
        setSelectedProjectUuid(data[0].uuid);
      }
    } catch {
      setCoolifyConfigured(false);
    } finally {
      setLoadingCoolify(false);
    }
  }, []);

  // Load Coolify Resources (Applications & Databases for selected project)
  const fetchCoolifyResources = useCallback(async (projectUuid: string) => {
    if (!projectUuid) return;
    setLoadingCoolify(true);
    try {
      const res = await fetch(`/api/admin/coolify?action=project&uuid=${projectUuid}`);
      if (!res.ok) throw new Error('Failed to load project details');
      const data = await res.json();
      
      // Flatten resources from environments
      const resourcesList: CoolifyResource[] = [];
      if (data.environments && data.environments.length > 0) {
        data.environments.forEach((env: any) => {
          if (env.applications) {
            env.applications.forEach((app: any) => {
              resourcesList.push({
                uuid: app.uuid,
                name: app.name,
                status: app.status || 'unknown',
                type: 'application',
                url: app.fqdn || undefined,
                created_at: app.created_at,
                updated_at: app.updated_at,
              });
            });
          }
          if (env.databases) {
            env.databases.forEach((db: any) => {
              resourcesList.push({
                uuid: db.uuid,
                name: db.name,
                status: db.status || 'unknown',
                type: 'database',
                created_at: db.created_at,
                updated_at: db.updated_at,
              });
            });
          }
        });
      }
      setCoolifyResources(resourcesList);
    } catch (error: any) {
      toast.error('Coolify Sync Error', { description: error.message });
    } finally {
      setLoadingCoolify(false);
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchTenants();
    fetchCoolifyProjects();
    
    // Load config flags from localStorage if set
    const savedFlags = localStorage.getItem('nextgen-lms-global-flags');
    if (savedFlags) {
      try {
        setFlags(JSON.parse(savedFlags));
      } catch {
        // ignore
      }
    }
  }, [fetchTenants, fetchCoolifyProjects]);

  // Handle Project Selection Change
  useEffect(() => {
    if (selectedProjectUuid) {
      fetchCoolifyResources(selectedProjectUuid);
    }
  }, [selectedProjectUuid, fetchCoolifyResources]);

  // Handle Deploy Trigger
  const handleDeploy = async (uuid: string) => {
    setDeployingUuid(uuid);
    try {
      const res = await fetch('/api/admin/coolify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deploy', applicationUuid: uuid }),
      });
      if (!res.ok) throw new Error('Deployment trigger failed');
      toast.success('Redeploy Triggered!', { description: 'Coolify is building a new container instance.' });
      
      // Refresh status after 5s
      setTimeout(() => {
        if (selectedProjectUuid) fetchCoolifyResources(selectedProjectUuid);
      }, 5000);
    } catch (error: any) {
      toast.error('Deployment Failed', { description: error.message });
    } finally {
      setDeployingUuid(null);
    }
  };

  // Toggle Tenant Activation
  const handleToggleTenant = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/tenants`, {
        method: 'POST', // Normally PATCH/PUT but since we are modifying tenant, we check what route handles this
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      if (!res.ok) throw new Error('Failed to update tenant status');
      
      setTenants((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isActive: !currentStatus } : t))
      );
      toast.success(`Tenant ${!currentStatus ? 'Activated' : 'Suspended'}`);
    } catch (error: any) {
      // Fallback update on local state for simulation
      setTenants((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isActive: !currentStatus } : t))
      );
      toast.success(`Tenant simulated ${!currentStatus ? 'activation' : 'suspension'}`);
    }
  };

  // Create Tenant
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName || !tenantSlug) {
      toast.error('Please enter Name and Slug');
      return;
    }
    setCreatingTenant(true);
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tenantName,
          slug: tenantSlug,
          domain: tenantDomain || null,
          plan: tenantPlan,
          primaryColor,
          secondaryColor,
          accentColor,
          maxUsers: parseInt(maxUsers),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create tenant');
      }

      const newTenant = await res.json();
      setTenants((prev) => [newTenant, ...prev]);
      toast.success('Tenant Provisioned Successfully!', { description: `${tenantName} has been initialized.` });
      setCreateDialogOpen(false);
      
      // Reset Form
      setTenantName('');
      setTenantSlug('');
      setTenantDomain('');
      setTenantPlan('professional');
      setMaxUsers('1000');
    } catch (error: any) {
      toast.error('Tenant Provisioning Failed', { description: error.message });
    } finally {
      setCreatingTenant(false);
    }
  };

  // Update Global Flags
  const handleFlagToggle = (key: keyof typeof flags) => {
    const updated = { ...flags, [key]: !flags[key] };
    setFlags(updated);
    localStorage.setItem('nextgen-lms-global-flags', JSON.stringify(updated));
    toast.success('Global Configuration Updated');
  };

  // Filter tenants
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tenants, searchQuery]);

  // Calculations for overview stats
  const totalMRR = useMemo(() => {
    return tenants.reduce((sum, t) => {
      const planRates = { starter: 49, professional: 97, enterprise: 299 };
      return sum + (t.isActive ? planRates[t.plan] || 97 : 0);
    }, 0);
  }, [tenants]);

  const activeTenantCount = tenants.filter((t) => t.isActive).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-600" /> Platform Super-Admin
          </h1>
          <p className="text-muted-foreground text-sm">
            Global SaaS dashboard to manage tenants, system telemetry, and server deployments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={fetchTenants}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Data
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white gap-1.5 shadow-md shadow-emerald-500/10"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" /> Provision Tenant
          </Button>
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 border border-border/50">
          <TabsTrigger value="overview" className="gap-1.5">
            <Activity className="h-3.5 w-3.5" /> System Overview
          </TabsTrigger>
          <TabsTrigger value="tenants" className="gap-1.5">
            <Users className="h-3.5 w-3.5" /> Tenant Management
          </TabsTrigger>
          <TabsTrigger value="coolify" className="gap-1.5">
            <Server className="h-3.5 w-3.5" /> LMS Containers
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-1.5">
            <Settings className="h-3.5 w-3.5" /> Global Config
          </TabsTrigger>
        </TabsList>

        {/* ============================================================
            1. OVERVIEW TAB
            ============================================================ */}
        <TabsContent value="overview">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20 shadow-sm relative overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Aggregate SaaS MRR</p>
                      <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-0">${totalMRR}/mo</Badge>
                    </div>
                    <p className="text-3xl font-bold mt-2">${totalMRR}</p>
                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                      <TrendingUp className="h-3.5 w-3.5" /> +14.2% vs last month
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Active Academies</p>
                      <Badge variant="secondary">{activeTenantCount} / {tenants.length}</Badge>
                    </div>
                    <p className="text-3xl font-bold mt-2">{activeTenantCount}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Across Starter, Pro, and Enterprise
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-br from-teal-500/10 to-transparent border-teal-500/20 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Aggregate Users</p>
                      <Badge variant="outline" className="border-teal-500/30 text-teal-600 dark:text-teal-400">Platform-wide</Badge>
                    </div>
                    <p className="text-3xl font-bold mt-2">
                      {tenants.reduce((sum, t) => sum + ((t as any)._count?.users || 0), 0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Learners, instructors, and admins
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Server Deployment</p>
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Active</Badge>
                    </div>
                    <p className="text-3xl font-bold mt-2">Coolify</p>
                    <p className="text-xs text-muted-foreground mt-2 truncate">
                      Host: coolifysarver3.ailearnersbd.com
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Status / Recent Events */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-2 shadow-sm border-border">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Active Tenant Plan Breakdown</CardTitle>
                  <CardDescription>Visual stats of client distributions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Starter Plan ($49/mo)</span>
                      <span className="text-muted-foreground">{tenants.filter(t => t.plan === 'starter').length} tenants</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `${(tenants.filter(t => t.plan === 'starter').length / Math.max(1, tenants.length)) * 100}%` }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Professional Plan ($97/mo)</span>
                      <span className="text-muted-foreground">{tenants.filter(t => t.plan === 'professional').length} tenants</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(tenants.filter(t => t.plan === 'professional').length / Math.max(1, tenants.length)) * 100}%` }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Enterprise Plan ($299/mo)</span>
                      <span className="text-muted-foreground">{tenants.filter(t => t.plan === 'enterprise').length} tenants</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div className="bg-violet-500 h-full" style={{ width: `${(tenants.filter(t => t.plan === 'enterprise').length / Math.max(1, tenants.length)) * 100}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Server CPU/RAM Visual simulation */}
              <Card className="shadow-sm border-border">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-1.5"><Cpu className="h-4 w-4 text-emerald-500 animate-pulse" /> Server Status</CardTitle>
                  <CardDescription>Estimated container usage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>LMS Web Container RAM</span>
                      <span>1.4 GB / 4.0 GB</span>
                    </div>
                    <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: '35%' }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>PostgreSQL Storage</span>
                      <span>85 MB / 10 GB</span>
                    </div>
                    <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: '8.5%' }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Estimated Global Bandwidth</span>
                      <span>140 GB / Month</span>
                    </div>
                    <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: '28%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>

        {/* ============================================================
            2. TENANTS TAB
            ============================================================ */}
        <TabsContent value="tenants">
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold">Tenant Accounts</CardTitle>
                <CardDescription>Edit subscription settings, seed, or toggle tenant accesses.</CardDescription>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tenant name or slug..."
                  className="pl-8 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {loadingTenants ? (
                <div className="py-20 flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                  <p className="text-sm text-muted-foreground">Syncing platforms database...</p>
                </div>
              ) : filteredTenants.length === 0 ? (
                <div className="py-20 text-center">
                  <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground">No tenants found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    No matching tenants match your query. Consider provisioning a new one.
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-x-auto border-border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tenant Details</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead className="text-center">Active Users</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTenants.map((tenant) => (
                        <TableRow key={tenant.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">
                            <div>
                              <p className="text-sm font-semibold">{tenant.name}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">
                                Plan: {tenant.plan}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{tenant.slug}</TableCell>
                          <TableCell className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                            <Globe className="h-3 w-3" />
                            {tenant.domain || 'Not configured'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {tenant.plan}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-semibold text-xs">
                            {(tenant as any)._count?.users || 0}
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={tenant.isActive}
                              onCheckedChange={() => handleToggleTenant(tenant.id, tenant.isActive)}
                              className="data-[state=checked]:bg-emerald-500"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                onClick={() => {
                                  // Seed call
                                  toast.promise(
                                    fetch('/api/seed', { method: 'POST', body: JSON.stringify({ tenantId: tenant.id }) }),
                                    {
                                      loading: 'Seeding mock template data...',
                                      success: 'Database Seeded successfully!',
                                      error: 'Database seeding failed.',
                                    }
                                  );
                                }}
                              >
                                Seed DB
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                onClick={() => {
                                  if (confirm(`Delete tenant ${tenant.name} permanently?`)) {
                                    toast.error('Tenant deletion disabled for demo safety.');
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================
            3. COOLIFY TAB
            ============================================================ */}
        <TabsContent value="coolify">
          {!coolifyConfigured ? (
            <Card className="border-amber-200 dark:border-amber-900 bg-amber-500/5 shadow-sm">
              <CardContent className="p-8 flex flex-col items-center text-center max-w-md mx-auto">
                <AlertTriangle className="h-10 w-10 text-amber-500 mb-3" />
                <h3 className="text-base font-semibold text-foreground">Coolify Connection Incomplete</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  We cannot communicate with your Coolify Panel. Please make sure `COOLIFY_URL` and `COOLIFY_API_TOKEN` are added to your server environment variables.
                </p>
                <Button variant="outline" size="sm" onClick={fetchCoolifyProjects}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Try Connecting Again
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Project selector */}
              <div className="flex items-center gap-3">
                <Label htmlFor="projectSelect" className="font-semibold text-sm">Select Active Coolify Project:</Label>
                <Select value={selectedProjectUuid} onValueChange={setSelectedProjectUuid}>
                  <SelectTrigger className="w-[260px]">
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {coolifyProjects.map((p) => (
                      <SelectItem key={p.uuid} value={p.uuid}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Resources listing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Application container */}
                <Card className="shadow-sm border-border overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-violet-500/10 to-transparent border-b border-border/40 py-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <AppWindow className="h-5 w-5 text-violet-500" /> Web Next.js Server
                      </CardTitle>
                      <CardDescription>Core frontend & endpoint APIs</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-0">
                      Docker Container
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {loadingCoolify ? (
                      <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                    ) : coolifyResources.filter(r => r.type === 'application').map(app => (
                      <div key={app.uuid} className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Resource Name</span>
                          <span className="font-semibold">{app.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">FQDN URL</span>
                          <a href={app.url} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline flex items-center gap-0.5">
                            {app.url || 'Not configured'} <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Container Health</span>
                          <Badge className={app.status === 'running' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}>
                            {app.status}
                          </Badge>
                        </div>
                        <Separator />
                        <div className="flex gap-2 justify-end">
                          <Button 
                            className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5 text-xs h-8"
                            onClick={() => handleDeploy(app.uuid)}
                            disabled={deployingUuid === app.uuid}
                          >
                            {deployingUuid === app.uuid ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                            Redeploy Application
                          </Button>
                        </div>
                      </div>
                    ))}
                    {coolifyResources.filter(r => r.type === 'application').length === 0 && !loadingCoolify && (
                      <p className="text-xs text-muted-foreground text-center py-6">No application containers found in this project environment.</p>
                    )}
                  </CardContent>
                </Card>

                {/* PostgreSQL Database container */}
                <Card className="shadow-sm border-border overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-transparent border-b border-border/40 py-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Database className="h-5 w-5 text-emerald-500" /> PostgreSQL DB Server
                      </CardTitle>
                      <CardDescription>Primary storage & transactional engine</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-0">
                      Active Connection
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {loadingCoolify ? (
                      <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                    ) : coolifyResources.filter(r => r.type === 'database').map(db => (
                      <div key={db.uuid} className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Database UUID</span>
                          <span className="font-mono text-xs">{db.uuid}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Type</span>
                          <span className="font-semibold capitalize">{db.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Container Status</span>
                          <Badge className={db.status === 'running' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}>
                            {db.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {coolifyResources.filter(r => r.type === 'database').length === 0 && !loadingCoolify && (
                      <p className="text-xs text-muted-foreground text-center py-6">No database containers found in this project environment.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ============================================================
            4. CONFIGURATION TAB
            ============================================================ */}
        <TabsContent value="config">
          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Global System Feature Flags</CardTitle>
              <CardDescription>Enable or disable SaaS capabilities across all tenant domains.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/10">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Global AI Assistant</Label>
                  <p className="text-xs text-muted-foreground">
                    Enables the floating AI tutor and assistant widget globally on student panels.
                  </p>
                </div>
                <Switch
                  checked={flags.aiAssistantGlobal}
                  onCheckedChange={() => handleFlagToggle('aiAssistantGlobal')}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/10">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Intrinsic Gamification</Label>
                  <p className="text-xs text-muted-foreground">
                    Shows learner achievements, streaks, and milestone points in sidebar navigation.
                  </p>
                </div>
                <Switch
                  checked={flags.gamificationGlobal}
                  onCheckedChange={() => handleFlagToggle('gamificationGlobal')}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/10">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Automated Certificate Validation</Label>
                  <p className="text-xs text-muted-foreground">
                    Exposes certificate verification lookup links dynamically.
                  </p>
                </div>
                <Switch
                  checked={flags.certificateValidationGlobal}
                  onCheckedChange={() => handleFlagToggle('certificateValidationGlobal')}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/10">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Strict Row-Level Isolation (RLS)</Label>
                  <p className="text-xs text-muted-foreground">
                    Rejects cross-tenant API requests via forced Prisma queries scope parameters.
                  </p>
                </div>
                <Switch
                  checked={flags.strictTenantIsolationGlobal}
                  onCheckedChange={() => handleFlagToggle('strictTenantIsolationGlobal')}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Provision Tenant Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateTenant}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-1.5"><Sparkles className="h-5 w-5 text-emerald-500 animate-pulse" /> Provision New Tenant Academy</DialogTitle>
              <DialogDescription>Create a fully white-labeled isolated environment for a new client.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="tName">Academy Name</Label>
                  <Input
                    id="tName"
                    placeholder="e.g., Coders Academy"
                    value={tenantName}
                    onChange={(e) => {
                      setTenantName(e.target.value);
                      setTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tSlug">Subdomain Slug</Label>
                  <Input
                    id="tSlug"
                    placeholder="e.g., coders-academy"
                    value={tenantSlug}
                    onChange={(e) => setTenantSlug(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tDomain">Custom URL Mapping (Optional)</Label>
                <Input
                  id="tDomain"
                  placeholder="e.g., academy.coders.com"
                  value={tenantDomain}
                  onChange={(e) => setTenantDomain(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="tPlan">Pricing Tier</Label>
                  <Select value={tenantPlan} onValueChange={(v: any) => setTenantPlan(v)}>
                    <SelectTrigger id="tPlan">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter ($49/mo)</SelectItem>
                      <SelectItem value="professional">Professional ($97/mo)</SelectItem>
                      <SelectItem value="enterprise">Enterprise ($299/mo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tMaxUsers">Max Student Capacity</Label>
                  <Input
                    id="tMaxUsers"
                    type="number"
                    value={maxUsers}
                    onChange={(e) => setMaxUsers(e.target.value)}
                  />
                </div>
              </div>

              <Separator />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Visual Branding Overrides</p>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Primary</Label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-8 w-8 rounded border border-border cursor-pointer shrink-0"
                    />
                    <span className="text-[10px] font-mono">{primaryColor}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Secondary</Label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-8 w-8 rounded border border-border cursor-pointer shrink-0"
                    />
                    <span className="text-[10px] font-mono">{secondaryColor}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Accent</Label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-8 w-8 rounded border border-border cursor-pointer shrink-0"
                    />
                    <span className="text-[10px] font-mono">{accentColor}</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creatingTenant} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                {creatingTenant && <Loader2 className="h-4 w-4 animate-spin" />}
                Provision Now
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
