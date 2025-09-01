import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); 
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") as Role | undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    if (type === "employee") {
      // Fetch employees with their roles and user details
      const [employees, total] = await Promise.all([
        prisma.user.findMany({
          where: {
            AND: [
              { role: { not: "STORE_OWNER" } },
              ...(role ? [{ role }] : []),
              {
                OR: [
                  { email: { contains: search, mode: "insensitive" } },
                  { phone: { contains: search, mode: "insensitive" } },
                  {
                    manager: {
                      OR: [
                        { firstName: { contains: search, mode: "insensitive" } },
                        { lastName: { contains: search, mode: "insensitive" } },
                        { employeeId: { contains: search, mode: "insensitive" } },
                      ]
                    }
                  },
                  {
                    technician: {
                      OR: [
                        { firstName: { contains: search, mode: "insensitive" } },
                        { lastName: { contains: search, mode: "insensitive" } },
                        { employeeId: { contains: search, mode: "insensitive" } },
                      ]
                    }
                  },
                  {
                    fieldExecutive: {
                      OR: [
                        { firstName: { contains: search, mode: "insensitive" } },
                        { lastName: { contains: search, mode: "insensitive" } },
                        { employeeId: { contains: search, mode: "insensitive" } },
                      ]
                    }
                  },
                  {
                    salesExecutive: {
                      OR: [
                        { firstName: { contains: search, mode: "insensitive" } },
                        { lastName: { contains: search, mode: "insensitive" } },
                        { employeeId: { contains: search, mode: "insensitive" } },
                      ]
                    }
                  },{
                    admin:{
                      OR: [
                        // { firstName: { contains: search, mode: "insensitive" } },
                        // { lastName: { contains: search, mode: "insensitive" } },
                        { employeeId: { contains: search, mode: "insensitive" } },
                      ]
                    }
                  }
                ]
              }
            ]
          },
          include: {
            manager: true,
            technician: true,
            fieldExecutive: true,
            salesExecutive: true,
            admin: true,
          },
          skip,
          take: limit
        }),
        prisma.user.count({
          where: {
            AND: [
              { role: { not: "STORE_OWNER" } },
              ...(role ? [{ role }] : [])
            ]
          }
        })
      ]);


      // Transform the data to a consistent format
      const formattedEmployees = employees.map(user => {
        const employeeDetails = user.manager || user.technician || user.fieldExecutive || user.salesExecutive || user.admin;
        return {
          id: employeeDetails?.employeeId,
          name: employeeDetails && 'firstName' in employeeDetails && 'lastName' in employeeDetails
            ? `${employeeDetails.firstName ?? ""} ${employeeDetails.lastName ?? ""}`
            : "",
          email: user.email,
          dbId: user.id,
          phone: user.phone,
          role: user.role,
          status: user.status,
          aadharId: employeeDetails && 'aadharId' in employeeDetails ? employeeDetails.aadharId : undefined
        };
      });

      return NextResponse.json({
        data: formattedEmployees,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });

    } else if (type === "store") {
      // Fetch stores with their details
      const [stores, total] = await Promise.all([
        prisma.store.findMany({
          where: {
            OR: [
              { storeName: { contains: search, mode: "insensitive" } },
              { storeId: { contains: search, mode: "insensitive" } },
              { ownerName: { contains: search, mode: "insensitive" } },
              { ownerEmail: { contains: search, mode: "insensitive" } },
              { ownerPhone: { contains: search, mode: "insensitive" } }
            ]
          },
          include: {
            address: true,
            user: {
              select: {
                email: true,
                phone: true,
                role: true
              }
            }
          },
          skip,
          take: limit,
          orderBy: {
            storeId: 'asc'
          }
        }),
        prisma.store.count({
          where: {
            OR: [
              { storeName: { contains: search, mode: "insensitive" } },
              { storeId: { contains: search, mode: "insensitive" } },
              { ownerName: { contains: search, mode: "insensitive" } },
              { ownerEmail: { contains: search, mode: "insensitive" } },
              { ownerPhone: { contains: search, mode: "insensitive" } }
            ]
          }
        })
      ]);

      return NextResponse.json({
        data: stores,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    }

    return NextResponse.json(
      { error: "Invalid type parameter" },
      { status: 400 }
    );

  } catch (error) {
    console.error("List fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
} 