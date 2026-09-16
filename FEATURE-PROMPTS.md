You are implementing ONE feature for the Catering CRM app. Refer to SPEC.md
in this repo for full context on the data model, tech stack, and overall app.

FEATURE: Ingredient Full UI-Wide Tamil Support (Tamil beside English)

Scope: SPEC.md §10.4. Largest item — do this incrementally, not as one giant commit. Suggested breakdown:

Acceptance criteria
8a. Set up the i18n approach (a simple label-pairs structure — e.g. { en: "Events", ta: "நிகழ்வுகள்" } — rendered together, not a toggle) and apply to shared layout/nav first
8b. Apply to Events screens (list, create/edit, detail tabs)
8c. Apply to Templates, Ingredients, Employees, Rental screens
8d. Apply to Global Settings and any remaining screens Acceptance criteria (per sub-step):
 Every label/button/heading in that screen shows English and Tamil together
 Layout doesn't break with the added text (test on mobile widths especially — bilingual labels are longer)
 Consistent visual treatment of the Tamil text (size/weight relative to English) across screens
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
