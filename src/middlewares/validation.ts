import { body, query, param } from "express-validator"

// Founder login validation
export const validateFounderLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
]

// Library creation validation
export const validateLibraryCreation = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Library name must be between 2 and 100 characters"),
  body("adminName").trim().isLength({ min: 2, max: 50 }).withMessage("Admin name must be between 2 and 50 characters"),
  body("adminEmail").isEmail().normalizeEmail().withMessage("Valid admin email is required"),
  body("adminPhone").isMobilePhone("any").withMessage("Valid phone number is required"),
  body("address").trim().isLength({ min: 10, max: 200 }).withMessage("Address must be between 10 and 200 characters"),
  body("billingAmount").isNumeric().isFloat({ min: 0 }).withMessage("Billing amount must be a positive number"),
  body("isPaymentRequired").isBoolean().withMessage("isPaymentRequired must be a boolean"),
]

// Library login validation
export const validateLibraryLogin = [
  body("adminEmail").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 1 }).withMessage("Password is required"),
]

// Library filters validation
export const validateLibraryFilters = [
  query("status").optional().isIn(["active", "inactive"]).withMessage("Status must be either active or inactive"),
  query("accessBlocked").optional().isBoolean().withMessage("accessBlocked must be a boolean"),
  query("isPaymentRequired").optional().isBoolean().withMessage("isPaymentRequired must be a boolean"),
  query("search").optional().trim().isLength({ max: 100 }).withMessage("Search term must be less than 100 characters"),
]

// MongoDB ObjectId validation
export const validateObjectId = [param("id").isMongoId().withMessage("Invalid library ID")]

// Payment notes validation
export const validatePaymentNotes = [
  body("paymentNotes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Payment notes must be less than 500 characters"),
]
