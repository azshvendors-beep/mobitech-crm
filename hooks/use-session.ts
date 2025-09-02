import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SessionData } from "@/lib/session";

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getSession = async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        setSession(data);
        if (data.isLoggedIn) {
          // Don't redirect if we're already in the admin section
          if (window.location.pathname.startsWith('/admin')) {
            if (!data.isAdmin) {
              router.push('/dashboard');
            }
          } else if (data.isAdmin && window.location.pathname === '/auth/user/sign-in') {
            router.push('/admin/sessions');
          } else if (!window.location.pathname.startsWith('/admin')) {
            router.push('/user');
          }
        }
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error("Failed to get session:", error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSession();
  }, [router]);

  const login = async (phone: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      await getSession();
      
      // Redirect admin users to admin panel
      if (data.isAdmin) {
        router.push("/admin/sessions");
      } else {
        router.push("/user");
      }
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/session", {
        method: "DELETE",
      });
      setSession(null);
      router.push("/auth/user/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return {
    session,
    loading,
    login,
    logout,
  };
} 