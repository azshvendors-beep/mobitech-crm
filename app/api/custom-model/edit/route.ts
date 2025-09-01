import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";


// Validation schema for updating a model
const updateModelSchema = z.object({
  name: z.string().min(2, "Name is required")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Model name can only contain letters, numbers, spaces, hyphens, and underscores"),
  code: z.string().min(1, "Model code is required")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Model code can only contain letters, numbers, spaces, hyphens, and underscores"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, codes, oldCode, newCode, type } = body;

    // Bulk rename all codes for a model name
    if (type === "bulkRename") {
      // Find all models with the same name and brand as the given id
      const existingModel = await prisma.customModel.findUnique({ where: { id } });
      if (!existingModel) {
        return NextResponse.json({ result: "error", message: "Model not found" }, { status: 404 });
      }
      // Check for duplicate name within brand
      const nameExists = await prisma.customModel.findFirst({
        where: {
          brandId: existingModel.brandId,
          name,
        },
      });
      if (nameExists) {
        return NextResponse.json({ result: "error", message: `Model '${name}' already exists for this brand.` }, { status: 400 });
      }
      // Update all models with the same name and brand
      await prisma.customModel.updateMany({
        where: {
          brandId: existingModel.brandId,
          name: existingModel.name,
        },
        data: {
          name,
        },
      });
      return NextResponse.json({ result: "success", message: "All codes updated with new name." });
    }

    // Update code for selected code
    if (type === "codeUpdate") {
      // Find the model with the selected code and brand
      const existingModel = await prisma.customModel.findUnique({ where: { id } });
      if (!existingModel) {
        return NextResponse.json({ result: "error", message: "Model not found" }, { status: 404 });
      }
      // Check for duplicate code
      if (oldCode !== newCode) {
        const codeExists = await prisma.customModel.findFirst({
          where: {
            brandId: existingModel.brandId,
            code: newCode,
          },
        });
        if (codeExists) {
          return NextResponse.json({ result: "error", message: "Model code already exists. Please use a different code." }, { status: 400 });
        }
      }
      // Update the code for the selected model
      await prisma.customModel.updateMany({
        where: {
          brandId: existingModel.brandId,
          name: existingModel.name,
          code: oldCode,
        },
        data: {
          code: newCode,
        },
      });
      return NextResponse.json({ result: "success", message: "Code updated successfully." });
    }

    return NextResponse.json({ result: "error", message: "Invalid request type." }, { status: 400 });
  } catch (error) {
    console.error("POST /api/custom-model/edit error:", error);
    return NextResponse.json({ result: "error", message: "Failed to update model. Please try again." }, { status: 500 });
  }
}