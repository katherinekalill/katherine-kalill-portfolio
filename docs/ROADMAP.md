# Portfolio roadmap and acceptance readiness

## Milestone 0 — Foundation and decisions

**Confirmed v1 constraints:** default GitHub Pages URL; no custom domain or analytics; public LinkedIn and email; phone omitted; no resume PDF download; Astro, strict TypeScript, and accessible custom parallax. The About narrative is concise, while LinkedIn remains the detailed career-history link. The visual reference and balanced editorial/community tone are recorded in the project brief.

- **#1 Brief and launch constraints:** recorded in the project plan.
- **#2 Source-asset and permissions checklist:** public-use and credit decisions for the seven published projects are recorded in `docs/ASSET_CHECKLIST.md` and the media manifest. Keep the issue open until its acceptance criteria are reviewed and the final asset inventory is accepted.
- **#3 Repository and milestone workflow:** already configured; do not infer issue closure from this summary.

## Milestone 1 — Content strategy and information architecture

- **#4 Project audit:** the public inventory contains seven featured projects. The homepage featured order is fixed.
- **#5 Sitemap and recruiter journeys:** approved structure is documented in `docs/INFORMATION_ARCHITECTURE.md`; Archive and About routes are in the M5 implementation.
- **#6 Portfolio copy:** approved copy for the seven public projects is in `src/data/projects.json`; public content and editorial safeguards are documented in `docs/CONTENT_DRAFTS.md` and `docs/CONTENT_QUESTIONNAIRE.md`.
- **#8 Typed project and media model:** working-tree schema, loader, publication gate, and case-study presentation fields are implemented. Issue acceptance checks have not been recorded here.

Do not close M1 issues solely because copy, documents, or implementation exist. Record issue-specific evidence against each acceptance criterion first.

## Milestone 2 — Technical scaffold and visual system

Astro, strict TypeScript, the editorial design system, and accessible motion/navigation primitives are implemented in the working tree. The design references and ten-part source framework are recorded in `docs/DESIGN_REFERENCES.md`. Issues #9 and #10 remain open for manual acceptance; this implementation status does not record their acceptance.

## Milestone 3 — Homepage experience

- **#11 Homepage narrative:** implemented with approved positioning, capabilities, featured work, and contact content. Issue #11 remains open for manual acceptance and Katherine’s editorial review.
- **Homepage collaborators:** fine-pointer desktop previews show only on the hovered or focused row, keyboard focus takes precedence, and touch layouts retain one static thumbnail per row. All City Mile credits remain on the case study and in the footer link, not on homepage rows; manual acceptance remains pending.
- **#12 Navigation and transitions:** implemented, including keyboard/touch behavior and reduced-motion handling. Issue #12 remains open for manual acceptance.

## Milestone 4 — Featured case studies

- **#13 Reusable case-study template:** implemented with named content sections, gallery chapter placements, responsive local media, and credits. At 1024px and above, compact story copy sits beside a natural-ratio contained hero; narrower layouts stack the intro and hero before the full story body. Issue #13 remains open for manual template acceptance.
- **#14 All City Mile, #15 Your Mothers Run Crew, #16 Freaks of Nature, #17 Mom, You Deserve Your Flowers, #19 Women’s Self-Defense:** approved copy, selected media, credits, and gallery placements are present in the fixed featured order.

Unknown or unapproved details are omitted from public copy. Add new facts only after verification and approval.

## Milestone 5 — Archive, profile, contact

The M5 routes and page content are implemented; issue acceptance remains separate.

- **#18 Archive:** `/archive/` lists seven public projects, with the Community, Partnerships, and Experiences filters matching all seven. Digital matches For All Mothers and Freaks of Nature; Retail matches Women’s Self-Defense; Owned Platform matches Your Mothers Run Crew; Luxury Strategy is empty. A selected category updates the `discipline` query parameter and browser history. Filter controls are progressively enhanced, and all seven cards remain available without JavaScript.
- **#20 About:** a non-timeline narrative summarizes resume-supported experience, the Austin run community, @kikhianti, and studies at Milano Fashion Institute. Keep the education wording neutral and do not claim graduation, current enrollment, current role, or current location. Link to LinkedIn for detailed history; do not publish a resume download, private source, address, phone number, or unresolved resume metrics.
- **#21 Contact:** shared Contact navigation, About and homepage contact links, footer email and LinkedIn, and the All City Mile `#credits` anchor are implemented locally.

M5 automated gates and independent code reviews passed. Issue acceptance is tracked separately; implementation status alone does not imply issue closure or deployment.

The current public inventory contains seven project records and 30 public media records. Automated validation, builds, and browser checks are tracked independently; report only the results for the current source revision.

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

- Keep the featured order fixed: All City Mile, Your Mothers Run Crew, Freaks of Nature, You Deserve Your Flowers, Women’s Self-Defense, For All Mothers, USA Track Championships.
- Publish all seven featured stories in a coordinated release.
- Do not infer the Freaks year or assign Your Mothers Run Crew’s August/November dates to individual activations.
- Present approved retail comparisons as concurrent performance, not as outcomes caused by an event.
- Keep source PDFs, local originals, private evidence, and private file paths out of tracked documentation and the production site.
- Use the supplied resume only as private source for approved About facts. Link to LinkedIn for the full career history; do not store or publish a resume PDF, personal address, or phone number.
