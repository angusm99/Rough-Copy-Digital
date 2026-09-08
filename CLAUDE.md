# Claude Handoff - Rough Copy Digital

This repo is the active Anglo Windows Digital Rough Copy project.

## Current continuation - 2026-09-08 field12 (local testing only)

Field12 compacts site capture into paired customer/reference columns and two
decision columns on portrait tablets (three on wide screens). Confirmation and
Add opening sit below glass policy; existing validation remains intact. Tablet
navigation is a 2x2 grid without keyboard shortcut hints. Verified at 800px and
1280px without horizontal overflow; 23 regression tests pass. No live deployment.

Reviewed Claude's pushed 3616682 (one-card configuration/stile selection) and
177849a (blue artwork/cache fix). Field11 preserves those changes and adds
standard/parliament hinges, width grouping for Top Hung and Side Hung,
continuous fixed panes shared by picker/builder, OPEN OUT for unset opening
direction, easier Add opening controls, and consistent fonts/gutters.
P4T912B is removed; PTT912B has one continuous fixed base.
23 regression tests and syntax checks pass.

**Pushing main no longer deploys.** `.github/workflows/deploy.yml` is
`workflow_dispatch` only as of 2026-09-08 - every push used to spend Netlify
build credits on work in progress. Push freely to back work up; release with
`gh workflow run "Deploy to Netlify"` once Angus approves.

### Earlier continuation (historical)

Read `FIELD-WORKFLOW-2026-09-07.md` first. It supersedes the June/July capability
and tablet snapshots below. Claude's base was `b261d6d`; Codex added Elite/Knysna,
shared Palace/Valencia slider layouts, outside-view O=fixed/X=sliding rules,
explicit required-site confirmation, complete line readiness, original quote
references and stronger field UI (`7adff36`). Claude then closed the reported
green glass, border and step-numbering gaps (`f7f420c`). Run
`tools/verify-project.ps1` (18 field regression tests) before commit. Do not
infer publication from local HEAD.

**Current cache key is `field12`.** The SVG assets are cache-first, so any asset change
must bump `field2`->`field3`->... in `sw.js` and the `?v=` query strings, or
tablets keep serving the old drawings. This is how the green glass survived two
"fixed" rounds.

**Glass is BLUE everywhere.** Sash vs fixed is carried by the gold sash border
and the chevron, never by colour. Nothing in `assets/` is green-dominant as of
`f7f420c`; if green reappears, an asset was reimported from an old zip.

Prefer `tools/start-preview.ps1 -Port 5179` on loopback plus `adb reverse`.
Verify devices before assuming a serial. USB `FS44BPC01077` is attached again
as of 2026-09-08 15:00; `192.168.0.160:5555` and `192.168.0.167:5555` also
answer over wireless ADB.

**The `adb reverse` tunnel drops silently** - re-run `adb -s <serial> reverse
tcp:5179 tcp:5179` and check `adb reverse --list` before concluding a build
did not reach the tablet. A dropped tunnel looks exactly like a caching bug:
the service worker correctly serves the last cached build and the device
shows stale content.

**Offline is PROVEN on the device** (2026-09-08). It was demonstrated by that
same dropped tunnel: with no route to the server at all, the app rendered
fully from cache. Flight-mode confirmation is no longer outstanding.

## Start Here

- Active app path: `open-design-components/`
- Main entry point: `open-design-components/index.html` (landing page → routes to workspace)
- Parser: `open-design-components/quote-parser.js`
- Legacy reference only: `rough-copy-digital_6.html`
- Project note: `C:\Users\angusm\Documents\Obsidian Vault\ANGLO WINDOWS\Rough Copy Digital.md`

Do not treat `_6.html` as the current build unless Angus explicitly asks for a legacy comparison or port.

## Current Product Direction

The app is a tablet-first on-site rough copy tool for Anglo Windows reps.

Core flow:

1. Import a Bizman quote PDF.
2. Auto-fill job/site/customer details and quote line items.
3. Show quote sizes as reference only.
4. Rep enters final measured site sizes.
5. Every line needs type/configuration and confirmed final size.
6. Export is locked until all required line data is complete.
7. PDF export is browser print/Save as PDF, landscape A4, with diagrams and material tally.

## Current Capabilities

- Handles multiple Bizman 6.3.x quote layouts.
- Imports quote diagrams where available.
- Extracts Workpool refs such as `JH`, `JHJ`, `KH`, and `AM` prefixed numbers where present.
- Extracts project/site names from quote `Your Ref` text where possible.
- Handles SPECIAL powder-coat colours and keeps CPO/RAL/custom colour detail visible.
- Uses vendored PDF.js in `open-design-components/vendor/` for offline/tablet use.
- Window picker, door picker, and custom window builder round-trip through localStorage.
- Tablet pass has been done: larger touch targets, portrait constraints, no hover-only behavior, and editable Ref/Room cells in the line table.

## Important Storage Keys

- `aw_rc_job` - workspace state
- `aw_picker_ctx` - line context sent from workspace to picker/builder
- `aw_picker_result` - picker/builder result returned to workspace

## Local Testing

From repo root:

```powershell
.\tools\start-preview.ps1 -Port 5179
```

Open:

```text
http://127.0.0.1:5179/workspace.html
```

For a guaranteed blank job, use:

```text
http://127.0.0.1:5179/workspace.html?new=1
```

For a fresh document import flow, use:

```text
http://127.0.0.1:5179/workspace.html?new=1&import=1
```

For tablet testing, prefer ADB reverse over a LAN bind - it tunnels through the
existing adb link, so the server never leaves loopback:

```powershell
.\tools\start-preview.ps1 -Port 5179
adb -s <serial> reverse tcp:5179 tcp:5179
adb -s <serial> shell am start -a android.intent.action.VIEW -d "http://127.0.0.1:5179/workspace.html"
```

`-Bind 0.0.0.0` still exists for when adb is unavailable, but it shares the app
folder on the LAN for as long as it runs. Quotes go to the tablet via ADB push
only, never over the LAN.

The preview server serves only the app folder (`open-design-components/`) as its
root, pinned via `--directory`. The landing page is at `/`, the workspace at
`/workspace.html`. The repo root and local-only files (e.g. `tablet-test-files/`)
are never exposed on the LAN.

## Verification Before Commit

Run:

```powershell
.\tools\verify-project.ps1
```

This verifies the active files exist, offline PDF.js/logo assets are present, and active JavaScript parses cleanly.

## Tablet Workflow

Use this for on-device testing:

```powershell
.\tools\start-preview.ps1 -Port 5179 -Bind 0.0.0.0
.\tools\stage-tablet-files.ps1 -Path "\\ANGLOSERVER\Share\Search\Scans\.....202606\ANNEMIE BRUCE JH532611 D2161-QUOTATION.pdf"
```

Open the printed LAN app URL (`http://<PC-LAN-IP>:5179/workspace.html`) on the tablet. `stage-tablet-files.ps1` copies the quote into local-only `tablet-test-files/` (ignored by Git) and prints the exact `tablet-adb.ps1 -Push` command to push it to the tablet over ADB. Quotes go to the tablet via ADB, never over the LAN.

Once USB debugging or Wireless debugging is authorised:

```powershell
.\tools\tablet-adb.ps1 -List
.\tools\tablet-adb.ps1 -Push "\\ANGLOSERVER\Share\Search\Scans\.....202606\ANNEMIE BRUCE JH532611 D2161-QUOTATION.pdf"
.\tools\tablet-adb.ps1 -OpenUrl -Url "http://<PC-LAN-IP>:5179/workspace.html"
```

Device state (serial corrected 2026-09-08):

- USB ADB serial: `FS44BPC01077` (was `...070`; not attached as of 2026-09-08 — Windows sees the HTC over Bluetooth only)
- Wireless ADB: `192.168.0.160:5555` and `192.168.0.167:5555` both authorised 2026-09-08 (`...159`/`...131` did not answer)
- Model/OS: `HTC AT01`, Android `13`
- Screen: `800x1280`
- Sample quote location on tablet: `/sdcard/Download/Rough-Copy-Digital/ANNEMIE BRUCE JH532611 D2161-QUOTATION.pdf`

To re-enable wireless ADB after plugging in USB:

```powershell
adb devices -l
adb tcpip 5555
adb connect 192.168.0.159:5555
```

## Privacy And Repo Hygiene

Real quotes and extracted quote text contain customer PII. Do not commit:

- `_test_quote*.pdf`
- `_quote*.txt`
- `_quote*.json`
- `tablet-screen*.png`
- `tablet-test-files/`
- preview server logs

These patterns are in `.gitignore`, but still check `git status` before committing.

## Current Known Work

- Latest sync as of 2026-06-30: landing page import links now start a clean job with `?new=1&import=1`; normal `workspace.html` intentionally resumes `aw_rc_job` from localStorage.
- Gail/Cecile Perlemoen quote import improved: client name, project/site, Workpool ref, SPECIAL/Pebble Grey/CPO colour details, and tighter quote drawing crops.
- Workspace line table has editable Ref and Room cells for tablet capture; portrait layout was rebalanced so Spec and Status stay visible.
- Casement SVG artwork refreshed from `Anglo-Casement-305.zip`: 53 active files replaced in `open-design-components/assets/casement-305/Anglo-Casement-305-Drawings/`.
- `Anglo-Windows-and-Doors2.zip` was inspected; its 16 door SVGs were byte-for-byte identical to the current `assets/architectural-doors/` files, so no door asset churn was needed.
- HTC AT01 tablet browser testing is in progress. USB ADB serial is `FS44BPC01077`; ADB reverse to local preview can use `adb reverse tcp:5179 tcp:5179`.
- Window picker / builder baseline has moved onto the dark gold review theme. Builder selections now return richer profile-style SVGs to the workspace, not plain placeholder geometry.
- Door picker category order is now `Hinged`, `Heavy Duty Slider`, `Sliding Folding`, `Pivot`, `Patio Sliding`.
- Heavy Duty Slider groups are now `Valencia`, `Palace Door`, and `CLS-250 Lift and Slide`.
- Architectural door SVGs have been supplied in `Anglo-Architectural-Drawings.zip`; door files are useful, window files should be ignored for that pass.
- Architectural door drawings are wired into `door-picker.html` (2026-06-19): 16 SVGs in `open-design-components/assets/architectural-doors/`, mapped via `DOOR_DRAWING_ASSETS` (by door `id`) → `doorSVG()` returns the `<img>` when an asset exists, else the generated SVG. Covers Large Pane hinged singles (`HD0921L`), hinged doubles (`DD1521`/`DD1821`), and Patio/Heavy-Duty sliders (`PD…OX/XO/OXXO`). Pivot, sliding-folding, and non-large-pane hinged styles still need source drawings. Same asset pattern as the casement `DRAWING_ASSETS` map in `window-picker.html`.
- Window + door drawings refreshed from `Anglo-Windows-and-Doors.zip` (2026-06-19): all 53 casement-305 window SVGs replaced in place with the updated palette (frame `#c29b27`); glass is BLUE throughout as of `f7f420c` — sash vs fixed is carried by the gold sash border and chevron, never by colour; door set swapped to the cleaner-named, expanded set (adds `DD` double-doors, `PD2421OXXO`, `PD4021OXXO`). Also removed two dangling window map entries (`PT618`/`PT621` → files that never existed) so those configs fall back to the generated diagram instead of a broken image. Verified in browser: window-picker 46/46 assets load 0 broken; door-picker hinged/patio/heavy-duty all load 0 broken.
- Best next SVG integration path: wire `Doors/Anglo-HD*.svg` and `Doors/Anglo-PD*.svg` into `door-picker.html` as asset-backed drawings, keeping generated SVGs as fallback for pivot / sliding folding / decorative hinged variants.
- Photo/OCR import for handwritten rough copies is still outstanding.
- Workshop Excel/export-to-external-system is still outstanding.
- More Bizman product-line quote exports are needed for a fuller preset library.
- Remaining `_6` rule to port: spec-bar apply-to-all propagation for glass/colour changes.

## Boundaries

This is the work project. Do not mix in All You Quote or other personal-project files.
