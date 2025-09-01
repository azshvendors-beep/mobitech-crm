import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const tests = await prisma.deviceTest.findMany({
      orderBy: { createdAt: "desc" },

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
      },
    });

    if (!tests || tests.length === 0) {
      return NextResponse.json({ result: "success", data: [] });
    }

    const formatted = tests.map((test) => ({
      testId: test.testId,
      employeeId: test.employeeId ?? null,
      imageUrl: test.imageUrl ?? null,
      expiresAt: test.expiresAt,
      device: test.device,
      imei1: test.imei1,
      imei2: test.imei2,
      connectivityTestResults: test.connectivityTestResults,
      deviceTestResults: test.deviceTestResults,
      screenTest: test.screenTest,
      audioTest: test.audioTest,
      proximitySensorTest: test.proximitySensorTest,
      cameraTest: test.cameraTest,
      fingerprintTest: test.fingerprintTest,
      usbTest: test.usbTest,
      audioJackTest: test.audioJackTest,
      createdAt: test.createdAt,
    }));

    return NextResponse.json({ result: "success", data: formatted });
  } catch (error) {
    console.error("GET /api/v2/get-device-data error:", error);
    return NextResponse.json(
      { result: "error", message: "Failed to fetch device test data" },
      { status: 500 }
    );
  }
}
