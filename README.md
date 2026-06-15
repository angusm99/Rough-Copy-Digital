# Rough Copy Digital

Vanilla HTML/CSS/JS field measurement and quote-confirmation tool for Anglo Windows. Reps use it on tablets on site to import Bizman quote PDFs, confirm final measured window and door sizes, pick or build configurations, and export a rough copy PDF for workshop/material planning.

No framework. No build step. The active app is served directly from static files.

## Current Basis

The active build path is:

- **`open-design-components/workspace.html`** - active quote workspace
- **`open-design-components/quote-parser.js`** - active Bizman quote PDF parser
- **`open-design-components/window-picker.html`** - active window picker
- **`open-design-components/door-picker.html`** - active door picker
- **`open-design-components/window-builder.html`** - active custom builder
- **`open-design-components/vendor/`** - vendored PDF.js and logo assets for offline site use

Legacy/reference only:

- **`rough-copy-digital_6.html`** - older working base, keep only as reference unless explicitly porting logic from it
- **`Rough Copy Digital - Standalone.html`** - reference-only design variant

If you are testing or editing the current version, start in `open-design-components/`.

## Quick Start

From this folder:

```powershell
python -m http.server 5178 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:5178/open-design-components/workspace.html
```

For tablet testing on the same Wi-Fi, start a LAN-bound server and use this PC's local IP address:

```powershell
python -m http.server 5179 --bind 0.0.0.0
```

Then open:

```text
http://<PC-LAN-IP>:5179/open-design-components/workspace.html
```

Use `Get-NetIPAddress -AddressFamily IPv4` to confirm the current LAN IP.

## Files

- **`open-design-components/`** - current active build path and UI basis
- **`rough-copy-digital_6.html`** - legacy working base kept for reference
- **`Rough Copy Digital - Standalone.html`** - React/JSX variant from Claude Design, reference only
- **`PROGRESS-2026-04-24.md`** - planning doc and business-logic spec
- **`master-context.md`** - development history through 2026-03-17
- **`DIGITAL ROUGH COPY files/`** - snapshot of Apr 23 state
- **`source-archives/`** - older zipped snapshots
- **`CLAUDE.md`** - current handoff instructions for Claude/Codex style agents

## Status

Active development is centered on `open-design-components/`.

Current capabilities:

- Bizman quote PDF import for multiple Bizman 6.3.x layouts
- job/site header extraction and quote notes banner
- quote sizes as reference only; final RC sizes must be entered and confirmed on site
- export gate requiring type + confirmed size on every line
- landscape A4 rough copy print/PDF view with diagrams and material tally
- window picker, door picker, and custom window builder round-trip through localStorage
- tablet-first touch targets and offline PDF import via vendored PDF.js

See `CLAUDE.md` for agent handoff instructions and `PROGRESS-2026-04-24.md` for broader business rules.
