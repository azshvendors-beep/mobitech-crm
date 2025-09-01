import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { model } = body;
    if (!model) {
      return new NextResponse(JSON.stringify({ error: "Model is required" }), {
        status: 400,
      });
    }

    const response = await fetch(
      `${process.env.THEINDB_BASE_URL}/api/v3/get-device-by-model`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.THEINDB_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: model }),
      }
    );

    if (response.status !== 200) {
      const errorResponse = await response.json();
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

    if (!data) {
      return new NextResponse(
        JSON.stringify({ error: "No device found for the specified model" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching phone details:", error);
    return new NextResponse(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
