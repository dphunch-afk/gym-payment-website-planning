import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { createSession } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({
    ok: true,
    redirectTo: user.role === 'MEMBER' ? '/member' : '/owner'
  });
}
