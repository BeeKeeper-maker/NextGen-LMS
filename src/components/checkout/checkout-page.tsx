'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/app-store';
import { demoProducts, demoCourses, supportedCurrencies } from '@/lib/mock-data';
import type { CurrencyOption } from '@/types';

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

const cardBrandLogos: Record<string, string> = {
  visa: '💳 Visa',
  mastercard: '💳 MC',
  amex: '💳 Amex',
  unknown: '',
};

export function CheckoutPage() {
  const { setView, currentView } = useAppStore();
  const product = demoProducts[0]; // React Masterclass Bundle
  const course = demoCourses[0]; // Alternative checkout item

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(supportedCurrencies[0]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [email, setEmail] = useState('');

  const cardBrand = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);

  const convertedPrice = useMemo(
    () => product.price * selectedCurrency.rate,
    [product.price, selectedCurrency.rate]
  );

  const convertedOriginalPrice = useMemo(
    () => product.compareAtPrice ? product.compareAtPrice * selectedCurrency.rate : null,
    [product.compareAtPrice, selectedCurrency.rate]
  );

  const savings = useMemo(() => {
    if (!product.compareAtPrice) return null;
    return (product.compareAtPrice - product.price) * selectedCurrency.rate;
  }, [product.compareAtPrice, product.price, selectedCurrency.rate]);

  const handlePayNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 2000);
  };

  const isFormValid = cardholderName && cardNumber.replace(/\s/g, '').length >= 15 && expiry.length === 5 && cvv.length >= 3 && email;

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="max-w-md w-full"
        >
          <Card className="border-emerald-200 shadow-xl">
            <CardContent className="pt-8 pb-8 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                className="mx-auto w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <h2 className="text-2xl font-bold text-foreground">Payment Successful!</h2>
                <p className="text-muted-foreground">Your course access is now active</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4 text-left space-y-2"
              >
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Order Details</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">{product.name}</p>
                <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                  {formatPrice(product.price, selectedCurrency)} {selectedCurrency.code}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Confirmation sent to {email || 'your email'}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Button
                  onClick={() => setView('learner-dashboard')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  Go to Dashboard
                </Button>
                <Button variant="outline" className="flex-1">
                  View Receipt
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-violet-50/20 dark:from-slate-950 dark:to-violet-950/10 p-6">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm rounded-t-lg px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('learner-dashboard')}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-foreground">Secure Checkout</h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600">
            <Lock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">SSL Encrypted</span>
          </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Left Column - Order Summary */}
          <div className="lg:col-span-3 space-y-6">
            {/* Product Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="overflow-hidden border-border shadow-sm">
                <div className="bg-gradient-to-r from-violet-600 to-emerald-600 p-1" />
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="shrink-0 w-full sm:w-48 h-32 rounded-lg bg-gradient-to-br from-violet-100 to-emerald-100 dark:from-violet-950 dark:to-emerald-950 flex items-center justify-center">
                      <div className="text-center">
                        <Star className="h-8 w-8 text-violet-600 dark:text-violet-400 mx-auto mb-1" />
                        <p className="text-xs font-medium text-violet-700 dark:text-violet-300">Best Seller</p>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 dark:bg-violet-900 dark:text-violet-300 text-xs">
                              {product.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300">
                              3 Courses
                            </Badge>
                          </div>
                          <h3 className="text-lg font-bold text-foreground">{product.name}</h3>
                        </div>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">
                          {formatPrice(product.price, selectedCurrency)}
                        </span>
                        {convertedOriginalPrice && (
                          <span className="text-base text-muted-foreground line-through">
                            {formatPrice(product.compareAtPrice!, selectedCurrency)}
                          </span>
                        )}
                        {savings && (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300 text-xs">
                            Save {formatPrice(savings, selectedCurrency)}
                          </Badge>
                        )}
                      </div>

                      {/* Currency Selector */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5" />
                          Display price in
                        </Label>
                        <Select
                          value={selectedCurrency.code}
                          onValueChange={(code) => {
                            const c = supportedCurrencies.find((c) => c.code === code);
                            if (c) setSelectedCurrency(c);
                          }}
                        >
                          <SelectTrigger className="w-full sm:w-64">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {supportedCurrencies.map((c) => (
                              <SelectItem key={c.code} value={c.code}>
                                {c.symbol} {c.code} — {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedCurrency.code !== 'USD' && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <RotateCcw className="h-3 w-3" />
                            Approximate conversion. You&apos;ll be charged in USD.
                          </p>
                        )}
                      </div>

                      {/* Features */}
                      <div className="pt-2">
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
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-violet-600" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm">Email for receipt</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10"
                    />
                  </div>

                  {/* Cardholder Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="cardholder" className="text-sm">Cardholder name</Label>
                    <Input
                      id="cardholder"
                      placeholder="Full name on card"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      className="h-10"
                    />
                  </div>

                  {/* Card Number */}
                  <div className="space-y-1.5">
                    <Label htmlFor="cardnumber" className="text-sm">Card number</Label>
                    <div className="relative">
                      <Input
                        id="cardnumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        className="h-10 pr-20"
                        maxLength={19}
                      />
                      {cardBrand !== 'unknown' && cardNumber.length > 0 && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                          {cardBrandLogos[cardBrand]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="expiry" className="text-sm">Expiry date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        className="h-10"
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cvv" className="text-sm">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="h-10"
                        maxLength={4}
                        type="password"
                      />
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="pt-2 flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Lock className="h-3.5 w-3.5 text-emerald-600" />
                      Secure Checkout
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Shield className="h-3.5 w-3.5 text-emerald-600" />
                      SSL Encrypted
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                      30-day Money Back
                    </div>
                  </div>

                  {/* Accepted Payment Methods */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-muted-foreground">We accept:</span>
                    <div className="flex gap-1.5">
                      <div className="px-2 py-0.5 bg-muted rounded text-xs font-medium text-foreground">VISA</div>
                      <div className="px-2 py-0.5 bg-muted rounded text-xs font-medium text-foreground">MC</div>
                      <div className="px-2 py-0.5 bg-muted rounded text-xs font-medium text-foreground">AMEX</div>
                      <div className="px-2 py-0.5 bg-muted rounded text-xs font-medium text-foreground">PayPal</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Order Total */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="lg:sticky lg:top-20"
            >
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Item */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.type} • 3 courses</p>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {formatPrice(product.price, selectedCurrency)}
                    </p>
                  </div>

                  <Separator />

                  {/* Pricing Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatPrice(product.price, selectedCurrency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform Fee</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground">$0.00</span>
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] px-1.5 py-0">
                          0% Fee
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="text-foreground">$0.00</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-semibold text-foreground">Total</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">
                        {formatPrice(product.price, selectedCurrency)}
                      </p>
                      {selectedCurrency.code !== 'USD' && (
                        <p className="text-xs text-muted-foreground">
                          ≈ ${product.price.toFixed(2)} USD
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pay Button */}
                  <Button
                    className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 transition-all"
                    onClick={handlePayNow}
                    disabled={!isFormValid || isProcessing}
                  >
                    {isProcessing ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Pay {formatPrice(product.price, selectedCurrency)}
                      </>
                    )}
                  </Button>

                  {/* Additional Info */}
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
                  <div className="bg-muted/50 rounded-lg p-3 mt-2">
                    <p className="text-xs font-medium text-foreground mb-2">Courses included in this bundle:</p>
                    <div className="space-y-1.5">
                      {demoCourses.slice(0, 3).map((c) => (
                        <div key={c.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span>{c.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
