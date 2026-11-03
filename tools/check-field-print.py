"""Check the delivered one-page print artifact after regenerating it in Chrome."""
from pathlib import Path
import fitz

root = Path(__file__).resolve().parents[1]
with fitz.open(root / "output/pdf/Anglo-Windows-Rough-Copy-v1.7.pdf") as doc:
    assert len(doc) == 1, "Field copy must fit one page"
    page = doc[0]
    assert abs(page.rect.width - 595.28) < 2 and abs(page.rect.height - 841.89) < 2
    text = page.get_text()
    for label in ("Ref:", "Width:", "Height:", "Qty:"):
        assert text.count(label) == 16, f"Missing drawing labels: {label}"
    for label in ("WP REF:", "Page", "RCX", "Always viewed from outside", "All dimensions in millimetres", "Special Notes", "New House", "New Enclosure", "Burglar Bars", "Special Work", "No Wrap", "Flats & Angles", "Ex Wood", "Ex Steel", "Ex Aluminium"):
        assert label in text, f"Missing {label}"
    assert text.index("Finish") < text.index("Existing Opening") < text.index("Building") < text.index("Wall")
    assert text.count("Always viewed from outside") == 1
    for old_label in ("Room:", "Final W:", "Check:", "DRAFT", "Rep Signature", "Texture", "Job Type:", "Tick = Yes", "match the job colour"):
        assert old_label not in text, f"Old wording remains: {old_label}"
    assert "B-bar colour" not in text
    assert page.get_images(), "Official logo must print"
print("PASS: one A4 page, 16 simplified drawing blocks, finish first, page field and logo")
