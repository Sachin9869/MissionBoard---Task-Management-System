export interface Team {
  id: string;
  name: string;
  description?: string;
  managerUserId: string;
  managerName?: string;
  createdAt: string;
  isActive: boolean;
  memberCount?: number;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Right {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}