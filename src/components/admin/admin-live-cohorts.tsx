'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
  differenceInSeconds,
  differenceInMinutes,
  addWeeks,
  startOfWeek as getStartOfWeek,
  endOfWeek as getEndOfWeek,
  isWithinInterval,
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
  Play,
  CheckCircle2,
  XCircle as XCircleIcon,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Zap,
  Timer,
  Activity,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

// Session status type
type SessionStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';

// Derive session status from event
function getSessionStatus(event: CalendarEvent): SessionStatus {
  if ((event as CalendarEvent & { status?: SessionStatus }).status === 'cancelled') return 'cancelled';
  const now = new Date();
  const start = parseISO(event.startDate);
  const end = parseISO(event.endDate);
  if (isBefore(end, now)) return 'completed';
  if (isAfter(start, now)) return 'upcoming';
  return 'live';
}

const statusConfig: Record<SessionStatus, { label: string; color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  upcoming: { label: 'Upcoming', color: '#3B82F6', bgColor: 'bg-blue-100 dark:bg-blue-950', icon: Clock },
  live: { label: 'Live Now', color: '#EF4444', bgColor: 'bg-red-100 dark:bg-red-950', icon: Zap },
  completed: { label: 'Completed', color: '#64748B', bgColor: 'bg-slate-100 dark:bg-slate-900', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: '#EF4444', bgColor: 'bg-red-100 dark:bg-red-950', icon: XCircleIcon },
};

// Duration options
const durationOptions = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' },
];

// Attendee name pool for avatar generation
const attendeeNames = [
  'AK', 'BJ', 'CL', 'DM', 'EN', 'FS', 'GT', 'HW', 'IR', 'JS',
  'KT', 'LM', 'MN', 'NO', 'PR', 'QS', 'RT', 'SU', 'TV', 'UW',
];

// Countdown Timer Component
function CountdownTimer({ targetDate, color }: { targetDate: string; color: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const target = parseISO(targetDate);
      const diffSeconds = differenceInSeconds(target, now);

      if (diffSeconds <= 0) {
        setTimeLeft('Starting now');
        setIsUrgent(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      setIsUrgent(diffSeconds < 900); // 15 minutes

      const days = Math.floor(diffSeconds / 86400);
      const hours = Math.floor((diffSeconds % 86400) / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);
      const seconds = diffSeconds % 60;

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateTimer();
    intervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [targetDate]);

  return (
    <motion.div
      className="flex items-center gap-1.5 text-xs font-mono"
      animate={isUrgent ? { scale: [1, 1.02, 1] } : {}}
      transition={isUrgent ? { duration: 0.8, repeat: Infinity } : {}}
    >
      <Timer className="h-3.5 w-3.5" style={{ color }} />
      <span className={isUrgent ? 'text-red-500 font-bold' : 'text-muted-foreground'}>
        {timeLeft}
      </span>
    </motion.div>
  );
}

// Attendee Avatars Component
function AttendeeAvatars({ attendees, maxAttendees }: { attendees: number; maxAttendees: number }) {
  const displayCount = Math.min(attendees, 5);
  const overflow = attendees - displayCount;
  const percent = Math.round((attendees / maxAttendees) * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {Array.from({ length: displayCount }).map((_, i) => (
          <Avatar key={i} className="h-6 w-6 border-2 border-background">
            <AvatarFallback className="text-[8px] font-medium" style={{ backgroundColor: presetColors[i % presetColors.length] + '30', color: presetColors[i % presetColors.length] }}>
              {attendeeNames[i]}
            </AvatarFallback>
          </Avatar>
        ))}
        {overflow > 0 && (
          <Avatar className="h-6 w-6 border-2 border-background">
            <AvatarFallback className="text-[8px] font-medium bg-muted text-muted-foreground">
              +{overflow}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      <div className="flex items-center gap-2 min-w-[100px]">
        <Progress value={percent} className="h-1.5 flex-1" />
        <span className="text-[10px] text-muted-foreground whitespace-nowrap font-medium">
          {attendees}/{maxAttendees}
        </span>
      </div>
    </div>
  );
}

// Form validation
interface FormErrors {
  title?: string;
  date?: string;
  time?: string;
  duration?: string;
  maxAttendees?: string;
}

export function AdminLiveCohorts() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>(demoCalendarEvents);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Schedule session form state
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    type: 'live_session',
    color: '#6366F1',
    isRecurring: false,
    recurrencePattern: 'weekly',
    maxAttendees: 50,
  });
  const [eventDate, setEventDate] = useState<Date>();
  const [startTime, setStartTime] = useState('10:00');
  const [duration, setDuration] = useState<number>(60);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Sort state for list view
  const [sortField, setSortField] = useState<'startDate' | 'title' | 'type' | 'attendees'>('startDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  // Quick Stats
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const weekStart = getStartOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = getEndOfWeek(now, { weekStartsOn: 1 });

    const sessionsThisMonth = events.filter((e) => {
      try {
        const start = parseISO(e.startDate);
        return isWithinInterval(start, { start: monthStart, end: monthEnd });
      } catch {
        return false;
      }
    }).length;

    const upcomingThisWeek = events.filter((e) => {
      try {
        const start = parseISO(e.startDate);
        return isAfter(start, now) && isWithinInterval(start, { start: weekStart, end: weekEnd });
      } catch {
        return false;
      }
    }).length;

    const totalAttendees = events.reduce((sum, e) => sum + (e.attendees || 0), 0);

    const withAttendees = events.filter((e) => e.attendees && e.maxAttendees);
    const avgAttendance = withAttendees.length === 0
      ? 0
      : Math.round(
          withAttendees.reduce((sum, e) => sum + ((e.attendees || 0) / (e.maxAttendees || 1)) * 100, 0) /
            withAttendees.length
        );

    return { sessionsThisMonth, upcomingThisWeek, totalAttendees, avgAttendance };
  }, [events]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};
    if (!newEvent.title?.trim()) errors.title = 'Title is required';
    if (!eventDate) errors.date = 'Date is required';
    if (!startTime) errors.time = 'Start time is required';
    if (duration <= 0) errors.duration = 'Duration must be positive';
    if (newEvent.maxAttendees && newEvent.maxAttendees < 1) errors.maxAttendees = 'At least 1 attendee required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [newEvent, eventDate, startTime, duration]);

  // Create event handler
  const handleCreateEvent = () => {
    if (!validateForm()) return;

    const startDate = new Date(eventDate!);
    const [sh, sm] = startTime.split(':').map(Number);
    startDate.setHours(sh, sm, 0);
    const endDate = addMinutes(startDate, duration);

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
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      setShowCreateDialog(false);
      resetForm();
    }, 1500);
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
    setDuration(60);
    setFormErrors({});
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

  // Check if event starts within 15 minutes
  const isStartingWithin15 = (event: CalendarEvent) => {
    const start = parseISO(event.startDate);
    const now = new Date();
    const fifteenMinFromNow = addMinutes(now, 15);
    return isAfter(start, now) && isBefore(start, fifteenMinFromNow);
  };

  // Check if event is currently live
  const isEventLive = (event: CalendarEvent) => {
    const now = new Date();
    const start = parseISO(event.startDate);
    const end = parseISO(event.endDate);
    return isBefore(start, now) && isAfter(end, now);
  };

  // Sort handler
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sorted events for list view
  const sortedEvents = useMemo(() => {
    const sorted = [...filteredEvents]
      .filter((e) => isAfter(parseISO(e.startDate), subMonths(new Date(), 1)))
      .sort((a, b) => {
        let cmp = 0;
        switch (sortField) {
          case 'startDate':
            cmp = parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime();
            break;
          case 'title':
            cmp = a.title.localeCompare(b.title);
            break;
          case 'type':
            cmp = a.type.localeCompare(b.type);
            break;
          case 'attendees':
            cmp = (a.attendees || 0) - (b.attendees || 0);
            break;
        }
        return sortDirection === 'asc' ? cmp : -cmp;
      });
    return sorted;
  }, [filteredEvents, sortField, sortDirection]);

  // Day detail popover
  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  // Sort icon helper
  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
    return sortDirection === 'asc'
      ? <ArrowUp className="h-3.5 w-3.5 text-foreground" />
      : <ArrowDown className="h-3.5 w-3.5 text-foreground" />;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Live Cohorts</h1>
          <p className="text-sm text-muted-foreground mt-1">Schedule and manage live sessions, workshops, and cohort events</p>
        </div>
        <Button onClick={() => { resetForm(); setShowCreateDialog(true); }} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
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

      {/* Quick Stats - 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-l-4 border-l-violet-500 hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-950 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.sessionsThisMonth}</p>
                <p className="text-xs text-muted-foreground">Sessions This Month</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.upcomingThisWeek}</p>
                <p className="text-xs text-muted-foreground">Upcoming This Week</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.avgAttendance}%</p>
                <p className="text-xs text-muted-foreground">Avg. Attendance Rate</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card className="border-l-4 border-l-rose-500 hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
                <Users className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalAttendees}</p>
                <p className="text-xs text-muted-foreground">Total Attendees</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="text-[10px] md:text-xs truncate rounded px-1 py-0.5 text-white font-medium leading-tight"
                          style={{ backgroundColor: event.color || eventTypeColors[event.type] }}
                          title={event.title}
                        >
                          {event.title}
                        </motion.div>
                      ))}
                      {overflow > 0 && (
                        <div className="text-[10px] md:text-xs text-muted-foreground font-medium px-1">
                          +{overflow} more
                        </div>
                      )}
                    </div>
                    {/* Dot indicators for small screens */}
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-1 md:hidden">
                        {dayEvents.slice(0, 5).map((event) => (
                          <div
                            key={event.id}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: event.color || eventTypeColors[event.type] }}
                          />
                        ))}
                      </div>
                    )}
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
                      <p className="text-sm text-muted-foreground">No sessions on this day</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedDayEvents.map((event) => {
                          const status = getSessionStatus(event);
                          const statusCfg = statusConfig[status];
                          const StatusIcon = statusCfg.icon;

                          return (
                            <motion.div
                              key={event.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:shadow-sm transition-shadow"
                            >
                              <div
                                className="w-1 h-12 rounded-full shrink-0"
                                style={{ backgroundColor: event.color || eventTypeColors[event.type] }}
                              />
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
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
                                  <Badge
                                    variant="secondary"
                                    className={`text-[10px] shrink-0 gap-1 ${statusCfg.bgColor}`}
                                    style={{ color: statusCfg.color }}
                                  >
                                    <StatusIcon className="h-3 w-3" />
                                    {statusCfg.label}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {format(parseISO(event.startDate), 'h:mm a')} – {format(parseISO(event.endDate), 'h:mm a')}
                                  {event.instructorName && ` · ${event.instructorName}`}
                                </p>
                                {/* Countdown for upcoming */}
                                {status === 'upcoming' && (
                                  <CountdownTimer targetDate={event.startDate} color={event.color || eventTypeColors[event.type]} />
                                )}
                                {/* Attendee avatars */}
                                {event.attendees !== undefined && event.maxAttendees && (
                                  <AttendeeAvatars attendees={event.attendees} maxAttendees={event.maxAttendees} />
                                )}
                                {/* Start Session button */}
                                {(isStartingWithin15(event) || isEventLive(event)) && event.meetingUrl && (
                                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 text-xs h-7 mt-1">
                                    <Play className="h-3 w-3" />
                                    {isEventLive(event) ? 'Join Live' : 'Start Session'}
                                  </Button>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Session Cards (Upcoming Sessions) - shown in both views */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Upcoming Sessions</h2>
          <Badge variant="secondary" className="text-xs">
            {events.filter((e) => isAfter(parseISO(e.startDate), new Date())).length} sessions
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredEvents
            .filter((e) => isAfter(parseISO(e.startDate), new Date()))
            .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime())
            .slice(0, 6)
            .map((event, index) => {
              const status = getSessionStatus(event);
              const statusCfg = statusConfig[status];
              const StatusIcon = statusCfg.icon;
              const courseName = demoCourses.find((c) => c.id === event.courseId)?.title;
              const canStart = isStartingWithin15(event) || isEventLive(event);

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border border-border">
                    {/* Color bar top */}
                    <div
                      className="h-1.5"
                      style={{ backgroundColor: event.color || eventTypeColors[event.type] }}
                    />
                    <CardContent className="p-4 space-y-3">
                      {/* Header: Status + Type */}
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className="text-[10px] gap-1"
                          style={{
                            backgroundColor: `${event.color || eventTypeColors[event.type]}20`,
                            color: event.color || eventTypeColors[event.type],
                          }}
                        >
                          {eventTypeLabels[event.type]}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] gap-1 ${statusCfg.bgColor}`}
                          style={{ color: statusCfg.color }}
                        >
                          {status === 'live' && <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
                          <StatusIcon className="h-3 w-3" />
                          {statusCfg.label}
                        </Badge>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-foreground text-sm leading-tight">{event.title}</h3>

                      {/* Date/Time */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {format(parseISO(event.startDate), 'EEE, MMM d · h:mm a')} – {format(parseISO(event.endDate), 'h:mm a')}
                        </span>
                      </div>

                      {/* Instructor */}
                      {event.instructorName && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <UserCheck className="h-3.5 w-3.5 shrink-0" />
                          <span>{event.instructorName}</span>
                        </div>
                      )}

                      {/* Countdown Timer */}
                      {(status === 'upcoming' || status === 'live') && (
                        <CountdownTimer targetDate={event.startDate} color={event.color || eventTypeColors[event.type]} />
                      )}

                      {/* Attendee Avatars + Progress */}
                      {event.attendees !== undefined && event.maxAttendees && (
                        <AttendeeAvatars attendees={event.attendees} maxAttendees={event.maxAttendees} />
                      )}

                      {/* Course Badge */}
                      {courseName && (
                        <Badge variant="outline" className="text-[10px]">
                          {courseName}
                        </Badge>
                      )}

                      {/* Actions */}
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {event.meetingUrl && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleCopyLink(event.meetingUrl!, event.id)}
                                  >
                                    {copiedId === event.id ? (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy Link</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <Edit3 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => handleCancelEvent(event.id)}
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Cancel</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {/* Start/Join Session Button */}
                        {canStart && event.meetingUrl ? (
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 text-xs h-7">
                            <Play className="h-3 w-3" />
                            {isEventLive(event) ? 'Join Live' : 'Start Session'}
                          </Button>
                        ) : event.meetingUrl ? (
                          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7" asChild>
                            <a href={event.meetingUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                              Link
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
        </div>
      </div>

      {/* List View (Table) */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="h-auto p-0 font-medium gap-1 hover:bg-transparent" onClick={() => handleSort('title')}>
                      Title <SortIcon field="title" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="h-auto p-0 font-medium gap-1 hover:bg-transparent" onClick={() => handleSort('type')}>
                      Type <SortIcon field="type" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="h-auto p-0 font-medium gap-1 hover:bg-transparent" onClick={() => handleSort('startDate')}>
                      Date/Time <SortIcon field="startDate" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="h-auto p-0 font-medium gap-1 hover:bg-transparent" onClick={() => handleSort('attendees')}>
                      Attendees <SortIcon field="attendees" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEvents.map((event, index) => {
                  const status = getSessionStatus(event);
                  const statusCfg = statusConfig[status];
                  const StatusIcon = statusCfg.icon;
                  const canStart = isStartingWithin15(event) || isEventLive(event);
                  const courseName = demoCourses.find((c) => c.id === event.courseId)?.title;

                  return (
                    <motion.tr
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="py-3">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] gap-1 ${statusCfg.bgColor}`}
                          style={{ color: statusCfg.color }}
                        >
                          {status === 'live' && <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
                          <StatusIcon className="h-3 w-3" />
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: event.color || eventTypeColors[event.type] }}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                            {courseName && (
                              <p className="text-[10px] text-muted-foreground truncate">{courseName}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p className="text-foreground">{format(parseISO(event.startDate), 'MMM d, yyyy')}</p>
                          <p className="text-muted-foreground">
                            {format(parseISO(event.startDate), 'h:mm a')} – {format(parseISO(event.endDate), 'h:mm a')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {event.attendees !== undefined && event.maxAttendees ? (
                          <div className="flex items-center gap-2">
                            <Progress
                              value={Math.round((event.attendees / event.maxAttendees) * 100)}
                              className="h-1.5 w-16"
                            />
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {event.attendees}/{event.maxAttendees}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canStart && event.meetingUrl && (
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1 text-xs h-7">
                              <Play className="h-3 w-3" />
                              Start
                            </Button>
                          )}
                          {event.meetingUrl && !canStart && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleCopyLink(event.meetingUrl!, event.id)}
                                  >
                                    {copiedId === event.id ? (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy Link</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <Edit3 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => handleCancelEvent(event.id)}
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Cancel</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Schedule Session Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => { if (!open) resetForm(); setShowCreateDialog(open); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-emerald-600" />
              Schedule New Session
            </DialogTitle>
            <DialogDescription>
              Create a new live session, workshop, or event for your cohorts.
            </DialogDescription>
          </DialogHeader>

          {/* Success Animation */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center justify-center py-8 gap-3"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                >
                  <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg font-semibold text-foreground"
                >
                  Session Scheduled!
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-muted-foreground"
                >
                  Your session has been added to the calendar.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {!showSuccess && (
            <div className="space-y-4 py-2">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="event-title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="event-title"
                  placeholder="e.g., React Live Q&A"
                  value={newEvent.title || ''}
                  onChange={(e) => {
                    setNewEvent((prev) => ({ ...prev, title: e.target.value }));
                    if (formErrors.title) setFormErrors((prev) => ({ ...prev, title: undefined }));
                  }}
                  className={formErrors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {formErrors.title && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.title}
                  </motion.p>
                )}
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
                  <Label>Type</Label>
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
                <Label>
                  Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${formErrors.date ? 'border-red-500' : ''} ${!eventDate && 'text-muted-foreground'}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {eventDate ? format(eventDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={eventDate}
                      onSelect={(date) => {
                        setEventDate(date);
                        if (formErrors.date) setFormErrors((prev) => ({ ...prev, date: undefined }));
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {formErrors.date && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.date}
                  </motion.p>
                )}
              </div>

              {/* Start Time & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">
                    Start Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      if (formErrors.time) setFormErrors((prev) => ({ ...prev, time: undefined }));
                    }}
                    className={formErrors.time ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                  {formErrors.time && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.time}
                    </motion.p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select
                    value={String(duration)}
                    onValueChange={(val) => setDuration(Number(val))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  className={formErrors.maxAttendees ? 'border-red-500' : ''}
                />
                {formErrors.maxAttendees && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.maxAttendees}
                  </motion.p>
                )}
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
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
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
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
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
          )}

          {!showSuccess && (
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleCreateEvent}
                disabled={!newEvent.title || !eventDate}
                className="bg-emerald-600 hover:bg-emerald-700 gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                Schedule Session
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
