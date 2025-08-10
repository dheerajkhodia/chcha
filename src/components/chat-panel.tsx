"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import ContentRecommendation from '@/components/content-recommendation';
import { Send, Users, MessageSquare, Tv } from 'lucide-react';
import type { ChatMessage, User } from '@/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

type ChatPanelProps = {
  roomId: string;
  videoTitle: string;
  users: User[];
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isChatOverlay: boolean;
  onToggleChatOverlay: () => void;
};

export default function ChatPanel({
  roomId,
  videoTitle,
  users,
  messages,
  onSendMessage,
  isChatOverlay,
  onToggleChatOverlay,
}: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  useEffect(() => {
    // Auto-scroll to bottom
    const scrollViewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (scrollViewport) {
      scrollViewport.scrollTop = scrollViewport.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-card text-card-foreground">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold font-headline text-primary truncate" title={videoTitle}>
          {videoTitle}
        </h2>
        <Badge variant="secondary" className="mt-1">Room ID: {roomId}</Badge>
      </div>

      <ScrollArea className="flex-grow" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
            <Accordion type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1">
                    <AccordionTrigger>
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5"/> 
                            <span>Participants ({users.length})</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2">
                        {users.map(user => (
                            <div key={user.id} className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>{user.username}</span>
                            </div>
                        ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5"/>
                            <span>Chat</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3">
                            {messages.map((msg) => (
                                <div key={msg.id} className="flex flex-col">
                                    <div className="flex items-baseline gap-2 text-sm">
                                    <span className="font-bold text-primary">{msg.username}</span>
                                    <span className="text-xs text-muted-foreground">{format(msg.timestamp, 'p')}</span>
                                    </div>
                                    <p className="text-foreground/90">{msg.message}</p>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>
                         <div className="flex items-center gap-2">
                            <Tv className="h-5 w-5"/>
                            <span>What to watch next?</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                       <ContentRecommendation currentVideoTitle={videoTitle} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
      </ScrollArea>
      
      <Separator />

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
            <Label htmlFor="overlay-mode" className="flex items-center gap-2 cursor-pointer">
                Chat Overlay
            </Label>
            <Switch
                id="overlay-mode"
                checked={isChatOverlay}
                onCheckedChange={onToggleChatOverlay}
            />
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow"
          />
          <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90" disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
