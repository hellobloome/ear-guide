# Package 22.3 — Map Canvas Aspect Ratio Fix

Base: Package 22.2.

## Problem found after 22.2
The fixed-height solution prevented marker drift, but introduced two new issues:
- the ear illustration could be cropped
- markers could appear out of place relative to the cropped image

## Root cause
The map marker issue was real, but the 22.2 fix used a rigid pixel height.
That kept the marker coordinate stage stable, but it also forced the ear art into
an area that could crop differently across layouts.

## Fix in 22.3
- replaces the fixed-height approach with a stable aspect-ratio canvas
- keeps the map panel independent from the changing content panel
- prevents the ear image from cropping inside the map
- keeps marker coordinates stable across point selection
- applies the same safe geometry approach to Guided Application

## Unchanged
- all point coordinates
- English and Bahasa Melayu content
- Occiput correction
- point order and filtering

## Suggested GitHub Desktop summary
Package 22.3 - Map Canvas Aspect Ratio Fix
