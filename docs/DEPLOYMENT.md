# Production deployment

## Target architecture

- Next.js application deployed on Vercel over HTTPS
- Managed PostgreSQL database supplied through `DATABASE_URL`
- No Expo runtime or development launcher
- Server-side sessions and role checks remain in the Next.js application
- PWA manifest and service worker are served from the same production domain

## Required production environment

Set `DATABASE_URL` to a managed PostgreSQL connection string. Do not use the local SQLite URL in production.

The repository `vercel.json` uses `npm run build:production`. That command:
1. Generates a PostgreSQL-compatible Prisma schema from the local schema.
2. Generates Prisma Client from the production schema.
3. Applies the schema to the configured PostgreSQL database.
4. Builds the Next.js production application.

The production build does not run the demo seed script.

## First deployment verification

After deployment verify:
- `/` opens the real Gym Owner Manager login/application flow.
- No Expo page or launcher appears.
- Owner/Admin login works using a real production account.
- Member login only exposes that member's records.
- Reports and CSV/backup exports require Owner/Admin authorization.
- PWA install prompt/Add to Home Screen works on supported Android Chrome.
- Offline navigation falls back to the offline page and never exposes cached private financial/member pages.

## Production accounts

Do not use the demo credentials from local development. Create initial production Owner/Admin accounts through a controlled provisioning step after the production database exists.

## Database change note

The current first-deployment workflow uses Prisma `db push` so the existing prototype can be deployed without a migration history. Before long-term multi-version production use, convert schema changes to reviewed Prisma migrations and use `prisma migrate deploy`.
