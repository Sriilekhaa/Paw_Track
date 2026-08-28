import mongoose, { Document, Model, Schema } from "mongoose";

export type SpeciesType =
  | "dog"
  | "cat"
  | "cattle"
  | "monkey"
  | "bird"
  | "other";

export type ReportCategory =
  | "injury"
  | "bite_incident"
  | "stray_sighting"
  | "sterilization_request"
  | "cruelty_report"
  | "roadkill"
  | "adoption_inquiry";

export type ReportStatus =
  | "submitted"
  | "classified"
  | "assigned"
  | "in_progress"
  | "resolved";

export interface IStatusHistoryItem {
  status: ReportStatus;
  timestamp: Date;
  updatedBy?: mongoose.Types.ObjectId;
  note?: string;
}

export interface IReportLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
  zone?: string;
}

export interface IReport extends Document {
  _id: mongoose.Types.ObjectId;
  species: SpeciesType;
  category: ReportCategory;
  description: string;
  photos: string[];
  location: IReportLocation;
  status: ReportStatus;
  statusHistory: IStatusHistoryItem[];
  reportedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  
  // Future NLP & AI fields (populated later by apps/nlp)
  urgencyScore?: number;
  sentiment?: {
    score?: number;
    label?: "low" | "medium" | "high" | "critical";
  };
  entities?: Array<{
    text: string;
    label: string;
    confidence?: number;
  }>;
  embedding?: number[];
  isDuplicate?: boolean;
  originalReport?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const ReportLocationSchema = new Schema<IReportLocation>(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function (val: number[]) {
          return (
            val.length === 2 &&
            val[0] >= -180 &&
            val[0] <= 180 &&
            val[1] >= -90 &&
            val[1] <= 90
          );
        },
        message: "Coordinates must be [longitude (-180 to 180), latitude (-90 to 90)]",
      },
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    zone: {
      type: String,
      trim: true,
      default: "Central",
    },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema<IStatusHistoryItem>(
  {
    status: {
      type: String,
      enum: ["submitted", "classified", "assigned", "in_progress", "resolved"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const ReportSchema = new Schema<IReport>(
  {
    species: {
      type: String,
      enum: {
        values: ["dog", "cat", "cattle", "monkey", "bird", "other"],
        message: "{VALUE} is not a valid species",
      },
      required: [true, "Species selection is required"],
    },
    category: {
      type: String,
      enum: {
        values: [
          "injury",
          "bite_incident",
          "stray_sighting",
          "sterilization_request",
          "cruelty_report",
          "roadkill",
          "adoption_inquiry",
        ],
        message: "{VALUE} is not a valid category",
      },
      required: [true, "Incident category is required"],
    },
    description: {
      type: String,
      required: [true, "Incident description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    photos: {
      type: [String],
      default: [],
    },
    location: {
      type: ReportLocationSchema,
      required: [true, "Incident location is required"],
    },
    status: {
      type: String,
      enum: ["submitted", "classified", "assigned", "in_progress", "resolved"],
      default: "submitted",
    },
    statusHistory: {
      type: [StatusHistorySchema],
      default: function () {
        return [
          {
            status: "submitted",
            timestamp: new Date(),
            note: "Report created",
          },
        ];
      },
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reporter reference is required"],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    // Future NLP Fields
    urgencyScore: {
      type: Number,
      min: 0,
      max: 100,
      required: false,
    },
    sentiment: {
      score: Number,
      label: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
      },
    },
    entities: [
      {
        text: String,
        label: String,
        confidence: Number,
      },
    ],
    embedding: {
      type: [Number],
      select: false,
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    originalReport: {
      type: Schema.Types.ObjectId,
      ref: "Report",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for location geospatial queries
ReportSchema.index({ "location.coordinates": "2dsphere" });
ReportSchema.index({ status: 1, species: 1 });
ReportSchema.index({ reportedBy: 1 });
ReportSchema.index({ assignedTo: 1 });

export const Report: Model<IReport> =
  mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);
