"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, RefreshCw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types';

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
  chatOverlayMessages: ChatMessage[];
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
  chatOverlayMessages
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch(e => console.error("Video play failed:", e));
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 1) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) onDurationChange(videoRef.current.duration);
  };
  
  const handleTimeUpdate = () => {
    if (videoRef.current) onTimeUpdate(videoRef.current.currentTime);
  };

  const togglePlay = () => {
    isPlaying ? onPause() : onPlay();
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if(videoRef.current) videoRef.current.volume = newVolume;
  };

  const toggleMute = () => {
    if(isMuted) {
      setIsMuted(false);
      setVolume(0.5);
      if(videoRef.current) videoRef.current.volume = 0.5;
    } else {
      setIsMuted(true);
      setVolume(0);
      if(videoRef.current) videoRef.current.volume = 0;
    }
  }

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);
  
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };
  
  const handleMouseLeave = () => {
    if(isPlaying) setShowControls(false);
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => onPlay()}
        onPause={() => onPause()}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onDurationChange={() => videoRef.current && onDurationChange(videoRef.current.duration)}
        playsInline
      />
      
      {isLoading && (
         <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <RefreshCw className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {chatOverlayMessages.length > 0 && (
        <div className="absolute bottom-24 left-4 right-4 z-20 pointer-events-none">
          <div className="max-h-60 overflow-y-auto pr-4">
          {chatOverlayMessages.slice(-5).map((msg) => (
            <p key={msg.id} className="text-white text-shadow p-1 text-lg" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>
              <span className={cn("font-bold", msg.username === 'System' ? 'text-accent' : 'text-primary-foreground/80')}>{msg.username}:</span> {msg.message}
            </p>
          ))}
          </div>
        </div>
      )}

      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 pointer-events-none",
          showControls ? "opacity-100" : "opacity-0"
        )}
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "absolute bottom-0 left-0 right-0 p-4 text-white z-20 transition-opacity duration-300",
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="flex items-center gap-4">
          <span className="text-sm font-mono w-14 text-center">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            onValueChange={(value) => onSeek(value[0])}
            className="w-full cursor-pointer"
          />
          <span className="text-sm font-mono w-14 text-center">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={togglePlay}>
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </Button>
            <div className="flex items-center gap-2 w-32">
              <Button variant="ghost" size="icon" onClick={toggleMute}>
                {isMuted || volume === 0 ? <VolumeX /> : <Volume2 />}
              </Button>
              <Slider value={[isMuted ? 0 : volume]} max={1} step={0.05} onValueChange={handleVolumeChange} />
            </div>
          </div>
          <div>
            <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
              {isFullScreen ? <Minimize /> : <Maximize />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
