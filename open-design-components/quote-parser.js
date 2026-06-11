/* ============================================================
   Anglo Windows — Bizman Quotation Parser
   Parses text extracted from a Bizman 6.3.x "Supply and Fit"
   quotation PDF into structured job + line data for the
   Digital Rough Copy.

   Pure function, no DOM/PDF dependencies, so it can be unit
   tested in Node and reused in the browser.
   ============================================================ */
(function (root) {
  "use strict";

  // ---- helpers -------------------------------------------------

  // Lines that are page furniture / table headers / footer noise.
  const JUNK = [
    /^Page\s+\d+\s+of\s+\d+$/i,
    /^Quote:\s/i,
    /^Licensed to:/i,
    /^Total$/i,
    /^Unit\s*\(excl\)$/i,
    /^Item\s*\/\s*Description$/i,
    /^QTY\s+Units$/i,
    /^Windload:/i,
    /^View from Outside$/i,
    /^Set$/i,
    /^\d{4}-\d{2}-\d{2}$/, // footer date stamp
  ];

  const COLOURS = [
    "WHITE", "BRONZE", "CHARCOAL", "MATT CHARCOAL", "SILVER",
    "SILVER-PC", "NATURAL ANODISED", "BLACK", "GREY",
  ];

  function isJunk(line) {
    return JUNK.some((re) => re.test(line.trim()));
  }

  function isMoney(line) {
    return /^R\s*[\d\s.,]+$/.test(line.trim());
  }

  function isQty(line) {
    return /^\d{1,3}$/.test(line.trim());
  }

  // Map bracketed product tags / description to a friendly product type.
  function productType(supplyLine) {
    const tags = (supplyLine.match(/\[([^\]]+)\]/g) || [])
      .map((t) => t.replace(/[\[\]]/g, "").trim());
    const blob = (tags.join(" ") + " " + supplyLine).toLowerCase();

    if (/stable\s*door/.test(blob)) return { type: "Stable Door", tags };
    if (/\bcas[\s.]*\d/.test(blob) || /casement/.test(blob)) return { type: "Casement", tags };
    if (/slat/.test(blob)) return { type: "Cladding Slats", tags };
    if (/shop/.test(blob)) return { type: "Shopfront", tags };
    if (/slid|patio|\bxo\b|\box\b/.test(blob)) return { type: "Sliding Door", tags };
    if (/fold|vistafold/.test(blob)) return { type: "Vistafold", tags };
    if (/top\s*hung/.test(blob)) return { type: "Top Hung", tags };
    if (/side\s*hung/.test(blob)) return { type: "Side Hung", tags };
    return { type: "", tags }; // unknown -> needs type
  }

  // ---- header --------------------------------------------------

  function parseHeader(text, lines) {
    const get = (re) => {
      const m = text.match(re);
      return m ? m[1].trim() : "";
    };

    // line following an exact-match label line
    const after = (label) => {
      const i = lines.findIndex((l) => l.trim() === label);
      if (i === -1) return "";
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim()) return lines[j].trim();
      }
      return "";
    };

    // all emails in the document; prefer the client's (not the supplier domain)
    const emails = (text.match(/[\w.\-]+@[\w.\-]+\.\w{2,}/g) || []);
    const email =
      emails.find((e) => !/anglowindows/i.test(e)) || emails[0] || "";

    // rep: "Jayson Hitge Tel: 0824133301"
    const repM = text.match(/([A-Z][a-zA-Z]+\s+[A-Z][a-zA-Z]+)\s+Tel:\s*(\d[\d\s]{6,})/);
    const rep = repM ? repM[1].trim() : "";
    const repTel = repM ? repM[2].replace(/\s+/g, "") : "";

    // client phone: prefer the number paired with the client email line
    let clientPhone = "";
    const emailLine = lines.find((l) => email && l.includes(email));
    if (emailLine) {
      const pm = emailLine.match(/(0\d[\d\s]{7,})/);
      if (pm) clientPhone = pm[1].replace(/\s+/g, "");
    }

    // job type / scope: the descriptive supply-scope line
    const jobType =
      (lines.find((l) => /supply\s*(and|&)?\s*(install|fit|only)/i.test(l)) || "")
        .trim();

    // site address: usually the line right after the scope line —
    // looks like a street address, isn't a bare phone number or email
    let address = "";
    const jtIdx = lines.findIndex((l) => l.trim() === jobType);
    if (jtIdx !== -1) {
      for (let j = jtIdx + 1; j < Math.min(lines.length, jtIdx + 4); j++) {
        const t = lines[j].trim();
        if (!t || /@/.test(t) || /^[\d\s+\-()]+$/.test(t)) continue;
        if (/thank you|colour note|quote|prepared/i.test(t)) break;
        if (/\d/.test(t) && /[A-Za-z]{2,}/.test(t)) { address = t; break; }
      }
    }

    // quote title/reference (e.g. "JH532611 D2161 MAIN HOUSE"); may arrive with
    // a leading "Your Ref:" / "To:" / "Attention" label merged onto the row.
    let quoteTitle =
      get(/\b([A-Z]{2}\d{3,}\b[^\n]*?D\d+[^\n]*)/) ||
      after("To:") ||
      after("Your Ref:");
    quoteTitle = quoteTitle
      .replace(/^(your ref:|attention|to:)\s*/i, "")
      .trim();

    // client: "Attention ANNEMIE BRUCE"
    let client = get(/Attention\s+([A-Z][^\n]+)/);
    client = client.replace(/\s+(your ref\b|to:).*$/i, "").trim();

    return {
      jobType,
      address,
      quoteRef: get(/Quote Ref:\s*(D\d{3,5})/i) || get(/\b(D\d{3,5})\b/),
      date: get(/\b(\d{4}-\d{2}-\d{2})\b/),
      quoteTitle,
      client,
      email,
      clientPhone,
      rep,
      repTel,
      preparedBy: "Anglo Windows Manufacturing (Pty) Ltd",
      colourNote: get(/COLOUR NOTE:\s*([^\n]+)/i),
      totalInclVat: get(/Total VAT Inclusive:\s*R?\s*([\d\s.,]+)/i).replace(/\s+/g, " ").trim(),
    };
  }

  // ---- line items ----------------------------------------------

  function parseLines(allLines) {
    // Clamp to the drawn-items region: everything before the totals /
    // terms-and-conditions / additional-items block. Prevents the final
    // line item's glass/colour scan from scooping up page-footer prose.
    const stopRe = /^(Total cost of drawn items|Add VAT|Total VAT Inclusive|Total:|We require full payment|Addition(al)? Items|CUSTOMER ACCEPTANCE)/i;
    let stop = allLines.findIndex((l) => stopRe.test(l.trim()));
    if (stop === -1) stop = allLines.length;
    const lines = allLines.slice(0, stop);

    // anchor on every "Supply and Fit:" occurrence
    const anchors = [];
    lines.forEach((l, i) => {
      if (/Supply and Fit:/i.test(l)) anchors.push(i);
    });

    // a Bizman "table row" header: "<CODE> <QTY> Set R <unit> R <total>"
    // (sometimes the code sits on the line above, with qty+prices below)
    const rowRe = /^(.*?\S)\s+(\d{1,3})\s+(?:Set|Sets|No|Each|Unit|Lot)\b.*R/i;
    const qtyOnlyRe = /^(\d{1,3})\s+(?:Set|Sets|No|Each|Unit|Lot)\b.*R/i;

    // nearest meaningful line above `from` (skips junk / money / blank /
    // qty-price rows) — used to recover a code that sits on its own line.
    function codeAbove(from) {
      for (let j = from; j >= 0; j--) {
        const t = lines[j].trim();
        if (!t || isJunk(t) || isMoney(t)) continue;
        if (qtyOnlyRe.test(t) || rowRe.test(t)) continue;
        if (/Supply and Fit:/i.test(t)) continue;
        return t;
      }
      return "";
    }

    const items = [];
    anchors.forEach((idx, n) => {
      const supplyLine = lines[idx];
      const prev = (lines[idx - 1] || "").trim();

      // ---- item code (ref/location) + qty -------------------------
      let location = "";
      let qty = null;

      let m = prev.match(rowRe);
      if (m) {
        location = m[1].trim();
        qty = parseInt(m[2], 10);
      } else if ((m = prev.match(qtyOnlyRe))) {
        qty = parseInt(m[1], 10);
        location = codeAbove(idx - 2);
      } else {
        location = codeAbove(idx - 1);
      }

      // block end = next anchor (or end of region)
      const end = n + 1 < anchors.length ? anchors[n + 1] : lines.length;

      // fallback qty: a standalone integer line before the prices
      if (qty == null) {
        for (let j = idx + 1; j < end; j++) {
          if (isQty(lines[j])) { qty = parseInt(lines[j].trim(), 10); break; }
          if (isMoney(lines[j])) break;
        }
      }
      if (qty == null) qty = 1;

      // ---- size + product ----------------------------------------
      const sizeM = supplyLine.match(/Overall size:\s*(\d+)\s*[xX×]\s*(\d+)/);
      const quoteWidth = sizeM ? parseInt(sizeM[1], 10) : null;
      const quoteHeight = sizeM ? parseInt(sizeM[2], 10) : null;

      let { type, tags } = productType(supplyLine);
      // light inference when the quote carries no recognisable product tag,
      // so fewer rows land as "Needs type". Rep can still change it.
      if (!type) {
        const ref = (location || "").toUpperCase();
        if (/^D\d|DOOR/.test(ref) || (quoteHeight && quoteHeight >= 1900)) {
          type = "Door (confirm type)";
        } else if (/^W\d/.test(ref)) {
          type = "Window (confirm type)";
        }
      }

      // ---- glass + colour ----------------------------------------
      // glass specs sit between the supply line and the colour/Windload row.
      const glass = [];
      let colour = "";
      for (let j = idx + 1; j < end; j++) {
        const t = lines[j].trim();
        if (!t || isJunk(t) || isMoney(t)) continue;
        if (/Windload|View from Outside/i.test(t)) {
          // colour is the leading token(s) on this row, before "Windload"
          const c = t.split(/Windload/i)[0].trim();
          if (c) colour = c;
          break; // colour row ends this item's spec block
        }
        if (/(mm|glass|float|laminat|safety|obs|clad|slat|spandrel|panel)/i.test(t)) {
          glass.push(t);
        }
      }
      if (!colour) {
        // fallback: a known colour word anywhere in the block
        for (let j = idx + 1; j < end; j++) {
          const up = lines[j].trim().toUpperCase();
          const hit = COLOURS.find((c) => up.startsWith(c));
          if (hit) { colour = lines[j].trim().split(/\s{2,}|Windload/i)[0].trim(); break; }
        }
      }

      const quoteSize =
        quoteWidth && quoteHeight ? `${quoteWidth} × ${quoteHeight}` : "";

      items.push({
        ref: location || `Line ${n + 1}`,
        location: location || "",
        product: type,
        productTags: tags,
        rawDescription: supplyLine.replace(/\s+/g, " ").trim(),
        // quote size = reference only (read-only); NOT the final RC size
        quoteWidth,
        quoteHeight,
        quoteSize,
        // final RC size: left blank until the rep measures on site
        width: null,
        height: null,
        size: "",
        qty,
        glass: glass.join(" + "),
        colour: colour || "",
        sizeConfirmed: false, // <-- gate: rep must enter & confirm final size
      });
    });

    return items;
  }

  // ---- public --------------------------------------------------

  function parseQuote(rawText) {
    const lines = String(rawText)
      .split(/\r?\n/)
      .map((l) => l.replace(/ /g, " ").replace(/[ \t]+$/g, ""))
      .filter((l) => l.trim().length > 0);

    return {
      job: parseHeader(rawText, lines),
      lines: parseLines(lines),
    };
  }

  const api = { parseQuote, productType, parseHeader, parseLines };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.QuoteParser = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
