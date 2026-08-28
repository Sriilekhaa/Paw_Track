import request from "supertest";
import app from "../src/app.js";
import { generateAccessToken } from "../src/utils/tokens.js";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Report } from "../src/models/Report.js";

describe("Report Submission & Media Pipeline API Tests", () => {
  let mongoServer: MongoMemoryServer;

  const citizenAId = new mongoose.Types.ObjectId().toString();
  const citizenBId = new mongoose.Types.ObjectId().toString();
  const fieldWorkerId = new mongoose.Types.ObjectId().toString();

  const citizenAToken = generateAccessToken({
    id: citizenAId,
    email: "citizen.a@pawtrack.test",
    role: "citizen",
  });

  const citizenBToken = generateAccessToken({
    id: citizenBId,
    email: "citizen.b@pawtrack.test",
    role: "citizen",
  });

  const fieldWorkerToken = generateAccessToken({
    id: fieldWorkerId,
    email: "officer.field@pawtrack.test",
    role: "field_worker",
  });

  let createdReportId: string;

  beforeAll(async () => {
    // Spin up fast isolated in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  describe("1. Validation & Security Checks (POST /api/reports)", () => {
    it("should reject unauthenticated report submissions with 401 Unauthorized", async () => {
      const res = await request(app)
        .post("/api/reports")
        .send({
          species: "dog",
          category: "stray_sighting",
          description: "Friendly stray dog wandering near park entrance.",
          location: {
            coordinates: [-74.006, 40.7128],
            address: "Central Park West",
          },
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject invalid species enum with 400 Bad Request and field-level error", async () => {
      const res = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${citizenAToken}`)
        .send({
          species: "dragon", // Invalid enum
          category: "stray_sighting",
          description: "Friendly stray dog wandering near park entrance.",
          location: {
            coordinates: [-74.006, 40.7128],
            address: "Central Park West",
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors?.species).toBeDefined();
    });

    it("should reject descriptions shorter than 10 characters with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${citizenAToken}`)
        .send({
          species: "cat",
          category: "injury",
          description: "Too short", // Only 9 characters
          location: {
            coordinates: [-74.006, 40.7128],
            address: "Maple Street",
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors?.description).toBeDefined();
    });

    it("should reject descriptions exceeding 1000 characters with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${citizenAToken}`)
        .send({
          species: "cat",
          category: "injury",
          description: "A".repeat(1005),
          location: {
            coordinates: [-74.006, 40.7128],
            address: "Maple Street",
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors?.description).toBeDefined();
    });

    it("should reject invalid coordinates (out of range latitude) with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${citizenAToken}`)
        .send({
          species: "dog",
          category: "stray_sighting",
          description: "Valid description text for the report.",
          location: {
            coordinates: [-74.006, 120.0], // Latitude must be between -90 and 90
            address: "Maple Street",
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("2. Successful Submission & Storage (POST /api/reports)", () => {
    it("should successfully create report, sanitize XSS, initialize statusHistory, and return 201", async () => {
      const res = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${citizenAToken}`)
        .send({
          species: "dog",
          category: "stray_sighting",
          description:
            "Found medium golden retriever wandering near Northside entrance with slight limp. <script>alert('xss')</script>",
          photos: [
            "https://res.cloudinary.com/demo/image/upload/sample.jpg",
          ],
          location: {
            coordinates: [-74.006, 40.7128],
            address: "Northside Park Gate 4",
            zone: "Sector 4",
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data?.report).toBeDefined();
      const report = res.body.data.report;

      createdReportId = report._id;

      // Verify status and initialized statusHistory
      expect(report.status).toBe("submitted");
      expect(report.statusHistory).toHaveLength(1);
      expect(report.statusHistory[0].status).toBe("submitted");

      // Verify XSS script tags were sanitized
      expect(report.description).not.toContain("<script>");

      // Verify photos array
      expect(report.photos).toHaveLength(1);
    });
  });

  describe("3. Geospatial Search (GET /api/reports/nearby)", () => {
    it("should reject invalid query coordinates with 400 Bad Request", async () => {
      const res = await request(app).get(
        "/api/reports/nearby?lat=invalid_lat&lng=-74.006"
      );

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should accept valid coordinates and return nearby reports array with 200 OK", async () => {
      const res = await request(app).get(
        "/api/reports/nearby?lat=40.7128&lng=-74.0060&radius=5000"
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data?.reports)).toBe(true);
    });
  });

  describe("4. RBAC Access Control Enforcement (GET /api/reports/:id)", () => {
    it("should enforce that Citizen B is forbidden (403) from viewing Citizen A's report", async () => {
      expect(createdReportId).toBeDefined();

      const res = await request(app)
        .get(`/api/reports/${createdReportId}`)
        .set("Authorization", `Bearer ${citizenBToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Forbidden");
    });

    it("should allow Citizen A to view their own report with 200 OK", async () => {
      expect(createdReportId).toBeDefined();

      const res = await request(app)
        .get(`/api/reports/${createdReportId}`)
        .set("Authorization", `Bearer ${citizenAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data?.report?._id).toBe(createdReportId);
    });

    it("should allow Field Worker to view any citizen report with 200 OK", async () => {
      expect(createdReportId).toBeDefined();

      const res = await request(app)
        .get(`/api/reports/${createdReportId}`)
        .set("Authorization", `Bearer ${fieldWorkerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data?.report?._id).toBe(createdReportId);
    });
  });

  describe("5. Submission Rate Limiting Enforcement", () => {
    it("should enforce maximum 10 report submissions per user and return 429 on 11th attempt", async () => {
      const spammerId = new mongoose.Types.ObjectId().toString();
      const spammerToken = generateAccessToken({
        id: spammerId,
        email: "spammer@pawtrack.test",
        role: "citizen",
      });

      const reportPayload = {
        species: "dog",
        category: "stray_sighting",
        description: "Valid incident report description for testing rate limits.",
        location: {
          coordinates: [-74.006, 40.7128],
          address: "123 Main Street",
        },
      };

      // Submit 10 reports
      for (let i = 0; i < 10; i++) {
        const res = await request(app)
          .post("/api/reports")
          .set("Authorization", `Bearer ${spammerToken}`)
          .send(reportPayload);

        expect(res.status).toBe(201);
      }

      // 11th submission attempt should be blocked with 429
      const rateLimitedRes = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${spammerToken}`)
        .send(reportPayload);

      expect(rateLimitedRes.status).toBe(429);
      expect(rateLimitedRes.body.success).toBe(false);
      expect(rateLimitedRes.body.code).toBe("RATE_LIMIT_EXCEEDED");
      expect(rateLimitedRes.body.retryAfter).toBeDefined();
    });
  });

  describe("6. Media Upload Pipeline (POST /api/uploads/report-photo)", () => {
    it("should reject non-image file uploads with 400 Bad Request", async () => {
      const textBuffer = Buffer.from("this is a text file not an image");

      const res = await request(app)
        .post("/api/uploads/report-photo")
        .set("Authorization", `Bearer ${citizenAToken}`)
        .attach("photo", textBuffer, "document.txt");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid file type");
    });
  });
});
