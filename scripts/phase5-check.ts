import { readFileSync } from 'node:fs';
import { getReportSnapshot, toCsv } from '../src/lib/reporting';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const report = await getReportSnapshot();

  assert(report.totals.collectionPaise === 100000, 'Expected seeded monthly collections to equal ₹1,000.');
  assert(report.totals.expensePaise === 350000, 'Expected seeded monthly expenses to equal ₹3,500.');
  assert(report.totals.netPaise === -250000, 'Net cash must equal collections minus expenses.');
  assert(report.totals.outstandingPaise === 50000, 'Seeded total outstanding dues must equal ₹500.');
  assert(report.totals.overduePaise === 50000, 'Seeded overdue amount must equal ₹500.');
  assert(report.expiring.some((member) => member.memberCode === 'MEM-0001'), 'Demo member should appear in the 30-day expiry report.');

  const csv = toCsv([
    ['Name', 'Note'],
    ['Demo, Member', 'Said "hello"\nnext line']
  ]);
  assert(csv.includes('"Demo, Member"'), 'CSV must quote comma-containing cells.');
  assert(csv.includes('"Said ""hello""\nnext line"'), 'CSV must escape quotes and newlines.');

  const manifest = readFileSync('src/app/manifest.ts', 'utf8');
  const serviceWorker = readFileSync('public/sw.js', 'utf8');
  const productionPrep = readFileSync('scripts/prepare-postgres-schema.ts', 'utf8');

  assert(manifest.includes('/icon-192.svg') && manifest.includes('/icon-512.svg'), 'PWA manifest must declare install icons.');
  assert(manifest.includes("display: 'standalone'"), 'PWA manifest must use standalone display mode.');
  assert(serviceWorker.includes("fetch(event.request, { cache: 'no-store' })"), 'Authenticated navigation must not be served from an application cache.');
  assert(!serviceWorker.toLowerCase().includes('expo'), 'Production service worker must not contain Expo launcher behavior.');
  assert(productionPrep.includes('provider = "postgresql"'), 'Production schema preparation must target PostgreSQL.');

  console.log('Phase 5 report, export and PWA smoke checks passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
