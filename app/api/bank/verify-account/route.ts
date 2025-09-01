import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_number, ifsc } = body;

    const response = await fetch('https://api.quickekyc.com/api/v1/bank-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: process.env.NEXT_APP_QUICKEKYC_KEY,
        id_number,
        ifsc
      }),
    });

    // console.log(response)?
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to verify bank account',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 