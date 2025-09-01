import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { identifier, message } = await req.json();
  console.log("Received OTP request for:", identifier, message);
  if (!identifier) {
    return Response.json(
      { success: false, error: "Phone number is required" },
      { status: 400 }
    );
  }

  if (!message) {
    return Response.json(
      { success: false, error: "Message is required" },
      { status: 400 }
    );
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Store OTP in DB
  await prisma.otp.create({
    data: { identifier, otp, expiresAt },
  });

  // --- Fast2SMS logic commented for development ---
  const response = await fetch(`${process.env.FAST2SMS_API_ENDPOINT!}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: process.env.FAST2SMS_API_KEY!,
    },
    body: JSON.stringify({
      route: "q",
      numbers: identifier,
      language: "english",
      message: `Dear Customer, ${otp} is the OTP for ${message}. Please DO NOT SHARE this with anyone. Team Mobitech`,
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fast2SMS Error:", errorText);
    throw new Error(`Failed to send OTP: ${response.statusText}`);
  }
  // --- End Fast2SMS logic ---

  // For development: Log OTP to console
  // console.log(`OTP for ${identifier}: ${otp}`);

  return Response.json({
    success: true,
    message: "OTP sent",
  });
}
