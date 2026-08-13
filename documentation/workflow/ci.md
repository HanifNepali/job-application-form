# CI Workflow — Reference

Documents the Git branching workflow this project follows and exactly
what `.github/workflows/ci.yml` does, step by step.

---

## Git workflow

1. **Feature Branch** — a developer creates a temporary branch off `dev`
   (e.g. `feature/login-page`) to build a new item.
2. **Pull Request to Dev** — once the work is done, they open a PR
   targeting the `dev` branch. CI runs lint, tests, and a build check on
   this PR.
3. **Merge to Dev** — the PR is approved and merged into `dev`. This
   triggers a `push` event, which (once CD is set up — see note below)
   deploys the fresh code to a Dev/Staging environment for internal
   testing.
4. **Pull Request to Main** — once the feature is verified as safe on
   Dev/Staging, a project lead opens a PR from `dev` into `main`. CI runs
   the same lint/test/build checks on this PR too — merging into `main`
   is not assumed safe just because each individual feature already
   passed CI when it merged into `dev`.
5. **Merge to Main (Production)** — merging into `main` triggers a final
   `push` event, which (once CD is set up) deploys the code live to
   Production.

**Note on CD:** deployment itself is deliberately not yet wired into this
workflow. The plan is a **custom CD step gated on this CI workflow's
success**, rather than relying on Vercel's default independent
auto-deploy — the concern being that Vercel's own GitHub integration
would deploy on every push regardless of whether CI has finished or
passed, so a push that fails lint/tests/build could still go live in
parallel. This will be finalized once Vercel is actually set up.

---

## `ci.yml` — current version

```yaml
name: CI

on:
  pull_request:
    branches: [dev, main]
    types: [ready_for_review]
  push:
    branches: [dev, main]
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm run test -- --run

      - name: Build
        run: npm run build
```

---

## What each piece does

- **`on: pull_request/push branches: [dev, main]`** — the trigger. Runs
  on every `Ready_for_review` PR targeting, `dev` (feature branches merging in) _and_ every
  PR targeting `main` (the dev→main promotion PR), plus direct pushes to
  either branch (the actual merge events). Both branches are covered
  deliberately — checking only `main` would skip verifying the much more
  frequent feature→dev PRs; checking only `dev` would skip re-verifying
  the dev→main promotion.
- **`workflow_dispatch`** — allows the workflow to also be triggered
  manually from the GitHub Actions UI, independent of any push or PR
  event. Useful for re-running checks on demand without needing to push
  an empty commit.
- **`concurrency`** — if new commits land on the same PR/branch while a
  previous run is still in progress, this cancels the stale run rather
  than letting both finish. Avoids wasting CI time on outdated commits
  and avoids ambiguity over which run's result is current.
- **`runs-on: ubuntu-latest`** — the virtual machine GitHub spins up to
  execute the job; a fresh, disposable Linux environment every run.
- **`timeout-minutes: 10`** — kills the job automatically if it hangs
  this long, so a stuck test or install can't silently burn CI minutes
  indefinitely.
- **`actions/checkout@v4`** — clones the repo's code onto the fresh VM.
  Without this step, the VM is empty; nothing after it would have any
  source files to work with.
- **`actions/setup-node@v4`** — installs Node.js 20 onto the VM.
  `cache: npm` caches downloaded dependencies, keyed to the lockfile's
  hash, so future runs skip re-downloading everything from scratch and
  only pull what actually changed.
- **`npm ci`** — installs dependencies exactly as specified in
  `package-lock.json`. Fails loudly if the lockfile is out of sync with
  `package.json`, rather than silently rewriting it the way
  `npm install` would — the strict, reproducible, CI-appropriate
  install command.
- **`npm run lint`** — runs ESLint across the project; fails the job if
  any lint errors exist.
- **`npm run test -- --run`** — runs the full Vitest suite once and
  exits. The `-- --run` is necessary because the `test` script
  (`vitest`) defaults to watch mode, which never exits on its own —
  wrong for CI, which needs the job to finish and report pass/fail.
  `--run` is Vitest's own "run once and exit" flag, passed through the
  `--` separator so `npm run` forwards it to the underlying `vitest`
  command.
- **`npm run build`** — runs a full production build (`vite build`,
  which includes a TypeScript compilation check). Catches type errors
  that lint and tests alone might not touch, since it's the only step
  that requires the entire codebase to actually compile, not just the
  parts covered by tests.

Each step only runs if the one before it succeeded — a lint failure
means tests and build never even attempt to run, giving the fastest
possible failure signal.

---
