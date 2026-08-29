import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import { Report } from "../src/models/Report.js";
import { User } from "../src/models/User.js";
import { generateAccessToken } from "../src/utils/tokens.js";

describe("Field Dispatch, Status Workflow & SLA Analytics Tests", () => {
  let mongoServer: MongoMemoryServer;
  let adminId: string;
  let adminToken: string;
  let fieldWorkerId: string;
  let fieldWorkerToken: string;
  let citizenId: string;
  let citizenToken: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Create Admin User
    adminId = new mongoose.Types.ObjectId().toString();
    await User.create({
      _id: adminId,
      name: "Dr. Sarah Chen",
      email: "admin@pawtrack.test",
      password: "Password123!",
      role: "admin",
    });
    adminToken = generateAccessToken({
      id: adminId,
      email: "admin@pawtrack.test",
      role: "admin",
    });

    // Create Field Worker User
    fieldWorkerId = new mongoose.Types.ObjectId().toString();
    await User.create({
      _id: fieldWorkerId,
      name: "Officer Alex Rivera",
      email: "officer@pawtrack.test",
      password: "Password123!",
      role: "field_worker",
      organization: "Northside Rescue Unit",
    });
    fieldWorkerToken = generateAccessToken({
      id: fieldWorkerId,
      email: "officer@pawtrack.test",
      role: "field_worker",
    });

    // Create Citizen User
    citizenId = new mongoose.Types.ObjectId().toString();
    await User.create({
      _id: citizenId,
      name: "Jane Citizen",
      email: "citizen@pawtrack.test",
      password: "Password123!",
      role: "citizen",
    });
    citizenToken = generateAccessToken({
      id: citizenId,
      email: "citizen@pawtrack.test",
      role: "citizen",
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Report.deleteMany({});
  });

  describe("1. Assignment & Dispatch Logic", () => {
    it("should allow Admin to assign a report to a Field Worker", async () => {
      const report = await Report.create({
        species: "dog",
        category: "injury",
        description: "Limping stray dog with fractured leg in sector 15.",
        location: {
          coordinates: [-74.006, 40.7128],
          address: "Sector 15 Park",
        },
        status: "classified",
        urgencyScore: 85,
        reportedBy: new mongoose.Types.ObjectId(citizenId),
      });

      const res = await request(app)
        .post(`/api/reports/${report._id}/assign`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          fieldWorkerId,
          note: "Urgent canine fracture response.",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.report.assignedTo._id.toString()).toBe(fieldWorkerId);
      expect(res.body.data.report.status).toBe("assigned");
      expect(res.body.data.report.statusHistory).toHaveLength(2);
    });

    it("should reject Citizen from attempting to assign a report with 403 Forbidden", async () => {
      const report = await Report.create({
        species: "dog",
        category: "injury",
        description: "Limping dog needing assignment.",
        location: {
          coordinates: [-74.006, 40.7128],
          address: "Sector 15 Park",
        },
        status: "classified",
        reportedBy: new mongoose.Types.ObjectId(citizenId),
      });

      const res = await request(app)
        .post(`/api/reports/${report._id}/assign`)
        .set("Authorization", `Bearer ${citizenToken}`)
        .send({ fieldWorkerId });

      expect(res.status).toBe(403);
    });

    it("should auto-suggest available field workers with recommendation score", async () => {
      const report = await Report.create({
        species: "dog",
        category: "injury",
        description: "High priority fracture case.",
        location: {
          coordinates: [-74.006, 40.7128],
          address: "Sector 15 Park",
        },
        status: "classified",
        urgencyScore: 90,
        reportedBy: new mongoose.Types.ObjectId(citizenId),
      });

      const res = await request(app)
        .get(`/api/reports/${report._id}/suggest-dispatch`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.suggestions).toBeDefined();
      expect(res.body.data.suggestions.length).toBeGreaterThan(0);
      expect(res.body.data.suggestions[0].recommendationScore).toBeGreaterThan(0);
    });
  });

  describe("2. State Machine Status Transitions", () => {
    it("should allow valid progression: classified -> assigned -> in_progress -> resolved", async () => {
      const report = await Report.create({
        species: "cattle",
        category: "injury",
        description: "Injured cow on expressway shoulder.",
        location: {
          coordinates: [-74.006, 40.7128],
          address: "Highway km 12",
        },
        status: "classified",
        assignedTo: new mongoose.Types.ObjectId(fieldWorkerId),
        reportedBy: new mongoose.Types.ObjectId(citizenId),
      });

      // 1. Transition to in_progress
      const step1 = await request(app)
        .patch(`/api/reports/${report._id}/status`)
        .set("Authorization", `Bearer ${fieldWorkerToken}`)
        .send({ status: "in_progress", note: "Arrived on scene with cattle hydraulic unit." });

      expect(step1.status).toBe(200);
      expect(step1.body.data.report.status).toBe("in_progress");

      // 2. Transition to resolved with resolution notes
      const step2 = await request(app)
        .patch(`/api/reports/${report._id}/status`)
        .set("Authorization", `Bearer ${fieldWorkerToken}`)
        .send({
          status: "resolved",
          resolutionNotes: "Bandaged hoof wound and transported to shelter sanctuary.",
        });

      expect(step2.status).toBe(200);
      expect(step2.body.data.report.status).toBe("resolved");
    });

    it("should reject invalid status jump from submitted directly to resolved with 400 Bad Request", async () => {
      const report = await Report.create({
        species: "dog",
        category: "stray_sighting",
        description: "Stray sighting description.",
        location: {
          coordinates: [-74.006, 40.7128],
          address: "Main street",
        },
        status: "submitted",
        reportedBy: new mongoose.Types.ObjectId(citizenId),
      });

      const res = await request(app)
        .patch(`/api/reports/${report._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "resolved" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("INVALID_STATUS_TRANSITION");
    });

    it("should reject backward transition from resolved back to in_progress", async () => {
      const report = await Report.create({
        species: "dog",
        category: "stray_sighting",
        description: "Already resolved case.",
        location: {
          coordinates: [-74.006, 40.7128],
          address: "Main street",
        },
        status: "resolved",
        reportedBy: new mongoose.Types.ObjectId(citizenId),
      });

      const res = await request(app)
        .patch(`/api/reports/${report._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "in_progress" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("INVALID_STATUS_TRANSITION");
    });
  });

  describe("3. SLA & Response-Time Analytics", () => {
    it("should compute resolution metrics and SLA tier breakdown", async () => {
      const now = Date.now();
      await Report.create({
        species: "dog",
        category: "injury",
        description: "Resolved critical fracture case.",
        location: {
          coordinates: [-74.006, 40.7128],
          address: "City Central",
        },
        status: "resolved",
        urgencyScore: 85,
        reportedBy: new mongoose.Types.ObjectId(citizenId),
        statusHistory: [
          { status: "submitted", timestamp: new Date(now - 3600 * 1000) },
          { status: "classified", timestamp: new Date(now - 3590 * 1000) },
          { status: "assigned", timestamp: new Date(now - 3000 * 1000) },
          { status: "resolved", timestamp: new Date(now) },
        ],
      });

      const res = await request(app)
        .get("/api/reports/analytics/sla-summary")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.overallAvgResolutionMinutes).toBeDefined();
      expect(res.body.data.urgencyBreakdown.high).toBeDefined();
      expect(res.body.data.categoryBreakdown).toBeDefined();
    });
  });
});
