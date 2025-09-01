import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const reports = await prisma.deviceTest.findMany({
      select: {
        id: true,
        testId: true,
        createdAt: true,
      },
    });

    const formattedReports = reports.map((report) => ({
      id: report.id,
      testId: report.testId,
      createdAt: formatToIST(report.createdAt.toISOString()),
    }));

    return NextResponse.json(formattedReports);
  } catch (error) {
    console.error("Error fetching QC reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch QC reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { testId } = await request.json();
    const report = await prisma.deviceTest.findUnique({
      where: { testId },
    });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    return NextResponse.json(true);
  } catch (error) {
    console.error("Error fetching QC reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch QC reports" },
      { status: 500 }
    );
  }
}

function formatToIST(dateString: string): string {
  const date = new Date(dateString);
  // const istOffset = 5.5 * 60; // IST offset in minutes
  const istDate = new Date(date.getTime() + 60 * 1000);

  const day = String(istDate.getDate()).padStart(2, "0");
  const month = String(istDate.getMonth() + 1).padStart(2, "0");
  const year = istDate.getFullYear();
  const hours = String(istDate.getHours()).padStart(2, "0");
  const minutes = String(istDate.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
