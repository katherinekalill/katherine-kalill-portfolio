# Katherine Kalill Portfolio

An editorial, visual-first portfolio for Katherine Kalill's work across brand experience, community, partnerships, sport, fashion, and culture.

## Product direction

**The Business of Human Connection**

The site combines fashion-level art direction and restrained parallax with warm, locally grounded storytelling. Project names and human insights lead; brand names and metrics provide context and proof.

## Featured work

1. All City Mile x Rebel Relays
2. Your Mothers Run Crew
3. Freaks of Nature x Alba Optics x Runaway Milano
4. Mom, You Deserve Your Flowers
5. Women's Self-Defense Initiative with New Balance and REI

The homepage features all five approved case studies as one coordinated release. The `/archive/` index initially contains only those five published stories; other professional, contract, community, owned-platform, and academic records stay out until their ownership, facts, media, and permissions are cleared. Unknown dates stay unlisted.

## Audience and target roles

Primary role families:

- Brand experience and experiential marketing
- Community and culture marketing
- Partnerships and athlete marketing
- Events and activations
- Junior brand management

Priority employer groups include performance and running brands (On, ASICS, Bandit, adidas), fashion and luxury houses (Prada, Miu Miu, Moncler, Off-White, Longchamp), and consumer technology or platform brands (Google, Microsoft, Revolut).

## Technical foundation

- Astro with strict TypeScript
- Typed Astro project content and media manifest
- CSS design tokens and responsive layouts
- Lightweight, accessible parallax and scroll reveals
- Vitest and Playwright
- GitHub Actions and GitHub Pages

Manrope is self-hosted as a variable WOFF2 font, preloaded by the shared layout, and distributed under the SIL Open Font License. Its license is included at `src/assets/fonts/MANROPE-LICENSE.txt`.

## Run locally

Use Node.js 24 (the repository includes an `.nvmrc`) and npm:

```sh
nvm install
nvm use
npm ci
npm run dev
```

Open <http://localhost:4321/katherine-kalill-portfolio/>. Astro hot reloads local changes as you edit.

Useful local checks:

```sh
npm run test          # Vitest unit tests
npm run lint          # ESLint
npm run typecheck     # Astro and TypeScript diagnostics
npm run build         # Production build in dist/
npm run check:external-links # Check external links in the built dist/ site
```

Build the site before running the external-link check. Access-restricted responses (such as HTTP 403) and rate limits are inconclusive; verify those destinations manually in a browser or from another network.

For browser tests, install the Playwright browsers once, then run the end-to-end suite. It builds the production site and isolated foundation preview, starts local servers on ports 4321 and 4322, and runs Chromium, Firefox, and WebKit tests:

```sh
npx playwright install chromium firefox webkit
npm run test:e2e
```

After the coordinated release, the standard homepage links to all five `/work/<slug>/` case studies. Developer-only story fixtures are not needed for normal review.

Run the full validation sequence with `npm run check`. To inspect a production build locally, run `npm run build` followed by `npm run preview`, then open <http://localhost:4173/katherine-kalill-portfolio/>. The static preview server uses Vite's default port 4173; the development server uses 4321.

## Confirmed public-facing choices

- Visual tone: balanced fashion-editorial and intimate/community-led
- Public contact: <katherinerkalill@gmail.com> and LinkedIn at <https://www.linkedin.com/in/katherine-kalill/>; phone omitted for privacy
- Hosting: GitHub Pages at `https://katherinekalill.github.io/katherine-kalill-portfolio/`, with the repository kept private during development and allowed to become public at launch
- Domain: default GitHub Pages URL for v1
- Analytics: omitted by default unless explicitly approved
- Career details: the About page links to LinkedIn for the full professional history; no resume PDF or download is published
- Framework: Astro with strict TypeScript, typed content collections, custom accessible parallax, and reduced-motion support

The owner approved the supplied Drive assets for use on the public portfolio and in a public repository. Credit the selected All City Mile photos to Cooper Reid; the other selected supplied media is approved without required attribution. No additional asset permission or credit approvals are pending for these selections, and no employer or client restrictions are known.

M1 working artifacts: [asset checklist](docs/ASSET_CHECKLIST.md), [content follow-ups](docs/CONTENT_QUESTIONNAIRE.md), [positioning and content drafts](docs/CONTENT_DRAFTS.md), [sitemap and recruiter journeys](docs/INFORMATION_ARCHITECTURE.md), and [typed content model](docs/CONTENT_MODEL.md).

## Delivery workflow

Each milestone follows the same sequence:

1. Confirm any creative or content decisions.
2. Implement the milestone with the current GPT-6-Luna model.
3. Run lint, typecheck, tests, and production build.
4. Review independently with GPT-6.1-Sol-Low when available.
5. Resolve blockers and re-review.
6. Commit and push only after acceptance criteria pass.

See [docs/ROADMAP.md](docs/ROADMAP.md) for the complete delivery plan, [docs/PROJECTS.md](docs/PROJECTS.md) for the provisional project inventory, and [docs/ISSUE_INDEX.md](docs/ISSUE_INDEX.md) for the GitHub backlog map.

## Status

M0–M4 implementation is in the local commit history. The homepage, five case studies, archive, and About experience are present locally; M5 changes remain uncommitted. Automated acceptance, Katherine’s editorial review, and deployment are tracked separately, and no issue closure is implied.
