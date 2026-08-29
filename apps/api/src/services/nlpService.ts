import { Types } from "mongoose";
import { Report, IReport } from "../models/Report.js";

const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || "http://localhost:8000";

interface NLPAnalysisResult {
  predicted_category: string;
  confidence: number;
  entities: Array<{
    text: string;
    label: string;
    category?: string;
    confidence?: number;
  }>;
  symptoms: string[];
  locations: string[];
  conditions: string[];
  equipment_recommended: string[];
  urgency_score: number;
  urgency_level: string;
  sentiment: {
    label: string;
    score: number;
  };
  urgency_signals: Array<{
    name: string;
    weight: number;
    matched_text: string;
    signal_type: string;
  }>;
  urgency_explanation: string;
  is_duplicate: boolean;
  top_match?: {
    id: string;
    similarity_score: number;
    is_duplicate: boolean;
    snippet: string;
  };
  duplicate_matches: Array<{
    id: string;
    similarity_score: number;
    is_duplicate: boolean;
    snippet: string;
  }>;
  embedding: number[];
}

export class NLPService {
  private static instance: NLPService;
  private isAvailable: boolean = true;
  private queue: string[] = [];
  private isProcessing: boolean = false;

  private constructor() {
    this.checkHealth();
  }

  public static getInstance(): NLPService {
    if (!NLPService.instance) {
      NLPService.instance = new NLPService();
    }
    return NLPService.instance;
  }

  /**
   * Check whether FastAPI NLP microservice is available
   */
  public async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${NLP_SERVICE_URL}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      this.isAvailable = res.ok;
      return res.ok;
    } catch {
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Enqueue a report for asynchronous background AI enrichment
   */
  public enqueueReport(reportId: string): void {
    this.queue.push(reportId);
    this.processQueue();
  }

  /**
   * Process background enrichment queue with retries
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    // In test environment or disconnected DB, avoid running background queue
    const mongoose = await import("mongoose");
    if (mongoose.default.connection.readyState !== 1) {
      this.queue = [];
      return;
    }

    this.isProcessing = true;
    while (this.queue.length > 0) {
      const reportId = this.queue.shift();
      if (!reportId) continue;

      if (mongoose.default.connection.readyState !== 1) {
        this.queue = [];
        break;
      }

      try {
        await this.enrichReport(reportId);
      } catch (err) {
        if (process.env.NODE_ENV !== "test") {
          console.warn(
            `[NLP Service] Asynchronous enrichment failed for report ${reportId}:`,
            (err as Error).message
          );
        }
      }
    }
    this.isProcessing = false;
  }

  /**
   * Enrich a single report with FastAPI NLP analysis
   */
  public async enrichReport(
    reportId: string,
    retryCount: number = 3
  ): Promise<boolean> {
    const report = await Report.findById(reportId);
    if (!report) {
      console.warn(`[NLP Service] Report ${reportId} not found for enrichment.`);
      return false;
    }

    // Step 1: Query nearby active candidate reports for duplicate comparison (within 5km radius)
    let candidateReports: Array<{ id: string; description: string }> = [];
    try {
      const [lng, lat] = report.location.coordinates;
      const nearbyDocs = await Report.find({
        _id: { $ne: report._id },
        "location.coordinates": {
          $near: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: 5000, // 5km
          },
        },
      })
        .limit(10)
        .select("_id description")
        .lean();

      candidateReports = nearbyDocs.map((doc) => ({
        id: doc._id.toString(),
        description: doc.description,
      }));
    } catch {
      // If spatial query fails or in-memory without index, candidate list remains empty
    }

    // Step 2: Call FastAPI unified /analyze endpoint with retries
    let attempt = 0;
    let analysisResult: NLPAnalysisResult | null = null;

    while (attempt < retryCount && !analysisResult) {
      attempt++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`${NLP_SERVICE_URL}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: report.description,
            species: report.species,
            category: report.category,
            location: {
              coordinates: report.location.coordinates,
              address: report.location.address,
            },
            candidates: candidateReports,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          analysisResult = (await response.json()) as NLPAnalysisResult;
        } else {
          throw new Error(`NLP Service returned status ${response.status}`);
        }
      } catch (error) {
        if (attempt < retryCount) {
          // Exponential backoff: 500ms, 1000ms
          await new Promise((res) => setTimeout(res, attempt * 500));
        } else {
          console.warn(
            `[NLP Service] Reached max retry attempts (${retryCount}) for report ${reportId}. Storing graceful fallback.`
          );
        }
      }
    }

    // Step 3: Update Report Document in MongoDB
    if (analysisResult) {
      report.urgencyScore = Math.round(analysisResult.urgency_score * 100);
      report.sentiment = {
        score: Math.round(analysisResult.sentiment.score * 100),
        label: analysisResult.sentiment.label,
      };
      report.entities = analysisResult.entities.map((ent) => ({
        text: ent.text,
        label: ent.label,
        category: ent.category,
        confidence: ent.confidence,
      }));
      report.embedding = analysisResult.embedding;
      report.isDuplicate = analysisResult.is_duplicate;

      if (
        analysisResult.is_duplicate &&
        analysisResult.top_match &&
        Types.ObjectId.isValid(analysisResult.top_match.id)
      ) {
        report.originalReport = new Types.ObjectId(analysisResult.top_match.id);
      }

      // Transition status to classified
      if (report.status === "submitted") {
        report.status = "classified";
        report.statusHistory.push({
          status: "classified",
          timestamp: new Date(),
          note: `AI Triage Complete: Urgency ${report.urgencyScore}/100 (${analysisResult.urgency_level.toUpperCase()}). ${analysisResult.urgency_explanation}`,
        });
      }

      await report.save();
      console.log(
        `✅ [NLP Service] Successfully enriched Report #${report._id} with AI Insights (Urgency: ${report.urgencyScore}/100)`
      );

      // Emit real-time Socket.IO events for live dashboard updates
      try {
        const { emitSocketEvent } = await import("../config/socket.js");
        emitSocketEvent("report:classified", {
          reportId: report._id,
          status: "classified",
          urgencyScore: report.urgencyScore,
          category: report.category,
          species: report.species,
          report,
        });

        // High urgency critical alert broadcast (Urgency >= 70)
        if (report.urgencyScore && report.urgencyScore >= 70) {
          emitSocketEvent(
            "report:emergency_alert",
            {
              reportId: report._id,
              urgencyScore: report.urgencyScore,
              title: `High-Urgency ${report.species.toUpperCase()} ${report.category.toUpperCase()}`,
              description: report.description,
              location: report.location.address,
              report,
            },
            "role:admin"
          );
        }
      } catch (socketErr) {
        // Socket emission failure shouldn't crash worker
      }

      return true;
    }

    return false;
  }
}

export const nlpService = NLPService.getInstance();
