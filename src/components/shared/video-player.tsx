'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  CheckCircle2,
  SkipForward,
  MessageSquare,
  Download,
  FileText,
  Sparkles,
  ChevronRight,
  Video,
  Headphones,
  Monitor,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Lesson, Module } from '@/types';

// ─── Format time as m:ss or h:mm:ss ───────────────────────
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Format duration ───────────────────────────────────────
function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}h ${remainMins}m`;
}

// ─── Content type icon ─────────────────────────────────────
function ContentTypeIcon({ type, className }: { type: Lesson['contentType']; className?: string }) {
  switch (type) {
    case 'video': return <Video className={className} />;
    case 'audio': return <Headphones className={className} />;
    case 'live_session': return <Monitor className={className} />;
    default: return <FileText className={className} />;
  }
}

// ─── Playback Speeds ──────────────────────────────────────
const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

// ─── Mock next lessons ────────────────────────────────────
interface NextLesson {
  id: string;
  title: string;
  moduleName: string;
  duration: number;
  contentType: Lesson['contentType'];
}

// ─── Props ────────────────────────────────────────────────
interface VideoPlayerProps {
  lesson: Lesson;
  moduleName: string;
  nextLessons: NextLesson[];
  onMarkComplete: (lessonId: string) => void;
  onNextLesson: (lessonId: string) => void;
  onBack: () => void;
  isCompleted?: boolean;
}

export function VideoPlayer({
  lesson,
  moduleName,
  nextLessons,
  onMarkComplete,
  onNextLesson,
  onBack,
  isCompleted,
}: VideoPlayerProps) {
  const totalDuration = lesson.videoDuration || 300; // default 5 min
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControlsDuringPlay, setShowControlsDuringPlay] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showTitleDuringPlay, setShowTitleDuringPlay] = useState(true);
  const [isCompletedState, setIsCompletedState] = useState(isCompleted || false);
  const progressRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Derived: controls always show when paused; auto-hide when playing
  const showControls = !isPlaying || showControlsDuringPlay;
  const showTitleOverlay = !isPlaying || showTitleDuringPlay;

  // Reset controls visibility on mouse move or pause
  const handleShowControls = useCallback(() => {
    setShowControlsDuringPlay(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControlsDuringPlay(false), 3000);
    }
  }, [isPlaying]);

  // Simulated playback timer
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + playbackSpeed;
          if (next >= totalDuration) {
            setIsPlaying(false);
            if (!isCompletedState) {
              setIsCompletedState(true);
              onMarkComplete(lesson.id);
            }
            return totalDuration;
          }
          return next;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, playbackSpeed, totalDuration, isCompletedState, onMarkComplete, lesson.id]);

  const togglePlay = useCallback(() => {
    const willBePlaying = !isPlaying;
    setIsPlaying(willBePlaying);
    if (willBePlaying) {
      setShowTitleDuringPlay(true);
      setShowControlsDuringPlay(true);
      // Auto-hide title after 3s
      setTimeout(() => setShowTitleDuringPlay(false), 3000);
      // Auto-hide controls after 3s
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => setShowControlsDuringPlay(false), 3000);
    } else {
      // Pausing: show controls immediately
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      setShowControlsDuringPlay(true);
      setShowTitleDuringPlay(true);
    }
  }, [isPlaying]);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      setCurrentTime(percent * totalDuration);
    },
    [totalDuration]
  );

  const progressPercent = (currentTime / totalDuration) * 100;

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-muted-foreground hover:text-foreground">
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back to Course
        </Button>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* ─── Video Player Container ──────────────────────── */}
        <div className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-xl overflow-hidden bg-black shadow-2xl"
            onMouseMove={() => setShowControls(true)}
            onMouseLeave={() => isPlaying && setShowControls(false)}
          >
            {/* 16:9 Aspect Ratio Container */}
            <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
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
                    <Video className="h-16 w-16 mx-auto mb-3" />
                    <p className="text-sm font-medium">Simulated Video Playback</p>
                    <p className="text-xs mt-1">
                      {isPlaying ? `Playing at ${playbackSpeed}x speed` : 'Click play to start'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Title Overlay */}
              <AnimatePresence>
                {showTitleOverlay && (
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
                      <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] backdrop-blur-sm">
                        {moduleName}
                      </Badge>
                      <ContentTypeIcon type={lesson.contentType} className="h-3.5 w-3.5 text-white/60" />
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-white">{lesson.title}</h2>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Large Play/Pause Overlay Button */}
              <AnimatePresence>
                {!isPlaying && (
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

              {/* Completed Overlay */}
              {isCompletedState && !isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="bg-emerald-600/80 backdrop-blur-sm rounded-full p-4">
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </div>
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
                      className="mx-3 md:mx-4 h-1.5 bg-white/20 rounded-full cursor-pointer group/progress hover:h-2.5 transition-all"
                    >
                      {/* Buffered (mock) */}
                      <div
                        className="absolute h-full bg-white/30 rounded-full"
                        style={{ width: `${Math.min(progressPercent + 15, 100)}%` }}
                      />
                      {/* Progress */}
                      <div
                        className="relative h-full bg-emerald-500 rounded-full transition-all duration-200"
                        style={{ width: `${progressPercent}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 bg-emerald-400 rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                      </div>
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3">
                      {/* Play/Pause */}
                      <button onClick={togglePlay} className="text-white hover:text-emerald-400 transition-colors shrink-0">
                        {isPlaying ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5" fill="currentColor" />}
                      </button>

                      {/* Skip Forward */}
                      <button
                        onClick={() => setCurrentTime((prev) => Math.min(prev + 10, totalDuration))}
                        className="text-white/70 hover:text-white transition-colors shrink-0"
                        title="Skip 10s"
                      >
                        <SkipForward className="h-4 w-4" />
                      </button>

                      {/* Volume */}
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-white/70 hover:text-white transition-colors shrink-0"
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>

                      {/* Time Display */}
                      <span className="text-xs text-white/70 font-mono tabular-nums shrink-0">
                        {formatTime(currentTime)} / {formatTime(totalDuration)}
                      </span>

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* Mark as Complete */}
                      {!isCompletedState ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setIsCompletedState(true);
                            onMarkComplete(lesson.id);
                          }}
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
                          className="text-white/70 hover:text-white transition-colors flex items-center gap-1 text-xs font-medium"
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
                              {PLAYBACK_SPEEDS.map((speed) => (
                                <button
                                  key={speed}
                                  onClick={() => {
                                    setPlaybackSpeed(speed);
                                    setShowSpeedMenu(false);
                                  }}
                                  className={cn(
                                    'block w-full px-4 py-1.5 text-xs text-left hover:bg-slate-800 transition-colors',
                                    speed === playbackSpeed ? 'text-emerald-400 bg-slate-800/50' : 'text-white/70'
                                  )}
                                >
                                  {speed}x
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Fullscreen */}
                      <button className="text-white/70 hover:text-white transition-colors shrink-0">
                        <Maximize className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* ─── Sidebar / Next Up Panel ───────────────────── */}
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
                <Badge variant="secondary" className="text-[10px]">{moduleName}</Badge>
                <ContentTypeIcon type={lesson.contentType} className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{lesson.title}</h3>
              {lesson.description && (
                <p className="text-xs text-muted-foreground line-clamp-3 mb-2">{lesson.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDuration(totalDuration)}</span>
                {isCompletedState && (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </span>
                )}
              </div>
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
                    onClick={() => onNextLesson(nl.id)}
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
                {lesson.description || 'This lesson covers key concepts and practical examples. Take notes to reinforce your learning and revisit important topics.'}
              </p>
            </CardContent>
          </Card>

          {/* Ask AI Tutor */}
          <Card className="border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50 to-violet-50 dark:from-emerald-950/20 dark:to-violet-950/20">
            <CardContent className="p-4">
              <Button
                className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-violet-600 hover:from-emerald-700 hover:to-violet-700 text-white"
                size="sm"
              >
                <Sparkles className="h-4 w-4" />
                Ask AI Tutor
              </Button>
              <p className="text-[11px] text-muted-foreground text-center mt-2">
                Get instant help with this lesson
              </p>
            </CardContent>
          </Card>

          {/* Download Resources */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Download className="h-4 w-4 text-amber-600" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {[
                { name: 'Lesson Slides', type: 'PDF', size: '2.1 MB' },
                { name: 'Code Examples', type: 'ZIP', size: '845 KB' },
                { name: 'Cheat Sheet', type: 'PDF', size: '1.3 MB' },
              ].map((res, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-colors text-left"
                >
                  <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/20 shrink-0">
                    <FileText className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground">{res.name}</p>
                    <p className="text-[11px] text-muted-foreground">{res.type} · {res.size}</p>
                  </div>
                  <Download className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
