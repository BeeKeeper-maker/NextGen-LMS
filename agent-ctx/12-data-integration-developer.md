# Task 12: Update Learner Course Component - Real API Data & Progress Tracking

## Agent: Data Integration Developer

## Summary
Updated the learner course component (`/home/z/my-project/src/components/learner/learner-course.tsx`) to use real API data instead of mock data, and added progress tracking that persists to the database.

## Changes Made

### 1. Import Replacements
- **Removed**: `demoCourses`, `demoEnrollments` from `@/lib/mock-data`
- **Removed**: `useApi`, `apiPost` from `@/lib/api`
- **Added**: `useCourse`, `useEnrollments`, `useLessonProgress`, `useUpdateProgress`, `useEnroll`, `useCourses` from `@/hooks/use-data`
- **Added**: `ConfirmDialog` from `@/components/shared/confirm-dialog`
- **Added**: `useMemo` to React imports

### 2. Mock Data Removal
- Removed hardcoded `lessonProgressMap` - now computed from API progress data
- Removed hardcoded `resumePositions` - now derived from API progress data (resumePosition field)
- Added `defaultResumePositions` as empty fallback

### 3. Main Component (`LearnerCourse`) Changes
- Added `userId` and `tenantId` from `useAppStore`
- Uses `useCourses()` to determine first course ID
- Uses `useCourse(courseId)` to fetch full course data with modules/lessons
- Uses `useEnrollments(userId)` to check enrollment status
- Uses `useLessonProgress(userId)` to get lesson progress
- Uses `useUpdateProgress()` mutation for saving progress
- Uses `useEnroll()` mutation for course enrollment

### 4. Progress Tracking
- Lesson progress map computed via `useMemo` from API data
- Resume positions computed via `useMemo` from API progress data
- When clicking a lesson, marks it as 'in_progress' via `useUpdateProgress().mutate()`
- When completing a lesson, saves as 'completed' with progressPercent: 100
- During video playback, periodically saves progress to API (every ~30 seconds) including resumePosition
- Enrollment progress percentage computed from API data with fallback calculation

### 5. Enrollment Flow
- Shows "Enroll Now" button when user is not enrolled (with loading state)
- Shows "Continue Learning" + "Unenroll" buttons when enrolled
- Enrollment uses `useEnroll()` mutation with userId, courseId, tenantId

### 6. Destructive Action Confirmation
- Added `ConfirmDialog` for unenroll action with destructive variant
- Shows in both active lesson view and main course view

### 7. Loading States
- Skeleton UI with animated pulse placeholders during data fetch
- Empty state when no course is found
- Loading spinner on enroll button during mutation

## Files Modified
- `/home/z/my-project/src/components/learner/learner-course.tsx`

## Lint Status
- ESLint passes with zero errors for learner-course.tsx
