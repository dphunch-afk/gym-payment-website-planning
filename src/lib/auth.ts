import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

const SESSION_COOKIE = 'gym_session';
const SESSION_DAYS = 7;

function tokenHash(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.session.create({
    data: { userId, tokenHash: tokenHash(token), expiresAt }
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await db.session.deleteMany({ where: { tokenHash: tokenHash(token) } });
  }

  cookieStore.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0)
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: tokenHash(token) },
    include: { user: { include: { member: true } } }
  });

  if (!session || session.expiresAt <= new Date()) {
    if (session) await db.session.delete({ where: { id: session.id } });
    return null;
  }

  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireOwner() {
  const user = await requireUser();
  if (user.role !== 'OWNER' && user.role !== 'ADMIN') redirect('/member');
  return user;
}

export async function requireMember() {
  const user = await requireUser();
  if (user.role !== 'MEMBER') redirect('/owner');
  return user;
}
