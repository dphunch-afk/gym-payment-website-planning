# Phase 4 Attendance, Workouts and Progress

## Attendance

Owner/Admin records attendance with a member ID and timestamp. Member portal attendance queries always use the authenticated member's profile ID.

## Workouts

Workout plans belong to exactly one member. Creating or reactivating a workout plan deactivates the member's previously active plan, keeping one active plan per member in the application flow. Exercises belong to their workout plan and support day label, sets, reps, duration and notes.

## Progress

Progress entries belong to one member and can be recorded by authorized staff or by the member themself. Member self-service actions always derive the member ID from the authenticated session rather than accepting a member ID from the form.

Measurements are stored as integers:
- Weight: grams
- Body measurements: millimetres

This avoids floating-point drift while allowing decimal kg/cm values in the UI.

## Privacy boundary

Member-facing attendance, workout and progress queries all filter by the signed-in member ID. Owner/Admin screens remain protected by the server-side Owner/Admin layout guard and server actions repeat the role check before writes.
