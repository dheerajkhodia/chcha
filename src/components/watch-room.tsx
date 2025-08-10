"use client";

import { useState, useEffect, useCallback } from 'react';
import VideoPlayer from '@/components/video-player';
import ChatPanel from '@/components/chat-panel';
import { generateRandomName } from '@/lib/utils';
import type { ChatMessage, User } from '@/types';
import { cn } from '@/lib/utils';

type WatchRoomProps = {
  roomId: string;
  initialVideoUrl: string;
  initialUsername?: string;
};

export default function WatchRoom({ roomId, initialVideoUrl, initialUsername }: WatchRoomProps) {
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isChatVisible, setIsChatVisible] = useState(false);

  useEffect(() => {
    const name = initialUsername || generateRandomName();
    setUsername(name);
    
    // In a real app, you would connect to a WebSocket server here
    const currentUser = { id: 'local-user', username: name };
    setUsers([currentUser]);

    setMessages([{
        id: 'system-1',
        username: 'System',
        message: `Welcome ${name}! You are in room ${roomId}.`,
        timestamp: Date.now(),
    }])

  }, [roomId, initialUsername]);

  // WebSocket event handlers (mocked)
  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  const handleSeek = useCallback((time: number) => setCurrentTime(time), []);
  const handleTimeUpdate = useCallback((time: number) => setCurrentTime(time), []);
  const handleDurationChange = useCallback((d: number) => setDuration(d), []);

  const handleSendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      username: username,
      message,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
  };
  
  const videoTitle = initialVideoUrl.split('/').pop()?.replace(/[\-_]/g, ' ') || 'Video';
  
  const toggleChat = () => setIsChatVisible(v => !v);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background">
      {/* Main Content (Video) */}
      <main className="flex-1 flex flex-col">
        <VideoPlayer
            videoUrl={initialVideoUrl}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={handleSeek}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
            chatOverlayMessages={[]}
            onToggleChat={toggleChat}
        />
        {/* Mobile Chat View (Stacked) */}
        <div className="md:hidden flex-1 min-h-0">
             <ChatPanel
                roomId={roomId}
                videoTitle={videoTitle}
                users={users}
                messages={messages}
                onSendMessage={handleSendMessage}
            />
        </div>
      </main>

      {/* Desktop Chat Panel (Sidebar) */}
      <aside className={cn(
          "w-full md:w-80 lg:w-96 flex-shrink-0 h-full",
          "hidden md:flex" // Always visible on desktop
      )}>
        <ChatPanel
            roomId={roomId}
            videoTitle={videoTitle}
            users={users}
            messages={messages}
            onSendMessage={handleSendMessage}
        />
      </aside>
    </div>
  );
}
