// ============================================================
// NextGen Global LMS - Mock Data for Demonstration
// ============================================================

import type { Course, Enrollment, CommunityPost, Assessment, Achievement, PricingPlan, CompetitorComparison, DashboardKPI, DailyMetric, Product } from '@/types';

// Dashboard KPIs
export const adminKPIs: DashboardKPI[] = [
  { label: 'Monthly Recurring Revenue', value: '$47,832', change: 12.5, changeLabel: 'vs last month', icon: 'dollar-sign' },
  { label: 'Active Learners', value: '3,847', change: 8.3, changeLabel: 'vs last month', icon: 'users' },
  { label: 'Course Completion Rate', value: '72.4%', change: 4.1, changeLabel: 'vs last month', icon: 'graduation-cap' },
  { label: 'Avg. Quiz Score', value: '84.7%', change: -1.2, changeLabel: 'vs last month', icon: 'check-circle' },
  { label: 'Community Engagement', value: '89.3%', change: 6.7, changeLabel: 'vs last month', icon: 'message-circle' },
  { label: 'New Enrollments', value: '234', change: 15.8, changeLabel: 'vs last month', icon: 'user-plus' },
];

export const learnerKPIs: DashboardKPI[] = [
  { label: 'Courses Enrolled', value: '4', change: 1, changeLabel: 'new this month', icon: 'book-open' },
  { label: 'Courses Completed', value: '2', change: 1, changeLabel: 'this month', icon: 'graduation-cap' },
  { label: 'Learning Streak', value: '7 days', change: 2, changeLabel: 'days longer', icon: 'flame' },
  { label: 'Total Points', value: '1,250', change: 340, changeLabel: 'earned this week', icon: 'star' },
  { label: 'Certificates Earned', value: '2', change: 1, changeLabel: 'new', icon: 'award' },
  { label: 'Community Posts', value: '23', change: 5, changeLabel: 'this week', icon: 'message-circle' },
];

// Revenue Analytics (Monthly)
export const revenueData = [
  { month: 'Jan', revenue: 28400, enrollments: 145, completions: 89 },
  { month: 'Feb', revenue: 31200, enrollments: 167, completions: 102 },
  { month: 'Mar', revenue: 35800, enrollments: 189, completions: 118 },
  { month: 'Apr', revenue: 38500, enrollments: 201, completions: 134 },
  { month: 'May', revenue: 41200, enrollments: 218, completions: 147 },
  { month: 'Jun', revenue: 43800, enrollments: 234, completions: 158 },
  { month: 'Jul', revenue: 42100, enrollments: 226, completions: 151 },
  { month: 'Aug', revenue: 45600, enrollments: 248, completions: 169 },
  { month: 'Sep', revenue: 47832, enrollments: 261, completions: 178 },
];

// Engagement Analytics (Weekly)
export const engagementData = [
  { day: 'Mon', activeUsers: 1240, postsCreated: 45, quizzesTaken: 89 },
  { day: 'Tue', activeUsers: 1380, postsCreated: 52, quizzesTaken: 97 },
  { day: 'Wed', activeUsers: 1520, postsCreated: 61, quizzesTaken: 112 },
  { day: 'Thu', activeUsers: 1450, postsCreated: 58, quizzesTaken: 105 },
  { day: 'Fri', activeUsers: 1320, postsCreated: 48, quizzesTaken: 93 },
  { day: 'Sat', activeUsers: 890, postsCreated: 32, quizzesTaken: 67 },
  { day: 'Sun', activeUsers: 780, postsCreated: 28, quizzesTaken: 58 },
];

// Course Completion Funnel
export const completionFunnelData = [
  { stage: 'Enrolled', count: 3847, percentage: 100 },
  { stage: 'Started', count: 3215, percentage: 83.6 },
  { stage: '50% Complete', count: 2489, percentage: 64.7 },
  { stage: '75% Complete', count: 1934, percentage: 50.3 },
  { stage: 'Completed', count: 1528, percentage: 39.7 },
  { stage: 'Certified', count: 1284, percentage: 33.4 },
];

// Category Distribution
export const categoryData = [
  { name: 'Web Development', value: 845, color: '#6366F1' },
  { name: 'Data Science', value: 623, color: '#10B981' },
  { name: 'Design', value: 512, color: '#F59E0B' },
  { name: 'Business', value: 489, color: '#EF4444' },
  { name: 'Marketing', value: 378, color: '#8B5CF6' },
  { name: 'AI & ML', value: 678, color: '#06B6D4' },
];

// Daily Metrics
export const dailyMetrics: DailyMetric[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    id: `metric-${i}`,
    tenantId: 'demo-tenant-1',
    date: date.toISOString().split('T')[0],
    activeUsers: Math.floor(800 + Math.random() * 600),
    newEnrollments: Math.floor(5 + Math.random() * 20),
    completions: Math.floor(3 + Math.random() * 15),
    revenue: Math.floor(1200 + Math.random() * 800),
    quizAttempts: Math.floor(20 + Math.random() * 50),
    avgSessionDuration: Math.floor(15 + Math.random() * 30),
  };
});

// Demo Courses
export const demoCourses: Course[] = [
  {
    id: 'course-1',
    tenantId: 'demo-tenant-1',
    title: 'Advanced React & Next.js Masterclass',
    slug: 'advanced-react-nextjs',
    description: 'Master modern React patterns, Server Components, and Next.js 16 App Router. Build production-grade applications with TypeScript, Prisma, and advanced state management.',
    thumbnailUrl: '',
    category: 'Web Development',
    level: 'advanced',
    language: 'en',
    durationHours: 42,
    price: 197,
    compareAtPrice: 297,
    isPublished: true,
    isFeatured: true,
    enrollmentCount: 847,
    avgRating: 4.8,
    totalRatings: 312,
    completionRate: 78,
    modules: [
      {
        id: 'mod-1-1', courseId: 'course-1', title: 'Foundations of Modern React', orderIndex: 0, isPublished: true,
        lessons: [
          { id: 'les-1-1-1', moduleId: 'mod-1-1', title: 'React 19 New Features Deep Dive', slug: 'react-19-features', contentType: 'video', orderIndex: 0, isPreview: true, isPublished: true, videoDuration: 2840 },
          { id: 'les-1-1-2', moduleId: 'mod-1-1', title: 'Server Components Architecture', slug: 'server-components', contentType: 'video', orderIndex: 1, isPreview: false, isPublished: true, videoDuration: 3120 },
          { id: 'les-1-1-3', moduleId: 'mod-1-1', title: 'TypeScript Advanced Patterns', slug: 'ts-advanced', contentType: 'video', orderIndex: 2, isPreview: false, isPublished: true, videoDuration: 2560 },
        ],
      },
      {
        id: 'mod-1-2', courseId: 'course-1', title: 'Next.js 16 App Router Mastery', orderIndex: 1, isPublished: true,
        lessons: [
          { id: 'les-1-2-1', moduleId: 'mod-1-2', title: 'App Router Architecture', slug: 'app-router', contentType: 'video', orderIndex: 0, isPreview: false, isPublished: true, videoDuration: 3450 },
          { id: 'les-1-2-2', moduleId: 'mod-1-2', title: 'Server Actions & Data Mutation', slug: 'server-actions', contentType: 'video', orderIndex: 1, isPreview: false, isPublished: true, videoDuration: 2780 },
        ],
      },
    ],
    createdAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'course-2',
    tenantId: 'demo-tenant-1',
    title: 'AI-Powered Full Stack Development',
    slug: 'ai-fullstack-dev',
    description: 'Learn to build intelligent applications using AI APIs, vector databases, and modern full-stack architecture. From LLM integration to autonomous agents.',
    thumbnailUrl: '',
    category: 'AI & ML',
    level: 'intermediate',
    language: 'en',
    durationHours: 36,
    price: 149,
    compareAtPrice: 249,
    isPublished: true,
    isFeatured: true,
    enrollmentCount: 623,
    avgRating: 4.9,
    totalRatings: 198,
    completionRate: 82,
    modules: [
      {
        id: 'mod-2-1', courseId: 'course-2', title: 'AI Fundamentals for Developers', orderIndex: 0, isPublished: true,
        lessons: [
          { id: 'les-2-1-1', moduleId: 'mod-2-1', title: 'Understanding LLMs & Embeddings', slug: 'llms-embeddings', contentType: 'video', orderIndex: 0, isPreview: true, isPublished: true, videoDuration: 3200 },
          { id: 'les-2-1-2', moduleId: 'mod-2-1', title: 'Prompt Engineering Mastery', slug: 'prompt-engineering', contentType: 'video', orderIndex: 1, isPreview: false, isPublished: true, videoDuration: 2890 },
        ],
      },
    ],
    createdAt: '2024-07-15T00:00:00Z',
  },
  {
    id: 'course-3',
    tenantId: 'demo-tenant-1',
    title: 'System Design for Senior Engineers',
    slug: 'system-design-senior',
    description: 'Master distributed systems, microservices architecture, and scalability patterns. Prepare for FAANG-level system design interviews.',
    thumbnailUrl: '',
    category: 'Web Development',
    level: 'expert',
    language: 'en',
    durationHours: 28,
    price: 249,
    isPublished: true,
    isFeatured: false,
    enrollmentCount: 412,
    avgRating: 4.7,
    totalRatings: 156,
    completionRate: 65,
    modules: [],
    createdAt: '2024-08-01T00:00:00Z',
  },
  {
    id: 'course-4',
    tenantId: 'demo-tenant-1',
    title: 'Data Visualization & Analytics',
    slug: 'data-viz-analytics',
    description: 'Create stunning data visualizations using D3.js, Recharts, and modern analytics dashboards. Transform raw data into actionable insights.',
    thumbnailUrl: '',
    category: 'Data Science',
    level: 'intermediate',
    language: 'en',
    durationHours: 22,
    price: 129,
    isPublished: true,
    isFeatured: true,
    enrollmentCount: 389,
    avgRating: 4.6,
    totalRatings: 142,
    completionRate: 71,
    modules: [],
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'course-5',
    tenantId: 'demo-tenant-1',
    title: 'UX/UI Design Principles',
    slug: 'ux-ui-design',
    description: 'Learn user-centered design thinking, Figma workflows, and create production-ready design systems for modern web applications.',
    thumbnailUrl: '',
    category: 'Design',
    level: 'beginner',
    language: 'en',
    durationHours: 18,
    price: 99,
    compareAtPrice: 149,
    isPublished: true,
    isFeatured: false,
    enrollmentCount: 567,
    avgRating: 4.5,
    totalRatings: 203,
    completionRate: 74,
    modules: [],
    createdAt: '2024-05-01T00:00:00Z',
  },
  {
    id: 'course-6',
    tenantId: 'demo-tenant-1',
    title: 'DevOps & Cloud Architecture',
    slug: 'devops-cloud',
    description: 'Master CI/CD pipelines, Kubernetes, Docker, and cloud-native architecture on AWS/GCP. Deploy and scale applications globally.',
    thumbnailUrl: '',
    category: 'Web Development',
    level: 'advanced',
    language: 'en',
    durationHours: 32,
    price: 179,
    isPublished: true,
    isFeatured: false,
    enrollmentCount: 298,
    avgRating: 4.8,
    totalRatings: 89,
    completionRate: 69,
    modules: [],
    createdAt: '2024-10-01T00:00:00Z',
  },
];

// Demo Enrollments (for learner view)
export const demoEnrollments: Enrollment[] = [
  {
    id: 'enr-1', userId: 'demo-learner-1', courseId: 'course-1', tenantId: 'demo-tenant-1',
    status: 'active', progress: 68, enrolledAt: '2024-08-15T00:00:00Z',
    lastAccessedAt: new Date().toISOString(),
    course: demoCourses[0],
  },
  {
    id: 'enr-2', userId: 'demo-learner-1', courseId: 'course-2', tenantId: 'demo-tenant-1',
    status: 'active', progress: 42, enrolledAt: '2024-09-01T00:00:00Z',
    lastAccessedAt: new Date(Date.now() - 86400000).toISOString(),
    course: demoCourses[1],
  },
  {
    id: 'enr-3', userId: 'demo-learner-1', courseId: 'course-4', tenantId: 'demo-tenant-1',
    status: 'completed', progress: 100, enrolledAt: '2024-06-01T00:00:00Z',
    completedAt: '2024-08-20T00:00:00Z',
    course: demoCourses[3],
  },
  {
    id: 'enr-4', userId: 'demo-learner-1', courseId: 'course-5', tenantId: 'demo-tenant-1',
    status: 'active', progress: 15, enrolledAt: '2024-10-10T00:00:00Z',
    lastAccessedAt: new Date(Date.now() - 172800000).toISOString(),
    course: demoCourses[4],
  },
];

// Community Posts
export const demoCommunityPosts: CommunityPost[] = [
  {
    id: 'post-1', tenantId: 'demo-tenant-1', authorId: 'user-1', categoryId: 'cat-1',
    title: 'How do you handle state management in large Next.js apps?',
    content: 'I\'ve been working on a large-scale Next.js application and struggling with state management. Context API gets messy, and Redux feels like overkill. What patterns are you all using? I\'m particularly interested in how you manage server state vs client state.',
    type: 'question', isPinned: true, isLocked: false, viewCount: 234, likeCount: 18, commentCount: 12,
    tags: ['nextjs', 'react', 'state-management'],
    author: { id: 'user-1', tenantId: 'demo-tenant-1', email: 'mike@example.com', name: 'Mike Chen', role: 'learner', timezone: 'UTC', locale: 'en', streakDays: 5, totalPoints: 890, isActive: true, createdAt: '2024-01-01T00:00:00Z' },
    createdAt: '2024-10-14T10:30:00Z',
  },
  {
    id: 'post-2', tenantId: 'demo-tenant-1', authorId: 'user-2', categoryId: 'cat-2',
    title: '🎉 Just completed the AI Full Stack course!',
    content: 'After 6 weeks of dedicated study, I finally completed the AI-Powered Full Stack Development course! The section on building autonomous agents was mind-blowing. Already applying these concepts at work and my team is impressed.',
    type: 'discussion', isPinned: false, isLocked: false, viewCount: 189, likeCount: 32, commentCount: 8,
    tags: ['achievement', 'ai', 'fullstack'],
    author: { id: 'user-2', tenantId: 'demo-tenant-1', email: 'emma@example.com', name: 'Emma Rodriguez', role: 'learner', timezone: 'UTC', locale: 'en', streakDays: 21, totalPoints: 2100, isActive: true, createdAt: '2024-02-01T00:00:00Z' },
    createdAt: '2024-10-13T15:45:00Z',
  },
  {
    id: 'post-3', tenantId: 'demo-tenant-1', authorId: 'user-3', categoryId: 'cat-1',
    title: 'Best practices for API route authentication in Next.js 16',
    content: 'With the new App Router patterns in Next.js 16, I\'m rethinking how I handle API authentication. Middleware vs route handlers? JWT vs session cookies? Would love to hear what\'s working for production apps.',
    type: 'question', isPinned: false, isLocked: false, viewCount: 156, likeCount: 14, commentCount: 9,
    tags: ['nextjs', 'authentication', 'security'],
    author: { id: 'user-3', tenantId: 'demo-tenant-1', email: 'david@example.com', name: 'David Park', role: 'instructor', timezone: 'UTC', locale: 'en', streakDays: 30, totalPoints: 3400, isActive: true, createdAt: '2024-01-01T00:00:00Z' },
    createdAt: '2024-10-12T09:20:00Z',
  },
  {
    id: 'post-4', tenantId: 'demo-tenant-1', authorId: 'user-4', categoryId: 'cat-3',
    title: '📢 New Live Cohort: System Design starting next week',
    content: 'Excited to announce a new live cohort for the System Design course! We\'ll meet every Tuesday and Thursday at 6 PM EST. Limited to 25 students for maximum interaction. Sign up through the course page!',
    type: 'announcement', isPinned: true, isLocked: true, viewCount: 412, likeCount: 45, commentCount: 15,
    tags: ['live-session', 'system-design', 'cohort'],
    author: { id: 'user-4', tenantId: 'demo-tenant-1', email: 'sarah@nextgen-lms.com', name: 'Sarah Mitchell', role: 'tenant_admin', timezone: 'UTC', locale: 'en', streakDays: 14, totalPoints: 2850, isActive: true, createdAt: '2024-01-01T00:00:00Z' },
    createdAt: '2024-10-11T14:00:00Z',
  },
  {
    id: 'post-5', tenantId: 'demo-tenant-1', authorId: 'user-5', categoryId: 'cat-2',
    title: 'Resource: Free Figma design system template for LMS platforms',
    content: 'I created a comprehensive Figma design system specifically for LMS platforms and wanted to share it with the community. It includes course cards, dashboard layouts, community components, and more. Link in comments!',
    type: 'resource', isPinned: false, isLocked: false, viewCount: 298, likeCount: 56, commentCount: 21,
    tags: ['figma', 'design-system', 'resource'],
    author: { id: 'user-5', tenantId: 'demo-tenant-1', email: 'lisa@example.com', name: 'Lisa Wang', role: 'content_creator', timezone: 'UTC', locale: 'en', streakDays: 12, totalPoints: 1560, isActive: true, createdAt: '2024-03-01T00:00:00Z' },
    createdAt: '2024-10-10T11:30:00Z',
  },
];

// Assessments
export const demoAssessments: Assessment[] = [
  {
    id: 'assess-1', courseId: 'course-1', tenantId: 'demo-tenant-1',
    title: 'React & Next.js Fundamentals Quiz',
    description: 'Test your knowledge of React 19 features and Next.js App Router architecture.',
    type: 'quiz', passingScore: 70, maxAttempts: 3, timeLimit: 30,
    isPublished: true, shuffleQuestions: true,
    questions: [
      {
        id: 'q-1', assessmentId: 'assess-1', type: 'multiple_choice',
        question: 'What is the primary benefit of React Server Components?',
        options: ['Faster client-side rendering', 'Reduced JavaScript bundle size sent to the client', 'Better CSS encapsulation', 'Easier state management'],
        correctAnswer: '1', explanation: 'Server Components allow rendering on the server, reducing the JavaScript bundle sent to the client.',
        points: 2, orderIndex: 0, difficulty: 'medium',
      },
      {
        id: 'q-2', assessmentId: 'assess-1', type: 'multiple_choice',
        question: 'In Next.js 16, which file convention is used to define a server action?',
        options: ['action.ts', 'server.ts', 'No specific convention needed - use "use server" directive', 'api/route.ts'],
        correctAnswer: '2', explanation: 'Server actions use the "use server" directive at the top of the function or file.',
        points: 2, orderIndex: 1, difficulty: 'easy',
      },
      {
        id: 'q-3', assessmentId: 'assess-1', type: 'true_false',
        question: 'Client Components in Next.js can directly import Server Components.',
        options: ['True', 'False'],
        correctAnswer: '1', explanation: 'Client Components cannot directly import Server Components. They can only receive them as props (children).',
        points: 1, orderIndex: 2, difficulty: 'medium',
      },
      {
        id: 'q-4', assessmentId: 'assess-1', type: 'short_answer',
        question: 'What hook is used to manage form state in React 19?',
        correctAnswer: 'useActionState',
        explanation: 'useActionState (formerly useFormState) is the React 19 hook for managing form state with server actions.',
        points: 3, orderIndex: 3, difficulty: 'hard',
      },
    ],
  },
  {
    id: 'assess-2', courseId: 'course-2', tenantId: 'demo-tenant-1',
    title: 'AI Integration Practical Assessment',
    description: 'Demonstrate your ability to integrate AI APIs into a full-stack application.',
    type: 'coding', passingScore: 60, maxAttempts: 2, timeLimit: 120,
    isPublished: true, shuffleQuestions: false,
    questions: [],
  },
  {
    id: 'assess-3', courseId: 'course-1', tenantId: 'demo-tenant-1',
    title: 'System Design Capstone Project',
    description: 'Design and document a scalable architecture for a real-time collaborative application.',
    type: 'peer_review', passingScore: 75, maxAttempts: 1,
    isPublished: true, shuffleQuestions: false,
    questions: [],
  },
];

// Achievements
export const demoAchievements: Achievement[] = [
  { id: 'ach-1', tenantId: 'demo-tenant-1', name: 'First Steps', description: 'Complete your first lesson', icon: '🎯', type: 'completion', criteria: '{"type":"lesson_complete","count":1}', points: 10, isActive: true },
  { id: 'ach-2', tenantId: 'demo-tenant-1', name: 'Knowledge Seeker', description: 'Complete 10 lessons', icon: '📚', type: 'completion', criteria: '{"type":"lesson_complete","count":10}', points: 50, isActive: true },
  { id: 'ach-3', tenantId: 'demo-tenant-1', name: 'Streak Starter', description: 'Maintain a 3-day learning streak', icon: '🔥', type: 'streak', criteria: '{"type":"streak","days":3}', points: 25, isActive: true },
  { id: 'ach-4', tenantId: 'demo-tenant-1', name: 'Streak Master', description: 'Maintain a 7-day learning streak', icon: '⚡', type: 'streak', criteria: '{"type":"streak","days":7}', points: 100, isActive: true },
  { id: 'ach-5', tenantId: 'demo-tenant-1', name: 'Quiz Ace', description: 'Score 100% on any quiz', icon: '💯', type: 'score', criteria: '{"type":"perfect_quiz","count":1}', points: 75, isActive: true },
  { id: 'ach-6', tenantId: 'demo-tenant-1', name: 'Community Builder', description: 'Create 5 discussion posts', icon: '🤝', type: 'community', criteria: '{"type":"posts","count":5}', points: 30, isActive: true },
  { id: 'ach-7', tenantId: 'demo-tenant-1', name: 'Course Graduate', description: 'Complete an entire course', icon: '🎓', type: 'completion', criteria: '{"type":"course_complete","count":1}', points: 150, isActive: true },
  { id: 'ach-8', tenantId: 'demo-tenant-1', name: 'Certified Expert', description: 'Earn 3 certificates', icon: '🏆', type: 'milestone', criteria: '{"type":"certificates","count":3}', points: 200, isActive: true },
];

// Pricing Plans
export const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    currency: 'USD',
    period: '/month',
    description: 'Perfect for individual creators just getting started',
    features: [
      'Up to 3 courses',
      'Up to 500 students',
      'Basic community features',
      'Email support',
      'Standard certificates',
      '1 admin user',
    ],
    highlighted: false,
    ctaText: 'Start Free Trial',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 97,
    currency: 'USD',
    period: '/month',
    description: 'For growing creators and small businesses',
    features: [
      'Unlimited courses',
      'Up to 5,000 students',
      'Advanced community & live cohorts',
      'AI content generation',
      'AI tutoring assistant',
      'Custom certificates & branding',
      '0% transaction fees',
      'Priority support',
      '5 admin/team users',
      'Advanced analytics',
    ],
    highlighted: true,
    ctaText: 'Start Free Trial',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 249,
    currency: 'USD',
    period: '/month',
    description: 'For organizations requiring full control and scale',
    features: [
      'Everything in Professional',
      'Unlimited students',
      'SSO / SAML authentication',
      'Custom domain & full white-label',
      'API access & webhooks',
      'CRM integrations (Salesforce, HubSpot)',
      'Dedicated account manager',
      'SLA guarantee (99.99%)',
      'Unlimited team users',
      'Audit logs & compliance reports',
    ],
    highlighted: false,
    ctaText: 'Contact Sales',
  },
];

// Competitor Comparison
export const competitorComparison: CompetitorComparison[] = [
  { feature: 'Transaction Fees', nextgen: '0% on all plans', kajabi: '0%', teachable: 'Up to 10%', skool: '10% on Hobby', mightyNetworks: 'Up to 3%' },
  { feature: 'AI Content Generation', nextgen: true, kajabi: false, teachable: false, skool: false, mightyNetworks: false },
  { feature: 'AI Tutoring Assistant', nextgen: true, kajabi: false, teachable: false, skool: false, mightyNetworks: false },
  { feature: 'Native Community', nextgen: true, kajabi: true, teachable: false, skool: true, mightyNetworks: true },
  { feature: 'Assessment Engine', nextgen: true, kajabi: false, teachable: true, skool: false, mightyNetworks: false },
  { feature: 'Auto Certificates', nextgen: true, kajabi: false, teachable: true, skool: false, mightyNetworks: true },
  { feature: 'Multi-Currency', nextgen: true, kajabi: false, teachable: false, skool: false, mightyNetworks: false },
  { feature: 'White-Label Branding', nextgen: true, kajabi: 'Limited', teachable: false, skool: false, mightyNetworks: 'Partial' },
  { feature: 'Live Cohorts', nextgen: true, kajabi: true, teachable: false, skool: false, mightyNetworks: true },
  { feature: 'SSO / SAML', nextgen: true, kajabi: false, teachable: false, skool: false, mightyNetworks: false },
  { feature: 'Intrinsic Gamification', nextgen: true, kajabi: false, teachable: false, skool: 'Toxic mechanics', mightyNetworks: false },
  { feature: 'Entry Price', nextgen: '$49/mo', kajabi: '$149/mo', teachable: '$39/mo + fees', skool: '$99/mo', mightyNetworks: '$39/mo' },
];

// Products
export const demoProducts: Product[] = [
  { id: 'prod-1', tenantId: 'demo-tenant-1', name: 'React Masterclass Bundle', type: 'bundle', price: 297, compareAtPrice: 494, currency: 'USD', isActive: true, features: ['Advanced React & Next.js Masterclass', 'AI-Powered Full Stack Development', 'System Design for Senior Engineers', 'Lifetime access & updates', 'Community access included'] },
  { id: 'prod-2', tenantId: 'demo-tenant-1', name: 'Annual Membership', type: 'membership', price: 799, compareAtPrice: 1164, currency: 'USD', isActive: true, features: ['Access to ALL courses', 'Monthly live cohorts', 'Private community', 'Priority AI tutoring', 'Certificate for every course', 'Cancel anytime'] },
  { id: 'prod-3', tenantId: 'demo-tenant-1', name: '1-on-1 Coaching Session', type: 'coaching', price: 149, currency: 'USD', isActive: true, features: ['60-minute session', 'Code review & feedback', 'Career guidance', 'Custom learning path'] },
];

// Video drop-off heatmap data
export const videoDropoffData = [
  { segment: '0-10%', dropoff: 2 },
  { segment: '10-20%', dropoff: 3 },
  { segment: '20-30%', dropoff: 5 },
  { segment: '30-40%', dropoff: 4 },
  { segment: '40-50%', dropoff: 8 },
  { segment: '50-60%', dropoff: 12 },
  { segment: '60-70%', dropoff: 15 },
  { segment: '70-80%', dropoff: 10 },
  { segment: '80-90%', dropoff: 7 },
  { segment: '90-100%', dropoff: 4 },
];

// Leaderboard data
export const leaderboardData = [
  { rank: 1, name: 'Emma Rodriguez', points: 4250, streak: 30, coursesCompleted: 8, avatar: '' },
  { rank: 2, name: 'David Park', points: 3800, streak: 28, coursesCompleted: 7, avatar: '' },
  { rank: 3, name: 'Sarah Mitchell', points: 3420, streak: 21, coursesCompleted: 6, avatar: '' },
  { rank: 4, name: 'Lisa Wang', points: 2890, streak: 18, coursesCompleted: 5, avatar: '' },
  { rank: 5, name: 'Alex Johnson', points: 2500, streak: 14, coursesCompleted: 4, avatar: '' },
  { rank: 6, name: 'Mike Chen', points: 2100, streak: 12, coursesCompleted: 3, avatar: '' },
  { rank: 7, name: 'Jordan Lee', points: 1850, streak: 9, coursesCompleted: 3, avatar: '' },
  { rank: 8, name: 'Priya Sharma', points: 1620, streak: 7, coursesCompleted: 2, avatar: '' },
  { rank: 9, name: 'Tom Wilson', points: 1340, streak: 5, coursesCompleted: 2, avatar: '' },
  { rank: 10, name: 'Nina Kovac', points: 1100, streak: 3, coursesCompleted: 1, avatar: '' },
];

// ─── Course Review Data ────────────────────────────────────
export interface CourseReview {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpfulCount: number;
  isHelpful: boolean;
  courseProgress: number;
  isVerifiedPurchase: boolean;
  tags: string[];
  status: 'published' | 'flagged' | 'hidden';
  instructorReply?: {
    instructorName: string;
    content: string;
    date: string;
  };
  isOwnReview?: boolean;
}

export const reviewTags = [
  'Great Content',
  'Well Structured',
  'Practical',
  'Beginner Friendly',
  'Advanced',
  'Life Changing',
] as const;

export const courseReviews: CourseReview[] = [
  {
    id: 'rev-1', courseId: 'course-1', userId: 'user-2', userName: 'Emma Rodriguez', userAvatar: 'ER',
    rating: 5, title: 'Absolutely Incredible Course!', content: 'This course completely transformed how I think about React architecture. The Server Components section alone was worth the investment. Sarah explains complex concepts in such a clear and engaging way that even advanced topics feel approachable. The hands-on projects really solidify the learning and I found myself immediately applying these patterns at work.',
    date: '2024-10-14T10:30:00Z', helpfulCount: 24, isHelpful: false, courseProgress: 100, isVerifiedPurchase: true,
    tags: ['Great Content', 'Life Changing', 'Well Structured'], status: 'published',
    instructorReply: { instructorName: 'Sarah Mitchell', content: 'Thank you so much, Emma! It means the world to me that the course had such a positive impact. Your final project was outstanding!', date: '2024-10-15T08:00:00Z' },
  },
  {
    id: 'rev-2', courseId: 'course-1', userId: 'user-1', userName: 'Mike Chen', userAvatar: 'MC',
    rating: 5, title: 'Best React Course I\'ve Ever Taken', content: 'I\'ve taken multiple React courses over the years, and this one stands head and shoulders above the rest. The instructor explains complex concepts in a way that\'s easy to follow. The hands-on projects really solidify the learning. The TypeScript integration section was particularly valuable for my daily work.',
    date: '2024-10-10T15:45:00Z', helpfulCount: 18, isHelpful: true, courseProgress: 85, isVerifiedPurchase: true,
    tags: ['Great Content', 'Practical'], status: 'published',
  },
  {
    id: 'rev-3', courseId: 'course-1', userId: 'user-6', userName: 'Priya Sharma', userAvatar: 'PS',
    rating: 4, title: 'Great Content, Minor Gaps in Testing', content: 'Great content overall. The TypeScript patterns section was excellent and I learned a lot about the App Router architecture. Would have liked more content on testing patterns and CI/CD integration, but still very much worth the investment for any serious React developer.',
    date: '2024-10-05T09:20:00Z', helpfulCount: 12, isHelpful: false, courseProgress: 72, isVerifiedPurchase: true,
    tags: ['Well Structured', 'Advanced'], status: 'published',
  },
  {
    id: 'rev-4', courseId: 'course-1', userId: 'user-7', userName: 'Alex Johnson', userAvatar: 'AJ',
    rating: 5, title: 'Game-Changer for My Career', content: 'This course is a game-changer. I went from struggling with React concepts to building production apps confidently. The community support is amazing too. Within a month of completing this course, I landed a senior frontend role. The patterns taught here are exactly what companies are looking for.',
    date: '2024-09-28T14:00:00Z', helpfulCount: 31, isHelpful: false, courseProgress: 100, isVerifiedPurchase: true,
    tags: ['Life Changing', 'Practical', 'Great Content'], status: 'published',
    instructorReply: { instructorName: 'Sarah Mitchell', content: 'Congratulations on the new role, Alex! That\'s exactly the kind of outcome I design the course for. Keep building amazing things!', date: '2024-09-29T10:00:00Z' },
  },
  {
    id: 'rev-5', courseId: 'course-1', userId: 'user-8', userName: 'Tom Wilson', userAvatar: 'TW',
    rating: 4, title: 'Comprehensive Deep Dive', content: 'Very comprehensive course. The App Router deep-dive was particularly helpful. Some sections could be a bit more beginner-friendly, but the depth is appreciated. The module on advanced patterns with TypeScript generics was eye-opening.',
    date: '2024-09-20T11:30:00Z', helpfulCount: 8, isHelpful: false, courseProgress: 60, isVerifiedPurchase: true,
    tags: ['Advanced', 'Well Structured'], status: 'published',
  },
  {
    id: 'rev-6', courseId: 'course-2', userId: 'user-1', userName: 'Mike Chen', userAvatar: 'MC',
    rating: 5, title: 'AI Development Made Accessible', content: 'This course demystified AI integration for me. The section on building autonomous agents was mind-blowing. Sarah breaks down complex concepts like vector databases and embeddings into digestible pieces. I\'ve already implemented RAG in my project at work!',
    date: '2024-10-12T16:00:00Z', helpfulCount: 22, isHelpful: true, courseProgress: 100, isVerifiedPurchase: true,
    tags: ['Life Changing', 'Practical', 'Great Content'], status: 'published',
    instructorReply: { instructorName: 'Sarah Mitchell', content: 'So glad you found the RAG implementation useful, Mike! Your project was one of the best in the cohort.', date: '2024-10-13T09:00:00Z' },
  },
  {
    id: 'rev-7', courseId: 'course-2', userId: 'user-3', userName: 'David Park', userAvatar: 'DP',
    rating: 5, title: 'Essential for Modern Full-Stack', content: 'As an instructor myself, I appreciate the pedagogical approach here. Every concept is introduced with practical examples. The LLM integration patterns are production-ready and the prompt engineering section saved me weeks of trial and error.',
    date: '2024-10-08T13:20:00Z', helpfulCount: 15, isHelpful: false, courseProgress: 90, isVerifiedPurchase: true,
    tags: ['Practical', 'Well Structured', 'Advanced'], status: 'published',
  },
  {
    id: 'rev-8', courseId: 'course-2', userId: 'user-9', userName: 'Jordan Lee', userAvatar: 'JL',
    rating: 4, title: 'Solid AI Foundation', content: 'Great course for getting started with AI integration. The prompt engineering module was excellent and the hands-on labs are well designed. I wish there was more coverage of fine-tuning and training custom models, but as an integration-focused course, it delivers.',
    date: '2024-10-01T10:45:00Z', helpfulCount: 9, isHelpful: false, courseProgress: 65, isVerifiedPurchase: true,
    tags: ['Great Content', 'Beginner Friendly'], status: 'published',
  },
  {
    id: 'rev-9', courseId: 'course-3', userId: 'user-7', userName: 'Alex Johnson', userAvatar: 'AJ',
    rating: 5, title: 'FAANG-Level Preparation', content: 'This course is exactly what you need for system design interviews. The distributed systems patterns are explained with real-world examples from companies like Netflix and Uber. I aced my system design round at a top tech company after taking this course.',
    date: '2024-10-11T08:30:00Z', helpfulCount: 28, isHelpful: true, courseProgress: 100, isVerifiedPurchase: true,
    tags: ['Life Changing', 'Advanced', 'Practical'], status: 'published',
  },
  {
    id: 'rev-10', courseId: 'course-3', userId: 'user-5', userName: 'Lisa Wang', userAvatar: 'LW',
    rating: 4, title: 'Thorough but Demanding', content: 'Very thorough coverage of system design concepts. The microservices architecture section was outstanding. Fair warning: this course is intense. You need solid engineering fundamentals before diving in. The case studies are excellent and directly applicable to real interviews.',
    date: '2024-09-25T17:15:00Z', helpfulCount: 14, isHelpful: false, courseProgress: 80, isVerifiedPurchase: true,
    tags: ['Advanced', 'Well Structured'], status: 'published',
  },
  {
    id: 'rev-11', courseId: 'course-4', userId: 'user-4', userName: 'Nina Kovac', userAvatar: 'NK',
    rating: 5, title: 'Beautiful Visualizations Made Easy', content: 'I never thought I could create such stunning data visualizations. The D3.js sections are incredibly well-structured, and the Recharts integration patterns saved me so much time. My analytics dashboards at work now look absolutely professional.',
    date: '2024-10-09T12:00:00Z', helpfulCount: 16, isHelpful: false, courseProgress: 100, isVerifiedPurchase: true,
    tags: ['Great Content', 'Practical', 'Well Structured'], status: 'published',
  },
  {
    id: 'rev-12', courseId: 'course-4', userId: 'user-8', userName: 'Tom Wilson', userAvatar: 'TW',
    rating: 4, title: 'Great for Dashboard Builders', content: 'Solid course for anyone building analytics dashboards. The real-world datasets make the exercises feel authentic. Would love to see more on real-time data streaming visualizations in a future update.',
    date: '2024-10-03T09:00:00Z', helpfulCount: 7, isHelpful: false, courseProgress: 55, isVerifiedPurchase: true,
    tags: ['Practical', 'Beginner Friendly'], status: 'published',
  },
  {
    id: 'rev-13', courseId: 'course-5', userId: 'user-9', userName: 'Jordan Lee', userAvatar: 'JL',
    rating: 5, title: 'Design Thinking Transformed', content: 'As a developer, I was skeptical about a design course. But this changed my perspective entirely. The Figma workflows are practical and the design system creation section has improved my frontend work dramatically. I now collaborate much better with our design team.',
    date: '2024-10-07T14:30:00Z', helpfulCount: 19, isHelpful: true, courseProgress: 100, isVerifiedPurchase: true,
    tags: ['Life Changing', 'Beginner Friendly', 'Practical'], status: 'published',
  },
  {
    id: 'rev-14', courseId: 'course-5', userId: 'user-6', userName: 'Priya Sharma', userAvatar: 'PS',
    rating: 4, title: 'Good Introduction to UX/UI', content: 'A well-structured introduction to UX/UI principles. The Figma tutorials are clear and the design system module is valuable. I would have liked more advanced interaction design patterns, but as a beginner course, it covers the essentials thoroughly.',
    date: '2024-09-30T16:45:00Z', helpfulCount: 10, isHelpful: false, courseProgress: 70, isVerifiedPurchase: true,
    tags: ['Beginner Friendly', 'Well Structured'], status: 'published',
  },
  {
    id: 'rev-15', courseId: 'course-6', userId: 'user-3', userName: 'David Park', userAvatar: 'DP',
    rating: 5, title: 'DevOps Mastery Achieved', content: 'The Kubernetes and Docker sections are incredibly detailed. The CI/CD pipeline examples are production-ready and I\'ve already implemented several patterns from this course. The cloud architecture module covers AWS and GCP equally well.',
    date: '2024-10-06T11:00:00Z', helpfulCount: 13, isHelpful: false, courseProgress: 88, isVerifiedPurchase: true,
    tags: ['Advanced', 'Practical', 'Great Content'], status: 'published',
  },
  {
    id: 'rev-16', courseId: 'course-1', userId: 'user-10', userName: 'Sam Taylor', userAvatar: 'ST',
    rating: 3, title: 'Good but Needs Updates', content: 'The core content is strong, but some sections feel outdated with the rapid pace of React changes. The Server Components section needs an update for the latest patterns. Still, the foundational knowledge is solid and worth the time investment.',
    date: '2024-09-15T08:00:00Z', helpfulCount: 5, isHelpful: false, courseProgress: 45, isVerifiedPurchase: true,
    tags: ['Well Structured'], status: 'published',
  },
  {
    id: 'rev-17', courseId: 'course-2', userId: 'user-10', userName: 'Sam Taylor', userAvatar: 'ST',
    rating: 2, title: 'Not Enough Depth on Fine-Tuning', content: 'The course covers AI integration basics well, but I was expecting more on fine-tuning and training custom models. The prompt engineering section is good but feels like it only scratches the surface. Would not recommend for experienced ML practitioners.',
    date: '2024-09-10T07:30:00Z', helpfulCount: 3, isHelpful: false, courseProgress: 30, isVerifiedPurchase: true,
    tags: ['Beginner Friendly'], status: 'published',
  },
  {
    id: 'rev-18', courseId: 'course-3', userId: 'user-11', userName: 'Chris Adams', userAvatar: 'CA',
    rating: 1, title: 'Too Theoretical', content: 'I was expecting hands-on system design exercises but found the course too theoretical. The concepts are explained well but without practical implementation, it\'s hard to internalize. Needs more interactive workshops.',
    date: '2024-08-20T19:00:00Z', helpfulCount: 2, isHelpful: false, courseProgress: 20, isVerifiedPurchase: false,
    tags: [], status: 'flagged',
  },
  {
    id: 'rev-19', courseId: 'course-1', userId: 'demo-learner-1', userName: 'You', userAvatar: 'YO',
    rating: 5, title: 'Excellent Learning Experience', content: 'I\'m still working through this course but I can already tell it\'s one of the best investments I\'ve made in my education. The progression from fundamentals to advanced patterns is perfectly paced. Each lesson builds on the last in a way that makes complex topics feel natural.',
    date: '2024-10-13T20:00:00Z', helpfulCount: 6, isHelpful: false, courseProgress: 68, isVerifiedPurchase: true,
    tags: ['Great Content', 'Well Structured'], status: 'published', isOwnReview: true,
  },
  {
    id: 'rev-20', courseId: 'course-6', userId: 'user-11', userName: 'Chris Adams', userAvatar: 'CA',
    rating: 4, title: 'Solid Cloud Architecture Guide', content: 'Comprehensive coverage of cloud-native patterns. The Kubernetes section is particularly strong with real-world deployment examples. The multi-cloud approach covering both AWS and GCP is a smart differentiator for this course.',
    date: '2024-09-18T13:00:00Z', helpfulCount: 8, isHelpful: false, courseProgress: 75, isVerifiedPurchase: true,
    tags: ['Practical', 'Advanced'], status: 'published',
  },
];

// Review rating distribution per course
export const reviewRatingDistribution: Record<string, { stars: number; count: number; percentage: number }[]> = {
  'course-1': [
    { stars: 5, count: 186, percentage: 59.6 },
    { stars: 4, count: 89, percentage: 28.5 },
    { stars: 3, count: 24, percentage: 7.7 },
    { stars: 2, count: 9, percentage: 2.9 },
    { stars: 1, count: 4, percentage: 1.3 },
  ],
  'course-2': [
    { stars: 5, count: 128, percentage: 64.6 },
    { stars: 4, count: 45, percentage: 22.7 },
    { stars: 3, count: 16, percentage: 8.1 },
    { stars: 2, count: 6, percentage: 3.0 },
    { stars: 1, count: 3, percentage: 1.5 },
  ],
  'course-3': [
    { stars: 5, count: 98, percentage: 62.8 },
    { stars: 4, count: 38, percentage: 24.4 },
    { stars: 3, count: 12, percentage: 7.7 },
    { stars: 2, count: 5, percentage: 3.2 },
    { stars: 1, count: 3, percentage: 1.9 },
  ],
  'course-4': [
    { stars: 5, count: 82, percentage: 57.7 },
    { stars: 4, count: 38, percentage: 26.8 },
    { stars: 3, count: 14, percentage: 9.9 },
    { stars: 2, count: 5, percentage: 3.5 },
    { stars: 1, count: 3, percentage: 2.1 },
  ],
  'course-5': [
    { stars: 5, count: 112, percentage: 55.2 },
    { stars: 4, count: 58, percentage: 28.6 },
    { stars: 3, count: 22, percentage: 10.8 },
    { stars: 2, count: 8, percentage: 3.9 },
    { stars: 1, count: 3, percentage: 1.5 },
  ],
  'course-6': [
    { stars: 5, count: 52, percentage: 58.4 },
    { stars: 4, count: 22, percentage: 24.7 },
    { stars: 3, count: 9, percentage: 10.1 },
    { stars: 2, count: 4, percentage: 4.5 },
    { stars: 1, count: 2, percentage: 2.2 },
  ],
};

// Currency options for checkout
export const supportedCurrencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1, flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92, flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79, flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 149.5, flag: '🇯🇵' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.36, flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.53, flag: '🇦🇺' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.1, flag: '🇮🇳' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rate: 4.97, flag: '🇧🇷' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', rate: 17.15, flag: '🇲🇽' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 1.34, flag: '🇸🇬' },
];

// Calendar events for Live Cohorts
export const demoCalendarEvents = [
  {
    id: 'evt-1',
    title: 'React & Next.js Live Q&A',
    description: 'Weekly live session for React course students. Bring your questions!',
    type: 'live_session' as const,
    startDate: new Date(Date.now() + 86400000 * 1 + 3600000 * 10).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 1 + 3600000 * 11.5).toISOString(),
    courseId: 'course-1',
    instructorName: 'Sarah Mitchell',
    meetingUrl: 'https://meet.nextgen-lms.com/react-qa',
    color: '#6366F1',
    attendees: 34,
    maxAttendees: 50,
  },
  {
    id: 'evt-2',
    title: 'System Design Cohort Kickoff',
    description: 'Orientation session for the new System Design cohort. Meet your peers and instructor.',
    type: 'cohort_start' as const,
    startDate: new Date(Date.now() + 86400000 * 3 + 3600000 * 18).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 3 + 3600000 * 19).toISOString(),
    courseId: 'course-3',
    instructorName: 'David Park',
    meetingUrl: 'https://meet.nextgen-lms.com/system-design',
    color: '#EF4444',
    attendees: 18,
    maxAttendees: 25,
  },
  {
    id: 'evt-3',
    title: 'AI Lab: Building with LLMs',
    description: 'Hands-on workshop: Build an AI-powered chatbot from scratch using modern APIs.',
    type: 'workshop' as const,
    startDate: new Date(Date.now() + 86400000 * 5 + 3600000 * 14).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 5 + 3600000 * 17).toISOString(),
    courseId: 'course-2',
    instructorName: 'Sarah Mitchell',
    meetingUrl: 'https://meet.nextgen-lms.com/ai-lab',
    color: '#10B981',
    attendees: 22,
    maxAttendees: 30,
  },
  {
    id: 'evt-4',
    title: 'Office Hours: Data Visualization',
    description: 'Drop-in office hours for Data Visualization students. Get help with your projects.',
    type: 'office_hours' as const,
    startDate: new Date(Date.now() + 86400000 * 2 + 3600000 * 15).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 2 + 3600000 * 16).toISOString(),
    courseId: 'course-4',
    instructorName: 'Lisa Wang',
    meetingUrl: 'https://meet.nextgen-lms.com/data-viz-office',
    color: '#F59E0B',
    attendees: 8,
    maxAttendees: 15,
  },
  {
    id: 'evt-5',
    title: 'Webinar: Future of AI in Education',
    description: 'Special guest panel discussing the impact of AI on learning and education technology.',
    type: 'webinar' as const,
    startDate: new Date(Date.now() + 86400000 * 7 + 3600000 * 12).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 7 + 3600000 * 13.5).toISOString(),
    color: '#8B5CF6',
    attendees: 156,
    maxAttendees: 500,
  },
  {
    id: 'evt-6',
    title: 'Assessment Deadline: React Quiz',
    description: 'Final deadline for the React & Next.js Fundamentals Quiz.',
    type: 'deadline' as const,
    startDate: new Date(Date.now() + 86400000 * 4 + 3600000 * 23).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 4 + 3600000 * 23.05).toISOString(),
    courseId: 'course-1',
    color: '#DC2626',
  },
  {
    id: 'evt-7',
    title: 'Cohort Wrap-Up: AI Full Stack',
    description: 'Final presentations and celebration for the AI Full Stack cohort.',
    type: 'cohort_end' as const,
    startDate: new Date(Date.now() + 86400000 * 10 + 3600000 * 17).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 10 + 3600000 * 19).toISOString(),
    courseId: 'course-2',
    instructorName: 'Sarah Mitchell',
    color: '#10B981',
    attendees: 20,
    maxAttendees: 25,
  },
  {
    id: 'evt-8',
    title: 'Design Critique Session',
    description: 'Live design review for UX/UI students. Share your work and get feedback.',
    type: 'live_session' as const,
    startDate: new Date(Date.now() + 86400000 * 6 + 3600000 * 16).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 6 + 3600000 * 17.5).toISOString(),
    courseId: 'course-5',
    instructorName: 'Lisa Wang',
    meetingUrl: 'https://meet.nextgen-lms.com/design-crit',
    color: '#EC4899',
    attendees: 12,
    maxAttendees: 20,
  },
];

// ============================================================
// BULK OPERATIONS MOCK DATA
// ============================================================

export interface BulkUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  coursesEnrolled: number;
  lastActive: string;
}

export const bulkUsers: BulkUser[] = [
  { id: 'bu-1', name: 'Mike Chen', email: 'mike.chen@example.com', role: 'learner', status: 'active', coursesEnrolled: 3, lastActive: '2 hours ago' },
  { id: 'bu-2', name: 'Emma Rodriguez', email: 'emma.r@example.com', role: 'learner', status: 'active', coursesEnrolled: 5, lastActive: '1 hour ago' },
  { id: 'bu-3', name: 'David Park', email: 'david.park@example.com', role: 'instructor', status: 'active', coursesEnrolled: 2, lastActive: '30 min ago' },
  { id: 'bu-4', name: 'Lisa Wang', email: 'lisa.wang@example.com', role: 'content_creator', status: 'active', coursesEnrolled: 4, lastActive: '3 hours ago' },
  { id: 'bu-5', name: 'Jordan Lee', email: 'jordan.lee@example.com', role: 'learner', status: 'active', coursesEnrolled: 2, lastActive: '5 hours ago' },
  { id: 'bu-6', name: 'Sophia Martinez', email: 'sophia.m@example.com', role: 'learner', status: 'active', coursesEnrolled: 6, lastActive: '15 min ago' },
  { id: 'bu-7', name: 'Alex Kim', email: 'alex.kim@example.com', role: 'learner', status: 'inactive', coursesEnrolled: 1, lastActive: '2 weeks ago' },
  { id: 'bu-8', name: 'Rachel Green', email: 'rachel.g@example.com', role: 'learner', status: 'active', coursesEnrolled: 3, lastActive: '4 hours ago' },
  { id: 'bu-9', name: 'Tom Wilson', email: 'tom.w@example.com', role: 'learner', status: 'active', coursesEnrolled: 2, lastActive: '1 day ago' },
  { id: 'bu-10', name: 'Priya Sharma', email: 'priya.s@example.com', role: 'instructor', status: 'active', coursesEnrolled: 1, lastActive: '6 hours ago' },
  { id: 'bu-11', name: 'James Johnson', email: 'james.j@example.com', role: 'learner', status: 'active', coursesEnrolled: 4, lastActive: '45 min ago' },
  { id: 'bu-12', name: 'Nina Patel', email: 'nina.p@example.com', role: 'learner', status: 'inactive', coursesEnrolled: 0, lastActive: '1 month ago' },
  { id: 'bu-13', name: 'Carlos Ruiz', email: 'carlos.r@example.com', role: 'learner', status: 'active', coursesEnrolled: 3, lastActive: '2 days ago' },
  { id: 'bu-14', name: 'Aisha Mohammed', email: 'aisha.m@example.com', role: 'learner', status: 'active', coursesEnrolled: 5, lastActive: '20 min ago' },
  { id: 'bu-15', name: 'Ben Taylor', email: 'ben.t@example.com', role: 'content_creator', status: 'active', coursesEnrolled: 2, lastActive: '8 hours ago' },
];

export interface BulkEmailRecord {
  id: string;
  subject: string;
  recipients: number;
  sentDate: string;
  openRate: number;
  clickRate: number;
  status: 'sent' | 'partial' | 'failed';
}

export const bulkEmailHistory: BulkEmailRecord[] = [
  { id: 'email-1', subject: 'Welcome to NextGen Academy!', recipients: 245, sentDate: '2024-10-14', openRate: 68.2, clickRate: 24.5, status: 'sent' },
  { id: 'email-2', subject: 'New Course Launch: DevOps & Cloud', recipients: 1890, sentDate: '2024-10-12', openRate: 52.1, clickRate: 18.3, status: 'sent' },
  { id: 'email-3', subject: 'Your Weekly Learning Summary', recipients: 3245, sentDate: '2024-10-10', openRate: 41.7, clickRate: 12.8, status: 'sent' },
  { id: 'email-4', subject: 'Course Completion Reminder', recipients: 156, sentDate: '2024-10-08', openRate: 59.3, clickRate: 31.2, status: 'partial' },
  { id: 'email-5', subject: 'Special Offer: 30% Off All Courses', recipients: 4120, sentDate: '2024-10-05', openRate: 73.4, clickRate: 28.9, status: 'sent' },
  { id: 'email-6', subject: 'Live Cohort Starting Tomorrow', recipients: 45, sentDate: '2024-10-03', openRate: 82.1, clickRate: 44.3, status: 'sent' },
];

export interface BulkCertificateRecord {
  id: string;
  userName: string;
  email: string;
  courseName: string;
  issuedDate: string;
  verificationCode: string;
  status: 'issued' | 'revoked' | 'pending';
}

export const bulkCertificateRecords: BulkCertificateRecord[] = [
  { id: 'cert-r-1', userName: 'Emma Rodriguez', email: 'emma.r@example.com', courseName: 'Advanced React & Next.js Masterclass', issuedDate: '2024-10-14', verificationCode: 'CERT-2024-001', status: 'issued' },
  { id: 'cert-r-2', userName: 'Jordan Lee', email: 'jordan.lee@example.com', courseName: 'Data Visualization & Analytics', issuedDate: '2024-10-13', verificationCode: 'CERT-2024-002', status: 'issued' },
  { id: 'cert-r-3', userName: 'Sophia Martinez', email: 'sophia.m@example.com', courseName: 'AI-Powered Full Stack Development', issuedDate: '2024-10-12', verificationCode: 'CERT-2024-003', status: 'issued' },
  { id: 'cert-r-4', userName: 'Rachel Green', email: 'rachel.g@example.com', courseName: 'UX/UI Design Principles', issuedDate: '2024-10-11', verificationCode: 'CERT-2024-004', status: 'revoked' },
  { id: 'cert-r-5', userName: 'James Johnson', email: 'james.j@example.com', courseName: 'System Design for Senior Engineers', issuedDate: '2024-10-10', verificationCode: 'CERT-2024-005', status: 'issued' },
  { id: 'cert-r-6', userName: 'Aisha Mohammed', email: 'aisha.m@example.com', courseName: 'Advanced React & Next.js Masterclass', issuedDate: '2024-10-09', verificationCode: 'CERT-2024-006', status: 'issued' },
  { id: 'cert-r-7', userName: 'Carlos Ruiz', email: 'carlos.r@example.com', courseName: 'DevOps & Cloud Architecture', issuedDate: '2024-10-08', verificationCode: 'CERT-2024-007', status: 'pending' },
  { id: 'cert-r-8', userName: 'Mike Chen', email: 'mike.chen@example.com', courseName: 'AI-Powered Full Stack Development', issuedDate: '2024-10-07', verificationCode: 'CERT-2024-008', status: 'issued' },
];
