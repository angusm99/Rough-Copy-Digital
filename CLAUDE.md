# Claude Handoff - Rough Copy Digital

This repo is the active Anglo Windows Digital Rough Copy project.

## Start Here

- Active app path: `open-design-components/`
- Main entry point: `open-design-components/workspace.html`
- Parser: `open-design-components/quote-parser.js`
- Legacy reference only: `rough-copy-digital_6.html`
- Project note: `C:\Users\angusm\Documents\Obsidian Vault\Rough Copy Digital.md`

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
- Uses vendored PDF.js in `open-design-components/vendor/` for offline/tablet use.
- Window picker, door picker, and custom window builder round-trip through localStorage.
- Tablet pass has been done: larger touch targets, portrait constraints, no hover-only behavior.

## Important Storage Keys

- `aw_rc_job` - workspace state
- `aw_picker_ctx` - line context sent from workspace to picker/builder
- `aw_picker_result` - picker/builder result returned to workspace

## Local Testing

From repo root:

```powershell
python -m http.server 5178 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:5178/open-design-components/workspace.html
```

For tablet testing on same Wi-Fi:

```powershell
python -m http.server 5179 --bind 0.0.0.0
```

Open:

```text
http://<PC-LAN-IP>:5179/open-design-components/workspace.html
```

Use `Get-NetIPAddress -AddressFamily IPv4` to find the current PC LAN IP.

## Privacy And Repo Hygiene

Real quotes and extracted quote text contain customer PII. Do not commit:

- `_test_quote*.pdf`
- `_quote*.txt`
- preview server logs

These patterns are in `.gitignore`, but still check `git status` before committing.

## Current Known Work

- Photo/OCR import for handwritten rough copies is still outstanding.
- Workshop Excel/export-to-external-system is still outstanding.
- More Bizman product-line quote exports are needed for a fuller preset library.
- Remaining `_6` rule to port: spec-bar apply-to-all propagation for glass/colour changes.

## Boundaries

This is the work project. Do not mix in All You Quote or other personal-project files.
