# Haven Customs — Website Build Brief (Product Catalog + Booking + Admin)

Sources: Sales Team Script (latest), existing site `D:\Codingg\BizzOne\B-June Websites\Haven Web` (Next.js), reference structure from havencustoms.com.
Rule: use the reference for **product info and structure only, do not copy the design.**

---

## 1. Project Requirements (from the team lead)

| # | Requirement | Done when |
|---|---|---|
| 1 | Add **all** products/services to the website | Every item in Section 4 is live |
| 2 | **No pricing shown** on the public site | No `$` amounts anywhere on the frontend |
| 3 | Every product has a clear **Contact Us / Get a Quote** button | Button opens the inquiry form with the product pre-filled |
| 4 | **GHL booking calendar** integrated | Bookings from the site appear inside GHL |
| 5 | **Admin portal** to add / edit / delete / hide products | Changes in admin show on the live site without a code deploy |
| 6 | Testing of products, booking, contact, and admin | QA checklist in Section 9 is fully passed |

---

## 2. Business Info

| Field | Value |
|---|---|
| Business name | Haven Customs |
| Address | 124 Production Dr, Scarborough, ON M1H 2X8, Canada |
| Phone | +1 416-431-5255 |
| Hours | Mon to Sun, 11 AM – 8 PM |
| Instagram | instagram.com/havencustoms.ca |
| Facebook | facebook.com/havencustomzz |
| Email | _To be confirmed_ |

> **Flag:** The old site uses different phone numbers (`416-430-0040` in API routes, `+1 905-803-0000` in BookingCTA). Replace all with **+1 416-431-5255** unless the client confirms otherwise.

---

## 3. Site Structure (Pages)

1. **Home** — Hero, Core Services, Featured Offers, Why Haven, Brands, Reviews, Booking CTA
2. **Products / Services** — Category grid with filters (category + vehicle type)
3. **Product Detail** (`/services/[slug]`) — Description, features, options, gallery, FAQ, *Get a Quote* + *Book Appointment*
4. **Offers** — Current deals (managed from admin, can be switched on/off)
5. **Booking** — Embedded GHL calendar
6. **Contact** — Inquiry form + map + phone + hours
7. **Brands** — XPEL, EVER, AzDome, Lingdu, Blackbox, Haven, plus tire brands (Michelin, Pirelli, Bridgestone, Toyo, Yokohama, Nitto)
8. **Gallery / About** — keep from old site
9. **Admin Portal** (`/admin`, login protected)

---

## 4. Product Catalog (public content — NO prices)

Vehicle types used across the site: **Coupe, Sedan, Midsize SUV / Truck, Extended SUV / Minivan.**

### 4.1 Window Tint
| Product | Options / Details to show |
|---|---|
| Ceramic Tint | All Doors + Rear Windshield, Side Windows Only, Per Side Window, Quarter Windows |
| Nano Ceramic Tint | Same options as above; premium heat + UV rejection (up to 80% UV/IR blockage) |
| Front Windshield Tint | Ceramic / Nano Ceramic; mixed shades (blue, rainbow) |
| Chameleon Windshield Tint | All vehicles |
| Back Windshield Tint | Ceramic / Nano Ceramic |
| Panoramic Roof Tint | Single / Double |
| Sun Strip (Front Windshield) | All cars |
| Tint Removal | Side windows, back windshield, front windshield |

- Shades: 5%, 15%, 20%, 35%, 50%, 70%. Colour shades: purple, blue, mixed.
- Included: Free installation, warranty, EVER brand ceramic film (EVER IR series available), heat & UV rejection, privacy & comfort.
- Warranty: Ceramic 1 year (peeling/bubbling). Nano Ceramic 7 years (peeling/bubbling/colour fading).

### 4.2 Dashcams (all 3-channel: front, rear, cabin)
| Product | Key specs |
|---|---|
| HD 3-Channel (Blackbox) | 1080p, WiFi, free 32GB card, free installation |
| Full HD 3-Channel | Free 32GB card, free installation |
| 4K 3-Channel (Haven brand) | WiFi + app, free 64GB card, free installation |
| 4K Lingdu V630 | Voice command, flat screen, free 64GB card |
| 5K Lingdu LD02 | Voice command + GPS, free 64GB card |
| AzDome 550 PRO | 4K front / 1080p rear, 3.18" IPS, 150° wide angle, WDR, 24H parking mode, G-sensor, 5GHz WiFi, app |
| AzDome M580 3CH 5K | Free 64GB card, 365-day warranty |
| Mirror Dashcam | Free installation + SD card |

- Installation: ~40 minutes, wires fully hidden, 1-year warranty.
- Add-ons: Plug & play install (customer camera), Fusebox hardwire (24/7 recording), OBD hardwire (on/off surveillance), 24/7 Parking Mode, new fuse, 64GB card upgrade. (128GB not available.)

### 4.3 CarPlay & Cameras
| Product | Details |
|---|---|
| Portable CarPlay (Apple + Android) | Built-in 4K dashcam + reverse camera, free 64GB card, 365-day warranty |
| CarPlay Installation | Universal or Dashboard/company-standard (includes reverse camera setup) |
| Backup Camera Installation | — |
| CarPlay Power Adapter | — |

### 4.4 Lighting
| Product | Details |
|---|---|
| Headlight Tint / Smoke | Sedan & SUV — **Mon–Thu only** |
| Tail Light Tint / Smoke | Sedan & SUV — **Mon–Thu only** |
| Headlight Restoration | Both headlights |
| Wheel Lights | Book appointment |
| Ambient Lights | From old site |
| Starlights (Starlight Headliner) | From old site |

### 4.5 Exterior Customization
| Product | Details |
|---|---|
| Chrome Delete (DLT) | Per door / all 4 doors |
| Logo Blackout | Per logo |
| Vinyl Wraps | Book appointment |
| Wheel Painting | — |
| Caliper Painting | Per caliper |

### 4.6 Paint Protection
| Product | Details |
|---|---|
| Ceramic Coating — Level 1 / 2 / 3 | Level 1 includes free Stage 1 paint correction; 4–5 hrs (vehicle needed 1 full day); 3-year warranty; final level based on paint condition — **Mon–Thu only** |
| PPF — Full Body | XPEL Black PPF, 8–10 year warranty |
| PPF — Front Half / Full Front | — |
| PPF — Individual Panels | Hood, Roof, Front/Rear Bumper, Door Cups (4) |

PPF CTA text: *"Share your vehicle type and contact number — our shop team will call you with an exact quote."*

### 4.7 Tire Services
| Product | Details |
|---|---|
| Tire Swap (on-rims) | Sedan / Midsize SUV / Extended SUV; balancing add-on available |
| Tire Change (off-rims) | Balancing included |
| Tire Rotation | On-rims / Off-rims |
| Wheel Balancing | Per tire |
| Trucks & Vans | Book appointment |

Form question: *Vehicle type?* and *Are your tires on rims or off rims?*

### 4.8 Repair Services
Tire puncture repair, air valve replacement, bent steel rim repair, tire sealant, mobile puncture service (near shop — confirm first), rusty/bad lug nut removal, broken lock lug nut key removal.

### 4.9 Offers (admin toggle on/off — show "Limited-time offer, contact us for details")
- Ceramic Tint + 3CH HD Dashcam combo (Sedan / SUV)
- Halloween Deal — front 2 doors ceramic tint
- FIFA Offer — front windshield
- $69 Dashcam Deal
- Multi-service discount (2–3 services) — **internal only, do not publish**

### 4.10 Not Offered (use in FAQ)
Rust proofing, car/floor mats, paint repair, body work / bumper repair, powder coating, car detailing, wiper blades, roof racks, AC repair.

---

## 5. Product Data Model (for Admin + Database)

| Field | Type | Notes |
|---|---|---|
| id | uuid | auto |
| name | text | required |
| slug | text | auto from name, unique |
| category | select | Tint, Dashcams, CarPlay & Cameras, Lighting, Exterior, Paint Protection, Tires, Repairs, Offers |
| short_description | text | card text, max ~140 chars |
| long_description | rich text | detail page |
| features | list of text | bullet points |
| options | list of text | e.g. "Side Windows Only" |
| vehicle_types | multi-select | Coupe, Sedan, Midsize SUV/Truck, Extended SUV/Minivan |
| brand | text | XPEL, EVER, AzDome, Lingdu… |
| warranty | text | e.g. "7 years" |
| booking_note | text | e.g. "Mon–Thu only" |
| images | image upload (multiple) | first = cover |
| internal_price | text | **admin only, never sent to frontend** (optional) |
| is_featured | boolean | show on home page |
| is_active | boolean | hide without deleting |
| sort_order | number | display order |
| created_at / updated_at | timestamp | auto |

Categories should also be manageable (name, slug, icon/image, sort order).

---

## 6. Contact Us / Inquiry Form

Fields:
1. Full Name *
2. Phone *
3. Email
4. Vehicle Type * (Coupe / Sedan / Midsize SUV-Truck / Extended SUV-Minivan / Other)
5. Vehicle Make, Model, Year
6. Product / Service * (pre-filled when coming from a product page; multi-select)
7. Tires on rims? (show only for Tire products)
8. Message
9. Preferred contact method (Call / Text / Email)

On submit:
- Send to **GHL** as a contact (tags: `website-inquiry`, `product:<slug>`) via GHL API/webhook
- Save inquiry in database → visible in Admin > Inquiries
- Show thank-you message: *"Thanks! Our team will contact you shortly."*
- Fire Meta Conversion API `Lead` event (existing `lib/metaConversionApi.ts`)

---

## 7. GHL Booking Integration

- Embed GHL calendar widget on `/booking` and in a modal from every "Book Appointment" button.
- Pass product name via URL param/custom field where possible.
- Calendar should block Fri–Sun for **Ceramic Coating** and **Head/Tail Light** services (configure inside GHL — separate calendar or service rules).
- Appointment-only services: Tires, PPF, Chrome Delete, Wraps, Wheel Lights.
- Confirmation in GHL triggers SMS/email automation (GHL side).

Needed from client/GHL admin: **Calendar embed code / Calendar ID, Location ID, API key (store in `.env`, never in code).**

---

## 8. Admin Portal

- Login protected (email + password; env-based admin user to start).
- **Dashboard:** total products, active/hidden, new inquiries this week.
- **Products:** list, search, filter by category, add, edit, duplicate, hide/show, delete, reorder, image upload.
- **Categories:** add / edit / reorder.
- **Offers:** add / edit / turn on-off with start & end date.
- **Inquiries:** list, status (New → Contacted → Booked → Closed), export CSV.
- Changes reflect on the live site immediately (ISR revalidate or dynamic fetch).

Suggested stack (matches existing Next.js site): Next.js App Router + Supabase (DB, Auth, Storage) or MongoDB + Cloudinary. Confirm before building.

---

## 9. QA Checklist (must pass before handover)

**Products**
- [ ] All products in Section 4 visible, correct category
- [ ] No price shown anywhere (search page source for `$`)
- [ ] Filters and product detail pages work on mobile + desktop
- [ ] Hidden product disappears from live site

**Contact**
- [ ] Form submits, required fields validated
- [ ] Inquiry appears in GHL with correct tags
- [ ] Inquiry appears in Admin > Inquiries
- [ ] Phone/WhatsApp click-to-call works

**Booking**
- [ ] GHL calendar loads on desktop + mobile
- [ ] Test booking shows in GHL calendar
- [ ] Confirmation SMS/email received

**Admin**
- [ ] Login works, unauthorized users blocked
- [ ] Add / edit / delete / hide product reflects on live site
- [ ] Image upload works
- [ ] Offer toggle works

**General**
- [ ] All phone numbers updated to +1 416-431-5255
- [ ] SEO titles/meta per product page
- [ ] Lighthouse mobile score checked

---

## 10. Open Items to Confirm

1. Business email address
2. GHL calendar embed / IDs and API access
3. Which offers are currently active (Halloween / FIFA / Holiday)
4. Product images — client to provide, or use stock temporarily
5. Database/hosting choice for the admin portal
6. Are Ambient Lights, Starlights, Wraps still offered (on old site, not in sales script)?
