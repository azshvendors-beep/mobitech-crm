"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { PuffLoader } from "react-spinners";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
// import { useGlobalUserStore } from "@/store/globalStore";

type QCEntry = {
  id?: string;
  testId: string;
  createdAt: string;
  device: {
    brand: string;
    model: string;
    ram: string;
    rom: string;
  };
  imei1: string;
  imei2: string;
  expiresAt: string;
  employeeId: string;
  imageUrl: string;
  
  // Test Results
  audioTest: any | null;
  audioJackTest: any | null;
  cameraTest: any | null;
  connectivityTestResults: Array<{
    deviceTestId: string;
    id: string;
    message: string;
    name: string;
    status: boolean;
    timestamp: string;
  }>;
  deviceTestResults: Array<{
    deviceTestId: string;
    id: string;
    message: string;
    name: string;
    status: boolean;
    timestamp: string;
  }>;
  fingerprintTest: any | null;
  proximitySensorTest: any | null;
  screenTest: {
    completed: boolean;
    deviceTestId: string;
    dotCoverage: boolean;
    id: string;
    multiTouch: boolean;
    timestamp: string;
  } | null;
  usbTest: any | null;
};

const searchSchema = z.object({
  search: z.string().optional(),
});

const QCReports = () => {
  const { data: qcReports = [], isLoading } = useQuery<QCEntry[]>({
    queryKey: ["qcReports"],
    queryFn: async () => {
      const res = await axios.get("/api/v2/get-device-data");
      return res.data.data;
    },
  });

  // Store employee names for each employeeId
  const [employeeNames, setEmployeeNames] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    async function fetchAllEmployeeNames() {
      const ids = Array.from(new Set(qcReports.map((qc) => qc.employeeId).filter(Boolean)));
      const names: Record<string, string> = {};
      await Promise.all(
        ids.map(async (id) => {
          if (!id || employeeNames[id]) return;
          try {
            const res = await fetch("/api/v2/get-employee-name", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ employeeId: id }),
            });
            if (res.ok) {
              const data = await res.json();
              names[id] = data.name || "N/A";
            } else {
              names[id] = "N/A";
            }
          } catch {
            names[id] = "N/A";
          }
        })
      );
      if (Object.keys(names).length > 0) {
        setEmployeeNames((prev) => ({ ...prev, ...names }));
      }
    }
    if (qcReports.length > 0) fetchAllEmployeeNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qcReports]);

  // const { globalData } = useGlobalUserStore();
  // const id = globalData?.id || "1";
  const BASE_URL = `/admin`;

  const { register, watch } = useForm({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      search: "",
    },
  });

  const searchValue = watch("search")?.toLowerCase();

  const filteredReports = qcReports.filter((qc: any) => {
    const matchTestId = qc.testId?.toLowerCase().includes(searchValue || "");
    const matchIMEI1 = qc.imei1?.toLowerCase().includes(searchValue || "");
    const matchIMEI2 = qc.imei2?.toLowerCase().includes(searchValue || "");
    const matchModel = qc.device?.model?.toLowerCase().includes(searchValue || "");
    const matchBrand = qc.device?.brand?.toLowerCase().includes(searchValue || "");
    const matchEmployeeId = qc.employeeId?.toLowerCase().includes(searchValue || "");
    return matchTestId || matchIMEI1 || matchIMEI2 || matchModel || matchBrand || matchEmployeeId;
  });

  const getTestStatusSummary = (qc: QCEntry) => {
    const totalTests = (qc.connectivityTestResults?.length || 0) + (qc.deviceTestResults?.length || 0);
    const passedTests = [
      ...(qc.connectivityTestResults || []),
      ...(qc.deviceTestResults || []),
    ].filter(test => test.status).length;
    
    return {
      total: totalTests,
      passed: passedTests,
      screenTestPassed: qc.screenTest?.completed && qc.screenTest?.dotCoverage && qc.screenTest?.multiTouch
    };
  };

  return (
    <div className="min-h-screen bg-[--background] px-4 py-6">
      {/* Search + Filter Row */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
        <Input
          {...register("search")}
          placeholder="Search by QC Code, IMEI, Employee ID, or Device..."
          className="sm:max-w-sm"
        />
        <Button variant="default" className="w-full sm:w-auto">
          Filter
        </Button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center text-muted-foreground w-full flex justify-center">
            <PuffLoader color="#8956ff" />
          </div>
        ) : filteredReports.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No QC Reports Found
          </p>
        ) : (
          filteredReports.map((qc: any) => {
            const { testId, device, createdAt, employeeId, imageUrl } = qc;
            const { brand, model, ram, rom } = device;
            const testStatus = getTestStatusSummary(qc);

            const createdAtIST = new Date(createdAt).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              dateStyle: "medium",
              timeStyle: "short",
            });

            return (
              <Link
                key={testId}
                href={`${BASE_URL}/reports/qc-reports/${testId}`}
                className="flex justify-between items-center p-4 bg-white hover:bg-gray-50 rounded-2xl shadow-sm transition"
              >
                <div className="flex gap-4 items-center">
                  {/* {imageUrl && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={imageUrl} alt={model} className="w-full h-full object-cover" />
                    </div>
                  )} */}
                  <div>
                    <div className="font-semibold text-base">
                      {model.toLowerCase().startsWith("poco") ||
                      model.split(" ")[0].toLowerCase() === brand.toLowerCase()
                        ? `${model.charAt(0).toUpperCase()+model.slice(1)} (${ram}/${rom})`
                        : `${brand} ${model} (${ram}/${rom})`}
                    </div>
                    <div className="text-sm mt-2">QC Code: {testId}</div>
                    <div className="text-sm text-muted-foreground">
                      {createdAtIST}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Employee ID: {employeeId}
                      {employeeId && (
                        <span className="ml-2">| Name: <span className="px-2 py-1 rounded bg-blue-600 text-white font-semibold">{employeeNames[employeeId] || "..."}</span></span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      Tests: {testStatus.passed}/{testStatus.total}
                    </div>
                    <div className={`text-sm ${testStatus.screenTestPassed ? 'text-green-600' : 'text-yellow-600'}`}>
                      Screen Test: {testStatus.screenTestPassed ? 'Passed' : 'Pending'}
                    </div>
                  </div>
                  <ChevronRight className="text-muted-foreground" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QCReports;