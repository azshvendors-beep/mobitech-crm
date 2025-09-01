import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { phone, email, aadharId } = await req.json();

   
    const existingPhone = await prisma.user.findUnique({
      where: { phone }
    });

    if (existingPhone) {
      return NextResponse.json({
        field: "phone",
        message: "A user with this phone number already exists"
      }, { status: 409 });
    }

    // Check for existing user with email
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: { email }
      });

      if (existingEmail) {
        return NextResponse.json({
          field: "email",
          message: "A user with this email already exists"
        }, { status: 409 });
      }
    }

    // Check for existing aadhar ID across all employee types
    if (aadharId) {
      const existingAadhar = await prisma.user.findFirst({
        where: {
          OR: [
            { manager: { aadharId } },
            { technician: { aadharId } },
            { fieldExecutive: { aadharId } },
            { salesExecutive: { aadharId } }
          ]
        }
      });

      if (existingAadhar) {
        return NextResponse.json({
          field: "aadharId",
          message: "A user with this Aadhar number already exists"
        }, { status: 409 });
      }
    }

    return NextResponse.json({ 
      message: "Validation successful" 
    });

  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { message: "Validation failed", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 