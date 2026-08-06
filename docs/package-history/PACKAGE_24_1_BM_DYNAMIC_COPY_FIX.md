# Package 24.1 — BM Dynamic Copy Fix

Base: Package 24 Bahasa Melayu Polish.

## Why this patch was needed
Package 24 translated the static UI text, but a few strings in Guided
Application were generated dynamically with the condition name or step count.
Those strings could not be translated by the exact-text translation layer.

## Fixed dynamic strings
- `You’ve reached the end of this 3-point application guide.`
- `<Condition> guide complete.`
- `Back to <Condition> guide`
- `← Back to <Condition>`
- `Step 1 of 3`
- `Step 1`
- `Open full <Point> guide`
- Application progress accessibility label

## Malay examples
- `Anda telah selesai mengikuti panduan penggunaan 3 titik ini.`
- `Rutin Tidur selesai.`
- `Kembali ke panduan Tidur`
- `← Kembali ke Tidur`
- `Langkah 1 daripada 3`
- `Buka panduan penuh Shen Men`

Also added Malay labels for `Visual concern guide`, `Ear point` and
`Application progress`.

## Preserved unchanged
- Approved 30-point coordinates
- Ear illustration
- Point combinations
- English copy
- Package 23.1 centering
- Package 24 condition and point translations

## GitHub Desktop summary
Package 24.1 - BM Dynamic Copy Fix
