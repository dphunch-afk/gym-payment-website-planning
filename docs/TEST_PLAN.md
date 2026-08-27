# MVP Test Plan

## Authentication
- Owner login succeeds with valid credentials.
- Member login succeeds with valid credentials.
- Invalid login is rejected.
- Logout invalidates the active session.

## Role isolation
- Member cannot open owner/admin screens.
- Member cannot query another member's data by changing IDs or URLs.
- Owner can access authorized member records.

## Members
- Add member.
- Edit member.
- Search by name/mobile.
- Membership dates and plan persist after reload.

## Payments and dues
- Full payment clears the correct balance.
- Partial payment leaves the correct balance.
- Duplicate submit is prevented.
- Receipt number is unique.
- Payment remains after reload/login.
- Editing plan price later does not corrupt historical paid amounts.

## Expenses
- Add expense.
- Expense persists.
- Correct dashboard/report totals update.

## Dashboard
- Active member count is correct.
- Monthly collected amount is correct.
- Outstanding dues total is correct.
- Expense total is correct.
- Net summary is correct.

## Member portal
- Member sees own membership status.
- Member sees own due/expiry.
- Member sees own payment history and receipts.
- Member sees own attendance/workout/progress.

## Attendance
- Owner marks attendance.
- Member sees that attendance entry.
- Duplicate daily attendance is handled correctly according to product rules.

## PWA
- Public URL opens the actual app directly.
- App is responsive on Android and desktop Chrome.
- Install prompt/install flow works where supported.
- Installed app launches without an Expo development screen.

## Regression
Every release affecting payments, dues, authentication, or roles must rerun the relevant tests above.
