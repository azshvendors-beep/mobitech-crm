import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for adding codes to existing model
const addCodesSchema = z.object({
  modelId: z.string().min(1, "Model ID is required"),
  newCodes: z.array(
    z.string()
      .min(1, "Model code is required")
      .regex(/^[a-zA-Z0-9\s\-_\/]+$/, "Model code can only contain letters, numbers, spaces, hyphens, underscores, and slashes")
  ).min(1, "At least one model code is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = addCodesSchema.parse(body);
    const { modelId, newCodes } = validatedData;

    // Find the existing model to get its name and brand
    const existingModel = await prisma.customModel.findFirst({
      where: {
        id: modelId,
        isActive: true,
      },
      include: {
        brand: true,
      },
    });

    if (!existingModel) {
      return NextResponse.json(
        {
          result: "error",
          message: "Model not found"
        },
        { status: 404 }
      );
    }

    // Count existing codes for this model name and brand
    const existingCodesCount = await prisma.customModel.count({
      where: {
        brandId: existingModel.brandId,
        name: existingModel.name,
        isActive: true,
      },
    });

    // Check if adding new codes would exceed the 10-code limit
    if (existingCodesCount + newCodes.length > 10) {
      return NextResponse.json(
        {
          result: "error",
          message: `Maximum 10 codes allowed for model '${existingModel.name}'. Current: ${existingCodesCount}, Trying to add: ${newCodes.length}`
        },
        { status: 400 }
      );
    }

    // Check for duplicate codes in the database
    const existingDuplicates = await prisma.customModel.findMany({
      where: {
        brandId: existingModel.brandId,
        name: existingModel.name,
        code: { in: newCodes },
        isActive: true,
      },
    });

    if (existingDuplicates.length > 0) {
      return NextResponse.json(
        {
          result: "error",
          message: `Some codes already exist for model '${existingModel.name}' in brand '${existingModel.brand.name}': ${existingDuplicates.map(m => m.code).join(", ")}`
        },
        { status: 400 }
      );
    }

    // Check for duplicates within the new codes array
    const duplicatesInNewCodes = newCodes.filter((code, index) => newCodes.indexOf(code) !== index);
    if (duplicatesInNewCodes.length > 0) {
      return NextResponse.json(
        {
          result: "error",
          message: `Duplicate codes in request: ${[...new Set(duplicatesInNewCodes)].join(", ")}`
        },
        { status: 400 }
      );
    }

    // Create all new model codes
    const createdModels = await Promise.all(
      newCodes.map(async (code) => {
        return prisma.customModel.create({
          data: {
            name: existingModel.name,
            code: code.trim(),
            brandId: existingModel.brandId,
            isActive: true,
          },
          include: {
            brand: {
              select: { name: true },
            },
          },
        });
      })
    );

    return NextResponse.json({
      result: "success",
      message: `${createdModels.length} code${createdModels.length > 1 ? 's' : ''} added successfully to model '${existingModel.name}'`,
      data: {
        modelName: existingModel.name,
        brandName: existingModel.brand.name,
        addedCodes: createdModels.map(m => ({
          id: m.id,
          code: m.code,
          createdAt: m.createdAt,
        })),
        totalCodesNow: existingCodesCount + createdModels.length,
      },
    });

  } catch (error) {
    console.error("POST /api/custom-model/add-codes error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          result: "error", 
          message: "Validation failed", 
          errors: error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        result: "error", 
        message: "Failed to add codes. Please try again." 
      },
      { status: 500 }
    );
  }
}
