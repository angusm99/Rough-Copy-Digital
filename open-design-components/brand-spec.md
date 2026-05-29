# Anglo Windows Brand Spec

Source basis:
- Core identity extracted from `NEW LOGO-2025/SOLID BACKGROUND` and `CLEAR BACKGROUND`
- Formal application checked against `LETTERHEADS`
- `EXTRAS` intentionally excluded from identity decisions

Observed identity:
- Primary brand signal is a saturated Anglo yellow paired with a near-black structural wordmark
- The mark combines an architectural fanlight/window motif with a classic serif wordmark
- Letterhead usage is sparse, centered, formal, and whitespace-led rather than decorative

## Core Tokens

```css
:root {
  --bg:      oklch(15.1% 0.009 239.8);
  --surface: oklch(31.0% 0.015 252.3);
  --fg:      oklch(92.5% 0.007 88.6);
  --muted:   oklch(70.4% 0.031 87.6);
  --border:  oklch(31.0% 0.015 252.3);
  --accent:  oklch(87.1% 0.178 91.8);
}
```

Supporting values:
- `--accent-strong`: `oklch(74.7% 0.151 90.8)`
- `--ink`: `oklch(15.1% 0.009 239.8)`
- `--paper`: `oklch(100% 0 89.9)`

Approximate source colors:
- Anglo yellow: `#FFCF01`
- Anglo ink: `#080C0F`

## Typography

Display stack:
```css
'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Georgia, serif
```

Body stack:
```css
'Segoe UI', 'Segoe UI Variable Text', 'Inter', system-ui, sans-serif
```

Mono stack:
```css
'Cascadia Mono', 'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace
```

Type posture:
- Brand headlines and section signatures can use the serif display stack
- Dense operational UI, tables, forms, and filters should default to the body stack
- Dimensions, item codes, quote numbers, and validation metadata should use mono selectively

## Layout Posture Rules

1. Use Anglo yellow as a signal and confirmation color, not as a full-UI flood. In dark product UI, reserve it for active states, selected rows, primary actions, and key diagram highlights.
2. Keep radii tight and engineered. Prefer `6px` to `10px` for standard controls and `12px` only on larger containers or dialogs.
3. Use thin dividers and panel framing instead of soft card piles. The identity should feel drafted and assembled, not bubbly.
4. Favor structured alignment, visible grids, and strong row rhythm. Tables, builder canvases, and picker groups should read like working surfaces.
5. Depth should be subtle: low-elevation overlays, restrained glows, and glass/metal cues only where they improve focus.

## UI and Material Guidance

- Default product mode: dark charcoal workspace with lighter charcoal surfaces
- Light mode: white or warm-neutral paper surfaces with Anglo ink and yellow accents
- Diagrams should use crisp linework and simple filled states; avoid sketchy illustration styles
- Status colors should sit beside, not fight, the yellow accent:
  - ready/success: muted green
  - caution/check: Anglo yellow
  - missing/error: restrained red-orange
  - informational: steel blue

## Logo Usage Guidance

- Prefer the black-on-light and yellow-on-dark variants over placing the logo inside decorative frames
- Preserve the fanlight mark and serif wordmark proportions; do not redraw into a geometric sans logo
- On product UI, the full logo should appear in shell/header contexts. Use the fanlight mark alone only when space is constrained
- Maintain clearspace equal to at least the width of one mullion segment from the fanlight mark
- Avoid gradients, embossed effects, bevels, outline glows, or startup-style hero treatments

## Brand Personality Summary

Anglo Windows should feel precise, calm, engineered, credible, and quietly premium. The system should read as architectural manufacturing expertise translated into modern software, not as generic SaaS minimalism and not as heritage nostalgia.

## Direction Range

Safest:
- Dark architectural utility with restrained serif touches, dense tables, and yellow signal states

Middle:
- Mixed dark/light system with more paper-and-ink contrast, stronger editorial headers, and clearer product zoning

Boldest:
- High-contrast Anglo black/yellow shell with larger architectural geometry, sharper panel segmentation, and more assertive diagram-led navigation
