
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
  const [showMobileChat, setShowMobileChat] = useState(false);
  const isMobile = useIsMobile();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showChatOverlay, setShowChatOverlay] = useState(true);

  useEffect(() => {
    // This effect runs once on the client after hydration
    setIsClient(true);
    
    // Logic that depends on browser APIs or random values
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

    const handleFullScreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullScreen(isFs);
      // When exiting fullscreen, always hide the mobile chat overlay
      if (!isFs) {
        setShowMobileChat(false);
      }
    };
    

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);

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
  
  const videoTitle = initialVideoUrl.split('/').pop()?.replace(/[_\-]/g, ' ') || 'Video';

  if (!isClient) {
    // Render a loading state or nothing on the server to avoid hydration mismatch
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

  const renderVideoPlayer = (isMobilePlayer: boolean) => (
    <VideoPlayer
        isMobile={isMobilePlayer}
        videoUrl={initialVideoUrl}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeek={handleSeek}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onToggleMobileChat={() => setShowChatOverlay(s => !s)}
        messages={messages}
        showChatOverlay={showChatOverlay}
    />
  );
  
  if (isMobile) {
      if (isFullScreen) {
        return (
          <div className="relative h-screen w-screen bg-background">
            <main className="h-full w-full">
              {renderVideoPlayer(true)}
            </main>
          </div>
        )
      }
      return (
         <div className="flex flex-col h-screen bg-background">
            <main className="w-full">
                {renderVideoPlayer(true)}
            </main>
            <aside className="flex-1 flex flex-col min-h-0">
                {chatPanel}
            </aside>
         </div>
      )
  }

  // Desktop layout
  return (
    <div className="flex h-screen bg-background">
        <main className="flex-1 flex flex-col justify-center items-center p-4 bg-black">
             {renderVideoPlayer(false)}
        </main>
        <aside className="flex-col min-h-0 transition-all duration-300 flex w-[400px]">
            {chatPanel}
        </aside>
    </div>
  )
}
