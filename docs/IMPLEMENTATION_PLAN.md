# AutoCount Operations Proxy — Implementation Plan

**Plan initialized:** 2026-11-09  
**Current phase:** Phase 0 — Project initialization

This plan is incremental and risk-ordered. Completion means the stated deliverables and evidence exist; the presence of a planned item in this document does not mean it is implemented.

## Planning principles

- AutoCount remains the accounting system of record.
- Start read-only and use a designated non-production account book for integration testing.
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
- [x] Create `AGENTS.md` with durable agent, safety, security, testing, and maintenance rules.
- [x] Create `docs/PROJECT_CONTEXT.md` with requirements, status, risks, decisions, and open questions.
- [x] Create this phased implementation plan.
- [x] Review the official API getting-started and relevant invoice/payment/knock-off documentation at a documentation level.
- [x] Record documentation-verified facts separately from untested behavior.
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

### 1.1 Requirements and design

#### Deliverables

- Confirm non-production account book, account-book ID handling, and least-privilege API-key process.
- Confirm application authentication requirements for the first internal release.
- Review exact official models for account/customer/invoice listing operations.
- Define configuration names, redaction policy, timeout policy, error taxonomy, and integration-test safety flags.
- Record an API contract note for each implemented endpoint: official URL, date reviewed, request, response, pagination, errors, permissions, and unverified behavior.

#### Dependencies

- Authorized read-only AutoCount credentials supplied outside source control.
- Test account book.
- Decision on local/deployed secret storage.

#### Tests

- Configuration rejects missing/invalid values without echoing secrets.
- Logs and errors redact `API-Key` and `Key-ID`.
- Integration-test guard refuses writes and refuses unapproved account books.

#### Completion criteria

- Security and test boundaries are approved before a live request is made.

### 1.2 Backend foundation and adapter

#### Deliverables

- Add a TypeScript/Node.js/Express backend under `server/`.
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

### 1.3 Controlled connectivity check

#### Deliverables

- Add a minimal administrator/development view for connection status, customer results, and invoice results.
- Perform authorized read-only calls against the designated test account book.
- Capture sanitized evidence: result shapes, pagination behavior, errors, rate-limit headers, latency, permissions, and observed last-modified fields.
- Update `docs/PROJECT_CONTEXT.md` from “documentation-verified” to “environment-tested” only for behaviors actually observed.

#### Dependencies

- Phase 1.2 complete.
- Authorized credentials and network access.

#### Tests

- Read-only integration tests use explicit opt-in and a fixed approved account book.
- Empty, multi-page, unauthorized, not-found, rate-limited, timeout, and malformed-response paths are covered by fixtures or safe tests.
- Frontend renders errors without crashing the whole application.

#### Completion criteria

- Customer and invoice data can be retrieved read-only through the backend.
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
- Controlled test plan and write-enabled least-privilege test key.

#### Tests

- Payload construction and schema contract tests.
- Approval invalidation after changes.
- Double-submit race tests.
- Partial success, rate limit, transient failure, permanent validation failure, timeout-before-send, timeout-after-send, and process-restart recovery.
- Verification mismatch and duplicate-reconciliation tests.
- Controlled test-account writes using uniquely identifiable disposable test data and documented cleanup/reconciliation.

#### Completion criteria

- One document type can complete the full workflow in a test account with independent, verified outcomes.
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

- A controlled batch of at least 20 test-account edits yields 20 individually verified outcomes.
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

- End-to-end test-account purchase workflow passes with documented reconciliation.

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

- Each cash book transaction class is correctly distinguished and tested in the safe account book.

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
- Test-account allocations reconcile to expected remaining balances.
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

Every phase that introduces or changes an accounting write must pass all applicable gates:

1. **Documentation gate:** exact official endpoint/model/restrictions reviewed and recorded.
2. **Test-environment gate:** designated non-production account book and least-privilege key confirmed.
3. **Validation gate:** required data, dependencies, duplicates, and financial rules pass.
4. **Review gate:** immutable proposed change and authorized confirmation exist.
5. **Concurrency gate:** stale records and duplicate batch submission are blocked.
6. **Payload gate:** request builder is document-specific and contract-tested.
7. **Execution gate:** bounded processing and per-record state/outcomes exist.
8. **Unknown-outcome gate:** timeouts cannot trigger blind retry.
9. **Verification gate:** remote result is retrieved/reconciled before final success.
10. **Recovery gate:** partial failure and restart procedures are tested.
11. **Audit gate:** actor, account book, target, before/proposed data, timestamps, and sanitized outcomes are traceable.
12. **Documentation gate:** implementation status, decisions, limitations, and next work are updated.

## Immediate next milestone

The next recommended development task is Phase 1's read-only connectivity slice: add the minimal backend and centralized AutoCount adapter, then retrieve customer and invoice listings from an approved test account book. Do not implement create/update/delete/void operations in that milestone.

Before coding it, obtain decisions or safe defaults for:

- non-production account-book availability and ID;
- approved handling of the read-only key;
- initial application authentication for the development view; and
- the runtime validation, HTTP-client, and test libraries.
