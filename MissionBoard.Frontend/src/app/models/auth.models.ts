export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  permissions: string[];
  organizationId?: number;
  teamId?: number;
  expiresAt: Date;
  // Legacy compatibility for existing components
  user?: {
    roles: string[];
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  permissions: Permission[];
  organization?: Organization;
  team?: Team;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  level: number;
}

export interface Permission {
  id: number;
  name: string;
  description: string;
}

export interface Organization {
  id: number;
  name: string;
}

export interface Team {
  id: number;
  name: string;
}