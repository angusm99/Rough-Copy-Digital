# Claude Handoff - Rough Copy Digital

This repo is the active Anglo Windows Digital Rough Copy project.

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
.\tools\start-preview.ps1
```

Open:

```text
http://127.0.0.1:5178/workspace.html
```

For a guaranteed blank job, use:

```text
http://127.0.0.1:5178/workspace.html?new=1
```

For a fresh document import flow, use:

```text
http://127.0.0.1:5178/workspace.html?new=1&import=1
```

For tablet testing on same Wi-Fi:

```powershell
.\tools\start-preview.ps1 -Port 5179 -Bind 0.0.0.0
```

Open:

```text
http://<PC-LAN-IP>:5179/workspace.html
```

Use `Get-NetIPAddress -AddressFamily IPv4` to find the current PC LAN IP.

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

Confirmed device state as of 2026-06-15:

- USB ADB serial: `FS44BPC01070`
- Wireless ADB: `192.168.0.159:5555`
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
- HTC AT01 tablet browser testing is in progress. USB ADB serial remains `FS44BPC01070`; ADB reverse to local preview can use `adb reverse tcp:5179 tcp:5179`.
- Window picker / builder baseline has moved onto the dark gold review theme. Builder selections now return richer profile-style SVGs to the workspace, not plain placeholder geometry.
- Door picker category order is now `Hinged`, `Heavy Duty Slider`, `Sliding Folding`, `Pivot`, `Patio Sliding`.
- Heavy Duty Slider groups are now `Valencia`, `Palace Door`, and `CLS-250 Lift and Slide`.
- Architectural door SVGs have been supplied in `Anglo-Architectural-Drawings.zip`; door files are useful, window files should be ignored for that pass.
- Architectural door drawings are wired into `door-picker.html` (2026-06-19): 16 SVGs in `open-design-components/assets/architectural-doors/`, mapped via `DOOR_DRAWING_ASSETS` (by door `id`) → `doorSVG()` returns the `<img>` when an asset exists, else the generated SVG. Covers Large Pane hinged singles (`HD0921L`), hinged doubles (`DD1521`/`DD1821`), and Patio/Heavy-Duty sliders (`PD…OX/XO/OXXO`). Pivot, sliding-folding, and non-large-pane hinged styles still need source drawings. Same asset pattern as the casement `DRAWING_ASSETS` map in `window-picker.html`.
- Window + door drawings refreshed from `Anglo-Windows-and-Doors.zip` (2026-06-19): all 53 casement-305 window SVGs replaced in place with the updated palette (frame `#c29b27`, blue fixed / green sash); door set swapped to the cleaner-named, expanded set (adds `DD` double-doors, `PD2421OXXO`, `PD4021OXXO`). Also removed two dangling window map entries (`PT618`/`PT621` → files that never existed) so those configs fall back to the generated diagram instead of a broken image. Verified in browser: window-picker 46/46 assets load 0 broken; door-picker hinged/patio/heavy-duty all load 0 broken.
- Best next SVG integration path: wire `Doors/Anglo-HD*.svg` and `Doors/Anglo-PD*.svg` into `door-picker.html` as asset-backed drawings, keeping generated SVGs as fallback for pivot / sliding folding / decorative hinged variants.
- Photo/OCR import for handwritten rough copies is still outstanding.
- Workshop Excel/export-to-external-system is still outstanding.
- More Bizman product-line quote exports are needed for a fuller preset library.
- Remaining `_6` rule to port: spec-bar apply-to-all propagation for glass/colour changes.

## Boundaries

This is the work project. Do not mix in All You Quote or other personal-project files.
