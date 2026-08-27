'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireOwner } from '@/lib/auth';
import { db } from '@/lib/db';
import { parseOptionalCm, parseOptionalKg } from '@/lib/progress';

function field(formData: FormData, name: string) {
  return String(formData.get(name) || '').trim();
}

function parseDateOnly(raw: string) {
  const value = new Date(`${raw}T12:00:00.000Z`);
  return Number.isNaN(value.getTime()) ? null : value;
}

export async function recordMemberProgress(formData: FormData) {
  const owner = await requireOwner();
  const memberId = field(formData, 'memberId');
  const recordedAt = parseDateOnly(field(formData, 'recordedAt'));
  const weightGrams = parseOptionalKg(formData.get('weightKg'));
  const chestMm = parseOptionalCm(formData.get('chestCm'));
  const waistMm = parseOptionalCm(formData.get('waistCm'));
  const hipMm = parseOptionalCm(formData.get('hipCm'));
  const armMm = parseOptionalCm(formData.get('armCm'));
  const thighMm = parseOptionalCm(formData.get('thighCm'));
  const note = field(formData, 'note') || null;

  if (!memberId || !recordedAt) {
    redirect('/owner/progress?error=Choose%20a%20member%20and%20date');
  }
  if (![weightGrams, chestMm, waistMm, hipMm, armMm, thighMm].some((value) => value !== null)) {
    redirect('/owner/progress?error=Enter%20at%20least%20one%20measurement');
  }

  const member = await db.memberProfile.findUnique({ where: { id: memberId } });
  if (!member) redirect('/owner/progress?error=Member%20not%20found');

  await db.progressEntry.create({
    data: { memberId, recordedAt, weightGrams, chestMm, waistMm, hipMm, armMm, thighMm, note, recordedById: owner.id }
  });

  revalidatePath('/owner/progress');
  revalidatePath('/member');
  redirect('/owner/progress?success=Progress%20entry%20saved');
}
