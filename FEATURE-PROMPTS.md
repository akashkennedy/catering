You are implementing ONE feature for the Catering CRM app. Refer to SPEC.md
in this repo for full context on the data model, tech stack, and overall app.

FEATURE: Global Settings + Ingredient Master List

Scope: SPEC.md §3.3, §3.7, §4.7. Ingredient CRUD (name, Tamil name, unit, global price) stored in Zustand+localStorage. Global Settings screen to edit prices and default language. Acceptance criteria:
Can add/edit/delete an ingredient with all fields
Data survives a page refresh (localStorage persistence working)
Global settings screen lets you edit default language and see/edit ingredient prices
Mobile: list becomes stacked cards below ~640px

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
