# AutoCount Operations Proxy

Local React and Express sample that discovers AutoCount company accounts from separate backend environment files and keeps the selected company in every nested portal route.

## Current sample

- `/` — first-layer company selection.
- `/companies/:companySlug` — second-layer company overview.
- `/companies/:companySlug/sales` — Sales sector.
- `/companies/:companySlug/purchase` — Purchase sector.
- `/companies/:companySlug/accounting` — Accounting sector.
- `GET /api/companies` — safe company metadata, discovered-file count, and local configuration status.
- `GET /api/health` — backend health, company-file count, and configured-company count.

This sample does not call AutoCount or perform accounting reads/writes yet. It only validates whether each company has all three required environment values.

## Environment setup

Keep process settings such as `HOST` and `PORT` in `backend/.env` when needed. Company credentials belong in separate files under `backend/company-accounts/`.

Copy `backend/company-accounts/company-name.env.example` to a descriptive filename ending in `.env`, such as `acme-trading.env`, and replace all three placeholders:

```dotenv
AUTOCOUNT_ROOT_URL=https://accounting-api.autocountcloud.com/<account-book-id>
AUTOCOUNT_KEY_ID=<key-id>
AUTOCOUNT_API_KEY=<api-key>
```

Create one file per company/account book. The filename is converted into the public name and route slug: `acme-trading.env` becomes “Acme Trading” at `/companies/acme-trading`. Reload the first portal page after adding a file.

Actual files in `backend/company-accounts/*.env` are ignored by Git. Never prefix these values with `VITE_` or copy them into frontend code.

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
npm --prefix backend test
```

## Security boundary

The backend rescans the company-account directory for each metadata request but never returns the root URL, Key ID, API key, configuration filename, or environment-variable names to the browser. A company workspace link is enabled only after local structural validation. This does not authenticate against AutoCount. Portal-user authentication and live AutoCount endpoint calls are deliberately deferred; do not expose this sample publicly with real credentials until authentication and authorization are implemented.
