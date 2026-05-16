# Handoff · ThermalIQ "Living Glass" redesign

A hi-fi redesign of the ThermalIQ dashboard and occupant view. The target codebase is `agao8-boop/thermaliq` (Next.js 14 App Router + Tailwind v4 + TypeScript).

The user prefers **Direction 2 · Living Glass** out of three explored directions.

---

## 1 · About the design files in this bundle

The files in `prototype/` are **design references created in plain HTML + React/Babel**. They are not production code — they're a high-fidelity mockup of intended look and behavior, rendered as a side-by-side design canvas.

Your job is to **recreate the Living Glass screens in the existing Next.js codebase** using the patterns already there (App Router, server/client components, Tailwind v4, the `mock-data.ts` shapes, the existing `/api/admin/chat` SSE stream, the existing `/api/bms/write` endpoint). **Do not rewrite the data layer.** Only the visual + interaction layer changes.

### How to read the prototype

Open `prototype/ThermalIQ Design Explorations.html` in a browser. Use the design canvas to:
- Pan with the spacebar, zoom with cmd-scroll.
- Click any artboard's expand icon (top-right) to focus it fullscreen.
- The artboards labelled **"02 · Living Glass"** are the canonical visual spec — admin overview, drill-in sheet, and occupant view.

You should also read:
- `prototype/glass.jsx` — the full React source of the Living Glass direction; the same colors, sizes, and structure should be ported to the Next.js codebase
- `prototype/shared.jsx` — mock data the prototype uses (just for reference; the real app already has `lib/mock-data.ts`)

---

## 2 · Fidelity

**High-fidelity.** Match the colors, typography, radii, and shadows precisely. The aesthetic IS the feature here.

If something can't be ported 1:1 (e.g. a CSS feature your browser support matrix forbids), preserve the visual intent and document the deviation.

---

## 3 · What's changing, screen by screen

### A · Global shell (replaces `app/(dashboard)/layout.tsx` look — same structure)

Keep the existing layout structure: `<GlobalHeader /> | (AIDirectorSidebar + (KPIStrip + TabNav + main))`. **Do not remove the sidebar — keep it on the left as it already is.** The shell just needs new chrome:

- **Body background:** soft mint→sky→peach mesh of blurred radial gradients (see `tokens.css` → `body::before`).
- **Header (`components/layout/GlobalHeader.tsx`):** Replace the Cormorant serif wordmark with a single-line Geist wordmark `thermal·iq` (700, -0.02em letter-spacing, 22px). Remove the long address; keep "Meridian Tower". Push the mode toggle to the center (see B). On the right: a small pill cluster `● BMS LIVE · 420 gCO₂/kWh · 10:42 AM`, all mono 10px.
- **KPIStrip:** Convert to three or four **glass tiles** (`.glass` class from tokens.css) with rounded 24px corners and the new label / value typography. Stop stretching them edge-to-edge — leave horizontal padding so the body gradient shows through between cards.
- **TabNav:** Convert to a row of soft pill chips. Active chip = `.glass-strong` background; inactive = transparent text. Drop the green underline.

### B · Mode toggle (`components/layout/ModeToggle.tsx`)

Replace whatever's there with the dark pill from reference image 1. Spec in `tokens.css` under `.mode-toggle`:

- Outer pill: `background: var(--lg-ink)`, 4px padding, full radius.
- Active option: white pill on top, ink text, 600 weight.
- Inactive: rgba(255,255,255,0.9) text on the dark pill.

Two options: `Admin` / `Occupant`.

### C · AI Director sidebar (`components/ai/AIDirectorSidebar.tsx`)

The existing sidebar has the right ideas (header, message stream, quick chips, input). Re-skin it as a single floating **glass-strong** panel inset 18px from the left/top/bottom of the viewport.

Spec:
- Outer container: `.glass-strong`, 24px radius, 18px padding inset from layout edge. Width 304px (existing 310 is fine).
- Header row: 28px mint→deep-mint radial-gradient avatar + `AI Director` (Geist 13, 600) + `● listening` (Geist Mono 9, mint-deep).
- Replace the initial monologue text with **one editorial line** in Geist 13, line-height 1.55 (no all-caps, no emoji). Example: "Three quiet wins ready this morning. Carbon target is **78% met** — let's close the gap before the afternoon peak."
- Suggestion cards: nested `.glass-soft` (rgba(255,255,255,0.55), 16px radius, 1px white stroke). Top row: title (Geist 12, 600) + impact badge (mono 9, mint-deep on mint-22 background). Body: rationale, Geist 11, ink-70.
- Input bar at the bottom: pill-shaped (`.glass-soft` rounded full), 36×36 mint-gradient send button as the right cap.

Pull suggestions from `AI_QUEUE` in the prototype — feed the real list from your `lib/mock-ai.ts` if it exposes one, otherwise hard-code three for now and back-fill once the streaming endpoint reports them.

### D · Admin overview (replaces `/zones`, `/passive`, `/nbs` opening states)

Currently each tab dumps a wall of cards. The user explicitly asked to **not lay everything out on the dashboard**, but instead surface a few entry points that **open layers when clicked**.

Restructure to a **two-column overview** (1.3fr / 1fr):

**Left column (top → bottom):**
1. **Carbon hero card** (`.glass-strong`, 24px corners, 24px padding) — a two-column inner layout:
   - Left inner: eyebrow `DECARBONIZATION · YTD`, then `26.4` in Geist 56/600/-0.03em + `tCO₂e avoided` in 14/55. Then two chip badges (`−38.7% vs baseline` in mint-deep; `Target 68.2t · year end` in ink-70). Below: "Today's mix" — a single horizontal stacked progress bar 10px tall split mint-deep / mint / ink-15 representing passive vs NBS vs active kWh.
   - Right inner (200px wide): a circular radial progress ring inside a glass orb (white→mint radial-gradient backdrop, blurred). The ring uses a mint→mint-deep linear gradient and rounded line caps. Center label: `78%` (40/600) + `OF DAILY TARGET` eyebrow.
2. **KPI row** (3 tiles, each `.glass`, 16px padding): "Carbon today · 17.1 kg CO₂e", "AI intercepts · 6 actions", "Comfort events · 8 vs 11 avg". Big number Geist 30/600 in mint-deep (use amber for the intercepts tile so warmth peeks through).
3. **AI Director queue card** (`.glass`) — eyebrow + 2×2 grid of clickable suggestion tiles. Each tile = soft glass, title + impact badge + ETA. Clicking opens the **drill-in sheet** (see F).

**Right column:**
1. **Isometric building visualization** (replaces `components/zones/FloorPlanGrid.tsx`). See E below. Card = `.glass-strong`.
2. Two side-by-side `.glass` entry tiles:
   - "Passive strategies · 5 / 6 active" with a 6-pip status bar (active = mint-deep, idle = ink-15).
   - "Nature-based · 1 asset needs water" (warning amber number).

Both entry tiles open their respective drill-in sheets when clicked. **Do not** put the long PassiveTechCard list or NBSAssetCard wall on the overview.

### E · Visualized zone layout (replaces `FloorPlanGrid`)

The user explicitly asked for a **visualized zone layout, not the plain version**. Use the isometric building from the prototype:

- An SVG, 460×320 viewBox inside a `.glass-strong` card.
- Stack the floors (2, 3, 4, 6) as parallelograms, projected from `(xf, yf, zf) → (cx + (xf − 0.5)*fW + (yf − 0.5)*fD*0.45, baseY − zf*36 − (yf − 0.5)*fD*0.42)` with `fW = 260`, `fD = 110`. Top face = rgba(255,255,255,0.85); right face = .30; left face = .45. Subtle white strokes.
- For each zone, project a rectangle on the floor's top face using its `x, y, w, h` (normalized 0–1) and fill with the status color at 0.40 opacity (selected = 0.70 with a 1.5px solid stroke).
- Hot zones get a thin vertical "heat plume" line rising 22px above center.
- Floating annotation pill (white-85, 1px rust-44 border) in the top-right: "Roof terrace · 82.4°F" — make the annotation dynamic to whichever zone has the highest delta.
- Legend row above the SVG: small status dots `OK · Warn · Hot · Cold`.
- Click handler on each zone group opens the drill-in sheet (see F).

The zone coordinates exist in the prototype's `shared.jsx` (`ZONES` array, `x/y/w/h` fields). Either add those fields to `lib/mock-data.ts` (preferred) or compute them from existing `floor` + a small lookup map.

### F · Drill-in sheet (replaces inline ZoneDetailPanel)

The user asked for "more layers after people click into the button instead of laying out everything on the dashboard together". This is the layer.

When a zone, an AI suggestion, a passive strategy, or an NBS asset is clicked, an **animated right-side sheet** slides in over the dashboard:

- Container: `position: absolute; top:0; right:0; bottom:0; width: 400px; padding: 18px;` with `animation: lg-sheet-in 280ms cubic-bezier(.2,.7,.1,1)` from `tokens.css`.
- Inner panel: `.glass-strong`, 24px corners, 24px padding, `display: flex; flex-direction: column; gap: 14px;`.
- Header row: eyebrow + title (Geist 22/600/-0.01em) + 32×32 round close button (white-70 background, ink color).
- **Hero reading** block: gradient background `linear-gradient(155deg, {statusColor}30, {statusColor}10)`, 18px radius. Massive temp number (Geist 56/600/-0.03em) in the status color, °F suffix, current setpoint to the right in mono.
- 3-up metric grid (RH, CO₂, Comfort) — small soft glass tiles.
- **AI recommendation** block: soft glass card with eyebrow `AI SAYS`, one short sentence calling out the expected −°F and kg CO₂e in mint-deep 600, then a row of two buttons: primary mint-gradient "Approve · run now" + ghost "Hold".
- (Optional) Setpoint slider section with mono readout — same as the existing ZoneDetailPanel, restyled.
- Footer: mono 10/ink-35 timestamp `BMS · last write 11:42 · setpoint = 72°F`.

The same sheet shell is reused for AI-queue drill-ins (different inner blocks: "Why am I suggesting this?" rationale + "What I'll change" diff + approve/hold) and for NBS asset drill-ins. **Build one `<DrillSheet>` shell component with slot/children for the body.**

The sheet must:
- Trap focus while open.
- Close on `Esc` and on click of the close button.
- Animate in (slide + fade). On close, animate out before unmounting.

### G · Occupant mode (replaces `app/(occupant)/occupant/page.tsx`)

The user wants this **concise, one-screen, lean on the AI agent rather than manual input**.

Restructure to a single column ≤480px wide (works on tablets too, but designed mobile-first):

1. **Top bar:** "Hello, Mia" (ink-55) + "North Office · F3" (Geist 20/600). On the right: 38px mint-gradient avatar circle (no chat bubble).
2. **Comfort hero** (`.glass-strong`, 22px padding): eyebrow `YOUR AIR RIGHT NOW`. Big temp `74.2°F` in amber (or status color), `+2.2° above your target` muted. Pill tag on the right `a touch warm` in amber/22 background. Below: 3 soft-glass mini tiles for RH / CO₂ / Air.
3. **AI status banner** (`.glass`, 14px padding): 34px mint-gradient avatar circle + one-sentence status "Already nudging supply −1.5°F and deploying shading." + small mint-deep 600 line "Resolving in ~8 min · no action needed."
4. **Chat thread** (flex 1, scrollable): only show messages **after** the AI status banner — i.e. the AI has already acted, and the conversation starts from the user clarifying. Round bubbles, AI = white-80 glass with ink text; user = mint-gradient with white text.
5. **Quick reaction chips** (soft glass pills): `Too warm` / `Too cold` / `Stuffy air` / `Too noisy`. Tapping a chip sends the message and the AI replies — **the chip should NOT open a form**.
6. **Input pill** at the very bottom: soft glass pill, 40×40 mint-gradient send button as cap.

Drop these from the current occupant page:
- The Cormorant serif title "Your Comfort, personalised".
- `<ZonePicker>` — the AI should resolve the zone automatically from sign-in or location (use a server-side lookup; for the mock just hard-code `z-001`).
- `<WearableConnect>` — move to a separate `/occupant/settings` route. Don't show on the main view.
- `<PersonalComfortCard>` is replaced by the new compact comfort hero.
- `<BuildingOverview>` — drop entirely from occupant view; that's admin territory.

---

## 4 · Concrete file mapping

| Prototype block | File to create or modify in `agao8-boop/thermaliq` |
|---|---|
| `tokens.css` (this bundle) | **Replace** `app/globals.css`'s `:root` block + `html,body` block + add the `body::before/::after` mesh layers. Keep the existing `@import "tailwindcss"` line. |
| `Geist` font load | Replace the Cormorant/DM-Sans/Azeret-Mono Google Fonts import with the Geist import in `tokens.css`. Remove direct references to `Cormorant Garamond`, `DM Sans`, `Azeret Mono` across the codebase. |
| Mode toggle pill | `components/layout/ModeToggle.tsx` — rewrite per spec B. |
| Header re-skin | `components/layout/GlobalHeader.tsx` — per spec A. |
| AI Director sidebar | `components/ai/AIDirectorSidebar.tsx` — re-skin per spec C. Keep the SSE stream and BMS execute logic. |
| AI Director queue card on overview | New file `components/ai/AIDirectorQueueCard.tsx`. |
| Carbon hero card | New file `components/admin/CarbonHero.tsx`. |
| Admin overview | New file `app/(dashboard)/overview/page.tsx` — set this as the default landing for admins. (Or repurpose `/zones` if you prefer.) Update `TabNav.tsx` to lead with "Overview". |
| Isometric building viz | New file `components/zones/IsometricBuilding.tsx` — replaces or sits beside `FloorPlanGrid.tsx`. |
| Drill-in sheet shell | New file `components/layout/DrillSheet.tsx` — reusable. |
| Zone drill-in body | New file `components/zones/ZoneSheetBody.tsx` — replaces `ZoneDetailPanel.tsx` (delete the latter once swapped). |
| AI suggestion drill-in body | New file `components/ai/AISheetBody.tsx`. |
| Passive strategy drill-in body | New file `components/passive/PassiveSheetBody.tsx`. |
| NBS drill-in body | New file `components/nbs/NBSSheetBody.tsx`. |
| KPI tiles | `components/KPIStrip.tsx` — restyle with `.glass`, drop the dividers and the 4-column grid (use a flex row with gap so the body mesh shows between cards). |
| Occupant page | `app/(occupant)/occupant/page.tsx` — rewrite per spec G. |
| Occupant comfort hero | New file `components/occupant/ComfortHero.tsx`. |
| Occupant AI status banner | New file `components/occupant/AIStatusBanner.tsx`. |
| `OccupantAIChat.tsx` | Keep, but trim: skip the welcome message preamble and start from the AI status banner state. Re-skin bubbles per spec G #4. |
| `ZonePicker`, `WearableConnect`, `BuildingOverview`, `PersonalComfortCard` | Move out of the occupant main page. Delete `PersonalComfortCard` (replaced by `ComfortHero`). |

---

## 5 · Design tokens (extracted)

All listed in `tokens.css`. The minimum the developer needs:

**Colors**
```
bg-base   #E8F1EA   mint canvas tint
bg-blue   #DEEAEE   sky canvas tint
bg-warm   #F2EAD9   peach canvas tint
ink-deep  #1B2A2A   primary text
ink       #243333   secondary text
mint      #7DB8A1   secondary accent / glow
mint-deep #3F7F66   primary action / OK status
teal      #5E9DA4
amber     #C9905E   WARN
rust      #B5604B   HOT
sky       #84B6CC   COLD
glass     rgba(255,255,255,0.78)
glass-hi  rgba(255,255,255,0.92)
```

**Type scale (Geist)**
```
display-xl  56 / 600 / -0.03em   carbon hero number, occupant temp
display-l   42 / 600 / -0.03em   drill-in ring number
display     30 / 600 / -0.02em   KPI tile values
title-l     22 / 600 / -0.01em   drill-in card title
title       18 / 500             card subtitle
body        13 / 400 / 1.55      paragraph text inside cards
body-sm     12 / 400 / 1.55      bubble text
ui          11 / 500             chip / button label
mono-12     12 / 400             timestamps, status pills
mono-10     10 / 400             status badges
eyebrow     10 / 400 / 0.16em-tracking / uppercase
```

**Radii** — pill 999, card 24, card-sm 16, control 12.

**Shadows** — see `.glass`, `.glass-strong`, `.btn-primary` in `tokens.css`.

---

## 6 · Interactions

- **Drill-in open/close:** see spec F. Animate, focus-trap, close on Esc.
- **Mode toggle:** route swap (`/` ↔ `/occupant`). Animate the active pill with a layout transition if you're using framer-motion; otherwise a fast 200ms cross-fade.
- **AI Director input:** keep the existing SSE stream from `/api/admin/chat`. The new visual is a pill input + circular send button.
- **Zone selection** in the isometric viz: hover → 0.55 fill, click → 0.70 fill + 1.5px stroke + open drill-in.
- **AI quick chips (occupant):** tapping a chip sends the message immediately; do NOT open a modal or form.
- **Live numbers** anywhere on the page: when a value changes, briefly highlight with a 200ms fade from `mint-deep/12` to transparent on the parent tile.

---

## 7 · State + data

Nothing new. The existing `lib/mock-data.ts` and `lib/mock-ai.ts` cover everything in this design. Two small additions you may want:

1. Add `x, y, w, h` floor-plan coords (0–1, normalized to each floor's footprint) to each `Zone` so the isometric building can place them. Sample values are in `prototype/shared.jsx` (`ZONES` array).
2. Add an `AI_QUEUE` array (or expose one from `lib/mock-ai.ts`) so the AI Director queue card has typed data instead of parsing chat text.

---

## 8 · Deploying

The user's app is deployed by **Claude Code**, presumably with `vercel` or similar. After the changes land in the repo, run the usual `vercel --prod` (or whatever CI hook you have) to redeploy. No environment-variable changes are needed.

---

## 9 · Out of scope (do not touch)

- API routes (`/api/admin/chat`, `/api/bms/write`, `/api/nbs/irrigate`).
- Gemini integration in `lib/gemini.ts`.
- Type definitions in `lib/types.ts` (only additive changes for the floor-plan coords are fine).
- The mode-context provider — its existing API is correct.

---

## 10 · Open questions to confirm with the user

1. Should the **occupant zone** be auto-detected (e.g. from a Wi-Fi AP, Bluetooth beacon, or sign-in metadata), or do we keep a small zone-selector somewhere accessible?
2. Are the **AI queue items** populated by Gemini analyzing live state, or hand-curated server-side? Decide before wiring `AIDirectorQueueCard`.
3. Should the **carbon hero** show YTD or a moving 30-day window by default? Add a small `7D / 30D / YTD` toggle if both are wanted.
4. Do you want the **mesh background** to subtly animate (a slow 30s orb drift) or stay static? Static for now in this spec.
