import { Schema, model, Types } from "mongoose";

const paymentSchema = new Schema(
  {
    libraryId: { type: Types.ObjectId, ref: "Library", required: true },
    studentId: { type: Types.ObjectId, ref: "Student", required: true },

    amount: { type: Number, required: true }, // Final amount paid
    discount: { type: Number, default: 0 }, // Discount applied if any
    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
      default: "cash",
    },

    fromMonth: { type: Date, required: true }, // e.g. 2025-06-01
    toMonth: { type: Date, required: true }, // e.g. 2025-08-31
    nextDueDate: { type: Date, required: true }, // After this payment

    paidDate: { type: Date, default: Date.now }, // When the payment was done
    notes: { type: String }, // Optional notes (e.g., remarks, custom info)
  },
  { timestamps: true }
);

export default model("Payment", paymentSchema);
