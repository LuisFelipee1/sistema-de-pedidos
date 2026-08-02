import type { PaginatedResponse } from "@/types/common";
import type { Employee, EmployeePayload, Role } from "@/types/employees";

import { apiClient } from "./client";

export async function listEmployees(): Promise<Employee[]> {
  const { data } = await apiClient.get<PaginatedResponse<Employee>>("/api/employees/");
  return data.results;
}

export async function createEmployee(payload: EmployeePayload): Promise<Employee> {
  const { data } = await apiClient.post<Employee>("/api/employees/", payload);
  return data;
}

export async function updateEmployee(
  id: number,
  payload: Partial<EmployeePayload>,
): Promise<Employee> {
  const { data } = await apiClient.patch<Employee>(`/api/employees/${id}/`, payload);
  return data;
}

export async function deleteEmployee(id: number): Promise<void> {
  await apiClient.delete(`/api/employees/${id}/`);
}

export async function listRoles(): Promise<Role[]> {
  const { data } = await apiClient.get<PaginatedResponse<Role>>("/api/roles/");
  return data.results;
}
