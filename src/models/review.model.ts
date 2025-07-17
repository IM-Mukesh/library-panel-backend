import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  salon: mongoose.Types.ObjectId;
  username: string;
  rating: number;
  comment?: string;
}

const reviewSchema = new Schema<IReview>(
  {
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Salon",
    },
    username: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: String,
  },
  { timestamps: true }
);

export default mongoose.model<IReview>("Review", reviewSchema);
