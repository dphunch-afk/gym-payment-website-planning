'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireOwner } from '@/lib/auth';
import { db } from '@/lib/db';

function field(formData: FormData, name: string) {
  return String(formData.get(name) || '').trim();
}

export async function createAnnouncement(formData: FormData) {
  const owner = await requireOwner();
  const title = field(formData, 'title');
  const body = field(formData, 'body');

  if (title.length < 3 || body.length < 3) {
    redirect('/owner/announcements?error=Title%20and%20message%20are%20required');
  }

  await db.announcement.create({
    data: {
      title,
      body,
      isActive: true,
      publishedAt: new Date(),
      createdById: owner.id
    }
  });

  revalidatePath('/owner/announcements');
  revalidatePath('/member');
  redirect('/owner/announcements?success=Announcement%20published');
}

export async function toggleAnnouncement(formData: FormData) {
  await requireOwner();
  const id = field(formData, 'id');
  const current = field(formData, 'current') === 'true';
  if (!id) redirect('/owner/announcements?error=Announcement%20not%20found');

  await db.announcement.update({ where: { id }, data: { isActive: !current } });
  revalidatePath('/owner/announcements');
  revalidatePath('/member');
  redirect('/owner/announcements?success=Announcement%20updated');
}
