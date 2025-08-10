"use client";

import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, X, User, SlidersHorizontal, ShoppingBag, Scissors, Smile, DollarSign, Heart } from 'lucide-react';
import type { ChatMessage, User as UserType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SheetTitle } from '@/components/ui/sheet';


type ChatPanelProps = {
  roomId: string;
  videoTitle: string;
  users: UserType[],
  messages: ChatMessage[],
  onSendMessage: (message: string) => void;
  onClose?: () => void;
};

const SubscribersOnlyMode = () => (
    <div className="flex items-start gap-4 rounded-lg bg-muted p-4 my-4 text-sm">
        <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 h-8 w-8">
                <path d="M21.58 16.32a2.4 2.4 0 0 0-1.2-2.8l-7.35-4.24a2.4 2.4 0 0 0-2.4 0L3.27 13.52a2.4 2.4 0 0 0-1.2 2.8v.01a2.4 2.4 0 0 0 1.2 2.8l7.35 4.24a2.4 2.4 0 0 0 2.4 0l7.35-4.24a2.4 2.4 0 0 0 1.2-2.8z"/>
                <path d="M9.5 12.5l5 3"/>
            </svg>
        </div>
        <div>
            <h3 className="font-semibold">Subscribers-only mode</h3>
            <p className="text-muted-foreground">Messages that appear are from people who've subscribed to this channel for 5 minutes or longer.</p>
            <Button variant="link" className="p-0 h-auto text-primary">Learn more</Button>
        </div>
    </div>
);


export default function ChatPanel({
  roomId,
  videoTitle,
  users,
  messages,
  onSendMessage,
  onClose,
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
            <div className="flex items-center gap-2 text-muted-foreground">
                <Button variant="ghost" size="icon"><Scissors /></Button>
                <Button variant="ghost" size="icon"><ShoppingBag /></Button>
                <Button variant="ghost" size="icon"><SlidersHorizontal /></Button>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X />
                    </Button>
                )}
            </div>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Top messages</span>
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
                {messages.map((msg, index) => (
                    <React.Fragment key={msg.id}>
                        <div className="flex items-start gap-3 text-sm">
                            {renderUserAvatar(msg.username)}
                            <div>
                                <span className="font-semibold text-muted-foreground pr-2">{msg.username}</span>
                                <span className="leading-relaxed">{msg.message}</span>
                            </div>
                        </div>
                         {index === Math.floor(messages.length / 2) && <SubscribersOnlyMode />}
                    </React.Fragment>
                ))}
            </div>
        ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No messages yet. Say hello!</p>
        )}
      </ScrollArea>
      
      {/* Floating Action */}
       <Button variant="destructive" size="icon" className="absolute bottom-20 right-4 rounded-full w-12 h-12 shadow-lg">
            <Heart className="w-6 h-6" fill="white"/>
        </Button>
      
      {/* Input */}
      <div className="p-2 border-t bg-background/95 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-grow">
            <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Chat..."
                className="flex-grow bg-muted border-none focus-visible:ring-1 focus-visible:ring-ring rounded-full pl-4 pr-20"
            />
            <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Smile />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <DollarSign />
                </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
