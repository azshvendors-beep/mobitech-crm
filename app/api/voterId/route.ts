import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_number } = body;

    const response = await fetch(
      "https://api.quickekyc.com/api/v1/voter-id/voter-id",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: process.env.NEXT_APP_QUICKEKYC_KEY,
          id_number,
        }),
      }
    );

    const data = await response.json();
    if(data.status_code !== 200){
      return NextResponse.json({status: 400, message: data.message});
    }
    
    return NextResponse.json({status: 200, message: data.message, data: data.data});
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to verify VoterId",
        status_code: 500,
      },
      { status: 500 }
    );
  }
}
