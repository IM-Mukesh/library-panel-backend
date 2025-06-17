// A minimal library object (what's returned by most APIs)
export interface Library {
  _id: string;
  name: string;
  code: string;
  adminName: string;
  adminEmail: string;
  phone?: string;
  address?: string;
  status?: string;
  accessBlocked: boolean;
  isPaymentRequired?: boolean;
  lastPaidDate?: string;
  nextDueDate?: string;
  createdAt: string;
  updatedAt: string;
  paymentNotes?: string;
}

// Response wrapper format
export interface ApiResponse<T> {
  message: string;
  data: T;
}

// =====================
// Create library request
// =====================
export interface CreateLibraryPayload {
  name: string;
  adminName: string;
  adminEmail: string;
  phone?: string;
  address?: string;
}

// =====================
// Get all libraries response
// =====================
export interface GetLibrariesResponse {
  libraries: Library[];
  count: number;
}

// =====================
// Login payload and response (optional if you add login API)
// =====================
export interface LibraryLoginPayload {
  adminEmail: string;
  password: string;
}

export interface LibraryLoginResponse {
  token: string;
  library: Library;
}
