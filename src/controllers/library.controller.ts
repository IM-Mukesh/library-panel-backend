import type { Response } from "express";
const { validationResult } = require("express-validator");
import { Library } from "../models/Library";
import bcrypt from "bcrypt";
// import { generateLibraryCode } from "../utils/library-code";
import {
  hashPassword,
  // generateRandomPassword,
  comparePassword,
} from "../utils/password";
import { generateLibraryToken } from "../utils/jwt";
import { sendSuccess, sendError } from "../utils/response";
import type {
  IFounderRequest,
  ILibraryRequest,
  ICreateLibraryRequest,
} from "../types";
import { Request } from "express";
/**
 * GET /api/libraries - Get all libraries with filters
 */
export const getLibraries = async (
  req: IFounderRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, "Validation failed", 400, errors.array()[0]?.msg);
      return;
    }

    const { status, accessBlocked, isPaymentRequired, search } =
      req.query as any;

    const filter: Record<string, any> = {};

    if (status) filter["status"] = status;
    if (accessBlocked === "true" || accessBlocked === "false")
      filter["accessBlocked"] = accessBlocked === "true";
    if (isPaymentRequired === "true" || isPaymentRequired === "false")
      filter["isPaymentRequired"] = isPaymentRequired === "true";

    if (search) {
      filter["$or"] = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { adminName: { $regex: search, $options: "i" } },
        { adminEmail: { $regex: search, $options: "i" } },
      ];
    }

    const libraries = await Library.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    sendSuccess(res, "Libraries retrieved successfully", {
      libraries,
      count: libraries.length,
    });
  } catch (error) {
    console.error("Get libraries error:", error);
    sendError(res, "Failed to retrieve libraries", 500);
  }
};

/**
 * POST /api/libraries - Create new library
 */
export const createLibrary = async (
  req: IFounderRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, "Validation failed", 400, errors.array()[0]?.msg);
      return;
    }

    const libraryData: ICreateLibraryRequest = {
      ...req.body,
      billingAmount: parseFloat(req.body.billingAmount),
    };

    const existingLibrary = await Library.findOne({
      adminEmail: libraryData.adminEmail,
    });
    if (existingLibrary) {
      sendError(res, "Admin email already exists", 400);
      return;
    }

    // const code = libraryData?.code
    //   ? libraryData?.code
    //   : await generateLibraryCode();
    // const randomPassword = generateRandomPassword();
    // const passwordHash = await hashPassword(randomPassword);

    const password = libraryData?.password;
    const passwordHash = await hashPassword(password);

    const library = new Library({
      ...libraryData,
      passwordHash,
    });

    await library.save();
    const { passwordHash: _, ...libraryResponse } = library.toObject();

    sendSuccess(
      res,
      "Library created successfully",
      {
        library: libraryResponse,
      },
      201
    );
  } catch (error) {
    console.error("Create library error:", error);
    sendError(res, "Failed to create library", 500);
  }
};

/**
 * GET /api/libraries/:id - Get single library
 */
export const getLibrary = async (
  req: IFounderRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, "Validation failed", 400, errors.array()[0]?.msg);
      return;
    }

    const { id } = req.params;
    const library = await Library.findById(id).select("-passwordHash");

    if (!library) {
      sendError(res, "Library not found", 404);
      return;
    }

    sendSuccess(res, "Library retrieved successfully", { library });
  } catch (error) {
    console.error("Get library error:", error);
    sendError(res, "Failed to retrieve library", 500);
  }
};

export const updateLibrary = async (
  req: IFounderRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedLibrary = await Library.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedLibrary) {
      res.status(404).json({ message: "Library not found" });
      return;
    }

    res.status(200).json({ message: "Library updated", data: updatedLibrary });
  } catch (err) {
    console.error("Error updating library:", err);
    res.status(500).json({ message: "Failed to update library" });
  }
};

/**
 * PATCH /api/libraries/:id/block - Block access
 */
export const blockLibrary = async (
  req: IFounderRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const library = await Library.findByIdAndUpdate(
      id,
      { accessBlocked: true },
      { new: true }
    ).select("-passwordHash");

    if (!library) {
      sendError(res, "Library not found", 404);
      return;
    }

    sendSuccess(res, "Library access blocked", { library });
  } catch (error) {
    console.error("Block library error:", error);
    sendError(res, "Failed to block library access", 500);
  }
};

/**
 * PATCH /api/libraries/:id/unblock - Unblock access
 */
export const unblockLibrary = async (
  req: IFounderRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const library = await Library.findByIdAndUpdate(
      id,
      { accessBlocked: false },
      { new: true }
    ).select("-passwordHash");

    if (!library) {
      sendError(res, "Library not found", 404);
      return;
    }

    sendSuccess(res, "Library access unblocked", { library });
  } catch (error) {
    console.error("Unblock library error:", error);
    sendError(res, "Failed to unblock library access", 500);
  }
};

/**
 * PATCH /api/libraries/:id/mark-paid - Mark as paid
 */
export const markLibraryPaid = async (
  req: IFounderRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentNotes } = req.body;

    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const updateData: any = {
      lastPaidDate: today,
      nextDueDate: nextMonth,
      accessBlocked: false,
    };

    if (paymentNotes) {
      updateData.paymentNotes = paymentNotes;
    }

    const library = await Library.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-passwordHash");

    if (!library) {
      sendError(res, "Library not found", 404);
      return;
    }

    sendSuccess(res, "Library marked as paid", { library });
  } catch (error) {
    console.error("Mark paid error:", error);
    sendError(res, "Failed to mark as paid", 500);
  }
};

export const getDashboardStats = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const libraries = await Library.find();

    const today = new Date();
    let total = 0;
    let active = 0;
    let blocked = 0;
    let unpaid = 0;

    for (const lib of libraries) {
      total++;
      if (lib.status === "active") active++;
      if (lib.accessBlocked) blocked++;
      const isUnpaid =
        lib.isPaymentRequired &&
        (!lib.lastPaidDate ||
          (lib.nextDueDate && new Date(lib.nextDueDate) < today));
      if (isUnpaid) unpaid++;
    }

    sendSuccess(res, "Dashboard stats fetched", {
      totalLibraries: total,
      activeLibraries: active,
      blockedLibraries: blocked,
      unpaidLibraries: unpaid,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    sendError(res, "Failed to fetch dashboard stats", 500);
  }
};

export const getRecentActivities = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    // Future: fetch from Activity or Audit collection
    const activities = [
      {
        id: 1,
        action: "New library created",
        library: "Central Library",
        time: "10 minutes ago",
      },
      {
        id: 2,
        action: "Library blocked",
        library: "Patna Library",
        time: "2 hours ago",
      },
    ];

    sendSuccess(res, "Recent activities fetched", activities);
  } catch (error) {
    console.error("Recent activities error:", error);
    sendError(res, "Failed to fetch recent activities", 500);
  }
};

/**
 * POST /api/library/login - Admin login
 */

export const libraryLogin = async (
  req: ILibraryRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, "Validation failed", 400, errors.array()[0]?.msg);
      return;
    }

    const { adminEmail, password } = req.body;

    // Find library by adminEmail
    const library = await Library.findOne({ adminEmail });
    if (!library) {
      sendError(res, "Invalid credentials", 401);
      return;
    }

    // Compare hashed password
    const isPasswordValid = await comparePassword(
      password,
      library.passwordHash
    );
    if (!isPasswordValid) {
      sendError(res, "Invalid credentials", 401);
      return;
    }

    // Safely convert _id to string
    const token = generateLibraryToken(String(library._id), adminEmail);

    // Exclude passwordHash from response
    const { passwordHash, ...libraryResponse } = library.toObject();

    sendSuccess(res, "Login successful", {
      token,
      library: libraryResponse,
    });
  } catch (error) {
    console.error("Library login error:", error);
    sendError(res, "Login failed", 500);
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const libraryId = req?.library?.libraryId;

    const { oldPassword, newPassword } = req.body;

    if (!libraryId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both old and new passwords are required" });
    }

    const library = await Library.findById(libraryId);
    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, library.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    library.passwordHash = hashed;
    await library.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
