import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_number } = body;

    const response = await fetch('https://api.quickekyc.com/api/v1/aadhaar-v2/generate-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: process.env.NEXT_APP_QUICKEKYC_KEY,
        id_number
      })
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to generate OTP',
        status_code: 500 
      },
      { status: 500 }
    );
  }
} 