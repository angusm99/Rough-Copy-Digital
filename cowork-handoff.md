# Anglo Windows — Rough Copy Digital · Cowork Handoff

## How to use Cowork for this project

Cowork works best when you treat it like a developer sitting next to you with your file open. A few habits that will save you time:

**Always drop the file first.** At the start of every Cowork session, drag `rough-copy-digital.html` into the chat before saying anything. Cowork reads the actual file — it doesn't rely on session memory. Without the file it's guessing.

**One task at a time, clearly scoped.** "Fix the window builder" is too broad. "The inverted triangle in the TOP HUNG cell is too small on narrow cells — make it fill at least 60% of the cell width" is perfect. The more specific you are, the cleaner the edit.

**Ask for a read-back before big changes.** For anything touching more than one function, say: *"Before you edit, tell me which functions you're changing and what you'll do to each."* This catches misunderstandings before they break something.

**Always download the output immediately.** After each session Cowork produces an updated file. Download it, test it in your browser, then bring it back next session. Don't skip this — the file is your source of truth, not the chat.

**Use the Validation tab to sanity check.** The RC has a built-in Validation tab. After any change that touches row logic, open the file, add a test row, confirm it, and check for red validation errors before moving on.

---

## Recommended Connectors & Plugins

Cowork supports connectors that let me directly read and write files. These are the ones worth enabling for this project:

**Google Drive connector** *(most useful)* — Store `rough-copy-digital.html` in Drive and Cowork can read the latest version automatically at the start of each session, without you needing to drag and drop every time. Also useful for storing reference PDFs (product schedules, the 30.5 series chart, etc.) that I can read when needed.

**Gmail connector** — Useful later if you want to auto-generate a client summary email from a completed rough copy sheet. Not urgent now.

No other connectors are needed for this project at this stage. The app is a self-contained HTML file — no backend, no database, no external APIs.

---

## Skills to mention

When starting a Cowork session on this file, include this line in your opening message:

> *"Use the frontend-design skill for any UI changes, and the pdf skill if we need to build a PDF export."*

This ensures Cowork applies best-practice patterns for the SVG canvas work and any future PDF output rather than improvising.

---

## The Prompt — paste this at the start of your first Cowork session

---

```
You are working on a single-file web application: Anglo Windows Rough Copy Digital.
The file is rough-copy-digital.html — a dark-themed (gold + dark grey) field measurement 
and quoting tool for a South African aluminium window and door manufacturer.

The file is self-contained HTML/CSS/JS with no framework dependencies. 
Always read the full file before making any edits. 
Always make surgical edits — never rewrite sections you aren't changing.
After every edit, verify the changed functions are syntactically correct before saving.

---

ARCHITECTURE OVERVIEW

Global state:
  rows[]         — array of unit row objects (one per window/door)
  mWB            — window builder state object
  PRODS          — product definitions object (sliding, multislide, folding, hinged, tophung, sidehung, lights)
  WB_PRESETS[]   — 30 preset window configurations from the 30.5 series schedule
  WB_RED         — Set of preset codes that use 900×600 sashes (red block: W≥1800, H≥1200)

Key functions:
  openModal(id)        — opens the unit type picker modal for a row
  buildStep1/2/3/3B/3C — modal step builders (Cat → Product → Options)
  buildWindowBuilder() — routes to wbRenderSizePrompt() or wbRender()
  wbRenderSizePrompt() — shows the preset grid picker (30.5 schedule layout)
  wbLoadPreset(code)   — loads a preset directly into mWB state and calls wbRender()
  wbRender()           — draws the SVG canvas builder with inline toolbar
  wbResizeOverall()    — updates overall W×H from inline inputs and redistributes
  wbEditDim(e,axis,idx)— opens the dimension editor panel for a col or row
  wbApplyDim(axis,idx,val)— applies a new mm value, distributing remainder
  applySelection()     — routes to applyWindowBuilder() for windows, or writes door data
  applyWindowBuilder() — writes all builder state to the row, generates _diagSVG
  refreshDiag(id)      — updates the diagram cell (uses row._diagSVG if set)
  rerenderRow(id)      — rebuilds both mobile card and desktop table row
  getMiss(row)         — returns array of missing required fields
  saveLocal()          — persists to localStorage key 'aw_rc_v10'

Row object key fields:
  pid, pcat, pcode, popt, popt2, popt3
  width, height, qty, room
  sash_w, sash_h2, sash_h2_val
  glass, burgbar, color, special_color, hw_clr, hw_clr_custom
  stile, midH, sidelight, openers
  extras{} — object of boolean flags (Wrap, Drainage, Video, Round Tube, Box Wood, Std Hinges, Parliament Hinges)
  wbState  — snapshot of mWB when a window builder row was confirmed
  _diagSVG — inline SVG string for the diagram cell

CSS variables:
  --bg:#0a0a0a  --surf:#141618  --surf2:#1c1f23
  --gold:#F5B800  --txt:#e8eaed  --mut:#8a9ab0  --dim:#5a6476
  --border:#2a2f38  --border2:#3a4050
  --mono: monospace  --sans: system-ui

---

CURRENT OUTSTANDING ISSUES (work through these in order)

1. WINDOW BUILDER — SVG canvas visual polish
   - The inverted triangle (TOP HUNG symbol) needs a thicker stroke and should 
     fill ~65% of cell height. Currently too thin and undersized on small cells.
   - The SIDE HUNG triangle should mirror horizontally (hinge on left = apex right). 
     Check it looks like the standard casement symbol.
   - The FIXED cell should show a subtle X cross (two diagonal lines) so it's 
     visually distinct from blank.
   - The TOPLIGHT hatching lines are barely visible — increase opacity to 0.5.
   - The gold dimension labels (e.g. "600mm") sit too close to the SVG border. 
     Add a few px of padding so they don't clip.

2. WINDOW BUILDER — dim editor UX
   - After wbApplyDim() rerenders the canvas, the dim editor panel loses focus 
     (it's rebuilt from scratch). Fix: after rerender, programmatically re-open 
     the editor for the same axis+idx so the user can keep typing without 
     re-clicking.
   - The STD size quick-tap buttons (300 / 600 / 900) should highlight gold when 
     the current value matches one of them.

3. WINDOW BUILDER — preset grid picker
   - The thumbnail SVGs in the preset grid are rendering at an inconsistent height 
     because tall units (H1800) overflow their cell. Cap the thumb height at 60px 
     and use viewBox scaling instead of fixed pixel coords so every thumb fits 
     cleanly in its grid cell.
   - Add opening size (red) and frame size (black, in brackets) as two-line labels 
     below each thumb — matching the actual schedule layout.

4. WINDOW BUILDER — confirm to row
   - When wbApplyWindowBuilder() runs, it should also update row.width and 
     row.height from mWB.overallW/H even if those fields were already set 
     (the user may have changed size in the builder).
   - The notes field currently appends "Builder: ..." every time. Change it to 
     replace any existing Builder: line, not append a new one.

5. SASH SIZE COLUMN — remove from desktop table and mobile card for builder rows
   - Rows with row.wbState set should NOT show the Sash W/H dropdowns in the 
     expanded mobile card or the desktop table Sash Size column.
   - Instead show a compact read-only display: e.g. "2c×1r · 900|900 × 600" 
     derived from wbState.cols, wbState.rows, wbState.colW, wbState.rowH.

6. VALIDATION — getMiss() currently exempts all builder rows from sash_w/sash_h2.
   - This is correct, but the Validation tab's error messages still reference 
     "Missing sash width" for some edge cases. Audit the validation tab 
     build function and ensure builder rows show clean.

7. PDF EXPORT — not yet implemented.
   - When ready: use the pdf skill. The output should be a landscape A4 table 
     matching the desktop table layout, with the Anglo Windows logo in the header, 
     job details at top, and one row per unit. The _diagSVG should render inline 
     in the Diagram column.

---

STYLE RULES — always follow these

- Dark theme: bg #0a0a0a, surface #141618, surface2 #1c1f23
- Gold #F5B800 for all interactive highlights, active states, key labels
- Never use blue as a primary colour — it conflicts with the FIXED cell colour (#3a6bc2)
- Font sizes: labels 8-9px uppercase, body 11-12px, modal headings 11px bold
- Buttons: .btn.btn-g = gold fill (confirm actions), .btn.btn-o = outlined (secondary)
- All SVG drawing uses stroke colours from WB_COLOURS, not hardcoded hex
- Never add external dependencies — the file must remain self-contained

---

PRODUCT KNOWLEDGE

Series:
  30.5 series = Top Hung aluminium windows
  305 series  = Side Hung aluminium windows
  Sliding Patio doors: OX/OXX/OXXO/OXXXXO config (O=fixed, X=sliding)
  Multi-Slide: PALACE or VALENCIA brand — PALACE has 60/90mm stile choice, VALENCIA does not
  Vistafold: 3/5/6/7 leaf + Custom folding doors
  Hinged: Single/Double, with optional Midrail, Colonial Bar (3 or 4 rail, single or double)

Standard sash sizes:
  Non-red presets: 600×600 sashes
  Red block (W≥1800, H≥1200): 900×600 sashes
  STD snap sizes for builder: 300 / 600 / 900mm
  Legacy sash width options (table dropdown): STD, HALF, 315, 545, 845

Glass types: GLASS-STD, GLASS-SAFETY, GLASS-LAMI, GLASS-OBSCURE, GLASS-TINT
Burglar bar types: NONE, CLEAR, PAINTED, STAINLESS
Colours: WHITE, BRONZE, CHARCOAL, BLACK, SPECIAL
HW Colours: BRONZE, WHITE, CHARCOAL, BLACK, SILVER, SPECIAL

localStorage key: 'aw_rc_v10'
```

---

## Tips for faster sessions in Cowork

- **Screenshot the bug.** If something looks wrong visually, screenshot it and drop it in. "The triangle is too small" with a screenshot gets fixed in one round. Without it you get guesswork.

- **Test in a private/incognito window.** localStorage persists between page loads. If you're testing a fresh state (no saved rows), use incognito so old saved data doesn't interfere.

- **Keep a backup copy.** Before any session that touches the window builder or modal flow, duplicate the file. Name it `rough-copy-digital-BACKUP-[date].html`. The builder and modal interact in subtle ways and it's good to have a rollback.

- **Do one feature per session where possible.** The file is 690KB and growing. Focused sessions (e.g. "only work on the PDF export today") produce cleaner results than omnibus sessions.

- **Reference the drawing when needed.** Keep the 30.5 series schedule image handy. Drop it into Cowork whenever you're working on preset layouts or the schedule grid — it's much easier than describing it in words.
