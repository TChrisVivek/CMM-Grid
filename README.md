# CMM Grid

Professional inventory management system for **CMM Electricals**.

Track warehouse stock vs. project-site allocations with EOD batch updates.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| UI Components | Shadcn/UI + Radix UI + Lucide Icons |
| Backend | Spring Boot 3 (Java 21) |
| Database | PostgreSQL |
| HTTP Client | `axios@1.7.9` (pinned — safe against the March 2026 supply-chain attack) |

## Security Notice

> ⚠️ **DO NOT** upgrade axios to `1.14.1` or `0.30.4` — these are malware-infected versions published by North Korean APT "Sapphire Sleet" on March 31, 2026. All npm installs use `--ignore-scripts` to prevent postinstall hook execution.

## Project Structure

```
CMM Grid/
├── frontend/          # Next.js 14 app
│   ├── src/
│   │   ├── app/       # Pages (App Router)
│   │   ├── components/# UI components
│   │   └── lib/       # api.ts, utils.ts, mockData.ts
│   └── .env.local
├── backend/           # Spring Boot (scaffold next)
└── database/
    ├── schema.sql
    └── seed.sql
```

## Getting Started

### Frontend (Development)

```bash
cd frontend
npm install --ignore-scripts   # ALWAYS use --ignore-scripts
npm run dev
# Open http://localhost:3000
```

### Database

```bash
psql -U postgres -d cmm_grid -f database/schema.sql
psql -U postgres -d cmm_grid -f database/seed.sql
```

## Security Audit

After each `npm install`, run:

```bash
npm audit
# Zero critical vulnerabilities expected

# Check for the phantom malware dependency
Select-String "plain-crypto-js" package-lock.json
# Must return no results

# Verify axios version
Select-String '"axios"' package-lock.json -A 2
# Must show "version": "1.7.9"
```
