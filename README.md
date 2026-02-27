# Minimal Next.js + shadcn/ui + Neon + Drizzle Boilerplate

This repo is a bare-minimum starter that includes:

- Next.js App Router + TypeScript (`src/` layout)
- Tailwind CSS
- shadcn/ui scaffold in `src/components/ui`
- Neon Postgres via `@neondatabase/serverless`
- Drizzle ORM + Drizzle Kit migrations

## 1) Local setup

```bash
npm install
cp .env.local.example .env.local
```

Set `DATABASE_URL` in `.env.local`.

Then run:

```bash
npm run db:generate
npm run db:migrate
npm run dev
```

Open http://localhost:3000.

## 2) Create a Neon database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project/database.
3. Copy the connection string.
4. Ensure SSL is enabled (`?sslmode=require`).

## 3) Configure DATABASE_URL

### Local

Set in `.env.local`:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB_NAME?sslmode=require
```

### Vercel

In Vercel Project Settings → Environment Variables, add:

- `DATABASE_URL` = your Neon connection string

No extra Vercel config is required.

## 4) Run migrations

Generate migration SQL from schema:

```bash
npm run db:generate
```

Apply migrations:

```bash
npm run db:migrate
```

Schema location: `src/db/schema.ts`

## 5) Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import project into Vercel.
3. Add `DATABASE_URL` in Vercel env vars.
4. Deploy.

Vercel will run the normal Next.js build and serve the App Router project.

## Key structure

```text
.
├─ drizzle.config.ts
├─ drizzle/
│  ├─ 0000_init_messages.sql
│  └─ meta/
├─ src/
│  ├─ app/
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ components/
│  │  └─ ui/
│  ├─ db/
│  │  ├─ index.ts
│  │  └─ schema.ts
│  └─ lib/
│     └─ utils.ts
└─ .env.local.example
```
