import { Schema, model, Document, Types } from "mongoose";

export interface ISalon extends Document {
  owner: Types.ObjectId;
  name: string;
  address: string;
  contact: string;
  description: string;
  businessHours: string;
  pinCode: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  images: string[]; // S3 URLs
  qrCodeUrl?: string;
}

const salonSchema = new Schema<ISalon>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    businessHours: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    pinCode: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    images: {
      type: [String],
      default: [],
      validate: [
        (arr: string[]) => arr.length <= 10,
        "Maximum of 10 images allowed",
      ],
    },
    qrCodeUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Add GeoJSON index for geospatial queries
salonSchema.index({ location: "2dsphere" });

export default model<ISalon>("Salon", salonSchema);
