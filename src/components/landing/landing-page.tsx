'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/app-store';
import { pricingPlans, competitorComparison } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
      <style jsx>{`
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

// ============================================================
// Animated Grid Background
// ============================================================
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" className="text-foreground" />
      </svg>
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
        className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"
        style={{ y: y1 }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl"
        style={{ y: y2 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-slate-500/5 blur-3xl"
        style={{ y: y3 }}
      />
    </div>
  );
}

// ============================================================
// Floating Dashboard Mockup (Hero) — with 3D perspective tilt on mouse move
// ============================================================
function DashboardMockup() {
  const mockupRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

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
      className="relative mx-auto mt-12 max-w-4xl"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
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
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-violet-500/20 to-emerald-500/20 rounded-2xl blur-2xl" />

            {/* Mockup Card */}
            <div className="relative rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-2xl overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="h-6 w-64 rounded-md bg-muted/60 flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground">academy.nextgen-lms.com/dashboard</span>
                  </div>
                </div>
              </div>

              {/* Dashboard content mockup */}
              <div className="p-4 space-y-3">
                {/* Sidebar + main */}
                <div className="flex gap-3">
                  {/* Mini sidebar */}
                  <div className="w-12 shrink-0 space-y-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/20 mx-auto" />
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="h-6 w-8 rounded bg-muted/60 mx-auto" />
                    ))}
                  </div>
                  {/* Main area */}
                  <div className="flex-1 space-y-3">
                    {/* KPI row */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'Revenue', value: '$47.8K', color: 'bg-emerald-500/10' },
                        { label: 'Learners', value: '3,847', color: 'bg-violet-500/10' },
                        { label: 'Completion', value: '72.4%', color: 'bg-amber-500/10' },
                        { label: 'Engagement', value: '89.3%', color: 'bg-sky-500/10' },
                      ].map((kpi) => (
                        <div key={kpi.label} className={`rounded-lg ${kpi.color} p-2.5`}>
                          <p className="text-[9px] text-muted-foreground">{kpi.label}</p>
                          <p className="text-sm font-bold text-foreground">{kpi.value}</p>
                        </div>
                      ))}
                    </div>
                    {/* Chart area */}
                    <div className="h-20 rounded-lg bg-muted/30 border border-border/30 flex items-end p-2 gap-0.5">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-emerald-500 to-emerald-400"
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 0.6, delay: 1 + i * 0.05, ease: 'easeOut' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
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
        <div className="rounded-lg bg-card/80 border border-border/40 p-3 font-mono text-xs space-y-1.5">
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
            <div className="flex items-center gap-2 text-foreground">
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
            <span className="text-sm text-muted-foreground">Monthly Revenue</span>
            <span className="text-lg font-bold text-foreground">${revenue.toLocaleString()}</span>
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
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
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
    <section className="py-10 bg-muted/20 overflow-hidden">
      {/* Animated gradient divider - top */}
      <AnimatedGradientDivider />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-xs text-muted-foreground uppercase tracking-[0.2em] font-medium mb-6"
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
                className="text-xl sm:text-2xl font-bold text-muted-foreground/40 whitespace-nowrap tracking-tight select-none transition-all duration-500 group-hover:text-muted-foreground/70 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
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

      <style jsx>{`
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
            <rect width="100%" height="100%" fill={`url(#stat-dots-${label})`} className="text-foreground" />
          </svg>
        </div>

        <div className="relative rounded-2xl border border-border/30 bg-white/50 dark:bg-white/5 backdrop-blur-md p-6 sm:p-8 text-center transition-all duration-300 group-hover:border-border/60 group-hover:shadow-lg group-hover:scale-[1.02]">
          <p className={`text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {displayValue}{suffix}
          </p>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground font-medium">{label}</p>
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
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-foreground">
            See Your{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">Dashboard</span> in Action
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
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
            <div className="relative rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/40 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400 shadow-sm shadow-red-400/50" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400/50" />
                  <div className="h-3 w-3 rounded-full bg-green-400 shadow-sm shadow-green-400/50" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="h-7 w-72 rounded-md bg-muted/60 flex items-center justify-center px-3">
                    <span className="text-[11px] text-muted-foreground truncate">
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
                    <div key={kpi.label} className="rounded-xl border border-border/40 bg-gradient-to-br from-muted/30 to-muted/10 p-4 hover:shadow-md transition-shadow">
                      <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                      <p className="text-xl sm:text-2xl font-bold text-foreground">
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
                  <div className="sm:col-span-3 rounded-xl border border-border/40 bg-muted/10 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-foreground">Revenue Overview</span>
                      <span className="text-[10px] text-muted-foreground">Last 12 months</span>
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
                        <span key={m} className="text-[9px] text-muted-foreground">{m}</span>
                      ))}
                    </div>
                  </div>

                  {/* Mini table */}
                  <div className="sm:col-span-2 rounded-xl border border-border/40 bg-muted/10 p-4">
                    <span className="text-sm font-semibold text-foreground mb-3 block">Top Courses</span>
                    <div className="space-y-2">
                      {tableData.map((row) => (
                        <div key={row.course} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
                          <div>
                            <p className="text-xs font-medium text-foreground truncate max-w-[120px]">{row.course}</p>
                            <p className="text-[10px] text-muted-foreground">{row.learners} learners</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-foreground">{row.revenue}</p>
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
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={() => useAppStore.getState().enterAdminMode()}>
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
    <section className="py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-foreground">
            A Thriving{' '}
            <span className="bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">Learning Community</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
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
              <Card className="hover:shadow-lg transition-all duration-300 border-border/60 group">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-full ${post.color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                      {post.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{post.name}</span>
                        {post.pinned && (
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-[10px] px-1.5 py-0 gap-1">
                            <Pin className="h-2.5 w-2.5" /> Pinned
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{post.content}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-rose-500 transition-colors group/btn">
                          <Heart className="h-3.5 w-3.5 group-hover/btn:scale-110 transition-transform" />
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-emerald-500 transition-colors">
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
            <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white gap-2" onClick={() => useAppStore.getState().enterLearnerMode()}>
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
          <Star className={`h-3.5 w-3.5 ${j < rating ? 'fill-amber-400 text-amber-400' : 'fill-none text-muted-foreground/30'}`} />
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
        <rect width="100%" height="100%" fill="url(#dots)" className="text-foreground" />
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
            <Card className="h-full border-border/60 hover:shadow-lg transition-shadow bg-gradient-to-br from-white/80 to-emerald-50/30 dark:from-card dark:to-emerald-950/10">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-sm font-bold">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
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
                <p className="text-sm text-muted-foreground leading-relaxed relative z-10">&ldquo;{testimonial.quote}&rdquo;</p>
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
              <Card className="border-border/60 bg-gradient-to-br from-white/80 to-emerald-50/30 dark:from-card dark:to-emerald-950/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-sm font-bold">
                      {testimonials[current].avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{testimonials[current].name}</p>
                      <p className="text-xs text-muted-foreground">{testimonials[current].role}</p>
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
                  <p className="text-sm text-muted-foreground leading-relaxed relative z-10">&ldquo;{testimonials[current].quote}&rdquo;</p>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation with dots indicator */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={prev}
            className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
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
                  i === current ? 'w-6 bg-emerald-500' : 'w-2 bg-muted-foreground/30'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
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
  const [onlineCount, setOnlineCount] = useState(2847);
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
      setOnlineCount((prev) => Math.max(2800, Math.min(2900, prev + change)));
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
        className="rounded-xl border border-border/40 bg-background/80 backdrop-blur-xl shadow-xl px-4 py-3 flex items-center gap-3"
      >
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <div>
          <p className="text-sm font-semibold text-foreground">{onlineCount.toLocaleString()} learners online</p>
          <p className="text-[10px] text-muted-foreground">across 50+ countries</p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="ml-2 h-5 w-5 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
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
        className="h-4 w-4 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[8px] ml-1 hover:bg-muted-foreground/20 transition-colors"
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
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 px-3 py-2 rounded-lg bg-popover border border-border shadow-lg text-xs text-popover-foreground"
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
        'text-muted-foreground'
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
        className="h-3.5 w-3.5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[7px] hover:bg-muted-foreground/20 transition-colors"
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
            className="absolute bottom-full left-0 mb-2 z-50 w-52 px-3 py-2 rounded-lg bg-popover border border-border shadow-lg text-xs text-popover-foreground"
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

  useEffect(() => {
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
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

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
  const { enterAdminMode, enterLearnerMode, setView, setAppMode } = useAppStore();

  const goToCheckout = () => {
    setAppMode('admin');
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* ============ NAVBAR ============ */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-emerald-600 bg-clip-text text-transparent">
                NextGen LMS
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollTo('features')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</button>
              <button onClick={() => scrollTo('pricing')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</button>
              <button onClick={() => scrollTo('comparison')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Comparison</button>
              <button onClick={() => scrollTo('testimonials')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Community</button>
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={enterLearnerMode}>
                Learner View
              </Button>
              <Button size="sm" onClick={enterAdminMode} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Enter Admin Dashboard
              </Button>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-background"
            >
              <div className="px-4 py-4 space-y-3">
                <button onClick={() => scrollTo('features')} className="block w-full text-left text-sm text-muted-foreground hover:text-foreground py-2">Features</button>
                <button onClick={() => scrollTo('pricing')} className="block w-full text-left text-sm text-muted-foreground hover:text-foreground py-2">Pricing</button>
                <button onClick={() => scrollTo('comparison')} className="block w-full text-left text-sm text-muted-foreground hover:text-foreground py-2">Comparison</button>
                <button onClick={() => scrollTo('testimonials')} className="block w-full text-left text-sm text-muted-foreground hover:text-foreground py-2">Community</button>
                <div className="pt-2 space-y-2">
                  <Button variant="outline" size="sm" className="w-full" onClick={enterLearnerMode}>Learner View</Button>
                  <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={enterAdminMode}>Enter Admin Dashboard</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        {/* ============ HERO SECTION ============ */}
        <section id="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
          {/* Parallax Orbs */}
          <ParallaxOrbs />

          {/* Grid background */}
          <GridBackground />

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
                  className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-5xl mx-auto leading-[1.1]"
                >
                  <RotatingText phrases={['AI-Powered Architecture', 'Integrated Communities', 'Zero Transaction Fees']} />{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">for Modern Learning.</span>
                </motion.h1>
              </div>

              <motion.div
                variants={fadeInUp}
                className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
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
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white text-base px-8 h-12" onClick={enterAdminMode}>
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="text-base px-8 h-12" onClick={enterLearnerMode}>
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
                <p className="text-sm text-muted-foreground">
                  Trusted by <span className="font-semibold text-foreground">10,000+</span> creators worldwide
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
                    <p className="text-3xl sm:text-4xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
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
        <section id="features" className="py-20 sm:py-28 bg-muted/30 relative">
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
                <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-foreground">
                  Everything You Need to{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">Teach & Scale</span>
                </motion.h2>
                <motion.p variants={fadeInUp} className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
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
                            <Card className="h-full transition-all duration-300 border-border/40 bg-white/70 dark:bg-white/5 backdrop-blur-md group relative overflow-hidden hover:shadow-xl hover:border-border/60">
                              {/* Gradient overlay on hover */}
                              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-emerald-500/5 via-transparent to-violet-500/5 pointer-events-none" />
                              <CardHeader className="pb-3 relative">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <PulsingIconContainer icon={Icon} index={idx} />
                                  {/* Category badge */}
                                  <Badge className={`text-[9px] px-1.5 py-0 ${categoryColors[feature.category] || 'bg-muted text-muted-foreground'}`}>
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
                                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
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
                <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-foreground">
                  Simple, Transparent{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">Pricing</span>
                </motion.h2>
                <motion.p variants={fadeInUp} className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                  No hidden fees. No transaction taxes. Start free and scale as you grow.
                </motion.p>

                {/* Monthly/Annual Toggle */}
                <motion.div variants={fadeInUp} className="mt-8 flex items-center justify-center gap-3">
                  <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
                  <button
                    onClick={() => setIsAnnual(!isAnnual)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isAnnual ? 'bg-emerald-600' : 'bg-muted'}`}
                    aria-label="Toggle annual pricing"
                  >
                    <motion.span
                      className="inline-block h-5 w-5 rounded-full bg-white shadow-sm"
                      animate={{ x: isAnnual ? 24 : 4 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                  <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Annual
                    <Badge className="ml-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-[10px] px-1.5 py-0 relative">
                      Save 17%
                      <SparkleParticles />
                    </Badge>
                  </span>
                </motion.div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Pricing Cards */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-100px' }}
                  variants={staggerContainer}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isAnnual ? 'annual' : 'monthly'}
                      initial={{ rotateY: isAnnual ? 90 : -90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: isAnnual ? -90 : 90, opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-6"
                      style={{ perspective: 1200 }}
                    >
                      {pricingPlans.map((plan) => {
                        const annualPrice = isAnnual ? Math.round(plan.price * 10 / 12) : plan.price;
                        const savingsPercent = isAnnual ? Math.round((1 - annualPrice / plan.price) * 100) : 0;
                        return (
                          <motion.div key={plan.id} variants={fadeInUp} whileHover={{ scale: 1.03, y: -4 }} transition={{ duration: 0.2 }}>
                            <GlowBorderCard highlighted={plan.highlighted}>
                              <Card className={`h-full relative ${plan.highlighted ? 'border-emerald-500 border-2 shadow-xl z-10 bg-card' : 'border-border/60'}`}>
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
                                    <span className="text-4xl font-bold text-foreground">
                                      ${pricingInView ? <AnimatedPrice target={annualPrice} isInView={pricingInView} /> : annualPrice}
                                    </span>
                                    <span className="text-muted-foreground">{isAnnual ? '/mo (billed annually)' : plan.period}</span>
                                  </div>
                                </CardHeader>
                                <CardContent className="pb-2">
                                  <ul className="space-y-3">
                                    {plan.features.map((feature) => (
                                      <li key={feature} className="flex items-start gap-2.5 group/feature">
                                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                        <span className="text-sm text-muted-foreground">{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                                <CardFooter className="pt-4">
                                  <Button
                                    className={`w-full ${plan.highlighted ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                                    variant={plan.highlighted ? 'default' : 'outline'}
                                    onClick={plan.ctaText === 'Contact Sales' ? enterAdminMode : goToCheckout}
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
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex items-start"
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
                <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-foreground">
                  How We{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">Compare</span>
                </motion.h2>
                <motion.p variants={fadeInUp} className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                  See why thousands of creators choose NextGen LMS over the competition.
                </motion.p>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                className="overflow-x-auto rounded-xl border border-border bg-card"
              >
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Feature</th>
                      <th className="text-center py-4 px-4 text-sm font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 relative">
                        NextGen
                        {/* Winner badge */}
                        <div className="absolute -top-0.5 right-2">
                          <Badge className="text-[8px] px-1 py-0 bg-emerald-600 text-white">
                            <Trophy className="h-2 w-2 mr-0.5" /> Winner
                          </Badge>
                        </div>
                      </th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-muted-foreground">Kajabi</th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-muted-foreground">Teachable</th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-muted-foreground">Skool</th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-muted-foreground">Mighty Networks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitorComparison.map((row, i) => (
                      <motion.tr
                        key={row.feature}
                        className={`${i % 2 === 0 ? 'bg-card' : 'bg-muted/20'} hover:bg-muted/40 transition-colors`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={comparisonInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                      >
                        <td className="py-3 px-4 text-sm font-medium text-foreground flex items-center">
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
        <section id="testimonials" className="py-20 sm:py-28 bg-muted/30 relative">
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
                <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-foreground">
                  Loved by{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">Creators Worldwide</span>
                </motion.h2>
                <motion.p variants={fadeInUp} className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
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
                <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-foreground">
                  Seamless{' '}
                  <span className="bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">Integrations</span>
                </motion.h2>
                <motion.p variants={fadeInUp} className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
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
                      <Card className="border-border/40 hover:border-border hover:shadow-md transition-all">
                        <CardContent className="p-4 flex flex-col items-center gap-3 text-center">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${integration.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{integration.name}</span>
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
                <Button size="lg" className="relative bg-emerald-600 hover:bg-emerald-500 text-white text-base px-8 h-12 transition-all duration-300" onClick={enterAdminMode}>
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
                <Button size="lg" variant="outline" className="relative text-base px-8 h-12 border-slate-500 text-white hover:bg-white/10 transition-all duration-300" onClick={enterLearnerMode}>
                  Explore as Learner
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-border bg-card mt-auto relative">
        {/* Gradient top border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Trusted by teams */}
          <div className="mb-10 text-center">
            <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider font-medium">Trusted by teams at</p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
              {['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Stark Industries'].map((company) => (
                <div key={company} className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
                    <GraduationCap className="h-3 w-3" />
                  </div>
                  <span className="text-sm font-semibold">{company}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand + Newsletter */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-emerald-600 bg-clip-text text-transparent">
                  NextGen LMS
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                The next-generation learning management system for creators, educators, and organizations. AI-powered, community-integrated, and zero transaction fees.
              </p>
              {/* Social media icons with hover animations */}
              <div className="flex gap-3 mt-4">
                {[
                  { Icon: Twitter, hoverColor: 'hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/40' },
                  { Icon: Linkedin, hoverColor: 'hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40' },
                  { Icon: Github, hoverColor: 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800' },
                  { Icon: Youtube, hoverColor: 'hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40' },
                ].map(({ Icon, hoverColor }, i) => (
                  <motion.button
                    key={i}
                    className={`h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground transition-colors ${hoverColor}`}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Social media"
                  >
                    <Icon className="h-4 w-4" />
                  </motion.button>
                ))}
              </div>

              {/* Newsletter Signup */}
              <div className="mt-6">
                <p className="text-sm font-medium text-foreground mb-2">Stay updated</p>
                {subscribed ? (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400"
                  >
                    <Check className="h-4 w-4" />
                    <span>Thanks for subscribing!</span>
                  </motion.div>
                ) : (
                  <div className="flex gap-2 max-w-sm">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-9 text-sm"
                    />
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 gap-1.5" onClick={() => { if (email) setSubscribed(true); }}>
                      <Mail className="h-3.5 w-3.5" />
                      Subscribe
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                {['About', 'Features', 'Pricing', 'Contact'].map((link) => (
                  <li key={link}>
                    <button
                      onClick={() => scrollTo(link.toLowerCase())}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2">
                {['Documentation', 'API Reference', 'Blog', 'Changelog'].map((link) => (
                  <li key={link}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} NextGen LMS. All rights reserved.
            </p>
            <div className="flex gap-6">
              <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">Privacy Policy</span>
              <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">Terms of Service</span>
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
