# Credtech Solutions website

Static website for **credtechsolutions.com**. The design follows the Claude "Credtech 3D Homepage" prototype; the business content was migrated from the WordPress site on 17 October 2026.

No frameworks and no npm dependencies. Node 18+ builds it; any static host serves it.

## Quick start

```bash
npm run build          # writes dist/  (production: pretty URLs, shared CSS/JS, bundled three.js)
npm run serve          # http://localhost:8080 serves dist/
npm run build:preview  # writes preview/ (flat .html files, inlined CSS/JS) used for the Claude preview link
```

To view the site on your Mac: open Terminal in this folder and run `npm start`, then visit http://localhost:8080. (Python 3 comes with macOS; Node 18 or newer is needed for the build.)

## Folder map

| Path | What it is |
| --- | --- |
| `content/` | **All editable content** as JSON. One file per area. Every record keeps `sourceUrl` (where it came from on the old site). |
| `content/site.json` | Company name, phone, email, address, social links, booking link, nav, footer, form endpoint, GA4 ID |
| `content/pages.json` | Homepage copy, About, Contact, Schedule a Meeting, Careers, Privacy Policy, 404 |
| `content/services.json` | 11 services. `home: true` shows one on the homepage ring; `page: true` gives it a detail page |
| `content/campaigns.json` | Campaign posters, homepage result cards, and the 4 case studies |
| `content/clients.json` | Client logos and client stories |
| `content/plans.json` | Basic, Silver and Gold plans (prices copied exactly) |
| `content/posts.json` | Blog posts. Only `status: "published"` posts are built |
| `content/media.json` | Image registry: key → file, size and the live URL it was migrated from |
| `content/migration-log.json` | Every page and post found on the old site and where it lives now |
| `assets/img/` | Optimised WebP images (brand, photos, posters, logos, services, case-study slides) |
| `src/styles.css` | All styles. Design tokens are at the top (`:root`) |
| `src/site.js` | Page behaviour: mobile menu, journey rail, Ferris wheel and train on the Services page, the set piece on every other page, lightbox, copy buttons, forms |
| `src/world.js` | The 3D "Credtech City" homepage scene (three.js r160) |
| `src/templates/` | `lib.mjs` (routing, image helper), `components.mjs` (header, footer, cards, forms, layout), `pages.mjs` (one function per page type), `fun.mjs` (the interactive set piece on each page: elevator, metro line, billboard tower, case study book, campaign big screen, odometers, logo orbit, skyline, ticker, reading rocket, signal tower, departures board, balloons, vault, lost train) |
| `vendor/three/` | Local copy of three.js 0.160.0 and the 5 add-ons the scene uses (MIT licence) |
| `build.mjs` | The generator. Validates content (missing images, en/em dashes), then writes the site |
| `CHANGELOG.md` | Every change made to the site, newest first |
| `DELIVERY-NOTES.md` | Content questions, missing assets and integrations still to set up |

## Editing content

1. Open the JSON file for the area you want to change and edit the text. Inline `<b>`, `<i>`, `<em>` and `<strong>` are allowed; all other HTML is escaped.
2. Run `npm run build`. The build stops with a clear message if an image key is missing or a dash slipped in.
3. Upload the new `dist/` folder.

Common tasks:

* **Change phone, email, address or socials:** `content/site.json`.
* **Change a price:** `content/plans.json` → `price`. Keep the currency symbol exactly as you want it shown.
* **Add a campaign:** add an image to `assets/img/posters/` (460×690 WebP), register it in `content/media.json` (`"posters-yourid": { "src": "assets/img/posters/yourid.webp", "width": 460, "height": 690, "sourceUrl": null }`), then add an item to `content/campaigns.json` with `published: true`. The homepage strip, the 3D boulevard (first 8 published, excluding Tanaav) and the Campaigns page update automatically.
* **Add a blog post:** add an object to `content/posts.json` with `slug`, `title`, `date` (YYYY-MM-DD), `status: "published"`, `excerpt`, `image` (a media key), `imageAlt` and `bodyHtml`. Use `{{media:key}}` inside `bodyHtml` for images.
* **Hide something without deleting it:** campaigns use `published: false`; posts use `status: "held"`.
* **Departures board (Schedule a Meeting):** `content/pages.json` → `schedule.board`. Each row has `to`, `status` and `alt` (the status it flips to). Keep `to` to 16 characters and statuses to 9.

This is a one-time content migration. Nothing syncs from WordPress automatically. If the old site changes before launch, compare against `content/migration-log.json` and update the JSON by hand.

## Configuration

| Setting | Where | Notes |
| --- | --- | --- |
| Enquiry form endpoint | `site.json → forms.endpoint` or env `CT_FORM_ENDPOINT` | Any service that accepts a POST of FormData and returns 2xx JSON (Formspree, Getform, Basin, Web3Forms, your own API). Empty = the form tells visitors it is not connected and offers an email draft. It never shows a fake success. |
| Careers form endpoint | `forms.careersEndpoint` or `CT_CAREERS_ENDPOINT` | Falls back to `forms.endpoint` |
| Google Analytics 4 | `analytics.ga4` or `CT_GA4` | Leave empty to load no tracking |
| Site URL | `siteUrl` or `CT_SITE_URL` | Used for canonical URLs, sitemap and social previews |
| three.js source | `three.source` | `local` (default, served from `/vendor/three`) or `cdn` (jsDelivr) |
| Search Console | `seo.googleSiteVerification` | Copied from the live site |

## Deploying

`dist/` is a plain static folder.

* **Netlify / Cloudflare Pages:** publish directory `dist`, build command `node build.mjs`. `_redirects` is picked up automatically.
* **Vercel:** deploy the `dist` folder itself (`vercel deploy dist`); the `vercel.json` inside it holds the redirects.
* **Apache / cPanel (where WordPress runs today):** upload the contents of `dist/` to the web root. `.htaccess` holds the redirects, 404 page and caching rules. Back up and remove WordPress first.

Old WordPress URLs (for example `/about-us/`, `/our-plan/`, `/pr-agency/`, `/social-meadia-marketing/`) are 301-redirected to the new pages so search rankings carry over.

## SEO and accessibility built in

* Unique title, description, canonical URL, Open Graph and Twitter card on every page; `sitemap.xml`, `robots.txt`, web manifest, favicons.
* JSON-LD: ProfessionalService (address, phone, socials) on every page, plus BreadcrumbList, Service, Article/BlogPosting and OfferCatalog where relevant.
* One `h1` per page, alt text on every image, skip link, visible focus, labelled form fields with inline errors, keyboard-operable menu, strip and lightbox.
* `prefers-reduced-motion`: the 3D city holds still and only redraws on scroll, marquees stop, smooth scrolling is off, and every page set piece shows its final state without animation.
* Data-saver or very low-memory devices get a static image instead of WebGL. If WebGL fails, the same fallback appears.

## Checks run before delivery

* Every internal link, anchor and image reference resolves in both builds.
* No horizontal scrolling at 1440, 834 and 390 px on all 28 pages; no console errors.
* Forms tested against a mock endpoint: validation, success only on a 2xx response, error on 5xx, and the not-connected message when no endpoint is set.
* External links (booking, socials, YouTube, maps) return valid responses.
