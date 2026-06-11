'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ComposedChart,
  ReferenceLine,
  ReferenceDot,
  ResponsiveContainer,
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
  Activity,
  Eye,
  PlayCircle,
  CircleDot,
  Award,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  Target,
  Zap,
  Search,
  GraduationCap as GradCapIcon,
  Heart,
  BarChart3,
  Shield,
  ChevronDown,
  ChevronUp,
  Radio,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
import { BulkOperationsDialog } from '@/components/admin/bulk-ops/bulk-operations-dialog';

// ─── CSS Keyframe Animations ──────────────────────────────────
const cssAnimations = `
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes shimmer {
  0% { transform: translateX(-100%) rotate(45deg); }
  100% { transform: translateX(200%) rotate(45deg); }
}

@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.4); opacity: 0; }
}

@keyframes bounce-arrow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes draw-line {
  0% { transform: scaleY(0); }
  100% { transform: scaleY(1); }
}

@keyframes score-fill {
  0% { stroke-dashoffset: 283; }
}

@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes data-pulse {
  0% { r: 3; opacity: 1; }
  50% { r: 6; opacity: 0.4; }
  100% { r: 3; opacity: 1; }
}

@keyframes ripple {
  0% { transform: scale(0); opacity: 0.5; }
  100% { transform: scale(4); opacity: 0; }
}
`;

// Inject CSS animations
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('admin-dashboard-animations');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'admin-dashboard-animations';
    style.textContent = cssAnimations;
    document.head.appendChild(style);
  }
}

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
  prevRevenue: { label: 'Revenue (Prev Year)', color: '#6ee7b7' },
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

// ─── Sparkline data for KPI cards (7-day deterministic trends) ──
const sparklineDataMap: Record<string, number[]> = {
  'dollar-sign': [38, 41, 39, 43, 42, 45, 47],
  users: [3100, 3200, 3350, 3400, 3500, 3620, 3847],
  'graduation-cap': [65, 67, 68, 69, 70, 71, 72],
  'check-circle': [86, 85, 86, 85, 84, 85, 84],
  'message-circle': [82, 84, 85, 86, 87, 88, 89],
  'user-plus': [180, 190, 200, 210, 218, 225, 234],
};

// ─── KPI card gradient backgrounds (glassmorphism per-card) ──────
const kpiGradientMap: Record<string, {
  from: string;
  to: string;
  iconBg: string;
  iconText: string;
  borderAccent: string;
  borderGradientFrom: string;
  borderGradientTo: string;
  shimmerColor: string;
}> = {
  'dollar-sign': {
    from: 'from-emerald-500/20',
    to: 'to-emerald-700/10',
    iconBg: 'bg-emerald-500/20 dark:bg-emerald-500/30',
    iconText: 'text-emerald-600 dark:text-emerald-300',
    borderAccent: 'border-l-emerald-500',
    borderGradientFrom: '#10b981',
    borderGradientTo: '#34d399',
    shimmerColor: 'rgba(16, 185, 129, 0.15)',
  },
  users: {
    from: 'from-sky-500/20',
    to: 'to-sky-700/10',
    iconBg: 'bg-sky-500/20 dark:bg-sky-500/30',
    iconText: 'text-sky-600 dark:text-sky-300',
    borderAccent: 'border-l-sky-500',
    borderGradientFrom: '#0ea5e9',
    borderGradientTo: '#38bdf8',
    shimmerColor: 'rgba(14, 165, 233, 0.15)',
  },
  'graduation-cap': {
    from: 'from-violet-500/20',
    to: 'to-violet-700/10',
    iconBg: 'bg-violet-500/20 dark:bg-violet-500/30',
    iconText: 'text-violet-600 dark:text-violet-300',
    borderAccent: 'border-l-violet-500',
    borderGradientFrom: '#8b5cf6',
    borderGradientTo: '#a78bfa',
    shimmerColor: 'rgba(139, 92, 246, 0.15)',
  },
  'check-circle': {
    from: 'from-amber-500/20',
    to: 'to-amber-700/10',
    iconBg: 'bg-amber-500/20 dark:bg-amber-500/30',
    iconText: 'text-amber-600 dark:text-amber-300',
    borderAccent: 'border-l-amber-500',
    borderGradientFrom: '#f59e0b',
    borderGradientTo: '#fbbf24',
    shimmerColor: 'rgba(245, 158, 11, 0.15)',
  },
  'message-circle': {
    from: 'from-rose-500/20',
    to: 'to-rose-700/10',
    iconBg: 'bg-rose-500/20 dark:bg-rose-500/30',
    iconText: 'text-rose-600 dark:text-rose-300',
    borderAccent: 'border-l-rose-500',
    borderGradientFrom: '#f43f5e',
    borderGradientTo: '#fb7185',
    shimmerColor: 'rgba(244, 63, 94, 0.15)',
  },
  'user-plus': {
    from: 'from-teal-500/20',
    to: 'to-teal-700/10',
    iconBg: 'bg-teal-500/20 dark:bg-teal-500/30',
    iconText: 'text-teal-600 dark:text-teal-300',
    borderAccent: 'border-l-teal-500',
    borderGradientFrom: '#14b8a6',
    borderGradientTo: '#2dd4bf',
    shimmerColor: 'rgba(20, 184, 166, 0.15)',
  },
};

// ─── Revenue data variants (weekly & daily) ──────────────────
const revenueWeeklyData = [
  { month: 'W1', revenue: 8200, enrollments: 58, completions: 38, prevRevenue: 6800 },
  { month: 'W2', revenue: 9400, enrollments: 64, completions: 42, prevRevenue: 7200 },
  { month: 'W3', revenue: 10100, enrollments: 70, completions: 48, prevRevenue: 7800 },
  { month: 'W4', revenue: 11200, enrollments: 78, completions: 52, prevRevenue: 8100 },
  { month: 'W5', revenue: 10800, enrollments: 72, completions: 49, prevRevenue: 8400 },
  { month: 'W6', revenue: 11800, enrollments: 82, completions: 56, prevRevenue: 8900 },
  { month: 'W7', revenue: 12300, enrollments: 85, completions: 60, prevRevenue: 9200 },
  { month: 'W8', revenue: 11900, enrollments: 80, completions: 55, prevRevenue: 8700 },
  { month: 'W9', revenue: 13000, enrollments: 90, completions: 64, prevRevenue: 9500 },
  { month: 'W10', revenue: 12500, enrollments: 87, completions: 61, prevRevenue: 9100 },
  { month: 'W11', revenue: 13500, enrollments: 93, completions: 67, prevRevenue: 9800 },
  { month: 'W12', revenue: 14332, enrollments: 98, completions: 72, prevRevenue: 10200 },
];

const revenueDailyData = [
  { month: 'Mon', revenue: 1850, enrollments: 13, completions: 9, prevRevenue: 1400 },
  { month: 'Tue', revenue: 2100, enrollments: 15, completions: 11, prevRevenue: 1600 },
  { month: 'Wed', revenue: 2400, enrollments: 17, completions: 13, prevRevenue: 1800 },
  { month: 'Thu', revenue: 2200, enrollments: 16, completions: 12, prevRevenue: 1700 },
  { month: 'Fri', revenue: 2050, enrollments: 14, completions: 10, prevRevenue: 1500 },
  { month: 'Sat', revenue: 1400, enrollments: 9, completions: 7, prevRevenue: 1100 },
  { month: 'Sun', revenue: 1200, enrollments: 8, completions: 6, prevRevenue: 900 },
];

// Year-over-year monthly revenue data (previous year)
const revenueDataWithPrev = revenueData.map((d, i) => ({
  ...d,
  prevRevenue: Math.round(d.revenue * (0.62 + i * 0.035)),
}));

// ─── Funnel stage icons ──────────────────────────────────────
const funnelIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Enrolled': UserPlus,
  'Started': PlayCircle,
  '50% Complete': CircleDot,
  '75% Complete': Target,
  'Completed': CheckCircle,
  'Certified': Award,
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

const funnelStageVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const funnelDropoffVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, delay: i * 0.12 + 0.25, ease: 'easeOut' },
  }),
};

// ─── Category color map ──────────────────────────────────────
const categoryColorMap: Record<string, string> = {
  'Web Development': 'bg-violet-500',
  'Data Science': 'bg-emerald-500',
  'Design': 'bg-amber-500',
  'Business': 'bg-red-500',
  'Marketing': 'bg-purple-500',
  'AI & ML': 'bg-cyan-500',
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

    const numericMatch = value.match(/[\d,.]+/);
    if (!numericMatch) {
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

  const numericMatch = value.match(/[\d,.]+/);
  if (!numericMatch) {
    return <span>{value}</span>;
  }

  return <span>{displayed}</span>;
}

// ─── Percentage Animated Counter ─────────────────────────────
function PercentageCounter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [displayed, setDisplayed] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = value * eased;
      setDisplayed(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{displayed.toFixed(1)}%</span>;
}

// ─── Circular Progress Ring ──────────────────────────────────
function ProgressRing({ percent, size = 32, strokeWidth = 3, color = '#10b981', animate = true }: { percent: number; size?: number; strokeWidth?: number; color?: string; animate?: boolean }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/30"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={animate ? { strokeDashoffset: circumference } : { strokeDashoffset: offset }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

// ─── Star Rating ─────────────────────────────────────────────
function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating);
        const halfFilled = !filled && i < rating;
        return (
          <Star
            key={i}
            className={`h-3.5 w-3.5 transition-colors ${
              filled
                ? 'fill-yellow-400 text-yellow-400'
                : halfFilled
                  ? 'fill-yellow-400/50 text-yellow-400'
                  : 'fill-muted text-muted-foreground/30'
            }`}
          />
        );
      })}
      <span className="ml-1 text-xs font-medium text-muted-foreground">{rating}</span>
    </div>
  );
}

// ─── Sparkline Mini Chart ────────────────────────────────────
function SparklineMiniChart({ data, color, isPositive }: { data: number[]; color: string; isPositive: boolean }) {
  const chartData = data.map((v, i) => ({ d: i, v }));
  const gradientId = `sparkline-${color.replace('#', '')}-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <div className="w-20 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 1, right: 0, left: 0, bottom: 1 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={true}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Table Sparkline ─────────────────────────────────────────
function TableSparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ d: i, v }));
  const gid = `tspark-${color.replace('#', '')}-${Math.random().toString(36).slice(2, 6)}`;
  return (
    <div className="w-16 h-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 1, right: 0, left: 0, bottom: 1 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gid})`}
            dot={false}
            isAnimationActive={true}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── KPI Card (Enhanced with Glassmorphism + Animated Gradient Border) ──
function KPICard({ kpi, index }: { kpi: DashboardKPI; index: number }) {
  const Icon = iconMap[kpi.icon] ?? Users;
  const isPositive = kpi.change >= 0;
  const gradients = kpiGradientMap[kpi.icon] ?? kpiGradientMap['users'];

  const sparklineData = sparklineDataMap[kpi.icon] ?? [10, 12, 11, 14, 13, 15, 16];
  const sparklineColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <motion.div variants={itemVariants} custom={index}>
      <motion.div
        className="relative group rounded-xl p-[1.5px] overflow-hidden"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Animated gradient border */}
        <div
          className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${gradients.borderGradientFrom}, ${gradients.borderGradientTo}, ${gradients.borderGradientFrom})`,
            backgroundSize: '200% 200%',
            animation: 'gradientShift 4s ease infinite',
          }}
        />

        {/* Inner card with glassmorphism */}
        <Card className="border-0 h-full shadow-sm group-hover:shadow-xl transition-shadow duration-300 overflow-hidden relative backdrop-blur-xl bg-white/70 dark:bg-gray-900/60">
          {/* Gradient mesh background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradients.from} ${gradients.to} pointer-events-none`} />

          {/* Glassmorphism shimmer overlay */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/20 via-transparent to-transparent dark:from-white/5" />

          {/* Animated shimmer sweep */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(105deg, transparent 40%, ${gradients.shimmerColor} 45%, transparent 50%)`,
                animation: 'shimmer 3s ease-in-out infinite',
                animationDelay: `${index * 0.5}s`,
              }}
            />
          </div>

          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {kpi.label}
                </p>
                <p className="text-3xl font-bold tracking-tight">
                  <AnimatedCounter value={String(kpi.value)} />
                </p>
              </div>
              <motion.div
                className={`rounded-xl p-2.5 ${gradients.iconBg} ${gradients.iconText} shadow-sm relative overflow-hidden`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {/* Sparkle/shimmer on icon bg */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 45%, transparent 50%)`,
                    animation: 'shimmer 2.5s ease-in-out infinite',
                  }}
                />
                <Icon className="h-5 w-5 relative z-10" />
              </motion.div>
            </div>
            {/* Sparkline + trend row */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm">
                {/* Pulsing indicator dot */}
                <span className="relative flex h-2.5 w-2.5">
                  {isPositive && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      isPositive ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  />
                </span>
                {/* Bouncing trend arrow */}
                <motion.div
                  className="flex items-center"
                  style={{
                    color: isPositive ? '#10b981' : '#ef4444',
                    animation: 'bounce-arrow 1.5s ease-in-out infinite',
                  }}
                >
                  {isPositive ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                </motion.div>
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
              <SparklineMiniChart data={sparklineData} color={sparklineColor} isPositive={isPositive} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ─── Custom Revenue Tooltip (Enhanced with Gradient) ─────────
function RevenueCustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string; dataKey: string }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;

  const mainPayload = payload.filter((p) => p.dataKey !== 'prevRevenue');
  const prevRev = payload.find((p) => p.dataKey === 'prevRevenue');

  return (
    <div className="rounded-xl border bg-gradient-to-br from-background via-background to-muted/50 backdrop-blur-md p-4 shadow-2xl min-w-[180px]">
      <p className="text-sm font-bold mb-2.5 border-b border-border/50 pb-1.5">{label}</p>
      {mainPayload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2 text-sm py-1">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold ml-auto">
            {entry.name === 'Revenue'
              ? `$${entry.value.toLocaleString('en-US')}`
              : entry.value.toLocaleString('en-US')}
          </span>
        </div>
      ))}
      {prevRev && (
        <div className="flex items-center gap-2 text-sm py-1 mt-1 border-t border-dashed border-border/40 pt-2">
          <span className="h-2.5 w-2.5 rounded-full shrink-0 bg-emerald-300/60 border border-emerald-400/40" />
          <span className="text-muted-foreground">Prev Year:</span>
          <span className="font-medium text-muted-foreground ml-auto">
            ${prevRev.value.toLocaleString('en-US')}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Revenue Analytics Chart (Enhanced with YoY, Live indicator, Period pills) ──
function RevenueChart() {
  const [view, setView] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [periodPill, setPeriodPill] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');

  const baseData = view === 'monthly' ? revenueDataWithPrev : view === 'weekly' ? revenueWeeklyData : revenueDailyData;
  const xKey = 'month';

  // Find peak revenue for annotation
  const peakIndex = baseData.reduce((maxI, d, i, arr) => d.revenue > arr[maxI].revenue ? i : maxI, 0);

  // YoY change calculation
  const latestRevenue = baseData[baseData.length - 1].revenue;
  const latestPrev = baseData[baseData.length - 1].prevRevenue;
  const yoyChange = ((latestRevenue - latestPrev) / latestPrev * 100).toFixed(1);

  // Pulsing data point data for the area chart
  const pulseDotData = baseData.map((d, i) => ({ ...d, pulseR: i === baseData.length - 1 ? 6 : 0 }));

  return (
    <motion.div variants={itemVariants}>
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Revenue Analytics
                  {/* Live indicator */}
                  <span className="flex items-center gap-1.5 text-xs font-normal text-emerald-600 dark:text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    Live
                  </span>
                </CardTitle>
                <CardDescription>
                  Revenue, enrollments & completions trend with YoY comparison
                </CardDescription>
              </div>
              {/* YoY comparison badge */}
              <Badge
                variant="secondary"
                className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-700/30 whitespace-nowrap"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                YoY +{yoyChange}%
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {/* Period toggle pills */}
              <div className="flex items-center rounded-lg border border-border/60 bg-muted/30 p-0.5">
                {(['7D', '30D', '90D', '1Y'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPeriodPill(p);
                      if (p === '7D') setView('daily');
                      else if (p === '30D') setView('weekly');
                      else setView('monthly');
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                      periodPill === p
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <Tabs value={view} onValueChange={(v) => setView(v as 'monthly' | 'weekly' | 'daily')}>
                <TabsList className="h-8">
                  <TabsTrigger value="monthly" className="text-xs px-2.5 py-1">Monthly</TabsTrigger>
                  <TabsTrigger value="weekly" className="text-xs px-2.5 py-1">Weekly</TabsTrigger>
                  <TabsTrigger value="daily" className="text-xs px-2.5 py-1">Daily</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-4 px-6">
          <ChartContainer config={revenueChartConfig} className="h-[320px] w-full">
            <ComposedChart data={pulseDotData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradEnhanced" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="30%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="enrollmentsGradEnhanced" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
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
              <Tooltip content={<RevenueCustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#94a3b8' }} />
              <ChartLegend content={<ChartLegendContent />} />
              {peakIndex >= 0 && (
                <ReferenceLine
                  yAxisId="left"
                  x={baseData[peakIndex][xKey]}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
              )}
              {peakIndex >= 0 && (
                <ReferenceDot
                  yAxisId="left"
                  x={baseData[peakIndex][xKey]}
                  y={baseData[peakIndex].revenue}
                  r={6}
                  fill="#f59e0b"
                  stroke="#fff"
                  strokeWidth={2}
                />
              )}
              {/* Animated pulsing data point on latest */}
              <ReferenceDot
                yAxisId="left"
                x={baseData[baseData.length - 1][xKey]}
                y={baseData[baseData.length - 1].revenue}
                r={4}
                fill="#10b981"
                stroke="#fff"
                strokeWidth={2}
              />
              {/* YoY comparison line (dashed, lighter) */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="prevRevenue"
                stroke="#6ee7b7"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                dot={false}
                animationDuration={1800}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                fill="url(#revenueGradEnhanced)"
                strokeWidth={2.5}
                animationDuration={1200}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="enrollments"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 3 }}
                animationDuration={1400}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="completions"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3 }}
                animationDuration={1600}
              />
            </ComposedChart>
          </ChartContainer>
          {/* Peak annotation label */}
          {peakIndex >= 0 && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Peak Revenue ({view === 'monthly' ? 'New Course Launch' : view === 'weekly' ? 'Campaign Peak' : 'Mid-week Spike'})</span>
              <span className="mx-1 text-border">|</span>
              <span className="h-2 w-4 border-t-2 border-dashed border-emerald-300" />
              <span>Previous Year</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Engagement Bar Chart ────────────────────────────────────
function EngagementChart() {
  return (
    <motion.div variants={itemVariants}>
      <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-2">
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
      <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-2">
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

// ─── Completion Funnel (Enhanced Horizontal with Icons & Dropoff) ──
function CompletionFunnel() {
  const maxCount = completionFunnelData[0].count;

  const funnelColors = [
    'from-emerald-500 to-emerald-400',
    'from-emerald-400 to-teal-400',
    'from-teal-400 to-yellow-400',
    'from-yellow-400 to-orange-400',
    'from-orange-400 to-red-400',
    'from-red-400 to-red-500',
  ];

  const funnelBorderColors = [
    'border-emerald-500/30',
    'border-emerald-400/30',
    'border-teal-400/30',
    'border-yellow-400/30',
    'border-orange-400/30',
    'border-red-400/30',
  ];

  const getDropoff = useCallback((currentIdx: number): { pct: number; count: number } | null => {
    if (currentIdx >= completionFunnelData.length - 1) return null;
    const current = completionFunnelData[currentIdx];
    const next = completionFunnelData[currentIdx + 1];
    const dropoffPct = ((current.count - next.count) / current.count) * 100;
    return { pct: Math.round(dropoffPct * 10) / 10, count: current.count - next.count };
  }, []);

  return (
    <motion.div variants={itemVariants}>
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-2">
          <CardTitle>Completion Funnel</CardTitle>
          <CardDescription>
            Enrollment-to-certification journey with drop-off rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {completionFunnelData.map((stage, idx) => {
              const widthPct = (stage.count / maxCount) * 100;
              const StageIcon = funnelIconMap[stage.stage] ?? CheckCircle;
              const dropoff = getDropoff(idx);

              return (
                <div key={stage.stage}>
                  <motion.div
                    custom={idx}
                    variants={funnelStageVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <StageIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{stage.stage}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span className="font-mono tabular-nums">{fmtNumber(stage.count)}</span>
                        <span className="font-semibold text-foreground min-w-[50px] text-right">
                          <PercentageCounter value={stage.percentage} duration={1000 + idx * 200} />
                        </span>
                      </div>
                    </div>
                    <div className={`h-9 w-full overflow-hidden rounded-md bg-muted border ${funnelBorderColors[idx] ?? ''}`}>
                      <motion.div
                        className={`h-full rounded-md bg-gradient-to-r ${funnelColors[idx] ?? 'from-slate-500 to-slate-400'} relative overflow-hidden`}
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ duration: 1, delay: idx * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                      </motion.div>
                    </div>
                  </motion.div>

                  {dropoff && (
                    <motion.div
                      custom={idx}
                      variants={funnelDropoffVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center justify-center gap-2 py-1.5"
                    >
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent" />
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/30">
                        <ArrowDownRight className="h-3 w-3 text-red-500" />
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">
                          {dropoff.pct}% drop
                        </span>
                        <span className="text-xs text-red-400 dark:text-red-500">
                          ({fmtNumber(dropoff.count)} users)
                        </span>
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent" />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Course Enrollment Trend Data ────────────────────────────
const courseTrends: Record<string, { direction: 'up' | 'down'; value: number }> = {
  'course-1': { direction: 'up', value: 12 },
  'course-2': { direction: 'up', value: 23 },
  'course-3': { direction: 'down', value: 3 },
  'course-4': { direction: 'up', value: 8 },
  'course-5': { direction: 'up', value: 5 },
  'course-6': { direction: 'down', value: 2 },
  'course-7': { direction: 'up', value: 15 },
  'course-8': { direction: 'up', value: 7 },
};

// Sparkline data per course for the Trend column
const courseSparklineData: Record<string, number[]> = {
  'course-1': [45, 52, 48, 61, 58, 65, 72],
  'course-2': [30, 35, 38, 42, 50, 55, 63],
  'course-3': [40, 42, 41, 39, 38, 37, 36],
  'course-4': [20, 25, 28, 32, 35, 38, 43],
  'course-5': [55, 53, 56, 58, 60, 62, 65],
  'course-6': [35, 34, 33, 35, 32, 31, 30],
  'course-7': [10, 18, 22, 28, 35, 42, 52],
  'course-8': [25, 28, 30, 33, 35, 38, 41],
};

// ─── Recent Courses Table (Enhanced with sparklines, category dots, row gradient) ──
function RecentCoursesTable() {
  return (
    <motion.div variants={itemVariants}>
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-2">
          <CardTitle>Course Performance</CardTitle>
          <CardDescription>
            Overview of all courses with ratings and completion metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                <TableRow>
                  <TableHead className="pl-6 min-w-[180px]">Course</TableHead>
                  <TableHead className="min-w-[100px]">Category</TableHead>
                  <TableHead className="min-w-[90px]">Level</TableHead>
                  <TableHead className="text-right min-w-[100px]">Enrollments</TableHead>
                  <TableHead className="min-w-[130px]">Rating</TableHead>
                  <TableHead className="min-w-[110px]">Completion</TableHead>
                  <TableHead className="min-w-[80px]">Trend</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoCourses.map((course, rowIdx) => {
                  const trend = courseTrends[course.id] ?? { direction: 'up' as const, value: 0 };
                  const completionColor = course.completionRate >= 75 ? '#10b981' : course.completionRate >= 50 ? '#f59e0b' : '#ef4444';
                  const sparkData = courseSparklineData[course.id] ?? [10, 12, 11, 14, 13, 15, 16];
                  const catDot = categoryColorMap[course.category ?? ''] ?? 'bg-gray-500';

                  return (
                    <TableRow
                      key={course.id}
                      className="group transition-all duration-200 cursor-pointer relative"
                    >
                      {/* Row hover gradient overlay */}
                      <td className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-violet-500/5 dark:from-emerald-500/10 dark:to-violet-500/10" />
                      </td>
                      <TableCell className="pl-6 font-medium max-w-[200px] truncate relative z-10">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${catDot}`} />
                          <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate">{course.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground relative z-10">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${catDot}`} />
                          {course.category}
                        </div>
                      </TableCell>
                      <TableCell className="relative z-10">
                        <LevelBadge level={course.level} />
                      </TableCell>
                      <TableCell className="text-right relative z-10">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-mono tabular-nums">{fmtNumber(course.enrollmentCount)}</span>
                          {trend.direction === 'up' ? (
                            <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                              <TrendingUp className="h-3 w-3" />
                              <span className="text-xs ml-0.5">+{trend.value}%</span>
                            </span>
                          ) : (
                            <span className="flex items-center text-red-600 dark:text-red-400">
                              <TrendingDown className="h-3 w-3" />
                              <span className="text-xs ml-0.5">-{trend.value}%</span>
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="relative z-10">
                        <StarRating rating={course.avgRating} />
                      </TableCell>
                      <TableCell className="relative z-10">
                        <div className="flex items-center gap-2">
                          <ProgressRing percent={course.completionRate} size={32} strokeWidth={3} color={completionColor} />
                          <span className="text-xs text-muted-foreground font-mono tabular-nums w-8">
                            {course.completionRate}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="relative z-10">
                        <TableSparkline
                          data={sparkData}
                          color={trend.direction === 'up' ? '#10b981' : '#ef4444'}
                        />
                      </TableCell>
                      <TableCell className="relative z-10">
                        {course.isPublished ? (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 relative"
                          >
                            <span className="relative flex h-2 w-2 mr-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            Draft
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
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
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-2">
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

// ─── Quick Actions Panel (Enhanced with gradient icons, NEW badge, ripple) ──
const quickActions = [
  {
    title: 'Create New Course',
    description: 'Build and publish a new course with our AI-assisted builder',
    icon: BookOpen,
    accent: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    gradientBorder: 'from-emerald-400 to-emerald-600',
    iconGradient: 'from-emerald-500 to-emerald-600',
  },
  {
    title: 'Generate AI Content',
    description: 'Auto-generate lessons, quizzes, and summaries with AI',
    icon: Sparkles,
    accent: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
    pulse: true,
    gradientBorder: 'from-violet-400 to-violet-600',
    iconGradient: 'from-violet-500 to-violet-600',
    isNew: true,
  },
  {
    title: 'Bulk Operations',
    description: 'Bulk enroll, email, and issue certificates to users',
    icon: Zap,
    accent: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400',
    pulse: true,
    gradientBorder: 'from-cyan-400 to-cyan-600',
    iconGradient: 'from-cyan-500 to-cyan-600',
    isBulkOps: true,
  },
  {
    title: 'View Reports',
    description: 'Export detailed analytics and performance reports',
    icon: FileText,
    accent: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    gradientBorder: 'from-amber-400 to-amber-600',
    iconGradient: 'from-amber-500 to-amber-600',
  },
  {
    title: 'Manage Community',
    description: 'Moderate posts, manage categories, and engage members',
    icon: Users,
    accent: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
    gradientBorder: 'from-rose-400 to-rose-600',
    iconGradient: 'from-rose-500 to-rose-600',
  },
];

function QuickActionsPanel({ onBulkOpsClick }: { onBulkOpsClick: () => void }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 h-full">
        <CardHeader className="pb-2">
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {quickActions.map((action, idx) => {
              const IconComp = action.icon;
              const isBulkOps = 'isBulkOps' in action && action.isBulkOps;
              const isNew = 'isNew' in action && action.isNew;
              return (
                <motion.button
                  key={action.title}
                  type="button"
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={isBulkOps ? onBulkOpsClick : undefined}
                  className="group relative flex flex-col items-start gap-3 rounded-xl p-[1px] text-left transition-all duration-300 focus:outline-none overflow-hidden"
                >
                  {/* Glassmorphism border */}
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${action.gradientBorder} opacity-0 group-hover:opacity-60 transition-opacity duration-300 blur-[0.5px]`} />
                  <div className="relative w-full flex flex-col items-start gap-3 rounded-xl border border-border/50 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-300 group-hover:bg-white/90 dark:group-hover:bg-slate-900/80 group-hover:shadow-lg group-hover:border-border/80">
                    {/* Ripple effect container */}
                    <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                      <span
                        className="absolute rounded-full bg-white/20"
                        style={{
                          width: 20,
                          height: 20,
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          animation: 'ripple 0s ease-out forwards',
                        }}
                      />
                    </div>

                    {/* Gradient icon container */}
                    <motion.div
                      className={`rounded-xl p-2.5 bg-gradient-to-br ${action.iconGradient} text-white shadow-md relative`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: idx * 0.1, type: 'spring', stiffness: 200 }}
                      whileHover={{ rotate: 8, scale: 1.1 }}
                    >
                      <IconComp className="h-5 w-5" />
                      {action.pulse && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500" />
                        </span>
                      )}
                    </motion.div>
                    <div className="relative">
                      <p className="font-semibold text-sm flex items-center gap-1.5">
                        {action.title}
                        {isNew && (
                          <Badge className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[10px] px-1.5 py-0 h-4 font-bold border-0 shadow-sm">
                            NEW
                          </Badge>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                    <div className="mt-auto flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      <span>Open</span>
                      <motion.div
                        animate={{ x: 0 }}
                        whileHover={{ x: 3 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </motion.div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Recent Activity Feed (Enhanced with animated timeline, colored dots, expand/collapse) ──
const activityTypeColors: Record<string, { dot: string; bg: string; text: string }> = {
  enrollment: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400' },
  completion: { dot: 'bg-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-600 dark:text-violet-400' },
  community: { dot: 'bg-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-600 dark:text-sky-400' },
  assessment: { dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400' },
  achievement: { dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400' },
  milestone: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400' },
  system: { dot: 'bg-slate-500', bg: 'bg-slate-50 dark:bg-slate-950/40', text: 'text-slate-600 dark:text-slate-400' },
};

const recentActivityItems = [
  {
    id: 'ra-1',
    icon: UserPlus,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    dotColor: 'bg-emerald-500',
    title: 'New enrollment: Mike Chen joined Advanced React Masterclass',
    time: '5 minutes ago',
    type: 'enrollment',
    detail: 'Mike Chen enrolled via the Pro Annual plan. Course start date: today. Payment: $197 via Stripe.',
  },
  {
    id: 'ra-2',
    icon: Trophy,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
    dotColor: 'bg-amber-500',
    title: 'Achievement unlocked: Lisa Wang earned "React Master" badge',
    time: '23 minutes ago',
    type: 'achievement',
    detail: 'Lisa completed all 12 modules and scored 95%+ on every assessment. Badge earned: React Master Gold.',
  },
  {
    id: 'ra-3',
    icon: MessageCircle,
    iconColor: 'text-sky-500',
    iconBg: 'bg-sky-50 dark:bg-sky-950/40',
    dotColor: 'bg-sky-500',
    title: 'New discussion: "Best practices for API auth?" in Community',
    time: '1 hour ago',
    type: 'community',
    detail: 'Posted by Alex Rivera in Web Development category. 3 replies so far. Trending in the community feed.',
  },
  {
    id: 'ra-4',
    icon: CheckCircle,
    iconColor: 'text-violet-500',
    iconBg: 'bg-violet-50 dark:bg-violet-950/40',
    dotColor: 'bg-violet-500',
    title: 'Assessment completed: 45 students submitted Quiz #3 in Data Viz',
    time: '2 hours ago',
    type: 'assessment',
    detail: 'Average score: 82.3%. Pass rate: 91%. 4 students requested retake. Quiz difficulty: Intermediate.',
  },
  {
    id: 'ra-5',
    icon: DollarSign,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    dotColor: 'bg-emerald-500',
    title: 'Revenue milestone: $47K MRR reached!',
    time: '3 hours ago',
    type: 'milestone',
    detail: 'Monthly recurring revenue crossed $47,000 for the first time. Growth driven by enterprise plan upgrades.',
  },
  {
    id: 'ra-6',
    icon: GraduationCap,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
    dotColor: 'bg-amber-500',
    title: 'Certificate issued: 12 new certifications this week',
    time: '5 hours ago',
    type: 'completion',
    detail: 'Top courses: Advanced React (4), Data Science (3), ML Basics (3), UX Design (2). All certificates verified.',
  },
];

function RecentActivityFeed() {
  const [showAll, setShowAll] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const displayedItems = showAll ? recentActivityItems : recentActivityItems.slice(0, 4);

  return (
    <motion.div variants={itemVariants}>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <Activity className="h-4 w-4 text-emerald-500" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-xs">Live feed of platform events</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Animated timeline connecting line */}
            <div
              className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-500/40 via-violet-500/40 to-amber-500/40 origin-top"
              style={{
                animation: 'draw-line 1.2s ease-out forwards',
              }}
            />

            <div className="space-y-0">
              {displayedItems.map((item, i) => {
                const ItemIcon = item.icon;
                const typeColor = activityTypeColors[item.type] ?? activityTypeColors.system;
                const isExpanded = expandedId === item.id;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.08 * i }}
                    className="relative"
                  >
                    <button
                      type="button"
                      className={`relative flex items-start gap-3 py-3 w-full text-left border-b border-border/50 last:border-0 transition-colors duration-200 hover:bg-muted/20 rounded-md px-1 -mx-1 ${
                        i % 2 === 0 ? 'bg-muted/5' : ''
                      }`}
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    >
                      {/* Colored timeline dot */}
                      <div className="relative z-10 flex items-center justify-center mt-0.5">
                        <span className={`h-3 w-3 rounded-full ${typeColor.dot} ring-2 ring-background shrink-0`} />
                      </div>
                      {/* Activity icon */}
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${typeColor.bg}`}>
                        <ItemIcon className={`h-4 w-4 ${typeColor.text}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground line-clamp-2">{item.title}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.time}
                          </span>
                          {/* Relative time badge */}
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${typeColor.text} border-current/20`}>
                            {item.type}
                          </Badge>
                          {/* Expand/collapse chevron */}
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-auto"
                          >
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          </motion.div>
                        </div>
                      </div>
                    </button>

                    {/* Expandable detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="overflow-hidden"
                        >
                          <div className="ml-[54px] mb-3 p-3 rounded-lg bg-muted/30 border border-border/30 text-xs text-muted-foreground leading-relaxed">
                            {item.detail}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* View All button - subtle pulse */}
          {recentActivityItems.length > 4 && (
            <motion.button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="mt-3 flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors w-full justify-center py-1.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/30 relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span style={{ animation: 'pulse-subtle 2s ease-in-out infinite' }}>
                {showAll ? 'Show Less' : 'View All Activity'}
              </span>
              <motion.div
                animate={{ rotate: showAll ? -90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </motion.button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Real-time Metrics Ticker ────────────────────────────────
const tickerItems = [
  { icon: Search, label: 'users browsing now', value: '3', color: 'text-sky-500' },
  { icon: GradCapIcon, label: 'lessons completed today', value: '12', color: 'text-emerald-500' },
  { icon: DollarSign, label: 'revenue today', value: '$1,240', color: 'text-amber-500' },
  { icon: UserPlus, label: 'new enrollments this week', value: '8', color: 'text-violet-500' },
  { icon: Star, label: 'avg rating this month', value: '4.8', color: 'text-rose-500' },
];

function MetricsTicker() {
  // Duplicate items for seamless loop
  const items = [...tickerItems, ...tickerItems];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="relative overflow-hidden rounded-xl border border-border/40 bg-gradient-to-r from-muted/30 via-background to-muted/30 py-2"
    >
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div
        className="flex items-center gap-8 whitespace-nowrap"
        style={{
          animation: 'marquee 30s linear infinite',
        }}
      >
        {items.map((item, i) => {
          const TickerIcon = item.icon;
          return (
            <div key={i} className="flex items-center gap-2 text-sm">
              <TickerIcon className={`h-4 w-4 ${item.color}`} />
              <span className="font-bold text-foreground">{item.value}</span>
              <span className="text-muted-foreground">{item.label}</span>
              <span className="text-border">•</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Performance Score Ring ──────────────────────────────────
function PerformanceScoreRing() {
  const score = 87;
  const maxScore = 100;
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / maxScore) * circumference;
  const color = score > 80 ? '#10b981' : score > 60 ? '#f59e0b' : '#ef4444';
  const colorLabel = score > 80 ? 'Excellent' : score > 60 ? 'Good' : 'Needs Attention';

  const breakdown = [
    { label: 'Uptime', value: 99.9, color: '#10b981' },
    { label: 'Load Speed', value: 92, color: '#0ea5e9' },
    { label: 'User Satisfaction', value: 88, color: '#8b5cf6' },
    { label: 'Content Quality', value: 85, color: '#f59e0b' },
    { label: 'Completion Rate', value: 72, color: '#14b8a6' },
  ];

  return (
    <motion.div variants={itemVariants}>
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-500" />
            Platform Health
          </CardTitle>
          <CardDescription>Overall platform performance score</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {/* Circular progress ring */}
          <div className="relative group cursor-pointer">
            <svg width={size} height={size} className="transform -rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-muted/20"
              />
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-2xl font-bold"
                style={{ color }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                {score}
              </motion.span>
              <span className="text-[10px] text-muted-foreground font-medium">/ {maxScore}</span>
            </div>

            {/* Breakdown tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 rounded-xl border bg-background/95 backdrop-blur-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              <p className="text-xs font-semibold mb-2">Score Breakdown</p>
              <div className="space-y-2">
                {breakdown.map((b) => (
                  <div key={b.label} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span className="text-muted-foreground">{b.label}</span>
                        <span className="font-medium">{b.value}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: b.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${b.value}%` }}
                          transition={{ duration: 0.8, delay: 0.8 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Badge
            variant="secondary"
            className="text-xs"
            style={{
              backgroundColor: score > 80 ? 'rgba(16, 185, 129, 0.1)' : score > 60 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: color,
            }}
          >
            {colorLabel}
          </Badge>
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
  const [showBulkOps, setShowBulkOps] = useState(false);

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
          <span className="text-muted-foreground/60">·</span>
          <span className="text-muted-foreground/80">Last updated: just now</span>
        </div>
      </motion.div>

      {/* Real-time Metrics Ticker */}
      <MetricsTicker />

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

        {/* Section 1.5: Recent Activity + Quick Actions + Performance Ring */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <RecentActivityFeed />
          </div>
          <div className="hidden lg:block">
            <QuickActionsPanel onBulkOpsClick={() => setShowBulkOps(true)} />
          </div>
          <div className="hidden lg:block">
            <PerformanceScoreRing />
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

        {/* Section 5: Course Performance Table */}
        <RecentCoursesTable />

        {/* Section 6: Video Drop-off */}
        <VideoDropoffChart />

        {/* Section 7: Quick Actions (visible on smaller screens) */}
        <div className="lg:hidden">
          <QuickActionsPanel onBulkOpsClick={() => setShowBulkOps(true)} />
        </div>

        {/* Performance Score Ring on mobile */}
        <div className="lg:hidden">
          <PerformanceScoreRing />
        </div>
      </motion.div>

      {/* Bulk Operations Dialog */}
      <BulkOperationsDialog open={showBulkOps} onOpenChange={setShowBulkOps} />
    </div>
  );
}
