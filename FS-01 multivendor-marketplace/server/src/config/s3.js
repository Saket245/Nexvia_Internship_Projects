import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock_access_key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock_secret_key'
  }
});

export const uploadToS3 = async (file, folder = 'products') => {
  const isAwsConfigured = Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_BUCKET_NAME
  );

  const fileName = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

  if (isAwsConfigured) {
    try {
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
      });

      await s3Client.send(command);
      return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;
    } catch (err) {
      console.warn(`[AWS S3] Upload failed: ${err.message}. Saving to local media store.`);
    }
  }

  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const localFileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
  const filePath = path.join(uploadsDir, localFileName);
  fs.writeFileSync(filePath, file.buffer);

  const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${localFileName}`;
};
