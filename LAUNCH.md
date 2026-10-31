# Launch verification — October 28, 2026

Account, deployment, and email-event identifiers, origin addresses, and machine-specific paths are shown as placeholders where applicable. Use your own configuration and backup records for actual values; placeholders are not deployable values.

Status: live on Cloudflare at https://finngabaree.com and https://www.finngabaree.com; www and HTTP redirect to the HTTPS apex while preserving paths and queries.

## Release

- Production version: `DEPLOYMENT_VERSION_13` (100% of production traffic).
- Protected staging version: `DEPLOYMENT_VERSION_14`.
- Two exact-host Worker routes only; default fail-closed behavior.
- Original DNS records retained, including apex/www, email and all service aliases.
- Minimum TLS 1.2 confirmed after reload; TLS 1.3 remains enabled.
- Public production workers.dev and version previews disabled.
- No contact form exists, so no Resend key or test email was needed.
- Private GitHub repository: https://github.com/timgabaree/finngabaree.com-astro.

The CLI uploaded production successfully but could not manage zone routes with its existing permissions. Routes were then attached through the signed-in dashboard and verified. Use the version-based update instructions in README; no access expansion is required.

## Checks passed

- Node 24.22.1; dependency install reported zero vulnerabilities.
- Astro and Worker type checks: zero errors, warnings or hints.
- 17 automated privacy/security tests per site.
- 113 generated-page, asset, metadata, sitemap and publication checks.
- 42 local and 42 protected-staging checks; 45 live checks.
- Five served assets compared byte-for-byte with the local production build.
- Canonical redirects, genuine 404s, blocked private paths, unsupported methods, security headers, robots and XSLT-free sitemap verified.
- Responsive browser checks at 320, 768 and 1440 CSS pixels on home, privacy and sitemap: no horizontal overflow, one h1, styled content.
- Keyboard privacy controls: opening moves focus to Decline; Escape closes and returns focus to the footer button.
- Live Google script absent before consent, present with the correct existing measurement ID after consent, absent again after withdrawal/reload.
- One automatic Cloudflare analytics beacon present. Existing analytics property retained; no duplicate manual beacon.
- Protected staging requires authentication for pages, assets and robots; noindex/no-store. Google disabled there.
- Production workers.dev returns 404.
- All 22 archived GoDaddy website files still match their original SHA-256 hashes.
- Pre/post DNS exports match, normalizing only the provider-generated SOA serial; records, values, proxy settings and TTLs are unchanged.

## PageSpeed Insights

Captured October 28, 2026, approximately 5:42 p.m. Central.

| Device | Performance | Accessibility | Best practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Mobile | 100 | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

[Mobile report](https://pagespeed.web.dev/analysis/https-finngabaree-com/a5zqasmqe3?form_factor=mobile) · [Desktop report](https://pagespeed.web.dev/analysis/https-finngabaree-com/a5zqasmqe3?form_factor=desktop)

These are homepage lab measurements, not a guarantee of future scores or a complete accessibility certification. Real-user field data was not yet available. Analytics dashboard processing/indexing is not proven by script loading alone.

## Archives and follow-ups

Verified compressed archive and restored-file comparison are in the dedicated external-drive Website Archives folder. A second plain ZIP is in Dropbox's Websites/Archive folder; off-device sync has not been independently verified.

- Carrie has not been changed.
- Search Console sitemap submission/indexing review and later analytics reporting can be handled in the post-migration review; sitemap availability and crawlability are already verified.
- Continue to retain shared GoDaddy hosting and email/service records. Never cancel the Deluxe hosting account as part of a single-site rollback.
- Raw local verification reports and DNS snapshots are excluded from Git under `.local/`.

No paid services were added and no email DNS or GoDaddy content was changed.
