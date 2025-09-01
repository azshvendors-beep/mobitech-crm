import { NextResponse } from "next/server";

export async function POST() {
  try {
    const apiKey = process.env.FAST2SMS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "FAST2SMS API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch("https://www.fast2sms.com/dev/wallet", {
      method: "POST",
      headers: {
        "authorization": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`FAST2SMS API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("FAST2SMS balance fetch error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch FAST2SMS balance",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 