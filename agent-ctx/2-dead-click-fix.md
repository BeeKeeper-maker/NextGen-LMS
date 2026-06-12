# Task 2: Fix All Dead Clicks and Navigation Issues

## Agent: Dead Click Fix Developer

## Work Log

### Fix 1: Learner Dashboard "Enroll Now" Dead Click
- **File**: `src/components/learner/learner-dashboard.tsx`
- Added `useEnroll` import from `@/hooks/use-data`
- Added `setView`, `setSelectedCourseId`, `setSelectedCheckoutItemId` from `useAppStore`
- Added `enrollMutation = useEnroll()` hook call
- **"Enroll Now" button**: Added `onClick` handler that:
  - Calls `e.stopPropagation()` to prevent card click interference
  - If course is free (price === 0 or null): calls `enrollMutation.mutate({ userId, courseId, tenantId })`
  - If course is paid: sets `selectedCheckoutItemId` and navigates to `checkout` view
- **Recommended course cards**: Added `onClick` on the Card component that sets `selectedCourseId` and navigates to `learner-course` view

### Fix 2: Checkout Accessible for Learners
- **File**: `src/components/layout/sidebar.tsx`
- Added `ShoppingCart` import from `lucide-react`
- Added Checkout nav item to `learnerNavItems` array: `{ label: 'Checkout', view: 'checkout', icon: ShoppingCart }`
- **File**: `src/store/app-store.ts`
- Added `selectedCourseId: string | null` and `selectedCheckoutItemId: string | null` to AppState interface and initial state
- Added `setSelectedCourseId` and `setSelectedCheckoutItemId` actions

### Fix 3: Unenroll Calls Real API
- **File**: `src/components/learner/learner-course.tsx`
- Added imports: `apiDelete` from `@/lib/api`, `toast` from `sonner`
- Added `setView` from `useAppStore` 
- Fixed BOTH `ConfirmDialog` `onConfirm` handlers (line ~2275 and ~3060):
  - Now calls `apiDelete(\`/enrollments/${enrollmentId}\`)` with the enrollment ID from the `enrollment` computed value
  - Shows success toast and navigates back to `learner-dashboard` on success
  - Shows error toast on failure
- Also updated the component to use `selectedCourseId` from app store when available, falling back to first course

### Fix 4: Admin Live Cohort Edit Button
- **File**: `src/components/admin/admin-live-cohorts.tsx`
- Added `useUpdateLiveCohort` import
- Added `editingEventId` state and `updateCohort` mutation
- Added `handleEditEvent(event)` function that:
  - Sets `editingEventId` to the event's ID
  - Populates the form with the event's existing data (title, description, type, color, courseId, etc.)
  - Sets the event date, start time, and duration from the event
  - Opens the schedule dialog
- Both Edit buttons (calendar view line ~1101 and list view line ~1310) now call `handleEditEvent(event)`
- Modified `handleCreateEvent` to branch on `editingEventId`:
  - If editing: calls `updateCohort.mutate({ id, ...data })`
  - If creating: calls `createCohort.mutate({ ...data })`
- Updated dialog title and description to show "Edit Session" vs "Schedule New Session" based on mode
- Updated success message to show "Session Updated!" vs "Session Scheduled!"
- Dialog close resets `editingEventId` and form

### Fix 5: Dead Buttons in Learner Live Cohorts
- **File**: `src/components/learner/learner-live-cohorts.tsx`
- **5a. "Join Session" button**: Added `onClick={() => window.open(session.meetingUrl, '_blank')}` to open the meeting link
- **5b. "Watch Recording" button**: Added `onClick` that opens the recording URL in a new tab
- **5c. "Add to Calendar" button**: Added `onClick` handler that:
  - Generates an ICS calendar file with the event details (title, description, start/end times, location)
  - Creates a Blob and triggers download as `.ics` file
  - Uses UTC date format for ICS compliance

### Fix 6: Checkout Error Handling
- **File**: `src/components/checkout/checkout-page.tsx`
- Added `import { toast } from 'sonner'`
- Changed the catch block from silently swallowing errors (`// Order creation failed but still show success for demo`) to:
  - Calling `toast.error('Payment processing failed. Please try again.')`
  - Setting `isProcessing(false)` 
  - Returning early to prevent showing success state

## Stage Summary
- All 6 dead click/navigation issues fixed
- Lint passes with zero errors
- App store extended with `selectedCourseId` and `selectedCheckoutItemId` for cross-component navigation
- All interactive buttons now have working onClick handlers
- Error handling no longer silently swallows failures
