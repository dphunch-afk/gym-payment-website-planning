import Link from 'next/link';
import { Notice } from '@/components/Notice';
import { recordPayment } from '@/app/owner/actions';
import { db } from '@/lib/db';
import { formatDate, moneyFromPaise } from '@/lib/finance';

export default async function PaymentsPage({
  searchParams
}: {
  searchParams: Promise<{ memberId?: string; success?: string; error?: string }>;
}) {
  const params = await searchParams;
  const members = await db.memberProfile.findMany({
    orderBy: { user: { name: 'asc' } },
    include: {
      user: true,
      charges: { select: { amountPaise: true } },
      payments: { select: { amountPaise: true } }
    }
  });

  const membersWithBalance = members.map((member) => {
    const charged = member.charges.reduce((sum, item) => sum + item.amountPaise, 0);
    const paid = member.payments.reduce((sum, item) => sum + item.amountPaise, 0);
    return { member, outstandingPaise: Math.max(0, charged - paid) };
  }).filter((item) => item.outstandingPaise > 0);

  const requested = membersWithBalance.find((item) => item.member.id === params.memberId);
  const selected = requested || membersWithBalance[0];

  const recentPayments = await db.payment.findMany({
    orderBy: [{ paidAt: 'desc' }, { createdAt: 'desc' }],
    take: 50,
    include: { member: { include: { user: true } }, createdBy: true }
  });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="page">
      <div className="container stack">
        <div><h1>Fee Payments</h1><p className="muted">Record partial or full payments. Every saved payment receives a database-enforced unique receipt number.</p></div>
        <Notice success={params.success} error={params.error} />

        <section className="card">
          <h2>Collect fee</h2>
          {membersWithBalance.length === 0 ? (
            <p className="muted">No members currently have an outstanding balance.</p>
          ) : (
            <>
              {selected ? <div className="balance-banner"><span>Selected outstanding</span><strong>{selected.member.user.name}: {moneyFromPaise(selected.outstandingPaise)}</strong></div> : null}
              <form action={recordPayment} className="form-grid">
                <label className="field"><span>Member</span><select name="memberId" required defaultValue={selected?.member.id}>{membersWithBalance.map(({ member, outstandingPaise }) => <option value={member.id} key={member.id}>{member.user.name} · {moneyFromPaise(outstandingPaise)} due</option>)}</select></label>
                <label className="field"><span>Amount received (₹)</span><input name="amount" required type="number" min="1" step="0.01" max={selected ? (selected.outstandingPaise / 100).toFixed(2) : undefined} placeholder="500" /></label>
                <label className="field"><span>Payment method</span><select name="method" defaultValue="UPI"><option value="UPI">UPI</option><option value="CASH">Cash</option><option value="CARD">Card</option><option value="BANK">Bank transfer</option></select></label>
                <label className="field"><span>Payment date</span><input name="paidAt" type="date" defaultValue={today} /></label>
                <label className="field full-field"><span>Note (optional)</span><input name="note" maxLength={200} placeholder="Reference or note" /></label>
                <div className="field submit-field"><span>&nbsp;</span><button className="btn" type="submit">Save payment & open receipt</button></div>
              </form>
            </>
          )}
        </section>

        <section className="card">
          <div className="section-heading"><div><h2>Payment history</h2><p className="muted">Financial records are append-only in this MVP.</p></div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Member</th><th>Amount</th><th>Method</th><th>Receipt</th><th>Recorded by</th></tr></thead>
              <tbody>
                {recentPayments.length === 0 ? <tr><td colSpan={6} className="muted">No payments recorded.</td></tr> : recentPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.paidAt)}</td>
                    <td><strong>{payment.member.user.name}</strong><div className="tiny">{payment.member.memberCode || ''}</div></td>
                    <td><strong>{moneyFromPaise(payment.amountPaise)}</strong></td>
                    <td>{payment.method}</td>
                    <td><Link className="text-link" href={`/owner/receipts/${payment.id}`}>{payment.receiptNumber}</Link></td>
                    <td>{payment.createdBy.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
