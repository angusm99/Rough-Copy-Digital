(function () {
  let ctx = {};
  try { ctx = JSON.parse(localStorage.getItem('aw_picker_ctx') || '{}') || {}; } catch (_) {}
  function setOption(id, value) {
    const el = document.getElementById(id);
    if (!el || value == null) return;
    if (![...el.options].some(o => o.value === value)) el.add(new Option(value, value));
    el.value = value;
  }
  window.PickerReference = {
    spec() {
      const colour = document.getElementById('colourField')?.value || ctx.colour || '';
      const sameColour = colour.toUpperCase() === String(ctx.colour || '').toUpperCase();
      return { glass: document.getElementById('glassField')?.value ?? ctx.glass ?? '', colour, specialColour: sameColour ? ctx.specialColour || '' : '',
        customColour: sameColour ? ctx.customColour || '' : '', customColourCode: sameColour ? ctx.customColourCode || '' : '',
        customGlass: document.getElementById('customGlassInput') ? document.getElementById('customGlassInput').value : ctx.customGlass || '' };
    }
  };
  document.addEventListener('DOMContentLoaded', () => {
    ['codeField', 'sizeField', 'configField'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.readOnly = true; el.title = 'Selected preset reference. Final site measurements are entered in the workspace.'; }
    });
    setOption('colourField', ctx.colour);
    if (ctx.preserveGlass) setOption('glassField', ctx.glass || '');
    const custom = document.getElementById('customGlassInput');
    if (custom) { custom.value = ctx.customGlass || ''; document.getElementById('glassField').dispatchEvent(new Event('change')); }
    const host = document.querySelector('aside');
    if (host && (ctx.quoteProduct || ctx.quoteDiagPNG || ctx.quoteW)) {
      document.body.classList.add('has-quote-reference');
      const box = document.createElement('figure'); box.className = 'quote-reference';
      const title = document.createElement('strong'); title.textContent = 'Original quote — reference only'; box.append(title);
      if (/^data:image\/(png|jpeg);base64,/.test(ctx.quoteDiagPNG || '')) {
        const img = document.createElement('img'); img.src = ctx.quoteDiagPNG; img.alt = 'Original quote drawing'; box.append(img);
      }
      const caption = document.createElement('figcaption');
      caption.textContent = [ctx.quoteProduct, ctx.quoteCode, ctx.quoteW && ctx.quoteH ? `${ctx.quoteW} × ${ctx.quoteH} mm` : ''].filter(Boolean).join(' · ');
      box.append(caption); host.prepend(box);
    }
    const stamp = document.createElement('div'); stamp.className = 'build-stamp'; stamp.textContent = 'Field build · 2026-09-08 / field3 · Outside view';
    document.body.append(stamp);
  });
})();
