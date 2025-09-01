import { toast } from "sonner";

export async function logout() {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    // Force a hard reload to clear all client state
    window.location.href = '/auth/user/sign-in';
  } catch (error) {
    console.error('Logout error:', error);
    toast.error('Failed to logout. Please try again.');
    // Still redirect even if logout fails
    window.location.href = '/auth/user/sign-in';
  }
} 