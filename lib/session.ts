import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export type SessionData = {
  userId: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
};

export const defaultSession: SessionData = {
  userId: "",
  isLoggedIn: false,
  isAdmin: false,
};

export const sessionOptions = {
  password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long",
  cookieName: "iron-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  
  if (!session.isLoggedIn) {
    session.userId = defaultSession.userId;
    session.isLoggedIn = defaultSession.isLoggedIn;
  }
  
  return session;
}

export async function updateSession(request: NextRequest) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  
  if (session.isLoggedIn) {
    const response = NextResponse.next();
    return response;
  }

  return NextResponse.redirect(new URL("/auth/user/sign-in", request.url));
} 