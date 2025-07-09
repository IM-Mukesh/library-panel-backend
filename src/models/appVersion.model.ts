import mongoose, { Document, Schema } from "mongoose";
import { AppVersion } from "../types/appVersion.types";

export interface AppVersionDocument extends AppVersion, Document {}

const AppVersionSchema = new Schema<AppVersionDocument>(
  {
    // currentVersion: { type: String, required: true },
    latestVersion: { type: String, required: true },
    updateUrl: { type: String, required: true },
    releaseNotes: { type: String },
    forceUpdate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AppVersionModel = mongoose.model<AppVersionDocument>(
  "AppVersion",
  AppVersionSchema
);
