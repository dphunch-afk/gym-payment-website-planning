# Product Plan

## Goal

Create a practical gym management product that solves daily fee collection, due tracking, expense management, member communication, and member self-service in one system.

## Primary users

### Owner/Admin
Needs fast visibility into money, members, dues, attendance, staff, and daily operations.

### Member
Needs a simple private view of membership status, fees, receipts, attendance, workouts, progress, and gym notices.

## MVP scope

### Authentication and roles
- Owner/admin login
- Member login
- Role-based navigation
- Members can access only their own records

### Member management
- Add/edit member
- Name, phone, email, photo placeholder, joining date
- Membership plan
- Monthly fee
- Billing/due date
- Start date and expiry date
- Active, expiring, expired, paused status
- Notes

### Membership plans
- Monthly, quarterly, half-yearly, yearly, custom
- Plan price
- Duration
- Optional discount
- Optional trainer/PT add-on

### Payments
- Record cash, UPI, card, bank transfer
- Payment date
- Amount
- Receipt number
- Remaining balance
- Payment history
- Printable/downloadable receipt
- Prevent accidental duplicate payment submission

### Dues
- Automatic outstanding balance
- Upcoming due
- Due today
- Overdue
- Partial payment state
- Total outstanding dues dashboard metric
- Search/filter due members

### Expenses
- Rent
- Electricity
- Trainer salary
- Equipment
- Maintenance
- Marketing
- Supplies
- Other
- Amount, date, category, note

### Dashboard
- Active members
- New members
- Expiring memberships
- Monthly expected income
- Monthly collected income
- Total outstanding dues
- Monthly expenses
- Net cash / simple profit summary
- Recent payments
- Recent expenses

### Attendance
- Owner can mark attendance
- Member can see own attendance history
- Daily/monthly attendance summary
- Future enhancement: QR check-in

### Member portal
- Membership card/status
- Plan
- Join and expiry date
- Next due date
- Outstanding amount
- Payment history
- Receipts
- Attendance
- Announcements
- Workout plan
- Progress tracking
- Renewal reminder

### Workout plans
- Owner/trainer can assign plan
- Day-by-day exercises
- Sets/reps/time/notes
- Member can view assigned plan

### Progress tracking
- Date
- Weight
- Chest
- Waist
- Arms
- Optional additional measurements
- Notes
- Basic progress history

### Announcements
- Owner posts gym notices
- All members can read active notices
- Optional expiry date

### Reports
- Daily/monthly collection
- Outstanding dues
- Expense report
- Income vs expense
- Member payment history
- Membership expiry report

### Backup/export
- CSV export for members
- CSV export for payments
- CSV export for expenses
- CSV export for dues
- Future: complete database backup/restore

## Later enhancements

- WhatsApp reminders
- SMS/push notifications
- UPI payment links
- Online payment gateway
- QR attendance
- Trainer accounts
- Staff permissions
- Class booking
- PT appointment booking
- Diet plans
- Referral rewards
- Challenges/leaderboards
- Multiple branches
- GST invoices
- Cloud backup and restore
- Native Android APK/AAB
