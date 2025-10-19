import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
// Zod schema for validation

export async function POST(request: NextRequest) {
  try {
    const { employeeId } = await request.json();
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

const roleMapper = [
  { key: "MANAGER", label: "Store Manager", table: "manager" },
  { key: "TECHNICIAN", label: "Technician", table: "technician" },
  { key: "FIELD_EXECUTIVE", label: "Field Executive", table: "fieldExecutive" },
  { key: "MARKETING_EXECUTIVE", label: "Sales Executive", table: "salesExecutive" },
];

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Request body:", body);

    // Destructure all required fields
    const { employeeId, roleType, phone, salary, payoutDate, bankDetails } = body;
    if (!employeeId || !roleType) {
      return NextResponse.json(
        { error: "Missing employeeId or roleType" },
        { status: 400 }
      );
    }

    // Map roleType (label) to table name
    const role = roleMapper.find(r => r.label === roleType);
    if (!role) {
      return NextResponse.json(
        { error: `Invalid roleType: ${roleType}` },
        { status: 400 }
      );
    }

    const tableName = role.table as keyof typeof modelMap;
    console.log("Updating employee:", employeeId, "Table:", tableName);

    // Type-safe model map for Prisma
    const modelMap = {
      manager: prisma.manager,
      technician: prisma.technician,
      fieldExecutive: prisma.fieldExecutive,
      salesExecutive: prisma.salesExecutive,
    };
    const model = modelMap[tableName];
    if (!model) {
      return NextResponse.json(
        { error: `Invalid table name: ${tableName}` },
        { status: 400 }
      );
    }


    // 1. Find the employee record by employeeId
    const employee = await (model as any).findUnique({ where: { employeeId } });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // 2. Update User using employee.userId
    await prisma.user.update({
      where: { id: employee.userId },
      data: {
        phone,
        salary,
        payoutDate,
      },
    });

    // 3. Upsert BankDetails
    let bankDetailsUpdate: any = {};
    if (bankDetails.type === "upi") {
      bankDetailsUpdate = {
        upiId: bankDetails.upiId,
        accountNumber: null,
        ifsc: null,
        bankName: null,
      };
    } else {
      bankDetailsUpdate = {
        upiId: null,
        accountNumber: bankDetails.accountNumber,
        ifsc: bankDetails.ifscCode,
        bankName: bankDetails.bankName,
      };
    }

    // Upsert BankDetails for the correct relation field
    let bankDetailsWhere: any = {};
    if (tableName === "manager") bankDetailsWhere = { managerId: employee.userId };
    if (tableName === "technician") bankDetailsWhere = { technicianId: employee.userId };
    if (tableName === "fieldExecutive") bankDetailsWhere = { fieldExecId: employee.userId };
    if (tableName === "salesExecutive") bankDetailsWhere = { salesExecId: employee.userId };

    // Prisma requires at least one unique field for upsert
    if (Object.keys(bankDetailsWhere).length === 0) {
      return NextResponse.json({ error: "Could not determine BankDetails relation field" }, { status: 400 });
    }

    await prisma.bankDetails.upsert({
      where: bankDetailsWhere,
      update: bankDetailsUpdate,
      create: {
        ...bankDetailsUpdate,
        ...bankDetailsWhere,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ERR_UPDT_EMP:", error);
    return NextResponse.json({ error: "ERR_UPDAT_EMP" }, { status: 500 });
  }
}
