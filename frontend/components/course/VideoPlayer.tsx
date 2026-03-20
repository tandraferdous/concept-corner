'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Loader2,
} from 'lucide-react';
import { cn, formatDuration } from '@/utils/helpers';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  resumeAt?: number;
  onProgress?: (seconds: number) => void;
  onEnded?: () => void;
  className?: string;
}

export default function VideoPlayer({
  src,
  poster,
  resumeAt = 0,
  onProgress,
  onEnded,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval>>();

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [levels, setLevels] = useState<{ height: number; bitrate: number }[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [showSettings, setShowSettings] = useState(false);

  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  // Initialise HLS or native video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (Hls.isSupported() && src.includes('.m3u8')) {
      const hls = new Hls({ startLevel: -1 });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setLevels(data.levels);
        if (resumeAt > 0) video.currentTime = resumeAt;
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => setCurrentLevel(data.level));
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        if (resumeAt > 0) video.currentTime = resumeAt;
      });
    } else {
      video.src = src;
    }

    return () => {
      hlsRef.current?.destroy();
    };
  }, [src, resumeAt]);

  // Event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => { setLoading(false); setDuration(video.duration); };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => { setPlaying(false); onEnded?.(); };
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => setLoading(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length) setBuffered(video.buffered.end(video.buffered.length - 1));
    };

    video.addEventListener('loadeddata', onLoaded);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      video.removeEventListener('loadeddata', onLoaded);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [onEnded]);

  // Report progress every 10s
  useEffect(() => {
    if (playing && onProgress) {
      progressInterval.current = setInterval(() => {
        const v = videoRef.current;
        if (v) onProgress(Math.floor(v.currentTime));
      }, 10000);
    }
    return () => clearInterval(progressInterval.current);
  }, [playing, onProgress]);

  // Fullscreen change
  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    if (playing) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    playing ? video.pause() : video.play();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !muted;
    setMuted(!muted);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
    setMuted(v === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    if (videoRef.current) videoRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const setQuality = (level: number) => {
    if (hlsRef.current) hlsRef.current.currentLevel = level;
    setCurrentLevel(level);
    setShowSettings(false);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const bufferedProgress = duration ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black rounded-2xl overflow-hidden select-none group',
        className
      )}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        playsInline
      />

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Loader2 className="text-primary-500 animate-spin" size={40} />
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col justify-end transition-opacity duration-300',
          showControls || !playing ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        <div className="relative p-4 space-y-2">
          {/* Seek bar */}
          <div className="relative h-1.5 rounded-full bg-white/20 cursor-pointer">
            <div
              className="absolute h-full bg-white/30 rounded-full"
              style={{ width: `${bufferedProgress}%` }}
            />
            <div
              className="absolute h-full bg-primary-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Buttons row */}
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-primary-400 transition-colors">
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-white hover:text-primary-400 transition-colors">
                {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={handleVolume}
                className="w-20 accent-primary-500"
              />
            </div>

            <span className="text-white/70 text-xs ml-1">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>

            <div className="ml-auto flex items-center gap-2">
              {/* Quality */}
              {levels.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-white hover:text-primary-400 transition-colors"
                  >
                    <Settings size={18} />
                  </button>
                  {showSettings && (
                    <div className="absolute bottom-8 right-0 bg-black/90 border border-white/10 rounded-xl overflow-hidden w-32">
                      <p className="text-xs text-white/50 px-3 py-2 border-b border-white/10">Quality</p>
                      <button
                        onClick={() => setQuality(-1)}
                        className={cn('block w-full text-left px-3 py-2 text-xs hover:bg-white/10', currentLevel === -1 && 'text-primary-400')}
                      >
                        Auto
                      </button>
                      {levels.map((l, i) => (
                        <button
                          key={i}
                          onClick={() => setQuality(i)}
                          className={cn('block w-full text-left px-3 py-2 text-xs hover:bg-white/10', currentLevel === i && 'text-primary-400')}
                        >
                          {l.height}p
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button onClick={toggleFullscreen} className="text-white hover:text-primary-400 transition-colors">
                {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
