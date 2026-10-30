# Finn Gabaree — Astro

**Website update buttons:** [Start here — numbered WebStorm workflow](WEBSITE-WORKFLOW/00-START-HERE.md). In WebStorm, open the run-configuration dropdown and choose **WEBSITE WORKFLOW**. Setup alone does not commit, push, upload or publish.

Independent, modular Astro site for https://finngabaree.com. The original GoDaddy site is retained unchanged. This project does not share a Git repository or deployment with the PHP sites.

## Work locally

Use Node from `.nvmrc`, then:

```sh
npm ci
npm run dev
npm run check
npm test
npm run build:production
npm run test:site
npm run build:staging
npm run preview
```

The Worker preview supplies the real security headers and protected-routing behavior. Astro's development server is for content editing.

## Structure and growth

- `src/data/site.json`: site identity, content, metadata, analytics ID, administrator contact.
- `src/layouts/SiteLayout.astro`: shared document, styles, footer, privacy controls.
- `src/components/`: reusable hero, SEO, footer, analytics choices.
- `src/pages/`: home, privacy, human sitemap, XML sitemap, robots, 404.
- `src/styles/site.css`: theme variables and responsive shared styling.
- `public/`: original icons/media and small browser scripts.
- `worker/index.ts`: environment gates, canonical redirects, staging authentication, security headers.
- `tests/` and `scripts/`: privacy, Worker, generated-site and deployed-site checks.

Add routes as Astro pages using the shared layout. For larger project/story collections, introduce typed Astro content collections rather than duplicating page markup. Update sitemap routes and tests when adding pages. No application server or database is needed for the current site.

## Deployment

Protected staging: https://finngabaree-com-astro-staging.timgabaree-com-astro.workers.dev

`npm run deploy:staging` builds and deploys staging. Credentials are Cloudflare secrets, with the local copy in macOS Keychain (service `finngabaree.com-astro-staging-basic-auth`, account `review`); never put passwords in Git.

Production is a separate Worker, configured in `wrangler.production.jsonc`. Build production, run all checks, then explicitly deploy:

```sh
npm run check && npm test
npm run build:production && npm run test:site
npx wrangler versions upload --config wrangler.production.jsonc
# Replace VERSION_ID below with the version returned by the upload.
npx wrangler versions deploy VERSION_ID@100 --config wrangler.production.jsonc --yes
node scripts/verify-deployment.mjs production
node scripts/verify-deployment.mjs staging
```

Only exact-host routes `finngabaree.com/*` and `www.finngabaree.com/*` are attached. No wildcard-host route. Existing proxied A/CNAME records remain unchanged; email, service aliases and other sites are not routed to this Worker. Production workers.dev and version preview URLs are disabled. Minimum TLS is 1.2.

The current deployment login can upload and deploy Workers but cannot manage zone routes. The initial routes were attached in the signed-in Cloudflare dashboard. The version-based workflow above preserves them. Do not use a route-replacing workaround or broaden token permissions just to publish content. Normal `wrangler deploy` may upload a new live version before reporting a route-permission error, so always verify the actual deployment after any partial failure.

## Privacy and analytics

The existing Google Analytics property is retained, but loads only after an affirmative cookie choice on the production apex host. Dismissal is not consent. Declining removes Google cookies; reopening choices is available in the footer. Staging never loads Google Analytics. Advertising signals are disabled.

Existing automatic Cloudflare Web Analytics is retained; do not add a second manual beacon. The privacy contact is tim@timgabaree.com. No forms, accounts, children's contact details, or email-sending service were added.

## Backup and rollback

Source reference folder: `../finngabaree.com` (Clint's original folder spelling is intentional and unchanged).
Verified GoDaddy archive: `/Volumes/StudioStack NVMe/Website Archives/finngabaree.com/2026-10-28-pre-cutover/`.
Plain ZIP second copy: `../Archive/finngabaree.com-GoDaddy-2026-10-28/`.
Off-device Dropbox sync remains a user check.

To restore GoDaddy serving, remove ONLY the two exact-host Worker routes for this domain. Since the original DNS records and GoDaddy content remain intact, no DNS restoration or file upload is required. Keep email records, service aliases and unrelated routes untouched. Do not disable/delete the shared GoDaddy hosting account. For an Astro-only regression, redeploy a known-good version instead.

See `LAUNCH.md` for verification and follow-ups. Detailed raw reports and DNS snapshots live in ignored `.local/`; credentials and archives are never tracked.
