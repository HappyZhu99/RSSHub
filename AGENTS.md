# RSSHub Agent Guide

This file is a concise, actionable guide for coding agents working in this repo.
Keep changes aligned with existing tooling, lint rules, and conventions.

## Quick Facts

- Runtime: Node.js >= 22 (see `package.json` engines).
- Package manager: `pnpm` (see `package.json` packageManager).
- Module system: ESM (`"type": "module"`).
- Primary source: `lib/`.
- Path alias: `@/` maps to `lib/` (see `tsconfig.json`).
- Tests: Vitest (see `vitest.config.ts`).

## Install

- `pnpm install`
- Some workflows also run `pnpm rb && pnpx rebrowser-puppeteer browsers install chrome` (CI setup).

## Build Commands

- `pnpm build` (build routes + tsdown bundle).
- `pnpm build:vercel` (Vercel package build).
- `pnpm build:docs` (docs build via `scripts/workflow/build-docs.ts`).
- `pnpm start` (run built `dist/index.js`).

## Dev Commands

- `pnpm dev` (dev server with inspector).
- `pnpm dev:cache` (dev server in production cache mode).

## Lint/Format Commands

- `pnpm lint` (ESLint across repo).
- `pnpm format:check` (Prettier check + ESLint).
- `pnpm format` (Prettier write + ESLint fix).
- `pnpm format:staged` (lint-staged).

## Test Commands

- `pnpm test` (format check + coverage tests).
- `pnpm vitest` (full test run).
- `pnpm vitest:watch` (watch mode).
- `pnpm vitest:coverage` (coverage + junit).
- `pnpm vitest:fullroutes` (full routes test; writes JSON to `assets/build`).

## Running A Single Test

- Single file: `pnpm vitest lib/path/to/file.test.ts`.
- Single test by name: `pnpm vitest -t "test name"`.
- Single folder/pattern: `pnpm vitest lib/some/folder`.

## Test Notes

- Test setup file: `lib/setup.test.ts`.
- Coverage includes `lib/**/*.ts`, excluding `lib/routes/**` and `lib/routes-deprecated/**`.
- Some test flows expect Redis; set `REDIS_URL` when relevant.

## Code Style: Formatting

- Prettier: 4 spaces, single quotes, trailing commas (ES5), print width 233.
- Keep formatting consistent with Prettier; avoid manual reflow.
- ESLint enforces whitespace, semicolons, and spacing rules.

## Code Style: Imports

- Use ESM `import` / `export`.
- Prefer `node:` prefix for built-ins when adding new imports.
- Use the `@/` alias for `lib/` paths instead of deep relatives.
- Avoid duplicate imports; merge when appropriate.

## Code Style: Naming

- File names must be `kebab-case`.
- Exceptions: `*.yml` / `*.yaml`, and `RequestInProgress.js` are allowed.
- Prefer clear, descriptive identifiers; avoid cryptic abbreviations.

## Code Style: Types

- TypeScript is `strict: true` but `noImplicitAny` is off.
- Prefer explicit types for public functions, exports, and config objects.
- Avoid `any` unless unavoidable; document when it is required.
- Keep `isolatedModules` in mind (no TS-only runtime constructs).

## Code Style: Errors

- Do not swallow errors with empty `.catch()` bodies.
- These are disallowed: `.catch(() => null)`, `.catch(() => undefined)`, `.catch(() => [])`, `.catch(() => {})`.
- Use meaningful error handling or propagation.

## Code Style: Async

- `no-await-in-loop` is enforced; prefer batching (`Promise.all`) or refactor loops.
- `require-await` is enforced; do not mark functions `async` without `await`.

## Code Style: Collections

- Avoid `array.reduce` and `array.sort` where possible (warnings).
- Prefer explicit loops or helper utilities for clarity.
- If using a collection `.get()` with no args, use `.toArray()` instead.
- Use `.toArray()` before `.map()` on collection-like objects.

## Code Style: General ESLint Expectations

- No `console` usage; use the logger in `lib/utils/logger.ts`.
- No `var`; use `const` or `let`.
- Enforce `curly`, `eqeqeq`, `object-shorthand`, `prefer-const`.
- Avoid `eval`, `new Function`, or extending native prototypes.

## Logging

- Use `lib/utils/logger.ts` for logging.
- Logging is configured for JSON in production and console output in dev.

## File/Project Layout

- `lib/` is the main source tree.
- `scripts/` contains workflow and CI helper scripts.
- `assets/build/` holds generated build artifacts (CI writes here).

## CI Notes

- CI runs `pnpm build` and `pnpm vitest:coverage`.
- Puppeteer tests exist; CI installs Chromium variants when needed.
- Respect repo scripts rather than reinventing workflows.

## Cursor/Copilot Rules

- No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` found in this repo at time of writing.
- If any are added later, update this file to mirror their requirements.

## When In Doubt

- Follow existing patterns in nearby `lib/` files.
- Keep diffs focused and minimal.
- Prefer clarity over cleverness; avoid surprising control flow.
