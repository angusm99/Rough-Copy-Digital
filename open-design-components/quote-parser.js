/* ============================================================
   Anglo Windows — Bizman Quotation Parser
   Parses text extracted from a Bizman 6.3.x "Supply and Fit"
   quotation PDF into structured job + line data for the
   Digital Rough Copy.

   Handles both observed layout variants:
   - 6.3.2p (e.g. D2161): one-line item descriptions, colour
     merged into the "WHITE Windload … View from Outside" row
   - 6.3.2d (e.g. C8549): descriptions wrap across lines so
     "Overall size:" lands on its own line, SPECIAL powder-coat
     colour rows ("SPECIAL C3|CPO 47032 PEBBLE GREY-NON TEX"),
     DOORS/WINDOWS section headers, C-prefix quote refs

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
    /^Item\s*\/\s*Description/i,
    /^QTY\s+Units$/i,
    /^Windload:/i,
    /^View from Outside$/i,
    /^Set$/i,
    /^DOORS$/i,
    /^WINDOWS$/i,
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

  // A spec row naming the unit colour. Standard names, or special
  // powder-coat rows like "SPECIAL C3|CPO 47032 PEBBLE GREY-NON TEX".
  function isColourLine(line) {
    const t = line.trim();
    if (/^SPECIAL\b/i.test(t)) return true;
    if (/\b(CPO|RAL)\s*\d/i.test(t)) return true;
    const up = t.toUpperCase();
    return COLOURS.some((c) => up === c || up.startsWith(c + " "));
  }

  // Map bracketed product tags / description to a friendly product type.
  function productType(desc) {
    const tags = (desc.match(/\[([^\]]+)\]/g) || [])
      .map((t) => t.replace(/[\[\]]/g, "").trim());
    const blob = (tags.join(" ") + " " + desc).toLowerCase();

    if (/stable\s*door/.test(blob)) return { type: "Stable Door", tags };
    if (/boabab|baobab/.test(blob)) return { type: "Boabab-40 Window", tags };
    if (/double\s*hinged/.test(blob)) return { type: "Hinged Double Door", tags };
    if (/single\s*hinged|hinged\s*door/.test(blob)) return { type: "Hinged Door", tags };
    if (/palace/.test(blob)) {
      if (/oxxo/.test(blob)) return { type: "Palace Sliding OXXO (4 panel)", tags };
      if (/\boxx\b/.test(blob)) return { type: "Palace Sliding OXX (3 panel)", tags };
      if (/\b(ox|xo)\b/.test(blob)) return { type: "Palace Sliding OX (2 panel)", tags };
      return { type: "Palace Sliding", tags };
    }
    if (/vistafold|fold/.test(blob)) return { type: "Vistafold", tags };
    if (/\bcas[\s.]*\d/.test(blob) || /casement/.test(blob)) return { type: "Casement", tags };
    if (/slat/.test(blob)) return { type: "Cladding Slats", tags };
    if (/shop/.test(blob)) return { type: "Shopfront", tags };
    if (/slid|patio|\bxo\b|\box\b|\boxxo\b/.test(blob)) return { type: "Sliding Door", tags };
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

    // header region = everything before the salutation line
    let headerEnd = lines.findIndex((l) => /thank you for the opportunity/i.test(l));
    if (headerEnd === -1) headerEnd = Math.min(lines.length, 40);
    const header = lines.slice(0, headerEnd);

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

    // rep: "Jayson Hitge Tel: 0824133301" / "Anglo Estimating Dept. Tel: 0219828477"
    let rep = "", repTel = "";
    for (const m of text.matchAll(/([A-Z][A-Za-z.&-]+(?:[^\S\n]+[A-Z][A-Za-z.&-]+){1,3})[^\S\n]+Tel:\s*(\d[\d\s]{6,}?)(?=\s|$)/g)) {
      if (/fax|e-?mail/i.test(m[1])) continue;
      rep = m[1].trim();
      repTel = m[2].replace(/\s+/g, "");
      break;
    }

    // client phone: prefer the number paired with the client email line
    let clientPhone = "";
    const emailLine = lines.find((l) => email && l.includes(email));
    if (emailLine) {
      const pm = emailLine.match(/(0\d[\d\s]{7,})/);
      if (pm) clientPhone = pm[1].replace(/\s+/g, "");
    }

    // quote ref: labeled ("Quote Ref: C8549"), footer ("Quote: C8549"),
    // or — in PyMuPDF text order — the line right before the label
    let quoteRef =
      get(/Quote Ref:\s*([A-Z]{1,3}\d{3,6})\b/i) ||
      get(/^Quote:\s*([A-Z]{1,3}\d{3,6})\b/im);
    if (!quoteRef) {
      const li = lines.findIndex((l) => /^Quote Ref:/i.test(l.trim()));
      if (li > 0) {
        const m = lines[li - 1].trim().match(/^([A-Z]{1,3}\d{3,6})$/);
        if (m) quoteRef = m[1];
      }
    }

    // job type / scope: header-region line describing the work —
    // "EX WOOD TO WHITE ALU SUPPLY AND INSTALL" or "- EX NEW TO PEBBLE GREY - …"
    let jobType = "";
    for (const l of header) {
      const t = l.trim();
      if (/Supply and Fit:/i.test(t)) continue;
      if (/supply\s*(and|&)?\s*(install|fit|only)/i.test(t) || /\bEX\s+\w+.*\bTO\s+/i.test(t)) {
        jobType = t.replace(/^[-•\s]+/, "").trim();
        break;
      }
    }

    // header spec bullets ("- HINGED DOORS INCLUDE PARLIAMENT HINGES" …)
    const headerNotes = header
      .map((l) => l.trim())
      .filter((t) => /^[-•]\s*\S/.test(t))
      .map((t) => t.replace(/^[-•\s]+/, "").trim())
      .filter((t) => t && t !== jobType);

    // site address: header-region line near the scope line that looks like
    // a street address (digits + words, not a phone, email, or size)
    let address = "";
    const jtIdx = jobType ? header.findIndex((l) => l.includes(jobType)) : -1;
    if (jtIdx !== -1) {
      for (let j = jtIdx + 1; j < Math.min(header.length, jtIdx + 4); j++) {
        const t = header[j].trim();
        if (!t || /@/.test(t) || /^[\d\s+\-()]+$/.test(t)) continue;
        if (/overall\s*size|thank you|colour note|quote|prepared|tel:|fax:/i.test(t)) continue;
        if (/^[-•]/.test(t)) continue; // spec bullet, not an address
        if (/\d/.test(t) && /[A-Za-z]{2,}/.test(t)) { address = t; break; }
      }
    }

    // client: "Attention Gail" — a fuller name ("Gail & Cecile") often sits
    // elsewhere in the header (above or below, depending on text layout)
    let client = get(/Attention\s+([A-Z][^\n]*)/);
    client = client.replace(/\s+(your ref\b|to:).*$/i, "").trim();
    if (client) {
      for (const l of header) {
        const t = l.trim();
        if (!t || t.length <= client.length || t.length > 60) continue;
        if (/@/.test(t) || /^[-•]/.test(t)) continue;
        if (/^(your ref|to:|attention|quote|date|prepared|tel|fax|e-?mail)/i.test(t)) continue;
        if (/overall|supply|ref:|\(pty\)/i.test(t)) continue;
        if (t.toUpperCase().startsWith(client.toUpperCase() + " ") ||
            t.toUpperCase().startsWith(client.toUpperCase() + " &") ||
            (t.toUpperCase().includes(client.toUpperCase()) && /&/.test(t))) {
          client = t;
          break;
        }
      }
    }

    // quote title/reference (e.g. "JH532611 D2161 MAIN HOUSE")
    let quoteTitle =
      after("To:") ||
      get(/\b([A-Z]{2,}[A-Z0-9]*\d{3,}\b[^\n]*?\([A-Z]?\d+\)[^\n]*)/) ||
      get(/\b([A-Z]{2}\d{3,}\b[^\n]*?D\d+[^\n]*)/) ||
      after("Your Ref:");
    quoteTitle = quoteTitle
      .replace(/^(your ref:|attention|to:)\s*/i, "")
      .trim();

    return {
      jobType,
      headerNotes,
      address,
      quoteRef,
      date: get(/Date:\s*\n?\s*(\d{4}-\d{2}-\d{2})/i) || get(/\b(\d{4}-\d{2}-\d{2})\b/),
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
    // terms-and-conditions / additional-items block.
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

    // nearest meaningful line above `from` — recovers a code on its own line
    function codeAbove(from) {
      for (let j = from; j >= 0; j--) {
        const t = lines[j].trim();
        if (!t || isJunk(t) || isMoney(t)) continue;
        if (qtyOnlyRe.test(t) || rowRe.test(t)) continue;
        if (/Supply and Fit:|Overall\s*size:/i.test(t)) continue;
        return t;
      }
      return "";
    }

    const items = [];
    anchors.forEach((idx, n) => {
      const supplyLine = lines[idx];
      const prev = (lines[idx - 1] || "").trim();

      // block end = next anchor (or end of region). The next item's code /
      // qty-price rows sit just above the next anchor; the block-level
      // regexes below are immune to them.
      const end = n + 1 < anchors.length ? anchors[n + 1] : lines.length;
      const blockLines = lines.slice(idx, end);
      const blockText = blockLines.join("\n");

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

      // fallback qty: a standalone integer line inside the block, or a
      // qty-price row inside the block (wrapped-description layout)
      if (qty == null) {
        for (let j = 1; j < blockLines.length; j++) {
          const t = blockLines[j].trim();
          if (isQty(t)) { qty = parseInt(t, 10); break; }
          const qm = t.match(qtyOnlyRe);
          if (qm) { qty = parseInt(qm[1], 10); break; }
          if (isMoney(t)) break;
        }
      }
      if (qty == null) qty = 1;

      // ---- size: block-level so wrapped "Overall \n size:" works ----
      const sizeM = blockText.replace(/\n/g, " ").match(/Overall\s*size:\s*(\d+)\s*[xX×]\s*(\d+)/);
      const quoteWidth = sizeM ? parseInt(sizeM[1], 10) : null;
      const quoteHeight = sizeM ? parseInt(sizeM[2], 10) : null;

      // ---- description: "Supply and Fit:" up to "Overall size:" -----
      const descM = blockText.replace(/\n/g, " ")
        .match(/Supply and Fit:\s*(.*?)\s*(?:TOP|BOTTOM)?\s*Overall\s*size:/i);
      const desc = (descM ? descM[1] : supplyLine.replace(/.*Supply and Fit:\s*/i, ""))
        .replace(/\s+/g, " ").trim();

      let { type, tags } = productType(desc);
      // light inference when no recognisable product tag
      if (!type) {
        const ref = (location || "").toUpperCase();
        if (/^D\d|DOOR/.test(ref) || (quoteHeight && quoteHeight >= 1900)) {
          type = "Door (confirm type)";
        } else if (/^W\d/.test(ref)) {
          type = "Window (confirm type)";
        }
      }

      // ---- colour + glass ------------------------------------------
      let colour = "";
      const glass = [];
      for (let j = 1; j < blockLines.length; j++) {
        const t = blockLines[j].trim();
        if (!t || isMoney(t) || isQty(t)) continue;
        if (/Supply and Fit:|Overall\s*size:/i.test(t)) continue;
        // colour merged into the Windload row ("WHITE Windload: 1000 Pa …")
        if (/Windload/i.test(t)) {
          const c = t.split(/Windload/i)[0].trim();
          if (c && !colour && isColourLine(c)) colour = c;
          continue;
        }
        if (isJunk(t)) continue;
        if (!colour && isColourLine(t)) { colour = t; continue; }
        if (/(mm|glass|float|laminat|safety|obs|clad|slat|spandrel|panel)/i.test(t)) {
          glass.push(t);
        }
      }

      const quoteSize =
        quoteWidth && quoteHeight ? `${quoteWidth} × ${quoteHeight}` : "";

      items.push({
        ref: location || `Line ${n + 1}`,
        location: location || "",
        product: type,
        productTags: tags,
        rawDescription: desc,
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
      .map((l) => l.replace(/ /g, " ").replace(/[ \t]+$/g, ""))
      .filter((l) => l.trim().length > 0);

    return {
      job: parseHeader(rawText, lines),
      lines: parseLines(lines),
    };
  }

  const api = { parseQuote, productType, parseHeader, parseLines, isColourLine };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.QuoteParser = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
