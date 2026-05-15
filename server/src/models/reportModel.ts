import mongoose, { Document, Schema } from "mongoose";
import { IReport } from "../types/model.types.js";

export interface ReportDocument extends IReport, Document {}

const reportSchema: Schema<ReportDocument> = new Schema(
  {
    image: {
      type: String,
      required: true,
      trim: true,
    },
    number_plate: {
      type: String,
      required: true,
      trim: true,
    },
    violation: {
      type: String,
      required: true,
      enum: [
        "speeding",
        "running_red_light",
        "drunk_driving",
        "reckless_driving",
      ],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      name: { type: String, trim: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Report = mongoose.model<IReport>("Report", reportSchema);
export default Report;
