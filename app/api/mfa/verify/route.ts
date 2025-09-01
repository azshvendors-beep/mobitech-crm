import { prisma } from "@/lib/prisma";
import { authenticator } from "otplib";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { userId, token } = await req.json();

    const session = await getSession()

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.mfaSecret) {
      return NextResponse.json(
        { success: false, message: "No MFA setup" },
        { status: 400 }
      );
    }

    const isValid = authenticator.verify({ token, secret: user.mfaSecret });

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid code" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true, mfaVerified: true },
    });

    return NextResponse.json({ success: true, isAdmin: session?.isAdmin });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Failed to verify MFA", error: error.message },
      { status: 500 }
    );
  }
}
