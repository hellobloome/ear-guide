# Package 23.1 — Home Centering Correction

Base: Package 23.

## Why this patch exists
Package 23 centered the homepage grid track, but the inherited `.route-grid`
layout and child sizing could still make the hero feel visually left-heavy.

## Fix
The homepage hero now uses a dedicated centered flex composition:
- entire hero group centered in the page container
- eyebrow centered
- heading centered
- lead paragraph centered
- search box centered
- trust row centered

This is intentionally scoped only to `.premium-home .premium-hero`.

## Preserved unchanged
- Package 22 approved 30-point coordinates
- Ear-map architecture
- Bahasa Melayu greeting from Package 23
- Point 20 Pancreas / Gallbladder
- Point 21 Knee
- All condition and guide data

## GitHub Desktop summary
Package 23.1 - Home Centering Correction
