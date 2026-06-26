# Active Basis

This project has multiple Rough Copy Digital files and prototypes. To avoid confusion, use this file as the first orientation note.

## Use This

- `open-design-components/workspace.html`
- `open-design-components/quote-parser.js`
- `open-design-components/window-picker.html`
- `open-design-components/door-picker.html`
- `open-design-components/window-builder.html`
- `open-design-components/vendor/`

This folder is the current build path for the Digital Rough Copy system.

## Current Behavior To Preserve

- Import documents into the workspace: Bizman quote PDFs first, plus supported PDFs/images/docs for best-effort customer/site extraction.
- Auto-fill job/site/customer/quote details where available.
- Keep quote sizes as reference only.
- Require the rep to enter and confirm final site sizes before export.
- Require a product type/configuration before export.
- Print/export a landscape A4 rough copy with diagrams and material tally.
- Keep PDF.js vendored locally so tablet/site use works offline.

## Treat As Legacy / Reference

- `rough-copy-digital_6.html`
- `rough-copy-digital_5.html`
- `rough-copy-digital_4.html`
- `rough-copy-digital_3.html`
- `rough-copy-digital_2.html`
- `rough-copy-digital_1.html`
- `rough-copy-digital.html`
- `rough-copy-digital NEW.html`
- `rough-copy-digital NEW MANUS.html`
- `Rough Copy Digital - Standalone.html`

These older files are useful for reference, comparison, or logic-porting, but they are not the primary path forward.

## Quick Start

If the local preview server is running, open:

- `http://127.0.0.1:5178/workspace.html`

Recommended preview commands from the repo root:

```powershell
.\tools\start-preview.ps1
.\tools\start-preview.ps1 -Port 5179 -Bind 0.0.0.0
```

If you are unsure where to make a change, make it in `open-design-components/` first.

## Verification

Run this before committing or handing off:

```powershell
.\tools\verify-project.ps1
```

This checks the active app files, vendored offline assets, `quote-parser.js`, and inline scripts in the active HTML surfaces.

## Tablet Testing

Current tablet target:

- HTC AT01 on Android 13
- Current tablet Wi-Fi IP seen from device settings: `192.168.0.159`
- ADB USB serial: `FS44BPC01070`
- Wireless ADB target after `adb tcpip 5555`: `192.168.0.159:5555`
- Screen size reported by ADB: `800x1280`
- Sample quote pushed to: `/sdcard/Download/Rough-Copy-Digital/ANNEMIE BRUCE JH532611 D2161-QUOTATION.pdf`

Use the LAN preview path for browser testing:

```powershell
.\tools\start-preview.ps1 -Port 5179 -Bind 0.0.0.0
```

Use `tools/stage-tablet-files.ps1` to copy local-only sample quote PDFs into `tablet-test-files/`; it prints the `tablet-adb.ps1 -Push` command to send them to the tablet over ADB (quotes never go over the LAN). Use `tools/tablet-adb.ps1` to push files and open the app once ADB is authorised.

Current confirmed ADB sequence:

```powershell
adb devices -l
adb tcpip 5555
adb connect 192.168.0.159:5555
.\tools\tablet-adb.ps1 -Device "192.168.0.159:5555" -OpenUrl -Url "http://192.168.0.106:5179/workspace.html"
```

## Storage Keys

- `aw_rc_job` - current workspace state
- `aw_picker_ctx` - line context sent from workspace to picker/builder
- `aw_picker_result` - picker/builder result returned to workspace

## Privacy

Real quote PDFs and extracted quote fixtures can contain customer PII. They should remain local-only and are ignored by `.gitignore` under `_test_quote*.pdf`, `_quote*.txt`, `_quote*.json`, and related local test artefacts.
