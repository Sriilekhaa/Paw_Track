import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import streamifier from "streamifier";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demo",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
});

export const isCloudinaryConfigured = (): boolean => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME !== "demo"
  );
};

export interface UploadResult {
  url: string;
  public_id: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

/**
 * Upload a file buffer to Cloudinary with automatic 1-retry resilience
 * and seamless development fallback if credentials are not yet set.
 */
export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  folder: string = "paw_track/reports",
  retriesLeft: number = 1
): Promise<UploadResult> => {
  // If no Cloudinary API credentials provided, provide mock/demo URL
  if (!isCloudinaryConfigured()) {
    const mockPublicId = `paw_track_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}`;
    const base64Data = buffer.toString("base64");
    const mimeType = "image/jpeg";
    const dataUri = `data:${mimeType};base64,${base64Data.substring(0, 100)}...`;

    return {
      url: `https://res.cloudinary.com/demo/image/upload/v1/${folder}/${mockPublicId}.jpg`,
      public_id: `${folder}/${mockPublicId}`,
      format: "jpg",
      bytes: buffer.length,
      width: 800,
      height: 600,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { width: 1600, height: 1600, crop: "limit" },
          { quality: "auto:good", fetch_format: "auto" },
        ],
      },
      async (error, result?: UploadApiResponse) => {
        if (error || !result) {
          if (retriesLeft > 0) {
            console.warn(
              `⚠️ Cloudinary upload attempt failed (${error?.message || "Unknown error"}). Retrying 1 more time...`
            );
            try {
              const retryResult = await uploadBufferToCloudinary(
                buffer,
                folder,
                retriesLeft - 1
              );
              return resolve(retryResult);
            } catch (retryErr) {
              return reject(retryErr);
            }
          }
          return reject(
            new Error(
              `Cloudinary upload failed after retry: ${error?.message || "Stream error"}`
            )
          );
        }

        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
        });
      }
    );

    // Pipe buffer to Cloudinary stream
    const readStream = streamifier.createReadStream(buffer);
    readStream.pipe(uploadStream);
  });
};

export default cloudinary;
