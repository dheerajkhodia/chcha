"use client";

import { useState, useEffect, useCallback } from 'react';
import VideoPlayer from '@/components/video-player';
import ChatPanel from '@/components/chat-panel';
import { generateRandomName } from '@/lib/utils';
import type { ChatMessage, User } from '@/types';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

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
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(true);
  const isMobile = useIsMobile();


  useEffect(() => {
    setIsClient(true);
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
    return (
      <div className="flex h-screen bg-background" />
    )
  }
  
  const chatPanel = (
    <ChatPanel
        roomId={roomId}
        videoTitle={videoTitle}
        users={users}
        messages={messages}
        onSendMessage={handleSendMessage}
    />
  );
  
  const layout = (isMobile: boolean) => {
      if(isMobile) {
          return (
             <div className="flex flex-col h-screen bg-background">
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
                        isExpanded={isPlayerExpanded}
                        onToggleExpand={() => setIsPlayerExpanded(e => !e)}
                        onToggleChat={() => setShowMobileChat(c => !c)}
                    />
                </main>
                 <aside className={cn(
                    "flex-1 flex flex-col min-h-0",
                     !showMobileChat && "hidden"
                )}>
                    {chatPanel}
                </aside>
             </div>
          )
      }

      return (
        <div className="flex h-screen bg-background">
            <main className={cn(
                "flex-1 flex flex-col justify-center transition-all duration-300",
                isPlayerExpanded ? "w-full" : "w-1/2"
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
                    isExpanded={isPlayerExpanded}
                    onToggleExpand={() => setIsPlayerExpanded(e => !e)}
                />
            </main>
            <aside className={cn(
                "w-1/2 flex-col min-h-0 transition-all duration-300 flex",
                isPlayerExpanded ? "hidden" : "flex"
            )}>
                {chatPanel}
            </aside>
        </div>
      )
  }
  
  return layout(!!isMobile);
}
