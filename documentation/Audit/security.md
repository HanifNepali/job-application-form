# Security Notes

Short-form. This is a client-only app with no backend, no auth, and no
server-side attack surface — most "security" here is either already
handled by the browser's own defaults, or genuinely not applicable.

## Data storage

- Form data persists in `localStorage`, in plaintext. No encryption —
  considered and rejected: with no backend, any encryption key would
  have to ship in the client bundle itself, sitting next to the data it
  protects, which defends against essentially nothing.

- Resume/cover letter files are never persisted at all (session-only,
  by design) — an accidental privacy positive, not just a UX constraint.

## Validation

- File type/size checks and all Zod schemas are client-side only,
  bypassable via devtools. Not a real risk here — there's no backend
  storage or processing for a bypass to damage. Validation exists for
  data integrity/UX, not as a security boundary.

## XSS

- No `dangerouslySetInnerHTML` anywhere in the codebase — confirmed, not
  assumed.

## Dependencies

- Standard npm supply-chain trust — no dependency-scanning currently
  wired into CI. Worth adding `npm audit` or Dependabot as a future CI
  step, not done yet.

## CI/CD secrets

- `OPENAI_API_KEY` / `GITHUB_TOKEN` scoping and the fork-PR secrets
  limitation — see `ai-pr-reviewer.md`.
- Prompt-injection guard in the AI reviewer's system prompt — same doc.

## Explicitly not applicable

- No auth system (nothing to authenticate against)
- No rate limiting (no API endpoints of our own)
- No CSRF (no server-side session/cookie state)

## Deployment (placeholder)

- HTTPS enforcement, env var handling, headers/CSP — to be filled in
  once Vercel is actually set up.
