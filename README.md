# Finn Gabaree — Astro

Personal website introducing interests in creativity, technology, gaming, learning, and projects.

Live site: [finngabaree.com](https://finngabaree.com/).

## How it is built

Astro generates static HTML and assets. A TypeScript Cloudflare Worker serves those assets and handles redirects, security headers, and protected staging. Small browser scripts provide interactive behavior; there is no PHP runtime or application database in the deployed site.

A compact homepage, privacy controls, HTML/XML sitemaps, and a modular structure for adding future pages and project collections.

The toolchain uses Node.js (version pinned in `.nvmrc`), npm, TypeScript, and Wrangler. `package-lock.json` pins dependency versions.

## Project structure

- `src/data/site.json` — site identity, content, metadata, and analytics configuration.
- `src/pages/` — home, privacy, sitemaps, robots rules, and 404 page.
- `src/layouts/SiteLayout.astro` — shared page shell.
- `src/components/` — hero, SEO, footer, and privacy controls.
- `src/styles/site.css`, `public/` — theme, browser scripts, icons, and media.
- `worker/index.ts` — environment gates, redirects, staging authentication, and security headers.
- `scripts/`, `tests/` — privacy, build, and deployment checks.

Add routes as Astro pages using the shared layout. Update navigation, sitemap entries, and tests alongside new content. Larger project collections can use Astro content collections without duplicating page markup.

## Local development

Install the Node version in `.nvmrc`, then run:

```sh
nvm use
npm ci
npm run dev
```

Astro's development server previews page content. To test Worker routing locally:

```sh
npm run build:staging
npm run preview
```

Use the local URL printed by each server.

## Validation

```sh
npm run check
npm test
npm run build:production
npm run test:site
```

`node scripts/verify-deployment.mjs production` checks deployed pages and assets. Automated checks complement, rather than replace, responsive and keyboard testing.

## Cloudflare deployment

Staging and production use separate Workers:

- `wrangler.jsonc` — staging configuration; assets built to `dist/`.
- `wrangler.production.jsonc` — production configuration; assets built to `dist-production/`.

Staging uses HTTP Basic authentication with `STAGING_USER` and `STAGING_PASSWORD` stored as Cloudflare secrets. It is excluded from indexing and does not load Google Analytics. After configuring credentials and infrastructure, `npm run deploy:staging` builds and publishes staging.

Production redirects HTTP and `www` to the HTTPS apex. Public production `workers.dev` and version-preview URLs are disabled. Apex and www use exact-host Worker routes. Keep route management separate from content releases.

For an **existing, configured production Worker**, run validation, commit and push the source, then:

```sh
npx wrangler versions upload --config wrangler.production.jsonc
# Replace VERSION_ID with the version returned by the upload.
npx wrangler versions deploy VERSION_ID@100 --config wrangler.production.jsonc
```

Upload does not shift traffic; the deployment command does. Verify the published pages, redirects, assets, and privacy controls afterward. Git pushes do not deploy the website. Keep the previous version available for a reviewed rollback.

The optional [WebStorm workflow](WEBSITE-WORKFLOW/00-START-HERE.md) provides separate check, commit, push, upload, publish, and verification actions.

## Privacy and analytics

Google Analytics loads only after opt-in on production. Visitors can reopen privacy choices from the footer; dismissal is not consent. Cloudflare Web Analytics is configured separately at the edge; avoid adding a duplicate beacon. This site has no contact form, user accounts, or email-sending service.

## Adapting this project

This is a site-specific implementation, not an account-neutral starter:

1. Replace content, branding, metadata, domain references, analytics identifiers, and privacy/contact details.
2. Set your own Cloudflare account, Worker names, hostnames, routes, and environment variables. Keep production closed until setup and checks are complete.
3. Provision the resources and bindings referenced by the Worker configurations in your own account. Configure secrets outside Git.
4. Update host-specific tests and verification scripts. The optional WebStorm helpers also enforce repository ownership, branch, and account identity; adapt both `WEBSITE-WORKFLOW/site.json` and the guards in `workflow.mjs` before reuse.
5. Establish staging, then production infrastructure and routing separately. The version-upload sequence above is for subsequent releases, not a complete first-time provisioning procedure.

Keep credentials, generated builds, archives, and local reports out of Git and public assets. Use only content and media you have permission to reuse. During a hosting migration, preserve unrelated sites and email DNS.

## Monitoring

Services: UptimeRobot and Cloudflare.
