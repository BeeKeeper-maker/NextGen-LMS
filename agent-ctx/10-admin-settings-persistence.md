# Task 10: Admin Settings API Persistence

## Summary
Updated the admin-settings.tsx component to use real API persistence instead of mock/local-only state.

## Changes Made

### 1. Added Imports
- `useUpdateTenant`, `useUpdateUser`, `useTenant` from `@/hooks/use-data`
- `ConfirmDialog` from `@/components/shared/confirm-dialog`

### 2. GeneralSettings Tab
- Replaced raw `fetch()` call with `useUpdateTenant()` hook
- Zustand store updated via `setCurrentTenant()` on successful save
- Loading state derived from `updateTenant.isPending`

### 3. BrandingTheming Tab
- Replaced raw `fetch()` call with `useUpdateTenant()` hook
- Store updated via `setCurrentTenant()` so ThemeSync detects CSS variable changes
- Loading state derived from `updateTenant.isPending`

### 4. DomainSSL Tab
- Added `useUpdateTenant()` hook
- Initialized domain from `currentTenant?.domain`
- Added real API persistence on save
- Added loading spinner to Save button

### 5. Integrations Tab
- Added `useUpdateTenant()` hook
- Added real API persistence on save
- Added loading spinner to Save button

### 6. TeamRoles Tab
- Added `saving` state with spinner on Save button

### 7. NotificationPreferences Tab
- Added `useUpdateUser()` hook
- Wired Save button to persist via API
- Store updated via `setCurrentUser()` on success
- Added loading spinner

### 8. EmailTemplates Tab
- Added `savingTemplate` state
- Async save with loading indicator on Save Template button

### 9. WebhookSettings Tab
- Added `savingWebhook` state with loading indicator
- Added `deleteWebhookId` state with ConfirmDialog for delete confirmation

### 10. TwoFactorAuth Tab
- Added `useUpdateUser()` hook with `currentUser`/`setCurrentUser` from store
- Replaced AlertDialog-based destructive actions with ConfirmDialog:
  - Disable 2FA
  - Revoke All Devices
  - Sign Out Other Sessions

### 11. ApiKeysSettings Tab
- Replaced AlertDialog for API key revocation with ConfirmDialog

### 12. DataPrivacySettings Tab
- Replaced AlertDialog for "Apply Retention Policy" with ConfirmDialog
- Replaced AlertDialog for "Restore from Backup" with ConfirmDialog
- Kept complex erase dialog (requires typed input) as Dialog

### Lint Fixes
- Removed `useEffect` hooks that called setState synchronously (lint error `react-hooks/set-state-in-effect`) in GeneralSettings, BrandingTheming, and DomainSSL
- Initial state is already derived from store values, so the effects were redundant

## Verification
- ESLint passes with zero errors
- Dev server compiles successfully with no runtime errors
