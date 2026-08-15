# Deploy Workflow — Reference

Documents what `.github/workflows/deploy.yml` does, step by step, and
how it fits into the overall CI → CD chain for this project.

---

## The overall flow

1. Developer opens a PR from a feature branch into `dev`. **CI** runs
   (lint, test, build).
2. Once approved, merged into `dev`.
3. For a production release, a PR is opened from `dev` into `main`.
   **CI** runs again on this PR.
4. Once merged into `main`, the `push` event causes **CI** to run once
   more, this time against `main` itself.
5. When that `main`-branch CI run **completes successfully**, this
   **Deploy** workflow fires automatically and ships the build to
   Vercel Production.

Deployment is deliberately **not** handled by Vercel's own automatic
Git integration — that's been explicitly disabled (`vercel.json`'s
`git.deploymentEnabled` setting) so that a broken build can never reach
Production just because Vercel deployed independently of whether CI
actually passed. This workflow is the only path to a live deploy.

---

## `deploy.yml`

```yaml
name: Deploy

on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]
    branches: [main]
  workflow_dispatch:

concurrency:
  group: deploy-${{ github.event.workflow_run.head_branch }}
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'success'
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel environment
        run: |
          vercel pull \
            --yes \
            --environment=production \
            --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build
        run: |
          vercel build \
            --prod \
            --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy
        run: |
          vercel deploy \
            --prebuilt \
            --prod \
            --token=${{ secrets.VERCEL_TOKEN }}
```

---

## What each piece does

### `on: workflow_run`

```yaml
workflow_run:
  workflows: ["CI"]
  types: [completed]
  branches: [main]
```

This is the core of the "deploy only after CI passes" design. It doesn't
trigger on a push or PR directly — it triggers on **another workflow
finishing**, matched by name (`"CI"`, the `name:` field inside
`ci.yml`). `branches: [main]` scopes this to only fire when the
completed CI run was for `main` — a CI run finishing on `dev` never
reaches this trigger at all, so no separate branch check is needed
inside the job itself.

### `on: workflow_dispatch`

Allows manually running this workflow from the GitHub Actions UI,
independent of any CI run — used for testing the deploy steps in
isolation without needing a real merge to `main` first.

### `concurrency`

```yaml
group: deploy-${{ github.event.workflow_run.head_branch }}
cancel-in-progress: true
```

If a second deploy run somehow starts while one for the same branch is
still in progress, the newer run cancels the older one rather than
letting two deploys race each other.

### `if: github.event_name == 'workflow_dispatch' || ...conclusion == 'success'`

The actual gate. `workflow_run` fires regardless of whether CI passed or
failed — this condition is what stops every step below from running
unless either: (a) this was a manual test run, where there's no CI
result to check, or (b) the CI run that just completed actually
succeeded. A failed or cancelled CI run means this evaluates to `false`
and the job does nothing.

### `Checkout code`

Clones the repository onto the runner. Uses the default ref (whatever's
currently at the tip of `main`) rather than pinning to a specific commit
SHA — acceptable here since this only ever runs immediately after a
`main`-targeted CI success, or manually, in both cases `main`'s current
tip is the intended commit to deploy.

### `Install Vercel CLI`

Installs the `vercel` command globally on the runner, so the following
steps can use it directly.

### `Pull Vercel environment`

```
vercel pull --yes --environment=production --token=...
```

Downloads the project's Vercel configuration and environment variables
for the Production environment, authenticated via `VERCEL_TOKEN`
(a repo secret — see below). This links the checked-out code to the
correct Vercel project/settings before building.

### `Build`

```
vercel build --prod --token=...
```

Runs the actual production build **through Vercel's own build
pipeline** (not just `npm run build` directly) — this produces build
output in Vercel's expected format/location for the next step to deploy
as-is.

### `Deploy`

```
vercel deploy --prebuilt --prod --token=...
```

Deploys the build output produced by the previous step. `--prebuilt` is
what tells Vercel to use the artifacts already built, rather than
re-running its own build process a second time — avoiding a duplicate
build (once here, and what would otherwise be a second implicit one
during deploy).

---

## Secrets required

One repo secret used throughout: `VERCEL_TOKEN` — a personal access
token generated from Vercel's dashboard (Account Settings → Tokens),
added under the GitHub repo's **Settings → Secrets and variables →
Actions**. Authenticates the CLI as your Vercel account/team for all
three `vercel` commands above.

(`VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`, obtained via `npx vercel link`
locally, are used to link the project. The value obtained from `repo.json` inside the `.vercel` folder is used to create these secrets in Github repo's secrets)

---

## Why Vercel's own Git integration is disabled

`vercel.json` sets `git.deploymentEnabled` to `false` for `dev` and
`main`. Without this, Vercel would deploy automatically and
independently on every push to those branches — in parallel with, and
regardless of, whatever this CI-gated workflow decides. Disabling it
makes this workflow the sole path to a live deployment, so a failing
build can never reach Production.
