# GitHub Issue Index

The GitHub repository contains 27 issues with checkbox acceptance criteria. This index records their milestone assignment; GitHub remains the source of truth for issue bodies and status.

## M0 - Foundation

- #1 Confirm creative brief and launch constraints
- #2 Create source-asset and permissions checklist
- #3 Configure repository and milestone workflow

## M1 - Content Architecture

- #4 Audit all projects and finalize featured versus archive status
- #5 Approve sitemap and recruiter journeys
- #6 Draft and fact-check portfolio copy
- #8 Define typed project content model and media manifest

## M2 - Technical & Visual Foundation

- #7 Scaffold Astro and strict TypeScript application
- #9 Implement editorial design system
- #10 Build accessible parallax and motion primitives

## M3 - Homepage

- #11 Build editorial homepage narrative
- #12 Implement responsive navigation and page transitions

## M4 - Featured Case Studies

- #13 Build reusable featured case-study template
- #14 Publish All City Mile x Rebel Relays case study
- #15 Publish Your Mothers Run Crew case study
- #16 Publish Freaks of Nature x Alba Optics x Runaway Milano case study
- #17 Publish Mom, You Deserve Your Flowers case study
- #19 Publish Women's Self-Defense Initiative case study

## M5 - Archive & Profile

- #18 Build filterable visual project archive
- #20 Build About and capabilities experience
- #21 Implement contact and footer experience

## M6 - Quality & Launch

- #22 Complete accessibility audit
- #23 Optimize images, fonts, and runtime performance
- #24 Implement SEO, sharing, and privacy decisions
- #25 Complete automated test suite and broken-link checks
- #26 Configure and verify GitHub Pages deployment
- #27 Complete final editorial QA and v1.0.0 release

Every implementation issue includes milestone-specific deliverables and closure evidence. Issue #14 was independently fetched after creation to verify its label, milestone assignment, open state, and acceptance criteria.

## Working-tree readiness (not issue closure)

| Issue(s)    | Work present                                                                                            | Acceptance evidence still to record                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| #2          | Featured asset permissions, media selections, credits, and public checklist recorded                    | Review the issue’s full asset-inventory criteria and record acceptance; issue remains open   |
| #4–6        | Featured five and order fixed; five stories drafted from the questionnaire; archive candidates drafted  | Review archive selection/provenance and remaining project facts; related issues remain open  |
| #8          | Schema, data model, media manifest, and coordinated publication gate implemented                        | Run and record the issue’s validation/acceptance evidence; issue remains open                |
| #11–12      | Homepage narrative and accessible navigation/transitions implemented                                    | Record manual/editorial and implementation acceptance against each issue; issues remain open |
| #13         | Shared case-study template uses a natural-ratio hero beside copy at 1024px and above, then stacks below | Record manual template acceptance; issue remains open                                        |
| #14–17, #19 | Five records now contain approved copy, cleared media refs, credits, and publish together               | Record issue-specific editorial, media, and rendered-page acceptance; issues remain open     |

Known nonblocking publication omissions or archive gaps are tracked in `docs/CONTENT_QUESTIONNAIRE.md`, `docs/PROJECTS.md`, and `docs/ROADMAP.md`. Their presence does not mark an issue complete. The implementation summaries here report working-tree state only, not merged or committed work.

## Automated verification snapshot — 2026-10-01

`npm run check` passed: formatting, lint, type-check, content validation, unit tests (26/26), both builds, and 117 Playwright checks across Chromium, Firefox, and WebKit. Axe scanned the six published routes (home and five stories) plus the foundation fixture. Responsive overflow checks covered 320, 390, 768, 1023, 1024, 1280, 1440, and 1920 px; additional checks covered no-JavaScript and reduced-motion behavior, keyboard and touch flows, history restoration, story entrance replays, tall reveal targets, horizontal rail re-entry, and focused-link protection. Production checks verified internal routes and chapter fragments, image sources/srcsets, canonical base paths, collaborator credits and hover/focus behavior, touch thumbnails, natural-ratio contained story heroes, overview visibility, independent card zoom/parallax, and review-only content exclusion. `npm run check:external-links` previously passed with LinkedIn returning HTTP 200 and one unique offsite link. Earlier Sol review findings about reveal thresholds, duplicate navigation IDs, and CSS migration gaps were addressed. No new gpt6.1-sol-low review ran this iteration because agent slots were full; the root agent performed a read-only integration review. A visual review covered the five stories, homepage/Selected Work at desktop and mobile sizes, reduced-motion states, and portrait hero caps at 320, 768, 1024, and 1280px; no visual issues were reported. Screenshots are in `/tmp/portfolio-hover-hero-review/`. The full WCAG audit, physical-device mobile review, and Lighthouse evaluation remain outstanding.

These results record automated coverage only. Katherine’s editorial and crop review remain pending, along with a full WCAG audit, physical-device mobile review, and Lighthouse evaluation. All related issues remain open; no commit or deployment has occurred.
