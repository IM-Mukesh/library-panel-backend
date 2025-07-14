import type { Request } from "express";
import type { JwtPayload } from "jsonwebtoken";
import type { Document } from "mongoose";

// ========================
// Base Interfaces
// ========================

export interface IFounder {
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
}

export interface ILibrary {
  name: string;
  code: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  profileImage: string;
  passwordHash: string;
  address: string;
  status: "active" | "inactive";
  isPaymentRequired: boolean;
  billingAmount: number;
  billingStartDate: Date;
  lastPaidDate: Date | null;
  nextDueDate: Date | null;
  accessBlocked: boolean;
  paymentNotes: string;
  createdAt: Date;
}

// Extend Mongoose Document for library
export interface ILibraryDocument extends ILibrary, Document {
  _id: string;
}

// ========================
// JWT Payload Interfaces
// ========================

export interface IFounderJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: "founder";
}

export interface ILibraryJwtPayload extends JwtPayload {
  libraryId: string;
  adminEmail: string;
  role: "library_admin";
}

// ========================
// Extended Request Interfaces
// ========================

export interface IFounderRequest extends Request {
  founder?: IFounderJwtPayload;
}

export interface ILibraryRequest extends Request {
  library?: ILibraryJwtPayload;
}

// ========================
// API Response Interface
// ========================

export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// ========================
// Request Body Interfaces
// ========================

export interface ICreateLibraryRequest {
  name: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  address: string;
  billingAmount: number;
  isPaymentRequired: boolean;
  password: string;
  code: string;
  notes?: string;
}

// ========================
// Filter Query Interface
// ========================

export interface ILibraryFilters {
  status?: "active" | "inactive";
  accessBlocked?: boolean;
  isPaymentRequired?: boolean;
  search?: string;
}
