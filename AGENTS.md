# Repository Guidelines

## Project Structure & Module Organization
The blog uses the Next.js App Router, with route handlers and layouts in `src/app`, shared UI in `src/components`, and data helpers plus Zod schemas in `src/lib`. Static assets, including fonts and favicons, live under `public`. Keep RSS-related updates aligned with `src/app/rss.xml/rss.test.ts` and mirror any new microCMS interactions inside `src/lib/api` helpers so validation stays centralized.

## Build, Test, and Development Commands
Install dependencies with `bun install` (lockfile checked in). Use `bun run dev` for a Turbopack-powered local server at `http://localhost:3000`. `bun run build` creates the production bundle, while `bun run start` serves the `.next` output. Run health checks with `bun run lint` (Biome) and `bun run test` (Vitest). When investigating flaky suites, launch the watcher UI via `bun run test:ui`.

## Coding Style & Naming Conventions
Biome enforces two-space indentation, single quotes, and self-closing JSX where possible; run `bun run lint:fix` or `bun run format` before opening a PR. Prefer the `@/*` path alias for imports under `src`, and keep server-only logic in route handlers or dedicated files within `src/app`. Components should be functional React components with typed props, leveraging Tailwind v4 utility classes and daisyUI themes instead of bespoke CSS.

## Testing Guidelines
Vitest powers unit and integration coverage; follow the existing `*.test.ts` pattern and colocate specs beside the feature code (e.g., RSS feed tests). Mock network calls with Testing Library helpers or lightweight fixtures to keep microCMS tests deterministic. New routes or parsers should prove successful and failure cases, especially around Zod validation.

## Commit & Pull Request Guidelines
Use concise, imperative commit subjects that describe the change (e.g., `Refactor microCMS endpoints into shared constants`). Group related updates into a single commit and avoid mixing refactors with feature work. PRs should explain the motivation, reference any tracked issues, and include screenshots or logs when UI or analytics behavior changes. Confirm lint and test runs in the PR description so reviewers can fast-track merges.

## Environment & Deployment Notes
Secrets for microCMS and analytics belong in `.env`; never commit production values. `next.config.ts` is tuned for standalone builds and remote images—review changes there with deployment in mind. Docker support exists via `Dockerfile`; rebuild the image after dependency updates to keep Cloud Build deployments green.
