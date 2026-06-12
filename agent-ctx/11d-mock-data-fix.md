# Task 11d - Mock Data Fix Developer

## Task
Fix MEDIUM-priority remaining mock data issues in 3 areas.

## Summary
All 3 mock data areas have been replaced with real database-backed data:

### 1. admin-settings.tsx — Data & Privacy tab
- **Removed**: `MOCK_RECENT_EXPORTS`, `MOCK_RECENT_IMPORTS`, `MOCK_BACKUPS` arrays
- **Added Prisma models**: `DataExport`, `DataImport`, `Backup` (each with tenantId FK)
- **Created API routes**: `/api/data-exports` (GET/POST/DELETE), `/api/data-imports` (GET/POST), `/api/backups` (GET/POST/DELETE)
- **Added hooks**: `useDataExports`, `useCreateDataExport`, `useDeleteDataExport`, `useDataImports`, `useCreateDataImport`, `useBackups`, `useCreateBackup`
- **Behavior changes**: Export creates real DB record, Import creates real record, Backup creates real record, Delete Export calls DELETE API

### 2. bulk-certificate-tab.tsx
- **Removed**: Hardcoded `bulkCertificateRecords` array (8 mock entries)
- **Replaced with**: `useCertificateAwards(tenantId)` hook from existing API
- **Maps**: API award data (`recipientName`, `courseName`, `user.email`, `verificationCode`, `issuedAt`) → `BulkCertificateRecord` interface

### 3. mock-data.ts cleanup
- **Verified**: Zero imports of `@/lib/mock-data` across the entire src directory
- **Deleted**: The 906-line file entirely

## Validation
- `bun run db:push` completed successfully
- `bun run lint` passed with zero errors
- Dev server running without compilation errors
