export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
  type?: 'user' | 'system';
}

export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}
