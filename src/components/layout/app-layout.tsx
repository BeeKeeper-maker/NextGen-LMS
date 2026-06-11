'use client';

import { useAppStore } from '@/store/app-store';
import { Sidebar } from '@/components/layout/sidebar';
import { LandingPage } from '@/components/landing/landing-page';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { AdminCourses } from '@/components/admin/admin-courses';
import { AdminCommunity } from '@/components/admin/admin-community';
import { AdminAssessments } from '@/components/admin/admin-assessments';
import { AdminCertificates } from '@/components/admin/admin-certificates';
import { AdminAnalytics } from '@/components/admin/admin-analytics';
import { AdminSettings } from '@/components/admin/admin-settings';
import { LearnerDashboard } from '@/components/learner/learner-dashboard';
import { LearnerCourse } from '@/components/learner/learner-course';
import { LearnerCommunity } from '@/components/learner/learner-community';
import { LearnerAchievements } from '@/components/learner/learner-achievements';
import { LearnerProfile } from '@/components/learner/learner-profile';
import { AdminLiveCohorts } from '@/components/admin/admin-live-cohorts';
import { LearnerLiveCohorts } from '@/components/learner/learner-live-cohorts';
import { LearnerLearningPaths } from '@/components/learner/learner-learning-paths';
import { AdminLearningPaths } from '@/components/admin/admin-learning-paths';
import { CheckoutPage } from '@/components/checkout/checkout-page';
import { AITutorFullPage, AITutorFloatingWidget } from '@/components/ai/ai-tutor-chat';
import { AIContentGeneration } from '@/components/ai/ai-content-generation';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronRight,
  CheckCheck,
} from 'lucide-react';
import { ThemeToggle } from '@/components/shared/theme-toggle';

// View name map for breadcrumbs
const viewLabels: Record<string, string> = {
  'admin-dashboard': 'Dashboard',
  'admin-courses': 'Courses',
  'admin-community': 'Community',
  'admin-assessments': 'Assessments',
  'admin-certificates': 'Certificates',
  'admin-analytics': 'Analytics',
  'admin-settings': 'Settings',
  'admin-live-cohorts': 'Live Cohorts',
  'admin-learning-paths': 'Learning Paths',
  'learner-dashboard': 'Dashboard',
  'learner-course': 'My Courses',
  'learner-community': 'Community',
  'learner-achievements': 'Achievements',
  'learner-live-cohorts': 'Live Cohorts',
  'learner-learning-paths': 'Learning Paths',
  'learner-profile': 'Profile',
  'ai-assistant': 'AI Tutor',
  'ai-content-gen': 'AI Content Generation',
};

function MainContent() {
  const { currentView } = useAppStore();

  const viewMap: Record<string, React.ReactNode> = {
    'admin-dashboard': <AdminDashboard />,
    'admin-courses': <AdminCourses />,
    'admin-community': <AdminCommunity />,
    'admin-assessments': <AdminAssessments />,
    'admin-certificates': <AdminCertificates />,
    'admin-analytics': <AdminAnalytics />,
    'admin-settings': <AdminSettings />,
    'admin-live-cohorts': <AdminLiveCohorts />,
    'admin-learning-paths': <AdminLearningPaths />,
    'learner-dashboard': <LearnerDashboard />,
    'learner-course': <LearnerCourse />,
    'learner-community': <LearnerCommunity />,
    'learner-achievements': <LearnerAchievements />,
    'learner-live-cohorts': <LearnerLiveCohorts />,
    'learner-learning-paths': <LearnerLearningPaths />,
    'learner-profile': <LearnerProfile />,
    'checkout': <CheckoutPage />,
    'ai-assistant': <AITutorFullPage />,
    'ai-content-gen': <AIContentGeneration />,
  };

  const isFullPageView = currentView === 'ai-assistant';

  return (
    <AnimatePresence mode="wait">
      <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={isFullPageView ? 'flex-1 flex flex-col overflow-hidden' : 'flex-1 overflow-auto'}
        >
          {viewMap[currentView] || <AdminDashboard />}
        </motion.div>
      </AnimatePresence>
  );
}

// Top bar for admin/learner mode
function TopBar() {
  const { appMode, currentView, currentUser, notifications, markAllNotificationsRead, markNotificationRead, goToLanding } = useAppStore();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const breadcrumb = viewLabels[currentView] || 'Dashboard';
  const isAdmin = appMode === 'admin';

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-4 sm:px-6 h-14 shrink-0">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{isAdmin ? 'Admin' : 'Learner'}</span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium text-foreground">{breadcrumb}</span>
      </div>

      {/* Right: Search, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search */}
        <div className="hidden sm:flex items-center relative">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-8 w-48 lg:w-64 pl-8 text-sm bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between p-3 border-b">
              <h4 className="text-sm font-semibold">Notifications</h4>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground gap-1"
                  onClick={markAllNotificationsRead}
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </Button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.slice(0, 5).map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`w-full text-left p-3 border-b border-border/50 hover:bg-muted/50 transition-colors ${!notif.read ? 'bg-muted/30' : ''}`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-base shrink-0 mt-0.5">{notif.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{notif.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notif.message}</p>
                    </div>
                    {!notif.read && (
                      <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                {currentUser?.name?.split(' ').map((n) => n[0]).join('') || 'U'}
              </div>
              <span className="hidden lg:inline text-sm font-medium max-w-[120px] truncate">
                {currentUser?.name?.split(' ')[0] || 'User'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{currentUser?.name}</p>
              <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={goToLanding}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function AppLayout() {
  const { appMode } = useAppStore();

  // Marketing mode: just the landing page (no sidebar)
  if (appMode === 'marketing') {
    return <LandingPage />;
  }

  // Admin / Learner mode: sidebar + top bar + main content
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col relative">
        <TopBar />
        <MainContent />
      </main>
      {/* Floating AI Chat Widget - always available in learner mode */}
      <AITutorFloatingWidget />
    </div>
  );
}
