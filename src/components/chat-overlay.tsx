"use client";

import React, { useEffect, useState, useRef } from 'react';
import type { ChatMessage } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';

type ChatOverlayProps = {
  messages: ChatMessage[];
};

const MAX_MESSAGES_ON_SCREEN = 15;

export default function ChatOverlay({ messages }: ChatOverlayProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to the bottom of the chat overlay
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // We only want to show the last N messages to avoid cluttering the screen
  const visibleMessages = messages.slice(-MAX_MESSAGES_ON_SCREEN);

  return (
    <div
      ref={scrollAreaRef}
      className="absolute inset-x-0 bottom-0 h-1/2 max-h-[300px] p-4 pointer-events-none overflow-y-auto"
      style={{
        maskImage: 'linear-gradient(to top, black 60%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to top, black 60%, transparent 100%)',
      }}
    >
      <div className="flex flex-col justify-end h-full">
        <AnimatePresence initial={false}>
          {visibleMessages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-white text-sm"
              style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}
            >
              <span className="font-bold pr-2" style={{ color: '#A9A9A9' }}>{msg.username}:</span>
              <span style={{ color: '#E0E0E0' }}>{msg.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
