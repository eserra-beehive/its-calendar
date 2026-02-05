"use client";

import { Clock, CalendarDays, BookOpen, AlertCircle } from "lucide-react";
import type { DashboardStats } from "@/lib/actions/lessons";

interface StatsBarProps {
  stats: DashboardStats;
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  subValue?: string;
  progress?: number;
  accent?: string;
}

function StatCard({
  icon,
  value,
  label,
  subValue,
  progress,
  accent = "#0047FF",
}: StatCardProps) {
  return (
    <div className="group bg-white border border-border rounded-xl p-5 hover:shadow-md hover:border-[#B0B0A8] transition-all duration-150">
      <div className="flex items-start justify-between">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg"
          style={{ backgroundColor: `${accent}14`, color: accent }}
        >
          {icon}
        </div>
        <div className="text-right">
          <p className="text-4xl font-extrabold text-foreground tracking-tighter">
            {value}
          </p>
          {subValue && (
            <p className="text-xs font-medium text-[#999990] mt-0.5">{subValue}</p>
          )}
        </div>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">{label}</p>
      {progress !== undefined && (
        <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full gauge-fill"
            style={{
              width: `${Math.min(progress, 100)}%`,
              background: `linear-gradient(90deg, ${accent}, ${accent}CC)`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export function StatsBar({ stats }: StatsBarProps) {
  const hoursProgress =
    stats.totalHours > 0
      ? Math.round((stats.deliveredHours / stats.totalHours) * 100)
      : 0;
  const remainingHours = Math.round(stats.totalHours - stats.deliveredHours);

  const formatExamDate = (date: Date) => {
    return new Intl.DateTimeFormat("it-IT", {
      day: "numeric",
      month: "short",
    }).format(date);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard
        icon={<Clock className="w-4.5 h-4.5" />}
        value={Math.round(stats.deliveredHours)}
        label="Ore Erogate"
        subValue={`${remainingHours}h rimanenti · ${hoursProgress}%`}
        progress={hoursProgress}
      />
      <StatCard
        icon={<CalendarDays className="w-4.5 h-4.5" />}
        value={stats.lessonsThisWeek}
        label="Lezioni Settimana"
        accent="#1A1A1A"
      />
      <StatCard
        icon={<BookOpen className="w-4.5 h-4.5" />}
        value={stats.activeModules}
        label="Moduli Attivi"
        accent="#1A1A1A"
      />
      <StatCard
        icon={<AlertCircle className="w-4.5 h-4.5" />}
        value={
          stats.nextExam ? formatExamDate(stats.nextExam.date) : "–"
        }
        label="Prossimo Esame"
        subValue={stats.nextExam?.moduleName ?? "Nessuno programmato"}
        accent="#D92626"
      />
    </div>
  );
}
