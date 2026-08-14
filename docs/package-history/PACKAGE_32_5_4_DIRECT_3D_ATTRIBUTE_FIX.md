# Package 32.5.4 — Direct 3D attribute fix

## Confirmed cause

Browsers expose `data-open-3d-location` as `dataset["open-3dLocation"]`, not `dataset.open3dLocation`. The initial location existed in HTML, but the event handler read `undefined` and stopped before opening the overlay.

## Correction

The overlay now reads the value directly with `getAttribute("data-open-3d-location")`. Dynamic map and routine updates use the matching `setAttribute` call. This avoids dataset-name conversion entirely across all four 3D entry points.

The frozen Beta 1B.10 coordinate library and Ear 1 model are unchanged.
