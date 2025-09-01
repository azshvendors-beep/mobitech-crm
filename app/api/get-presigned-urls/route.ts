import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.MB_S3_ADMIN_ACCESS_KEY!,
    secretAccessKey: process.env.MB_S3_ADMIN_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { files } = await req.json();
    if (!files) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const urls = await Promise.all(
      files.map(async (file: { name: string; type: string }) => {
        const key = `staging/${Date.now()}-${randomUUID()}-${file.name}`;
        const uploadUrl = await getSignedUrl(
          s3,
          new PutObjectCommand({
            Bucket: process.env.MB_S3_BUCKET_NAME!,
            Key: key,
            ContentType: file.type,
          }),
          { expiresIn: 3600 }
        );
        return { uploadUrl, key };
      })
    );

    if (!urls) {
      console.error("Failed to generate signed URLs");
      return NextResponse.json(
        { error: "Failed to generate signed URLs" },
        { status: 500 }
      );
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("error generating signed URL's: ", error);
    return NextResponse.json(
      { error: "Failed to generate signed URLs" },
      { status: 500 }
    );
  }
}
