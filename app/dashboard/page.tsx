import { Suspense } from 'react';
import DashboardClient from './DashboardClient';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { initializeUser } from '@/lib/initializeUser';

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const { userId } = auth();
  
  if (userId) {
    const user = await clerkClient.users.getUser(userId);
    const emailAddress = user.emailAddresses[0]?.emailAddress;
    await initializeUser(userId, emailAddress);
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardClient />
    </Suspense>
  );
}