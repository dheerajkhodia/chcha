"use client";

import { useState, useEffect, useCallback } from 'react';
import VideoPlayer from '@/components/video-player';
import ChatPanel from '@/components/chat-panel';
import { generateRandomName } from '@/lib/utils';
import type { ChatMessage, User } from '@/types';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { SheetTitle } from '@/components/ui/sheet';

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
  const [isClient, setIsClient] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const isMobile = useIsMobile();


  useEffect(() => {
    // This effect runs once on the client after hydration
    setIsClient(true);
    
    // Set username
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
  }, [roomId, initialUsername]);
  
  useEffect(() => {
      // This effect runs when isMobile changes or after the initial client render
      if (isClient) {
          setShowChat(!isMobile || !isPlayerExpanded);
      }
  }, [isMobile, isClient, isPlayerExpanded]);


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
    // Render a loading state or null on the server to prevent hydration mismatch
    return (
      <div className="flex h-screen bg-background">
          <SheetTitle className="sr-only">SynchWatch Room</SheetTitle>
      </div>
    )
  }

  // Using Tailwind CSS classes for responsive layout
  return (
    <div className={cn(
      "flex h-screen bg-background", 
      isPlayerExpanded && isMobile ? "flex-col" : "flex-col-reverse md:flex-row"
    )}>
      <main className={cn(
        "flex flex-col justify-start md:justify-center",
        isPlayerExpanded ? "flex-1" : "flex-shrink-0"
        )}>
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
            chatOverlayMessages={messages}
            onToggleChat={() => setShowChat(s => !s)}
            isExpanded={isPlayerExpanded}
            onToggleExpand={() => setIsPlayerExpanded(e => !e)}
        />
      </main>
      <aside className={cn(
        "flex-shrink-0 flex flex-col",
        isMobile ? "w-full flex-1 min-h-0" : "w-80 lg:w-96 h-full",
        isMobile && !showChat ? "hidden" : "flex"
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
