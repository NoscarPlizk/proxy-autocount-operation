# AutoCount Accounting API Context

**Context version:** 2026-11-11
**Official documentation reviewed:** 2026-11-11

## Purpose

This file is the durable entry point for every task involving the AutoCount Cloud Accounting Integration API. Read it before planning, implementing, reviewing, debugging, or documenting any AutoCount-connected behavior.

## Authoritative official sources

The current official AutoCount Accounting API documentation is the source of truth for all published API rules:

- <https://accounting-api.autocountcloud.com/documentation/>

The official Swagger reference supplements the documentation with the currently published HTTP operations and schemas:

- <https://accounting-api.autocountcloud.com/swagger/index.html>

The documentation site includes Getting Started, Fields and Formats, API References, and Data Models. Do not treat a repository summary, example payload, fixture, prior conversation, cached recollection, or third-party article as a substitute for the current official pages.

## Mandatory documentation workflow

Before establishing or changing any API rule, request or response contract, validation, permission, endpoint mapping, payload builder, retry policy, timing claim, or user control that can trigger AutoCount work:

1. Open the current official documentation entry point.
2. Read the exact endpoint page and every linked field-format and data-model page relevant to the operation.
3. Cross-check the official Swagger definition for the method, path, parameters, request schema, response schema, and documented status codes.
4. Record the exact official URLs consulted and the review date in the affected context or implementation record.
5. Classify the conclusion as **Documentation-verified** only when the official sources support it.
6. Treat missing, ambiguous, or conflicting information as **Unverified**. Do not invent fields, defaults, bulk behavior, atomicity, idempotency, retry safety, permissions, rate limits, concurrency guarantees, or accounting rules.

Because the official documentation can change, re-check it at implementation time and again before changing an AutoCount-connected operation. A statement copied into this repository is a dated summary, not an evergreen replacement for the official site.

## Source interpretation and conflicts

- For published API behavior and contracts, the current official documentation and Swagger definitions are authoritative.
- AutoCount's runtime validation and rejection remain authoritative for a specific authorized account book, but runtime behavior must not be used to bypass or weaken an official rule.
- A sanitized manual observation supplied by an authorized programmer may establish **Environment-tested** behavior for the exact recorded conditions. It does not replace the official contract or justify generalizing beyond those conditions.
- Repository requirements may impose stricter safety controls than the vendor documentation. They must never relax or contradict an official requirement.
- If official pages disagree with Swagger, repository documentation, fixtures, or manual observations, stop the affected work, record the discrepancy, and obtain clarification before enabling the operation. Never resolve a financial write-path conflict by assumption.

## Safety boundary

Consulting the official documentation does not authorize a live API request. AI agents, automated tests, CI jobs, browser automation, and scripts must not call a real AutoCount endpoint or use live AutoCount credentials, including for read-only requests. Only an authorized programmer may perform a manually approved live check under the guardrails in `docs/AGENTS.md` and `docs/context/PROJECT_CONTEXT.md`.

Never paste API keys, Key IDs, account-book credentials, or sensitive accounting payloads into documentation searches, examples, context files, logs, or committed fixtures.

## Current documentation-level facts

As reviewed on 2026-11-11, the official Getting Started page states that:

- requests require the `API-Key` and `Key-ID` headers;
- requests containing a body use JSON and require `Content-Type: application/json`;
- API keys can be assigned to an account-book user and granted method-level permissions; and
- newly created keys default to all permissions, so least-privilege permissions must be configured deliberately.

These are **Documentation-verified**, not **Environment-tested**. Endpoint-specific facts already recorded in `docs/context/PROJECT_CONTEXT.md` remain dated summaries and must be revalidated against the exact current official pages before use.

## Required reading relationship

Use this file together with:

- `docs/AGENTS.md` for repository-wide operating and safety instructions;
- `docs/context/PROJECT_CONTEXT.md` for durable product, architecture, and accounting-safety decisions;
- `docs/context/IMPLEMENTATION_PLAN.md` for phased work and quality gates; and
- `docs/context/loop/LOOP_OF_DEV_N_CONTEXT.md` for implementation/manual synchronization.
