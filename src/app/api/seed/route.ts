import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    // Hash passwords for demo users
    const adminPasswordHash = await bcrypt.hash('demo123', 12);
    const learnerPasswordHash = await bcrypt.hash('demo123', 12);

    // Create demo tenant
    const tenant = await db.tenant.upsert({
      where: { slug: 'nextgen-academy' },
      update: {},
      create: {
        name: 'NextGen Academy',
        slug: 'nextgen-academy',
        domain: 'academy.nextgen-lms.com',
        primaryColor: '#0F172A',
        secondaryColor: '#6366F1',
        accentColor: '#10B981',
        plan: 'enterprise',
        maxUsers: 10000,
        currency: 'USD',
      },
    });

    // Create admin user
    const admin = await db.user.upsert({
      where: { id: 'demo-admin-1' },
      update: {},
      create: {
        id: 'demo-admin-1',
        tenantId: tenant.id,
        email: 'admin@nextgen-lms.com',
        name: 'Sarah Mitchell',
        role: 'tenant_admin',
        timezone: 'America/New_York',
        streakDays: 14,
        totalPoints: 2850,
      },
    });

    // Create demo learner user
    const learner = await db.user.upsert({
      where: { id: 'demo-learner-1' },
      update: {},
      create: {
        id: 'demo-learner-1',
        tenantId: tenant.id,
        email: 'learner@example.com',
        name: 'Alex Johnson',
        role: 'learner',
        bio: 'Passionate lifelong learner',
        timezone: 'America/New_York',
        streakDays: 7,
        totalPoints: 1250,
      },
    });

    // Create or update Account entries for credentials auth
    // Store hashed password in access_token field for bcrypt verification
    await db.account.upsert({
      where: { provider_providerAccountId: { provider: 'credentials', providerAccountId: admin.id } },
      update: { access_token: adminPasswordHash },
      create: {
        userId: admin.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: admin.id,
        access_token: adminPasswordHash,
      },
    });

    await db.account.upsert({
      where: { provider_providerAccountId: { provider: 'credentials', providerAccountId: learner.id } },
      update: { access_token: learnerPasswordHash },
      create: {
        userId: learner.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: learner.id,
        access_token: learnerPasswordHash,
      },
    });

    // Create demo courses
    const courseData = [
      {
        title: 'Advanced React & Next.js Masterclass',
        slug: 'advanced-react-nextjs',
        description: 'Master modern React patterns, Server Components, and Next.js 16 App Router.',
        category: 'Web Development',
        level: 'advanced',
        durationHours: 42,
        price: 197,
        compareAtPrice: 297,
        isFeatured: true,
        enrollmentCount: 847,
        avgRating: 4.8,
        totalRatings: 312,
        completionRate: 78,
      },
      {
        title: 'AI-Powered Full Stack Development',
        slug: 'ai-fullstack-dev',
        description: 'Build intelligent applications using AI APIs, vector databases, and modern full-stack architecture.',
        category: 'AI & ML',
        level: 'intermediate',
        durationHours: 36,
        price: 149,
        compareAtPrice: 249,
        isFeatured: true,
        enrollmentCount: 623,
        avgRating: 4.9,
        totalRatings: 198,
        completionRate: 82,
      },
      {
        title: 'System Design for Senior Engineers',
        slug: 'system-design-senior',
        description: 'Master distributed systems, microservices architecture, and scalability patterns.',
        category: 'Web Development',
        level: 'expert',
        durationHours: 28,
        price: 249,
        enrollmentCount: 412,
        avgRating: 4.7,
        totalRatings: 156,
        completionRate: 65,
      },
      {
        title: 'Data Visualization & Analytics',
        slug: 'data-viz-analytics',
        description: 'Create stunning data visualizations and modern analytics dashboards.',
        category: 'Data Science',
        level: 'intermediate',
        durationHours: 22,
        price: 129,
        isFeatured: true,
        enrollmentCount: 389,
        avgRating: 4.6,
        totalRatings: 142,
        completionRate: 71,
      },
      {
        title: 'Python for Data Science',
        slug: 'python-data-science',
        description: 'Learn Python fundamentals for data analysis, machine learning, and scientific computing.',
        category: 'Data Science',
        level: 'beginner',
        durationHours: 30,
        price: 99,
        compareAtPrice: 149,
        isFeatured: false,
        enrollmentCount: 1056,
        avgRating: 4.5,
        totalRatings: 478,
        completionRate: 68,
      },
      {
        title: 'UX Design Fundamentals',
        slug: 'ux-design-fundamentals',
        description: 'Master user experience design principles, wireframing, prototyping, and usability testing.',
        category: 'Design',
        level: 'beginner',
        durationHours: 18,
        price: 79,
        compareAtPrice: 129,
        isFeatured: false,
        enrollmentCount: 567,
        avgRating: 4.4,
        totalRatings: 223,
        completionRate: 74,
      },
    ];

    const courses: { id: string }[] = [];
    for (const course of courseData) {
      const created = await db.course.upsert({
        where: { tenantId_slug: { tenantId: tenant.id, slug: course.slug } },
        update: {},
        create: {
          tenantId: tenant.id,
          ...course,
          isPublished: true,
        },
      });
      courses.push(created);
    }

    // Create modules and lessons for the first course
    if (courses[0]) {
      const module1 = await db.module.upsert({
        where: { id: 'mod-1-1' },
        update: {},
        create: {
          id: 'mod-1-1',
          courseId: courses[0].id,
          title: 'Getting Started with React 19',
          description: 'Introduction to React 19 and its new features',
          orderIndex: 0,
          isPublished: true,
        },
      });

      const module2 = await db.module.upsert({
        where: { id: 'mod-1-2' },
        update: {},
        create: {
          id: 'mod-1-2',
          courseId: courses[0].id,
          title: 'Server Components Deep Dive',
          description: 'Understanding React Server Components architecture',
          orderIndex: 1,
          isPublished: true,
        },
      });

      const lessons = [
        { id: 'lesson-1-1', moduleId: module1.id, title: 'Welcome to React 19', slug: 'welcome-react-19', contentType: 'video', orderIndex: 0, isPreview: true, isPublished: true },
        { id: 'lesson-1-2', moduleId: module1.id, title: 'Setting Up Your Environment', slug: 'setup-environment', contentType: 'video', orderIndex: 1, isPreview: true, isPublished: true },
        { id: 'lesson-1-3', moduleId: module1.id, title: 'JSX & Component Basics', slug: 'jsx-component-basics', contentType: 'video', orderIndex: 2, isPublished: true },
        { id: 'lesson-2-1', moduleId: module2.id, title: 'What Are Server Components?', slug: 'what-are-server-components', contentType: 'video', orderIndex: 0, isPublished: true },
        { id: 'lesson-2-2', moduleId: module2.id, title: 'Server vs Client Components', slug: 'server-vs-client-components', contentType: 'text', orderIndex: 1, isPublished: true },
      ];

      for (const lesson of lessons) {
        await db.lesson.upsert({
          where: { id: lesson.id },
          update: {},
          create: lesson,
        });
      }

      // Create lesson progress for learner
      const progressData = [
        { userId: learner.id, lessonId: 'lesson-1-1', status: 'completed', progressPercent: 100, timeSpent: 1200 },
        { userId: learner.id, lessonId: 'lesson-1-2', status: 'completed', progressPercent: 100, timeSpent: 1800 },
        { userId: learner.id, lessonId: 'lesson-1-3', status: 'in_progress', progressPercent: 45, timeSpent: 600, lastPosition: 320 },
        { userId: learner.id, lessonId: 'lesson-2-1', status: 'not_started', progressPercent: 0, timeSpent: 0 },
      ];

      for (const p of progressData) {
        await db.lessonProgress.upsert({
          where: { userId_lessonId: { userId: p.userId, lessonId: p.lessonId } },
          update: {},
          create: p,
        });
      }
    }

    // Create enrollments for the learner
    if (courses[0]) {
      await db.enrollment.upsert({
        where: { userId_courseId: { userId: learner.id, courseId: courses[0].id } },
        update: {},
        create: {
          userId: learner.id,
          courseId: courses[0].id,
          tenantId: tenant.id,
          status: 'active',
          progress: 35,
          lastAccessedAt: new Date().toISOString(),
        },
      });
    }

    if (courses[1]) {
      await db.enrollment.upsert({
        where: { userId_courseId: { userId: learner.id, courseId: courses[1].id } },
        update: {},
        create: {
          userId: learner.id,
          courseId: courses[1].id,
          tenantId: tenant.id,
          status: 'active',
          progress: 12,
          lastAccessedAt: new Date().toISOString(),
        },
      });
    }

    if (courses[3]) {
      await db.enrollment.upsert({
        where: { userId_courseId: { userId: learner.id, courseId: courses[3].id } },
        update: {},
        create: {
          userId: learner.id,
          courseId: courses[3].id,
          tenantId: tenant.id,
          status: 'completed',
          progress: 100,
          completedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
      });
    }

    // Create community categories
    const categories = [
      { name: 'General Discussion', description: 'Open conversations about anything', icon: '💬', color: '#6366F1', isDefault: true },
      { name: 'Q&A Support', description: 'Get help and share knowledge', icon: '❓', color: '#10B981' },
      { name: 'Announcements', description: 'Official platform announcements', icon: '📢', color: '#F59E0B' },
      { name: 'Show & Tell', description: 'Share your projects and achievements', icon: '🌟', color: '#EF4444' },
    ];

    for (const cat of categories) {
      await db.communityCategory.create({
        data: { tenantId: tenant.id, ...cat },
      });
    }

    // Create achievements
    const achievements = [
      { name: 'First Steps', description: 'Complete your first lesson', icon: '🎯', type: 'completion', criteria: '{"type":"lesson_complete","count":1}', points: 10 },
      { name: 'Knowledge Seeker', description: 'Complete 10 lessons', icon: '📚', type: 'completion', criteria: '{"type":"lesson_complete","count":10}', points: 50 },
      { name: 'Streak Starter', description: 'Maintain a 3-day learning streak', icon: '🔥', type: 'streak', criteria: '{"type":"streak","days":3}', points: 25 },
      { name: 'Streak Master', description: 'Maintain a 7-day learning streak', icon: '⚡', type: 'streak', criteria: '{"type":"streak","days":7}', points: 100 },
      { name: 'Quiz Ace', description: 'Score 100% on any quiz', icon: '💯', type: 'score', criteria: '{"type":"perfect_quiz","count":1}', points: 75 },
      { name: 'Community Builder', description: 'Create 5 discussion posts', icon: '🤝', type: 'community', criteria: '{"type":"posts","count":5}', points: 30 },
      { name: 'Course Graduate', description: 'Complete an entire course', icon: '🎓', type: 'completion', criteria: '{"type":"course_complete","count":1}', points: 150 },
      { name: 'Certified Expert', description: 'Earn 3 certificates', icon: '🏆', type: 'milestone', criteria: '{"type":"certificates","count":3}', points: 200 },
    ];

    for (const ach of achievements) {
      await db.achievement.create({
        data: { tenantId: tenant.id, ...ach },
      });
    }

    // Create sample daily metrics
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Use date as id-based approach since date is DateTime in schema
      try {
        await db.dailyMetric.create({
          data: {
            tenantId: tenant.id,
            date: date,
            activeUsers: Math.floor(800 + Math.random() * 600),
            newEnrollments: Math.floor(5 + Math.random() * 20),
            completions: Math.floor(3 + Math.random() * 15),
            revenue: Math.floor(1200 + Math.random() * 800),
            quizAttempts: Math.floor(20 + Math.random() * 50),
            avgSessionDuration: Math.floor(15 + Math.random() * 30),
          },
        });
      } catch {
        // Skip if already exists (unique constraint)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      tenantId: tenant.id,
      users: { admin: admin.id, learner: learner.id },
      note: 'Demo accounts: admin@nextgen-lms.com / learner@example.com (password: demo123)',
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
