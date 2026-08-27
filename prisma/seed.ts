import { PrismaClient } from '@prisma/client';
import { scryptSync, randomBytes } from 'node:crypto';

const prisma = new PrismaClient();

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: 'owner@gym.local' },
    update: {},
    create: {
      email: 'owner@gym.local',
      name: 'Demo Gym Owner',
      passwordHash: hashPassword('Owner@123'),
      role: 'OWNER'
    }
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@gym.local' },
    update: {},
    create: {
      email: 'member@gym.local',
      name: 'Demo Member',
      passwordHash: hashPassword('Member@123'),
      role: 'MEMBER'
    }
  });

  const monthly = await prisma.membershipPlan.upsert({
    where: { name: 'Monthly Standard' },
    update: { durationDays: 30, feePaise: 150000, isActive: true },
    create: { name: 'Monthly Standard', durationDays: 30, feePaise: 150000 }
  });

  await prisma.membershipPlan.upsert({
    where: { name: 'Quarterly' },
    update: { durationDays: 90, feePaise: 400000, isActive: true },
    create: { name: 'Quarterly', durationDays: 90, feePaise: 400000 }
  });

  await prisma.membershipPlan.upsert({
    where: { name: 'Annual' },
    update: { durationDays: 365, feePaise: 1400000, isActive: true },
    create: { name: 'Annual', durationDays: 365, feePaise: 1400000 }
  });

  const now = new Date();
  const expiry = addDays(now, 30);

  const profile = await prisma.memberProfile.upsert({
    where: { userId: member.id },
    update: {
      memberCode: 'MEM-0001',
      phone: '9999999999',
      membershipStatus: 'ACTIVE',
      planName: monthly.name,
      expiryDate: expiry,
      nextDueDate: expiry
    },
    create: {
      userId: member.id,
      memberCode: 'MEM-0001',
      phone: '9999999999',
      membershipStatus: 'ACTIVE',
      planName: monthly.name,
      joinDate: now,
      expiryDate: expiry,
      nextDueDate: expiry,
      outstandingPaise: 50000
    }
  });

  let membership = await prisma.membership.findFirst({
    where: { memberId: profile.id, planId: monthly.id },
    orderBy: { createdAt: 'asc' }
  });

  if (!membership) {
    membership = await prisma.membership.create({
      data: {
        memberId: profile.id,
        planId: monthly.id,
        startDate: now,
        endDate: expiry,
        feePaiseSnapshot: monthly.feePaise,
        status: 'ACTIVE'
      }
    });
  }

  const existingCharge = await prisma.charge.findUnique({ where: { membershipId: membership.id } });
  if (!existingCharge) {
    await prisma.charge.create({
      data: {
        memberId: profile.id,
        membershipId: membership.id,
        amountPaise: monthly.feePaise,
        dueDate: now,
        description: `${monthly.name} membership`
      }
    });
  }

  const demoPayment = await prisma.payment.findUnique({ where: { receiptNumber: 'DEMO-0001' } });
  if (!demoPayment) {
    await prisma.payment.create({
      data: {
        memberId: profile.id,
        amountPaise: 100000,
        method: 'UPI',
        receiptNumber: 'DEMO-0001',
        paidAt: now,
        note: 'Demo partial payment',
        createdById: owner.id
      }
    });
  }

  const charges = await prisma.charge.aggregate({ where: { memberId: profile.id }, _sum: { amountPaise: true } });
  const payments = await prisma.payment.aggregate({ where: { memberId: profile.id }, _sum: { amountPaise: true } });
  await prisma.memberProfile.update({
    where: { id: profile.id },
    data: { outstandingPaise: Math.max(0, (charges._sum.amountPaise || 0) - (payments._sum.amountPaise || 0)) }
  });

  const demoExpense = await prisma.expense.findFirst({ where: { title: 'Demo Electricity Bill' } });
  if (!demoExpense) {
    await prisma.expense.create({
      data: {
        title: 'Demo Electricity Bill',
        category: 'Electricity',
        amountPaise: 350000,
        expenseDate: now,
        note: 'Demo expense for Phase 2',
        createdById: owner.id
      }
    });
  }

  console.log(`Seeded Phase 2 demo data for ${owner.email} and ${member.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
