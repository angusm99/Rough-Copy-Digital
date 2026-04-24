# Anglo Windows — Rough Copy Digital · Complete Project History
**For import into Cowork. Covers all development sessions from project start through 2026-03-17.**  
**Current working file:** `rough-copy-digital.html` (688KB, 2884 lines)  
**localStorage key:** `aw_rc_v10`

---

## Project origin

Angus at Anglo Windows (South African aluminium window & door manufacturer) wanted two things:
1. A digital version of their handwritten "rough copy" form — used on site to capture final sizes, types, colours and manufacturing info for each window/door unit before production
2. A way to extract data from scanned/photographed paper rough copies

The digital RC became the primary deliverable. It's a single self-contained HTML/CSS/JS file — no framework, no server, no build step. Runs in any browser, saves to localStorage, works offline.

---

## Session 1 — 2026-02-27 · First build
**Transcript:** `2026-02-27-11-13-59-rough-copy-digital-form.txt`

- User uploaded a blank paper rough copy PDF and a filled-in example
- Built the first version of the digital form: job header fields, unit rows table, validation
- Also built a NotebookLM/AI extraction prompt for reading scanned paper RCs
- Basic HTML form, no modal picker yet, no diagrams

---

## Session 2 — 2026-02-27 · Modal picker + PDF export
**Transcript:** `2026-02-27-11-21-16-rough-copy-form-upgrade.txt`

- Added visual diagram picker modal (click unit → choose type)
- Redesigned printable PDF layout
- Added AI extraction guide for filled-in form photos

---

## Session 3 — 2026-02-27 · Anglo Windows branding
**Transcript:** `2026-02-27-13-39-03-anglo-windows-branding-upgrade.txt`

- Applied Anglo Windows logo (gold/black)
- Dark theme established: `--bg:#0a0a0a`, `--gold:#F5B800`, `--txt:#e8eaed`
- Added product diagrams from reference charts (SVG library)
- This session established the visual identity that all subsequent versions follow

---

## Session 4 — 2026-02-27 · V4 bug fixes + diagram rebuild
**Transcript:** `2026-02-27-14-49-04-anglo-windows-form-v4-fixes.txt`

- Complete SVG product library rebuild — matched reference charts exactly
- Fixed input focus bug (click anywhere would steal focus)
- Modal redesign based on actual PDF reference charts

---

## Session 5 — 2026-02-27 · V5 modal steps + more options
**Transcript:** `2026-02-27-14-56-52-anglo-windows-v5-modal-pdf.txt`

- 3-step modal picker: Category → Product → Options
- Added opening direction (Inward/Outward) and lock position options for doors
- PDF export improvements

---

## Session 6 — 2026-02-28 · V6 SVG rebuild from DWG
**Transcript:** `2026-02-28-07-50-03-anglo-windows-v6-svg-rebuild.txt`

- User provided AutoCAD DWG file of all product diagrams
- Complete rewrite of SVG library to match DWG drawings exactly
- Products covered: sliding doors OX/OXX/OXXO/OXXXXO, multi-sliding, Vistafold folding (3/5/6/7 leaf), hinged doors (Large Pane/Cape Victorian/Classic/Louvre/Stable), pivot, casement windows (top-hung/side-hung), fixed panels, sidelights, toplights
- JS SVG generation functions for each product type

---

## Session 7 — 2026-02-28 · Diagram extraction from PDFs
**Transcript:** `2026-02-28-18-54-36-anglo-windows-v6-diagram-extraction.txt`

- Attempted to extract actual product diagrams from manufacturer PDFs
- Pivoted to a better approach: user would provide clean image sheets

---

## Session 8 — 2026-02-28 · V7 real diagram images
**Transcript:** `2026-02-28-20-03-19-anglo-windows-v7-real-diagrams.txt`

- User provided clean diagram image sheets (doors, windows)
- Built image processing pipeline: scipy bounding box detection, whitespace trimming, base64 encoding
- Diagrams now embedded as base64 images in `const IMGS = {}` object
- White background / black stroke style matching manufacturer reference

---

## Session 9 — 2026-03-02 · Image crops + mobile planning
**Transcript:** `2026-03-02-06-37-02-anglo-windows-v7-image-crops-mobile.txt`

- Auto-cropped 51 product diagrams (30 casement windows, 21 doors/sliders/folds)
- Started discussion of mobile-responsive design for on-site use
- Decided on card layout for mobile unit rows

---

## Session 10 — 2026-03-02 · V9 spec bar redesign + mobile
**Transcript:** `2026-03-02-07-59-20-anglo-windows-v9-spec-overrides-mobile.txt`

Key changes that persist to current version:
- **Spec bar** (global defaults): auto-propagation to all rows, override buttons per row
- **Colour system**: WHITE/BRONZE/CHARCOAL/BLACK/SPECIAL with text input for special
- **Hardware colour**: separate from frame colour, same options + SILVER
- **Glass types**: STD / SAFETY / LAMI / OBSCURE / TINT
- **Burglar bars**: NONE / CLEAR / PAINTED / STAINLESS
- **Mobile card layout**: tap to expand, all fields accessible on small screen
- **Desktop table**: only shown at ≥768px
- **AI autofill**: Anthropic API integration for reading handwritten RC photos (scan modal)
- **"Apply to All" override buttons** on spec bar for batch updates

---

## Session 11 — 2026-03-02 · V10 windows grid + voice
**Transcript:** `2026-03-02-10-04-08-anglo-windows-v10-windows-grid-voice.txt`

- Removed separate sash selection step for windows
- Added unified 30-image grid showing all window configurations in one screen
- Fixed hinge mutual exclusion bug (Std Hinges / Parliament Hinges)
- Added voice input via Web Speech API (Chrome/Android, free)
- Address autocomplete
- Reference photo panel for attaching site photos

---

## Session 12 — 2026-03-03 · Spec bar dropdowns + RC-X modal
**Transcript:** `2026-03-03-10-11-59-anglo-windows-v10-spec-bar-redesign.txt`

- Spec bar controls changed from buttons to dropdown menus
- Added RC-X dimension modal (for non-standard opening dimensions)
- **Auto-WRAP logic**: if Building Type = NEW BUILDING or ENCLOSURE, auto-tick WRAP on all rows
- New Sheet button added
- Default behaviour changed: start blank (no pre-loaded demo data)
- Compliance checks for frosted glass quantities (safety requirements)

---

## Session 13 — 2026-03-03 · Door-specific options + sash fields
**Transcript:** `2026-03-03-10-13-55-anglo-windows-v10-doors-sash-stile.txt`

- Door-specific modal options: safety glass enforcement, burglar bar clearing checkbox
- **Door stile selection**: 60mm (default) / 90mm — shown in step 3 for all door types
- **Sash size fields** for windows: STD / HALF / 315 / 545 / 845
- Hinged door direction: Open Inward / Open Outward
- Product ordering refined in modal
- Diagram cells: white borders for contrast on dark background

---

## Session 14 — 2026-03-04 · Blank sheet + modal fixes
**Transcript:** `2026-03-04-07-30-52-anglo-windows-v10-blank-sheet-modal-hinges.txt`

- Fixed blank sheet initialisation (colour dropdown defaults removed — no pre-selected colour)
- Modal card selection scoping: lock position and opening direction now isolated per row (don't bleed between rows)
- Auto-toggle Std Hinges for hinged doors (automatically selected, user can override)

---

## Session 15 — 2026-03-04 · Modal + PDF fixes
**Transcript:** `2026-03-04-07-40-01-anglo-windows-v10-modal-pdf-fixes.txt`

- Door stile modal default fixed (always opens on 60mm)
- Opening direction label: "Open" → "Open Inward"
- **PDF export enhancements**: spec summary block added (building type / wall type / floor / hours / flags), colour abbreviations in PDF (BRZ/WHT/BLK/CHAR/NatPC/SPCL)

---

## Session 16 — 2026-03-05 · Layout refinements
**Transcript:** `2026-03-05-06-44-14-anglo-windows-v10-layout-refinements.txt`

- Header: job/client left-aligned, large text, prominent
- Table column widths optimised (room ref, W×H inputs, glass, burglar bars, colour, extras)
- Colour abbreviations standardised: WHT/BRZ/CHAR/BLK/SILV/SPCL
- Extras field: 2-column grid layout
- Diagram cell sizing adjusted

---

## Session 17 — 2026-03-05 · Sash validation + resizable columns
**Transcript:** `2026-03-05-13-43-40-v10-sash-validation-resize-text-size.txt`

- Fixed sash size validation bugs (false positives)
- **Resizable table columns**: drag handles on column headers, widths saved to localStorage
- Increased text sizes across dashboard and PDF for field readability

---

## Session 18 — 2026-03-05 · Site measurement sheet
**Transcript:** `2026-03-05-15-21-26-site-measurement-sheet-v1.txt`

- Built a **separate** printable site measurement sheet (`site-measurement-sheet.pdf`)
- Compact table layout, 10-16 rows per A4 page
- Auto-populates from RC localStorage
- B&W print-optimised
- OCR-friendly structure for scanning back into digital system
- Built as PDF using reportlab Python script (`build_pdf.py`)

---

## Session 19 — 2026-03-05 · Site sheet PDF + multi-sash cheat
**Transcript:** `2026-03-05-18-56-34-site-sheet-pdf-cheat-multi-sash.txt`

- Site sheet converted to proper 2-page PDF: measurement table + comprehensive cheat sheet
- **HALF sash size**: added as option alongside STD/315/545/845
- Multi-slide door system planned:
  - **PALACE brand**: 60mm or 90mm stile choice
  - **VALENCIA brand**: no stile choice (different construction)
  - Both brands: panel configuration options (XX, XXX, XXXX etc.)

---

## Session 20 — 2026-03-09 · PWA Android planning + multi-slide implementation
**Transcript:** `2026-03-09-19-27-31-rough-copy-pwa-android-planning.txt`

- Implemented all planned RC features:
  - HALF sash option ✓
  - PALACE/VALENCIA brand selection for multi-slide ✓
  - Patio door configuration ✓
  - Vistafold restructure ✓
  - Midrail height input ✓
  - Sidelight options ✓
- Decided on **separate PWA companion app** for Android (rather than modifying existing file)
  - Reads/writes same `aw_rc_v10` localStorage key
  - Designed for large tap targets, full-screen unit entry, keyboard-aware layout

---

## Session 21 — 2026-03-09 · Android PWA built
**Transcript:** `2026-03-09-20-23-34-rough-copy-pwa-android-build.txt`

- Built `aw-mobile-pwa.html` (68KB) — standalone Android companion app
- Screen 1: Job details (big fields)
- Screen 2: Spec defaults (large pill selectors)
- Screen 3: Units (swipe between units, full screen per unit, keyboard-aware)
- PWA manifest: installs to home screen with Anglo Windows branding
- **Status: on hold** — Angus decided to focus on desktop RC improvements first

---

## Session 22 — 2026-03-12 · Window Builder v2
**Transcript:** `2026-03-12-18-46-21-aw-rough-copy-window-builder.txt`

Three bug fixes:
- Valencia brand: stile option hidden (Valencia construction doesn't have stile choice)
- Multi-slide diagram fallback: shows gold pcode box when no image loaded
- Selection text brightness: improved contrast on product name and option sub-labels

**Window Builder v2 — full integration:**
Built a custom SVG window layout builder integrated into the modal (Step 2, WINDOW category).

Flow: chooseCat('WINDOW') → buildStep2() → buildWindowBuilder() → wbRenderSizePrompt() or wbRender()

Builder state object:
```js
let mWB = {cols:1, rows:1, cells:[], colW:[], rowH:[], snapStd:false, overallW:0, overallH:0, sizeSet:false}
```

Features:
- Preset grid picker (30 presets from 30.5 schedule — see below)
- SVG canvas with draggable mullion/transom handles
- Click-to-edit gold dimension labels
- STD snap (300/600/900mm)
- Cell type cycling on tap: FIXED → TOP → SIDE → TOPLIGHT → FIXED
- On confirm: writes to row, generates compact `_diagSVG`, saves wbState for re-edit

Confirmed to row:
- `row.pid`, `row.pcat`, `row.pcode` — derived from cell type combination
- `row.width`, `row.height` — from overall WB dimensions
- `row.wbState` — snapshot of mWB for re-editing
- `row._diagSVG` — 80×64 compact SVG shown in diagram column

---

## Session 23 (this session) — 2026-03-17 · Preset grid + polish

### Preset system rebuilt from 30.5 series schedule drawing
`WB_PRESETS` array: 30 objects, format `{code, W, H, cols, rows, colW[], rowH[], types[]}`

Grid layout matches the physical drawing: rows = H (600/900/1200/1500/1800), cols = W (600/900/1200/1500/1800/2400)

Sash rules:
- **Standard (non-red):** 600×600 sashes
- **Red block** (W≥1800 AND H≥1200): 900×600 sashes
- Red block codes: `1812DT`, `2412DT`, `1815DT`, `2415DT`, `1818DT`, `2418DT`
- Stored in `const WB_RED = new Set([...])`

Column splits per width:
- 600w: 1 col [600]
- 900w: 1 col [900]
- 1200w H≥1200: 2 cols [600,600]
- 1500w H≥1200: 2 cols [750,750]
- 1800w non-red: 2 cols [900,900] · red: 2 cols [900,900]
- 2400w non-red: 4 cols [600,600,600,600] · red: 3 cols [900,900,600] (fixed right)

Row splits per height:
- 600h: 1 row [600] — all sash
- 900h: 2 rows [600,300] — sash top, fixed base
- 1200h: 2 rows [600,600] — double sash
- 1500h: 3 rows [600,600,300] — double sash + fixed base
- 1800h: 3 rows [600,600,600] — triple sash

Preset picker UI: scrollable table with mini SVG thumbnails. Red block cards have red border.

### Preset size transfer fix
Bug: `wbLoadPreset()` was reading `document.getElementById('wb-ow')` which doesn't exist on the grid screen. Fix: now directly uses `p.W`, `p.H`, `[...p.colW]`, `[...p.rowH]` from the preset object.

### Builder toolbar redesign
- Static size text replaced with inline editable `#wb-iw` (width) and `#wb-ih` (height) inputs
- On blur/Enter → `wbResizeOverall()` → redistributes proportionally → rerenders
- `← Change Size` button replaced with `← Presets` (back to schedule grid)
- **Cols/Rows renamed to Mullions/Transoms** — shows count of dividers (cols−1, rows−1) not sections

### Opening symbols — inverted triangle
- TOP HUNG: `<polygon>` ▽ inverted triangle, base at top, apex ~72% down
- SIDE HUNG: `<polygon>` rightward triangle, base left, apex ~70% right

### Bug fix — doubled `let mWB =`
Splice error left `let mWB = let mWB = {...}` — broke entire JS. Fixed.

---

## Current outstanding issues (priority order)

1. **Window Builder — SVG visual polish**
   - Triangle size: should fill ~65% cell height, thicker stroke
   - FIXED cell: add subtle X cross (two diagonals)
   - TOPLIGHT: increase hatching opacity to 0.5
   - Gold dim labels clip against SVG border — add padding

2. **Dim editor UX**
   - After `wbApplyDim()` rerenders, editor loses focus — re-open it programmatically for same axis+idx
   - STD buttons (300/600/900) should highlight gold when value matches

3. **Preset grid thumbnails**
   - Use `viewBox` scaling, cap height at 60px — currently tall presets overflow
   - Add two-line label: opening size (red) + frame size in brackets (black)

4. **Confirm to row**
   - `applyWindowBuilder()` should always overwrite `row.width`/`row.height`, not skip if already set
   - Notes field: replace existing "Builder: ..." line instead of appending

5. **Sash Size column for builder rows**
   - Hide Sash W/H dropdowns for `row.wbState` rows
   - Replace with compact read-only: e.g. `"2c×1r · 900|900 × 600"`

6. **Validation tab: builder rows showing false errors**
   - `getMiss()` already exempts builder rows — but validation tab UI still surfaces false positives
   - Audit and clean up

7. **PDF export — not yet built**
   - Landscape A4 table matching desktop layout
   - Anglo Windows logo header, job details, one row per unit
   - `_diagSVG` renders in Diagram column
   - Use the `pdf` skill

---

## Architecture quick reference

| Item | Detail |
|---|---|
| File | Single HTML/CSS/JS, no framework, no external deps |
| Storage | `localStorage` key `'aw_rc_v10'` |
| Row object | `{id, pid, pcat, pcode, popt, popt2, popt3, width, height, qty, room, sash_w, sash_h2, sash_h2_val, glass, burgbar, color, special_color, hw_clr, hw_clr_custom, stile, midH, sidelight, openers, extras{}, wbState, _diagSVG}` |
| Builder state | `mWB` global — reset on fresh open, restored from `row.wbState` on re-edit |
| Diagram source | `row._diagSVG` → `IMGS[pid]` → gold pcode text fallback |
| Modal steps | Step 1: Category · Step 2: Product (or WB for windows) · Step 3: Options |
| WB cell types | FIXED `#3a6bc2` · TOP `#2e9e68` · SIDE `#c28a2e` · TOPLIGHT `#7a5ea8` |
| WB snap sizes | `WB_STD = [300, 600, 900]` |
| CSS theme | `--bg:#0a0a0a` `--gold:#F5B800` `--txt:#e8eaed` `--surf:#141618` `--surf2:#1c1f23` `--mut:#8a9ab0` `--border:#2a2f38` |
| Buttons | `.btn.btn-g` = gold fill · `.btn.btn-o` = outlined gold |

## Product knowledge

| Series | Type | Notes |
|---|---|---|
| 30.5 | Top Hung window | Code format: `30.5-WWHHX` |
| 305 | Side Hung window | Code format: `305-WWHHX` |
| Sliding patio | OX/OXX/OXXO/OXXXXO | O=fixed panel, X=sliding |
| Multi-slide | PALACE or VALENCIA brand | PALACE: 60mm/90mm stile · VALENCIA: no stile |
| Vistafold | 3/5/6/7 leaf + Custom | Folding/stacking door |
| Hinged | Single/Double | Options: Midrail, Colonial Bar (3 or 4 rail, single or double) |

Glass: STD / SAFETY / LAMI / OBSCURE / TINT  
Burglar bars: NONE / CLEAR / PAINTED / STAINLESS  
Frame colours: WHITE / BRONZE / CHARCOAL / BLACK / SPECIAL  
HW colours: BRONZE / WHITE / CHARCOAL / BLACK / SILVER / SPECIAL  
Door stile: 60mm (default) / 90mm  
Sash width options (non-builder rows): STD / HALF / 315 / 545 / 845

---

## Other files in the project

| File | Purpose | Status |
|---|---|---|
| `rough-copy-digital.html` | Main desktop RC app | Active, current |
| `aw-mobile-pwa.html` | Android PWA companion | Built, on hold |
| `site-measurement-sheet.pdf` | Printable A4 site survey sheet | Done |
| `build_pdf.py` | Python script that generates the site sheet PDF | Done |

---

## How to use this document in Cowork

Drop `rough-copy-digital.html` and this file into Cowork at the start of each session. Then use the opening prompt from `cowork-handoff.md`. This history document gives Cowork the full context of every architectural decision made — so it understands *why* things are the way they are, not just *what* they are.
