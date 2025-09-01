'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Logout failed');
        }

        // Redirect to login page after successful logout
        router.push('/auth/user/sign-in');
      } catch (error) {
        console.error('Logout error:', error);
        // Still redirect to login page even if logout fails
        router.push('/auth/user/sign-in');
      }
    };

    logout();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Logging out...</h2>
        <p className="mt-2 text-sm text-gray-600">Please wait while we sign you out.</p>
      </div>
    </div>
  );
} 