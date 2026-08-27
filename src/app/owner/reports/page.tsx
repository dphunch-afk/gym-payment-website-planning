import Link from 'next/link';
import { requireOwner } from '@/lib/auth';
import { formatDate, moneyFromPaise } from '@/lib/finance';
import { getReportSnapshot } from '@/lib/reporting';

export default async function ReportsPage() {
  await requireOwner();
  const report = await getReportSnapshot();

  return (
    <main className="page">
      <div className="container stack">
        <div className="section-heading">
          <div>
            <h1>Reports & exports</h1>
            <p className="muted">Operational reports calculated directly from saved financial and membership records.</p>
          </div>
          <div className="actions-row">
            <Link className="btn secondary" href="/owner/exports?type=backup">Download backup</Link>
          </div>
        </div>

        <div className="grid">
          <section className="card third"><div className="muted">Collections this month</div><div className="metric">{moneyFromPaise(report.totals.collectionPaise)}</div></section>
          <section className="card third"><div className="muted">Expenses this month</div><div className="metric">{moneyFromPaise(report.totals.expensePaise)}</div></section>
          <section className="card third"><div className="muted">Net cash this month</div><div className="metric">{moneyFromPaise(report.totals.netPaise)}</div></section>
          <section className="card half"><div className="muted">Total outstanding dues</div><div className="metric">{moneyFromPaise(report.totals.outstandingPaise)}</div></section>
          <section className="card half"><div className="muted">Overdue amount</div><div className="metric danger-text">{moneyFromPaise(report.totals.overduePaise)}</div></section>
        </div>

        <section className="card">
          <div className="section-heading">
            <div><h2>Collections</h2><p className="muted">Payments recorded during the current calendar month.</p></div>
            <Link className="btn secondary" href="/owner/exports?type=collections">CSV</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Member</th><th>Receipt</th><th>Method</th><th>Amount</th></tr></thead>
              <tbody>
                {report.payments.length ? report.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.paidAt)}</td>
                    <td>{payment.member.user.name}</td>
                    <td>{payment.receiptNumber}</td>
                    <td>{payment.method}</td>
                    <td>{moneyFromPaise(payment.amountPaise)}</td>
                  </tr>
                )) : <tr><td colSpan={5} className="muted">No collections this month.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <div className="section-heading">
            <div><h2>Dues</h2><p className="muted">Outstanding balances calculated as total charges minus total payments.</p></div>
            <Link className="btn secondary" href="/owner/exports?type=dues">CSV</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Member</th><th>Code</th><th>Phone</th><th>Outstanding</th><th>Overdue</th><th>Expiry</th></tr></thead>
              <tbody>
                {report.dueRows.length ? report.dueRows.map(({ member, outstandingPaise, overduePaise }) => (
                  <tr key={member.id}>
                    <td>{member.user.name}</td>
                    <td>{member.memberCode || '—'}</td>
                    <td>{member.phone || '—'}</td>
                    <td>{moneyFromPaise(outstandingPaise)}</td>
                    <td>{moneyFromPaise(overduePaise)}</td>
                    <td>{formatDate(member.expiryDate)}</td>
                  </tr>
                )) : <tr><td colSpan={6} className="muted">No outstanding dues.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <div className="section-heading">
            <div><h2>Expenses</h2><p className="muted">Current-month expense history and income comparison.</p></div>
            <Link className="btn secondary" href="/owner/exports?type=expenses">CSV</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Title</th><th>Category</th><th>Amount</th><th>Recorded by</th></tr></thead>
              <tbody>
                {report.expenses.length ? report.expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{formatDate(expense.expenseDate)}</td>
                    <td>{expense.title}</td>
                    <td>{expense.category}</td>
                    <td>{moneyFromPaise(expense.amountPaise)}</td>
                    <td>{expense.createdBy.name}</td>
                  </tr>
                )) : <tr><td colSpan={5} className="muted">No expenses this month.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <div className="section-heading">
            <div><h2>Memberships expiring in 30 days</h2><p className="muted">Use this list for renewal follow-up.</p></div>
            <Link className="btn secondary" href="/owner/exports?type=expiring">CSV</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Member</th><th>Code</th><th>Phone</th><th>Plan</th><th>Expiry</th></tr></thead>
              <tbody>
                {report.expiring.length ? report.expiring.map((member) => (
                  <tr key={member.id}>
                    <td>{member.user.name}</td>
                    <td>{member.memberCode || '—'}</td>
                    <td>{member.phone || '—'}</td>
                    <td>{member.planName}</td>
                    <td>{formatDate(member.expiryDate)}</td>
                  </tr>
                )) : <tr><td colSpan={5} className="muted">No memberships expiring in the next 30 days.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
