import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new NextResponse(
        JSON.stringify({ error: "Email and password are required" }),
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
    const comparePassword = await compare(password, user.password);
    if (!comparePassword) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };

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
    const tempToken = jwt.sign(payload, jwtSecret, {
      expiresIn: "5m", // Token expires in 5 minutes
      issuer: "mobitech-store",
      audience: "mobile-app",
    });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🔐 Your 2FA Verification Code",
      html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>2FA Verification Code</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f8fafc;
                        color: #1e293b;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 12px;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .header {
                        background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
                        padding: 32px 24px;
                        text-align: center;
                    }
                    .header h1 {
                        color: #ffffff;
                        margin: 0;
                        font-size: 24px;
                        font-weight: 600;
                    }
                    .header p {
                        color: #e0e7ff;
                        margin: 8px 0 0 0;
                        font-size: 16px;
                    }
                    .content {
                        padding: 32px 24px;
                        text-align: center;
                    }
                    .otp-container {
                        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                        border: 2px solid #e0e7ff;
                        border-radius: 12px;
                        padding: 24px;
                        margin: 24px 0;
                    }
                    .otp-code {
                        font-size: 32px;
                        font-weight: 700;
                        color: #4f46e5;
                        letter-spacing: 8px;
                        margin: 16px 0;
                        font-family: 'Courier New', monospace;
                    }
                    .info {
                        color: #64748b;
                        font-size: 14px;
                        line-height: 1.6;
                        margin: 16px 0;
                    }
                    .warning {
                        background-color: #fef3c7;
                        border-left: 4px solid #f59e0b;
                        padding: 16px;
                        margin: 24px 0;
                        border-radius: 0 8px 8px 0;
                    }
                    .warning p {
                        margin: 0;
                        color: #92400e;
                        font-size: 14px;
                    }
                    .footer {
                        background-color: #f8fafc;
                        padding: 24px;
                        text-align: center;
                        border-top: 1px solid #e2e8f0;
                    }
                    .footer p {
                        color: #64748b;
                        font-size: 12px;
                        margin: 0;
                    }
                    .logo {
                        font-size: 28px;
                        margin-bottom: 8px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">🔐</div>
                        <h1>Two-Factor Authentication</h1>
                        <p>Secure your account with a verification code</p>
                    </div>
                    
                    <div class="content">
                        <h2 style="color: #1e293b; margin-bottom: 16px;">Your Verification Code</h2>
                        <p style="color: #64748b; margin-bottom: 24px;">Enter this code to complete your login:</p>
                        
                        <div class="otp-container">
                            <div class="otp-code">${otp}</div>
                            <p style="color: #64748b; font-size: 14px; margin: 0;">This code expires in 5 minutes</p>
                        </div>
                        
                        <div class="warning">
                            <p><strong>Security Notice:</strong> Never share this code with anyone. Our team will never ask for your verification code.</p>
                        </div>
                        
                        <p class="info">
                            If you didn't request this code, please ignore this email and consider changing your password.
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated message. Please do not reply to this email.</p>
                        <p>&copy; 2025 Team Mobitech. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            `,
    };
    await prisma.otp.create({
      data: {
        identifier: email,
        otp,
        expiresAt,
      },
    });
    await transporter.sendMail(mailOptions);
    return NextResponse.json({
      message: "Login successful",
      tempToken: tempToken,
    });
  } catch (error) {
    console.error("Error in app-login route:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
