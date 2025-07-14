import { Router } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "../config/s3";
import { authenticateLibrary } from "../middlewares/auth";
import { Library } from "../models/Library";
import Student from "../models/Student";
import type { ILibraryRequest } from "../types";
import type { Response } from "express";
import type { MulterS3 } from "multer-s3";

const router = Router();

// S3 upload config
export const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET!,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req: ILibraryRequest, file, cb) => {
      const id = req.body.studentId || req.library?.libraryId;

      if (!id) {
        return cb(new Error("Missing user ID"));
      }

      const ext = file.originalname.split(".").pop();
      const filePath = `profile/${id}.${ext}`;
      cb(null, filePath);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG images are allowed"));
    }
    cb(null, true);
  },
});

// ✅ Updated: role is always from token
router.post(
  "/profile-image",
  authenticateLibrary,
  upload.single("image"),
  async (req: ILibraryRequest, res: Response) => {
    try {
      const { studentId } = req.body;
      const role = req.library?.role; // ✅ Use role from token

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file received",
        });
      }

      const imageUrl = (req.file as MulterS3.File).location;

      if (role === "library_admin") {
        const updated = await Library.findByIdAndUpdate(
          req.library!.libraryId,
          { profileImage: imageUrl },
          { new: true }
        );

        return res.status(200).json({
          success: true,
          message: "Admin profile image uploaded",
          imageUrl,
          user: updated,
        });
      }

      if (role === "student") {
        if (!studentId) {
          return res.status(400).json({
            success: false,
            message: "studentId is required for student uploads",
          });
        }

        const updated = await Student.findByIdAndUpdate(
          studentId,
          { profileImage: imageUrl },
          { new: true }
        );

        if (!updated) {
          return res.status(404).json({
            success: false,
            message: "Student not found",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Student profile image uploaded",
          imageUrl,
          user: updated,
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    } catch (error: any) {
      console.error("❌ Upload Error:", error);
      return res.status(500).json({
        success: false,
        message: "Image upload failed",
        error: error.message,
      });
    }
  }
);

export default router;
