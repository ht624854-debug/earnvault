# Task 2 - Backend API Routes for EarnVault

## Summary
Created all 24 API route files for the EarnVault earning/task reward platform backend.

## Files Created

### Auth Routes (4 files)
1. **src/app/api/auth/register/route.ts** - POST handler for user registration
   - Validates email, username, mobile uniqueness
   - Hashes password, generates referral code
   - Handles referral code tracking
   - Creates user with Inactive package status and user role
   - Generates JWT token and returns user data (without password_hash)

2. **src/app/api/auth/login/route.ts** - POST handler for user login
   - Accepts username or email as identifier
   - Compares password, checks blocked status
   - Returns user data and JWT token

3. **src/app/api/auth/me/route.ts** - GET handler for current user
   - Requires authentication
   - Returns current user profile data

4. **src/app/api/auth/change-password/route.ts** - POST handler for password change
   - Requires authentication
   - Verifies current password, hashes and updates new password

### User Routes (6 files)
5. **src/app/api/user/dashboard/route.ts** - GET handler for dashboard data
   - Returns user data, recent 10 transactions, referral count, task submissions count

6. **src/app/api/user/profile/route.ts** - GET and PUT handlers for profile
   - GET: Returns user profile
   - PUT: Updates first_name, last_name, mobile, avatar with mobile uniqueness check

7. **src/app/api/user/transactions/route.ts** - GET handler with pagination
   - Supports page and limit query params
   - Returns transactions with pagination metadata

8. **src/app/api/user/referrals/route.ts** - GET handler for referral list
   - Returns referrals with referred user details (first_name, last_name, username, etc.)

9. **src/app/api/user/referral-link/route.ts** - GET handler for referral link
   - Returns referral code and constructed referral link

10. **src/app/api/user/task-submissions/route.ts** - GET handler for task submissions
    - Returns submissions with associated task details

### Task Routes (2 files)
11. **src/app/api/tasks/route.ts** - GET handler for active tasks
    - Returns all active tasks ordered by sort_order

12. **src/app/api/tasks/[id]/submit/route.ts** - POST handler for task submission
    - Checks inactive user earning permission from settings
    - Checks daily limit per task
    - Checks if already submitted today
    - Auto-checks answers for math/question tasks
    - Auto-approves correct answers with reward, auto-rejects incorrect
    - Creates transaction for approved submissions

### Payment Methods Route (1 file)
13. **src/app/api/payment-methods/route.ts** - GET handler for active payment methods

### Activation Routes (2 files)
14. **src/app/api/activation/request/route.ts** - POST handler for activation requests
    - Validates payment method exists and is active
    - Creates ActivationRequest with Pending status

15. **src/app/api/activation/my-requests/route.ts** - GET handler for user's activation requests
    - Includes payment method details

### Withdraw Routes (2 files)
16. **src/app/api/withdraw/request/route.ts** - POST handler for withdrawal requests
    - Checks user is active
    - Validates minimum withdrawal from settings
    - Checks sufficient main_balance
    - Deducts from balance and creates pending transaction
    - Creates WithdrawRequest with Pending status

17. **src/app/api/withdraw/my-requests/route.ts** - GET handler for user's withdrawal requests

### Reward Routes (2 files)
18. **src/app/api/rewards/campaigns/route.ts** - GET handler for active reward campaigns

19. **src/app/api/rewards/[id]/claim/route.ts** - POST handler for reward claims
    - Validates user has met campaign referral target within time limit
    - Checks not already claimed
    - Adds reward to user balance via createTransaction
    - Updates claim status to Claimed

### Support Routes (3 files)
20. **src/app/api/support/ticket/route.ts** - POST handler for creating support tickets

21. **src/app/api/support/tickets/route.ts** - GET handler for user's tickets with replies

22. **src/app/api/support/tickets/[id]/route.ts** - GET handler for single ticket with replies

### Settings Route (1 file)
23. **src/app/api/settings/route.ts** - GET handler for public settings
    - Filters out sensitive settings (passwords, secrets, api keys)

### Upload Route (1 file)
24. **src/app/api/upload/route.ts** - POST handler for file uploads
    - Validates file size (max 5MB) and type (JPEG, PNG, GIF, WebP)
    - Saves to public/uploads/ with unique filename
    - Returns file URL path

## Technical Notes
- All authenticated routes use `requireAuth` middleware pattern
- Next.js 16 App Router with `params: Promise<{ id: string }>` pattern for dynamic routes
- Uses `@/lib/db` (Prisma), `@/lib/auth` (bcrypt/jwt), `@/lib/middleware`, `@/lib/settings` utilities
- Lint passes with no errors
- Dev server running successfully
