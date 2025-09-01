"use client";

import { TypographyH4 } from "@/components/ui/typography";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { SyncLoader } from "react-spinners";
import { toast } from "sonner";
import { Input } from "@/components/ui/input"; // Make sure you have a styled Input component

import Image from "next/image";
import DeviceDetailsSheet from "@/components/device-details-sheet";

const ChooseModel = () => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<any[]>([]); // Adjust type as needed
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  const brand = searchParams.get("brand");
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const getBrandData = async (brand: string | null) => {
    if (!brand) return null;
    setLoading(true);
    try {
      const res = await fetch("/api/v3/get-phone-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: brand, device: "phones" }),
      });

      if (!res.ok) {
        toast.error("Failed to fetch brand data");
      }
      const response = await res.json();
      setDevices(response.phones || []);
      // console.log(response);
    } catch (error) {
      console.error("Error fetching brand data:", error);
      toast.error("Failed to fetch brand data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      getBrandData(brand);
    }, 1000);
  }, []);

  const handleBackToBrands = () => {
    const path = pathname.split("?")[0];
    const segments = path.split("/");

    if (segments.length > 1) {
      segments.pop(); // remove last segment
    }

    const newPath = segments.join("/");
    window.location.href = newPath;
  };

  const getCleanImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "/placeholder-device.png";
    if (imageUrl.includes("gsmarena.com")) {
      return imageUrl.replace(
        "https://www.gsmarena.com/https://fdn2.gsmarena.com/",
        "https://fdn2.gsmarena.com/"
      );
    }
    return imageUrl;
  };

  const handleDeviceSelect = (device: any) => {
    console.log("Selected device:", device);
    setSelectedDevice(device);
    handleModelSelect(device.smc);
    // setIsSheetOpen(true);
  };

  const handleModelSelect = (modelId: string) => {
    router.push(`/admin/pickups/create-order/doorstep-pickup/mobile/register/${modelId}`);
  };

  const filteredDevices = devices.filter((device) =>
    device.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-1 flex-col bg-pink-50/70">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 px-3 md:gap-6 md:py-6">
          {/* Heading and Search Bar */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
           <div className="flex justify-between items-center">
             <TypographyH4 className="text-gray-900">Select Model</TypographyH4>
             <button
                onClick={handleBackToBrands}
                className="flex items-center text-blue-500 hover:text-blue-700 text-sm ml-2 "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="m12 19-7-7 7-7" />
                </svg>
                Back to brands
              </button>
           </div>
            <div className="w-full md:w-1/2">
              <Input
                type="text"
                placeholder="Search models..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          {/* Loading or Content */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <SyncLoader color="#ec4899" size={10} />
            </div>
          ) : (
            <div className="flex flex-col h-full">
           

              {filteredDevices.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                  <p className="text-gray-600">
                    No Phones found for selected brand
                  </p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[calc(100vh-200px)] px-0 md:px-4">
                  <div className="text-sm text-gray-600 mb-4 ml-2">
                    Found {filteredDevices.length} devices
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
                    {filteredDevices.map((device, index) => {
                      // console.log(device)
                      return (
                        <div
                          key={index}
                          onClick={() => handleDeviceSelect(device)}
                          className="border rounded-lg p-4 cursor-pointer transition-all border-gray-400/70 hover:shadow-md hover:border-blue-500 group"
                        >
                          <div className="relative h-40 w-full mb-3 bg-gray-50 rounded">
                            <Image
                              src={getCleanImageUrl(device.imageUrl || "")}
                              alt={device.model}
                              fill
                              className="object-contain p-2 group-hover:scale-105 transition-transform"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder-device.png";
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm leading-tight text-center">
                              {device.model}
                            </h4>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
   
    </div>
  );
};

export default ChooseModel;
