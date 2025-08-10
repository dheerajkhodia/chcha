"use client";

import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, User, Link2 } from 'lucide-react';
import type { ChatMessage, User as UserType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';


type ChatPanelProps = {
  roomId: string;
  videoTitle: string;
  users: UserType[],
  messages: ChatMessage[],
  onSendMessage: (message: string) => void;
};

export default function ChatPanel({
  roomId,
  videoTitle,
  users,
  messages,
  onSendMessage,
}: ChatPanelProps) {
  const [message, setMessage] = React.useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast({
        title: "Invite Link Copied",
        description: "The room link is on your clipboard.",
      });
    }).catch(err => {
      console.error('Failed to copy link: ', err);
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Could not copy the invite link to your clipboard.",
      });
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  useEffect(() => {
    const scrollViewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (scrollViewport) {
      scrollViewport.scrollTop = scrollViewport.scrollHeight;
    }
  }, [messages]);

  const renderUserAvatar = (username: string) => (
    <Avatar className="h-6 w-6">
      <AvatarFallback>
        <User className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
  );

  return (
    <div className="flex flex-col h-full bg-card text-card-foreground border-l relative">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">Live Chat</h2>
            <Button variant="ghost" size="sm" onClick={handleCopyLink}>
                <Link2 className="mr-2 h-4 w-4" />
                Invite
            </Button>
        </div>
        <div className="flex items-center justify-end text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{users.length}</span>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
         {messages.length > 0 ? (
            <div className="space-y-4">
                {messages.map((msg) => {
                  if(msg.type === 'system') {
                    return (
                        <div key={msg.id} className="text-sm text-center text-blue-400">
                          {msg.message}
                        </div>
                    )
                  }
                  return (
                    <div key={msg.id} className="flex items-start gap-3 text-sm">
                        {renderUserAvatar(msg.username)}
                        <div>
                            <span className="font-semibold text-muted-foreground pr-2">{msg.username}</span>
                            <span className="leading-relaxed">{msg.message}</span>
                        </div>
                    </div>
                  )
                })}
            </div>
        ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No messages yet. Say hello!</p>
        )}
      </ScrollArea>
      
      {/* Input */}
      <div className="p-2 border-t bg-background/95 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-grow">
            <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Chat..."
                className="flex-grow bg-muted border-none focus-visible:ring-1 focus-visible:ring-ring rounded-full pl-4 pr-12"
            />
             <Button type="submit" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
