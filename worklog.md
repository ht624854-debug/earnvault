---
Task ID: 1
Agent: Main
Task: Fix session independence, admin security, bugs, and .map errors

Work Log:
- Changed JWT token storage from localStorage to sessionStorage for independent tab sessions
- Updated api-client.ts to use sessionStorage instead of localStorage
- Updated stores.ts checkAuth to use sessionStorage instead of localStorage
- Created admin security API endpoint (POST /api/admin/change-credentials) with current password verification
- Created AdminSecurity component with username and password change functionality
- Added Security nav item to AdminLayout sidebar
- Registered AdminSecurity page in page.tsx router and stores
- Added rate limiting to both user login and admin login APIs (5-10 attempts, 15-min lockout)
- Added audit logging for admin login success/failure events
- Fixed AdminSupport.tsx replies.map() - added Array.isArray() guard
- Fixed user SupportPage.tsx replies.map() - added Array.isArray() guard
- Enhanced rewards campaigns API to include user progress for authenticated users
- Verified all user and admin pages have proper defensive array extraction
- Added minimum_withdrawal setting key to seed data
- Ran lint check - all clean
- Tested admin login, admin credentials change, payment methods API, settings API - all working

Stage Summary:
- Session independence: Each browser tab now has its own independent login session (sessionStorage)
- Admin security: Admin can change username and password via Security page in admin panel
- Rate limiting: Both user and admin logins are rate-limited to prevent brute force attacks
- Audit logging: Admin login attempts are logged
- .map errors: All .map() calls across all pages are protected with Array.isArray() checks
- Activation fee: Set to 1500 RS, admin-controllable via Settings page

---
Task ID: 2
Agent: Main
Task: Add Referral Level Reward System to EarnVault

Work Log:
- Added ReferralRewardTier model to prisma/schema.prisma (id, level @unique, reward_amount, created_at, updated_at)
- Ran `bun run db:push` to sync database with new schema
- Added default referral reward tiers to prisma/seed.ts (Level 1: Rs 200, Level 2: Rs 150, Level 3: Rs 100, Level 4: Rs 50, Level 5: Rs 50, Level 6: Rs 50)
- Ran seed script with `bunx bun prisma/seed.ts` to populate default tiers
- Created admin API route GET/POST /api/admin/referral-reward-tiers (list all tiers sorted by level, create/update tier with upsert)
- Created admin API route DELETE /api/admin/referral-reward-tiers/[level] (delete tier by level)
- Created public API route GET /api/referral-reward-tiers (no auth required, returns tiers for user display)
- Updated activation approval logic in /api/admin/activation-requests/[id]/approve/route.ts:
  - Counts activated referrals for the referrer to determine referral level
  - Looks up reward from ReferralRewardTier table by level
  - Falls back to referral_reward setting if no tier exists for that level
  - Uses case-insensitive package_status comparison (.toLowerCase())
  - Credits referrer's main_balance with tier-specific reward
  - Creates transaction record with level info in description
  - Updates referral record's reward_amount and reward_status
- Added API client methods: getReferralRewardTiers(), getAdminReferralTiers(), createReferralTier(), updateReferralTier(), deleteReferralTier()
- Created AdminReferralTiers.tsx component with dark theme matching admin panel:
  - Table listing all tiers with Level, Label, Reward Amount, Actions columns
  - Add new tier dialog with level number and reward amount fields
  - Inline editing of reward amount with save/cancel
  - Delete confirmation dialog with warning about fallback behavior
  - Info card explaining how referral levels work
  - Uses ev-card, ev-btn-primary, ev-btn-secondary, ev-input classes
- Added 'admin-referral-tiers' to Page type in stores.ts
- Added AdminReferralTiers import and adminPageMap entry in page.tsx
- Added "Referral Tiers" nav item with Award icon to AdminLayout sidebar
- Updated user ReferPage.tsx with Referral Rewards section:
  - Fetches tiers from public API on load
  - Visual breakdown showing each level with amount (e.g. "1st Referral - Rs 200")
  - Highlights earned levels in green with "Earned!" badge
  - Shows total potential earnings across all levels
  - Uses Award and TrendingUp icons for visual appeal
- Ran `bun run lint` - all clean, no errors
- Dev server running on port 3000 and responding with 200

Stage Summary:
- Database: New ReferralRewardTier model with 6 default tiers seeded
- API: 3 new routes (admin list/create, admin delete, public list)
- Backend logic: Activation approval now uses tier-based rewards with fallback
- Admin UI: Full CRUD management of referral reward tiers
- User UI: Visual reward tier breakdown on Refer page showing earning potential
- Navigation: "Referral Tiers" added to admin sidebar
