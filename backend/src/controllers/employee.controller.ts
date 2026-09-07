import type { Request, Response, NextFunction } from "express";
import { getEmployees } from "../services/employee.service.js";
import { parseListEmployeesQuery } from "../validation/employees.validation.js";

export async function listEmployeesHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters = parseListEmployeesQuery(req.query);
    const employees = await getEmployees(filters);

    res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
}
