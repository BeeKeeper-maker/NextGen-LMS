'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import type { AppView } from '@/types';
import {
  LayoutDashboard,
  BookOpen,
  MessageCircle,
  ClipboardCheck,
  Award,
  BarChart3,
  Settings,
  Trophy,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Repeat,
  GraduationCap,
  Sparkles,
  Bell,
  Plus,
  User,
  LogOut,
  Calendar,
  FileText,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/shared/theme-toggle';

interface NavItem {
  label: string;
  view: AppView;
  icon: React.ElementType;
}

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', view: 'admin-dashboard', icon: LayoutDashboard },
  { label: 'Courses', view: 'admin-courses', icon: BookOpen },
  { label: 'Community', view: 'admin-community', icon: MessageCircle },
  { label: 'Live Cohorts', view: 'admin-live-cohorts', icon: Calendar },
  { label: 'Assessments', view: 'admin-assessments', icon: ClipboardCheck },
  { label: 'Certificates', view: 'admin-certificates', icon: Award },
  { label: 'Analytics', view: 'admin-analytics', icon: BarChart3 },
  { label: 'AI Generate', view: 'ai-content-gen', icon: Sparkles },
  { label: 'Checkout', view: 'checkout' as AppView, icon: FileText },
  { label: 'Settings', view: 'admin-settings', icon: Settings },
];

const learnerNavItems: NavItem[] = [
  { label: 'Dashboard', view: 'learner-dashboard', icon: LayoutDashboard },
  { label: 'My Courses', view: 'learner-course', icon: BookOpen },
  { label: 'Community', view: 'learner-community', icon: MessageCircle },
  { label: 'Live Cohorts', view: 'learner-live-cohorts', icon: Calendar },
  { label: 'Achievements', view: 'learner-achievements', icon: Trophy },
  { label: 'Profile', view: 'learner-profile', icon: User },
  { label: 'AI Tutor', view: 'ai-assistant', icon: Sparkles },
];

// Quick Create menu items
const quickCreateItems = [
  { label: 'New Course', icon: BookOpen, view: 'admin-courses' as AppView },
  { label: 'New Assessment', icon: ClipboardCheck, view: 'admin-assessments' as AppView },
  { label: 'New Post', icon: MessageCircle, view: 'admin-community' as AppView },
  { label: 'Schedule Session', icon: Calendar, view: 'admin-dashboard' as AppView },
];

export function Sidebar() {
  const {
    appMode,
    currentView,
    sidebarCollapsed,
    currentTenant,
    currentUser,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setView,
    toggleSidebarCollapse,
    enterAdminMode,
    enterLearnerMode,
    goToLanding,
  } = useAppStore();

  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const navItems = appMode === 'admin' ? adminNavItems : learnerNavItems;
  const isAdmin = appMode === 'admin';
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        className={cn(
          'flex flex-col h-screen border-r border-border bg-card sticky top-0 z-30 shrink-0 overflow-hidden',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 256 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Tenant Header */}
        <div className="flex items-center gap-3 p-4 min-h-[64px]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <GraduationCap className="h-4 w-4" />
          </div>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden flex-1 flex items-center justify-between"
            >
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate text-foreground">
                  {currentTenant?.name || 'NextGen LMS'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {isAdmin ? 'Admin Portal' : 'Learner Portal'}
                </p>
              </div>
              {/* Notification Bell in sidebar header */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-72 p-0">
                  <div className="flex items-center justify-between p-3 border-b">
                    <h4 className="text-sm font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[11px] text-muted-foreground"
                        onClick={markAllNotificationsRead}
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.slice(0, 4).map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`w-full text-left p-2.5 border-b border-border/50 hover:bg-muted/50 transition-colors ${!notif.read ? 'bg-muted/30' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-sm shrink-0">{notif.icon}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground">{notif.title}</p>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">{notif.message}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </motion.div>
          )}
        </div>

        <Separator />

        {/* Quick Create Button */}
        {!sidebarCollapsed && isAdmin && (
          <div className="px-3 pt-3">
            <Popover open={quickCreateOpen} onOpenChange={setQuickCreateOpen}>
              <PopoverTrigger asChild>
                <Button
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-9"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  Quick Create
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-52 p-1">
                {quickCreateItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        setView(item.view);
                        setQuickCreateOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {item.label}
                    </button>
                  );
                })}
              </PopoverContent>
            </Popover>
          </div>
        )}

        {sidebarCollapsed && isAdmin && (
          <div className="px-2 pt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full h-9 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                  onClick={() => setQuickCreateOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Quick Create</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              const Icon = item.icon;

              const button = (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    sidebarCollapsed && 'justify-center px-0'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', isActive && 'text-emerald-600 dark:text-emerald-400')} />
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </button>
              );

              if (sidebarCollapsed) {
                return (
                  <li key={item.view}>
                    <Tooltip>
                      <TooltipTrigger asChild>{button}</TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  </li>
                );
              }

              return <li key={item.view}>{button}</li>;
            })}
          </ul>
        </nav>

        {/* User Profile Section at Bottom */}
        {currentUser && (
          <>
            <Separator />
            <div className={cn('p-2', sidebarCollapsed ? 'px-1.5' : 'px-3')}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-muted transition-colors',
                      sidebarCollapsed && 'justify-center px-0'
                    )}
                  >
                    <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      {currentUser.name?.split(' ').map((n) => n[0]).join('') || 'U'}
                    </div>
                    {!sidebarCollapsed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden flex-1"
                      >
                        <p className="text-sm font-medium truncate text-foreground">{currentUser.name}</p>
                        <p className="text-xs text-muted-foreground truncate capitalize">
                          {currentUser.role?.replace('_', ' ')}
                        </p>
                      </motion.div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top" className="w-52">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setView('admin-settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-default">
                    <div className="flex items-center justify-between w-full">
                      <span className="flex items-center">
                        <Sun className="mr-2 h-4 w-4" />
                        Theme
                      </span>
                      <ThemeToggle />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={goToLanding}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}

        <Separator />

        {/* Bottom Actions */}
        <div className="p-2 space-y-1">
          {/* Switch Role */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={sidebarCollapsed ? 'icon' : 'default'}
                className={cn(
                  'w-full',
                  !sidebarCollapsed && 'justify-start gap-3 px-3'
                )}
                onClick={isAdmin ? enterLearnerMode : enterAdminMode}
              >
                <Repeat className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm"
                  >
                    Switch to {isAdmin ? 'Learner' : 'Admin'}
                  </motion.span>
                )}
              </Button>
            </TooltipTrigger>
            {sidebarCollapsed && (
              <TooltipContent side="right">
                Switch to {isAdmin ? 'Learner' : 'Admin'}
              </TooltipContent>
            )}
          </Tooltip>

          {/* Back to Home */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={sidebarCollapsed ? 'icon' : 'default'}
                className={cn(
                  'w-full',
                  !sidebarCollapsed && 'justify-start gap-3 px-3'
                )}
                onClick={goToLanding}
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm"
                  >
                    Back to Home
                  </motion.span>
                )}
              </Button>
            </TooltipTrigger>
            {sidebarCollapsed && (
              <TooltipContent side="right">Back to Home</TooltipContent>
            )}
          </Tooltip>

          {/* Collapse Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={sidebarCollapsed ? 'icon' : 'default'}
                className={cn(
                  'w-full',
                  !sidebarCollapsed && 'justify-start gap-3 px-3'
                )}
                onClick={toggleSidebarCollapse}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronLeft className="h-4 w-4 shrink-0" />
                )}
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm"
                  >
                    Collapse
                  </motion.span>
                )}
              </Button>
            </TooltipTrigger>
            {sidebarCollapsed && (
              <TooltipContent side="right">Expand Sidebar</TooltipContent>
            )}
          </Tooltip>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
