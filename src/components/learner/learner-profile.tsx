'use client';

import { useState, useMemo, useCallback } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
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
  Phone,
  Upload,
  X,
  Plus,
  ThumbsUp,
  MessageSquare,
  Briefcase,
  FileText,
  Copy,
  Palette,
  Type,
  Accessibility,
  EyeOff,
  Trophy,
  Rocket,
  Settings,
  Loader2,
  Users,
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

const floatParticle = {
  animate: {
    y: [0, -12, 0],
    opacity: [0.3, 0.7, 0.3],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
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

// ─── Learning Velocity Data ──────────────────────────────
const learningVelocityData = [
  { week: 'W1', lessons: 5 },
  { week: 'W2', lessons: 8 },
  { week: 'W3', lessons: 6 },
  { week: 'W4', lessons: 12 },
  { week: 'W5', lessons: 9 },
  { week: 'W6', lessons: 14 },
  { week: 'W7', lessons: 11 },
  { week: 'W8', lessons: 16 },
];

// ─── Time Distribution Data ──────────────────────────────
const timeDistributionData = [
  { name: 'Frontend', value: 35, color: '#10b981' },
  { name: 'Data Science', value: 25, color: '#f59e0b' },
  { name: 'DevOps', value: 15, color: '#8b5cf6' },
  { name: 'Design', value: 15, color: '#06b6d4' },
  { name: 'AI/ML', value: 10, color: '#f43f5e' },
];

// ─── Goal Progress Data ─────────────────────────────────
const goalProgressData = [
  { id: 'g1', label: 'Complete 10 courses', current: 5, target: 10, color: 'emerald' },
  { id: 'g2', label: 'Earn 5 certificates', current: 4, target: 5, color: 'violet' },
  { id: 'g3', label: 'Reach Level 15', current: 13, target: 15, color: 'amber' },
  { id: 'g4', label: '100 hour learning goal', current: 78, target: 100, color: 'cyan' },
];

// ─── Certificate Data ────────────────────────────────────
const certificates = [
  {
    id: 'cert-1',
    courseName: 'Advanced React & Next.js Masterclass',
    issueDate: 'Nov 15, 2024',
    credentialId: 'CERT-REACT-2024-0892',
    verified: true,
    category: 'Frontend',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'cert-2',
    courseName: 'Python for Data Science',
    issueDate: 'Sep 28, 2024',
    credentialId: 'CERT-PYDS-2024-0741',
    verified: true,
    category: 'Data Science',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'cert-3',
    courseName: 'UI/UX Design Fundamentals',
    issueDate: 'Aug 10, 2024',
    credentialId: 'CERT-UXFD-2024-0655',
    verified: true,
    category: 'Design',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'cert-4',
    courseName: 'Introduction to Machine Learning',
    issueDate: 'Apr 5, 2024',
    credentialId: 'CERT-MLIN-2024-0312',
    verified: true,
    category: 'AI/ML',
    color: 'from-violet-500 to-purple-600',
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

// ─── Portfolio Demo Data ─────────────────────────────────
const demoProjects = [
  {
    id: 'p1',
    title: 'E-Commerce Dashboard',
    description: 'A full-stack dashboard built with Next.js, Prisma, and Tailwind CSS featuring real-time analytics and order management.',
    url: 'https://github.com/alexjohnson/ecommerce-dashboard',
    tags: ['Next.js', 'TypeScript', 'Prisma'],
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'p2',
    title: 'ML Image Classifier',
    description: 'Python-based image classification model using TensorFlow and Keras, achieving 94% accuracy on the test dataset.',
    url: 'https://github.com/alexjohnson/ml-classifier',
    tags: ['Python', 'TensorFlow', 'ML'],
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'p3',
    title: 'DevOps Pipeline Tool',
    description: 'CI/CD pipeline automation tool using Docker and GitHub Actions for streamlined deployment workflows.',
    url: 'https://github.com/alexjohnson/devops-pipeline',
    tags: ['Docker', 'GitHub Actions', 'Bash'],
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'p4',
    title: 'Portfolio Website',
    description: 'Personal portfolio and blog built with Astro and React, featuring dark mode and MDX content support.',
    url: 'https://alexjohnson.dev',
    tags: ['Astro', 'React', 'MDX'],
    color: 'from-cyan-500 to-blue-600',
  },
];

const demoSkills = [
  { id: 'sk1', name: 'React', endorsements: 24, level: 'Advanced' },
  { id: 'sk2', name: 'TypeScript', endorsements: 18, level: 'Advanced' },
  { id: 'sk3', name: 'Python', endorsements: 15, level: 'Intermediate' },
  { id: 'sk4', name: 'Docker', endorsements: 8, level: 'Intermediate' },
  { id: 'sk5', name: 'UI/UX Design', endorsements: 12, level: 'Intermediate' },
  { id: 'sk6', name: 'Machine Learning', endorsements: 6, level: 'Beginner' },
  { id: 'sk7', name: 'Node.js', endorsements: 20, level: 'Advanced' },
  { id: 'sk8', name: 'GraphQL', endorsements: 4, level: 'Beginner' },
];

const demoRecommendations = [
  {
    id: 'r1',
    from: 'Dr. Sarah Chen',
    role: 'Instructor — Advanced React & Next.js',
    text: 'Alex is an exceptional student who consistently goes above and beyond. Their project work demonstrated deep understanding of React patterns and server components. A true asset to any team.',
    date: 'Nov 20, 2024',
    avatar: 'SC',
  },
  {
    id: 'r2',
    from: 'Marcus Rivera',
    role: 'Peer — Python for Data Science',
    text: 'Alex was incredibly helpful during group projects, always willing to explain complex concepts and share resources. Their analytical skills and attention to detail are impressive.',
    date: 'Oct 5, 2024',
    avatar: 'MR',
  },
  {
    id: 'r3',
    from: 'Prof. James Liu',
    role: 'Instructor — UI/UX Design Fundamentals',
    text: 'Alex has a natural eye for design. Their final project was one of the best in the cohort, showing both technical proficiency and creative thinking. Highly recommended.',
    date: 'Aug 25, 2024',
    avatar: 'JL',
  },
];

// ─── Floating Particles for Profile Header ───────────────
const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  delay: Math.random() * 4,
  duration: Math.random() * 3 + 3,
}));

// ─── Helper: Heatmap Color ───────────────────────────────
function getHeatmapColor(hours: number): string {
  if (hours === 0) return 'bg-muted/40';
  if (hours < 1) return 'bg-emerald-200 dark:bg-emerald-900/40';
  if (hours < 2) return 'bg-emerald-300 dark:bg-emerald-800/50';
  if (hours < 3) return 'bg-emerald-400 dark:bg-emerald-700/60';
  if (hours < 4) return 'bg-emerald-500 dark:bg-emerald-600/70';
  return 'bg-emerald-600 dark:bg-emerald-500/80';
}

function getSkillLevelColor(level: string): string {
  switch (level) {
    case 'Expert': return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30';
    case 'Advanced': return 'text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/30';
    case 'Intermediate': return 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30';
    case 'Beginner': return 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800';
    default: return 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800';
  }
}

// ─── Profile Completion Ring Component ───────────────────
function ProfileCompletionRing({ percentage, size = 64 }: { percentage: number; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#completionGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
        />
        <defs>
          <linearGradient id="completionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-foreground">{percentage}%</span>
      </div>
    </div>
  );
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
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [emailVerified, setEmailVerified] = useState(true);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Avatar drag-and-drop state
  const [isDragging, setIsDragging] = useState(false);

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
  const [notificationSounds, setNotificationSounds] = useState(true);

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
  const [isSaving, setIsSaving] = useState(false);

  // Social links state
  const [socialUrls, setSocialUrls] = useState<Record<string, string>>({
    github: 'github.com/alexjohnson',
    linkedin: '',
    twitter: '',
    portfolio: '',
  });

  // Settings: Privacy state
  const [profileVisibility, setProfileVisibility] = useState('community');
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [showAchievements, setShowAchievements] = useState(true);

  // Settings: Accessibility state
  const [fontSize, setFontSize] = useState('medium');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [screenReader, setScreenReader] = useState(false);

  // Certificate state
  const [certFilter, setCertFilter] = useState('all');
  const [selectedCert, setSelectedCert] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Portfolio state
  const [skills, setSkills] = useState(demoSkills);
  const [newSkillName, setNewSkillName] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);

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

  const passwordStrength = useMemo(() => {
    const checks = [passwordValid.length, passwordValid.hasUpper, passwordValid.hasNumber, passwordValid.hasSpecial];
    return checks.filter(Boolean).length;
  }, [passwordValid]);

  // Validation
  const firstNameError = firstName.length === 0 ? 'First name is required' : '';
  const lastNameError = lastName.length === 0 ? 'Last name is required' : '';
  const bioError = bio.length > 250 ? 'Bio must be 250 characters or less' : '';
  const phoneError = phone.length > 0 && !/^\+?[\d\s\-()]+$/.test(phone) ? 'Invalid phone number format' : '';

  const handleSave = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 1200);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // In a real app, handle file upload here
  }, []);

  const handleCopyLink = useCallback((credentialId: string) => {
    navigator.clipboard?.writeText(`https://learn.example.com/verify/${credentialId}`);
    setCopiedLink(credentialId);
    setTimeout(() => setCopiedLink(null), 2000);
  }, []);

  const handleEndorseSkill = useCallback((skillId: string) => {
    setSkills(prev => prev.map(s =>
      s.id === skillId ? { ...s, endorsements: s.endorsements + 1 } : s
    ));
  }, []);

  const handleAddSkill = useCallback(() => {
    if (newSkillName.trim()) {
      setSkills(prev => [...prev, {
        id: `sk-${Date.now()}`,
        name: newSkillName.trim(),
        endorsements: 0,
        level: 'Beginner',
      }]);
      setNewSkillName('');
      setShowAddSkill(false);
    }
  }, [newSkillName]);

  const filteredCertificates = certFilter === 'all'
    ? certificates
    : certificates.filter(c => c.category.toLowerCase() === certFilter);

  // Form validation check
  const personalFormValid = firstName.length > 0 && lastName.length > 0 && bio.length <= 250 && phoneError === '';

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
          {/* Gradient Mesh Background with Particles */}
          <div className="h-36 md:h-44 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,_rgba(16,185,129,0.4),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,_rgba(6,182,212,0.3),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_80%,_rgba(20,184,166,0.25),transparent_50%)]" />
            {/* Animated mesh dots */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />
            {/* Floating Particles */}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full bg-white/40"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size,
                  height: p.size,
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.2, 0.6, 0.2],
                  x: [0, Math.random() * 10 - 5, 0],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
          <CardContent className="p-6 -mt-20 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              {/* Avatar with Profile Completion Ring */}
              <div className="relative group">
                <ProfileCompletionRing percentage={85} size={110} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full p-[3px] bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500">
                    <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                      <AvatarFallback className="text-xl font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <button className="absolute bottom-1 right-3 flex items-center justify-center bg-black/60 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-3.5 w-3.5 text-white" />
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
                    Level {currentLevel}
                  </motion.div>
                  {/* Verified Badges */}
                  <div className="flex items-center gap-1.5">
                    {emailVerified && (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] border-0 gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Email
                      </Badge>
                    )}
                    {phoneVerified ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] border-0 gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Phone
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] gap-1 text-amber-600 border-amber-300 dark:border-amber-700">
                        <Phone className="h-2.5 w-2.5" /> Verify Phone
                      </Badge>
                    )}
                  </div>
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

                {/* Streak, Member Since, Last Active Badges */}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Member since {memberSince}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last active 2 min ago
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
                    {totalXP.toLocaleString()} XP
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

                {/* Social Links with Styled Icon Buttons */}
                <div className="flex items-center gap-2 mt-3">
                  {socialLinks.map((link) => (
                    <motion.a
                      key={link.id}
                      href={socialUrls[link.id] || '#'}
                      className={cn(
                        'p-2 rounded-lg transition-colors border',
                        socialUrls[link.id]
                          ? 'text-foreground bg-muted/60 border-border hover:bg-muted'
                          : 'text-muted-foreground bg-transparent border-dashed border-muted-foreground/30 hover:bg-muted/30'
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title={socialUrls[link.id] ? `${link.label}: ${socialUrls[link.id]}` : `Add ${link.label}`}
                    >
                      <link.icon className="h-4 w-4" />
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Edit Profile Button with Gradient Hover */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shrink-0 shadow-md hover:shadow-lg transition-shadow"
                  onClick={() => setActiveTab('personal')}
                >
                  <User className="h-4 w-4" />
                  Edit Profile
                </Button>
              </motion.div>
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
            <TabsTrigger value="portfolio" className="gap-1.5 text-xs sm:text-sm">
              <Briefcase className="h-3.5 w-3.5" /> Portfolio
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 text-xs sm:text-sm">
              <Settings className="h-3.5 w-3.5" /> Settings
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 text-xs sm:text-sm">
              <BookOpen className="h-3.5 w-3.5" /> Learning History
            </TabsTrigger>
          </TabsList>

          {/* ─── Tab 1: Personal Info (Enhanced with Glassmorphism) ─── */}
          <TabsContent value="personal" className="mt-6">
            <div className="space-y-6">
              {/* Avatar Upload Zone */}
              <Card className="backdrop-blur-sm bg-card/80 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Camera className="h-5 w-5 text-emerald-600" />
                    Profile Photo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={cn(
                      'relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
                      isDragging
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-muted-foreground/25 hover:border-emerald-500/50 hover:bg-muted/20'
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-full bg-muted/50">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {isDragging ? 'Drop your image here' : 'Drag & drop your photo here'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">or click to browse • PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Upload profile photo"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Basic Info Section */}
              <Card className="backdrop-blur-sm bg-card/80 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-5 w-5 text-emerald-600" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>Your personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={cn(firstNameError && 'border-red-500 focus-visible:ring-red-500', firstName.length > 0 && !firstNameError && 'pr-8')} />
                        {firstName.length > 0 && !firstNameError && (
                          <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                      {firstNameError && <p className="text-[11px] text-red-500">{firstNameError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="relative">
                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className={cn(lastNameError && 'border-red-500 focus-visible:ring-red-500', lastName.length > 0 && !lastNameError && 'pr-8')} />
                        {lastName.length > 0 && !lastNameError && (
                          <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                      {lastNameError && <p className="text-[11px] text-red-500">{lastNameError}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      Email Address
                      {emailVerified && (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px] border-0 gap-0.5 ml-1">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                        </Badge>
                      )}
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input id="email" value={currentUser?.email || 'learner@example.com'} readOnly className="bg-muted/50" />
                      <Button variant="outline" size="sm" className="shrink-0 gap-1.5 text-xs">
                        Change
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Email changes require verification</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      Phone Number
                      {phoneVerified ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px] border-0 gap-0.5 ml-1">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                        </Badge>
                      ) : (
                        <button
                          className="text-[9px] text-amber-600 hover:text-amber-700 ml-1 underline cursor-pointer"
                          onClick={() => setPhoneVerified(true)}
                        >
                          Verify
                        </button>
                      )}
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className={cn(phoneError && 'border-red-500 focus-visible:ring-red-500')}
                    />
                    {phoneError && <p className="text-[11px] text-red-500">{phoneError}</p>}
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
                    <div className="flex items-center justify-between">
                      <p className={cn('text-[11px]', bio.length > 250 ? 'text-red-500' : 'text-muted-foreground')}>{bio.length}/250 characters</p>
                      {bioError && <p className="text-[11px] text-red-500">{bioError}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location & Timezone Section */}
              <Card className="backdrop-blur-sm bg-card/80 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-5 w-5 text-violet-600" />
                    Location & Timezone
                  </CardTitle>
                  <CardDescription>Help us personalize your learning experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
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

                  {/* World Map Mini Visualization */}
                  <div className="relative rounded-xl border bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-950/20 dark:to-cyan-950/20 p-4 overflow-hidden">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{timezone.replace('_', ' ')}</p>
                        <p className="text-[11px] text-muted-foreground">Current local time: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: timezone })}</p>
                      </div>
                    </div>
                    {/* Simplified world map visualization */}
                    <div className="relative h-20 flex items-center justify-center">
                      <svg viewBox="0 0 200 80" className="w-full h-full opacity-30">
                        {/* Simplified continents */}
                        <ellipse cx="45" cy="30" rx="25" ry="18" fill="currentColor" className="text-emerald-400" />
                        <ellipse cx="100" cy="35" rx="20" ry="22" fill="currentColor" className="text-emerald-400" />
                        <ellipse cx="145" cy="28" rx="30" ry="20" fill="currentColor" className="text-emerald-400" />
                        <ellipse cx="165" cy="55" rx="12" ry="10" fill="currentColor" className="text-emerald-400" />
                        {/* Location pin */}
                        <circle cx="55" cy="30" r="4" fill="#10b981" stroke="white" strokeWidth="1.5" />
                        <circle cx="55" cy="30" r="8" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.5" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Profiles Section */}
              <Card className="backdrop-blur-sm bg-card/80 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ExternalLink className="h-5 w-5 text-amber-600" />
                    Social Profiles
                  </CardTitle>
                  <CardDescription>Connect your social accounts for a richer profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {socialLinks.map((link) => (
                      <div key={link.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <link.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <Label className="text-xs">{link.label}</Label>
                          <Input
                            placeholder={link.placeholder}
                            value={socialUrls[link.id]}
                            onChange={(e) => setSocialUrls(prev => ({ ...prev, [link.id]: e.target.value }))}
                            className="text-xs h-8"
                          />
                        </div>
                        <Button
                          variant={socialUrls[link.id] ? 'outline' : 'ghost'}
                          size="sm"
                          className="text-[10px] shrink-0"
                        >
                          {socialUrls[link.id] ? (
                            <><Unlink className="h-3 w-3 mr-1" />Remove</>
                          ) : (
                            <><Link2 className="h-3 w-3 mr-1" />Connect</>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Preferences Section */}
              <Card className="backdrop-blur-sm bg-card/80 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Palette className="h-5 w-5 text-cyan-600" />
                    Display Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1.5">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        Language
                      </Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Theme</Label>
                      <Select defaultValue="system">
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">System</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <Label className="text-xs">Notification Sounds</Label>
                        <p className="text-[10px] text-muted-foreground">Play sounds for alerts</p>
                      </div>
                      <Switch checked={notificationSounds} onCheckedChange={setNotificationSounds} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button with Loading State */}
              <div className="flex items-center justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <motion.div
                  key={saveSuccess ? 'saved' : 'save'}
                  initial={false}
                  animate={saveSuccess ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !personalFormValid}
                    className={cn(
                      'gap-2 text-white min-w-[140px]',
                      saveSuccess ? 'bg-emerald-500' : 'bg-emerald-600 hover:bg-emerald-700',
                      isSaving && 'opacity-80'
                    )}
                  >
                    {isSaving ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                    ) : saveSuccess ? (
                      <><CheckCircle2 className="h-4 w-4" /> Saved!</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4" /> Save Changes</>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
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
                      { value: 'slow', label: 'Slow', desc: 'Take your time', emoji: '\uD83D\uDC22' },
                      { value: 'moderate', label: 'Moderate', desc: 'Steady progress', emoji: '\uD83D\uDEB6' },
                      { value: 'fast', label: 'Fast', desc: 'Accelerated learning', emoji: '\uD83C\uDFC3' },
                    ].map((pace) => (
                      <button
                        key={pace.value}
                        onClick={() => setLearningPace(pace.value)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all cursor-pointer',
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

          {/* ─── Tab 3: Learning Analytics (Enhanced) ──────── */}
          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              {/* Platform Comparison Banner */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-950/30 border-emerald-200 dark:border-emerald-800/50">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                        <Trophy className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">You&apos;re in the top 15% of learners!</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Your learning velocity and consistency place you ahead of 85% of the platform. Keep it up!</p>
                      </div>
                      <div className="ml-auto hidden sm:flex items-center gap-2">
                        <Rocket className="h-5 w-5 text-emerald-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Weekly Learning Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    Weekly Activity
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
                    <div className="flex items-center gap-1">
                      <div className="w-10" />
                      {dayLabels.map((d) => (
                        <div key={d} className="flex-1 text-center text-[9px] text-muted-foreground">{d}</div>
                      ))}
                    </div>
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

              {/* Subject Mastery Radar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="h-5 w-5 text-emerald-600" />
                    Subject Mastery
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
                        <Radar name="Target" dataKey="target" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeDasharray="5 5" strokeWidth={2} />
                        <Radar name="Current" dataKey="current" stroke="#10b981" fill="url(#masteryGradient)" fillOpacity={0.4} strokeWidth={2} />
                        <defs>
                          <linearGradient id="masteryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.4} />
                          </linearGradient>
                        </defs>
                        <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} formatter={(value: string) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Velocity Line Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-5 w-5 text-violet-600" />
                    Learning Velocity
                  </CardTitle>
                  <CardDescription>Lessons completed per week over the last 8 weeks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={learningVelocityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} formatter={(value: number) => [`${value} lessons`, 'Completed']} />
                        <Line type="monotone" dataKey="lessons" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5, fill: '#8b5cf6' }} activeDot={{ r: 7 }} fill="url(#velocityGradient)" />
                        <defs>
                          <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Time Distribution Donut Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-5 w-5 text-cyan-600" />
                    Time Distribution
                  </CardTitle>
                  <CardDescription>How you spend your learning time by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="h-56 w-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={timeDistributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                          >
                            {timeDistributionData.map((entry, index) => (
                              <Cell key={`td-cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                            formatter={(value: number) => [`${value}%`, 'Time']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      {timeDistributionData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-foreground">{item.name}</span>
                          <span className="text-sm font-semibold text-foreground">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skill Progress Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
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
                        <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Line type="monotone" dataKey="React" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="TypeScript" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="DevOps" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Goal Progress Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="h-5 w-5 text-emerald-600" />
                    Goal Progress
                  </CardTitle>
                  <CardDescription>Track your learning milestones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {goalProgressData.map((goal) => {
                    const progressPct = Math.round((goal.current / goal.target) * 100);
                    const colorMap: Record<string, string> = {
                      emerald: 'bg-emerald-500',
                      violet: 'bg-violet-500',
                      amber: 'bg-amber-500',
                      cyan: 'bg-cyan-500',
                    };
                    return (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{goal.label}</span>
                          <span className="text-xs text-muted-foreground">{goal.current}/{goal.target}</span>
                        </div>
                        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={cn('h-full rounded-full', colorMap[goal.color] || 'bg-emerald-500')}
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">{progressPct}% complete</span>
                          {progressPct >= 100 && (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px] border-0 gap-0.5">
                              <CheckCircle2 className="h-2.5 w-2.5" /> Achieved
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
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
                        {index < displayedActivities.length - 1 && (
                          <div className="absolute left-[17px] top-10 bottom-0 w-px bg-border" />
                        )}
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

          {/* ─── Tab 5: Certificates (Enhanced) ────────────── */}
          <TabsContent value="certificates" className="mt-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Award className="h-5 w-5 text-emerald-600" />
                    Certificate Gallery
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Your earned credentials and achievements</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{certificates.length} Certificates</Badge>
                  <Select value={certFilter} onValueChange={setCertFilter}>
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="frontend">Frontend</SelectItem>
                      <SelectItem value="data science">Data Science</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="ai/ml">AI/ML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredCertificates.map((cert, index) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="group relative"
                  >
                    <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]" />
                    <Card className="relative bg-card">
                      <CardContent className="p-0 space-y-0">
                        {/* Certificate thumbnail / gradient banner */}
                        <div className={cn('h-24 rounded-t-xl bg-gradient-to-r relative overflow-hidden', cert.color)}>
                          <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
                            backgroundSize: '16px 16px',
                          }} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Award className="h-10 w-10 text-white/60" />
                          </div>
                          {cert.verified && (
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-white/20 text-white text-[9px] border-0 gap-0.5 backdrop-blur-sm">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Certificate details */}
                        <div className="p-4 space-y-3">
                          <div>
                            <h4 className="text-sm font-semibold text-foreground leading-tight">{cert.courseName}</h4>
                            <p className="text-[11px] text-muted-foreground mt-1">Issued {cert.issueDate}</p>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Shield className="h-3 w-3" />
                            <span className="font-mono">{cert.credentialId}</span>
                          </div>

                          <Separator />

                          {/* Actions */}
                          <div className="flex items-center gap-1.5">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1 text-[10px] flex-1 h-7" onClick={() => setSelectedCert(cert.id)}>
                                  <Eye className="h-3 w-3" /> View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-emerald-600" />
                                    Certificate Details
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className={cn('h-32 rounded-xl bg-gradient-to-r flex items-center justify-center relative overflow-hidden', cert.color)}>
                                    <div className="absolute inset-0 opacity-20" style={{
                                      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
                                      backgroundSize: '16px 16px',
                                    }} />
                                    <div className="text-center text-white">
                                      <Award className="h-12 w-12 mx-auto mb-2 opacity-60" />
                                      <p className="text-lg font-bold">Certificate of Completion</p>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Course</span>
                                      <span className="font-medium text-foreground">{cert.courseName}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Issued</span>
                                      <span className="font-medium text-foreground">{cert.issueDate}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Credential ID</span>
                                      <span className="font-mono text-xs text-foreground">{cert.credentialId}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Status</span>
                                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] border-0 gap-0.5">
                                        <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-[10px] flex-1 h-7"
                              onClick={() => handleCopyLink(cert.credentialId)}
                            >
                              {copiedLink === cert.credentialId ? (
                                <><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Copied</>
                              ) : (
                                <><Copy className="h-3 w-3" /> Copy Link</>
                              )}
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1 text-[10px] h-7">
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1 text-[10px] h-7">
                              <Linkedin className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Request Certificate for completed courses without one */}
              {learningHistory.filter(h => !h.certificate).length > 0 && (
                <Card className="border-dashed">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                          <FileText className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Completed courses without certificates</p>
                          <p className="text-xs text-muted-foreground">{learningHistory.filter(h => !h.certificate).length} course(s) eligible for certificate request</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <Award className="h-3.5 w-3.5" />
                        Request Certificate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ─── Tab 6: Portfolio (NEW) ────────────────────── */}
          <TabsContent value="portfolio" className="mt-6">
            <div className="space-y-6">
              {/* Project Showcase */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Briefcase className="h-5 w-5 text-emerald-600" />
                      Project Showcase
                    </CardTitle>
                    <CardDescription className="mt-1">Highlight your best work and side projects</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Plus className="h-3.5 w-3.5" /> Add Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Project</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Project Title</Label>
                          <Input placeholder="My Awesome Project" />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea placeholder="Describe your project..." rows={3} />
                        </div>
                        <div className="space-y-2">
                          <Label>Project URL</Label>
                          <Input placeholder="https://github.com/..." />
                        </div>
                        <div className="space-y-2">
                          <Label>Tags (comma separated)</Label>
                          <Input placeholder="React, TypeScript, Node.js" />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Add Project</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {demoProjects.map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, duration: 0.4 }}
                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                        className="group"
                      >
                        <Card className="overflow-hidden h-full">
                          {/* Project thumbnail */}
                          <div className={cn('h-28 bg-gradient-to-br relative overflow-hidden', project.color)}>
                            <div className="absolute inset-0 opacity-30" style={{
                              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                              backgroundSize: '20px 20px',
                            }} />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Briefcase className="h-8 w-8 text-white/50" />
                            </div>
                            {/* Hover overlay with actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button variant="outline" size="sm" className="text-[10px] h-7 bg-white/10 text-white border-white/30 hover:bg-white/20">
                                <ExternalLink className="h-3 w-3 mr-1" /> View
                              </Button>
                              <Button variant="outline" size="sm" className="text-[10px] h-7 bg-white/10 text-white border-white/30 hover:bg-white/20">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <CardContent className="p-4 space-y-2">
                            <h4 className="text-sm font-semibold text-foreground">{project.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {project.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0">{tag}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Skills Endorsements */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Zap className="h-5 w-5 text-amber-600" />
                      Skills & Endorsements
                    </CardTitle>
                    <CardDescription className="mt-1">Skills you&apos;ve demonstrated through your learning and projects</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => setShowAddSkill(!showAddSkill)}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Skill
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showAddSkill && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Input
                        placeholder="Enter a skill name..."
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        className="text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                      />
                      <Button size="sm" onClick={handleAddSkill} className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
                        Add
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setShowAddSkill(false); setNewSkillName(''); }} className="shrink-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors group"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{skill.name}</span>
                          <Badge className={cn('text-[9px] px-1 py-0 border-0 w-fit', getSkillLevelColor(skill.level))}>
                            {skill.level}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <span className="text-xs text-muted-foreground">{skill.endorsements}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-emerald-600"
                            onClick={() => handleEndorseSkill(skill.id)}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MessageSquare className="h-5 w-5 text-violet-600" />
                      Recommendations
                    </CardTitle>
                    <CardDescription className="mt-1">What instructors and peers say about you</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Users className="h-3.5 w-3.5" /> Request
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {demoRecommendations.map((rec, index) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <Card className="border-l-4 border-l-violet-400 dark:border-l-violet-600">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 shrink-0">
                              <AvatarFallback className="text-xs font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                                {rec.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{rec.from}</p>
                                  <p className="text-[11px] text-muted-foreground">{rec.role}</p>
                                </div>
                                <span className="text-[10px] text-muted-foreground shrink-0">{rec.date}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2 leading-relaxed italic">&ldquo;{rec.text}&rdquo;</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── Tab 7: Settings (Enhanced - combined Security + Privacy + Accessibility + Danger Zone) ─── */}
          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              {/* Account Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lock className="h-5 w-5 text-emerald-600" />
                    Account Security
                  </CardTitle>
                  <CardDescription>Manage your password and authentication settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Change Password */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-foreground">Change Password</h4>
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className={cn(
                            newPassword.length > 0 && (passwordStrength >= 4
                              ? 'border-emerald-500 focus-visible:ring-emerald-500'
                              : 'border-amber-500 focus-visible:ring-amber-500')
                          )} />
                          {newPassword.length > 0 && (
                            passwordStrength >= 4 ? (
                              <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                            ) : (
                              <AlertTriangle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                            )
                          )}
                        </div>
                        {/* Password Strength Meter */}
                        {newPassword.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4].map((level) => (
                                <div
                                  key={level}
                                  className={cn(
                                    'h-1.5 flex-1 rounded-full transition-colors',
                                    passwordStrength >= level
                                      ? passwordStrength >= 4 ? 'bg-emerald-500' : passwordStrength >= 3 ? 'bg-amber-500' : 'bg-red-500'
                                      : 'bg-muted'
                                  )}
                                />
                              ))}
                            </div>
                            <p className={cn(
                              'text-[10px] font-medium',
                              passwordStrength >= 4 ? 'text-emerald-600' : passwordStrength >= 3 ? 'text-amber-600' : 'text-red-600'
                            )}>
                              {passwordStrength >= 4 ? 'Strong' : passwordStrength >= 3 ? 'Fair' : passwordStrength >= 1 ? 'Weak' : 'Too short'}
                            </p>
                            <div className="space-y-1">
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
                  </div>

                  <Separator />

                  {/* Two-Factor Authentication */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-foreground">Two-Factor Authentication</h4>
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <p className="text-sm">Enable 2FA</p>
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
                        className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 dark:border-emerald-800"
                      >
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Two-factor authentication is enabled. Use your authenticator app to generate codes.
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <Separator />

                  {/* Active Sessions */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-foreground">Active Sessions</h4>
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
                    <Button variant="outline" className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30">
                      <LogOut className="h-4 w-4" />
                      Sign Out All Devices
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Eye className="h-5 w-5 text-amber-600" />
                    Privacy
                  </CardTitle>
                  <CardDescription>Control who can see your profile and activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Profile Visibility</Label>
                    <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                      <SelectTrigger className="w-full sm:w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <span className="flex items-center gap-2"><Eye className="h-3.5 w-3.5" /> Public — Anyone can view</span>
                        </SelectItem>
                        <SelectItem value="community">
                          <span className="flex items-center gap-2"><Users className="h-3.5 w-3.5" /> Community — Members only</span>
                        </SelectItem>
                        <SelectItem value="private">
                          <span className="flex items-center gap-2"><EyeOff className="h-3.5 w-3.5" /> Private — Only you</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">Control who can view your profile and learning activity</p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Show on Leaderboard</Label>
                      <p className="text-[11px] text-muted-foreground">Display your name and ranking on the public leaderboard</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-[10px] font-medium', showOnLeaderboard ? 'text-emerald-600' : 'text-muted-foreground')}>
                        {showOnLeaderboard ? 'On' : 'Off'}
                      </span>
                      <Switch checked={showOnLeaderboard} onCheckedChange={setShowOnLeaderboard} />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Show Achievements</Label>
                      <p className="text-[11px] text-muted-foreground">Display your badges and achievements on your public profile</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-[10px] font-medium', showAchievements ? 'text-emerald-600' : 'text-muted-foreground')}>
                        {showAchievements ? 'On' : 'Off'}
                      </span>
                      <Switch checked={showAchievements} onCheckedChange={setShowAchievements} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Accessibility Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Accessibility className="h-5 w-5 text-violet-600" />
                    Accessibility
                  </CardTitle>
                  <CardDescription>Customize your experience for better usability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <Type className="h-3.5 w-3.5" />
                      Font Size
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'small', label: 'Small' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'large', label: 'Large' },
                      ].map((size) => (
                        <button
                          key={size.value}
                          onClick={() => setFontSize(size.value)}
                          className={cn(
                            'py-2 px-3 rounded-lg border text-sm font-medium transition-all cursor-pointer',
                            fontSize === size.value
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                              : 'border-border hover:border-muted-foreground/30 text-foreground'
                          )}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Reduced Motion</Label>
                      <p className="text-[11px] text-muted-foreground">Minimize animations and transitions throughout the app</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-[10px] font-medium', reducedMotion ? 'text-emerald-600' : 'text-muted-foreground')}>
                        {reducedMotion ? 'On' : 'Off'}
                      </span>
                      <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">High Contrast</Label>
                      <p className="text-[11px] text-muted-foreground">Increase contrast for better readability</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-[10px] font-medium', highContrast ? 'text-emerald-600' : 'text-muted-foreground')}>
                        {highContrast ? 'On' : 'Off'}
                      </span>
                      <Switch checked={highContrast} onCheckedChange={setHighContrast} />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Screen Reader Optimization</Label>
                      <p className="text-[11px] text-muted-foreground">Enhanced ARIA labels and navigation for screen readers</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-[10px] font-medium', screenReader ? 'text-emerald-600' : 'text-muted-foreground')}>
                        {screenReader ? 'On' : 'Off'}
                      </span>
                      <Switch checked={screenReader} onCheckedChange={setScreenReader} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200 dark:border-red-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription className="text-red-500/70">Irreversible and destructive actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">Export All Data</p>
                      <p className="text-[11px] text-red-600/70 dark:text-red-400/70">Download a copy of all your data including courses, progress, and certificates.</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs text-red-600 border-red-300 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-950/40 shrink-0">
                      <Download className="h-3.5 w-3.5" />
                      Export
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">Deactivate Account</p>
                      <p className="text-[11px] text-red-600/70 dark:text-red-400/70">Temporarily disable your account. You can reactivate it later by signing in.</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs text-red-600 border-red-300 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-950/40 shrink-0">
                      <EyeOff className="h-3.5 w-3.5" />
                      Deactivate
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">Delete Account</p>
                      <p className="text-[11px] text-red-600/70 dark:text-red-400/70">Permanently delete your account and all associated data. This action cannot be undone.</p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs text-red-600 border-red-300 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-950/40 shrink-0">
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-red-600 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Account
                          </DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data, progress, and certificates will be lost.</p>
                        <div className="space-y-2">
                          <Label>Type &quot;DELETE&quot; to confirm</Label>
                          <Input placeholder="DELETE" className="border-red-300 focus-visible:ring-red-500" />
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button className="bg-red-600 hover:bg-red-700 text-white">Delete Account</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
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
