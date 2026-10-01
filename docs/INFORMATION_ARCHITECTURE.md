# Information architecture and recruiter journeys

## Sitemap

| Route                             | Purpose                                                               |
| --------------------------------- | --------------------------------------------------------------------- |
| `/`                               | Establish Katherine's positioning and lead into five featured stories |
| `/work/all-city-mile/`            | All City Mile × Rebel Relays case study                               |
| `/work/your-mothers-run-crew/`    | Your Mothers Run Crew case study                                      |
| `/work/freaks-of-nature/`         | Freaks of Nature × Alba Optics × Runaway Milano case study            |
| `/work/you-deserve-your-flowers/` | Mom, You Deserve Your Flowers case study                              |
| `/work/womens-self-defense/`      | Women's Self-Defense Initiative case study                            |
| `/archive/`                       | Secondary, filterable index of other verified work                    |
| `/about/`                         | Biography, capabilities, resume download, LinkedIn, and public email  |
| not found                         | Helpful 404 with a working link home                                  |

All routes are static, with trailing slashes. In development and production they respect the configured project base path `/katherine-kalill-portfolio` exactly once.

## Recruiter journeys

### Desktop

The target journey starts with positioning and leads into the five featured projects. Each finished project will open in one interaction, and the persistent navigation will expose destinations when those pages and approved materials are ready. Case studies will link to the next featured story and About. Contact paths live on the homepage and, once built, in About and the footer.

Current M3 implementation: production navigation exposes only available homepage sections. The non-production `/dev/homepage/` review route previews the intended seven-section narrative and draft five-story order. Its project links remain non-navigating story cards until M4 case-study routes exist. Archive, About, and resume destinations remain deferred to M5; no placeholder route or resume link is published.

### Tablet

Keep the same content order and navigation destinations. The M3 compact navigation has keyboard-operable open/close behavior and remains usable by touch. Project cards may use fewer grid columns; no project should be hidden behind hover.

### Mobile

Present one readable column with the positioning first and each featured project directly reachable. Navigation must be operable by touch and keyboard. Archive filters remain usable without hover. Resume and LinkedIn remain obvious from About and the footer; omit phone and do not show a placeholder email.

The M2 foundation review validates primitives and layout behavior. Finished Home, Archive, About, and case-study journeys are implemented in M3–M5. The current M3 homepage is production-safe while Katherine's questionnaire, project evidence, media approvals, and case-study routes are pending.
