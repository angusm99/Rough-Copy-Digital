"""Check the delivered one-page print artifact after regenerating it in Chrome."""
from pathlib import Path
import fitz

root = Path(__file__).resolve().parents[1]
with fitz.open(root / "output/pdf/Anglo-Windows-Rough-Copy-v1.5.pdf") as doc:
    assert len(doc) == 1, "Field copy must fit one page"
    page = doc[0]
    assert abs(page.rect.width - 595.28) < 2 and abs(page.rect.height - 841.89) < 2
    text = page.get_text()
    assert text.count("Final W:") == 16, "All 16 bottom label strips must print"
    for number in range(1, 17):
        assert f"{number:02} Ref:" in text, f"Missing top strip {number}"
    for label in ("WP REF:", "Rep Signature:", "RC-FIELD 1.5", "Always viewed from outside", "All dimensions in millimetres", "Special Notes", "New House", "New Enclosure", "ALU Bar", "CLR Bar", "Empty = N/A", "Ex Wood", "Ex Steel", "Ex Aluminium"):
        assert label in text, f"Missing {label}"
    assert text.index("Existing Opening") < text.index("Building") < text.index("Wall") < text.index("Finish")
    for old_label in ("X wood", "X steel", "X aluminium", "Always seen"):
        assert old_label not in text, f"Old wording remains: {old_label}"
    assert "B-bar colour" not in text
    assert page.get_images(), "Official logo must print"
print("PASS: one A4 page, 16 top/bottom strips, job refs, footer and logo")
