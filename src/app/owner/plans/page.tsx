import { Notice } from '@/components/Notice';
import { db } from '@/lib/db';
import { moneyFromPaise } from '@/lib/finance';
import { createPlan, updatePlan } from '@/app/owner/actions';

export default async function PlansPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;
  const plans = await db.membershipPlan.findMany({ orderBy: [{ isActive: 'desc' }, { feePaise: 'asc' }] });

  return (
    <main className="page">
      <div className="container stack">
        <div><h1>Membership Plans</h1><p className="muted">Plan price changes affect future charges only. Existing membership history keeps its original fee snapshot.</p></div>
        <Notice success={params.success} error={params.error} />

        <section className="card">
          <h2>Create plan</h2>
          <form action={createPlan} className="form-grid">
            <label className="field"><span>Plan name</span><input name="name" required maxLength={80} placeholder="Monthly Standard" /></label>
            <label className="field"><span>Duration (days)</span><input name="durationDays" required type="number" min="1" max="1500" defaultValue="30" /></label>
            <label className="field"><span>Fee (₹)</span><input name="fee" required type="number" min="1" step="0.01" placeholder="1500" /></label>
            <div className="field submit-field"><span>&nbsp;</span><button className="btn" type="submit">Create plan</button></div>
          </form>
        </section>

        <div className="grid">
          {plans.map((plan) => (
            <section className="card half" key={plan.id}>
              <div className="section-heading">
                <div><h2>{plan.name}</h2><p className="muted">{plan.durationDays} days · {moneyFromPaise(plan.feePaise)}</p></div>
                <span className={`badge ${plan.isActive ? 'badge-success' : ''}`}>{plan.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
              </div>
              <form action={updatePlan} className="stack">
                <input type="hidden" name="planId" value={plan.id} />
                <label className="field"><span>Name</span><input name="name" required defaultValue={plan.name} /></label>
                <div className="form-grid two-col">
                  <label className="field"><span>Duration (days)</span><input name="durationDays" type="number" min="1" required defaultValue={plan.durationDays} /></label>
                  <label className="field"><span>Fee (₹)</span><input name="fee" type="number" min="1" step="0.01" required defaultValue={(plan.feePaise / 100).toFixed(2)} /></label>
                </div>
                <label className="field"><span>Status</span><select name="isActive" defaultValue={String(plan.isActive)}><option value="true">Active</option><option value="false">Inactive</option></select></label>
                <button className="btn secondary" type="submit">Save plan</button>
              </form>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
