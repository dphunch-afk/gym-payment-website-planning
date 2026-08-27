import { db } from '@/lib/db';
import { formatDate } from '@/lib/finance';
import { recordAttendance } from './actions';

function dateTimeLocalValue(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export default async function AttendancePage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [members, attendance] = await Promise.all([
    db.memberProfile.findMany({ include: { user: true }, orderBy: { user: { name: 'asc' } } }),
    db.attendance.findMany({ include: { member: { include: { user: true } }, recordedBy: true }, orderBy: { attendedAt: 'desc' }, take: 100 })
  ]);

  return (
    <main className="page">
      <div className="container stack">
        <div><h1>Attendance</h1><p className="muted">Record gym visits and review member attendance history.</p></div>
        {params.success ? <div className="success">{params.success}</div> : null}
        {params.error ? <div className="error">{params.error}</div> : null}

        <section className="card">
          <h2>Record attendance</h2>
          <form action={recordAttendance} className="form-grid">
            <label className="field"><span>Member</span><select name="memberId" required><option value="">Choose member</option>{members.map((member) => <option key={member.id} value={member.id}>{member.user.name} · {member.memberCode || 'No code'}</option>)}</select></label>
            <label className="field"><span>Date & time</span><input type="datetime-local" name="attendedAt" defaultValue={dateTimeLocalValue()} required /></label>
            <label className="field full-field"><span>Note</span><input name="note" placeholder="Optional note" maxLength={180} /></label>
            <button className="btn" type="submit">Save attendance</button>
          </form>
        </section>

        <section className="card">
          <h2>Recent attendance</h2>
          {attendance.length ? <div className="table-wrap"><table><thead><tr><th>Date</th><th>Member</th><th>Code</th><th>Note</th><th>Recorded by</th></tr></thead><tbody>{attendance.map((entry) => <tr key={entry.id}><td>{formatDate(entry.attendedAt)}</td><td>{entry.member.user.name}</td><td>{entry.member.memberCode || '—'}</td><td>{entry.note || 'Gym visit'}</td><td>{entry.recordedBy.name}</td></tr>)}</tbody></table></div> : <p className="muted">No attendance recorded.</p>}
        </section>
      </div>
    </main>
  );
}
