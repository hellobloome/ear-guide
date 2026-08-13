# Package 32.4.1 — Material Load Fix

This hotfix prevents optional material features from interrupting the 3D model load callback.

- Removed extension-dependent specular and index-of-refraction calls.
- Retained the supported base colour, metallic and roughness controls.
- Isolated material errors so the loading message always clears and points always attach.
- Preserved the editorial background, Ear 1 geometry and frozen coordinates.

## GitHub Desktop

Summary: `Package 32.4.1 - Fix 3D Material Loading`

Description: `Removed unsupported optional material-extension calls that could interrupt the 3D load callback, added a fail-safe so points always attach and the loading message clears, and retained the warm editorial styling with unchanged geometry and coordinates.`
