import { requireOwner } from '@/lib/auth';
import { LogoutButton } from '@/components/LogoutButton';

export default async function OwnerPage() {
  const user = await requireOwner();

  return (
    <div className="shell">
      <header className="topbar">
        <div className="container topbar-row">
          <div><strong>Gym Owner Manager</strong><div style={{fontSize:12,opacity:.75}}>Owner/Admin</div></div>
          <LogoutButton />
        </div>
      </header>
      <main className="page">
        <div className="container">
          <h1>Welcome, {user.name}</h1>
          <p className="muted">Phase 1 foundation is active. Financial modules are added in Phase 2.</p>
          <div className="grid">
            <section className="card third"><div className="muted">Role</div><div className="metric">{user.role}</div></section>
            <section className="card third"><div className="muted">Authentication</div><div className="metric">Active</div></section>
            <section className="card third"><div className="muted">Database</div><div className="metric">Connected</div></section>
            <section className="card half">
              <h2>Owner workspace</h2>
              <p className="muted">Next: members, plans, fees, dues, receipts, expenses and reports.</p>
            </section>
            <section className="card half">
              <h2>Security boundary</h2>
              <p className="muted">This page is protected on the server and redirects Member accounts away from owner data.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
