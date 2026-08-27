import { readFileSync, writeFileSync } from 'node:fs';

const sourcePath = 'prisma/schema.prisma';
const targetPath = 'prisma/schema.production.prisma';
const source = readFileSync(sourcePath, 'utf8');

if (!source.includes('provider = "sqlite"')) {
  throw new Error('Expected the local Prisma schema to use SQLite.');
}

const productionSchema = source.replace('provider = "sqlite"', 'provider = "postgresql"');
writeFileSync(targetPath, productionSchema);
console.log(`Prepared ${targetPath} for PostgreSQL production builds.`);
