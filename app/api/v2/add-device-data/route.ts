import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const GOOGLE_SERVICE_EMAIL = process.env.GOOGLE_SERVICE_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_SERVICE_PRIVATE_KEY!.replace(
  /\\n/g,
  "\n"
);

function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: GOOGLE_SERVICE_EMAIL,

    key: GOOGLE_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      testId,
      employeeId,
      imageUrl,
      expiresAt,
      deviceInfo,
      imeiInfo,
      connectivityTestResults,
      deviceTestResults,
      simTestResults,
      screenTest,
      audioTest,
      proximitySensorTest,
      cameraTest,
      fingerprintTest,
      usbTest,
      audioJackTest,
    } = body;



    if (!testId || !expiresAt || !deviceInfo) {
      return NextResponse.json(
        { result: "error", message: "Missing required fields" },
        { status: 400 }
      );
    }

    const sheets = getSheetsClient();
    const currentTime = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "DeviceTests!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            testId,
            employeeId,
            imageUrl,
            expiresAt,
            JSON.stringify(deviceInfo),
            imeiInfo?.imei1 || "",
            imeiInfo?.imei2 || "",
            currentTime,
            currentTime,
          ],
        ],
      },
    });

    const allResults: any[] = [];
    if (Array.isArray(connectivityTestResults)) {
      connectivityTestResults.forEach((test) =>
        allResults.push([
          testId,
          "connectivityTestResults",
          test.name,
          test.status,
          test.message,
          test.timestamp,
          currentTime,
        ])
      );
    }
    if (Array.isArray(deviceTestResults)) {
      deviceTestResults.forEach((test) => {
        console.log(test);
        allResults.push([
          testId,
          "deviceTestResults",
          test.name,
          test.status,
          test.message,
          test.timestamp,
          currentTime,
        ]);
      });
    }

    if (Array.isArray(simTestResults)) {
      simTestResults.forEach((test) =>
        allResults.push([
          testId,
          "simTestResults",
          test.name,
          test.status,
          // test.message,
          test.timestamp,
          currentTime,
        ])
      );
    }

    const singleTests = [
      { key: "screenTest", value: screenTest },
      { key: "audioTest", value: audioTest },
      { key: "proximitySensorTest", value: proximitySensorTest },
      { key: "cameraTest", value: cameraTest },
      { key: "fingerprintTest", value: fingerprintTest },
      { key: "usbTest", value: usbTest },
      { key: "audioJackTest", value: audioJackTest },
    ];
    singleTests.forEach(({ key, value }) => {
      if (value) {
        allResults.push([
          testId,
          key,
          "", // name (not present for these)
          value.status ?? value.completed ?? "",
          value.message ?? "",
          value.timestamp ?? "",
          currentTime,
        ]);
      }
    });
    if (allResults.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "TestResults!A1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: allResults,
        },
      });
    }

    syncToDatabase(body).catch((err) => {
      console.error("Background DB sync failed:", err);
    });

    return NextResponse.json({ result: "success", status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { result: "error", message: "An error occurred" },
      { status: 500 }
    );
  }
}

async function syncToDatabase(body: any) {

  console.log("Syncing to database:", body);
  // Use your Prisma schema to create DeviceTest and related records
  const final = await prisma.deviceTest.create({
    data: {
      testId: body.testId,
      employeeId: body.employeeId,
      imageUrl: body.imageUrl,
      expiresAt: new Date(body.expiresAt),
      device: body.deviceInfo,
      imei1: body.imeiInfo?.imei1 || "",
      imei2: body.imeiInfo?.imei2 || "",
      connectivityTestResults: {
        create: (body.connectivityTestResults || []).map((t: any) => ({
          name: t.name,
          status: t.status,
          message: t.message,
          timestamp: t.timestamp ? new Date(t.timestamp) : undefined,
        })),
      },
      deviceTestResults: {
        create: (body.deviceTestResults || []).map((t: any) => ({
          name: t.name,
          status: t.status,
          message: t.message,
          timestamp: t.timestamp ? new Date(t.timestamp) : undefined,
        })),
      },
      simTestResults: {
        create: (body.simTestResults || []).map((t: any) => ({
          name: t.name,
          status: t.status,
          // message: t.message,
          timestamp: t.timestamp ? new Date(t.timestamp) : undefined,
        })),
      },
      screenTest: body.screenTest
        ? {
            create: {
              multiTouch: body.screenTest.multiTouch,
              dotCoverage: body.screenTest.dotCoverage,
              completed: body.screenTest.completed,
              timestamp: body.screenTest.timestamp
                ? new Date(body.screenTest.timestamp)
                : undefined,
            },
          }
        : undefined,
      audioTest: body.audioTest
        ? {
            create: {
              speaker: body.audioTest.speaker,
              earReceiver: body.audioTest.earReceiver,
              microphone: body.audioTest.microphone,
              timestamp: body.audioTest.timestamp
                ? new Date(body.audioTest.timestamp)
                : undefined,
            },
          }
        : undefined,
      proximitySensorTest: body.proximitySensorTest
        ? {
            create: {
              status: body.proximitySensorTest.status,
              message: body.proximitySensorTest.message,
              timestamp: body.proximitySensorTest.timestamp
                ? new Date(body.proximitySensorTest.timestamp)
                : undefined,
            },
          }
        : undefined,
      cameraTest: body.cameraTest
        ? {
            create: {
              frontCamera: body.cameraTest.frontCamera,
              backCamera: body.cameraTest.backCamera,
              timestamp: body.cameraTest.timestamp
                ? new Date(body.cameraTest.timestamp)
                : undefined,
            },
          }
        : undefined,
      fingerprintTest: body.fingerprintTest
        ? {
            create: {
              status: body.fingerprintTest.status,
              message: body.fingerprintTest.message,
              timestamp: body.fingerprintTest.timestamp
                ? new Date(body.fingerprintTest.timestamp)
                : undefined,
            },
          }
        : undefined,
      usbTest: body.usbTest
        ? {
            create: {
              status: body.usbTest.status,
              message: body.usbTest.message,
              timestamp: body.usbTest.timestamp
                ? new Date(body.usbTest.timestamp)
                : undefined,
            },
          }
        : undefined,
      audioJackTest: body.audioJackTest
        ? {
            create: {
              status: body.audioJackTest.status,
              message: body.audioJackTest.message,
              timestamp: body.audioJackTest.timestamp
                ? new Date(body.audioJackTest.timestamp)
                : undefined,
            },
          }
        : undefined,
    },
    include: {
    connectivityTestResults: true,
    deviceTestResults: true,
    simTestResults: true,
    screenTest: true,
    audioTest: true,
    proximitySensorTest: true,
    cameraTest: true,
    fingerprintTest: true,
    usbTest: true,
    audioJackTest: true,
  },
  });

  // console.log("Final DB record:", final);
}
