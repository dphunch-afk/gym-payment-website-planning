# Development Roadmap

## Phase 1 — Foundation
- Project setup
- Database schema and migrations
- Authentication
- Owner/Admin and Member roles
- Mobile-first app shell/navigation
- Seed/demo data for development

## Phase 2 — Gym operations MVP
- Member CRUD
- Membership plans
- Fee collection
- Payment history
- Automatic dues
- Receipt generation
- Expense management
- Owner dashboard

**Exit criteria:** owner can register a member, collect a partial/full fee, see the due update correctly, record expenses, and view accurate dashboard totals after refresh/login.

## Phase 3 — Member portal
- Member home dashboard
- Membership status/expiry/next due
- Outstanding amount
- Payment history
- Receipt access
- Profile
- Announcements

**Exit criteria:** a member can log in and see only their own records.

## Phase 4 — Attendance and fitness features
- Attendance entry/history
- Workout-plan assignment
- Member workout view
- Weight/body measurement progress tracking
- Owner progress view

## Phase 5 — Reports and operations
- Daily/monthly collection reports
- Due report
- Expense report
- Income vs expense summary
- Expiry report
- CSV export
- Staff/trainer management

## Phase 6 — PWA production readiness
- PWA manifest
- Installability testing on Android
- Responsive testing
- Offline app-shell behavior
- Error/empty/loading states
- Security review
- Financial calculation tests
- Backup/export tests
- Production deployment

## Phase 7 — Enhancements
- WhatsApp fee reminders
- UPI/payment gateway
- QR attendance
- Push notifications
- Trainer accounts/permissions
- Class/PT booking
- Diet plans
- Multiple branches
- GST invoicing

## Phase 8 — Native Android distribution (optional)
- Choose wrapper/native strategy
- Generate APK/AAB
- Test login, payments, receipts, attendance, and notifications
- Play Store preparation if desired

## MVP acceptance tests

1. Owner adds a new member.
2. Membership fee creates the correct expected amount.
3. Partial payment reduces due but does not mark fully paid.
4. Full payment clears the correct balance.
5. Payment persists after reload/logout/login.
6. Expense persists and changes the financial summary.
7. Receipt shows the correct member, payment, date, and amount.
8. Member login cannot access another member's records.
9. Owner can see all authorized member data.
10. Membership expiry and due status are calculated consistently.
11. Browser URL opens the actual app directly.
12. PWA installs and opens from Android home screen.
