# Magic Link Lab — Cursor agent notes

## Project

Tiny public dashboard that drafts a P0–P3 test plan from a fake PR (email login link to a gated article), scores it against a golden, retries with critic feedback, then passes or escalates after 3 attempts.

## Voice

Public copy is clean and professional at all times. Chat may use private background to shape P0s. Files that ship stay generic.

- README, UI, commits, comments, and sample data: hiring-manager tone
- Never name employers, real products, customers, or live auth hosts
- Never commit `.env`, tokens, login URLs, or device/API identifiers
- No workplace war stories in the repo

## Stack

- Vite + React + TypeScript
- Deterministic drafter + scorer (no API key)
- Vitest for the loop engine

## Conventions

- Keep the gated-article teaching story at **50% then 100% Pass** (attempt 1 misses pending + dead-link)
- Teaching golden mixes **web + iOS app + Android app** in the same plan (not a Web-only silo)
- **No shared cookie.** Ungating on web does not sign them in on iOS or Android. Each surface needs its own magic link. Same-surface session is not prompted again. Web-to-phone is completing **that** tap on the phone, not inheriting the laptop cookie
- Keep the iOS Mail-tap PR as the **Needs human** story. Briefs must confirm which side (API vs client)
- Comment embed is a sibling PR, not the teaching story. Site vs embed in the **same browser**. App login is separate
- UI is step-through: one click = one attempt. Do not auto-run all retries in a single click
- Human brief (theory / confirm / fix path) shows only on **Needs human**, and only for missed goldens that have a `brief`
- App chrome follows personal skill `portfolio-app-style` (Release Gate Lab look)
- Do not mix email + password + Remember me here. That lives in Loop Lab
- Do not add Sign in with Google to v1
- Never commit `.env`, tokens, or employer/customer data

## Scripts

- `npm run dev` — local dashboard
- `npm test` — loop engine tests
- `npm run build` — production bundle
- `npm run preview` — preview built app

## Related docs

- `README.md` — interview framing + quick start
- `docs/PAPER_WALKTHROUGH.md` — gated-article story on paper
