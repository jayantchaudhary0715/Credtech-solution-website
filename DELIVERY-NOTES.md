# Delivery notes: Credtech Solutions website

Built 17 October 2026 from the Claude design prototype (claude.ai/artifact/3aMVTASymNZX6zXXRh2F3U) and the live WordPress site (credtechsolutions.com, 24 pages and 6 posts read through its REST API).

## What was built

28 pages: Home (3D city), About, Services, 8 service pages, Campaigns, 4 case studies (Tanaav 2, Harikatha, Shark Tank India S2, Bada Naam Karenge), Clients, Plans, Blog, 4 blog posts, Contact, Schedule a Meeting, Careers, Privacy Policy and a 404 page. 109 optimised images (4.5 MB in total, WebP).

## Where the build differs from the prototype, and why

| Prototype | Site | Reason |
| --- | --- | --- |
| 15 client logos, including ZEE5, MedPlus and ShareChat | 12 logos | Those three do not appear anywhere on the live site. Add them back in `clients.json` if they are real clients. |
| “MOST POPULAR” badge on Silver | No badge, Silver still highlighted | Not stated on the live site |
| “Campaign planning” team photo | Live “Analyse & amplify” image | The photo was stock, not the Credtech team |
| Kashmir Files ZEE5 poster and other posters | Posters taken from the live site | Business assets come from the live site |
| “150M+ people in our network” | “150M, approx.” | Live copy says “about 150 million” |
| Two Bada Naam result cards | Bada Naam plus Shark Tank India S2 (43M+ reach) | Shows a second campaign with published figures |
| No navigation below 1100 px | Mobile menu button and panel | The prototype had no way to navigate on tablets and phones |
| All-white CredTech logo | Logo mark in the brand blue (#5878F8) and cyan (#08D0E8) from the live ct-logo, wordmark in white | Keeps the logo's own colours. The live site only publishes a white wordmark; send a full-colour logo file if the wordmark has a colour too. |
| Single homepage | 28 linked pages, header nav goes to pages, the journey rail keeps homepage sections | Requested internal pages |

The 3D scene, colours, fonts (Sora and Manrope), glass panels, journey rail, poster tilt, lightbox, logo marquees, plan towers and tap-to-pop icons are kept from the prototype. Inner pages reuse the same glass panels over a light CSS version of the city (stars, planet, perspective grid) so they load fast without WebGL.

## Content that needs your confirmation

**Contact details**

1. **Address.** The live site links three different Google Maps pins: “Urbtech Trade Centre” (footer), “UTC Urbtech, Sector 132” (homepage) and “Urbtech Matrix Tower, B-4, Block B, Sector 132, Noida 201304” (Contact page). The site shows “UrbTech Tower, Sector 132, Noida” and uses the Contact page pin. Please confirm the building and full address.
2. **Phone.** Published as “766 938 7999” with no country code. The tel: link assumes +91.
3. **Email link.** The live email links are broken (`mailto:info@credtechsolutions` and `http://info@credtechsolutions.com`). Fixed on the new site.
4. **Instagram and YouTube.** The live Contact page shows Instagram and YouTube icons with no links. Only LinkedIn, X (@Credtech_Noida) and Facebook are linked. Send the profile URLs to add them.
5. **“Request A Quote”** in the live footer has no link. It was not migrated.

**Services**

6. On the live homepage several service descriptions belong to other services (Website Design is described as social media management, Public Relation as reputation management, Analytics as perception monitoring). Descriptions were taken from each service's own page instead.
7. The Influencer Marketing paragraph on /services/ is garbled (“deceiving chew brains about the OS PJDigital”, “weibo advertising”). Only its readable meaning was kept.
8. Duplicated paragraphs on the live site were not repeated: the “Social Media Marketing” block on /social-media-amplification/ repeats the ORM text, “Website Audit” on /seosearch-engine-marketing/ repeats the SEO text, and the Analytics page intro appears twice.
9. /our-clients/ says “We leverage the latest advancements in fintech, software development and digital transformation”. It reads like template copy for a different kind of company. Kept as published; consider rewriting.

**Campaigns**

10. **Harikatha YouTube list.** The live Hari Katha page presents seven YouTube videos (Ajeet Bharti 150k, Palat Tera Dhyan Kidhar Hai 37k, The Alternate Media 36k, The Jaipur Dialogues 32k, Satya Sanatan 19k, The Abhishek Tiwary Show 14k, Anju Pankaj 11k) as Harikatha releases. Every one of them is a review of **Freedom at Midnight**. They were removed from the Harikatha case study and stored, hidden, on the Freedom at Midnight record (`videosPublished: false`).
11. **Shark Tank India.** The /our-campaign/ card repeats the Harikatha numbers in future tense (“is expected to reach 78 lakh…”). Not used. Figures shown come from the Season 2 report slides (43M+ reach, 13M+ views, target versus achieved table).
12. **Rakshak.** A Rakshak (New Season) poster appears on /our-campaign/ with a copy of the Maharani text. Hidden until real details are supplied.
13. **Maharani.** Copy says Season 2; the poster used is Maharani 3.
14. **Freedom at Midnight** is written “Freedom at Night” on the live site. Corrected to match the poster.
15. **The Kashmir Files and Bada Naam Karenge** have near-identical homepage descriptions, and both claim “Hashtags trended at No. 1”. Kept because it is published; please confirm. On /our-campaign/ the Kashmir Files poster sits next to a web-series description.
16. **Bada Naam Karenge.** 270M+ is called “reach” in one place and “audience views” in another, and the report slide says “Audience 270M+, Views 20M+”. The site uses “270M+ audience” and “2.08 crore total views”. Stray “[cite_start]” markers were removed.
17. Thalaivi, Rocket Boys, Maharani, Freedom at Midnight and The Kashmir Files have no published figures, only qualitative descriptions. None were added.

**Company claims (kept as published, please confirm or source)**

18. About page: 90% client retention, 50+ clients across government, entertainment and corporate, 50+ successful campaigns, presence in Delhi, Mumbai, Bengaluru, Hyderabad and Jaipur, and “recognised as one of the fastest-growing agencies in the new-age communications space” (no awarding body is named).
19. No testimonials, team members or awards exist on the live site, so none are shown.

**Pricing**

20. Plans are published in US dollars: Basic $500 / month, Silver $1,000 / month, Gold $2,000 / month. Preserved exactly. Confirm USD is intended for Indian clients and whether GST applies.

**Blog**

21. Four posts migrated. Two are held back: “Digital Marketing helps you.” is an internal list of topic ideas with unfilled placeholders such as “[Client Name]”, and “Drive Targeted Traffic & Leads” presents a “StyleSavvy” case study (350% ROAS, 80% sales growth, 40% lower CAC) that appears nowhere else, followed by draft copy options. Both are kept in `posts.json` with `status: "held"`.
22. The live /blog-post/ page is also a topic-ideas list, so the new Blog page lists real posts instead.
23. The Content Marketing post and the Content Marketing service page share the URL /content-marketing/ on the live site. The post now lives at /blog/content-marketing-educate-engage-convert/.

**Legal**

24. The live Privacy Policy stops in the middle of section 3. It has no sections on data retention, user rights, cookies or a grievance contact. Migrated as is, with an email line added. Have it reviewed against India's DPDP Act before launch.
25. The Careers page has an application form only: no job descriptions and no CV upload.

## Assets to check

* **Image licences.** Several images reused from the live site are third-party or stock graphics (for example “Joshua-Delva-South-Orange-Improve-Your-Business-Reputation”, “Network-Marketing-Wikipedia”, “What-is-Influencer-Marketing”, “How-To-Start-A-Successful-Business_-KnowWit”, Pexels photos and Gemini-generated images). Confirm you have rights to them or swap them in `assets/img/`.
* **Client logos** on the live site are low-resolution downloads (“download (6)”, “jblist”). Official high-resolution logos, and permission to show them, are recommended.
* **Office photo** is the only real Credtech photo. Team or event photos would strengthen the About page.
* **Social preview image** (`assets/img/brand/og-default.jpg`) was composed from the live hero image and logo. A designed 1200×630 image is recommended.

## Integrations that need setup

| Item | Status | What to do |
| --- | --- | --- |
| Enquiry and audit forms | **Not connected.** The live forms post to WordPress (Elementor), which a static site cannot use. | Create a form endpoint (Formspree, Web3Forms, Getform, Basin or your own API) and set `forms.endpoint` in `content/site.json` or the `CT_FORM_ENDPOINT` variable. Until then the form says plainly that it is not connected and offers an email draft. It never shows a fake success. |
| Careers form | Not connected | Same as above (`forms.careersEndpoint`). CV upload needs a service that accepts files. |
| Booking | Working | Google Calendar appointment link from the live site. Embedded on Schedule a Meeting in the production build; linked everywhere else. |
| Analytics | Not set | The live site uses Google Site Kit, whose GA4 ID is not public. Add it to `analytics.ga4`. |
| Search Console | Carried over | The live verification tag is included. Submit `/sitemap.xml` after launch. |
| Newsletter | Not built | The live site loads a Mailchimp plugin, but no signup form was visible. |
| Hosting and DNS | Pending | Deploy `dist/`. Redirect files for Netlify, Cloudflare Pages, Vercel and Apache are included so old WordPress URLs return 301s. |

## In the Claude preview link

The preview is the `preview/` build. Forms cannot send from inside the preview, the Google Calendar embed is replaced by a button (the preview cannot embed other sites), and phone or email links may not open there; every number and address is shown as text with a Copy button.

## How to update content later

Edit `content/*.json`, run `npm run build`, upload `dist/`. Each record keeps its `sourceUrl`; `content/migration-log.json` lists every old page and post with its last-modified date and new address. Full instructions are in `README.md`.
