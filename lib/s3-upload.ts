import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'ap-south-1', // or your preferred region
  credentials: {
    accessKeyId: process.env.MB_S3_USER_ACCESS_KEY!,
    secretAccessKey: process.env.MB_S3_USER_SECRET_ACCESS_KEY!,
  },
});

export type FileType = 'aadhar' | 'profile' | 'qualification' | 'vehicle';

export async function uploadToS3(
  file: Buffer,
  employeeId: string,
  fileType: FileType,
  suffix?: 'front' | 'back'
) {
  try {
    const bucketName = process.env.MB_S3_BUCKET_NAME!;
    
    // Determine folder based on file type
    const folder = fileType === 'aadhar' 
      ? 'aadhar'
      : fileType === 'profile'
      ? 'profile'
      : fileType === 'qualification'
      ? 'qualification'
      : 'vehicle';

    // Create file name
    const fileName = suffix 
      ? `${employeeId}_${fileType}_${suffix}`
      : `${employeeId}_${fileType}`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: `${folder}/${fileName}`,
      Body: file,
      ContentType: 'image/jpeg', // Adjust based on file type if needed
    });

    await s3Client.send(command);

    // Return the S3 URL
    return `https://${bucketName}.s3.ap-south-1.amazonaws.com/${folder}/${fileName}`;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
} 