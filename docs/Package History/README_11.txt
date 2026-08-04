Bloomé Package 11 — Database Expansion

DATABASE
- Acupoints: 14 → 30
- Condition guides: 12 (kept stable rather than adding duplicate near-identical guides)
- Current mapped points: 14
- New database-only points: 16

WHAT CHANGED
- Expanded A–Z acupoint library with 16 additional reference entries.
- Added stronger aliases/keywords to existing condition guides.
- Added mapReady metadata to distinguish mapped vs database-only points.
- Added i18n keys and an English/Malay translation scaffold.
- No changes to the working Package 10 interface.

IMPORTANT
The 16 newly added points are deliberately NOT added to condition combinations or the interactive map yet.
This avoids incorrect marker placement until their coordinates are designed and reviewed in a later map-expansion package.

INSTALL
Copy the data folder from this ZIP into your current ear-guide folder and replace:
- data/acupoints.json
- data/conditions.json
- data/app.json

Add:
- data/i18n.json

GitHub Desktop Summary:
Package 11 - Database Expansion

TEST
1. Search "Liver"
2. Search "Adrenal"
3. Search "Lower back"
4. Browse Discover → Acupoints
5. Confirm the Ear Map still shows the original mapped points only
6. Open an existing condition such as Sleep and confirm it is unchanged

CONTENT NOTE
Bloomé Guide uses cautious traditional-wellness language. New locations are simplified descriptions
and should not be treated as a clinical placement chart.
