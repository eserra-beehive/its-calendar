"use client";

import { useState, useMemo, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views, type View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { it } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { MonthEvent, WeekDayEvent } from "./calendar-events";
import type { CalendarEvent } from "@/types";

const locales = { "it-IT": it };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface BigCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: CalendarEvent["extendedProps"];
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateSelect?: (start: Date, end: Date) => void;
  selectedModuleId?: string;
}

const messages = {
  today: "Oggi",
  previous: "←",
  next: "→",
  month: "Mese",
  week: "Settimana",
  day: "Giorno",
  agenda: "Agenda",
  date: "Data",
  time: "Ora",
  event: "Evento",
  noEventsInRange: "Nessun evento in questo periodo",
  showMore: (count: number) => `+${count} altri`,
};

export function CalendarView({
  events,
  onEventClick,
  onDateSelect,
  selectedModuleId,
}: CalendarViewProps) {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const filteredEvents = selectedModuleId
    ? events.filter((e) => e.extendedProps.moduleId === selectedModuleId)
    : events;

  const calendarEvents: BigCalendarEvent[] = useMemo(
    () =>
      filteredEvents.map((event) => ({
        id: String(event.id),
        title: event.title,
        start: typeof event.start === "string" ? new Date(event.start) : event.start,
        end: typeof event.end === "string" ? new Date(event.end) : event.end,
        resource: event.extendedProps,
      })),
    [filteredEvents]
  );

  const handleSelectEvent = useCallback(
    (event: BigCalendarEvent) => {
      const original = events.find((e) => String(e.id) === event.id);
      if (original && onEventClick) {
        onEventClick(original);
      }
    },
    [events, onEventClick]
  );

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date }) => {
      if (onDateSelect) {
        onDateSelect(slotInfo.start, slotInfo.end);
      }
    },
    [onDateSelect]
  );

  const eventPropGetter = useCallback((event: BigCalendarEvent) => {
    const isExam = event.resource?.isExam;
    return {
      className: isExam ? "rbc-event--exam" : "rbc-event--lesson",
    };
  }, []);

  return (
    <div className="rbc-wrapper">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        selectable
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        eventPropGetter={eventPropGetter}
        components={{
          month: { event: MonthEvent },
          event: WeekDayEvent,
        }}
        messages={messages}
        culture="it-IT"
        min={new Date(2000, 0, 1, 8, 0)}
        max={new Date(2000, 0, 1, 20, 0)}
        step={30}
        timeslots={2}
        popup
      />
    </div>
  );
}
