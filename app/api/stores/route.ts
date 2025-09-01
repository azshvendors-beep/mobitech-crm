import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import { hash } from "bcryptjs";
import { terminateUserByEmployeeId } from "@/lib/terminate-user";

const prisma = new PrismaClient();

const ROLE_MAP = {
  Technician: "TECHNICIAN",
  "Field Executive": "FIELD_EXECUTIVE",
  "Sales Executive": "MARKETING_EXECUTIVE",
  "Store Manager": "MANAGER",
  "Exchange Store": "STORE_OWNER",
} as const;

const generateId = async () => {
  const prefix = "STR";
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  const id = `${prefix}${random}`;

  // Check if ID exists
  const exists = await prisma.user.findFirst({
    where: {
      OR: [{ store: { storeId: id } }],
    },
  });

  if (exists) {
    return generateId();
  }

  return id;
};

export async function GET() {
  try {
    const stores = await prisma.store.findMany({});
    if (!stores) {
      return NextResponse.json(
        {
          message: "No stores found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(stores, { status: 200 });
  } catch (error) {}
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      storeName,
      address,
      ownerName,
      ownerPhone,
      ownerEmail,
      password,
      bankDetails,
    } = body;

    // Validate request body
    if (!storeName || !address || !ownerName || !ownerPhone || !ownerEmail) {
      return NextResponse.json(
        {
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    // Generate a unique store ID
    const storeId = await generateId();
    const hashedPassword = await hash(password, 12);

    //   // Create store owner user

    const existingUser = await prisma.user.findUnique({
      where: {
        phone: ownerPhone,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "A user with this phone number already exists",
        },
        { status: 409 }
      );
    }

    let bankDetailsData;

    if (bankDetails) {
      bankDetailsData = {
        accountNumber:
          bankDetails.type === "bank" ? bankDetails.accountNumber : null,
        ifsc: bankDetails.type === "bank" ? bankDetails.ifscCode : null,
        bankName: bankDetails.type === "bank" ? bankDetails.bankName : null,
        upiId: bankDetails.type === "upi" ? bankDetails.upiId : null,
        beneficiaryName: ownerName,
      };
    }
    const user = await prisma.user.create({
      data: {
        phone: ownerPhone,
        email: ownerEmail,
        password: hashedPassword,
        role: ROLE_MAP["Exchange Store"],
      },
    });

    // Create store with address and bank details
    await prisma.store.create({
      data: {
        userId: user.id,
        storeId: storeId,
        storeName,
        ownerName,
        ownerPhone,
        ownerEmail,
        address: {
          create: {
            streetAddress: address.streetAddress,
            city: address.city,
            state: address.state,
            country: address.country,
            pinCode: address.pinCode,
          },
        },
        bankDetails: bankDetailsData
          ? {
              create: bankDetailsData,
            }
          : undefined,
      },
    });

    return NextResponse.json(
      {
        message: "Store registered successfully",
        storeId: storeId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating store:", error);
    return NextResponse.json(
      {
        message: "Error creating store",
      },
      { status: 500 }
    );
  }
}
