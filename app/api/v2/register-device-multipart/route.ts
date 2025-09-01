import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const fields: Record<string, any> = {};
    const files: Record<string, string> = {};

    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        fields[key] = value;
      } else if (typeof value === "object" && value?.arrayBuffer && value?.name) {
        // Save file to /tmp for now (replace with S3 or production storage as needed)
        const buffer = Buffer.from(await value.arrayBuffer());
        const filename = `${Date.now()}_${value.name}`;
        const uploadPath = path.join("/tmp", filename);
        await writeFile(uploadPath, buffer);
        files[key] = uploadPath;
      }
    }

    // TODO: Save fields and file paths to DB as needed

    return NextResponse.json({ success: true, fields, files });
  } catch (error) {
    console.error("Error in multipart device registration:", error);
    return NextResponse.json({ success: false, error: error?.toString() }, { status: 500 });
  }
} 