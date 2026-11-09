# AutoCount Operations Proxy

Local React and Express sample for selecting one of three AutoCount companies and keeping that company in every nested portal route.

## Current sample

- `/` — first-layer company selection.
- `/companies/:companySlug` — second-layer company overview.
- `/companies/:companySlug/sales` — Sales sector.
- `/companies/:companySlug/purchase` — Purchase sector.
- `/companies/:companySlug/accounting` — Accounting sector.
- `GET /api/companies` — safe company metadata and local configuration status.
- `GET /api/health` — backend health and configured-company count.

This sample does not call AutoCount or perform accounting reads/writes yet. It only validates whether each company has all three required environment values.

## Environment setup

Copy `backend/.env.example` to `backend/.env`, then replace the placeholders for each company:

```dotenv
AUTOCOUNT_COMPANY_ONE_ROOT_URL=https://accounting-api.autocountcloud.com/<account-book-id>
AUTOCOUNT_COMPANY_ONE_KEY_ID=<key-id>
AUTOCOUNT_COMPANY_ONE_API_KEY=<api-key>
```

Repeat for Company Two and Company Three in the same file. Keep the actual `backend/.env` private. It is ignored by Git and must never be prefixed with `VITE_` or copied into frontend code.

Company display names and public slugs are currently placeholders in `backend/src/config/company-config.ts`. They can be replaced when the real names are confirmed without putting credentials in source code.

## Run locally

```powershell
npm install
npm --prefix backend install
npm run dev
```

The Vite frontend proxies `/api` requests to the local backend on `http://127.0.0.1:3001`.

## Checks

```powershell
npm run lint
npm run build:all
```

## Security boundary

The backend never returns the root URL, Key ID, API key, or environment-variable names to the browser. Portal-user authentication and live AutoCount endpoint calls are deliberately deferred; do not expose this sample publicly with real credentials until authentication and authorization are implemented.
