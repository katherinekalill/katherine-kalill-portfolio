# Deployment and rollback

The intended production URL is <https://katherinekalill.github.io/katherine-kalill-portfolio/>. The Astro build uses the project-site base path `/katherine-kalill-portfolio/`; keep that base path intact unless Katherine approves a custom domain or a GitHub Pages configuration change.

## Before the first deployment

1. Get Katherine’s explicit approval to make the repository public if the current GitHub Pages plan requires public repositories.
2. In repository Settings → Pages, select GitHub Actions as the build and deployment source. Do not change repository visibility as part of routine deployment.
3. Confirm the deployment workflow is present on `main` and the required CI checks are green.
4. Manually run “Deploy portfolio to GitHub Pages” from Actions. The workflow first runs formatting, lint, typecheck, content validation, unit/browser tests, builds, and the external-link check; the deploy job cannot start unless all validation succeeds.
5. After deployment, verify the homepage, `/archive/`, `/about/`, and each published `/work/<slug>/` route directly, including refreshes. Confirm HTTPS, the base path, favicon, sitemap, robots file, canonical URLs, Open Graph tags, and JSON-LD. Social preview tools can only be checked after the site is publicly reachable.

## Rollback

If a deployment is faulty:

1. Open Actions → “Deploy portfolio to GitHub Pages” and identify the last known-good deployment.
2. Revert the launch commit on `main` with a new revert commit (do not force-push or reset shared history).
3. Rerun “Deploy portfolio to GitHub Pages” from the reverted `main`. The same validation gate runs before redeploy.
4. Verify the affected direct routes and HTTPS again. If GitHub Pages itself is unavailable, disable Pages only with Katherine’s approval and record the outage; do not change repository visibility to work around it.

No release tag, deployment, visibility change, or live smoke-test claim is implied by this document.
