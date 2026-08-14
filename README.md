# Bloomé Guide Package 32.5.4 — Direct 3D Attribute Fix

Package 32.5.4 fixes the confirmed first-click failure by reading and updating `data-open-3d-location` directly with `getAttribute` and `setAttribute`. It no longer relies on browser `dataset` conversion for a name containing `3d`.

- Opens the native 3D overlay from the initial View in 3D click.
- Covers the ear map, full point guide, concern routines, and guided application.
- Preserves the frozen Beta 1B.10 coordinates and Ear 1 geometry.

# Bloomé Guide Package 32.5.3 — Standardized 3D Button Fix

Package 32.5.3 corrects the confirmed first-use failure by using one valid `data-open-3d-location` attribute and its matching `dataset.open3dLocation` property across every 3D entry point.

- Fixes the first View in 3D activation without requiring a point change.
- Covers the ear map, full point guide, concern routines, and guided application.
- Preserves the frozen Beta 1B.10 coordinates and Ear 1 geometry.

# Bloomé Guide Package 32.5.1 — First-Tap 3D Fix

Package 32.5.1 ensures the native viewer opens on the first View in 3D tap from the ear map, concern routine, or guided application.

See `docs/package-history/PACKAGE_32_5_1_FIRST_TAP_3D_FIX.md` for details.

---

# Bloomé Guide Package 32.5 — 3D Location Guidance

Package 32.5 displays the selected point's actual location guidance directly beneath its name in the native 3D viewer.

See `docs/package-history/PACKAGE_32_5_3D_LOCATION_GUIDANCE.md` for details.

---

# Bloomé Guide Package 32.4.1 — Material Load Fix

Package 32.4.1 fixes the persistent Preparing the 3D ear message while retaining the warm editorial makeover.

See `docs/package-history/PACKAGE_32_4_1_MATERIAL_LOAD_FIX.md` for details.

---

# Bloomé Guide Package 32.4 — Editorial Ear Makeover

Package 32.4 gives the native 3D ear a warmer, softer and more human editorial presentation while preserving its exact geometry and coordinates.

See `docs/package-history/PACKAGE_32_4_EDITORIAL_EAR_MAKEOVER.md` for details.

---

# Bloomé Guide Package 32.3 — Routine 3D Integration

Package 32.3 adds the native 3D placement view to concern routines and supported guided-application steps.

See `docs/package-history/PACKAGE_32_3_ROUTINE_3D_INTEGRATION.md` for details.

---

# Bloomé Guide Package 32.2 — Native In-Site 3D Viewer

Package 32.2 opens the approved 3D ear in a native Bloomé overlay inside the main guide. Customers no longer leave the website or see the separate sandbox.

See `docs/package-history/PACKAGE_32_2_NATIVE_3D_OVERLAY.md` for details.

---

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
## Package 32.5.2

- Opens the native 3D overlay on the first completed mouse or touch tap.
- Keeps a keyboard-click fallback and prevents the same interaction from opening twice.
- Preserves the frozen Beta 1B.10 coordinates and Ear 1 geometry.
