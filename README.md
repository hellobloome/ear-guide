# Bloomé Guide — Package 6.2 Ear Map Architecture Fix

## Purpose
A structural correction after Package 6.

## Fixed
- Functional ear maps no longer behave like hero artwork.
- Ear illustration scale is controlled independently on desktop and mobile.
- Map containers frame the ear instead of stretching it vertically.
- Hero illustration and condition map illustration now have separate sizing rules.
- Remaining botanical SVG decoration is suppressed.

## Test checklist
1. Homepage hero ear
2. Sleep condition page desktop
3. Sleep condition page mobile
4. Full ear map
5. Marker alignment after resizing

## GitHub Desktop
Summary:
Package 6.2 - Ear Map Architecture Fix

Commit to main, push origin, then hard refresh after GitHub Pages deploys.


## Package 6.3 Direction
Clean Option 1 ear asset replacement: remove all botanical decoration and restore full ear visibility.
