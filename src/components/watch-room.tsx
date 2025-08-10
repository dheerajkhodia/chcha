"use client";

import { useState, useEffect, useCallback } from 'react';
import VideoPlayer from '@/components/video-player';
import ChatPanel from '@/components/chat-panel';
import { generateRandomName } from '@/lib/utils';
import type { ChatMessage, User } from '@/types';
import { Sidebar, SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

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

  useEffect(() => {
    const name = initialUsername || generateRandomName();
    setUsername(name);
    
    // In a real app, you would connect to a WebSocket server here
    // and manage the user list.
    const currentUser = { id: 'local-user', username: name };
    setUsers([currentUser]);

    // Mockup of receiving a welcome message
    setMessages([{
        id: 'system-1',
        username: 'System',
        message: `Welcome ${name}! You are in room ${roomId}.`,
        timestamp: Date.now(),
    }])

  }, [roomId, initialUsername]);

  // These functions would emit events to a WebSocket server in a real app.
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
    // In a real app, this would be sent to the server
    // and then broadcast to all clients.
    setMessages(prev => [...prev, newMessage]);
  };
  
  const videoTitle = initialVideoUrl.split('/').pop()?.replace(/[\-_]/g, ' ') || 'Video';

  return (
    <SidebarProvider defaultOpen={true}>
        <SidebarInset>
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
            />
        </SidebarInset>
        <Sidebar side="right" collapsible="icon" className="max-w-sm">
            <ChatPanel
                roomId={roomId}
                videoTitle={videoTitle}
                users={users}
                messages={messages}
                onSendMessage={handleSendMessage}
            />
        </Sidebar>
    </SidebarProvider>
  );
}
