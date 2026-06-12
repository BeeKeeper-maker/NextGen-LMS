'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  CreditCard,
  Lock,
  Shield,
  CheckCircle2,
  ArrowLeft,
  Star,
  Check,
  Globe,
  RotateCcw,
  Eye,
  EyeOff,
  Wallet,
  Smartphone,
  Tag,
  X,
  Share2,
  Mail,
  Clock,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  BadgeCheck,
  PartyPopper,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/store/app-store';
import { useCourses, useProducts, useCreateOrder } from '@/hooks/use-data';
import { validEmail } from '@/lib/validations';
import { toast } from 'sonner';
import type { CurrencyOption } from '@/types';

// Default product fallback when no products are in the database
const defaultProduct = {
  id: 'prod-default',
  tenantId: '',
  name: 'Course Access',
  type: 'course',
  price: 97,
  compareAtPrice: 194,
  currency: 'USD',
  isActive: true,
  features: ['Full course access', 'Lifetime updates', 'Community access', 'Certificate on completion'],
};

// Static currency configuration (not user-generated data)
const supportedCurrencies: CurrencyOption[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1, flag: '\uD83C\uDDFA\uD83C\uDDF8' },
  { code: 'EUR', symbol: '\u20AC', name: 'Euro', rate: 0.92, flag: '\uD83C\uDDEA\uD83C\uDDFA' },
  { code: 'GBP', symbol: '\u00A3', name: 'British Pound', rate: 0.79, flag: '\uD83C\uDDEC\uD83C\uDDE7' },
  { code: 'JPY', symbol: '\u00A5', name: 'Japanese Yen', rate: 149.5, flag: '\uD83C\uDDEF\uD83C\uDDF5' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.36, flag: '\uD83C\uDDE8\uD83C\uDDE6' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.53, flag: '\uD83C\uDDE6\uD83C\uDDFA' },
  { code: 'INR', symbol: '\u20B9', name: 'Indian Rupee', rate: 83.1, flag: '\uD83C\uDDEE\uD83C\uDDF3' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rate: 4.97, flag: '\uD83C\uDDE7\uD83C\uDDF7' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', rate: 17.15, flag: '\uD83C\uDDF2\uD83C\uDDFD' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 1.34, flag: '\uD83C\uDDF8\uD83C\uDDEC' },
];

// ── Helpers ──────────────────────────────────────────────────────────────

function formatPrice(amount: number, currency: CurrencyOption): string {
  const converted = amount * currency.rate;
  if (currency.code === 'JPY') {
    return `${currency.symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${currency.symbol}${converted.toFixed(2)}`;
}

function detectCardBrand(number: string): 'visa' | 'mastercard' | 'amex' | 'unknown' {
  const cleaned = number.replace(/\s/g, '');
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  return 'unknown';
}

function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 16);
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
}

function formatExpiry(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length > 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  }
  return cleaned;
}

const cardBrandConfig: Record<string, { label: string; color: string; gradient: string }> = {
  visa: { label: 'VISA', color: 'text-blue-700 dark:text-blue-300', gradient: 'from-blue-600 to-blue-800' },
  mastercard: { label: 'MC', color: 'text-orange-700 dark:text-orange-300', gradient: 'from-orange-500 to-red-600' },
  amex: { label: 'AMEX', color: 'text-teal-700 dark:text-teal-300', gradient: 'from-teal-500 to-emerald-700' },
  unknown: { label: '', color: '', gradient: 'from-slate-500 to-slate-700' },
};

// ── Animated Number Counter ─────────────────────────────────────────────

function AnimatedPrice({ value, currency }: { value: number; currency: CurrencyOption }) {
  const motionVal = useMotionValue(0);
  const display = useTransform(motionVal, (v) => {
    if (currency.code === 'JPY') {
      return `${currency.symbol}${Math.round(v).toLocaleString()}`;
    }
    return `${currency.symbol}${v.toFixed(2)}`;
  });
  const [displayStr, setDisplayStr] = useState(formatPrice(value, currency));
  const prevValue = useRef(value);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 0.6,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (currency.code === 'JPY') {
          setDisplayStr(`${currency.symbol}${Math.round(v).toLocaleString()}`);
        } else {
          setDisplayStr(`${currency.symbol}${v.toFixed(2)}`);
        }
      },
    });
    prevValue.current = value;
    return () => controls.stop();
  }, [value, currency.code, currency.symbol, motionVal]);

  return <span>{displayStr}</span>;
}

// ── Confetti Particle ────────────────────────────────────────────────────

function ConfettiParticle({ delay }: { delay: number }) {
  const colors = ['#10B981', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const x = Math.random() * 100;
  const rotation = Math.random() * 360;
  const size = 6 + Math.random() * 8;

  return (
    <motion.div
      initial={{ opacity: 1, y: -20, x: `${x}vw`, rotate: 0 }}
      animate={{
        opacity: [1, 1, 0],
        y: ['0vh', '100vh'],
        x: [`${x}vw`, `${x + (Math.random() - 0.5) * 20}vw`],
        rotate: [0, rotation + 720],
      }}
      transition={{ duration: 2.5 + Math.random(), delay, ease: 'easeIn' }}
      className="fixed top-0 pointer-events-none z-50"
      style={{ width: size, height: size, backgroundColor: color, borderRadius: Math.random() > 0.5 ? '50%' : '2px' }}
    />
  );
}

// ── Confetti Effect ──────────────────────────────────────────────────────

function ConfettiEffect() {
  const particles = Array.from({ length: 60 }, (_, i) => i);
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((i) => (
        <ConfettiParticle key={i} delay={i * 0.03} />
      ))}
    </div>
  );
}

// ── Card Preview ─────────────────────────────────────────────────────────

function CardPreview({
  cardNumber,
  cardholderName,
  expiry,
  cvv,
  cardBrand,
}: {
  cardNumber: string;
  cardholderName: string;
  expiry: string;
  cvv: string;
  cardBrand: string;
}) {
  const brand = cardBrandConfig[cardBrand] || cardBrandConfig.unknown;
  const displayNum = cardNumber || '•••• •••• •••• ••••';
  const displayName = cardholderName || 'YOUR NAME';
  const displayExpiry = expiry || 'MM/YY';

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -10 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative w-full max-w-sm aspect-[1.586/1] rounded-xl bg-gradient-to-br ${brand.gradient} p-5 sm:p-6 text-white shadow-2xl overflow-hidden`}
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="w-10 h-8 rounded bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-80" />
          </div>
          {brand.label && (
            <span className="text-sm font-bold tracking-wider opacity-90">{brand.label}</span>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-lg sm:text-xl font-mono tracking-[0.2em] opacity-90">{displayNum}</p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5">Card Holder</p>
              <p className="text-xs sm:text-sm font-medium tracking-wider uppercase">{displayName}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5">Expires</p>
              <p className="text-xs sm:text-sm font-medium">{displayExpiry}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Step Indicator ───────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: 'Select Plan' },
    { num: 2, label: 'Payment' },
    { num: 3, label: 'Confirmation' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <motion.div
              animate={{
                backgroundColor: currentStep >= step.num ? '#10B981' : 'rgba(0,0,0,0)',
                borderColor: currentStep >= step.num ? '#10B981' : '#94a3b8',
                scale: currentStep === step.num ? 1.1 : 1,
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors"
              style={{
                color: currentStep >= step.num ? 'white' : '#94a3b8',
              }}
            >
              {currentStep > step.num ? (
                <Check className="h-4 w-4" />
              ) : (
                step.num
              )}
            </motion.div>
            <span
              className={`text-xs sm:text-sm font-medium ${
                currentStep >= step.num ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-8 sm:w-16 h-0.5 rounded-full transition-colors ${
                currentStep > step.num ? 'bg-emerald-500' : 'bg-border'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Coupon Validation ────────────────────────────────────────────────────

const VALID_COUPONS: Record<string, { discount: number; label: string }> = {
  SAVE20: { discount: 0.2, label: '20% OFF' },
  WELCOME10: { discount: 0.1, label: '10% OFF' },
  LAUNCH50: { discount: 0.5, label: '50% OFF' },
};

// ── Main Component ───────────────────────────────────────────────────────

type CheckoutStep = 1 | 2 | 3;
type PaymentMethod = 'card' | 'paypal' | 'applepay';

export function CheckoutPage() {
  const { setView, currentUser, currentTenant } = useAppStore();
  const userId = currentUser?.id || '';
  const tenantId = currentTenant?.id || '';
  const { data: coursesData } = useCourses(tenantId || undefined);
  const { data: productsData } = useProducts(tenantId);
  const createOrderMutation = useCreateOrder();
  const courses = coursesData || [];
  const product = (productsData && productsData.length > 0) ? productsData[0] : defaultProduct;
  const course = courses[0];

  // ── State ───────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(supportedCurrencies[0]);
  const [isAnnual, setIsAnnual] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [showCvv, setShowCvv] = useState(false);

  // Form state
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [email, setEmail] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});

  // Exchange rate timestamp
  const [rateTimestamp] = useState(new Date());

  const cardBrand = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);

  // ── Auto-detect currency based on locale ────────────────────────────────
  useEffect(() => {
    try {
      const locale = navigator.language;
      const detected = supportedCurrencies.find((c) => {
        if (locale.startsWith('en-US')) return c.code === 'USD';
        if (locale.startsWith('de') || locale.startsWith('fr') || locale.startsWith('es') || locale.startsWith('it')) return c.code === 'EUR';
        if (locale.startsWith('en-GB')) return c.code === 'GBP';
        if (locale.startsWith('ja')) return c.code === 'JPY';
        if (locale.startsWith('en-CA')) return c.code === 'CAD';
        if (locale.startsWith('en-AU')) return c.code === 'AUD';
        if (locale.startsWith('hi') || locale.startsWith('en-IN')) return c.code === 'INR';
        if (locale.startsWith('pt-BR')) return c.code === 'BRL';
        if (locale.startsWith('es-MX')) return c.code === 'MXN';
        if (locale.startsWith('zh-SG') || locale.startsWith('en-SG')) return c.code === 'SGD';
        return false;
      });
      if (detected && detected.code !== 'USD') {
        setSelectedCurrency(detected);
      }
    } catch {
      // fallback to USD
    }
  }, []);

  // ── Pricing Calculations ────────────────────────────────────────────────
  const monthlyPrice = product.price;
  const annualPrice = product.compareAtPrice || product.price * 10;
  const activePrice = isAnnual ? annualPrice : monthlyPrice;

  const basePrice = useMemo(() => activePrice * selectedCurrency.rate, [activePrice, selectedCurrency.rate]);
  const discountPercent = couponApplied ? (VALID_COUPONS[couponApplied]?.discount || 0) : 0;
  const discountAmount = useMemo(() => basePrice * discountPercent, [basePrice, discountPercent]);
  const taxRate = 0;
  const taxAmount = useMemo(() => (basePrice - discountAmount) * taxRate, [basePrice, discountAmount, taxRate]);
  const totalAmount = useMemo(() => basePrice - discountAmount + taxAmount, [basePrice, discountAmount, taxAmount]);

  const savingsFromOriginal = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const annualSavingsPercent = product.compareAtPrice
    ? Math.round((1 - annualPrice / (monthlyPrice * 12)) * 100)
    : 0;

  // ── Currency change handler with animation ──────────────────────────────
  const handleCurrencyChange = useCallback((code: string) => {
    const c = supportedCurrencies.find((cur) => cur.code === code);
    if (c) {
      setIsConverting(true);
      setTimeout(() => {
        setSelectedCurrency(c);
        setIsConverting(false);
      }, 300);
    }
  }, []);

  // ── Coupon handler ──────────────────────────────────────────────────────
  const handleApplyCoupon = useCallback(() => {
    setCouponError('');
    setCouponLoading(true);
    setTimeout(() => {
      const code = couponCode.toUpperCase().trim();
      if (VALID_COUPONS[code]) {
        setCouponApplied(code);
        setCouponError('');
      } else {
        setCouponError('Invalid coupon code. Try SAVE20, WELCOME10, or LAUNCH50.');
        setCouponApplied(null);
      }
      setCouponLoading(false);
    }, 800);
  }, [couponCode]);

  const handleRemoveCoupon = useCallback(() => {
    setCouponApplied(null);
    setCouponCode('');
    setCouponError('');
  }, []);

  // ── Payment handler ─────────────────────────────────────────────────────
  const handlePayNow = useCallback(() => {
    // Validate payment form
    const errs: Record<string, string> = {};
    if (paymentMethod === 'card') {
      if (!cardholderName.trim()) errs.cardholderName = 'Cardholder name is required';
      if (cardNumber.replace(/\s/g, '').length < 15) errs.cardNumber = 'Valid card number is required';
      if (expiry.length !== 5) errs.expiry = 'Valid expiry date is required';
      if (cvv.length < 3) errs.cvv = 'Valid CVV is required';
      if (!email.trim()) errs.email = 'Email is required';
      else if (validEmail(email, 'Email')) errs.email = validEmail(email, 'Email');
    }
    if (paymentMethod === 'paypal') {
      if (!paypalEmail.trim()) errs.paypalEmail = 'PayPal email is required';
      else if (validEmail(paypalEmail, 'PayPal email')) errs.paypalEmail = validEmail(paypalEmail, 'PayPal email');
    }
    setPaymentErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsProcessing(true);
    // Simulate payment processing and store order
    setTimeout(async () => {
      try {
        await createOrderMutation.mutateAsync({
          tenantId: tenantId || 'default',
          userId: userId || undefined,
          productId: product.id,
          amount: totalAmount,
          currency: selectedCurrency.code,
          paymentProvider: paymentMethod === 'card' ? 'stripe' : paymentMethod === 'paypal' ? 'paypal' : 'apple_pay',
          paymentId: `pay_${Date.now()}`,
        });
      } catch (err) {
        toast.error('Payment processing failed. Please try again.');
        setIsProcessing(false);
        return;
      }
      setIsProcessing(false);
      setPaymentSuccess(true);
      setCurrentStep(3);
    }, 2500);
  }, [totalAmount, selectedCurrency, paymentMethod, product.id, tenantId, userId, createOrderMutation]);

  const isFormValid = useMemo(() => {
    if (paymentMethod === 'card') {
      return (
        cardholderName.length > 0 &&
        cardNumber.replace(/\s/g, '').length >= 15 &&
        expiry.length === 5 &&
        cvv.length >= 3 &&
        email.length > 0
      );
    }
    if (paymentMethod === 'paypal') {
      return paypalEmail.length > 0 && paypalEmail.includes('@');
    }
    // applepay - always valid (demo)
    return true;
  }, [paymentMethod, cardholderName, cardNumber, expiry, cvv, email, paypalEmail]);

  // ── Step 3: Confirmation Screen ─────────────────────────────────────────
  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/30" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/30 dark:bg-emerald-800/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-200/30 dark:bg-teal-800/10 rounded-full blur-3xl" />

        <ConfettiEffect />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative z-10 max-w-lg w-full"
        >
          {/* Glassmorphism card */}
          <div className="rounded-2xl border border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-2xl">
            <div className="p-6 sm:p-8 text-center space-y-6">
              {/* Success icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
                className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                >
                  <PartyPopper className="h-10 w-10 text-white" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Payment Successful!</h2>
                <p className="text-muted-foreground">Your course access is now active</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-5 text-left space-y-3"
              >
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Order Details</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">{product.name}</p>
                    <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300">
                      {isAnnual ? 'Annual' : 'Monthly'}
                    </Badge>
                  </div>
                  <Separator className="bg-emerald-200 dark:bg-emerald-800" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-emerald-700 dark:text-emerald-300">Total Charged</span>
                    <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                      <AnimatedPrice value={totalAmount} currency={selectedCurrency} /> {selectedCurrency.code}
                    </p>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Order #NG-{Date.now().toString().slice(-8)}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
              >
                <Mail className="h-4 w-4" />
                <span>Confirmation sent to <strong>{email || 'your email'}</strong></span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Button
                  onClick={() => setView('learner-dashboard')}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white h-11"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Learning Now
                </Button>
                <Button variant="outline" className="flex-1 h-11">
                  View Receipt
                </Button>
              </motion.div>

              {/* Social share */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="pt-2"
              >
                <p className="text-xs text-muted-foreground mb-3">Share your purchase</p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                    <Share2 className="h-3 w-3" />
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                    <Share2 className="h-3 w-3" />
                    LinkedIn
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                    <Share2 className="h-3 w-3" />
                    Facebook
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Steps 1 & 2 ─────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-violet-50/20 to-emerald-50/20 dark:from-slate-950 dark:via-violet-950/10 dark:to-emerald-950/5" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-violet-200/20 dark:bg-violet-800/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-emerald-200/20 dark:bg-emerald-800/5 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (currentStep === 1) {
                setView('learner-dashboard');
              } else {
                setCurrentStep((prev) => Math.max(1, prev - 1) as CheckoutStep);
              }
            }}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {currentStep === 1 ? 'Back' : 'Previous'}
          </Button>
          <div className="flex-1">
            <StepIndicator currentStep={currentStep} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600">
            <Lock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">SSL Encrypted</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Left Column */}
            <div className="lg:col-span-3 space-y-6">
              <AnimatePresence mode="wait">
                {/* ── Step 1: Select Plan ─────────────────────────────── */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Currency Selector Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="rounded-2xl border border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-violet-500/10 to-emerald-500/10 dark:from-violet-500/5 dark:to-emerald-500/5 px-6 py-4 flex items-center gap-3">
                          <Globe className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">Select Your Currency</h3>
                            <p className="text-xs text-muted-foreground">Prices will be converted in real-time</p>
                          </div>
                        </div>
                        <div className="p-6 space-y-4">
                          {/* Currency Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {supportedCurrencies.map((c) => (
                              <motion.button
                                key={c.code}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleCurrencyChange(c.code)}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                  selectedCurrency.code === c.code
                                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 shadow-sm'
                                    : 'border-border bg-background/50 hover:bg-muted/50 text-foreground'
                                }`}
                              >
                                <span className="text-base">{c.flag}</span>
                                <span>{c.code}</span>
                                <span className="text-muted-foreground text-xs">{c.symbol}</span>
                              </motion.button>
                            ))}
                          </div>

                          {/* Exchange rate info */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                            <span className="flex items-center gap-1.5">
                              <RotateCcw className="h-3 w-3" />
                              {selectedCurrency.code !== 'USD'
                                ? `1 USD = ${selectedCurrency.rate} ${selectedCurrency.code}`
                                : 'Base currency'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Updated {rateTimestamp.toLocaleTimeString()}
                            </span>
                          </div>

                          {selectedCurrency.code !== 'USD' && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-2"
                            >
                              <RotateCcw className="h-3 w-3 shrink-0" />
                              Approximate conversion. You&apos;ll be charged in USD.
                            </motion.p>
                          )}
                        </div>
                      </div>
                    </motion.div>

                    {/* Product Card with Pricing Toggle */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <div className="rounded-2xl border border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg overflow-hidden">
                        {/* Gradient top bar */}
                        <div className="h-1 bg-gradient-to-r from-violet-500 via-emerald-500 to-teal-500" />
                        <div className="p-6">
                          {/* Pricing Toggle */}
                          <div className="flex items-center justify-center gap-3 mb-6">
                            <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                              Monthly
                            </span>
                            <div className="relative flex items-center">
                              <Switch
                                checked={isAnnual}
                                onCheckedChange={setIsAnnual}
                                className="data-[state=checked]:bg-emerald-500"
                              />
                              {isAnnual && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="absolute -right-16 -top-1"
                                >
                                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-[10px] px-1.5 py-0 whitespace-nowrap">
                                    Save {annualSavingsPercent}%
                                  </Badge>
                                </motion.div>
                              )}
                            </div>
                            <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                              Annual
                            </span>
                          </div>

                          {/* Course Thumbnail + Info */}
                          <div className="flex flex-col sm:flex-row gap-5">
                            <div className="shrink-0 w-full sm:w-52 h-36 rounded-xl bg-gradient-to-br from-violet-100 to-emerald-100 dark:from-violet-950 dark:to-emerald-950 flex items-center justify-center relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-emerald-500/10" />
                              <div className="relative text-center">
                                <Star className="h-10 w-10 text-violet-600 dark:text-violet-400 mx-auto mb-1" />
                                <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">Best Seller</p>
                              </div>
                            </div>
                            <div className="flex-1 space-y-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 dark:bg-violet-900 dark:text-violet-300 text-xs">
                                    {product.type}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300">
                                    3 Courses
                                  </Badge>
                                  {savingsFromOriginal > 0 && (
                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-300 text-xs">
                                      You save {savingsFromOriginal}%
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="text-lg font-bold text-foreground">{product.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">Instructor: Sarah Mitchell</p>
                              </div>

                              {/* Animated price */}
                              <div className="flex items-baseline gap-2">
                                <motion.span
                                  key={`${isAnnual}-${selectedCurrency.code}`}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="text-2xl font-bold text-foreground"
                                >
                                  <AnimatedPrice value={activePrice * selectedCurrency.rate} currency={selectedCurrency} />
                                </motion.span>
                                {product.compareAtPrice && !isAnnual && (
                                  <span className="text-base text-muted-foreground line-through">
                                    {formatPrice(product.compareAtPrice, selectedCurrency)}
                                  </span>
                                )}
                                {isAnnual && (
                                  <span className="text-sm text-muted-foreground">/year</span>
                                )}
                                {!isAnnual && (
                                  <span className="text-sm text-muted-foreground">/month</span>
                                )}
                              </div>

                              {/* Features */}
                              <div className="pt-1">
                                <p className="text-sm font-medium text-foreground mb-2">What&apos;s included:</p>
                                <ul className="space-y-1.5">
                                  {product.features?.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Continue to Payment */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <Button
                        onClick={() => setCurrentStep(2)}
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white"
                      >
                        Continue to Payment
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {/* ── Step 2: Payment ──────────────────────────────────────── */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Payment Method Selector */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="rounded-2xl border border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-border/50">
                          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-violet-600" />
                            Payment Method
                          </h3>
                        </div>
                        <div className="p-6">
                          <div className="grid grid-cols-3 gap-3 mb-6">
                            {([
                              { id: 'card' as PaymentMethod, icon: CreditCard, label: 'Credit/Debit Card', badges: ['VISA', 'MC', 'AMEX'] },
                              { id: 'paypal' as PaymentMethod, icon: Wallet, label: 'PayPal', badges: ['PayPal'] },
                              { id: 'applepay' as PaymentMethod, icon: Smartphone, label: 'Apple / Google Pay', badges: ['Apple Pay', 'GPay'] },
                            ]).map((method) => (
                              <motion.button
                                key={method.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setPaymentMethod(method.id)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                  paymentMethod === method.id
                                    ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                                    : 'border-border hover:border-muted-foreground/30'
                                }`}
                              >
                                <method.icon className={`h-6 w-6 ${
                                  paymentMethod === method.id ? 'text-emerald-600' : 'text-muted-foreground'
                                }`} />
                                <span className={`text-xs font-medium text-center ${
                                  paymentMethod === method.id ? 'text-foreground' : 'text-muted-foreground'
                                }`}>
                                  {method.label}
                                </span>
                                <div className="flex gap-1 flex-wrap justify-center">
                                  {method.badges.map((badge) => (
                                    <span
                                      key={badge}
                                      className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-medium text-foreground"
                                    >
                                      {badge}
                                    </span>
                                  ))}
                                </div>
                              </motion.button>
                            ))}
                          </div>

                          <AnimatePresence mode="wait">
                            {/* Card Payment Form */}
                            {paymentMethod === 'card' && (
                              <motion.div
                                key="card-form"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-5"
                              >
                                {/* Animated Card Preview */}
                                <div className="flex justify-center pb-2">
                                  <CardPreview
                                    cardNumber={cardNumber}
                                    cardholderName={cardholderName}
                                    expiry={expiry}
                                    cvv={cvv}
                                    cardBrand={cardBrand}
                                  />
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
                                  <Label htmlFor="email" className="text-sm">Email for receipt</Label>
                                  <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); if (paymentErrors.email) setPaymentErrors(prev => { const n = {...prev}; delete n.email; return n; }); }}
                                    className={`h-10 bg-white/50 dark:bg-slate-800/50 ${paymentErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                  />
                                  {paymentErrors.email && <p className="text-sm text-destructive mt-1">{paymentErrors.email}</p>}
                                </div>

                                {/* Cardholder Name */}
                                <div className="space-y-1.5">
                                  <Label htmlFor="cardholder" className="text-sm">Cardholder name</Label>
                                  <Input
                                    id="cardholder"
                                    placeholder="Full name on card"
                                    value={cardholderName}
                                    onChange={(e) => { setCardholderName(e.target.value); if (paymentErrors.cardholderName) setPaymentErrors(prev => { const n = {...prev}; delete n.cardholderName; return n; }); }}
                                    className={`h-10 bg-white/50 dark:bg-slate-800/50 ${paymentErrors.cardholderName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                  />
                                  {paymentErrors.cardholderName && <p className="text-sm text-destructive mt-1">{paymentErrors.cardholderName}</p>}
                                </div>

                                {/* Card Number */}
                                <div className="space-y-1.5">
                                  <Label htmlFor="cardnumber" className="text-sm">Card number</Label>
                                  <div className="relative">
                                    <Input
                                      id="cardnumber"
                                      placeholder="1234 5678 9012 3456"
                                      value={cardNumber}
                                      onChange={(e) => { setCardNumber(formatCardNumber(e.target.value)); if (paymentErrors.cardNumber) setPaymentErrors(prev => { const n = {...prev}; delete n.cardNumber; return n; }); }}
                                      className={`h-10 pr-20 bg-white/50 dark:bg-slate-800/50 ${paymentErrors.cardNumber ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                      maxLength={19}
                                    />
                                    {cardBrand !== 'unknown' && cardNumber.length > 0 && (
                                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold ${cardBrandConfig[cardBrand].color}`}>
                                        {cardBrandConfig[cardBrand].label}
                                      </span>
                                    )}
                                  </div>
                                  {paymentErrors.cardNumber && <p className="text-sm text-destructive mt-1">{paymentErrors.cardNumber}</p>}
                                </div>

                                {/* Expiry & CVV */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <Label htmlFor="expiry" className="text-sm">Expiry date</Label>
                                    <Input
                                      id="expiry"
                                      placeholder="MM/YY"
                                      value={expiry}
                                      onChange={(e) => { setExpiry(formatExpiry(e.target.value)); if (paymentErrors.expiry) setPaymentErrors(prev => { const n = {...prev}; delete n.expiry; return n; }); }}
                                      className={`h-10 bg-white/50 dark:bg-slate-800/50 ${paymentErrors.expiry ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                      maxLength={5}
                                    />
                                    {paymentErrors.expiry && <p className="text-sm text-destructive mt-1">{paymentErrors.expiry}</p>}
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label htmlFor="cvv" className="text-sm">CVV</Label>
                                    <div className="relative">
                                      <Input
                                        id="cvv"
                                        placeholder="123"
                                        value={cvv}
                                        onChange={(e) => { setCvv(e.target.value.replace(/\D/g, '').slice(0, 4)); if (paymentErrors.cvv) setPaymentErrors(prev => { const n = {...prev}; delete n.cvv; return n; }); }}
                                        className={`h-10 pr-10 bg-white/50 dark:bg-slate-800/50 ${paymentErrors.cvv ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                        maxLength={4}
                                        type={showCvv ? 'text' : 'password'}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setShowCvv(!showCvv)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                      >
                                        {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                      </button>
                                    </div>
                                    {paymentErrors.cvv && <p className="text-sm text-destructive mt-1">{paymentErrors.cvv}</p>}
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* PayPal Form */}
                            {paymentMethod === 'paypal' && (
                              <motion.div
                                key="paypal-form"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                              >
                                <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 p-5 text-center space-y-3">
                                  <Wallet className="h-10 w-10 text-blue-600 mx-auto" />
                                  <p className="text-sm text-muted-foreground">
                                    You&apos;ll be redirected to PayPal to complete your purchase securely.
                                  </p>
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="paypal-email" className="text-sm">PayPal email</Label>
                                  <Input
                                    id="paypal-email"
                                    type="email"
                                    placeholder="your-paypal@email.com"
                                    value={paypalEmail}
                                    onChange={(e) => { setPaypalEmail(e.target.value); if (paymentErrors.paypalEmail) setPaymentErrors(prev => { const n = {...prev}; delete n.paypalEmail; return n; }); }}
                                    className={`h-10 bg-white/50 dark:bg-slate-800/50 ${paymentErrors.paypalEmail ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                  />
                                  {paymentErrors.paypalEmail && <p className="text-sm text-destructive mt-1">{paymentErrors.paypalEmail}</p>}
                                </div>
                              </motion.div>
                            )}

                            {/* Apple/Google Pay */}
                            {paymentMethod === 'applepay' && (
                              <motion.div
                                key="applepay-form"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                              >
                                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-5 text-center space-y-3">
                                  <Smartphone className="h-10 w-10 text-foreground mx-auto" />
                                  <p className="text-sm text-muted-foreground">
                                    Use your device&apos;s secure payment method. No card details needed.
                                  </p>
                                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                    <ShieldCheck className="h-3 w-3 mr-1" />
                                    Biometric Authentication
                                  </Badge>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Trust Badges */}
                          <div className="mt-6 space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Lock className="h-3.5 w-3.5 text-emerald-600" />
                                Secure Checkout
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Shield className="h-3.5 w-3.5 text-emerald-600" />
                                256-bit SSL Encryption
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                                30-day Money Back
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                                Money-back Guarantee
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-xs text-muted-foreground">We accept:</span>
                              <div className="flex gap-1.5">
                                <div className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 rounded text-xs font-bold text-blue-700 dark:text-blue-300">VISA</div>
                                <div className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/30 rounded text-xs font-bold text-orange-700 dark:text-orange-300">MC</div>
                                <div className="px-2 py-0.5 bg-teal-50 dark:bg-teal-900/30 rounded text-xs font-bold text-teal-700 dark:text-teal-300">AMEX</div>
                                <div className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 rounded text-xs font-bold text-blue-700 dark:text-blue-300">PayPal</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="lg:sticky lg:top-20"
              >
                {/* Glassmorphism Order Summary Card */}
                <div className="rounded-2xl border border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg overflow-hidden">
                  {/* Gradient top accent */}
                  <div className="h-1 bg-gradient-to-r from-violet-500 via-emerald-500 to-teal-500" />
                  <div className="p-6 space-y-5">
                    <h3 className="text-base font-semibold text-foreground">Order Summary</h3>

                    {/* Item */}
                    <div className="flex gap-3">
                      <div className="shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-violet-100 to-emerald-100 dark:from-violet-950 dark:to-emerald-950 flex items-center justify-center">
                        <Star className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.type} • 3 courses • Sarah Mitchell</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{isAnnual ? 'Annual plan' : 'Monthly plan'}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Pricing Breakdown */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Base Price</span>
                        <span className="text-foreground">
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={`${activePrice}-${selectedCurrency.code}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              {isConverting ? (
                                <Skeleton className="h-4 w-16 inline-block" />
                              ) : (
                                <AnimatedPrice value={activePrice * selectedCurrency.rate} currency={selectedCurrency} />
                              )}
                            </motion.span>
                          </AnimatePresence>
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Platform Fee</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-foreground">{selectedCurrency.symbol}0.00</span>
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] px-1.5 py-0 dark:bg-emerald-900 dark:text-emerald-300">
                            0% Fee
                          </Badge>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span className="text-foreground">{selectedCurrency.symbol}0.00</span>
                      </div>

                      {couponApplied && VALID_COUPONS[couponApplied] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            Discount ({VALID_COUPONS[couponApplied].label})
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            -{formatPrice(discountAmount, selectedCurrency)}
                          </span>
                        </motion.div>
                      )}
                    </div>

                    <Separator />

                    {/* Coupon Code */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Have a coupon?</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value);
                              setCouponError('');
                            }}
                            className="h-9 text-sm bg-white/50 dark:bg-slate-800/50 pr-8"
                            disabled={!!couponApplied}
                          />
                          {couponApplied && (
                            <button
                              onClick={handleRemoveCoupon}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-4"
                          onClick={handleApplyCoupon}
                          disabled={!couponCode.trim() || !!couponApplied || couponLoading}
                        >
                          {couponLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                              className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full"
                            />
                          ) : couponApplied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            'Apply'
                          )}
                        </Button>
                      </div>
                      {couponError && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-500"
                        >
                          {couponError}
                        </motion.p>
                      )}
                      {couponApplied && VALID_COUPONS[couponApplied] && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1.5"
                        >
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs dark:bg-emerald-900 dark:text-emerald-300">
                            <Check className="h-3 w-3 mr-0.5" />
                            {VALID_COUPONS[couponApplied].label} applied
                          </Badge>
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">
                            You save {Math.round(discountPercent * 100)}%
                          </span>
                        </motion.div>
                      )}
                    </div>

                    <Separator />

                    {/* Total */}
                    <div className="flex justify-between items-baseline">
                      <span className="text-base font-semibold text-foreground">Total</span>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={`${totalAmount}-${selectedCurrency.code}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              {isConverting ? (
                                <Skeleton className="h-7 w-24 inline-block" />
                              ) : (
                                <AnimatedPrice value={totalAmount} currency={selectedCurrency} />
                              )}
                            </motion.span>
                          </AnimatePresence>
                        </p>
                        {selectedCurrency.code !== 'USD' && (
                          <p className="text-xs text-muted-foreground">
                            ≈ ${activePrice.toFixed(2)} USD
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Pay Button */}
                    <Button
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white transition-all"
                      onClick={handlePayNow}
                      disabled={!isFormValid || isProcessing}
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Processing...
                        </div>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Pay <AnimatedPrice value={totalAmount} currency={selectedCurrency} />
                        </>
                      )}
                    </Button>

                    {/* Security Badges */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        Instant access after payment
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <RotateCcw className="h-3.5 w-3.5 text-emerald-500" />
                        30-day money-back guarantee
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield className="h-3.5 w-3.5 text-emerald-500" />
                        Secure payment processing
                      </div>
                    </div>

                    {/* Course Included Preview */}
                    <div className="bg-muted/50 rounded-xl p-4 mt-2">
                      <p className="text-xs font-medium text-foreground mb-2">Courses included:</p>
                      <div className="space-y-1.5">
                        {courses.slice(0, 3).map((c: any) => (
                          <div key={c.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Check className="h-3 w-3 text-emerald-500" />
                            <span>{c.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
