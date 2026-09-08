/* One readiness definition for workspace and landing page. */
(function (root) {
  const text = v => String(v || '').trim();
  const positive = v => Number.isFinite(Number(v)) && Number(v) > 0;
  const siteKeys = ['building', 'material', 'wall', 'colour', 'enclosure', 'specialColour', 'customColour', 'customColourCode', 'floor', 'floorDetail', 'access', 'parking', 'barriers'];
  function siteMissing(s) {
    const missing = [];
    if (!text(s.building)) missing.push('Building type');
    if (!text(s.material)) missing.push('Existing material / new opening');
    if (s.building === 'NEW' && !text(s.enclosure)) missing.push('Enclosure type');
    if (!text(s.wall)) missing.push('Wall type');
    if (!text(s.colour)) missing.push('Colour');
    if (s.colour === 'SPECIAL' && !text(s.specialColour)) missing.push('Special colour');
    if (s.colour === 'SPECIAL' && s.specialColour === 'CUSTOM' && !text(s.customColour)) missing.push('Custom colour name');
    if (!text(s.floor)) missing.push('Floor');
    if (s.floor === 'OTHER' && !text(s.floorDetail)) missing.push('Floor detail');
    for (const [key,label] of [['access','Access'],['parking','Parking'],['barriers','Caution barriers']]) {
      if (!['YES','NO'].includes(s[key])) missing.push(label + ' decision');
    }
    return missing;
  }
  const fingerprint = s => JSON.stringify(siteKeys.map(k => text(s[k])));
  const siteReady = s => !siteMissing(s).length && s.captureConfirmed === fingerprint(s);
  function door(l) {
    if (['elite', 'knysna'].includes(l.family)) return false;
    return ['hinged', 'pivot', 'vistafold', 'patio', 'multislide'].includes(l.family) || /DOOR|STABLE|PALACE|VALENCIA|CLS-?250|VISTAFOLD|PIVOT/i.test(l.product || '');
  }
  function slider(l) { return ['elite','knysna','patio','multislide'].includes(l.family) || /SLIDING|SLIDER|PALACE|VALENCIA|CLS-?250/i.test(l.product || '') && !/FOLD/i.test(l.product || ''); }
  function lineFingerprint(l,s={}) {
    const fields = ['ref','location','product','code','family','width','height','qty','glass','customGlass','colour','specialColour','customColour','customColourCode','wrap','notes','config','handleSide','openingDirection','designSource','diagSVG','sizeConfirmed'];
    return JSON.stringify([fields.map(k=>l[k] ?? ''), fingerprint(s), s.flatsAngles || 'YES']);
  }
  function lineMissing(l, s = {}, skipReview = false) {
    const m = [];
    if (!text(l.ref)) m.push('reference');
    if (!text(l.product)) m.push('unit type');
    if (!l.designSelected || !(l.designSource === 'quote' ? /^data:image\/(png|jpeg);base64,/.test(l.quoteDiagPNG || '') : l.diagSVG)) m.push('pick design');
    if (!positive(l.width) || !positive(l.height)) m.push('final size');
    else if (!l.sizeConfirmed) m.push('confirm size');
    if (!positive(l.qty) || !Number.isInteger(Number(l.qty))) m.push('quantity');
    if (!text(l.glass)) m.push('glass');
    if (String(l.glass).toUpperCase() === 'SPECIAL' && !text(l.customGlass)) m.push('special glass');
    if (door(l) && text(l.glass) && !/TSG|laminat|lam\b|\.38|safety|special/i.test(l.glass)) m.push('safety glass');
    const c = text(l.colour) ? l : s;
    if (!text(c.colour)) m.push('colour');
    if (String(c.colour).toUpperCase() === 'SPECIAL' && !text(c.specialColour)) m.push('special colour');
    if (String(c.colour).toUpperCase() === 'SPECIAL' && c.specialColour === 'CUSTOM' && !text(c.customColour)) m.push('custom colour');
    if (door(l) && !slider(l) && !text(l.handleSide)) m.push('handing / lead side');
    if (door(l) && !slider(l) && !text(l.openingDirection)) m.push('opening direction');
    if (slider(l) && !/^[OX]{2,6}$/.test(text(l.config))) m.push('panel configuration');
    if (l.designSource === 'quote' && l.quoteDesignConfirmed !== quoteDesignFingerprint(l)) m.push('review quote drawing');
    if (!skipReview && l.lineConfirmed !== lineFingerprint(l,s)) m.push('confirm line');
    return m;
  }
  function quoteDesignFingerprint(l) { return JSON.stringify(['product','config','handleSide','openingDirection'].map(k=>l[k] || '')); }
  const api = { slider, lineFingerprint, quoteDesignFingerprint, siteKeys, siteMissing, fingerprint, siteReady, lineMissing, positive };
  if (typeof module !== 'undefined') module.exports = api;
  else root.FieldRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
