export type Status = 'active' | 'idle' | 'error';

export interface Instance {
  id: string;
  name: string;
  status: Status;
  cpu: number;
  memory: number;
  logs: string[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  recurring?: string;
  completed: boolean;
  tags: string[];
}

export interface Reminder {
  id: string;
  name: string;
  cron: string;
  channel: 'discord' | 'email' | 'none';
  enabled: boolean;
  nextRun?: string;
}
