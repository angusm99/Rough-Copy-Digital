# Bizman Master Price List Analysis
## 305MM CASEMENT - TOP AND SIDE HUNG

**Source:** MASTER PRICE LIST-305MM CASEMENT-TOP AND SIDE HUNG.pdf  
**Date Generated:** 2026-05-22  
**Quote Reference:** C1505 (dated 2023-05-25)  
**Prepared by:** Anglo Estimating Dept, Anglo Windows (PTY) LTD  
**Pages:** 8 total pages of pricing data

---

## 1. Document Structure

**Header Information:**
- To: Pricelist
- Your Ref: Cas 30.5 Master
- Attention: Angus
- Quote Ref: C1505
- Date: 2023-05-25
- Email: reception@anglowindows.co.za

---

## 2. Product Line: 305MM CASEMENT WINDOWS

### Key Specifications (Consistent Across All Items)
- **Frame Type:** 70mm Outer Frame-30.5mm Case
- **Case Depth:** 30.5mm (305MM product line)
- **Window Type:** Casement (TOP HUNG and SIDE HUNG variants)
- **Pressure Rating:** 1000 Pa (standard)
- **Glass Standard:** 01-CLEAR (unless otherwise specified)

---

## 3. Section 1: SASH (TOP HUNG WINDOWS)

### Color/Finish: CHARCOAL

**Standard Size Grid (TOP HUNG Configuration):**

| Product Code | Width | Height | Overall Size | Frame Type | Glass | Pressure | Unit Price | Currency |
|---|---|---|---|---|---|---|---|---|
| PTD606 | 590 | 590 | 590×590 | 70mm/30.5mm | CLEAR | 1000 Pa | R1,142.65 | ZAR |
| PTD609 | 590 | 890 | 590×890 | 70mm/30.5mm | CLEAR | 1000 Pa | R1,512.79 | ZAR |
| PTD612 | 590 | 1130 | 590×1130 | 70mm/30.5mm | CLEAR | 1000 Pa | R1,727.39 | ZAR |
| PTD912 | 890 | 1130 | 890×1130 | 70mm/30.5mm | CLEAR | 1000 Pa | R2,266.56 | ZAR |
| PTI112 | 1180 | 1130 | 1180×1130 | 70mm/30.5mm | CLEAR | 1000 Pa | R2,689.32 | ZAR |
| PTI106 | 1780 | 590 | 1780×590 | 70mm/30.5mm | CLEAR | 1000 Pa | R2,286.00 | ZAR |

**Pricing Pattern Analysis:**
- Base unit price based on width × height square footage
- Larger units cost more (PTI112 at 1180×1130 = R2,689)
- Narrow tall units (PTD612: 590×1130) = R1,727
- Wide shallow units (PTI106: 1780×590) = R2,286 (similar height to base)

---

## 4. Product Code Nomenclature

**Format:** PT[type][width code][height code]

**Width Codes:**
- D = 590mm
- 9 = 890mm
- I = 1180mm (or 1000+)
- I (extended) = 1780mm

**Height Codes:**
- 6 = 590mm
- 9 = 890mm
- 2 = 1130mm (1100+)

**Examples:**
- PTD606 = 590 × 590
- PTD912 = 890 × 1130
- PTI106 = 1780 × 590

---

## 5. Available Dimensions (Extracted from Page 1)

### Width Options:
- 590mm (common base width)
- 890mm (1.5× base)
- 1180mm (2× base)
- 1780mm (3× base)

### Height Options:
- 590mm (base)
- 890mm (1.5× base)
- 1130mm (1.9× base, possibly 1100mm + frame)

### Total Combinations Visible:
- 590 × 590 ✓
- 590 × 890 ✓
- 590 × 1130 ✓
- 890 × 1130 ✓
- 1180 × 1130 ✓
- 1780 × 590 ✓

**Expected (from pattern):**
- 890 × 590 (likely available)
- 1180 × 590 (likely available)
- 1180 × 890 (likely available)
- 1780 × 890 (likely available)
- 1780 × 1130 (likely available)

---

## 6. Glass Options

**Documented from Page 1:**
- **01-CLEAR** (standard, mentioned on all visible items)

**Expected Options (typical for Anglo Windows):**
- CLEAR (01-CLEAR)
- BRONZE (heat-resistant tint)
- FROSTED (privacy/textured)
- TINTED (other tints)
- SAFETY (tempered, for doors/low windows)
- LAMINATED (soundproofing)
- DOUBLE-GLAZED variants (if applicable to 305MM line)

---

## 7. Color/Finish Options

**Documented from Page 1:**
- **CHARCOAL** (gray finish)

**Expected Options (typical for casement windows):**
- WHITE (standard)
- CHARCOAL (gray)
- BRONZE (warm tone)
- TIMBER (wood grain effect, if available)
- COLOURS (custom color options possible)

---

## 8. Configurations Not Visible on Page 1 (Remaining Pages 2-8)

**Likely to contain:**
- SIDE HUNG variants (title mentions "TOP AND SIDE HUNG")
- Additional color finishes
- Additional glass types (FROSTED, BRONZE, TINTED, SAFETY)
- Additional sizes/combinations
- MULTI-PANE configurations
- CASEMENT + FIXED combinations
- TRANSOM windows
- SPECIAL CONFIGURATIONS

---

## 9. Pricing Structure Observations

**Unit Price Calculation Pattern:**
- PTD606 (590×590 = 0.3481 m²): R1,142.65 → ~R3,282/m²
- PTD609 (590×890 = 0.5251 m²): R1,512.79 → ~R2,880/m²
- PTD612 (590×1130 = 0.6667 m²): R1,727.39 → ~R2,591/m²
- PTD912 (890×1130 = 1.0067 m²): R2,266.56 → ~2,252/m²
- PTI112 (1180×1130 = 1.3334 m²): R2,689.32 → ~2,017/m²
- PTI106 (1780×590 = 1.0502 m²): R2,286.00 → ~2,176/m²

**Observation:** Price per square meter decreases with larger units (economy of scale). Pricing is not purely linear with area.

---

## 10. Integration with Rough Copy Digital

### For WB_PRESETS Object:
Each configuration should include:
```javascript
{
  label: "590×590 Charcoal Clear TOP HUNG",
  code: "PTD606",
  width: 590,
  height: 590,
  type: "CASEMENT",
  direction: "TOP HUNG",
  glass: "CLEAR",
  color: "CHARCOAL",
  price: 1142.65,
  currency: "ZAR"
}
```

### For PRODS Object:
Organize by:
- Product type (CASEMENT)
- Configuration (TOP HUNG, SIDE HUNG)
- Color (CHARCOAL, WHITE, etc.)
- Glass type (CLEAR, FROSTED, SAFETY, etc.)

---

## 11. Remaining Analysis Tasks

**Pages 2-8 likely contain:**
1. [ ] All SIDE HUNG configurations
2. [ ] FROSTED glass variants
3. [ ] BRONZE glass variants
4. [ ] SAFETY glass (doors)
5. [ ] Additional sizes/combinations
6. [ ] Pricing for all variants
7. [ ] Special configurations (multi-pane, transom, etc.)
8. [ ] Additional color options
9. [ ] Volume discounts (if any)
10. [ ] Lead times or availability notes

---

## 12. Next Steps

1. **Extract Pages 2-8** to get full option matrix
2. **Consolidate all configurations** into master preset library
3. **Build WB_PRESETS** array with all ~90 common units
4. **Test with rough copy samples** to ensure coverage
5. **Create fallback "builder" mode** for edge cases not in presets

---

## Notes for Development

- **Product naming convention:** P[T/I][code][code] is consistent and can be parsed
- **Price currency:** ZAR (South African Rand) - used in Rough Copy Digital quotes
- **Standard frame:** 70mm outer, 30.5mm case depth (fixed for 305MM line)
- **Default glass:** 01-CLEAR (most common)
- **Pressure rating:** 1000 Pa (standard; check if other ratings exist)
- **Regional context:** Quote from Anglo Windows (South Africa), typical for market served

---

*Document prepared for populating Rough Copy Digital window picker preset library*
*Based on: MASTER PRICE LIST-305MM CASEMENT-TOP AND SIDE HUNG.pdf (C1505, 2023-05-25)*
