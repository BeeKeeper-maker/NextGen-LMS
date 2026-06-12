# Task ID: 7 - Agent: Fullstack Developer

## Task
Update admin assessments component to use real API CRUD operations instead of mock data, and add delete confirmations.

## Work Completed

### API Changes
- Updated `/src/app/api/assessments/route.ts` GET endpoint to include `questions` (ordered by orderIndex) and `course.category` in the response

### Component Changes (`/src/components/admin/admin-assessments.tsx`)
1. **Replaced mock-data imports** with real API hooks from `@/hooks/use-data`
2. **Added new imports**: useAssessments, useCreateAssessment, useUpdateAssessment, useDeleteAssessment, useCourses, useAppStore, ConfirmDialog, slugify, Loader2
3. **Added data transformation helpers**: `parseQuestions()` parses JSON strings from API, `mapAssessmentFromApi()` maps full API response to frontend Assessment type
4. **Updated helper functions**: `getCourseTitle()` and `getCourseCategory()` now accept courses array parameter
5. **Updated AssessmentList**: Added `courses` and `onDelete` props; wired delete buttons to `onDelete` callback
6. **Updated AssessmentBuilder**: Added `courses` and `isSaving` props; loading spinners on Save/Publish buttons
7. **Updated AdminAssessments main component**:
   - Uses `useAssessments()` instead of `useState(demoAssessments)`
   - Uses `useCourses()` for course dropdown
   - Uses create/update/delete mutations for CRUD
   - Uses `useAppStore()` for tenantId
   - Added ConfirmDialog for delete confirmation
   - Added loading state with Loader2 spinner
   - Questions properly serialized in API payload

## Key Decisions
- API list endpoint modified to include questions to support quick preview feature in list view
- JSON string fields (options, correctAnswer) from Prisma/SQLite are parsed on the frontend
- New assessments are identified by `id.startsWith('new-')` pattern
- All UI/styling preserved exactly as original
