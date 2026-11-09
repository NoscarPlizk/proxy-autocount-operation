# Development and Project Manual Synchronization Loop

## Purpose

This file is the living project manual and the required synchronization checklist for development work. It records the implemented features and logic of every application page and shared workflow so that a new AI can understand the project without relying on previous conversation history.

Keep this manual synchronized with the latest implemented code whenever functionality or behavior is developed, edited, improved, or removed. Complete the manual synchronization review before considering the coding task finished.

## Required manual content

Maintain one section for every application page or route. Each section must explain, where applicable:

- the page name, route, purpose, and implementation files;
- every user-visible feature and available action;
- logic behavior, business rules, calculations, and decision paths;
- important UI and workflow states, transitions, and persistence behavior;
- input validation, defaults, matching rules, and duplicate prevention;
- backend, AutoCount API, database, and other dependency interactions;
- permissions, confirmation steps, write-safety controls, and audit behavior;
- loading, empty, success, partial-success, error, timeout, and recovery behavior;
- known limitations, feature gates, and deliberately unsupported behavior; and
- the implementation and verification status using the labels defined in `docs/AGENTS.md`.

Document shared behavior used by multiple pages in a separate shared-workflow section and link to it from each affected page. Keep descriptions precise enough for another AI to locate the responsible code and change it safely. Do not duplicate large code blocks; explain the behavior and cite the relevant files or modules instead.

## Workflow

Follow this sequence for every coding task:

1. **Read:** Review the relevant context documentation and existing code before making changes.
2. **Implement:** Complete the requested code modification or feature development.
3. **Verify:** Test or inspect the modified implementation to establish its actual behavior.
4. **Compare:** Compare the current implementation with the corresponding context documentation.
5. **Synchronize:** Update the affected page and shared-workflow sections in this file to reflect the current features, behaviors, business rules, states, dependencies, and limitations. Update other context documents when their scope is also affected.
6. **Complete:** Finish the task once the implementation and documentation have been reviewed and synchronized.

## Rules

- Run the documentation synchronization review after every coding task.
- A feature or behavior addition, modification, or removal always requires a corresponding update to the affected manual section in this file.
- For a refactor or maintenance change that intentionally preserves behavior, verify the affected manual section remains accurate; update it if implementation references, dependencies, limitations, or verification status changed.
- Document significant existing and newly introduced functionality, including features discovered during the task that were not part of the original requirements.
- Preserve accurate documentation and important constraints.
- Remove or correct obsolete feature descriptions.
- Use source code and tests to verify implemented behavior.
- Refer to available conversation history when it helps explain design decisions.
- Do not document unimplemented features as completed.
- Avoid unnecessary documentation rewrites.
- Focus the review on affected features and their dependencies rather than the entire repository.
- Run this workflow once per coding task; do not invoke it recursively or continue it indefinitely.
- At completion, report which manual sections and documentation files were updated. For a behavior-preserving task that required no documentation edit, explicitly state that the manual was reviewed and remained accurate.

## Project manual

### Application starter page

- **Route:** `/` (the application currently has no client-side router).
- **Purpose:** Displays the default React and Vite starter experience. This is scaffolding, not an implemented AutoCount operations feature.
- **Primary implementation:** `src/App.tsx`, with presentation rules in `src/App.css` and `src/index.css`.
- **Status:** **Implemented** in the repository. No AutoCount workflow is implemented or environment-tested on this page.

#### Features and behavior

- A local counter starts at `0` when the page component mounts.
- Selecting the counter button increments the displayed value by one through React component state.
- The counter is not persisted and resets to `0` when the page is reloaded or remounted.
- Static React, Vite, and hero graphics are displayed from local assets.
- Documentation and community links navigate to external Vite, React, GitHub, Discord, X, and Bluesky pages in a new browser tab.
- The page has no form submission, input validation, backend request, AutoCount API interaction, authentication, authorization, database persistence, accounting logic, or application-level error recovery.

#### Known limitations and next-development implications

- The page is starter-template content and does not yet represent the intended product workflow.
- Before replacing it, inspect the implementation and preserve only the scaffolding that remains useful.
- When real pages or routes are introduced, add a manual section for each page and move reusable behavior into clearly named shared-workflow sections.
