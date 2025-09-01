import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const userSchema = z.object({
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(10, "Phone number must not exceed 10 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
  password: z.string()
    .min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = userSchema.parse(json);

    const existingUser = await prisma.user.findUnique({
      where: { phone: body.phone },
    });

    if (existingUser) {
      return new NextResponse("User with this phone number already exists", {
        status: 409,
      });
    }

    const hashedPassword = await hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        phone: body.phone,
        password: hashedPassword,
      },
    });

    const { password: _, ...result } = user;
    
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 