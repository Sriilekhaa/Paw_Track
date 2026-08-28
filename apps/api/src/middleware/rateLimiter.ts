import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many authentication requests from this IP. Please try again in 15 minutes.",
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Rate limit exceeded. Please slow down your requests.",
  },
});

/**
 * Strict per-user rate limiter for report submissions (max 10 submissions/hour/user)
 */
export const reportSubmissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // 10 report submissions per user per hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return req.user?.id || req.ip || "anonymous";
  },
  handler: (_req: Request, res: Response): void => {
    res.status(429).json({
      success: false,
      code: "RATE_LIMIT_EXCEEDED",
      message:
        "Report submission limit reached. You may submit a maximum of 10 incident reports per hour to prevent spam.",
      retryAfter: "60 minutes",
    });
  },
});
