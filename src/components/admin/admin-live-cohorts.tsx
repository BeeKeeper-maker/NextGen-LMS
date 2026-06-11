'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
  isAfter,
  isBefore,
  addMinutes,
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Calendar as CalendarIcon,
  List,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Video,
  Copy,
  Edit3,
  XCircle,
  ExternalLink,
  Filter,
  TrendingUp,
  UserCheck,
  CalendarDays,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { demoCalendarEvents, demoCourses } from '@/lib/mock-data';
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

const presetColors = [
  '#6366F1', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444',
  '#EC4899', '#14B8A6', '#F97316', '#64748B',
];

export function AdminLiveCohorts() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>(demoCalendarEvents);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create event form state
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    type: 'live_session',
    color: '#6366F1',
    isRecurring: false,
    recurrencePattern: 'weekly',
    maxAttendees: 50,
  });
  const [eventDate, setEventDate] = useState<Date>();
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:30');

  // Filtered events
  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return events;
    return events.filter((e) => e.type === filterType);
  }, [events, filterType]);

  // Calendar grid data
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  // Events for a specific day
  const getEventsForDay = useCallback(
    (day: Date) => {
      return filteredEvents.filter((event) => {
        try {
          const eventStart = parseISO(event.startDate);
          return isSameDay(eventStart, day);
        } catch {
          return false;
        }
      });
    },
    [filteredEvents]
  );

  // Stats
  const upcomingCount = events.filter((e) => isAfter(parseISO(e.startDate), new Date())).length;
  const totalAttendees = events.reduce((sum, e) => sum + (e.attendees || 0), 0);
  const avgAttendanceRate = useMemo(() => {
    const withAttendees = events.filter((e) => e.attendees && e.maxAttendees);
    if (withAttendees.length === 0) return 0;
    const total = withAttendees.reduce((sum, e) => sum + ((e.attendees || 0) / (e.maxAttendees || 1)) * 100, 0);
    return Math.round(total / withAttendees.length);
  }, [events]);

  // Create event handler
  const handleCreateEvent = () => {
    if (!newEvent.title || !eventDate) return;
    const startDate = new Date(eventDate);
    const [sh, sm] = startTime.split(':').map(Number);
    startDate.setHours(sh, sm, 0);
    const endDate = new Date(eventDate);
    const [eh, em] = endTime.split(':').map(Number);
    endDate.setHours(eh, em, 0);

    const created: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: newEvent.title || '',
      description: newEvent.description,
      type: (newEvent.type as CalendarEvent['type']) || 'live_session',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      courseId: newEvent.courseId,
      instructorName: newEvent.instructorName,
      meetingUrl: newEvent.meetingUrl,
      color: newEvent.color || '#6366F1',
      attendees: 0,
      maxAttendees: newEvent.maxAttendees,
      isRecurring: newEvent.isRecurring,
      recurrencePattern: newEvent.isRecurring ? newEvent.recurrencePattern : undefined,
    };
    setEvents((prev) => [...prev, created]);
    setShowCreateDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setNewEvent({
      type: 'live_session',
      color: '#6366F1',
      isRecurring: false,
      recurrencePattern: 'weekly',
      maxAttendees: 50,
    });
    setEventDate(undefined);
    setStartTime('10:00');
    setEndTime('11:30');
  };

  // Cancel event
  const handleCancelEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Copy meeting link
  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Check if event starts within 30 minutes
  const isStartingSoon = (event: CalendarEvent) => {
    const start = parseISO(event.startDate);
    const now = new Date();
    const thirtyMinFromNow = addMinutes(now, 30);
    return isAfter(start, now) && isBefore(start, thirtyMinFromNow);
  };

  // Day detail popover
  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Live Cohorts</h1>
          <p className="text-sm text-muted-foreground mt-1">Schedule and manage live sessions, workshops, and cohort events</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" />
          Schedule Session
        </Button>
      </div>

      {/* Top Bar: View Toggle + Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="gap-1.5"
            >
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-1.5"
            >
              <List className="h-4 w-4" />
              List
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Event Types</SelectItem>
              <SelectItem value="live_session">Live Session</SelectItem>
              <SelectItem value="cohort_start">Cohort Start</SelectItem>
              <SelectItem value="cohort_end">Cohort End</SelectItem>
              <SelectItem value="office_hours">Office Hours</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="webinar">Webinar</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-violet-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-950 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{upcomingCount}</p>
              <p className="text-xs text-muted-foreground">Upcoming Sessions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalAttendees}</p>
              <p className="text-xs text-muted-foreground">Total Attendees</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{avgAttendanceRate}%</p>
              <p className="text-xs text-muted-foreground">Avg. Attendance Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 md:p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold text-foreground">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Color Legend */}
            <div className="flex flex-wrap gap-3 mb-4">
              {Object.entries(eventTypeLabels).map(([type, label]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: eventTypeColors[type] }} />
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 border-t border-l border-border">
              {calendarDays.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isDayToday = isToday(day);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const maxVisible = 3;
                const overflow = dayEvents.length - maxVisible;

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`
                      min-h-[80px] md:min-h-[100px] p-1 md:p-2 border-r border-b border-border cursor-pointer transition-colors
                      ${!isCurrentMonth ? 'bg-muted/30' : 'bg-background hover:bg-muted/50'}
                      ${isSelected ? 'ring-2 ring-inset ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' : ''}
                    `}
                  >
                    <div className={`
                      text-xs md:text-sm font-medium mb-1 
                      ${!isCurrentMonth ? 'text-muted-foreground/50' : ''}
                      ${isDayToday ? 'bg-emerald-600 text-white rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center' : 'text-foreground'}
                    `}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, maxVisible).map((event) => (
                        <div
                          key={event.id}
                          className="text-[10px] md:text-xs truncate rounded px-1 py-0.5 text-white font-medium leading-tight"
                          style={{ backgroundColor: event.color || eventTypeColors[event.type] }}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {overflow > 0 && (
                        <div className="text-[10px] md:text-xs text-muted-foreground font-medium px-1">
                          +{overflow} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Day Detail */}
            <AnimatePresence>
              {selectedDay && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-foreground">
                        {format(selectedDay, 'EEEE, MMMM d, yyyy')}
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedDay(null)}>
                        Clear
                      </Button>
                    </div>
                    {selectedDayEvents.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No events on this day</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedDayEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center gap-3 p-2 rounded-md bg-background border border-border"
                          >
                            <div
                              className="w-1 h-10 rounded-full shrink-0"
                              style={{ backgroundColor: event.color || eventTypeColors[event.type] }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(parseISO(event.startDate), 'h:mm a')} – {format(parseISO(event.endDate), 'h:mm a')}
                                {event.instructorName && ` · ${event.instructorName}`}
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className="text-[10px] shrink-0"
                              style={{
                                backgroundColor: `${event.color || eventTypeColors[event.type]}20`,
                                color: event.color || eventTypeColors[event.type],
                              }}
                            >
                              {eventTypeLabels[event.type]}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredEvents
            .filter((e) => isAfter(parseISO(e.startDate), subMonths(new Date(), 1)))
            .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime())
            .map((event) => {
              const start = parseISO(event.startDate);
              const end = parseISO(event.endDate);
              const attendancePercent = event.attendees && event.maxAttendees
                ? Math.round((event.attendees / event.maxAttendees) * 100)
                : 0;
              const courseName = demoCourses.find((c) => c.id === event.courseId)?.title;
              const startingSoon = isStartingSoon(event);

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="overflow-hidden">
                    <div className="flex">
                      {/* Color bar */}
                      <div
                        className="w-1.5 shrink-0"
                        style={{ backgroundColor: event.color || eventTypeColors[event.type] }}
                      />
                      <CardContent className="flex-1 p-4 md:p-5">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                          {/* Event Info */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-foreground">{event.title}</h3>
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                                style={{
                                  backgroundColor: `${event.color || eventTypeColors[event.type]}20`,
                                  color: event.color || eventTypeColors[event.type],
                                }}
                              >
                                {eventTypeLabels[event.type]}
                              </Badge>
                              {startingSoon && (
                                <Badge className="bg-emerald-600 text-white text-[10px] gap-1">
                                  <span className="inline-block w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                  Starting Soon
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {format(start, 'EEE, MMM d · h:mm a')} – {format(end, 'h:mm a')}
                              </span>
                              {event.instructorName && (
                                <span className="flex items-center gap-1">
                                  <UserCheck className="h-3.5 w-3.5" />
                                  {event.instructorName}
                                </span>
                              )}
                            </div>
                            {/* Attendee progress */}
                            {event.attendees !== undefined && event.maxAttendees && (
                              <div className="flex items-center gap-3 max-w-xs">
                                <div className="flex-1">
                                  <Progress value={attendancePercent} className="h-1.5" />
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {event.attendees}/{event.maxAttendees}
                                </span>
                              </div>
                            )}
                            {courseName && (
                              <Badge variant="outline" className="text-[10px]">
                                {courseName}
                              </Badge>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {startingSoon && event.meetingUrl && (
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1 text-xs">
                                <Video className="h-3.5 w-3.5" />
                                Join
                              </Button>
                            )}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit Event</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleCancelEvent(event.id)}
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Cancel Event</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {event.meetingUrl && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleCopyLink(event.meetingUrl!, event.id)}
                                    >
                                      {copiedId === event.id ? (
                                        <span className="text-[10px] text-emerald-600 font-medium">Copied!</span>
                                      ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Copy Meeting Link</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
        </div>
      )}

      {/* Create Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-emerald-600" />
              Schedule New Session
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                placeholder="e.g., React Live Q&A"
                value={newEvent.title || ''}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="event-desc">Description</Label>
              <Textarea
                id="event-desc"
                placeholder="Describe the session..."
                value={newEvent.description || ''}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Event Type & Course */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select
                  value={newEvent.type}
                  onValueChange={(val) =>
                    setNewEvent((prev) => ({
                      ...prev,
                      type: val as CalendarEvent['type'],
                      color: eventTypeColors[val] || prev.color,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live_session">Live Session</SelectItem>
                    <SelectItem value="cohort_start">Cohort Start</SelectItem>
                    <SelectItem value="cohort_end">Cohort End</SelectItem>
                    <SelectItem value="office_hours">Office Hours</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="webinar">Webinar</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Course</Label>
                <Select
                  value={newEvent.courseId || 'none'}
                  onValueChange={(val) =>
                    setNewEvent((prev) => ({ ...prev, courseId: val === 'none' ? undefined : val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Course</SelectItem>
                    {demoCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {eventDate ? format(eventDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={eventDate}
                    onSelect={setEventDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Start/End Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Instructor & Meeting URL */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor Name</Label>
                <Input
                  id="instructor"
                  placeholder="e.g., Sarah Mitchell"
                  value={newEvent.instructorName || ''}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, instructorName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting-url">Meeting URL</Label>
                <Input
                  id="meeting-url"
                  placeholder="https://meet.example.com/..."
                  value={newEvent.meetingUrl || ''}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, meetingUrl: e.target.value }))}
                />
              </div>
            </div>

            {/* Max Attendees */}
            <div className="space-y-2">
              <Label htmlFor="max-attendees">Max Attendees</Label>
              <Input
                id="max-attendees"
                type="number"
                min={1}
                value={newEvent.maxAttendees || 50}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, maxAttendees: parseInt(e.target.value) || 50 }))}
              />
            </div>

            {/* Recurring */}
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label className="text-sm font-medium">Recurring Event</Label>
                <p className="text-xs text-muted-foreground">Repeat this session on a schedule</p>
              </div>
              <Switch
                checked={newEvent.isRecurring || false}
                onCheckedChange={(checked) =>
                  setNewEvent((prev) => ({ ...prev, isRecurring: checked }))
                }
              />
            </div>

            {newEvent.isRecurring && (
              <div className="space-y-2">
                <Label>Recurrence Pattern</Label>
                <Select
                  value={newEvent.recurrencePattern || 'weekly'}
                  onValueChange={(val) =>
                    setNewEvent((prev) => ({ ...prev, recurrencePattern: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Color Picker */}
            <div className="space-y-2">
              <Label>Event Color</Label>
              <div className="flex gap-2 flex-wrap">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newEvent.color === color ? 'border-foreground scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewEvent((prev) => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleCreateEvent}
              disabled={!newEvent.title || !eventDate}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Schedule Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
