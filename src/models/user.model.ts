import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  picture?: string;
  role: "salon";
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    picture: String,
    role: { type: String, enum: ["salon"], default: "salon" },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
