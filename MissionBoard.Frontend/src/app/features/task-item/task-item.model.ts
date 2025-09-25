export interface TaskItem {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
  dueDate?: string;
  isCompleted: boolean;
  assignedToId?: number;
  teamId?: number;
}
