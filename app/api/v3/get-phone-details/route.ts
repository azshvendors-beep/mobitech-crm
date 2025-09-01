
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brand, device } = body;
    if (!brand) {
      return new NextResponse(JSON.stringify({ error: "Brand is required" }), {
        status: 400,
      });
    }

    if (!device || (device !== "phones" && device !== "tablets")) {
      return new NextResponse(
        JSON.stringify({
          error:
            "Device type is required and must be either 'phones' or 'tablets'",
        }),
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.THEINDB_BASE_URL}/api/v3/get-device-by-brand`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.THEINDB_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ brand: brand }),
      }
    );

    if (response.status !== 200) {
      const errorResponse = await response.json();
      console.error("Error fetching device details:", errorResponse);
      return new NextResponse(
        JSON.stringify({
          error: "Failed to fetch device details",
          errorMessage: errorResponse,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const data = await response.json();

    if (!data || !Array.isArray(data.data) || data.data.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: "No devices found for the specified brand" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (device === "phones") {
      const phones = data.data.filter((item: any) => item.category === "phone");
      if (phones.length === 0) {
        return new NextResponse(
          JSON.stringify({ error: "No phones found for the specified brand" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      return new NextResponse(
        JSON.stringify({
          count: phones.length,
          phones,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else if (device === "tablets") {
      const tablets = data.data.filter(
        (item: any) => item.category === "tablet"
      );

      if (tablets.length === 0) {
        return new NextResponse(
          JSON.stringify({ error: "No tablets found for the specified brand" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      return new NextResponse(
        JSON.stringify({
          count: tablets.length,

          tablets,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error fetching phone details:", error);
    return new NextResponse(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
