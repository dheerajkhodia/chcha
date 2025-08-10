"use client";

import { useState, useEffect, useCallback } from 'react';
import VideoPlayer from '@/components/video-player';
import ChatPanel from '@/components/chat-panel';
import { generateRandomName } from '@/lib/utils';
import type { ChatMessage, User } from '@/types';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);
  const [showChat, setShowChat] = useState(true);

  useEffect(() => {
    setIsClient(true);
    setShowChat(!isMobile);
    
    const name = initialUsername || generateRandomName();
    setUsername(name);
    
    const currentUser = { id: 'local-user', username: name };
    setUsers([currentUser]);

    setMessages([{
        id: 'system-1',
        username: 'System',
        message: `Welcome ${name}! You are in room ${roomId}.`,
        timestamp: Date.now(),
    }])

  }, [roomId, initialUsername, isMobile]);

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

  if (!isClient) {
    return null; // or a loading skeleton
  }

  // Using Tailwind CSS classes for responsive layout
  return (
    <div className={cn("flex h-screen bg-background", isMobile ? "flex-col" : "flex-row")}>
      <main className="flex-1 flex flex-col justify-center">
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
            onToggleChat={() => setShowChat(s => !s)}
        />
      </main>
      <aside className={cn(
        "flex-shrink-0 h-full flex flex-col",
        isMobile ? "w-full" : "w-80 lg:w-96",
        isMobile && !showChat ? "hidden" : ""
      )}>
        <ChatPanel
            roomId={roomId}
            videoTitle={videoTitle}
            users={users}
            messages={messages}
            onSendMessage={handleSendMessage}
            onClose={() => setShowChat(false)}
        />
      </aside>
    </div>
  );
}