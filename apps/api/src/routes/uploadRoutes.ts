import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { upload, handleUploadError } from "../middleware/upload.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";

const router = Router();

/**
 * Upload single report photo to Cloudinary
 * POST /api/uploads/report-photo
 */
router.post(
  "/report-photo",
  authenticateToken,
  upload.single("photo"),
  handleUploadError,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "No photo file provided in request body. Field name must be 'photo'.",
        });
        return;
      }

      const result = await uploadBufferToCloudinary(
        req.file.buffer,
        "paw_track/reports"
      );

      res.status(200).json({
        success: true,
        message: "Photo uploaded successfully to secure storage.",
        data: {
          url: result.url,
          public_id: result.public_id,
          format: result.format,
          bytes: result.bytes,
          originalName: req.file.originalname,
        },
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(502).json({
        success: false,
        message: error.message || "Failed to process photo upload.",
      });
    }
  }
);

/**
 * Upload multiple photos (up to 3) to Cloudinary
 * POST /api/uploads/report-photos
 */
router.post(
  "/report-photos",
  authenticateToken,
  upload.array("photos", 3),
  handleUploadError,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          message: "No photo files provided. Field name must be 'photos'.",
        });
        return;
      }

      const uploadPromises = files.map((file) =>
        uploadBufferToCloudinary(file.buffer, "paw_track/reports")
      );

      const results = await Promise.all(uploadPromises);

      res.status(200).json({
        success: true,
        message: `${results.length} photo(s) uploaded successfully.`,
        data: {
          photos: results.map((r, idx) => ({
            url: r.url,
            public_id: r.public_id,
            format: r.format,
            bytes: r.bytes,
            originalName: files[idx].originalname,
          })),
        },
      });
    } catch (error: any) {
      console.error("Multi-upload error:", error);
      res.status(502).json({
        success: false,
        message: error.message || "Failed to process photo uploads.",
      });
    }
  }
);

export default router;
