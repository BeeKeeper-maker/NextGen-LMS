import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppView, AppMode, UserRole, User, Tenant, Notification } from '@/types';

// Notification preference categories
export type NotificationCategory = 'enrollments' | 'completions' | 'assessments' | 'community' | 'system' | 'cohorts';
export type DigestFrequency = 'realtime' | 'daily' | 'weekly' | 'off';

export interface NotificationPreferences {
  emailEnabled: Record<NotificationCategory, boolean>;
  pushEnabled: Record<NotificationCategory, boolean>;
  digestFrequency: DigestFrequency;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface AppState {
  // Navigation
  currentView: AppView;
  appMode: AppMode;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // User & Auth
  currentUser: User | null;
  currentTenant: Tenant | null;
  userRole: UserRole;
  
  // Selection State
  selectedCourseId: string | null;
  selectedCheckoutItemId: string | null;
  
  // UI State
  theme: 'light' | 'dark';
  isLoading: boolean;
  activeModal: string | null;
  notifications: Notification[];
  showNotifications: boolean;
  
  // Notification Preferences
  notificationPreferences: NotificationPreferences;
  
  // Actions
  setView: (view: AppView) => void;
  setSelectedCourseId: (id: string | null) => void;
  setSelectedCheckoutItemId: (id: string | null) => void;
  setAppMode: (mode: AppMode) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  setCurrentUser: (user: User | null) => void;
  setCurrentTenant: (tenant: Tenant | null) => void;
  setUserRole: (role: UserRole) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setIsLoading: (loading: boolean) => void;
  setActiveModal: (modal: string | null) => void;
  enterAdminMode: () => void;
  enterLearnerMode: () => void;
  loginAsAdmin: (user: User) => void;
  loginAsLearner: (user: User) => void;
  logout: () => void;
  goToLanding: () => void;
  toggleNotifications: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: Notification) => void;
  deleteNotification: (id: string) => void;
  deleteNotifications: (ids: string[]) => void;
  markNotificationsRead: (ids: string[]) => void;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;
}

const demoNotifications: Notification[] = [
  { id: 'notif-1', type: 'enrollment', title: 'New Enrollment', message: 'Mike Chen enrolled in Advanced React & Next.js Masterclass', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false, icon: '👤' },
  { id: 'notif-2', type: 'achievement', title: 'Achievement Unlocked!', message: 'Emma Rodriguez earned the "Course Graduate" achievement 🎓', timestamp: new Date(Date.now() - 7200000).toISOString(), read: false, icon: '🏆' },
  { id: 'notif-3', type: 'cohort', title: 'Live Session Starting', message: 'System Design live cohort starts in 30 minutes', timestamp: new Date(Date.now() - 1800000).toISOString(), read: false, icon: '🎥' },
  { id: 'notif-4', type: 'community', title: 'New Discussion', message: 'David Park asked: "Best practices for API authentication?"', timestamp: new Date(Date.now() - 14400000).toISOString(), read: true, icon: '💬' },
  { id: 'notif-5', type: 'assessment', title: 'Quiz Submitted', message: 'Lisa Wang submitted the AI Integration assessment (Score: 94%)', timestamp: new Date(Date.now() - 28800000).toISOString(), read: true, icon: '📝' },
  { id: 'notif-6', type: 'system', title: 'Platform Update', message: 'New feature: AI Content Generation is now available for all Professional plans', timestamp: new Date(Date.now() - 86400000).toISOString(), read: true, icon: '🚀' },
  { id: 'notif-7', type: 'completion', title: 'Course Completed', message: 'Jordan Lee completed "Data Visualization & Analytics"', timestamp: new Date(Date.now() - 43200000).toISOString(), read: true, icon: '🎓' },
  { id: 'notif-8', type: 'enrollment', title: 'New Enrollment', message: 'Sophia Martinez enrolled in Python for Data Science', timestamp: new Date(Date.now() - 10800000).toISOString(), read: false, icon: '👤' },
  { id: 'notif-9', type: 'community', title: 'Mentioned You', message: '@Sarah was mentioned in "Tips for scaling LMS platforms"', timestamp: new Date(Date.now() - 18000000).toISOString(), read: false, icon: '💬' },
  { id: 'notif-10', type: 'assessment', title: 'Assignment Graded', message: 'Peer review completed for UX Design Fundamentals assignment', timestamp: new Date(Date.now() - 50400000).toISOString(), read: true, icon: '📝' },
  { id: 'notif-11', type: 'cohort', title: 'Cohort Starting Soon', message: 'Next.js 16 Deep Dive cohort begins tomorrow at 10 AM EST', timestamp: new Date(Date.now() - 90000000).toISOString(), read: true, icon: '🎥' },
  { id: 'notif-12', type: 'system', title: 'Scheduled Maintenance', message: 'Platform maintenance window: Saturday 2-4 AM EST', timestamp: new Date(Date.now() - 172800000).toISOString(), read: true, icon: '🔧' },
  { id: 'notif-13', type: 'completion', title: 'Course Milestone', message: '25 learners completed "Advanced React Patterns" this week!', timestamp: new Date(Date.now() - 129600000).toISOString(), read: true, icon: '🎓' },
  { id: 'notif-14', type: 'enrollment', title: 'Enrollment Milestone', message: 'Your course "AI Integration" hit 500 enrollments! 🎉', timestamp: new Date(Date.now() - 216000000).toISOString(), read: true, icon: '👤' },
  { id: 'notif-15', type: 'community', title: 'Popular Post', message: 'Your post "Building Accessible UIs" received 50+ reactions', timestamp: new Date(Date.now() - 259200000).toISOString(), read: true, icon: '💬' },
  { id: 'notif-16', type: 'assessment', title: 'New Quiz Available', message: 'TypeScript Advanced Patterns quiz is now available for review', timestamp: new Date(Date.now() - 302400000).toISOString(), read: true, icon: '📝' },
  { id: 'notif-17', type: 'achievement', title: 'Streak Record!', message: 'A learner hit a 30-day learning streak 🔥', timestamp: new Date(Date.now() - 345600000).toISOString(), read: true, icon: '🏆' },
];

const defaultPreferences: NotificationPreferences = {
  emailEnabled: {
    enrollments: true,
    completions: true,
    assessments: true,
    community: true,
    system: true,
    cohorts: true,
  },
  pushEnabled: {
    enrollments: true,
    completions: true,
    assessments: false,
    community: true,
    system: true,
    cohorts: true,
  },
  digestFrequency: 'realtime',
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial State - null defaults so app starts fresh unless persisted
      currentView: 'landing',
      appMode: 'marketing',
      sidebarOpen: true,
      sidebarCollapsed: false,
      selectedCourseId: null,
      selectedCheckoutItemId: null,
      currentUser: null,
      currentTenant: null,
      userRole: 'learner',
      theme: 'light',
      isLoading: false,
      activeModal: null,
      notifications: demoNotifications,
      showNotifications: false,
      notificationPreferences: defaultPreferences,

      // Actions
      setView: (view) => set({ currentView: view }),
      setSelectedCourseId: (id) => set({ selectedCourseId: id }),
      setSelectedCheckoutItemId: (id) => set({ selectedCheckoutItemId: id }),
      setAppMode: (mode) => set({ appMode: mode }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleSidebarCollapse: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCurrentUser: (user) => set({ currentUser: user }),
      setCurrentTenant: (tenant) => set({ currentTenant: tenant }),
      setUserRole: (role) => set({ userRole: role }),
      setTheme: (theme) => set({ theme }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setActiveModal: (modal) => set({ activeModal: modal }),
      
      enterAdminMode: () => set({ 
        appMode: 'admin', 
        currentView: 'admin-dashboard',
        sidebarOpen: true,
        userRole: 'tenant_admin',
      }),
      
      enterLearnerMode: () => set({ 
        appMode: 'learner', 
        currentView: 'learner-dashboard',
        sidebarOpen: true,
        userRole: 'learner',
      }),

      loginAsAdmin: (user) => set({
        appMode: 'admin',
        currentView: 'admin-dashboard',
        sidebarOpen: true,
        userRole: 'tenant_admin',
        currentUser: user,
      }),

      loginAsLearner: (user) => set({
        appMode: 'learner',
        currentView: 'learner-dashboard',
        sidebarOpen: true,
        userRole: 'learner',
        currentUser: user,
      }),

      logout: () => set({
        appMode: 'marketing',
        currentView: 'landing',
        sidebarOpen: false,
        currentUser: null,
        currentTenant: null,
        userRole: 'learner',
      }),
    
      goToLanding: () => set({ 
        appMode: 'marketing', 
        currentView: 'landing',
        sidebarOpen: false,
      }),

      toggleNotifications: () => set((s) => ({ showNotifications: !s.showNotifications })),
      markNotificationRead: (id) => set((s) => ({
        notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
      })),
      markAllNotificationsRead: () => set((s) => ({
        notifications: s.notifications.map(n => ({ ...n, read: true })),
      })),
      addNotification: (notification) => set((s) => ({
        notifications: [notification, ...s.notifications],
      })),
      deleteNotification: (id) => set((s) => ({
        notifications: s.notifications.filter(n => n.id !== id),
      })),
      deleteNotifications: (ids) => set((s) => ({
        notifications: s.notifications.filter(n => !ids.includes(n.id)),
      })),
      markNotificationsRead: (ids) => set((s) => ({
        notifications: s.notifications.map(n => ids.includes(n.id) ? { ...n, read: true } : n),
      })),
      updateNotificationPreferences: (prefs) => set((s) => ({
        notificationPreferences: { ...s.notificationPreferences, ...prefs },
      })),
    }),
    {
      name: 'nextgen-lms-store', // localStorage key
      partialize: (state) => ({
        currentUser: state.currentUser,
        currentTenant: state.currentTenant,
        userRole: state.userRole,
        appMode: state.appMode,
        currentView: state.currentView,
        theme: state.theme,
        notificationPreferences: state.notificationPreferences,
      }),
    }
  )
);
