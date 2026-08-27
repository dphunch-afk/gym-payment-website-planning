# UX Flows

## App entry

1. Open normal browser URL or installed PWA.
2. Show login.
3. After authentication, route by role.

## Owner/Admin navigation

Recommended primary navigation:
- Dashboard
- Members
- Collect Fee
- Dues
- Expenses
- Attendance
- Reports
- More / Settings

### Dashboard flow
Show immediately:
- Active members
- This month collected
- Total outstanding dues
- This month expenses
- Net cash
- Expiring memberships
- Recent payments
- Recent expenses

### Add member flow
1. Tap Add Member.
2. Enter name, mobile, optional email.
3. Select membership plan.
4. Set start date / due date.
5. Apply optional discount.
6. Save.
7. Optionally record first payment.
8. Generate member code and receipt if payment was collected.

### Collect fee flow
1. Search/select member.
2. Show current plan, due, and outstanding balance.
3. Enter amount received.
4. Select payment method.
5. Confirm.
6. Save payment.
7. Update outstanding balance.
8. Generate receipt.

### Dues flow
- Filter: upcoming, due today, overdue, partial
- Search by member name/mobile
- Tap member to view ledger/payment history
- Quick action to collect payment
- Future quick action for WhatsApp reminder

### Expense flow
1. Add expense.
2. Select category.
3. Enter amount/date/note.
4. Save.
5. Dashboard/reports update.

### Attendance flow
- Today's member list/search
- Mark present/check-in
- View daily/monthly attendance
- Future QR check-in

### Workout assignment flow
1. Open member.
2. Select Workout Plan.
3. Create or reuse a plan.
4. Assign exercises by day.
5. Save/publish.
6. Member sees it immediately.

## Member navigation

Recommended primary navigation:
- Home
- Payments
- Attendance
- Workout
- Progress
- Profile

### Member home
Show:
- Membership status
- Current plan
- Expiry date
- Next fee due date
- Outstanding amount
- Renewal reminder
- Latest announcement
- Quick links to receipt/workout/attendance

### Payments
- Payment date
- Amount
- Method
- Receipt number
- Receipt view/download
- Current outstanding balance

### Attendance
- Recent visits
- Monthly attendance count
- Calendar/history view later

### Workout
- Current assigned plan
- Day-wise exercises
- Sets/reps/time/notes

### Progress
- Add or view permitted progress entries
- Weight/body measurements over time
- Simple trend history

### Profile
- Name
- Phone/email
- Member code
- Membership details
- Renewal information

## Design principles

- Mobile-first
- Large tap targets
- Fast search for owners
- Avoid deep navigation for daily tasks
- Financial status should use clear text labels, not color alone
- Confirm destructive/financial changes
- Keep member view simple and private
- Browser link must open the app directly; no Expo launcher dependency
