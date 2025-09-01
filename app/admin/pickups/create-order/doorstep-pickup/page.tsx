'use client';

import { TypographyH4 } from "@/components/ui/typography";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";

interface Product {
  id: string;
  name: string;
  image: string;
  route: string;
  description: string;
}

const products: Product[] = [
  {
    id: "mobile",
    name: "Mobile",
    image: "/mobile.webp",
    route: "/",
    description: "Smartphones and feature phones",
  },
  {
    id: "laptop",
    name: "Laptop",
    image: "/laptop.webp",
    route: "/",
    description: "Notebooks and ultrabooks",
  },
  {
    id: "tablet",
    name: "Tablet",
    image: "/tablet.webp",
    route: "/",
    description: "iPads and Android tablets",
  },
];
const DoorstepPickup = () => {

  const pathname = usePathname();
  // console.log("Current Pathname:", pathname);
  const handleProductSelect = (productId: string) => {
    // console.log(`Selected product ID: ${productId}`);
    window.location.href = `/admin/pickups/create-order/doorstep-pickup/${productId}`;
  };
  return (
    <div className="flex flex-1 flex-col bg-pink-50/70">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 px-3 md:gap-6 md:py-6">
          <TypographyH4 className="">Create Doorstep Pickup</TypographyH4>
          <TypographyH4 className="text-sm text-gray-500">
            Please select the device type below to create a doorstep pickup
            request.
          </TypographyH4>

          <div className="flex flex-col h-full">
            
            <div className="overflow-y-auto max-h-[calc(100vh-150px)] px-0 mt-4">
              <div className="grid grid-cols-3 gap-1 pb-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product.id)}
                    className={`border rounded-lg p-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-blue-500 hover:ring-2 hover:ring-blue-200 border-gray-300 bg-white hover:bg-blue-50/30`}
                  >
                    <div className="relative h-24 w-full mb-1">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 33vw"
                        priority
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium text-sm text-gray-800 truncate">{product.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoorstepPickup;
