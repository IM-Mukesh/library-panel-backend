import { Request, Response } from "express";
import Student from "../models/Student";
import Payment from "../models/paymentSchema";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Types } from "mongoose";

export const dashboardStats = async (req: Request, res: Response) => {
  try {
    const libraryId = req.library?.libraryId;

    if (!libraryId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing library ID" });
    }

    const totalStudents = await Student.countDocuments({ libraryId });

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const getMonthlyCollection = async (start: Date, end: Date) => {
      const result = await Payment.aggregate([
        {
          $match: {
            libraryId: new Types.ObjectId(libraryId),
            paidDate: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: "$paymentMethod",
            total: { $sum: "$amount" },
          },
        },
      ]);

      let cash = 0;
      let online = 0;

      for (const entry of result) {
        if (entry._id === "cash") cash = entry.total;
        else if (entry._id === "online") online = entry.total;
      }

      return {
        cash,
        online,
        total: cash + online,
      };
    };

    const currentMonthCollection = await getMonthlyCollection(
      currentMonthStart,
      currentMonthEnd
    );
    const lastMonthCollection = await getMonthlyCollection(
      lastMonthStart,
      lastMonthEnd
    );

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        currentMonthCollection,
        lastMonthCollection,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
