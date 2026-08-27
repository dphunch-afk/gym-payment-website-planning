'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireOwner } from '@/lib/auth';
import { db } from '@/lib/db';
import { addDays, getMemberBalance, parseRupeesToPaise } from '@/lib/finance';
import { hashPassword } from '@/lib/password';

const MEMBER_STATUSES = new Set(['ACTIVE', 'PAUSED', 'INACTIVE']);
const PAYMENT_METHODS = new Set(['CASH', 'UPI', 'CARD', 'BANK']);

function field(formData: FormData, name: string) {
  return String(formData.get(name) || '').trim();
}

function safeEmail(value: string) {
  return value.toLowerCase();
}

function parseDateOnly(raw: string, fallback = new Date()) {
  if (!raw) return fallback;
  const value = new Date(`${raw}T12:00:00.000Z`);
  return Number.isNaN(value.getTime()) ? fallback : value;
}

function go(path: string, kind: 'success' | 'error', message: string): never {
  const joiner = path.includes('?') ? '&' : '?';
  redirect(`${path}${joiner}${kind}=${encodeURIComponent(message)}`);
}

function memberCode() {
  return `M-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`;
}

function receiptNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `GYM-${date}-${randomBytes(6).toString('hex').toUpperCase()}`;
}

export async function createMember(formData: FormData) {
  await requireOwner();

  const name = field(formData, 'name');
  const email = safeEmail(field(formData, 'email'));
  const phone = field(formData, 'phone');
  const planId = field(formData, 'planId');
  const startDate = parseDateOnly(field(formData, 'startDate'));

  if (!name || !email.includes('@') || !phone || !planId) {
    go('/owner/members', 'error', 'Name, email, phone and plan are required.');
  }

  const [existing, plan] = await Promise.all([
    db.user.findUnique({ where: { email } }),
    db.membershipPlan.findUnique({ where: { id: planId } })
  ]);

  if (existing) go('/owner/members', 'error', 'A user with that email already exists.');
  if (!plan || !plan.isActive) go('/owner/members', 'error', 'Choose an active membership plan.');

  const expiryDate = addDays(startDate, plan.durationDays);
  const generatedPassword = randomBytes(32).toString('base64url');

  await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(generatedPassword),
        role: 'MEMBER'
      }
    });

    const member = await tx.memberProfile.create({
      data: {
        userId: user.id,
        memberCode: memberCode(),
        phone,
        membershipStatus: 'ACTIVE',
        planName: plan.name,
        joinDate: startDate,
        expiryDate,
        nextDueDate: expiryDate,
        outstandingPaise: plan.feePaise
      }
    });

    const membership = await tx.membership.create({
      data: {
        memberId: member.id,
        planId: plan.id,
        startDate,
        endDate: expiryDate,
        feePaiseSnapshot: plan.feePaise,
        status: 'ACTIVE'
      }
    });

    await tx.charge.create({
      data: {
        memberId: member.id,
        membershipId: membership.id,
        amountPaise: plan.feePaise,
        dueDate: startDate,
        description: `${plan.name} membership`
      }
    });
  });

  revalidatePath('/owner');
  revalidatePath('/owner/members');
  go('/owner/members', 'success', `${name} added successfully.`);
}

export async function updateMember(formData: FormData) {
  await requireOwner();

  const memberId = field(formData, 'memberId');
  const name = field(formData, 'name');
  const email = safeEmail(field(formData, 'email'));
  const phone = field(formData, 'phone');
  const status = field(formData, 'membershipStatus');

  if (!memberId || !name || !email.includes('@') || !MEMBER_STATUSES.has(status)) {
    go('/owner/members', 'error', 'Invalid member update.');
  }

  const member = await db.memberProfile.findUnique({ where: { id: memberId }, include: { user: true } });
  if (!member) go('/owner/members', 'error', 'Member not found.');

  const emailOwner = await db.user.findUnique({ where: { email } });
  if (emailOwner && emailOwner.id !== member.userId) {
    go('/owner/members', 'error', 'That email is already in use.');
  }

  await db.$transaction([
    db.user.update({ where: { id: member.userId }, data: { name, email } }),
    db.memberProfile.update({ where: { id: member.id }, data: { phone, membershipStatus: status } })
  ]);

  revalidatePath('/owner');
  revalidatePath('/owner/members');
  go('/owner/members', 'success', `${name} updated.`);
}

export async function renewMembership(formData: FormData) {
  await requireOwner();

  const memberId = field(formData, 'memberId');
  const planId = field(formData, 'planId');
  const requestedStart = field(formData, 'startDate');

  const [member, plan] = await Promise.all([
    db.memberProfile.findUnique({ where: { id: memberId }, include: { user: true } }),
    db.membershipPlan.findUnique({ where: { id: planId } })
  ]);

  if (!member || !plan || !plan.isActive) {
    go('/owner/members', 'error', 'Member or active plan not found.');
  }

  const now = new Date();
  const automaticStart = member.expiryDate > now ? addDays(member.expiryDate, 1) : now;
  const startDate = parseDateOnly(requestedStart, automaticStart);
  const endDate = addDays(startDate, plan.durationDays);
  const currentBalance = await getMemberBalance(member.id);

  await db.$transaction(async (tx) => {
    const membership = await tx.membership.create({
      data: {
        memberId: member.id,
        planId: plan.id,
        startDate,
        endDate,
        feePaiseSnapshot: plan.feePaise,
        status: 'ACTIVE'
      }
    });

    await tx.charge.create({
      data: {
        memberId: member.id,
        membershipId: membership.id,
        amountPaise: plan.feePaise,
        dueDate: startDate,
        description: `${plan.name} renewal`
      }
    });

    await tx.memberProfile.update({
      where: { id: member.id },
      data: {
        planName: plan.name,
        membershipStatus: 'ACTIVE',
        expiryDate: endDate,
        nextDueDate: endDate,
        outstandingPaise: currentBalance.outstandingPaise + plan.feePaise
      }
    });
  });

  revalidatePath('/owner');
  revalidatePath('/owner/members');
  revalidatePath('/member');
  go('/owner/members', 'success', `${member.user.name} renewed on ${plan.name}.`);
}

export async function recordPayment(formData: FormData) {
  const owner = await requireOwner();

  const memberId = field(formData, 'memberId');
  const amountPaise = parseRupeesToPaise(formData.get('amount'));
  const method = field(formData, 'method').toUpperCase();
  const paidAt = parseDateOnly(field(formData, 'paidAt'));
  const note = field(formData, 'note') || null;

  if (!memberId || !amountPaise || !PAYMENT_METHODS.has(method)) {
    go('/owner/payments', 'error', 'Enter a valid member, amount and payment method.');
  }

  const member = await db.memberProfile.findUnique({ where: { id: memberId }, include: { user: true } });
  if (!member) go('/owner/payments', 'error', 'Member not found.');

  const balance = await getMemberBalance(member.id);
  if (balance.outstandingPaise <= 0) go('/owner/payments', 'error', 'This member has no outstanding balance.');
  if (amountPaise > balance.outstandingPaise) {
    go('/owner/payments', 'error', 'Payment cannot exceed the outstanding balance.');
  }

  const payment = await db.payment.create({
    data: {
      memberId: member.id,
      amountPaise,
      method,
      paidAt,
      note,
      receiptNumber: receiptNumber(),
      createdById: owner.id
    }
  });

  await db.memberProfile.update({
    where: { id: member.id },
    data: { outstandingPaise: balance.outstandingPaise - amountPaise }
  });

  revalidatePath('/owner');
  revalidatePath('/owner/members');
  revalidatePath('/owner/payments');
  revalidatePath('/member');
  redirect(`/owner/receipts/${payment.id}`);
}

export async function createExpense(formData: FormData) {
  const owner = await requireOwner();

  const title = field(formData, 'title');
  const category = field(formData, 'category');
  const amountPaise = parseRupeesToPaise(formData.get('amount'));
  const expenseDate = parseDateOnly(field(formData, 'expenseDate'));
  const note = field(formData, 'note') || null;

  if (!title || !category || !amountPaise) {
    go('/owner/expenses', 'error', 'Title, category and amount are required.');
  }

  await db.expense.create({
    data: { title, category, amountPaise, expenseDate, note, createdById: owner.id }
  });

  revalidatePath('/owner');
  revalidatePath('/owner/expenses');
  go('/owner/expenses', 'success', 'Expense recorded.');
}

export async function createPlan(formData: FormData) {
  await requireOwner();

  const name = field(formData, 'name');
  const durationDays = Number(field(formData, 'durationDays'));
  const feePaise = parseRupeesToPaise(formData.get('fee'));

  if (!name || !Number.isInteger(durationDays) || durationDays <= 0 || !feePaise) {
    go('/owner/plans', 'error', 'Enter a valid plan name, duration and fee.');
  }

  const existing = await db.membershipPlan.findUnique({ where: { name } });
  if (existing) go('/owner/plans', 'error', 'A plan with that name already exists.');

  await db.membershipPlan.create({ data: { name, durationDays, feePaise } });
  revalidatePath('/owner/plans');
  revalidatePath('/owner/members');
  go('/owner/plans', 'success', `${name} created.`);
}

export async function updatePlan(formData: FormData) {
  await requireOwner();

  const planId = field(formData, 'planId');
  const name = field(formData, 'name');
  const durationDays = Number(field(formData, 'durationDays'));
  const feePaise = parseRupeesToPaise(formData.get('fee'));
  const isActive = field(formData, 'isActive') === 'true';

  if (!planId || !name || !Number.isInteger(durationDays) || durationDays <= 0 || !feePaise) {
    go('/owner/plans', 'error', 'Invalid plan update.');
  }

  const duplicate = await db.membershipPlan.findUnique({ where: { name } });
  if (duplicate && duplicate.id !== planId) go('/owner/plans', 'error', 'Another plan already uses that name.');

  await db.membershipPlan.update({
    where: { id: planId },
    data: { name, durationDays, feePaise, isActive }
  });

  revalidatePath('/owner/plans');
  revalidatePath('/owner/members');
  go('/owner/plans', 'success', `${name} updated. Existing historical charges were not changed.`);
}
