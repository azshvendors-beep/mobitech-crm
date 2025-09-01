import { prisma } from "@/lib/prisma";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { NextResponse } from "next/server";

// Create MFA secret & QR code
export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const secret = authenticator.generateSecret();

    if (!user.email) {
      return NextResponse.json(
        { success: false, error: "User email is required" },
        { status: 400 }
      );
    }

    const otpauth = authenticator.keyuri(user.email, "Mobitech-CRM", secret);

    const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

    // Save secret temporarily (user must verify before enabling MFA)
    await prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret, mfaVerified: false },
    });

    return NextResponse.json({ qrCodeDataUrl });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
