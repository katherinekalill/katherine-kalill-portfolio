# Project and media content model

## Storage and rendering

- Store each project as a JSON entry in the Astro `projects` collection; keep media records in a separate schema-validated JSON manifest and global site copy/contact in a singleton JSON source.
- Use Astro's build-time local-file loader for projects. A reusable, plain TypeScript schema module is the source for the Astro collection schema, media-manifest parsing, publication gate, and Vitest validation; infer types from these schemas.
- M1 defines data shape and initial draft records. M2 wires the executable schema, collection loaders, and publication gate once the scaffold exists. Keep issue #8 and M1 open until executable checks pass.
- The audit questionnaire and source/rights ledger stay outside tracked repository files. Never store internal evidence paths or sensitive provenance in generated public HTML, JSON, JavaScript, or media manifests.

## Project record

Each entry has a stable ID and slug, featured/archive status, featured order when applicable, draft/published state, project title, editorial title, client/platform, location, year, operating context, disciplines, target-role relevance, summary, insight, intention, opportunity, idea, role, experience, metrics, takeaway, media references, credits, and confidentiality state. Narrative content uses fixed named fields. Unknown values use `null` or an empty array; optional fields are not omitted from the JSON shape.

The current schema represents narrative sections as nullable named fields rather than arrays. When case-study rendering is implemented, it will skip null or empty sections. Role, identity, year, location, summary, rights, and required credits must be established before publication. No placeholder text or inferred defaults may masquerade as verified information.

## Metric record

Store `value`, `label`, verification state, and a private evidence reference separately. Keep evidence references in the private audit ledger rather than public records. Only verified, publication-approved metrics may render. A project with unverified optional metrics can publish without them only after the user accepts omission; otherwise its page remains a draft.

## Media record

Store stable ID, kind, local source under `public/`, width and height in pixels, aspect ratio derived from positive dimensions, alt text, explicit decorative flag, focal point as normalized x/y coordinates from 0 to 1, visible credit, permission state, and permission provenance. Every manifest source must resolve to a local file. Video may include a poster image reference. Derived video stills must retain source attribution in the private ledger. The Goop still-frame selection requires Katherine's approval.

Do not add a media record until its required metadata and dimensions are known. Every record must have a valid local source, positive dimensions, derived aspect ratio, valid focal coordinates, permission state, and credit basis. Only published media requires permission approved for public use and an accurate credit or explicit no-credit-required basis. Informative images require nonempty alt text; decorative images explicitly use empty alt text.

## Publication gate

The public content projection whitelists only approved site fields and strips all audit data. Draft records, restricted media, unverified claims, private source references, owner names, confidentiality metadata, and evidence notes never enter a production build. Validate unique slugs, ordering, referenced media IDs, media dimensions/focal points, and publication eligibility. Missing optional content produces no empty UI.
