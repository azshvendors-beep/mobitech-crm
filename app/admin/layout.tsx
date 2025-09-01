"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Menu,
  X,
  ChevronDown,
  Home,
  Users,
  FileText,
  Settings,
  Truck,
  Boxes,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { adminNavigation } from "@/lib/navigation";
import Image from "next/image";
import AdminNavbar from "../../components/AdminNavbar";
import { getSession } from "@/lib/session";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
 
  const bottomNavItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: Home,
    },
    {
      title: "Items",
      href: "/admin/items",
      icon: Boxes,
    },
    {
      title: "Pickups",
      href: "/admin/pickups",
      icon: Truck,
    },
    {
      title: "Sales",
      href: "/admin/sales",
      icon: FileText,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  const checkIsMfaEnabled = async () => {
    try {
     
      const response = await fetch('/api/mfa/check');
      if (!response.ok) {
        throw new Error('Failed to check MFA status');
      }
      const data = await response.json();
      console.log("MFA Status:", data);
      data.isMfaEnabled === false && router.push(`/auth/mfa-setup?userId=${data.userId}`);
    } catch (error) {
      console.error("Error checking MFA status:", error);
      return false;
    }
  };

  useEffect(() => {
    // Check admin status on client side
    const checkAdminStatus = async () => {
      try {
        const response = await fetch("/api/auth/check-admin");
        if (!response.ok) {
          router.push("/auth/user/sign-in");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/auth/user/sign-in");
      } finally {
        setLoading(false);
      }
    };

    checkIsMfaEnabled();
    checkAdminStatus();
  }, [router]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMenu = (url: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [url]: !prev[url],
    }));
  };

  const renderNavItem = (item: any, depth = 0) => {
    const Icon = item.icon;
    const hasItems = item.items && item.items.length > 0;
    const isOpen = openMenus[item.url];

    return (
      <div key={item.url} className="space-y-0.5">
        <div
          className={cn(
            "group flex items-center justify-between",
            hasItems ? "cursor-pointer" : ""
          )}
          onClick={hasItems ? () => toggleMenu(item.url) : undefined}
        >
          <Link
            href={hasItems ? "#" : item.url}
            className={cn(
              "flex flex-1 items-center text-gray-300 hover:bg-gray-800 rounded-lg transition-colors",
              depth === 0 ? "px-2 py-1.5" : "px-2 py-1 text-sm"
            )}
            onClick={hasItems ? (e) => e.preventDefault() : undefined}
          >
            <div className="flex items-center flex-1 min-w-0">
              {Icon && (
                <div
                  className={cn(
                    "flex items-center justify-center rounded-lg text-blue-400 group-hover:bg-gray-700 flex-shrink-0",
                    depth === 0
                      ? "w-6 h-6 bg-gray-800 mr-2"
                      : "w-5 h-5 bg-gray-800/50 mr-1.5"
                  )}
                >
                  <Icon
                    className={cn(depth === 0 ? "h-4 w-4" : "h-3.5 w-3.5")}
                  />
                </div>
              )}
              <span
                className={cn(
                  "truncate",
                  depth === 0
                    ? "text-sm"
                    : "text-xs text-gray-400 group-hover:text-gray-300"
                )}
              >
                {item.title}
              </span>
            </div>
            {hasItems && (
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-gray-500 transition-transform mr-1 flex-shrink-0",
                  isOpen && "transform rotate-180"
                )}
              />
            )}
          </Link>
        </div>
        {hasItems && isOpen && (
          <div
            className={cn(
              "pl-3 ml-2 space-y-0.5 border-l border-gray-800",
              depth > 0 && "pl-2"
            )}
          >
            {item.items.map((subItem: any) =>
              renderNavItem(subItem, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-950 font-sans">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 rounded-md bg-gray-800 p-2 text-gray-400 lg:hidden hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
      >
        {isSidebarOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
        <span className="sr-only">Toggle sidebar</span>
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out",
          "w-[280px] sm:w-64 bg-gray-900",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0" // Always show on large screens
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header with Logo */}
          <div className="flex-shrink-0 p-4 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-white">Admin Panel</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-none hover:scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-900">
            <div className="space-y-4">
              {/* Main Navigation */}
              <div>
                <h2 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Main
                </h2>
                <div className="space-y-0.5">
                  {adminNavigation.main.map((item) => renderNavItem(item))}
                </div>
              </div>

              {/* Reports */}
              <div>
                <h2 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Reports
                </h2>
                <div className="space-y-0.5">
                  {adminNavigation.reports.map((item) => renderNavItem(item))}
                </div>
              </div>

              {/* Wallet */}
              <div>
                <h2 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Wallet
                </h2>
                <div className="space-y-0.5">
                  {adminNavigation.wallet.map((item) => renderNavItem(item))}
                </div>
              </div>

              {/* Secondary Navigation */}
              <div>
                <h2 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Other
                </h2>
                <div className="space-y-0.5">
                  {adminNavigation.navSecondary.map((item) =>
                    renderNavItem(item)
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* Footer with User Info */}
          <div className="flex-shrink-0 border-t border-gray-800 p-3">
            <div className="flex items-center space-x-3">
              {adminNavigation.user.avatar ? (
                <Image
                  src={adminNavigation.user.avatar}
                  alt={adminNavigation.user.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-gray-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-200 truncate">
                  {adminNavigation.user.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {adminNavigation.user.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          "flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50",
          "lg:pl-64"
        )}
      >
        {/* Navbar */}
        <AdminNavbar user={adminNavigation.user} />

        <div className="flex-1">
          <div className="">{children}</div>
        </div>
      </div>
      {/* Bottom Navigation - Only visible on mobile and tablet */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gray-950 border-none border-gray-200 lg:hidden rounded-t-md">
        <div className="flex justify-between w-full h-16 md:px-4 px-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center space-y-1  text-gray-300 font-sans font-stretch-semi-expanded hover:text-blue-600 transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
