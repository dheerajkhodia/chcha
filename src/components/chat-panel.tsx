"use client";

import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Users, MessageSquare, Tv, Clipboard, X, User } from 'lucide-react';
import type { ChatMessage, User as UserType } from '@/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ContentRecommendation from '@/components/content-recommendation';


type ChatPanelProps = {
  roomId: string;
  videoTitle: string;
  users: UserType[],
  messages: ChatMessage[],
  onSendMessage: (message: string) => void;
  onClose?: () => void;
};

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
    <div className="flex flex-col h-full bg-card text-card-foreground border-l">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Live Chat</h2>
            {onClose && (
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
                    <X />
                </Button>
            )}
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
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
                {messages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-3 text-sm">
                        {renderUserAvatar(msg.username)}
                        <div>
                            <span className="font-semibold text-muted-foreground pr-2">{msg.username}</span>
                            <span className="leading-relaxed">{msg.message}</span>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No messages yet. Say hello!</p>
        )}
      </ScrollArea>
      
      {/* Actions / Recommendations */}
       <Accordion type="single" collapsible className="w-full border-t">
          <AccordionItem value="item-1" className="border-b-0">
              <AccordionTrigger className="px-4 py-3 text-sm font-semibold hover:no-underline">
                  <div className="flex items-center gap-2">
                      <Tv className="h-5 w-5"/>
                      <span>Watch Next?</span>
                  </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                 <ContentRecommendation currentVideoTitle={videoTitle} />
              </AccordionContent>
          </AccordionItem>
      </Accordion>

      {/* Input */}
      <div className="p-4 border-t mt-auto bg-background">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Chat..."
            className="flex-grow bg-muted border-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <Button type="submit" size="icon" variant="ghost" className="text-primary hover:text-primary" disabled={!message.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
