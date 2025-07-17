import { Request, Response } from "express";
import Student from "../models/Student";
import generateRollNumber from "../utils/generateRoll";
import { isBefore, endOfDay, addDays, startOfDay, subDays } from "date-fns";

import { Types } from "mongoose";
import Payment from "../models/paymentSchema";
import { Library } from "../models/Library";

export const createStudent = async (req: Request, res: Response) => {
  try {
    const libraryId = req.library?.libraryId;
    if (!libraryId) return res.status(401).json({ message: "Unauthorized" });

    const lib = await Library.findById(libraryId);

    if (!lib) return res.status(404).json({ message: "Library not found" });

    const rollNumber = await generateRollNumber(lib.code);

    const student = new Student({
      ...req.body,
      libraryId, // ✅ force correct libraryId
      rollNumber,
    });
    await student.save();

    res.status(201).json({
      success: true,
      student,
    });
  } catch (err) {
    res.status(400).json({ message: "Error creating student", error: err });
  }
};

export const getAllStudents = async (_req: Request, res: Response) => {
  const students = await Student.find().sort({ createdAt: -1 });
  res.json(students);
};

export const getAllStudentByAdmin = async (req: Request, res: Response) => {
  try {
    const libraryId = req?.library?.libraryId;

    if (!libraryId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing libraryId",
      });
    }

    const students = await Student.find({ libraryId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
    });
  }
};

export const getStudent = async (req: Request, res: Response) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: "Not found" });
  res.json(student);
};

export const updateStudent = async (req: Request, res: Response) => {
  const updated = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
};

export const deleteStudent = async (req: Request, res: Response) => {
  const deleted = await Student.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted successfully" });
};

// import { Request, Response } from 'express';
// import Student from '../models/Student';

export const getDueFees = async (req: Request, res: Response) => {
  try {
    const libraryId = req.library?.libraryId;

    if (!libraryId)
      return res
        .status(400)
        .json({ success: false, message: "Library ID missing" });

    const today = startOfDay(new Date());
    const sevenDaysLater = endOfDay(addDays(today, 7));

    // Fetch students with nextDueDate <= 7 days from now
    const students = await Student.find({
      libraryId,
      nextDueDate: { $lte: sevenDaysLater },
    })
      .select("name rollNumber mobile shift nextDueDate")
      .lean();

    // Separate overdue and upcoming due students
    const overdueStudents = students.filter((s) =>
      isBefore(new Date(s.nextDueDate), today)
    );
    const upcomingStudents = students.filter(
      (s) => !isBefore(new Date(s.nextDueDate), today)
    );

    // Sort both arrays by nextDueDate
    overdueStudents.sort(
      (a, b) =>
        new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()
    );
    upcomingStudents.sort(
      (a, b) =>
        new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()
    );

    return res.status(200).json({
      success: true,
      data: [...overdueStudents, ...upcomingStudents],
    });
  } catch (err) {
    console.error("getDueFees error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getRecentPayments = async (req: Request, res: Response) => {
  try {
    const libraryId = req.library?.libraryId;
    if (!libraryId)
      return res
        .status(400)
        .json({ success: false, message: "Library ID missing" });

    const today = startOfDay(new Date());
    const sevenDaysAgo = subDays(today, 7);

    const recentPayments = await Payment.aggregate([
      {
        $match: {
          libraryId: new Types.ObjectId(libraryId),
          paidDate: { $gte: sevenDaysAgo },
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $project: {
          name: "$student.name",
          rollNumber: "$student.rollNumber",
          paidDate: 1,
          amount: 1,
          paymentMethod: 1,
        },
      },
      { $sort: { paidDate: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: recentPayments,
    });
  } catch (err) {
    console.error("getRecentPayments error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
