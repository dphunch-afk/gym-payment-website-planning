'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireOwner } from '@/lib/auth';
import { db } from '@/lib/db';

function field(formData: FormData, name: string) {
  return String(formData.get(name) || '').trim();
}

function parseDateOnly(raw: string) {
  const value = new Date(`${raw}T12:00:00.000Z`);
  return Number.isNaN(value.getTime()) ? null : value;
}

function optionalPositiveInt(raw: string) {
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) return null;
  return value;
}

export async function createWorkoutPlan(formData: FormData) {
  const owner = await requireOwner();
  const memberId = field(formData, 'memberId');
  const title = field(formData, 'title');
  const notes = field(formData, 'notes') || null;
  const startsOn = parseDateOnly(field(formData, 'startsOn'));

  if (!memberId || title.length < 3 || !startsOn) {
    redirect('/owner/workouts?error=Member%2C%20title%20and%20start%20date%20are%20required');
  }

  const member = await db.memberProfile.findUnique({ where: { id: memberId } });
  if (!member) redirect('/owner/workouts?error=Member%20not%20found');

  await db.$transaction(async (tx) => {
    await tx.workoutPlan.updateMany({ where: { memberId, isActive: true }, data: { isActive: false } });
    await tx.workoutPlan.create({
      data: { memberId, title, notes, startsOn, isActive: true, createdById: owner.id }
    });
  });

  revalidatePath('/owner/workouts');
  revalidatePath('/member');
  redirect('/owner/workouts?success=Workout%20plan%20created');
}

export async function addWorkoutExercise(formData: FormData) {
  await requireOwner();
  const workoutPlanId = field(formData, 'workoutPlanId');
  const dayLabel = field(formData, 'dayLabel');
  const exerciseName = field(formData, 'exerciseName');
  const sets = optionalPositiveInt(field(formData, 'sets'));
  const reps = field(formData, 'reps') || null;
  const durationMinutes = optionalPositiveInt(field(formData, 'durationMinutes'));
  const notes = field(formData, 'notes') || null;
  const sortOrder = optionalPositiveInt(field(formData, 'sortOrder')) || 0;

  if (!workoutPlanId || dayLabel.length < 2 || exerciseName.length < 2) {
    redirect('/owner/workouts?error=Plan%2C%20day%20and%20exercise%20are%20required');
  }

  const plan = await db.workoutPlan.findUnique({ where: { id: workoutPlanId } });
  if (!plan) redirect('/owner/workouts?error=Workout%20plan%20not%20found');

  await db.workoutExercise.create({
    data: { workoutPlanId, dayLabel, exerciseName, sets, reps, durationMinutes, notes, sortOrder }
  });

  revalidatePath('/owner/workouts');
  revalidatePath('/member');
  redirect('/owner/workouts?success=Exercise%20added');
}

export async function toggleWorkoutPlan(formData: FormData) {
  await requireOwner();
  const id = field(formData, 'id');
  const plan = await db.workoutPlan.findUnique({ where: { id } });
  if (!plan) redirect('/owner/workouts?error=Workout%20plan%20not%20found');

  await db.$transaction(async (tx) => {
    if (!plan.isActive) {
      await tx.workoutPlan.updateMany({ where: { memberId: plan.memberId, isActive: true }, data: { isActive: false } });
    }
    await tx.workoutPlan.update({ where: { id }, data: { isActive: !plan.isActive } });
  });

  revalidatePath('/owner/workouts');
  revalidatePath('/member');
  redirect('/owner/workouts?success=Workout%20plan%20updated');
}
