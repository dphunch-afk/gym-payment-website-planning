import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const member = await prisma.memberProfile.findFirst({
    where: { memberCode: 'MEM-0001' },
    include: {
      attendance: true,
      workoutPlans: { include: { exercises: true } },
      progressEntries: true
    }
  });
  assert(member, 'Demo member was not seeded.');

  assert(member.attendance.length > 0, 'Attendance must persist for the member.');
  const activePlans = member.workoutPlans.filter((plan) => plan.isActive);
  assert(activePlans.length === 1, `Expected one active workout plan, found ${activePlans.length}.`);
  assert(activePlans[0].exercises.length >= 3, 'Active workout plan must include seeded exercises.');
  assert(activePlans[0].exercises.some((exercise) => exercise.dayLabel === 'Day 1'), 'Workout exercises must retain day labels.');

  assert(member.progressEntries.length > 0, 'Progress history must persist for the member.');
  const baseline = member.progressEntries.find((entry) => entry.note === 'Demo baseline');
  assert(baseline?.weightGrams === 72000, 'Demo progress weight must remain 72.0 kg in grams.');

  const attendanceScoped = await prisma.attendance.findMany({ where: { memberId: member.id } });
  const attendanceWrongScope = await prisma.attendance.findMany({ where: { memberId: 'not-the-member' } });
  assert(attendanceScoped.length > 0 && attendanceWrongScope.length === 0, 'Attendance queries must be member-scoped.');

  const workoutWrongScope = await prisma.workoutPlan.findMany({ where: { memberId: 'not-the-member' } });
  assert(workoutWrongScope.length === 0, 'Workout queries must be member-scoped.');

  const progressWrongScope = await prisma.progressEntry.findMany({ where: { memberId: 'not-the-member' } });
  assert(progressWrongScope.length === 0, 'Progress queries must be member-scoped.');

  console.log('Phase 4 attendance, workout and progress smoke checks passed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
