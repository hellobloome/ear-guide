# Bloomé Guide 1.1

Bloomé Guide 1.1 adds complete Simplified Chinese support to the stable customer-facing ear-seed education guide and native 3D ear viewer.

## Languages

- English (EN)
- Bahasa Melayu (BM)
- Simplified Chinese (中文 / zh-Hans)

The language selector cycles through all three languages. Chinese support covers the interface, all 30 points, all 20 concern routines, search terms, safety guidance, guided application, and the native 3D viewer.

In the Chinese 30-point directory, point cards and letter filters follow Hanyu Pinyin order while the approved Chinese and English reference names remain displayed.

The Chinese Discover directory also uses Hanyu Pinyin initials for both wellness guides and ear points. Long bilingual names in the native 3D viewer wrap responsively on desktop and phone.

## Production baseline

- Mobile-first Bloomé website experience
- Thirty-point 2D ear map and concern-led routines
- Native 3D overlay available from supported map points, full point guides, routines, and guided application
- Ten approved 3D point highlights and two approved translucent area highlights
- Point-specific camera focus, rotate, zoom, reset, and close controls
- Warm editorial ear presentation
- Point-specific location guidance
- English and Bahasa Melayu guide support
- Wellness disclaimer and required model attribution

## Locked assets

- Ear 1 geometry is the approved production model.
- The approved 1B.10 coordinate library is frozen and must not be altered in maintenance releases.
- Occiput and Ear Apex remain translucent area highlights.

## Deployment

Upload the contents of this package to the Bloomé Guide GitHub Pages repository. Keep all directory names and relative paths unchanged.

After deployment, verify the ear map, one supported full point guide, one concern routine, and one guided-application step from a fresh browser load on phone and desktop.

## Maintenance policy

Version 1.1 preserves the 1.0 coordinates and geometry. Translation refinements can be made in `data/zh-Hans.json` and `data/zh-Hans-ui.json` without changing placement data.

See `CHANGELOG.md` for the consolidated release history and `3d/ATTRIBUTION.md` for model credit and licensing.
