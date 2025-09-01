import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { modelCode } = body;
  console.log("Checking model code:", modelCode);
  if (!modelCode) {
    return NextResponse.json(
      {
        result: "error",
        message: "Model code is required.",
      },
      { status: 400 }
    );
  }
  try {
    const brands = await prisma.customModelBrand.findMany({
      where: { isActive: true },
      include: {
        models: {
          where: {
            isActive: true,
            code: modelCode,
            // name: {
            //   contains: modelCode,
            //   mode: "insensitive",
            // },
          },
          select: {
            id: true,
            name: true,
            code: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Find the first non-empty models array and return the first model
    let foundModel = null;
    for (const brand of brands) {
      if (brand.models && brand.models.length > 0) {
        foundModel = brand.models[0];
        break;
      }
    }

    console.log("Exact model found:", foundModel ? foundModel.name : null);

    return NextResponse.json({
      result: "success",
      data: foundModel,
    });
  } catch (error) {
    console.error("POST /api/check-custom-model error:", error);
    return NextResponse.json(
      {
        result: "error",
        message: "Failed to fetch brands and models.",
      },
      { status: 500 }
    );
  }
}
