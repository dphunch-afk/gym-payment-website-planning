import { db } from '@/lib/db';
import { startOfCurrentMonth, startOfNextMonth } from '@/lib/finance';

export function csvCell(value: unknown) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(rows: unknown[][]) {
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}

export async function getReportSnapshot(now = new Date()) {
  const monthStart = startOfCurrentMonth(now);
  const nextMonth = startOfNextMonth(now);
  const expiringUntil = new Date(now);
  expiringUntil.setDate(expiringUntil.getDate() + 30);

  const [members, payments, expenses, expiring] = await Promise.all([
    db.memberProfile.findMany({
      include: { user: true, charges: true, payments: true },
      orderBy: { user: { name: 'asc' } }
    }),
    db.payment.findMany({
      where: { paidAt: { gte: monthStart, lt: nextMonth } },
      include: { member: { include: { user: true } } },
      orderBy: { paidAt: 'desc' }
    }),
    db.expense.findMany({
      where: { expenseDate: { gte: monthStart, lt: nextMonth } },
      include: { createdBy: true },
      orderBy: { expenseDate: 'desc' }
    }),
    db.memberProfile.findMany({
      where: { expiryDate: { gte: now, lte: expiringUntil } },
      include: { user: true },
      orderBy: { expiryDate: 'asc' }
    })
  ]);

  const dueRows = members
    .map((member) => {
      const chargedPaise = member.charges.reduce((sum, charge) => sum + charge.amountPaise, 0);
      const paidPaise = member.payments.reduce((sum, payment) => sum + payment.amountPaise, 0);
      const dueChargedPaise = member.charges
        .filter((charge) => charge.dueDate < now)
        .reduce((sum, charge) => sum + charge.amountPaise, 0);
      const outstandingPaise = Math.max(0, chargedPaise - paidPaise);
      const overduePaise = Math.max(0, dueChargedPaise - paidPaise);
      return { member, chargedPaise, paidPaise, outstandingPaise, overduePaise };
    })
    .filter((row) => row.outstandingPaise > 0)
    .sort((a, b) => b.outstandingPaise - a.outstandingPaise);

  const collectionPaise = payments.reduce((sum, payment) => sum + payment.amountPaise, 0);
  const expensePaise = expenses.reduce((sum, expense) => sum + expense.amountPaise, 0);
  const outstandingPaise = dueRows.reduce((sum, row) => sum + row.outstandingPaise, 0);
  const overduePaise = dueRows.reduce((sum, row) => sum + row.overduePaise, 0);

  return {
    monthStart,
    nextMonth,
    payments,
    expenses,
    dueRows,
    expiring,
    totals: {
      collectionPaise,
      expensePaise,
      netPaise: collectionPaise - expensePaise,
      outstandingPaise,
      overduePaise
    }
  };
}
