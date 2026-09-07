import { QueryResultRow } from "pg";
import { getDatabase } from "../database/client.js";
import type { EmployeeDto } from "../types/api.js";

interface EmployeeRow extends QueryResultRow {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  department_id: string;
  shift_id: string;
  status: "ACTIVE" | "INACTIVE";
  face_registered: boolean;
}

export interface ListEmployeesFilters {
  status?: "ACTIVE" | "INACTIVE";
}

export async function listEmployees(
  filters: ListEmployeesFilters = {}
): Promise<EmployeeDto[]> {
  const params: unknown[] = [];
  let whereClause = "";

  if (filters.status) {
    params.push(filters.status);
    whereClause = `WHERE e.status = $${params.length}`;
  }

  const result = await getDatabase().query<EmployeeRow>(
    `
      SELECT
        e.id,
        e.employee_code,
        e.first_name,
        e.last_name,
        e.email,
        e.department_id,
        e.shift_id,
        e.status::text AS status,
        EXISTS (
          SELECT 1
          FROM face_registration_metadata frm
          WHERE frm.employee_id = e.id
            AND frm.status = 'ACTIVE'
        ) AS face_registered
      FROM employee e
      ${whereClause}
      ORDER BY e.employee_code ASC
    `,
    params
  );

  return result.rows;
}
