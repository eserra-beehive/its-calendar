import { Suspense } from "react";
import {
  getLessonsForCalendar,
  getModulesWithHours,
  getDashboardStats,
  getUpcomingLessons,
} from "@/lib/actions";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [events, modules, stats, upcomingLessons] = await Promise.all([
    getLessonsForCalendar(),
    getModulesWithHours(),
    getDashboardStats(),
    getUpcomingLessons(5),
  ]);

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient
        initialEvents={events}
        initialModules={modules}
        stats={stats}
        upcomingLessons={upcomingLessons}
      />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="h-14 border-b bg-card" />
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
        <div className="flex gap-4">
          <div className="flex-1 h-[600px] animate-pulse rounded-2xl bg-card" />
          <div className="w-80 space-y-4">
            <div className="h-64 animate-pulse rounded-2xl bg-card" />
            <div className="h-48 animate-pulse rounded-2xl bg-card" />
          </div>
        </div>
      </div>
    </div>
  );
}
