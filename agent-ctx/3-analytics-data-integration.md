# Task ID: 3 - Analytics Data Integration Developer

## Task
Replace hardcoded/inline mock data in `src/components/admin/admin-analytics.tsx` with real API data using the existing React Query hooks.

## Changes Made

### 1. `src/hooks/use-data.ts` — Added `useAnalyticsEvents` hook
- New hook supporting query params: `tenantId`, `eventType`, `startDate`, `endDate`, `userId`, `page`, `limit`
- Returns `{ events, summary, pagination }` from `/api/analytics/events`
- `enabled: !!params?.tenantId` — only fetches when tenantId is provided

### 2. `src/components/admin/admin-analytics.tsx` — Replaced 7 hardcoded arrays

**Geographic Distribution (4 arrays):**
- `geographicData` — Was hardcoded with USA/UK/India/Canada/Others. Now computed from `geographicEvents` (eventType='geographic'), with fallback to user-derived data.
- `regionalPieData` — Was hardcoded Americas/Europe/Asia/Other. Now aggregated from geographic events' region field, with fallback derived from geographicData.
- `newMarketsData` — Was hardcoded Brazil/Nigeria/Vietnam/Philippines/Egypt. Now filtered from events with `isNewMarket` flag, with fallback from smaller-percentage geographicData entries.
- `regionComparisonData` — Was hardcoded with 7 regions. Now aggregated from events' region data, with fallback derived from geographicData + course data.

**Learning Outcomes (3 arrays):**
- `beforeAfterData` — Was hardcoded with 6 skills. Now parsed from learning_outcome events' `eventData.skill/before/after`, with fallback derived from course completion rates.
- `beforeAfterRadarData` — Was hardcoded with 8 skills. Now from events with shortened skill names, fallback from beforeAfterData.
- `skillsRadarData` — Was hardcoded with 8 skills. Now from events' `eventData.skill/score`, fallback from beforeAfterData's "after" values.

### 3. Loading & Empty States
- Geographic section: Shows skeleton UI when `geographicEventsLoading`, empty state with Globe icon when no data.
- Learning outcomes section: Shows skeleton UI when `learningOutcomeEventsLoading`, empty state with GraduationCap icon when no data.
- Radar charts conditionally rendered only when data arrays are non-empty.
- Regional pie chart shows "No regional data" message when regionalPieData is empty.
- New markets section shows "No emerging market data" when newMarketsData is empty.
- Region comparison table shows "No regional comparison data" when regionComparisonData is empty.

### 4. Dynamic Values (previously hardcoded)
- SVG world map region percentages now use `regionalPieData.find(r => r.name === 'Americas')?.value` instead of hardcoded "45%" etc.
- Summary stat cards use `geographicData.length`, `geographicData.reduce(...learners)`, `regionalPieData.length`, `geographicData[0].percentage` instead of hardcoded 48/3847/6/35%.
- "Average improvement" text computed as `Math.round(beforeAfterData.reduce((s,d) => s + (d.after - d.before), 0) / beforeAfterData.length)`.
- `pctImprov` calculation guarded with `skill.before > 0` check.

## Verification
- `bun run lint` passes with zero errors
- Dev server compiles successfully
