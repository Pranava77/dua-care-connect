# SilverSync UI — design notes

## Brief

- **Subject:** SilverSync, the operations app of a small residential care home (5 residents on two floors in the demo data).
- **Audience:** the people who run the home all day: doctors, nurses, accountants, HR and reception, on desktops at the nurses' station and on phones on the floor.
- **Job:** know in seconds who needs what (refills, overdue bills, pending consent, leave), then act on records, documents and the assistant.
- **Constraints:** a working tool used for hours, so usability outranks spectacle. No loader, no WebGL, no smooth-scroll library, transitions under 400 ms that never block. Every role sees only its own modules.
- **Assumptions:** the demo data (residents, rooms 101 to 202, staff) stays as placeholder content from `backend/app/scripts/seed_data.py`. No real names, logos or metrics are added.

## Concepts

| | A. Every resident has a door (material/place) | B. The care round (process) | C. Hallmarks (name) |
|---|---|---|---|
| Idea | Dementia-friendly homes paint each resident's front door its own colour, with their name and number, so they can find home. The app represents every resident by that door, everywhere. | The day runs on fixed medication rounds (08:00, 12:00, 18:00, 22:00); a 24-hour band across the app places every task on the clock. | Silver is hallmarked; every record carries a stamp of who, when, what. |
| Anchor | Coloured, numbered doors are a real dementia-design practice; the data already has room numbers 101 to 202 on two floors. | Real rounds and shift handovers. | The word "silver". |
| Layout | Floors as corridors of doors; residents as door plates in every list. | A timeline strip on every page. | Stamps in record margins. |
| Motion verb | a door swings open | the clock hand advances | a stamp strikes |
| Signature | Hover or focus a door: it swings open on its hinge and shows the room's needs behind it; clicking walks you through the door into the resident's page (shared-element transition). | The now-line moves along the day band. | Records stamp in. |
| Screenshot | Two corridors of coloured doors, one with its call light glowing. | The day band at 07:58. | A stamped record. |
| O / F / Fe / P | 4 / 5 / 4 / 2 | 3 / 5 / 4 / 3 | 2 / 2 / 3 / 4 |

**Pick A.** Strongest anchor (real care practice plus the real room data), it gives a rule for layout, colour, motion, copy and the 404, and it is buildable with CSS 3D transforms and the View Transitions API. From B: times are always set in the mono face, as rounds are. Swap test: put a hotel in the sentence and it breaks, because hotel doors are identical on purpose.

## Concept card

```
Idea:        Every resident has their own coloured door, and the app uses that door wherever the resident appears.
Metaphor:    the corridors of a dementia-friendly care home (coloured doors, room plates, nurse-call lights, wayfinding signs)
Signature:   the Corridor: floors drawn as corridors of doors; a door swings open on hover/focus to show what that room needs,
             and opens into the resident's page via a shared-element view transition
Emotion:     calm orientation: "I know where everyone is and who needs me"
Motion verb: swing on a hinge (rotateY from the left edge, settle), lights come on (fade from dim)
Screenshot:  the dashboard corridor, two floors of coloured doors, one call light glowing amber over Room 103
```

## System

### Palette (wayfinding signage: neutral walls so the doors carry the colour)

| Role | Hex | Use |
|---|---|---|
| wall (ground) | `#EDEFEA` | page ground, a cool corridor wall |
| plate (surface) | `#FFFFFF` | panels, tables, inputs, door number plates |
| ink | `#131B18` | text, primary buttons, focus ring |
| muted | `#4D5853` | secondary text (6.4:1 on wall, 7.4:1 on plate) |
| line | `#CFD4CC` | hairlines, borders |
| call light (accent) | `#F0A202` | needs-attention only: call lights, alert markers, the primary button's hover panel (ink text, 8.2:1). Never text on wall. |
| warning text | `#855400` | amber-family text that passes AA on plate ("2 needs", pending tags) |
| danger | `#A3261C` | destructive actions, overdue |
| doors | red `#A3261C`, blue `#1F4FAE`, green `#1E6B47`, plum `#6E2A73`, teal `#0E6A73`, ochre `#E2B23A` (ink text), slate `#3E4A61`, rust `#A8430F` | one per resident, stable from their id; white text AA on all except ochre (ink text) |

Single committed light theme (staff read records for hours; the corridor is lit).

### Type

- **Atkinson Hyperlegible Next** (Google, variable 200 to 800): everything. Designed by the Braille Institute for low-vision readers; the home's signage voice, and kind to tired eyes on a night shift. Display at 700 to 800 with negative tracking.
- **Atkinson Hyperlegible Mono** (Google, variable): room numbers, times, dates, amounts, IDs (the "round" detail from concept B). Tabular by nature.
- Scale: `--t-xl clamp(2.25rem, 1.4rem + 3.2vw, 4rem)` (page titles, track -0.035em, leading 0.95), `--t-l clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem)`, `--t-m 1.25rem`, body 1rem/1.55, UI 0.875rem, meta 0.8125rem.

### Grid and rhythm

- App frame: directory rail 264 px + content. Content max 1320 px, 12 columns, gutter `clamp(16px, 2vw, 28px)`.
- Page header: title on column 1, actions right-aligned to the last column, description under the title at 60ch.
- Rhythm: header airy (48 px), corridor full width, lists tight (12 px rows), sections 40 to 56 px apart.

### Shape

One radius: **6 px** for controls, plates and panels. Doors are 6 px at the top only (a door leaf). Status tags are rectangles with 6 px, never pills. No soft drop shadows; depth comes from 1 px lines and the door's opening shadow.

### Motion language

- Ease `cubic-bezier(0.2, 0.7, 0.1, 1)` (settle), durations: hover 0.35 to 0.5 s, page enter 0.32 s, door transition 0.45 s.
- **Doors** (residents everywhere): `rotateY(-58deg)` from the left hinge with perspective; what the room needs is revealed behind the leaf.
- **Primary buttons:** an ink panel swings in from the hinge side (left edge, scaleX from 0), label inverts.
- **Nav (directory):** the "you are here" marker slides to the hovered item; current item keeps it.
- **Rows and cards that open a resident:** their door chip swings slightly (rotateY -28deg).
- **Inline links:** underline at rest, thickens on hover.
- **Page change:** content lights up (opacity 0.4 → 1, translate 6 px) in 320 ms; resident door → resident page uses a view transition on the door.
- **Idle:** doors with an open alert show a nurse-call light that breathes (2.4 s), the only thing moving at rest. Meaningful, ambient, off under reduced motion.
- No GSAP or Lenis: an app needs native scroll, and every effect is CSS transitions, keyframes or the View Transitions API (no JS animation loops at all).

### Composition plan

```
Shell                         Dashboard
+--------+-----------------+  +-------------------------------------------+
|SilverS.| search   Ask AI |  | Good morning, Sarah.      Tue 21 Oct 08:14|  statement
|Directory|----------------|  | 3 rooms need you today.                   |
| ● Dash  |                |  |-------------------------------------------|
|   Resid.|  page          |  | FLOOR 2  [201][202]                       |  corridor
|   Medic.|                |  | FLOOR 1  [101][102][103*]                 |  (signature)
|   Docs  |                |  |-------------------------------------------|
|   ...   |                |  | Needs attention        | Today            |  index list + pair
| user    |                |  | ▸ Metformin refill 101 | 5 residents ...  |
+--------+-----------------+  +-------------------------------------------+
Residents: title + search | corridor of large doors by floor (each door opens: age, conditions, actions)
Resident:  big door (view-transition target) + name h1 + room | records, prescriptions, bills, documents in columns
Tables (medical, accounting, documents, HR): title band, filter row, ruled table, residents shown as door chips
404:       a blank stretch of wall with an empty number plate: "There is no room here."
```

### Genericness test (what changed)

- The obvious answer was "clean light SaaS dashboard: cards, charts, avatar circles, Inter, blue accent". Changed: avatars are coloured doors with room numbers; the dashboard leads with the corridor, not KPI cards; charts with invented numbers were removed (they were mock data), keeping only real counts; type is Atkinson (legibility as a care value) instead of Inter.
- The previous UI was near-black with a vermilion accent and gradient-text headings (an AI default). Replaced with signage neutrals where colour belongs to the doors.
- No uppercase eyebrows over headings; floor labels are the only small caps, because they are real wayfinding signs.

## Build decisions (recorded during implementation)

- **Handrail:** the corridor gained a contrasting handrail line (dementia-friendly corridors use them), which also gives the long floor rows a horizon.
- **Charts removed:** the old dashboard's occupancy, revenue and attendance charts used invented numbers. They are gone; every figure on screen is now computed from the API (counts, GBP totals, billed by service, staff per department).
- **Role honesty:** sections a role cannot read are hidden, never shown as zero (a doctor no longer sees "Invoices 0").
- **Idle state:** only the call lights breathe (a halo around a lamp that stays lit, so every still frame shows it on). Nothing else moves at rest; this is an all-day tool.
- **Motion stack:** CSS transitions and keyframes plus the View Transitions API; no GSAP, Lenis or JS animation loops.
- **Crawlers:** the app is a private staff tool holding health records, so it is `noindex` with `robots.txt` disallowing all. SEO checks that assume a public site (sitemap, canonical, OG image) are intentionally out of scope.
- **404 status:** the SPA is served with an `index.html` fallback, so unknown URLs render the designed 404 with HTTP 200. A real 404 status needs the host to know the route table.
- **Page changes:** the directory cross-fades between pages with the View Transitions API (root cross-fade, 320 ms); a door click morphs the door into the resident page's door. Both fall back to an instant change under reduced motion or without support.
- **Demo data that stays current:** seed dates are written as if today were 5 February 2024 and shifted to the real date on seeding (birthdays and hire dates stay fixed), so refills read "due in 5 days" instead of "overdue by 984 days". Payment methods are UK ones (BACS, card, Direct Debit, cash, cheque).
- **Tab titles:** every route sets its own title ("Ethel Williams, room 103 · SilverSync").

## QA log

- Pass 1 (self): fixed phone overflow in "Needs attention", room notes leaking out of doors on touch, label-in-name and definition-list axe issues, layout shift from the corridor loader (CLS 0.165 → 0).
- Pass 2 (separate critic, evidence only): 6.6 overall (Design 7, Usability 6, Creativity 7, Content 6). Its reading of the idea matched the concept card. Fixed from its list: current page never marked in the directory (Radix Slot dropped NavLink's class function), unnamed icon buttons, phone page headers clipping their buttons, tables pushing past cards, identical tab titles, hard-cut page changes, stale and inconsistent demo data, wrapped table headers and phone numbers, the 2.7 s LCP on Reports (PDF library now loads on demand).
- Frame rate: headless Chrome on the QA machine is capped near 30 fps even on about:blank, so scroll FPS from these runs is the machine's limit, not the site's.
