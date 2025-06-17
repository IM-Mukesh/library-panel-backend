import { Response } from "express";

interface IApiSuccessResponse<T> {
  success: true;
  message: string;
  data?: T | undefined;
  timestamp: string;
}

interface IApiErrorResponse {
  success: false;
  message: string;
  error?: string | undefined;
  timestamp: string;
}

/**
 * Send a success response
 */
export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200
): Response<IApiSuccessResponse<T>> => {
  const response: IApiSuccessResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
};

/**
 * Send an error response
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  error?: string
): Response<IApiErrorResponse> => {
  const response: IApiErrorResponse = {
    success: false,
    message,
    error,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
};
