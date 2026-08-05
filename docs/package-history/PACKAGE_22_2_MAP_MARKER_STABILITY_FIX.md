# Package 22.2 — Map Marker Stability Fix

Base: Package 22.1.

## Bug
On the Full Ear Map, marker positions appeared to move when selecting different points.

## Root cause
The map and the selected-point information panel shared a stretched CSS grid row.
Different points have different amounts of text and related-guide content, so the
right panel changed height. That stretched the left map stage.

The ear artwork itself retained its own aspect ratio, while marker coordinates
were percentage-based against the stretched stage. The result was apparent
marker drift, especially visible at Ear Apex / Puncak Telinga.

## Fix
- Decoupled the Full Ear Map canvas height from the selected-point panel.
- Gave the map coordinate stage a stable height per responsive breakpoint.
- Applied the same defensive fix to Guided Application, which uses the same
  percentage-marker architecture.

## Unchanged
- All 30 point coordinates
- Occiput correction
- Ear illustration
- English and Bahasa Melayu point data
- Search/order logic

## Suggested GitHub Desktop summary
Package 22.2 - Map Marker Stability Fix
