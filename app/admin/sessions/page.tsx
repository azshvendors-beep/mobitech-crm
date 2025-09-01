'use client';

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/use-session";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

type Session = {
  id: string;
  createdAt: string;
  expiresAt: string;
  ipAddress: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  user: {
    id: string;
    phone: string;
    createdAt: string;
  };
};

type PaginationInfo = {
  total: number;
  pages: number;
  current: number;
  limit: number;
};

export default function SessionsPage() {
  const { session, loading } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);

  useEffect(() => {
    if (!loading && !session?.isLoggedIn) {
      router.push('/auth/user/sign-in');
    }
  }, [session, loading, router]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async (page = 1, userId?: string) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(userId && { userId }),
      });

      const response = await fetch(`/api/admin/sessions/list?${params}`);
      if (!response.ok) throw new Error('Failed to fetch sessions');

      const data = await response.json();
      setSessions(data.sessions);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      setIsRevoking(true);
      const response = await fetch('/api/admin/sessions/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) throw new Error('Failed to revoke session');

      // Refresh sessions list
      fetchSessions(pagination?.current || 1);
    } catch (error) {
      console.error('Error revoking session:', error);
    } finally {
      setIsRevoking(false);
    }
  };

  const revokeAllUserSessions = async (userId: string) => {
    try {
      setIsRevoking(true);
      const response = await fetch('/api/admin/sessions/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error('Failed to revoke sessions');

      // Refresh sessions list
      fetchSessions(pagination?.current || 1);
    } catch (error) {
      console.error('Error revoking sessions:', error);
    } finally {
      setIsRevoking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Active Sessions</h1>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires At
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{session.user.phone}</div>
                      <div className="text-sm text-gray-500">ID: {session.user.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{session.browser || 'Unknown browser'}</div>
                      <div className="text-sm text-gray-500">
                        {session.os} {session.device ? `• ${session.device}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(session.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(session.expiresAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeSession(session.id)}
                        disabled={isRevoking}
                        className="text-red-600 hover:text-red-900"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Revoke
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeAllUserSessions(session.user.id)}
                        disabled={isRevoking}
                        className="text-red-600 hover:text-red-900 ml-2"
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        Revoke All
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  onClick={() => fetchSessions(pagination.current - 1)}
                  disabled={pagination.current === 1}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => fetchSessions(pagination.current + 1)}
                  disabled={pagination.current === pagination.pages}
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{pagination.current}</span> of{' '}
                    <span className="font-medium">{pagination.pages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {[...Array(pagination.pages)].map((_, i) => (
                      <Button
                        key={i + 1}
                        onClick={() => fetchSessions(i + 1)}
                        variant={pagination.current === i + 1 ? "default" : "ghost"}
                        size="sm"
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium"
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 