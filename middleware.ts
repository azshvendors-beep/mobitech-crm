import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./lib/session";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const blockedRoutes = [
    "/maintenance", // Maintenance mode routes
    "/deprecated/(.*)", // Deprecated features
    "/api/auth/signup",
    "/auth/user/sign-up", // Old API version
    "/beta/(.*)", // Closed beta features
    "/internal/(.*)", // Internal tools
    "/disabled-feature", // Temporarily disabled feature
  ];

  const isBlockedPath = blockedRoutes.some((prefix) =>
    path.match(new RegExp(`^${prefix.replace(/\(.*\)/, ".*")}$`))
  );

  if (isBlockedPath) {
    // For API routes, return JSON response
    if (path.startsWith("/api/")) {
      return NextResponse.json(
        {
          error: "This endpoint is not available",
          message:
            "This route is currently blocked. Please contact support if you believe this is an error.",
        },
        { status: 403 }
      );
    }

    // For page routes, redirect to error page
    return NextResponse.redirect(new URL("/blocked", request.url));
  }

  const unprotectedPaths = [
    // Auth routes
    "/auth/user/sign-in",
    "/auth/user/sign-up",
    "/auth/forgot-password",
    "/auth/reset-password",
    // Public API routes
    "/api/auth/(.*)", // All auth endpoints
    "/api/v2/add-device-data", 
    "/api/v2/check-employee-id", // Example API route
    "/api/v2/verify-employee-selfie", // Example API route
    "/api/v3/get-individual-model-data", // Example API route
    "/api/v2/check-custom-model", // Example API route
    "/api/custom-model",
    "/api/v3/get-phone-details",
    "/api/auth/app-login", // Temporary login endpoint
    "/api/public/(.*)", // Public API namespace
    "/api/webhook/(.*)", // Webhook endpoints
    "/api/health", // Health check endpoint
    "/api/qc-reports", // Quality control reports
    "/api/otp/send",
    "/api/otp/verify",
    "/api/mfa/verify",
    "/api/aadhar/generate-otp",
    "/api/aadhar/verify-otp",
    "/api/voterId",
    "/api/welcome-employee-message",
    "/",
    "/blocked",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms-of-service",
    "/blocked", 
    "/mdt"
    // Add blocked route page to unprotected paths
  ];

  // Special handling for API routes
  if (path.startsWith("/api/")) {
    if (request.method === "OPTIONS") {
      return NextResponse.next();
    }

    const isPublicApi = unprotectedPaths.some((prefix) =>
      path.match(new RegExp(`^${prefix.replace(/\(.*\)/, ".*")}$`))
    );

    if (isPublicApi) {
      return NextResponse.next();
    }

    // Check for API authentication
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for admin-only API routes
    if (path.startsWith("/api/admin/") && !session.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.next();
  }

  // Handle regular page routes
  const isPublicPath = unprotectedPaths.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  const session = await getSession();

  if (!session.isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/user/sign-in", request.url));
  }

  if (path.startsWith("/admin") && !session.isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|apk|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
