# Bloomé Guide Package 32.1 — Ear Map 3D Shortcut

Package 32.1 adds View in 3D directly to the selected-point panel on the interactive ear map. It appears only for approved 3D locations, while Open full point guide remains available as a secondary action.

See `docs/package-history/PACKAGE_32_1_EAR_MAP_3D_SHORTCUT.md` for details.

---

# Bloomé Guide Package 32 — View in 3D Integration

Package 32 adds targeted View in 3D links to the approved point and area pages while preserving the Package 31.2 guide and its 2D-first experience. See `docs/package-history/PACKAGE_32_VIEW_IN_3D_INTEGRATION.md` for the full integration notes.

---

# Bloome Package 19.2 – Occiput Placement Correction

This patch is a focused hotfix based on your feedback.

## What was corrected
- Re-audited the visible ear-map placement for the **Occiput** point.
- Moved **Occiput** from the previous incorrect antitragus/concha-adjacent position.
- Updated it to better match:
  **posterior part of the lateral surface of the antitragus**
- Updated both:
  - `js/app.js`
  - `data/acupoints.json`
- Refined the Occiput location text for consistency.

## Files included
- `index.html`
- `css/`
- `js/`
- `data/`
- `images/`

## Recommended commit summary
Package 19.2 – occiput placement correction
