import { S3Client, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.MB_S3_ADMIN_ACCESS_KEY!,
    secretAccessKey: process.env.MB_S3_ADMIN_SECRET_ACCESS_KEY!,
  },
});

export async function getSignedGetUrl(key?: string | null, expiresInSeconds = 60 * 10) {
  if (!key) return null;
  const command = new GetObjectCommand({
    Bucket: process.env.MB_S3_BUCKET_NAME!,
    Key: key,
  });
  return await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}

export async function headObjectContentType(key?: string | null) {
  if (!key) return null;
  const head = await s3.send(new HeadObjectCommand({
    Bucket: process.env.MB_S3_BUCKET_NAME!,
    Key: key,
  }));
  return head.ContentType || null;
}
