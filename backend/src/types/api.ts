export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorBody {
  code: string;
  message: string;
  details: unknown[];
}

export interface ErrorResponse {
  success: false;
  error: ErrorBody;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export interface EmployeeDto {
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

export interface HealthDto {
  status: "ok" | "degraded";
  postgres: "ok" | "degraded" | "down";
  vector_db: "ok" | "degraded" | "down";
}
