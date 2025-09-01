import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.MB_S3_ADMIN_ACCESS_KEY!,
    secretAccessKey: process.env.MB_S3_ADMIN_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { employeeId, selfieImage, folder } = await request.json();

    // console.log(selfieImage);

    if (!employeeId || !selfieImage) {
      // console.log("Employee ID and selfie image are required");
      return NextResponse.json(
        { error: "Employee ID and selfie image are required" },
        { status: 400 }
      );
    }

    if (!folder) {
      // console.log("Folder is required");
      return NextResponse.json(
        { error: "Folder is required" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(
      selfieImage.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const filename = `${folder}/${employeeId}-${uuidv4()}.jpg`;

    const command = new PutObjectCommand({
      Bucket: process.env.MB_S3_BUCKET_NAME!,
      Key: `${filename}`,
      Body: buffer,
      ContentType: "image/jpeg",
      Metadata: {
        employeeId: employeeId,
        uploadDate: new Date().toISOString(),
      },
    });

    await s3Client.send(command);
    const imageUrl = `https://${process.env.MB_S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${filename}`;

    return NextResponse.json({
      
      success: true,
      message: "Selfie uploaded successfully",
      imageUrl,
    }, {status: 200});
  } catch (error) {
    console.error("Error uploading selfie:", error);
    return NextResponse.json(
      { error: "Failed to upload selfie" },
      { status: 500 }
    );
  }
}
