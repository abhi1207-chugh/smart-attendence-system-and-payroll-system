import express from "express";
import {
  createAuthRouter,
  createEmployeeRouter,
  createHealthRouter,
} from "./routes/index.js";
import { loadConfig } from "./config/env.js";
import type { AuthConfig } from "./services/auth.service.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error-handler.js";

export function createApp(authConfig: AuthConfig = loadConfig()) {
  const app = express();

  app.use(express.json());

  const apiRouter = express.Router();
  apiRouter.use(createHealthRouter());
  apiRouter.use(createAuthRouter(authConfig));
  apiRouter.use(createEmployeeRouter(authConfig));

  app.use("/api/v1", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
