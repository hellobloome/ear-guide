# Package 24.2 — BM Cache + Dynamic Fallback Fix

Base: Package 24.1.

## Root cause
Package 24.1 already contained the correct Malay dynamic strings in `app.js`.
If the site showed the new static Bahasa Melayu translations but still showed
old English strings such as `Back to ... guide`, the page was loading a cached
older JavaScript bundle while loading newer translation JSON.

## Fixes
1. JavaScript bundle renamed from:
   - `js/app.js`
   to:
   - `js/app-v24-2.js`

2. `index.html` now references the unique versioned bundle, preventing the
   browser from reusing the previous cached JavaScript file.

3. JSON data requests are versioned and use `cache: "no-store"`.

4. Added a defensive translator for dynamically generated phrases:
   - `You’ve reached the end of this 3-point application guide.`
   - `Back to Tidur guide`
   - `← Back to Tidur`
   - `Tidur guide complete.`
   - `Step 1 of 3`
   - `Step 1`
   - `Open full Shen Men guide`

## Expected Bahasa Melayu results
- `Anda telah selesai mengikuti panduan penggunaan 3 titik ini.`
- `Kembali ke panduan Tidur`
- `← Kembali ke Tidur`
- `Rutin Tidur selesai.`
- `Langkah 1 daripada 3`
- `Buka panduan penuh Shen Men`

## Preserved unchanged
- Approved 30-point coordinate source
- Ear illustration
- Condition combinations
- Homepage centering
- English content
- Package 24 BM translations

## GitHub Desktop summary
Package 24.2 - BM Cache + Dynamic Fallback Fix
