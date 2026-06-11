# Task R4 - Build Live Cohort Calendar for Admin and Learner Views

## Agent: full-stack-developer
## Status: Completed

## Summary
Built comprehensive Live Cohort Calendar views for both Admin and Learner roles, integrated into the existing Next.js 16 LMS application.

## Files Created
- `src/components/admin/admin-live-cohorts.tsx` - Admin Live Cohorts view (calendar grid, list view, create event dialog)
- `src/components/learner/learner-live-cohorts.tsx` - Learner Live Cohorts view (live banner, upcoming sessions, weekly schedule, recordings)

## Files Modified
- `src/components/layout/app-layout.tsx` - Added imports and view map entries for both new views, added breadcrumb labels, fixed pre-existing set-state-in-effect lint error
- `src/components/layout/sidebar.tsx` - Updated icon from Video to CalendarDays for Live Cohorts nav items
- `src/components/landing/landing-page.tsx` - Added missing MessageCircle import, removed unused eslint-disable directive

## Key Features

### Admin Live Cohorts View
1. **Top Bar**: Schedule Session button, Calendar/List toggle, event type filter dropdown
2. **Stats Row**: 3 cards (Upcoming Sessions, Total Attendees, Avg Attendance Rate)
3. **Calendar View**: Custom monthly grid with day cells, colored event pills, today highlighting, "+N more" overflow, click-to-view-day-detail
4. **List View**: Chronological event cards with color-coded borders, type badges, attendee progress, action buttons (Edit, Cancel, Copy Link, Join)
5. **Create Event Dialog**: Full form with title, description, type selector, course selector, date picker, time inputs, instructor, meeting URL, max attendees, recurring toggle, color picker

### Learner Live Cohorts View
1. **Join Live Banner**: Emerald gradient card for live/starting-soon sessions
2. **Upcoming Sessions Tab**: Color-coded cards with RSVP toggle, Add to Calendar button
3. **My Schedule Tab**: Weekly view with Mon-Sun columns and hourly time slots
4. **Session Recordings Tab**: Mock past recordings with Watch Recording button

## Design
- Color scheme: slate/emerald/violet
- Event type colors: live_session (violet), cohort_start/end (emerald), office_hours (amber), workshop (blue), webinar (purple), deadline (red)
- Responsive: calendar simplifies on mobile, list adapts
- Uses shadcn/ui: Card, Button, Dialog, Input, Select, Badge, Calendar, Popover, Switch, Progress, Tooltip, Separator

## Lint Status
All checks pass cleanly with zero errors.
