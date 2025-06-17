import mongoose, { Schema, type Document } from "mongoose";
import type { IFounder } from "../types";

interface IFounderDocument extends IFounder, Document {}

const founderSchema = new Schema<IFounderDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Founder = mongoose.model<IFounderDocument>(
  "Founder",
  founderSchema
);
