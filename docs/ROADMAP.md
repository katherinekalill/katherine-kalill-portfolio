# Portfolio Roadmap

## Milestone 0 - Foundation and decisions

- Confirm creative brief, target roles, featured projects, public contact details, and launch constraints.
- Configure the private repository, milestones, issues, and planning documentation.
- Confirm GitHub Pages visibility requirements before launch.

Confirmed: Aldo Mazzilli reference; balanced editorial/community tone; public LinkedIn (https://www.linkedin.com/in/katherine-kalill/); public email (katherinerkalill@gmail.com); phone omitted for privacy; private development with permission to make the repository public at launch; default GitHub Pages URL (https://katherinekalill.github.io/katherine-kalill-portfolio/); no custom domain for v1; no analytics; downloadable resume; Astro, strict TypeScript, and custom accessible parallax. No employer or client restrictions are currently known. Publication permission for the supplied Drive assets is recorded separately from per-file ownership and credit evidence.

The five projects remain provisional until the asset, role, and evidence audit. Resume file is pending. Per-asset ownership, photographer credits, and third-party permissions remain to be verified. Do not close M0/#2 until its evidence acceptance criteria are met.

## Milestone 1 - Content strategy and information architecture

- Audit all work and finalize the featured five versus archive.
- Approve the sitemap and recruiter journeys.
- Define a typed project and media model.
- Draft concise portfolio copy from available evidence; prepare project questions for Katherine; verify remaining dates, roles, credits, and claims from her responses and source records.
- Keep M1/#8 open until the M2 scaffold runs its content schema and publication checks.

## Milestone 2 - Technical scaffold and visual system

- Scaffold Astro with strict TypeScript, linting, formatting, and tests using Node 24 LTS.
- Implement the editorial design system and responsive component primitives.
- Implement accessible parallax and motion that respect reduced-motion preferences.
- Build a non-production foundation review page so every visual primitive and motion behavior can be reviewed without publishing draft work.

The M1 questionnaire and content-model specification are in `docs/CONTENT_QUESTIONNAIRE.md` and `docs/CONTENT_MODEL.md`. The approved sitemap and recruiter journeys are in `docs/INFORMATION_ARCHITECTURE.md`. The copy draft is in `docs/CONTENT_DRAFTS.md`; private source/evidence records are not stored in this public-capable repository.

## Milestone 3 - Homepage experience

- Build the hero, point of view, featured work sequence, capabilities, and closing contact area.
- Build accessible navigation, responsive behavior, and restrained page transitions.

## Milestone 4 - Featured case studies

- Build the reusable case-study template.
- Publish and verify the five featured project stories.

## Milestone 5 - Archive, profile, resume, and contact

- Build the filterable visual archive.
- Build About and capabilities content.
- Add resume download and public contact details.

## Milestone 6 - Quality and launch

- Complete accessibility, performance, SEO, privacy, and automated-test work.
- Configure GitHub Pages deployment.
- Complete final editorial QA and tag `v1.0.0`.

## Case-study framework

1. Context
2. Human insight
3. Emotional intention
4. Opportunity or constraint
5. The idea
6. Katherine's role
7. Experience and execution
8. Measurable impact
9. What changed or what was learned
10. Credits and collaborators

## Quality gates

- No invented metrics, unsupported claims, or ambiguous authorship.
- No confidential or unapproved assets.
- No dead code, unused dependencies, placeholder starter files, or console errors.
- Keyboard access, WCAG AA contrast, semantic headings, alt text, and reduced-motion support.
- Responsive QA from 320px mobile through wide desktop.
- Target Lighthouse mobile scores: Performance 90+, Accessibility 95+, Best Practices 95+, SEO 95+.
- Browser support: current Safari, Chrome, and Firefox plus current iPhone-size Safari behavior.
- Performance budget proposal: no unnecessary client framework, no scroll-hijacking library, and no unoptimized original photography shipped to production.
