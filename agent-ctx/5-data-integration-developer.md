# Task 5 - Data Integration Developer: Replace inline mock data in admin-learning-paths.tsx with real API data

## Summary
Successfully replaced all inline mock data in the learning paths admin component with real API data backed by Prisma models, API routes, and React Query hooks.

## Changes Made

### 1. Prisma Schema (`prisma/schema.prisma`)
- Removed incomplete/duplicate LearningPath models from a previous agent
- Added proper models:
  - `LearningPath` - title, description, thumbnailUrl, category, level, duration, isPublished, orderIndex, relations
  - `LearningPathCourse` - learningPathId, courseId, orderIndex, isRequired, milestone, prerequisiteIds
  - `LearningPathEnrollment` - learningPathId, userId, tenantId, status, progress, startedAt, completedAt
- Added relation fields to Tenant, Course, and User models
- Ran `bun run db:push` successfully

### 2. API Routes
- `src/app/api/learning-paths/route.ts` - GET (list with computed fields) and POST (create with nested courses)
- `src/app/api/learning-paths/[pathId]/route.ts` - GET (single), PUT (update + replace courses), DELETE (cascade)

### 3. React Query Hooks (`src/hooks/use-data.ts`)
- `useLearningPaths(tenantId?)` - Query hook
- `useLearningPath(pathId)` - Query hook
- `useCreateLearningPath()` - Mutation hook
- `useUpdateLearningPath()` - Mutation hook
- `useDeleteLearningPath()` - Mutation hook

### 4. Component (`src/components/admin/admin-learning-paths.tsx`)
- Removed `mockCourses` and `mockPaths` arrays entirely
- Added `mapApiPathToLearningPath()` and `mapApiCourseToPathCourseSource()` data mappers
- Connected all CRUD operations to API mutations
- Added `PathCardSkeleton` and `PathListSkeleton` loading states
- Added empty states (no paths, no filter results, error)
- Fixed bug where `removeCourse` was referenced outside its scope
- Removed unused imports

## Verification
- All lint checks pass
- Database schema synced
- No mock data remaining
