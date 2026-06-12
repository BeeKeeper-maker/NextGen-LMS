'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, GraduationCap, Loader2, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import type { User } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { loginAsAdmin, loginAsLearner } = useAppStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
        setIsLoading(false);
        return;
      }

      // Fetch session to get user data
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();

      if (session?.user) {
        const userRole = (session.user as Record<string, unknown>).role as string;
        const userData: User = {
          id: (session.user as Record<string, unknown>).id as string,
          tenantId: (session.user as Record<string, unknown>).tenantId as string,
          email: session.user.email ?? '',
          name: session.user.name ?? '',
          avatarUrl: session.user.image ?? '',
          role: userRole as User['role'],
          bio: '',
          timezone: 'America/New_York',
          locale: 'en',
          streakDays: 0,
          totalPoints: 0,
          isActive: true,
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        if (userRole === 'tenant_admin' || userRole === 'super_admin' || userRole === 'instructor') {
          loginAsAdmin(userData);
        } else {
          loginAsLearner(userData);
        }

        router.push('/');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setError('');
    setIsLoading(true);
    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      const result = await signIn('credentials', {
        email: demoEmail,
        password: demoPassword,
        redirect: false,
      });

      if (result?.error) {
        setError('Demo login failed. Please make sure the database is seeded.');
        setIsLoading(false);
        return;
      }

      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();

      if (session?.user) {
        const userRole = (session.user as Record<string, unknown>).role as string;
        const userData: User = {
          id: (session.user as Record<string, unknown>).id as string,
          tenantId: (session.user as Record<string, unknown>).tenantId as string,
          email: session.user.email ?? '',
          name: session.user.name ?? '',
          avatarUrl: session.user.image ?? '',
          role: userRole as User['role'],
          bio: '',
          timezone: 'America/New_York',
          locale: 'en',
          streakDays: userRole === 'tenant_admin' ? 14 : 7,
          totalPoints: userRole === 'tenant_admin' ? 2850 : 1250,
          isActive: true,
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        if (userRole === 'tenant_admin' || userRole === 'super_admin' || userRole === 'instructor') {
          loginAsAdmin(userData);
        } else {
          loginAsLearner(userData);
        }

        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Demo login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 dark:bg-emerald-800/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200/30 dark:bg-teal-800/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100/20 dark:bg-emerald-900/10 rounded-full blur-3xl" />
      </div>

      {/* Logo & Branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            NextGen LMS
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          AI-Powered Learning Management System
        </p>
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue learning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg p-3 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-muted-foreground">
                  Quick Demo Access
                </span>
              </div>
            </div>

            {/* Demo Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="w-full h-auto py-3 flex flex-col items-center gap-1.5 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200"
                  onClick={() => handleDemoLogin('admin@nextgen-lms.com', 'demo123')}
                  disabled={isLoading}
                >
                  <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-medium">Demo Admin</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="w-full h-auto py-3 flex flex-col items-center gap-1.5 border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-200"
                  onClick={() => handleDemoLogin('learner@example.com', 'demo123')}
                  disabled={isLoading}
                >
                  <GraduationCap className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-medium">Demo Learner</span>
                </Button>
              </motion.div>
            </div>

            {/* Footer info */}
            <p className="text-xs text-center text-muted-foreground mt-4">
              Demo mode — any password works for demo accounts.
              <br />
              <button
                type="button"
                className="text-emerald-600 dark:text-emerald-400 hover:underline mt-1 inline-block"
                onClick={() => {
                  fetch('/api/seed', { method: 'POST' })
                    .then(() => setError(''))
                    .then(() => handleDemoLogin('admin@nextgen-lms.com', 'demo123'));
                }}
                disabled={isLoading}
              >
                Seed database first
              </button>{' '}
              if login fails.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 text-center text-sm text-muted-foreground relative z-10"
      >
        <p>
          By signing in, you agree to our{' '}
          <span className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
            Terms of Service
          </span>{' '}
          and{' '}
          <span className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
            Privacy Policy
          </span>
        </p>
      </motion.div>
    </div>
  );
}
