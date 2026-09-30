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

From Home, see positioning and the five featured projects in the first viewport and subsequent scroll. Each featured project opens in one interaction. The persistent navigation exposes Work, Archive, About, and the resume when its approved file is available. Case studies link to the next featured story and About. Contact paths live in About and the footer.

### Tablet

Keep the same content order and navigation destinations. Use a compact navigation with keyboard-operable open/close behavior once built in M3. Project cards may use fewer grid columns; no project should be hidden behind hover.

### Mobile

Present one readable column with the positioning first and each featured project directly reachable. Navigation must be operable by touch and keyboard. Archive filters remain usable without hover. Resume and LinkedIn remain obvious from About and the footer; omit phone and do not show a placeholder email.

The M2 foundation review validates primitives and layout behavior. Finished Home, Archive, About, and case-study journeys are implemented in M3–M5.
