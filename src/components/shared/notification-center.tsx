'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/app-store';
import type { Notification } from '@/types';

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

const typeIcons: Record<Notification['type'], string> = {
  enrollment: '👤',
  completion: '🎓',
  achievement: '🏆',
  community: '💬',
  system: '🚀',
  cohort: '🎥',
  assessment: '📝',
};

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
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
            <p className={`text-sm leading-tight ${notification.read ? 'font-medium text-foreground' : 'font-semibold text-foreground'}`}>
              {notification.title}
            </p>
            {!notification.read && (
              <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {notification.message}
          </p>
          <p className="text-[10px] text-muted-foreground/70">
            {getTimeAgo(notification.timestamp)}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export function NotificationCenter() {
  const {
    notifications,
    showNotifications,
    toggleNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAppStore();

  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close panel when clicking outside
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
        <Bell className="h-4 w-4 text-muted-foreground" />
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
                  <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 px-1.5 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
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

              <Separator />

              {/* Notification List */}
              <ScrollArea className="max-h-96">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm">No notifications</p>
                    <p className="text-xs mt-0.5">You&apos;re all caught up!</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    <AnimatePresence>
                      {notifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkRead={markNotificationRead}
                        />
                      ))}
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
