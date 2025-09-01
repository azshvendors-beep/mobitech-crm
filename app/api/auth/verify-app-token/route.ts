import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getTokenInfo } from "@/constants/const";

export async function GET(req: NextRequest) {
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

    console.log("Verifying token:", token);

    const payload = jwt.verify(token, jwtSecret);
    if (!payload || typeof payload !== "object" || !payload.userId) {
      return new NextResponse(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Token verified successfully:", payload);
    if (typeof payload.exp !== "number" || typeof payload.iat !== "number") {
      return new NextResponse(
        JSON.stringify({ error: "Invalid token payload" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const tokenInfo = await getTokenInfo(payload);
    if (tokenInfo?.isValid === false && tokenInfo?.isExpired === true) {
      return new NextResponse(JSON.stringify({ error: "Token is expired" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
