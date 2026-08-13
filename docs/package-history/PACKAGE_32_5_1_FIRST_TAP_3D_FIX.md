# Package 32.5.1 — First-Tap 3D Fix

This hotfix ensures View in 3D opens on the first tap after entering an ear map or routine.

- Initializes the lightweight native-overlay shell with the guide.
- Preloads only the small frozen coordinate index, not the 3D engine or model.
- Captures dynamically updated View in 3D controls reliably on their first tap.
- Continues loading the engine and Ear 1 model only after the customer requests 3D.
- Preserves the selected point, location guidance, geometry and coordinates.

## GitHub Desktop

Summary: `Package 32.5.1 - Fix First-Tap 3D Opening`

Description: `Initialized the lightweight native 3D overlay shell and coordinate index with the guide, fixed first-tap handling for dynamically updated map and routine buttons, retained lazy model loading, and preserved all approved coordinates and geometry.`
