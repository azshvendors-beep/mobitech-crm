import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
 
) {
  try {
   const {employeeId} = await request.json();
    if (!employeeId) {
      return NextResponse.json(
        { error: "Missing employeeId" },
        { status: 400 }
      );
    }

    // Try to find the employee from all possible tables
    let employee: any = null;
    let user: any = null;
    let role: string | null = null;

    // Check all employee types
    const manager = await prisma.manager.findUnique({
      where: { employeeId },
      include: { user: true, bankDetails: true },
    });

    if (manager) {
      employee = manager;
      user = manager.user;
      role = "MANAGER";
    } else {
      const technician = await prisma.technician.findUnique({
        where: { employeeId },
        include: { user: true, bankDetails: true },
      });

      if (technician) {
        employee = technician;
        user = technician.user;
        role = "TECHNICIAN";
      } else {
        const fieldExecutive = await prisma.fieldExecutive.findUnique({
          where: { employeeId },
          include: { user: true, bankDetails: true },
        });

        if (fieldExecutive) {
          employee = fieldExecutive;
          user = fieldExecutive.user;
          role = "FIELD_EXECUTIVE";
        } else {
          const salesExecutive = await prisma.salesExecutive.findUnique({
            where: { employeeId },
            include: { user: true, bankDetails: true },
          });

          if (salesExecutive) {
            employee = salesExecutive;
            user = salesExecutive.user;
            role = "MARKETING_EXECUTIVE";
          }
        }
      }
    }

    if (!employee || !user) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      employee,
      user,
      role,
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}