export interface User {
  id: string;
  userName: string;
  email: string;
  teamId?: string;
  teamName?: string;
  createdAt: string;
  isActive: boolean;
}

export interface UserInfo {
  id: string;
  userName: string;
  email: string;
  teamId?: string;
  teamName?: string;
  roles: string[];
  rights: string[];
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: UserInfo;
}