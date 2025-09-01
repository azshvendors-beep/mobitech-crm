import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session.isLoggedIn || !session.isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json({ isAdmin: true });
  } catch (error) {
    console.error("Check admin error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 