"use client";

import React, { useRef, useState, useEffect } from 'react';
import ReactPlayer from 'react-player/lazy';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, RefreshCw, MessageSquare } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types';
import ChatOverlay from './chat-overlay';

type VideoPlayerProps = {
  videoUrl: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onToggleMobileChat: () => void;
  isMobile: boolean;
  messages: ChatMessage[];
  showChatOverlay: boolean;
  isAdmin: boolean;
};

export default function VideoPlayer({
  videoUrl,
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onSeek,
  onTimeUpdate,
  onDurationChange,
  onToggleMobileChat,
  isMobile,
  messages,
  showChatOverlay,
  isAdmin
}: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    // Seek to the correct time if there's a significant difference
    if (playerRef.current && Math.abs(playerRef.current.getCurrentTime() - currentTime) > 2) {
      playerRef.current.seekTo(currentTime);
    }
  }, [currentTime]);

  const handleProgress = (state: { playedSeconds: number }) => {
    onTimeUpdate(state.playedSeconds);
    if(isLoading && isPlaying) setIsLoading(false);
  };
  
  const handleDuration = (d: number) => {
    onDurationChange(d);
  };

  const handleContainerClick = () => {
    if (!hasStarted) {
        if (!isPlaying && isAdmin) onPlay();
        setHasStarted(true);
    } else {
        setShowControls(s => !s);
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    isPlaying ? onPause() : onPlay();
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  }

  const toggleFullScreen = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
  
    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        if (screen.orientation && typeof screen.orientation.lock === 'function') {
          await screen.orientation.lock('landscape');
        }
      } catch (err: any) {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      }
    } else {
      try {
        if (document.exitFullscreen) {
            await document.exitFullscreen();
        }
        if (screen.orientation && typeof screen.orientation.unlock === 'function') {
            screen.orientation.unlock();
        }
      } catch (err: any) {
         console.error(`Error exiting full-screen mode: ${err.message} (${err.name})`);
      }
    }
  };
  

  useEffect(() => {
    const handleFullScreenChange = () => {
        const isCurrentlyFullScreen = !!document.fullscreenElement;
        setIsFullScreen(isCurrentlyFullScreen);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const hideControls = () => {
    if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
        if(isPlaying && hasStarted) {
            setShowControls(false)
        }
    }, 3000);
  }
  
  const handlePointerMove = () => {
    setShowControls(true);
    hideControls();
  };
  
  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full bg-black flex items-center justify-center overflow-hidden aspect-video",
      )}
      onPointerMove={handlePointerMove}
      onClick={handleContainerClick}
    >
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        width="100%"
        height="100%"
        playing={isPlaying}
        volume={volume}
        muted={isMuted}
        controls={false}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onPlay={() => {
            if(!hasStarted) setHasStarted(true);
            if (!isPlaying && isAdmin) onPlay();
        }}
        onPause={() => {
            if (isPlaying && isAdmin) onPause()
        }}
        onBuffer={() => setIsLoading(true)}
        onBufferEnd={() => setIsLoading(false)}
        onReady={() => setIsLoading(false)}
        playsInline
        config={{ file: { attributes: { 
            style: { width: '100%', height: '100%', objectFit: 'contain' }
        }}}}
      />

      {showChatOverlay && <ChatOverlay messages={messages} />}
      
      {!hasStarted && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40" >
            <Button
                variant="ghost"
                size="icon"
                className="w-20 h-20 text-white bg-black/50 hover:bg-black/70 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                    e.stopPropagation();
                    if (!isPlaying) onPlay();
                    setHasStarted(true);
                }}
                disabled={!isAdmin}
            >
                <Play size={48} className="ml-1" />
            </Button>
        </div>
      )}

      {isLoading && (
         <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 pointer-events-none">
            <RefreshCw className="w-12 h-12 text-white animate-spin" />
        </div>
      )}


      {/* Gradients */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 pointer-events-none",
          showControls && hasStarted ? "opacity-100" : "opacity-0"
        )}
      />
       <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b from-black/50 to-transparent transition-opacity duration-300 pointer-events-none",
          showControls && hasStarted ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Controls */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "absolute inset-x-0 bottom-0 p-3 sm:p-4 text-white z-20 transition-all duration-300",
          showControls && hasStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        )}
      >
        <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-sm font-mono w-14 text-center">{formatTime(currentTime)}</span>
            <Slider
                value={[currentTime]}
                max={duration || 100}
                onValueChange={(value) => onSeek(value[0])}
                onValueCommit={(value) => playerRef.current?.seekTo(value[0])}
                className="w-full cursor-pointer"
                disabled={!isAdmin}
            />
            <span className="text-sm font-mono w-14 text-center">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" onClick={togglePlay} className="hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!isAdmin}>
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </Button>
            <div className="flex items-center gap-2 w-28 sm:w-32">
              <Button variant="ghost" size="icon" onClick={toggleMute} className="hover:bg-white/10">
                {isMuted || volume === 0 ? <VolumeX /> : <Volume2 />}
              </Button>
              <Slider value={[isMuted ? 0 : volume]} max={1} step={0.05} onValueChange={handleVolumeChange} />
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
             {isFullScreen && (
                <Button variant="ghost" size="icon" onClick={() => onToggleMobileChat()} className="text-white hover:bg-transparent focus:bg-transparent active:bg-transparent hover:text-white">
                  <MessageSquare />
                </Button>
              )}
             <Button variant="ghost" size="icon" onClick={toggleFullScreen} className="hover:bg-transparent focus:bg-transparent active:bg-transparent">
                {isFullScreen ? <Minimize /> : <Maximize />}
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
