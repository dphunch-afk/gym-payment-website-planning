import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const member = await prisma.memberProfile.findFirst({
    where: { memberCode: 'MEM-0001' },
    include: { user: true, charges: true, payments: true, attendance: true }
  });
  assert(member, 'Demo member was not seeded.');

  const charged = member.charges.reduce((sum, item) => sum + item.amountPaise, 0);
  const paid = member.payments.reduce((sum, item) => sum + item.amountPaise, 0);
  assert(Math.max(0, charged - paid) === 50000, 'Member portal ledger balance must equal ₹500.');
  assert(member.payments.some((payment) => payment.receiptNumber === 'DEMO-0001'), 'Member payment history is missing the demo receipt.');
  assert(member.attendance.length > 0, 'Member attendance history is missing.');

  const activeAnnouncements = await prisma.announcement.findMany({ where: { isActive: true } });
  assert(activeAnnouncements.some((notice) => notice.title === 'Welcome to the member portal'), 'Active member announcement is missing.');

  const payment = member.payments[0];
  assert(payment, 'Expected a member payment for receipt scoping test.');
  const scopedPayment = await prisma.payment.findFirst({ where: { id: payment.id, memberId: member.id } });
  assert(scopedPayment?.id === payment.id, 'Member-scoped receipt query failed for the owning member.');
  const impossibleScope = await prisma.payment.findFirst({ where: { id: payment.id, memberId: 'not-the-member' } });
  assert(!impossibleScope, 'Receipt lookup must not return a payment for a different member scope.');

  console.log('Phase 3 member portal smoke checks passed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
