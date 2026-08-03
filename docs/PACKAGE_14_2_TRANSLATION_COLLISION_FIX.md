# Package 14.2 — Translation Collision Fix

Fixes an ambiguous reverse-translation collision.

Problem:
- Both "Home" and "Primary" translate to "Utama" in Bahasa Melayu.
- The previous reverse dictionary kept the last match, so static "Utama" in the navigation became "Primary" when switching back to English.

Fix:
- Reverse translations now keep the first canonical English match for duplicate Malay values.
- "Utama" in the static navigation correctly returns to "Home".
- Routed content already re-renders from source data, so role labels such as "Primary" remain correct.
