# Package 14.1 — Language Toggle Hotfix

Fixes a one-way translation issue affecting static interface text outside the routed app,
including the desktop and mobile navigation.

Before:
- EN → BM translated correctly.
- BM → EN restored routed page content, but static header text remained in Malay until refresh.

After:
- Static UI text and placeholders translate in both directions immediately.
- No refresh is required.
- Map, database, routes, condition pages and Package 14 coordinates are unchanged.
