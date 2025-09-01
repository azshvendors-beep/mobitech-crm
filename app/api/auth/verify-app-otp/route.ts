import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return new NextResponse(JSON.stringify({ error: "Token is required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const jwtSecret =
      process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-here-make-it-long-and-random";
    if (!jwtSecret) {
      console.error("JWT_SECRET is not defined in environment variables");
      return new NextResponse(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const payload = jwt.verify(token, jwtSecret);
    if (!payload || typeof payload !== "object" || !payload.userId) {
      return new NextResponse(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return new NextResponse(
        JSON.stringify({ error: "Email and OTP are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const user = await prisma.user.findFirst({
      where: { email: email },
    
    });
    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const otpfromdb = await prisma.otp.findFirst({
      where: {
        identifier: email,
        otp: otp,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });
    if (!otpfromdb) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid or expired OTP" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    await prisma.otp.update({
      where: { id: otpfromdb.id },
      data: { used: true },
    });
    const finalToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );
    console.log("User:", user)
    return NextResponse.json(
      {
        token: finalToken,
        user: { id: user.id, email: user.email, role: user },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in app-login route:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
