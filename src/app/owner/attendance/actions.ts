'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireOwner } from '@/lib/auth';
import { db } from '@/lib/db';

function field(formData: FormData, name: string) {
  return String(formData.get(name) || '').trim();
}

function parseDateTime(raw: string) {
  const value = new Date(raw);
  return Number.isNaN(value.getTime()) ? null : value;
}

export async function recordAttendance(formData: FormData) {
  const owner = await requireOwner();
  const memberId = field(formData, 'memberId');
  const attendedAt = parseDateTime(field(formData, 'attendedAt'));
  const note = field(formData, 'note') || null;

  if (!memberId || !attendedAt) {
    redirect('/owner/attendance?error=Choose%20a%20member%20and%20valid%20date/time');
  }

  const member = await db.memberProfile.findUnique({ where: { id: memberId } });
  if (!member) redirect('/owner/attendance?error=Member%20not%20found');

  const duplicate = await db.attendance.findUnique({
    where: { memberId_attendedAt: { memberId, attendedAt } }
  });
  if (duplicate) redirect('/owner/attendance?error=That%20attendance%20entry%20already%20exists');

  await db.attendance.create({
    data: { memberId, attendedAt, note, recordedById: owner.id }
  });

  revalidatePath('/owner/attendance');
  revalidatePath('/member');
  redirect('/owner/attendance?success=Attendance%20recorded');
}
