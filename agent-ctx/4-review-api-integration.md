# Task 4: Replace mockReviews with Real API Data

## Summary
Replaced hardcoded `mockReviews` data in `admin-community.tsx` with real API data fetched from a new `/api/community/reviews` endpoint. Created the full backend (Prisma model, API routes, hooks) and connected all review moderation actions (approve, reject, flag, respond) to real API mutations.

## Files Changed

### Prisma Schema
- **`prisma/schema.prisma`**: Added `CourseReview` model with fields: id, tenantId, courseId, authorId, rating, content, status, flagged, flagReason, adminResponse, moderationHistory, timestamps. Added relations on Tenant, Course, and User models. Also added missing `LearningPath`, `LearningPathCourse`, and `LearningPathEnrollment` models that were referenced but undefined.

### API Routes
- **`src/app/api/community/reviews/route.ts`** (NEW): GET endpoint with filtering (status, courseId, rating, tenantId) and sorting (newest, oldest, highest, lowest, flagged). POST endpoint for creating reviews. Includes author and course relations.
- **`src/app/api/community/reviews/[reviewId]/route.ts`** (NEW): PATCH endpoint for moderation (approve/reject/flag/respond). GET for single review. DELETE for removing reviews. Moderation actions update the review status and append to the JSON moderation history.

### React Query Hooks
- **`src/hooks/use-data.ts`**: Added three new hooks:
  - `useCommunityReviews(params)` — fetches reviews with filtering/sorting
  - `useModerateReview()` — mutation for approve/reject/flag actions
  - `useRespondToReview()` — mutation for admin responses

### Component
- **`src/components/admin/admin-community.tsx`**:
  - Replaced `mockReviews` array with `useCommunityReviews()` hook data
  - Added `mapApiReviewToCourseReview()` function to transform API data to component interface
  - Kept `fallbackReviews` for when DB is empty (graceful degradation)
  - Replaced local state `setReviews()` handlers with real API mutations (`moderateReviewMutation`, `respondToReviewMutation`)
  - Added loading skeletons for review analytics cards and review list items
  - Added loading spinners on moderation action buttons (approve/reject/flag/respond)
  - Added `isReviewMutating` state to disable buttons during mutations
  - Improved empty state messaging for filtered reviews

### Seed Data
- **`src/app/api/seed/route.ts`**: Added 10 reviewer users and 10 course reviews with varied statuses (pending, approved, rejected, flagged), pre-populated moderation history, and admin responses.
- Seeded database directly with 10 reviews using Node.js Prisma client.

## Technical Decisions
1. **CourseReview model** uses a JSON string for `moderationHistory` since SQLite doesn't support arrays — this matches the existing pattern of using JSON strings for complex data in the schema.
2. **Fallback data** is preserved to ensure the UI works even before seeding, maintaining the same visual appearance.
3. **API filtering** is done server-side for status and sort, while course and rating filtering remains client-side for simplicity (matching the original behavior).
4. **Review mutations** use `useCallback` with proper dependencies to satisfy the React Compiler's memoization requirements.
