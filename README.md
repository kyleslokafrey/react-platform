# React Platform

A minimal Next.js boilerplate: App Router · TypeScript · Tailwind v4 · shadcn/ui (57 components) · Neon Postgres · Drizzle ORM. **Dark mode on by default.**

## Stack

- **Next.js** — App Router, `src/` dir, async server components
- **TypeScript** — strict mode
- **Tailwind CSS v4** — dark mode via `class` strategy; `dark` class on `<html>`
- **shadcn/ui** — all 57 components in `src/components/ui/`
- **Neon** — serverless Postgres (`@neondatabase/serverless`)
- **Drizzle ORM** — type-safe queries + `drizzle-kit` for migrations

---

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the database

Choose one of two options:

---

#### Option A — Local Docker (recommended for dev)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

**Start the database:**

```bash
docker compose up -d
```

This starts a `postgres:17-alpine` container on port `5432` with a persistent named volume (`pgdata`). Stop it any time with `docker compose down`.

**Set the connection string:**

```bash
cp .env.local.example .env.local
```

The example already contains the correct local URL — no edits needed:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/react_platform_dev
```

**Push the schema:**

```bash
npm run db:push   # creates tables in the local DB (no migration files generated)
```

---

#### Option B — Neon Cloud

1. Go to <https://console.neon.tech> and sign in (free tier available).
2. Click **New Project**, name it, pick a region.
3. Open **Connection Details** and copy the **Connection string**.
4. Copy the example env file and fill in your connection string:

```bash
cp .env.local.example .env.local
```

```env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Run migrations:**

```bash
npm run db:generate   # generates SQL into ./drizzle/
npm run db:migrate    # applies to your Neon database
```

---

### 3. Seed sample data (optional)

```bash
npm run db:seed
```

### 4. Start the dev server

```bash
npm run dev
```

Open <http://localhost:3000>. The home page queries the `messages` table and renders rows inside a shadcn `<Card>`.

---

## Project Structure

```
.
├── drizzle/                  # Generated migration SQL
├── drizzle.config.ts         # Drizzle Kit config
├── src/
│   ├── app/
│   │   ├── globals.css       # Tailwind v4 + shadcn CSS variables
│   │   ├── layout.tsx        # Root layout — dark class + TooltipProvider
│   │   └── page.tsx          # Home — async server component + DB query
│   ├── components/
│   │   └── ui/               # All 57 shadcn/ui components
│   ├── db/
│   │   ├── index.ts          # Drizzle client (neon-http)
│   │   └── schema.ts         # messages table schema
│   ├── hooks/
│   │   └── use-mobile.ts     # shadcn mobile hook
│   └── lib/
│       └── utils.ts          # cn() utility
├── .env.local                # NOT committed to git
├── .env.local.example        # Template — copy to .env.local
└── components.json           # shadcn/ui config
```

---

## Deploy to Vercel

No config changes needed — just set one environment variable.

1. **Import the repo** at <https://vercel.com/new>. Vercel auto-detects Next.js.
2. **Add the environment variable** before deploying:
   - Key: `DATABASE_URL`
   - Value: your Neon connection string
   - Path: Project → Settings → Environment Variables
3. **Deploy** — push to `main` or click Deploy.

> The Neon serverless HTTP driver works on Vercel serverless functions with zero extra runtime configuration.

---

## Available Scripts

```
npm run dev           Dev server at localhost:3000
npm run build         Production build
npm run start         Production server
npm run lint          ESLint
npm run db:push       Push schema directly to local DB (no migration files)
npm run db:seed       Insert sample data into the database
npm run db:generate   Generate Drizzle migration SQL from schema
npm run db:migrate    Apply pending migrations
```

**Docker Compose (local dev DB):**

```
docker compose up -d   Start the local Postgres container
docker compose down    Stop and remove the container (data is preserved in pgdata volume)
docker compose down -v Remove the container AND wipe all local DB data
```

---