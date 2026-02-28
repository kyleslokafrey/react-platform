# React Platform

A minimal Next.js boilerplate: App Router · TypeScript · Tailwind v4 · shadcn/ui (57 components) · Neon Postgres · Drizzle ORM. **Dark mode on by default.**

## Stack

- **Next.js** — App Router, `src/` dir, async server components
- **TypeScript** — strict mode
- **Tailwind CSS v4** — dark mode hardcoded via `dark` class on `<html>`
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

This project uses [Neon](https://neon.tech) serverless Postgres exclusively. `.env` is committed to the repo and already contains the project connection strings — no changes needed.

If you need to provision a fresh Neon project:

1. Go to <https://console.neon.tech> and sign in (free tier available).
2. Click **New Project**, name it, pick a region.
3. Open **Connection Details**, copy all the connection variables, and update `.env`.

**Run migrations:**

```bash
npm run db:generate   # generates SQL into ./drizzle/
npm run db:migrate    # applies to Neon
```

Or push the schema directly (skips migration files):

```bash
npm run db:push
```

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
│   │   ├── page.tsx          # Home — async server component + DB query
│   │   ├── loading.tsx       # Automatic skeleton shown during data fetching
│   │   ├── error.tsx         # Error boundary with reset button
│   │   └── not-found.tsx     # 404 page
│   ├── components/
│   │   └── ui/               # All 57 shadcn/ui components
│   ├── db/
│   │   ├── index.ts          # Drizzle client (neon-http)
│   │   └── schema.ts         # messages table schema
│   ├── hooks/
│   │   └── use-mobile.ts     # shadcn mobile hook
│   └── lib/
│       └── utils.ts          # cn() utility
├── .env                      # Neon connection strings (committed)
└── components.json           # shadcn/ui config
```


---

## Canonical Server Action CRUD Pattern

For a concrete App Router server-action example (safe `FormData` parsing, typed early-return validation, Drizzle mutations, and `revalidatePath(...)`), see:

- `docs/server-actions.md`
- `src/app/demo/server-actions/page.tsx`
- `src/app/demo/server-actions/actions.ts`

Run the app and open `/demo/server-actions` to test the form + list revalidation flow.

---

## Deploy to Vercel

1. **Import the repo** at <https://vercel.com/new>. Vercel auto-detects Next.js.
2. **Deploy** — push to `main` or click Deploy. Environment variables are bundled in `.env` and picked up automatically during the Next.js build.

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

---

## Module Configuration Layer

The project now includes a config layer at `src/modules/config` for module-scoped settings and environment mapping.

### Namespaced config shape

`createConfigFromEnv()` returns:

- `modules.llmOpenRouter.apiKey`
- `modules.llmOpenRouter.baseUrl` (defaults to OpenRouter API endpoint)
- `modules.llmOpenRouter.defaultModel`
- `modules.llmOpenRouter.timeoutMs`

### Environment mapping pattern

Environment variables are mapped in one place (`src/modules/config/env.ts`) and validated in one place (`src/modules/config/validate.ts`).

```bash
MODULES_LLM_OPENROUTER_ENABLED=true
OPENROUTER_API_KEY=...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_DEFAULT_MODEL=openai/gpt-4o-mini
OPENROUTER_TIMEOUT_MS=15000
```

Use `OPENROUTER_API_KEY` via environment variables only (e.g., `.env.local`, CI/Vercel secrets) to keep secrets out of source.

### Runtime validation behavior

- Fails fast if `MODULES_LLM_OPENROUTER_ENABLED=true` and no `OPENROUTER_API_KEY` is set.
- Applies safe defaults for `baseUrl`, `defaultModel`, and `timeoutMs`.
- Sanitizes invalid timeout values back to a safe default.

---
