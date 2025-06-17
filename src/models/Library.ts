import mongoose, { Schema, type Document } from "mongoose";
import type { ILibrary } from "../types";

interface ILibraryDocument extends ILibrary, Document {}

const librarySchema = new Schema<ILibraryDocument>({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  adminName: { type: String, required: true, trim: true },
  adminEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  adminPhone: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  address: { type: String, required: true, trim: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  isPaymentRequired: { type: Boolean, default: true },
  billingAmount: { type: Number, required: true, min: 0 },
  billingStartDate: { type: Date, default: Date.now },
  lastPaidDate: { type: Date, default: null },
  nextDueDate: { type: Date, default: null },
  accessBlocked: { type: Boolean, default: false },
  paymentNotes: { type: String, default: "", trim: true },
  createdAt: { type: Date, default: Date.now },
});

// ❌ REMOVE duplicate indexes (code and adminEmail already have unique:true)
// ✅ Keep only those that are not already defined via `unique`
librarySchema.index({ status: 1 });
librarySchema.index({ accessBlocked: 1 });
librarySchema.index({ nextDueDate: 1 });

librarySchema.pre("save", function (next) {
  if (this.isNew && this.isPaymentRequired && !this.nextDueDate) {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    this.nextDueDate = nextMonth;
  }
  next();
});

export const Library = mongoose.model<ILibraryDocument>(
  "Library",
  librarySchema
);
