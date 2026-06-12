# Task 15: Learner Profile API Integration

## Summary
Updated the learner profile component to use real API data instead of mock data, and added edit persistence.

## Changes Made

### File: `/home/z/my-project/src/components/learner/learner-profile.tsx`

#### 1. New Imports
- `useEffect` from React
- `useUser`, `useUpdateUser`, `useEnrollments`, `useAchievements`, `useDeleteUser` from `@/hooks/use-data`
- `ConfirmDialog` from `@/components/shared/confirm-dialog`

#### 2. Data Fetching Hooks Added
- `useUser(userId)` - fetches user with full profile including enrollments, achievements, certificates, stats
- `useUpdateUser()` - mutation for saving profile changes
- `useDeleteUser()` - mutation for deleting account
- `useEnrollments(userId)` - fetches enrollment data for course history
- `useAchievements(tenantId)` - fetches achievements data

#### 3. Mock Data → API Data Replacements
| Mock Data | Replacement | Source |
|-----------|------------|--------|
| `learningHistory` | `learningHistoryFromApi` | Completed enrollments from API |
| `certificates` | `certificatesFromApi` | User's certificateAwards from API |
| `courseCompletionData` | `courseCompletionFromApi` | Computed from enrollment statuses |
| `goalProgressData` | `goalProgressFromApi` | Computed from user stats |
| `allActivities` | `allActivitiesFromApi` | User achievements + enrollment activities |

#### 4. Profile Edit Persistence
- `handleSave` now calls `updateUserMutation.mutateAsync()` with name, bio, timezone, locale
- On success, updates Zustand store via `setCurrentUser()` with returned data
- `handleSavePreferences` added for preferences tab with same pattern
- Error handling via toast notifications (built into mutation hooks)

#### 5. Form State Sync
- `useEffect` syncs form fields (firstName, lastName, bio, timezone, language) from userData when API data loads
- Cancel button resets form to current API data

#### 6. ConfirmDialog for Destructive Actions
- Export All Data: confirmation dialog with default variant
- Deactivate Account: destructive confirmation, calls `updateUserMutation` with `isActive: false`
- Delete Account: destructive confirmation, calls `deleteUserMutation.mutateAsync(userId)`
- Replaced old inline Dialog with ConfirmDialog component

#### 7. Loading States
- Personal info save button: spinner + "Saving..." during mutation, disabled state
- Preferences save button: spinner + "Saving..." during mutation, disabled state
- Learning history tab: loading spinner during enrollment fetch
- Empty states for certificates and history when no data

#### 8. Header Data Updates
- User name, email, streak, role all sourced from userData first, currentUser as fallback

## What Was NOT Changed
- All UI/styling preserved exactly
- All animations preserved (framer-motion variants, pulseGlow, firePloat, floatParticle, etc.)
- Static reference data kept as-is (timezones, languages, socialLinks, skillRadarData, weeklyLearningHours, etc.)
- Chart data without API equivalents kept as mock (weekly learning hours, learning velocity, time distribution, skill progress over time, heatmap)

## Verification
- ESLint: Passes with zero errors
- Dev server: Compiles successfully
