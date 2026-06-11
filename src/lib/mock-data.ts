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

// Currency options for checkout
export const supportedCurrencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 149.5 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.36 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.53 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.1 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rate: 4.97 },
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
