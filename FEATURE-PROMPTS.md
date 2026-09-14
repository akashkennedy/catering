You are implementing ONE feature for the Catering CRM app. Refer to SPEC.md
in this repo for full context on the data model, tech stack, and overall app.

FEATURE: Project Scaffold

Scope: Next.js 16.3 (App Router) + TypeScript project init, Tailwind, Mantine, Zustand, React Hook Form + Zod, Lucide React installed and configured. Base layout with nav shell (empty routes per SPEC.md §5). Git repo initialized with a .gitignore. Acceptance criteria:
npm run dev runs with no errors
Mantine theme provider wraps the app
Empty pages exist for all routes in SPEC.md §5 (can just render a placeholder heading)
Tailwind + Mantine don't visually conflict (test one styled button)
Initial commit made

DO NOT:

- Touch code for other features not listed above
- Change the data model beyond what this feature needs
- Add UI, routes, or store slices for future features
- Install new dependencies unless explicitly required for this feature (ask first if unsure)

BEFORE CODING:

1. Re-read the relevant section of SPEC.md and confirm you understand the data shape.
2. Look at existing components/store slices already in the repo and match their
   patterns (naming, folder structure, Mantine usage, Zustand slice style) —
   don't introduce a new pattern for something already established.

AFTER CODING:

1. Run `npm run lint` and `npx tsc --noEmit` — fix any errors before continuing.
2. Self-review your diff against the acceptance criteria below. List each
   criterion and state met/not met.
3. Describe how you manually verified the feature works (what you'd click
   through to confirm it).
4. If everything passes: stage only files relevant to this feature, commit
   with message format `feat(<scope>): <description>`, and push to the
   current branch.
5. If something doesn't pass, stop and report what's blocking — do not
   commit broken or incomplete work.
