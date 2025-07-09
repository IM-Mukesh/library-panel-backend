// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { generateOtp } from "../utils/generateOtp";
import { sendOtpEmail } from "../services/email.service";
import { OtpModel } from "../models/otp.model";

export const sendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  await OtpModel.create({ email, otp, expiresAt });
  await sendOtpEmail(email, otp);

  res.json({ message: "OTP sent to email" });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const record = await OtpModel.findOne({ email, otp });
  if (!record) return res.status(400).json({ message: "Invalid OTP" });

  if (record.expiresAt < new Date()) {
    await OtpModel.deleteOne({ _id: record._id });
    return res.status(400).json({ message: "OTP expired" });
  }

  // ✅ OTP is valid, proceed to create user or mark as verified
  await OtpModel.deleteOne({ _id: record._id });

  res.json({ message: "OTP verified successfully" });
};
