'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  
  const handleClick = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black dark:text-black text-white flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold dark:texttext-gray-800 -gray-200 mb-4">404</h1>
        <h2 className="text-3xl font-semibold dark:text-gray-700 text-gray-300 mb-6">
          NOT FOUND
        </h2>
        <p className="dark:text-gray-600 text-gray-400 mb-8">
          Sorry, we can't seem to find this page. The page may not exist or an error has occurred.
        </p>
        <Button 
          onClick={handleClick} 
          className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
        >
          Back To Dashboard
        </Button>
      </div>
    </div>
  );
}