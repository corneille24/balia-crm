# CLAUDE.md

Instructions for Claude when working in this repository.

## Workflow for approved changes

Unless the user explicitly says otherwise for a given change, every approved
change must go through this sequence, in order:

1. **Test** — run `pnpm run lint` and `pnpm run build` (`tsc -b && vite build`).
   Both must succeed before proceeding. Fix failures rather than skipping them.
2. **Commit** — commit locally with a clear, specific message describing what
   changed and why.
3. **Push** — push to `origin/main`.

Do not batch unrelated changes into one commit. Do not skip the test step to
save time. If a change cannot be tested (e.g. no automated coverage exists for
it), say so explicitly rather than silently skipping verification.

## Hard rules

- **Never commit secrets.** No API keys, tokens, credentials, `.env` files, or
  private keys, under any circumstances — check before every commit, not just
  when something looks obviously sensitive.
- **Never force-push.** No `git push --force` or `--force-with-lease` to any
  branch, ever. If a push is rejected, pull/rebase properly or ask the user.
- **Never delete or overwrite existing work** without explicit confirmation.
  This includes rewriting history, deleting branches, or deleting the remote
  repository.
- **`main` is the deployed branch.** Netlify auto-deploys from `origin/main`
  on every push. Treat pushes to `main` as production deploys — the build
  must pass locally before pushing.

## Project overview

BALIA Consulting CRM — a trade, customs and market-entry advisory platform.
React + TypeScript + Vite + Tailwind, with Recharts for data visualisation
and Lucide for icons. Single-page app, in-memory demo data (see `src/data/`),
no backend yet.

- `src/data/` — service catalogue, country/product reference data, seed dataset
- `src/lib/` — derived calculations (invoice totals, project health, analytics)
- `src/store.tsx` — central app state, reducer-based actions, workflow automations
- `src/components/` — shared UI kit (`kit.tsx`), charts, app shell/navigation
- `src/modules/` — one file per feature area (sales, delivery, commercial, etc.)

## Build & deploy

- Dev: `pnpm run dev`
- Build: `pnpm run build`
- Lint: `pnpm run lint`
- Deployed via Netlify, auto-triggered on push to `main`.
