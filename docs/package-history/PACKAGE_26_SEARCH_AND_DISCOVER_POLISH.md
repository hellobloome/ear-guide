# Package 26 — Search + Discover Polish

Base: Package 25 Guide Page Refinement.

## Search improvements
- Better ranking for exact names, aliases, keywords and partial names
- Token-aware matching for multi-word searches
- Light typo tolerance for practical misspellings
- Searches remain bilingual because English and Bahasa Melayu aliases are
  both included in the searchable library
- Search suggestions now include a clear `See all results` route
- Exact/direct searches can still open the most relevant guide or point
- Ambiguous and fuzzy searches open the Discover results page instead of
  guessing too aggressively

## Discover improvements
- Dedicated live-search field
- Type filters:
  - All
  - Wellness guides
  - Ear points
- Real A–Z browsing
- Result count that updates with search/filter state
- Popular search shortcuts
- Clearer visual distinction between wellness-guide cards and ear-point cards
- Wellness-guide cards preview their suggested points
- Ear-point cards show category and reference code
- Improved empty-result recovery
- Mobile A–Z row scrolls horizontally instead of wrapping into a wall of buttons

## Language
All new UI copy has Bahasa Melayu equivalents. Search still understands both
English and Malay terminology because the existing bilingual aliases remain
part of the search index.

## Intentionally unchanged
- Approved 30-point coordinates
- Ear illustration
- Condition combinations
- Condition recommendations
- Guided Application logic
- Guide page content from Package 25
- Homepage centering

## Cache/versioning
Bundle: `js/app-v26.js`
Assets/data: `?v=26`

## GitHub Desktop summary
Package 26 - Search + Discover Polish
