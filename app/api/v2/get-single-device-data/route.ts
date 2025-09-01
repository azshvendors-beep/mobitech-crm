import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function POST(req: NextRequest) {
  const { paramsTestId } = await req.json();
  if (!paramsTestId) {
    return NextResponse.json(
      { result: "error", message: "Test ID is required" },
      { status: 400 }
    );
  }

  try {
    const testDetailsEmployee  = await prisma.deviceTest.findUnique({
      where: { testId: paramsTestId },
      
    });
    const test = await prisma.deviceTest.findUnique({
      where: { testId: paramsTestId },
      include: {
       
        connectivityTestResults: true,
        deviceTestResults: true,
        screenTest: true,
        audioTest: true,
        proximitySensorTest: true,
        cameraTest: true,
        fingerprintTest: true,
        usbTest: true,
        audioJackTest: true,
        simTestResults: true,
      
      },
    });

    
    if (!test) {
      return NextResponse.json(
        { result: "error", message: "Test not found" },
        { status: 404 }
      );
    }

    const createdAtIST = new Date(test.createdAt).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const device = test.device as {
      brand?: string;
      model?: string;
      ram?: string;
      rom?: string;
    };

    const formatted = {
      performedBy: testDetailsEmployee?.employeeId,
      performedByImage: testDetailsEmployee?.imageUrl,
      testId: test.testId,
      imei1: test.imei1,
      imei2: test.imei2,
      brand: device?.brand ?? "Unknown",
      model: device?.model ?? "Unknown",
      ram: device?.ram ?? "Unknown",
      rom: device?.rom ?? "Unknown",
      connectivityTestResults: test.connectivityTestResults,
      deviceTestResults: test.deviceTestResults,
      screenTest: test.screenTest,
      simTestResults: test.simTestResults,
      audioTest: test.audioTest,
      proximitySensorTest: test.proximitySensorTest,
      cameraTest: test.cameraTest,
      fingerprintTest: test.fingerprintTest,
      usbTest: test.usbTest,
      audioJackTest: test.audioJackTest,
      createdAt: createdAtIST,

    };

    return NextResponse.json({
      result: "success",
      data: formatted,
      status: 200,
    });
  } catch (error) {
    console.error("POST /api/v2/get-single-device-data error:", error);
    return NextResponse.json(
      { result: "error", message: "Failed to fetch QC report" },
      { status: 500 }
    );
  }
}