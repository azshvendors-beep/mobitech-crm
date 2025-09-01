"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { PuffLoader } from "react-spinners";
import { format } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  Download,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { toast } from "sonner";

type TestResult = {
  deviceTestId: string;
  id: string;
  message: string;
  name: string;
  status: boolean;
  timestamp: string;
};

type QCEntry = {
  id?: string;
  testId: string;
  createdAt: string;
  brand: string;
  model: string;
  ram: string;
  rom: string;
  imei1: string;
  imei2: string;
  performedBy?: string;
  performedByImage?: string;

  // Test Results
  audioTest: {
    id: string;
    speaker: boolean;
    earReceiver: boolean;
    microphone: boolean;
    timestamp: string;
    deviceTestId: string;
  } | null;
  audioJackTest: {
    id: string;
    status: boolean;
    message: string;
    timestamp: string;
    deviceTestId: string;
  } | null;
  cameraTest: {
    id: string;
    frontCamera: boolean;
    backCamera: boolean;
    timestamp: string;
    deviceTestId: string;
  } | null;
  simTestResults: [
    {
      deviceTestId: string;
      id: string;
      // message: string;
      name: string;
      status: boolean;
      timestamp: string;
    }
  ];
  connectivityTestResults: TestResult[];
  deviceTestResults: TestResult[];
  fingerprintTest: {
    id: string;
    status: boolean;
    message: string;
    timestamp: string;
    deviceTestId: string;
  } | null;
  proximitySensorTest: {
    id: string;
    status: boolean;
    message: string;
    timestamp: string;
    deviceTestId: string;
  } | null;
  screenTest: {
    completed: boolean;
    deviceTestId: string;
    dotCoverage: boolean;
    id: string;
    multiTouch: boolean;
    timestamp: string;
  } | null;
  usbTest: {
    id: string;
    status: boolean;
    message: string;
    timestamp: string;
    deviceTestId: string;
  } | null;
};

const TestStatusIcon = ({ status }: { status: boolean | undefined | null }) => {
  if (status === undefined || status === null) {
    return <AlertCircle className="w-5 h-5 text-yellow-500" />;
  }
  return status ? (
    <CheckCircle2 className="w-5 h-5 text-green-500" />
  ) : (
    <XCircle className="w-5 h-5 text-red-500" />
  );
};
const TestStatusText = ({ status }: { status: boolean | undefined | null }) => {
  if (status === undefined || status === null) {
    return <AlertCircle className="w-5 h-5 text-yellow-500" />;
  }
  return status ? (
    <Badge className="text-white bg-green-500">Pass</Badge>
  ) : (
    <Badge className="bg-red-500 text-white">Fail</Badge>
  );
};

const EmployeeInfoCard = ({ qcData }: { qcData: QCEntry }) => {
  const [employeeName, setEmployeeName] = React.useState<string>("N/A");

  useEffect(() => {
    async function fetchEmployeeName() {
      if (!qcData.performedBy) return;
      try {
        const res = await fetch("/api/v2/get-employee-name", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeId: qcData.performedBy }),
        });
        if (res.ok) {
          const data = await res.json();
          setEmployeeName(data.name || "N/A");
        }
      } catch (err) {
        setEmployeeName("N/A");
      }
    }
    fetchEmployeeName();
  }, [qcData.performedBy]);

  const handleDownloadEmployeeDetails = async () => {
    try {
      // Download employee image if available
      if (qcData.performedByImage) {
        const response = await fetch(qcData.performedByImage);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `employee-${qcData.performedBy}-image.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      // Download employee ID as text file
      const employeeData = `Employee ID: ${
        qcData.performedBy || "N/A"
      }\nName: ${employeeName}\nTest ID: ${qcData.testId}\nDate: ${
        qcData.createdAt
      }`;

      const blob = new Blob([employeeData], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `employee-${qcData.performedBy}-details.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Employee details downloaded successfully");
    } catch (error) {
      console.error("Error downloading employee details:", error);
      toast.error("Failed to download employee details");
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={qcData.performedByImage} alt="Employee" />
          <AvatarFallback className="bg-primary/10">
            <User className="w-8 h-8 text-primary" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-lg">Employee Details</h3>
          <p className="text-muted-foreground">
            ID: {qcData.performedBy || "N/A"} | Name: {employeeName}
          </p>
        </div>
      </div>
      <Button
        onClick={handleDownloadEmployeeDetails}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Download
      </Button>
    </div>
  );
};

const CombinedTestResultsCard = ({ qcData }: { qcData: QCEntry }) => {
  const getAllTests = () => {
    const tests: Array<{
      name: string;
      status: boolean | null | undefined;
      message?: string;
    }> = [];
    // Connectivity Tests
    const nameMap: Record<string, string> = {
      bluetooth: "Bluetooth",
      wifi: "WiFi",
      gps: "GPS",
    };
    qcData.connectivityTestResults?.forEach((test) => {
      const displayName =
        nameMap[test.name.toLowerCase()] ||
        test.name.charAt(0).toUpperCase() + test.name.slice(1);
      tests.push({ name: displayName, status: test.status });
    });

    const deviceNameMap: Record<string, string> = {
      "Screen Lock Key Test": "Power Button",
      "Vibration Test": "Vibrator",
      "Volume Keys Test": "Volume Button",
    };
    qcData.deviceTestResults?.forEach((test) => {
      const displayName =
        deviceNameMap[test.name] ||
        test.name.charAt(0).toUpperCase() + test.name.slice(1);
      tests.push({ name: displayName, status: test.status });
    });

    // Device Tests
    // qcData.deviceTestResults?.forEach(test => {
    //   tests.push({ name: test.name, status: test.status });
    // });

    // Screen Tests
    if (qcData.screenTest) {
      tests.push({ name: "Multi-touch", status: qcData.screenTest.multiTouch });
      tests.push({
        name: "Screen Calibration",
        status: qcData.screenTest.dotCoverage,
      });
      // tests.push({ name: 'Screen completion', status: qcData.screenTest.completed });
    }

    // Audio Tests
    if (qcData.audioTest) {
      tests.push({ name: "Speaker", status: qcData.audioTest.speaker });
      tests.push({
        name: "Ear Receiver",
        status: qcData.audioTest.earReceiver,
      });
      tests.push({ name: "Microphone", status: qcData.audioTest.microphone });
    }

    // Camera Tests
    if (qcData.cameraTest) {
      tests.push({
        name: "Front Camera",
        status: qcData.cameraTest.frontCamera,
      });
      tests.push({ name: "Back Camera", status: qcData.cameraTest.backCamera });
    }

    // Sim Tests

    if (qcData.simTestResults) {
      tests.push({
        name: "SIM",
        status: qcData.simTestResults[0]?.status,
      });
    }

    // Single Tests
    if (qcData.fingerprintTest) {
      let fingerprintStatus = qcData.fingerprintTest.status;
      let fingerprintLabel = "Fingerprint";
      let fingerprintMessage = qcData.fingerprintTest.message;
      let unsupported =
        fingerprintMessage &&
        fingerprintMessage
          .toLowerCase()
          .includes("doesn't support fingerprint authentication");
      tests.push({
        name: unsupported
          ? "Fingerprint (Unsupported Hardware)"
          : fingerprintLabel,
        status: unsupported ? null : fingerprintStatus,
        ...(unsupported ? { message: "Unsupported Hardware" } : {}),
      });
    }
    if (qcData.proximitySensorTest) {
      tests.push({
        name: "Proximity Sensor",
        status: qcData.proximitySensorTest.status,
      });
    }
    if (qcData.usbTest) {
      tests.push({ name: "Charging Port", status: qcData.usbTest.status });
    }
    if (qcData.audioJackTest) {
      tests.push({ name: "Audio Jack", status: qcData.audioJackTest.status });
    }

    return tests;
  };

  const tests = getAllTests();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Test Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
            >
              <span className="font-medium text-sm">
                {test.name.charAt(0).toUpperCase() + test.name.slice(1)}
              </span>
              <div className="flex gap-2 justify-start w-[100px]">
                <TestStatusIcon status={test.status} />
                <TestStatusText status={test.status} />
              </div>
              {test.name.toLowerCase().includes("fingerprint") &&
                (test as any).message === "Unsupported Hardware" && (
                  <span className="ml-4 text-xs text-yellow-600 font-semibold">
                    Unsupported Hardware
                  </span>
                )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const DeviceInfoCard = ({ qcData }: { qcData: QCEntry }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="text-lg font-semibold">
        Device Information
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Brand</p>
          <p className="font-medium">{qcData.brand}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Model</p>
          <p className="font-medium">{qcData.model}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">RAM</p>
          <p className="font-medium">{qcData.ram}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Storage</p>
          <p className="font-medium">{qcData.rom}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">IMEI 1</p>
          <p className="font-medium">{qcData.imei1 || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">IMEI 2</p>
          <p className="font-medium">{qcData.imei2 || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">QC Code</p>
          <p className="font-bold text-lg text-white bg-blue-500 px-3 py-1 rounded-md inline-block">
            {qcData.testId}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function QCReportPage() {
  const params = useParams();
  const testId = params.testId as string;

  const { data: qcData, isLoading } = useQuery<QCEntry>({
    queryKey: ["qcReport", testId],
    queryFn: async () => {
      const res = await fetch(`/api/v2/get-single-device-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paramsTestId: testId }),
      });

      if (!res.ok) {
        toast.error("Failed to fetch QC report");
        throw new Error("Failed to fetch QC report");
      }

      const data = await res.json();

      if (data.result === "error") {
        toast.error(data.message);
        throw new Error(data.message);
      }

      return data?.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[--background] p-6 flex justify-center items-center">
        <PuffLoader color="#8956ff" />
      </div>
    );
  }

  if (!qcData) {
    return (
      <div className="min-h-screen bg-[--background] p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">QC Report Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The requested QC report could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  const getOverallStatus = () => {
    const allTests = [
      ...(qcData.connectivityTestResults || []),
      ...(qcData.deviceTestResults || []),
    ];
    const totalTests = allTests.length;
    const passedTests = allTests.filter((test) => test.status).length;
    const screenTestPassed =
      qcData.screenTest?.completed &&
      qcData.screenTest?.dotCoverage &&
      qcData.screenTest?.multiTouch;

    if (totalTests === 0) return "pending";
    if (passedTests === totalTests && screenTestPassed) return "passed";
    if (passedTests === 0) return "failed";
    return "partial";
  };

  const statusColors = {
    passed: "bg-green-500",
    failed: "bg-red-500",
    partial: "bg-yellow-500",
    pending: "bg-blue-500",
  };

  return (
    <div className="min-h-screen bg-[--background] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/admin/reports/qc-reports`}>
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">QC Report Details</h1>
          </div>
          <Badge className={statusColors[getOverallStatus()]}>
            {getOverallStatus().toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="w-full">
            <CardContent className="p-6 space-y-6">
              <EmployeeInfoCard qcData={qcData} />
              <Separator />
              <DeviceInfoCard qcData={qcData} />
            </CardContent>
          </Card>
        </div>

        <CombinedTestResultsCard qcData={qcData} />

        <div className="text-sm text-muted-foreground">
          <p>Created: {qcData.createdAt}</p>
        </div>
      </div>
    </div>
  );
}
