import { requireMember } from '@/lib/auth';
import { LogoutButton } from '@/components/LogoutButton';

function formatDate(date?: Date | null) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function moneyFromPaise(value?: number | null) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format((value || 0) / 100);
}

export default async function MemberPage() {
  const user = await requireMember();
  const member = user.member;

  return (
    <div className="shell">
      <header className="topbar">
        <div className="container topbar-row">
          <div><strong>Gym Owner Manager</strong><div style={{fontSize:12,opacity:.75}}>Member</div></div>
          <LogoutButton />
        </div>
      </header>
      <main className="page">
        <div className="container">
          <h1>Hello, {user.name}</h1>
          <p className="muted">Your private membership dashboard.</p>
          <div className="grid">
            <section className="card third"><div className="muted">Membership</div><div className="metric">{member?.membershipStatus || 'Pending'}</div></section>
            <section className="card third"><div className="muted">Plan</div><div className="metric" style={{fontSize:22}}>{member?.planName || '—'}</div></section>
            <section className="card third"><div className="muted">Outstanding</div><div className="metric">{moneyFromPaise(member?.outstandingPaise)}</div></section>
            <section className="card half">
              <h2>Membership details</h2>
              <div className="info-row"><span className="muted">Joined</span><strong>{formatDate(member?.joinDate)}</strong></div>
              <div className="info-row"><span className="muted">Expires</span><strong>{formatDate(member?.expiryDate)}</strong></div>
              <div className="info-row"><span className="muted">Next due</span><strong>{formatDate(member?.nextDueDate)}</strong></div>
            </section>
            <section className="card half">
              <h2>Private access</h2>
              <p className="muted">The server resolves this dashboard from your signed-in user ID. Other members' profiles are not queried or exposed here.</p>
              <span className="badge">Member-only data</span>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
