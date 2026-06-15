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

- Import Bizman quote PDFs into the workspace.
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

- `http://127.0.0.1:5178/open-design-components/workspace.html`

If you are unsure where to make a change, make it in `open-design-components/` first.

## Storage Keys

- `aw_rc_job` - current workspace state
- `aw_picker_ctx` - line context sent from workspace to picker/builder
- `aw_picker_result` - picker/builder result returned to workspace

## Privacy

Real quote PDFs and extracted quote fixtures can contain customer PII. They should remain local-only and are ignored by `.gitignore` under `_test_quote*.pdf` and `_quote*.txt`.
