# Task ID: 2 - Flow & Navigation Fixer

## Agent: Flow & Navigation Fixer

## Summary
Fixed critical navigation and flow issues across 5 component files and created 2 new API routes. Also added a NewsletterSubscriber model to the Prisma schema.

## Files Modified

### 1. `/home/z/my-project/src/components/layout/sidebar.tsx`
- **Line 93**: Changed "Schedule Session" quick-create nav from `'admin-dashboard'` to `'admin-live-cohorts'`
- **Line 341-343**: Added `onClick` handler to "Profile" DropdownMenuItem - navigates to `'learner-profile'` for learner mode and `'admin-settings'` for admin mode
- **Line 360-363**: Fixed "Sign Out" to call both `logout()` AND `goToLanding()` instead of just `goToLanding()`
- Added `logout` to the destructured store values

### 2. `/home/z/my-project/src/components/landing/landing-page.tsx`
- **goToCheckout**: Changed from `setAppMode('admin')` to `setAppMode('learner')` since learners checkout, not admins
- **Footer social media buttons**: Changed from `motion.button` to `<a>` tags with real `href` links (Twitter, LinkedIn, GitHub, YouTube) opening in new tabs with `rel="noopener noreferrer"`
- **Footer "About" link**: Changed `id="features"` to `id="about"` on the features section so the About link scrolls correctly; updated nav `scrollTo('features')` to `scrollTo('about')`
- **Footer "Contact" link**: Added a new contact section with `id="contact"` before the CTA section, with email and response time info
- **Footer "Resources" links**: Changed from `<span>` tags to `<a>` tags with `href="#"`, `target="_blank"`, and `rel="noopener noreferrer"`
- **Newsletter subscribe**: Added API call to `POST /api/newsletter` with email, wrapped in try/catch
- **Community preview "Like" and "Comment" buttons**: Added `onClick={() => goToLogin('learner')}` handlers that navigate to learner view
- **CountdownTimer**: Removed reset behavior - when it reaches 0, shows "Offer Expired" instead of resetting to 23:59:59
- **FloatingStatsCounter**: Made numbers more realistic - initial count 1423 (was 2847), range 1200-1600 (was 2800-2900), "30+ countries" (was "50+")

### 3. `/home/z/my-project/src/components/checkout/checkout-page.tsx`
- **Line 587-589 "View Receipt" button**: Added `onClick={() => setView('learner-course')}` to navigate to learner course view
- **Lines 601-612 Social share buttons**: Added onClick handlers using `navigator.share()` API with fallback to `navigator.clipboard.writeText()` + toast notification
- **Line 379-381 annualPrice calculation**: Fixed to `product.price * 10` (10 months for 12 months access) instead of using `compareAtPrice`
- **Coupon codes**: Added comment that coupons should be validated server-side; changed `handleApplyCoupon` to call `/api/coupons/validate` first with client-side fallback
- **Tax calculation**: Changed `taxRate = 0` to `taxRate = 0.08` (8% default)
- **Hardcoded "3 Courses"**: Replaced with `{courses.length > 0 ? ... : 'Full Access'}` using actual course data
- **Hardcoded "Sarah Mitchell"**: Replaced with `{currentUser?.name || 'Course Instructor'}` using actual user data

### 4. `/home/z/my-project/src/components/layout/app-layout.tsx`
- **TopBar notification items**: Added `handleNotificationClick` function that maps notification type to relevant view:
  - enrollment → learner-course
  - assessment → learner-course
  - community → learner-community
  - cohort → learner-live-cohorts
  - system → admin-settings
  - achievement → learner-achievements
  - completion → learner-course
- **"Profile" link**: Already correct - goes to `'learner-profile'` for learners and `'admin-settings'` for admins
- **"Settings" link**: Fixed to always go to `'admin-settings'` instead of same view as Profile
- Added `import type { AppView } from '@/types'` for type safety

### 5. `/home/z/my-project/src/components/shared/search-dialog.tsx`
- **Search results navigation**: Added `setSelectedCourseId(result.id)` in `handleSelect` for course results
- **Assessment results always go to admin view**: Fixed to use `appMode === 'admin' ? 'admin-assessments' : 'learner-course'` in learner mode
- **Wrong icons on quick-nav items**: Fixed "Go to Settings" icon from Search to Settings; Fixed "Go to Achievements" icon from Search to Trophy; Fixed "Go to AI Tutor" icon from Search to Sparkles
- Added imports for `Settings`, `Trophy`, and `Sparkles` icons
- Added `setSelectedCourseId` to destructured store values

## New Files Created

### `/home/z/my-project/src/app/api/newsletter/route.ts`
- POST endpoint to subscribe an email to the newsletter
- Validates email format, checks for existing subscribers, creates new subscriber with first available tenant
- Uses the NewsletterSubscriber Prisma model

### `/home/z/my-project/src/app/api/coupons/validate/route.ts`
- POST endpoint to validate coupon codes server-side
- Returns valid/invalid status with discount and label
- Currently uses in-memory coupon map (same codes as client-side: SAVE20, WELCOME10, LAUNCH50)
- Includes active flag for future coupon expiration support

## Prisma Schema Changes
- Added `NewsletterSubscriber` model with fields: id, email (unique), tenantId, source, createdAt
- Added `newsletterSubscribers NewsletterSubscriber[]` relation to Tenant model
- Successfully pushed schema with `bun run db:push`

## Lint Status
- `bun run lint` passed with exit code 0 - no errors
