# Anglo Windows — Rough Copy Digital · Session Summary
**Date:** 2026-03-12  
**File at session end:** `rough-copy-digital.html` (688KB, 2884 lines)  
**Working file in Claude sessions:** `/home/claude/rough_copy_v9.html`

---

## What was done this session

### 1. Window Builder preset system rebuilt from scratch
Replaced the old 12-card generic preset grid with a proper **30-preset schedule grid** derived directly from the 30.5 series window schedule drawing.

**Layout:** 5 rows (H: 600/900/1200/1500/1800) × 6 columns (W: 600/900/1200/1500/1800/2400) — matching the actual drawing layout exactly.

**Each card shows:**
- A mini SVG thumbnail drawn to correct proportions with opening symbols
- The product code below (e.g. `1212DT`)
- Red border + red code text for the **red block** units (W≥1800 and H≥1200)

**Red block rule:** Presets `1812DT`, `2412DT`, `1815DT`, `2415DT`, `1818DT`, `2418DT` use **900×600 sashes**. All others use **600×600 sashes**.

**Mullion/transom positions per preset (all validated):**
- H600: single sash row — 1 col for 600/900/1200/1500, 2 cols (900+900) for 1800, 4 cols (600×4) for 2400
- H900: sash top + 300 fixed base — same column splits as H600
- H1200: two sash rows stacked — 1 col for 600/900, 2 cols for 1200+ (600+600 or 750+750 for 1500w)
- H1500: two sash rows + 300 fixed base — same column splits as H1200
- H1800: three sash rows stacked — same column splits as H1200
- 2400w units: 3 cols (900+900+600 with fixed right side) for red block, 4 cols (600×4) for non-red

**`WB_PRESETS` array:** 30 objects, each: `{code, W, H, cols, rows, colW[], rowH[], types[]}` (row-major cell types).  
**`WB_RED`:** `new Set(['1812DT','2412DT','1815DT','2415DT','1818DT','2418DT'])`

---

### 2. Preset size transfer fixed
**Bug:** `wbLoadPreset()` was reading `document.getElementById('wb-ow')` to get the user's custom size — but that input doesn't exist on the preset grid screen, so it always fell back to nothing and defaulted to 1200×600.

**Fix:** `wbLoadPreset(code)` now always sets `mWB.overallW = p.W` and `mWB.overallH = p.H` directly from the preset object, and copies `colW`/`rowH` as direct array copies (`[...p.colW]`). The user can then override size using the inline inputs in the builder toolbar.

---

### 3. Window Builder toolbar redesigned
**Replaced:**
- Static `"1200 × 600 mm"` text + `← Change Size` button

**With:**
- Two inline number inputs (`#wb-iw`, `#wb-ih`) showing current W × H, editable directly in the toolbar
- On blur or Enter → `wbResizeOverall()` → redistributes all `colW`/`rowH` proportionally to the new overall size, then rerenders
- `← Presets` button to go back to the schedule grid

**Cols/Rows controls renamed:**
- `Cols` → **Mullions** (shows `mWB.cols - 1`, i.e. number of dividers not sections)
- `Rows` → **Transoms** (shows `mWB.rows - 1`)
- Buttons disabled at limits (0 mullions min, 5 mullions max; 0 transoms min, 3 max)

---

### 4. Opening symbols — inverted triangle
**Replaced** the old hinge-line style (dashed horizontal line + two vertical stiles) with proper polygon symbols:

- **TOP HUNG:** `<polygon>` — inverted triangle ▽, base spanning top of cell, apex pointing down at ~72% cell height. Scaled by margin = `max(6, min(14, cellWidth * 0.08))`.
- **SIDE HUNG:** `<polygon>` — rightward triangle, base on left side, apex at ~70% cell width.
- **FIXED:** Cell fill only (no symbol yet — outstanding issue #1 below).
- **TOPLIGHT:** Diagonal hatching lines (opacity still low — outstanding issue #1 below).

Type label moved to bottom of cell (`y2 - 5`), smaller (9px), 70% opacity — less dominant than the symbol.

---

### 5. Bug fix — doubled `let mWB =` declaration
A splice error in the previous session left `let mWB = let mWB = {...}` in the file, breaking the entire JS. Fixed by removing the duplicate.

---

### 6. `wbResizeOverall()` — new function
```js
function wbResizeOverall(){
  // reads #wb-iw and #wb-ih
  // validates min 100mm
  // proportionally redistributes colW and rowH
  // calls wbFixTotals() then wbRender()
}
```

---

## Outstanding issues (in priority order)

These are the items to work through in Cowork:

### Issue 1 — Window Builder SVG visual polish
- TOP HUNG triangle: needs thicker stroke, should fill ~65% cell height consistently
- SIDE HUNG triangle: verify it looks like a standard casement symbol (hinge left, opening right)
- FIXED cell: add subtle X cross (two diagonals) so it reads differently from empty
- TOPLIGHT hatching: increase opacity from ~0.3 to 0.5
- Gold dimension labels (`600mm` etc.) clip against SVG border — add a few px padding

### Issue 2 — Dim editor UX
- After `wbApplyDim()` rerenders, the editor panel disappears (it's rebuilt from scratch)
- Fix: after rerender, programmatically re-open the editor for the same `axis` + `idx`
- STD quick-tap buttons (300/600/900) should highlight gold when current value matches

### Issue 3 — Preset grid thumbnail scaling
- Tall units (H1800) overflow their grid cell because thumbnails use fixed pixel coords
- Fix: use `viewBox` scaling so every thumb fits within a capped 60px height
- Add two-line label below each thumb: opening size in red, frame size in black (matching drawing)

### Issue 4 — Confirm to row: width/height always update
- `applyWindowBuilder()` should overwrite `row.width` and `row.height` from `mWB.overallW/H` unconditionally (user may have changed size in builder after initial confirm)
- The notes field appends `"Builder: ..."` every confirm — change to replace any existing Builder line

### Issue 5 — Sash Size column for builder rows
- Rows with `row.wbState` set should hide the Sash W/H dropdowns in both desktop table and mobile card
- Replace with compact read-only display: e.g. `"2c×1r · 900|900 × 600"` derived from `wbState`

### Issue 6 — Validation tab: builder rows showing false errors
- `getMiss()` already exempts builder rows from `sash_w/sash_h2` — but Validation tab still surfaces "Missing sash width" in some edge cases
- Audit the Validation tab build function and ensure builder rows show clean

### Issue 7 — PDF export (not yet started)
- Landscape A4 table matching desktop layout
- Anglo Windows logo in header, job details at top
- One row per unit, `_diagSVG` rendered inline in Diagram column
- Use the `pdf` skill when starting this

---

## Key architectural facts (quick reference)

| Thing | Detail |
|---|---|
| File | Single self-contained HTML/CSS/JS — no framework, no external deps |
| Storage | `localStorage` key `'aw_rc_v10'` |
| Builder state | `mWB` global object — reset on fresh open, restored from `row.wbState` on re-edit |
| Diagram source | `row._diagSVG` (from builder) → `IMGS[pid]` (product photo) → gold pcode text fallback |
| CSS theme | `--bg:#0a0a0a` `--gold:#F5B800` `--txt:#e8eaed` `--surf:#141618` `--surf2:#1c1f23` |
| Builder colours | FIXED `#3a6bc2` · TOP `#2e9e68` · SIDE `#c28a2e` · TOPLIGHT `#7a5ea8` |
| WB_STD snap sizes | `[300, 600, 900]` |
| Product series | 30.5 = Top Hung · 305 = Side Hung · sliding/multislide/folding/hinged doors |
| Red block sashes | 900×600 (W≥1800 and H≥1200) · all others 600×600 |

---

## How to start in Cowork

1. Open Cowork
2. Drop `rough-copy-digital.html` into the chat first — before saying anything
3. Paste the full prompt from `cowork-handoff.md`
4. Work through issues 1–7 above, one at a time
5. Download the updated file after each session and test in browser before the next session

**Recommended connector:** Google Drive — store the HTML file there so Cowork can always pull the latest version without drag-and-drop.

**Skills to mention in your opening message:**
> "Use the frontend-design skill for any UI changes, and the pdf skill when we get to PDF export."
