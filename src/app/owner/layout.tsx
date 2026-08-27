import Link from 'next/link';
import { requireOwner } from '@/lib/auth';
import { LogoutButton } from '@/components/LogoutButton';

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireOwner();

  return (
    <div className="shell">
      <header className="topbar">
        <div className="container topbar-row">
          <div>
            <strong>Gym Owner Manager</strong>
            <div style={{ fontSize: 12, opacity: 0.75 }}>{user.name} · {user.role}</div>
          </div>
          <LogoutButton />
        </div>
        <nav className="owner-nav container" aria-label="Owner navigation">
          <Link href="/owner">Dashboard</Link>
          <Link href="/owner/members">Members</Link>
          <Link href="/owner/plans">Plans</Link>
          <Link href="/owner/payments">Payments</Link>
          <Link href="/owner/expenses">Expenses</Link>
          <Link href="/owner/attendance">Attendance</Link>
          <Link href="/owner/workouts">Workouts</Link>
          <Link href="/owner/progress">Progress</Link>
          <Link href="/owner/announcements">Announcements</Link>
          <Link href="/owner/reports">Reports</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
