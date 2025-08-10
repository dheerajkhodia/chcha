"use client";

import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import ContentRecommendation from '@/components/content-recommendation';
import { Send, Users, MessageSquare, Tv, Clipboard, X } from 'lucide-react';
import type { ChatMessage, User } from '@/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useSidebar } from '@/components/ui/sidebar';

type ChatPanelProps = {
  roomId: string;
  videoTitle: string;
  users: User[],
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
  const { setOpenMobile } = useSidebar();

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
    // Auto-scroll to bottom
    const scrollViewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (scrollViewport) {
      scrollViewport.scrollTop = scrollViewport.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold font-headline text-foreground truncate pr-2" title={videoTitle}>
            {videoTitle}
            </h2>
            <Button variant="ghost" size="icon" className="md:hidden -mr-2 -mt-2 h-8 w-8" onClick={() => setOpenMobile(false)}>
                <X />
            </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary">Room: {roomId}</Badge>
          <Button variant="outline" size="sm" onClick={handleCopyLink} className="h-auto px-2 py-1 text-xs">
            <Clipboard className="h-3 w-3 mr-1" />
            Copy Invite
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-grow" ref={scrollAreaRef}>
        <div className="p-1">
            <Accordion type="single" collapsible defaultValue="item-2" className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="px-3 py-3 text-sm hover:no-underline hover:bg-sidebar-accent rounded-md">
                        <div className="flex items-center gap-2 font-semibold">
                            <Users className="h-5 w-5"/> 
                            <span>Participants ({users.length})</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pt-2 pb-2">
                        <div className="space-y-2">
                        {users.map(user => (
                            <div key={user.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>{user.username}</span>
                            </div>
                        ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="px-3 py-3 text-sm hover:no-underline hover:bg-sidebar-accent rounded-md">
                        <div className="flex items-center gap-2 font-semibold">
                            <MessageSquare className="h-5 w-5"/>
                            <span>Chat</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pt-2 pb-2">
                        {messages.length > 0 ? (
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div key={msg.id} className="flex flex-col">
                                        <div className="flex items-baseline gap-2 text-xs">
                                        <span className="font-bold text-foreground">{msg.username}</span>
                                        <span className="text-muted-foreground">{format(msg.timestamp, 'p')}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-snug">{msg.message}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No messages yet. Say hello!</p>
                        )}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3" className="border-b-0">
                    <AccordionTrigger className="px-3 py-3 text-sm hover:no-underline hover:bg-sidebar-accent rounded-md">
                         <div className="flex items-center gap-2 font-semibold">
                            <Tv className="h-5 w-5"/>
                            <span>Watch Next?</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pt-2 pb-0">
                       <ContentRecommendation currentVideoTitle={videoTitle} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-sidebar-border mt-auto">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow bg-background focus-visible:ring-1 focus-visible:ring-ring"
          />
          <Button type="submit" size="icon" variant="secondary" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
