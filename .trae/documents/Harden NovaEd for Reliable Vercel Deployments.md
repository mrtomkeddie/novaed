## Deployment Audit Overview
- Verify App Router structure and case-sensitive imports; remove files that can confuse Vercel’s build.
- Eliminate server/edge runtime pitfalls and browser-only APIs in server components.
- Ensure environment variables are correctly configured in Vercel (not via dotenv in app code).
- Run a local production build to validate before pushing.

## Critical Fixes
- Remove `dotenv/config` from server components to avoid edge/runtime issues
  - `src/app/layout.tsx:2` currently imports `dotenv/config`. Next/Vercel already load env; importing dotenv in app code is unnecessary and can break edge runtimes.
  - Also remove in duplicate artifact `vercel/path0/src/app/layout.tsx:1` after cleaning that directory.
- Standardize SubjectCard import/export to prevent undefined component renders
  - Use a default export and a consistent PascalCase filename: `src/components/SubjectCard.tsx:19`.
  - Confirm import in Free Play page: `src/app/(app)/free-play/page.tsx:2`.
  - Guard against missing icons (already done) to prevent `undefined` elements.
- Fix potentially brittle dynamic route typing
  - Update `src/app/(app)/subjects/[slug]/page.tsx:1-9` to use `{ params: { slug: string } }` and remove `await params`.

## Runtime Hardening
- Explicitly set Node runtime for API routes that use server-only libraries
  - Add `export const runtime = 'nodejs'` at the top of each route:
    - `src/app/api/get-ai-tutor-feedback/route.ts`
    - `src/app/api/generate-lesson-summary/route.ts`
    - `src/app/api/get-user-progress/route.ts`
    - `src/app/api/get-all-user-progress/route.ts`
    - `src/app/api/get-user-profile/route.ts`
    - `src/app/api/log-progress/route.ts`
- Avoid hydration mismatches
  - Remove or client-only gate any non-determinism in server-rendered components (e.g., the random progress calculation in `src/components/SubjectCard.tsx`), or add `"use client"` to that component.

## Repository Cleanup
- Remove build artifacts checked into the repo
  - Delete the `vercel/` directory from the repository; it’s a past deployment artifact and can confuse tooling.
  - Add `vercel/` to `.gitignore` (similar to how `.vercel` is ignored).
- Ensure assets live only in root `public/` (no `src/public` duplication). Move or delete duplicates to avoid confusion.

## Environment Configuration
- Configure the following in Vercel Project Settings → Environment Variables:
  - `OPENAI_API_KEY` (required by `src/ai/genkit.ts:7-8`).
  - Optional: `FIREBASE_PROJECT_ID` if later used.
- Keep `.env.local` out of Vercel’s build; Vercel loads env from its settings.

## Validation Steps
- Run locally: `npm run build` to confirm a clean production build.
- After applying fixes, push to GitHub and trigger a Vercel deploy.
- If a prerender error recurs, enable more verbose logs and confirm:
  - No browser-only APIs (`window`, `document`) are referenced in server components.
  - All page/component imports resolve to existing files with correct casing.

## Deliverables
- Code updates (imports/exports, runtime flags, route typing) and repo cleanup.
- Verified local production build output.
- Instructions for Vercel env setup and deployment verification.

Would you like me to apply these changes and push them so you can redeploy immediately?