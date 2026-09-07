import type { Request, Response, NextFunction } from "express";
import { AppError, internalError } from "../errors/app-error.js";
import { DatabaseError } from "pg";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  if (error instanceof DatabaseError) {
    console.error("Database error:", {
      code: error.code,
      message: error.message,
    });
    const appError = internalError("A database error occurred");
    res.status(appError.statusCode).json({
      success: false,
      error: {
        code: appError.code,
        message: appError.message,
        details: [],
      },
    });
    return;
  }

  console.error("Unhandled error:", error);
  const appError = internalError();
  res.status(appError.statusCode).json({
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      details: [],
    },
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
      details: [],
    },
  });
}
