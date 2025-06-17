import type { Response, NextFunction } from "express"
import { Library } from "../models/Library"
import { sendError } from "../utils/response"
import type { ILibraryRequest } from "../types"

/**
 * Middleware to check if library access is blocked
 */
export const checkLibraryAccess = async (req: ILibraryRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.library) {
      sendError(res, "Authentication required", 401)
      return
    }

    const library = await Library.findById(req.library.libraryId)

    if (!library) {
      sendError(res, "Library not found", 404)
      return
    }

    if (library.accessBlocked) {
      sendError(res, "Access blocked due to unpaid dues", 403)
      return
    }

    next()
  } catch (error) {
    sendError(res, "Error checking library access", 500)
  }
}
