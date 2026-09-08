/* Variant chooser — one card per configuration, the handed/stile decision
   made at "Use this" instead of as separate cards.

   Angus, 2026-09-08: OX and XO sitting next to each other (and 60mm beside
   90mm) was "too much traffic on the page". They are the same configuration;
   what differs is a single choice the rep makes once. So the catalogue shows
   the configuration, and this asks the question at the moment of picking,
   with a drawing of each option rather than a letter code.

   Everything here is viewed from OUTSIDE, per the canonical Anglo rule. */
(function (root) {

  // ── mirror pairs ────────────────────────────────────────────────────────
  // O is fixed, X is sliding, read left to right from outside. OX and XO are
  // the same unit hung the other way round, so one card carries both.
  function mirror(config) {
    return String(config).split('').reverse().join('');
  }
  function isPalindrome(config) {
    return config === mirror(config);
  }

  function describePanels(config) {
    return config.split('').map(p => (p === 'O' ? 'Fixed' : 'Sliding')).join(' · ');
  }

  // "OX" -> fixed on the left, slides to the right. Said in words a rep can
  // check against the opening in front of them, not in letters.
  function describeSlider(config) {
    const first = config[0] === 'O' ? 'Fixed' : 'Sliding';
    const last = config[config.length - 1] === 'O' ? 'fixed' : 'sliding';
    return `${first} on the left, ${last} on the right`;
  }

  // ── the dialog ──────────────────────────────────────────────────────────
  let dlg = null;

  function ensureDialog() {
    if (dlg) return dlg;
    dlg = document.createElement('dialog');
    dlg.className = 'variant-dialog';
    dlg.innerHTML =
      '<form method="dialog">' +
        '<h2 id="vdTitle"></h2>' +
        '<p class="vd-sub" id="vdSub"></p>' +
        '<div class="vd-options" id="vdOptions"></div>' +
        '<button class="vd-cancel" value="">Cancel</button>' +
      '</form>';
    document.body.appendChild(dlg);
    return dlg;
  }

  /* options: [{ value, label, hint, svg }]
     Resolves with the chosen value, or null if cancelled. */
  function choose(title, subtitle, options) {
    if (!options || options.length < 2) {
      return Promise.resolve(options && options.length ? options[0].value : null);
    }
    const d = ensureDialog();
    d.querySelector('#vdTitle').textContent = title;
    d.querySelector('#vdSub').textContent = subtitle || '';
    d.querySelector('#vdOptions').innerHTML = options.map(o =>
      '<button class="vd-option" type="submit" value="' + o.value + '">' +
        '<span class="vd-art">' + (o.svg || '') + '</span>' +
        '<strong>' + o.label + '</strong>' +
        '<span class="vd-hint">' + (o.hint || '') + '</span>' +
      '</button>'
    ).join('');

    return new Promise((resolve) => {
      d.addEventListener('close', function handler() {
        d.removeEventListener('close', handler);
        resolve(d.returnValue || null);
      });
      d.showModal();
    });
  }

  /* Ask which way round a slider hangs. Returns the chosen config string. */
  function chooseSliderConfig(config, drawFn) {
    if (isPalindrome(config)) return Promise.resolve(config);
    const pair = [config, mirror(config)];
    return choose(
      'Which way round?',
      'Both are the same unit — viewed from outside.',
      pair.map(c => ({
        value: c,
        label: c,
        hint: describeSlider(c),
        svg: drawFn ? drawFn(c) : '',
      }))
    );
  }

  /* Ask which stile width. Returns the chosen width as a number. */
  function chooseStile(stiles, drawFn) {
    if (!stiles || stiles.length < 2) {
      return Promise.resolve(stiles && stiles.length ? stiles[0] : null);
    }
    return choose(
      'Which stile width?',
      'The stile is drawn to scale — 90mm reads visibly heavier.',
      stiles.slice().sort((a, b) => a - b).map(w => ({
        value: String(w),
        label: w + 'mm stiles',
        hint: w === 60 ? 'Standard' : 'Heavier profile',
        svg: drawFn ? drawFn(w) : '',
      }))
    ).then(v => (v ? Number(v) : null));
  }

  const api = { mirror, isPalindrome, describePanels, describeSlider, choose, chooseSliderConfig, chooseStile };
  if (typeof module !== 'undefined') module.exports = api;
  else root.PickerVariants = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
