Bloomé Package 12 — Expanded Library Integration

PURPOSE
Package 11 expanded the database to 30 points.
Package 12 integrates those 30 points into the user experience without inventing map coordinates.

WHAT'S NEW
- Search results distinguish Mapped point vs Reference point.
- Discover cards distinguish mapped and reference entries.
- Ear Map search now searches all 30 library points.
- A–Z on the Ear Map now lists all 30 points.
- Reference-only points can be selected and read inside the map explorer panel.
- Reference-only points are clearly labelled as NOT plotted on the simplified ear.
- Existing mapped points still work exactly as before.
- Individual point pages show map status.
- Mapped point pages include a “View on interactive ear map” button.
- Reference point pages explain why no marker is shown.
- Added conservative related-guide links to several new reference points.

IMPORTANT
No new ear-map coordinates were guessed.
The original 14 mapped markers remain the only plotted points.

FILES
- js/app.js
- css/style.css
- data/acupoints.json
- data/conditions.json
- data/app.json
- data/i18n.json
- index.html included unchanged for drop-in installation

GITHUB DESKTOP SUMMARY
Package 12 - Expanded Library Integration

TEST
1. Search Liver from Home.
2. Open Liver and confirm it says Reference acupoint.
3. Open Ear Map and search Liver.
4. Confirm Liver appears in the library but no fake marker appears.
5. Search Shen Men and confirm it is labelled Mapped.
6. Open Shen Men and use “View on interactive ear map”.
7. Browse A–Z and confirm both mapped and reference points appear.
8. Test Sleep condition to ensure Package 9A remains unchanged.
