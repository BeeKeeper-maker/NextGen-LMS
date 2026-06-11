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
  Star,
  ArrowRight,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  GraduationCap,
  Zap,
  Play,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
// Feature Definitions
// ============================================================
const features = [
  { icon: Sparkles, title: 'AI Content Generation', description: 'Generate course outlines, quizzes, and lesson content with advanced AI. Save hours of creation time.' },
  { icon: Bot, title: 'AI Tutoring Assistant', description: '24/7 intelligent tutor that answers student questions, explains concepts, and adapts to learning styles.' },
  { icon: Users, title: 'Integrated Community', description: 'Built-in discussions, live cohorts, and peer learning. No need for separate community tools.' },
  { icon: ClipboardCheck, title: 'Assessment Engine', description: 'Quizzes, assignments, peer reviews, and coding challenges with auto-grading and analytics.' },
  { icon: Award, title: 'Auto Certificates', description: 'Automatically issue branded certificates on course completion with verification codes.' },
  { icon: Globe, title: 'Multi-Currency Checkout', description: 'Sell in 50+ currencies with localized pricing. Support for Stripe, PayPal, and more.' },
  { icon: Palette, title: 'White-Label Branding', description: 'Full brand customization — colors, fonts, domain, and logos. Your platform, your identity.' },
  { icon: BarChart3, title: 'Advanced Analytics', description: 'Deep insights into learner engagement, revenue trends, and completion funnels.' },
  { icon: Video, title: 'Live Cohorts', description: 'Schedule and run live sessions with built-in video, chat, and attendance tracking.' },
  { icon: Shield, title: 'RBAC Governance', description: 'Role-based access control for admins, instructors, creators, and learners.' },
  { icon: DollarSign, title: 'Zero Transaction Fees', description: 'Keep 100% of your revenue. No hidden fees, no transaction taxes on any plan.' },
  { icon: Languages, title: 'Global i18n', description: 'Multi-language support for global audiences. Localize your entire platform with ease.' },
];

// ============================================================
// Testimonials
// ============================================================
const testimonials = [
  {
    name: 'Dr. Sarah Chen',
    role: 'CEO, TechAcademy',
    quote: 'NextGen LMS transformed our online education business. The AI tutoring alone increased student engagement by 40%. Zero transaction fees saved us over $15K in the first year.',
    avatar: 'SC',
  },
  {
    name: 'Marcus Johnson',
    role: 'Course Creator, 50K+ Students',
    quote: 'I switched from Kajabi and never looked back. The built-in community features and assessment engine are game-changers. My students love the interactive experience.',
    avatar: 'MJ',
  },
  {
    name: 'Priya Sharma',
    role: 'Head of Learning, Fortune 500',
    quote: 'The white-label branding and SSO integration made it seamless to deploy across our organization. The analytics give us insights we never had before.',
    avatar: 'PS',
  },
  {
    name: 'Alex Rivera',
    role: 'Solo Creator, $200K+ Revenue',
    quote: 'As a solo creator, the AI content generation saves me 10+ hours per week. The zero transaction fees mean I keep more of what I earn. Absolute no-brainer.',
    avatar: 'AR',
  },
  {
    name: 'Emma Thompson',
    role: 'Director, Online University',
    quote: 'We migrated 200+ courses to NextGen LMS. The multi-currency checkout and certificate automation made scaling globally effortless. The support team is phenomenal.',
    avatar: 'ET',
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
// Floating Particles
// ============================================================
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-emerald-500/20"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// Floating Dashboard Mockup
// ============================================================
function DashboardMockup() {
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
// Savings Calculator
// ============================================================
function SavingsCalculator() {
  const [revenue, setRevenue] = useState(5000);
  const teachableFee = revenue * 0.05 + 59;
  const nextgenFee = 0;
  const savings = teachableFee - nextgenFee;

  return (
    <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/50 to-slate-50/50 dark:from-emerald-950/30 dark:to-slate-950/30">
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
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>$500</span>
            <span>$50,000</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/50">
            <span className="text-sm text-red-700 dark:text-red-400">With Teachable</span>
            <span className="font-bold text-red-600 dark:text-red-400">${Math.round(teachableFee).toLocaleString()}/mo in fees</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50">
            <span className="text-sm text-emerald-700 dark:text-emerald-400">With NextGen</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">$0/mo in fees</span>
          </div>
        </div>

        <div className="text-center p-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
          <p className="text-xs text-emerald-100">You save</p>
          <p className="text-2xl font-bold">${Math.round(savings).toLocaleString()}/month</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Animated Border Glow Card
// ============================================================
function GlowBorderCard({ children, highlighted }: { children: React.ReactNode; highlighted: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!highlighted) return <>{children}</>;

  return (
    <div ref={cardRef} className="relative group">
      {/* Animated glow border */}
      <motion.div
        className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-emerald-500 via-violet-500 to-emerald-500 opacity-75 blur-[1px]"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        style={{ backgroundSize: '200% 200%' }}
      />
      <div className="relative rounded-xl">{children}</div>
    </div>
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
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
          {/* Background Gradient Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-slate-500/5 blur-3xl" />
          </div>

          {/* Grid background */}
          <GridBackground />

          {/* Floating particles */}
          <FloatingParticles />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                  <Zap className="h-3.5 w-3.5 mr-1.5" />
                  Now with AI-Powered Course Generation
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-5xl mx-auto leading-[1.1]"
              >
                AI-Powered Architecture.{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">Integrated Communities.</span>{' '}
                Zero Transaction Taxation.
              </motion.h1>

              <motion.div
                variants={fadeInUp}
                className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              >
                <TypingText
                  text="The next-generation learning platform that combines AI content creation, built-in community, and zero-fee commerce — so you can focus on teaching, not platform limitations."
                  speed={25}
                  delay={800}
                />
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
                    <div
                      key={i}
                      className={`h-8 w-8 rounded-full ${color} border-2 border-background flex items-center justify-center text-white text-[10px] font-bold`}
                    >
                      {['SC', 'MJ', 'PS', 'AR', 'ET', 'DW', 'KL', 'RH'][i]}
                    </div>
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

            {/* Floating Dashboard Mockup */}
            <DashboardMockup />
          </div>
        </section>

        {/* ============ FEATURES SECTION ============ */}
        <section id="features" className="py-20 sm:py-28 bg-muted/30">
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
                  variants={staggerContainer}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                  {visibleFeatures.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div key={feature.title} variants={fadeInUp}>
                        <Card className="h-full hover:shadow-lg transition-all duration-300 border-border/60 group relative overflow-hidden">
                          {/* Gradient border on hover */}
                          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-emerald-500/10 via-transparent to-violet-500/10 pointer-events-none" />
                          <CardHeader className="pb-3 relative">
                            <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mb-2 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900 transition-colors">
                              <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <CardTitle className="text-base font-semibold">{feature.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="relative">
                            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                          </CardContent>
                        </Card>
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
        </section>

        {/* ============ PRICING SECTION ============ */}
        <section id="pricing" className="py-20 sm:py-28">
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
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Annual
                  <Badge className="ml-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-[10px] px-1.5 py-0">
                    2 months free
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
                {pricingPlans.map((plan) => {
                  const annualPrice = isAnnual ? Math.round(plan.price * 10 / 12) : plan.price;
                  return (
                    <motion.div key={plan.id} variants={fadeInUp}>
                      <GlowBorderCard highlighted={plan.highlighted}>
                        <Card className={`h-full relative ${plan.highlighted ? 'border-emerald-500 border-2 shadow-xl z-10 bg-card' : 'border-border/60'}`}>
                          {plan.highlighted && (
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                              <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-0.5">
                                Most Popular
                              </Badge>
                            </div>
                          )}
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                            <CardDescription className="text-sm min-h-[40px]">{plan.description}</CardDescription>
                            <div className="mt-4">
                              <span className="text-4xl font-bold text-foreground">${annualPrice}</span>
                              <span className="text-muted-foreground">{isAnnual ? '/mo (billed annually)' : plan.period}</span>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <ul className="space-y-3">
                              {plan.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-2.5">
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
        </section>

        {/* ============ COMPETITOR COMPARISON ============ */}
        <section id="comparison" className="py-20 sm:py-28 bg-muted/30">
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
                    <th className="text-center py-4 px-4 text-sm font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      NextGen
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-muted-foreground">Kajabi</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-muted-foreground">Teachable</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-muted-foreground">Skool</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-muted-foreground">Mighty Networks</th>
                  </tr>
                </thead>
                <tbody>
                  {competitorComparison.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                      <td className="py-3 px-4 text-sm font-medium text-foreground">{row.feature}</td>
                      <td className="py-3 px-4 text-center bg-emerald-50/50 dark:bg-emerald-950/30">
                        <ComparisonCell value={row.nextgen} isNextgen />
                      </td>
                      <td className="py-3 px-4 text-center"><ComparisonCell value={row.kajabi} /></td>
                      <td className="py-3 px-4 text-center"><ComparisonCell value={row.teachable} /></td>
                      <td className="py-3 px-4 text-center"><ComparisonCell value={row.skool} /></td>
                      <td className="py-3 px-4 text-center"><ComparisonCell value={row.mightyNetworks} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </section>

        {/* ============ TESTIMONIALS SECTION ============ */}
        <section id="testimonials" className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {testimonials.map((testimonial) => (
                <motion.div key={testimonial.name} variants={fadeInUp}>
                  <Card className="h-full border-border/60 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-sm font-bold">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-0.5 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ============ INTEGRATIONS SECTION ============ */}
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
        </section>

        {/* ============ CTA SECTION ============ */}
        <section className="py-20 sm:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
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
            <motion.div variants={fadeInUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white text-base px-8 h-12" onClick={enterAdminMode}>
                Start Free Trial
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 h-12 border-slate-500 text-white hover:bg-white/10" onClick={enterLearnerMode}>
                Explore as Learner
              </Button>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-border bg-card mt-auto">
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
              <div className="flex gap-3 mt-4">
                {[Twitter, Linkedin, Github, Youtube].map((Icon, i) => (
                  <button
                    key={i}
                    className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label="Social media"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>

              {/* Newsletter Signup */}
              <div className="mt-6">
                <p className="text-sm font-medium text-foreground mb-2">Stay updated</p>
                <div className="flex gap-2 max-w-sm">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    Subscribe
                  </Button>
                </div>
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
    </div>
  );
}

// ============================================================
// Comparison Cell Helper
// ============================================================
function ComparisonCell({ value, isNextgen = false }: { value: string | boolean; isNextgen?: boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className={`h-4 w-4 mx-auto ${isNextgen ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-500'}`} />
    ) : (
      <X className="h-4 w-4 mx-auto text-red-400" />
    );
  }
  return (
    <span className={`text-xs font-medium ${isNextgen ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'}`}>
      {value}
    </span>
  );
}
