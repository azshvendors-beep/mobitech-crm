import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
  try {
    // Check if admin is logged in
    const adminSession = await getSession();
    if (!adminSession.isLoggedIn || !adminSession.isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      ...(userId && { userId }),
      expiresAt: {
        gt: new Date(), // Only active sessions
      },
    };

    // Get sessions with user details
    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.session.count({ where }),
    ]);

    return NextResponse.json({
      sessions,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Session listing error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 