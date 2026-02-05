"use client";

import { CalendarDays } from "lucide-react";
import type { UpcomingLesson } from "@/lib/actions/lessons";

interface UpcomingLessonsProps {
  lessons: UpcomingLesson[];
  onLessonClick?: (moduleId: string) => void;
}

export function UpcomingLessons({ lessons, onLessonClick }: UpcomingLessonsProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("it-IT", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(date);
  };

  if (lessons.length === 0) {
    return (
      <div className="bg-white border border-neutral-100 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="w-4 h-4 text-neutral-300" />
          <h3 className="font-serif text-sm text-neutral-900">Prossime Lezioni</h3>
        </div>
        <p className="text-sm text-neutral-400 text-center py-4">
          Nessuna lezione programmata
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-100 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="w-4 h-4 text-[#0047FF]" />
        <h3 className="font-serif text-sm text-neutral-900">Prossime Lezioni</h3>
      </div>

      <div className="relative">
        <div className="absolute left-[5px] top-3 bottom-3 w-px bg-gradient-to-b from-[#0047FF]/30 to-neutral-100" />

        <div className="space-y-0.5">
          {lessons.map((lesson, index) => (
            <button
              key={lesson.id}
              onClick={() => onLessonClick?.(lesson.moduleId)}
              className="relative w-full text-left pl-5 pr-2 py-2 rounded-lg hover:bg-neutral-50 transition-all group hover:translate-x-0.5"
            >
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-[11px] h-[11px] rounded-full ring-2 ring-white ${
                  lesson.isExam
                    ? "bg-red-500 shadow-[0_0_0_2px_rgba(220,38,38,0.15)]"
                    : index === 0
                      ? "bg-[#0047FF] shadow-[0_0_0_2px_rgba(0,102,255,0.15)]"
                      : "bg-neutral-200"
                }`}
              />

              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-900 truncate group-hover:text-[#0047FF] transition-colors">
                    {lesson.moduleName}
                  </p>
                  <p className="text-[0.6875rem] text-neutral-400 truncate">
                    {lesson.teacherName}
                    {lesson.room && ` · ${lesson.room}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[0.6875rem] font-medium text-neutral-500">
                    {formatDate(lesson.date)}
                  </p>
                  <p className="text-[0.6875rem] text-neutral-400" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {lesson.startTime}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
