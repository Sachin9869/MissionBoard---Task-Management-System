export interface User {
  id: number;
  userName: string;
  email: string;
  passwordHash: string;
  teamId?: number;
}
