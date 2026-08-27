import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const member = await prisma.memberProfile.findFirst({
    where: { memberCode: 'MEM-0001' },
    include: { user: true, memberships: true, charges: true, payments: true }
  });
  assert(member, 'Demo member was not seeded.');

  const charged = member.charges.reduce((sum, item) => sum + item.amountPaise, 0);
  const paid = member.payments.reduce((sum, item) => sum + item.amountPaise, 0);
  assert(charged === 150000, `Expected ₹1,500 charged, received ${charged} paise.`);
  assert(paid === 100000, `Expected ₹1,000 paid, received ${paid} paise.`);
  assert(Math.max(0, charged - paid) === 50000, 'Partial-payment balance must equal ₹500.');
  assert(member.outstandingPaise === 50000, 'Member summary balance must match the ledger.');

  const payment = await prisma.payment.findUnique({ where: { receiptNumber: 'DEMO-0001' } });
  assert(payment, 'Demo payment receipt was not seeded.');

  let duplicateReceiptRejected = false;
  try {
    await prisma.payment.create({
      data: {
        memberId: member.id,
        amountPaise: 100,
        method: 'CASH',
        receiptNumber: 'DEMO-0001',
        paidAt: new Date(),
        createdById: payment.createdById
      }
    });
  } catch {
    duplicateReceiptRejected = true;
  }
  assert(duplicateReceiptRejected, 'Database must reject duplicate receipt numbers.');

  const plan = await prisma.membershipPlan.findUnique({ where: { name: 'Monthly Standard' } });
  assert(plan, 'Monthly Standard plan was not seeded.');
  const membership = member.memberships[0];
  assert(membership, 'Membership history was not seeded.');
  const snapshotBefore = membership.feePaiseSnapshot;
  const chargeBefore = member.charges[0]?.amountPaise;
  assert(chargeBefore, 'Membership charge was not seeded.');

  await prisma.membershipPlan.update({ where: { id: plan.id }, data: { feePaise: plan.feePaise + 10000 } });
  const historicalMembership = await prisma.membership.findUnique({ where: { id: membership.id } });
  const historicalCharge = await prisma.charge.findUnique({ where: { membershipId: membership.id } });
  assert(historicalMembership?.feePaiseSnapshot === snapshotBefore, 'Editing a plan changed a historical membership fee snapshot.');
  assert(historicalCharge?.amountPaise === chargeBefore, 'Editing a plan changed a historical charge.');
  await prisma.membershipPlan.update({ where: { id: plan.id }, data: { feePaise: plan.feePaise } });

  const expenseCount = await prisma.expense.count();
  assert(expenseCount > 0, 'Expense seed data is missing.');

  console.log('Phase 2 financial smoke checks passed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
