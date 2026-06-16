'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LegalLinks } from '@/components/shared/legal-content-dialog';

// Static marketing data - pricing plans are not user-generated, kept inline
const pricingPlans = [
  { id: 'starter', name: 'Starter', price: 49, currency: 'USD', period: '/month', description: 'Perfect for individual creators just getting started', features: ['Up to 3 courses', 'Up to 500 students', 'Basic community features', 'Email support', 'Standard certificates', '1 admin user'], highlighted: false, ctaText: 'Start Free Trial' },
  { id: 'professional', name: 'Professional', price: 97, currency: 'USD', period: '/month', description: 'For growing creators and small businesses', features: ['Unlimited courses', 'Up to 5,000 students', 'Advanced community & live cohorts', 'AI content generation', 'AI tutoring assistant', 'Custom certificates & branding', '0% transaction fees', 'Priority support', '5 admin/team users', 'Advanced analytics'], highlighted: true, ctaText: 'Start Free Trial' },
  { id: 'enterprise', name: 'Enterprise', price: 249, currency: 'USD', period: '/month', description: 'For organizations requiring full control and scale', features: ['Everything in Professional', 'Unlimited students', 'SSO / SAML authentication', 'Custom domain & full white-label', 'API access & webhooks', 'CRM integrations (Salesforce, HubSpot)', 'Dedicated account manager', 'SLA guarantee (99.99%)', 'Unlimited team users', 'Audit logs & compliance reports'], highlighted: false, ctaText: 'Contact Sales' },
];

// Static marketing data - competitor comparison is not user-generated, kept inline
const competitorComparison = [
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

import {
  Sparkles,
  Bot,
  Users,
  ClipboardCheck,
  Award,
  Globe,
  Palette,
  BarChart3,
  Video,
  Shield,
  DollarSign,
  Languages,
  Check,
  X,
  Menu,
  ChevronRight,
  ChevronLeft,
  Star,
  ArrowRight,
  ArrowUp,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  GraduationCap,
  Zap,
  Play,
  Mail,
  MessageCircle,
  Heart,
  Pin,
  Eye,
  Clock,
  MessageSquare,
  TrendingUp,
  UserPlus,
  Trophy,
  BookOpen,
  Lightbulb,
  Target,
  Rocket,
  Crown,
  Minus,
  Calendar,
  ThumbsUp,
  Tv,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';

// ============================================================
// Feature Definitions (with category and tooltip)
// ============================================================
const features = [
  { icon: Sparkles, title: 'AI Content Generation', description: 'Generate course outlines, quizzes, and lesson content with advanced AI. Save hours of creation time.', category: 'AI', featured: true, tooltip: 'Powered by GPT-4 with custom training on educational content' },
  { icon: Bot, title: 'AI Tutoring Assistant', description: '24/7 intelligent tutor that answers student questions, explains concepts, and adapts to learning styles.', category: 'AI', featured: false, tooltip: 'Context-aware AI that references your specific course material' },
  { icon: Users, title: 'Integrated Community', description: 'Built-in discussions, live cohorts, and peer learning. No need for separate community tools.', category: 'Community', featured: false, tooltip: 'Forums, threads, DMs, and live events all in one place' },
  { icon: ClipboardCheck, title: 'Assessment Engine', description: 'Quizzes, assignments, peer reviews, and coding challenges with auto-grading and analytics.', category: 'Analytics', featured: false, tooltip: '15+ question types with AI-powered auto-grading' },
  { icon: Award, title: 'Auto Certificates', description: 'Automatically issue branded certificates on course completion with verification codes.', category: 'Analytics', featured: false, tooltip: 'Customizable templates with QR code verification' },
  { icon: Globe, title: 'Multi-Currency Checkout', description: 'Sell in 50+ currencies with localized pricing. Support for Stripe, PayPal, and more.', category: 'Commerce', featured: false, tooltip: 'Dynamic currency conversion with PPP pricing support' },
  { icon: Palette, title: 'White-Label Branding', description: 'Full brand customization — colors, fonts, domain, and logos. Your platform, your identity.', category: 'Commerce', featured: false, tooltip: 'Custom CSS, domain mapping, and complete visual control' },
  { icon: BarChart3, title: 'Advanced Analytics', description: 'Deep insights into learner engagement, revenue trends, and completion funnels.', category: 'Analytics', featured: false, tooltip: 'Real-time dashboards with exportable reports' },
  { icon: Video, title: 'Live Cohorts', description: 'Schedule and run live sessions with built-in video, chat, and attendance tracking.', category: 'Community', featured: false, tooltip: 'HD video with breakout rooms and recording' },
  { icon: Shield, title: 'RBAC Governance', description: 'Role-based access control for admins, instructors, creators, and learners.', category: 'Analytics', featured: false, tooltip: 'Granular permissions with audit trails' },
  { icon: DollarSign, title: 'Zero Transaction Fees', description: 'Keep 100% of your revenue. No hidden fees, no transaction taxes on any plan.', category: 'Commerce', featured: false, tooltip: 'No processing fees, no hidden charges, ever' },
  { icon: Languages, title: 'Global i18n', description: 'Multi-language support for global audiences. Localize your entire platform with ease.', category: 'Community', featured: false, tooltip: '40+ languages with automatic detection' },
];

// ============================================================
// Testimonials (with star ratings and role badges)
// ============================================================
const testimonials = [
  {
    name: 'Dr. Sarah Chen',
    role: 'CEO, TechAcademy',
    company: 'TechAcademy',
    quote: 'NextGen LMS transformed our online education business. The AI tutoring alone increased student engagement by 40%. Zero transaction fees saved us over $15K in the first year.',
    avatar: 'SC',
    rating: 5,
    badge: 'Enterprise',
  },
  {
    name: 'Marcus Johnson',
    role: 'Course Creator, 50K+ Students',
    company: 'Independent',
    quote: 'I switched from Kajabi and never looked back. The built-in community features and assessment engine are game-changers. My students love the interactive experience.',
    avatar: 'MJ',
    rating: 5,
    badge: 'Professional',
  },
  {
    name: 'Priya Sharma',
    role: 'Head of Learning, Fortune 500',
    company: 'Fortune 500',
    quote: 'The white-label branding and SSO integration made it seamless to deploy across our organization. The analytics give us insights we never had before.',
    avatar: 'PS',
    rating: 5,
    badge: 'Enterprise',
  },
  {
    name: 'Alex Rivera',
    role: 'Solo Creator, $200K+ Revenue',
    company: 'Independent',
    quote: 'As a solo creator, the AI content generation saves me 10+ hours per week. The zero transaction fees mean I keep more of what I earn. Absolute no-brainer.',
    avatar: 'AR',
    rating: 5,
    badge: 'Professional',
  },
  {
    name: 'Emma Thompson',
    role: 'Director, Online University',
    company: 'Online University',
    quote: 'We migrated 200+ courses to NextGen LMS. The multi-currency checkout and certificate automation made scaling globally effortless. The support team is phenomenal.',
    avatar: 'ET',
    rating: 5,
    badge: 'Enterprise',
  },
];

// ============================================================
// Community Preview Posts
// ============================================================
const communityPreviewPosts = [
  {
    name: 'Jamie Rodriguez',
    initials: 'JR',
    color: 'bg-emerald-500',
    timestamp: '2 hours ago',
    content: 'Just completed the React Masterclass! The new hooks module is incredible. Anyone else working through the final project?',
    likes: 24,
    comments: 8,
    pinned: true,
  },
  {
    name: 'Aisha Patel',
    initials: 'AP',
    color: 'bg-violet-500',
    timestamp: '5 hours ago',
    content: 'Can someone explain the difference between server components and client components in Next.js? The docs are a bit confusing on this...',
    likes: 12,
    comments: 15,
    pinned: false,
  },
  {
    name: 'David Kim',
    initials: 'DK',
    color: 'bg-amber-500',
    timestamp: '8 hours ago',
    content: 'Pro tip: Use the AI tutor to generate practice quizzes before exams. It creates questions based on your weak areas. Game changer!',
    likes: 47,
    comments: 21,
    pinned: false,
  },
  {
    name: 'Sarah Mitchell',
    initials: 'SM',
    color: 'bg-sky-500',
    timestamp: '1 day ago',
    content: 'My cohort starts the live session tomorrow on Advanced TypeScript patterns. So excited! Who else is joining?',
    likes: 18,
    comments: 6,
    pinned: false,
  },
];

// ============================================================
// Integrations Data
// ============================================================
const integrations = [
  { name: 'Stripe', icon: DollarSign, color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-400' },
  { name: 'PayPal', icon: DollarSign, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400' },
  { name: 'Zoom', icon: Video, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-400' },
  { name: 'Google Analytics', icon: BarChart3, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400' },
  { name: 'HubSpot', icon: Users, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400' },
  { name: 'Salesforce', icon: Globe, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400' },
  { name: 'Slack', icon: MessageCircle, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400' },
  { name: 'Zapier', icon: Zap, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' },
];

// ============================================================
// Animation Variants
// ============================================================
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const staggerContainerSlow = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

// Section reveal variant — each section fades + slides in
const sectionReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

// ============================================================
// Shimmer Text Component (for hero tagline)
// ============================================================
function ShimmerText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <span
        className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/10 animate-shimmer bg-[length:200%_100%]"
        aria-hidden="true"
      />
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </span>
  );
}

// ============================================================
// Typing Animation Component
// ============================================================
function TypingText({ text, speed = 35, delay = 0 }: { text: string; speed?: number; delay?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayed(text.slice(0, displayed.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [displayed, text, speed, started]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && started && (
        <span className="inline-block w-0.5 h-5 bg-emerald-500 ml-0.5 animate-pulse align-middle" />
      )}
    </span>
  );
}

// ============================================================
// Rotating Text Component (for hero subtitle cycling)
// ============================================================
function RotatingText({ phrases, interval = 3000 }: { phrases: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % phrases.length);
    }, interval);
    return () => clearInterval(timer);
  }, [phrases.length, interval]);

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.span
        key={phrases[index]}
        custom={direction}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="inline-block bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent font-semibold"
      >
        {phrases[index]}
      </motion.span>
    </AnimatePresence>
  );
}

function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.05]">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" className="text-slate-50" />
      </svg>
    </div>
  );
}

// ============================================================
// Animated Glowing Grid Beams (Cyber Rays)
// ============================================================
function GridRays() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
      {/* Vertical lines and beams */}
      {[15, 35, 55, 75, 90].map((left, idx) => (
        <div key={`v-${idx}`} className="absolute top-0 bottom-0 left-[var(--x)] w-px bg-white/[0.02]" style={{ '--x': `${left}%` } as any}>
          <motion.div
            className="absolute w-px bg-gradient-to-b from-transparent via-emerald-500/25 to-transparent top-0"
            style={{ height: '30vh' }}
            animate={{ y: ['-100vh', '150vh'] }}
            transition={{
              duration: 8 + idx * 2,
              repeat: Infinity,
              ease: 'linear',
              delay: idx * 1.5,
            }}
          />
        </div>
      ))}
      
      {/* Horizontal lines and beams */}
      {[20, 45, 70, 85].map((top, idx) => (
        <div key={`h-${idx}`} className="absolute left-0 right-0 top-[var(--y)] h-px bg-white/[0.02]" style={{ '--y': `${top}%` } as any}>
          <motion.div
            className="absolute h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent left-0"
            style={{ width: '30vw' }}
            animate={{ x: ['-100vw', '150vw'] }}
            transition={{
              duration: 9 + idx * 3,
              repeat: Infinity,
              ease: 'linear',
              delay: idx * 2.2,
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Noise / Grain Texture Overlay
// ============================================================
function GrainOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.035]">
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
}

// ============================================================
// Constellation Particles — dots connected with lines
// ============================================================
const constellationData = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: ((i * 17 + 5) % 95) + 2,
  y: ((i * 23 + 11) % 90) + 5,
  size: ((i * 3 + 2) % 3) + 2,
  duration: 8 + ((i * 7 + 3) % 8),
  delay: ((i * 5 + 1) % 6),
  driftX: ((i * 13 % 7) - 3) * 8,
  driftY: ((i * 11 % 5) - 2) * 6,
}));

// Pre-compute constellation lines (deterministic, no state needed)
const constellationLines = constellationData.flatMap((p1, i) =>
  constellationData.slice(i + 1).flatMap((p2) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 25) {
      return [{ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, opacity: Math.max(0, 1 - dist / 25) * 0.15 }];
    }
    return [];
  })
);

function ConstellationParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* SVG lines layer */}
      <svg className="absolute inset-0 w-full h-full">
        {constellationLines.map((line, i) => (
          <line
            key={`line-${i}`}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-emerald-500"
            style={{ opacity: line.opacity }}
          />
        ))}
      </svg>
      {/* Dots layer */}
      {constellationData.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-emerald-400/30 shadow-[0_0_4px_rgba(52,211,153,0.3)]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            x: [0, p.driftX, 0],
            y: [0, p.driftY, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// Floating Particles — deterministic seeded positions to avoid hydration mismatch
// ============================================================
const particleData = Array.from({ length: 20 }, (_, i) => ({
  width: ((i * 7 + 3) % 5) + 2,
  height: ((i * 5 + 2) % 5) + 2,
  left: `${((i * 13 + 7) % 100)}%`,
  top: `${((i * 17 + 11) % 100)}%`,
  duration: 4 + ((i * 3 + 1) % 5),
  delay: ((i * 2 + 3) % 4),
}));

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particleData.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-emerald-500/20"
          style={{
            width: p.width,
            height: p.height,
            left: p.left,
            top: p.top,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// Parallax Orbs (Hero background orbs with parallax scroll)
// ============================================================
function ParallaxOrbs() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-emerald-500/10 blur-[110px]"
        style={{ y: y1 }}
        animate={{
          scale: [1, 1.15, 0.9, 1],
          opacity: [0.08, 0.14, 0.08, 0.08],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 h-[480px] w-[480px] rounded-full bg-violet-500/10 blur-[110px]"
        style={{ y: y2 }}
        animate={{
          scale: [1, 0.9, 1.15, 1],
          opacity: [0.08, 0.12, 0.08, 0.08],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[750px] w-[750px] rounded-full bg-slate-500/5 blur-[130px]"
        style={{ y: y3 }}
      />
    </div>
  );
}

// ============================================================
// Floating Dashboard Mockup (Hero) — with 3D perspective tilt on mouse move
// ============================================================
// ============================================================
// Live Interactive Sandbox Mockup Views
// ============================================================

function AIBuilderView() {
  const [outline, setOutline] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('generating');
  const [topic, setTopic] = useState('React Server Components (RSC)');

  const mockSteps = [
    'Analyzing course topic and setting target audience...',
    'Module 1: Introduction to React Server Components (RSC)',
    'Module 2: Server vs. Client Components (Hydration & Architecture)',
    'Module 3: Data Fetching Patterns & Suspense Integration',
    'Module 4: Server Actions & Mutating Data with Zero Client JS',
    'Module 5: Security & Secret Key Leak Prevention in Server Code',
    'AI Outlining Completed successfully!'
  ];

  useEffect(() => {
    if (status !== 'generating') return;
    setOutline([]);
    let timerIds: NodeJS.Timeout[] = [];
    
    mockSteps.forEach((step, index) => {
      const id = setTimeout(() => {
        setOutline(prev => [...prev, step]);
        if (index === mockSteps.length - 1) {
          setStatus('done');
        }
      }, (index + 1) * 850);
      timerIds.push(id);
    });

    return () => {
      timerIds.forEach(id => clearTimeout(id));
    };
  }, [status]);

  return (
    <div className="p-5 flex flex-col md:flex-row gap-6 min-h-[340px] bg-slate-950/40 text-left">
      {/* Left panel - Inputs */}
      <div className="flex-1 space-y-4">
        <div>
          <label className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest font-mono">Target Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setStatus('idle');
            }}
            className="w-full mt-1.5 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-50 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest font-mono">Skill Level</label>
          <div className="grid grid-cols-3 gap-2 mt-1.5">
            {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
              <div key={lvl} className={`px-2 py-1.5 text-center text-[10px] rounded-lg border font-semibold ${lvl === 'Advanced' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-900 border-white/5 text-slate-400'}`}>
                {lvl}
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => setStatus('generating')}
          disabled={status === 'generating'}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all mt-4 cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {status === 'generating' ? 'AI Outlining...' : 'Re-Generate Outline'}
        </button>
      </div>

      {/* Right panel - Generated Outline Terminal */}
      <div className="flex-1 rounded-xl bg-slate-900/90 border border-white/10 p-4 font-mono text-[11px] flex flex-col">
        <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3 select-none">
          <span className="text-[9px] text-slate-400">AI OUTLINE GENERATOR</span>
          {status === 'generating' && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
        </div>
        <div className="flex-1 space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
          {outline.map((line, i) => {
            const isBanner = i === 0;
            const isOutro = i === mockSteps.length - 1;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${isOutro ? 'text-emerald-400 font-bold' : isBanner ? 'text-violet-400 font-semibold' : 'text-slate-300'}`}
              >
                {!isOutro && !isBanner && <span className="text-emerald-500 mr-2">✓</span>}
                {isOutro && <span className="text-emerald-400 mr-2">✦</span>}
                {line}
              </motion.div>
            );
          })}
          {status === 'generating' && (
            <div className="text-slate-400 animate-pulse mt-2 flex items-center gap-1">
              <span>typing</span>
              <span className="h-3 w-1.5 bg-emerald-500 animate-pulse shrink-0" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CohortsView() {
  const [rsvpd, setRsvpd] = useState<Record<string, boolean>>({});

  const events = [
    { id: '1', title: 'React Server Components Masterclass', type: 'Workshop', time: 'LIVE NOW', duration: '2h', isLive: true, instructor: 'Sharif (CTO)' },
    { id: '2', title: 'Weekly Q&A Office Hours', type: 'Office Hours', time: 'Today, 4:00 PM', duration: '1.5h', instructor: 'Tasnim (Lead)' },
    { id: '3', title: 'Building SaaS with Next.js & Coolify', type: 'Webinar', time: 'Wednesday, 7:00 PM', duration: '1h', instructor: 'Sharif (CTO)' },
  ];

  const handleRsvp = (id: string) => {
    setRsvpd(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-5 min-h-[340px] bg-slate-950/40 text-left flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4 select-none">
        <div>
          <label className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest font-mono">Cohort Calendar</label>
          <h3 className="text-sm font-bold text-white mt-0.5">Upcoming Live Interactive Events</h3>
        </div>
        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 bg-slate-900 border border-white/5 px-2.5 py-1 rounded-lg">
          <Calendar className="h-3.5 w-3.5 text-emerald-500" />
          <span>June 2026</span>
        </div>
      </div>

      <div className="space-y-3 flex-1 flex flex-col justify-center">
        {events.map(ev => (
          <div key={ev.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl border transition-all ${ev.isLive ? 'bg-gradient-to-r from-emerald-500/5 to-slate-900 border-emerald-500/20' : 'bg-slate-900 border-white/5'}`}>
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${ev.isLive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                {ev.type[0]}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white truncate">{ev.title}</span>
                  {ev.isLive ? (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider animate-pulse">
                      <span className="h-1 w-1 rounded-full bg-rose-500 shrink-0" />
                      Live Now
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-full text-[8px] bg-slate-800 text-slate-400">{ev.type}</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                  <span>Instructor: <strong className="text-slate-300">{ev.instructor}</strong></span>
                  <span>•</span>
                  <span>Time: <strong className="text-emerald-400">{ev.time}</strong></span>
                </p>
              </div>
            </div>
            <button
              onClick={() => handleRsvp(ev.id)}
              className={`mt-3 sm:mt-0 px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all shrink-0 cursor-pointer ${
                ev.isLive
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-lg shadow-emerald-500/20'
                  : rsvpd[ev.id]
                  ? 'bg-slate-800 text-emerald-400 border-emerald-500/20'
                  : 'bg-transparent text-slate-300 hover:bg-slate-800 border-white/10'
              }`}
            >
              {ev.isLive ? 'Join Live Room' : rsvpd[ev.id] ? '✓ RSVP Confirmed' : 'RSVP Event'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentStudioView() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);
  const [unlocked, setUnlocked] = useState(false);

  const lessons = [
    { title: '1. What are Server Components?', completed: true },
    { title: '2. Working with Server Actions', active: true },
    { title: '3. Hydration Optimization & CSS', locked: !unlocked },
  ];

  const handleComplete = () => {
    setProgress(100);
    setUnlocked(true);
  };

  const handleReset = () => {
    setProgress(35);
    setUnlocked(false);
    setIsPlaying(false);
  };

  return (
    <div className="p-5 min-h-[340px] bg-slate-950/40 text-left flex flex-col md:flex-row gap-5">
      {/* Sidebar - Course Outline */}
      <div className="w-full md:w-56 space-y-2 shrink-0">
        <label className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest font-mono">Course Outline</label>
        <div className="space-y-1.5 mt-2">
          {lessons.map((less, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 p-2 rounded-lg border text-[11px] font-semibold select-none ${
                less.active
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : less.completed
                  ? 'bg-slate-900 border-white/5 text-slate-400 line-through'
                  : less.locked
                  ? 'bg-slate-950/60 border-transparent text-slate-600 opacity-60'
                  : 'bg-slate-900 border-white/5 text-slate-300'
              }`}
            >
              {less.completed ? (
                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              ) : less.locked ? (
                <Lock className="h-3.5 w-3.5 text-slate-700 shrink-0" />
              ) : (
                <div className={`h-3 w-3 rounded-full border border-current shrink-0 flex items-center justify-center`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${less.active ? 'bg-emerald-400' : 'bg-transparent'}`} />
                </div>
              )}
              <span className="truncate">{less.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main panel - Sleek Video Player Mockup */}
      <div className="flex-1 flex flex-col">
        <div className="relative flex-1 rounded-xl bg-slate-950 border border-white/10 overflow-hidden flex items-center justify-center min-h-[170px]">
          {/* Simulated Video Content */}
          {isPlaying ? (
            <video
              src="/promo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              ref={(el) => {
                if (el) {
                  el.muted = true;
                  el.play().catch(() => {});
                }
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/10 via-slate-950 to-slate-950 flex flex-col items-center justify-center p-4">
              <Video className="h-8 w-8 text-emerald-500/20 mb-1" />
              <span className="text-[9px] font-mono text-emerald-400/80 uppercase tracking-wider">Lesson Video Stream</span>
              <span className="text-[10px] text-slate-400 mt-1 text-center font-medium">NextGen LMS custom media player v2.4</span>
            </div>
          )}

          {/* Central Play Overlay */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="relative z-10 size-11 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 cursor-pointer"
          >
            {isPlaying ? (
              <span className="flex gap-1 items-end justify-center h-3.5 select-none">
                {[1, 2, 3].map((b) => (
                  <motion.span
                    key={b}
                    className="h-full w-1 bg-white rounded-full"
                    animate={{ height: [4, 12, 4] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: b * 0.15,
                      ease: 'easeInOut'
                    }}
                  />
                ))}
              </span>
            ) : (
              <Play className="h-4 w-4 ml-0.5 fill-current" />
            )}
          </button>

          {/* Progress bar inside video */}
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-800">
            <motion.div className="h-full bg-emerald-500" animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} />
          </div>
        </div>

        {/* Video Player Controls */}
        <div className="flex items-center justify-between mt-3 gap-3 select-none">
          <span className="text-[9px] font-mono text-slate-400">Progress: {progress}%</span>
          <div className="flex gap-2">
            {progress === 100 ? (
              <button onClick={handleReset} className="h-7 px-3 text-[10px] border border-white/10 rounded-lg hover:bg-slate-800 text-white font-semibold cursor-pointer">
                Reset Demo
              </button>
            ) : (
              <button onClick={handleComplete} className="h-7 px-3 text-[10px] bg-emerald-600 hover:bg-emerald-750 text-white rounded-lg font-bold cursor-pointer">
                Complete Lesson
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CommunityHubView() {
  const [likes, setLikes] = useState(24);
  const [loves, setLoves] = useState(15);
  const [comments, setComments] = useState([
    { id: '1', author: 'Farhan', text: 'This is brilliant! Implementing server guards saves a ton of client js payload.' },
    { id: '2', author: 'Nishat', text: 'Clean and readable. Thanks Sharif!' },
  ]);
  const [commentInput, setCommentInput] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setComments(prev => [...prev, { id: Date.now().toString(), author: 'Learner (You)', text: commentInput }]);
    setCommentInput('');
  };

  return (
    <div className="p-5 min-h-[340px] bg-slate-950/40 text-left flex flex-col md:flex-row gap-5">
      {/* Left Column - Active Post */}
      <div className="flex-1 space-y-3 flex flex-col">
        <label className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest font-mono">Active Post</label>
        <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-3 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 select-none">
              <div className="size-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white">S</div>
              <div>
                <p className="text-[10px] font-bold text-white leading-none">Sharif (Instructor)</p>
                <p className="text-[8px] text-slate-400 mt-0.5">2 hours ago</p>
              </div>
            </div>
            <h4 className="text-[11px] font-bold text-slate-100">💡 Quick tip: Use Next.js Middleware for server-side role protection!</h4>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Don&apos;t wait for components to render on the client side to restrict routes. Intercept requests at the edge in middleware for secure, instant redirects.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4 select-none">
            <button onClick={() => setLikes(likes + 1)} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer">
              <ThumbsUp className="h-3 w-3 text-emerald-500" />
              <span>{likes}</span>
            </button>
            <button onClick={() => setLoves(loves + 1)} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-rose-400 transition-colors cursor-pointer">
              <Heart className="h-3 w-3 text-rose-500 fill-current" />
              <span>{loves}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column - Comments Thread */}
      <div className="flex-1 flex flex-col space-y-3">
        <label className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest font-mono">Discussion Thread</label>
        <div className="flex-1 flex flex-col justify-between rounded-xl bg-slate-900/50 border border-white/5 p-3 max-h-[220px]">
          <div className="space-y-2.5 overflow-y-auto custom-scrollbar flex-1 pr-1.5 mb-2.5">
            {comments.map(c => (
              <div key={c.id} className="text-[10px] space-y-0.5">
                <p className="font-bold text-slate-300">{c.author}</p>
                <p className="text-slate-400 leading-normal">{c.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Join the discussion..."
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-white/5 rounded-lg text-[10px] text-slate-50 focus:outline-none focus:border-emerald-500"
            />
            <button type="submit" className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function AnalyticsView() {
  const [revenue, setRevenue] = useState(0);
  const [students, setStudents] = useState(0);

  useEffect(() => {
    setRevenue(0);
    setStudents(0);
    const revTimer = setTimeout(() => setRevenue(47820), 50);
    const stuTimer = setTimeout(() => setStudents(3847), 150);
    return () => {
      clearTimeout(revTimer);
      clearTimeout(stuTimer);
    };
  }, []);

  return (
    <div className="p-5 min-h-[340px] bg-slate-950/40 text-left flex flex-col justify-center select-none">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Earnings', value: `$${revenue.toLocaleString()}` },
          { label: 'Active Students', value: students.toLocaleString() },
          { label: 'Completion Rate', value: '72.4%' },
          { label: 'Instructor Rating', value: '★ 4.95/5' },
        ].map((stat, i) => (
          <div key={i} className="p-3 bg-slate-900 border border-white/5 rounded-xl text-center">
            <p className="text-[9px] text-slate-400 tracking-wider uppercase font-mono">{stat.label}</p>
            <p className="text-sm font-extrabold text-white mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* SVG Sparkline Graph */}
      <div className="relative h-24 rounded-xl bg-slate-900/60 border border-white/5 p-4 flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 z-10">
          <span>REVENUE GROWTH (LAST 30 DAYS)</span>
          <span className="text-emerald-400 font-bold">+40% MRR</span>
        </div>
        <div className="relative w-full h-12 mt-2">
          {/* Animated SVG Path */}
          <svg className="w-full h-full" viewBox="0 0 100 10" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Sparkline area */}
            <path
              d="M0,10 L5,9 L10,8 L15,8.5 L20,7 L25,6.5 L30,5 L35,5.5 L40,4 L45,3 L50,4.5 L55,2.5 L60,3.5 L65,1.5 L70,2 L75,1 M75,10 L0,10 Z"
              fill="url(#chart-glow)"
            />
            {/* Sparkline stroke */}
            <motion.path
              d="M0,9 L5,9 L10,8 L15,8.5 L20,7 L25,6.5 L30,5 L35,5.5 L40,4 L45,3 L50,4.5 L55,2.5 L60,3.5 L65,1.5 L70,2 L75,1"
              fill="none"
              stroke="#10b981"
              strokeWidth="0.8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function DashboardMockup() {
  const mockupRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [activeTab, setActiveTab] = useState<'ai' | 'timeline' | 'studio' | 'community' | 'analytics'>('ai');

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!mockupRef.current) return;
    const rect = mockupRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rotateX: -y * 6, rotateY: x * 6 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  return (
    <motion.div
      className="relative mx-auto mt-16 max-w-5xl"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
    >
      <motion.div
        className="relative"
      >
        <div
          ref={mockupRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            perspective: 1200,
          }}
        >
          <motion.div
            animate={{
              rotateX: tilt.rotateX,
              rotateY: tilt.rotateY,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Glow effect behind mockup */}
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-violet-500/20 to-emerald-500/20 rounded-2xl blur-2xl opacity-60" />

            {/* Mockup Card */}
            <div className="relative rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden">
              
              {/* Window chrome / Topbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 bg-slate-950/40 px-4 py-3 gap-2 select-none">
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <div className="flex gap-1.5 shrink-0">
                    <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="hidden md:flex h-5 w-48 rounded bg-white/5 items-center justify-center border border-white/5 text-[9px] text-slate-400 font-mono">
                    academy.nextgen-lms.com
                  </div>
                </div>
                
                {/* Tabs navigation */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar-horizontal max-w-full">
                  {[
                    { id: 'ai' as const, label: 'AI Builder', icon: Sparkles },
                    { id: 'timeline' as const, label: 'Live Cohorts', icon: Calendar },
                    { id: 'studio' as const, label: 'Student Studio', icon: Tv },
                    { id: 'community' as const, label: 'Community', icon: MessageSquare },
                    { id: 'analytics' as const, label: 'Earnings', icon: BarChart3 },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                            : 'text-slate-400 hover:text-slate-50 hover:bg-white/5'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sandbox viewport content */}
              <div className="relative overflow-hidden min-h-[340px]">
                {activeTab === 'ai' && <AIBuilderView />}
                {activeTab === 'timeline' && <CohortsView />}
                {activeTab === 'studio' && <StudentStudioView />}
                {activeTab === 'community' && <CommunityHubView />}
                {activeTab === 'analytics' && <AnalyticsView />}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// AI Live Demo Preview
// ============================================================
function AILiveDemo() {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const lines = [
    'Module 1: React Fundamentals & JSX',
    'Module 2: State Management with Hooks',
    'Module 3: Server Components & RSC',
    'Module 4: API Routes & Data Fetching',
    'Module 5: Authentication & Authorization',
  ];

  useEffect(() => {
    if (currentLine >= lines.length) {
      const resetTimer = setTimeout(() => {
        setCurrentLine(0);
        setDisplayText('');
      }, 3000);
      return () => clearTimeout(resetTimer);
    }

    const line = lines[currentLine];
    let charIndex = 0;
    setDisplayText('');

    const typeTimer = setInterval(() => {
      if (charIndex < line.length) {
        setDisplayText(line.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeTimer);
        setTimeout(() => setCurrentLine((prev) => prev + 1), 800);
      }
    }, 40);

    return () => clearInterval(typeTimer);
  }, [currentLine]);

  return (
    <Card className="border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50/50 to-emerald-50/50 dark:from-violet-950/30 dark:to-emerald-950/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">AI Course Generator</CardTitle>
            <CardDescription className="text-xs">Watch AI generate a course outline...</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg bg-slate-900/80 border border-white/10/40 p-3 font-mono text-xs space-y-1.5">
          {lines.slice(0, currentLine).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"
            >
              <Check className="h-3 w-3 shrink-0" />
              <span>{line}</span>
            </motion.div>
          ))}
          {currentLine < lines.length && (
            <div className="flex items-center gap-2 text-slate-50">
              <span className="text-violet-500 shrink-0">{'>'}</span>
              <span>
                {displayText}
                <span className="inline-block w-1.5 h-3.5 bg-violet-500 ml-0.5 animate-pulse align-middle" />
              </span>
            </div>
          )}
          {currentLine >= lines.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"
            >
              <Check className="h-3 w-3 shrink-0" />
              <span className="font-semibold">Course outline generated! 5 modules ready.</span>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Animated Counter Hook
// ============================================================
function useAnimatedCounter(target: number, duration: number = 800) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    prevTarget.current = target;

    const start = count;
    const diff = target - start;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + diff * eased));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
}

// ============================================================
// Savings Calculator (with animated counter)
// ============================================================
function SavingsCalculator() {
  const [revenue, setRevenue] = useState(5000);
  const teachableFee = revenue * 0.05 + 59;
  const nextgenFee = 0;
  const savings = Math.round(teachableFee - nextgenFee);
  const animatedSavings = useAnimatedCounter(savings, 600);

  return (
    <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/50 to-slate-50/50 dark:from-emerald-950/30 dark:to-slate-950/30 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-600" />
          How much would you save?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Monthly Revenue</span>
            <span className="text-lg font-bold text-slate-50">${revenue.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={500}
            max={50000}
            step={500}
            value={revenue}
            onChange={(e) => setRevenue(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-emerald-600 relative"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #8b5cf6 ${((revenue - 500) / (50000 - 500)) * 100}%, hsl(var(--muted)) ${((revenue - 500) / (50000 - 500)) * 100}%, hsl(var(--muted)) 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>$500</span>
            <span>$50,000</span>
          </div>
        </div>

        <div className="space-y-2">
          <motion.div
            className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/50"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.15 }}
          >
            <span className="text-sm text-red-700 dark:text-red-400">With Teachable</span>
            <span className="font-bold text-red-600 dark:text-red-400">${Math.round(teachableFee).toLocaleString()}/mo in fees</span>
          </motion.div>
          <motion.div
            className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.15 }}
          >
            <span className="text-sm text-emerald-700 dark:text-emerald-400">With NextGen</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">$0/mo in fees</span>
          </motion.div>
        </div>

        <motion.div
          className="text-center p-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white"
          key={animatedSavings}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs text-emerald-100">You save</p>
          <p className="text-2xl font-bold">${animatedSavings.toLocaleString()}/month</p>
        </motion.div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Sparkle Particles (for "2 months free" badge)
// ============================================================
function SparkleParticles() {
  const sparkles = Array.from({ length: 6 }, (_, i) => ({
    x: ((i * 17 + 5) % 30) - 15,
    y: ((i * 13 + 3) % 20) - 10,
    size: 2 + (i % 3),
    delay: (i * 0.4) % 2,
    duration: 1.5 + (i % 3) * 0.5,
  }));

  return (
    <span className="relative inline-flex">
      {sparkles.map((s, i) => (
        <motion.span
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: `calc(50% + ${s.x}px)`,
            top: `calc(50% + ${s.y}px)`,
            width: s.size,
            height: s.size,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeInOut',
          }}
        >
          <span className="block w-full h-full rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.6)]" />
        </motion.span>
      ))}
    </span>
  );
}

// ============================================================
// Animated Border Glow Card (Pulsing for "Most Popular")
// ============================================================
function GlowBorderCard({ children, highlighted }: { children: React.ReactNode; highlighted: boolean }) {
  if (!highlighted) return <>{children}</>;

  return (
    <div className="relative group">
      {/* Pulsing glow border */}
      <motion.div
        className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-emerald-500 via-violet-500 to-emerald-500 opacity-75 blur-[1px]"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          opacity: [0.5, 0.85, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{ backgroundSize: '200% 200%' }}
      />
      {/* Outer glow pulse */}
      <motion.div
        className="absolute -inset-3 rounded-2xl bg-emerald-500/10"
        animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.02, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Radial gradient glow behind popular card */}
      <div className="absolute -inset-8 rounded-3xl bg-gradient-radial from-emerald-500/15 via-emerald-500/5 to-transparent pointer-events-none" />
      {/* Gradient shine sweep */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
          style={{ width: '50%' }}
        />
      </div>
      <div className="relative rounded-xl">{children}</div>
    </div>
  );
}

// ============================================================
// Gradient Border Feature Card
// ============================================================
function GradientBorderCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative group ${className}`}>
      {/* Gradient border — appears on hover */}
      <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-emerald-500/0 via-violet-500/0 to-emerald-500/0 group-hover:from-emerald-500/60 group-hover:via-violet-500/60 group-hover:to-emerald-500/60 transition-all duration-500 opacity-0 group-hover:opacity-100" />
      {/* Glow shadow on hover */}
      <div className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-emerald-500/5 via-violet-500/5 to-emerald-500/5 blur-lg" />
      <div className="relative">
        {children}
      </div>
    </div>
  );
}

// ============================================================
// Animated Gradient Divider
// ============================================================
function AnimatedGradientDivider() {
  return (
    <div className="relative h-px w-full overflow-hidden">
      <motion.div
        className="absolute inset-0 h-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{ width: '50%' }}
      />
      <div className="absolute inset-0 h-full bg-gradient-to-r from-transparent via-border/40 to-transparent" />
    </div>
  );
}

// ============================================================
// "As Seen In" Media Logos Marquee (smooth infinite scroll) — Enhanced
// ============================================================
function MediaLogosMarquee() {
  const logos = ['TechCrunch', 'Forbes', 'Wired', 'EdTech', 'The Verge', 'VentureBeat'];

  return (
    <section className="py-10 bg-slate-800/20 overflow-hidden">
      {/* Animated gradient divider - top */}
      <AnimatedGradientDivider />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-xs text-slate-400 uppercase tracking-[0.2em] font-medium mb-6"
        >
          As Seen In
        </motion.p>
      </div>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-muted/20 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-muted/20 to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee-smooth">
          {[...logos, ...logos, ...logos, ...logos, ...logos, ...logos, ...logos, ...logos].map((logo, i) => (
            <div
              key={`${logo}-${i}`}
              className="flex items-center justify-center mx-8 sm:mx-12 shrink-0 group"
            >
              <motion.span
                className="text-xl sm:text-2xl font-bold text-slate-400/40 whitespace-nowrap tracking-tight select-none transition-all duration-500 group-hover:text-slate-400/70 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.55, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, delay: (i * 0.5) % 4, ease: 'easeInOut' }}
              >
                {logo}
              </motion.span>
            </div>
          ))}
        </div>
      </div>

      {/* Animated gradient divider - bottom */}
      <div className="mt-6">
        <AnimatedGradientDivider />
      </div>

      <style>{`
        @keyframes marquee-smooth {
          0% { transform: translateX(0); }
          100% { transform: translateX(-12.5%); }
        }
        .animate-marquee-smooth {
          animation: marquee-smooth 25s linear infinite;
        }
      `}</style>
    </section>
  );
}

// ============================================================
// Animated Stats Section (between hero and features)
// ============================================================
function AnimatedStatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const stats = [
    { target: 10000, suffix: '+', label: 'Creators', prefix: '', gradient: 'from-emerald-600 to-emerald-400', iconBg: 'bg-emerald-500/10' },
    { target: 500000, suffix: '+', label: 'Learners', prefix: '', gradient: 'from-violet-600 to-violet-400', iconBg: 'bg-violet-500/10' },
    { target: 50, suffix: '+', label: 'Currencies', prefix: '', gradient: 'from-amber-600 to-amber-400', iconBg: 'bg-amber-500/10' },
    { target: 99.9, suffix: '%', label: 'Uptime', prefix: '', gradient: 'from-sky-600 to-sky-400', iconBg: 'bg-sky-500/10', isDecimal: true },
  ];

  function StatCounter({ target, suffix, label, gradient, isDecimal = false }: {
    target: number; suffix: string; label: string; gradient: string; isDecimal?: boolean;
  }) {
    const [count, setCount] = useState(0);
    const prevTarget = useRef(0);

    useEffect(() => {
      if (!isInView) return;
      if (target === prevTarget.current) return;
      prevTarget.current = target;

      const duration = 2000;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = target * eased;
        setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.round(current));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, [target, isInView, isDecimal]);

    const displayValue = isDecimal
      ? count.toFixed(1)
      : count.toLocaleString('en-US');

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative group"
      >
        {/* Dot pattern behind each stat */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none opacity-[0.06]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id={`stat-dots-${label}`} width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="8" cy="8" r="1.2" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#stat-dots-${label})`} className="text-slate-50" />
          </svg>
        </div>

        <div className="relative rounded-2xl border border-white/10/30 bg-white/50 dark:bg-white/5 backdrop-blur-md p-6 sm:p-8 text-center transition-all duration-300 group-hover:border-white/10/60 group-hover:shadow-lg group-hover:scale-[1.02]">
          <p className={`text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {displayValue}{suffix}
          </p>
          <p className="mt-2 text-sm sm:text-base text-slate-400 font-medium">{label}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <section ref={ref} className="py-16 sm:py-20 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/10 via-background to-muted/10" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 left-1/4 h-[600px] w-[600px] rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-1/2 right-1/4 h-[600px] w-[600px] rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => (
            <StatCounter key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Live Dashboard Preview Section
// ============================================================
function LiveDashboardPreview() {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [urlText, setUrlText] = useState('');
  const fullUrl = 'academy.nextgen-lms.com/admin/dashboard';

  // Animated typing in URL bar
  useEffect(() => {
    let charIndex = 0;
    const typeTimer = setInterval(() => {
      if (charIndex < fullUrl.length) {
        setUrlText(fullUrl.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeTimer);
      }
    }, 50);
    return () => clearInterval(typeTimer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const kpiData = [
    { label: 'Total Revenue', value: 47800, prefix: '$', suffix: '', format: true, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Active Learners', value: 3847, prefix: '', suffix: '', format: true, color: 'from-violet-500 to-violet-600' },
    { label: 'Completion Rate', value: 72.4, prefix: '', suffix: '%', format: false, color: 'from-amber-500 to-amber-600' },
    { label: 'Engagement', value: 89.3, prefix: '', suffix: '%', format: false, color: 'from-sky-500 to-sky-600' },
  ];

  const chartBars = [40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88];

  const tableData = [
    { course: 'React Masterclass', learners: 847, revenue: '$12,450', status: 'Active' },
    { course: 'AI & ML Fundamentals', learners: 623, revenue: '$9,870', status: 'Active' },
    { course: 'Data Science Pro', learners: 534, revenue: '$8,120', status: 'Draft' },
  ];

  function formatNumber(n: number, shouldFormat: boolean): string {
    if (shouldFormat) return n.toLocaleString('en-US');
    return n.toFixed(1);
  }

  return (
    <section ref={sectionRef} className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-50">
            See Your{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">Dashboard</span> in Action
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Real-time insights, beautiful charts, and actionable data — all at your fingertips.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 via-violet-500/10 to-emerald-500/10 rounded-3xl blur-2xl" />

          {/* Floating animation wrapper */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="relative rounded-2xl border border-white/10/60 bg-slate-900 shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/10/40 bg-slate-800/30">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400 shadow-sm shadow-red-400/50" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400/50" />
                  <div className="h-3 w-3 rounded-full bg-green-400 shadow-sm shadow-green-400/50" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="h-7 w-72 rounded-md bg-slate-800/60 flex items-center justify-center px-3">
                    <span className="text-[11px] text-slate-400 truncate">
                      {urlText}
                      {urlText.length < fullUrl.length && (
                        <span className="inline-block w-0.5 h-3 bg-emerald-500 ml-0.5 animate-pulse align-middle" />
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dashboard mockup content */}
              <div className="p-5 sm:p-6 space-y-5">
                {/* KPI Cards Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {kpiData.map((kpi) => (
                    <div key={kpi.label} className="rounded-xl border border-white/10/40 bg-gradient-to-br from-muted/30 to-muted/10 p-4 hover:shadow-md transition-shadow">
                      <p className="text-xs text-slate-400 mb-1">{kpi.label}</p>
                      <p className="text-xl sm:text-2xl font-bold text-slate-50">
                        {kpi.prefix}
                        {inView ? formatNumber(kpi.value, kpi.format) : '0'}
                        {kpi.suffix}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">+12.5%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart + Table row */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  {/* Bar chart */}
                  <div className="sm:col-span-3 rounded-xl border border-white/10/40 bg-slate-800/10 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-50">Revenue Overview</span>
                      <span className="text-[10px] text-slate-400">Last 12 months</span>
                    </div>
                    <div className="h-28 flex items-end gap-1">
                      {chartBars.map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-emerald-600 to-emerald-400 min-w-0"
                          initial={{ height: 0 }}
                          animate={inView ? { height: `${h}%` } : { height: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 + i * 0.04, ease: 'easeOut' }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2">
                      {['Jan', 'Mar', 'Jun', 'Sep', 'Dec'].map((m) => (
                        <span key={m} className="text-[9px] text-slate-400">{m}</span>
                      ))}
                    </div>
                  </div>

                  {/* Mini table */}
                  <div className="sm:col-span-2 rounded-xl border border-white/10/40 bg-slate-800/10 p-4">
                    <span className="text-sm font-semibold text-slate-50 mb-3 block">Top Courses</span>
                    <div className="space-y-2">
                      {tableData.map((row) => (
                        <div key={row.course} className="flex items-center justify-between py-1.5 border-b border-white/10/20 last:border-0">
                          <div>
                            <p className="text-xs font-medium text-slate-50 truncate max-w-[120px]">{row.course}</p>
                            <p className="text-[10px] text-slate-400">{row.learners} learners</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-slate-50">{row.revenue}</p>
                            <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                              {row.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Reflection / glow below the preview */}
          <div className="relative mt-4">
            <div className="h-16 bg-gradient-to-b from-card/20 via-card/5 to-transparent rounded-b-2xl blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-1 w-3/4 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent rounded-full blur-sm" />
            </div>
          </div>

          {/* Try it yourself button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={() => goToLogin('admin')}>
              Try it yourself
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// Community Preview Section
// ============================================================
function CommunityPreview() {
  return (
    <section className="py-20 sm:py-28 bg-slate-800/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-50">
            A Thriving{' '}
            <span className="bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">Learning Community</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Built-in discussions, peer support, and knowledge sharing — no need for Slack or Discord.
          </motion.p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-4">
          {communityPreviewPosts.map((post, i) => (
            <motion.div
              key={post.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-white/10/60 group">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-full ${post.color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                      {post.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-50">{post.name}</span>
                        {post.pinned && (
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-[10px] px-1.5 py-0 gap-1">
                            <Pin className="h-2.5 w-2.5" /> Pinned
                          </Badge>
                        )}
                        <span className="text-xs text-slate-400">{post.timestamp}</span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{post.content}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <button onClick={() => goToLogin('learner')} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-500 transition-colors group/btn">
                          <Heart className="h-3.5 w-3.5 group-hover/btn:scale-110 transition-transform" />
                          {post.likes}
                        </button>
                        <button onClick={() => goToLogin('learner')} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-500 transition-colors">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {post.comments}
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="text-center pt-4"
          >
            <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white gap-2" onClick={() => goToLogin('learner')}>
              Join the Community
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Animated Star Rating
// ============================================================
function AnimatedStars({ delay = 0, rating = 5 }: { delay?: number; rating?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="flex gap-0.5 mb-3">
      {[0, 1, 2, 3, 4].map((j) => (
        <motion.div
          key={j}
          initial={{ opacity: 0, scale: 0, rotate: -30 }}
          animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
          transition={{ duration: 0.3, delay: delay + j * 0.08, ease: 'backOut' }}
        >
          <Star className={`h-3.5 w-3.5 ${j < rating ? 'fill-amber-400 text-amber-400' : 'fill-none text-slate-400/30'}`} />
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================
// Dot Pattern Background
// ============================================================
function DotPatternBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.04]">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" className="text-slate-50" />
      </svg>
    </div>
  );
}

// ============================================================
// Enhanced Testimonials Carousel (with dots, animated quotes, role badges)
// ============================================================
function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate every 5 seconds (pause on hover)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const next = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const slideVariants = {
    enter: (d: number) => ({
      x: d > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (d: number) => ({
      x: d > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Desktop: show all at a time */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, i) => (
          <motion.div
            key={testimonial.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="h-full border-white/10/60 hover:shadow-lg transition-shadow bg-gradient-to-br from-white/80 to-emerald-50/30 dark:from-card dark:to-emerald-950/10">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-sm font-bold">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-50">{testimonial.name}</p>
                    <p className="text-xs text-slate-400">{testimonial.role}</p>
                  </div>
                  <Badge className={`text-[9px] px-1.5 py-0 ${
                    testimonial.badge === 'Enterprise'
                      ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  }`}>
                    {testimonial.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <AnimatedStars delay={i * 0.15} rating={testimonial.rating} />
                {/* Animated quote marks */}
                <motion.span
                  className="absolute top-3 right-4 text-4xl font-serif text-emerald-200 dark:text-emerald-800/40 select-none"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.5, ease: 'backOut' }}
                >
                  &ldquo;
                </motion.span>
                <p className="text-sm text-slate-400 leading-relaxed relative z-10">&ldquo;{testimonial.quote}&rdquo;</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Mobile: carousel with single testimonial */}
      <div className="lg:hidden">
        <div className="relative overflow-hidden min-h-[280px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <Card className="border-white/10/60 bg-gradient-to-br from-white/80 to-emerald-50/30 dark:from-card dark:to-emerald-950/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-sm font-bold">
                      {testimonials[current].avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-50">{testimonials[current].name}</p>
                      <p className="text-xs text-slate-400">{testimonials[current].role}</p>
                    </div>
                    <Badge className={`text-[9px] px-1.5 py-0 ${
                      testimonials[current].badge === 'Enterprise'
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    }`}>
                      {testimonials[current].badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <AnimatedStars delay={0.1} rating={testimonials[current].rating} />
                  <span className="absolute top-0 right-4 text-4xl font-serif text-emerald-200 dark:text-emerald-800/40 select-none">&ldquo;</span>
                  <p className="text-sm text-slate-400 leading-relaxed relative z-10">&ldquo;{testimonials[current].quote}&rdquo;</p>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation with dots indicator */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={prev}
            className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-slate-800 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 bg-emerald-500' : 'w-2 bg-slate-800-foreground/30'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-slate-800 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Floating Stats Counter (fixed Math.random hydration issue)
// ============================================================
function FloatingStatsCounter() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1423);
  const tickIndex = useRef(0);

  // Deterministic tick values to avoid hydration mismatch
  const tickValues = [1, -1, 2, 0, 1, -2, 1, 0, 2, -1, 0, 1, -1, 2, 1, 0, -1, 1, 0, 2];

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('hero-section');
      if (heroSection) {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        setVisible(heroBottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Deterministically tick online count
  useEffect(() => {
    if (!visible || dismissed) return;
    const timer = setInterval(() => {
      const change = tickValues[tickIndex.current % tickValues.length];
      tickIndex.current++;
      setOnlineCount((prev) => Math.max(1200, Math.min(1600, prev + change)));
    }, 3000);
    return () => clearInterval(timer);
  }, [visible, dismissed]);

  if (dismissed || !visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed bottom-4 left-4 z-50"
    >
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="rounded-xl border border-white/10/40 bg-slate-950/80 backdrop-blur-xl shadow-xl px-4 py-3 flex items-center gap-3"
      >
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <div>
          <p className="text-sm font-semibold text-slate-50">{onlineCount.toLocaleString()} learners online</p>
          <p className="text-[10px] text-slate-400">across 30+ countries</p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="ml-2 h-5 w-5 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-50 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-3 w-3" />
        </button>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Animated Mesh Gradient Background (for features section)
// ============================================================
function MeshGradientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-emerald-500/8 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 -right-20 h-72 w-72 rounded-full bg-violet-500/8 blur-3xl"
        animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-amber-500/6 blur-3xl"
        animate={{ x: [0, 20, 0], y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/4 left-1/2 h-56 w-56 rounded-full bg-sky-500/5 blur-3xl"
        animate={{ x: [0, -15, 0], y: [0, -25, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

// ============================================================
// Mouse-Following Glow Feature Card
// ============================================================
function GlowFeatureCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mouse-following glow */}
      {isHovered && (
        <motion.div
          className="absolute pointer-events-none z-0"
          animate={{
            left: mousePos.x - 80,
            top: mousePos.y - 80,
            opacity: 1,
          }}
          initial={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{ width: 160, height: 160 }}
        >
          <div className="w-full h-full rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-xl" />
        </motion.div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ============================================================
// Pulsing Icon Container
// ============================================================
function PulsingIconContainer({ icon: Icon, index }: { icon: React.ElementType; index: number }) {
  const gradients = [
    'from-emerald-500 to-emerald-600',
    'from-violet-500 to-violet-600',
    'from-amber-500 to-amber-600',
    'from-sky-500 to-sky-600',
    'from-rose-500 to-rose-600',
    'from-teal-500 to-teal-600',
  ];
  const gradient = gradients[index % gradients.length];

  return (
    <motion.div
      className={`relative h-10 w-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 3, repeat: Infinity, delay: index * 0.3, ease: 'easeInOut' }}
    >
      <Icon className="h-5 w-5 text-white" />
      <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-300`} />
    </motion.div>
  );
}

// ============================================================
// Category Badge Colors
// ============================================================
const categoryColors: Record<string, string> = {
  AI: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  Commerce: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Community: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Analytics: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
};

// ============================================================
// Feature Tooltip
// ============================================================
function FeatureTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="h-4 w-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[8px] ml-1 hover:bg-slate-800-foreground/20 transition-colors"
        aria-label="More info"
      >
        ?
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 px-3 py-2 rounded-lg bg-popover border border-white/10 shadow-lg text-xs text-popover-foreground"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-border" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Connecting Lines Between Features (Desktop)
// ============================================================
function ConnectingLines() {
  return (
    <div className="hidden lg:block absolute inset-0 pointer-events-none overflow-hidden">
      <svg className="w-full h-full" style={{ opacity: 0.06 }}>
        {/* Diagonal lines connecting feature grid cells */}
        <line x1="33%" y1="25%" x2="66%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-emerald-500" />
        <line x1="66%" y1="25%" x2="33%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-emerald-500" />
        <line x1="33%" y1="50%" x2="66%" y2="75%" stroke="currentColor" strokeWidth="1" className="text-emerald-500" />
        <line x1="66%" y1="50%" x2="33%" y2="75%" stroke="currentColor" strokeWidth="1" className="text-emerald-500" />
      </svg>
    </div>
  );
}

// ============================================================
// Animated Price Counter
// ============================================================
function AnimatedPrice({ target, isInView }: { target: number; isInView: boolean }) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 1200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, isInView]);

  return <span>{count}</span>;
}

// ============================================================
// Animated Checkmark (for comparison table)
// ============================================================
function AnimatedCheckmark({ delay = 0, isInView }: { delay?: number; isInView: boolean }) {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => setDrawn(true), delay);
    return () => clearTimeout(timer);
  }, [delay, isInView]);

  return (
    <motion.svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className="mx-auto"
      initial={{ scale: 0 }}
      animate={drawn ? { scale: 1 } : { scale: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.path
        d="M3 8.5L6.5 12L13 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={drawn ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 0.5, delay: delay / 1000, ease: 'easeOut' }}
        className="text-emerald-500"
      />
    </motion.svg>
  );
}

// ============================================================
// Comparison Cell Helper (color-coded)
// ============================================================
function ComparisonCell({ value, isNextgen = false, isInView = false, rowIndex = 0 }: { value: string | boolean; isNextgen?: boolean; isInView?: boolean; rowIndex?: number }) {
  if (typeof value === 'boolean') {
    if (value) {
      return <AnimatedCheckmark delay={rowIndex * 80} isInView={isInView} />;
    }
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: rowIndex * 0.05 }}
      >
        <X className="h-4 w-4 mx-auto text-red-400" />
      </motion.div>
    );
  }
  // String value — check for "Limited" or "Partial"
  const isAmber = typeof value === 'string' && (value === 'Limited' || value === 'Partial' || value === 'Toxic mechanics');
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ delay: rowIndex * 0.05, duration: 0.3 }}
      className={`text-xs font-medium ${
        isNextgen ? 'text-emerald-700 dark:text-emerald-300' :
        isAmber ? 'text-amber-600 dark:text-amber-400' :
        'text-slate-400'
      }`}
    >
      {value}
    </motion.span>
  );
}

// ============================================================
// Feature Tooltip for Comparison Table
// ============================================================
function ComparisonFeatureTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block ml-1">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="h-3.5 w-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[7px] hover:bg-slate-800-foreground/20 transition-colors"
        aria-label={`Info about ${text}`}
      >
        i
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 z-50 w-52 px-3 py-2 rounded-lg bg-popover border border-white/10 shadow-lg text-xs text-popover-foreground"
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Countdown Timer (for CTA section)
// ============================================================
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (expired) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          setExpired(true);
          return { hours: 0, minutes: 0, seconds: 0 };
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [expired]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (expired) {
    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <span className="text-sm text-rose-400 font-medium">Offer Expired</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <span className="text-sm text-slate-400">Special offer ends in:</span>
      <div className="flex gap-1">
        {[
          { value: pad(timeLeft.hours), label: 'h' },
          { value: pad(timeLeft.minutes), label: 'm' },
          { value: pad(timeLeft.seconds), label: 's' },
        ].map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-1">
            <motion.div
              className="bg-white/10 rounded-md px-2 py-1 min-w-[32px] text-center"
              key={`${unit.label}-${unit.value}`}
              initial={{ y: -4, opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-lg font-bold text-white font-mono">{unit.value}</span>
              <span className="text-[10px] text-slate-400 ml-0.5">{unit.label}</span>
            </motion.div>
            {i < 2 && <span className="text-white/40 font-bold">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Social Proof Animated Counter
// ============================================================
function SocialProofCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const target = 10000;
    const duration = 2000;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView]);

  return (
    <div ref={ref} className="flex items-center justify-center gap-2 mt-4">
      <div className="flex -space-x-1.5">
        {['bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-sky-500'].map((color, i) => (
          <div key={i} className={`h-5 w-5 rounded-full ${color} border border-white/20`} />
        ))}
      </div>
      <p className="text-sm text-slate-300">
        Join <span className="font-bold text-white">{count.toLocaleString()}+</span> creators
      </p>
    </div>
  );
}

// ============================================================
// Back To Top Button
// ============================================================
function BackToTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 z-50 h-10 w-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center transition-colors"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// Landing Page Component
// ============================================================
export function LandingPage() {
  const { setView, setAppMode } = useAppStore();
  const router = useRouter();

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHoveringHero, setIsHoveringHero] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const handleMouseMoveHero = useCallback((e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const goToLogin = (mode?: string) => {
    const url = mode ? `/login?mode=${mode}` : '/login';
    router.push(url);
  };

  const goToCheckout = () => {
    setAppMode('learner');
    setView('checkout');
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Pricing section in-view for animated counters
  const pricingRef = useRef<HTMLDivElement>(null);
  const pricingInView = useInView(pricingRef, { once: true, margin: '-100px' });

  // Comparison section in-view for animated checkmarks
  const comparisonRef = useRef<HTMLDivElement>(null);
  const comparisonInView = useInView(comparisonRef, { once: true, margin: '-50px' });

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  }, []);

  const visibleFeatures = showAllFeatures ? features : features.slice(0, 8);

  // Avatar circles for social proof
  const avatarColors = [
    'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-sky-500',
    'bg-rose-500', 'bg-teal-500', 'bg-indigo-500', 'bg-orange-500',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 dark text-slate-50">
      {/* ============ NAVBAR ============ */}
      <header className="fixed top-5 left-4 right-4 z-50 rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-2xl shadow-black/40 max-w-7xl mx-auto transition-all duration-300 hover:border-white/20">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5 group cursor-pointer">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-base font-bold bg-gradient-to-r from-white via-slate-100 to-emerald-450 bg-clip-text text-transparent group-hover:text-white transition-colors duration-300">
                NextGen LMS
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-7 bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-md hover:border-emerald-500/20 transition-all duration-300 shadow-inner">
              <button onClick={() => scrollTo('about')} className="text-xs font-semibold text-slate-300 hover:text-emerald-400 hover:drop-shadow-[0_0_6px_rgba(52,211,153,0.4)] transition-all duration-200 cursor-pointer">Features</button>
              <button onClick={() => scrollTo('pricing')} className="text-xs font-semibold text-slate-300 hover:text-emerald-400 hover:drop-shadow-[0_0_6px_rgba(52,211,153,0.4)] transition-all duration-200 cursor-pointer">Pricing</button>
              <button onClick={() => scrollTo('comparison')} className="text-xs font-semibold text-slate-300 hover:text-emerald-400 hover:drop-shadow-[0_0_6px_rgba(52,211,153,0.4)] transition-all duration-200 cursor-pointer">Comparison</button>
              <button onClick={() => scrollTo('testimonials')} className="text-xs font-semibold text-slate-300 hover:text-emerald-400 hover:drop-shadow-[0_0_6px_rgba(52,211,153,0.4)] transition-all duration-200 cursor-pointer">Community</button>
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => goToLogin('learner')} className="text-slate-300 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 text-xs h-9 px-4 rounded-xl transition-all duration-300">
                Learner View
              </Button>
              <Button size="sm" onClick={() => goToLogin('admin')} className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs h-9 px-4 font-bold tracking-wide shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 rounded-xl">
                Enter Admin Dashboard
              </Button>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 rounded-xl text-slate-300 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="md:hidden border-t border-white/5 bg-slate-950/95 rounded-b-2xl overflow-hidden backdrop-blur-2xl"
            >
              <div className="px-5 py-5 space-y-3">
                <button onClick={() => scrollTo('about')} className="block w-full text-left text-sm text-slate-300 hover:text-emerald-400 py-2 border-b border-white/5">Features</button>
                <button onClick={() => scrollTo('pricing')} className="block w-full text-left text-sm text-slate-300 hover:text-emerald-400 py-2 border-b border-white/5">Pricing</button>
                <button onClick={() => scrollTo('comparison')} className="block w-full text-left text-sm text-slate-300 hover:text-emerald-400 py-2 border-b border-white/5">Comparison</button>
                <button onClick={() => scrollTo('testimonials')} className="block w-full text-left text-sm text-slate-300 hover:text-emerald-400 py-2">Community</button>
                <div className="pt-4 space-y-2 border-t border-white/5">
                  <Button variant="outline" size="sm" className="w-full border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl" onClick={() => goToLogin('learner')}>Learner View</Button>
                  <Button size="sm" className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl font-bold" onClick={() => goToLogin('admin')}>Enter Admin Dashboard</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        {/* ============ HERO SECTION ============ */}
        <section
          id="hero-section"
          ref={heroRef}
          onMouseMove={handleMouseMoveHero}
          onMouseEnter={() => setIsHoveringHero(true)}
          onMouseLeave={() => setIsHoveringHero(false)}
          className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
        >
          {/* Parallax Orbs */}
          <ParallaxOrbs />

          {/* Grid background */}
          <GridBackground />

          {/* Interactive spotlight follow cursor */}
          {isHoveringHero && (
            <motion.div
              className="absolute inset-0 pointer-events-none z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(16, 185, 129, 0.07), rgba(139, 92, 246, 0.03) 50%, transparent 80%)`,
              }}
            />
          )}

          {/* Animated Glowing Grid Beams */}
          <GridRays />

          {/* Constellation particles (dots + lines) */}
          <ConstellationParticles />

          {/* Floating particles */}
          <FloatingParticles />

          {/* Grain texture overlay */}
          <GrainOverlay />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center z-20">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                {/* Launching v3.0 floating badge with pulse */}
                <motion.div
                  className="inline-flex items-center gap-2 mb-4"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-emerald-400/20"
                      animate={{ opacity: [0, 0.5, 0], scale: [0.95, 1.05, 0.95] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <Rocket className="h-3.5 w-3.5 mr-1.5 relative z-10" />
                    <span className="relative z-10">Launching v3.0</span>
                  </Badge>
                </motion.div>

                <Badge variant="secondary" className="mb-2 px-4 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                  <Zap className="h-3.5 w-3.5 mr-1.5" />
                  Now with AI-Powered Course Generation
                </Badge>
              </motion.div>

              {/* Hero heading with rotating text */}
              <div className="relative inline-block">
                {/* Glowing pulse behind heading */}
                <motion.div
                  className="absolute inset-0 -m-8 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-violet-500/15 to-emerald-500/15 blur-2xl"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />

                <motion.h1
                  variants={fadeInUp}
                  className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-50 max-w-5xl mx-auto leading-[1.1]"
                >
                  <RotatingText phrases={['AI-Powered Architecture', 'Integrated Communities', 'Zero Transaction Fees']} />{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">for Modern Learning.</span>
                </motion.h1>
              </div>

              <motion.div
                variants={fadeInUp}
                className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
              >
                <ShimmerText>
                  <TypingText
                    text="The next-generation learning platform that combines AI content creation, built-in community, and zero-fee commerce — so you can focus on teaching, not platform limitations."
                    speed={25}
                    delay={800}
                  />
                </ShimmerText>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white text-base px-8 h-12" onClick={() => goToLogin('admin')}>
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="text-base px-8 h-12" onClick={() => goToLogin('learner')}>
                  <Play className="mr-2 h-4 w-4" />
                  View Demo Dashboard
                </Button>
              </motion.div>

              {/* Trusted by social proof row */}
              <motion.div
                variants={fadeInUp}
                className="mt-12 flex flex-col items-center gap-3"
              >
                <div className="flex -space-x-2">
                  {avatarColors.map((color, i) => (
                    <motion.div
                      key={i}
                      className={`h-8 w-8 rounded-full ${color} border-2 border-background flex items-center justify-center text-white text-[10px] font-bold`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + i * 0.05 }}
                    >
                      {['SC', 'MJ', 'PS', 'AR', 'ET', 'DW', 'KL', 'RH'][i]}
                    </motion.div>
                  ))}
                </div>
                <p className="text-sm text-slate-400">
                  Trusted by <span className="font-semibold text-slate-50">10,000+</span> creators worldwide
                </p>
              </motion.div>

              {/* Stats Row */}
              <motion.div
                variants={fadeInUp}
                className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
              >
                {[
                  { value: '10,000+', label: 'Learners' },
                  { value: '0%', label: 'Transaction Fees' },
                  { value: '50+', label: 'Countries' },
                  { value: '99.99%', label: 'Uptime' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-3xl sm:text-4xl font-bold text-slate-50">{stat.value}</p>
                    <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Floating Dashboard Mockup with 3D tilt */}
            <DashboardMockup />
          </div>
        </section>

        {/* ============ AS SEEN IN MEDIA LOGOS ============ */}
        <MediaLogosMarquee />

        {/* ============ ANIMATED STATS SECTION ============ */}
        <AnimatedStatsSection />

        {/* ============ FEATURES SECTION ============ */}
        <section id="about" className="py-20 sm:py-28 bg-slate-800/30 relative">
          {/* Mesh gradient background */}
          <MeshGradientBackground />

          {/* Connecting lines between features */}
          <ConnectingLines />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={sectionReveal}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={staggerContainer}
                className="text-center mb-16"
              >
                <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-50">
                  Everything You Need to{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">Teach & Scale</span>
                </motion.h2>
                <motion.p variants={fadeInUp} className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                  A complete ecosystem of tools designed for modern educators and creators.
                </motion.p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Feature Cards */}
                <div className="lg:col-span-2">
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={staggerContainerSlow}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                  >
                    {visibleFeatures.map((feature, idx) => {
                      const Icon = feature.icon;
                      return (
                        <motion.div key={feature.title} variants={fadeInUp} custom={idx}>
                          <GlowFeatureCard>
                            <Card className="h-full transition-all duration-300 border-white/10/40 bg-white/70 dark:bg-white/5 backdrop-blur-md group relative overflow-hidden hover:shadow-xl hover:border-white/10/60">
                              {/* Gradient overlay on hover */}
                              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-emerald-500/5 via-transparent to-violet-500/5 pointer-events-none" />
                              <CardHeader className="pb-3 relative">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <PulsingIconContainer icon={Icon} index={idx} />
                                  {/* Category badge */}
                                  <Badge className={`text-[9px] px-1.5 py-0 ${categoryColors[feature.category] || 'bg-slate-800 text-slate-400'}`}>
                                    {feature.category}
                                  </Badge>
                                  {/* Featured badge */}
                                  {feature.featured && (
                                    <Badge className="text-[9px] px-1.5 py-0 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 gap-0.5">
                                      <Trophy className="h-2.5 w-2.5" /> Featured
                                    </Badge>
                                  )}
                                </div>
                                <CardTitle className="text-base font-semibold mt-2 flex items-center">
                                  {feature.title}
                                  <FeatureTooltip text={feature.tooltip} />
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="relative">
                                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                              </CardContent>
                            </Card>
                          </GlowFeatureCard>
                        </motion.div>
                      );
                    })}
                  </motion.div>

                  {/* See All Features */}
                  {features.length > 8 && (
                    <div className="mt-6 text-center">
                      <Button
                        variant="outline"
                        onClick={() => setShowAllFeatures(!showAllFeatures)}
                        className="gap-2"
                      >
                        {showAllFeatures ? 'Show Less' : 'See All Features'}
                        <ChevronRight className={`h-4 w-4 transition-transform ${showAllFeatures ? 'rotate-90' : ''}`} />
                      </Button>
                    </div>
                  )}
                </div>

                {/* AI Live Demo */}
                <div className="lg:col-span-1">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="sticky top-24"
                  >
                    <AILiveDemo />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ============ LIVE DASHBOARD PREVIEW ============ */}
        <LiveDashboardPreview />

        {/* ============ PRICING SECTION ============ */}
        <section id="pricing" ref={pricingRef} className="py-20 sm:py-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={sectionReveal}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={staggerContainer}
                className="text-center mb-16"
              >
                <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-50">
                  Simple, Transparent{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">Pricing</span>
                </motion.h2>
                <motion.p variants={fadeInUp} className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                  No hidden fees. No transaction taxes. Start free and scale as you grow.
                </motion.p>

                {/* Monthly/Annual Toggle */}
                <motion.div variants={fadeInUp} className="mt-8 flex items-center justify-center gap-3">
                  <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-50' : 'text-slate-400'}`}>Monthly</span>
                  <button
                    onClick={() => setIsAnnual(!isAnnual)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isAnnual ? 'bg-emerald-600' : 'bg-slate-800'}`}
                    aria-label="Toggle annual pricing"
                  >
                    <motion.span
                      className="inline-block h-5 w-5 rounded-full bg-white shadow-sm"
                      animate={{ x: isAnnual ? 24 : 4 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                  <span className={`text-sm font-medium ${isAnnual ? 'text-slate-50' : 'text-slate-400'}`}>
                    Annual
                    <Badge className="ml-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-[10px] px-1.5 py-0 relative">
                      Save 17%
                      <SparkleParticles />
                    </Badge>
                  </span>
                </motion.div>
              </motion.div>

              <div className="space-y-16 max-w-6xl mx-auto">
                {/* Pricing Cards */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-100px' }}
                  variants={staggerContainer}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isAnnual ? 'annual' : 'monthly'}
                      initial={{ rotateY: isAnnual ? 90 : -90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: isAnnual ? -90 : 90, opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-8"
                      style={{ perspective: 1200 }}
                    >
                      {pricingPlans.map((plan) => {
                        const annualPrice = isAnnual ? Math.round(plan.price * 10 / 12) : plan.price;
                        const savingsPercent = isAnnual ? Math.round((1 - annualPrice / plan.price) * 100) : 0;
                        return (
                          <motion.div key={plan.id} variants={fadeInUp} whileHover={{ scale: 1.03, y: -4 }} transition={{ duration: 0.2 }}>
                            <GlowBorderCard highlighted={plan.highlighted}>
                              <Card className={`h-full relative ${plan.highlighted ? 'border-emerald-500 border-2 shadow-xl z-10 bg-slate-900' : 'border-white/10/60'}`}>
                                {plan.highlighted && (
                                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                    {/* Floating ribbon */}
                                    <motion.div
                                      animate={{ y: [0, -2, 0] }}
                                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    >
                                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-0.5 shadow-lg shadow-emerald-500/30">
                                        <Crown className="h-3 w-3 mr-1" /> Most Popular
                                      </Badge>
                                    </motion.div>
                                  </div>
                                )}
                                {/* Save X% badge on annual */}
                                {isAnnual && savingsPercent > 0 && (
                                  <div className="absolute top-3 right-3">
                                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-[10px] px-1.5 py-0">
                                      Save {savingsPercent}%
                                    </Badge>
                                  </div>
                                )}
                                <CardHeader className="pb-4">
                                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                                  <CardDescription className="text-sm min-h-[40px]">{plan.description}</CardDescription>
                                  <div className="mt-4">
                                    <span className="text-4xl font-bold text-slate-50">
                                      ${pricingInView ? <AnimatedPrice target={annualPrice} isInView={pricingInView} /> : annualPrice}
                                    </span>
                                    <span className="text-slate-400">{isAnnual ? '/mo (billed annually)' : plan.period}</span>
                                  </div>
                                </CardHeader>
                                <CardContent className="pb-2">
                                  <ul className="space-y-3">
                                    {plan.features.map((feature) => (
                                      <li key={feature} className="flex items-start gap-2.5 group/feature">
                                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                        <span className="text-sm text-slate-400">{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                                <CardFooter className="pt-4">
                                  <Button
                                    className={`w-full ${plan.highlighted ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                                    variant={plan.highlighted ? 'default' : 'outline'}
                                    onClick={plan.ctaText === 'Contact Sales' ? () => goToLogin('admin') : goToCheckout}
                                  >
                                    {plan.ctaText}
                                  </Button>
                                </CardFooter>
                              </Card>
                            </GlowBorderCard>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>

                {/* Savings Calculator */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="max-w-xl mx-auto"
                >
                  <SavingsCalculator />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ============ COMMUNITY PREVIEW ============ */}
        <CommunityPreview />

        {/* ============ COMPETITOR COMPARISON ============ */}
        <section id="comparison" ref={comparisonRef} className="py-20 sm:py-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={sectionReveal}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={staggerContainer}
                className="text-center mb-16"
              >
                <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-50">
                  How We{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">Compare</span>
                </motion.h2>
                <motion.p variants={fadeInUp} className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                  See why thousands of creators choose NextGen LMS over the competition.
                </motion.p>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900"
              >
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-slate-800/50">
                      <th className="text-left py-4 px-4 text-sm font-semibold text-slate-50">Feature</th>
                      <th className="text-center py-4 px-4 text-sm font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 relative">
                        NextGen
                        {/* Winner badge */}
                        <div className="absolute -top-0.5 right-2">
                          <Badge className="text-[8px] px-1 py-0 bg-emerald-600 text-white">
                            <Trophy className="h-2 w-2 mr-0.5" /> Winner
                          </Badge>
                        </div>
                      </th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-slate-400">Kajabi</th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-slate-400">Teachable</th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-slate-400">Skool</th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-slate-400">Mighty Networks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitorComparison.map((row, i) => (
                      <motion.tr
                        key={row.feature}
                        className={`${i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/20'} hover:bg-slate-800/40 transition-colors`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={comparisonInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                      >
                        <td className="py-3 px-4 text-sm font-medium text-slate-50 flex items-center">
                          {row.feature}
                          <ComparisonFeatureTooltip text={`Compare ${row.feature} across platforms`} />
                        </td>
                        <td className="py-3 px-4 text-center bg-emerald-50/50 dark:bg-emerald-950/30">
                          <ComparisonCell value={row.nextgen} isNextgen isInView={comparisonInView} rowIndex={i} />
                        </td>
                        <td className="py-3 px-4 text-center"><ComparisonCell value={row.kajabi} isInView={comparisonInView} rowIndex={i} /></td>
                        <td className="py-3 px-4 text-center"><ComparisonCell value={row.teachable} isInView={comparisonInView} rowIndex={i} /></td>
                        <td className="py-3 px-4 text-center"><ComparisonCell value={row.skool} isInView={comparisonInView} rowIndex={i} /></td>
                        <td className="py-3 px-4 text-center"><ComparisonCell value={row.mightyNetworks} isInView={comparisonInView} rowIndex={i} /></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ============ TESTIMONIALS SECTION ============ */}
        <section id="testimonials" className="py-20 sm:py-28 bg-slate-800/30 relative">
          {/* Dot pattern background */}
          <DotPatternBackground />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={sectionReveal}
          >
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={staggerContainer}
                className="text-center mb-16"
              >
                <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-50">
                  Loved by{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">Creators Worldwide</span>
                </motion.h2>
                <motion.p variants={fadeInUp} className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                  Join thousands of educators who are building thriving learning businesses.
                </motion.p>
              </motion.div>

              <TestimonialCarousel />
            </div>
          </motion.div>
        </section>

        {/* ============ INTEGRATIONS SECTION ============ */}
        <section className="py-20 sm:py-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={sectionReveal}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={staggerContainer}
                className="text-center mb-16"
              >
                <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-50">
                  Seamless{' '}
                  <span className="bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">Integrations</span>
                </motion.h2>
                <motion.p variants={fadeInUp} className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                  Connect your favorite tools and automate workflows with our growing integration ecosystem.
                </motion.p>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={staggerContainer}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
              >
                {integrations.map((integration) => {
                  const Icon = integration.icon;
                  return (
                    <motion.div
                      key={integration.name}
                      variants={fadeInUp}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="cursor-pointer"
                    >
                      <Card className="border-white/10/40 hover:border-white/10 hover:shadow-md transition-all">
                        <CardContent className="p-4 flex flex-col items-center gap-3 text-center">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${integration.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <span className="text-sm font-medium text-slate-50">{integration.name}</span>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* And 50+ more badge */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center"
              >
                <Badge variant="secondary" className="px-4 py-2 text-sm bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800">
                  And 50+ more integrations...
                </Badge>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ============ CONTACT SECTION ============ */}
        <section id="contact" className="py-12 bg-slate-800/20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-xl font-bold text-slate-50 mb-2">Get in Touch</h3>
            <p className="text-sm text-slate-400 mb-4">Have questions? We&apos;d love to hear from you.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:hello@nextgen-lms.com" className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors">hello@nextgen-lms.com</a>
              <span className="hidden sm:inline text-slate-400">•</span>
              <span className="text-sm text-slate-400">Response within 24 hours</span>
            </div>
          </div>
        </section>

        {/* ============ CTA SECTION ============ */}
        <section className="py-20 sm:py-28 relative overflow-hidden">
          {/* Dramatic gradient mesh background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"
              animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl"
              animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-teal-500/5 blur-3xl"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Additional flowing mesh gradients */}
            <motion.div
              className="absolute top-[20%] left-[30%] h-[300px] w-[300px] rounded-full bg-emerald-600/8 blur-3xl"
              animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-[10%] right-[20%] h-[250px] w-[250px] rounded-full bg-teal-500/6 blur-3xl"
              animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Floating geometric shapes with learning-related icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Circles */}
            <motion.div
              className="absolute top-[10%] left-[10%] h-16 w-16 rounded-full border border-white/5"
              animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute top-[60%] right-[15%] h-12 w-12 rounded-full border border-emerald-500/10"
              animate={{ y: [0, 15, 0], rotate: [0, -90, -180] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute top-[30%] right-[8%] h-8 w-8 rounded-full bg-emerald-500/5"
              animate={{ y: [0, -25, 0], x: [0, 10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Floating learning icons */}
            <motion.div
              className="absolute top-[15%] left-[25%] text-emerald-400/10"
              animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <BookOpen className="h-8 w-8" />
            </motion.div>
            <motion.div
              className="absolute top-[40%] left-[8%] text-violet-400/10"
              animate={{ y: [0, 12, 0], x: [0, -8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Lightbulb className="h-6 w-6" />
            </motion.div>
            <motion.div
              className="absolute bottom-[25%] right-[10%] text-emerald-400/10"
              animate={{ y: [0, -18, 0], rotate: [0, -15, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Target className="h-7 w-7" />
            </motion.div>
            <motion.div
              className="absolute bottom-[15%] left-[15%] text-amber-400/8"
              animate={{ y: [0, 10, 0], x: [0, 12, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <GraduationCap className="h-8 w-8" />
            </motion.div>
            {/* Squares */}
            <motion.div
              className="absolute bottom-[20%] left-[20%] h-10 w-10 rounded-sm border border-violet-500/10 rotate-45"
              animate={{ y: [0, 20, 0], rotate: [45, 135, 225] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute top-[15%] right-[25%] h-6 w-6 rounded-sm bg-white/3 rotate-12"
              animate={{ y: [0, -12, 0], rotate: [12, 72, 132] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />
            {/* Diamond */}
            <motion.div
              className="absolute bottom-[35%] right-[30%] h-8 w-8 rotate-45 border border-emerald-400/10"
              animate={{ y: [0, 18, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Grid / dot pattern overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="cta-dots" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="15" cy="15" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cta-dots)" />
            </svg>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Ready to Transform Your Learning Platform?
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto">
              Join thousands of creators who are building profitable, engaging learning experiences with zero transaction fees.
            </motion.p>

            {/* Countdown Timer */}
            <motion.div variants={fadeInUp}>
              <CountdownTimer />
            </motion.div>

            {/* Social proof counter */}
            <SocialProofCounter />

            <motion.div variants={fadeInUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="relative group/btn"
              >
                {/* Liquid glow behind button */}
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 opacity-0 group-hover/btn:opacity-60 blur-md transition-opacity duration-500" />
                <Button size="lg" className="relative bg-emerald-600 hover:bg-emerald-500 text-white text-base px-8 h-12 transition-all duration-300" onClick={() => goToLogin('admin')}>
                  Start Free Trial
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="relative group/btn2"
              >
                <div className="absolute -inset-1 rounded-lg bg-white/10 opacity-0 group-hover/btn2:opacity-100 blur-md transition-opacity duration-500" />
                <Button size="lg" variant="outline" className="relative text-base px-8 h-12 border-slate-500 text-white hover:bg-white/10 transition-all duration-300" onClick={() => goToLogin('learner')}>
                  Explore as Learner
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="relative border-t border-white/5 bg-[#020617] mt-auto overflow-hidden">
        {/* Ambient Glow behind footer content */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
        
        {/* Glowing border top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 z-10">
          {/* Trusted by teams */}
          <div className="mb-14 text-center">
            <p className="text-[10px] text-emerald-400 mb-6 uppercase tracking-widest font-bold font-mono">Trusted by teams at</p>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-80">
              {['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Stark Industries'].map((company) => (
                <div key={company} className="flex items-center gap-2 text-slate-400 hover:text-white transition-all duration-300 hover:scale-[1.04]">
                  <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-md">
                    <GraduationCap className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span className="text-xs font-semibold tracking-wide">{company}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 border-t border-white/5 pt-12">
            {/* Brand details */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-100 to-emerald-450 bg-clip-text text-transparent">
                  NextGen LMS
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The next-generation learning management system for creators, educators, and organizations. AI-powered, community-integrated, and zero transaction fees.
              </p>
              {/* Social media icons with hover animations */}
              <div className="flex gap-3 pt-2">
                {[
                  { Icon: Twitter, hoverColor: 'hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-950/20', href: 'https://twitter.com' },
                  { Icon: Linkedin, hoverColor: 'hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-950/20', href: 'https://linkedin.com' },
                  { Icon: Github, hoverColor: 'hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-950/20', href: 'https://github.com' },
                  { Icon: Youtube, hoverColor: 'hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-950/20', href: 'https://youtube.com' },
                ].map(({ Icon, hoverColor, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`h-9 w-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 transition-all duration-300 ${hoverColor}`}
                    aria-label="Social media"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links - Product */}
            <div>
              <h4 className="text-xs font-bold font-mono text-white uppercase tracking-widest mb-5">Product</h4>
              <ul className="space-y-3.5">
                {[
                  { label: 'About', id: 'about' },
                  { label: 'Features', id: 'features' },
                  { label: 'Pricing', id: 'pricing' },
                  { label: 'Contact', id: 'contact' },
                ].map(({ label, id }) => (
                  <li key={label}>
                    <button
                      onClick={() => scrollTo(id)}
                      className="text-xs text-slate-400 hover:text-emerald-400 hover:translate-x-1 transition-all cursor-pointer font-medium"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Links - Resources */}
            <div>
              <h4 className="text-xs font-bold font-mono text-white uppercase tracking-widest mb-5">Resources</h4>
              <ul className="space-y-3.5">
                {[
                  { label: 'Documentation', href: '#' },
                  { label: 'API Reference', href: '#' },
                  { label: 'Blog', href: '#' },
                  { label: 'Changelog', href: '#' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-emerald-400 hover:translate-x-1 transition-all font-medium"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter wrapped in a premium card */}
            <div className="bg-slate-900/50 border border-white/10 p-5 rounded-2xl backdrop-blur-xl hover:border-emerald-500/20 transition-all duration-300 shadow-lg shadow-black/20">
              <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-widest mb-2">Stay Updated</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                Join our newsletter to receive feature releases, AI learning tips, and early creator updates.
              </p>
              {subscribed ? (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-xs text-emerald-450 font-bold py-2"
                >
                  <Check className="h-4 w-4 shrink-0" />
                  <span>Thanks for subscribing!</span>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 text-xs bg-slate-950/80 border-white/10 text-white placeholder-slate-500 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 focus-visible:ring-emerald-500/20"
                  />
                  <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shrink-0 gap-1.5 rounded-xl h-9 font-bold shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all active:scale-98" onClick={async () => { if (email) { try { await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); setSubscribed(true); } catch { setSubscribed(true); } } }}>
                    <Mail className="h-3.5 w-3.5" />
                    Subscribe
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} NextGen LMS. All rights reserved.
            </p>
            <div className="flex gap-6">
              <LegalLinks />
            </div>
          </div>
        </div>
      </footer>

      {/* ============ FLOATING STATS COUNTER ============ */}
      <FloatingStatsCounter />

      {/* ============ BACK TO TOP BUTTON ============ */}
      <BackToTopButton />
    </div>
  );
}
