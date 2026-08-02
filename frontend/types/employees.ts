export interface Role {
  id: number;
  code: string;
  label: string;
}

export interface Employee {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  roles: string[];
}

export interface EmployeePayload {
  username: string;
  email?: string;
  password?: string;
  is_active?: boolean;
  role_codes: string[];
}
