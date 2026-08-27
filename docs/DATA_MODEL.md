# Initial Data Model

This is a planning-level schema. Exact field types can be adjusted during implementation.

## users
- id
- role: owner | admin | trainer | member
- name
- phone
- email
- password/auth provider reference
- status
- created_at
- updated_at

## members
- id
- user_id
- member_code
- joining_date
- current_plan_id
- membership_start_date
- membership_end_date
- billing_due_day
- standard_fee
- status: active | expiring | expired | paused
- notes
- created_at
- updated_at

## membership_plans
- id
- name
- duration_days or duration_months
- price
- discount
- description
- active

## payments
- id
- member_id
- membership_period/reference
- amount
- payment_date
- payment_method: cash | upi | card | bank_transfer | other
- receipt_number
- note
- recorded_by_user_id
- created_at

## member_charges
Use this if the system needs a proper ledger rather than calculating dues only from plan price.
- id
- member_id
- charge_type
- amount
- due_date
- description
- created_at

## expenses
- id
- category
- title
- amount
- expense_date
- note
- recorded_by_user_id
- created_at

## attendance
- id
- member_id
- attendance_date
- check_in_time
- check_out_time
- recorded_by_user_id
- source: manual | qr | system

## announcements
- id
- title
- message
- publish_date
- expiry_date
- active
- created_by_user_id

## workout_plans
- id
- member_id
- title
- assigned_by_user_id
- start_date
- end_date
- notes
- active

## workout_items
- id
- workout_plan_id
- day_label
- exercise_name
- sets
- reps
- duration
- notes
- sort_order

## progress_entries
- id
- member_id
- entry_date
- weight
- chest
- waist
- arms
- other_measurements_json
- notes

## staff
- id
- user_id
- role_title
- joining_date
- salary
- active

## audit_log
Recommended for production.
- id
- actor_user_id
- action
- entity_type
- entity_id
- before_json
- after_json
- created_at

## Due calculation

Recommended approach:

**Outstanding balance = total charges due - total payments applied**

For the first simple version, a plan-cycle balance can be calculated from membership fees and payments. For a production system, a ledger using `member_charges` plus `payments` is safer because it supports partial payments, discounts, add-on charges, corrections, and historical accuracy.

## Important data rules
- Never delete financial history silently.
- Payment corrections should be audited.
- Receipt numbers should be unique.
- Members must not be able to query another member's records.
- Dates should be stored consistently and membership periods must not shift because of timezone conversion.
