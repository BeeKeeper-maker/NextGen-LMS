import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
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
    ];

    for (const course of courseData) {
      await db.course.upsert({
        where: { tenantId_slug: { tenantId: tenant.id, slug: course.slug } },
        update: {},
        create: {
          tenantId: tenant.id,
          ...course,
          isPublished: true,
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
      const dateStr = date.toISOString().split('T')[0];
      
      await db.dailyMetric.upsert({
        where: { tenantId_date: { tenantId: tenant.id, date: dateStr } },
        update: {},
        create: {
          tenantId: tenant.id,
          date: dateStr,
          activeUsers: Math.floor(800 + Math.random() * 600),
          newEnrollments: Math.floor(5 + Math.random() * 20),
          completions: Math.floor(3 + Math.random() * 15),
          revenue: Math.floor(1200 + Math.random() * 800),
          quizAttempts: Math.floor(20 + Math.random() * 50),
          avgSessionDuration: Math.floor(15 + Math.random() * 30),
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Database seeded successfully', tenantId: tenant.id });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
