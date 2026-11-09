# AutoCount Operations Proxy — Project Context

**Context version:** 2026-11-09  
**Implementation status reviewed:** 2026-11-09  
**Official API documentation reviewed:** 2026-11-09

This is the primary durable context for the project. Future development sessions must read it together with the repository implementation, `docs/AGENTS.md`, and `docs/context/IMPLEMENTATION_PLAN.md`.

## 1. Project overview and business motivation

AutoCount Operations Proxy is an internal web application for authorized company administrators. It will provide safer and more efficient bulk preparation, validation, review, submission, and editing of records held in the company's existing AutoCount Cloud Accounting account.

The company has several months of accounting data to enter or correct. Current workflows require repetitive record preparation, master-data lookup, dependency checking, matching, document-by-document editing, and error recovery. The proxy is intended to reduce this administrative work while preserving accounting integrity.

The central boundary is non-negotiable: **AutoCount Cloud Accounting remains the authoritative accounting system. This project is an operational productivity and integration layer, not a replacement accounting system.**

## 2. Classification conventions

This document uses the following labels:

- **Confirmed requirement** — explicitly required for the project.
- **Proposed decision** — an initial architectural recommendation that may be refined before implementation.
- **Documentation-verified** — confirmed in official AutoCount documentation as reviewed on the date above; it has not necessarily been exercised with company credentials.
- **Environment-tested** — observed using authorized credentials against a named safe environment. There are currently no environment-tested AutoCount behaviors.
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

### 10.1 Documentation-verified as of 2026-11-09

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
server/src/
  config/                    validated backend configuration
  http/                      Express setup, middleware, controllers
  application/               use cases and workflow orchestration
  domain/                    validation, matching, state rules
  integrations/autocount/    one AutoCount client/adapter
  jobs/                      controlled per-record processing
  persistence/               repositories and transaction boundaries
server/test/                 backend unit/contract/integration tests
shared/                      narrowly scoped shared transport contracts
db/migrations/               versioned schema changes when DB is introduced
docs/
  AGENTS.md                  durable agent instructions
  context/                   project context and implementation plans
```

### Technology direction

- **Existing and implemented:** React 19, TypeScript, Vite.
- **Confirmed preference:** React-Bootstrap, React Router, Node.js, Express, and PostgreSQL when persistence is required.
- **Proposed decision:** use TypeScript in both frontend and backend for consistent contracts and safer adapter/payload code.
- **Proposed decision:** begin with a single deployable backend process and an in-process worker abstraction; introduce an external queue only when durability/concurrency requirements justify it.
- **Proposed decision:** add PostgreSQL before persistent staging/job processing in Phase 2, not solely for the Phase 1 connectivity spike.
- **Open selection:** spreadsheet/grid component, runtime schema library, database access library, decimal library, test framework, authentication provider, and hosting platform.

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

## 14. Current implementation status

### Implemented

- A minimal React 19 + TypeScript + Vite starter scaffold exists at the repository root.
- ESLint and TypeScript/Vite build scripts exist.
- Project initialization context is captured in `docs/AGENTS.md`, this file, and `docs/context/IMPLEMENTATION_PLAN.md`.

### Tested

- No AutoCount integration, accounting workflow, or application feature has been environment-tested.
- On 2026-11-09, the unchanged starter scaffold passed `npm run lint` and `npm run build` after the context files were added.

### Not implemented

- Production UI, navigation, authentication, roles, or account-book selection.
- Backend/Express application.
- Configuration validation or secret management integration.
- AutoCount client or any API call.
- Database schema, migrations, staging, mappings, jobs, audit, or queue.
- Excel/CSV parsing and spreadsheet editing.
- Master-data matching, dependency validation, or duplicate detection.
- Import, bulk edit, cash book, purchase, knock-off, or history features.
- Automated tests beyond the scaffold's lint/build tooling.

The starter screen must not be interpreted as product functionality.

## 15. Important architectural decisions

### Accepted project constraints

- AutoCount is the accounting system of record.
- AutoCount access is backend-only through official APIs.
- Operations are tracked per record.
- Financial writes require validation, review, verification, and audit.
- Ambiguity blocks automation.
- Context documentation must remain synchronized with implementation.

### Proposed decisions awaiting implementation evidence

- Keep the current root Vite frontend and add `server/` rather than immediately converting to a complex monorepo.
- Use TypeScript end-to-end.
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
6. Add mocked contract tests and run a controlled read-only integration check if credentials are provided.
7. Record the exact observed behavior, permissions, rate-limit headers, and unresolved differences here.

This milestone validates the highest-risk integration boundary without changing accounting records.

## 18. Next recommended tasks

1. Confirm access to a non-production account book and obtain a least-privilege read-only key through an approved secret channel.
2. Decide the initial application authentication approach and development/deployment environment.
3. Review the exact customer and invoice listing input/response models in official documentation.
4. Implement and test the read-only connectivity slice described above.
5. After connectivity is proven, interview administrators and inspect representative redacted source files to define the first versioned import schema and duplicate rules.
6. Do not implement write paths until read behavior, error normalization, permissions, test-book safety, and reconciliation design are understood.
