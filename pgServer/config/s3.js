import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const getBucket = () => {
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;
  if (!bucket || !region) {
    throw new Error("AWS_S3_BUCKET and AWS_REGION must be set in .env");
  }
  return { bucket, region };
};

/**
 * Uploads a chat image to S3.
 * Accepts a base64 data URL from the client, or returns an existing http(s) URL as-is.
 * Stores the permanent S3 URL in Postgres (not a temporary signed URL).
 */
export const uploadChatImage = async (image, folder = "images/chat") => {
  if (!image) return null;

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const match = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid image data. Expected a base64 data URL.");
  }

  const contentType = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, "base64");
  const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") || "png";
  const key = `${folder}/${randomUUID()}.${ext}`;
  const { bucket, region } = getBucket();

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

const extractS3Key = (imageUrl) => {
  if (!imageUrl) return null;
  try {
    const { bucket } = getBucket();
    const parsed = new URL(imageUrl);
    // Only sign URLs that belong to our bucket
    if (!parsed.hostname.includes(bucket)) return null;
    return decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  } catch {
    return null;
  }
};

/**
 * Private buckets block direct browser access.
 * Return a temporary signed URL so <img src> can load the file.
 */
export const getReadableImageUrl = async (imageUrl, expiresIn = 60 * 60) => {
  if (!imageUrl) return null;

  const key = extractS3Key(imageUrl);
  if (!key) return imageUrl;

  const { bucket } = getBucket();
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
    { expiresIn }
  );
};
