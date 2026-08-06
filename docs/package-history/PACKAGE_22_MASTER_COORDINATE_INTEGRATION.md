# Package 22 — Master Coordinate Integration

Base: Package 20.2 Ear Map Coordinate Architecture Fix.

## Source of truth
Bloomé Master 30-Point Pixel Table v3 APPROVED
Canvas: 1141 × 2047 px

## Key implementation change
The website no longer relies on hand-maintained percentage coordinates.
`masterPixelPositions` stores the approved pixel locations. `mapPositions`
is derived from those pixels at runtime using the fixed 1141 × 2047 canvas.

This means desktop, mobile, English, Malay, condition maps and Guided
Application all use the same coordinate source.

## Library changes approved by the user
- Point 7 = Stomach
- Point 8 = Spleen
- Pancreas + Gallbladder merged into Point 20
- Point 21 = Knee
- Total remains 30 points

## Data changes
- `data/acupoints.json` now stores both `pixelPosition` and derived
  percentage `mapPosition`.
- `data/master-coordinates-v3-approved.json` is included for auditability.
- English and Malay entries added for Knee and merged Pancreas / Gallbladder.

## Unchanged
- Ear illustration asset and dimensions
- Package 20.2 marker-to-image coordinate architecture
- Condition combinations
- Search architecture
- Homepage layout

## Suggested GitHub Desktop summary
Package 22 - Master Coordinate Integration
