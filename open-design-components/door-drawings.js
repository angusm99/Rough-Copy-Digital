/* Shared door geometry: outside view; hinged handing mirrors, sliders never do. */
(function(root) {
const SlidingConfigs = typeof module !== 'undefined' ? require('./sliding-configs.js') : root.SlidingConfigs;
    const D = {
      GOLD: '#c29b27',
      // Glass reads BLUE throughout (Bizman convention). Sash vs fixed is
      // carried by the gold sash border + opening chevron, not by colour —
      // the green/gold scheme did not work on the tablet.
      GLASSBASE: '#0f1012',
      FIX:  'rgba(40,100,180,0.60)',
      SASH: 'rgba(40,100,180,0.60)',
      H: 2090,
      FR: 80,          // outer frame — heavier, it needs to read as the frame
      GAP: 35,
      MID: 1170,
      MIDH: 95,        // midrail: one solid band, never two thin lines
    };

    function doorShellSVG(mmW, inner) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${mmW} ${D.H}" preserveAspectRatio="xMidYMid meet">` +
        `<rect x="0" y="0" width="${mmW}" height="${D.H}" rx="4" fill="${D.GOLD}"/>${inner}</svg>`;
    }

    // Slatted areas are SOLID in the frame colour, divided by black lines so
    // the individual slats read, with an outline showing the panel's extent.
    // (Angus, 2026-09-07 — the old version drew separate bars with glass
    // showing between them, which is not how a slatted leaf looks.)
    function slatPanel(x, y, w, h) {
      if (w <= 0 || h <= 0) return '';
      const PITCH = 105;
      let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${D.GOLD}"`
            + ` stroke="#000" stroke-width="6"/>`;
      for (let ly = y + PITCH; ly < y + h - 4; ly += PITCH) {
        s += `<line x1="${x}" y1="${ly}" x2="${x + w}" y2="${ly}" stroke="#000" stroke-width="5"/>`;
      }
      return s;
    }

    // One glass panel. opts: fixed, midrail(false to skip), chevron l/r,
    // arrow l/r, bars, louvre, cladding, stable — leaf details in gold.
    function doorPanel(x, w, opts = {}) {
      const y = D.FR, h = D.H - 2 * D.FR;
      // Glass is TWO layers, exactly as the hand-drawn Anglo assets do it:
      // a dark base, then the translucent colour over it. Laying the
      // translucent blue straight onto the gold frame washes it out to grey.
      let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${D.GLASSBASE}" stroke="#000" stroke-width="2"/>`
            + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${opts.fixed ? D.FIX : D.SASH}"/>`;
      // sash border FIRST, then the midrail on top — drawing the midrail
      // underneath let the border's stroke cut it into two thin lines
      // Stile drawn at its true mm width. It used to be a flat 30 regardless,
      // so HD-O-60 and HD-O-90 rendered IDENTICALLY - two cards a rep could
      // not tell apart. Width is geometry, so it survives a black-and-white
      // print of the rough copy; shading would not.
      const stile = opts.stile || 60;
      if (!opts.fixed) s += `<rect x="${x + stile/2}" y="${y + stile/2}" width="${w - stile}" height="${h - stile}" fill="none" stroke="${D.GOLD}" stroke-width="${stile}"/>`;
      // Midrail is OPT-IN. It used to default on, which put a midrail on every
      // sliding-folding, pivot and patio leaf — only the M codes have one.
      if (opts.midrail === true) s += `<rect x="${x}" y="${D.MID}" width="${w}" height="${D.MIDH}" fill="${D.GOLD}"/>`;
      const midY = y + h / 2;
      const dash = `fill="none" stroke="#fff" stroke-width="8" stroke-dasharray="14,14" stroke-linecap="round" stroke-linejoin="round"`;
      // The apex points at the HANDLE side (Angus, 2026-09-07): "wherever the
      // handle is, that's the way they must point". So on a double door both
      // apexes point inward to the centre, where the handles meet.
      // chevron:'left'/'right' names where the APEX sits.
      if (opts.arrow) {
        const cx = x + w/2, ax = opts.arrow === 'left' ? -1 : 1;
        s += `<path d="M${cx - 60*ax},${midY} L${cx + 60*ax},${midY} M${cx + 35*ax},${midY-25} L${cx + 60*ax},${midY} M${cx + 35*ax},${midY+25} L${cx + 60*ax},${midY}" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
      if (opts.bars) {
        for (let i = 1; i < opts.bars; i++)
          s += `<rect x="${x + (w/opts.bars)*i - 6}" y="${y}" width="12" height="${h}" fill="${D.GOLD}"/>`;
        s += `<rect x="${x}" y="${y + h*0.28}" width="${w}" height="12" fill="${D.GOLD}"/>`;
        s += `<rect x="${x}" y="${y + h*0.75}" width="${w}" height="12" fill="${D.GOLD}"/>`;
      }
      if (opts.louvre) s += slatPanel(x + 30, y + 30, w - 60, h - 60);
      if (opts.cladding) {
        const n = Math.max(3, Math.round(w / 150));
        for (let i = 1; i < n; i++)
          s += `<rect x="${x + (w/n)*i - 5}" y="${y}" width="10" height="${h}" fill="${D.GOLD}" opacity="0.85"/>`;
      }
      if (opts.stable) s += `<rect x="${x}" y="${y + h*0.48}" width="${w}" height="50" fill="${D.GOLD}"/>`;
      // Bizman "BOTTOM SLATS" — slats below the midrail only, glass above.
      // bottom slats: solid panel from just below the midrail to the bottom rail
      if (opts.slatBottom) {
        const top = D.MID + D.MIDH;
        s += slatPanel(x + 30, top, w - 60, (y + h - 30) - top);
      }
      if (opts.chevron === 'left')  s += `<polyline points="${x+w-35},${y+35} ${x+35},${midY} ${x+w-35},${y+h-35}" ${dash}/>`;
      if (opts.chevron === 'right') s += `<polyline points="${x+35},${y+35} ${x+w-35},${midY} ${x+35},${y+h-35}" ${dash}/>`;
      return s;
    }

    // Bizman treatment codes → how the leaf is drawn.
    //   (none) FULL GLASS · M midrail · S full slats · SB/BS bottom slats
    //   PH parliament hinges (same leaf, different hardware)
    function leafOptsFor(style) {
      return {
        glass:      {},
        midrail:    { midrail: true },       // only the M codes carry a midrail
        parliament: {},
        slats:      { louvre: true },
        slatBottom: { slatBottom: true },
        stableSlats:      { stable: true, louvre: true },
        stableSlatBottom: { stable: true, slatBottom: true },
        classic:  { bars: 2 },
        cape:     { bars: 3 },
        louvre:   { louvre: true },
        cladding: { cladding: true },
        stable:   { stable: true },
      }[style] || {};
    }


    function hingedStyleSVG(style, widthClass, W, H, stile) {
      const extras = { ...leafOptsFor(style), stile: stile || 60 };
      if (widthClass === 'double') {
        // Handles meet at the centre, and the apex follows the handle — so
        // BOTH apexes point inward: left leaf's apex on its right, right
        // leaf's apex on its left.
        const leafW = 800, mmW = 2*D.FR + 2*leafW + D.GAP;
        return doorShellSVG(mmW,
          doorPanel(D.FR, leafW, { chevron: 'right', ...extras }) +
          doorPanel(D.FR + leafW + D.GAP, leafW, { chevron: 'left', ...extras }));
      }
      // Single leaf is drawn handle-LEFT (apex left); handMirror() flips it
      // when the rep confirms the handle on the right.
      const mmW = 890;
      return doorShellSVG(mmW, doorPanel(D.FR, mmW - 2*D.FR, { chevron: 'left', ...extras }));
    }

    function pivotDoorSVG(style, W, H) {
      const mmW = 890, w = mmW - 2*D.FR;
      let inner = doorPanel(D.FR, w, leafOptsFor(style));
      // pivot axis at roughly a third in
      const px = D.FR + w * 0.3;
      inner += `<line x1="${px}" y1="${D.FR}" x2="${px}" y2="${D.H - D.FR}" stroke="#fff" stroke-width="8" stroke-dasharray="14,14" stroke-linecap="round"/>`;
      return doorShellSVG(mmW, inner);
    }

    function slidingSVG(panels, W, H) {
      return SlidingConfigs.svg(panels.join(''), Math.max(1600, panels.length * 820), 2090);
    }

    function foldingSVG(leaves, W, H, activeIndex = 0) {
      const leafW = 620;
      const mmW = 2*D.FR + leaves*leafW + (leaves-1)*D.GAP;
      let inner = '';
      for (let i = 0; i < leaves; i++) {
        const x = D.FR + i*(leafW + D.GAP);
        inner += doorPanel(x, leafW, i === activeIndex ? { chevron: 'left' } : {});
      }
      // fold zigzag across the leaf boundaries
      const zy = D.FR + 160, amp = 110;
      let pts = '';
      for (let i = 0; i <= leaves; i++) {
        const x = D.FR + i*(leafW + D.GAP) - (i > 0 ? D.GAP/2 : 0);
        pts += `${x},${zy + (i % 2 ? amp : 0)} `;
      }
      inner += `<polyline points="${pts.trim()}" fill="none" stroke="#fff" stroke-width="8" stroke-dasharray="14,14" stroke-linecap="round" stroke-linejoin="round"/>`;
      return doorShellSVG(mmW, inner);
    }

    const DOORS = {
      pivot: [
        { id:'PIV-LP-12', group:'Large Pane Pivot', config:'Pivot', lock:'Custom', open:'Open in', code:'PIV-LP-12', label:'Large Pane Pivot 1200', style:'large', note:'Large pane pivot door, 1200 wide.' },
        { id:'PIV-LP-15', group:'Large Pane Pivot', config:'Pivot', lock:'Custom', open:'Open in', code:'PIV-LP-15', label:'Large Pane Pivot 1500', style:'large', note:'Large pane pivot door, 1500 wide.' },
        { id:'SWG-LP-SAOI', group:'Large Pane Swing', config:'SA OI', lock:'Left', open:'Open in', code:'SWG-LP-SAOI', label:'Large Pane Swing SA OI 1200', style:'large', note:'Single active, open-in large pane swing door.' },
        { id:'SWG-LP-SAOO', group:'Large Pane Swing', config:'SA OO', lock:'Left', open:'Open out', code:'SWG-LP-SAOO', label:'Large Pane Swing SA OO 1200', style:'large', note:'Single active, open-out large pane swing door.' },
        { id:'SWG-LP-DA12', group:'Large Pane Swing', config:'DA', lock:'Centre', open:'Open in', code:'SWG-LP-DA12', label:'Large Pane Double Active 1200', style:'large-double', note:'Large pane double active swing door, 1200.' },
        { id:'SWG-LP-DA15', group:'Large Pane Swing', config:'DA', lock:'Centre', open:'Open in', code:'SWG-LP-DA15', label:'Large Pane Double Active 1500', style:'large-double', note:'Large pane double active swing door, 1500.' }
      ],
      // Filled from SlidingConfigs.layouts below so these systems cannot drift.
      patio: [],
      multislide: [],
      vistafold: [
        { id: 'VF-3L', group:'3 Panel', config: '3-panel', lock: 'Left', open: 'Stack right', code: 'VF-3L', label: 'Sliding Folding 3 Panel', leaves: 3, activeLeaf: 0, note:'Three-panel sliding folding door.' },
        { id: 'VF-4L', group:'4 Panel', config: '4-panel', lock: 'Left', open: 'Open out', code: 'VF-4L', label: 'Sliding Folding 4 Panel', leaves: 4, activeLeaf: 0, note:'Four-panel sliding folding door.' },
        { id: 'VF-5L', group:'5 Panel', config: '5-panel', lock: 'Left', open: 'Open out', code: 'VF-5L', label: 'Sliding Folding 5 Panel', leaves: 5, activeLeaf: 0, note:'Five-panel sliding folding door.' },
        { id: 'VF-6L', group:'6 Panel', config: '6-panel', lock: 'Left', open: 'Open out', code: 'VF-6L', label: 'Sliding Folding 6 Panel', leaves: 6, activeLeaf: 0, note:'Six-panel sliding folding door.' },
        { id: 'VF-7L', group:'7 Panel', config: '7-panel', lock: 'Left', open: 'Open out', code: 'VF-7L', label: 'Sliding Folding 7 Panel', leaves: 7, activeLeaf: 0, note:'Seven-panel sliding folding door.' },
        { id: 'VF-8L', group:'8 Panel', config: '8-panel', lock: 'Left', open: 'Open out', code: 'VF-8L', label: 'Sliding Folding 8 Panel', leaves: 8, activeLeaf: 0, note:'Eight-panel sliding folding door. Typical widths 4800 to 7200.' },
        { id: 'VF-10L', group:'10 Panel', config: '10-panel', lock: 'Centre', open: 'Open out', code: 'VF-10L', label: 'Sliding Folding 10 Panel', leaves: 10, activeLeaf: 4, note:'Ten-panel sliding folding door. Typical widths 6000 to 7200.' }
      ],
      // ── Hinged doors — Bizman template codes (C8135) ────────────────────
      // Grammar: [HD|HDD|HDSTAB|PIV][treatment]-[I|O]-[60|90]
      //   treatment: (none) full glass · M midrail · S full slats
      //              SB/BS slat bottom · PH parliament hinges
      //   I = open in · O = open out · 60/90 = stile width (mm)
      // Sizes are Bizman nominals less 10mm (890 = 900, 1790 = 1800).
      // Drawings are ALWAYS viewed from outside (canonical Anglo rule).
      hinged: [
        // Single hinged — 900 x 2100
        { id:'HD-I-60', group:'Single Hinged (HD)', config:'Full glass', lock:'Left', open:'Open in', code:'HD-I-60', label:'Single Hinged · Open In · 60mm', style:'glass', widthClass:'single', note:'SINGLE HINGED DOOR-OPEN IN-60mm STILES. 900x2100.' },
        { id:'HD-O-60', group:'Single Hinged (HD)', config:'Full glass', lock:'Left', open:'Open out', code:'HD-O-60', label:'Single Hinged · Open Out · 60mm', style:'glass', widthClass:'single', note:'SINGLE HINGED DOOR-OPEN OUT-60mm STILES. 900x2100.' },
        { id:'HD-O-90', group:'Single Hinged (HD)', config:'Full glass', lock:'Left', open:'Open out', code:'HD-O-90', label:'Single Hinged · Open Out · 90mm', style:'glass', widthClass:'single', note:'SINGLE HINGED DOOR-OPEN OUT-90mm STILES. 900x2100.' },
        { id:'HDM-I-60', group:'Single Hinged (HD)', config:'Midrail', lock:'Left', open:'Open in', code:'HDM-I-60', label:'Single Hinged Midrail · Open In · 60mm', style:'midrail', widthClass:'single', note:'SINGLE HINGED DOOR MIDRAIL-OPEN IN-60mm STILES.' },
        { id:'HDM-O-60', group:'Single Hinged (HD)', config:'Midrail', lock:'Left', open:'Open out', code:'HDM-O-60', label:'Single Hinged Midrail · Open Out · 60mm', style:'midrail', widthClass:'single', note:'SINGLE HINGED DOOR MIDRAIL-OPEN OUT-60mm STILES.' },
        { id:'HDPH-O-60', group:'Single Hinged (HD)', config:'Parliament hinges', lock:'Left', open:'Open out', code:'HDPH-O-60', label:'Single Hinged Parliament · Open Out · 60mm', style:'parliament', widthClass:'single', note:'SINGLE HINGED DOOR-PARLIAMENT HINGES-OPEN OUT-60mm STILES.' },
        { id:'HD-SB-I-60', group:'Single Hinged (HD)', config:'Slat bottom', lock:'Left', open:'Open in', code:'HD-SB-I-60', label:'Single Hinged Slat Bottom · Open In · 60mm', style:'slatBottom', widthClass:'single', note:'SINGLE HINGED DOOR-BOTTOM SLATS-OPEN IN-60mm STILES.' },
        { id:'HD-S-I-60', group:'Single Hinged (HD)', config:'Full slats', lock:'Left', open:'Open in', code:'HD-S-I-60', label:'Single Hinged Full Slats · Open In · 60mm', style:'slats', widthClass:'single', note:'SINGLE HINGED DOOR-FULL SLATS-OPEN IN-60mm STILES.' },
        { id:'HD-S-O-60', group:'Single Hinged (HD)', config:'Full slats', lock:'Left', open:'Open out', code:'HD-S-O-60', label:'Single Hinged Full Slats · Open Out · 60mm', style:'slats', widthClass:'single', note:'SINGLE HINGED DOOR-FULL SLATS-OPEN OUT-60mm STILES.' },

        // Double hinged — 1800 x 2100
        { id:'HDD-I-60', group:'Double Hinged (HDD)', config:'Full glass', lock:'Centre', open:'Open in', code:'HDD-I-60', label:'Double Hinged · Open In · 60mm', style:'glass', widthClass:'double', note:'DOUBLE HINGED DOOR-OPEN IN-60mm STILES. 1800x2100.' },
        { id:'HDD-O-60', group:'Double Hinged (HDD)', config:'Full glass', lock:'Centre', open:'Open out', code:'HDD-O-60', label:'Double Hinged · Open Out · 60mm', style:'glass', widthClass:'double', note:'DOUBLE HINGED DOOR-OPEN OUT-60mm STILES. 1800x2100.' },
        { id:'HDD-O-90', group:'Double Hinged (HDD)', config:'Full glass', lock:'Centre', open:'Open out', code:'HDD-O-90', label:'Double Hinged · Open Out · 90mm', style:'glass', widthClass:'double', note:'DOUBLE HINGED DOOR-OPEN OUT-90mm STILES.' },
        { id:'HDDM-I-60', group:'Double Hinged (HDD)', config:'Midrail', lock:'Centre', open:'Open in', code:'HDDM-I-60', label:'Double Hinged Midrail · Open In · 60mm', style:'midrail', widthClass:'double', note:'DOUBLE HINGED DOOR MIDRAIL-OPEN IN-60mm STILES.' },
        { id:'HDDM-O-60', group:'Double Hinged (HDD)', config:'Midrail', lock:'Centre', open:'Open out', code:'HDDM-O-60', label:'Double Hinged Midrail · Open Out · 60mm', style:'midrail', widthClass:'double', note:'DOUBLE HINGED DOOR MIDRAIL-OPEN OUT-60mm STILES.' },
        { id:'HDDPH-O-60', group:'Double Hinged (HDD)', config:'Parliament hinges', lock:'Centre', open:'Open out', code:'HDDPH-O-60', label:'Double Hinged Parliament · Open Out · 60mm', style:'parliament', widthClass:'double', note:'DOUBLE HINGED DOOR-PARLIAMENT HINGES-OPEN OUT-60mm STILES.' },
        { id:'HDD-SB-I-60', group:'Double Hinged (HDD)', config:'Slat bottom', lock:'Centre', open:'Open in', code:'HDD-SB-I-60', label:'Double Hinged Slat Bottom · Open In · 60mm', style:'slatBottom', widthClass:'double', note:'DOUBLE HINGED DOOR-BOTTOM SLATS-OPEN IN-60mm STILES.' },
        { id:'HDD-SB-O-60', group:'Double Hinged (HDD)', config:'Slat bottom', lock:'Centre', open:'Open out', code:'HDD-SB-O-60', label:'Double Hinged Slat Bottom · Open Out · 60mm', style:'slatBottom', widthClass:'double', note:'DOUBLE HINGED DOOR-BOTTOM SLATS-OPEN OUT-60mm STILES.' },
        { id:'HDD-S-I-60', group:'Double Hinged (HDD)', config:'Full slats', lock:'Centre', open:'Open in', code:'HDD-S-I-60', label:'Double Hinged Full Slats · Open In · 60mm', style:'slats', widthClass:'double', note:'DOUBLE HINGED DOOR-FULL SLATS-OPEN IN-60mm STILES.' },
        { id:'HDD-S-O-60', group:'Double Hinged (HDD)', config:'Full slats', lock:'Centre', open:'Open out', code:'HDD-S-O-60', label:'Double Hinged Full Slats · Open Out · 60mm', style:'slats', widthClass:'double', note:'DOUBLE HINGED DOOR-FULL SLATS-OPEN OUT-60mm STILES.' },

        // Stable doors — BS and SB both mean slat bottom (Bizman inconsistency)
        { id:'HDSTAB-I-60', group:'Stable (HDSTAB)', config:'Stable glass', lock:'Left', open:'Open in', code:'HDSTAB-I-60', label:'Stable · Open In · 60mm', style:'stable', widthClass:'single', note:'SINGLE STABLE DOOR-OPEN IN-60mm STILES.' },
        { id:'HDSTAB-O-60', group:'Stable (HDSTAB)', config:'Stable glass', lock:'Left', open:'Open out', code:'HDSTAB-O-60', label:'Stable · Open Out · 60mm', style:'stable', widthClass:'single', note:'SINGLE STABLE DOOR-OPEN OUT-60mm STILES.' },
        { id:'HDSTAB-BS-O-60', group:'Stable (HDSTAB)', config:'Slat bottom', lock:'Left', open:'Open out', code:'HDSTAB-BS-O-60', label:'Stable Slat Bottom · Open Out · 60mm', style:'stableSlatBottom', widthClass:'single', note:'SINGLE STABLE DOOR-BOTTOM SLATS-OPEN OUT-60mm STILES.' },
        { id:'HDSTAB-S-O-60', group:'Stable (HDSTAB)', config:'Full slats', lock:'Left', open:'Open out', code:'HDSTAB-S-O-60', label:'Stable Full Slats · Open Out · 60mm', style:'stableSlats', widthClass:'single', note:'SINGLE STABLE DOOR-FULL SLATS-OPEN OUT-60mm STILES.' }
      ]
    };

    // A shared configuration set, with system identity kept explicit. Codes here
    // are picker IDs, not a claim that every combination is a Bizman stock code.
    DOORS.multislide = [
      ['PAL', 'Palace Door', 'PALACE'], ['VAL', 'Valencia', 'VALENCIA'], ['CLS', 'CLS-250 Lift and Slide', 'CLS-250']
    ].flatMap(([key, group, brand]) => SlidingConfigs.baseLayouts.map(config => {
      const hands = SlidingConfigs.handsFor(config);
      return {
        id: `HDS-${key}-${config.length}-${config}`, code: `${key}-${config.length}-${config}`,
        group, brand, label: `${group} ${hands.join(' / ')}`, config, hands, panels: config.split(''),
        lock: '', open: '', note: `${SlidingConfigs.describe(config)} — viewed from outside. Panel order is the configuration; lock side does not change it.`
      };
    }));
    DOORS.patio = SlidingConfigs.baseLayouts.map(config => {
      const hands = SlidingConfigs.handsFor(config);
      return {
        id: `SL-${config.length}-${config}`, code: `SL-${config.length}-${config}`,
        label: `Patio Slider ${hands.join(' / ')}`,
        config, hands, panels: config.split(''), lock: '', open: '',
        note: `${SlidingConfigs.describe(config)} — viewed from outside.`
      };
    });


DOORS.hinged.sort((a,b) => (a.open === 'Open out' ? 0 : 1) - (b.open === 'Open out' ? 0 : 1));

// The stile width is a property of the leaf, not a different door. Two cards
// that differ only by "-60"/"-90" become ONE card carrying both widths, and
// the rep is asked which at "Use this" (Angus, 2026-09-08: the duplicate
// cards were "too much traffic on the page"). Only the codes Bizman actually
// lists get offered - most hinged doors are 60mm only.
DOORS.hinged.forEach(d => { const m = (d.code || '').match(/-(60|90)$/); if (m) d.stile = Number(m[1]); });

function stileBase(code) { return String(code || '').replace(/-(60|90)$/, ''); }

// One card per configuration, with every stile width Bizman lists for it.
function hingedCards() {
  const byBase = new Map();
  const cards = [];
  for (const d of DOORS.hinged) {
    if (!d.stile) { cards.push(d); continue; }
    const key = stileBase(d.code);
    const seen = byBase.get(key);
    if (seen) { if (!seen.stiles.includes(d.stile)) seen.stiles.push(d.stile); continue; }
    const card = { ...d, stiles: [d.stile] };
    byBase.set(key, card);
    cards.push(card);
  }
  // Label the card by its configuration, not by the width it happened to be
  // built from - the width is chosen at pick time.
  for (const c of cards) {
    if (c.stiles && c.stiles.length > 1) {
      c.stiles.sort((a, b) => a - b);
      c.label = String(c.label).replace(/ · \d+mm$/, '');
      c.code = stileBase(c.code);
    }
  }
  return cards;
}

// Resolve a card plus a chosen stile back to the real Bizman entry.
function withStile(door, stile) {
  const exact = stile ? find(stileBase(door.code) + '-' + stile) : null;
  if (exact) return { ...exact, family: door.family || 'hinged', handleSide: door.handleSide };
  return { ...door, stile: stile || door.stile || 60 };
}
DOORS.pivot.forEach(d => { if (!/OI|OO/.test(d.code)) d.open = 'Open out'; });
function hinged(door) { return ['hinged','pivot'].includes(door?.family); }
function handMirror(svg, side) {
  if (String(side).toUpperCase() !== 'RIGHT') return svg;
  const width = Number((svg.match(/viewBox="0 0 ([\d.]+)/) || [])[1]);
  if (!width) return svg;
  return svg.replace(/^(<svg[^>]*>)/, '$1<g transform="translate(' + width + ',0) scale(-1,1)">').replace('</svg>', '</g></svg>');
}
function doorSVG(door, W, H) {
  if (door.panels) return slidingSVG(door.panels, W, H);
  if (door.leaves) return foldingSVG(door.leaves, W, H, door.activeLeaf || 0);
  const svg = door.family === 'pivot'
    ? pivotDoorSVG(door.style || 'glass', W, H)
    : hingedStyleSVG(door.style || 'glass', door.widthClass || 'single', W, H, door.stile);
  return handMirror(svg, door.handleSide);
}
function find(code) {
  for (const [family, items] of Object.entries(DOORS)) {
    const item = items.find(d => d.code === code || d.id === code);
    if (item) return {...item, family};
  }
  return null;
}
function openingVariant(door, opening) {
  if (!hinged(door)) return door;
  const code = (door.code || '').replace(/-([IO])-(60|90)$/, '-' + (opening === 'OPEN OUT' ? 'O' : 'I') + '-$2');
  const exact = ['OPEN IN','OPEN OUT'].includes(opening) && find(code);
  if (exact && exact.open.toUpperCase() === opening) return {...exact, handleSide:door.handleSide};
  if (String(door.open).toUpperCase() === opening) return door;
  return {...door, id:'CUSTOM', code:'', open:opening, label:(door.label || 'Door').replace(/ · Open (In|Out)/i,'') + ' · ' + opening};
}
const api = {DOORS, doorSVG, find, hinged, openingVariant, hingedCards, withStile, stileBase};
if (typeof module !== 'undefined') module.exports = api; else root.DoorDrawings = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
