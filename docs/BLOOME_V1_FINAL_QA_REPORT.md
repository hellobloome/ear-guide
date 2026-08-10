# Bloomé Guide v1.0 — Package 31 QA Report

Automated checks: **28 passed**, **0 failed**, **0 skipped**.

## Automated checks

- **PASS** · 30 acupoints — found 30
- **PASS** · 20 conditions — found 20
- **PASS** · 30 approved master coordinates — found 30
- **PASS** · Master canvas is 1141 × 2047
- **PASS** · Ear image is 1141 × 2047
- **PASS** · Point IDs unique
- **PASS** · Condition IDs unique
- **PASS** · All condition point references valid
- **PASS** · All related guide references valid
- **PASS** · Depuffing present
- **PASS** · After-Meal Comfort retired
- **PASS** · Knee present
- **PASS** · Merged Pancreas / Gallbladder present
- **PASS** · BM translations cover 20 conditions
- **PASS** · BM translations cover 30 points
- **PASS** · Approved pixel coordinate engine retained
- **PASS** · Knee approved coordinate retained
- **PASS** · Pancreas/Gallbladder approved coordinate retained
- **PASS** · v31 JS referenced
- **PASS** · v31 CSS referenced
- **PASS** · Instagram link present
- **PASS** · TikTok link present
- **PASS** · Facebook link present
- **PASS** · External social links use noopener
- **PASS** · Open Graph URL present
- **PASS** · All data JSON parses
- **PASS** · JavaScript syntax
- **PASS** · Approved anatomy / recommendation sources unchanged

## Manual browser checks before calling the release final

- Open the live GitHub Pages site after deployment and hard-refresh once.
- Test EN and BM on Home, Discover, Ear Map, Guide, About, one Condition page, one Point page and Guided Application.
- Test desktop and one real phone.
- Tap Instagram, TikTok and Facebook from both the footer and About page.
- Confirm every social link opens the expected Bloomé account in a new tab/app.
- Run one full Guided Application from first point to completion.
- Verify the mobile Back / Next action bar does not cover instructions.
- Verify the footer stays hidden during Guided Application on mobile.
- Spot-check at least six approved point locations on the Full Ear Map.
- Confirm Quick Help and bottom navigation do not overlap content.

If these manual checks pass, Package 31 can be tagged as **Bloomé Guide v1.0.0**.