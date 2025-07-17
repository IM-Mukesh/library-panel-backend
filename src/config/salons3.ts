// src/utils/salons3.ts

import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

const s3 = new AWS.S3({
  region: process.env.S3_REGION,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
});

export const generateUploadUrl = async () => {
  const key = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;

  const params = {
    Bucket: process.env.S3_SALON_BUCKET!,
    Key: key,
    Expires: 60, // 1 minute
    ContentType: "image/jpeg",
  };

  const uploadUrl = await s3.getSignedUrlPromise("putObject", params);

  const publicUrl = `https://${process.env.S3_SALON_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;

  return { uploadUrl, publicUrl };
};
