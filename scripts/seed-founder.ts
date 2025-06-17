import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
// import { Founder } from "..src/models/Founder"; // ✅ use actual model
import { Founder } from "../src/models/Founder";
dotenv.config();

async function seedFounder() {
  try {
    await mongoose.connect(
      process.env["MONGO_URI"] || "mongodb://localhost:27017/library-management"
    );
    console.log("Connected to MongoDB");

    const existingFounder = await Founder.findOne({
      email: "mukeshmerndev@gmail.com",
    });
    if (existingFounder) {
      console.log("Founder already exists");
      return;
    }

    const password = "@MukesH6877";
    const passwordHash = await bcrypt.hash(password, 12);

    const founder = new Founder({
      email: "mukeshmerndev@gmail.com",
      passwordHash,
      name: "LIB FOUNDER",
    });

    await founder.save();
    console.log("Founder created successfully");
    console.log("Email: founder@example.com");
    console.log("Password: founder123");
  } catch (error) {
    console.error("Error seeding founder:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedFounder();
