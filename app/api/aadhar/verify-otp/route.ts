import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { request_id, otp } = body;

    const response = await fetch('https://api.quickekyc.com/api/v1/aadhaar-v2/submit-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: process.env.NEXT_APP_QUICKEKYC_KEY,
        request_id,
        otp
      })
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to verify OTP',
        status_code: 500 
      },
      { status: 500 }
    );
  }
} 