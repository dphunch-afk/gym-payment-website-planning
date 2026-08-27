# Gym Payment Website Planning

A separate project for a gym management system designed for both gym owners/admins and gym members.

## Product direction

The system should be mobile-first, browser-friendly, and installable as a PWA on Android. The public web app must open directly in a normal browser and must not depend on an Expo launcher page.

## Owner/Admin side

- Secure owner/admin login
- Dashboard with active members, monthly collections, outstanding dues, expenses, and net cash
- Member registration and profile management
- Membership plans and renewals
- Fee collection and payment history
- Automatic due calculation and overdue tracking
- Downloadable/printable receipts
- Expense tracking by category
- Income, expense, due, and profit/loss reports
- Attendance management
- Trainer/staff management
- Gym announcements
- Workout-plan assignment
- Member progress tracking
- Search and filtering
- Backup/export

## Member side

Members must only be able to see their own information.

- Secure member login
- Membership status and plan
- Joining date, expiry date, next due date, and outstanding amount
- Payment history and receipts
- Attendance history
- Gym announcements
- Assigned workout plan
- Weight and body-measurement progress tracking
- Profile
- Renewal information and fee reminders

## Core principle

One product, two roles:

1. **Owner/Admin** — manages gym operations and all permitted business data.
2. **Member** — sees only their own membership, payment, attendance, workout, and progress information.

## Delivery strategy

1. Build the browser/PWA version first.
2. Test all owner/member workflows with persistent data.
3. Make the PWA installable on Android.
4. Later package or wrap it as a native Android APK/AAB if required.

See the `docs/` directory for the detailed product plan, data model, security model, UX flows, and roadmap.
