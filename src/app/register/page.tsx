import { redirect } from 'next/navigation';

// Redirect /register?ref=CODE to /?ref=CODE
// This handles old referral links shared in /register format
// In Next.js 16, searchParams is a Promise
export default async function RegisterRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; reference?: string }>;
}) {
  const params = await searchParams;
  const refCode = params.ref || params.reference;

  if (refCode) {
    redirect(`/?ref=${refCode}`);
  }

  redirect('/');
}
