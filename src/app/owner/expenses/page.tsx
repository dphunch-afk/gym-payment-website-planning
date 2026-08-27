import { Notice } from '@/components/Notice';
import { createExpense } from '@/app/owner/actions';
import { db } from '@/lib/db';
import { formatDate, moneyFromPaise, startOfCurrentMonth, startOfNextMonth } from '@/lib/finance';

const categories = ['Rent', 'Electricity', 'Trainer Salary', 'Equipment', 'Maintenance', 'Marketing', 'Cleaning', 'Other'];

export default async function ExpensesPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const [expenses, monthTotal] = await Promise.all([
    db.expense.findMany({ orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }], take: 100, include: { createdBy: true } }),
    db.expense.aggregate({
      where: { expenseDate: { gte: startOfCurrentMonth(now), lt: startOfNextMonth(now) } },
      _sum: { amountPaise: true }
    })
  ]);
  const today = now.toISOString().slice(0, 10);

  return (
    <main className="page">
      <div className="container stack">
        <div className="section-heading">
          <div><h1>Expenses</h1><p className="muted">Record operating costs without overwriting historical entries.</p></div>
          <div className="summary-chip"><span>This month</span><strong>{moneyFromPaise(monthTotal._sum.amountPaise || 0)}</strong></div>
        </div>
        <Notice success={params.success} error={params.error} />

        <section className="card">
          <h2>Add expense</h2>
          <form action={createExpense} className="form-grid">
            <label className="field"><span>Expense</span><input name="title" required maxLength={100} placeholder="Electricity bill" /></label>
            <label className="field"><span>Category</span><select name="category" defaultValue="Electricity">{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
            <label className="field"><span>Amount (₹)</span><input name="amount" type="number" min="1" step="0.01" required placeholder="3500" /></label>
            <label className="field"><span>Date</span><input name="expenseDate" type="date" defaultValue={today} /></label>
            <label className="field full-field"><span>Note (optional)</span><input name="note" maxLength={200} placeholder="Invoice/reference" /></label>
            <div className="field submit-field"><span>&nbsp;</span><button className="btn" type="submit">Record expense</button></div>
          </form>
        </section>

        <section className="card">
          <h2>Expense history</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Expense</th><th>Category</th><th>Amount</th><th>Recorded by</th></tr></thead>
              <tbody>{expenses.length === 0 ? <tr><td colSpan={5} className="muted">No expenses yet.</td></tr> : expenses.map((expense) => (
                <tr key={expense.id}><td>{formatDate(expense.expenseDate)}</td><td><strong>{expense.title}</strong>{expense.note ? <div className="tiny">{expense.note}</div> : null}</td><td>{expense.category}</td><td><strong>{moneyFromPaise(expense.amountPaise)}</strong></td><td>{expense.createdBy.name}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
