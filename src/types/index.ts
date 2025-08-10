export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

export interface User {
  id: string;
  username: string;
}
