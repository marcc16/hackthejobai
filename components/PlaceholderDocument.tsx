"use client";

import React from 'react'
import { Button } from './ui/button'
import { PlusCircleIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useSubscription from '@/hooks/useSuscription';

function PlaceholderDocument() {

  const router = useRouter();
  const subscription = useSubscription();

  const handleClick = () => {
    if (!subscription || subscription.availableInterviews === 0) {
      router.push('/dashboard/upgrade');
    } else {
      router.push('/dashboard/upload');
    }
  };

  return (
    <Button
      onClick={handleClick}
      className="flex flex-col items-center w-64 h-80 rounded-xl bg-gray-200 drop-shadow-md text-gray-400">
      <PlusCircleIcon className="h-16 w-16" />
      <p>Añade una entrevista</p>
    </Button>
  );
}

export default PlaceholderDocument
