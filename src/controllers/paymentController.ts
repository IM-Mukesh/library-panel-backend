import Payment from "../models/paymentSchema";
import Student from "../models/Student";

export const createPayment = async (req, res) => {
  try {
    const {
      libraryId,
      studentId,
      amount,
      discount = 0,
      paymentMethod = "cash",
      fromMonth,
      toMonth,
      nextDueDate,
      notes,
    } = req.body;

    // Validate required fields
    if (
      !libraryId ||
      !studentId ||
      typeof amount !== "number" ||
      !fromMonth ||
      !toMonth ||
      !nextDueDate
    ) {
      return res
        .status(400)
        .json({ message: "Missing or invalid required fields" });
    }

    // Convert dates
    const from = new Date(fromMonth);
    const to = new Date(toMonth);
    const nextDue = new Date(nextDueDate);
    const paidDate = new Date();

    // Optional: Basic logical check
    if (from > to) {
      return res
        .status(400)
        .json({ message: "fromMonth cannot be after toMonth" });
    }

    // Create new payment entry
    const payment = new Payment({
      libraryId,
      studentId,
      amount,
      discount,
      paymentMethod,
      fromMonth: from,
      toMonth: to,
      nextDueDate: nextDue,
      notes,
      paidDate,
    });

    await payment.save();

    // Update student's payment status
    await Student.findByIdAndUpdate(studentId, {
      nextDueDate: nextDue,
      lastPaidDate: paidDate,
    });

    return res.status(201).json(payment);
  } catch (err) {
    console.error("Payment creation error:", err);
    return res
      .status(500)
      .json({ message: "Error creating payment", error: err.message });
  }
};

// 2. Get all payments for a student
export const getStudentPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ studentId: req.params.id }).sort({
      fromMonth: -1,
    });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching payments", error: err });
  }
};

// 3. Update a payment
export const updatePayment = async (req, res) => {
  try {
    const {
      amount,
      discount,
      paymentMethod,
      fromMonth,
      toMonth,
      nextDueDate,
      notes,
    } = req.body;

    const updateFields: Record<string, any> = {};

    if (amount !== undefined) updateFields.amount = amount;
    if (discount !== undefined) updateFields.discount = discount;
    if (paymentMethod) updateFields.paymentMethod = paymentMethod;
    if (fromMonth) updateFields.fromMonth = new Date(fromMonth);
    if (toMonth) updateFields.toMonth = new Date(toMonth);
    if (nextDueDate) updateFields.nextDueDate = new Date(nextDueDate);
    if (notes) updateFields.notes = notes;

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: "Error updating payment", error: err });
  }
};

// 4. Delete a payment
export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    res.json({ message: "Payment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting payment", error: err });
  }
};

// 5. Get all payments (with optional paidDate filter)
export const getAllPayments = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter: Record<string, any> = {};

    if (from && to) {
      filter.paidDate = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const payments = await Payment.find(filter)
      .sort({ paidDate: -1 })
      .populate("studentId", "name rollNumber");

    res.json(payments);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching all payments", error: err });
  }
};
