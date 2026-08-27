import { PrismaClient } from '@prisma/client';
import { scryptSync, randomBytes } from 'node:crypto';

const prisma = new PrismaClient();

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
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

  const now = new Date();
  const expiry = new Date(now);
  expiry.setMonth(expiry.getMonth() + 1);
  const nextDue = new Date(now);
  nextDue.setDate(nextDue.getDate() + 25);

  await prisma.memberProfile.upsert({
    where: { userId: member.id },
    update: {},
    create: {
      userId: member.id,
      phone: '9999999999',
      membershipStatus: 'ACTIVE',
      planName: 'Monthly Standard',
      joinDate: now,
      expiryDate: expiry,
      nextDueDate: nextDue,
      outstandingPaise: 0
    }
  });

  console.log(`Seeded owner ${owner.email} and member ${member.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
