# Security and Role Model

## Roles

### Owner
Full access to the gym account, financials, members, plans, staff, reports, announcements, workouts, progress, and configuration.

### Admin
Operational access defined by the owner. Initial version can give broad operational access while reserving sensitive settings for Owner.

### Trainer
Future/optional role. Access only to assigned members, workout plans, attendance/progress as permitted. No full financial access unless explicitly granted.

### Member
Access only to their own profile and permitted gym-wide information.

## Member privacy requirements

A logged-in member may view only:
- Their own membership
- Their own current due and renewal data
- Their own payments and receipts
- Their own attendance
- Their own assigned workout plan
- Their own progress entries
- Gym-wide announcements intended for members

A member must never be able to change an ID in a URL/API request and retrieve another member's information.

## Owner/Admin permissions

Initial capabilities:
- Manage members
- Manage membership plans
- Record fees/payments
- View dues
- Record expenses
- Mark attendance
- Post announcements
- Assign workouts
- View progress
- Run reports
- Export data

Sensitive actions should be auditable:
- Payment edits/reversals
- Expense edits/deletions
- Membership price/discount changes
- Role changes
- Account configuration changes

## Authentication

Production requirements:
- Secure authentication provider/session management
- Passwords must never be stored in plaintext
- Rate limiting / brute-force protection where supported
- Secure password reset flow
- Session expiration and logout
- Server-side authorization, not UI-only hiding

## Financial integrity

- Every payment gets a unique receipt/reference
- Do not silently overwrite payment history
- Corrections should create an audit trail or reversal entry
- Use decimal-safe money handling; avoid floating-point rounding errors
- Validate payment amount server-side
- Prevent duplicate submissions
- Keep expense history auditable

## Data protection

- Enforce row-level or equivalent server-side access controls
- Back up data
- Encrypt traffic using HTTPS
- Keep secrets/API keys outside client code
- Do not include production credentials in GitHub
- Exported member data should be handled as private business data

## PWA and Android

The browser/PWA deployment and future Android wrapper should use the same authorization rules and backend. Android packaging must not bypass server-side permissions.
