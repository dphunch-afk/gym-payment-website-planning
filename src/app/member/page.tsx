import Link from 'next/link';
import { requireMember } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate, getMemberBalance, getMemberOverduePaise, moneyFromPaise } from '@/lib/finance';
import { formatCm, formatWeight } from '@/lib/progress';
import { LogoutButton } from '@/components/LogoutButton';
import { recordOwnProgress, updateOwnProfile } from './actions';

function dateOnlyValue(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

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

  const [member, balance, overduePaise, payments, attendance, announcements, currentMembership, activeWorkout, progress] = await Promise.all([
    db.memberProfile.findUnique({ where: { id: memberId }, include: { user: true } }),
    getMemberBalance(memberId),
    getMemberOverduePaise(memberId),
    db.payment.findMany({ where: { memberId }, orderBy: { paidAt: 'desc' }, take: 20 }),
    db.attendance.findMany({ where: { memberId }, orderBy: { attendedAt: 'desc' }, take: 20 }),
    db.announcement.findMany({ where: { isActive: true }, orderBy: { publishedAt: 'desc' }, take: 10 }),
    db.membership.findFirst({ where: { memberId }, include: { plan: true }, orderBy: { endDate: 'desc' } }),
    db.workoutPlan.findFirst({
      where: { memberId, isActive: true },
      include: { exercises: { orderBy: [{ dayLabel: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }] }, createdBy: true },
      orderBy: { startsOn: 'desc' }
    }),
    db.progressEntry.findMany({ where: { memberId }, include: { recordedBy: true }, orderBy: { recordedAt: 'desc' }, take: 30 })
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
          <a href="#workout">Workout</a>
          <a href="#progress">Progress</a>
          <a href="#announcements">Notices</a>
          <a href="#profile">Profile</a>
        </nav>
      </header>

      <main className="page">
        <div className="container stack">
          <div>
            <h1>Hello, {member.user.name}</h1>
            <p className="muted">Your private gym membership, workout and progress portal.</p>
          </div>

          {params.success ? <div className="success">{params.success}</div> : null}
          {params.error ? <div className="error">{params.error}</div> : null}

          <div className="grid">
            <section className="card third"><div className="muted">Membership</div><div className="metric">{status}</div></section>
            <section className="card third"><div className="muted">Outstanding</div><div className="metric">{moneyFromPaise(balance.outstandingPaise)}</div></section>
            <section className="card third"><div className="muted">Visits recorded</div><div className="metric">{attendance.length}</div></section>
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
                <div className="info-row"><span className="muted">Overdue</span><strong>{moneyFromPaise(overduePaise)}</strong></div>
              </div>
            </div>
          </section>

          <section id="payments" className="card">
            <div className="section-head"><div><h2>Payment history</h2><p className="muted">Your latest saved payments and receipts.</p></div></div>
            {payments.length ? <div className="table-wrap"><table><thead><tr><th>Date</th><th>Receipt</th><th>Method</th><th>Amount</th><th></th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id}><td>{formatDate(payment.paidAt)}</td><td>{payment.receiptNumber}</td><td>{payment.method}</td><td>{moneyFromPaise(payment.amountPaise)}</td><td><Link className="text-link" href={`/member/receipts/${payment.id}`}>View receipt</Link></td></tr>)}</tbody></table></div> : <p className="muted">No payments recorded yet.</p>}
          </section>

          <section id="attendance" className="card">
            <h2>Attendance history</h2>
            {attendance.length ? <div className="table-wrap"><table><thead><tr><th>Date</th><th>Note</th></tr></thead><tbody>{attendance.map((entry) => <tr key={entry.id}><td>{formatDate(entry.attendedAt)}</td><td>{entry.note || 'Gym visit'}</td></tr>)}</tbody></table></div> : <p className="muted">No attendance records yet.</p>}
          </section>

          <section id="workout" className="card">
            <div className="section-head">
              <div><h2>My workout</h2><p className="muted">Your active trainer-assigned workout plan.</p></div>
              {activeWorkout ? <span className="badge badge-success">Active</span> : null}
            </div>
            {activeWorkout ? (
              <div className="stack">
                <div><h3>{activeWorkout.title}</h3><p className="muted">Starts {formatDate(activeWorkout.startsOn)} · assigned by {activeWorkout.createdBy.name}</p>{activeWorkout.notes ? <p>{activeWorkout.notes}</p> : null}</div>
                {activeWorkout.exercises.length ? <div className="table-wrap"><table><thead><tr><th>Day</th><th>Exercise</th><th>Sets</th><th>Reps</th><th>Duration</th><th>Notes</th></tr></thead><tbody>{activeWorkout.exercises.map((exercise) => <tr key={exercise.id}><td>{exercise.dayLabel}</td><td>{exercise.exerciseName}</td><td>{exercise.sets || '—'}</td><td>{exercise.reps || '—'}</td><td>{exercise.durationMinutes ? `${exercise.durationMinutes} min` : '—'}</td><td>{exercise.notes || '—'}</td></tr>)}</tbody></table></div> : <p className="muted">Your trainer has not added exercises yet.</p>}
              </div>
            ) : <p className="muted">No active workout plan assigned.</p>}
          </section>

          <section id="progress" className="card">
            <div className="section-head"><div><h2>My progress</h2><p className="muted">Private measurements visible only to you and authorized gym staff.</p></div></div>
            <form action={recordOwnProgress} className="form-grid" style={{ marginBottom: 18 }}>
              <label className="field"><span>Date</span><input type="date" name="recordedAt" defaultValue={dateOnlyValue()} required /></label>
              <label className="field"><span>Weight (kg)</span><input type="number" name="weightKg" min="1" max="500" step="0.1" /></label>
              <label className="field"><span>Chest (cm)</span><input type="number" name="chestCm" min="1" max="400" step="0.1" /></label>
              <label className="field"><span>Waist (cm)</span><input type="number" name="waistCm" min="1" max="400" step="0.1" /></label>
              <label className="field"><span>Hip (cm)</span><input type="number" name="hipCm" min="1" max="400" step="0.1" /></label>
              <label className="field"><span>Arm (cm)</span><input type="number" name="armCm" min="1" max="400" step="0.1" /></label>
              <label className="field"><span>Thigh (cm)</span><input type="number" name="thighCm" min="1" max="400" step="0.1" /></label>
              <label className="field full-field"><span>Note</span><input name="note" maxLength={240} placeholder="Optional note" /></label>
              <button className="btn" type="submit">Add progress entry</button>
            </form>

            {progress.length ? <div className="table-wrap"><table><thead><tr><th>Date</th><th>Weight</th><th>Chest</th><th>Waist</th><th>Hip</th><th>Arm</th><th>Thigh</th><th>Recorded by</th><th>Note</th></tr></thead><tbody>{progress.map((entry) => <tr key={entry.id}><td>{formatDate(entry.recordedAt)}</td><td>{formatWeight(entry.weightGrams)}</td><td>{formatCm(entry.chestMm)}</td><td>{formatCm(entry.waistMm)}</td><td>{formatCm(entry.hipMm)}</td><td>{formatCm(entry.armMm)}</td><td>{formatCm(entry.thighMm)}</td><td>{entry.recordedBy.id === user.id ? 'You' : entry.recordedBy.name}</td><td>{entry.note || '—'}</td></tr>)}</tbody></table></div> : <p className="muted">No progress entries yet.</p>}
          </section>

          <section id="announcements" className="card">
            <h2>Gym announcements</h2>
            <div className="stack">{announcements.length ? announcements.map((notice) => <article key={notice.id} className="notice-card"><div className="muted" style={{ fontSize: 12 }}>{formatDate(notice.publishedAt)}</div><h3>{notice.title}</h3><p>{notice.body}</p></article>) : <p className="muted">No active announcements.</p>}</div>
          </section>

          <section id="profile" className="card">
            <h2>Profile</h2>
            <div className="grid">
              <div className="half"><div className="info-row"><span className="muted">Name</span><strong>{member.user.name}</strong></div><div className="info-row"><span className="muted">Email</span><strong>{member.user.email}</strong></div><div className="info-row"><span className="muted">Member code</span><strong>{member.memberCode || '—'}</strong></div></div>
              <form action={updateOwnProfile} className="stack half"><label className="field"><span>Phone</span><input name="phone" defaultValue={member.phone || ''} required /></label><button className="btn" type="submit">Update phone</button><p className="muted" style={{ fontSize: 12 }}>Membership and financial fields can only be changed by authorized gym staff.</p></form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
