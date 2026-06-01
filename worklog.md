---
Task ID: 1
Agent: Main
Task: Fix referral link, separate Rewards/Bonuses pages, full website audit and fix errors

Work Log:
- Fixed RewardsPage: removed Bonus Campaigns, now shows ONLY Daily Code section (Enter Code + Claim + Available Codes + My Claims)
- Created BonusesPage: shows ONLY Bonus Campaigns (DAY1, Oryndelux Bonus, etc.) with progress, time limits, claim buttons
- Updated Dashboard: Bonuses button now navigates to 'bonuses' page instead of 'rewards'
- Added 'bonuses' page type to router store and page.tsx
- Fixed referral link: uses base_url from settings (DB) > NEXT_PUBLIC_BASE_URL > request headers
- Fixed ProfilePage: referral link uses settings.base_url instead of hardcoded window.location.origin
- Added base_url setting to database (https://oryndelux.com)
- Added base_url field to Admin Settings > Brand section so admin can change it
- Created missing /api/upload route (was broken - all file uploads were failing with 404)
- Fixed RewardsPage: replaced raw fetch() calls with api-client methods
- Added base_url to referral-link API route (reads from DB settings first)
- Full website audit completed and critical bugs fixed

Stage Summary:
- Rewards page = Daily Code only
- Bonuses page = Bonus Campaigns only (separate page)
- Referral links use correct base URL from settings
- /api/upload route created (5MB max, images only)
- Admin can change base_url in Settings > Brand
- All code committed locally, GitHub push needs new token
