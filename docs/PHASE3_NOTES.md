# Phase 3 Member Portal Notes

## Member data boundary

Member-facing routes start from the authenticated MEMBER account and its `MemberProfile.id`.

- Payment history filters by that member ID.
- Member receipt lookup filters by both receipt/payment ID and the authenticated member ID.
- Attendance history filters by the authenticated member ID.
- Membership balance is calculated from the member's saved charges minus saved payments.
- Members can update their own phone number only; financial and membership fields remain staff-controlled.

## Owner receipt hardening

The existing Owner/Admin receipt route now explicitly calls the Owner/Admin server-side guard before loading any payment record.

## Announcements

Owner/Admin users can publish or hide announcements. Members only receive announcements where `isActive = true`.
