# Haven Customs — Website + Admin

Next.js 16 (App Router) · TypeScript · Tailwind v4 · MongoDB/Mongoose. Public catalog with no pricing, quote inquiries (saved to MongoDB, forwarded to GHL), GHL booking calendar, and an admin CMS with MongoDB image storage.

Business/catalog source of truth: [HAVEN_CUSTOMS_BUILD_BRIEF.md](HAVEN_CUSTOMS_BUILD_BRIEF.md).

## 1. Local setup

```bash
npm install
cp .env.example .env.local      # fill MONGODB_URI at minimum
npm run seed                    # idempotent catalog seed (51 products, 8 categories, 4 offers)
ADMIN_EMAIL=you@company.com ADMIN_PASSWORD='12+ char password' npm run create-admin
npm run dev                     # http://localhost:3000  ·  admin: /admin
```

- `npm run seed` only inserts missing records and never overwrites admin edits. `npm run seed -- --force` resets seeded records back to the brief.
- The seed also runs `syncIndexes()` for every model, which creates the unique, TTL and text indexes.
- `create-admin` creates the account or resets its password. There is no public sign-up. Remove `ADMIN_PASSWORD` from the environment after running it.

## 2. MongoDB (Atlas)

1. Create an Atlas cluster and a database user with read/write access to one database (e.g. `haven-customs`).
2. Network access: allow Vercel (0.0.0.0/0 or Atlas's Vercel integration).
3. Put the connection string, including the database name, in `MONGODB_URI`.
4. Run `npm run seed` once against that database (locally with the production URI, or from CI).

Collections: `categories, products, offers, galleryitems, inquiries, pagecontents, sitesettings, adminusers, adminsessions, ratelimits, storeduploads, uploadsessions, uploadchunks`.

## 3. Deploy to Vercel

1. Import the repo. Framework: Next.js. No build overrides needed.
2. Add the environment variables from `.env.example` (Production + Preview).
3. Set `NEXT_PUBLIC_SITE_URL` to the final domain (used for canonical URLs, sitemap and structured data).
4. Deploy, then sign in at `/admin`.

All DB, auth and upload handlers run on the Node.js runtime. Every public page renders per request, so admin changes show up immediately without a redeploy.

## 4. GHL setup (needs client access)

**Booking calendar**
- In GHL → Calendars, copy each calendar's widget link (`https://api.leadconnectorhq.com/widget/booking/…`).
- `GHL_BOOKING_WIDGET_URL` is the default calendar.
- `GHL_CALENDAR_MAP` is JSON keyed by a product's **Calendar key**. Seeded key: `mon-thu` (ceramic coating, headlight and tail light tint).
- **Restrictions must also be configured inside GHL.** The website shows "Monday – Thursday only", but only the GHL calendar's availability actually blocks Friday–Sunday. Create a separate calendar with Mon–Thu availability and map it to `mon-thu`.
- Default calendar: Haven "Service booking" (`nHnHjnp24SvMsZmSECZ2`), used when `GHL_BOOKING_WIDGET_URL` is blank. The widget URL is used as-is — GHL returns 404 if extra query params such as `?service=` are added, so the customer picks the service inside the GHL form.
- Confirmation SMS/email is handled by GHL workflows.
- If no URL is set, booking buttons show a call/contact fallback. They never show a broken iframe or a fake success.

**Inquiries**
- Option A (preferred): Private Integration token with `contacts.write` scope → `GHL_API_KEY` + `GHL_LOCATION_ID`. Each inquiry upserts a contact tagged `website-inquiry` and `product:<slug>`, and adds a note with the details.
- Option B: inbound webhook from a GHL workflow → `GHL_INQUIRY_WEBHOOK_URL`.
- Inquiries are always saved to MongoDB first. Delivery runs after the response. A failure is recorded (`failed` + error) and can be retried from Admin → Inquiries. With no credentials, status is `not_configured`.

**Meta Conversions API (optional):** `META_PIXEL_ID` + `META_CONVERSION_API_TOKEN`. A `Lead` event is sent only when the visitor ticks the consent box. `event_id` is stored per inquiry so it can be deduplicated against a browser pixel.

## 5. Image upload architecture

- Images are stored **in MongoDB** (`storeduploads.data`, a Buffer). Nothing is written to disk.
- `POST /api/upload` (admin only): multipart `file` + `folder` (`products|gallery|pages|misc`), up to 3MB. It checks magic bytes (JPEG/PNG/WebP/GIF) and names files `${Date.now()}-${16 hex}.${ext}`.
- Larger files (up to 8MB) use the **chunked flow**. This is needed because Vercel Functions cap request bodies at ~4.5MB, and no Next.js setting changes that.
  1. `POST /api/upload/session` `{folder,totalSize,originalName}` → `{sessionId, chunkSize (1MB), chunkCount}`
  2. `PUT /api/upload/session/:id/chunk/:index` (raw bytes; idempotent)
  3. `POST /api/upload/session/:id` → reassembles, validates, stores once, and returns the same response shape. `DELETE` aborts.
  - Sessions are bound to the admin and expire in 1 hour. TTL indexes clean up abandoned sessions and chunks.
- `AdminImageField` picks the flow automatically and only ever saves the returned URL.
- `GET /api/uploads/:folder/:filename` is public and strictly validated. It streams the bytes with `Cache-Control: public, max-age=31536000, immutable` and `nosniff`.
  - Responses here are ≤8MB, under Vercel's response limit. Confirm on the deployed host with an 8MB image.
- Content documents store URL strings only. When an edit is saved, old managed images that are no longer referenced anywhere are deleted. Media Library blocks deleting images that are in use. **Clean up unused** removes unreferenced uploads older than 24h.
- Legacy `/uploads/...` paths render a placeholder (`SafeImage`) until they are replaced in admin.

## 6. Pricing rule

No prices appear publicly. Public DTOs in `lib/queries.ts` are explicit allow-lists. `internalPrice` (products) and `internalNotes` (offers) are `select:false` and only returned to admin APIs. Validation rejects currency amounts in any public text field.

## 7. Verified locally

`npm run typecheck`, `npm run lint` and `next build` pass. An end-to-end run against the production build passed 124/124 checks:

- every public and admin route
- no prices or internal fields in HTML/RSC
- admin APIs return 401 when signed out, and CSRF/Origin is enforced
- CRUD changes reflect live
- PNG/JPEG/WebP/GIF uploads work; MIME spoofing, bad folders and >8MB are rejected
- a 4.8MB chunked upload round-trips byte-identical
- traversal attempts are rejected
- replace/cleanup and the legacy placeholder work
- inquiry validation, dedupe, honeypot and CSV injection escaping work
- settings and page edits show live

**Not verified (needs client credentials):** GHL contact delivery, GHL booking embed and Mon–Thu restriction, GHL SMS/email automation, Meta event delivery, and the 8MB upload/stream on the deployed Vercel host.

## 8. Open items for the client

Business email (hidden until set in Admin → Settings) · GHL calendar links + API access · which seasonal offers are active (all seeded **off**) · real product/shop photos · confirm Ambient Lights, Starlight Headliner and Vinyl Wraps (seeded hidden + "needs review") · a transparent top-down car PNG for the hero (Admin → Pages → Homepage, set style to "cutout").
