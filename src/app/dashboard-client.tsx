"use client";

import { useState, useCallback } from "react";
import {
  Header,
  CalendarView,
  LessonDialog,
  StatsBar,
  RightSidebar,
} from "@/components/dashboard";
import type { CalendarEvent, ModuleWithHours } from "@/types";
import type { DashboardStats, UpcomingLesson } from "@/lib/actions/lessons";

interface DashboardClientProps {
  initialEvents: CalendarEvent[];
  initialModules: ModuleWithHours[];
  stats: DashboardStats;
  upcomingLessons: UpcomingLesson[];
}

export function DashboardClient({
  initialEvents,
  initialModules,
  stats,
  upcomingLessons,
}: DashboardClientProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent>();
  const [defaultDate, setDefaultDate] = useState<Date>();
  const [defaultStartTime, setDefaultStartTime] = useState<string>();
  const [defaultEndTime, setDefaultEndTime] = useState<string>();

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setDefaultDate(undefined);
    setDefaultStartTime(undefined);
    setDefaultEndTime(undefined);
    setDialogOpen(true);
  };

  const handleDateSelect = (start: Date, end: Date) => {
    setSelectedEvent(undefined);
    setDefaultDate(start);
    setDefaultStartTime(
      start.toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    );
    setDefaultEndTime(
      end.toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    );
    setDialogOpen(true);
  };

  const handleNewLesson = useCallback(() => {
    setSelectedEvent(undefined);
    setDefaultDate(new Date());
    setDefaultStartTime("09:00");
    setDefaultEndTime("13:00");
    setDialogOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header onNewLesson={handleNewLesson} />

      <div className="px-6 py-6 space-y-6">
        <StatsBar stats={stats} />

        <div className="flex gap-6">
          <main className="flex-1 min-w-0 bg-white border border-border rounded-xl shadow-sm">
            <CalendarView
              events={initialEvents}
              selectedModuleId={selectedModuleId}
              onEventClick={handleEventClick}
              onDateSelect={handleDateSelect}
            />
          </main>

          <RightSidebar
            modules={initialModules}
            upcomingLessons={upcomingLessons}
            selectedModuleId={selectedModuleId}
            onSelectModule={setSelectedModuleId}
          />
        </div>
      </div>

      <LessonDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        modules={initialModules}
        event={selectedEvent}
        defaultDate={defaultDate}
        defaultStartTime={defaultStartTime}
        defaultEndTime={defaultEndTime}
      />
    </div>
  );
}
