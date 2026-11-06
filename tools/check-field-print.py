"""Check the delivered one-page print artifact after regenerating it in Chrome."""
from pathlib import Path
import sys
import fitz

root = Path(__file__).resolve().parents[1]
three_columns = "--3x4" in sys.argv
block_count = 12 if "--12" in sys.argv or three_columns else 16
pdf_name = "Anglo-Windows-Rough-Copy-v2.3-12-blocks.pdf" if block_count == 12 else "Anglo-Windows-Rough-Copy-v2.2.pdf"
if three_columns:
    pdf_name = "Anglo-Windows-Rough-Copy-v2.4-3x4.pdf"
with fitz.open(root / "output/pdf" / pdf_name) as doc:
    assert len(doc) == 1, "Field copy must fit one page"
    page = doc[0]
    assert abs(page.rect.width - 595.28) < 2 and abs(page.rect.height - 841.89) < 2
    text = page.get_text()
    for label in ("Ref:", "W:", "H:", "Qty:"):
        assert text.count(label) == block_count, f"Missing drawing labels: {label}"
    if three_columns:
        refs = [fitz.Rect(w[:4]) for w in page.get_text("words") if w[4] == "Ref:"]
        assert len({round(r.x0) for r in refs}) == 3, "Expected three columns"
        assert len({round(r.y0) for r in refs}) == 4, "Expected four rows"
    for label in ("WP REF:", "Page", "Always viewed from outside", "All dimensions in millimetres", "Special Notes", "New Hole", "Enclosure", "Burglar Bars", "Special Work", "No Wrap", "Flats & Angles", "Ex Wood", "Ex Steel", "Ex Aluminium"):
        assert label in text, f"Missing {label}"
    normalised = " ".join(text.split())
    assert normalised.index("Finish") < normalised.index("Existing Opening") < normalised.index("Building") < normalised.index("Wall")
    assert text.count("Always viewed from outside") == 1
    for old_label in ("Room:", "Final W:", "Check:", "DRAFT", "Rep Signature", "Texture", "Job Type:", "Tick = Yes", "match the job colour"):
        assert old_label not in text, f"Old wording remains: {old_label}"
    assert "B-bar colour" not in text
    assert page.get_images(), "Official logo must print"
    spans = [span for block in page.get_text("dict")["blocks"] if "lines" in block
             for line in block["lines"] for span in line["spans"]]
    ref_spans = [s for s in spans if s["text"].strip() == "Ref:"]
    assert len(ref_spans) == block_count
    assert all(s["size"] >= 7.8 and s["flags"] & 16 and s["color"] == 0 for s in ref_spans), "Ref labels must be larger, bold black"
    # Match whole words, not substrings in the header or site selections.
    words = page.get_text("words")
    mark_words = {label: [w for w in words if w[4] == label] for label in ("IN", "OUT", "LH", "RH")}
    assert all(len(found) == 1 for found in mark_words.values()), "Trial markers must appear once only"
    first_ref = page.search_for("Ref:")[0]
    first_width = page.search_for("W:")[0]
    for found in mark_words.values():
        x0, y0, x1, y1 = found[0][:4]
        assert first_ref.y1 < y0 < y1 < first_width.y0
        assert x1 < page.rect.width / (3 if three_columns else 4) + 10, "Markers must stay in first drawing"
print(f"PASS: one A4 page, {block_count} simplified drawing blocks, finish first, page field and logo")
