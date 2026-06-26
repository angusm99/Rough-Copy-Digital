# Open Design Components - Digital Rough Copy

This folder is now the active build path for Rough Copy Digital. It began as Open Design output, but the current project direction is to build and test here first.

Use `workspace.html` as the app entry point. Treat `rough-copy-digital_6.html` in the repo root as legacy/reference unless Angus explicitly asks to compare or port something from it.

All files are vanilla HTML/CSS/JS. No framework. No build step.

## Files

| File | Description |
|------|-------------|
| `workspace.html` | Active quote workspace: import Bizman, confirm final site sizes, validate, export PDF |
| `quote-parser.js` | Active Bizman quote parser for multiple 6.3.x PDF layouts |
| `window-picker.html` | Active window picker: common configs, picker context, workspace round-trip |
| `window-builder.html` | Active custom window builder: grid editor, mullions/transoms, workspace round-trip |
| `door-picker.html` | Active door picker: Patio, Palace, Multi-Slide, Vistafold, Hinged |
| `digital-rough-copy-index.html` | Home dashboard / navigation reference |
| `validation-report.html` | Validation report reference |
| `brand-spec.md` | Anglo Windows brand spec: colours, typography, CSS variables |
| `vendor/` | Local PDF.js worker/lib and logo assets for offline tablet/site use |

## Design System

Dark gold theme matching Anglo Windows brand:

- `--bg`: oklch(15.1% 0.009 239.8) - deep dark background
- `--accent`: oklch(87.1% 0.178 91.8) - gold/amber accent
- `--font-display`: Iowan Old Style / Palatino serif stack
- `--font-body`: Segoe UI / Inter-style UI stack
- `--font-mono`: Cascadia Mono / JetBrains Mono style code stack

## Current Workspace Flow

- Import Bizman quote PDF.
- Auto-fill job/site/customer details and line items.
- Show quote sizes as reference only.
- Require final site sizes and line type/configuration before export.
- Let reps repair/confirm lines through window picker, door picker, or custom builder.
- Export a landscape A4 rough copy PDF via browser print/Save as PDF.
- Include material tally at the foot of the rough copy.
- Keep tablet-first touch behavior and offline PDF import.

## Local Test URLs

Local browser:

```text
http://127.0.0.1:5178/workspace.html
```

Tablet on same Wi-Fi:

```text
http://<PC-LAN-IP>:5179/workspace.html
```

Start servers from the repo root:

```powershell
.\tools\start-preview.ps1
.\tools\start-preview.ps1 -Port 5179 -Bind 0.0.0.0
```

Run the project verification helper before committing:

```powershell
.\tools\verify-project.ps1
```

To test quote upload/extraction on a tablet, stage the sample quote locally; the script prints the `tablet-adb.ps1 -Push` command to send it to the tablet over ADB (quotes never go over the LAN):

```powershell
.\tools\stage-tablet-files.ps1 -Path "\\ANGLOSERVER\Share\Search\Scans\.....202606\ANNEMIE BRUCE JH532611 D2161-QUOTATION.pdf"
```

## Do Not Commit

Real quote PDFs and extracted quote text fixtures contain customer PII. Keep these local only:

- `_test_quote*.pdf`
- `_quote*.txt`
- `_quote*.json`
- `tablet-screen*.png`
- `tablet-test-files/`

## Source Price-List References

- MASTER-PRICE-LIST-305MM-CASEMENT-TOP-AND-SIDE-HUNG.pdf
- elite-sliders-pricelist.pdf
- HINGED-DOORS-PRICE-LIST.pdf
- PALACE---PRICE-LIST.pdf
- PATIO-DOOR-PRICELIST.pdf
