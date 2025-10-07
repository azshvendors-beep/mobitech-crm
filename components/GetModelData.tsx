'use client'
import { useEffect, useState } from "react";

export function useModelData(modelId: string | null) {
  const [mobileDataLoading, setMobileDataLoading] = useState(false);
  const [mobileData, setMobileData] = useState<any>(null);
  const [mobileDataError, setMobileDataError] = useState<any>(null);

  console.log("Fetching model data for:", modelId);

  useEffect(() => {
    if (!modelId) return;
    setMobileDataLoading(true);
    setMobileDataError(null);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-individual-model-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: modelId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch model data");
        return res.json();
      })
      .then((json) => {
        if (!json?.data) throw new Error("No device found for the specified model");
        setMobileData({
          model: json.data.model,
          brand: json.data.brand,
          detailedSpec: json.data.detailedSpec,
          imageUrl: json.data.imageUrl,
        });
      })
      .catch(setMobileDataError)
      .finally(() => setMobileDataLoading(false));
  }, [modelId]);

  return { mobileDataLoading, mobileData, mobileDataError };
}