# Package 32.5.3 — Standardized 3D button fix

## Confirmed cause

The interface rendered `data-open-3d`, but the event handler read `dataset.open3d`. A hyphen followed by a number does not map to that JavaScript property, so the initial button supplied no location. Changing points happened to create a second attribute in the format the handler expected, which made later attempts work.

## Correction

All four entry points now use `data-open-3d-location`, and JavaScript reads and updates the matching `dataset.open3dLocation` property:

- ear map
- full point guide
- concern routine
- guided application

The frozen Beta 1B.10 coordinate library and Ear 1 model are unchanged.
