"use client";

import { TypographyH4 } from "@/components/ui/typography";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";

interface Brand {
  id: string;
  name: string;
  logo: string;
  apiEndpoint: string;
}
const mobileBrands: Brand[] = [
  {
    id: "apple",
    name: "Apple",
    logo: "/apple.webp",
    apiEndpoint: "apple-phones-48",
  },
  {
    id: "samsung",
    name: "Samsung",
    logo: "/samsung.webp",
    apiEndpoint: "samsung-phones-9",
  },
  {
    id: "xiaomi",
    name: "Xiaomi",
    logo: "/xiomi.webp",
    apiEndpoint: "xiaomi-phones-80",
  },
  {
    id: "vivo",
    name: "Vivo",
    logo: "/vivo.webp",
    apiEndpoint: "vivo-phones-98",
  },
  {
    id: "oneplus",
    name: "OnePlus",
    logo: "/one plus.webp",
    apiEndpoint: "oneplus-phones-95",
  },
  {
    id: "oppo",
    name: "Oppo",
    logo: "/oppo.webp",
    apiEndpoint: "oppo-phones-82",
  },
  {
    id: "realme",
    name: "Realme",
    logo: "/realme.webp",
    apiEndpoint: "realme-phones-118",
  },
  {
    id: "motorola",
    name: "Motorola",
    logo: "/motorola.webp",
    apiEndpoint: "motorola-phones-4",
  },
  {
    id: "lenovo",
    name: "Lenovo",
    logo: "/lenovo.webp",
    apiEndpoint: "lenovo-phones-73",
  },
  {
    id: "nokia",
    name: "Nokia",
    logo: "/nokia.webp",
    apiEndpoint: "nokia-phones-1",
  },
  {
    id: "honor",
    name: "Honor",
    logo: "/honor.webp",
    apiEndpoint: "honor-phones-121",
  },
  {
    id: "google",
    name: "Google",
    logo: "/google.webp",
    apiEndpoint: "google-phones-107",
  },
  {
    id: "poco",
    name: "Poco",
    logo: "/poco.webp",
    apiEndpoint: "poco-phones-generic",
  },
  {
    id: "infinix",
    name: "Infinix",
    logo: "/infinix.webp",
    apiEndpoint: "infinix-phones-119",
  },
  {
    id: "techno",
    name: "Tecno",
    logo: "/techno.webp",
    apiEndpoint: "tecno-phones-120",
  },
  {
    id: "iqoo",
    name: "iQOO",
    logo: "/iqoo.webp",
    apiEndpoint: "vivo-phones-98",
  },
  {
    id: "nothing",
    name: "Nothing",
    logo: "/nothing.webp",
    apiEndpoint: "nothing-phones-128",
  },
];

const MobileDoorStepPickup = () => {
  const pathname = usePathname();
  const handleBrandSelect = (brandId: string) => {
    console.log("Selected Brand ID:", brandId);
    window.location.href = `${pathname}/choose-model?brand=${brandId}`;
  };
  return (
    <div className="flex flex-1 flex-col bg-pink-50/70">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 px-3 md:gap-6 md:py-6">
          <TypographyH4 className="">Select Brand</TypographyH4>
          <>
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4 gap-2">
              {mobileBrands.map((brand) => (
                <div
                  key={brand.id}
                  onClick={() => handleBrandSelect(brand.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md flex flex-col items-center hover:border-blue-500 hover:ring-1 hover:ring-blue-200 border-gray-400/40 sm:border-gray-400/70
                  `}
                >
                  <div className="relative h-16 sm:h-20 w-16 sm:w-20 mb-2">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                  </div>
                  {/* <span className="text-sm font-medium text-center">
                    {brand.name}
                  </span> */}
                </div>
              ))}
            </div>
          </>
        </div>
      </div>
    </div>
  );
};

export default MobileDoorStepPickup;
