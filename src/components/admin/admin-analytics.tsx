'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  BarChart3,
  Users,
  Clock,
  Target,
  Globe,
  GraduationCap,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  FileText,
  Image as ImageIcon,
  Table,
  ChevronDown,
  Flame,
  Zap,
  BookOpen,
  Code,
  Palette,
  Brain,
  ArrowRight,
  Check,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  revenueData,
  dailyMetrics,
  demoCourses,
  engagementData,
} from '@/lib/mock-data';
import { cn } from '@/lib/utils';

// ─── Date Range Presets ─────────────────────────────────────
type DateRange = '7d' | '30d' | '90d' | 'custom';

const dateRangeLabels: Record<DateRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  custom: 'Custom range',
};

// ─── Chart configs ──────────────────────────────────────────
const revenueChartConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: '#10B981' },
  prevRevenue: { label: 'Prev. Period', color: '#94A3B8' },
};

const activeUsersChartConfig: ChartConfig = {
  activeUsers: { label: 'Active Users', color: '#8B5CF6' },
};

const quizAttemptsChartConfig: ChartConfig = {
  quizAttempts: { label: 'Quiz Attempts', color: '#10B981' },
};

const sessionDurationChartConfig: ChartConfig = {
  avgSessionDuration: { label: 'Avg Session (min)', color: '#F59E0B' },
};

const geographicChartConfig: ChartConfig = {
  percentage: { label: 'Percentage', color: '#10B981' },
};

const beforeAfterChartConfig: ChartConfig = {
  before: { label: 'Before', color: '#94A3B8' },
  after: { label: 'After', color: '#10B981' },
};

const skillsRadarConfig: ChartConfig = {
  before: { label: 'Pre-Assessment', color: '#94A3B8' },
  after: { label: 'Post-Assessment', color: '#10B981' },
};

const completionDistConfig: ChartConfig = {
  count: { label: 'Learners', color: '#10B981' },
};

const scatterConfig: ChartConfig = {
  webDev: { label: 'Web Dev', color: '#10B981' },
  aiMl: { label: 'AI/ML', color: '#8B5CF6' },
  dataScience: { label: 'Data Science', color: '#F59E0B' },
  design: { label: 'Design', color: '#06B6D4' },
};

const revenueBarConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: '#10B981' },
};

const pieChartConfig: ChartConfig = {
  americas: { label: 'Americas', color: '#10B981' },
  europe: { label: 'Europe', color: '#8B5CF6' },
  asia: { label: 'Asia', color: '#F59E0B' },
  other: { label: 'Other', color: '#06B6D4' },
};

// ─── Mock data for geographic distribution ──────────────────
const geographicData = [
  { country: 'USA', percentage: 35, flag: '🇺🇸', learners: 1347 },
  { country: 'UK', percentage: 18, flag: '🇬🇧', learners: 692 },
  { country: 'India', percentage: 15, flag: '🇮🇳', learners: 577 },
  { country: 'Canada', percentage: 10, flag: '🇨🇦', learners: 385 },
  { country: 'Others', percentage: 22, flag: '🌍', learners: 846 },
];

const regionalPieData = [
  { name: 'Americas', value: 45, color: '#10B981' },
  { name: 'Europe', value: 25, color: '#8B5CF6' },
  { name: 'Asia', value: 20, color: '#F59E0B' },
  { name: 'Other', value: 10, color: '#06B6D4' },
];

// ─── Mock data for learning outcomes ────────────────────────
const beforeAfterData = [
  { skill: 'React Fundamentals', before: 45, after: 89 },
  { skill: 'Next.js Architecture', before: 32, after: 82 },
  { skill: 'TypeScript Patterns', before: 50, after: 87 },
  { skill: 'State Management', before: 40, after: 78 },
  { skill: 'API Design', before: 35, after: 85 },
  { skill: 'Testing', before: 28, after: 72 },
];

const beforeAfterRadarData = [
  { skill: 'React', before: 45, after: 89 },
  { skill: 'TypeScript', before: 50, after: 87 },
  { skill: 'Next.js', before: 32, after: 82 },
  { skill: 'State Mgmt', before: 40, after: 78 },
  { skill: 'Testing', before: 28, after: 72 },
  { skill: 'API Design', before: 35, after: 85 },
  { skill: 'Sys Design', before: 38, after: 75 },
  { skill: 'DevOps', before: 22, after: 62 },
];

const skillsRadarData = [
  { skill: 'React', score: 88 },
  { skill: 'TypeScript', score: 82 },
  { skill: 'Next.js', score: 85 },
  { skill: 'State Mgmt', score: 76 },
  { skill: 'Testing', score: 70 },
  { skill: 'API Design', score: 83 },
  { skill: 'System Design', score: 65 },
  { skill: 'DevOps', score: 58 },
];

const completionDistData = [
  { range: '< 1 week', count: 45 },
  { range: '1-2 weeks', count: 120 },
  { range: '2-4 weeks', count: 210 },
  { range: '1-2 months', count: 180 },
  { range: '2-3 months', count: 95 },
  { range: '3+ months', count: 40 },
];

// ─── Activity Heatmap Data ─────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function generateActivityHeatmap(): number[][] {
  return DAYS.map(() =>
    HOURS.map((hour) => {
      // More activity during business hours (9-18)
      if (hour >= 9 && hour <= 18) {
        return Math.floor(30 + Math.random() * 70);
      }
      // Moderate activity in evening (19-22)
      if (hour >= 19 && hour <= 22) {
        return Math.floor(10 + Math.random() * 30);
      }
      // Low activity at night and early morning
      return Math.floor(Math.random() * 12);
    })
  );
}

const activityHeatmapData = generateActivityHeatmap();

// ─── Scatter Plot Data ─────────────────────────────────────
const categoryColors: Record<string, string> = {
  'Web Development': '#10B981',
  'AI & ML': '#8B5CF6',
  'Data Science': '#F59E0B',
  Design: '#06B6D4',
};

const categoryKeys: Record<string, string> = {
  'Web Development': 'webDev',
  'AI & ML': 'aiMl',
  'Data Science': 'dataScience',
  Design: 'design',
};

const scatterData = [
  { name: 'Advanced React & Next.js', duration: 42, completion: 78, enrollment: 847, category: 'Web Development' },
  { name: 'AI-Powered Full Stack', duration: 36, completion: 82, enrollment: 623, category: 'AI & ML' },
  { name: 'System Design', duration: 28, completion: 65, enrollment: 412, category: 'Web Development' },
  { name: 'Data Visualization', duration: 22, completion: 71, enrollment: 389, category: 'Data Science' },
  { name: 'UX/UI Design Principles', duration: 18, completion: 74, enrollment: 567, category: 'Design' },
  { name: 'DevOps & Cloud', duration: 32, completion: 69, enrollment: 298, category: 'Web Development' },
  { name: 'Machine Learning A-Z', duration: 45, completion: 58, enrollment: 520, category: 'AI & ML' },
  { name: 'Python for Data Science', duration: 30, completion: 76, enrollment: 445, category: 'Data Science' },
  { name: 'Figma Masterclass', duration: 15, completion: 82, enrollment: 380, category: 'Design' },
  { name: 'Full Stack with Node.js', duration: 38, completion: 72, enrollment: 510, category: 'Web Development' },
  { name: 'Deep Learning Specialization', duration: 50, completion: 55, enrollment: 310, category: 'AI & ML' },
  { name: 'Tableau for Analytics', duration: 20, completion: 79, enrollment: 290, category: 'Data Science' },
];

// ─── Revenue per Course Data ────────────────────────────────
const revenuePerCourse = [
  { name: 'Advanced React & Next.js', revenue: 100000, icon: 'code', color: '#10B981' },
  { name: 'AI-Powered Full Stack', revenue: 55600, icon: 'brain', color: '#8B5CF6' },
  { name: 'UX/UI Design Principles', revenue: 33600, icon: 'palette', color: '#06B6D4' },
  { name: 'System Design', revenue: 61400, icon: 'code', color: '#10B981' },
  { name: 'Data Visualization', revenue: 30100, icon: 'book', color: '#F59E0B' },
  { name: 'DevOps & Cloud', revenue: 32000, icon: 'code', color: '#10B981' },
].sort((a, b) => b.revenue - a.revenue);

// ─── Trend Line Data (Linear Regression) ─────────────────────
function computeLinearRegression(data: { duration: number; completion: number }[]): { x1: number; y1: number; x2: number; y2: number } {
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  data.forEach(d => {
    sumX += d.duration;
    sumY += d.completion;
    sumXY += d.duration * d.completion;
    sumXX += d.duration * d.duration;
  });
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const minX = Math.min(...data.map(d => d.duration)) - 2;
  const maxX = Math.max(...data.map(d => d.duration)) + 2;
  return {
    x1: minX,
    y1: Math.max(0, Math.min(100, slope * minX + intercept)),
    x2: maxX,
    y2: Math.max(0, Math.min(100, slope * maxX + intercept)),
  };
}

const trendLine = computeLinearRegression(scatterData);
const trendLineData = [
  { duration: trendLine.x1, completion: trendLine.y1, enrollment: 0, name: 'Trend', category: 'Trend' },
  { duration: trendLine.x2, completion: trendLine.y2, enrollment: 0, name: 'Trend', category: 'Trend' },
];

const totalRevenueByCourse = revenuePerCourse.reduce((sum, c) => sum + c.revenue, 0);

// ─── Course Performance Matrix helpers ──────────────────────
const coursePerformanceData = demoCourses.map((course) => ({
  title: course.title.length > 30 ? course.title.slice(0, 30) + '…' : course.title,
  enrollment: course.enrollmentCount,
  completionRate: course.completionRate,
  avgRating: course.avgRating,
  revenue: Math.floor(course.enrollmentCount * course.price * 0.6),
  dropoffRate: Math.floor(100 - course.completionRate - Math.random() * 10),
}));

function getHeatmapColor(value: number, metric: string): string {
  if (metric === 'completionRate' || metric === 'avgRating') {
    if (value >= 80) return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400';
    if (value >= 60) return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
    return 'bg-red-500/20 text-red-700 dark:text-red-400';
  }
  if (metric === 'dropoffRate') {
    if (value <= 15) return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400';
    if (value <= 30) return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
    return 'bg-red-500/20 text-red-700 dark:text-red-400';
  }
  if (metric === 'revenue') {
    if (value >= 80000) return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400';
    if (value >= 40000) return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
    return 'bg-red-500/20 text-red-700 dark:text-red-400';
  }
  if (metric === 'enrollment') {
    if (value >= 500) return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400';
    if (value >= 300) return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
    return 'bg-red-500/20 text-red-700 dark:text-red-400';
  }
  return 'bg-slate-500/20 text-slate-700 dark:text-slate-300';
}

// ─── Compute revenue KPIs ──────────────────────────────────
const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
const avgDailyRevenue = Math.floor(totalRevenue / revenueData.length / 30);
const bestDay = revenueData.reduce((best, d) => (d.revenue > best.revenue ? d : best), revenueData[0]);
const mrrGrowth = ((revenueData[revenueData.length - 1].revenue - revenueData[0].revenue) / revenueData[0].revenue * 100).toFixed(1);

// ─── Animation variants ────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ─── Animated Number Counter ────────────────────────────────
function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1500 }: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [displayed, setDisplayed] = useState(0);
  const startTime = useRef<number | null>(null);
  const frameRef = useRef<number>(0);
  const animateRef = useRef<((timestamp: number) => void) | null>(null);

  useEffect(() => {
    animateRef.current = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.floor(eased * value));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame((ts) => animateRef.current?.(ts));
      }
    };
    startTime.current = null;
    frameRef.current = requestAnimationFrame((ts) => animateRef.current?.(ts));
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return (
    <span>
      {prefix}{displayed.toLocaleString()}{suffix}
    </span>
  );
}

// ─── Activity Heatmap Component ─────────────────────────────
function ActivityHeatmap() {
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number; value: number } | null>(null);
  const maxVal = Math.max(...activityHeatmapData.flat());

  function getCellColor(value: number): string {
    const intensity = value / maxVal;
    if (intensity === 0) return 'bg-slate-100 dark:bg-slate-800';
    if (intensity < 0.15) return 'bg-emerald-100 dark:bg-emerald-900/30';
    if (intensity < 0.3) return 'bg-emerald-200 dark:bg-emerald-800/40';
    if (intensity < 0.5) return 'bg-emerald-300 dark:bg-emerald-700/50';
    if (intensity < 0.7) return 'bg-emerald-400 dark:bg-emerald-600/60';
    if (intensity < 0.85) return 'bg-emerald-500 dark:bg-emerald-500/70';
    return 'bg-emerald-600 dark:bg-emerald-400/80';
  }

  // Compute day totals for summary
  const dayTotals = DAYS.map((_, dayIdx) =>
    activityHeatmapData[dayIdx].reduce((sum, v) => sum + v, 0)
  );
  const peakDayIdx = dayTotals.indexOf(Math.max(...dayTotals));
  const hourTotals = HOURS.map((h) =>
    DAYS.map((_, d) => activityHeatmapData[d][h]).reduce((s, v) => s + v, 0)
  );
  const peakHourIdx = hourTotals.indexOf(Math.max(...hourTotals));

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-[3px] min-w-[700px]">
          {/* Hour labels */}
          <div className="flex gap-[3px] pl-12">
            {HOURS.filter((_, i) => i % 3 === 0).map((hour) => (
              <div key={hour} className="flex-[3] text-[10px] text-muted-foreground text-center">
                {hour}h
              </div>
            ))}
          </div>
          {DAYS.map((day, dayIdx) => (
            <div key={day} className="flex items-center gap-[3px]">
              <div className={cn(
                'w-10 text-[11px] font-medium shrink-0',
                dayIdx === peakDayIdx ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-muted-foreground'
              )}>
                {day}
              </div>
              {HOURS.map((hour) => {
                const value = activityHeatmapData[dayIdx][hour];
                const isWeekend = dayIdx >= 5;
                const isBusinessHour = hour >= 9 && hour <= 18;
                return (
                  <motion.div
                    key={`${dayIdx}-${hour}`}
                    className={cn(
                      'flex-1 aspect-square min-w-[22px] rounded-[3px] cursor-pointer transition-all duration-150 relative',
                      getCellColor(value),
                      isWeekend && 'ring-1 ring-inset ring-violet-200/30 dark:ring-violet-500/10',
                      hoveredCell?.day === dayIdx && hoveredCell?.hour === hour
                        ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-background scale-110 z-10'
                        : 'hover:scale-105'
                    )}
                    onMouseEnter={() => setHoveredCell({ day: dayIdx, hour, value })}
                    onMouseLeave={() => setHoveredCell(null)}
                    whileHover={{ scale: 1.15 }}
                  >
                    {/* Peak hour indicator */}
                    {hour === peakHourIdx && dayIdx === peakDayIdx && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredCell && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium shadow-lg"
          >
            <span>{DAYS[hoveredCell.day]} {hoveredCell.hour}:00</span>
            <span className={cn(
              'w-2 h-2 rounded-full',
              hoveredCell.value > maxVal * 0.7 ? 'bg-emerald-400' : hoveredCell.value > maxVal * 0.3 ? 'bg-emerald-300' : 'bg-emerald-200'
            )} />
            <span>{hoveredCell.value} activities</span>
            {hoveredCell.day >= 5 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-violet-500/20 text-violet-300">Weekend</Badge>
            )}
            {hoveredCell.hour >= 9 && hoveredCell.hour <= 18 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/20 text-emerald-300">Business</Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          {['bg-slate-100 dark:bg-slate-800', 'bg-emerald-200 dark:bg-emerald-800/40', 'bg-emerald-300 dark:bg-emerald-700/50', 'bg-emerald-500 dark:bg-emerald-500/70', 'bg-emerald-600 dark:bg-emerald-400/80'].map((color, i) => (
            <div key={i} className={cn('w-4 h-4 rounded-[3px]', color)} />
          ))}
          <span>More</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-[3px] ring-1 ring-inset ring-violet-200/30 dark:ring-violet-500/10 bg-emerald-200 dark:bg-emerald-800/40" />
            <span>Weekend</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Peak</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Glassmorphism Card Wrapper ─────────────────────────────
function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'rounded-xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg',
      className
    )}>
      {children}
    </div>
  );
}

// ─── Gradient Divider ───────────────────────────────────────
function GradientDivider() {
  return (
    <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
  );
}

// ─── Loading Skeleton ───────────────────────────────────────
function AnalyticsSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>
      {/* Date range pills skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-lg" />
          ))}
          <Skeleton className="h-7 w-36 rounded-full" />
        </div>
        <Skeleton className="h-5 w-52" />
      </div>
      {/* Summary stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-4 space-y-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      {/* Main chart skeletons */}
      <div className="rounded-xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden">
        <div className="p-6 space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="px-6 pb-6">
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
      </div>
      {/* Secondary chart skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 space-y-3">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-[220px] w-full rounded-lg" />
        </div>
        <div className="rounded-xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 space-y-3">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-[220px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Course Icon Helper ─────────────────────────────────────
function CourseIcon({ icon, color }: { icon: string; color: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    code: <Code className="h-4 w-4" style={{ color }} />,
    brain: <Brain className="h-4 w-4" style={{ color }} />,
    palette: <Palette className="h-4 w-4" style={{ color }} />,
    book: <BookOpen className="h-4 w-4" style={{ color }} />,
  };
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20` }}>
      {iconMap[icon] || <BookOpen className="h-4 w-4" style={{ color }} />}
    </div>
  );
}

// ─── Custom Scatter Tooltip ─────────────────────────────────
function ScatterTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; duration: number; completion: number; enrollment: number; category: string } }> }) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{data.name}</p>
      <div className="space-y-0.5 text-muted-foreground">
        <p>Duration: <span className="text-foreground font-medium">{data.duration}h</span></p>
        <p>Completion: <span className="text-foreground font-medium">{data.completion}%</span></p>
        <p>Enrollments: <span className="text-foreground font-medium">{data.enrollment.toLocaleString()}</span></p>
        <p>Category: <span className="font-medium" style={{ color: categoryColors[data.category] }}>{data.category}</span></p>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
export function AdminAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [comparePrevious, setComparePrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter daily metrics based on date range
  const filteredMetrics = (() => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    return dailyMetrics.slice(-days);
  })();

  // Previous period data for comparison
  const previousMetrics = (() => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    return dailyMetrics.slice(-(days * 2), -days);
  })();

  // Comparison revenue data
  const comparisonRevenueData = revenueData.map((d, i) => ({
    ...d,
    prevRevenue: i < revenueData.length - 1
      ? Math.floor(d.revenue * (0.78 + Math.random() * 0.15))
      : d.revenue * 0.82,
  }));

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <motion.div
      className="p-4 md:p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Header & Controls ─────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Analytics Deep Dive</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive platform analytics and performance insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Export Report Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-4 w-4" />
                Export Report
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2">
                <FileText className="h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Table className="h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <ImageIcon className="h-4 w-4" />
                Export as PNG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Share Dashboard Button */}
          <Button variant="outline" size="sm" className="gap-1.5">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </motion.div>

      {/* Date Range Selector + Compare Toggle */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(['7d', '30d', '90d', 'custom'] as DateRange[]).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange(range)}
              className={cn(
                'gap-1.5',
                dateRange === range && 'bg-emerald-600 hover:bg-emerald-700 text-white'
              )}
            >
              {range === 'custom' ? <Calendar className="h-3.5 w-3.5" /> : null}
              {dateRangeLabels[range]}
            </Button>
          ))}
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
            <Clock className="h-3 w-3" />
            Viewing: {dateRangeLabels[dateRange]}
          </Badge>
        </div>
        {/* Compare with previous period toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Compare with previous period</span>
          <Switch checked={comparePrevious} onCheckedChange={setComparePrevious} />
        </div>
      </motion.div>

      {/* ─── Animated Summary Stats ─────────────────────────── */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: totalRevenue, prefix: '$', icon: DollarSign, gradient: 'from-emerald-500/10 to-emerald-600/5', accent: 'text-emerald-600', change: '+12.5%' },
            { label: 'Active Learners', value: 3847, icon: Users, gradient: 'from-violet-500/10 to-violet-600/5', accent: 'text-violet-600', change: '+8.3%' },
            { label: 'Course Completion', value: 72, suffix: '%', icon: GraduationCap, gradient: 'from-amber-500/10 to-amber-600/5', accent: 'text-amber-600', change: '+4.1%' },
            { label: 'Avg Quiz Score', value: 84, suffix: '%', icon: Target, gradient: 'from-cyan-500/10 to-cyan-600/5', accent: 'text-cyan-600', change: '-1.2%' },
          ].map((stat, idx) => (
            <motion.div key={idx} whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
              <GlassCard className="p-4">
                <div className={cn('p-2 rounded-lg w-fit mb-3 bg-gradient-to-br', stat.gradient)}>
                  <stat.icon className={cn('h-5 w-5', stat.accent)} />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  <AnimatedCounter value={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} />
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                  <span className={cn(
                    'text-xs font-medium flex items-center gap-0.5',
                    stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-500'
                  )}>
                    {stat.change.startsWith('+') ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.change}
                  </span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <GradientDivider />

      {/* ─── Revenue Deep Dive ─────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <GlassCard className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle>Revenue Deep Dive</CardTitle>
                <CardDescription>Revenue trends and key financial metrics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={comparePrevious ? revenueChartConfig : { revenue: { label: 'Revenue', color: '#10B981' } }} className="h-[300px] w-full">
              <AreaChart data={comparePrevious ? comparisonRevenueData : revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="prevRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                {comparePrevious && (
                  <Area
                    type="monotone"
                    dataKey="prevRevenue"
                    stroke="#94A3B8"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    fill="url(#prevRevenueGradient)"
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ChartContainer>

            {/* Revenue KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <motion.div whileHover={{ scale: 1.02, y: -2 }} className="p-4 rounded-lg border bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background cursor-default transition-shadow hover:shadow-md">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <DollarSign className="h-4 w-4" />
                  Total Revenue
                </div>
                <p className="text-2xl font-bold text-foreground">
                  <AnimatedCounter value={totalRevenue} prefix="$" />
                </p>
                <div className="flex items-center gap-1 text-emerald-600 text-xs mt-1">
                  <ArrowUpRight className="h-3 w-3" /> +12.5%
                </div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02, y: -2 }} className="p-4 rounded-lg border bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/20 dark:to-background cursor-default transition-shadow hover:shadow-md">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Avg Daily Revenue
                </div>
                <p className="text-2xl font-bold text-foreground">
                  <AnimatedCounter value={avgDailyRevenue} prefix="$" />
                </p>
                <div className="flex items-center gap-1 text-emerald-600 text-xs mt-1">
                  <ArrowUpRight className="h-3 w-3" /> +8.3%
                </div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02, y: -2 }} className="p-4 rounded-lg border bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background cursor-default transition-shadow hover:shadow-md">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <BarChart3 className="h-4 w-4" />
                  Best Month
                </div>
                <p className="text-2xl font-bold text-foreground">${bestDay.revenue.toLocaleString()}</p>
                <div className="text-muted-foreground text-xs mt-1">{bestDay.month}</div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02, y: -2 }} className="p-4 rounded-lg border bg-gradient-to-br from-sky-50 to-white dark:from-sky-950/20 dark:to-background cursor-default transition-shadow hover:shadow-md">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <TrendingUp className="h-4 w-4" />
                  MRR Growth
                </div>
                <p className="text-2xl font-bold text-foreground">+{mrrGrowth}%</p>
                <div className="flex items-center gap-1 text-emerald-600 text-xs mt-1">
                  <ArrowUpRight className="h-3 w-3" /> Period over period
                </div>
              </motion.div>
            </div>
          </CardContent>
        </GlassCard>
      </motion.div>

      {/* ─── Learner Engagement Analytics ──────────────────── */}
      <motion.div variants={itemVariants}>
        <GlassCard className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Users className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <CardTitle>Learner Engagement Analytics</CardTitle>
                <CardDescription>Active users, quiz attempts, and session duration trends</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Active Users Line Chart */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Active Users Over Time</h3>
              <ChartContainer config={activeUsersChartConfig} className="h-[220px] w-full">
                <LineChart data={filteredMetrics} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    tickFormatter={(v: string) => {
                      const d = new Date(v);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {comparePrevious && (
                    <Line
                      type="monotone"
                      dataKey="activeUsers"
                      data={previousMetrics}
                      stroke="#94A3B8"
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Prev. Period"
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="activeUsers"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#8B5CF6' }}
                  />
                </LineChart>
              </ChartContainer>
            </div>

            {/* Quiz Attempts Bar Chart */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Quiz Attempts Over Time</h3>
              <ChartContainer config={quizAttemptsChartConfig} className="h-[220px] w-full">
                <BarChart data={filteredMetrics} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    tickFormatter={(v: string) => {
                      const d = new Date(v);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="quizAttempts" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>

            {/* Average Session Duration Line Chart */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Avg Session Duration Trend (minutes)</h3>
              <ChartContainer config={sessionDurationChartConfig} className="h-[220px] w-full">
                <LineChart data={filteredMetrics} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    tickFormatter={(v: string) => {
                      const d = new Date(v);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} unit=" min" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="avgSessionDuration"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#F59E0B' }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </GlassCard>
      </motion.div>

      <GradientDivider />

      {/* ─── Activity Heatmap ──────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <GlassCard className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Flame className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle>Activity Heatmap</CardTitle>
                <CardDescription>Learning activity intensity by day of week × hour of day • Weekend cells outlined in violet</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-4 border-t">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 cursor-default transition-shadow hover:shadow-md"
              >
                <p className="text-lg font-bold text-foreground">10–11 AM</p>
                <p className="text-xs text-muted-foreground">Peak Hour</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                className="text-center p-3 rounded-lg bg-violet-50 dark:bg-violet-950/20 border border-violet-200/50 dark:border-violet-800/30 cursor-default transition-shadow hover:shadow-md"
              >
                <p className="text-lg font-bold text-foreground">Wednesday</p>
                <p className="text-xs text-muted-foreground">Most Active Day</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 cursor-default transition-shadow hover:shadow-md"
              >
                <p className="text-lg font-bold text-foreground">9AM–6PM</p>
                <p className="text-xs text-muted-foreground">Core Hours</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                className="text-center p-3 rounded-lg bg-sky-50 dark:bg-sky-950/20 border border-sky-200/50 dark:border-sky-800/30 cursor-default transition-shadow hover:shadow-md"
              >
                <p className="text-lg font-bold text-foreground">
                  <AnimatedCounter value={activityHeatmapData.flat().reduce((s, v) => s + v, 0)} />
                </p>
                <p className="text-xs text-muted-foreground">Total Activities</p>
              </motion.div>
            </div>
          </CardContent>
        </GlassCard>
      </motion.div>

      {/* ─── Scatter Plot: Duration vs Completion ──────────── */}
      <motion.div variants={itemVariants}>
        <GlassCard className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Target className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <CardTitle>Course Duration vs Completion Rate</CardTitle>
                <CardDescription>Bubble size represents enrollment count • Color indicates category</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ ...scatterConfig, trend: { label: 'Trend Line', color: '#EF4444' } }} className="h-[380px] w-full">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  type="number"
                  dataKey="duration"
                  name="Duration"
                  unit="h"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  domain={['dataMin - 5', 'dataMax + 5']}
                  label={{ value: 'Course Duration (hours)', position: 'insideBottom', offset: -10, fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="completion"
                  name="Completion"
                  unit="%"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  domain={[40, 100]}
                  label={{ value: 'Completion Rate (%)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }}
                />
                <ZAxis type="number" dataKey="enrollment" range={[80, 600]} name="Enrollments" />
                <Tooltip content={<ScatterTooltip />} />
                <Legend />
                {/* Trend Line */}
                <Scatter
                  name="Trend Line"
                  data={trendLineData}
                  line
                  lineType="fitting"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  dot={false}
                  activeDot={false}
                  legendType="none"
                />
                {['Web Development', 'AI & ML', 'Data Science', 'Design'].map((category) => (
                  <Scatter
                    key={category}
                    name={category}
                    data={scatterData.filter((d) => d.category === category)}
                    fill={categoryColors[category]}
                    opacity={0.8}
                  />
                ))}
              </ScatterChart>
            </ChartContainer>
            {/* Trend line info */}
            <div className="flex items-center gap-2 mt-3 p-2 px-3 rounded-lg bg-red-50 dark:bg-red-950/20">
              <div className="w-6 h-0 border-t-2 border-dashed border-red-500 shrink-0" />
              <span className="text-sm text-red-700 dark:text-red-400">
                <strong>Trend:</strong> Completion rate decreases by ~{Math.abs(Math.round((trendLine.y1 - trendLine.y2) / (trendLine.x2 - trendLine.x1) * 10) / 10)}% per additional hour of course duration.
              </span>
            </div>
            {/* Insight */}
            <div className="flex items-center gap-2 mt-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <Zap className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-700 dark:text-amber-400">
                <strong>Insight:</strong> Shorter courses (15-25h) tend to have higher completion rates. Consider breaking long courses into modular segments.
              </span>
            </div>
          </CardContent>
        </GlassCard>
      </motion.div>

      <GradientDivider />

      {/* ─── Revenue per Course Horizontal Bar Chart ────────── */}
      <motion.div variants={itemVariants}>
        <GlassCard className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle>Revenue by Course</CardTitle>
                <CardDescription>Top 6 courses ranked by total revenue • Gradient bars represent revenue scale</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Total revenue summary */}
            <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-white to-violet-50 dark:from-emerald-950/20 dark:via-background dark:to-violet-950/20 border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue (Top 6 Courses)</p>
                  <p className="text-2xl font-bold text-foreground">
                    <AnimatedCounter value={totalRevenueByCourse} prefix="$" />
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Avg per Course</p>
                <p className="text-lg font-semibold text-foreground">
                  ${(totalRevenueByCourse / revenuePerCourse.length / 1000).toFixed(1)}k
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {revenuePerCourse.map((course, idx) => {
                const maxRevenue = revenuePerCourse[0].revenue;
                const widthPct = (course.revenue / maxRevenue) * 100;
                const revenuePct = ((course.revenue / totalRevenueByCourse) * 100).toFixed(1);
                const rankColors = [
                  'from-amber-400 to-amber-500',
                  'from-slate-300 to-slate-400',
                  'from-orange-400 to-orange-500',
                ];

                return (
                  <motion.div
                    key={course.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.4 }}
                    className="flex items-center gap-3 group"
                  >
                    {/* Rank badge */}
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                      idx < 3
                        ? `bg-gradient-to-br ${rankColors[idx]} text-white shadow-sm`
                        : 'bg-muted text-muted-foreground'
                    )}>
                      #{idx + 1}
                    </div>
                    <CourseIcon icon={course.icon} color={course.color} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground truncate max-w-[200px] sm:max-w-none group-hover:text-emerald-600 transition-colors">
                          {course.name}
                        </span>
                        <div className="flex items-center gap-2 ml-2 shrink-0">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                            {revenuePct}%
                          </Badge>
                          <span className="text-sm font-bold text-foreground">
                            ${(course.revenue / 1000).toFixed(1)}k
                          </span>
                        </div>
                      </div>
                      <div className="h-8 rounded-lg bg-muted overflow-hidden relative">
                        <motion.div
                          className="h-full rounded-lg relative"
                          style={{
                            background: `linear-gradient(90deg, ${course.color}40, ${course.color})`,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPct}%` }}
                          transition={{ duration: 1, delay: idx * 0.1, ease: 'easeOut' }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </GlassCard>
      </motion.div>

      {/* ─── Course Performance Matrix ─────────────────────── */}
      <motion.div variants={itemVariants}>
        <GlassCard className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Target className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle>Course Performance Matrix</CardTitle>
                <CardDescription>Heatmap view of course metrics — green=good, yellow=average, red=poor</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-3 font-medium text-muted-foreground">Course</th>
                    <th className="text-center py-3 px-3 font-medium text-muted-foreground">Enrollment</th>
                    <th className="text-center py-3 px-3 font-medium text-muted-foreground">Completion Rate</th>
                    <th className="text-center py-3 px-3 font-medium text-muted-foreground">Avg Rating</th>
                    <th className="text-center py-3 px-3 font-medium text-muted-foreground">Revenue</th>
                    <th className="text-center py-3 px-3 font-medium text-muted-foreground">Drop-off Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {coursePerformanceData.map((course, idx) => (
                    <motion.tr
                      key={idx}
                      className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <td className="py-3 px-3 font-medium text-foreground max-w-[200px] truncate">{course.title}</td>
                      <td className="py-3 px-3">
                        <div className={cn('inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold', getHeatmapColor(course.enrollment, 'enrollment'))}>
                          {course.enrollment.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className={cn('inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold', getHeatmapColor(course.completionRate, 'completionRate'))}>
                          {course.completionRate}%
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className={cn('inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold', getHeatmapColor(course.avgRating * 10, 'avgRating'))}>
                          ⭐ {course.avgRating}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className={cn('inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold', getHeatmapColor(course.revenue, 'revenue'))}>
                          ${(course.revenue / 1000).toFixed(0)}k
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className={cn('inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold', getHeatmapColor(course.dropoffRate, 'dropoffRate'))}>
                          {course.dropoffRate}%
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500/30" /> Good</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-yellow-500/30" /> Average</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500/30" /> Poor</div>
            </div>
          </CardContent>
        </GlassCard>
      </motion.div>

      <GradientDivider />

      {/* ─── Geographic Distribution Enhanced ───────────────── */}
      <motion.div variants={itemVariants}>
        <GlassCard className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-sky-500/10">
                <Globe className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Global learner distribution and regional insights</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Stylized world map SVG + country list */}
              <div className="space-y-6">
                {/* Simplified World Map SVG */}
                <div className="relative rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 p-6 overflow-hidden border border-slate-200/50 dark:border-slate-700/30">
                  <svg viewBox="0 0 800 400" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
                    {/* Background grid */}
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="800" height="400" fill="url(#grid)" />

                    {/* Americas */}
                    <motion.ellipse
                      cx="200" cy="200" rx="120" ry="140"
                      fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeWidth="1.5" strokeOpacity="0.4"
                      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }}
                    />
                    <text x="200" y="195" textAnchor="middle" fontSize="14" fontWeight="600" fill="#10B981">Americas</text>
                    <text x="200" y="215" textAnchor="middle" fontSize="11" fillOpacity="0.7" fill="#10B981">45%</text>

                    {/* Europe */}
                    <motion.ellipse
                      cx="420" cy="140" rx="100" ry="80"
                      fill="#8B5CF6" fillOpacity="0.15" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity="0.4"
                      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
                    />
                    <text x="420" y="135" textAnchor="middle" fontSize="14" fontWeight="600" fill="#8B5CF6">Europe</text>
                    <text x="420" y="155" textAnchor="middle" fontSize="11" fillOpacity="0.7" fill="#8B5CF6">25%</text>

                    {/* Asia */}
                    <motion.ellipse
                      cx="600" cy="200" rx="140" ry="130"
                      fill="#F59E0B" fillOpacity="0.15" stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.4"
                      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
                    />
                    <text x="600" y="195" textAnchor="middle" fontSize="14" fontWeight="600" fill="#F59E0B">Asia</text>
                    <text x="600" y="215" textAnchor="middle" fontSize="11" fillOpacity="0.7" fill="#F59E0B">20%</text>

                    {/* Other */}
                    <motion.ellipse
                      cx="400" cy="340" rx="80" ry="50"
                      fill="#06B6D4" fillOpacity="0.15" stroke="#06B6D4" strokeWidth="1.5" strokeOpacity="0.4"
                      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
                    />
                    <text x="400" y="335" textAnchor="middle" fontSize="14" fontWeight="600" fill="#06B6D4">Other</text>
                    <text x="400" y="355" textAnchor="middle" fontSize="11" fillOpacity="0.7" fill="#06B6D4">10%</text>

                    {/* Connecting lines */}
                    <line x1="200" y1="200" x2="420" y2="140" stroke="#64748B" strokeWidth="0.5" strokeDasharray="4 4" strokeOpacity="0.3" />
                    <line x1="420" y1="140" x2="600" y2="200" stroke="#64748B" strokeWidth="0.5" strokeDasharray="4 4" strokeOpacity="0.3" />
                  </svg>
                </div>

                {/* Top 5 countries with flags */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Top Countries</h3>
                  {geographicData.map((geo) => (
                    <motion.div
                      key={geo.country}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-4 group"
                    >
                      <div className="flex items-center gap-2 w-28 shrink-0">
                        <span className="text-lg">{geo.flag}</span>
                        <span className="text-sm font-medium text-foreground group-hover:text-emerald-600 transition-colors">{geo.country}</span>
                      </div>
                      <div className="flex-1 relative">
                        <div className="h-7 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${geo.percentage}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-foreground w-12 text-right">{geo.percentage}%</span>
                      <span className="text-xs text-muted-foreground w-16 text-right">{geo.learners?.toLocaleString()} learners</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right: Pie chart + summary stats */}
              <div className="space-y-6">
                <ChartContainer config={pieChartConfig} className="h-[280px] w-full">
                  <PieChart>
                    <Pie
                      data={regionalPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                      strokeWidth={2}
                    >
                      {regionalPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.div whileHover={{ scale: 1.03, y: -2 }} className="text-center p-3 rounded-lg border bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background cursor-default transition-shadow hover:shadow-md">
                    <p className="text-2xl font-bold text-foreground">
                      <AnimatedCounter value={48} />
                    </p>
                    <p className="text-xs text-muted-foreground">Countries</p>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03, y: -2 }} className="text-center p-3 rounded-lg border bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/20 dark:to-background cursor-default transition-shadow hover:shadow-md">
                    <p className="text-2xl font-bold text-foreground">
                      <AnimatedCounter value={3847} />
                    </p>
                    <p className="text-xs text-muted-foreground">Total Learners</p>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03, y: -2 }} className="text-center p-3 rounded-lg border bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background cursor-default transition-shadow hover:shadow-md">
                    <p className="text-2xl font-bold text-foreground">
                      <AnimatedCounter value={6} />
                    </p>
                    <p className="text-xs text-muted-foreground">Continents</p>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03, y: -2 }} className="text-center p-3 rounded-lg border bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-950/20 dark:to-background cursor-default transition-shadow hover:shadow-md">
                    <p className="text-2xl font-bold text-foreground">35%</p>
                    <p className="text-xs text-muted-foreground">Top Country</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </CardContent>
        </GlassCard>
      </motion.div>

      <GradientDivider />

      {/* ─── Learning Outcomes Report Enhanced ──────────────── */}
      <motion.div variants={itemVariants}>
        <GlassCard className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-500/10">
                <GraduationCap className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <CardTitle>Learning Outcomes Report</CardTitle>
                <CardDescription>Assessment score improvements and skills development</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Before/After Assessment Scores Bar Chart */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Before & After Assessment Scores</h3>
              <ChartContainer config={beforeAfterChartConfig} className="h-[280px] w-full">
                <BarChart data={beforeAfterData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="skill" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="before" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="after" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
              {/* Improvement summary */}
              <div className="flex items-center gap-2 mt-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Average improvement: +44.5 points across all skills
                </span>
              </div>
            </div>

            {/* Before vs After Radar Chart */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Pre vs Post Assessment Radar</h3>
              <ChartContainer config={skillsRadarConfig} className="h-[360px] w-full mx-auto max-w-[500px]">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={beforeAfterRadarData}>
                  <PolarGrid className="stroke-border" />
                  <PolarAngleAxis dataKey="skill" fontSize={11} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={10} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Radar
                    name="Pre-Assessment"
                    dataKey="before"
                    stroke="#94A3B8"
                    fill="#94A3B8"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Post-Assessment"
                    dataKey="after"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ChartContainer>
            </div>

            {/* Individual Skill Improvement Cards */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Skill Improvement Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {beforeAfterData.map((skill) => {
                  const improvement = skill.after - skill.before;
                  const pctImprov = Math.round((improvement / skill.before) * 100);
                  return (
                    <motion.div
                      key={skill.skill}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="p-4 rounded-xl border bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:shadow-md transition-all cursor-default"
                    >
                      <p className="text-sm font-medium text-foreground truncate">{skill.skill}</p>
                      <div className="flex items-end justify-between mt-2">
                        <div>
                          <span className="text-xs text-muted-foreground">Pre</span>
                          <p className="text-lg font-bold text-slate-400">{skill.before}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-emerald-500 mb-2" />
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground">Post</span>
                          <p className="text-lg font-bold text-emerald-600">{skill.after}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2 pt-2 border-t">
                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-xs font-semibold text-emerald-600">+{improvement} pts</span>
                        <span className="text-xs text-muted-foreground">({pctImprov}%)</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Skills Improvement Radar Chart (original, kept for compatibility) */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Current Skills Radar</h3>
              <ChartContainer config={{ score: { label: 'Skill Score', color: '#8B5CF6' } }} className="h-[320px] w-full mx-auto max-w-[450px]">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillsRadarData}>
                  <PolarGrid className="stroke-border" />
                  <PolarAngleAxis dataKey="skill" fontSize={11} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={10} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Radar
                    name="Skill Score"
                    dataKey="score"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ChartContainer>
            </div>

            {/* Completion Time Distribution */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Course Completion Time Distribution</h3>
              <ChartContainer config={completionDistConfig} className="h-[240px] w-full">
                <BarChart data={completionDistData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="range" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
              <p className="text-xs text-muted-foreground mt-2">
                Most learners complete courses within 2-4 weeks. Average completion time: 3.2 weeks.
              </p>
            </div>
          </CardContent>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
