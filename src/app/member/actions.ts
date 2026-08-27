'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireMember } from '@/lib/auth';
import { db } from '@/lib/db';
import { parseOptionalCm, parseOptionalKg } from '@/lib/progress';

function field(formData: FormData, name: string) {
  return String(formData.get(name) || '').trim();
}

function parseDateOnly(raw: string) {
  const value = new Date(`${raw}T12:00:00.000Z`);
  return Number.isNaN(value.getTime()) ? null : value;
}

export async function updateOwnProfile(formData: FormData) {
  const user = await requireMember();
  const phone = field(formData, 'phone');

  if (!user.member) redirect('/member?error=Member%20profile%20not%20found');
  if (!/^\+?[0-9 -]{7,18}$/.test(phone)) {
    redirect('/member?error=Enter%20a%20valid%20phone%20number');
  }

  await db.memberProfile.update({
    where: { id: user.member.id },
    data: { phone }
  });

  revalidatePath('/member');
  redirect('/member?success=Profile%20updated');
}

export async function recordOwnProgress(formData: FormData) {
  const user = await requireMember();
  const memberId = user.member?.id;
  if (!memberId) redirect('/member?error=Member%20profile%20not%20found');

  const recordedAt = parseDateOnly(field(formData, 'recordedAt'));
  const weightGrams = parseOptionalKg(formData.get('weightKg'));
  const chestMm = parseOptionalCm(formData.get('chestCm'));
  const waistMm = parseOptionalCm(formData.get('waistCm'));
  const hipMm = parseOptionalCm(formData.get('hipCm'));
  const armMm = parseOptionalCm(formData.get('armCm'));
  const thighMm = parseOptionalCm(formData.get('thighCm'));
  const note = field(formData, 'note') || null;

  if (!recordedAt) redirect('/member?error=Choose%20a%20valid%20progress%20date#progress');
  if (![weightGrams, chestMm, waistMm, hipMm, armMm, thighMm].some((value) => value !== null)) {
    redirect('/member?error=Enter%20at%20least%20one%20measurement#progress');
  }

  await db.progressEntry.create({
    data: {
      memberId,
      recordedAt,
      weightGrams,
      chestMm,
      waistMm,
      hipMm,
      armMm,
      thighMm,
      note,
      recordedById: user.id
    }
  });

  revalidatePath('/member');
  revalidatePath('/owner/progress');
  redirect('/member?success=Progress%20entry%20saved#progress');
}
