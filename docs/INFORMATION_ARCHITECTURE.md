# Information architecture and recruiter journeys

## Public routes

| Route                             | Purpose                                                                            | Local status |
| --------------------------------- | ---------------------------------------------------------------------------------- | ------------ |
| `/`                               | Positioning, five featured stories, capabilities, archive and About links, contact | Implemented  |
| `/work/all-city-mile/`            | All City Mile × Rebel Relays case study                                            | Implemented  |
| `/work/your-mothers-run-crew/`    | Your Mothers Run Crew case study                                                   | Implemented  |
| `/work/freaks-of-nature/`         | Freaks of Nature × Alba Optics × Runaway Milano case study                         | Implemented  |
| `/work/you-deserve-your-flowers/` | Mom, You Deserve Your Flowers case study                                           | Implemented  |
| `/work/womens-self-defense/`      | Women’s Self-Defense Initiative case study                                         | Implemented  |
| `/archive/`                       | Filterable index of the five currently published projects                          | Implemented  |
| `/about/`                         | Narrative biography, experience, selected work, contact                            | Implemented  |
| not found                         | Helpful 404 with a working link home                                               | Implemented  |

The public archive initially repeats the five published projects in the featured release. Draft projects and other professional, contract, owned-platform, or academic work remain excluded until their facts, role and ownership context, category fit, metrics, media, credits, and permissions are cleared. The site's static routes keep trailing slashes. Local and build configuration add the `/katherine-kalill-portfolio` base path exactly once; this does not indicate deployment.

## Navigation and shared contact

The shared primary navigation is **Work**, **About**, and **Contact**. Work links to `#work` on the homepage and back to the homepage's featured work from story and About pages. About links to `/about/`; Contact links to the homepage contact section. The active-page and active-section states follow the current route. The footer includes public email, LinkedIn, and a credit link to the All City Mile credits section. About and homepage contact blocks expose email and LinkedIn; no phone number or resume download is published.

## Recruiter journeys

### Homepage and selected work

The homepage leads from positioning and a point of view into a five-card horizontal rail in the approved story order. Each card links to its full case study. Native touch scrolling and links work without JavaScript; enhanced previous/next controls move one card, disable at the rail ends, respect reduced motion, and preserve rail position on browser back. The Brands and collaborators rows link to the related published story chapter. Fine-pointer desktop previews respond to hover and keyboard focus, with focus taking priority; touch and no-JavaScript views keep one static thumbnail per row. Photo credit for All City Mile remains outside image crops and attached to the relevant links.

Homepage links also lead to Archive and About. The archive CTA and About CTA do not create project records or imply that draft work is published.

### Archive

The archive begins with the five currently published projects and eight single-select filter options: All, Community, Partnerships, Experiences, Digital, Retail, Luxury Strategy, and Owned Platform. A selected category is represented by the `discipline` query parameter. Browser back and forward restore the selected filter; choosing All removes that parameter. An empty category shows a reset action. Without JavaScript, filter controls stay hidden and all five project cards remain visible.

Current publication taxonomy assigns Community, Partnerships, and Experiences to all five projects; Digital to Freaks of Nature; Retail to Women’s Self-Defense; and Owned Platform to Your Mothers Run Crew. Luxury Strategy is intentionally empty. Do not fill empty categories by publishing academic concepts or draft work without the required review.

### About

The About page presents a concise narrative without an employment timeline. It may use supported experience at New Balance, iRestore, VMware, and Katherine Kalill Productions; founding Your Mothers Run Crew in Austin; the @kikhianti platform's running, travel, fashion, and life-abroad interests; and a neutral mention of studies in communications and branding with a luxury focus at Milano Fashion Institute. Do not imply graduation, current enrollment, a current role, or current location. LinkedIn is the link for detailed career history. Do not publish the supplied resume PDF, private file path, address, phone number, or unsupported resume metrics.

The capabilities-in-practice section links to the five published stories as supporting examples. Contact links offer public email and LinkedIn. The All City Mile credit section has a stable `#credits` anchor.

## Responsive and motion behavior

At phone widths, present one readable column. Keep archive filter buttons operable by touch and keyboard when JavaScript is available; hiding hover-dependent behavior must not hide project details. At wider widths the archive grid expands to two columns and then three. Respect reduced-motion preferences for page navigation, image movement, and hover transitions. Check layout through 320px mobile and wide desktop viewports.

## Delivery state

M0–M4 implementation is in the local commit history. M5 route, profile, and documentation changes are being reviewed in the working tree. Automated acceptance, Katherine’s editorial review, issue closure, and deployment are separate steps; none is implied by local implementation.
