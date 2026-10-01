# Information architecture and recruiter journeys

## Sitemap

| Route                             | Purpose                                                               | Status              |
| --------------------------------- | --------------------------------------------------------------------- | ------------------- |
| `/`                               | Establish Katherine's positioning and lead into five featured stories | Implemented locally |
| `/work/all-city-mile/`            | All City Mile × Rebel Relays case study                               | Implemented locally |
| `/work/your-mothers-run-crew/`    | Your Mothers Run Crew case study                                      | Implemented locally |
| `/work/freaks-of-nature/`         | Freaks of Nature × Alba Optics × Runaway Milano case study            | Implemented locally |
| `/work/you-deserve-your-flowers/` | Mom, You Deserve Your Flowers case study                              | Implemented locally |
| `/work/womens-self-defense/`      | Women's Self-Defense Initiative case study                            | Implemented locally |
| `/archive/`                       | Secondary, filterable index of other verified work                    | Planned for M5      |
| `/about/`                         | Biography, capabilities, resume download, LinkedIn, and public email  | Planned for M5      |
| not found                         | Helpful 404 with a working link home                                  | Implemented locally |

The route configuration uses static output and trailing slashes. Local development and build configuration apply the project base path `/katherine-kalill-portfolio` exactly once; this does not indicate deployment.

## Recruiter journeys

### Desktop

The six public routes are the homepage and five featured stories; the shared shell
also serves the 404 page. Its Work, Capabilities, and Contact navigation is
available on all six routes and on the 404 page, linking story pages back to
homepage sections. The homepage journey starts with positioning and featured
work; each featured card opens its case-study route in the local build. The
featured projects use a horizontal portrait rail with collaborator imagery
included in the related story content. The rail remains keyboard operable and
its position can be restored without taking over native vertical page
restoration. The Brands and collaborators list links to the related verified
project or chapter. From 768px wide on fine-pointer devices, previews appear
only for the hovered row or keyboard-focused row, with keyboard focus taking
precedence; leaving or blurring the row hides them. Hover previews work without
JavaScript. Touch layouts keep one static thumbnail per row. Case studies use a
consistent four-section H2 hierarchy and retain the ten source fields in their project records, including
learning only when supplied. Case studies link to the previous and next
featured story and back to the featured work/contact sections. At 1024px and
above, story copy and metadata sit beside a natural-ratio hero; below that
breakpoint the intro and hero stack. The hero uses contain fitting with a
480px/65svh desktop cap and a 360px/50svh stacked cap, while the full story
body follows. About and archive navigation wait for their M5 pages. Deployment
and final manual acceptance remain pending.

The non-production `/dev/homepage/` route remains a review fixture. Archive, About, and resume destinations are deferred to M5; no placeholder destination is published.

### Tablet

Keep the same content order and navigation destinations. The M3 compact navigation has keyboard-operable open/close behavior and remains usable by touch. The featured rail supports touch, keyboard, and reduced-motion use; each project remains reachable without relying on hover. Touch layouts show one static collaborator thumbnail per row; fine-pointer desktop layouts reveal the hovered or focused row, with focus taking precedence. Case-study intro and hero stack below 1024px.

### Mobile

Present one readable column with the positioning first and each featured project directly reachable. Navigation must be operable by touch and keyboard. The rail can be explored horizontally and respects reduced motion; content and one static collaborator thumbnail per row remain available without JavaScript. Case-study stories stack their intro and contained hero before the full story body. Archive filters remain usable without hover. Resume and LinkedIn remain obvious from About and the footer; omit phone and do not show a placeholder email.

M2 primitives and layout behavior are implemented locally. The homepage and five case-study routes use the coordinated featured release and cleared local media in the build. Archive, About, and resume destinations remain M5 work. Deployment and issue acceptance checks remain outstanding; record their evidence before related issues close.
