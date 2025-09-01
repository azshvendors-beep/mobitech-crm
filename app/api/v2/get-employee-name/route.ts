import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { employeeId } = await req.json();
    if (!employeeId) {
      return NextResponse.json({ result: "error", message: "Missing employeeId" }, { status: 400 });
    }

    console.log("Fetching name for employeeId:", employeeId);

    // Try to find employee in all possible roles
    let name = null;

    // Manager
    const manager = await prisma.manager.findUnique({ where: { employeeId: `MT${employeeId}` } });
    if (manager) name = `${manager.firstName} ${manager.lastName}`;

    // Technician
    if (!name) {
      const technician = await prisma.technician.findUnique({ where: { employeeId: `MT${employeeId}` } });
      if (technician) name = `${technician.firstName} ${technician.lastName}`;
    }

    // Field Executive
    if (!name) {
      const fieldExec = await prisma.fieldExecutive.findUnique({ where: { employeeId: `MT${employeeId}` } });
      if (fieldExec) name = `${fieldExec.firstName} ${fieldExec.lastName}`;
    }

    // Sales Executive
    if (!name) {
      const salesExec = await prisma.salesExecutive.findUnique({ where: { employeeId: `MT${employeeId}` } });
      if (salesExec) name = `${salesExec.firstName} ${salesExec.lastName}`;
    }

    // Admin
    if (!name) {
      const admin = await prisma.admin.findUnique({ where: { employeeId: `MT${employeeId}` } });
      if (admin) name = "Admin";
    }

    if (!name) {
      return NextResponse.json({ result: "error", message: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ result: "success", name });
  } catch (err) {
    return NextResponse.json({ result: "error", message: "Internal server error" }, { status: 500 });
  }
}
