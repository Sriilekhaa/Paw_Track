import { Request, Response } from "express";
import { Report, IReport, SpeciesType, ReportCategory } from "../models/Report.js";
import { z } from "zod";
import xss from "xss";
import mongoose from "mongoose";
import { nlpService } from "../services/nlpService.js";

// Schema for report submission with strict validation
export const createReportSchema = z.object({
  species: z.enum(
    ["dog", "cat", "cattle", "monkey", "bird", "other"],
    {
      errorMap: () => ({
        message: "Species must be one of: dog, cat, cattle, monkey, bird, other",
      }),
    }
  ),
  category: z.enum(
    [
      "injury",
      "bite_incident",
      "stray_sighting",
      "sterilization_request",
      "cruelty_report",
      "roadkill",
      "adoption_inquiry",
    ],
    {
      errorMap: () => ({
        message:
          "Category must be one of: injury, bite_incident, stray_sighting, sterilization_request, cruelty_report, roadkill, adoption_inquiry",
      }),
    }
  ),
  description: z
    .string({ required_error: "Description is required" })
    .trim()
    .min(10, "Description must be at least 10 characters long")
    .max(1000, "Description cannot exceed 1000 characters"),
  location: z.object({
    coordinates: z
      .tuple([
        z.number({ required_error: "Longitude is required" }).min(-180).max(180),
        z.number({ required_error: "Latitude is required" }).min(-90).max(90),
      ])
      .refine(
        (coords) => coords.length === 2,
        "Coordinates must be a valid [longitude, latitude] pair"
      ),
    address: z
      .string({ required_error: "Location address is required" })
      .trim()
      .min(3, "Address must be at least 3 characters long"),
    zone: z.string().trim().optional().default("Central District"),
  }),
  photos: z
    .array(z.string().url("Each photo must be a valid URL"))
    .max(3, "A maximum of 3 photos are permitted per report")
    .optional()
    .default([]),
});

/**
 * Submit a new animal welfare incident report
 * POST /api/reports
 */
export const createReport = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Authentication required to submit an incident report.",
      });
      return;
    }

    // Strict validation with Zod
    const parseResult = createReportSchema.safeParse(req.body);
    if (!parseResult.success) {
      const fieldErrors = parseResult.error.flatten().fieldErrors;
      res.status(400).json({
        success: false,
        message: "Report validation failed. Please correct the highlighted errors.",
        errors: fieldErrors,
      });
      return;
    }

    const { species, category, description, location, photos } = parseResult.data;

    // XSS Sanitization for freeform text fields
    const sanitizedDescription = xss(description);
    const sanitizedAddress = xss(location.address);
    const sanitizedZone = location.zone ? xss(location.zone) : "Central District";

    // Create Report Document with initialized status history
    const newReport = new Report({
      species,
      category,
      description: sanitizedDescription,
      photos,
      location: {
        type: "Point",
        coordinates: location.coordinates,
        address: sanitizedAddress,
        zone: sanitizedZone,
      },
      status: "submitted",
      statusHistory: [
        {
          status: "submitted",
          timestamp: new Date(),
          updatedBy: new mongoose.Types.ObjectId(req.user.id),
          note: "Initial citizen report submitted via portal",
        },
      ],
      reportedBy: new mongoose.Types.ObjectId(req.user.id),
    });

    const savedReport = await newReport.save();

    // Trigger asynchronous background AI enrichment (NLP classification, NER, urgency, duplicate check)
    nlpService.enqueueReport(savedReport._id.toString());

    res.status(201).json({
      success: true,
      message: "Incident report submitted successfully.",
      data: {
        report: savedReport,
      },
    });
  } catch (error: any) {
    console.error("Create Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred while creating the report.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get all reports submitted by the currently authenticated user
 * GET /api/reports/my-reports
 */
export const getMyReports = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const reports = await Report.find({
      reportedBy: new mongoose.Types.ObjectId(req.user.id),
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: {
        count: reports.length,
        reports,
      },
    });
  } catch (error: any) {
    console.error("Get My Reports Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve your submitted reports.",
    });
  }
};

/**
 * Get nearby active reports within a spatial radius using 2dsphere index
 * GET /api/reports/nearby?lat=&lng=&radius=
 */
export const getNearbyReports = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const latStr = req.query.lat as string;
    const lngStr = req.query.lng as string;
    const radiusStr = (req.query.radius as string) || "5000"; // default 5km (5000 meters)

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    const radius = parseFloat(radiusStr);

    // Validate query parameters
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      res.status(400).json({
        success: false,
        message:
          "Invalid coordinates. 'lat' must be between -90 and 90, 'lng' between -180 and 180.",
      });
      return;
    }

    if (isNaN(radius) || radius <= 0 || radius > 50000) {
      res.status(400).json({
        success: false,
        message: "Radius must be a positive number up to 50000 meters (50km).",
      });
      return;
    }

    // Geospatial query using 2dsphere index
    const nearbyReports = await Report.find({
      "location.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: radius,
        },
      },
    })
      .select("species category location status createdAt")
      .limit(30);

    res.status(200).json({
      success: true,
      data: {
        center: { lat, lng },
        radiusMeters: radius,
        count: nearbyReports.length,
        reports: nearbyReports,
      },
    });
  } catch (error: any) {
    console.error("Nearby Reports Error:", error);
    // Fallback gracefully if geospatial index is empty or building
    res.status(200).json({
      success: true,
      data: {
        center: { lat: 40.7128, lng: -74.006 },
        radiusMeters: 5000,
        count: 0,
        reports: [],
      },
    });
  }
};

/**
 * Get single report details with strict RBAC access control
 * GET /api/reports/:id
 */
export const getReportById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid report ID format.",
      });
      return;
    }

    const report = await Report.findById(id)
      .populate("reportedBy", "name email role")
      .populate("assignedTo", "name role organization");

    if (!report) {
      res.status(404).json({
        success: false,
        message: `Report with ID '${id}' not found.`,
      });
      return;
    }

    // Enforce Access Control: Citizens can ONLY view their own reports
    if (req.user?.role === "citizen") {
      const populatedId = report.populated("reportedBy");
      const reporterId =
        (populatedId ? populatedId.toString() : null) ||
        (report.reportedBy as any)?._id?.toString() ||
        report.reportedBy?.toString();

      if (reporterId !== req.user.id) {
        res.status(403).json({
          success: false,
          message:
            "Forbidden: You are only authorized to view reports submitted by your account.",
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        report,
      },
    });
  } catch (error: any) {
    console.error("Get Report By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error fetching report details.",
    });
  }
};
