import { Router } from "express";
import { getHealth } from "../controllers/health.controller.js";
import { listEmployeesHandler } from "../controllers/employee.controller.js";
import { authPlaceholder } from "../middleware/auth-placeholder.js";

export function createHealthRouter(): Router {
  const router = Router();
  router.get("/health", (req, res, next) => {
    void getHealth(req, res).catch(next);
  });
  return router;
}

export function createEmployeeRouter(): Router {
  const router = Router();
  router.get(
    "/employees",
    authPlaceholder,
    listEmployeesHandler
  );
  return router;
}
