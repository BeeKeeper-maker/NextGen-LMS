'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
} from 'recharts';
import {
  DollarSign,
  Users,
  GraduationCap,
  CheckCircle,
  MessageCircle,
  UserPlus,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Sparkles,
  FileText,
  Star,
  ArrowRight,
  Clock,
  Bell,
  Activity,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  adminKPIs,
  revenueData,
  engagementData,
  completionFunnelData,
  categoryData,
  demoCourses,
  videoDropoffData,
} from '@/lib/mock-data';
import { useAppStore } from '@/store/app-store';
import type { DashboardKPI, Course } from '@/types';

// ─── Icon mapping ────────────────────────────────────────────
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'dollar-sign': DollarSign,
  users: Users,
  'graduation-cap': GraduationCap,
  'check-circle': CheckCircle,
  'message-circle': MessageCircle,
  'user-plus': UserPlus,
};

// ─── Chart configs ───────────────────────────────────────────
const revenueChartConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: '#10b981' },
  enrollments: { label: 'Enrollments', color: '#8b5cf6' },
  completions: { label: 'Completions', color: '#f59e0b' },
};

const engagementChartConfig: ChartConfig = {
  activeUsers: { label: 'Active Users', color: '#10b981' },
  postsCreated: { label: 'Posts Created', color: '#8b5cf6' },
  quizzesTaken: { label: 'Quizzes Taken', color: '#f59e0b' },
};

const categoryChartConfig: ChartConfig = {
  value: { label: 'Enrollments' },
  'Web Development': { label: 'Web Development', color: '#8b5cf6' },
  'Data Science': { label: 'Data Science', color: '#10b981' },
  Design: { label: 'Design', color: '#f59e0b' },
  Business: { label: 'Business', color: '#ef4444' },
  Marketing: { label: 'Marketing', color: '#a855f7' },
  'AI & ML': { label: 'AI & ML', color: '#06b6d4' },
};

const dropoffChartConfig: ChartConfig = {
  dropoff: { label: 'Drop-off %', color: '#ef4444' },
};

// ─── Animation variants ──────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ─── Level badge helper ──────────────────────────────────────
function LevelBadge({ level }: { level: Course['level'] }) {
  const map: Record<string, { variant: 'secondary' | 'outline' | 'destructive' | 'default'; className: string }> = {
    beginner: { variant: 'secondary', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300' },
    intermediate: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/40 dark:text-yellow-300' },
    advanced: { variant: 'secondary', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/40 dark:text-orange-300' },
    expert: { variant: 'secondary', className: 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300' },
  };
  const cfg = map[level] ?? map.beginner;
  return (
    <Badge variant={cfg.variant} className={cfg.className}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </Badge>
  );
}

// ─── Number formatting ───────────────────────────────────────
function fmtNumber(n: number): string {
  return n.toLocaleString('en-US');
}

// ─── Animated Counter ────────────────────────────────────────
function AnimatedCounter({ value, duration = 1500 }: { value: string; duration?: number }) {
  const [displayed, setDisplayed] = useState('0');
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // Parse the numeric part from the value string
    const numericMatch = value.match(/[\d,.]+/);
    if (!numericMatch) {
      // Non-numeric value, show directly without animation
      return;
    }

    const numericStr = numericMatch[0];
    const prefix = value.slice(0, value.indexOf(numericStr));
    const suffix = value.slice(value.indexOf(numericStr) + numericStr.length);
    const cleanNumber = parseFloat(numericStr.replace(/,/g, ''));
    const hasDecimals = numericStr.includes('.');
    const decimalPlaces = hasDecimals ? numericStr.split('.')[1].length : 0;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = cleanNumber * eased;

      let formatted: string;
      if (hasDecimals) {
        formatted = current.toFixed(decimalPlaces);
      } else {
        formatted = Math.round(current).toLocaleString('en-US');
      }

      setDisplayed(`${prefix}${formatted}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  // If non-numeric, just display the value directly
  const numericMatch = value.match(/[\d,.]+/);
  if (!numericMatch) {
    return <span>{value}</span>;
  }

  return <span>{displayed}</span>;
}

// ─── KPI Card ────────────────────────────────────────────────
function KPICard({ kpi, index }: { kpi: DashboardKPI; index: number }) {
  const Icon = iconMap[kpi.icon] ?? Users;
  const isPositive = kpi.change >= 0;
  const accentBorder = isPositive
    ? 'border-l-emerald-500'
    : 'border-l-red-500';
  const iconBg = isPositive
    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
    : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400';

  return (
    <motion.div variants={itemVariants} custom={index}>
      <Card className={`border-l-4 ${accentBorder} h-full`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </p>
              <p className="text-3xl font-bold tracking-tight">
                <AnimatedCounter value={String(kpi.value)} />
              </p>
            </div>
            <div className={`rounded-lg p-2.5 ${iconBg}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-sm">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <span
              className={
                isPositive
                  ? 'font-medium text-emerald-600 dark:text-emerald-400'
                  : 'font-medium text-red-600 dark:text-red-400'
              }
            >
              {isPositive ? '+' : ''}
              {kpi.change}%
            </span>
            <span className="text-muted-foreground">{kpi.changeLabel}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Revenue Analytics Chart ─────────────────────────────────
function RevenueChart() {
  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader>
          <CardTitle>Revenue Analytics</CardTitle>
          <CardDescription>
            Monthly revenue, enrollments & completions trend
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueChartConfig} className="h-[320px] w-full">
            <ComposedChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                fill="url(#revenueGrad)"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="enrollments"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="completions"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Engagement Bar Chart ────────────────────────────────────
function EngagementChart() {
  return (
    <motion.div variants={itemVariants}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Weekly Engagement</CardTitle>
          <CardDescription>
            Active users, posts & quizzes by day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={engagementChartConfig} className="h-[280px] w-full">
            <BarChart data={engagementData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="activeUsers" fill="var(--color-activeUsers)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="postsCreated" fill="var(--color-postsCreated)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="quizzesTaken" fill="var(--color-quizzesTaken)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Category Pie Chart ──────────────────────────────────────
function CategoryChart() {
  return (
    <motion.div variants={itemVariants}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
          <CardDescription>
            Enrollment by course category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={categoryChartConfig} className="h-[280px] w-full">
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={3}
                strokeWidth={0}
              >
                {categoryData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Completion Funnel ───────────────────────────────────────
function CompletionFunnel() {
  const maxCount = completionFunnelData[0].count;
  const funnelColors = [
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
  ];

  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader>
          <CardTitle>Completion Funnel</CardTitle>
          <CardDescription>
            Enrollment-to-certification journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {completionFunnelData.map((stage, idx) => {
              const widthPct = (stage.count / maxCount) * 100;
              return (
                <div key={stage.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stage.stage}</span>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>{fmtNumber(stage.count)}</span>
                      <span className="font-semibold text-foreground">
                        {stage.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="h-8 w-full overflow-hidden rounded-md bg-muted">
                    <motion.div
                      className={`h-full rounded-md ${funnelColors[idx] ?? 'bg-slate-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Recent Courses Table ────────────────────────────────────
function RecentCoursesTable() {
  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader>
          <CardTitle>Recent Courses</CardTitle>
          <CardDescription>
            Overview of all published courses
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Course</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-right">Enrollments</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="pl-6 font-medium max-w-[200px] truncate">
                      {course.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {course.category}
                    </TableCell>
                    <TableCell>
                      <LevelBadge level={course.level} />
                    </TableCell>
                    <TableCell className="text-right">
                      {fmtNumber(course.enrollmentCount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span>{course.avgRating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={course.completionRate} className="h-2 w-16" />
                        <span className="text-xs text-muted-foreground w-8">
                          {course.completionRate}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {course.isPublished ? (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300"
                        >
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          Draft
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Video Drop-off Chart ────────────────────────────────────
function VideoDropoffChart() {
  const maxDropoff = Math.max(...videoDropoffData.map((d) => d.dropoff));

  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader>
          <CardTitle>Video Engagement Drop-off</CardTitle>
          <CardDescription>
            Viewer drop-off rate by video segment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={dropoffChartConfig} className="h-[260px] w-full">
            <BarChart data={videoDropoffData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="segment" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="dropoff" radius={[4, 4, 0, 0]}>
                {videoDropoffData.map((entry, idx) => {
                  const ratio = entry.dropoff / maxDropoff;
                  const color =
                    ratio < 0.3
                      ? '#10b981'
                      : ratio < 0.6
                        ? '#f59e0b'
                        : '#ef4444';
                  return <Cell key={idx} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Quick Actions Panel ─────────────────────────────────────
const quickActions = [
  {
    title: 'Create New Course',
    description: 'Build and publish a new course with our AI-assisted builder',
    icon: BookOpen,
    accent: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
  },
  {
    title: 'Generate AI Content',
    description: 'Auto-generate lessons, quizzes, and summaries with AI',
    icon: Sparkles,
    accent: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
    pulse: true,
  },
  {
    title: 'View Reports',
    description: 'Export detailed analytics and performance reports',
    icon: FileText,
    accent: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  },
  {
    title: 'Manage Community',
    description: 'Moderate posts, manage categories, and engage members',
    icon: Users,
    accent: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
  },
];

function QuickActionsPanel() {
  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const IconComp = action.icon;
              return (
                <button
                  key={action.title}
                  type="button"
                  className="group flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-all hover:border-slate-300 hover:shadow-md dark:hover:border-slate-600"
                >
                  <div className={`rounded-lg p-2.5 ${action.accent} relative`}>
                    <IconComp className="h-5 w-5" />
                    {action.pulse && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500" />
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{action.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    <span>Open</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Recent Activity Feed ────────────────────────────────────
const recentActivityItems = [
  {
    id: 'ra-1',
    icon: UserPlus,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    title: 'New enrollment: Mike Chen joined Advanced React Masterclass',
    time: '5 minutes ago',
  },
  {
    id: 'ra-2',
    icon: CheckCircle,
    iconColor: 'text-violet-500',
    iconBg: 'bg-violet-50 dark:bg-violet-950/40',
    title: 'Course completed: Lisa Wang finished Data Visualization & Analytics',
    time: '23 minutes ago',
  },
  {
    id: 'ra-3',
    icon: MessageCircle,
    iconColor: 'text-sky-500',
    iconBg: 'bg-sky-50 dark:bg-sky-950/40',
    title: 'New discussion: "Best practices for API auth?" in Community',
    time: '1 hour ago',
  },
  {
    id: 'ra-4',
    icon: DollarSign,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    title: 'Revenue milestone: $47K MRR reached!',
    time: '3 hours ago',
  },
];

function RecentActivityFeed() {
  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-emerald-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {recentActivityItems.map((item, i) => {
              const ItemIcon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * i }}
                  className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0"
                >
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.iconBg}`}>
                    <ItemIcon className={`h-4 w-4 ${item.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground line-clamp-2">{item.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.time}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────
export function AdminDashboard() {
  const { currentUser } = useAppStore();
  const firstName = currentUser?.name?.split(' ')[0] || 'Sarah';

  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const update = () => {
      setCurrentDateTime(
        new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }) +
        ' · ' +
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header with greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground text-sm">
            Overview of your LMS platform performance and metrics
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 sm:mt-0">
          <Clock className="h-3.5 w-3.5" />
          {currentDateTime}
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Section 1: KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adminKPIs.map((kpi, idx) => (
            <KPICard key={kpi.label} kpi={kpi} index={idx} />
          ))}
        </div>

        {/* Section 1.5: Recent Activity + Quick Actions row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivityFeed />
          </div>
          <div className="hidden lg:block">
            <QuickActionsPanel />
          </div>
        </div>

        {/* Section 2: Revenue Analytics */}
        <RevenueChart />

        {/* Section 3: Engagement + Category side by side */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <EngagementChart />
          <CategoryChart />
        </div>

        {/* Section 4: Completion Funnel */}
        <CompletionFunnel />

        {/* Section 5: Recent Courses Table */}
        <RecentCoursesTable />

        {/* Section 6: Video Drop-off */}
        <VideoDropoffChart />

        {/* Section 7: Quick Actions (visible on smaller screens) */}
        <div className="lg:hidden">
          <QuickActionsPanel />
        </div>
      </motion.div>
    </div>
  );
}
