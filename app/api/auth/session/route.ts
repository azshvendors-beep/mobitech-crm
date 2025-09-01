import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    
    if (session.isLoggedIn) {
      // Check if the database session is still valid
      const dbSession = await prisma.session.findFirst({
        where: {
          userId: session.userId,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!dbSession) {
      
        session.destroy();
        return NextResponse.json({
          userId: "",
          isLoggedIn: false,
          isAdmin: false,
        });
      }
    }
    
    return NextResponse.json({
      userId: session.userId,
      isLoggedIn: session.isLoggedIn,
      isAdmin: session.isAdmin,
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    
    if (session.isLoggedIn) {
      // Delete all sessions for this user from the database
      await prisma.session.deleteMany({
        where: {
          userId: session.userId,
        },
      });
    }
    
    session.destroy();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
} 