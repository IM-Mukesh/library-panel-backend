import mongoose from "mongoose"
import { config } from "./env"

/**
 * Connect to MongoDB database
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.MONGO_URI)
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error("Database connection error:", error)
    process.exit(1)
  }
}

/**
 * Graceful database disconnection
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect()
    console.log("MongoDB Disconnected")
  } catch (error) {
    console.error("Database disconnection error:", error)
  }
}
