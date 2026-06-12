# Task 11b - Mock Data Replacement Developer

## Task: Replace remaining mock data found by self-audit

## Summary
Replaced all remaining mock/hardcoded data in 4 files across 3 component areas with real API data via existing hooks from `@/hooks/use-data`.

## Changes Made

### 1. admin-courses.tsx - Review Moderation
- **Removed**: `allMockReviews` array (20 hardcoded review objects)
- **Added**: `useCommunityReviews()` hook to fetch real reviews from `/api/community/reviews`
- **Added**: `useModerateReview()` mutation for flag/approve/reject actions
- **Added**: `mapApiReviewToDisplay()` helper function that maps API review format to component's `CourseReview` interface
- **Connected**: Flag, Hide, Delete, Reply actions now call `moderateReviewMutation.mutate()` instead of local state updates
- **Added**: Loading skeleton with animated pulse placeholders

### 2. learner-live-cohorts.tsx - Live Cohorts
- **Removed**: `demoCalendarEvents` array (8 hardcoded events) and `sessionRecordings` array (4 hardcoded recordings)
- **Added**: `useLiveCohorts(tenantId)` hook to fetch real cohort data from `/api/live-cohorts`
- **Added**: `mapCohortToRecording()` helper to derive session recordings from completed cohorts
- **Added**: Full-page loading spinner, empty states for recordings and weekly schedule

### 3. bulk-enrollment-tab.tsx - Bulk Enrollment Users
- **Removed**: `bulkUsers` array (15 hardcoded users)
- **Added**: `useUsers(tenantId)` hook to fetch real users from `/api/users`
- **Added**: `mapApiUserToBulkUser()` and `formatRelativeTime()` helpers
- **Added**: Loading skeletons for user list, empty state when no users found

### 4. bulk-email-tab.tsx - Bulk Email Users
- **Removed**: `bulkUsers` array (15 hardcoded users)
- **Added**: `useUsers(tenantId)` hook with same mapping helpers
- **Updated**: `recipientCount` calculation uses real user counts (was hardcoded: 3847, * 257, 156)

## Verification
- `bun run lint` passes with zero errors
- No compilation errors in dev server
