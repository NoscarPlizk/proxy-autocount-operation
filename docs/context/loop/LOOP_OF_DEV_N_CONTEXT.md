# Development and Project Manual Synchronization Loop

## Purpose

This file is the living project manual and required synchronization checklist. Keep it aligned with verified code whenever behavior changes.

## Required workflow

1. Read the applicable project context, plan, instructions, implementation, and tests.
2. Implement the smallest coherent change.
3. Verify the changed behavior.
4. Compare implementation with this manual and the broader context.
5. Synchronize affected routes, shared workflows, limitations, and verification status.
6. Complete only after code and documentation agree.

Use the status labels defined in `docs/AGENTS.md`. Do not describe planned or untested behavior as implemented or environment-tested.

## Shared workflow: company configuration and isolation

- **Primary implementation:** `backend/src/config/company-config.ts`, `backend/src/routes/company-routes.ts`, `backend/src/server.ts`, `backend/.env.example`, `src/context/CompanyContext.tsx`, and `src/api/companyApi.ts`.
- **Status:** **Implemented and locally tested** for environment-presence validation and safe public serialization. No AutoCount credential has been supplied and no vendor call has been environment-tested.
- The backend defines three independent portal companies: `company-one`, `company-two`, and `company-three`. Public names are placeholders until the owner supplies final names.
- One ignored `backend/.env` is expected to contain a root URL, Key ID, and API key for each company. The committed `.env.example` contains placeholders only.
- The first two companies remain independent credential bundles even if they share an AutoCount registered/master account. The third standalone company uses the same configuration shape.
- A company is `configured` only when all three values exist, contain no recognized placeholder markers, and the root URL is an HTTPS URL with a path. No live authentication check is made.
- With no values, status is `configuration_missing`; partial, placeholder, malformed, non-HTTPS, or root-only values produce `configuration_invalid`.
- `GET /api/companies` returns safe display metadata, route slug, presentation accent, configuration status, and a safe status message. It never returns the root URL, Key ID, API key, or environment-variable prefix.
- `GET /api/companies/:companySlug` returns one safe company record or a normalized 404 response. `GET /api/health` reports process health and counts, not credentials.
- Vite proxies `/api` to the local Express backend on `127.0.0.1:3001`. The backend binds to loopback by default.
- The configuration status only proves local values are present and structurally plausible; it does not prove AutoCount accepted them or that permissions are sufficient.
- **Security limitation:** portal authentication and per-user company authorization are not implemented. Do not publish or expose this sample with real credentials.
- **Integration limitation:** there is no centralized AutoCount client, outbound request, persistence, audit trail, or accounting workflow.

## Page: company selection

- **Route:** `/`
- **Purpose:** first-layer selection of one of the three configured company workspaces.
- **Primary implementation:** `src/pages/CompanySelectionPage.tsx`, with shared data loading in `src/context/CompanyContext.tsx` and presentation in `src/App.css`.
- **Status:** **Implemented and build-tested**. Browser visual QA is incomplete because the available embedded browser could not reach the local Windows preview server.

### Features and behavior

- Loads company metadata once from `GET /api/companies` when the provider mounts.
- Displays a card for each backend-defined company with initials, display name, local configuration status, status explanation, and workspace link.
- Configured cards use “Open company”; unconfigured or invalid cards use “Preview workspace.” Preview access is allowed because the current sector pages contain no live accounting action.
- Selecting a card navigates to `/companies/:companySlug` and does not place AutoCount credentials in the URL or browser state.
- Displays a loading panel while the backend request is pending and a visible error panel if the backend is unavailable.
- Company data is not persisted in browser storage. Reloading fetches fresh backend metadata.
- The page is responsive: three columns on wide screens and one column below the tablet breakpoint.

### Limitations

- All three company cards are visible because user authentication and company authorization have not been implemented.
- The “Need help?” element is presentation-only.
- Status is based on local configuration validation, not a live AutoCount connection test.

## Shared layout: selected company workspace

- **Routes:** `/companies/:companySlug` and descendants.
- **Primary implementation:** `src/layouts/CompanyLayout.tsx`, `src/components/ConnectionStatus.tsx`, `src/components/Icon.tsx`, and `src/data/sectors.ts`.
- **Status:** **Implemented and build-tested**.
- Resolves the public slug against backend-provided company metadata. Unknown slugs render the not-found page.
- Provides company-scoped sidebar links for Overview, Sales, Purchase, and Accounting, plus a Switch Company link to `/`.
- Displays the selected company in the sidebar, breadcrumb, connection-status pill, and every nested route.
- The desktop sidebar collapses at tablet width and becomes a horizontal navigation bar on small screens.
- The settings and user-avatar controls are presentation-only; they do not open settings or represent an authenticated user.

## Page: company overview

- **Route:** `/companies/:companySlug`
- **Purpose:** second-layer entry page for the selected company.
- **Primary implementation:** `src/pages/CompanyDashboardPage.tsx` and `src/data/sectors.ts`.
- **Status:** **Implemented and build-tested** as navigation scaffolding.

### Features and behavior

- Displays three main sector cards: Sales, Purchase, and Accounting.
- Sector links preserve company context using `/companies/:companySlug/:sector`.
- When local credentials are not configured, a warning explains the required root URL, Key ID, and API key.
- A recent-activity empty state explicitly states that no AutoCount read or write is performed.
- No accounting data, calculation, database state, approval, audit event, or submission is present.

## Pages: Sales, Purchase, and Accounting sectors

- **Routes:** `/companies/:companySlug/sales`, `/companies/:companySlug/purchase`, and `/companies/:companySlug/accounting`.
- **Purpose:** demonstrate nested company-aware navigation and the intended module grouping.
- **Primary implementation:** `src/pages/SectorPage.tsx` and `src/data/sectors.ts`.
- **Status:** **Implemented and build-tested** as non-interactive module scaffolding.

### Features and behavior

- Sales lists Customers, Quotations, Sales invoices, and Credit notes.
- Purchase lists Suppliers, Purchase orders, Purchase invoices, and Purchase returns.
- Accounting lists Chart of accounts, Journal entries, Cash book, and Knock-off entries.
- Unknown sector values redirect to the selected company overview.
- Unconfigured companies display a warning that live AutoCount actions are unavailable.
- Module tiles are informational only. They do not navigate, retrieve records, stage data, or execute writes.

## Page: not found

- **Route:** any unmatched route or unknown company slug.
- **Primary implementation:** `src/pages/NotFoundPage.tsx`.
- **Status:** **Implemented and build-tested**.
- Displays a concise explanation and a link back to company selection. No recovery state is persisted.

## Verification record — 2026-11-09

- `npm run lint` passed.
- `npm run build:all` passed for frontend and backend.
- A no-credential configuration check returned three `configuration_missing` companies with zero secret field names in the public serialization.
- An isolated sample configuration check changed only Company One to `configured`.
- `git check-ignore -v backend/.env` confirmed the real credential file is ignored.
- `npm audit --omit=dev` reported zero production vulnerabilities.
- The development servers started successfully and printed Vite `http://localhost:5173/` and backend `http://127.0.0.1:3001` addresses.
- Browser visual QA was attempted but not completed because the embedded browser timed out reaching the Windows loopback preview.
