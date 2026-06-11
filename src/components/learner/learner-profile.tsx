'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import {
  User,
  Mail,
  Camera,
  Shield,
  Clock,
  Globe,
  Bell,
  Play,
  Monitor,
  Subtitles,
  Lock,
  Smartphone,
  MapPin,
  LogOut,
  ExternalLink,
  Link2,
  Unlink,
  Download,
  Award,
  BookOpen,
  BarChart3,
  Calendar,
  CheckCircle2,
  Flame,
  Star,
  Share2,
  Github,
  Linkedin,
  Twitter,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Trash2,
  Zap,
  Target,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Animation Variants ──────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const chartVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

const pulseGlow = {
  animate: {
    boxShadow: [
      '0 0 5px rgba(16,185,129,0.3)',
      '0 0 20px rgba(16,185,129,0.6)',
      '0 0 5px rgba(16,185,129,0.3)',
    ],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

const firePulse = {
  animate: {
    scale: [1, 1.15, 1],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },
};

// ─── Mock Data ───────────────────────────────────────────
const timezones = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo',
  'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney', 'Pacific/Auckland',
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ja', label: '日本語' },
  { value: 'zh', label: '中文' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'pt', label: 'Português' },
];

const activeSessions = [
  { id: 's1', device: 'Chrome on macOS', location: 'New York, US', lastActive: '2 minutes ago', current: true },
  { id: 's2', device: 'Safari on iPhone', location: 'New York, US', lastActive: '1 hour ago', current: false },
  { id: 's3', device: 'Firefox on Windows', location: 'Boston, US', lastActive: '3 days ago', current: false },
];

const connectedAccounts = [
  { id: 'google', name: 'Google', icon: 'G', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', connected: true, email: 'alex@gmail.com' },
  { id: 'github', name: 'GitHub', icon: 'GH', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', connected: true, email: 'alexjohnson' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'LI', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', connected: false, email: '' },
  { id: 'slack', name: 'Slack', icon: 'SL', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', connected: false, email: '' },
];

const learningHistory = [
  { id: '1', course: 'Advanced React & Next.js Masterclass', completedAt: '2024-11-15', timeSpent: '38h 20m', quizScore: 92, certificate: true },
  { id: '2', course: 'Python for Data Science', completedAt: '2024-09-28', timeSpent: '24h 15m', quizScore: 88, certificate: true },
  { id: '3', course: 'UI/UX Design Fundamentals', completedAt: '2024-08-10', timeSpent: '18h 45m', quizScore: 95, certificate: true },
  { id: '4', course: 'Docker & Kubernetes Essentials', completedAt: '2024-06-22', timeSpent: '15h 30m', quizScore: 78, certificate: false },
  { id: '5', course: 'Introduction to Machine Learning', completedAt: '2024-04-05', timeSpent: '22h 10m', quizScore: 85, certificate: true },
];

// ─── Skill Radar Data ────────────────────────────────────
const skillRadarData = [
  { skill: 'React', current: 85, target: 95 },
  { skill: 'TypeScript', current: 78, target: 90 },
  { skill: 'System Design', current: 55, target: 80 },
  { skill: 'DevOps', current: 45, target: 75 },
  { skill: 'AI/ML', current: 60, target: 85 },
  { skill: 'Design', current: 70, target: 80 },
];

// ─── Weekly Learning Hours ───────────────────────────────
const weeklyLearningHours = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 1.8 },
  { day: 'Wed', hours: 3.2 },
  { day: 'Thu', hours: 2.0 },
  { day: 'Fri', hours: 4.5 },
  { day: 'Sat', hours: 3.8 },
  { day: 'Sun', hours: 1.5 },
];

// ─── Skill Progress Over Time ────────────────────────────
const skillProgressOverTime = [
  { month: 'Jul', React: 60, TypeScript: 55, DevOps: 25 },
  { month: 'Aug', React: 65, TypeScript: 60, DevOps: 30 },
  { month: 'Sep', React: 70, TypeScript: 65, DevOps: 33 },
  { month: 'Oct', React: 75, TypeScript: 70, DevOps: 38 },
  { month: 'Nov', React: 80, TypeScript: 75, DevOps: 42 },
  { month: 'Dec', React: 85, TypeScript: 78, DevOps: 45 },
];

// ─── Course Completion Pie ───────────────────────────────
const courseCompletionData = [
  { name: 'Completed', value: 5, color: '#10b981' },
  { name: 'In Progress', value: 3, color: '#f59e0b' },
  { name: 'Not Started', value: 2, color: '#e5e7eb' },
];

// ─── Certificate Data ────────────────────────────────────
const certificates = [
  {
    id: 'cert-1',
    courseName: 'Advanced React & Next.js Masterclass',
    issueDate: 'Nov 15, 2024',
    credentialId: 'CERT-REACT-2024-0892',
    verified: true,
  },
  {
    id: 'cert-2',
    courseName: 'Python for Data Science',
    issueDate: 'Sep 28, 2024',
    credentialId: 'CERT-PYDS-2024-0741',
    verified: true,
  },
  {
    id: 'cert-3',
    courseName: 'UI/UX Design Fundamentals',
    issueDate: 'Aug 10, 2024',
    credentialId: 'CERT-UXFD-2024-0655',
    verified: true,
  },
  {
    id: 'cert-4',
    courseName: 'Introduction to Machine Learning',
    issueDate: 'Apr 5, 2024',
    credentialId: 'CERT-MLIN-2024-0312',
    verified: true,
  },
];

// ─── Activity Timeline Data ──────────────────────────────
const allActivities = [
  { id: 'a1', type: 'lesson', title: 'Completed "Server Components Deep Dive"', course: 'Advanced React & Next.js', time: '2 hours ago', icon: BookOpen, color: 'text-emerald-500' },
  { id: 'a2', type: 'quiz', title: 'Scored 92% on "React Patterns Quiz"', course: 'Advanced React & Next.js', time: '5 hours ago', icon: Target, color: 'text-amber-500' },
  { id: 'a3', type: 'achievement', title: 'Earned "Week Warrior" badge', course: '—', time: '1 day ago', icon: Star, color: 'text-yellow-500' },
  { id: 'a4', type: 'streak', title: '7-day learning streak reached!', course: '—', time: '1 day ago', icon: Flame, color: 'text-orange-500' },
  { id: 'a5', type: 'certificate', title: 'Certificate earned for "Python for Data Science"', course: 'Python for Data Science', time: '3 days ago', icon: Award, color: 'text-violet-500' },
  { id: 'a6', type: 'lesson', title: 'Completed "Docker Networking"', course: 'Docker & Kubernetes Essentials', time: '4 days ago', icon: BookOpen, color: 'text-emerald-500' },
  { id: 'a7', type: 'community', title: 'Replied to "Best practices for API auth?"', course: '—', time: '5 days ago', icon: Activity, color: 'text-blue-500' },
  { id: 'a8', type: 'quiz', title: 'Scored 78% on "Container Orchestration Quiz"', course: 'Docker & Kubernetes Essentials', time: '6 days ago', icon: Target, color: 'text-amber-500' },
  { id: 'a9', type: 'lesson', title: 'Completed "Introduction to Neural Networks"', course: 'Introduction to ML', time: '1 week ago', icon: BookOpen, color: 'text-emerald-500' },
  { id: 'a10', type: 'achievement', title: 'Earned "Quiz Master" badge', course: '—', time: '1 week ago', icon: Star, color: 'text-yellow-500' },
];

// ─── Learning Streak Heatmap Data (last 12 weeks) ───────
function generateHeatmapData() {
  const data: { week: number; day: number; hours: number }[] = [];
  for (let week = 0; week < 12; week++) {
    for (let day = 0; day < 7; day++) {
      const hours = Math.random() < 0.15 ? 0 : Math.round(Math.random() * 5 * 10) / 10;
      data.push({ week, day, hours });
    }
  }
  return data;
}

const heatmapData = generateHeatmapData();
const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Social Links ────────────────────────────────────────
const socialLinks = [
  { id: 'github', label: 'GitHub', icon: Github, href: '#', placeholder: 'github.com/username' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, href: '#', placeholder: 'linkedin.com/in/username' },
  { id: 'twitter', label: 'Twitter', icon: Twitter, href: '#', placeholder: 'twitter.com/username' },
  { id: 'portfolio', label: 'Portfolio', icon: Globe, href: '#', placeholder: 'yoursite.com' },
];

// ─── Helper: Heatmap Color ───────────────────────────────
function getHeatmapColor(hours: number): string {
  if (hours === 0) return 'bg-muted/40';
  if (hours < 1) return 'bg-emerald-200 dark:bg-emerald-900/40';
  if (hours < 2) return 'bg-emerald-300 dark:bg-emerald-800/50';
  if (hours < 3) return 'bg-emerald-400 dark:bg-emerald-700/60';
  if (hours < 4) return 'bg-emerald-500 dark:bg-emerald-600/70';
  return 'bg-emerald-600 dark:bg-emerald-500/80';
}

// ─── Main Component ──────────────────────────────────────
export function LearnerProfile() {
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState('personal');

  // Personal Info state
  const [firstName, setFirstName] = useState(currentUser?.name?.split(' ')[0] || 'Alex');
  const [lastName, setLastName] = useState(currentUser?.name?.split(' ')[1] || 'Johnson');
  const [bio, setBio] = useState(currentUser?.bio || 'Passionate lifelong learner');
  const [timezone, setTimezone] = useState(currentUser?.timezone || 'America/New_York');
  const [language, setLanguage] = useState(currentUser?.locale || 'en');

  // Learning Preferences state
  const [dailyGoal, setDailyGoal] = useState([30]);
  const [learningPace, setLearningPace] = useState('moderate');
  const [courseUpdates, setCourseUpdates] = useState(true);
  const [communityMentions, setCommunityMentions] = useState(true);
  const [liveReminders, setLiveReminders] = useState(true);
  const [achievementNotifs, setAchievementNotifs] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [videoQuality, setVideoQuality] = useState('auto');
  const [closedCaptions, setClosedCaptions] = useState(false);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState(false);

  // Connected accounts state
  const [accounts, setAccounts] = useState(connectedAccounts);

  // Activity timeline state
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

  // Settings save state
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Social links state
  const [socialUrls, setSocialUrls] = useState<Record<string, string>>({
    github: 'github.com/alexjohnson',
    linkedin: '',
    twitter: '',
    portfolio: '',
  });

  const memberSince = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'March 10, 2024';

  const initials = currentUser?.name?.split(' ').map((n) => n[0]).join('') || 'AJ';

  // XP and level calculations
  const totalXP = currentUser?.totalPoints || 2500;
  const currentLevel = Math.floor(totalXP / 200) + 1;
  const xpInLevel = totalXP % 200;
  const xpForNextLevel = 200;
  const xpProgress = Math.round((xpInLevel / xpForNextLevel) * 100);

  const displayedActivities = showAllActivities ? allActivities : allActivities.slice(0, 5);

  // Password validation
  const passwordValid = useMemo(() => ({
    length: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    match: confirmPassword.length > 0 && newPassword === confirmPassword,
  }), [newPassword, confirmPassword]);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <motion.div
      className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Enhanced Profile Header ────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          {/* Gradient Mesh Background */}
          <div className="h-32 md:h-40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,_rgba(16,185,129,0.4),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,_rgba(6,182,212,0.3),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_80%,_rgba(20,184,166,0.25),transparent_50%)]" />
            {/* Animated mesh dots */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />
          </div>
          <CardContent className="p-6 -mt-16 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              {/* Avatar with Gradient Border Ring */}
              <div className="relative group">
                <div className="rounded-full p-[3px] bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarFallback className="text-2xl font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <button className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-5 w-5 text-white" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-xl md:text-2xl font-bold text-foreground">{currentUser?.name || 'Alex Johnson'}</h1>
                  {/* Animated Level Badge with Glow */}
                  <motion.div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-lg"
                    variants={pulseGlow}
                    animate="animate"
                  >
                    <Zap className="h-3 w-3" />
                    Level {currentLevel} • {totalXP.toLocaleString()} XP
                  </motion.div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {currentUser?.email || 'learner@example.com'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    <Badge variant="secondary" className="text-[10px] capitalize">{currentUser?.role?.replace('_', ' ') || 'learner'}</Badge>
                  </span>
                </div>

                {/* Streak Indicator with Fire Icon and Pulse */}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Member since {memberSince}
                  </span>
                  <motion.span
                    className="flex items-center gap-1 text-orange-500 font-semibold"
                    variants={firePulse}
                    animate="animate"
                  >
                    <Flame className="h-3.5 w-3.5" />
                    {currentUser?.streakDays || 7} day streak
                  </motion.span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    {currentUser?.totalPoints?.toLocaleString() || '1,250'} points
                  </span>
                </div>

                {/* XP Progress Bar */}
                <div className="mt-3 max-w-sm">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground">{xpInLevel} / {xpForNextLevel} XP to Level {currentLevel + 1}</span>
                    <span className="text-emerald-600 font-medium">{xpProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-2 mt-3">
                  {socialLinks.map((link) => (
                    <motion.a
                      key={link.id}
                      href={socialUrls[link.id] || '#'}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title={link.label}
                    >
                      <link.icon className="h-3.5 w-3.5" />
                    </motion.a>
                  ))}
                </div>
              </div>

              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
                <User className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Skill Radar Chart ────────────────────────────────── */}
      <motion.div variants={chartVariants} initial="hidden" animate="visible">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-emerald-600" />
              Skill Distribution
            </CardTitle>
            <CardDescription>Your current skill levels vs target goals across key dimensions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full max-w-lg mx-auto">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={skillRadarData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <Radar
                    name="Target"
                    dataKey="target"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.1}
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                  <Radar
                    name="Current"
                    dataKey="current"
                    stroke="#10b981"
                    fill="url(#radarGradient)"
                    fillOpacity={0.4}
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                    formatter={(value: string) => (
                      <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
                    )}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Profile Tabs ─────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto h-auto flex-wrap gap-1 p-1">
            <TabsTrigger value="personal" className="gap-1.5 text-xs sm:text-sm">
              <User className="h-3.5 w-3.5" /> Personal Info
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-1.5 text-xs sm:text-sm">
              <Bell className="h-3.5 w-3.5" /> Learning Preferences
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 text-xs sm:text-sm">
              <BarChart3 className="h-3.5 w-3.5" /> Learning Analytics
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-1.5 text-xs sm:text-sm">
              <Activity className="h-3.5 w-3.5" /> Activity
            </TabsTrigger>
            <TabsTrigger value="certificates" className="gap-1.5 text-xs sm:text-sm">
              <Award className="h-3.5 w-3.5" /> Certificates
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5 text-xs sm:text-sm">
              <Lock className="h-3.5 w-3.5" /> Security
            </TabsTrigger>
            <TabsTrigger value="connected" className="gap-1.5 text-xs sm:text-sm">
              <Link2 className="h-3.5 w-3.5" /> Connected Accounts
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 text-xs sm:text-sm">
              <BookOpen className="h-3.5 w-3.5" /> Learning History
            </TabsTrigger>
          </TabsList>

          {/* ─── Tab 1: Personal Info ──────────────────────── */}
          <TabsContent value="personal" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={cn(firstName.length > 0 && 'pr-8')} />
                      {firstName.length > 0 && (
                        <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <div className="relative">
                      <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className={cn(lastName.length > 0 && 'pr-8')} />
                      {lastName.length > 0 && (
                        <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center gap-3">
                    <Input id="email" value={currentUser?.email || 'learner@example.com'} readOnly className="bg-muted/50" />
                    <Button variant="outline" size="sm" className="shrink-0 gap-1.5 text-xs">
                      Change
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Email changes require verification</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className={cn(bio.length > 250 && 'border-red-500 focus-visible:ring-red-500')}
                  />
                  <p className={cn('text-[11px]', bio.length > 250 ? 'text-red-500' : 'text-muted-foreground')}>{bio.length}/250 characters</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      Timezone
                    </Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz} value={tz}>{tz.replace('_', ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      Language
                    </Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Social Links Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    Social Links
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {socialLinks.map((link) => (
                      <div key={link.id} className="space-y-1.5">
                        <Label className="text-xs flex items-center gap-1.5">
                          <link.icon className="h-3 w-3" />
                          {link.label}
                        </Label>
                        <Input
                          placeholder={link.placeholder}
                          value={socialUrls[link.id]}
                          onChange={(e) => setSocialUrls(prev => ({ ...prev, [link.id]: e.target.value }))}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-end gap-3">
                  <Button variant="outline">Cancel</Button>
                  <motion.div
                    key={saveSuccess ? 'saved' : 'save'}
                    initial={false}
                    animate={saveSuccess ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Button onClick={handleSave} className={cn('gap-2 text-white', saveSuccess ? 'bg-emerald-500' : 'bg-emerald-600 hover:bg-emerald-700')}>
                      {saveSuccess ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Tab 2: Learning Preferences ───────────────── */}
          <TabsContent value="preferences" className="mt-6">
            <div className="space-y-6">
              {/* Daily Learning Goal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    Daily Learning Goal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Minutes per day</span>
                    <Badge variant="secondary" className="text-sm font-semibold tabular-nums">
                      {dailyGoal[0]} min
                    </Badge>
                  </div>
                  <Slider
                    value={dailyGoal}
                    onValueChange={setDailyGoal}
                    min={10}
                    max={120}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>10 min</span>
                    <span>60 min</span>
                    <span>120 min</span>
                  </div>
                </CardContent>
              </Card>

              {/* Preferred Learning Pace */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Play className="h-5 w-5 text-violet-600" />
                    Preferred Learning Pace
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'slow', label: 'Slow', desc: 'Take your time', emoji: '🐢' },
                      { value: 'moderate', label: 'Moderate', desc: 'Steady progress', emoji: '🚶' },
                      { value: 'fast', label: 'Fast', desc: 'Accelerated learning', emoji: '🏃' },
                    ].map((pace) => (
                      <button
                        key={pace.value}
                        onClick={() => setLearningPace(pace.value)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all',
                          learningPace === pace.value
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm'
                            : 'border-border hover:border-muted-foreground/30 hover:bg-muted/30'
                        )}
                      >
                        <span className="text-2xl">{pace.emoji}</span>
                        <span className={cn(
                          'text-sm font-medium',
                          learningPace === pace.value ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground'
                        )}>{pace.label}</span>
                        <span className="text-[11px] text-muted-foreground">{pace.desc}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Email Notification Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="h-5 w-5 text-amber-600" />
                    Email Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: 'course-updates', label: 'Course updates', desc: 'New lessons, content changes, and instructor announcements', checked: courseUpdates, onChange: setCourseUpdates },
                    { id: 'community-mentions', label: 'Community Mentions', desc: 'When someone mentions you in a discussion or reply', checked: communityMentions, onChange: setCommunityMentions },
                    { id: 'live-reminders', label: 'Live Session Reminders', desc: 'Reminders before scheduled live sessions', checked: liveReminders, onChange: setLiveReminders },
                    { id: 'achievement-notifs', label: 'Achievement Notifications', desc: 'When you earn a new badge or achievement', checked: achievementNotifs, onChange: setAchievementNotifs },
                    { id: 'weekly-report', label: 'Weekly Progress Report', desc: 'Summary of your learning activity each week', checked: weeklyReport, onChange: setWeeklyReport },
                  ].map((item, index) => (
                    <div key={item.id}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <Label htmlFor={item.id} className="text-sm font-medium cursor-pointer">{item.label}</Label>
                          <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn('text-[10px] font-medium', item.checked ? 'text-emerald-600' : 'text-muted-foreground')}>
                            {item.checked ? 'On' : 'Off'}
                          </span>
                          <Switch
                            id={item.id}
                            checked={item.checked}
                            onCheckedChange={item.onChange}
                          />
                        </div>
                      </div>
                      {index < 4 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Video Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Monitor className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    Video Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoplay" className="text-sm font-medium">Auto-play Next Lesson</Label>
                      <p className="text-[11px] text-muted-foreground">Automatically play the next lesson when current one ends</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-[10px] font-medium', autoPlay ? 'text-emerald-600' : 'text-muted-foreground')}>
                        {autoPlay ? 'On' : 'Off'}
                      </span>
                      <Switch id="autoplay" checked={autoPlay} onCheckedChange={setAutoPlay} />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-sm font-medium">
                      <Monitor className="h-3.5 w-3.5" />
                      Video Quality Preference
                    </Label>
                    <Select value={videoQuality} onValueChange={setVideoQuality}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (Recommended)</SelectItem>
                        <SelectItem value="720p">720p HD</SelectItem>
                        <SelectItem value="1080p">1080p Full HD</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">Higher quality uses more bandwidth</p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="captions" className="text-sm font-medium flex items-center gap-1.5">
                        <Subtitles className="h-3.5 w-3.5" />
                        Closed Captions
                      </Label>
                      <p className="text-[11px] text-muted-foreground">Show subtitles when available</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-[10px] font-medium', closedCaptions ? 'text-emerald-600' : 'text-muted-foreground')}>
                        {closedCaptions ? 'On' : 'Off'}
                      </span>
                      <Switch id="captions" checked={closedCaptions} onCheckedChange={setClosedCaptions} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-end">
                <motion.div
                  key={saveSuccess ? 'pref-saved' : 'pref-save'}
                  initial={false}
                  animate={saveSuccess ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Button onClick={handleSave} className={cn('gap-2 text-white', saveSuccess ? 'bg-emerald-500' : 'bg-emerald-600 hover:bg-emerald-700')}>
                    {saveSuccess ? (
                      <><CheckCircle2 className="h-4 w-4" /> Saved!</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4" /> Save Preferences</>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </TabsContent>

          {/* ─── Tab 3: Learning Analytics ────────────────── */}
          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              {/* Weekly Learning Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    Weekly Learning Hours
                  </CardTitle>
                  <CardDescription>Your learning activity over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyLearningHours} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} unit="h" />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                          formatter={(value: number) => [`${value}h`, 'Hours']}
                        />
                        <Bar dataKey="hours" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Streak Calendar Heatmap */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Flame className="h-5 w-5 text-orange-500" />
                    Learning Streak Calendar
                  </CardTitle>
                  <CardDescription>Your learning consistency over the last 12 weeks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {/* Day labels */}
                    <div className="flex items-center gap-1">
                      <div className="w-10" />
                      {dayLabels.map((d) => (
                        <div key={d} className="flex-1 text-center text-[9px] text-muted-foreground">{d}</div>
                      ))}
                    </div>
                    {/* Heatmap grid */}
                    {Array.from({ length: 12 }, (_, weekIdx) => (
                      <div key={weekIdx} className="flex items-center gap-1">
                        <div className="w-10 text-[9px] text-muted-foreground text-right pr-2">
                          W{weekIdx + 1}
                        </div>
                        {Array.from({ length: 7 }, (_, dayIdx) => {
                          const cell = heatmapData.find(d => d.week === weekIdx && d.day === dayIdx);
                          const hours = cell?.hours || 0;
                          return (
                            <motion.div
                              key={dayIdx}
                              className={cn('flex-1 aspect-square max-w-[28px] rounded-sm cursor-pointer transition-colors', getHeatmapColor(hours))}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: (weekIdx * 7 + dayIdx) * 0.01, duration: 0.2 }}
                              title={`${hours}h studied`}
                            />
                          );
                        })}
                      </div>
                    ))}
                    {/* Legend */}
                    <div className="flex items-center justify-end gap-1 mt-3">
                      <span className="text-[9px] text-muted-foreground mr-1">Less</span>
                      <div className="w-3 h-3 rounded-sm bg-muted/40" />
                      <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/40" />
                      <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-800/50" />
                      <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700/60" />
                      <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-600/70" />
                      <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-500/80" />
                      <span className="text-[9px] text-muted-foreground ml-1">More</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skill Progress Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-5 w-5 text-violet-600" />
                    Skill Progress Over Time
                  </CardTitle>
                  <CardDescription>Growth trends across your top skills (last 6 months)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={skillProgressOverTime}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} domain={[0, 100]} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Line type="monotone" dataKey="React" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="TypeScript" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="DevOps" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Course Completion Rate */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpen className="h-5 w-5 text-cyan-600" />
                    Course Completion Rate
                  </CardTitle>
                  <CardDescription>Overview of your course progress distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="h-56 w-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={courseCompletionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                          >
                            {courseCompletionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      {courseCompletionData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-foreground">{item.name}</span>
                          <span className="text-sm font-semibold text-foreground">{item.value}</span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full bg-transparent" />
                        <span className="text-sm text-muted-foreground">Total Courses</span>
                        <span className="text-sm font-semibold text-foreground">{courseCompletionData.reduce((a, b) => a + b.value, 0)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── Tab 4: Activity Timeline ─────────────────── */}
          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest learning activities and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {displayedActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <div className="flex gap-4 pb-6 relative">
                        {/* Vertical connecting line */}
                        {index < displayedActivities.length - 1 && (
                          <div className="absolute left-[17px] top-10 bottom-0 w-px bg-border" />
                        )}
                        {/* Icon circle */}
                        <div className={cn(
                          'relative z-10 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-background border-2',
                          activity.type === 'lesson' && 'border-emerald-300 dark:border-emerald-700',
                          activity.type === 'quiz' && 'border-amber-300 dark:border-amber-700',
                          activity.type === 'achievement' && 'border-yellow-300 dark:border-yellow-700',
                          activity.type === 'streak' && 'border-orange-300 dark:border-orange-700',
                          activity.type === 'certificate' && 'border-violet-300 dark:border-violet-700',
                          activity.type === 'community' && 'border-blue-300 dark:border-blue-700',
                        )}>
                          <activity.icon className={cn('h-4 w-4', activity.color)} />
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <motion.button
                            className="w-full text-left p-3 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] text-muted-foreground">{activity.time}</span>
                                {expandedActivity === activity.id ? (
                                  <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </motion.button>
                          <AnimatePresence>
                            {expandedActivity === activity.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-3 pb-2 pt-1 text-xs text-muted-foreground space-y-1">
                                  {activity.course !== '—' && (
                                    <p>Course: <span className="text-foreground font-medium">{activity.course}</span></p>
                                  )}
                                  <p>Type: <span className="text-foreground font-medium capitalize">{activity.type}</span></p>
                                  <p>Time: <span className="text-foreground font-medium">{activity.time}</span></p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {allActivities.length > 5 && (
                  <div className="flex justify-center mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllActivities(!showAllActivities)}
                      className="gap-1.5 text-xs"
                    >
                      {showAllActivities ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          Load More ({allActivities.length - 5} more)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Tab 5: Certificates ──────────────────────── */}
          <TabsContent value="certificates" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Award className="h-5 w-5 text-emerald-600" />
                    Certificate Showcase
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Your earned credentials and achievements</p>
                </div>
                <Badge variant="secondary" className="text-xs">{certificates.length} Certificates</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {certificates.map((cert, index) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="group relative"
                  >
                    {/* Gradient border effect on hover */}
                    <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]" />
                    <Card className="relative bg-card">
                      <CardContent className="p-5 space-y-3">
                        {/* Certificate header */}
                        <div className="flex items-start justify-between">
                          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                            <Award className="h-5 w-5 text-emerald-600" />
                          </div>
                          {cert.verified && (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] border-0 gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Verified
                            </Badge>
                          )}
                        </div>

                        {/* Course name */}
                        <div>
                          <h4 className="text-sm font-semibold text-foreground leading-tight">{cert.courseName}</h4>
                          <p className="text-[11px] text-muted-foreground mt-1">Issued {cert.issueDate}</p>
                        </div>

                        {/* Credential ID */}
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <Shield className="h-3 w-3" />
                          <span className="font-mono">{cert.credentialId}</span>
                        </div>

                        <Separator />

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="gap-1.5 text-[11px] flex-1">
                            <ExternalLink className="h-3 w-3" />
                            Verify
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5 text-[11px] flex-1">
                            <Share2 className="h-3 w-3" />
                            Share
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5 text-[11px]">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ─── Tab 6: Security (Enhanced) ────────────────── */}
          <TabsContent value="security" className="mt-6">
            <div className="space-y-6">
              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lock className="h-5 w-5 text-emerald-600" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className={cn(
                          newPassword.length > 0 && (passwordValid.length && passwordValid.hasUpper && passwordValid.hasNumber && passwordValid.hasSpecial
                            ? 'border-emerald-500 focus-visible:ring-emerald-500'
                            : 'border-amber-500 focus-visible:ring-amber-500')
                        )} />
                        {newPassword.length > 0 && (
                          passwordValid.length && passwordValid.hasUpper && passwordValid.hasNumber && passwordValid.hasSpecial ? (
                            <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                          )
                        )}
                      </div>
                      {newPassword.length > 0 && (
                        <div className="space-y-1.5">
                          {[
                            { label: 'At least 8 characters', valid: passwordValid.length },
                            { label: 'Contains uppercase letter', valid: passwordValid.hasUpper },
                            { label: 'Contains number', valid: passwordValid.hasNumber },
                            { label: 'Contains special character', valid: passwordValid.hasSpecial },
                          ].map((req) => (
                            <div key={req.label} className="flex items-center gap-1.5 text-[11px]">
                              {req.valid ? (
                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                              )}
                              <span className={req.valid ? 'text-emerald-600' : 'text-amber-600'}>{req.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className={cn(
                          confirmPassword.length > 0 && (passwordValid.match ? 'border-emerald-500 focus-visible:ring-emerald-500' : 'border-red-500 focus-visible:ring-red-500')
                        )} />
                        {confirmPassword.length > 0 && (
                          passwordValid.match ? (
                            <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                          )
                        )}
                      </div>
                      {confirmPassword.length > 0 && !passwordValid.match && (
                        <p className="text-[11px] text-red-500">Passwords do not match</p>
                      )}
                      {passwordValid.match && (
                        <p className="text-[11px] text-emerald-600">Passwords match</p>
                      )}
                    </div>
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                    <Lock className="h-4 w-4" />
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-5 w-5 text-violet-600" />
                    Two-Factor Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Enable 2FA</p>
                      <p className="text-[11px] text-muted-foreground">Add an extra layer of security to your account with authenticator app verification</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-[10px] font-medium', twoFactor ? 'text-emerald-600' : 'text-muted-foreground')}>
                        {twoFactor ? 'On' : 'Off'}
                      </span>
                      <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                    </div>
                  </div>
                  {twoFactor && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 dark:border-emerald-800"
                    >
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Two-factor authentication is enabled. Use your authenticator app to generate codes.
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Active Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Smartphone className="h-5 w-5 text-amber-600" />
                    Active Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{session.device}</p>
                            {session.current && (
                              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px]">
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {session.location}</span>
                            <span>·</span>
                            <span>{session.lastActive}</span>
                          </div>
                        </div>
                      </div>
                      {!session.current && (
                        <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                  <Separator />
                  <Button variant="outline" className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30">
                    <LogOut className="h-4 w-4" />
                    Sign Out All Devices
                  </Button>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200 dark:border-red-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">Delete Account</p>
                      <p className="text-[11px] text-red-600/70 dark:text-red-400/70">Permanently delete your account and all associated data. This action cannot be undone.</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs text-red-600 border-red-300 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-950/40 shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">Reset All Progress</p>
                      <p className="text-[11px] text-red-600/70 dark:text-red-400/70">Reset all learning progress, achievements, and certificates. Your enrollments will remain.</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs text-red-600 border-red-300 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-950/40 shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── Tab 7: Connected Accounts ─────────────────── */}
          <TabsContent value="connected" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Link2 className="h-5 w-5 text-emerald-600" />
                  Connected Accounts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold', account.color)}>
                        {account.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{account.name}</p>
                        {account.connected ? (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            Connected{account.email ? ` as ${account.email}` : ''}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">Not connected</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant={account.connected ? 'outline' : 'default'}
                      size="sm"
                      className={cn(
                        'gap-1.5 text-xs',
                        !account.connected && 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      )}
                      onClick={() => {
                        setAccounts(prev =>
                          prev.map(a => a.id === account.id ? { ...a, connected: !a.connected } : a)
                        );
                      }}
                    >
                      {account.connected ? (
                        <>
                          <Unlink className="h-3.5 w-3.5" />
                          Disconnect
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-3.5 w-3.5" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                ))}

                <Separator />

                <p className="text-[11px] text-muted-foreground text-center">
                  Connected accounts allow you to sign in quickly and sync your learning progress across platforms.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Tab 8: Learning History ───────────────────── */}
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                  Learning History
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Courses Completed', value: '5', icon: BookOpen, color: 'text-emerald-600' },
                    { label: 'Total Time', value: '119h', icon: Clock, color: 'text-violet-600' },
                    { label: 'Avg Quiz Score', value: '88%', icon: BarChart3, color: 'text-amber-600' },
                    { label: 'Certificates', value: '4', icon: Award, color: 'text-slate-600' },
                  ].map((stat) => (
                    <div key={stat.label} className="p-3 rounded-xl border bg-muted/20 text-center">
                      <stat.icon className={cn('h-4 w-4 mx-auto mb-1', stat.color)} />
                      <p className="text-lg font-bold text-foreground">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* History Table */}
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Course</TableHead>
                        <TableHead className="text-xs hidden sm:table-cell">Completed</TableHead>
                        <TableHead className="text-xs hidden md:table-cell">Time Spent</TableHead>
                        <TableHead className="text-xs">Quiz</TableHead>
                        <TableHead className="text-xs">Certificate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {learningHistory.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="text-sm font-medium max-w-[200px] truncate">{row.course}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                            {new Date(row.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{row.timeSpent}</TableCell>
                          <TableCell>
                            <Badge variant={row.quizScore >= 90 ? 'default' : row.quizScore >= 80 ? 'secondary' : 'outline'} className={cn(
                              'text-[10px]',
                              row.quizScore >= 90 && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0',
                              row.quizScore >= 80 && row.quizScore < 90 && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0',
                            )}>
                              {row.quizScore}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {row.certificate ? (
                              <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 text-[10px] border-0 gap-1">
                                <Award className="h-2.5 w-2.5" /> Earned
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
