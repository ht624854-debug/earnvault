# Task 3: Admin API Routes for EarnVault

## Summary
Created all 29 admin API route files for the EarnVault earning/task reward platform. All routes are fully functional, production-ready, and follow Next.js 16 App Router patterns with Promise-based params.

## Files Created (29 route files)

### Authentication & Dashboard
1. **`src/app/api/admin/login/route.ts`** - POST handler for admin login with JWT token generation
2. **`src/app/api/admin/dashboard/route.ts`** - GET handler returning comprehensive dashboard stats (12 metrics)

### User Management
3. **`src/app/api/admin/users/route.ts`** - GET handler with search, filter (active/inactive/blocked), pagination
4. **`src/app/api/admin/users/[id]/route.ts`** - GET (full user details with transactions/referrals/submissions/withdrawals) and PUT (update user fields with audit logging)
5. **`src/app/api/admin/users/[id]/block/route.ts`** - POST handler to block user
6. **`src/app/api/admin/users/[id]/unblock/route.ts`** - POST handler to unblock user
7. **`src/app/api/admin/users/[id]/balance-adjust/route.ts`** - POST handler for balance adjustments (main/deposit) with transaction records

### Activation Requests
8. **`src/app/api/admin/activation-requests/route.ts`** - GET handler with status filter
9. **`src/app/api/admin/activation-requests/[id]/approve/route.ts`** - POST handler: approves request, activates user package, adds to deposit balance, creates transaction, handles referral rewards
10. **`src/app/api/admin/activation-requests/[id]/reject/route.ts`** - POST handler with reason

### Withdraw Requests
11. **`src/app/api/admin/withdraw-requests/route.ts`** - GET handler with status filter
12. **`src/app/api/admin/withdraw-requests/[id]/approve/route.ts`** - POST handler to approve
13. **`src/app/api/admin/withdraw-requests/[id]/reject/route.ts`** - POST handler: rejects + refunds amount to user main_balance + creates transaction
14. **`src/app/api/admin/withdraw-requests/[id]/mark-paid/route.ts`** - POST handler to mark as paid

### Task Management
15. **`src/app/api/admin/tasks/route.ts`** - GET (all tasks) and POST (create task)
16. **`src/app/api/admin/tasks/[id]/route.ts`** - PUT (update task) and DELETE (delete task)

### Task Submissions
17. **`src/app/api/admin/task-submissions/route.ts`** - GET handler with status filter
18. **`src/app/api/admin/task-submissions/[id]/approve/route.ts`** - POST handler: approves, checks for duplicate rewards, credits reward to main_balance, creates transaction
19. **`src/app/api/admin/task-submissions/[id]/reject/route.ts`** - POST handler with reason

### Settings & Configuration
20. **`src/app/api/admin/settings/route.ts`** - GET (all settings) and PUT (batch update with { key: value } pairs)

### Payment Methods
21. **`src/app/api/admin/payment-methods/route.ts`** - GET (all) and POST (create)
22. **`src/app/api/admin/payment-methods/[id]/route.ts`** - PUT (update) and DELETE (delete)

### Reward Campaigns
23. **`src/app/api/admin/reward-campaigns/route.ts`** - GET (all with claim counts) and POST (create)
24. **`src/app/api/admin/reward-campaigns/[id]/route.ts`** - PUT (update) and DELETE (delete)

### Support Tickets
25. **`src/app/api/admin/support-tickets/route.ts`** - GET handler with status filter, includes replies
26. **`src/app/api/admin/support-tickets/[id]/reply/route.ts`** - POST handler: creates admin reply, sets status to 'Answered'

### Reporting & Audit
27. **`src/app/api/admin/transactions/route.ts`** - GET handler with type filter, pagination, and CSV export support
28. **`src/app/api/admin/audit-logs/route.ts`** - GET handler with pagination and admin details
29. **`src/app/api/admin/referrals/route.ts`** - GET handler with search by user name

## Key Implementation Details
- All routes use `requireAdmin` middleware for authentication and authorization
- Next.js 16 pattern: `params` is a `Promise` that must be awaited
- All mutations create `AuditLog` entries via `createAuditLog`
- Balance changes create `Transaction` records with balance_before/balance_after tracking
- Activation approval includes referral reward logic based on `referral_reward_on_activation` setting
- Task submission approval prevents duplicate rewards
- Withdrawal rejection refunds amount to user's main_balance
- Transactions endpoint supports CSV export with `?export=csv` query param
- Lint: passes with zero errors
