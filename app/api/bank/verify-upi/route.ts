import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { upi_id } = body;

    const response = await fetch('https://api.quickekyc.com/api/v1/bank-verification/upi-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: process.env.NEXT_APP_QUICKEKYC_KEY,
        upi_id
      }),
    });

    const data = await response.json();
    console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to verify UPI',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 