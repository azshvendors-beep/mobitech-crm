import { NextResponse } from "next/server";
import { compare } from "bcrypt";
import { prisma } from "@/lib/prisma";
import * as z from "zod";
import { getSession } from "@/lib/session";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

const signinSchema = z.object({
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(10, "Phone number must not exceed 10 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
  password: z.string()
    .min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = signinSchema.parse(json);

    const user = await prisma.user.findUnique({
      where: { phone: body.phone },
      select: {
        id: true,
        password: true,
        isAdmin: true,
      }
    });

    if (!user) {
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    const isValidPassword = await compare(body.password, user.password);

    if (!isValidPassword) {
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    // Get IP address and user agent
    const headersList = headers();
    const forwardedFor = (await headersList).get("x-forwarded-for") || "";
    const ipAddress = forwardedFor.split(",")[0] || "127.0.0.1";
    const userAgent = (await headersList).get("user-agent") || "";
    
    // Parse user agent
    const parser = new UAParser(userAgent);
    const browserInfo = parser.getBrowser();
    const osInfo = parser.getOS();
    const deviceInfo = parser.getDevice();

    // Create a new session in the database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Session expires in 7 days

    const dbSession = await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt,
        ipAddress,
        userAgent,
        device: deviceInfo.type || deviceInfo.vendor || null,
        browser: `${browserInfo.name || ""} ${browserInfo.version || ""}`.trim() || null,
        os: `${osInfo.name || ""} ${osInfo.version || ""}`.trim() || null,
      },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        browser: true,
        os: true,
        device: true,
      },
    });

    // Set the cookie session
    const session = await getSession();
    session.userId = user.id;
    session.isLoggedIn = true;
    session.isAdmin = user.isAdmin;
    await session.save();

    return NextResponse.json({
      sessionId: dbSession.id,
      userId: dbSession.userId,
      isAdmin: user.isAdmin,
      expiresAt: dbSession.expiresAt,
      device: {
        browser: dbSession.browser,
        os: dbSession.os,
        device: dbSession.device,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.flatten().fieldErrors), { status: 422 });
    }

    console.error("Signin error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 