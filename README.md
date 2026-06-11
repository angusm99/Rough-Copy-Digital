# Rough Copy Digital

Single-file HTML/CSS/JS field measurement & quoting form for Anglo Windows. Used on tablet/phone by reps on-site to capture window and door details, export to printable PDF, and (planned) read back handwritten rough copies via photo upload.

No framework. No external dependencies. Self-contained.

## Current Basis

The active build path for this project is now:

- **`open-design-components/workspace.html`** — active quote workspace
- **`open-design-components/quote-parser.js`** — active Bizman quote PDF parser
- **`open-design-components/window-picker.html`** — active window picker
- **`open-design-components/door-picker.html`** — active door picker
- **`open-design-components/window-builder.html`** — active custom builder

Legacy/reference only:

- **`rough-copy-digital_6.html`** — older working base, keep only as reference unless explicitly porting logic from it
- **`Rough Copy Digital - Standalone.html`** — reference-only design variant

If you are testing or editing the current version, start in `open-design-components/`.

## Files

- **`open-design-components/`** — current active build path and UI basis
- **`rough-copy-digital_6.html`** — legacy working base kept for reference
- **`Rough Copy Digital - Standalone.html`** — React/JSX variant from Claude Design (reference only, not a merge target)
- **`PROGRESS-2026-04-24.md`** — current planning doc and business-logic spec
- **`master-context.md`** — development history through 2026-03-17
- **`DIGITAL ROUGH COPY files/`** — snapshot of Apr 23 state
- **`source-archives/`** — older zipped snapshots

## Status

Active development is centered on `open-design-components/`, including the Bizman quote PDF import and confirmation-gated workspace flow. See `PROGRESS-2026-04-24.md` for the broader spec and preserved business rules.
