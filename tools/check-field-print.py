"""Check the delivered one-page print artifact after regenerating it in Chrome."""
from pathlib import Path
import fitz

root = Path(__file__).resolve().parents[1]
with fitz.open(root / "output/pdf/Anglo-Windows-Rough-Copy-v1.4.pdf") as doc:
    assert len(doc) == 1, "Field copy must fit one page"
    page = doc[0]
    assert abs(page.rect.width - 595.28) < 2 and abs(page.rect.height - 841.89) < 2
    text = page.get_text()
    assert text.count("Final W:") == 16, "All 16 bottom label strips must print"
    for number in range(1, 17):
        assert f"{number:02} Ref:" in text, f"Missing top strip {number}"
    for label in ("WP REF:", "Rep signature:", "RC-FIELD 1.4", "Always seen from outside", "All dimensions in millimetres", "Special notes", "New house", "New enclosure", "ALU bar", "CLR bar", "Empty = N/A"):
        assert label in text, f"Missing {label}"
    assert text.index("Existing opening") < text.index("Building") < text.index("Wall") < text.index("Finish")
    assert "B-bar colour" not in text
    assert page.get_images(), "Official logo must print"
print("PASS: one A4 page, 16 top/bottom strips, job refs, footer and logo")
