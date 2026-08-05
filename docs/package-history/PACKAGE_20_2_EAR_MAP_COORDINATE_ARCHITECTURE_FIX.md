# Package 20.2 — Ear Map Coordinate Architecture Fix

Base: Package 20.1.

## Problem
On desktop, full ear-map markers could appear to move when switching selected points.
On mobile, the map was stable but some points still appeared incorrectly aligned.

## Root cause
Markers were positioned as percentages of the full map card/stage, while the ear
illustration was a smaller centered element inside that stage. When the surrounding
layout changed, the marker layer and ear artwork no longer shared the same coordinate box.

## Fix
- The ear illustration now owns its marker layer.
- Full Ear Map markers are placed inside the same wrapper as the ear image.
- Condition page markers are placed inside the same wrapper as the ear image.
- Guided Application markers are placed inside the same wrapper as the ear image.
- The map/info panel height can no longer move markers relative to the ear artwork.

## Unchanged
- All point coordinates
- Ear illustration asset
- Occiput correction
- Homepage copy/layout from Package 20.1
- Point reference standardization from Package 20
- Brain/Thalamus simplified wording from Package 20.1

## Suggested GitHub Desktop summary
Package 20.2 - Ear Map Coordinate Architecture Fix
