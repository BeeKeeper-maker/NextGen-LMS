# Task 6 - Data Integration Developer Work Record

## Task: Replace demoCalendarEvents inline mock data with real API data

### Summary
Replaced all inline mock data in `admin-live-cohorts.tsx` with real API integration. Created a full-stack data pipeline: Prisma model → API routes → React Query hooks → Component integration.

### Schema Changes
- Added `LiveCohort` model to `prisma/schema.prisma`
- Fixed pre-existing schema issues (CourseReview relations, LearningPathCourse model, LearningPath relations)

### API Routes
- `src/app/api/live-cohorts/route.ts` - GET (list), POST (create)
- `src/app/api/live-cohorts/[cohortId]/route.ts` - GET (single), PUT (update), DELETE (delete)

### Hooks
- `useLiveCohorts`, `useLiveCohort`, `useCreateLiveCohort`, `useUpdateLiveCohort`, `useDeleteLiveCohort` in `src/hooks/use-data.ts`

### Component Changes
- Removed `demoCalendarEvents` array (~100 lines of mock data)
- Replaced `useState<CalendarEvent[]>(demoCalendarEvents)` with `useLiveCohorts(tenantId)` hook data
- `handleCreateEvent` → calls `createCohort.mutate()`
- `handleCancelEvent` → calls `deleteCohort.mutate(id)`
- Added loading skeletons and empty states
- Fixed SortIcon lint error (component in render → renderSortIcon function)

### Seed Data
- Added 8 demo live cohorts to seed route matching original mock data

### Verification
- ESLint passes on all changed files
- `bun run db:push` successful
- Seed API creates demo data successfully
