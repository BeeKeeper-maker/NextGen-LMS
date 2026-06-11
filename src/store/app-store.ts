import { create } from 'zustand';
import type { AppView, AppMode, UserRole, User, Tenant, Notification } from '@/types';

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
  
  // UI State
  theme: 'light' | 'dark';
  isLoading: boolean;
  activeModal: string | null;
  notifications: Notification[];
  showNotifications: boolean;
  
  // Actions
  setView: (view: AppView) => void;
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
  goToLanding: () => void;
  toggleNotifications: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: Notification) => void;
}

const demoNotifications: Notification[] = [
  { id: 'notif-1', type: 'enrollment', title: 'New Enrollment', message: 'Mike Chen enrolled in Advanced React & Next.js Masterclass', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false, icon: '👤' },
  { id: 'notif-2', type: 'achievement', title: 'Achievement Unlocked!', message: 'Emma Rodriguez earned the "Course Graduate" achievement 🎓', timestamp: new Date(Date.now() - 7200000).toISOString(), read: false, icon: '🏆' },
  { id: 'notif-3', type: 'cohort', title: 'Live Session Starting', message: 'System Design live cohort starts in 30 minutes', timestamp: new Date(Date.now() - 1800000).toISOString(), read: false, icon: '🎥' },
  { id: 'notif-4', type: 'community', title: 'New Discussion', message: 'David Park asked: "Best practices for API authentication?"', timestamp: new Date(Date.now() - 14400000).toISOString(), read: true, icon: '💬' },
  { id: 'notif-5', type: 'assessment', title: 'Quiz Submitted', message: 'Lisa Wang submitted the AI Integration assessment (Score: 94%)', timestamp: new Date(Date.now() - 28800000).toISOString(), read: true, icon: '📝' },
  { id: 'notif-6', type: 'system', title: 'Platform Update', message: 'New feature: AI Content Generation is now available for all Professional plans', timestamp: new Date(Date.now() - 86400000).toISOString(), read: true, icon: '🚀' },
  { id: 'notif-7', type: 'completion', title: 'Course Completed', message: 'Jordan Lee completed "Data Visualization & Analytics"', timestamp: new Date(Date.now() - 43200000).toISOString(), read: true, icon: '🎓' },
];

export const useAppStore = create<AppState>((set) => ({
  // Initial State
  currentView: 'landing',
  appMode: 'marketing',
  sidebarOpen: true,
  sidebarCollapsed: false,
  currentUser: {
    id: 'demo-admin-1',
    tenantId: 'demo-tenant-1',
    email: 'admin@nextgen-lms.com',
    name: 'Sarah Mitchell',
    avatarUrl: '',
    role: 'tenant_admin',
    bio: 'Platform administrator and course creator',
    timezone: 'America/New_York',
    locale: 'en',
    streakDays: 14,
    totalPoints: 2850,
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: '2024-01-15T00:00:00Z',
  },
  currentTenant: {
    id: 'demo-tenant-1',
    name: 'NextGen Academy',
    slug: 'nextgen-academy',
    domain: 'academy.nextgen-lms.com',
    logoUrl: '/logo.svg',
    primaryColor: '#0F172A',
    secondaryColor: '#6366F1',
    accentColor: '#10B981',
    fontFamily: 'Inter',
    description: 'A next-generation learning platform for the modern creator economy',
    isActive: true,
    plan: 'enterprise',
    maxUsers: 10000,
    currency: 'USD',
    locale: 'en',
    createdAt: '2024-01-01T00:00:00Z',
  },
  userRole: 'tenant_admin',
  theme: 'light',
  isLoading: false,
  activeModal: null,
  notifications: demoNotifications,
  showNotifications: false,

  // Actions
  setView: (view) => set({ currentView: view }),
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
    currentUser: {
      id: 'demo-admin-1',
      tenantId: 'demo-tenant-1',
      email: 'admin@nextgen-lms.com',
      name: 'Sarah Mitchell',
      avatarUrl: '',
      role: 'tenant_admin',
      bio: 'Platform administrator and course creator',
      timezone: 'America/New_York',
      locale: 'en',
      streakDays: 14,
      totalPoints: 2850,
      isActive: true,
      lastLoginAt: new Date().toISOString(),
      createdAt: '2024-01-15T00:00:00Z',
    },
  }),
  
  enterLearnerMode: () => set({ 
    appMode: 'learner', 
    currentView: 'learner-dashboard',
    sidebarOpen: true,
    userRole: 'learner',
    currentUser: {
      id: 'demo-learner-1',
      tenantId: 'demo-tenant-1',
      email: 'learner@example.com',
      name: 'Alex Johnson',
      avatarUrl: '',
      role: 'learner',
      bio: 'Passionate lifelong learner',
      timezone: 'America/New_York',
      locale: 'en',
      streakDays: 7,
      totalPoints: 1250,
      isActive: true,
      lastLoginAt: new Date().toISOString(),
      createdAt: '2024-03-10T00:00:00Z',
    },
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
}));
