# Information architecture and recruiter journeys

## Public routes

| Route                             | Purpose                                                                             | Local status |
| --------------------------------- | ----------------------------------------------------------------------------------- | ------------ |
| `/`                               | Positioning, seven featured stories, capabilities, archive and About links, contact | Implemented  |
| `/work/all-city-mile/`            | All City Mile × Rebel Relays case study                                             | Implemented  |
| `/work/your-mothers-run-crew/`    | Your Mothers Run Crew case study                                                    | Implemented  |
| `/work/freaks-of-nature/`         | Freaks of Nature case study with Alba Optics and Runaway Milano as collaborators    | Implemented  |
| `/work/you-deserve-your-flowers/` | Mom, You Deserve Your Flowers case study                                            | Implemented  |
| `/work/womens-self-defense/`      | Women’s Self-Defense Initiative case study                                          | Implemented  |
| `/work/for-all-mothers/`          | Joie Baby × For All Mothers — Making Space for Motherhood in Elite Sport            | Implemented  |
| `/work/usa-track-championships/`  | USA Track Championships (2025, Eugene)                                              | Implemented  |
| `/archive/`                       | Filterable index of all seven featured projects                                     | Implemented  |
| `/about/`                         | Narrative biography, experience, selected work, contact                             | Implemented  |
| not found                         | Helpful 404 with a working link home                                                | Implemented  |

The public archive contains the seven projects listed above. Homepage hero verification is complete: all 144 browser scenarios were verified across the full run and focused reruns, though not in one clean full-suite invocation. Type, content, unit, formatting, lint, and build checks also passed. Manual acceptance remains pending. The site's static routes keep trailing slashes. Local and build configuration add the `/katherine-kalill-portfolio` base path exactly once; this does not indicate deployment.

## Navigation and shared contact

The shared primary navigation is **Work**, **About**, and **Contact**. Work links to `#work` on the homepage and back to the homepage's featured work from story and About pages. About links to `/about/`; Contact links to the homepage contact section. The active-page and active-section states follow the current route. The footer includes public email, LinkedIn, and a credit link to the All City Mile credits section. About and homepage contact blocks expose email and LinkedIn; no phone number or resume download is published.

## Recruiter journeys

### Homepage and selected work

The homepage opens with Katherine Kalill over a monochrome, cycling image hero, followed by positioning and a point of view, then a seven-card horizontal rail in the approved story order: All City Mile, Your Mothers Run Crew, Freaks of Nature, You Deserve Your Flowers, Women’s Self-Defense, For All Mothers, and USA Track Championships. Each card links to its full case study. Native touch scrolling and links work without JavaScript; enhanced previous/next controls move one card, disable at the rail ends, respect reduced motion, and preserve rail position on browser back. The seven Brands and collaborators rows link to the related published story chapter where one is defined. Fine-pointer desktop previews respond to hover and keyboard focus, with focus taking priority; touch and no-JavaScript views keep one static thumbnail per row. Cooper Reid’s All City Mile credit remains on the case study and in the footer link; it does not appear in homepage collaborator or featured story cards.

Homepage links also lead to Archive and About. Project cards, routes, and filters are generated only from the seven records in the public inventory.

### Archive

The archive contains seven projects and eight single-select filter options: All, Community, Partnerships, Experiences, Digital, Retail, Luxury Strategy, and Owned Platform. A selected category is represented by the `discipline` query parameter. Browser back and forward restore the selected filter; choosing All removes that parameter. An empty category shows a reset action. Without JavaScript, filter controls stay hidden and all seven project cards remain visible.

Current publication taxonomy assigns Community, Partnerships, and Experiences to all seven projects; Digital to For All Mothers and Freaks of Nature; Retail to Women’s Self-Defense; and Owned Platform to Your Mothers Run Crew. Luxury Strategy is intentionally empty.

### About

The About page presents a concise narrative without an employment timeline. It may use supported experience at New Balance, VMware, and Katherine Kalill Productions; founding Your Mothers Run Crew in Austin; the @kikhianti platform's running, travel, fashion, and life-abroad interests; and a neutral mention of studies in communications and branding with a luxury focus at Milano Fashion Institute. Do not imply graduation, current enrollment, a current role, or current location. LinkedIn is the link for detailed career history. Do not publish the supplied resume PDF, private file path, address, phone number, or unsupported resume metrics.

The capabilities-in-practice section links to relevant published stories as supporting examples. Contact links offer public email and LinkedIn. The All City Mile credit section has a stable `#credits` anchor.

## Responsive and motion behavior

At phone widths, present one readable column. Keep archive filter buttons operable by touch and keyboard when JavaScript is available; hiding hover-dependent behavior must not hide project details. At wider widths the archive grid expands to two columns and then three. Respect reduced-motion preferences for page navigation, image movement, and hover transitions. Check layout through 320px mobile and wide desktop viewports.

## Delivery state

The public source includes the homepage, featured case studies, archive, and About experience. Automated acceptance, editorial review, issue closure, and deployment are separate steps; none is implied by source changes.
