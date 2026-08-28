import multer from "multer";
import { Request, Response, NextFunction } from "express";

// Store uploaded files in memory buffer for streaming to Cloudinary
const storage = multer.memoryStorage();

// Supported MIME types
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type '${file.mimetype}'. Only JPG, PNG, and WebP images are allowed.`
      )
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 3, // Maximum 3 photos per upload
  },
  fileFilter,
});

/**
 * Custom Multer error handling middleware converting upload errors
 * into structured 400 Bad Request JSON responses.
 */
export const handleUploadError = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        success: false,
        message: "File size exceeds the 5MB limit. Please upload a smaller photo.",
      });
      return;
    }
    if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
      res.status(400).json({
        success: false,
        message: "A maximum of 3 photos can be uploaded per report.",
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
    return;
  }

  if (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Invalid file upload.",
    });
    return;
  }

  next();
};
