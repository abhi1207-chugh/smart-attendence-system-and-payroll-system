import express from "express";
import { createEmployeeRouter, createHealthRouter } from "./routes/index.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error-handler.js";

export function createApp() {
  const app = express();

  app.use(express.json());

  const apiRouter = express.Router();
  apiRouter.use(createHealthRouter());
  apiRouter.use(createEmployeeRouter());

  app.use("/api/v1", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
