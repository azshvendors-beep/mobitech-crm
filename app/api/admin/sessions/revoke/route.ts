import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as z from "zod";

const revokeSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // Check if admin is logged in
    const adminSession = await getSession();
    if (!adminSession.isLoggedIn || !adminSession.isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = revokeSchema.parse(json);

    if (!body.userId && !body.sessionId) {
      return new NextResponse("Either userId or sessionId must be provided", { 
        status: 400 
      });
    }

    if (body.sessionId) {
      // Revoke specific session
      await prisma.session.delete({
        where: {
          id: body.sessionId
        }
      });

      return NextResponse.json({ 
        message: "Session revoked successfully" 
      });
    }

    if (body.userId) {
      // Revoke all sessions for user
      await prisma.session.deleteMany({
        where: {
          userId: body.userId
        }
      });

      return NextResponse.json({ 
        message: "All sessions for user revoked successfully" 
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.flatten().fieldErrors), { status: 422 });
    }

    console.error("Session revocation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 