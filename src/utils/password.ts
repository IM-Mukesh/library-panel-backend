import bcrypt from "bcrypt"
import { config } from "../config/env"

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, config.BCRYPT_ROUNDS)
}

/**
 * Compare password with hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}

/**
 * Generate random password for library admin
 */
export const generateRandomPassword = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let password = ""
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}
