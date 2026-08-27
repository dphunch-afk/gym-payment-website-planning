import Link from 'next/link';
import { requireMember } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate, getMemberBalance, getMemberOverduePaise, moneyFromPaise } from '@/lib/finance';
import { LogoutButton } from '@/components/LogoutButton';
import { updateOwnProfile } from './actions';

export default async function MemberPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const user = await requireMember();
  const params = await searchParams;
  const memberId = user.member?.id;

  if (!memberId) {
    return <main className="page"><div className="container card"><h1>Member profile not found</h1></div></main>;
  }

  const [member, balance, overduePaise, payments, attendance, announcements, currentMembership] = await Promise.all([
    db.memberProfile.findUnique({ where: { id: memberId }, include: { user: true } }),
    getMemberBalance(memberId),
    getMemberOverduePaise(memberId),
    db.payment.findMany({ where: { memberId }, orderBy: { paidAt: 'desc' }, take: 20 }),
    db.attendance.findMany({ where: { memberId }, orderBy: { attendedAt: 'desc' }, take: 20 }),
    db.announcement.findMany({ where: { isActive: true }, orderBy: { publishedAt: 'desc' }, take: 10 }),
    db.membership.findFirst({
      where: { memberId },
      include: { plan: true },
      orderBy: { endDate: 'desc' }
    })
  ]);

  if (!member) return null;

  const status = member.expiryDate < new Date() ? 'EXPIRED' : member.membershipStatus;

  return (
    <div className="shell">
      <header className="topbar">
        <div className="container topbar-row">
          <div>
            <strong>Gym Owner Manager</strong>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Member · {member.memberCode || 'No code'}</div>
          </div>
          <LogoutButton />
        </div>
        <nav className="owner-nav container" aria-label="Member navigation">
          <a href="#membership">Membership</a>
          <a href="#payments">Payments</a>
          <a href="#attendance">Attendance</a>
          <a href="#announcements">Notices</a>
          <a href="#profile">Profile</a>
        </nav>
      </header>

      <main className="page">
        <div className="container stack">
          <div>
            <h1>Hello, {member.user.name}</h1>
            <p className="muted">Your private gym membership and payment portal.</p>
          </div>

          {params.success ? <div className="success">{params.success}</div> : null}
          {params.error ? <div className="error">{params.error}</div> : null}

          <div className="grid">
            <section className="card third">
              <div className="muted">Membership</div>
              <div className="metric">{status}</div>
            </section>
            <section className="card third">
              <div className="muted">Outstanding</div>
              <div className="metric">{moneyFromPaise(balance.outstandingPaise)}</div>
            </section>
            <section className="card third">
              <div className="muted">Overdue</div>
              <div className="metric">{moneyFromPaise(overduePaise)}</div>
            </section>
          </div>

          <section id="membership" className="card">
            <h2>Membership</h2>
            <div className="grid">
              <div className="half">
                <div className="info-row"><span className="muted">Plan</span><strong>{currentMembership?.plan.name || member.planName}</strong></div>
                <div className="info-row"><span className="muted">Joined</span><strong>{formatDate(member.joinDate)}</strong></div>
                <div className="info-row"><span className="muted">Expires</span><strong>{formatDate(member.expiryDate)}</strong></div>
                <div className="info-row"><span className="muted">Next due</span><strong>{formatDate(member.nextDueDate)}</strong></div>
              </div>
              <div className="half">
                <div className="info-row"><span className="muted">Total charged</span><strong>{moneyFromPaise(balance.chargedPaise)}</strong></div>
                <div className="info-row"><span className="muted">Total paid</span><strong>{moneyFromPaise(balance.paidPaise)}</strong></div>
                <div className="info-row"><span className="muted">Current balance</span><strong>{moneyFromPaise(balance.outstandingPaise)}</strong></div>
                <p className="muted" style={{ marginTop: 12 }}>Balances are calculated from saved membership charges and payments, so owner-side updates appear here automatically.</p>
              </div>
            </div>
          </section>

          <section id="payments" className="card">
            <div className="section-head"><div><h2>Payment history</h2><p className="muted">Your latest saved payments and receipts.</p></div></div>
            {payments.length ? (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Receipt</th><th>Method</th><th>Amount</th><th></th></tr></thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{formatDate(payment.paidAt)}</td>
                        <td>{payment.receiptNumber}</td>
                        <td>{payment.method}</td>
                        <td>{moneyFromPaise(payment.amountPaise)}</td>
                        <td><Link className="text-link" href={`/member/receipts/${payment.id}`}>View receipt</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="muted">No payments recorded yet.</p>}
          </section>

          <section id="attendance" className="card">
            <h2>Attendance history</h2>
            {attendance.length ? (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Note</th></tr></thead>
                  <tbody>{attendance.map((entry) => <tr key={entry.id}><td>{formatDate(entry.attendedAt)}</td><td>{entry.note || 'Gym visit'}</td></tr>)}</tbody>
                </table>
              </div>
            ) : <p className="muted">No attendance records yet.</p>}
          </section>

          <section id="announcements" className="card">
            <h2>Gym announcements</h2>
            <div className="stack">
              {announcements.length ? announcements.map((notice) => (
                <article key={notice.id} className="notice-card">
                  <div className="muted" style={{ fontSize: 12 }}>{formatDate(notice.publishedAt)}</div>
                  <h3>{notice.title}</h3>
                  <p>{notice.body}</p>
                </article>
              )) : <p className="muted">No active announcements.</p>}
            </div>
          </section>

          <section id="profile" className="card">
            <h2>Profile</h2>
            <div className="grid">
              <div className="half">
                <div className="info-row"><span className="muted">Name</span><strong>{member.user.name}</strong></div>
                <div className="info-row"><span className="muted">Email</span><strong>{member.user.email}</strong></div>
                <div className="info-row"><span className="muted">Member code</span><strong>{member.memberCode || '—'}</strong></div>
              </div>
              <form action={updateOwnProfile} className="stack half">
                <label className="field">
                  <span>Phone</span>
                  <input name="phone" defaultValue={member.phone || ''} required />
                </label>
                <button className="btn" type="submit">Update phone</button>
                <p className="muted" style={{ fontSize: 12 }}>Membership and financial fields can only be changed by authorized gym staff.</p>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
