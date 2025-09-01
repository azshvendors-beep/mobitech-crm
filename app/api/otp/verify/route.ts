import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { identifier, otp } = await req.json();
  if (!identifier || !otp) {
    return Response.json({ success: false, error: "Identifier and OTP are required" }, { status: 400 });
  }
  // Find OTP entry
  const otpEntry = await prisma.otp.findFirst({
    where: {
      identifier,
      otp,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });
  if (!otpEntry) {
    // Optionally increment attempts here
    return Response.json({ success: false, error: "Invalid or expired OTP" }, { status: 400 });
  }
  // Mark as used
  await prisma.otp.update({
    where: { id: otpEntry.id },
    data: { used: true },
  });
  return Response.json({ success: true, message: "OTP verified successfully" });
} 