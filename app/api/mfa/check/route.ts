import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    console.log(session.userId);

    if (!session.userId) {
      return NextResponse.json(
        JSON.stringify({ error: "User not authenticated" }),
        { status: 401 }
      );
    }
    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
    });

    if (!user) {
      return NextResponse.json(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

   return NextResponse.json({
     isMfaEnabled: user.mfaEnabled,
     userId: user.id
   });
  } catch (error) {
    console.error("Error in MFA check:", error);
    return NextResponse.json(
      JSON.stringify({ error: "Failed to check MFA status" }),
      { status: 500 }
    );
  }
}
