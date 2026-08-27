import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PrintButton } from '@/components/PrintButton';
import { requireMember } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate, getMemberBalance, moneyFromPaise } from '@/lib/finance';

export default async function MemberReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireMember();
  const { id } = await params;
  const memberId = user.member?.id;
  if (!memberId) notFound();

  const payment = await db.payment.findFirst({
    where: { id, memberId },
    include: { member: { include: { user: true } }, createdBy: true }
  });
  if (!payment) notFound();

  const balance = await getMemberBalance(memberId);

  return (
    <main className="page receipt-page">
      <div className="container stack receipt-container">
        <div className="no-print actions-row">
          <Link href="/member#payments" className="btn secondary">Back to my payments</Link>
          <PrintButton />
        </div>
        <section className="receipt-card">
          <div className="receipt-head">
            <div><h1>Gym Owner Manager</h1><p>Member Payment Receipt</p></div>
            <div className="receipt-number"><span>Receipt No.</span><strong>{payment.receiptNumber}</strong></div>
          </div>
          <div className="receipt-divider" />
          <div className="receipt-grid">
            <div><span>Member</span><strong>{payment.member.user.name}</strong></div>
            <div><span>Member code</span><strong>{payment.member.memberCode || '—'}</strong></div>
            <div><span>Payment date</span><strong>{formatDate(payment.paidAt)}</strong></div>
            <div><span>Payment method</span><strong>{payment.method}</strong></div>
          </div>
          <div className="receipt-amount"><span>Amount received</span><strong>{moneyFromPaise(payment.amountPaise)}</strong></div>
          {payment.note ? <div className="receipt-note"><span>Note</span><p>{payment.note}</p></div> : null}
          <div className="receipt-divider" />
          <div className="info-row"><span>Current outstanding balance</span><strong>{moneyFromPaise(balance.outstandingPaise)}</strong></div>
          <div className="receipt-footer">
            <div><span>Recorded by</span><strong>{payment.createdBy.name}</strong></div>
            <p>This page only loads payment records belonging to the signed-in member.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
