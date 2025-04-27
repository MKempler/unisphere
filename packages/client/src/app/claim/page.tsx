'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function ClaimPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { verifyToken } = useAuth();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    async function verifyMagicLink() {
      if (!token) {
        toast.error('No token provided');
        router.push('/signup');
        return;
      }

      setIsVerifying(true);
      try {
        await verifyToken(token);
        router.push('/feed');
      } catch (error) {
        console.error('Error verifying token:', error);
        router.push('/signup');
      } finally {
        setIsVerifying(false);
      }
    }

    verifyMagicLink();
  }, [token, verifyToken, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Verifying your login...</h1>
        <div className="animate-pulse mt-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  );
} 