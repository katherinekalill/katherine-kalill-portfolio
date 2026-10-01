# Project and media content model

## Storage and rendering

- Store each project as a JSON entry in the Astro `projects` collection; keep media records in a separate schema-validated JSON manifest and global site copy/contact in a singleton JSON source.
- Use Astro's build-time local-file loader for projects. A reusable, plain TypeScript schema module is the source for the Astro collection schema, media-manifest parsing, publication gate, and Vitest validation; infer types from these schemas.
- M1 defines data shape and initial records. The working tree now includes the executable schema, collection loaders, publication gate, and case-study presentation fields. Keep issue #8 open until the issue’s acceptance checks are run and recorded.
- The short copyable follow-up and safe readiness notes may live in tracked documentation. Katherine’s private responses, source documents, and the source/rights evidence ledger stay outside tracked repository files. Never store internal evidence paths or sensitive provenance in generated public HTML, JSON, JavaScript, or media manifests.

## Project record

Each entry has a stable ID and slug, featured/archive status, featured order when applicable, draft/published state, project title, editorial title, client/platform, location, year, operating context, disciplines, target-role relevance, summary, insight, intention, opportunity, idea, role, experience, metrics, takeaway, media references, credits, and confidentiality state. Narrative content uses fixed named fields. Unknown values use `null` or an empty array; optional fields are not omitted from the JSON shape.

Featured case studies also include `chapters` (stable ID, title, and plain-text body) and `presentation` (optional hero media ID and ordered gallery placements). Each gallery placement references a project media ID and specifies portrait, landscape, full-bleed, or detail layout, optional caption, and optional chapter ID. Chapter order follows the array; gallery order controls image placement. Chapter text is plain text, split into paragraphs at blank lines. The hero renders separately; it repeats in the gallery only when explicitly listed.

The current schema represents narrative sections as nullable named fields rather than arrays. Case-study rendering skips null or empty sections. Role, operating context, location, summary, rights, required credits, and any published metrics must be established before publication. A year may remain `null` when the year is unknown and the date is not needed to distinguish the work; do not infer one. No placeholder text or inferred defaults may masquerade as verified information.

## Metric record

Store `value`, `label`, and verification state in the public project record. Keep source evidence outside the repository. Only verified, publication-approved metrics may render. Omit uncertain optional metrics rather than weakening their qualification; the case-study release remains draft if required facts are unverified.

## Media record

Store stable ID, kind, local source under `public/`, width and height in pixels, aspect ratio derived from positive dimensions, alt text, explicit decorative flag, focal point as normalized x/y coordinates from 0 to 1, visible credit, permission state, and credit basis. Every manifest source must resolve to a local file. Video may include a poster image reference. The selected Goop still is cleared for public use under Katherine’s supplied-media authorization; no additional frame approval is outstanding.

Optional responsive variants contain a local path, width, and height. Their dimensions preserve the source aspect ratio, their widths are unique and smaller than the source, and every variant must resolve to a file. They inherit the parent media record's approval and credit status. Case-study galleries render approved image records and approved stills; they do not render video sources as images.

Do not add a media record until its required metadata and dimensions are known. Every record must have a valid local source, positive dimensions, derived aspect ratio, valid focal coordinates, permission state, and credit basis. Only published media requires permission approved for public use and an accurate credit or explicit no-credit-required basis. Informative images require nonempty alt text; decorative images explicitly use empty alt text.

## Publication gate

The public content projection whitelists only approved site fields and strips all audit data. Draft records, restricted media, unverified claims, private source references, owner names, confidentiality metadata, and evidence notes never enter a production build. Validate unique slugs, ordering, referenced media IDs, media dimensions/focal points, and publication eligibility. Missing optional content produces no empty UI.

All five featured projects must be published together in the approved order before production case-study routes or homepage featured work are emitted. All-draft status produces no project routes; a mixed release fails the build. Human editorial and rights approval must precede the status change because schema validation cannot establish that approval. Development case-study previews use synthetic content, are marked `noindex`, and are not included in production output.
