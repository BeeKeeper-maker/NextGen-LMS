'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Settings,
  CheckCircle2,
  SkipForward,
  SkipBack,
  PictureInPicture2,
  Video,
  Headphones,
  Monitor,
  FileText,
  Clock,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────
export interface Chapter {
  time: number;
  title: string;
}

export interface VideoPlayerProps {
  videoUrl?: string;
  title: string;
  onComplete?: () => void;
  onProgress?: (progress: number, currentTime: number, watchedSegments: [number, number][]) => void;
  initialPosition?: number;
  chapters?: Chapter[];
  /** Compact mode - hides sidebar, back button, keyboard shortcuts */
  compact?: boolean;
  /** Legacy prop support — lesson-based usage */
  lesson?: {
    id: string;
    title: string;
    description?: string;
    contentType: 'video' | 'text' | 'audio' | 'document' | 'live_session';
    videoDuration?: number;
  };
  moduleName?: string;
  nextLessons?: { id: string; title: string; moduleName: string; duration: number; contentType: string }[];
  onMarkComplete?: (lessonId: string) => void;
  onNextLesson?: (lessonId: string) => void;
  onBack?: () => void;
  isCompleted?: boolean;
  totalDuration?: number;
}

// ─── Constants ──────────────────────────────────────────────
const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const CONTROLS_HIDE_DELAY = 3000;
const AUTO_COMPLETE_THRESHOLD = 0.9;
const SEGMENT_MERGE_THRESHOLD = 5; // merge segments within 5s of each other

// ─── Helpers ────────────────────────────────────────────────
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}h ${remainMins}m`;
}

function ContentTypeIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case 'video': return <Video className={className} />;
    case 'audio': return <Headphones className={className} />;
    case 'live_session': return <Monitor className={className} />;
    default: return <FileText className={className} />;
  }
}

// ─── Segment Tracker ────────────────────────────────────────
class SegmentTracker {
  private segments: [number, number][] = [];
  private currentStart: number | null = null;

  startSegment(time: number) {
    if (this.currentStart === null) {
      this.currentStart = time;
    }
  }

  updateSegment(time: number) {
    if (this.currentStart !== null) {
      // Extend or create segment
      const last = this.segments[this.segments.length - 1];
      if (last && Math.abs(time - last[1]) < SEGMENT_MERGE_THRESHOLD) {
        last[1] = Math.max(last[1], time);
      } else {
        if (this.currentStart !== null) {
          this.segments.push([this.currentStart, time]);
          this.mergeSegments();
        }
      }
    }
  }

  stopSegment(time: number) {
    if (this.currentStart !== null) {
      this.segments.push([this.currentStart, time]);
      this.mergeSegments();
      this.currentStart = null;
    }
  }

  private mergeSegments() {
    if (this.segments.length <= 1) return;
    const merged: [number, number][] = [this.segments[0]];
    for (let i = 1; i < this.segments.length; i++) {
      const last = merged[merged.length - 1];
      const cur = this.segments[i];
      if (cur[0] - last[1] < SEGMENT_MERGE_THRESHOLD) {
        last[1] = Math.max(last[1], cur[1]);
      } else {
        merged.push(cur);
      }
    }
    this.segments = merged;
  }

  getWatchedPercent(totalDuration: number): number {
    if (totalDuration <= 0) return 0;
    const watched = this.segments.reduce((sum, seg) => sum + (seg[1] - seg[0]), 0);
    return Math.min(100, (watched / totalDuration) * 100);
  }

  getSegments(): [number, number][] {
    return [...this.segments];
  }

  seekTo(time: number) {
    // When seeking, end current segment and start new
    if (this.currentStart !== null) {
      this.segments.push([this.currentStart, this.currentStart + 0.5]);
      this.currentStart = time;
    }
  }
}

// ─── Main Component ─────────────────────────────────────────
export function VideoPlayer({
  videoUrl,
  title,
  onComplete,
  onProgress,
  initialPosition = 0,
  chapters = [],
  compact = false,
  lesson,
  moduleName,
  nextLessons = [],
  onMarkComplete,
  onNextLesson,
  onBack,
  isCompleted: isCompletedProp = false,
  totalDuration: totalDurationProp,
}: VideoPlayerProps) {
  // Resolve props from lesson or direct
  const resolvedTitle = title || lesson?.title || 'Untitled Lesson';
  const resolvedModuleName = moduleName || '';
  const totalDuration = totalDurationProp || lesson?.videoDuration || 300;
  const resolvedContentType = lesson?.contentType || 'video';

  // ─── State ──────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialPosition);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showTitle, setShowTitle] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [isCompleted, setIsCompleted] = useState(isCompletedProp);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const [showResumePrompt, setShowResumePrompt] = useState(initialPosition > 0);
  const [watchedPercent, setWatchedPercent] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);

  // ─── Refs ───────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const segmentTrackerRef = useRef(new SegmentTracker());
  const lastTimeRef = useRef(initialPosition);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // ─── Computed ───────────────────────────────────────────
  const progressPercent = (currentTime / totalDuration) * 100;
  const displayVolume = isMuted ? 0 : volume;

  const chapterAtTime = useMemo(() => {
    if (chapters.length === 0) return null;
    let current = chapters[0];
    for (const ch of chapters) {
      if (currentTime >= ch.time) current = ch;
      else break;
    }
    return current;
  }, [currentTime, chapters]);

  // ─── Controls visibility ────────────────────────────────
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowTitle(false);
      }, CONTROLS_HIDE_DELAY);
    }
  }, [isPlaying]);

  const handleMouseMove = useCallback(() => {
    resetControlsTimer();
  }, [resetControlsTimer]);

  // ─── Playback simulation ────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      segmentTrackerRef.current.startSegment(currentTime);
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + playbackSpeed;
          lastTimeRef.current = prev;

          // Update segment tracker
          segmentTrackerRef.current.updateSegment(next);

          // Calculate watched percentage
          const wp = segmentTrackerRef.current.getWatchedPercent(totalDuration);
          setWatchedPercent(wp);

          // Report progress
          if (onProgress) {
            onProgress(wp, next, segmentTrackerRef.current.getSegments());
          }

          // Auto-complete at threshold
          if (wp >= AUTO_COMPLETE_THRESHOLD * 100 && !isCompleted) {
            setIsCompleted(true);
            if (onComplete) onComplete();
            if (onMarkComplete && lesson?.id) onMarkComplete(lesson.id);
          }

          if (next >= totalDuration) {
            setIsPlaying(false);
            segmentTrackerRef.current.stopSegment(totalDuration);
            if (!isCompleted) {
              setIsCompleted(true);
              if (onComplete) onComplete();
              if (onMarkComplete && lesson?.id) onMarkComplete(lesson.id);
            }
            return totalDuration;
          }
          return next;
        });
      }, 1000);
    } else {
      segmentTrackerRef.current.stopSegment(lastTimeRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, playbackSpeed, totalDuration]);

  // Simulated buffering
  useEffect(() => {
    if (isPlaying) {
      const bufferInterval = setInterval(() => {
        setBufferedPercent(Math.min(100, progressPercent + 10 + Math.random() * 15));
      }, 2000);
      return () => clearInterval(bufferInterval);
    }
  }, [isPlaying, progressPercent]);

  // ─── Toggle play ────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const willPlay = !isPlaying;
    setIsPlaying(willPlay);
    setShowResumePrompt(false);
    if (willPlay) {
      setShowTitle(true);
      resetControlsTimer();
      setTimeout(() => setShowTitle(false), 3000);
    } else {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      setShowControls(true);
      setShowTitle(true);
    }
  }, [isPlaying, resetControlsTimer]);

  // ─── Seek ───────────────────────────────────────────────
  const seekTo = useCallback((time: number) => {
    const clamped = Math.max(0, Math.min(time, totalDuration));
    segmentTrackerRef.current.seekTo(clamped);
    setCurrentTime(clamped);
    lastTimeRef.current = clamped;
  }, [totalDuration]);

  const skipForward = useCallback(() => seekTo(currentTime + 10), [currentTime, seekTo]);
  const skipBackward = useCallback(() => seekTo(currentTime - 10), [currentTime, seekTo]);

  // ─── Progress bar click ─────────────────────────────────
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      seekTo(percent * totalDuration);
    },
    [totalDuration, seekTo]
  );

  const handleProgressHover = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      setHoverTime(percent * totalDuration);
      setHoverX(e.clientX - rect.left);
      setProgressBarWidth(rect.width);
    },
    [totalDuration]
  );

  const handleProgressLeave = useCallback(() => {
    setHoverTime(null);
  }, []);

  // ─── Volume ─────────────────────────────────────────────
  const toggleMute = useCallback(() => setIsMuted(!isMuted), [isMuted]);
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
  }, []);

  // ─── Fullscreen ─────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ─── PiP (simulated) ───────────────────────────────────
  const togglePiP = useCallback(() => {
    setIsPiP(!isPiP);
  }, [isPiP]);

  // ─── Resume ─────────────────────────────────────────────
  const handleResume = useCallback(() => {
    setShowResumePrompt(false);
    setIsPlaying(true);
    resetControlsTimer();
  }, [resetControlsTimer]);

  const handleStartFromBeginning = useCallback(() => {
    setCurrentTime(0);
    lastTimeRef.current = 0;
    setShowResumePrompt(false);
    setIsPlaying(true);
    resetControlsTimer();
  }, [resetControlsTimer]);

  // ─── Keyboard shortcuts ─────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't capture if focused on input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume((v) => {
            const nv = Math.min(1, v + 0.1);
            setIsMuted(nv === 0);
            return nv;
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((v) => {
            const nv = Math.max(0, v - 0.1);
            setIsMuted(nv === 0);
            return nv;
          });
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case '<':
        case ',':
          e.preventDefault();
          setPlaybackSpeed((s) => {
            const idx = PLAYBACK_SPEEDS.indexOf(s);
            return idx > 0 ? PLAYBACK_SPEEDS[idx - 1] : s;
          });
          break;
        case '>':
        case '.':
          e.preventDefault();
          setPlaybackSpeed((s) => {
            const idx = PLAYBACK_SPEEDS.indexOf(s);
            return idx < PLAYBACK_SPEEDS.length - 1 ? PLAYBACK_SPEEDS[idx + 1] : s;
          });
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, skipForward, skipBackward, toggleFullscreen, toggleMute]);

  // ─── Touch / Swipe handling ─────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    // Only horizontal swipes
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 2 && dt < 500) {
      const seekAmount = (dx / 300) * 30; // up to 30s based on swipe distance
      seekTo(currentTime + seekAmount);
    }
    touchStartRef.current = null;
  }, [currentTime, seekTo]);

  // ─── Mark complete manually ─────────────────────────────
  const handleMarkComplete = () => {
    setIsCompleted(true);
    if (onComplete) onComplete();
    if (onMarkComplete && lesson?.id) onMarkComplete(lesson.id);
  };

  // ─── Chapter markers on progress bar ────────────────────
  const chapterMarkers = useMemo(() => {
    if (chapters.length === 0) return null;
    return chapters
      .filter((ch) => ch.time > 0)
      .map((ch, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 w-0.5 bg-white/40 z-10"
          style={{ left: `${(ch.time / totalDuration) * 100}%` }}
          title={ch.title}
        />
      ));
  }, [chapters, totalDuration]);

  // ─── Volume icon ────────────────────────────────────────
  const VolumeIcon = displayVolume === 0 ? VolumeX : displayVolume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="space-y-4">
      {/* Back Button */}
      {onBack && !compact && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-muted-foreground hover:text-foreground">
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to Course
          </Button>
        </motion.div>
      )}

      <div className={cn(compact ? 'flex flex-col' : 'flex flex-col lg:flex-row gap-4')}>
        {/* ─── Video Player Container ──────────────────────── */}
        <div className="flex-1 min-w-0">
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(
              'relative rounded-xl overflow-hidden bg-black shadow-2xl group/container',
              isPiP && 'fixed bottom-4 right-4 w-80 h-45 z-50 rounded-lg shadow-2xl'
            )}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* 16:9 Aspect Ratio Container */}
            <div className="relative w-full" style={{ aspectRatio: isPiP ? '16/9' : '16/9' }}>
              {/* Simulated Video Content - Animated Gradient */}
              <div className="absolute inset-0">
                <div
                  className="absolute inset-0"
                  style={{
                    background: isPlaying
                      ? `linear-gradient(${135 + currentTime * 0.5}deg, 
                          #0f172a 0%, 
                          #1e293b 25%, 
                          #334155 50%, 
                          #1e293b 75%, 
                          #0f172a 100%)`
                      : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                    transition: 'background 2s ease',
                  }}
                />
                {/* Animated wave pattern */}
                {isPlaying && (
                  <div className="absolute inset-0 opacity-20">
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(ellipse at ${30 + Math.sin(currentTime * 0.1) * 20}% ${50 + Math.cos(currentTime * 0.08) * 20}%, 
                          rgba(16, 185, 129, 0.4) 0%, 
                          transparent 50%),
                          radial-gradient(ellipse at ${70 + Math.cos(currentTime * 0.12) * 20}% ${50 + Math.sin(currentTime * 0.09) * 20}%, 
                          rgba(139, 92, 246, 0.3) 0%, 
                          transparent 50%)`,
                      }}
                    />
                  </div>
                )}
                {/* Center content indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white/30">
                    <Video className={cn('mx-auto mb-3', isPiP ? 'h-8 w-8' : 'h-16 w-16')} />
                    <p className={cn('font-medium', isPiP ? 'text-[10px]' : 'text-sm')}>Simulated Video Playback</p>
                    {!isPiP && (
                      <p className="text-xs mt-1">
                        {isPlaying ? `Playing at ${playbackSpeed}x speed` : 'Click play to start'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Title Overlay */}
              <AnimatePresence>
                {showTitle && !isPiP && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-x-0 top-0 p-4 md:p-6"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {resolvedModuleName && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] backdrop-blur-sm">
                          {resolvedModuleName}
                        </Badge>
                      )}
                      <ContentTypeIcon type={resolvedContentType} className="h-3.5 w-3.5 text-white/60" />
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-white">{resolvedTitle}</h2>
                    {/* Chapter indicator */}
                    {chapterAtTime && (
                      <p className="text-xs text-white/60 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {chapterAtTime.title}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Large Play/Pause Overlay Button */}
              <AnimatePresence>
                {!isPlaying && !showResumePrompt && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer group"
                  >
                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 transition-all duration-200 group-hover:scale-110">
                      <Play className="h-8 w-8 md:h-10 md:w-10 text-white ml-1" fill="white" />
                    </div>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Resume Prompt */}
              <AnimatePresence>
                {showResumePrompt && !isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 flex items-center justify-center z-20 bg-black/60 backdrop-blur-sm"
                  >
                    <div className="bg-slate-900/90 backdrop-blur-md rounded-xl p-6 max-w-sm mx-4 text-center border border-white/10 shadow-2xl">
                      <RotateCcw className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                      <h3 className="text-white font-semibold text-lg mb-1">Continue Watching?</h3>
                      <p className="text-white/60 text-sm mb-4">
                        You left off at {formatTime(initialPosition)}
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleStartFromBeginning}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          Start Over
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleResume}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                        >
                          <Play className="h-3.5 w-3.5" fill="currentColor" />
                          Resume
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Completed Overlay */}
              {isCompleted && !isPlaying && !showResumePrompt && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="bg-emerald-600/80 backdrop-blur-sm rounded-full p-4"
                  >
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </motion.div>
                </div>
              )}

              {/* Progress Percentage Badge */}
              {isPlaying && watchedPercent > 0 && (
                <div className="absolute top-3 right-3 z-20">
                  <Badge className="bg-black/50 text-white/80 border-0 text-[10px] backdrop-blur-sm">
                    {Math.round(watchedPercent)}% watched
                  </Badge>
                </div>
              )}

              {/* Bottom Control Bar */}
              <AnimatePresence>
                {showControls && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-x-0 bottom-0"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)',
                    }}
                  >
                    {/* Progress Bar */}
                    <div
                      ref={progressRef}
                      onClick={handleProgressClick}
                      onMouseMove={handleProgressHover}
                      onMouseLeave={handleProgressLeave}
                      className="mx-3 md:mx-4 relative h-1.5 bg-white/20 rounded-full cursor-pointer group/progress hover:h-2.5 transition-all"
                    >
                      {/* Buffered indicator */}
                      <div
                        className="absolute h-full bg-white/20 rounded-full"
                        style={{ width: `${bufferedPercent}%` }}
                      />
                      {/* Progress */}
                      <div
                        className="relative h-full bg-emerald-500 rounded-full transition-all duration-200"
                        style={{ width: `${progressPercent}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 bg-emerald-400 rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                      </div>
                      {/* Chapter markers */}
                      {chapterMarkers}
                      {/* Hover time tooltip */}
                      {hoverTime !== null && (
                        <div
                          className="absolute -top-8 bg-black/80 text-white text-[11px] px-2 py-1 rounded-md backdrop-blur-sm pointer-events-none whitespace-nowrap z-20"
                          style={{ left: `${Math.max(0, Math.min(hoverX - 25, progressBarWidth - 50))}px` }}
                        >
                          {formatTime(hoverTime)}
                          {chapters.find((ch, i) => {
                            const nextCh = chapters[i + 1];
                            return hoverTime >= ch.time && (!nextCh || hoverTime < nextCh.time);
                          }) && (
                            <span className="ml-1.5 text-emerald-400">
                              {chapters.find((ch, i) => {
                                const nextCh = chapters[i + 1];
                                return hoverTime >= ch.time && (!nextCh || hoverTime < nextCh.time);
                              })?.title}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-3">
                      {/* Play/Pause */}
                      <button onClick={togglePlay} className="text-white hover:text-emerald-400 transition-colors shrink-0 p-1" aria-label={isPlaying ? 'Pause' : 'Play'}>
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={isPlaying ? 'pause' : 'play'}
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.7, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            {isPlaying ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5 ml-0.5" fill="currentColor" />}
                          </motion.div>
                        </AnimatePresence>
                      </button>

                      {/* Skip Backward */}
                      <button
                        onClick={skipBackward}
                        className="text-white/70 hover:text-white transition-colors shrink-0 p-1"
                        title="Back 10s"
                        aria-label="Skip back 10 seconds"
                      >
                        <SkipBack className="h-4 w-4" />
                      </button>

                      {/* Skip Forward */}
                      <button
                        onClick={skipForward}
                        className="text-white/70 hover:text-white transition-colors shrink-0 p-1"
                        title="Forward 10s"
                        aria-label="Skip forward 10 seconds"
                      >
                        <SkipForward className="h-4 w-4" />
                      </button>

                      {/* Volume */}
                      <div className="flex items-center gap-1 group/vol">
                        <button
                          onClick={toggleMute}
                          className="text-white/70 hover:text-white transition-colors shrink-0 p-1"
                          aria-label={isMuted ? 'Unmute' : 'Mute'}
                        >
                          <VolumeIcon className="h-4 w-4" />
                        </button>
                        <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-200">
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={displayVolume}
                            onChange={handleVolumeChange}
                            className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-emerald-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400"
                            aria-label="Volume"
                          />
                        </div>
                      </div>

                      {/* Time Display */}
                      <span className="text-xs text-white/70 font-mono tabular-nums shrink-0 ml-1">
                        {formatTime(currentTime)} / {formatTime(totalDuration)}
                      </span>

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* Mark as Complete */}
                      {!isCompleted ? (
                        <Button
                          size="sm"
                          onClick={handleMarkComplete}
                          className="h-7 text-[11px] gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span className="hidden sm:inline">Complete</span>
                        </Button>
                      ) : (
                        <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30 text-[11px] shrink-0">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Done
                        </Badge>
                      )}

                      {/* Speed Selector */}
                      <div className="relative shrink-0">
                        <button
                          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                          className="text-white/70 hover:text-white transition-colors flex items-center gap-1 text-xs font-medium p-1"
                          aria-label="Playback speed"
                        >
                          <Settings className="h-4 w-4" />
                          <span className="hidden sm:inline">{playbackSpeed}x</span>
                        </button>
                        <AnimatePresence>
                          {showSpeedMenu && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              className="absolute bottom-full right-0 mb-2 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl z-20"
                            >
                              <div className="px-3 py-1.5 text-[10px] text-white/40 font-medium uppercase tracking-wider border-b border-slate-700/50">
                                Speed
                              </div>
                              {PLAYBACK_SPEEDS.map((speed) => (
                                <button
                                  key={speed}
                                  onClick={() => {
                                    setPlaybackSpeed(speed);
                                    setShowSpeedMenu(false);
                                  }}
                                  className={cn(
                                    'flex items-center justify-between w-full px-4 py-1.5 text-xs text-left hover:bg-slate-800 transition-colors',
                                    speed === playbackSpeed ? 'text-emerald-400 bg-slate-800/50' : 'text-white/70'
                                  )}
                                >
                                  <span>{speed}x</span>
                                  {speed === 1 && <span className="text-[10px] text-white/30">Normal</span>}
                                  {speed === playbackSpeed && <CheckCircle2 className="h-3 w-3" />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* PiP */}
                      <button
                        onClick={togglePiP}
                        className={cn(
                          'transition-colors shrink-0 p-1',
                          isPiP ? 'text-emerald-400' : 'text-white/70 hover:text-white'
                        )}
                        title="Picture in Picture"
                        aria-label="Toggle picture in picture"
                      >
                        <PictureInPicture2 className="h-4 w-4" />
                      </button>

                      {/* Fullscreen */}
                      <button
                        onClick={toggleFullscreen}
                        className="text-white/70 hover:text-white transition-colors shrink-0 p-1"
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                      >
                        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ─── Keyboard Shortcuts Hint ─────────────────────── */}
          {!compact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-3 flex flex-wrap gap-2"
          >
            {[
              { key: 'Space', label: 'Play/Pause' },
              { key: '←→', label: 'Seek 10s' },
              { key: '↑↓', label: 'Volume' },
              { key: 'F', label: 'Fullscreen' },
              { key: 'M', label: 'Mute' },
              { key: '<>', label: 'Speed' },
            ].map((shortcut) => (
              <div key={shortcut.key} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono border border-border">
                  {shortcut.key}
                </kbd>
                <span>{shortcut.label}</span>
              </div>
            ))}
          </motion.div>
          )}

          {/* ─── Chapter List ────────────────────────────────── */}
          {!compact && chapters.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Chapters</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {chapters.map((ch, i) => {
                  const isActive = chapterAtTime?.time === ch.time;
                  const isPast = currentTime >= ch.time;
                  return (
                    <button
                      key={i}
                      onClick={() => seekTo(ch.time)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors',
                        isActive ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' :
                        isPast ? 'text-muted-foreground hover:bg-muted/40' :
                        'text-muted-foreground/60 hover:bg-muted/40'
                      )}
                    >
                      <div className={cn(
                        'h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold',
                        isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300' :
                        isPast ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' :
                        'bg-slate-50 text-slate-400 dark:bg-slate-900 dark:text-slate-500'
                      )}>
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{ch.title}</p>
                        <p className="text-[10px] text-muted-foreground">{formatTime(ch.time)}</p>
                      </div>
                      {isPast && !isActive && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ─── Sidebar / Next Up Panel ───────────────────── */}
        {!compact && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full lg:w-80 shrink-0 space-y-4"
        >
          {/* Current Lesson Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {resolvedModuleName && (
                  <Badge variant="secondary" className="text-[10px]">{resolvedModuleName}</Badge>
                )}
                <ContentTypeIcon type={resolvedContentType} className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{resolvedTitle}</h3>
              {lesson?.description && (
                <p className="text-xs text-muted-foreground line-clamp-3 mb-2">{lesson.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDuration(totalDuration)}</span>
                {isCompleted && (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </span>
                )}
              </div>
              {/* Progress bar */}
              {watchedPercent > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Watched</span>
                    <span>{Math.round(watchedPercent)}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${watchedPercent}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Up Next */}
          {nextLessons.length > 0 && (
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <SkipForward className="h-4 w-4 text-emerald-600" />
                  Up Next
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-1">
                {nextLessons.map((nl) => (
                  <button
                    key={nl.id}
                    onClick={() => onNextLesson?.(nl.id)}
                    className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors text-left group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
                      <ContentTypeIcon type={nl.contentType} className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {nl.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{nl.moduleName} · {formatDuration(nl.duration)}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Lesson Notes */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-violet-600" />
                Lesson Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {lesson?.description || 'This lesson covers key concepts and practical examples. Take notes to reinforce your learning and revisit important topics.'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
        )}
      </div>
    </div>
  );
}


