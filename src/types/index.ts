// ============================================================
// NextGen Global LMS - Core Type Definitions
// ============================================================

// Navigation & App State
export type AppView = 
  | 'landing' 
  | 'admin-dashboard' 
  | 'super-admin-dashboard'
  | 'admin-courses' 
  | 'admin-community'
  | 'admin-assessments'
  | 'admin-certificates'
  | 'admin-analytics'
  | 'admin-settings'
  | 'admin-live-cohorts'
  | 'admin-learning-paths'
  | 'learner-dashboard'
  | 'learner-course'
  | 'learner-community'
  | 'learner-achievements'
  | 'learner-live-cohorts'
  | 'learner-learning-paths'
  | 'learner-profile'
  | 'course-builder'
  | 'ai-assistant'
  | 'ai-content-gen'
  | 'notification-center'
  | 'checkout';

export type UserRole = 'super_admin' | 'tenant_admin' | 'instructor' | 'content_creator' | 'learner';

export type AppMode = 'marketing' | 'admin' | 'learner' | 'super-admin';

// Tenant & Organization
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  description?: string;
  isActive: boolean;
  plan: 'starter' | 'professional' | 'enterprise';
  maxUsers: number;
  currency: string;
  locale: string;
  createdAt: string;
}

// User & Authentication
export interface User {
  id: string;
  tenantId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: UserRole;
  bio?: string;
  timezone: string;
  locale: string;
  streakDays: number;
  totalPoints: number;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

// Course & Content
export interface Course {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  coverImageUrl?: string;
  category?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  language: string;
  durationHours?: number;
  price: number;
  compareAtPrice?: number;
  isPublished: boolean;
  isFeatured: boolean;
  enrollmentCount: number;
  avgRating: number;
  totalRatings: number;
  completionRate: number;
  certificateTemplateId?: string;
  modules?: Module[];
  createdAt: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  isPublished: boolean;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  videoDuration?: number;
  contentType: 'video' | 'text' | 'audio' | 'document' | 'live_session';
  orderIndex: number;
  isPreview: boolean;
  isPublished: boolean;
  resources?: string;
  progress?: LessonProgress;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercent: number;
  lastPosition?: number;
  timeSpent: number;
  completedAt?: string;
}

// Enrollment
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  tenantId: string;
  status: 'active' | 'completed' | 'suspended' | 'expired';
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  lastAccessedAt?: string;
  course?: Course;
}

// Assessment & Quiz
export interface Assessment {
  id: string;
  courseId: string;
  tenantId: string;
  title: string;
  description?: string;
  type: 'quiz' | 'assignment' | 'peer_review' | 'coding' | 'file_upload';
  passingScore: number;
  maxAttempts: number;
  timeLimit?: number;
  isPublished: boolean;
  shuffleQuestions: boolean;
  questions?: Question[];
}

export interface Question {
  id: string;
  assessmentId: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'long_answer' | 'file_upload' | 'coding';
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  points: number;
  orderIndex: number;
  poolGroup?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizSubmission {
  id: string;
  userId: string;
  assessmentId: string;
  tenantId: string;
  answers: Record<string, string | string[]>;
  score?: number;
  maxScore?: number;
  percentScore?: number;
  passed?: boolean;
  timeTaken?: number;
  feedback?: string;
  gradedAt?: string;
}

// Certificate
export interface Certificate {
  id: string;
  tenantId: string;
  name: string;
  template: string;
  backgroundUrl?: string;
  isActive: boolean;
}

export interface CertificateAward {
  id: string;
  userId: string;
  certificateId: string;
  tenantId: string;
  courseId?: string;
  verificationCode: string;
  issuedAt: string;
}

// Community
export interface CommunityCategory {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  orderIndex: number;
  isDefault: boolean;
}

export interface CommunityPost {
  id: string;
  tenantId: string;
  authorId: string;
  categoryId?: string;
  title: string;
  content: string;
  type: 'discussion' | 'question' | 'announcement' | 'resource';
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags?: string[];
  author?: User;
  category?: CommunityCategory;
  comments?: CommunityComment[];
  reactions?: CommunityReaction[];
  createdAt: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentId?: string;
  likeCount: number;
  author?: User;
  createdAt: string;
}

export interface CommunityReaction {
  id: string;
  postId: string;
  userId: string;
  type: 'like' | 'love' | 'celebrate' | 'insightful';
}

// Gamification
export interface Achievement {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  icon: string;
  type: 'streak' | 'completion' | 'score' | 'community' | 'milestone';
  criteria: string;
  points: number;
  isActive: boolean;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: string;
  achievement?: Achievement;
}

// E-Commerce
export interface Product {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: 'course' | 'bundle' | 'digital_download' | 'membership' | 'coaching';
  price: number;
  compareAtPrice?: number;
  currency: string;
  isActive: boolean;
  features?: string[];
  metadata?: Record<string, unknown>;
}

export interface Order {
  id: string;
  tenantId: string;
  userId?: string;
  productId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  paymentProvider?: string;
  paymentId?: string;
  createdAt: string;
}

// Analytics
export interface AnalyticsEvent {
  id: string;
  tenantId: string;
  userId?: string;
  eventType: string;
  eventData?: Record<string, unknown>;
  sessionId?: string;
  createdAt: string;
}

export interface DailyMetric {
  id: string;
  tenantId: string;
  date: string;
  activeUsers: number;
  newEnrollments: number;
  completions: number;
  revenue: number;
  quizAttempts: number;
  avgSessionDuration: number;
}

// Dashboard KPIs
export interface DashboardKPI {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: string;
}

// Pricing
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  ctaText: string;
}

// Competitor Comparison
export interface CompetitorComparison {
  feature: string;
  nextgen: string | boolean;
  kajabi: string | boolean;
  teachable: string | boolean;
  skool: string | boolean;
  mightyNetworks: string | boolean;
}

// Chat Message for AI Tutor
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// Notification
export interface Notification {
  id: string;
  type: 'enrollment' | 'completion' | 'achievement' | 'community' | 'system' | 'cohort' | 'assessment';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  icon?: string;
}

// Calendar / Live Cohort Event
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: 'live_session' | 'cohort_start' | 'cohort_end' | 'office_hours' | 'workshop' | 'webinar' | 'deadline';
  startDate: string;
  endDate: string;
  courseId?: string;
  instructorName?: string;
  meetingUrl?: string;
  color?: string;
  attendees?: number;
  maxAttendees?: number;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

// Checkout Session
export interface CheckoutItem {
  id: string;
  name: string;
  description?: string;
  type: 'course' | 'bundle' | 'membership' | 'coaching' | 'digital_download';
  price: number;
  originalPrice?: number;
  currency: string;
  features?: string[];
}

// Currency
export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  rate: number;
  flag: string;
}

// ─── Data Export / Import Types ─────────────────────────────────
export type ExportDataSource =
  | 'courses'
  | 'users_enrollments'
  | 'assessments'
  | 'analytics'
  | 'community'
  | 'certificates'
  | 'all';

export type ExportFormat = 'csv' | 'json' | 'xlsx';

export type ExportDateRange = '7d' | '30d' | '90d' | 'custom' | 'all';

export interface ExportColumn {
  key: string;
  label: string;
  selected: boolean;
}

export interface ExportConfig {
  source: ExportDataSource;
  format: ExportFormat;
  dateRange: ExportDateRange;
  customStartDate?: string;
  customEndDate?: string;
  columns: ExportColumn[];
}

export interface ExportSummary {
  rowCount: number;
  fileSizeEstimate: string;
  estimatedTime: string;
}

export interface ImportValidationResult {
  totalRows: number;
  validRows: number;
  errors: ImportValidationError[];
  warnings: ImportValidationWarning[];
}

export interface ImportValidationError {
  row: number;
  column: string;
  message: string;
}

export interface ImportValidationWarning {
  row: number;
  column: string;
  message: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  failed: number;
}

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  confirmed: boolean;
}
