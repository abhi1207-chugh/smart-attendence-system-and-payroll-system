import { z } from "zod";
import { badRequest } from "../errors/app-error.js";

export const listEmployeesQuerySchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;

export function parseListEmployeesQuery(
  query: Record<string, unknown>
): ListEmployeesQuery {
  const parsed = listEmployeesQuerySchema.safeParse(query);
  if (!parsed.success) {
    throw badRequest("Invalid query parameters", parsed.error.issues);
  }
  return parsed.data;
}
