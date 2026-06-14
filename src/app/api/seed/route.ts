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
      update: {
        role: 'super_admin',
      },
      create: {
        id: 'demo-admin-1',
        tenantId: tenant.id,
        email: 'admin@nextgen-lms.com',
        name: 'Sarah Mitchell',
        role: 'super_admin',
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

    // Create additional demo users for review authors
    const reviewAuthors = [
      { id: 'demo-reviewer-1', email: 'mike.chen@email.com', name: 'Mike Chen', role: 'learner', streakDays: 5, totalPoints: 340 },
      { id: 'demo-reviewer-2', email: 'sarah.l@email.com', name: 'Sarah Lopez', role: 'learner', streakDays: 3, totalPoints: 210 },
      { id: 'demo-reviewer-3', email: 'alex.k@email.com', name: 'Alex Kumar', role: 'learner', streakDays: 12, totalPoints: 890 },
      { id: 'demo-reviewer-4', email: 'emma.w@email.com', name: 'Emma Wilson', role: 'learner', streakDays: 1, totalPoints: 50 },
      { id: 'demo-reviewer-5', email: 'david.p@email.com', name: 'David Park', role: 'learner', streakDays: 8, totalPoints: 560 },
      { id: 'demo-reviewer-6', email: 'priya.s@email.com', name: 'Priya Sharma', role: 'learner', streakDays: 6, totalPoints: 420 },
      { id: 'demo-reviewer-7', email: 'jordan.b@email.com', name: 'Jordan Blake', role: 'learner', streakDays: 2, totalPoints: 180 },
      { id: 'demo-reviewer-8', email: 'chris.n@email.com', name: 'Chris Nguyen', role: 'learner', streakDays: 15, totalPoints: 1200 },
      { id: 'demo-reviewer-9', email: 'rachel.t@email.com', name: 'Rachel Torres', role: 'learner', streakDays: 4, totalPoints: 300 },
      { id: 'demo-reviewer-10', email: 'marcus.l@email.com', name: 'Marcus Lee', role: 'learner', streakDays: 7, totalPoints: 650 },
    ];

    for (const reviewer of reviewAuthors) {
      await db.user.upsert({
        where: { id: reviewer.id },
        update: {},
        create: {
          ...reviewer,
          tenantId: tenant.id,
        },
      });
    }

    // Create course reviews
    const reviewData = [
      { authorId: 'demo-reviewer-1', courseId: courses[0]?.id, rating: 5, content: 'Excellent course! The instructor explains complex concepts in a way that is easy to understand. The real-world projects were incredibly helpful for building my portfolio. I particularly enjoyed the section on server components and data fetching patterns. Highly recommended for anyone looking to level up their React skills.', status: 'pending' },
      { authorId: 'demo-reviewer-2', courseId: courses[3]?.id, rating: 2, content: 'The content was outdated and several examples didn\'t work with the latest version of the library. The instructor seems knowledgeable but the course needs a major update. Also, some of the quiz questions have incorrect answers marked as correct.', status: 'flagged', flagged: true, flagReason: 'Inappropriate', moderationHistory: JSON.stringify([{ action: 'Flagged', by: 'System', date: '2026-06-09', reason: 'Auto-flagged: multiple user reports' }]) },
      { authorId: 'demo-reviewer-3', courseId: courses[4]?.id, rating: 4, content: 'Great foundational course for data science with Python. The pandas and numpy sections are particularly well done. I would have liked more coverage of machine learning libraries, but as a starting point it\'s solid. The coding exercises are practical and relevant.', status: 'approved', adminResponse: 'Thank you for the feedback, Alex! We\'re adding ML content in the next update.', moderationHistory: JSON.stringify([{ action: 'Approved', by: 'Admin', date: '2026-06-08' }]) },
      { authorId: 'demo-reviewer-4', courseId: courses[5]?.id, rating: 1, content: 'BUY MY COURSE INSTEAD!!! Visit spam-site.com for the REAL design course at 90% off!!! Limited time offer!!! Don\'t waste your money here!!!', status: 'flagged', flagged: true, flagReason: 'Spam', moderationHistory: JSON.stringify([{ action: 'Flagged', by: 'System', date: '2026-06-08', reason: 'Auto-flagged: spam detected' }]) },
      { authorId: 'demo-reviewer-5', courseId: courses[2]?.id, rating: 5, content: 'This is the most comprehensive system design course I\'ve taken. The hands-on labs are incredible and the architecture patterns section alone is worth the price. Excellent instructor who clearly has real-world experience. The section on cost optimization saved my company thousands.', status: 'pending' },
      { authorId: 'demo-reviewer-6', courseId: courses[1]?.id, rating: 3, content: 'Decent course but could be better organized. Some sections assume prior knowledge that isn\'t mentioned in prerequisites. The math explanations are too brief for beginners. However, the project-based approach in the second half is really good.', status: 'pending' },
      { authorId: 'demo-reviewer-7', courseId: courses[0]?.id, rating: 4, content: 'Very good course overall. The instructor is clearly an expert. I docked one star because some of the code examples in the middleware section have typos, and the community forum response time could be better. Otherwise, learned a ton!', status: 'approved', moderationHistory: JSON.stringify([{ action: 'Approved', by: 'Admin', date: '2026-06-05' }]) },
      { authorId: 'demo-reviewer-8', courseId: courses[2]?.id, rating: 2, content: 'Way too basic for an "advanced" bootcamp. The title is misleading. Most of the content is available for free on YouTube. The Docker section is okay but the Kubernetes part is severely lacking.', status: 'rejected', moderationHistory: JSON.stringify([{ action: 'Rejected', by: 'Admin', date: '2026-06-04', reason: 'Off-topic' }]) },
      { authorId: 'demo-reviewer-9', courseId: courses[3]?.id, rating: 5, content: 'Anna is an incredible teacher! The way she breaks down advanced data visualization concepts makes them accessible. The real-world project at the end ties everything together perfectly. Best analytics course on the platform.', status: 'pending' },
      { authorId: 'demo-reviewer-10', courseId: courses[4]?.id, rating: 3, content: 'The content is okay but feels very theoretical. I expected more hands-on labs and practical exercises. The section on penetration testing is basically just definitions with no actual practice. Good for beginners wanting an overview, not for practitioners.', status: 'pending' },
    ];

    for (const review of reviewData) {
      if (!review.courseId) continue;
      try {
        await db.courseReview.create({
          data: {
            tenantId: tenant.id,
            courseId: review.courseId,
            authorId: review.authorId,
            rating: review.rating,
            content: review.content,
            status: review.status,
            flagged: review.flagged || false,
            flagReason: review.flagReason || null,
            adminResponse: review.adminResponse || null,
            moderationHistory: review.moderationHistory || null,
          },
        });
      } catch {
        // Skip if already exists
      }
    }

    // ─── Seed Live Cohorts ──────────────────────────────────
    const demoLiveCohorts = [
      {
        title: 'React & Next.js Live Q&A',
        description: 'Weekly live session for React course students. Bring your questions!',
        category: 'live_session',
        startDate: new Date(Date.now() + 86400000 * 1 + 3600000 * 10),
        endDate: new Date(Date.now() + 86400000 * 1 + 3600000 * 11.5),
        instructorName: 'Sarah Mitchell',
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
        color: '#6366F1',
        enrolledCount: 34,
        capacity: 50,
        status: 'upcoming',
      },
      {
        title: 'System Design Cohort Kickoff',
        description: 'Orientation session for the new System Design cohort. Meet your peers and instructor.',
        category: 'cohort_start',
        startDate: new Date(Date.now() + 86400000 * 3 + 3600000 * 18),
        endDate: new Date(Date.now() + 86400000 * 3 + 3600000 * 19),
        instructorName: 'David Park',
        meetingUrl: 'https://zoom.us/j/9876543210?pwd=YZabcdefgHIJklm',
        color: '#EF4444',
        enrolledCount: 18,
        capacity: 25,
        status: 'upcoming',
      },
      {
        title: 'AI Lab: Building with LLMs',
        description: 'Hands-on workshop: Build an AI-powered chatbot from scratch using modern APIs.',
        category: 'workshop',
        startDate: new Date(Date.now() + 86400000 * 5 + 3600000 * 14),
        endDate: new Date(Date.now() + 86400000 * 5 + 3600000 * 17),
        instructorName: 'Sarah Mitchell',
        meetingUrl: 'https://meet.google.com/mno-pqrs-tuv',
        color: '#10B981',
        enrolledCount: 22,
        capacity: 30,
        status: 'upcoming',
      },
      {
        title: 'Office Hours: Data Visualization',
        description: 'Drop-in office hours for Data Visualization students. Get help with your projects.',
        category: 'office_hours',
        startDate: new Date(Date.now() + 86400000 * 2 + 3600000 * 15),
        endDate: new Date(Date.now() + 86400000 * 2 + 3600000 * 16),
        instructorName: 'Lisa Wang',
        meetingUrl: 'https://zoom.us/j/1234567890?pwd=AbCdEfGhIjKlMn',
        color: '#F59E0B',
        enrolledCount: 8,
        capacity: 15,
        status: 'upcoming',
      },
      {
        title: 'Webinar: Future of AI in Education',
        description: 'Special guest panel discussing the impact of AI on learning and education technology.',
        category: 'webinar',
        startDate: new Date(Date.now() + 86400000 * 7 + 3600000 * 12),
        endDate: new Date(Date.now() + 86400000 * 7 + 3600000 * 13.5),
        color: '#8B5CF6',
        enrolledCount: 156,
        capacity: 500,
        status: 'upcoming',
      },
      {
        title: 'Assessment Deadline: React Quiz',
        description: 'Final deadline for the React & Next.js Fundamentals Quiz.',
        category: 'deadline',
        startDate: new Date(Date.now() + 86400000 * 4 + 3600000 * 23),
        endDate: new Date(Date.now() + 86400000 * 4 + 3600000 * 23 + 1800000),
        color: '#DC2626',
        capacity: 0,
        enrolledCount: 0,
        status: 'upcoming',
      },
      {
        title: 'Cohort Wrap-Up: AI Full Stack',
        description: 'Final presentations and celebration for the AI Full Stack cohort.',
        category: 'cohort_end',
        startDate: new Date(Date.now() + 86400000 * 10 + 3600000 * 17),
        endDate: new Date(Date.now() + 86400000 * 10 + 3600000 * 19),
        instructorName: 'Sarah Mitchell',
        color: '#10B981',
        enrolledCount: 20,
        capacity: 25,
        status: 'upcoming',
      },
      {
        title: 'Design Critique Session',
        description: 'Live design review for UX/UI students. Share your work and get feedback.',
        category: 'live_session',
        startDate: new Date(Date.now() + 86400000 * 6 + 3600000 * 16),
        endDate: new Date(Date.now() + 86400000 * 6 + 3600000 * 17.5),
        instructorName: 'Lisa Wang',
        meetingUrl: 'https://meet.google.com/wxy-zabc-def',
        color: '#EC4899',
        enrolledCount: 12,
        capacity: 20,
        status: 'upcoming',
      },
    ];

    for (const cohort of demoLiveCohorts) {
      try {
        await db.liveCohort.create({
          data: {
            tenantId: tenant.id,
            title: cohort.title,
            description: cohort.description,
            category: cohort.category,
            startDate: cohort.startDate,
            endDate: cohort.endDate,
            instructorName: cohort.instructorName || null,
            meetingUrl: cohort.meetingUrl || null,
            color: cohort.color || null,
            enrolledCount: cohort.enrolledCount,
            capacity: cohort.capacity,
            status: cohort.status,
          },
        });
      } catch {
        // Skip if already exists
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
