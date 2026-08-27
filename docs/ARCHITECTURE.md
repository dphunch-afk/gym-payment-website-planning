# Architecture Plan

## Product shape

Build one role-based full-stack application that serves both owners/admins and members.

The first production target is a **mobile-first Progressive Web App (PWA)** that:
- Opens directly in Chrome/other normal browsers
- Works well on desktop and mobile
- Can be installed to an Android home screen
- Does not require Expo to open the public browser version

A native Android APK/AAB can be added later using the same backend and role model.

## Suggested stack

The exact implementation can vary, but a practical target is:
- Frontend: React + TypeScript
- Mobile-first responsive UI
- PWA manifest + service worker
- Backend/API: managed backend or server application
- Database: relational database (PostgreSQL preferred)
- Authentication: managed secure auth or server-backed sessions
- Storage: receipts/assets if needed

## Backend responsibilities

The backend must own:
- Authentication and authorization
- Member privacy enforcement
- Payment validation
- Due calculation / ledger
- Expense records
- Attendance
- Reports
- Role permissions
- Audit trail

Do not rely on client-side checks alone for security or financial correctness.

## Recommended financial model

For a simple MVP, membership charges and received payments can calculate outstanding dues.

For production, use a ledger model:
- Charges create amounts owed
- Payments reduce amounts owed
- Discounts/adjustments are explicit entries
- Corrections are auditable

This prevents historical figures changing when membership prices are edited later.

## Offline/PWA behavior

Useful cached/offline content:
- App shell
- Last-loaded member dashboard
- Last-loaded workout plan
- Static navigation/assets

Actions that change financial or private data should require a reliable backend confirmation before being considered complete.

## Deployment

### Web/PWA
- HTTPS public URL
- Direct app entry
- Production environment variables/secrets outside source control
- Database migrations tracked

### Android later
Options:
- Trusted Web Activity / PWA wrapper
- Capacitor-style wrapper
- Separate native frontend sharing backend APIs

Do not use a development Expo launcher as the production web experience.

## Environments

Recommended:
- Development
- Staging/test
- Production

Use demo/test data only outside production.

## Observability

Production should include:
- Error logging
- Authentication events
- Audit trail for financial edits
- Database backup
- Basic health monitoring
