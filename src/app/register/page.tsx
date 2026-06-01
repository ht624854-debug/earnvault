import { redirect } from 'next/navigation';

// Redirect /register?ref=CODE to /?ref=CODE
// This handles old referral links shared in /register format
export default function RegisterRedirectPage({
  searchParams,
}: {
  searchParams: { ref?: string; reference?: string };
}) {
  const refCode = searchParams.ref || searchParams.reference;

  if (refCode) {
    redirect(`/?ref=${refCode}`);
  }

  redirect('/');
}
