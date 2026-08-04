# Package 19 — Map Legibility & Interaction Polish

Stable base: Package 17.1.

## Goal
Improve map readability and point interaction without changing the ear illustration or any point coordinates.

## Changes
- Edge-aware point labels flip left/right or above/below near map boundaries.
- Larger invisible touch targets around map markers.
- Stronger selected-point state.
- Clear keyboard focus state.
- Slightly improved zoom control feedback.
- Same legibility treatment applied to condition-page numbered markers.
- Mobile labels can wrap instead of running outside the map.

## Explicitly unchanged
- Ear illustration
- All 30 map coordinates
- 20 condition combinations
- Guided Application logic
- Search
- English/Bahasa Melayu content
- Homepage copy from Package 17.1

## Suggested GitHub Desktop summary
Package 19 - Map Legibility Polish

## Test
1. Open Ear Map on desktop.
2. Select points near the right, top, and bottom edges.
3. Confirm labels stay readable inside the map area.
4. Test zoom controls.
5. Test Ear Map on mobile.
6. Open Sleep and another condition guide.
7. Tap each numbered marker and confirm labels remain readable.
8. Confirm EN/BM and Guided Application still work.
