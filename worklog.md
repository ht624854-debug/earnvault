---
Task ID: 1
Agent: Main
Task: Fix all bugs in EarnVault platform

Work Log:
- Fixed paymentMethods.map error in ActivationPage.tsx by adding safeArray helper function
- Removed "Admin Login" button text from LoginPage.tsx (admin functionality preserved)
- Fixed auth store (stores.ts) for robust error handling with null checks on API responses
- Fixed api-client.ts to handle network errors better
- Fixed seed file (prisma/seed.ts) - added missing offer settings (offer_enabled, offer_title, offer_description, offer_discount), fixed WhatsApp settings key mismatches (whatsapp_popup_* → whatsapp_*), fixed why_choose and testimonial key formats
- Ran seed to populate missing settings in database
- Fixed LandingPage.tsx to use correct settings keys matching AdminSettings page (why_choose_1, testimonial_1, whatsapp_enabled, etc.)
- Fixed AdminUserDetail.tsx - added null check on res.user before dereferencing
- Fixed AdminSupport.tsx - changed res.tickets || [] to Array.isArray(res.tickets) ? res.tickets : []
- Fixed AdminUserDetail.tsx - fixed package_status casing (Inactive/Active instead of inactive/active)
- Activation fee default is 1500 RS in seed, admin can change it via Settings > Financial > Activation Fee
- Admin can add offers via Settings > Activation Offers section (offer_enabled, offer_title, offer_description, offer_discount)
- Each device maintains independent login session via localStorage JWT token (ev_token)
- Lint passes with no errors

Stage Summary:
- All critical bugs fixed
- paymentMethods.map error resolved with robust array extraction
- Admin Login text removed from login page
- Activation fee is 1500 RS, admin-controllable
- Offer functionality works (enable/disable, title, description, discount amount)
- Independent sessions per device confirmed working via localStorage
- Seed updated with correct settings keys matching admin UI
