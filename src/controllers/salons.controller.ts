import { Request, Response } from "express";
import Salon from "../models/salon.model";
import { Types } from "mongoose";
import { generateUploadUrl } from "../config/salons3";

export const getNearbySalons = async (req: Request, res: Response) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    return res
      .status(400)
      .json({ error: "Latitude and longitude are required" });
  }

  try {
    const salons = await Salon.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          distanceField: "distance",
          spherical: true,
          maxDistance: 50000, // 5km
        },
      },
    ]);

    res.json({ salons });
  } catch (error) {
    console.error("Error finding nearby salons:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createSalon = async (req: Request, res: Response) => {
  const { name, address, coordinates } = req.body;

  if (!name || !address || !coordinates || coordinates.length !== 2) {
    return res.status(400).json({ error: "Missing or invalid fields" });
  }

  try {
    const salon = new Salon({
      name,
      address,
      location: {
        type: "Point",
        coordinates,
      },
    });

    await salon.save();
    res.status(201).json({ message: "Salon created successfully", salon });
  } catch (error) {
    console.error("Error creating salon:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSalonById = async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validate if ID is a valid MongoDB ObjectId
  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid salon ID" });
  }

  try {
    const salon = await Salon.findById(id);

    if (!salon) {
      return res.status(404).json({ error: "Salon not found" });
    }

    res.json(salon);
  } catch (error) {
    console.error("Error fetching salon by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllSalons = async (_req: Request, res: Response) => {
  try {
    const salons = await Salon.find().sort({ createdAt: -1 }); // newest first
    res.json({ count: salons.length, salons });
  } catch (error) {
    console.error("Error fetching all salons:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUploadUrl = async (_req: Request, res: Response) => {
  try {
    const { uploadUrl, publicUrl } = await generateUploadUrl();
    res.json({ uploadUrl, publicUrl });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
};

export const getSalonProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const salon = await Salon.findOne({ owner: userId });

  if (!salon) return res.status(404).json({ error: "Salon profile not found" });

  res.json(salon);
};

export const updateSalonProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const {
    name,
    address,
    coordinates,
    images,
    qrCodeUrl,
    contact,
    description,
    businessHours,
    pinCode,
  } = req.body;

  const salon = await Salon.findOne({ owner: userId });

  if (!salon) return res.status(404).json({ error: "Salon profile not found" });

  if (name) salon.name = name;
  if (address) salon.address = address;
  if (coordinates) salon.location.coordinates = coordinates;
  if (Array.isArray(images)) {
    // Overwrite with the full updated image list (trust frontend)
    const unique = Array.from(new Set(images)); // optional deduplication
    salon.images = unique.slice(0, 10); // limit to max 10
  }

  if (qrCodeUrl) salon.qrCodeUrl = qrCodeUrl;

  if (contact) salon.contact = contact;
  if (description) salon.description = description;
  if (businessHours) salon.businessHours = businessHours;
  if (pinCode) salon.pinCode = pinCode;

  await salon.save();
  res.json({ message: "Salon profile updated", salon });
};

export const addSalonImage = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { imageUrl } = req.body;

  if (!imageUrl)
    return res.status(400).json({ error: "Image URL is required" });

  const salon = await Salon.findOne({ owner: userId });

  if (!salon) return res.status(404).json({ error: "Salon not found" });

  if (salon.images.length >= 10) {
    return res.status(400).json({ error: "Max 10 images allowed" });
  }

  salon.images.push(imageUrl);
  await salon.save();

  res.json({ message: "Image added", images: salon.images });
};
