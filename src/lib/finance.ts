import { db } from '@/lib/db';

export function moneyFromPaise(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value / 100);
}

export function formatDate(date?: Date | null) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function parseRupeesToPaise(raw: FormDataEntryValue | null) {
  const value = Number(String(raw || '').trim());
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100);
}

export async function getMemberBalance(memberId: string) {
  const [charges, payments] = await Promise.all([
    db.charge.aggregate({ where: { memberId }, _sum: { amountPaise: true } }),
    db.payment.aggregate({ where: { memberId }, _sum: { amountPaise: true } })
  ]);

  const chargedPaise = charges._sum.amountPaise || 0;
  const paidPaise = payments._sum.amountPaise || 0;
  return {
    chargedPaise,
    paidPaise,
    outstandingPaise: Math.max(0, chargedPaise - paidPaise)
  };
}

export async function syncMemberFinancialSnapshot(memberId: string) {
  const balance = await getMemberBalance(memberId);
  await db.memberProfile.update({
    where: { id: memberId },
    data: { outstandingPaise: balance.outstandingPaise }
  });
  return balance;
}

export async function getMemberOverduePaise(memberId: string, asOf = new Date()) {
  const [dueCharges, payments] = await Promise.all([
    db.charge.aggregate({
      where: { memberId, dueDate: { lt: asOf } },
      _sum: { amountPaise: true }
    }),
    db.payment.aggregate({ where: { memberId }, _sum: { amountPaise: true } })
  ]);

  return Math.max(0, (dueCharges._sum.amountPaise || 0) - (payments._sum.amountPaise || 0));
}

export function startOfCurrentMonth(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function startOfNextMonth(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}
