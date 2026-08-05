# Package 20.4 — Image-local Coordinate Fix

Base: Package 20.2.

## Problem
Package 20.2 correctly stopped the markers from moving, but the point positions
still looked too tightly grouped in the middle of the ear.

## Root cause
The old point coordinates were designed for the full map stage. After Package
20.2 moved markers into the ear image wrapper, those same coordinates became too
compressed because the ear illustration only occupied the center portion of the
old map stage.

## Fix
Converted the old stage-based X coordinates into image-wrapper-local X
coordinates.

Formula:
`local_x = (stage_x - 14) / 0.72`

Y coordinates were left unchanged because the ear image height already matched
the old vertical coordinate frame.

## Unchanged
- Ear illustration
- Stable marker architecture from Package 20.2
- English/BM content
- Search
- Guided Application logic

## Suggested GitHub Desktop summary
Package 20.4 - Image-local Coordinate Fix
