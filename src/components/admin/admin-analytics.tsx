'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
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
  score: { label: 'Skill Score', color: '#8B5CF6' },
};

const completionDistConfig: ChartConfig = {
  count: { label: 'Learners', color: '#10B981' },
};

// ─── Mock data for geographic distribution ──────────────────
const geographicData = [
  { country: 'USA', percentage: 35, flag: '🇺🇸' },
  { country: 'UK', percentage: 18, flag: '🇬🇧' },
  { country: 'India', percentage: 15, flag: '🇮🇳' },
  { country: 'Canada', percentage: 10, flag: '🇨🇦' },
  { country: 'Others', percentage: 22, flag: '🌍' },
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
  return 'bg-slate-500/20 text-slate-700 dark:text-slate-400';
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

// ─── Main Component ─────────────────────────────────────────
export function AdminAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  // Filter daily metrics based on date range
  const filteredMetrics = (() => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    return dailyMetrics.slice(-days);
  })();

  return (
    <motion.div
      className="p-4 md:p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Header & Date Range ─────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Analytics Deep Dive</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive platform analytics and performance insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Date Range Selector */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
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
      </motion.div>

      {/* ─── Revenue Deep Dive ─────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
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
            <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
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
              <div className="p-4 rounded-lg border bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <DollarSign className="h-4 w-4" />
                  Total Revenue
                </div>
                <p className="text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-emerald-600 text-xs mt-1">
                  <ArrowUpRight className="h-3 w-3" /> +12.5%
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/20 dark:to-background">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Avg Daily Revenue
                </div>
                <p className="text-2xl font-bold text-foreground">${avgDailyRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-emerald-600 text-xs mt-1">
                  <ArrowUpRight className="h-3 w-3" /> +8.3%
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <BarChart3 className="h-4 w-4" />
                  Best Month
                </div>
                <p className="text-2xl font-bold text-foreground">${bestDay.revenue.toLocaleString()}</p>
                <div className="text-muted-foreground text-xs mt-1">{bestDay.month}</div>
              </div>
              <div className="p-4 rounded-lg border bg-gradient-to-br from-sky-50 to-white dark:from-sky-950/20 dark:to-background">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <TrendingUp className="h-4 w-4" />
                  MRR Growth
                </div>
                <p className="text-2xl font-bold text-foreground">+{mrrGrowth}%</p>
                <div className="flex items-center gap-1 text-emerald-600 text-xs mt-1">
                  <ArrowUpRight className="h-3 w-3" /> Period over period
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Learner Engagement Analytics ──────────────────── */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
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
        </Card>
      </motion.div>

      {/* ─── Course Performance Matrix ─────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
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
                    <tr key={idx} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
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
                    </tr>
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
        </Card>
      </motion.div>

      {/* ─── Geographic Distribution ───────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-sky-500/10">
                <Globe className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Learner distribution by country</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {geographicData.map((geo) => (
                <div key={geo.country} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-28 shrink-0">
                    <span className="text-lg">{geo.flag}</span>
                    <span className="text-sm font-medium text-foreground">{geo.country}</span>
                  </div>
                  <div className="flex-1 relative">
                    <div className="h-8 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${geo.percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground w-12 text-right">{geo.percentage}%</span>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">48</p>
                <p className="text-xs text-muted-foreground">Countries</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">3,847</p>
                <p className="text-xs text-muted-foreground">Total Learners</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">6</p>
                <p className="text-xs text-muted-foreground">Continents</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">35%</p>
                <p className="text-xs text-muted-foreground">Top Country</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Learning Outcomes Report ──────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
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
            {/* Before/After Assessment Scores */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Before & After Assessment Scores</h3>
              <ChartContainer config={beforeAfterChartConfig} className="h-[280px] w-full">
                <BarChart data={beforeAfterData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
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

            {/* Skills Improvement Radar Chart */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Skills Improvement Radar</h3>
              <ChartContainer config={skillsRadarConfig} className="h-[320px] w-full mx-auto max-w-[450px]">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillsRadarData}>
                  <PolarGrid stroke="#e2e8f0" />
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
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
        </Card>
      </motion.div>
    </motion.div>
  );
}
