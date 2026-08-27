# Gym Owner Manager

A mobile-first gym management PWA for owners/admins and gym members. The browser/PWA application is the production source of truth; Android packaging follows after the HTTPS deployment is verified.

## Current implementation

Phases 1–4 are merged into `main`. Phase 5 production readiness is being completed on `phase-5-production-readiness`.

### Owner/Admin
- Secure server-side login and role protection
- Members and membership plans
- Renewals with immutable historical fee snapshots
- Fee collection and partial payments
- Ledger-backed dues and overdue tracking
- Unique printable receipts and payment history
- Expenses and financial dashboard
- Attendance recording/history
- Gym announcements
- Member-specific workout plans and exercises
- Weight/body-measurement progress tracking
- Reports: collections, dues, expenses, income-vs-expense and expiring memberships
- CSV exports and Owner/Admin-only JSON backup

### Member
Members see only their own records:
- Membership status, plan and dates
- Ledger-backed outstanding and overdue amounts
- Payment history and member-scoped receipts
- Attendance history
- Gym announcements
- Assigned workout plan
- Private weight/body-measurement progress
- Profile phone update

### PWA / production readiness
- PWA manifest and service worker
- Dedicated install icons and offline fallback
- Private authenticated pages are not application-cached
- Local SQLite development database
- Separate managed-PostgreSQL production build path
- Vercel deployment configuration
- Android TWA/APK/AAB packaging strategy documented
- CI runs production dependency audit plus Phase 2–5 regression checks

## Run locally

1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Run `npm install`.
4. Run `npm run setup` to generate Prisma, create the local SQLite database and seed demo users.
5. Run `npm run dev`.
6. Open `http://localhost:3000`.

## Demo accounts

Owner:
- Email: `owner@gym.local`
- Password: `Owner@123`

Member:
- Email: `member@gym.local`
- Password: `Member@123`

These credentials are local-demo-only and must never be used in production.

## Production deployment

Production uses a managed PostgreSQL `DATABASE_URL` and the repository's Vercel production build configuration. The production build does not seed the demo users.

See:
- `docs/DEPLOYMENT.md` for production deployment and verification
- `docs/ANDROID_PACKAGING.md` for APK/AAB strategy
- `docs/` for product requirements, security model, UX flows, test plan and roadmap
