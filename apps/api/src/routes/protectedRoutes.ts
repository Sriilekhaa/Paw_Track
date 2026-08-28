import { Router, Request, Response } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { Report } from "../models/Report.js";

const router = Router();

/**
 * Citizen route - Accessible by 'citizen' and 'admin'
 * GET /api/citizen/my-reports
 */
router.get(
  "/citizen/my-reports",
  authenticateToken,
  requireRole(["citizen", "admin"]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const reports = await Report.find({ reportedBy: req.user?.id })
        .sort({ createdAt: -1 })
        .limit(10);

      res.status(200).json({
        success: true,
        message: "Citizen reports fetched successfully.",
        data: {
          user: req.user,
          reports,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch citizen reports.",
      });
    }
  }
);

/**
 * Field Worker route - Accessible by 'field_worker' and 'admin'
 * GET /api/field-worker/queue
 */
router.get(
  "/field-worker/queue",
  authenticateToken,
  requireRole(["field_worker", "admin"]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const activeQueue = await Report.find({
        status: { $in: ["assigned", "in_progress"] },
      })
        .populate("reportedBy", "name email")
        .sort({ urgencyScore: -1, createdAt: -1 })
        .limit(20);

      res.status(200).json({
        success: true,
        message: "Field worker active queue retrieved successfully.",
        data: {
          user: req.user,
          queueCount: activeQueue.length,
          queue: activeQueue,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch field worker queue.",
      });
    }
  }
);

/**
 * Admin route - Strictly accessible ONLY by 'admin'
 * GET /api/admin/overview
 */
router.get(
  "/admin/overview",
  authenticateToken,
  requireRole(["admin"]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        message: "Admin authorization verified. Overview metrics retrieved.",
        data: {
          adminUser: req.user,
          systemStatus: "healthy",
          activeCases: 342,
          resolutionEfficiencyHours: 4.2,
          communityReportsTotal: 1208,
          timestamp: new Date(),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch admin overview.",
      });
    }
  }
);

export default router;
