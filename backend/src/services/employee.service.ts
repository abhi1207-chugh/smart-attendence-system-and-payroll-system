import type { EmployeeDto } from "../types/api.js";
import {
  listEmployees,
  type ListEmployeesFilters,
} from "../repositories/employee.repository.js";

export async function getEmployees(
  filters: ListEmployeesFilters = {}
): Promise<EmployeeDto[]> {
  return listEmployees(filters);
}
