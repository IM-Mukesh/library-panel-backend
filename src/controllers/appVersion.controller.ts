import { Request, Response } from "express";
import { AppVersionModel } from "../models/appVersion.model";

export const getLatestVersion = async (_req: Request, res: Response) => {
  try {
    const latest = await AppVersionModel.findOne()
      .sort({ createdAt: -1 })
      .lean();
    if (!latest)
      return res.status(404).json({ message: "No version info found" });
    return res.json(latest);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

export const createVersion = async (req: Request, res: Response) => {
  try {
    const updatedVersion = await AppVersionModel.findOneAndUpdate(
      {}, // No filter: update any one (or create if none exists)
      req.body,
      {
        new: true, // Return the updated document
        upsert: true, // Create if not found
        setDefaultsOnInsert: true,
      }
    );
    return res.status(200).json(updatedVersion);
  } catch (error) {
    return res.status(400).json({ message: "Invalid data", error });
  }
};
