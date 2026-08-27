import { db } from '@/lib/db';
import { formatDate } from '@/lib/finance';
import { addWorkoutExercise, createWorkoutPlan, toggleWorkoutPlan } from './actions';

function dateOnlyValue(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export default async function WorkoutsPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [members, plans] = await Promise.all([
    db.memberProfile.findMany({ include: { user: true }, orderBy: { user: { name: 'asc' } } }),
    db.workoutPlan.findMany({
      include: { member: { include: { user: true } }, createdBy: true, exercises: { orderBy: [{ dayLabel: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }] } },
      orderBy: [{ isActive: 'desc' }, { startsOn: 'desc' }]
    })
  ]);

  return (
    <main className="page">
      <div className="container stack">
        <div><h1>Workout plans</h1><p className="muted">Assign member-specific plans and day-wise exercises.</p></div>
        {params.success ? <div className="success">{params.success}</div> : null}
        {params.error ? <div className="error">{params.error}</div> : null}

        <section className="card">
          <h2>Assign new plan</h2>
          <form action={createWorkoutPlan} className="form-grid">
            <label className="field"><span>Member</span><select name="memberId" required><option value="">Choose member</option>{members.map((member) => <option key={member.id} value={member.id}>{member.user.name} · {member.memberCode || 'No code'}</option>)}</select></label>
            <label className="field"><span>Plan title</span><input name="title" required placeholder="e.g. Fat Loss 4-Day Plan" maxLength={120} /></label>
            <label className="field"><span>Starts on</span><input type="date" name="startsOn" defaultValue={dateOnlyValue()} required /></label>
            <label className="field full-field"><span>Plan notes</span><textarea name="notes" rows={3} maxLength={800} placeholder="Goals, precautions, trainer notes" /></label>
            <button className="btn" type="submit">Assign plan</button>
          </form>
        </section>

        <section className="card">
          <h2>Assigned plans</h2>
          <div className="stack">
            {plans.length ? plans.map((plan) => (
              <article key={plan.id} className="notice-card">
                <div className="section-head">
                  <div>
                    <div className="muted" style={{ fontSize: 12 }}>{plan.member.user.name} · {plan.member.memberCode || 'No code'} · starts {formatDate(plan.startsOn)}</div>
                    <h3>{plan.title}</h3>
                    {plan.notes ? <p className="muted">{plan.notes}</p> : null}
                  </div>
                  <div className="stack" style={{ justifyItems: 'end' }}>
                    <span className={`badge ${plan.isActive ? 'badge-success' : ''}`}>{plan.isActive ? 'Active' : 'Inactive'}</span>
                    <form action={toggleWorkoutPlan}><input type="hidden" name="id" value={plan.id} /><button className="btn secondary" type="submit">{plan.isActive ? 'Deactivate' : 'Make active'}</button></form>
                  </div>
                </div>

                {plan.exercises.length ? (
                  <div className="table-wrap" style={{ marginTop: 14 }}><table><thead><tr><th>Day</th><th>Exercise</th><th>Sets</th><th>Reps</th><th>Duration</th><th>Notes</th></tr></thead><tbody>{plan.exercises.map((exercise) => <tr key={exercise.id}><td>{exercise.dayLabel}</td><td>{exercise.exerciseName}</td><td>{exercise.sets || '—'}</td><td>{exercise.reps || '—'}</td><td>{exercise.durationMinutes ? `${exercise.durationMinutes} min` : '—'}</td><td>{exercise.notes || '—'}</td></tr>)}</tbody></table></div>
                ) : <p className="muted">No exercises added yet.</p>}

                <details>
                  <summary>Add exercise</summary>
                  <form action={addWorkoutExercise} className="form-grid" style={{ marginTop: 12 }}>
                    <input type="hidden" name="workoutPlanId" value={plan.id} />
                    <label className="field"><span>Day</span><input name="dayLabel" required placeholder="Day 1 / Monday" /></label>
                    <label className="field"><span>Exercise</span><input name="exerciseName" required placeholder="Bench press" /></label>
                    <label className="field"><span>Sets</span><input name="sets" type="number" min="1" /></label>
                    <label className="field"><span>Reps</span><input name="reps" placeholder="10-12" /></label>
                    <label className="field"><span>Duration (minutes)</span><input name="durationMinutes" type="number" min="1" /></label>
                    <label className="field"><span>Order</span><input name="sortOrder" type="number" min="0" defaultValue="1" /></label>
                    <label className="field full-field"><span>Notes</span><input name="notes" maxLength={240} /></label>
                    <button className="btn" type="submit">Add exercise</button>
                  </form>
                </details>
              </article>
            )) : <p className="muted">No workout plans assigned yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
