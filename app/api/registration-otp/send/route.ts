import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { identifier, message } = await req.json();
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

  // 1. Try WhatsApp OTP (primary)
  const whatsappUrl = `https://www.fast2sms.com/dev/whatsapp?authorization=${process.env.FAST2SMS_API_KEY!}&message_id=4131&numbers=${identifier}&variables_values=${otp}`;
  let response1, response2;
  let usedMedium = "whatsapp";
  try {
    response1 = await fetch(whatsappUrl, { method: "GET" });
  } catch (err) {
    response1 = { ok: false };
  }

  if (response1 && response1.ok) {
    return Response.json({
      success: true,
      message: "OTP sent on WhatsApp",
      medium: "whatsapp",
    });
  }

  // 2. Fallback to SMS if WhatsApp fails
  usedMedium = "sms";
  response2 = await fetch(`${process.env.FAST2SMS_API_ENDPOINT!}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: process.env.FAST2SMS_API_KEY!,
    },
    body: JSON.stringify({
      route: "q",
      numbers: identifier,
      language: "english",
      message: `Dear Employee, ${otp} is the OTP for your registration. Please DO NOT SHARE this with anyone. Team Mobitech`,
    }),
  });
  if (response2.ok) {
    return Response.json({
      success: true,
      message: "OTP sent via SMS",
      medium: "sms",
    });
  } else {
    const errorText = await response2.text();
    console.error("Fast2SMS Error:", errorText);
    return Response.json({
      success: false,
      error: "Failed to send OTP via WhatsApp and SMS",
    }, { status: 500 });
  }
}
