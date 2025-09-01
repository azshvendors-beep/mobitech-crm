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

// Generate unique employee/store ID
const generateId = async () => {
  const prefix = "MT";
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  const id = `${prefix}${random}`;

  // Check if ID exists
  const exists = await prisma.user.findFirst({
    where: {
      OR: [
        { manager: { employeeId: id } },
        { technician: { employeeId: id } },
        { fieldExecutive: { employeeId: id } },
        { salesExecutive: { employeeId: id } },
      ],
    },
  });

  // If ID exists, generate a new one
  if (exists) {
    return generateId();
  }

  return id;
};

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      type,
      storeId,
      firstName,
      lastName,
      email,
      phone,
      phoneVerified,
      password,
      // profilePicture,
      roleType,
      aadharNumber,
      bankDetails,
      documents,
      dateOfJoining,
      salary,
      payoutDate,
      // Get the provided ID
      // Store specific fields
      // storeName,
      // ownerName,
      // ownerPhone,
      // ownerEmail,
      // address,
    } = data;


    console.log("API Data:", data);  
    // Hash the password
    const hashedPassword = await hash(password, 12);

    if (type === "Employee") {
      // Create user first
      const existingUser = await prisma.user.findUnique({
        where: {
          phone,
        },
      });
      const existingUserwithEmail = await prisma.user.findUnique({
        where: {
          phone,
        },
      });

      if (existingUser) {
        return NextResponse.json(
          {
            message: "A user with this phone number  already exists",
          },
          { status: 409 }
        );
      } else if (existingUserwithEmail) {
        return NextResponse.json(
          {
            message: "A user with this email already exists",
          },
          { status: 409 }
        );
      }

      // Create user with document URLs
      const user = await prisma.user.create({
        data: {
          phone,
          phoneVerified,
          dateOfJoining: new Date(dateOfJoining),
          payoutDate,
          salary,
          storeId: storeId ? storeId : null,
          email,
          password: hashedPassword,
          role: ROLE_MAP[roleType as keyof typeof ROLE_MAP],
          profileImage: documents?.profilePicture,
          aadharFrontImage: documents?.aadharFront,
          aadharBackImage: documents?.aadharBack,
          qualificationImage: documents?.qualification,
          VehicleFrontImage:
            roleType === "Field Executive" ? documents?.vehicleFront : null,
          VehicleBackImage:
            roleType === "Field Executive" ? documents?.vehicleBack : null,
        },
      });

      // Create bank details
      const bankDetailsData = {
        accountNumber:
          bankDetails.type === "bank" ? bankDetails.accountNumber : null,
        ifsc: bankDetails.type === "bank" ? bankDetails.ifscCode : null,
        bankName: bankDetails.type === "bank" ? bankDetails.bankName : null,
        upiId: bankDetails.type === "upi" ? bankDetails.upiId : null,
        beneficiaryName: firstName + " " + lastName,
      };
let createdEmployee;
      // Create employee based on role type with the provided ID
      switch (roleType) {
        case "Store Manager":
          createdEmployee = await prisma.manager.create({
            data: {
              userId: user.id,
              firstName,
              lastName,
              employeeId: await generateId(), // Use provided ID
              aadharId: aadharNumber,
              bankDetails: {
                create: bankDetailsData,
              },
            },
          });
          break;

        case "Technician":
         createdEmployee = await prisma.technician.create({
            data: {
              userId: user.id,
              firstName,
              lastName,
              employeeId: await generateId(), // Use provided ID
              aadharId: aadharNumber,
              bankDetails: {
                create: bankDetailsData,
              },
            },
          });
          break;

        case "Field Executive":
         createdEmployee = await prisma.fieldExecutive.create({
            data: {
              userId: user.id,
              firstName,
              lastName,
              employeeId: await generateId(), // Use provided ID
              aadharId: aadharNumber,
              bankDetails: {
                create: bankDetailsData,
              },
            },
          });
          break;

        case "Sales Executive":
          createdEmployee = await prisma.salesExecutive.create({
            data: {
              userId: user.id,
              firstName,
              lastName,
              employeeId: await generateId(), // Use provided ID
              aadharId: aadharNumber,
              bankDetails: {
                create: bankDetailsData,
              },
            },
          });
          break;

        default:
          throw new Error("Invalid role type");
      }

      return NextResponse.json(
        {
          message: "Employee registered successfully",
          phone: phone,
          employeeId: createdEmployee.employeeId,
          name: `${firstName} ${lastName}`,
        },
        { status: 201 }
      );
    }
    // else {
    //   // Create store owner user

    //   const existingUser = await prisma.user.findUnique({
    //     where: {
    //       phone: ownerPhone,
    //     },
    //   });

    //   if (existingUser) {
    //     return NextResponse.json(
    //       {
    //         message: "A user with this phone number already exists",
    //       },
    //       { status: 409 }
    //     );
    //   }

    //   let bankDetailsData;

    //   if (bankDetails) {
    //     bankDetailsData = {
    //       accountNumber:
    //         bankDetails.type === "bank" ? bankDetails.accountNumber : null,
    //       ifsc: bankDetails.type === "bank" ? bankDetails.ifscCode : null,
    //       bankName: bankDetails.type === "bank" ? bankDetails.bankName : null,
    //       upiId: bankDetails.type === "upi" ? bankDetails.upiId : null,
    //       beneficiaryName: ownerName,
    //     };
    //   }
    //   const user = await prisma.user.create({
    //     data: {
    //       phone: ownerPhone,
    //       email: ownerEmail,
    //       password: hashedPassword,
    //       role: ROLE_MAP["Exchange Store"],
    //     },
    //   });

    //   // Create store with address and bank details
    //   await prisma.store.create({
    //     data: {
    //       userId: user.id,
    //       storeId: employeeId,
    //       storeName,
    //       ownerName,
    //       ownerPhone,
    //       ownerEmail,
    //       address: {
    //         create: {
    //           streetAddress: address.streetAddress,
    //           city: address.city,
    //           state: address.state,
    //           country: address.country,
    //           pinCode: address.pinCode,
    //         },
    //       },
    //       bankDetails: bankDetailsData
    //         ? {
    //             create: bankDetailsData,
    //           }
    //         : undefined,
    //     },
    //   });

    //   return NextResponse.json(
    //     {
    //       message: "Store registered successfully",
    //       storeId: employeeId,
    //     },
    //     { status: 201 }
    //   );
    // }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        message: "Failed to register",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { employeeId } = await req.json();
    if (!employeeId) {
      return NextResponse.json(
        { message: "Missing employeeId" },
        { status: 400 }
      );
    }
    const user = await terminateUserByEmployeeId(employeeId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "User terminated successfully", user });
  } catch (error) {
    console.error("Terminate error:", error);
    return NextResponse.json(
      {
        message: "Failed to terminate user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
