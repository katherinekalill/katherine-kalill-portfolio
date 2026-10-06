# Portfolio roadmap and acceptance readiness

## Milestone 0 — Foundation and decisions

**Confirmed v1 constraints:** default GitHub Pages URL; private repository development with permission to make the repository public at launch; no custom domain or analytics; public LinkedIn and email; phone omitted; no resume PDF download; Astro, strict TypeScript, and accessible custom parallax. The supplied resume supports a short About narrative, while LinkedIn remains the detailed career-history link. The visual reference and balanced editorial/community tone are recorded in the project brief.

- **#1 Brief and launch constraints:** recorded in the project plan.
- **#2 Source-asset and permissions checklist:** public-use and credit decisions for the five featured projects are recorded in `docs/ASSET_CHECKLIST.md` and the media manifest. Keep the issue open until its acceptance criteria are reviewed and the final asset inventory is accepted.
- **#3 Repository and milestone workflow:** already configured; do not infer issue closure from this summary.

## Milestone 1 — Content strategy and information architecture

- **#4 Project audit:** the featured five are fixed in the approved order. Archive work remains draft; Oak Bay uses the existing Western Canada record and Urban Hike with Sara stays separate. Archive eligibility and missing provenance still need review.
- **#5 Sitemap and recruiter journeys:** approved structure is documented in `docs/INFORMATION_ARCHITECTURE.md`; Archive and About routes are in the M5 implementation.
- **#6 Portfolio copy:** source-backed copy for the five stories is in `src/data/projects.json`; accepted facts and omissions are documented in `docs/CONTENT_DRAFTS.md`. Remaining follow-up items are listed in `docs/CONTENT_QUESTIONNAIRE.md`.
- **#8 Typed project and media model:** working-tree schema, loader, publication gate, and case-study presentation fields are implemented. Issue acceptance checks have not been recorded here.

Do not close M1 issues solely because copy, documents, or implementation exist. Record issue-specific evidence against each acceptance criterion first.

## Milestone 2 — Technical scaffold and visual system

Astro, strict TypeScript, the editorial design system, and accessible motion/navigation primitives are implemented in the working tree. The design references and ten-part source framework are recorded in `docs/DESIGN_REFERENCES.md`. Issues #9 and #10 remain open for manual acceptance; this implementation status does not record their acceptance.

## Milestone 3 — Homepage experience

- **#11 Homepage narrative:** implemented with approved positioning, capabilities, featured work, and contact content. Issue #11 remains open for manual acceptance and Katherine’s editorial review.
- **Homepage collaborators:** fine-pointer desktop previews show only on the hovered or focused row, keyboard focus takes precedence, and touch layouts retain one static thumbnail per row. Credit notes derive from available credited media; manual acceptance remains pending.
- **#12 Navigation and transitions:** implemented, including keyboard/touch behavior and reduced-motion handling. Issue #12 remains open for manual acceptance.

## Milestone 4 — Featured case studies

- **#13 Reusable case-study template:** implemented with named content sections, gallery chapter placements, responsive local media, and credits. At 1024px and above, compact story copy sits beside a natural-ratio contained hero; narrower layouts stack the intro and hero before the full story body. Issue #13 remains open for manual template acceptance.
- **#14 All City Mile, #15 Your Mothers Run Crew, #16 Freaks of Nature, #17 Mom, You Deserve Your Flowers, #19 Women’s Self-Defense:** source-backed copy, cleared selected media, credits, and gallery placements are present. The five project records are set to `published` together. Issue acceptance, final editorial review, media rendering/repository checks, and outstanding questions are not represented as complete by that data status.

Known follow-ups remain: month-to-partner mapping for Your Mothers Run Crew, the Freaks event year, underlying REI comparison values/window, instructor name/credit preference, and provenance for the other archive candidates. Do not close the related issues until their criteria are met; omission of a nonessential unknown from public copy does not resolve the evidence request.

## Milestone 5 — Archive, profile, contact

The M5 routes and page content are implemented in the working tree; their issue acceptance remains open.

- **#18 Archive:** `/archive/` initially lists only the five currently published stories. Its Community, Partnerships, and Experiences filters match all five; Digital matches Freaks of Nature; Retail matches Women’s Self-Defense; Owned Platform matches Your Mothers Run Crew; Luxury Strategy is empty. A single selected category updates the `discipline` query parameter and browser history. Filter controls are progressive enhancement, and all five cards remain available without JavaScript. Do not publish current contract or academic drafts solely to fill an empty category.
- **#20 About:** a non-timeline narrative summarizes resume-supported experience, the Austin run community, @kikhianti, and studies at Milano Fashion Institute. Keep the education wording neutral and do not claim graduation, current enrollment, current role, or current location. Link to LinkedIn for detailed history; do not publish a resume download, private source, address, phone number, or unresolved resume metrics.
- **#21 Contact:** shared Contact navigation, About and homepage contact links, footer email and LinkedIn, and the All City Mile `#credits` anchor are implemented locally.

M5 automated gates and independent code reviews have passed. The code remains uncommitted and undeployed; obtain Katherine’s editorial acceptance and record issue-specific evidence before any closure. Oak Bay and other non-featured records remain drafts until their facts, media, metrics, ownership context, and permissions are cleared.

Verification ran through separate and resumed invocations: formatting, lint, typecheck, content validation for 21 project and 21 media records, 30 unit tests, both builds, and 123 Playwright checks across Chromium, Firefox, and WebKit passed. The external-link check verified LinkedIn at HTTP 200. Sol’s individual and final combined reviews found no remaining findings. The visual review found no overflow at 320, 390, 768, 1280, and 1440px and confirmed the archive’s 4:3 cards and reduced-motion behavior. This was not one uninterrupted successful `npm run check` invocation.

## Milestone 6 — Quality and launch

The full WCAG audit, physical-device mobile review, Lighthouse evaluation, GitHub Pages deployment, and final editorial acceptance remain outstanding. Passing automated checks do not close issues or imply deployment.

## Quality gates

- Meet WCAG AA contrast and keyboard access; use semantic headings and meaningful alt text; respect reduced-motion preferences.
- Review responsive behavior from 320px mobile through wide desktop, including current Safari, Chrome, Firefox, and iPhone-size Safari.
- Target Lighthouse mobile scores of Performance 90+, Accessibility 95+, Best Practices 95+, and SEO 95+.
- Keep SEO, sharing, and privacy decisions explicit; do not add analytics without a separate approved decision.
- Do not ship unoptimized original photography or unnecessary client-side framework code.
- Do not include unsupported claims, private evidence, confidential material, or uncleared assets in production.

## Case-study editorial framework

1. Context
2. Human insight
3. Intention
4. Opportunity
5. Idea
6. Katherine’s role
7. Experience and execution
8. Measurable impact
9. Learning, only when supplied
10. Credits and collaborators

## Release guardrails

- Keep the featured order fixed: All City Mile, Your Mothers Run Crew, Freaks of Nature, You Deserve Your Flowers, Women’s Self-Defense.
- Keep the five featured stories in a coordinated release.
- Keep the initial archive index limited to the five published stories; other project records remain unavailable until independently cleared.
- Do not infer the Freaks year or assign Your Mothers Run Crew’s August/November dates to individual activations.
- Describe REI’s 225% comparison as concurrent March year-over-year retail growth, not event-caused; omit the conflicting 420% figure.
- Omit All City Mile’s 275% growth claim because the baseline is unclear; use the questionnaire’s corrected 300+ runners, 30+ volunteers, sold-out status, and $5,000 Girls on the Run figure.
- Keep source PDFs, local originals, private evidence, and private file paths out of tracked documentation and the production site.
- Use the supplied resume only as private source for approved About facts. Link to LinkedIn for the full career history; do not store or publish a resume PDF, personal address, or phone number.
