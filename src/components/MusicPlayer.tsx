"use client";
import { Card, CardBody } from "@nextui-org/react";
import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { create } from 'zustand';
import { useRef, useEffect, useState, useCallback } from "react";
import Image from 'next/image';

interface Song {
  title: string;
  artist: string;
  number: number;
}

interface PlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  currentSongIndex: number;
  songs: Song[];
  setIsPlaying: (isPlaying: boolean) => void;
  setIsMuted: (isMuted: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setCurrentSongIndex: (index: number) => void;
  setSongs: (songs: Song[]) => void;
}

const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  isMuted: false,
  volume: 50,
  currentTime: 0,
  duration: 0,
  currentSongIndex: 0,
  songs: [],
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsMuted: (isMuted) => set({ isMuted }),
  setVolume: (volume) => set({ volume }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setCurrentSongIndex: (currentSongIndex) => set({ currentSongIndex }),
  setSongs: (songs) => set({ songs }),
}));

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    isPlaying, isMuted, volume, currentTime, duration, songs, currentSongIndex,
    setIsPlaying, setIsMuted, setVolume, setCurrentTime, setDuration, setCurrentSongIndex, setSongs
  } = usePlayerStore();

  const isDraggingProgress = useRef(false);
  const isDraggingVolume = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    const loadSongs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/songs');
        const songList = await response.json();
        setSongs(songList);
      } catch (error) {
        console.error('Error loading songs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSongs();
  }, [setSongs]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const togglePlayPause = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          await audioRef.current.pause();
        } else {
          await audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error('Error playing/pausing audio:', error);
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newVolume = Math.round((x / rect.width) * 100);
    setVolume(Math.max(0, Math.min(100, newVolume)));
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const maxTime = duration - 0.1;
      const newTime = Math.max(0, Math.min((x / rect.width) * duration, maxTime));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const playNextSong = () => {
    if (songs.length > 0) {
      const nextIndex = (currentSongIndex + 1) % songs.length;
      setCurrentSongIndex(nextIndex);
      if (isPlaying && audioRef.current) {
        setTimeout(() => audioRef.current?.play(), 0);
      }
    }
  };

  const playPreviousSong = () => {
    if (songs.length > 0) {
      const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
      setCurrentSongIndex(prevIndex);
      if (isPlaying && audioRef.current) {
        setTimeout(() => audioRef.current?.play(), 0);
      }
    }
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentSong = songs.length > 0 
    ? {
        ...songs[currentSongIndex % songs.length],
        cover: `/songs/covers/${encodeURIComponent(songs[currentSongIndex].title)}.png`,
        file: `/songs/${encodeURIComponent(`${songs[currentSongIndex].number} | ${songs[currentSongIndex].artist} - ${songs[currentSongIndex].title}.mp3`)}`
      }
    : {
        title: 'Loading...',
        artist: 'Please wait',
        file: null,
        cover: ''
      };

  const handleMouseDown = (type: 'progress' | 'volume') => (e: React.MouseEvent<HTMLDivElement>) => {
    if (type === 'progress') {
      isDraggingProgress.current = true;
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
      }
      handleProgressClick(e);
    } else {
      isDraggingVolume.current = true;
      handleVolumeChange(e);
    }
  };

  const handleMouseMove = useCallback((e: PointerEvent) => {
    if (isDraggingProgress.current) {
      const progressBar = document.querySelector('.progress-bar');
      if (progressBar) {
        const rect = progressBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const maxTime = duration - 0.1;
        const newTime = Math.max(0, Math.min((x / rect.width) * duration, maxTime));
        if (audioRef.current) {
          audioRef.current.currentTime = newTime;
          setCurrentTime(newTime);
        }
      }
    } else if (isDraggingVolume.current) {
      const volumeBar = document.querySelector('.volume-bar');
      if (volumeBar) {
        const rect = volumeBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newVolume = Math.max(0, Math.min(Math.round((x / rect.width) * 100), 100));
        setVolume(newVolume);
      }
    }
  }, [duration, isDraggingProgress, isDraggingVolume, audioRef, setCurrentTime, setVolume]);

  const handleMouseUp = () => {
    if (isDraggingProgress.current) {
      if (audioRef.current) {
        audioRef.current.play();
      }
      isDraggingProgress.current = false;
    }
    isDraggingVolume.current = false;
  };

  useEffect(() => {
    document.addEventListener('pointermove', handleMouseMove);
    document.addEventListener('pointerup', handleMouseUp);

    return () => {
      document.removeEventListener('pointermove', handleMouseMove);
      document.removeEventListener('pointerup', handleMouseUp);
    };
  }, [duration, handleMouseMove]);

  useEffect(() => {
    setIsImageLoaded(false);
  }, [currentSong.cover]);

  return (
    <motion.div
      className="pt-2.5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {currentSong.file && (
        <audio
          ref={audioRef}
          src={currentSong.file}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={playNextSong}
          onError={(e) => console.error('Audio playback error:', e)}
        />
      )}
      <Card className="bg-black/30 backdrop-blur-md border border-[#dbdbdb]/20 rounded-lg w-[90%] max-w-md mx-auto h-auto transition-all duration-300 hover:shadow-[0_0_8px_rgba(255,255,255,0.15)] hover:border-opacity-30">
        <CardBody className="p-2">
          <div className="flex items-start gap-3">
            {isLoading ? (
              <div className="skeleton-bg animate-pulse rounded-lg w-12 h-12" />
            ) : (
              currentSong.cover ? (
                <div className="relative h-12 w-12 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 skeleton-bg animate-pulse" />
                  <Image 
                    src={currentSong.cover} 
                    alt="Album Art" 
                    className="object-cover relative z-10 transition-opacity duration-300"
                    style={{ opacity: isImageLoaded ? 1 : 0 }}
                    onLoad={() => setIsImageLoaded(true)}
                    fill
                    sizes="48px"
                    priority
                  />
                </div>
              ) : (
                <div className="skeleton-bg animate-pulse rounded-lg w-12 h-12" />
              )
            )}
            
            <div className="flex-1 min-w-0 space-y-2">
              {isLoading ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-2 items-center">
                        <div className="skeleton-bg animate-pulse h-2.5 w-24 rounded-full" />
                        <div className="skeleton-bg animate-pulse h-2.5 w-32 rounded-full" />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton-bg animate-pulse w-4 h-4 rounded-full" />
                          ))}
                        </div>
                        
                        <div className="flex-1 flex items-center gap-2">
                          <div className="skeleton-bg animate-pulse h-2 w-8 rounded-full" />
                          <div className="skeleton-bg animate-pulse h-2 flex-1 rounded-full" />
                          <div className="skeleton-bg animate-pulse h-2 w-8 rounded-full" />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="skeleton-bg animate-pulse w-4 h-4 rounded-full" />
                          <div className="skeleton-bg animate-pulse h-2 w-16 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm text-white">{currentSong.title}</span>
                    <span className="text-zinc-400 text-sm">•</span>
                    <span className="truncate text-sm text-zinc-400">{currentSong.artist}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                      <button className="text-zinc-400 hover:text-white transition-colors" onClick={playPreviousSong}>
                        <SkipBack className="h-4 w-4" />
                      </button>
                      <button className="text-zinc-400 hover:text-white transition-colors" onClick={togglePlayPause}>
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button className="text-zinc-400 hover:text-white transition-colors" onClick={playNextSong}>
                        <SkipForward className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex-1">
                      <div className="group relative h-6 flex items-center select-none">
                        <div className="flex items-center w-full">
                          <span className="mr-2 text-xs text-zinc-400">{formatTime(currentTime)}</span>
                          <div className="relative flex-1 progress-bar">
                            <div className="absolute inset-0 -top-2 -bottom-2 cursor-pointer" onClick={handleProgressClick} onMouseDown={handleMouseDown('progress')}></div>
                            <div className="h-[3px] w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full transition-[width] duration-75 bg-white rounded-full" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
                            </div>
                          </div>
                          <span className="ml-2 text-xs text-zinc-400">{formatTime(duration)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group flex items-center gap-2">
                      <button className="text-zinc-400 hover:text-white transition-colors" onClick={toggleMute}>
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                      <div className="w-16 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-left">
                        <div className="group relative h-6 flex items-center select-none">
                          <div className="flex items-center w-full">
                            <div className="relative flex-1 volume-bar">
                              <div className="absolute inset-0 -top-2 -bottom-2 cursor-pointer" onClick={handleVolumeChange} onMouseDown={handleMouseDown('volume')}></div>
                              <div className="h-[2px] w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full transition-[width] duration-75 bg-zinc-400 rounded-full" style={{ width: `${volume}%` }}></div>
                              </div>
                            </div>
                            <span className="ml-2 text-xs text-zinc-400">{volume}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
