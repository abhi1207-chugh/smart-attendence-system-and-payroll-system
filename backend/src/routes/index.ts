import { Router } from "express";
import { getHealth } from "../controllers/health.controller.js";
import { listEmployeesHandler } from "../controllers/employee.controller.js";
import { createAuthenticate, requireRole } from "../middleware/auth.js";
import { createLoginHandler } from "../controllers/auth.controller.js";
import type { AuthConfig } from "../services/auth.service.js";

export function createHealthRouter(): Router {
  const router = Router();
  router.get("/health", (req, res, next) => {
    void getHealth(req, res).catch(next);
  });
  return router;
}

export function createEmployeeRouter(config: AuthConfig): Router {
  const router = Router();
  router.get(
    "/employees",
    createAuthenticate(config.jwtSecret),
    requireRole("ADMIN"),
    listEmployeesHandler
  );
  return router;
}

export function createAuthRouter(config: AuthConfig): Router {
  const router = Router();
  router.post("/auth/login", createLoginHandler(config));
  router.get("/auth/me", createAuthenticate(config.jwtSecret), (req, res) => {
    res.status(200).json({ success: true, data: req.user });
  });
  return router;
}
