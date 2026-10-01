# Design references

The visual direction adapts these references to Katherine's editorial portfolio;
they are inspiration, not templates or sources for portfolio content.

- [Aldo Mazzilli](https://aldomazzilli.portfolio.site/) is the primary reference for oversized editorial typography and immersive photography.
- [ATA](https://www.atakesphotos.com/) is a secondary reference for the horizontal portrait project rail and inline collaborator imagery.

The [original shared brief](https://chatgpt.com/share/6abbac88-f94c-83eb-a1ef-5333a21ead5d)
records this direction. This reference audit was updated 2026-10-01. The design
adapts the references for keyboard access, no-JavaScript readability,
reduced-motion preferences, and WCAG AA contrast. Collaborator previews are
hidden at rest on fine-pointer desktop layouts and reveal only for the hovered
or keyboard-focused row; focus takes precedence. Touch layouts retain one
static thumbnail per row. Previews fade over 320ms, and names scale to 1.04 over
260ms without changing font size or affecting layout. Reduced-motion settings
show previews immediately and disable name scaling and transitions. Keep the
references as ongoing
inspiration for the M5 archive and profile work.

Featured story imagery has a separate 1.035 scale on hover and keyboard focus,
with a 400ms transition that stays independent from image parallax. Case-study
pages use compact side-by-side copy and natural-ratio, contained hero imagery
from 1024px wide; narrower layouts stack the intro and hero before the full
story body. Respect the 480px/65svh wide hero cap and the 360px/50svh stacked
cap, and preserve eager hero loading and gallery parallax.

Case studies retain the ten-part source framework documented in
`docs/ROADMAP.md`: context, human insight, intention, opportunity, idea,
Katherine's role, experience and execution, measurable impact, learning when
supplied, and credits and collaborators. Omit unsupported fields from public
presentation rather than inventing content.
