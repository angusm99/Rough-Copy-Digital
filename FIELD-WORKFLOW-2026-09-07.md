# Field workflow - 2026-09-07

Base reviewed: Claude's `b261d6d` (local HEAD matched GitHub main before edits).
Active app remains `open-design-components/`. This update is the `field1` build.

## Canonical decisions from Angus

- All elevations are viewed from OUTSIDE. Read O/X left to right: O = fixed,
  X = sliding. OX = fixed/sliding; XO = sliding/fixed; OXXO = fixed/sliding/sliding/fixed.
  These tokens do not encode travel direction. Changing handle side must never
  mirror/reverse the selected panel configuration.
- Elite and Knysna share window layouts, with distinct system labels. Palace and
  Valencia share slider layouts. Claude's confirmed handoff also includes Patio
  and CLS-250 in that shared slider configuration set.
- Building type, existing material (or NEW OPENING), wall type and colour require
  explicit site confirmation before measuring/capturing lines. NEW also requires
  enclosure selection; SPECIAL/CUSTOM requires the colour detail, code optional.
- Keep quote sizes as muted reference values, never overwrite them with measured
  sizes. Imported product text/size alone is not a reviewed line. A manual design
  pick is required for imported lines; automatic drawing matching is deferred.
- Keep the original quote drawing alongside the picked drawing and in the picker.

## Implemented

- `sliding-configs.js`: common outside-view O/X renderer, 17 choices for each of
  Elite and Knysna, drawn from the ten Elite template entries in A8030. Two-panel
  entries without panel tokens expose OX/XO alternatives; 2403 (4P) exposes OXXO
  and XXXX choices rather than claiming an inferred configuration. XOX/XXX/XXXX
  explicitly named in the source are included. Knysna uses the same geometry.
  Picker IDs are not a verified Knysna stock-code catalogue.
- Dimensions use code-derived nominal minus 10 mm per Claude's verified grammar.
  EHS3012 XOX uses 2990 x 1190 as the PRESET reference, not the source's known-wrong
  2090 overall width. An imported quote still retains its actual quoted 2090 value
  as reference; final site sizes remain blank until captured.
- Palace, Valencia, CLS-250 and Patio use OX, XO, OXX, XXO, OXXO, OXXXXO. Sliders
  use the common generated blue-glass/gold-frame diagram, not mirrored asset art.
  Handing and travel direction are separate fields and must be completed for doors.
- `field-rules.js`: one site/line readiness definition shared by workspace and
  landing page. Site confirmation is tied to the actual required field values;
  changing them re-locks capture/export. Line status lists all missing details.
- Existing saved picked diagrams migrate as selected designs; quote-only imports
  do not. Full quote imports reset the site block and confirmation so no old job
  address/material/colour confirmation leaks into another quote.
- Use-all sizes fills only blank measurements, never overwrites site measurements.
  Confirm-all sizes requires a selected design and valid positive sizes and does
  not bypass missing glass, colour, handing or other readiness rules.
- `picker-reference.js`: keeps the original image/product/quote size visible while
  picking and carries glass/colour/SPECIAL detail across. Source references survive
  replacement in workspace. No silent deletion of quote images on storage overflow:
  warn and prevent navigation instead. Storage is still localStorage, not a database.
- `field-ui.css`: larger input text, 46px input targets, 2px warm-gold input borders,
  stronger labels/focus outlines; original and selected drawing shown side by side.
  At tablet widths with a quote context, picker reference stays beside the cards.
- Parser fixes: Elite/Knysna are windows, not sliding doors; Palace XO remains XO.
- Cache bumped; versioned app resources included in shell caching. Cache fallback
  ignores query strings and never serves workspace HTML as a missing JS resource.
  Other apps' caches are not deleted. Visible `field1` build stamp added.

## Verification

- `tools/verify-project.ps1` passes, including syntax for new modules, index and
  existing pages, plus nine Node regression tests in `tools/test-field-workflow.cjs`.
- Isolated desktop Chrome session at 800 x 1280: A8030 imports 10 lines, 10 quote
  images, 10 reference sizes and ZERO final sizes. Site gate, confirmation and
  re-lock on wall change exercised via UI. Elite selection round-trip preserves
  quote image/size, returns XOX/window family and does not force door glass.
- Palace/Valencia both expose the same six configurations; OXXO remains unchanged
  when handle side is changed. Door round-trip returns CENTRE / BI-PART and safety
  glass. Generated landscape PDF visually inspected: selected diagram, glass,
  handing, config, colour and panel tally render without overlap.
- Real-template browser artifacts/PDF remain ignored outside the published folder.
- Physical tablet and glare validation NOT performed in this pass. Browser offline
  simulation did not report `navigator.onLine === false` as expected, so full offline operation
  is NOT claimed. Registration and cached shell resources were seen, not field proof.

## Still open

- Vistafold 3+1 / 7+1 interpretation, P4T vent layout and schedule import remain open
  from Claude's handoff. No assumptions were made about those layouts.
- Sliding presets cannot be sent to the casement-only builder: it would destroy
  their panel meaning. Use the slider choices until a sliding-aware builder exists.
- Exact Knysna supplier codes and additional layouts need source confirmation.
- Tablet reference may be FS44BPC01077 per today's handoff; verify `adb devices -l`
  before using it. Older ...070 is a factory-floor tablet, not a safe default.
- Preview: `tools/start-preview.ps1 -Port 5179` (loopback, app directory only).
  USB reverse is preferred over LAN; quote files go through ADB, never app hosting.
