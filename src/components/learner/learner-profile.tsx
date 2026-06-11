'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  { id: 'github', name: 'GitHub', icon: 'GH', color: 'bg-slate-100 text-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:text-slate-300', connected: true, email: 'alexjohnson' },
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

  const memberSince = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'March 10, 2024';

  const initials = currentUser?.name?.split(' ').map((n) => n[0]).join('') || 'AJ';

  return (
    <motion.div
      className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Profile Header ───────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <div className="h-28 md:h-36 bg-gradient-to-r from-slate-800 via-slate-700 to-emerald-800 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.3),transparent_50%)]" />
          </div>
          <CardContent className="p-6 -mt-14 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              {/* Avatar */}
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarFallback className="text-2xl font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-5 w-5 text-white" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-foreground">{currentUser?.name || 'Alex Johnson'}</h1>
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
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Member since {memberSince}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {currentUser?.streakDays || 7} day streak
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    {currentUser?.totalPoints?.toLocaleString() || '1,250'} points
                  </span>
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
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
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
                  />
                  <p className="text-[11px] text-muted-foreground">{bio.length}/250 characters</p>
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

                <div className="flex items-center justify-end gap-3">
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Save Changes
                  </Button>
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
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <Label htmlFor={item.id} className="text-sm font-medium cursor-pointer">{item.label}</Label>
                        <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        id={item.id}
                        checked={item.checked}
                        onCheckedChange={item.onChange}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Video Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Monitor className="h-5 w-5 text-slate-600 dark:text-slate-400 dark:text-slate-500" />
                    Video Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoplay" className="text-sm font-medium">Auto-play Next Lesson</Label>
                      <p className="text-[11px] text-muted-foreground">Automatically play the next lesson when current one ends</p>
                    </div>
                    <Switch id="autoplay" checked={autoPlay} onCheckedChange={setAutoPlay} />
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
                    <Switch id="captions" checked={closedCaptions} onCheckedChange={setClosedCaptions} />
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-end">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ─── Tab 3: Security ───────────────────────────── */}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
                      {newPassword && newPassword.length < 8 && (
                        <p className="text-[11px] text-amber-600">Password must be at least 8 characters</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-[11px] text-red-500">Passwords do not match</p>
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
                    <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
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
            </div>
          </TabsContent>

          {/* ─── Tab 4: Connected Accounts ─────────────────── */}
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

          {/* ─── Tab 5: Learning History ───────────────────── */}
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
