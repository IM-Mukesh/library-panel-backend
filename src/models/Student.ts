import { Schema, model, Types } from "mongoose";

const studentSchema = new Schema({
  libraryId: { type: Types.ObjectId, ref: "Library", required: true },

  name: { type: String, required: true },
  mobile: { type: String, unique: true, required: true },
  aadhar: { type: String, unique: true, required: true },
  rollNumber: { type: String, unique: true, required: true },

  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  dateOfBirth: { type: Date, required: true },

  shift: {
    type: String,
    enum: [
      "First",
      "Second",
      "Third",
      "Reserved",
      "morning",
      "evening",
      "afternoon",
    ],
    required: true,
  },

  address: { type: String },
  fatherName: { type: String },
  email: { type: String },

  joiningDate: { type: Date, required: true },
  nextDueDate: { type: Date, required: true },
  lastPaidDate: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now },
});

export default model("Student", studentSchema);
