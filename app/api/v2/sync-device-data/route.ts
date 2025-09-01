import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import { get } from "http";

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
    const sheets = getSheetsClient();

    // Fetch device tests data
    const deviceTestsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "DeviceTests!A2:I",
    });

    // Fetch test results data
    const testResultsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "TestResults!A2:G",
    });

    const deviceTests = deviceTestsResponse.data.values || [];
    const testResults = testResultsResponse.data.values || [];

    let syncedRecords = 0;

    // Process each device test
    for (const test of deviceTests) {
      const [
        testId,
        employeeId,
        imageUrl,
        expiresAt,
        deviceInfo,
        imei1,
        imei2,
        createdAt,
        updatedAt,
      ] = test;

      // Get all test results for this test
      const testResultsForDevice = testResults.filter(
        (result) => result[0] === testId
      );
console.log()
      // Group test results by type
      const connectivityTestResults = testResultsForDevice
        .filter((result) => result[1] === "connectivityTestResults")
        .map((result) => ({
          name: result[2],
          status: result[3].toLowerCase() === "true",
          message: result[4],
          timestamp: result[5] ? new Date(result[5]) : undefined,
        }));

      const deviceTestResults = testResultsForDevice
        .filter((result) => result[1] === "deviceTestResults")
        .map((result) => ({
          name: result[2],
          status: result[3].toLowerCase() === "true",
          message: result[4],
          timestamp: result[5] ? new Date(result[5]) : undefined,
        }));


        console.log("Test Results for Device:", testResultsForDevice);
      // Get the latest test result for each special test type
      const getLatestTest = (type: string) => {
        const tests = testResultsForDevice.filter(
          (result) => result[1] === type
        );
        if (tests.length === 0) return null;
        // Sort by timestamp in descending order and get the first one
        return tests.sort((a, b) => {
          const dateA = a[5] ? new Date(a[5]).getTime() : 0;
          const dateB = b[5] ? new Date(b[5]).getTime() : 0;
          return dateB - dateA;
        })[0];
      };

      const screenTest = getLatestTest("screenTest");
      const audioTest = getLatestTest("audioTest");
      const proximitySensorTest = getLatestTest("proximitySensorTest");
      const cameraTest = getLatestTest("cameraTest");
      const fingerprintTest = getLatestTest("fingerprintTest");
      const usbTest = getLatestTest("usbTest");
      const audioJackTest = getLatestTest("audioJackTest");
      const simTestResult = getLatestTest("simTestResults");

      // console.log(simTestResult);
      // Create or update the device test record
      await prisma.deviceTest.upsert({
        where: { testId },
        update: {
          employeeId,
          imageUrl,
          expiresAt: new Date(expiresAt),
          device: JSON.parse(deviceInfo),
          imei1,
          imei2,
          connectivityTestResults: {
            deleteMany: {},
            create: connectivityTestResults,
          },
          deviceTestResults: {
            deleteMany: {},
            create: deviceTestResults,
          },
          screenTest: screenTest
            ? {
                upsert: {
                  create: {
                    multiTouch: true,
                    dotCoverage: true,
                    completed: screenTest[3].toLowerCase() === "true",
                    timestamp: screenTest[5]
                      ? new Date(screenTest[5])
                      : undefined,
                  },
                  update: {
                    multiTouch: true,
                    dotCoverage: true,
                    completed: screenTest[3].toLowerCase() === "true",
                    timestamp: screenTest[5]
                      ? new Date(screenTest[5])
                      : undefined,
                  },
                },
              }
            : undefined,
          audioTest: audioTest
            ? {
                upsert: {
                  create: {
                    speaker: true,
                    earReceiver: true,
                    microphone: true,
                    timestamp: audioTest[5]
                      ? new Date(audioTest[5])
                      : undefined,
                  },
                  update: {
                    speaker: true,
                    earReceiver: true,
                    microphone: true,
                    timestamp: audioTest[5]
                      ? new Date(audioTest[5])
                      : undefined,
                  },
                },
              }
            : undefined,
          proximitySensorTest: proximitySensorTest
            ? {
                upsert: {
                  create: {
                    status: proximitySensorTest[3].toLowerCase() === "true",
                    message: proximitySensorTest[4],
                    timestamp: proximitySensorTest[5]
                      ? new Date(proximitySensorTest[5])
                      : undefined,
                  },
                  update: {
                    status: proximitySensorTest[3].toLowerCase() === "true",
                    message: proximitySensorTest[4],
                    timestamp: proximitySensorTest[5]
                      ? new Date(proximitySensorTest[5])
                      : undefined,
                  },
                },
              }
            : undefined,
          cameraTest: cameraTest
            ? {
                upsert: {
                  create: {
                    frontCamera: true,
                    backCamera: true,
                    timestamp: cameraTest[5]
                      ? new Date(cameraTest[5])
                      : undefined,
                  },
                  update: {
                    frontCamera: true,
                    backCamera: true,
                    timestamp: cameraTest[5]
                      ? new Date(cameraTest[5])
                      : undefined,
                  },
                },
              }
            : undefined,
          fingerprintTest: fingerprintTest
            ? {
                upsert: {
                  create: {
                    status: fingerprintTest[3].toLowerCase() === "true",
                    message: fingerprintTest[4],
                    timestamp: fingerprintTest[5]
                      ? new Date(fingerprintTest[5])
                      : undefined,
                  },
                  update: {
                    status: fingerprintTest[3].toLowerCase() === "true",
                    message: fingerprintTest[4],
                    timestamp: fingerprintTest[5]
                      ? new Date(fingerprintTest[5])
                      : undefined,
                  },
                },
              }
            : undefined,
          usbTest: usbTest
            ? {
                upsert: {
                  create: {
                    status: usbTest[3].toLowerCase() === "true",
                    message: usbTest[4],
                    timestamp: usbTest[5] ? new Date(usbTest[5]) : undefined,
                  },
                  update: {
                    status: usbTest[3].toLowerCase() === "true",
                    message: usbTest[4],
                    timestamp: usbTest[5] ? new Date(usbTest[5]) : undefined,
                  },
                },
              }
            : undefined,
          audioJackTest: audioJackTest
            ? {
                upsert: {
                  create: {
                    status: audioJackTest[3].toLowerCase() === "true",
                    message: audioJackTest[4],
                    timestamp: audioJackTest[5]
                      ? new Date(audioJackTest[5])
                      : undefined,
                  },
                  update: {
                    status: audioJackTest[3].toLowerCase() === "true",
                    message: audioJackTest[4],
                    timestamp: audioJackTest[5]
                      ? new Date(audioJackTest[5])
                      : undefined,
                  },
                },
              }
            : undefined,
          simTestResults: simTestResult
            ? {
                upsert: {
                  where: { id: simTestResult[0] }, // Ensure a unique identifier is provided
                  create: {
                    name: simTestResult[2],
                    status: simTestResult[3].toLowerCase() === "true",
                    timestamp: simTestResult[5]
                      ? new Date(simTestResult[5])
                      : undefined,
                  },
                  update: {
                    name: simTestResult[2],
                    status: simTestResult[3].toLowerCase() === "true",
                    timestamp: simTestResult[5]
                      ? new Date(simTestResult[5])
                      : undefined,
                  },
                },
              }
            : undefined,
        },
        create: {
          testId,
          employeeId,
          imageUrl,
          expiresAt: new Date(expiresAt),
          device: JSON.parse(deviceInfo),
          imei1,
          imei2,
          connectivityTestResults: {
            create: connectivityTestResults,
          },
          deviceTestResults: {
            create: deviceTestResults,
          },
          screenTest: screenTest
            ? {
                create: {
                  multiTouch: true,
                  dotCoverage: true,
                  completed: screenTest[3].toLowerCase() === "true",
                  timestamp: screenTest[5]
                    ? new Date(screenTest[5])
                    : undefined,
                },
              }
            : undefined,
          audioTest: audioTest
            ? {
                create: {
                  speaker: true,
                  earReceiver: true,
                  microphone: true,
                  timestamp: audioTest[5] ? new Date(audioTest[5]) : undefined,
                },
              }
            : undefined,
          proximitySensorTest: proximitySensorTest
            ? {
                create: {
                  status: proximitySensorTest[3].toLowerCase() === "true",
                  message: proximitySensorTest[4],
                  timestamp: proximitySensorTest[5]
                    ? new Date(proximitySensorTest[5])
                    : undefined,
                },
              }
            : undefined,
          cameraTest: cameraTest
            ? {
                create: {
                  frontCamera: true,
                  backCamera: true,
                  timestamp: cameraTest[5]
                    ? new Date(cameraTest[5])
                    : undefined,
                },
              }
            : undefined,
          fingerprintTest: fingerprintTest
            ? {
                create: {
                  status: fingerprintTest[3].toLowerCase() === "true",
                  message: fingerprintTest[4],
                  timestamp: fingerprintTest[5]
                    ? new Date(fingerprintTest[5])
                    : undefined,
                },
              }
            : undefined,
          usbTest: usbTest
            ? {
                create: {
                  status: usbTest[3].toLowerCase() === "true",
                  message: usbTest[4],
                  timestamp: usbTest[5] ? new Date(usbTest[5]) : undefined,
                },
              }
            : undefined,
          audioJackTest: audioJackTest
            ? {
                create: {
                  status: audioJackTest[3].toLowerCase() === "true",
                  message: audioJackTest[4],
                  timestamp: audioJackTest[5]
                    ? new Date(audioJackTest[5])
                    : undefined,
                },
              }
            : undefined,
        },
      });

      syncedRecords++;
    }

    return NextResponse.json({
      result: "success",
      syncedRecords,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { result: "error", message: "Failed to sync data" },
      { status: 500 }
    );
  }
}
