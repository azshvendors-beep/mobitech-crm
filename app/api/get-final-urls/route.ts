import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.MB_S3_ADMIN_ACCESS_KEY!,
    secretAccessKey: process.env.MB_S3_ADMIN_SECRET_ACCESS_KEY!,
  },
});
export async function POST(req: NextRequest){
    try {
      const { fileKeys } = await req.json();
      if (!fileKeys) {
        return NextResponse.json({ error: "No files provided" }, { status: 400 });
      }
      console.log("File Keys:", fileKeys);
      const finalKeys = [];
      const missingKeys = [];
      for (const key of fileKeys) {
        const finalKey = key.replace("staging/", "final/");
        try {
          await s3.send(new CopyObjectCommand({
            Bucket: process.env.MB_S3_BUCKET_NAME!,
            CopySource: `${process.env.MB_S3_BUCKET_NAME!}/${key}`,
            Key: finalKey,
          }));
          await s3.send(new DeleteObjectCommand({
            Bucket: process.env.MB_S3_BUCKET_NAME!,
            Key: key,
          }));
          finalKeys.push(finalKey);
        } catch (err: any) {
          if (err.Code === "NoSuchKey") {
            missingKeys.push(key);
            console.warn(`Missing S3 key: ${key}`);
            continue;
          } else {
            throw err;
          }
        }
      }
      return NextResponse.json({ finalUrls: finalKeys, missingKeys });
    } catch (error) {
      console.error("Error in get-final-urls:", error);
      return NextResponse.json({ error: "Failed to get final URLs" }, { status: 500 });
    }
}