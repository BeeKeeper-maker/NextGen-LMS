'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  X,
  User,
  Share2,
  Reply,
  ClipboardCheck,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/app-store';
import type { Notification } from '@/types';

// ─── Time helpers ────────────────────────────────────────────────

function getTimeAgo(timestamp: string): string {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diffMs = now - time;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

type TimeGroup = 'Just now' | 'Today' | 'Yesterday' | 'Earlier';

function getTimeGroup(timestamp: string): TimeGroup {
  const now = new Date();
  const notifDate = new Date(timestamp);
  const diffMs = now.getTime() - notifDate.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 5) return 'Just now';

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const notifTime = notifDate.getTime();

  if (notifTime >= todayStart) return 'Today';
  if (notifTime >= yesterdayStart) return 'Yesterday';
  return 'Earlier';
}

const TIME_GROUP_ORDER: TimeGroup[] = ['Just now', 'Today', 'Yesterday', 'Earlier'];

// ─── Type config ─────────────────────────────────────────────────

const typeIcons: Record<Notification['type'], string> = {
  enrollment: '👤',
  completion: '🎓',
  achievement: '🏆',
  community: '💬',
  system: '🚀',
  cohort: '🎥',
  assessment: '📝',
};

type ActionType = 'View Student' | 'Share' | 'Reply' | 'Review';

const typeActions: Partial<Record<Notification['type'], ActionType>> = {
  enrollment: 'View Student',
  achievement: 'Share',
  community: 'Reply',
  assessment: 'Review',
};

const actionIconMap: Record<ActionType, React.ReactNode> = {
  'View Student': <User className="h-3 w-3" />,
  Share: <Share2 className="h-3 w-3" />,
  Reply: <Reply className="h-3 w-3" />,
  Review: <ClipboardCheck className="h-3 w-3" />,
};

// ─── Simulated notification pool ─────────────────────────────────

const SIMULATED_NOTIFICATIONS: Omit<Notification, 'id' | 'timestamp' | 'read'>[] = [
  { type: 'enrollment', title: 'New Enrollment', message: 'A new student enrolled in Advanced React Masterclass' },
  { type: 'achievement', title: 'Achievement Unlocked!', message: 'A learner earned the "Speed Runner" achievement' },
  { type: 'community', title: 'New Reply', message: 'Someone replied to your discussion on API best practices' },
  { type: 'assessment', title: 'Quiz Submitted', message: 'A student submitted the TypeScript Fundamentals quiz' },
  { type: 'cohort', title: 'Live Session Alert', message: 'System Design live cohort starts in 15 minutes' },
  { type: 'completion', title: 'Course Completed', message: 'A learner completed "Full-Stack Web Development"' },
  { type: 'system', title: 'Platform Update', message: 'New analytics dashboard features are now available' },
  { type: 'enrollment', title: 'Enrollment Milestone', message: 'Your course hit 500 enrollments! 🎉' },
  { type: 'community', title: 'Mentioned You', message: '@you was mentioned in "Best practices for state management"' },
  { type: 'achievement', title: 'Streak Record!', message: 'A learner hit a 30-day learning streak 🔥' },
  { type: 'assessment', title: 'Assignment Graded', message: 'Peer review completed for UI/UX Design assignment' },
  { type: 'cohort', title: 'Cohort Starting Soon', message: 'Next.js 16 Deep Dive cohort begins tomorrow' },
];

// ─── Filter types ────────────────────────────────────────────────

type FilterTab = 'all' | 'unread' | 'mentions';

// ─── Confetti dot component for empty state ──────────────────────

const CONFETTI_DOTS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: (i % 4) * 30 + 10,
  y: Math.floor(i / 4) * 25 + 10,
  delay: i * 0.1,
  size: i % 3 === 0 ? 6 : i % 3 === 1 ? 4 : 5,
  color:
    i % 5 === 0
      ? 'bg-emerald-400'
      : i % 5 === 1
        ? 'bg-amber-400'
        : i % 5 === 2
          ? 'bg-rose-400'
          : i % 5 === 3
            ? 'bg-sky-400'
            : 'bg-violet-400',
}));

function ConfettiDots() {
  return (
    <div className="relative w-[130px] h-[70px] mx-auto">
      {CONFETTI_DOTS.map((dot) => (
        <motion.div
          key={dot.id}
          className={`absolute rounded-full ${dot.color}`}
          style={{
            width: dot.size,
            height: dot.size,
            left: dot.x,
            top: dot.y,
          }}
          animate={{
            y: [0, -8, 0],
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: dot.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Notification Item ────────────────────────────────────────────

function NotificationItem({
  notification,
  onMarkRead,
  isNew,
  onAction,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  isNew: boolean;
  onAction: (action: ActionType, notificationId: string) => void;
}) {
  const [glowActive, setGlowActive] = useState(isNew);
  const actionType = typeActions[notification.type];

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setGlowActive(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, y: -20, scale: 0.97 } : { opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 10 }}
      className={`relative rounded-lg transition-colors ${
        glowActive
          ? 'ring-1 ring-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
          : ''
      }`}
    >
      <button
        onClick={() => !notification.read && onMarkRead(notification.id)}
        className={`w-full text-left p-3 rounded-lg transition-colors cursor-pointer ${
          notification.read
            ? 'bg-transparent hover:bg-muted/50'
            : 'bg-emerald-50/60 hover:bg-emerald-100/60 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50'
        }`}
      >
        <div className="flex gap-3">
          <div className="shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm">
            {notification.icon || typeIcons[notification.type]}
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-start justify-between gap-2">
              <p
                className={`text-sm leading-tight ${
                  notification.read
                    ? 'font-medium text-foreground'
                    : 'font-semibold text-foreground'
                }`}
              >
                {notification.title}
              </p>
              {!notification.read && (
                <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {notification.message}
            </p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] text-muted-foreground/70">
                {getTimeAgo(notification.timestamp)}
              </p>
              {actionType && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction(actionType, notification.id);
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 px-2 py-0.5 rounded-full transition-colors"
                >
                  {actionIconMap[actionType]}
                  {actionType}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
}

// ─── Main Notification Center ────────────────────────────────────

export function NotificationCenter() {
  const {
    notifications,
    showNotifications,
    toggleNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    addNotification,
  } = useAppStore();

  const panelRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());
  const [bellRinging, setBellRinging] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const simCounterRef = useRef(0);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Mention detection ────────────────────────────────────────
  const isMention = useCallback((n: Notification) => {
    return (
      n.type === 'community' ||
      n.message.toLowerCase().includes('@you') ||
      n.message.toLowerCase().includes('mentioned')
    );
  }, []);

  // ── Filtered notifications ───────────────────────────────────
  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'mentions') return isMention(n);
    return true;
  });

  // ── Count per filter ─────────────────────────────────────────
  const filterCounts = {
    all: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    mentions: notifications.filter((n) => isMention(n)).length,
  };

  // ── Grouped notifications ────────────────────────────────────
  const groupedNotifications: Record<TimeGroup, Notification[]> = {
    'Just now': [],
    Today: [],
    Yesterday: [],
    Earlier: [],
  };

  filteredNotifications.forEach((n) => {
    const group = getTimeGroup(n.timestamp);
    groupedNotifications[group].push(n);
  });

  // ── Close panel on outside click ─────────────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        if (showNotifications) {
          toggleNotifications();
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, toggleNotifications]);

  // ── Simulated real-time notifications ────────────────────────
  useEffect(() => {
    if (!showNotifications) return;

    const scheduleNext = () => {
      const delay = 30000 + Math.floor(Math.random() * 30000); // 30-60s
      return setTimeout(() => {
        simCounterRef.current += 1;
        const template =
          SIMULATED_NOTIFICATIONS[
            Math.floor(Math.random() * SIMULATED_NOTIFICATIONS.length)
          ];
        const newNotif: Notification = {
          ...template,
          id: `sim-${Date.now()}-${simCounterRef.current}`,
          timestamp: new Date().toISOString(),
          read: false,
        };
        addNotification(newNotif);
        setNewlyAddedIds((prev) => {
          const next = new Set(prev);
          next.add(newNotif.id);
          return next;
        });
        setBellRinging(true);

        // Remove from "newly added" after 5 seconds
        setTimeout(() => {
          setNewlyAddedIds((prev) => {
            const next = new Set(prev);
            next.delete(newNotif.id);
            return next;
          });
        }, 5000);

        // Stop bell ring after 1 second
        setTimeout(() => setBellRinging(false), 1000);
      }, delay);
    };

    const timerId = scheduleNext();
    return () => clearTimeout(timerId);
  }, [showNotifications, addNotification]);

  // ── Action handler ───────────────────────────────────────────
  const handleAction = useCallback((action: ActionType, _notifId: string) => {
    // In a real app, these would navigate or open modals
    console.log(`Action: ${action} on notification ${_notifId}`);
  }, []);

  // ── Empty state for current filter ───────────────────────────
  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
      >
        <Sparkles className="h-10 w-10 mb-3 text-emerald-400/70" />
      </motion.div>
      <ConfettiDots />
      <p className="text-sm font-medium mt-2 text-foreground">All caught up!</p>
      <p className="text-xs mt-1">
        {activeFilter === 'unread'
          ? 'No unread notifications right now'
          : activeFilter === 'mentions'
            ? 'No mentions found'
            : 'No notifications yet'}
      </p>
    </div>
  );

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 rounded-full"
        onClick={toggleNotifications}
        aria-label="Toggle notifications"
      >
        <motion.div
          animate={
            bellRinging
              ? { rotate: [0, 14, -14, 10, -10, 4, -4, 0] }
              : { rotate: 0 }
          }
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
        </motion.div>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </Button>

      {/* Notification Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50"
          >
            <div className="bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    Notifications
                  </h3>
                  {/* Live indicator */}
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    Live
                  </div>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 px-1.5 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {/* Sound toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setSoundOn((s) => !s)}
                    aria-label={soundOn ? 'Mute notifications' : 'Unmute notifications'}
                  >
                    {soundOn ? (
                      <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Button>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-emerald-600 hover:text-emerald-700"
                      onClick={markAllNotificationsRead}
                    >
                      <CheckCheck className="h-3.5 w-3.5 mr-1" />
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={toggleNotifications}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="px-3 pb-2">
                <div className="inline-flex h-8 items-center justify-center rounded-lg bg-muted p-[3px] gap-0.5 w-full">
                  {(['all', 'unread', 'mentions'] as FilterTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveFilter(tab)}
                      className={`relative flex-1 inline-flex items-center justify-center gap-1 h-[calc(100%-2px)] rounded-md text-xs font-medium transition-colors ${
                        activeFilter === tab
                          ? 'bg-background shadow-sm text-foreground'
                          : 'text-muted-foreground hover:text-foreground/80'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {filterCounts[tab] > 0 && (
                        <span
                          className={`text-[9px] px-1 py-0.5 rounded-full font-semibold ${
                            activeFilter === tab
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                              : 'bg-muted-foreground/10 text-muted-foreground'
                          }`}
                        >
                          {filterCounts[tab] > 99 ? '99+' : filterCounts[tab]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Notification List */}
              <ScrollArea className="max-h-[420px]">
                {filteredNotifications.length === 0 ? (
                  renderEmpty()
                ) : (
                  <div className="p-2">
                    <AnimatePresence>
                      {TIME_GROUP_ORDER.map((group) => {
                        const items = groupedNotifications[group];
                        if (items.length === 0) return null;
                        return (
                          <div key={group} className="mb-2 last:mb-0">
                            {/* Group header */}
                            <div className="flex items-center justify-between px-2 py-1.5">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                                {group}
                              </span>
                              <span className="text-[10px] text-muted-foreground/50">
                                {items.length} {items.length === 1 ? 'item' : 'items'}
                              </span>
                            </div>
                            <div className="space-y-1">
                              {items.map((notification) => (
                                <NotificationItem
                                  key={notification.id}
                                  notification={notification}
                                  onMarkRead={markNotificationRead}
                                  isNew={newlyAddedIds.has(notification.id)}
                                  onAction={handleAction}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              {notifications.length > 0 && (
                <>
                  <Separator />
                  <div className="px-4 py-2.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-emerald-600 hover:text-emerald-700 justify-center"
                    >
                      View All Notifications
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
