import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Check if phone number already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
      select: { phone: true }
    });

    return NextResponse.json({
      exists: !!existingUser,
      message: existingUser 
        ? "Phone number is already registered" 
        : "Phone number is available"
    });

  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate phone number" },
      { status: 500 }
    );
  }
} 