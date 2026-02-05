"use client";

import type { EventProps } from "react-big-calendar";
import { format } from "date-fns";

interface EventResource {
  lessonId: string;
  moduleId: string;
  moduleName: string;
  teacherId: string;
  teacherName: string;
  isInternal: boolean;
  isExam: boolean;
  hours: number;
  room?: string;
  notes?: string;
}

interface BigCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: EventResource;
}

/** Compact single-line chip for month view */
export function MonthEvent({ event }: EventProps<BigCalendarEvent>) {
  const { resource } = event;
  const isExam = resource?.isExam;
  const startTime = format(event.start, "HH:mm");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "0.6875rem",
        lineHeight: 1,
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: isExam ? "#D92626" : "#0047FF",
        }}
      />
      <span
        style={{
          fontWeight: 700,
          color: "#1A1A1A",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {event.title}
      </span>
      <span
        style={{
          flexShrink: 0,
          color: "#8A8A85",
          fontSize: "0.625rem",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {startTime}
      </span>
      {isExam && (
        <span
          style={{
            flexShrink: 0,
            fontSize: "0.5rem",
            fontWeight: 700,
            padding: "0 3px",
            borderRadius: "2px",
            background: "#D92626",
            color: "#FFF",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            lineHeight: "14px",
          }}
        >
          E
        </span>
      )}
    </div>
  );
}

/** Detailed multi-line chip for week/day view */
export function WeekDayEvent({ event }: EventProps<BigCalendarEvent>) {
  const { resource } = event;
  const isExam = resource?.isExam;
  const startTime = format(event.start, "HH:mm");
  const endTime = format(event.end, "HH:mm");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "2px",
        padding: "2px 0 2px 2px",
        height: "100%",
        fontSize: "0.6875rem",
        lineHeight: 1.3,
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <span
          style={{
            flexShrink: 0,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: isExam ? "#D92626" : "#0047FF",
            boxShadow: isExam
              ? "0 0 0 2px rgba(217, 38, 38, 0.15)"
              : "0 0 0 2px rgba(0, 71, 255, 0.15)",
          }}
        />
        <span
          style={{
            fontWeight: 700,
            color: "#1A1A1A",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {event.title}
        </span>
        {isExam && (
          <span
            style={{
              flexShrink: 0,
              fontSize: "0.5rem",
              fontWeight: 700,
              padding: "1px 4px",
              borderRadius: "3px",
              background: "#D92626",
              color: "#FFFFFF",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Esame
          </span>
        )}
      </div>
      <span
        style={{
          fontSize: "0.625rem",
          color: "#6B6B6B",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {startTime} – {endTime}
      </span>
      {resource?.teacherName && (
        <span
          style={{
            color: "#8A8A85",
            fontSize: "0.625rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {resource.teacherName}
        </span>
      )}
    </div>
  );
}
