
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import VideoPlayer from '@/components/video-player';
import ChatPanel from '@/components/chat-panel';
import { generateRandomName } from '@/lib/utils';
import type { ChatMessage, User } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

type WatchRoomProps = {
  roomId: string;
  initialVideoUrl: string;
  initialUsername?: string;
  isAdmin: boolean;
  adminUsername?: string;
};

const SOCKET_SERVER_URL = 'http://localhost:3001';

export default function WatchRoom({ roomId, initialVideoUrl, initialUsername, isAdmin, adminUsername }: WatchRoomProps) {
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

  const socketRef = useRef<Socket | null>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const initializeSocket = useCallback((name: string) => {
    if (socketRef.current) return;

    const socket = io(SOCKET_SERVER_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket server');
      socket.emit('join-room', { roomId, username: name, isAdmin });
    });

    socket.on('room-state', (state: { users: User[], playbackState: { isPlaying: boolean, time: number } }) => {
      setUsers(state.users);
      setIsPlaying(state.playbackState.isPlaying);
      setCurrentTime(state.playbackState.time);
    });

    socket.on('user-joined', (user: User) => {
      setUsers(prev => [...prev, user]);
      setMessages(prev => [...prev, {
        id: `system-${user.id}`,
        username: 'System',
        message: `${user.username} joined`,
        timestamp: Date.now(),
        type: 'system',
      }]);
    });

    socket.on('user-left', ({ id, username: leftUsername }) => {
      setUsers(prev => prev.filter(u => u.id !== id));
      setMessages(prev => [...prev, {
        id: `system-${id}`,
        username: 'System',
        message: `${leftUsername} left`,
        timestamp: Date.now(),
        type: 'system',
      }]);
    });

    socket.on('receive-message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('playback-update', (state: { isPlaying: boolean, time: number }) => {
      setIsPlaying(state.isPlaying);
      // Only seek if there's a significant difference to avoid jerky playback
      if (Math.abs(currentTime - state.time) > 2) {
          setCurrentTime(state.time);
      }
    });

  }, [roomId, isAdmin, currentTime]);

  useEffect(() => {
    setIsClient(true);
    const name = initialUsername || generateRandomName();
    setUsername(name);
    initializeSocket(name);

    const handleFullScreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullScreen(isFs);
      if (!isFs) {
        setShowMobileChat(false);
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [roomId, initialUsername, initializeSocket]);

  const sendPlaybackState = useCallback(() => {
    if (isAdmin && socketRef.current) {
      socketRef.current.emit('playback-control', { 
        state: { isPlaying, time: currentTime }
      });
    }
  }, [isAdmin, isPlaying, currentTime]);

  useEffect(() => {
    if (isAdmin) {
      if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = setInterval(sendPlaybackState, 2000);
    }
    return () => {
      if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
    }
  }, [isAdmin, sendPlaybackState]);

  const handlePlay = useCallback(() => {
    if (!isAdmin) return;
    setIsPlaying(true);
    if (socketRef.current) {
      socketRef.current.emit('playback-control', { state: { isPlaying: true, time: currentTime } });
    }
  }, [isAdmin, currentTime]);

  const handlePause = useCallback(() => {
    if (!isAdmin) return;
    setIsPlaying(false);
    if (socketRef.current) {
      socketRef.current.emit('playback-control', { state: { isPlaying: false, time: currentTime } });
    }
  }, [isAdmin, currentTime]);

  const handleSeek = useCallback((time: number) => {
    if (!isAdmin) return;
    setCurrentTime(time);
    if (socketRef.current) {
      socketRef.current.emit('playback-control', { state: { isPlaying, time } });
    }
  }, [isAdmin, isPlaying]);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);
  
  const handleDurationChange = useCallback((d: number) => setDuration(d), []);

  const handleSendMessage = (message: string) => {
    if (socketRef.current) {
      const newMessage: ChatMessage = {
        id: crypto.randomUUID(),
        username: username,
        message,
        timestamp: Date.now(),
        type: 'user',
      };
      socketRef.current.emit('send-message', newMessage);
    }
  };
  
  const videoTitle = initialVideoUrl.split('/').pop()?.replace(/[_\-]/g, ' ') || 'Video';

  if (!isClient) {
    return <div className="flex h-screen bg-background" />;
  }
  
  const chatPanel = (
    <ChatPanel
      roomId={roomId}
      videoTitle={videoTitle}
      users={users}
      messages={messages}
      onSendMessage={handleSendMessage}
      adminUsername={adminUsername}
      currentUsername={username}
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
        isAdmin={isAdmin}
    />
  );
  
  if (isMobile) {
      if (isFullScreen) {
        return (
          <div className="relative h-screen w-screen bg-black">
            <main className="h-full w-full flex items-center justify-center">
              {renderVideoPlayer(true)}
            </main>
            {showMobileChat && (
              <div className="absolute inset-0 z-30 bg-black/50 p-4 flex flex-col">
                  {chatPanel}
              </div>
            )}
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