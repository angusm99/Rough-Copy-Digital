# Open Design Components — Digital Rough Copy

Built by Open Design (Claude Sonnet 4.5) on 2026-05-28 / 2026-05-29.
All files are vanilla HTML/CSS/JS. No framework. Same stack as rough-copy-digital_6.html.

## Files

| File | Description |
|------|-------------|
| `digital-rough-copy-index.html` | Home dashboard — 4 screen overview, open/new quote |
| `workspace.html` | Quote workspace — 18-line example, Import Bizman, Add Line, Validate, Export PDF/Excel |
| `window-picker.html` | Window picker modal — Common sizes, product family tabs (Top Hung, Side Hung, Fixed, etc.), selection preview |
| `window-builder.html` | Custom window builder — Grid editor, mullion/transom assignment, per-cell type |
| `door-picker.html` | Door picker — Family tabs: Sliding/Patio, Elite Sliders, Hinged, Folding/Vistafold, Palace, Pivot; panel configs XO/OX/OXX/XXO/OXXO |
| `validation-report.html` | Validation report — 7 issue summary, per-line issue list |
| `brand-spec.md` | Anglo Windows brand spec — colours, typography, CSS variables |

## Design System

Dark gold theme matching Anglo Windows brand:
- `--bg`: oklch(15.1% 0.009 239.8) — deep dark background
- `--accent`: oklch(87.1% 0.178 91.8) — gold/amber accent
- `--font-display`: Iowan Old Style / Palatino (serif headers)
- `--font-body`: Segoe UI / Inter (sans body)
- `--font-mono`: Cascadia Mono / JetBrains Mono (codes/labels)

## Status

These are reference/design components. They contain mock data and static interactions.
They are NOT merge targets for rough-copy-digital_6.html yet — but are the primary
design source for porting the new UI and UX patterns into the working base.

## What to Port into _6.html

1. **Window picker modal** — tab filter UX, card grid, right-panel preview, code/size/glass/colour fields
2. **Door picker** — family tabs (Sliding•Patio, Elite Sliders, Hinged, Folding/Vistafold, Palace, Pivot), panel config cards (XO/OX/OXX/XXO/OXXO), lock side + opening fields
3. **Workspace table** — column structure, status badges (Ready/Needs input/Builder items), Import Bizman button
4. **Export package** — Rough copy PDF (Landscape A4), Workshop Excel, Rep summary (mobile PDF)
5. **Validation report** — per-issue list with line references
6. **CSS design tokens** — the oklch colour palette and font stack from brand-spec.md

## Source (Bizman PDFs used as input)

- MASTER-PRICE-LIST-305MM-CASEMENT-TOP-AND-SIDE-HUNG.pdf
- elite-sliders-pricelist.pdf
- HINGED-DOORS-PRICE-LIST.pdf
- PALACE---PRICE-LIST.pdf
- PATIO-DOOR-PRICELIST.pdf

---
*Copied from Open Design project: 28e86d96-4e0e-40dd-aaaf-fe9fa75962b3*
*Date copied: 2026-05-29*
