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

---
Task ID: 2
Agent: Main
Task: Debug and fix backend not working, login not working, bonuses not showing on live VPS

Work Log:
- Tested all backend APIs (login, register, bonus-campaigns, dashboard, auth/me) - ALL working correctly
- Tested bonus-campaigns API returns 3 campaigns (DAY1, Oryndelux Bonus x2) with proper data
- The backend code is correct - all API endpoints return proper responses
- Added base_url to seed.ts default settings (was missing, causing referral link issues on fresh DB)
- Added db:seed script to package.json and prisma config
- Fixed ecosystem.config.js cwd path from /var/www/earnvault to /root/earnvault (was wrong!)
- Created update-vps.sh script for easy VPS updates
- Pushed all fixes to GitHub (commit 39f9fb8)

Stage Summary:
- All backend APIs confirmed working in z.ai environment
- The live VPS issue is likely because: (1) database missing seed data, (2) ecosystem.config had wrong cwd path
- User needs to run VPS update with: git fetch origin && git reset --hard origin/main && npm install && npx prisma generate && npx prisma db push && npx prisma db seed && npm run build && pm2 restart earnvault
- Key fix: ecosystem.config.js had /var/www/earnvault but VPS is at /root/earnvault
