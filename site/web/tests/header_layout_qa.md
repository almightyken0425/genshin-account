# Header geometry regression check

2026-11-11: Supported cloud browser, local preview, viewport width 1180px.
All seven team title bounding-box midpoints were 590px, exact viewport center:
skirk, mavuika, zibai, nefer, neuvillette, varesa, mizuki.
Return to teams and switch to growth passed. Growth target images and all required text visible.

Repeat with supported browser at desktop and mobile widths:
1. Open each `?tab=teams&team=<id>`.
2. Read `.centered-page-header h2` bounding rect.
3. Assert `abs((left + right) / 2 - innerWidth / 2) <= 1`.
4. Verify back button and footer can be reached with keyboard and return works.

Mobile viewport emulation was not available in this browser tool session; mobile geometry was not directly measured. Shared CSS uses symmetric 44px side columns at all breakpoints.
