import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getReportSnapshot, toCsv } from '@/lib/reporting';

function csvResponse(filename: string, rows: unknown[][]) {
  return new Response(`\uFEFF${toCsv(rows)}`, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'no-store'
    }
  });
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
    return new Response('Unauthorized', { status: 401, headers: { 'cache-control': 'no-store' } });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'collections';
  const report = await getReportSnapshot();
  const stamp = new Date().toISOString().slice(0, 10);

  if (type === 'collections') {
    return csvResponse(`gym-collections-${stamp}.csv`, [
      ['Date', 'Member', 'Member Code', 'Receipt', 'Method', 'Amount INR', 'Note'],
      ...report.payments.map((payment) => [
        payment.paidAt.toISOString(),
        payment.member.user.name,
        payment.member.memberCode || '',
        payment.receiptNumber,
        payment.method,
        (payment.amountPaise / 100).toFixed(2),
        payment.note || ''
      ])
    ]);
  }

  if (type === 'dues') {
    return csvResponse(`gym-dues-${stamp}.csv`, [
      ['Member', 'Member Code', 'Phone', 'Plan', 'Expiry', 'Outstanding INR', 'Overdue INR'],
      ...report.dueRows.map(({ member, outstandingPaise, overduePaise }) => [
        member.user.name,
        member.memberCode || '',
        member.phone || '',
        member.planName,
        member.expiryDate.toISOString(),
        (outstandingPaise / 100).toFixed(2),
        (overduePaise / 100).toFixed(2)
      ])
    ]);
  }

  if (type === 'expenses') {
    return csvResponse(`gym-expenses-${stamp}.csv`, [
      ['Date', 'Title', 'Category', 'Amount INR', 'Note', 'Recorded By'],
      ...report.expenses.map((expense) => [
        expense.expenseDate.toISOString(),
        expense.title,
        expense.category,
        (expense.amountPaise / 100).toFixed(2),
        expense.note || '',
        expense.createdBy.name
      ])
    ]);
  }

  if (type === 'expiring') {
    return csvResponse(`gym-expiring-memberships-${stamp}.csv`, [
      ['Member', 'Member Code', 'Phone', 'Plan', 'Status', 'Expiry'],
      ...report.expiring.map((member) => [
        member.user.name,
        member.memberCode || '',
        member.phone || '',
        member.planName,
        member.membershipStatus,
        member.expiryDate.toISOString()
      ])
    ]);
  }

  if (type === 'backup') {
    const [users, plans, members, memberships, charges, payments, expenses, announcements, attendance, workouts, progress] = await Promise.all([
      db.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true } }),
      db.membershipPlan.findMany(),
      db.memberProfile.findMany(),
      db.membership.findMany(),
      db.charge.findMany(),
      db.payment.findMany(),
      db.expense.findMany(),
      db.announcement.findMany(),
      db.attendance.findMany(),
      db.workoutPlan.findMany({ include: { exercises: true } }),
      db.progressEntry.findMany()
    ]);

    const backup = {
      format: 'gym-owner-manager-backup-v1',
      exportedAt: new Date().toISOString(),
      exportedBy: { id: user.id, email: user.email, role: user.role },
      data: { users, plans, members, memberships, charges, payments, expenses, announcements, attendance, workouts, progress }
    };

    return new Response(JSON.stringify(backup, null, 2), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'content-disposition': `attachment; filename="gym-backup-${stamp}.json"`,
        'cache-control': 'no-store'
      }
    });
  }

  return new Response('Unknown export type', { status: 400, headers: { 'cache-control': 'no-store' } });
}
