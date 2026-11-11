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

## Shared guardrail: human-only live AutoCount activation and interactive controls

- **Status:** **Confirmed requirement and documentation-synchronized** on 2026-11-10. Enforcement code is **not implemented** because no AutoCount adapter, live route, or accounting interaction exists yet.
- AI agents and automated tests must never execute requests against a real AutoCount endpoint or account book, including read-only requests. Automated coverage must use mocks, local fixtures, or a local fake service and must be unable to load live credentials or reach the vendor host.
- Only an authorized programmer may manually execute a live AutoCount check. AI may prepare the implementation, impact report, mock coverage, and manual checklist, then must stop before the request is sent.
- Before any AutoCount-connected backend path or frontend interactive trigger is implemented or changed, explain the API activation impact report defined in `docs/context/PROJECT_CONTEXT.md` to the project owner.
- The report and manual checklist must identify the full UI-to-backend-to-adapter-to-endpoint chain, account book and data scope, permissions, payload/response, expected effect, processing/timing evidence, timeout/rate-limit/concurrency/retry behavior, validation, confirmation, audit, verification, failure/unknown handling, reversibility, and stop conditions.
- External duration is not guaranteed. Separate documentation facts, programmer-measured observations, estimates, configured timeouts, and unknowns.
- Buttons, links, forms, keyboard shortcuts, bulk/retry controls, and automatic UI effects that can initiate AutoCount work are part of the accounting safety boundary. They must show company/account-book context and consequences, respect feature/permission/validation/review gates, prevent double submission, use risk-proportional confirmation, and render truthful pending/success/failure/partial/conflict/unknown states.
- The current module tiles and other controls remain presentation-only and perform no AutoCount operation. Future page sections must record each interactive control's trigger path and guard state when behavior is added.
- Only sanitized evidence returned from a programmer-performed manual check may be recorded as **Environment-tested**, with operator, date/time, account book/environment, target scope, actual duration, outcome, verification, and cleanup/reconciliation.

## Shared workflow: company configuration and isolation

- **Primary implementation:** `backend/src/config/company-config.ts`, `backend/src/routes/company-routes.ts`, `backend/src/server.ts`, `backend/company-accounts/`, `src/context/CompanyContext.tsx`, and `src/api/companyApi.ts`.
- **Status:** **Implemented and locally tested** for directory discovery, environment-presence validation, rescanning, and safe public serialization. No AutoCount credential has been supplied and no vendor call has been environment-tested.
- The backend scans `backend/company-accounts/` and defines one portal company for every file ending in `.env`. Non-environment files and the committed `.env.example` template are not counted.
- Each ignored company file independently contains `AUTOCOUNT_ROOT_URL`, `AUTOCOUNT_KEY_ID`, and `AUTOCOUNT_API_KEY`; the shorter `ROOT_URL`, `KEY_ID`, and `API_KEY` aliases are also accepted. The filename derives the public display name and stable route slug.
- Credential files remain independent even when companies share an AutoCount registered/master account. `backend/.env` is reserved for local process settings such as host and port.
- A company is `configured` only when all three values exist, contain no recognized placeholder markers, and the root URL is an HTTPS URL with a path. No live authentication check is made.
- With no values, status is `configuration_missing`; partial, placeholder, malformed, non-HTTPS, or root-only values produce `configuration_invalid`.
- `GET /api/companies` rescans the directory and returns safe display metadata, route slug, presentation accent, configuration status, company-file count, configured-company count, and a safe status message. It never returns the root URL, Key ID, API key, configuration filename, or environment-variable names.
- `GET /api/companies/:companySlug` returns one safe company record or a normalized 404 response. `GET /api/health` reports process health and counts, not credentials.
- Vite proxies `/api` to the local Express backend on `127.0.0.1:3001`. The backend binds to loopback by default.
- The configuration status only proves local values are present and structurally plausible; it does not prove AutoCount accepted them or that permissions are sufficient.
- **Security limitation:** portal authentication and per-user company authorization are not implemented. Do not publish or expose this sample with real credentials.
- **Integration limitation:** an invoice-listing-only AutoCount client and outbound GET path now exist. There is no portal authentication, persistence, audit trail, customer adapter, individual invoice retrieval, or write workflow. Do not expose this local sample publicly while real credentials are configured.

## Page: company selection

- **Route:** `/`
- **Purpose:** first-layer selection of the company workspaces discovered from backend company-account files.
- **Primary implementation:** `src/pages/CompanySelectionPage.tsx`, with shared data loading in `src/context/CompanyContext.tsx` and presentation in `src/App.css`.
- **Status:** **Implemented and build-tested**. Browser visual QA is incomplete because the available embedded browser could not reach the local Windows preview server.

### Features and behavior

- Loads company metadata once from `GET /api/companies` when the provider mounts; reloading the portal rescans the backend directory.
- Displays the number of accessible company accounts and detected configuration files.
- Displays a card for each discovered `.env` file with filename-derived initials and display name, local configuration status, status explanation, and workspace state.
- Configured cards use an active “Open company” link. Missing or invalid configuration files use a disabled “Complete configuration” control, and direct workspace navigation is blocked.
- Selecting a card navigates to `/companies/:companySlug` and does not place AutoCount credentials in the URL or browser state.
- Displays a loading panel while the backend request is pending and a visible error panel if the backend is unavailable.
- Company data is not persisted in browser storage. Reloading fetches fresh backend metadata.
- The page is responsive: three columns on wide screens and one column below the tablet breakpoint.

### Limitations

- Every discovered company card is visible because user authentication and per-user company authorization have not been implemented.
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

## Page: Sales invoices

- **Route:** `/companies/:companySlug/sales`.
- **Purpose:** retrieve and display sales invoice listings for the selected company using the documented AutoCount GET-only simple invoice listing operation.
- **Primary implementation:** `src/pages/SalesPage.tsx`, `src/api/invoiceApi.ts`, `src/utils/invoiceFormatting.ts`, `backend/src/routes/invoice-routes.ts`, `backend/src/services/invoice-service.ts`, and `backend/src/integrations/autocount/`.
- **Status:** **Implemented, build-tested, and mock-tested** on 2026-11-11. It is not **Environment-tested**; no AI or automated process made a live request.

### Features, data flow, and controls

- On mount, the page requests invoices from the first day of the user's current local calendar month through the current local date.
- The start/end date inputs and “Fetch invoices” button trigger `GET /api/companies/:companySlug/invoices?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` through the named frontend API function. Both dates are required, start must not follow end, and the inclusive range is limited to 366 days in the frontend and backend.
- While a request is pending, the date controls and button are disabled to prevent duplicate activation. Changing inputs alone does not call AutoCount; submitting the form does.
- The backend resolves the selected company independently, rejects unknown/unconfigured companies, and calls the named `getInvoiceListing` adapter function. The adapter performs only vendor `GET /{accountBookId}/invoice/listing` requests and supplies `page`, `startDate`, `endDate`, `API-Key`, and `Key-ID`.
- Each vendor page has a 15-second timeout. Pages are requested sequentially until `totalCount` is reached, with a ceiling of 100 pages/10,000 invoices. No automatic retry is performed. A range above the ceiling is rejected and must be narrowed.
- The response is validated against the fixture's root, invoice master, and details structure before it is returned. The UI displays invoice number, document date, customer name/code, status, cancellation state, currency/final total, and outstanding amount; no financial recalculation is performed.
- Loading, empty, validation, normalized authorization/rate-limit/timeout/upstream/malformed-response errors, and successful result-count states are visible. Vendor error bodies and credentials are never returned to the browser.
- The page explicitly states that create, edit, void, and delete actions do not exist. There is no generic outbound request route or write method.

### Limitations and permissions

- The AutoCount key should have only the invoice-listing GET permission. The code cannot verify the key's configured vendor permissions without a programmer-run live check.
- Portal-user authentication and per-user company authorization remain unimplemented. The Express service binds to loopback by default; do not deploy or expose it with real credentials until backend authentication/authorization is added.
- The full validated invoice objects are returned to the browser even though the current table displays only summary fields. Browser storage and a database are not used.
- External latency, rate-limit policy/headers, configured-account behavior, and production result shape remain **Unverified**.

### Manual GET-only connectivity procedure

Only an authorized programmer may perform this procedure. AI agents, automated tests, browser automation, and CI must stop before the live request.

1. Confirm the selected account book/environment, the operator identity, and that the configured key has invoice-listing GET permission only. Stop if the account book is wrong, the key has unnecessary write permissions, or the portal is reachable beyond the intended local/internal boundary.
2. Start the portal and backend manually, open the selected company's Sales page, and note the date/time and initial current-month range. Opening the page performs one or more read-only invoice-listing GET requests.
3. Use a narrow range known to contain few invoices. Select “Fetch invoices” once; do not repeatedly submit during a pending request. Stop on any unexpected route/method, credential exposure, non-GET traffic, more pages than expected, or vendor warning.
4. Record sanitized evidence only: operator, date/time, account book/environment label, date range, endpoint/method, page count, returned count and field names (not customer data), actual duration, HTTP outcome, relevant rate-limit headers with sensitive values removed, UI state, and whether the displayed count matches AutoCount.
5. Test an empty narrow date range and, if safely available, a known multi-page range. Stop if rate limiting occurs; do not automate retries.
6. Return the sanitized evidence for documentation. No cleanup is expected because the operation is GET-only, but any unexpected change must be treated as an incident and reconciled in AutoCount before further use.

## Pages: Purchase and Accounting sectors

- **Routes:** `/companies/:companySlug/purchase` and `/companies/:companySlug/accounting`.
- **Purpose:** demonstrate nested company-aware navigation and the intended module grouping.
- **Primary implementation:** `src/pages/SectorPage.tsx` and `src/data/sectors.ts`.
- **Status:** **Implemented and build-tested** as non-interactive module scaffolding.

### Features and behavior

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

## Documentation synchronization record — 2026-11-10

- Added the confirmed human-only live AutoCount testing rule and prohibited AI/automated live calls for reads and writes.
- Added the mandatory API activation impact report and programmer-only manual evidence requirements.
- Extended the guardrail to every interactive frontend control capable of triggering an AutoCount-connected backend workflow.
- Synchronized `docs/AGENTS.md`, `docs/context/PROJECT_CONTEXT.md`, `docs/context/IMPLEMENTATION_PLAN.md`, and this manual. No application code or AutoCount data was changed.
- Replaced the three hard-coded company bundles with directory-based discovery of independent ignored `.env` files.
- Added safe counts, an empty-directory state, credential-validation gating, and direct-route blocking for incomplete company files.
- Added mock-only backend tests for empty, valid, invalid, newly added, ignored non-`.env`, and secret-redaction behavior. No AutoCount request was made.

## Verification and synchronization record — 2026-11-11

- Reviewed the official AutoCount Getting Started, simple invoice listing, invoice view model, and Swagger pages and recorded the GET contract and stricter local limits.
- Added the invoice-listing-only backend route, service, adapter, fixture validation, pagination, timeout, and normalized errors; no generic request method or write operation was added.
- Replaced the Sales navigation sample with the current-month-on-mount invoice listing, date-range form, pending/error/empty/success states, and read-only invoice table.
- `npm run lint`, `npm run build:all`, and `npm --prefix backend test` passed. Seven backend tests passed, including four invoice adapter/range tests using injected mock fetch implementations and the committed sample fixture.
- No live AutoCount request, environment test, browser automation against the configured account, or accounting data mutation was performed.
