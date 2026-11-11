# AutoCount Operations Proxy — Implementation Plan

**Plan initialized:** 2026-11-09  
**Current phase:** Phase 0 — Project initialization

This plan is incremental and risk-ordered. Completion means the stated deliverables and evidence exist; the presence of a planned item in this document does not mean it is implemented.

## Planning principles

- AutoCount remains the accounting system of record.
- Start read-only and prefer a designated non-production account book for authorized programmer-performed manual live checks.
- AI agents and automated tests must never call a real AutoCount endpoint or load live credentials; all automated coverage is mock/local-fixture only and must be unable to reach the vendor host.
- Explain an API activation impact report before implementing or changing any AutoCount-connected backend path or interactive frontend trigger.
- Treat live checks as human-only operations performed by an authorized programmer, with sanitized evidence returned for documentation.
- Verify every endpoint and document behavior against current official documentation before implementation.
- Process and record outcomes per accounting record unless an official atomic batch operation is verified.
- Treat write timeouts as unknown outcomes requiring reconciliation.
- Place every write behind validation, review, authorization, concurrency protection, audit, and verification.
- Deliver vertical slices that can be tested, observed, and safely disabled.
- Add infrastructure only when a phase requires it.

## Phase 0 — Project initialization

**Goal:** establish durable context, inspect the existing repository, define safe boundaries, and identify the first evidence-producing milestone.

### Deliverables

- [x] Inspect the current repository and Git state.
- [x] Identify the existing React/TypeScript/Vite scaffold and preserve it.
- [x] Create `docs/AGENTS.md` with durable agent, safety, security, testing, and maintenance rules.
- [x] Create `docs/context/PROJECT_CONTEXT.md` with requirements, status, risks, decisions, and open questions.
- [x] Create this phased implementation plan.
- [x] Review the official API getting-started and relevant invoice/payment/knock-off documentation at a documentation level.
- [x] Record documentation-verified facts separately from untested behavior.
- [x] Record the human-only live API testing and interactive-control guardrail.
- [ ] Confirm business owner answers to the highest-priority open questions.
- [ ] Confirm a safe non-production AutoCount account book and access process.
- [ ] Select initial application authentication and deployment direction.

### Dependencies

- Project requirements supplied by the owner.
- Access to official AutoCount documentation.
- Existing repository scaffold.

### Verification

- Run `npm run lint`.
- Run `npm run build`.
- Review documents for internal consistency and verify that no planned feature is described as implemented.
- Confirm the working-tree diff contains documentation only for this phase.

### Completion criteria

- Durable context and agent instructions are present and accurate.
- Existing implementation status is explicit.
- Safety boundaries and unverified API questions are recorded.
- A smallest safe Phase 1 milestone is agreed.
- Lint/build status is known.

## Phase 1 — Read-only AutoCount connectivity

**Goal:** prove secure backend connectivity and normalize read behavior without changing accounting records.

**Implementation note (2026-11-11):** the repository contains the TypeScript/Express process, safe company metadata, and one invoice-listing-only vertical slice. The Sales page retrieves the current month on mount and accepts a bounded document-date range. The backend exposes one company-scoped invoice GET route and a centralized invoice-specific AutoCount adapter with backend-only headers, pagination, timeout, response validation, and normalized errors. Mock-only tests cover the supplied fixture, request construction, pagination, timeout, malformed data, authorization redaction, and range validation. No live request has been made. Portal authentication, customer listing, individual-invoice retrieval, broader automated network denial, and programmer-controlled connectivity evidence remain incomplete.

### 1.1 Requirements and design

#### Deliverables

- Confirm non-production account book, account-book ID handling, and least-privilege API-key process.
- Confirm application authentication requirements for the first internal release.
- Review exact official models for account/customer/invoice listing operations.
- Define configuration names, redaction policy, timeout policy, error taxonomy, and automated-test isolation controls.
- Define the technical denial that prevents automated tests and AI-run commands from loading live credentials or reaching the AutoCount vendor host.
- Record an API contract note for each implemented endpoint: official URL, date reviewed, request, response, pagination, errors, permissions, and unverified behavior.
- Produce and explain the API activation impact report, including every frontend control capable of triggering the backend path.

#### Dependencies

- Authorized read-only AutoCount credentials supplied outside source control and available only to the programmer performing the manual live check, never to automated tests or AI-run commands.
- Test account book.
- Decision on local/deployed secret storage.

#### Tests

- Configuration rejects missing/invalid values without echoing secrets.
- Logs and errors redact `API-Key` and `Key-ID`.
- Automated test configuration refuses live credentials and vendor endpoints for reads and writes.
- Frontend interaction tests use a fake backend and prove controls respect configuration, permission, confirmation, pending-state, and double-submit guards.

#### Completion criteria

- Security and test boundaries are approved before a live request is made.

### 1.2 Backend foundation and adapter

#### Deliverables

- Add a TypeScript/Node.js/Express backend under the repository-root `backend/` folder; keep all backend implementation and backend test files within that folder.
- Add validated server-only configuration and health/readiness routes.
- Implement a centralized AutoCount adapter with mandatory headers, JSON handling, timeout/cancellation, pagination helpers, normalized errors, and safe structured telemetry.
- Do not expose a generic arbitrary-request route or any write method.
- Add customer listing and invoice listing/get methods after endpoint-specific documentation review.
- Add thin application services/controllers and explicit response contracts for the frontend.

#### Dependencies

- Phase 1.1 complete.
- Selection of runtime schema validation, HTTP client, and test tools.

#### Tests

- Unit tests for header injection, URL/query construction, pagination, timeouts, redaction, and error mapping.
- Contract-fixture tests for documented success and error responses, including unexpected shapes.
- Controller tests proving credentials never appear in browser responses.

#### Completion criteria

- All adapter behavior is covered by repeatable tests.
- No frontend bundle contains AutoCount secrets or direct vendor URLs used for authenticated calls.
- No write capability is reachable.

### 1.3 Programmer-controlled connectivity check

#### Deliverables

- Add a minimal administrator/development view for connection status, customer results, and invoice results.
- Give an authorized programmer the reviewed manual procedure for approved read-only calls against the designated account book; AI and automated tooling must not execute those calls.
- Capture sanitized evidence: result shapes, pagination behavior, errors, rate-limit headers, latency, permissions, and observed last-modified fields.
- Update `docs/context/PROJECT_CONTEXT.md` from “documentation-verified” to “environment-tested” only for behavior the programmer manually observed and returned with the required operator/test conditions.

#### Dependencies

- Phase 1.2 complete.
- Authorized credentials and network access.

#### Tests

- Automated tests cannot load live credentials, resolve the vendor host, or select a real account book.
- Empty, multi-page, unauthorized, not-found, rate-limited, timeout, and malformed-response paths are covered exclusively by mocks/local fixtures.
- Frontend renders errors without crashing the whole application.

#### Completion criteria

- The authorized programmer has manually confirmed that customer and invoice data can be retrieved read-only through the backend, or the milestone remains explicitly unverified.
- Pagination and error behavior are understood enough for the next phase.
- Credentials remain secret, and the observed behavior is documented.

## Phase 2 — Smart bulk import

**Goal:** safely stage, validate, review, and submit one initial document type, then generalize without weakening controls.

Phase 2 should begin with one agreed use case—likely sales invoices—but the business owner must confirm based on the backlog and representative source files.

### 2.1 Discovery and import contract

#### Deliverables

- Interview administrators and map the real preparation/review workflow.
- Inspect representative redacted Excel/CSV files and current AutoCount import templates.
- Define a versioned canonical schema for the first document type, including row grouping for document headers/details.
- Define required fields, dependency rules, duplicate rules, normalization, date/decimal handling, and error messages.
- Choose spreadsheet/grid, parsing, runtime validation, decimal, persistence, and test libraries.

#### Dependencies

- Phase 1 complete.
- Representative source data and business decisions.
- Exact write endpoint documentation reviewed, but no write enabled yet.

#### Tests

- Golden fixtures for valid, missing, malformed, duplicate, multi-line, and ambiguous data.
- Formula, macro-enabled, oversized, unexpected-sheet, and encoding edge cases.

#### Completion criteria

- A signed-off import contract exists and all unknown financial mappings are blocked, not guessed.

### 2.2 Persistence and staging

#### Deliverables

- Add PostgreSQL with versioned migrations.
- Model users/roles as needed, account books, import jobs, source files or references, staged records, staged details, validation issues, dependency candidates/resolutions, operation fingerprints, approvals, record attempts/outcomes, and append-only audit events.
- Define retention, encryption, backup, and access controls.
- Implement safe file upload, parsing, provenance, versioned mappings, and spreadsheet-style correction.
- Revalidation occurs after every relevant edit or mapping change.

#### Dependencies

- Phase 2.1 schema and retention decisions.
- PostgreSQL environment.

#### Tests

- Migration up/down or forward-recovery checks as appropriate.
- Repository/state-transition tests.
- Upload limits and parser security tests.
- Concurrent edits and stale revision tests.

#### Completion criteria

- Files can be staged, corrected, validated, and audited without any AutoCount write.
- Data retention and access restrictions are enforced.

### 2.3 Dependency matching and duplicate prevention

#### Deliverables

- Read-through retrieval of relevant master data with explicit freshness rules.
- Deterministic exact matching and explainable candidate matching using multiple identifiers.
- Human resolution for ambiguous/no-match cases.
- Reviewed source-to-AutoCount mappings.
- Duplicate/possible-duplicate checks against the batch, job history, and current AutoCount data.
- Authorized master-data creation design, initially feature-disabled until separately tested.

#### Dependencies

- Phase 2.2 staging.
- Business-approved matching identifiers and duplicate rules.

#### Tests

- Exact, ambiguous, no-match, stale-cache, conflicting-identifier, and likely-duplicate cases.
- Property/fixture tests proving a name-only ambiguous match never auto-accepts.
- Mapping changes invalidate affected approvals.

#### Completion criteria

- Every dependent record is either resolved to a verified identifier or blocked.
- Duplicate safeguards produce explainable outcomes.

### 2.4 Review, submission, and verification

#### Deliverables

- Immutable review snapshot and original/normalized/proposed comparison.
- Role/permission checks and explicit confirmation.
- Atomic batch claim to prevent concurrent submission.
- Per-record processor with bounded concurrency and rate-limit awareness.
- Idempotency-equivalent operation fingerprints and pre-write remote duplicate checks.
- A timeout/unknown-outcome reconciliation state; no blind retry.
- Post-write retrieval/verification and sanitized audit events.
- Results view/export with successful, failed, skipped, unresolved, conflict, and unknown outcomes.
- Safe selective retry of only eligible records.
- Optional validated AutoCount-compatible Excel export if requirements favor built-in import.

#### Dependencies

- Phase 2.3 complete.
- Exact create endpoint and response/error behavior reviewed.
- Owner-reviewed human-only manual test plan and a write-enabled least-privilege key unavailable to AI and automated tests.

#### Tests

- Payload construction and schema contract tests.
- Approval invalidation after changes.
- Double-submit race tests.
- Partial success, rate limit, transient failure, permanent validation failure, timeout-before-send, timeout-after-send, and process-restart recovery.
- Verification mismatch and duplicate-reconciliation tests.
- Mock-only automated coverage for write outcomes; no automated test may call AutoCount.
- Separately, an authorized programmer follows the owner-approved manual write procedure using explicitly identified records, stop conditions, and documented verification/cleanup/reconciliation.

#### Completion criteria

- One document type can complete the mock-covered workflow; any real AutoCount outcome is verified only through an authorized programmer's documented manual check.
- No production write is enabled until owner acceptance and an operational runbook exist.
- Recovery from every tested failure mode is understood and documented.

## Phase 3 — Bulk editing existing records

**Goal:** modify many existing documents efficiently while preventing lost updates and unintended detail-row changes.

### 3.1 Retrieval, selection, and editing

#### Deliverables

- Search/filter/paginate existing documents.
- Select records and store complete base snapshots with available modification metadata.
- Editable grid restricted to supported fields.
- Field and cross-field validation.
- Original-versus-proposed diff with high-impact changes highlighted.
- Fresh-read conflict check before approval/submission.

#### Dependencies

- Stable read adapter and persistence/audit foundations.
- Business-approved editable-field matrix.
- Document-state and concurrency behavior verified.

#### Tests

- Filtering/pagination and empty/error states.
- Permission and editable-field enforcement.
- Remote change after selection/review creates a conflict.
- UI survives individual malformed records and unexpected responses.

#### Completion criteria

- Administrators can prepare and review edits without performing a write.

### 3.2 Safe payload construction and updates

#### Deliverables

- Document-type-specific update payload builders; no generic patch passthrough.
- Latest full document retrieval before payload construction.
- Preservation of all unrelated master and detail data.
- Positional detail-array safeguards and outgoing structural diff.
- Independent operation tracking, post-update verification, and selective recovery.

#### Dependencies

- Exact update semantics reviewed for each document type.
- Phase 3.1 complete.

#### Tests

- Single header-field update preserves every detail row.
- First/middle/last detail-row update preserves order and unrelated fields.
- Adding/removing detail rows is blocked until separately designed and explicitly approved.
- Multi-record partial success and unknown outcomes.
- Locked, approved, permission-denied, and stale-document responses.

#### Completion criteria

- Mock coverage proves multi-record behavior; any real edit count and target records are approved per ticket and executed manually by an authorized programmer rather than fixed as an automated batch requirement.
- No omitted or reordered detail data is observed.
- Failure recovery excludes successful and unresolved-unknown records.

## Phase 4 — Additional accounting modules

**Goal:** extend proven import/edit foundations to purchases, cash book, and knock-off/payment allocation with module-specific safeguards.

### 4.1 Purchase invoices

#### Deliverables

- Supplier matching and dependency rules.
- Purchase import schema, duplicate rules, retrieval, create, safe update, verification, and history.

#### Dependencies

- Phase 2/3 shared foundations.
- Purchase endpoint and document restrictions verified.

#### Tests

- Supplier ambiguity, duplicate supplier invoice numbers, tax/account mappings, locked periods, partial failures, and detail preservation.

#### Completion criteria

- The mock end-to-end purchase workflow passes; any real AutoCount check is manually performed by an authorized programmer with documented reconciliation.

### 4.2 Cash book

#### Deliverables

- Explicit transaction classification: general-ledger entry versus debtor/creditor settlement.
- Cash/bank account, payment method, party, and total validation.
- Receipt/payment staging, retrieval, create/update where supported, verification, and audit.
- Enforce documented equality between cash-book detail amounts and payment-detail totals.

#### Dependencies

- Cash book models and update semantics verified.
- Business-approved classification/mapping rules.

#### Tests

- GL-only entries, debtor/creditor entries, mixed/invalid dependencies, amount mismatch, currency/rate cases, positional arrays, and locked documents.

#### Completion criteria

- Each cash book transaction class is correctly distinguished in mock coverage; any safe-account-book check is manually performed by an authorized programmer.

### 4.3 Knock-off and payment allocation

#### Deliverables

- Fresh retrieval of outstanding transactions.
- Conservative matching and eligibility rules.
- Full proposed allocation view with amount/sign/currency/balance validation.
- Enhanced authorization or dual review as decided.
- Immediate pre-submit balance recheck.
- Independent submission, post-submit outstanding-balance verification, and reconciliation report.

#### Dependencies

- Invoice/purchase/cash book reads proven.
- Exact outstanding and knock-off endpoint behavior verified.
- Business approval of allocation controls.

#### Tests

- Partial/full allocation, credit notes, over-allocation, already-settled items, changed balances, currency mismatch, concurrent allocation, timeout/unknown outcomes, and partial batch failure.

#### Completion criteria

- No allocation can exceed or act on stale outstanding balances.
- Mock allocation scenarios reconcile to expected remaining balances; any real-account-book allocation check is manually performed by an authorized programmer under a separately approved high-risk procedure.
- Operational review approves production readiness separately.

## Phase 5 — Advanced productivity and integration

**Goal:** improve scale, usability, reporting, and interoperability after safe core workflows are stable.

### Candidate deliverables

- Reusable and versioned import templates/mapping rules.
- Improved matching explanations and administrator-assisted rules.
- Data quality dashboards and reconciliation reports.
- Batch correction suggestions with mandatory review.
- Historical migration tooling and restartable long-running jobs.
- Internal business management system integration through stable contracts.
- Operational metrics, alerts, support tooling, and audit exports.
- Performance/capacity improvements based on measured volumes.

### Dependencies

- Stable production usage and incident/metrics evidence from earlier phases.
- Data governance and integration contracts.
- Explicit prioritization; candidates are not commitments by default.

### Tests

- Backward compatibility for saved templates/contracts.
- End-to-end reconciliation across systems.
- Load, restart, and recovery tests at expected and peak volumes.
- Authorization and tenant/account-book isolation tests.

### Completion criteria

- Each selected feature has measurable operational benefit without weakening accounting safeguards.
- Internal integrations are observable, versioned, recoverable, and auditable.

## Cross-phase quality gates

Every phase that introduces or changes an AutoCount-connected read, write, or interactive trigger must pass all applicable gates:

1. **Documentation gate:** exact official endpoint/model/restrictions reviewed and recorded.
2. **Activation-impact gate:** frontend trigger, backend path, endpoint, data scope, permissions, processing/timing, risks, and safeguards are explained to the owner before implementation.
3. **Automation-isolation gate:** automated tests and AI-run commands cannot load live credentials, resolve/reach the vendor host, or select a real account book.
4. **Human-live-test gate:** any live check has an owner-reviewed manual procedure and is executed only by an authorized programmer with sanitized evidence.
5. **Frontend-action gate:** account-book context, consequence, permissions, confirmation, single-submit protection, and truthful result states are enforced for every interactive trigger.
6. **Validation gate:** required data, dependencies, duplicates, and financial rules pass.
7. **Review gate:** immutable proposed change and authorized confirmation exist.
8. **Concurrency gate:** stale records and duplicate batch submission are blocked.
9. **Payload gate:** request builder is document-specific and contract-tested against mocks/fixtures.
10. **Execution gate:** bounded processing and per-record state/outcomes exist.
11. **Unknown-outcome gate:** timeouts cannot trigger blind retry.
12. **Verification gate:** remote result is retrieved/reconciled before final success during real operations.
13. **Recovery gate:** partial failure and restart procedures are mock-tested and manually validated only where explicitly approved.
14. **Audit gate:** actor, account book, target, before/proposed data, timestamps, and sanitized outcomes are traceable.
15. **Documentation gate:** implementation status, decisions, limitations, and next work are updated.

## Immediate next milestone

The next recommended development task is to have an authorized programmer perform the recorded manual invoice-listing GET check, return sanitized evidence, and add portal authentication before any deployed use. Customer listing and individual-invoice retrieval may follow as separate GET-only slices after their own contract review. AI and automated tests must not retrieve data from a real AutoCount account book. Do not implement create/update/delete/void operations in this phase.

Before enabling broader use, obtain decisions or safe defaults for:

- non-production account-book availability and ID, or the narrowly approved real account book for a programmer-performed manual read-only check;
- the authorized programmer who will execute live checks and return sanitized evidence;
- approved handling of the read-only key;
- initial application authentication for the development view; and
- the runtime validation, HTTP-client, and test libraries.
