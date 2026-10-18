# Changelog

Every change to the Credtech Solutions website is recorded here, newest first. After each change the project is rebuilt (`npm run build`) and the whole folder is synced to `Desktop/Credtech`.

## 18 October 2026

### Phone layout clean-up (screens 640 px and narrower)
* **Card stacks are now swipe sliders.** On phones these grids scroll sideways one card at a time, with dots under them, a “Swipe” hint and a small nudge the first time they come into view. The card in front is highlighted and the others fade back slightly.
  * Homepage: services, campaign results, plans.
  * Plans page: Basic, Silver and Gold.
  * Clients page: client stories (the orbit logos still jump to the right story).
  * Campaigns page: campaign results.
  * Case studies: objectives, result tables and report slides (tap a slide to enlarge it).
  * Service pages: related services. Blog and posts: article cards.
* **Smaller, calmer background.** The 3D city on the homepage uses a wider lens on phones so it sits further back, with a darker wash over it so the text is easy to read. On inner pages the planet, grid floor and stars are smaller and fainter.
* **Shorter homepage.** Sections no longer take a full screen each on phones, so there are no empty gaps between panels. The hero figures sit in one row of three, and the office photo in the contact section is hidden on phones.
* **Tidier pages.** Tighter panel padding and section spacing, slightly smaller headings, About figures in one row, client logos three to a row, and a two column footer.
* On phones the site is about a fifth shorter overall: the homepage went from 12,690 px to 7,780 px, Clients from 7,360 px to 4,160 px, Plans from 5,210 px to 3,790 px and the Blog from 3,820 px to 2,290 px. Tablet and desktop layouts are unchanged.
* Files: `src/styles.css`, `src/site.js`, `src/world.js`, `src/templates/pages.mjs`, `src/templates/components.mjs`.

### Campaigns page: the big screen
* “Every campaign on our wall” is now a big LED screen on a stand, lit by two spotlights. The 9 published campaigns play on it one after another, a new one every 5 seconds, with a quick channel change flicker between them and a timer line along the bottom of the screen.
* Each campaign shows its poster, platform, title, full description and highlight. Campaigns with a case study (Bada Naam Karenge, Harikatha, Tanaav 2, Shark Tank India) have a large “Read the case study” button; the others have “Plan a campaign like this” (goes to the Contact form).
* The screen holds still while the pointer is over it or a button on it has keyboard focus, so the case study button never changes under the cursor.
* A row of posters under the screen picks any campaign. Arrows, Pause/Play, the keyboard arrow keys and a swipe on touch screens also change it. Links to a campaign from the billboard tower or the homepage (for example `/campaigns/#c-harikatha`) put that campaign on the screen.
* Phones get a compact layout (small poster beside the title, text below) and a sideways scrolling poster row.
* Reduced motion: no automatic changes and no flicker.
* Files: `src/templates/fun.mjs` (`bigScreen`), `src/templates/pages.mjs`, `src/styles.css`, `src/site.js`.

### “Work with us” band: the marketer with two signs
* The call to action band at the bottom of 22 pages (About, Services and every service page, Campaigns and every case study, Clients, Plans, Blog and every post) now has an illustrated Credtech marketer in a blue blazer and company lanyard, holding up a sign in each hand.
* The signs are the real buttons: the blue sign is “Get your free audit →” (goes to the Contact form) and the cream sign is “Schedule Meeting ↗” (opens the booking calendar in a new tab).
* He waves the two signs in turn, bobs, blinks and has twinkling sparkles around him. Pointing at a sign or tabbing to it makes him lift that sign higher, turn his head and look at it, and smile wider.
* The heading and text stay on the left on desktop; on tablets and phones the marketer sits below the text and the signs scale with him.
* Reduced motion: he stands still and the signs still work as normal buttons.
* Files: `src/templates/components.mjs` (`ctaBand`), `src/styles.css`.

### Campaigns page: the campaign casebook
* The case study card grid is now a 3D book. Each spread is one case study: the left page shows the campaign key art and two slides from its report, the right page shows the client, title, summary, the four published figures and a “Read the full case study” button.
* Pages turn on their own every 6 seconds with a real page turn over the spine; a gold timer line under the book shows when the next turn is due, and it loops back to the first case study after the last.
* Hovering over the book or tabbing into it holds the page. Arrows, Pause/Play, the bookmarks under the book, the folded page corners, the keyboard arrow keys and a swipe on touch screens all turn pages.
* Phones get one page per case study that turns away like a single leaf; the bookmarks scroll sideways and keep the open one in view.
* Reduced motion: no automatic turning, and pages change without animation.
* Files: `src/templates/fun.mjs` (`caseBook`), `src/templates/pages.mjs`, `src/styles.css`, `src/site.js`.

### Every page: an interactive set piece
Each page now has its own moving piece of “Credtech City”, in the spirit of the Services page Ferris wheel and train. All of them work with keyboard and touch, rest when off screen, hold still for visitors with reduced motion, and show their full content without JavaScript.

| Page | Set piece |
| --- | --- |
| About | **Elevator in UrbTech Tower.** As you scroll, a lift climbs one floor for each part of the story; the doors open on each floor and the matching card lights up. The growth figures roll up like odometers. |
| Service pages (8) | **Metro line.** A sticky route map of the sections on the page; a small train moves to the stop you are reading and passed stops turn blue. Horizontal under the header on tablets and phones. |
| Campaigns | **Billboard tower** (plus the casebook above). The posters revolve on a 3D tower. Drag or swipe to spin it, use the arrows, or pause it; the poster at the front is named below and links to its campaign. Tabbing to a poster turns it to the front. |
| Case studies (4) | **Odometers.** The published figures (for example 43M+ reach) roll into place when they scroll into view. |
| Clients | **Logo orbit.** Twelve client logos circle the Credtech planet on two rings; logos with a client story link to it. Hover or focus pauses the orbit. |
| Plans | **Skyline.** Basic, Silver and Gold become three towers that build floor by floor (one floor per feature, with the exact prices on each sign). Clicking a tower jumps to that plan and highlights it. |
| Blog | **LED news ticker** with the latest article titles. Pauses on hover. |
| Blog posts (4) | **Reading rocket.** A rocket climbs a progress line as you read and shows the percentage; posts now show an estimated reading time. |
| Contact | **Signal tower.** The signal bars fill as the form is completed and the tower sends a pulse for each finished field. |
| Schedule a Meeting | **Split flap departures board** with a live clock; the rows flip in letter by letter. |
| Careers | **Hot air balloons**, one per open role. Picking one chooses that role in the application form and takes you to it. |
| Privacy Policy | **Vault door** whose dial turns as you read the policy. |
| 404 | **Lost train** whose coaches are the way back: Home, Services, Campaigns, Contact. |

* No new statistics or claims were added. Figures come from the existing content files; the departures board statuses are decorative labels.
* Fixed: a broad `.stat span` style was resizing nested spans; it now targets only the label.
* Files: new `src/templates/fun.mjs` (all set pieces), `src/templates/pages.mjs`, `src/templates/components.mjs` (`pageHero` takes a `visual`), `src/styles.css`, `src/site.js`, `content/pages.json` (`schedule.board`).

### Services page: specialist services train
* The “More ways we help” grid is now a train. A blue locomotive with the CredTech mark and a headlight pulls one coach per specialist service (7 coaches) along a lit track.
* The train loops slowly from right to left at about 30 px per second. It starts with the engine in view, stops while the pointer is over it, and has a Pause/Play button.
* Visitors with reduced motion turned on get a still train they can scroll sideways.
* Fixed a style clash: the train track no longer shares the `.track` class with the client logo strip.
* Files: `src/templates/components.mjs` (`serviceTrain`), `src/templates/pages.mjs`, `src/styles.css`, `src/site.js`.

### Services page: 3D Ferris wheel
* The service cards now ride on a 3D Ferris wheel. Every 3.2 seconds the wheel turns one cabin: the next service reaches the bottom (“Now boarding”) and the previous one rises up the right side. Cabins stay upright and swing slightly as the wheel moves.
* A side panel shows the boarding service (number, description, link) with previous, pause and next buttons. The wheel pauses on hover and keyboard focus; hovering a cabin previews it in the panel; clicking a cabin opens the service.
* Tablets and phones: wheel above the panel, scaled to fit; on phones the cabins show images only.
* Reduced motion: the wheel starts paused and steps without animation.
* Files: `src/templates/components.mjs` (`ferrisWheel`), `src/templates/pages.mjs`, `src/styles.css`, `src/site.js`.

### Logo in brand colours
* The C/T mark in the header and footer logo now uses the brand blue (#5878F8) and cyan (#08D0E8) from the live ct-logo. The CredTech wordmark stays white, as on the live site.
* New file `assets/img/brand/logo.png` replaces `logo-white.png`. The social preview image was regenerated with the new logo.

## 17 October 2026

### First build
* 28-page static site built from the Claude 3D prototype with content migrated from credtechsolutions.com (24 pages and 6 posts read through the WordPress REST API).
* Pages: Home (3D city), About, Services, 8 service pages, Campaigns, 4 case studies, Clients, Plans, Blog with 4 posts, Contact, Schedule a Meeting, Careers, Privacy Policy, 404.
* Content in `content/*.json` with source URLs; 109 optimised WebP images; three.js 0.160.0 bundled locally.
* SEO: titles, descriptions, canonical URLs, Open Graph, JSON-LD, sitemap, robots, 301 redirects from old WordPress URLs.
* Forms validate and only report success on a real 2xx response; no form endpoint is configured yet.
* Removed the Harikatha YouTube list after finding every video is a Freedom at Midnight review (kept hidden on the Freedom at Midnight record).
* Carried over the Google Search Console verification tag.
* Content questions and setup tasks are listed in `DELIVERY-NOTES.md`.
