# Gym Owner Manager

A separate gym management product for owners/admins and gym members. The first production target is a mobile-first Progressive Web App (PWA) that opens directly in a normal browser and can be installed on Android.

## Current implementation

Phase 1 is under development on the `phase-1-foundation` branch.

Implemented in Phase 1:
- Next.js + TypeScript application foundation
- Prisma relational data layer
- Local SQLite development database (production will use managed PostgreSQL)
- Server-side login sessions stored in the database
- HTTP-only session cookie
- Owner/Admin and Member role protection
- Protected Owner dashboard
- Protected Member dashboard that reads only the signed-in member profile
- PWA manifest, service worker, app icon and offline fallback
- Demo seed accounts for testing

## Run locally

1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Run `npm install`.
4. Run `npm run setup` to generate Prisma, create the local database and seed demo users.
5. Run `npm run dev`.
6. Open `http://localhost:3000`.

## Demo accounts

Owner:
- Email: `owner@gym.local`
- Password: `Owner@123`

Member:
- Email: `member@gym.local`
- Password: `Member@123`

These credentials are demo-only and must not be used in production.

## Product direction

### Owner/Admin
- Members and membership plans
- Fee collection, partial payments, dues and overdue tracking
- Receipts and payment history
- Expenses and reports
- Attendance
- Trainers/staff
- Announcements
- Workout plans and member progress
- Backup/export

### Member
Members must only see their own information:
- Membership status, plan and dates
- Outstanding dues
- Payment history and receipts
- Attendance history
- Announcements
- Assigned workout plan
- Weight/body-measurement progress
- Profile and renewal information

## Delivery strategy

1. Finish and verify the browser/PWA version.
2. Move the production database to PostgreSQL and deploy behind HTTPS.
3. Test all owner/member workflows and financial correctness.
4. Make the PWA installable on Android.
5. Later package as APK/AAB if required.

See `docs/` for the product plan, data model, security model, UX flows, test plan and roadmap.
