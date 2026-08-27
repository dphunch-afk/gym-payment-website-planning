import Link from 'next/link';
import { Notice } from '@/components/Notice';
import { db } from '@/lib/db';
import { formatDate, moneyFromPaise } from '@/lib/finance';
import { createMember, renewMembership, updateMember } from '@/app/owner/actions';

export default async function MembersPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; success?: string; error?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q || '').trim().toLowerCase();

  const [allMembers, plans] = await Promise.all([
    db.memberProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        charges: { select: { amountPaise: true, dueDate: true } },
        payments: { select: { amountPaise: true } },
        memberships: {
          orderBy: { endDate: 'desc' },
          take: 1,
          include: { plan: true }
        }
      }
    }),
    db.membershipPlan.findMany({ where: { isActive: true }, orderBy: { feePaise: 'asc' } })
  ]);

  const members = q
    ? allMembers.filter((member) => [member.user.name, member.user.email, member.phone || '', member.memberCode || ''].some((value) => value.toLowerCase().includes(q)))
    : allMembers;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="page">
      <div className="container stack">
        <div className="section-heading">
          <div><h1>Members</h1><p className="muted">Create, search, edit and renew gym memberships.</p></div>
          <Link className="btn secondary" href="/owner/payments">Collect payment</Link>
        </div>

        <Notice success={params.success} error={params.error} />

        <section className="card">
          <h2>Add member</h2>
          {plans.length === 0 ? (
            <p className="muted">Create an active membership plan before adding members.</p>
          ) : (
            <form action={createMember} className="form-grid">
              <label className="field"><span>Name</span><input name="name" required maxLength={80} placeholder="Member name" /></label>
              <label className="field"><span>Email</span><input name="email" required type="email" maxLength={120} placeholder="member@example.com" /></label>
              <label className="field"><span>Phone</span><input name="phone" required maxLength={20} inputMode="tel" placeholder="9876543210" /></label>
              <label className="field"><span>Plan</span><select name="planId" required defaultValue={plans[0]?.id}>{plans.map((plan) => <option value={plan.id} key={plan.id}>{plan.name} · {moneyFromPaise(plan.feePaise)}</option>)}</select></label>
              <label className="field"><span>Start date</span><input name="startDate" type="date" defaultValue={today} /></label>
              <div className="field submit-field"><span>&nbsp;</span><button className="btn" type="submit">Add member & charge fee</button></div>
            </form>
          )}
        </section>

        <section className="card">
          <form className="search-row" method="get">
            <input name="q" defaultValue={params.q || ''} placeholder="Search name, email, phone or member code" />
            <button className="btn secondary" type="submit">Search</button>
            {q ? <Link className="text-link" href="/owner/members">Clear</Link> : null}
          </form>
        </section>

        <div className="stack">
          {members.length === 0 ? <section className="card"><p className="muted">No members found.</p></section> : members.map((member) => {
            const charged = member.charges.reduce((sum, item) => sum + item.amountPaise, 0);
            const paid = member.payments.reduce((sum, item) => sum + item.amountPaise, 0);
            const outstanding = Math.max(0, charged - paid);
            const dueCharges = member.charges.filter((item) => item.dueDate < new Date()).reduce((sum, item) => sum + item.amountPaise, 0);
            const overdue = Math.max(0, dueCharges - paid);
            const latest = member.memberships[0];

            return (
              <section className="card" key={member.id}>
                <div className="section-heading">
                  <div>
                    <h2>{member.user.name}</h2>
                    <div className="muted">{member.memberCode || 'No code'} · {member.phone || 'No phone'} · {member.user.email}</div>
                  </div>
                  <div className="status-group">
                    <span className={`badge ${overdue > 0 ? 'badge-danger' : ''}`}>{overdue > 0 ? 'OVERDUE' : member.membershipStatus}</span>
                    <strong>{moneyFromPaise(outstanding)} due</strong>
                  </div>
                </div>

                <div className="grid compact-grid">
                  <div className="mini-stat"><span className="muted">Current plan</span><strong>{latest?.plan.name || member.planName}</strong></div>
                  <div className="mini-stat"><span className="muted">Expires</span><strong>{formatDate(member.expiryDate)}</strong></div>
                  <div className="mini-stat"><span className="muted">Total charged</span><strong>{moneyFromPaise(charged)}</strong></div>
                  <div className="mini-stat"><span className="muted">Total paid</span><strong>{moneyFromPaise(paid)}</strong></div>
                </div>

                <div className="actions-row">
                  {outstanding > 0 ? <Link className="btn" href={`/owner/payments?memberId=${member.id}`}>Collect {moneyFromPaise(outstanding)}</Link> : <span className="badge badge-success">Paid up</span>}
                </div>

                <details>
                  <summary>Manage member</summary>
                  <div className="details-grid">
                    <form action={updateMember} className="sub-card stack">
                      <h3>Edit profile</h3>
                      <input type="hidden" name="memberId" value={member.id} />
                      <label className="field"><span>Name</span><input name="name" required defaultValue={member.user.name} /></label>
                      <label className="field"><span>Email</span><input name="email" type="email" required defaultValue={member.user.email} /></label>
                      <label className="field"><span>Phone</span><input name="phone" defaultValue={member.phone || ''} /></label>
                      <label className="field"><span>Status</span><select name="membershipStatus" defaultValue={member.membershipStatus}><option value="ACTIVE">Active</option><option value="PAUSED">Paused</option><option value="INACTIVE">Inactive</option></select></label>
                      <button className="btn secondary" type="submit">Save member</button>
                    </form>

                    <form action={renewMembership} className="sub-card stack">
                      <h3>Renew membership</h3>
                      <input type="hidden" name="memberId" value={member.id} />
                      <label className="field"><span>Plan</span><select name="planId" required defaultValue={plans[0]?.id}>{plans.map((plan) => <option value={plan.id} key={plan.id}>{plan.name} · {moneyFromPaise(plan.feePaise)}</option>)}</select></label>
                      <label className="field"><span>Start date (optional)</span><input type="date" name="startDate" /></label>
                      <p className="tiny">If blank, renewal starts after the current expiry date (or today if expired). A new historical charge is created.</p>
                      <button className="btn" type="submit" disabled={plans.length === 0}>Renew & create charge</button>
                    </form>
                  </div>
                </details>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
