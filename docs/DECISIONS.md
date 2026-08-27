# Key Project Decisions

## 1. Separate project
This gym management product is independent from all other software projects and should remain in this repository.

## 2. Two-sided product
The system serves both:
- Gym Owner/Admin
- Gym Member

## 3. PWA first
The first production delivery should be a mobile-first browser/PWA app.

Reason:
- Normal browser link works directly
- Easy testing on PC and Android
- Installable on Android home screen
- Avoids exposing an Expo development launcher as the user experience

## 4. Android later, shared backend
A native APK/AAB can be packaged later, but it should use the same backend data and permissions.

## 5. Persistent backend required
Core business data must persist across refresh, logout, devices, and deployments.

## 6. Financial history must be auditable
Payments and expenses must not be silently overwritten. Corrections should preserve history.

## 7. Member isolation is mandatory
Members see only their own private records. Authorization must be enforced by the backend/database layer.

## 8. MVP focus
First release should prioritize:
- Members
- Membership plans
- Fee collection
- Dues
- Expenses
- Dashboard
- Receipts
- Member login/portal
- Attendance

Workout/progress and advanced engagement features follow after the financial/member core is stable.
