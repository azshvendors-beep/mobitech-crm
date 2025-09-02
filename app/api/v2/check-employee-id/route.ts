import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId } = body;

    if (!employeeId) {
      return NextResponse.json(
        { result: "error", message: "Missing employeeId" },
        { status: 400 }
      );
    }

    const isValidEmployeeId = await checkEmployeeId(`MT${employeeId}`);

    if (isValidEmployeeId.success) {
      return NextResponse.json({
        result: "success",
        message: "Valid Employee ID",
        name: isValidEmployeeId.name,
      });
    } else {
      return NextResponse.json(
        { result: "error", message: "Invalid Employee ID" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error checking employee ID:", error);
    return NextResponse.json(
      { result: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function checkEmployeeId(employeeId: string) {

  const admin = await prisma.admin.findUnique({
    where: { employeeId },
    include: { user: true },
  });
  if(admin && admin.user.status === "ACTIVE") {
    return {
      success: true,
      name: admin.firstName + " " + admin.lastName,
      isMfaEnabled: admin.user.mfaEnabled,
      id: admin.user.id,
    };
  }

  const manager = await prisma.manager.findUnique({
    where: { employeeId },
    include: { user: true },
  });
  if (manager && manager.user.status === "ACTIVE")
    return {
      success: true,
      name: manager.firstName + " " + manager.lastName,
      isMfaEnabled: manager.user.mfaEnabled,
      id: manager.user.id,
    };

  const technician = await prisma.technician.findUnique({
    where: { employeeId },
    include: { user: true },
  });
  if (technician && technician.user.status === "ACTIVE")
    return {
      success: true,
      name: technician.firstName + " " + technician.lastName,
    };

  const fieldExecutive = await prisma.fieldExecutive.findUnique({
    where: { employeeId },
    include: { user: true },
  });
  if (fieldExecutive && fieldExecutive.user.status === "ACTIVE")
    return {
      success: true,
      name: fieldExecutive.firstName + " " + fieldExecutive.lastName,
    };

  const salesExecutive = await prisma.salesExecutive.findUnique({
    where: { employeeId },
    include: { user: true },
  });
  if (salesExecutive && salesExecutive.user.status === "ACTIVE")
    return {
      success: true,
      name: salesExecutive.firstName + " " + salesExecutive.lastName,
    };

  return {
    success: false,
  };
}
