# Anglo Windows — Rough Copy Digital · Master Project Context
**Last updated:** 2026-03-17  
**Current file:** `rough-copy-digital.html` (688KB, 2884 lines)  
**localStorage key:** `aw_rc_v10`

This document is the complete development history and architecture reference for the Anglo Windows Rough Copy Digital tool. Drop it into Cowork alongside `rough-copy-digital.html` at the start of any session.

---

## What this tool is

A single-file (HTML/CSS/JS) dark-themed field measurement and quoting tool for Anglo Windows, a South African aluminium window and door manufacturer. Used on-site by installers to capture unit types, sizes, quantities, glass specs, colours, and extras. Outputs to a printable PDF and persists locally via localStorage.

**No framework. No external dependencies. Self-contained.**

---

## Development history — session by session

### 2026-02-27 — Session 1: Foundation
- Created the initial digital rough copy form from scratch
- Basic row table, validation, export, AI extraction prompt for NotebookLM

### 2026-02-27 — Session 2: Modal picker + PDF
- Added visual diagram picker modal (category → product → options, 3 steps)
- Redesigned printable PDF layout
- ReportLab PDF generation code (Python, separate from the HTML)

### 2026-02-27 — Session 3: Branding
- Anglo Windows logo embedded (base64)
- Gold + dark grey colour scheme established — this became the permanent design language
- Product diagrams from actual reference charts added

### 2026-02-27 — Session 4: SVG library + modal redesign
- Complete product SVG library rebuild based on PDF reference charts
- Input focus fix
- Modal redesign

### 2026-02-27 — Session 5: 3-step modal + PDF export
- Finalised Category → Product → Options modal flow (still the current structure)
- PDF export implemented inside the HTML file
- Opening direction and lock position options for doors

### 2026-02-28 — Session 6: SVG diagram library rebuild
- Full SVG redraw of all product types to match reference style exactly
- Sliding doors: OX / OXX / OXXO / OXXXXO
- Multi-sliding, Vistafold folding, hinged (Large Pane / Cape Victorian / Classic / Louvre / Stable)
- Pivot doors, casement windows (top-hung / side-hung), fixed panels, sidelights, toplights
- JS SVG generation functions per product type

### 2026-02-28 — Session 7: PDF diagram extraction
- Attempted SVG improvements, then pivoted to extracting actual product photos from PDFs
- PDF image extraction with bounding box detection (scipy), whitespace trimming, base64 encoding
- Preview generation — these became the `IMGS` object embedded in the file

### 2026-02-28 — Session 8: Real diagram crops
- Auto-cropped 51 product diagrams from user-provided sheets (30 casement windows, 21 doors/sliders/folds)
- White backgrounds, black strokes matching reference style
- Base64 encoded and embedded

### 2026-03-02 — Session 9: Mobile layout + spec overrides
- Mobile card layout (tap-to-expand) vs desktop table (≥768px)
- Spec bar redesign: auto-propagation, override buttons, Apply to All
- Glass / burglar bars separated
- Colour options: BLACK / SILVER / SPECIAL with text input
- Hardware colour input
- AI autofill via Anthropic API for handwritten RC photos
- Fixed JS syntax errors (literal newlines in product labels)

### 2026-03-02 — Session 10: Window grid + voice input
- Removed sash selection step for windows — replaced with unified 30-config image grid
- Fixed hinge mutual exclusion bug
- Web Speech API voice input (Chrome/Android, free)
- Address autocomplete, reference photo panel

### 2026-03-03 — Session 11: Spec bar + RC-X modal
- Spec bar: replaced button selections with dropdown menus
- RC-X dimension modal added
- Auto-WRAP logic for NEW BUILDING / ENCLOSURE building types
- New Sheet button, default to blank start
- Compliance checks for frosted glass quantities

### 2026-03-03 — Session 12: Door features + sash sizes
- Door-specific: safety glass enforcement, burglar bar clearing, door stile selection
- Sash size fields for windows added to row model
- Hinged door direction
- Product reordering in modal
- Date picker enhancement
- Diagram styling: white borders

### 2026-03-04 — Session 13: Bug fixes
- Blank sheet initialisation (colour dropdown defaults removed)
- Modal card selection scoping (lock/direction isolation per row)
- Auto-toggle Std Hinges for hinged doors

### 2026-03-04 — Session 14: More bug fixes + PDF spec block
- Door stile modal default: 60mm left
- Opening direction label: "Open" → "Open Inward"
- PDF spec summary block: building/wall/floor/hours/flags
- Colour abbreviations: BRZ/WHT/BLK/CHAR/NatPC/SPCL

### 2026-03-05 — Session 15: Layout refinements
- Header: job/client left-aligned, large text
- Table column width optimisation
- Colour abbreviations finalised: WHT/BRZ/CHAR/BLK/SILV/SPCL
- Extras: 2-column grid
- Diagram sizing tweaks

### 2026-03-05 — Session 16: Sash validation + resizable columns
- Sash size validation bugs fixed
- Resizable table columns via drag handles (widths persisted to localStorage)
- Text sizes increased across dashboard and PDF

### 2026-03-05 — Session 17: Site measurement sheet
- Separate printable site measurement sheet (A4, compact table, 10–16 rows/page)
- Auto-populated from Rough Copy Digital localStorage
- B&W print optimised
- OCR-friendly structure for scanning back in
- Output: `site-measurement-sheet.pdf` (Python/ReportLab)

### 2026-03-05 — Session 18: Site sheet PDF + multi-sash
- Site sheet converted from HTML to PDF (ReportLab, 2 pages: table + cheat sheet)
- HALF sash size option added to RC
- PALACE / VALENCIA multi-slide door configuration system planned

### 2026-03-09 — Session 19: Multi-slide + PWA planning
- HALF sash option implemented
- Multi-slide: PALACE brand (60/90mm stile) vs VALENCIA (no stile choice)
- Patio config, Vistafold restructure, midrail height, sidelight options
- Android PWA architecture planning

### 2026-03-09 — Session 20: PWA build
- All V19 features implemented in main file
- Android PWA companion app built: `aw-mobile-pwa.html` (68KB, on hold)
- PWA has simplified mobile-first UI, syncs via localStorage with main file

### 2026-03-12 — Session 21: Window Builder v2 (previous session)
- Three bug fixes: Valencia no-stile, multi-slide diagram fallback, text brightness
- Window Builder v2 fully integrated into RC modal:
  - Size prompt → preset picker (12 generic presets at that point) → SVG canvas
  - mWB state object, cell types (TOP/SIDE/FIXED/TOPLIGHT), click-to-cycle
  - Gold dimension labels (click to edit), drag handles for mullions/transoms
  - 300/600/900 snap, wbFixTotals() for rounding
  - applyWindowBuilder() writes to row: pid, pcat, pcode, width, height, sash_w, sash_h2, notes, wbState, _diagSVG
  - wbMakeSVG() generates 80×64 compact SVG for diagram cell

### 2026-03-17 — Session 22: Preset grid + symbol fixes (this session)
See detailed transcript below.

---

## Current session transcript (2026-03-17)

### Preset grid rebuilt from 30.5 series schedule drawing

User provided the actual 30.5 series window schedule drawing. Rebuilt WB_PRESETS from scratch — 30 presets mapped from the drawing, all validated (colW sums = W, rowH sums = H, types length = cols×rows).

**Red block rule:** W≥1800 AND H≥1200 → 900×600 sashes.  
`WB_RED = new Set(['1812DT','2412DT','1815DT','2415DT','1818DT','2418DT'])`

**Layout decisions:**
- H600: 1 sash row. 1800w = 2×900 cols. 2400w = 4×600 cols.
- H900: sash (600h) + fixed base (300h). Same col splits.
- H1200: 2 sash rows stacked. 1200w+ gets vertical mullion (600+600 cols). 1500w = 750+750. Red: 1800w = 900+900. 2400w = 900+900+600 (fixed right).
- H1500: 2 sash rows + 300 fixed base. Same col splits as H1200.
- H1800: 3 sash rows stacked. Same col splits.

Preset picker replaced with a proper H×W grid table matching drawing layout. Each cell = mini SVG thumbnail + code label. Red units get red border.

**Bug found and fixed:** App completely broken after preset replacement — `let mWB = let mWB = {…}` (doubled declaration from splice). Removed duplicate.

### Size transfer fix

`wbLoadPreset()` was reading `document.getElementById('wb-ow')` which doesn't exist on the grid picker screen → always got 0 → defaulted to mWB initial state (1200×600).

Fix: always use `mWB.overallW = p.W` and `mWB.overallH = p.H` directly. Copy arrays as `[...p.colW]` / `[...p.rowH]`.

### Builder toolbar redesign

Replaced static size text + "Change Size" button with:
- Two inline number inputs (`#wb-iw`, `#wb-ih`) — editable directly in toolbar
- Blur or Enter → `wbResizeOverall()` → proportional redistribution → rerender
- "← Presets" replaces "← Change Size"

Cols/Rows renamed to Mullions/Transoms. Count shown = dividers (cols−1, rows−1).

### Inverted triangle symbols

TOP HUNG: `<polygon>` — inverted ▽, base at cell top, apex at ~72% cell height.  
SIDE HUNG: `<polygon>` — rightward triangle, base left, apex at ~70% cell width.  
Type label: bottom of cell, 9px, 70% opacity.

---

## Architecture reference

### Global state
```
rows[]      — array of row objects
mWB         — window builder state: {cols, rows, cells[], colW[], rowH[], snapStd, overallW, overallH, sizeSet}
PRODS       — product definitions (sliding/multislide/folding/hinged/tophung/sidehung/lights)
WB_PRESETS  — 30 preset objects: {code, W, H, cols, rows, colW[], rowH[], types[]}
WB_RED      — Set of 6 red block preset codes
WB_COLOURS  — {FIXED:'#3a6bc2', TOP:'#2e9e68', SIDE:'#c28a2e', TOPLIGHT:'#7a5ea8'}
WB_STD      — [300, 600, 900] snap sizes
IMGS        — base64 product photos, keyed by pid
```

### Key functions
```
openModal(id)           — opens unit type picker for a row
buildStep1/2/3/3B/3C    — modal step builders
buildWindowBuilder()    — routes to wbRenderSizePrompt() or wbRender()
wbRenderSizePrompt()    — preset grid picker (H×W table matching 30.5 schedule)
wbLoadPreset(code)      — loads preset into mWB, calls wbRender()
wbRender()              — draws SVG canvas + toolbar
wbResizeOverall()       — resizes overall W×H from inline inputs, redistributes proportionally
wbEditDim(e,axis,idx)   — opens dimension editor panel for a col or row
wbApplyDim(axis,idx,v)  — applies new mm value, distributes remainder to other cells
wbDragStart/Move/End    — drag handles for mullion/transom repositioning
wbToggleSnap()          — snaps all dims to nearest 300/600/900
wbFixTotals()           — corrects rounding drift (last cell absorbs remainder)
wbCycle(idx)            — cycles cell type FIXED→TOP→SIDE→TOPLIGHT→FIXED
wbBack()                — returns to preset grid (sizeSet=false)
wbSpec()                — builds spec summary string from mWB
applyWindowBuilder()    — writes mWB state to row, generates _diagSVG, closes modal
wbMakeSVG(wb)           — 80×64 compact inline SVG for diagram cell
refreshDiag(id)         — updates diagram: row._diagSVG → IMGS[pid] → pcode fallback
applySelection()        — routes to applyWindowBuilder() for windows, or door logic
rerenderRow(id)         — rebuilds desktop table row + mobile card
getMiss(row)            — returns array of missing fields (builder rows skip sash checks)
saveLocal()             — saves rows[] to localStorage 'aw_rc_v10'
```

### Row object key fields
```
pid, pcat, pcode, popt, popt2, popt3
width, height, qty, room
sash_w, sash_h2, sash_h2_val
glass, burgbar, color, special_color, hw_clr, hw_clr_custom
stile, midH, sidelight, openers
extras{}       — {Wrap, Drainage, Video, 'Round Tube', 'Box Wood', 'Std Hinges', 'Parliament Hinges'}
wbState        — mWB snapshot (set when confirmed via window builder)
_diagSVG       — inline SVG string for diagram cell
```

### CSS variables
```
--bg:#0a0a0a   --surf:#141618   --surf2:#1c1f23
--gold:#F5B800  --txt:#e8eaed   --mut:#8a9ab0    --dim:#5a6476
--border:#2a2f38  --border2:#3a4050
--mono: monospace  --sans: system-ui
```

### Product knowledge
```
Series:
  30.5 = Top Hung aluminium windows
  305  = Side Hung aluminium windows
  Sliding patio: OX / OXX / OXXO / OXXXXO (O=fixed, X=sliding)
  Multi-slide: PALACE (60/90mm stile choice) or VALENCIA (no stile)
  Vistafold: 3/5/6/7 leaf + Custom
  Hinged: Single/Double, optional Midrail, Colonial Bar (3 or 4 rail, single/double)

Sash sizes:
  Non-red presets: 600×600
  Red block (W≥1800, H≥1200): 900×600
  Builder snap: 300 / 600 / 900mm
  Legacy table dropdown: STD / HALF / 315 / 545 / 845

Glass: GLASS-STD / SAFETY / LAMI / OBSCURE / TINT
Burglar bars: NONE / CLEAR / PAINTED / STAINLESS
Colours: WHITE / BRONZE / CHARCOAL / BLACK / SPECIAL
HW Colours: BRONZE / WHITE / CHARCOAL / BLACK / SILVER / SPECIAL
```

---

## Outstanding issues (priority order)

### 1 — Window Builder SVG visual polish
- TOP HUNG triangle: thicker stroke, fill ~65% cell height consistently on all cell sizes
- SIDE HUNG triangle: verify standard casement symbol (hinge left, opening right)
- FIXED cell: add subtle X cross (two diagonals) for visual distinction
- TOPLIGHT hatching: increase opacity 0.3 → 0.5
- Gold dim labels clip against SVG border — add padding

### 2 — Dim editor UX
- After wbApplyDim() rerenders, editor panel disappears (rebuilt from scratch)
- Fix: re-open editor for same axis+idx after rerender
- STD quick-tap buttons (300/600/900) highlight gold when current value matches

### 3 — Preset grid thumbnail scaling
- Tall units (H1800) overflow grid cell — use viewBox scaling, cap thumb height at 60px
- Add two-line label: opening size (red) and frame size in brackets (black) — matching drawing

### 4 — Confirm to row: width/height always update
- applyWindowBuilder() should overwrite row.width/height unconditionally from mWB
- Notes field: replace existing "Builder: …" line instead of appending new one

### 5 — Sash Size column: hide for builder rows
- Rows with row.wbState: hide Sash W/H dropdowns in desktop table + mobile card
- Show compact read-only: e.g. "2c×1r · 900|900 × 600" from wbState

### 6 — Validation tab: builder rows showing false errors
- getMiss() already exempts builder rows from sash_w/sash_h2
- Validation tab still surfaces "Missing sash width" in some edge cases — audit and fix

### 7 — PDF export (not yet started)
- Landscape A4, table matches desktop layout
- Anglo Windows logo header, job details top
- One row per unit, _diagSVG inline in Diagram column
- Use the pdf skill

---

## Style rules (never break these)

- Dark theme only: bg #0a0a0a, surfaces #141618 / #1c1f23
- Gold #F5B800 for all interactive highlights, active states, key labels
- No blue as primary colour — conflicts with FIXED cell colour #3a6bc2
- Font sizes: labels 8–9px uppercase, body 11–12px, modal headings 11px bold
- Buttons: .btn.btn-g = gold fill (confirm), .btn.btn-o = outlined (secondary)
- All SVG strokes use WB_COLOURS, not hardcoded hex
- No external dependencies — file must remain self-contained

---

## Working method

- Always read the full file before editing
- Make surgical edits — never rewrite sections not being changed
- After every edit, verify changed functions are syntactically correct
- One issue per session where possible
- After each session: download file, test in browser, bring back next session
- Use frontend-design skill for UI work, pdf skill for PDF export
