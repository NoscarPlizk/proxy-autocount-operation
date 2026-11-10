# AutoCount Operations Proxy — Agent Instructions

## Read this first

Before changing code or project documentation:

1. Read this file in full.
2. Read `docs/context/PROJECT_CONTEXT.md` and `docs/context/IMPLEMENTATION_PLAN.md`.
3. Read `docs/context/loop/LOOP_OF_DEV_N_CONTEXT.md` and follow its code-and-manual synchronization workflow.
4. Inspect the current implementation and tests; do not infer status from plans alone.
5. Check the working tree and preserve unrelated user changes.
6. For any AutoCount operation, consult the current official documentation at <https://accounting-api.autocountcloud.com/documentation/> and the official Swagger reference at <https://accounting-api.autocountcloud.com/swagger/index.html>.

If implementation and documentation disagree, investigate the discrepancy. Update the documentation to describe reality; do not relabel planned work as complete.

## Mission and boundaries

AutoCount Operations Proxy is an internal productivity and integration layer over AutoCount Cloud Accounting. It helps authorized administrators stage, validate, review, submit, edit, and audit accounting-related operations in bulk.

AutoCount Cloud Accounting remains:

- the authoritative source of accounting records;
- responsible for accounting calculations, posting rules, permissions, locks, and document validation; and
- the only accounting system this application may modify through supported official APIs.

This application must not:

- become a parallel accounting ledger;
- reproduce or bypass AutoCount's accounting engine;
- write directly to AutoCount's database;
- invent undocumented endpoint behavior, request fields, bulk semantics, or accounting rules;
- automatically delete or void accounting documents;
- guess ambiguous customer, supplier, document, or allocation matches; or
- describe an untested assumption as a verified capability.

## Source-of-truth hierarchy

Use these sources in order:

1. Observed behavior from an authorized programmer's manual, controlled live check, preferably against a non-production account book, recorded with the operator and full test conditions.
2. Current official AutoCount documentation and Swagger definitions.
3. Repository decisions and requirements in `docs/context/PROJECT_CONTEXT.md`.
4. Explicitly labelled design proposals and assumptions.

When sources conflict, stop write-path work, record the conflict, and resolve it before continuing. Never use an assumption to authorize a financial write.

## Architecture principles

Keep these concerns separate:

- React presentation and client-side interaction;
- backend HTTP routes/controllers;
- application use cases and workflow orchestration;
- accounting/dependency validation rules;
- the centralized AutoCount integration adapter;
- controlled background job processing;
- persistence for staging, mappings, audit, and job state; and
- shared transport contracts where they add value.

Rules:

- All AutoCount calls originate from the backend.
- Do not call AutoCount directly from React components or expose credentials to the browser.
- Keep route handlers thin; place workflow and accounting rules in services/domain modules.
- Centralize authentication headers, request/response mapping, timeouts, error normalization, pagination, and telemetry in the AutoCount adapter.
- Model each submitted record as an independently tracked operation unless official documentation proves suitable atomic batch behavior.
- Keep persisted operational metadata distinct from authoritative accounting data.
- Introduce PostgreSQL, queues, or other infrastructure only when the current phase needs them.
- Prefer explicit, testable modules over framework-heavy abstractions.

## Coding standards

- The existing application uses TypeScript. New frontend and backend code should use TypeScript unless a documented decision changes this.
- Use clear domain names such as `stagedInvoice`, `dependencyResolution`, and `recordOutcome`; avoid opaque abbreviations.
- Validate data at trust boundaries: uploaded files, browser requests, stored job payloads, environment configuration, and AutoCount responses.
- Represent money and decimal quantities without unsafe binary floating-point arithmetic. Select and document a decimal strategy before financial calculations are implemented.
- Treat dates deliberately. Preserve accounting dates independently from local display time zones; document any conversions.
- Use structured domain errors and normalize external API failures. Do not make the UI interpret raw vendor errors.
- Avoid complex business logic in React components and Express route handlers.
- Prefer small, deterministic functions for validation, matching, duplicate detection, and payload construction.
- Do not log secrets, full authentication headers, or unnecessary personal/financial payloads.
- Keep dependencies purposeful and review their maintenance and security impact before adding them.

## Accounting integrity and write safety

Every write workflow must implement or explicitly defer behind a feature gate:

- pre-submission validation;
- dependency and ambiguous-match resolution;
- duplicate detection or an equivalent duplicate-prevention control;
- explicit review and confirmation;
- per-record state and outcome tracking;
- protection against concurrent submission of the same batch;
- safe handling of timeouts and unknown outcomes;
- post-write retrieval or another documented verification method;
- selective retry that excludes successful or possibly successful records; and
- an audit trail containing actor, timestamps, target identifiers, sanitized outcomes, and appropriate before/proposed values.

Never blindly retry a timed-out write. First reconcile whether AutoCount created or updated the record.

Never treat multiple API calls as a database transaction unless the official API explicitly guarantees that behavior.

Before updating an existing document, detect staleness using the strongest documented version/modified-time mechanism available. If none is reliable, require a fresh read and conservative conflict handling.

### Positional detail arrays

Official AutoCount documentation warns that invoice and payment update detail arrays are positional. Fewer submitted elements can remove existing rows, and element order determines which row is changed. Therefore:

- retrieve the latest complete document before constructing an update;
- preserve every unchanged detail row in the required position or use the documented empty-element form when safe;
- compare the outgoing payload to the intended diff;
- test payload builders with multi-row fixtures; and
- block submission if the latest remote shape differs from the reviewed base version.

Do not generalize this behavior to other document types without checking their official documentation, but treat unknown update semantics as unsafe until verified.

### High-impact operations

Amounts, taxes, account codes, document dates, approval state, cash/bank postings, knock-offs, and payment allocations require enhanced review. Delete and void functions are out of scope unless the project owner explicitly adds a separately designed, documented, permission-controlled workflow.

## Security requirements

- Store secrets only in backend environment variables or an approved secret manager.
- Commit example configuration with placeholders only; never commit real keys.
- Ensure local secret files remain ignored.
- Use least-privilege AutoCount API keys. Official documentation states new keys default to all permissions, so permissions must be reduced after creation.
- Associate API keys with the appropriate AutoCount account-book user where operational attribution requires it.
- Enforce application authentication and authorization on the backend, not only in the UI.
- Scope every operation to the authorized account book and prevent cross-book access.
- Redact credentials and sensitive values from errors, logs, traces, and audit records.
- Apply upload size/type limits, safe parsing, schema validation, and formula/macro-aware export controls.
- Define retention and access controls before storing uploaded source files or detailed financial payloads.

## Testing requirements

Use tests proportionate to financial risk. At minimum, add automated coverage for:

- schema and field validation;
- customer/supplier matching, including ambiguous and no-match cases;
- dependency resolution;
- duplicate detection and idempotency safeguards;
- money/date normalization;
- AutoCount request mapping and response/error normalization;
- update payload construction that preserves unchanged detail rows;
- partial success, timeout/unknown outcome, safe retry, and recovery;
- batch concurrency protection and state transitions; and
- permissions for review, approval, and submission.

Use mocked/contract fixtures for all automated AutoCount tests. AI agents, test runners, CI jobs, browser automation, scripts, and other automated processes must never execute requests against a real AutoCount endpoint or account book, including read-only requests. They must not load live AutoCount credentials and must be structurally prevented from reaching the vendor host. Production writes are never a test step.

## Human-only live API and interactive-control guardrail

Any live AutoCount check is performed manually by an authorized programmer. An AI may inspect official documentation, implement the adapter or workflow, create mock-only tests, and prepare a manual procedure, but it must stop before executing a live request. This applies to GET as well as create, update, delete, void, approval, allocation, knock-off, and every other AutoCount operation. If no sandbox or non-production account book exists, do not weaken the rule or use production to discover behavior.

Before implementing or changing any AutoCount-connected backend path or any frontend control that can trigger one, explain an API activation impact report to the project owner. At minimum, identify:

- the frontend action and complete route/use-case/adapter/HTTP-endpoint trigger chain;
- read/write/destructive classification and exact account-book, record, filter, and field scope;
- documented request, response, permission, validation, timing, timeout, rate-limit, concurrency, and retry behavior;
- feature gates, authorization, confirmation, double-submit protection, audit, verification, failure, unknown-outcome, reconciliation, and reversibility controls;
- mock-only automated coverage and the mechanism that prevents live network or credential use; and
- the authorized programmer's exact manual test procedure, stop conditions, and required sanitized evidence.

Do not promise exact external API duration without evidence. State documented limits, programmer-measured observations, estimates, configured timeouts, and unknowns separately.

Buttons, links, forms, keyboard shortcuts, bulk actions, retry controls, and automatic UI effects that can initiate AutoCount work are part of the accounting safety boundary. They must show the selected company/account book and consequence, remain unavailable until configuration/permission/validation/review gates pass, prevent accidental duplicate activation, use confirmation proportional to risk, and display verified pending/success/failure/partial/conflict/unknown states. Presentation-only controls must not appear operational.

Only programmer-supplied, sanitized evidence from a manual live check may change a capability to **Environment-tested**. Record the operator, date/time, account book/environment, endpoint and method, target scope, sanitized request shape, expected effect, actual duration, outcome, verification, and cleanup/reconciliation. Never claim AI or automated verification of a real AutoCount behavior.

Before handing off a change, run the relevant formatter/linter, type-check/build, and tests. Report anything that could not run.

## Rules for modifying existing code

- Make the smallest coherent change that satisfies the current milestone.
- Preserve user work and unrelated behavior.
- Do not silently restructure the repository or replace established technology.
- Add migrations for persistent-schema changes; do not edit deployed data manually.
- Do not weaken validation, approval, auditing, or permissions to make a workflow pass.
- Do not add fallback behavior that guesses accounting identities or values.
- Keep destructive actions opt-in, narrowly scoped, and recoverable where possible.
- Record important architectural decisions and their reasons in `docs/context/PROJECT_CONTEXT.md`.

## Context maintenance

`docs/context/loop/LOOP_OF_DEV_N_CONTEXT.md` is the living project manual and a required companion to the code. Every development task that adds, changes, or removes a feature or behavior must update the affected manual sections before the task is complete. Updating another context document does not replace this requirement.

For each affected page or shared workflow, keep the manual detailed enough that an AI with no prior conversation history can understand and safely continue development. Document the page's purpose, user-visible features, logic and business rules, important states and transitions, validation, data and API interactions, dependencies, permissions, error and edge-case behavior, limitations, and relevant implementation locations. Describe only behavior supported by the current code and tests, and keep planned behavior visibly separate.

Whenever a session changes architecture, API usage, database design, core workflows, security requirements, or project scope:

1. Re-read the relevant context sections.
2. Preserve established decisions unless there is a justified, recorded reason to revise them.
3. Update only the affected sections instead of rewriting the documents wholesale.
4. Update implementation status from actual code and test evidence.
5. Move items between pending and completed only when they are implemented and verified at the stated level.
6. Record new limitations, risks, open questions, and next tasks.
7. Keep confirmed requirements, proposed decisions, documentation-verified capabilities, environment-tested behavior, and assumptions visibly distinct.

## Status language

Use precise labels:

- **Confirmed requirement** — explicitly required by the project owner.
- **Proposed decision** — recommended design, not yet accepted through implementation or explicit approval.
- **Documentation-verified** — supported by current official documentation but not necessarily tested with company credentials.
- **Environment-tested** — observed in an authorized programmer-performed manual live check, with operator, account book/environment, date/time, target scope, and verification evidence noted.
- **Implemented** — code exists in this repository.
- **Tested** — the named automated or controlled test passed.
- **Unverified assumption** — requires documentation review, vendor clarification, or controlled testing.

Never collapse these labels into a vague claim that a feature “works.”
