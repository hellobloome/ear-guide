Package 20.6 - Master Coordinate Implementation

Base: Package 20.5 - Full Point Placement Audit

What was done:
- Implemented a unified 30-point coordinate set as the new source of truth.
- Updated the main mapPositions object in js/app.js.
- Synced the same mapPosition values into data/acupoints.json.
- Kept the stable coordinate architecture from Package 20.2 so markers stay anchored to the ear image.

Focus of this patch:
- Move from audit stage into a consistent implementation stage.
- Keep desktop/mobile and EN/BM using one shared coordinate system.
- Provide a cleaner baseline for the next QA pass and any final micro-adjustments.

Suggested GitHub Desktop summary:
Package 20.6 - Master Coordinate Implementation
