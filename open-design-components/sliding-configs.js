/* Outside view, left to right. O is fixed; X is sliding (not a travel arrow).
   Shared geometry, distinct system labels. Codes without panel tokens need a
   deliberate layout choice; catalogue dimensions never confirm site sizes. */
(function (root) {
  const layouts = ['OX', 'XO', 'OXX', 'XXO', 'OXXO', 'OXXXXO'];
  const eliteSizes = [
    ['0909', ['OX', 'XO']], ['0912', ['OX', 'XO']],
    ['1209', ['OX', 'XO']], ['1503', ['OX', 'XO']],
    ['1806', ['OX', 'XO']], ['1812', ['OX', 'XO']],
    ['2403', ['OXXO', 'XXXX']], ['3009', ['XXXX']],
    ['3012', ['XOX', 'XXX']]
  ];
  function describe(config) {
    return config.split('').map(p => p === 'O' ? 'Fixed' : 'Sliding').join(' · ');
  }
  function windowPresets() {
    return ['Elite', 'Knysna'].flatMap(system => eliteSizes.flatMap(([size, configs]) => configs.map(config => {
      const W = Number(size.slice(0, 2)) * 100 - 10;
      const H = Number(size.slice(2)) * 100 - 10;
      return { code: `${system.toUpperCase()}-EHS-${size}-${config}`, sourceCode: `EHS-${size}`,
        name: `${system} ${config} ${W}×${H}`, system, family: system.toLowerCase(),
        W, H, panels: config.split(''), config,
        sub: `${describe(config)} · outside view`,
        note: `${system} sliding window. ${describe(config)} (outside view). EHS-${size}: code-derived reference size ${W} × ${H} mm; confirm final size on site. ` +
          (configs.length > 1 && size !== '3012' ? 'Source does not specify O/X order: these are selectable layouts, not an inferred quote configuration.' : 'Layout explicitly named in the Elite template catalogue.') +
          (system === 'Knysna' ? ' Knysna mirrors the Elite layout; EHS is the source reference, not a verified Knysna stock code.' : '') };
    })));
  }
  function svg(config, W = 1800, H = 1200) {
    if (!/^[OX]{2,6}$/.test(config)) return '';
    const frame = Math.min(W, H) * .045;
    const pw = (W - 2 * frame) / config.length, ph = H - 2 * frame;
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${config}: ${describe(config)}, viewed from outside"><rect width="${W}" height="${H}" fill="#d7ad35"/>`;
    config.split('').forEach((p, i) => {
      const x = frame + i * pw, inset = frame * .22;
      s += `<g data-panel="${p}" data-index="${i}"><rect x="${x + inset}" y="${frame}" width="${pw - 2 * inset}" height="${ph}" fill="#0f1012"/><rect x="${x + inset}" y="${frame}" width="${pw - 2 * inset}" height="${ph}" fill="rgba(40,100,180,0.60)"/>`;
      if (p === 'X') {
        s += `<rect x="${x + frame * .5}" y="${frame * 1.4}" width="${pw - frame}" height="${ph - frame * .8}" fill="none" stroke="#d7ad35" stroke-width="${frame * .22}"/>`;
      }
      // Sash outlines distinguish sliding panels; O/X remains in the title, not the drawing.
      s += '</g>';
    });
    return s + '</svg>';
  }
  const api = { layouts, windowPresets, describe, svg };
  if (typeof module !== 'undefined') module.exports = api;
  else root.SlidingConfigs = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
