# Package 29 — Mobile QR Journey Audit

Base: Package 28.1 Condition Point Tabs Left Align.

## Primary journey tested
QR → Homepage → Search / Wellness Need → Condition → Guided Application

## Mobile changes

### Global
- Added `viewport-fit=cover`
- Added iPhone / safe-area handling
- Added bottom content clearance so fixed navigation cannot cover content
- Reduced excessive mobile vertical spacing
- Reduced oversized mobile headings while preserving Bloomé typography
- Ensured key controls meet a practical 44px+ tap-target baseline
- Set search inputs to 16px to avoid automatic iOS input zoom

### Header
- More compact sticky header
- Slightly smaller brand and menu controls
- Larger, easier-to-tap mobile menu rows

### Homepage
- Tighter QR landing layout
- More compact wellness-need cards
- Search appears sooner in the viewport

### Search
- Suggestion list gets a mobile max-height and internal scroll
- Better behaviour when the phone keyboard is open

### Condition pages
- Reduced dead space around map and information card
- More compact mobile map height
- Left-aligned point list from Package 28.1 preserved
- Larger tap targets for point rows and action buttons

### Full map / point details
- More compact mobile map and point-detail cards
- Horizontal scrolling for long category filters
- Improved scroll targets when selecting a point

### Guided Application
- Bottom navigation and Quick Help are hidden during active application
  so the customer can focus on the current point
- Back / Next controls become a fixed thumb-zone action bar on mobile
- Safe-area aware action bar for iPhone home indicators
- Added content clearance so the fixed controls never cover instructions
- Completion buttons become full-width and easy to tap

### Bottom navigation
- Safe-area aware
- Better thumb-zone positioning
- Larger tap targets
- More compact visual footprint

### Quick Help
- Moved above bottom navigation
- Safe-area aware bottom sheet
- Larger mobile quick-help options

## Intentionally unchanged
- Approved 1141 × 2047 point-coordinate source
- All 30 point locations
- Ear illustration
- 20 condition combinations
- Depuffing guide
- Search logic
- Bahasa Melayu content
- Condition and point-page content

## GitHub Desktop summary
Package 29 - Mobile QR Journey Audit
