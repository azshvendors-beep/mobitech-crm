import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { ownerPhone, ownerEmail } = await req.json();

    console.log('🔍 Validating store details:', { ownerPhone, ownerEmail });

    // Check for existing user with phone
    if (ownerPhone) {
      console.log('📱 Checking phone number:', ownerPhone);
      const existingPhone = await prisma.user.findUnique({
        where: { phone: ownerPhone },
        include: {
          store: true,
        }
      });

      if (existingPhone) {
        console.log('❌ Phone number already exists');
        return NextResponse.json({
          field: "phone",
          message: "A user with this phone number already exists"
        }, { status: 409 });
      }
    }

    // Check for existing store with email
    if (ownerEmail) {
      console.log('📧 Checking email:', ownerEmail);
      const existingEmail = await prisma.store.findFirst({
        where: { ownerEmail }
      });

      if (existingEmail) {
        console.log('❌ Email already exists');
        return NextResponse.json({
          field: "email",
          message: "A store with this email already exists"
        }, { status: 409 });
      }

      // Also check in user table for email
      const existingUserEmail = await prisma.user.findFirst({
        where: { email: ownerEmail }
      });

      if (existingUserEmail) {
        console.log('❌ Email already exists in user table');
        return NextResponse.json({
          field: "email",
          message: "A user with this email already exists"
        }, { status: 409 });
      }
    }

    console.log('✅ Validation passed');
    return NextResponse.json({
      message: "Validation successful"
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Store validation error:', error);
    return NextResponse.json({
      message: "Failed to validate store details",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 