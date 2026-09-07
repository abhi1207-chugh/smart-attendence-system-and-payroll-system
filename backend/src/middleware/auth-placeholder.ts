/**
 * Authentication middleware placeholder.
 *
 * Phase 2.3 Step 1 does not implement full auth. Future steps will verify
 * JWT/session here and attach user context before protected routes run.
 */
import type { Request, Response, NextFunction } from "express";

export function authPlaceholder(
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  next();
}
