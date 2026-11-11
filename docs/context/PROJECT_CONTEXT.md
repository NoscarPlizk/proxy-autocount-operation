# AutoCount Operations Proxy — Project Context

**Context version:** 2026-11-11
**Implementation status reviewed:** 2026-11-10
**Official API documentation reviewed:** 2026-11-11

This is the primary durable context for the project. Future development sessions must read it together with the repository implementation, `docs/AGENTS.md`, `docs/context/AUTOCOUNT_API_CONTEXT.md`, and `docs/context/IMPLEMENTATION_PLAN.md`.

## 1. Project overview and business motivation

AutoCount Operations Proxy is an internal web application for authorized company administrators. It will provide safer and more efficient bulk preparation, validation, review, submission, and editing of records held in the company's existing AutoCount Cloud Accounting account.

The company has several months of accounting data to enter or correct. Current workflows require repetitive record preparation, master-data lookup, dependency checking, matching, document-by-document editing, and error recovery. The proxy is intended to reduce this administrative work while preserving accounting integrity.

The central boundary is non-negotiable: **AutoCount Cloud Accounting remains the authoritative accounting system. This project is an operational productivity and integration layer, not a replacement accounting system.**

## 2. Classification conventions

This document uses the following labels:

- **Confirmed requirement** — explicitly required for the project.
- **Proposed decision** — an initial architectural recommendation that may be refined before implementation.
- **Documentation-verified** — confirmed in official AutoCount documentation as reviewed on the date above; it has not necessarily been exercised with company credentials.
- **Environment-tested** — observed in an authorized programmer-performed manual live check, with operator, account book/environment, date/time, target scope, and verification evidence recorded. There are currently no environment-tested AutoCount behaviors.
- **Implemented and tested** — present in the repository and verified by the stated check.
- **Unverified** — requires more documentation review, vendor clarification, or controlled testing.

## 3. Problems the software must solve

**Confirmed requirements:**

1. Prepare many sales invoices, purchase invoices, cash book entries, and related records without repetitive single-form entry.
2. Import Excel/CSV data into a reviewable staging area and allow spreadsheet-style correction.
3. Confirm referenced master data exists before dependent transactions are submitted.
4. Match customers and suppliers without relying on names alone, and route ambiguous matches to a person.
5. Detect invalid, missing, duplicate, and potentially duplicate records before writes.
6. Edit multiple existing documents with original-versus-proposed comparison and individual outcomes.
7. Handle partial success without re-submitting successful records.
8. Assist with outstanding-document knock-offs and payment allocations under stricter controls.
9. Preserve a searchable history of who initiated and approved operations, what was proposed, and what AutoCount returned.
10. Support later productivity and internal-system integrations without tightly coupling all modules.

## 4. Users and responsibilities

Initial users are authorized company administrative staff.

Administrators are responsible for:

- selecting the correct AutoCount account book;
- supplying and correcting source data;
- resolving missing or ambiguous master-data dependencies;
- reviewing duplicates and validation warnings;
- confirming high-impact financial values and allocations;
- approving batches within their permissions;
- monitoring per-record outcomes; and
- investigating unresolved or unknown results before retrying.

**Unverified product decision:** whether preparer, reviewer, approver, and system administrator must be separate roles at launch. The backend authorization model must allow this separation even if the first release uses fewer roles.

## 5. Scope and non-goals

### In scope

- customer and supplier master-data lookup, matching, authorized creation, and supported edits;
- sales invoice import, retrieval, validation, creation, and safe supported edits;
- purchase invoice import, retrieval, validation, creation, and safe supported edits;
- cash book receipt/payment preparation, retrieval, validation, and safe supported edits;
- outstanding transaction retrieval and carefully controlled knock-off/payment allocation assistance;
- file parsing, staging, correction, dependency resolution, duplicate detection, approval, processing, verification, audit, export, and selective recovery;
- optionally generating validated AutoCount-compatible import files where that is safer or more practical than API submission; and
- future integration with the company's internal business management software.

### Non-goals

- replacing AutoCount or maintaining a parallel general ledger;
- calculating final accounting truth independently of AutoCount;
- direct access to or modification of AutoCount's internal database;
- bypassing accounting locks, permissions, tax/e-Invoice rules, or vendor validation;
- unattended guesses for customer, supplier, document, or allocation identity;
- automatic deletion or voiding of documents;
- assuming collections of API writes are atomic; and
- exposing AutoCount credentials to the browser.

## 6. Relationship with AutoCount Cloud Accounting

AutoCount is the system of record. The proxy may hold operational copies needed for staging, review, comparison, mapping, job state, and audit, but those copies do not become authoritative accounting records.

All integration traffic must originate from the backend through one centralized adapter. The adapter is responsible for authentication headers, endpoint paths, request/response mapping, pagination, timeouts, error normalization, rate-limit signals, logging redaction, and controlled retry behavior.

No write is considered successful merely because the request was sent or a connection closed. The workflow must classify the outcome and verify the remote state using a documented method. A timeout after sending a write is an **unknown outcome**, not an automatic failure eligible for blind retry.

### 6.1 Human-only live API activation and testing guardrail

**Confirmed requirements (2026-11-10):**

- AI agents and automated tests must never execute a request against a real AutoCount API endpoint or account book for discovery, experimentation, verification, or feature testing. This prohibition applies to reads as well as create, update, delete, void, approval, allocation, knock-off, and every other operation that can retrieve or affect real AutoCount data.
- Automated unit, component, contract, and end-to-end coverage may exercise only mocks, local fixtures, or a local fake AutoCount service that is structurally prevented from resolving or connecting to the vendor host. Automated tests must not accept or load live AutoCount credentials.
- Any live AutoCount check must be performed manually by an authorized programmer. AI may prepare code, review official documentation, produce a manual test procedure, and analyze sanitized results supplied by the programmer, but it must stop before executing the live request.
- A programmer-performed live check must identify the operator, date/time, exact account book, environment/data classification, endpoint and method, target records or filters, sanitized request shape, expected effect, actual duration, outcome, verification evidence, and any cleanup or reconciliation. Only the behavior actually observed may be labelled **Environment-tested**.
- Absence of a sandbox does not weaken this rule. If no safe non-production account book exists, routine automated coverage remains mock-only and any owner-approved manual test against a real account book must use the narrowest operation, scope, credentials, and dataset possible. A write operation must not be performed merely to discover what the API does.
- No production or real-data operation may be described as a harmless test. Production writes are controlled business operations and require the same validation, authorization, audit, and verification as normal use.

Before implementing or changing any feature that can activate AutoCount, development must produce an **API activation impact report** and explain it to the project owner. The report must state:

1. the user action, frontend control, backend route/use case, adapter function, HTTP method, and exact documented AutoCount endpoint involved;
2. whether the operation only reads or may create, modify, delete, void, approve, allocate, submit, or otherwise affect data;
3. the account-book scope, record types, identifiers, filters, request fields, related records, and data returned or changed;
4. authentication and API-method permissions, application authorization, feature flags, and environment/account-book guards;
5. expected processing behavior and duration where evidence exists, configured timeout/cancellation behavior, rate-limit handling, concurrency, retries, and unknown-outcome handling;
6. validation, duplicate protection, stale-data/conflict checks, review and confirmation requirements, audit events, and post-operation verification;
7. failure, partial-success, reversibility, cleanup, reconciliation, and incident risks;
8. mock/fixture test coverage and the technical control proving automated tests cannot reach AutoCount; and
9. the exact human-only manual test procedure, including stop conditions and evidence the programmer must return.

External API latency cannot be guaranteed exactly in advance. Reports must distinguish documented limits, measured programmer-supplied observations, estimates, configured timeouts, and unknowns rather than claiming a false 100% duration guarantee.

Frontend controls are part of the same safety boundary. Any button, link, form submission, keyboard shortcut, bulk action, retry control, or automatic UI effect that can reach a backend AutoCount workflow must:

- have its full frontend-to-backend-to-AutoCount trigger path documented in the impact report;
- state the selected company/account book and operation consequence clearly before activation;
- prevent accidental double submission and remain disabled when permissions, configuration, validation, review, or feature gates are incomplete;
- use deliberate confirmation proportional to impact, with stronger controls for writes and destructive/high-impact actions;
- expose pending, succeeded, failed, partial, conflict, and unknown states without implying success before backend verification; and
- never call AutoCount directly or treat a presentation-only control as an implemented operation.

For every future development task that introduces or changes such a backend path or interactive control, the AI must explain these effects and safeguards to the project owner before implementation and summarize the implemented boundary at handoff.

## 7. Core functional modules

### 7.1 Customer and supplier master data

- Retrieve and search master records and identifiers.
- Match incoming data using multiple signals, such as code, registration/tax identifier, email, phone, and normalized name where available and legally appropriate.
- Score or explain possible matches without auto-accepting ambiguity.
- Create missing records only when required information is complete and an authorized administrator approves.
- Maintain reviewed mappings between source identities and AutoCount identifiers.
- Detect likely duplicates before creation or update.

### 7.2 Sales invoice management

- Stage and validate bulk invoices and their detail rows.
- Resolve customer and other documented master-data dependencies.
- Detect possible duplicates using a documented business key and supporting signals.
- Retrieve, filter, select, compare, edit, and verify existing invoices.
- Preserve unrelated header and detail data during updates.

### 7.3 Purchase management

- Stage and validate bulk purchase invoices.
- Resolve supplier and other documented dependencies.
- Retrieve, compare, safely edit, submit, and verify purchase invoices.

### 7.4 Cash book management

- Prepare receipt and payment documents in bulk.
- Validate bank/cash accounts and any applicable party references.
- Distinguish general-ledger cash book postings from debtor/creditor settlements.
- Keep detail totals and payment totals consistent according to documented rules.
- Retrieve and safely edit supported existing records.

### 7.5 Knock-off and payment allocation

- Retrieve outstanding receivables/payables eligible for allocation.
- Match invoices, credits, receipts, and payments conservatively.
- Validate sign, currency, amount, eligibility, and current outstanding balance.
- Detect settled or previously allocated items.
- Present the complete proposed allocation before approval.
- Re-read relevant balances immediately before submission and verify remaining balances afterward.

This is a high-risk module and must not be the first write implementation.

### 7.6 Import and update history

- Record job type, account book, initiator, reviewer/approver where applicable, timestamps, and state transitions.
- Track every input row/document separately through validation and submission.
- Preserve appropriate source, normalized, original, and proposed values under a defined retention policy.
- Record sanitized requests/outcomes and AutoCount identifiers without secrets.
- Support investigation, export, and selective retry/reconciliation.

## 8. Required workflows

### 8.1 Bulk import workflow

1. Upload an allowed Excel/CSV file.
2. Parse it without executing formulas or macros.
3. Map columns to a versioned import schema.
4. Normalize rows while preserving source provenance.
5. Validate field formats and required values.
6. Determine record type and documented dependencies.
7. Query AutoCount/read-through cached master data.
8. Flag missing, conflicting, ambiguous, duplicate, and possibly duplicate records.
9. Allow grouped correction and reviewed dependency resolution.
10. Revalidate the whole candidate set.
11. Freeze a review snapshot and show the proposed operations.
12. Obtain authorized approval.
13. Claim the batch once to prevent concurrent submission.
14. Process and track records individually with controlled pacing.
15. Verify remote results and classify each outcome.
16. Export/report successful, failed, skipped, unresolved, and unknown records.

### 8.2 Bulk edit workflow

1. Search and retrieve current AutoCount documents.
2. Select documents and capture a base snapshot with modification metadata where available.
3. Edit allowed fields in a spreadsheet-style interface.
4. Validate field-specific and cross-field rules.
5. Show original-versus-proposed values, including detail-row effects.
6. Require enhanced review for high-impact fields.
7. Re-read the document before submitting and detect conflicts.
8. Build a minimal documented update payload that preserves all unrelated data.
9. Submit each record independently unless an official atomic batch method is later verified.
10. Retrieve and compare the updated record.
11. Record per-record success, failure, conflict, or unknown outcome.

### 8.3 Dependency workflow

1. Identify the transaction type.
2. Apply that type's dependency rules; do not assume every cash entry needs a customer/supplier.
3. Retrieve possible dependencies from AutoCount.
4. Resolve exact matches and present ambiguous/no-match cases.
5. Create missing master data only after completeness checks and authorization.
6. Verify the new master record exists.
7. Revalidate dependent transactions before approval.

## 9. Validation and data-integrity rules

**Confirmed requirements:**

- A name alone is insufficient for automatic customer/supplier matching.
- Ambiguous identities require administrator review.
- Missing references block dependent writes.
- Duplicates and possible duplicates must be surfaced before submission.
- A batch is a collection of independently tracked operations unless AutoCount documents an atomic batch endpoint.
- Successful records must be excluded from partial-failure retry.
- Unknown outcomes must be reconciled before retry.
- Concurrent submissions of the same approved batch must be prevented.
- Changes to amount, tax, account, date, and allocation fields require additional review.
- A record changed remotely after review must be treated as a conflict, not silently overwritten.
- Unrelated invoice/payment details must be preserved.
- AutoCount rejections, locks, and permissions are authoritative and must not be bypassed.

**Proposed decision:** represent record state with an explicit state machine, for example `uploaded -> parsed -> needs_resolution|invalid|ready -> reviewed -> approved -> processing -> succeeded|failed|unknown|skipped|conflict`, with guarded transitions and append-only event history.

**Proposed decision:** use a deterministic operation fingerprint derived from account book, operation type, stable source key, and normalized business identifiers. This is a duplicate-prevention aid, not proof that AutoCount provides native idempotency.

## 10. AutoCount API integration knowledge

`docs/context/AUTOCOUNT_API_CONTEXT.md` is the mandatory entry point for AutoCount API work. The current official documentation at <https://accounting-api.autocountcloud.com/documentation/> is the source of truth for published API rules, with the official Swagger reference as its technical supplement. The facts below are dated summaries only; re-check the exact current official endpoint, field-format, and data-model pages before relying on them.

### 10.1 Documentation-verified as of 2026-11-11

The following statements are supported by the official documentation reviewed during initialization. They are not yet tested with company credentials:

- Requests require `API-Key` and `Key-ID` headers.
- Requests with bodies use JSON and require `Content-Type: application/json`.
- API keys can be scoped to selected methods and associated with an account-book user; newly created keys default to all permissions and must be reduced deliberately.
- The official catalog publishes get/list/create/update/delete methods for debtors (customers) and creditors (suppliers).
- The catalog publishes simple/specific listing, get, create, update, delete, knock-off-detail, and void methods for invoices, payments (cash book entries), and purchase invoices.
- The catalog publishes list/get/create/update/delete methods and an outstanding-transactions retrieval method for knock-off entries.
- Simple invoice listing is paginated at no more than 100 records per page and accepts date filters.
- Invoice creation is a single-document `POST /{accountBookId}/invoice`; its documented success response is HTTP 201 with a location header.
- Invoice update is a single-document `PUT /{accountBookId}/invoice` selected by `docNo`; its documented success response is HTTP 204.
- For invoice update master fields, omitted fields retain their value while explicitly blank values remove existing values.
- Invoice detail updates are positional. Supplying fewer detail array elements than currently exist removes rows; row order controls which detail is updated.
- Payment updates have similar positional detail-array warnings, and documented payment detail totals must tally with payment amounts.
- Outstanding knock-off transactions can be retrieved for an account code and cutoff document date.

Official references:

- <https://accounting-api.autocountcloud.com/documentation/>
- <https://accounting-api.autocountcloud.com/documentation/category/api-references/>
- <https://accounting-api.autocountcloud.com/documentation/api-methods/invoice/update-invoice/>
- <https://accounting-api.autocountcloud.com/documentation/api-methods/payment/update-payment/>
- <https://accounting-api.autocountcloud.com/documentation/api-methods/knockoff-entry/get-outstanding-knockoff-transactions/>
- <https://accounting-api.autocountcloud.com/swagger/index.html>

### 10.2 Not yet verified

- Company credentials, account-book identifiers, enabled modules, and exact permissions.
- Whether a dedicated sandbox/test account book is available and how closely it matches production configuration.
- Endpoint behavior for every planned field and document state.
- Validation and response behavior for locked periods, approved documents, e-Invoice states, and permissions.
- Rate-limit policy beyond example response headers, including quotas by key/account/book and recommended backoff.
- Native idempotency support or request keys.
- Concurrency/version preconditions, ETags, or reliable last-modified conflict semantics.
- Timeout behavior and the strongest reconciliation lookup for each write.
- Bulk endpoint or atomicity support for any planned operation. Until verified otherwise, assume none.
- Excel import template formats and whether generated files can cover all target modules safely.
- Update semantics for document types other than the specifically reviewed invoice/payment documentation.
- Error schema/status coverage beyond published examples.
- Data retention, audit access, and API availability/service expectations.

Any write implementation must review the exact endpoint page, input model, error behavior, and relevant document restrictions again at implementation time.

## 11. Proposed technical architecture

This proposal preserves the existing React/TypeScript/Vite scaffold and adds backend boundaries incrementally.

```text
Browser (React + TypeScript)
        |
        | application HTTPS API; no AutoCount secrets
        v
Express backend
  controllers/routes
        v
application services / workflow state machines
        |--------------------|
        v                    v
validation/matching      job processor
        |                    |
        |----------|---------|
                   v
          AutoCount adapter  ----> AutoCount Cloud Accounting API
                   |
                   v
        PostgreSQL operational store
        (staging, mappings, jobs, audit; not a ledger)
```

### Suggested repository layout

```text
src/                         React application (already present)
backend/                     exclusive root for all backend code
  company-accounts/            ignored per-company `.env` credential files and committed template
  src/
    config/                  validated backend configuration
    http/                    Express setup, middleware, controllers
    application/             use cases and workflow orchestration
    domain/                  validation, matching, state rules
    integrations/autocount/  one AutoCount client/adapter
    jobs/                    controlled per-record processing
    persistence/             repositories and transaction boundaries
  test/                      backend unit/contract/mock-integration tests
shared/                      narrowly scoped shared transport contracts
db/migrations/               versioned schema changes when DB is introduced
docs/
  AGENTS.md                  durable agent instructions
  context/                   project context and implementation plans
```

### Technology direction

- **Existing and implemented:** React 19, TypeScript, Vite, React Router, Node.js, and Express.
- **Confirmed preference:** React-Bootstrap, React Router, Node.js, Express, and PostgreSQL when persistence is required.
- **Confirmed repository boundary:** all backend code must live under the repository-root `backend/` folder. This includes backend server and root entry files, routes and endpoint modules, configuration, middleware, controllers, services, domain logic, integrations, jobs, persistence code, backend-only helpers, and backend tests. Do not place backend implementation files elsewhere in the repository.
- **Proposed decision:** use TypeScript in both frontend and backend for consistent contracts and safer adapter/payload code.
- **Proposed decision:** begin with a single deployable backend process and an in-process worker abstraction; introduce an external queue only when durability/concurrency requirements justify it.
- **Proposed decision:** add PostgreSQL before persistent staging/job processing in Phase 2, not solely for the Phase 1 connectivity spike.
- **Open selection:** spreadsheet/grid component, runtime schema library, database access library, decimal library, test framework, authentication provider, and hosting platform.

### TypeScript code organization and reuse conventions

**Confirmed requirements:**

- Frontend and backend application code must use TypeScript.
- Treat `backend/` as the exclusive backend code root. Any new or moved backend implementation must be placed within that folder.
- In frontend code, reuse existing components and functions when their behavior and requirements are sufficiently similar. Extract a shared component when doing so reduces meaningful duplication without obscuring feature-specific differences.
- Avoid repeated implementation in both frontend and backend code. Extract and reuse common behavior where appropriate while keeping abstractions aligned with actual feature requirements.
- Every backend endpoint call must be encapsulated in a named function. The endpoint invocation belongs inside that function; callers must invoke the function, await its result, and return or otherwise consume the returned value rather than making inline endpoint calls.
- A main component and its closely related subcomponents may remain together in the same file when that keeps the feature cohesive and readable.
- Helper functions must live in a separate helper or utility file or folder, be exported, and be imported by the main code that uses them. Do not place helper-function implementations in the main component file.
- Organize code by responsibility: the main component owns the feature's primary structure and orchestration, subcomponents own smaller UI parts, and helper functions perform focused utility work.

## 12. Security and accounting integrity

- Secrets remain server-side in environment variables or an approved secret manager.
- API keys use least privilege and should identify an appropriate AutoCount user.
- Application authentication, authorization, account-book scoping, and approval permissions are enforced server-side.
- Uploads are size/type limited, parsed defensively, and never execute workbook macros/formulas.
- Logs and audit events redact secrets and minimize sensitive financial/personal data.
- Review snapshots are immutable once approved; changes create a new revision and require reapproval.
- Batch submission uses an atomic claim/lease to prevent double processing.
- Writes use bounded retries only when clearly safe. Unknown write outcomes enter reconciliation.
- Post-operation verification is required before success is final.
- Delete and void are excluded from normal workflows despite their presence in the API catalog.
- Production is not used for exploratory write testing.

## 13. Important risks

| Risk | Consequence | Required control |
| --- | --- | --- |
| Ambiguous party matching | Transaction posted to wrong customer/supplier | Multi-signal matching; human review; stable mapping |
| Duplicate import or retry | Duplicate financial documents | Fingerprints, remote duplicate lookup, per-record state, reconciliation |
| Positional update arrays | Unrelated detail rows overwritten or deleted | Latest full read, payload diff, row preservation, conflict check, tests |
| Partial batch failure | Inconsistent batch and unsafe replay | Independent outcomes; selective retry; exported reconciliation report |
| Timeout after write | Duplicate created by blind retry | Mark unknown; query remote state before any retry |
| Concurrent edits/submissions | Lost changes or double posting | Base snapshot, remote re-read, atomic batch claim, conflict status |
| Locked/approved/e-Invoice restrictions | Rejection or inappropriate modification | Preflight where documented; honor vendor rejection; no bypass |
| Excessive API permissions or leaked keys | Unauthorized financial access | Backend-only secrets, least privilege, rotation, redaction |
| Unsafe numeric/date handling | Amount or period errors | Decimal strategy, accounting-date types, validation and tests |
| Stale cached master/outstanding data | Invalid dependency or allocation | Freshness rules and immediate pre-submit revalidation |
| AI or automated testing reaches a real AutoCount account book | Unreviewed access to or mutation of real accounting data | Mock-only automation, no live credentials in tests, vendor-host network denial, human-only manual live checks |
| Interactive control hides or misrepresents its backend effect | Accidental submission, duplicate action, or false success | Documented trigger chain, account-book context, feature/permission gates, confirmation, single-submit protection, verified outcome states |

## 14. Current implementation status

### Implemented

- A React 19 + TypeScript + Vite portal exists at the repository root with React Router nested routes.
- The first layer at `/` retrieves safe company metadata from the backend and displays one company choice per discovered `backend/company-accounts/*.env` file.
- The second layer uses `/companies/:companySlug` and nested Sales, Purchase, and Accounting routes so company context remains in the URL.
- A TypeScript/Express backend exists under `backend/` with health and safe company-metadata routes.
- Each AutoCount company/account book is modeled by one ignored backend-only file in `backend/company-accounts/`; each file requires a root URL, Key ID, and API key. A placeholder template and setup instructions are committed in that directory.
- Company public names, initials, accents, and route slugs are derived from environment filenames. The backend rescans the directory for each metadata request, returns safe file/configuration counts, and never serializes credentials or filenames.
- Missing, partial, placeholder, non-HTTPS, and root-only URL configurations are classified without returning secrets to the browser.
- ESLint and frontend/backend TypeScript build scripts exist.
- Project initialization context is captured in `docs/AGENTS.md`, this file, and `docs/context/IMPLEMENTATION_PLAN.md`.

### Tested

- No AutoCount integration or accounting workflow has been environment-tested.
- On 2026-11-10, `npm run lint`, `npm run build:all`, and `npm --prefix backend test` passed for dynamic company discovery, company-selection gating, nested routing, and backend configuration.
- Local mock-only configuration tests confirmed an empty directory returns zero companies, each `.env` file produces one safe company record, invalid files remain blocked, newly added files are found on the next scan, and no credential value is present in public serialization.
- Production dependency audit reported no known vulnerabilities. Browser visual QA was not completed because the available embedded browser could not reach the Windows loopback preview server.

### Not implemented

- Portal-user authentication, roles, per-company authorization, and production-ready account-book selection.
- Production secret-manager integration and live credential rotation.
- AutoCount client or any API call.
- Database schema, migrations, staging, mappings, jobs, audit, or queue.
- Excel/CSV parsing and spreadsheet editing.
- Master-data matching, dependency validation, or duplicate detection.
- Import, bulk edit, cash book, purchase, knock-off, or history features.
- Automated tests beyond the scaffold's lint/build tooling.

The implemented pages are a navigation and configuration sample. Sector module tiles are placeholders and must not be interpreted as accounting functionality.

## 15. Important architectural decisions

### Accepted project constraints

- AutoCount is the accounting system of record.
- AutoCount access is backend-only through official APIs.
- Operations are tracked per record.
- Financial writes require validation, review, verification, and audit.
- Ambiguity blocks automation.
- Context documentation must remain synchronized with implementation.
- Keep the root Vite frontend and the TypeScript/Express backend under the repository-root `backend/` folder.
- Treat each company/account book as an independent credential file under `backend/company-accounts/`, even when multiple companies share an AutoCount registered account.
- Keep the public route slug separate from backend AutoCount credentials and never return the root URL, Key ID, or API key to the browser.
- AI agents and automated tests may use only mocks/local fixtures and must never execute live AutoCount requests; live checks are performed manually by an authorized programmer.
- Require an API activation impact report and owner explanation before implementing or changing any AutoCount-connected backend path or interactive frontend trigger.
- Treat frontend controls that can initiate backend AutoCount work as part of the accounting safety boundary, not as presentation-only details.

### Proposed decisions awaiting implementation evidence

- Implement an adapter interface around AutoCount to make contract tests and safe mocks straightforward.
- Use explicit workflow state machines and append-only audit events.
- Introduce PostgreSQL in Phase 2 when persistent staging and job history are required.
- Begin job processing behind an abstraction in the backend; add external queue infrastructure only if operating requirements demand it.

## 16. Open questions

### Business and workflow

- Which module and source dataset should be the first production use case?
- What fields uniquely identify customers/suppliers in company data?
- What constitutes a duplicate for each document type?
- Which fields may each role edit, review, and approve?
- Is dual approval required for amounts, tax, cash/bank, or allocations?
- What are the expected file sizes, rows per batch, and daily volumes?
- How long should uploads, row data, diffs, and audit events be retained?
- Which AutoCount-compatible Excel templates are currently used?

### AutoCount and accounting

- Is a safe test account book available, and which features/settings mirror production?
- Which API permissions and assigned AutoCount user should the integration key use?
- Which account books, currencies, tax regimes, and e-Invoice states are in scope?
- Which document states may be edited through the API?
- What conflict/version signal is reliable for each document?
- Are any native idempotency or batch facilities available?
- What are actual rate limits and recommended throttling rules?
- How should a timeout be reconciled for each write endpoint?

### Platform

- What identity provider and deployment environment will be used?
- Is the application internal-network-only or internet-accessible?
- What backup, monitoring, alerting, and incident-response standards apply?
- Is PostgreSQL already available, and who manages it?

## 17. Smallest safe implementation milestone

Build a **read-only AutoCount connectivity slice**:

1. Add a small TypeScript/Express backend with validated server-only configuration.
2. Add a centralized AutoCount HTTP adapter that injects `API-Key`/`Key-ID`, sets timeouts, redacts errors, and exposes no generic write method.
3. Configure one designated non-production account book.
4. Implement one documentation-checked read-only customer listing and one read-only invoice listing path, including pagination and normalized errors.
5. Expose a minimal authenticated/admin-only UI or development view showing connection status and sample results without secrets.
6. Add mocked contract tests that cannot load live credentials or reach the vendor host, and prepare a human-only manual connectivity checklist.
7. Have an authorized programmer run any approved read-only connectivity check and return sanitized evidence; record only that programmer-observed behavior, permissions, rate-limit headers, latency, and unresolved differences here.

This milestone validates the highest-risk integration boundary without changing accounting records.

## 18. Next recommended tasks

1. Confirm whether a non-production account book exists, identify the authorized programmer for live checks, and establish least-privilege read-only credentials that are unavailable to automated tests and AI-run commands.
2. Decide the initial application authentication approach and development/deployment environment.
3. Review the exact customer and invoice listing input/response models in official documentation.
4. Implement the read-only connectivity slice with mock-only automated coverage, then hand its live connectivity checklist to the authorized programmer for manual execution.
5. After connectivity is proven, interview administrators and inspect representative redacted source files to define the first versioned import schema and duplicate rules.
6. Do not implement write paths until read behavior, error normalization, permissions, test-book safety, and reconciliation design are understood.
