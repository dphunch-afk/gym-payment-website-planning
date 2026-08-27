import Link from 'next/link';
import { requireOwner } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate, moneyFromPaise, startOfCurrentMonth, startOfNextMonth } from '@/lib/finance';

export default async function OwnerPage() {
  const user = await requireOwner();
  const now = new Date();
  const monthStart = startOfCurrentMonth(now);
  const nextMonth = startOfNextMonth(now);

  const [activeMembers, monthPayments, monthExpenses, monthCharges, members, recentPayments] = await Promise.all([
    db.memberProfile.count({ where: { membershipStatus: 'ACTIVE' } }),
    db.payment.aggregate({
      where: { paidAt: { gte: monthStart, lt: nextMonth } },
      _sum: { amountPaise: true }
    }),
    db.expense.aggregate({
      where: { expenseDate: { gte: monthStart, lt: nextMonth } },
      _sum: { amountPaise: true }
    }),
    db.charge.aggregate({
      where: { dueDate: { gte: monthStart, lt: nextMonth } },
      _sum: { amountPaise: true }
    }),
    db.memberProfile.findMany({
      include: {
        user: true,
        charges: { select: { amountPaise: true, dueDate: true } },
        payments: { select: { amountPaise: true } }
      }
    }),
    db.payment.findMany({
      orderBy: [{ paidAt: 'desc' }, { createdAt: 'desc' }],
      take: 6,
      include: { member: { include: { user: true } } }
    })
  ]);

  let totalOutstandingPaise = 0;
  let overduePaise = 0;
  let dueMembers = 0;

  for (const member of members) {
    const charged = member.charges.reduce((sum, charge) => sum + charge.amountPaise, 0);
    const paid = member.payments.reduce((sum, payment) => sum + payment.amountPaise, 0);
    const outstanding = Math.max(0, charged - paid);
    const dueCharges = member.charges
      .filter((charge) => charge.dueDate < now)
      .reduce((sum, charge) => sum + charge.amountPaise, 0);
    const overdue = Math.max(0, dueCharges - paid);

    totalOutstandingPaise += outstanding;
    overduePaise += overdue;
    if (outstanding > 0) dueMembers += 1;
  }

  const collectedPaise = monthPayments._sum.amountPaise || 0;
  const expensesPaise = monthExpenses._sum.amountPaise || 0;
  const expectedPaise = monthCharges._sum.amountPaise || 0;
  const netCashPaise = collectedPaise - expensesPaise;

  return (
    <main className="page">
      <div className="container stack">
        <div>
          <h1>Owner Dashboard</h1>
          <p className="muted">Welcome, {user.name}. Live totals are calculated from the financial ledger.</p>
        </div>

        <div className="grid metrics-grid">
          <section className="card third"><div className="muted">Active members</div><div className="metric">{activeMembers}</div></section>
          <section className="card third"><div className="muted">Collected this month</div><div className="metric">{moneyFromPaise(collectedPaise)}</div></section>
          <section className="card third"><div className="muted">Outstanding dues</div><div className="metric">{moneyFromPaise(totalOutstandingPaise)}</div><div className="tiny">{dueMembers} member(s)</div></section>
          <section className="card third"><div className="muted">Overdue</div><div className="metric danger-text">{moneyFromPaise(overduePaise)}</div></section>
          <section className="card third"><div className="muted">Expenses this month</div><div className="metric">{moneyFromPaise(expensesPaise)}</div></section>
          <section className="card third"><div className="muted">Net cash this month</div><div className={`metric ${netCashPaise < 0 ? 'danger-text' : ''}`}>{moneyFromPaise(netCashPaise)}</div></section>
        </div>

        <div className="grid">
          <section className="card half">
            <div className="section-heading">
              <div><h2>This month</h2><p className="muted">Charges versus collections and operating expenses.</p></div>
            </div>
            <div className="info-row"><span>Membership charges</span><strong>{moneyFromPaise(expectedPaise)}</strong></div>
            <div className="info-row"><span>Payments received</span><strong>{moneyFromPaise(collectedPaise)}</strong></div>
            <div className="info-row"><span>Expenses</span><strong>{moneyFromPaise(expensesPaise)}</strong></div>
            <div className="actions-row">
              <Link className="btn" href="/owner/payments">Collect fee</Link>
              <Link className="btn secondary" href="/owner/expenses">Add expense</Link>
            </div>
          </section>

          <section className="card half">
            <div className="section-heading">
              <div><h2>Recent payments</h2><p className="muted">Latest owner-recorded fee payments.</p></div>
              <Link href="/owner/payments" className="text-link">View all</Link>
            </div>
            {recentPayments.length === 0 ? <p className="muted">No payments yet.</p> : recentPayments.map((payment) => (
              <div className="info-row" key={payment.id}>
                <div><strong>{payment.member.user.name}</strong><div className="tiny">{formatDate(payment.paidAt)} · {payment.method}</div></div>
                <div style={{ textAlign: 'right' }}><strong>{moneyFromPaise(payment.amountPaise)}</strong><div><Link className="text-link tiny" href={`/owner/receipts/${payment.id}`}>{payment.receiptNumber}</Link></div></div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
