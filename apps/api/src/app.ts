import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import mongoose from "mongoose";

const app: Express = express();

// Security and middleware
app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:3000", "http://127.0.0.1:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive fallback for demo deployment
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limit general API endpoints
app.use("/api", apiRateLimiter);

// Comprehensive Uptime & Service Health Check
const healthHandler = (_req: Request, res: Response) => {
  const dbStatus =
    mongoose.connection.readyState === 1
      ? "connected"
      : mongoose.connection.readyState === 2
      ? "connecting"
      : "disconnected";

  res.status(200).json({
    status: "ok",
    service: "PAW TRACK API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    uptimeSeconds: Math.round(process.uptime()),
    database: dbStatus,
    memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    timestamp: new Date().toISOString(),
  });
};

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

// API Routes
app.use("/api/public", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api", protectedRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use(
  (err: any, _req: Request, res: Response, _next: NextFunction): void => {
    console.error("Unhandled Error:", err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
);

export default app;
