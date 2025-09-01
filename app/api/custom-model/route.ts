
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getSession } from "@/lib/session";

// Validation schema for the request body
const addModelSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  model: z.string({
    error: "Please enter a model name",
  })
  .min(1, "Model name is required")
  .regex(/^[a-zA-Z0-9\s\-_\/]+$/, "Model name can only contain letters, numbers, spaces, hyphens, underscores, and slashes"),
  modelCodes: z.array(
    z.string()
      .min(1, "Model code is required")
      .regex(/^[a-zA-Z0-9\s\-_\/]+$/, "Model code can only contain letters, numbers, spaces, hyphens, underscores, and slashes")
  ).min(1, "At least one model code is required").max(10, "Maximum 10 codes allowed"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Validate request body
    const validatedData = addModelSchema.parse(body);
    const { brand, model, modelCodes } = validatedData;

    // Check if brand exists, if not create it
    let brandRecord = await prisma.customModelBrand.findUnique({
      where: { name: brand },
    });

    if (!brandRecord) {
      // Create new brand
      brandRecord = await prisma.customModelBrand.create({
        data: {
          name: brand,
          isActive: true,
        },
      });
    }

    // Count how many codes exist for this model name and brand
    const existingCodesCount = await prisma.customModel.count({
      where: {
        brandId: brandRecord.id,
        name: model,
      },
    });
    if (existingCodesCount + modelCodes.length > 10) {
      return NextResponse.json(
        {
          result: "error",
          message: `Maximum 10 codes allowed for model '${model}' in brand '${brand}'.`
        },
        { status: 400 }
      );
    }

    // Check for duplicate codes in DB
    const existingModels = await prisma.customModel.findMany({
      where: {
        brandId: brandRecord.id,
        name: model,
        code: { in: modelCodes },
      },
    });
    if (existingModels.length > 0) {
      return NextResponse.json(
        {
          result: "error",
          message: `Some codes already exist for model '${model}' in brand '${brand}': ${existingModels.map(m => m.code).join(", ")}`
        },
        { status: 400 }
      );
    }

    // Create all codes
    const createdModels = await Promise.all(
      modelCodes.map(async (code) => {
        return prisma.customModel.create({
          data: {
            name: model,
            code,
            brandId: brandRecord.id,
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
      message: "Model(s) added successfully",
      data: createdModels.map(m => ({
        id: m.id,
        name: m.name,
        code: m.code,
        brand: m.brand.name,
        createdAt: m.createdAt,
      })),
    });

  } catch (error) {
    console.error("POST /api/add-custom-model error:", error);
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
        message: "Failed to add model. Please try again." 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch all brands and models
export async function GET() {
  try {
    const brands = await prisma.customModelBrand.findMany({
      where: { isActive: true },
      include: {
        models: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            code: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Merge models with same name and group codes
    const mergedBrands = brands.map((brand) => {
      const modelMap = new Map();
      for (const model of brand.models) {
        if (!modelMap.has(model.name)) {
          modelMap.set(model.name, {
            id: model.id, // Use first id
            name: model.name,
            codes: [model.code],
            createdAt: model.createdAt,
          });
        } else {
          modelMap.get(model.name).codes.push(model.code);
        }
      }
      return {
        ...brand,
        models: Array.from(modelMap.values()),
      };
    });

    return NextResponse.json({
      result: "success",
      data: mergedBrands,
    });

  } catch (error) {
    console.error("GET /api/add-custom-model error:", error);
    return NextResponse.json(
      {
        result: "error",
        message: "Failed to fetch brands and models."
      },
      { status: 500 }
    );
  }
} 

