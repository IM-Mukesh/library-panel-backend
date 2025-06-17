import { Library } from "../models/Library"

/**
 * Generate unique library code
 */
export const generateLibraryCode = async (): Promise<string> => {
  let code: string
  let isUnique = false
  let counter = 1

  while (!isUnique) {
    code = `LIB${counter.toString().padStart(3, "0")}`
    const existingLibrary = await Library.findOne({ code })

    if (!existingLibrary) {
      isUnique = true
      return code
    }

    counter++
  }

  throw new Error("Unable to generate unique library code")
}
