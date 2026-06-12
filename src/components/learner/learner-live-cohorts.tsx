'use client';

import { useState, useMemo } from 'react';
import {
  format,
  parseISO,
  isAfter,
  isBefore,
  addMinutes,
  startOfWeek,
  addDays,
  differenceInMinutes,
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Clock,
  Users,
  MapPin,
  CalendarPlus,
  CheckCircle2,
  Play,
  Eye,
  Radio,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCourses, useLiveCohorts, useLiveCohortRSVPs, useToggleRSVP } from '@/hooks/use-data';
import { useAppStore } from '@/store/app-store';
import type { CalendarEvent } from '@/types';

// Event type color mapping
const eventTypeColors: Record<string, string> = {
  live_session: '#6366F1',
  cohort_start: '#10B981',
  cohort_end: '#10B981',
  office_hours: '#F59E0B',
  workshop: '#3B82F6',
  webinar: '#8B5CF6',
  deadline: '#EF4444',
};

const eventTypeLabels: Record<string, string> = {
  live_session: 'Live Session',
  cohort_start: 'Cohort Start',
  cohort_end: 'Cohort End',
  office_hours: 'Office Hours',
  workshop: 'Workshop',
  webinar: 'Webinar',
  deadline: 'Deadline',
};

// Session recording display type derived from completed cohorts
interface SessionRecording {
  id: string;
  title: string;
  date: string;
  duration: number;
  instructor: string;
  views: number;
  courseId?: string;
}

/** Map a completed live cohort to a session recording display object */
function mapCohortToRecording(cohort: any): SessionRecording {
  const start = new Date(cohort.startDate);
  const end = new Date(cohort.endDate);
  const duration = Math.round(differenceInMinutes(end, start));
  return {
    id: cohort.id,
    title: cohort.title,
    date: cohort.startDate,
    duration,
    instructor: cohort.instructorName || 'Unknown',
    views: cohort.attendees || 0,
    courseId: cohort.courseId,
  };
}

export function LearnerLiveCohorts() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'schedule' | 'recordings'>('upcoming');
  const currentUser = useAppStore((s) => s.currentUser);
  const tenantId = useAppStore((s) => s.currentTenant?.id) || '';
  const { data: coursesData } = useCourses(tenantId || undefined);
  const { data: cohortsData, isLoading: cohortsLoading } = useLiveCohorts(tenantId || undefined);
  const { data: rsvpsData } = useLiveCohortRSVPs(currentUser?.id || undefined);
  const toggleRSVP = useToggleRSVP();
  const demoCourses = coursesData || [];

  // Derive RSVP set from API data
  const rsvpIds = useMemo(() => {
    if (!rsvpsData) return new Set<string>();
    return new Set(
      (rsvpsData as any[])
        .filter((r) => r.status === 'going')
        .map((r) => r.cohortId)
    );
  }, [rsvpsData]);

  // Map API cohort data to CalendarEvent format (API already returns CalendarEvent-like shape)
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    if (!cohortsData) return [];
    return (cohortsData as any[]).map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      type: c.type || c.category || 'live_session',
      startDate: c.startDate,
      endDate: c.endDate,
      courseId: c.courseId,
      instructorName: c.instructorName,
      meetingUrl: c.meetingUrl,
      color: c.color,
      attendees: c.attendees,
      maxAttendees: c.maxAttendees,
    }));
  }, [cohortsData]);

  // Derive session recordings from completed cohorts
  const sessionRecordings: SessionRecording[] = useMemo(() => {
    if (!cohortsData) return [];
    return (cohortsData as any[])
      .filter((c) => c.status === 'completed')
      .map(mapCohortToRecording);
  }, [cohortsData]);

  // Check for live/starting-soon sessions
  const liveSessions = useMemo(() => {
    const now = new Date();
    return calendarEvents.filter((event) => {
      const start = parseISO(event.startDate);
      const end = parseISO(event.endDate);
      // Currently live or starting within 30 min
      return (isBefore(start, addMinutes(now, 30)) && isAfter(end, now)) || 
             (isAfter(start, now) && isBefore(start, addMinutes(now, 30)));
    });
  }, [calendarEvents]);

  // Upcoming events (future only, not completed)
  const upcomingEvents = useMemo(() => {
    return calendarEvents
      .filter((e) => isAfter(parseISO(e.startDate), new Date()))
      .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());
  }, [calendarEvents]);

  // Weekly schedule data (current week)
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const weekEvents = useMemo(() => {
    return calendarEvents.filter((event) => {
      const start = parseISO(event.startDate);
      return weekDays.some((day) => format(day, 'yyyy-MM-dd') === format(start, 'yyyy-MM-dd'));
    });
  }, [calendarEvents, weekDays]);

  // RSVP toggle - backed by API
  const handleToggleRsvp = (cohortId: string) => {
    if (!currentUser?.id || !tenantId) return;

    const isRsvp = rsvpIds.has(cohortId);
    toggleRSVP.mutate({
      cohortId,
      userId: currentUser.id,
      tenantId,
      status: isRsvp ? 'cancelled' : 'going',
    });
  };

  // Time slots for weekly view (8am - 9pm)
  const timeSlots = Array.from({ length: 14 }, (_, i) => i + 8);

  // Loading state
  if (cohortsLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Live Cohorts</h1>
          <p className="text-sm text-muted-foreground mt-1">Join live sessions, attend workshops, and never miss an event</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="ml-3 text-muted-foreground">Loading cohorts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Live Cohorts</h1>
        <p className="text-sm text-muted-foreground mt-1">Join live sessions, attend workshops, and never miss an event</p>
      </div>

      {/* Join Live Banner */}
      <AnimatePresence>
        {liveSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {liveSessions.map((session) => {
              const isLive = isBefore(parseISO(session.startDate), new Date()) && isAfter(parseISO(session.endDate), new Date());
              return (
                <Card key={session.id} className="bg-gradient-to-r from-emerald-600 to-emerald-700 border-0 text-white overflow-hidden">
                  <CardContent className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                        <Radio className="h-3.5 w-3.5 animate-pulse" />
                        <span className="text-xs font-bold uppercase">
                          {isLive ? 'LIVE NOW' : 'STARTING SOON'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{session.title}</p>
                        <p className="text-emerald-100 text-sm">
                          {session.attendees && `${session.attendees} attendees joined`}
                          {session.instructorName && ` · ${session.instructorName}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.meetingUrl && (
                        <Button
                          className="bg-white text-emerald-700 hover:bg-emerald-50 gap-1.5 font-semibold"
                          size="sm"
                          onClick={() => window.open(session.meetingUrl, '_blank')}
                        >
                          <Video className="h-4 w-4" />
                          Join Session
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 w-fit">
        {(['upcoming', 'schedule', 'recordings'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab)}
            className="capitalize"
          >
            {tab === 'upcoming' && <Clock className="h-3.5 w-3.5 mr-1.5" />}
            {tab === 'schedule' && <CalendarPlus className="h-3.5 w-3.5 mr-1.5" />}
            {tab === 'recordings' && <Play className="h-3.5 w-3.5 mr-1.5" />}
            {tab}
          </Button>
        ))}
      </div>

      {/* Upcoming Sessions Tab */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingEvents.map((event, idx) => {
            const start = parseISO(event.startDate);
            const end = parseISO(event.endDate);
            const color = event.color || eventTypeColors[event.type];
            const courseName = demoCourses.find((c: any) => c.id === event.courseId)?.title;
            const isRsvp = rsvpIds.has(event.id);
            const spotsRemaining = event.maxAttendees ? event.maxAttendees - (event.attendees || 0) : null;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex">
                    {/* Color bar */}
                    <div className="w-1.5 shrink-0" style={{ backgroundColor: color }} />
                    <CardContent className="flex-1 p-4 md:p-5">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                        {/* Event Info */}
                        <div className="flex-1 space-y-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground text-base">{event.title}</h3>
                            <Badge
                              variant="secondary"
                              className="text-[10px]"
                              style={{ backgroundColor: `${color}20`, color }}
                            >
                              {eventTypeLabels[event.type]}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Clock className="h-3.5 w-3.5" />
                              {format(start, 'EEEE, MMM d')}
                              <span className="text-foreground/60">·</span>
                              {format(start, 'h:mm a')} – {format(end, 'h:mm a')}
                            </span>
                            {event.instructorName && (
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                {event.instructorName}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {courseName && (
                              <Badge variant="outline" className="text-[10px]">
                                {courseName}
                              </Badge>
                            )}
                            {event.attendees !== undefined && event.maxAttendees && (
                              <div className="flex items-center gap-2">
                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {event.attendees}/{event.maxAttendees} attending
                                </span>
                                {spotsRemaining !== null && spotsRemaining > 0 && (
                                  <span className="text-[10px] text-emerald-600 font-medium">
                                    {spotsRemaining} spots left
                                  </span>
                                )}
                                {spotsRemaining !== null && spotsRemaining <= 0 && (
                                  <span className="text-[10px] text-red-500 font-medium">Full</span>
                                )}
                              </div>
                            )}
                          </div>

                          {event.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant={isRsvp ? 'default' : 'outline'}
                            className={isRsvp ? 'bg-emerald-600 hover:bg-emerald-700 gap-1.5' : 'gap-1.5'}
                            onClick={() => handleToggleRsvp(event.id)}
                            disabled={toggleRSVP.isPending}
                          >
                            {toggleRSVP.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : isRsvp ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Going
                              </>
                            ) : (
                              'RSVP'
                            )}
                          </Button>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => {
                                  const start = parseISO(event.startDate);
                                  const end = parseISO(event.endDate);
                                  const pad = (n: number) => n.toString().padStart(2, '0');
                                  const formatDate = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
                                  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${formatDate(start)}\nDTEND:${formatDate(end)}\nSUMMARY:${event.title}\nDESCRIPTION:${event.description || ''}\nLOCATION:${event.meetingUrl || ''}\nEND:VEVENT\nEND:VCALENDAR`;
                                  const blob = new Blob([ics], { type: 'text/calendar' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `${event.title.replace(/\s+/g, '-')}.ics`;
                                  a.click();
                                  URL.revokeObjectURL(url);
                                }}>
                                  <CalendarPlus className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Add to Calendar</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {upcomingEvents.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No upcoming sessions at the moment</p>
                <p className="text-xs text-muted-foreground mt-1">Check back soon for new events!</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* My Schedule Tab */}
      {activeTab === 'schedule' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarPlus className="h-4 w-4 text-emerald-600" />
              This Week&apos;s Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Day headers */}
              <div className="grid grid-cols-8 border-b border-border">
                <div className="p-2 text-xs text-muted-foreground font-medium">Time</div>
                {weekDays.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`p-2 text-center text-xs font-medium ${
                      format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <div>{format(day, 'EEE')}</div>
                    <div className="text-sm font-semibold text-foreground">{format(day, 'd')}</div>
                  </div>
                ))}
              </div>

              {/* Time rows */}
              {timeSlots.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-border last:border-b-0">
                  <div className="p-2 text-[10px] text-muted-foreground border-r border-border">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </div>
                  {weekDays.map((day) => {
                    const dayEvents = weekEvents.filter((event) => {
                      const start = parseISO(event.startDate);
                      return (
                        format(start, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') &&
                        start.getHours() === hour
                      );
                    });

                    return (
                      <div
                        key={day.toISOString() + '-' + hour}
                        className="p-1 min-h-[48px] border-r border-border last:border-r-0"
                      >
                        {dayEvents.map((event) => {
                          const color = event.color || eventTypeColors[event.type];
                          const duration = differenceInMinutes(parseISO(event.endDate), parseISO(event.startDate));
                          return (
                            <TooltipProvider key={event.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className="text-[10px] rounded px-1 py-0.5 text-white font-medium truncate cursor-pointer"
                                    style={{
                                      backgroundColor: color,
                                      minHeight: duration > 90 ? '40px' : '24px',
                                    }}
                                  >
                                    {event.title}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  <p className="font-medium">{event.title}</p>
                                  <p className="text-xs">
                                    {format(parseISO(event.startDate), 'h:mm a')} – {format(parseISO(event.endDate), 'h:mm a')}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}

              {weekEvents.length === 0 && (
                <div className="py-12 text-center">
                  <CalendarPlus className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No events scheduled this week</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Recordings Tab */}
      {activeTab === 'recordings' && (
        <div className="space-y-3">
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Play className="h-5 w-5 text-violet-600" />
              <div>
                <p className="text-sm font-medium text-foreground">Session Recordings</p>
                <p className="text-xs text-muted-foreground">Catch up on past sessions you missed</p>
              </div>
            </CardContent>
          </Card>

          {sessionRecordings.length > 0 ? (
            sessionRecordings.map((recording, idx) => {
              const courseName = demoCourses.find((c: any) => c.id === recording.courseId)?.title;
              return (
                <motion.div
                  key={recording.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Recording Info */}
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-lg bg-violet-100 dark:bg-violet-950 flex items-center justify-center shrink-0">
                            <Play className="h-5 w-5 text-violet-600" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-semibold text-foreground text-sm">{recording.title}</h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                              <span>{format(parseISO(recording.date), 'MMM d, yyyy')}</span>
                              <span>·</span>
                              <span>{recording.duration} min</span>
                              <span>·</span>
                              <span>{recording.instructor}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {courseName && (
                                <Badge variant="outline" className="text-[10px]">
                                  {courseName}
                                </Badge>
                              )}
                              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Eye className="h-3 w-3" />
                                {recording.views} attendees
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Watch Button */}
                        <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={() => {
                          const recordingUrl = `/api/live-cohorts/${recording.id}`;
                          window.open(recordingUrl, '_blank');
                        }}>
                          <Play className="h-3.5 w-3.5" />
                          Watch Recording
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Play className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No session recordings available yet</p>
                <p className="text-xs text-muted-foreground mt-1">Recordings will appear here after live sessions are completed</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
