'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireMember } from '@/lib/auth';
import { db } from '@/lib/db';

function field(formData: FormData, name: string) {
  return String(formData.get(name) || '').trim();
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
