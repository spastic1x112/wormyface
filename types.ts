
export enum Role {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
  isArchived?: boolean;
}

export interface ExecutionLog {
  id: string;
  event: string;
  status: 'SUCCESS' | 'PROCESS' | 'FAILED';
  timestamp: Date;
}

export interface PromptConfig {
  user: string;
  host: string;
  path: string;
  showTimestamp: boolean;
  useColor: boolean;
}
