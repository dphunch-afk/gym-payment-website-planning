import { db } from '@/lib/db';
import { formatDate } from '@/lib/finance';
import { formatCm, formatWeight } from '@/lib/progress';
import { recordMemberProgress } from './actions';

function dateOnlyValue(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export default async function ProgressPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string; memberId?: string }>;
}) {
  const params = await searchParams;
  const members = await db.memberProfile.findMany({ include: { user: true }, orderBy: { user: { name: 'asc' } } });
  const selectedMemberId = params.memberId || members[0]?.id || '';
  const progress = selectedMemberId ? await db.progressEntry.findMany({
    where: { memberId: selectedMemberId },
    include: { member: { include: { user: true } }, recordedBy: true },
    orderBy: { recordedAt: 'desc' },
    take: 50
  }) : [];

  return (
    <main className="page">
      <div className="container stack">
        <div><h1>Member progress</h1><p className="muted">Track weight and body measurements privately for each member.</p></div>
        {params.success ? <div className="success">{params.success}</div> : null}
        {params.error ? <div className="error">{params.error}</div> : null}

        <section className="card">
          <h2>Record measurement</h2>
          <form action={recordMemberProgress} className="form-grid">
            <label className="field"><span>Member</span><select name="memberId" defaultValue={selectedMemberId} required><option value="">Choose member</option>{members.map((member) => <option key={member.id} value={member.id}>{member.user.name} · {member.memberCode || 'No code'}</option>)}</select></label>
            <label className="field"><span>Date</span><input type="date" name="recordedAt" defaultValue={dateOnlyValue()} required /></label>
            <label className="field"><span>Weight (kg)</span><input type="number" name="weightKg" min="1" max="500" step="0.1" /></label>
            <label className="field"><span>Chest (cm)</span><input type="number" name="chestCm" min="1" max="400" step="0.1" /></label>
            <label className="field"><span>Waist (cm)</span><input type="number" name="waistCm" min="1" max="400" step="0.1" /></label>
            <label className="field"><span>Hip (cm)</span><input type="number" name="hipCm" min="1" max="400" step="0.1" /></label>
            <label className="field"><span>Arm (cm)</span><input type="number" name="armCm" min="1" max="400" step="0.1" /></label>
            <label className="field"><span>Thigh (cm)</span><input type="number" name="thighCm" min="1" max="400" step="0.1" /></label>
            <label className="field full-field"><span>Note</span><input name="note" maxLength={240} placeholder="Optional progress note" /></label>
            <button className="btn" type="submit">Save progress</button>
          </form>
        </section>

        <section className="card">
          <div className="section-head">
            <div><h2>Progress history</h2><p className="muted">Select a member to review their private measurement history.</p></div>
            <form method="get" className="search-row"><select name="memberId" defaultValue={selectedMemberId}>{members.map((member) => <option key={member.id} value={member.id}>{member.user.name}</option>)}</select><button className="btn secondary" type="submit">View</button></form>
          </div>
          {progress.length ? <div className="table-wrap"><table><thead><tr><th>Date</th><th>Weight</th><th>Chest</th><th>Waist</th><th>Hip</th><th>Arm</th><th>Thigh</th><th>Recorded by</th><th>Note</th></tr></thead><tbody>{progress.map((entry) => <tr key={entry.id}><td>{formatDate(entry.recordedAt)}</td><td>{formatWeight(entry.weightGrams)}</td><td>{formatCm(entry.chestMm)}</td><td>{formatCm(entry.waistMm)}</td><td>{formatCm(entry.hipMm)}</td><td>{formatCm(entry.armMm)}</td><td>{formatCm(entry.thighMm)}</td><td>{entry.recordedBy.name}</td><td>{entry.note || '—'}</td></tr>)}</tbody></table></div> : <p className="muted">No progress entries for this member yet.</p>}
        </section>
      </div>
    </main>
  );
}
