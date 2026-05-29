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
