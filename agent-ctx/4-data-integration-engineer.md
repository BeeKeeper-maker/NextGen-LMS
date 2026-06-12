# Task 4: Update Admin Dashboard to Use Real API Data

## Agent: Data Integration Engineer
## Status: COMPLETED

## Summary
Migrated the admin dashboard component from mock data to real API data using React Query hooks from `@/hooks/use-data`.

## Key Changes

### Imports Replaced
- **Removed**: `import { adminKPIs, revenueData, engagementData, completionFunnelData, categoryData, demoCourses, videoDropoffData } from '@/lib/mock-data'`
- **Removed**: `import { useApi, apiPost } from '@/lib/api'` → replaced with just `import { apiPost } from '@/lib/api'`
- **Added**: `import { useCourses, useAnalytics, useEnrollments, useUsers, useCommunityPosts } from '@/hooks/use-data'`
- **Added**: `useMemo` to React imports

### Sub-Component Updates (Data Props)
1. **RevenueChart** — Now accepts `revenueData` prop; falls back to `defaultRevenueMonthlyData`
2. **EngagementChart** — Now accepts `engagementData` prop; shows empty state with Activity icon
3. **CategoryChart** — Now accepts `categoryData` prop; shows empty state with BarChart3 icon
4. **CompletionFunnel** — Now accepts `completionFunnelDataProp` prop; shows empty state with Target icon
5. **RecentCoursesTable** — Removed `demoCourses` fallback; shows empty state with BookOpen icon
6. **VideoDropoffChart** — Uses inline static data `videoDropoffStaticData` (no API endpoint for video drop-off)

### New Components Added
- **KPISkeleton** — Animated loading skeleton for KPI cards grid (6 cards)
- **ChartSkeleton** — Animated loading skeleton for chart sections
- **ErrorRetryCard** — Error state with icon, message, and retry button

### AdminDashboard Main Component Rewrite
- Uses React Query hooks: `useCourses()`, `useAnalytics()`, `useEnrollments()`, `useUsers(tenantId)`, `useCommunityPosts()`
- KPIs computed from real data via `useMemo` (total revenue, active learners, completion rate, published courses, community engagement, new enrollments)
- Revenue chart data computed from analytics `metrics` array (reversed chronologically, with prevRevenue estimation)
- Engagement chart data computed from last 7 days of analytics metrics
- Category distribution computed from courses (grouped by category, enrollment counts)
- Completion funnel computed from enrollments (by progress stages)
- Courses mapped to proper `Course` type with defaults for missing fields
- Loading skeletons shown while data is fetching
- Error retry cards shown when fetches fail
- Fixed `apiPost` double `/api/` prefix bug

### Bug Fix
- Fixed `useCallback` in `CompletionFunnel` being called after early return (React hooks rules-of-hooks violation)
- Fixed `apiPost('/api/analytics/events')` → `apiPost('/analytics/events')` (double prefix bug)

## Verification
- ESLint passes with zero errors for admin-dashboard.tsx
- Dev server compiles successfully
- API endpoints respond correctly (/api/courses, /api/analytics, /api/enrollments, /api/community)
