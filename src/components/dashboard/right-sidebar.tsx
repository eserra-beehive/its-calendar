"use client";

import { ChevronDown, Filter } from "lucide-react";
import { useState } from "react";
import { UpcomingLessons } from "./upcoming-lessons";
import { CriticalModules } from "./critical-modules";
import type { ModuleWithHours } from "@/types";
import type { UpcomingLesson } from "@/lib/actions/lessons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface RightSidebarProps {
  modules: ModuleWithHours[];
  upcomingLessons: UpcomingLesson[];
  selectedModuleId?: string;
  onSelectModule?: (moduleId: string | undefined) => void;
}

export function RightSidebar({
  modules,
  upcomingLessons,
  selectedModuleId,
  onSelectModule,
}: RightSidebarProps) {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <aside className="w-80 shrink-0 flex flex-col gap-3 overflow-y-auto">
      <UpcomingLessons
        lessons={upcomingLessons}
        onLessonClick={(moduleId) => onSelectModule?.(moduleId)}
      />

      <CriticalModules
        modules={modules}
        onModuleClick={(moduleId) => onSelectModule?.(moduleId)}
      />

      {/* Module Filter */}
      <Collapsible open={filterOpen} onOpenChange={setFilterOpen}>
        <div className="bg-white border border-neutral-100 rounded-xl overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-3.5 hover:bg-neutral-50 transition-colors">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-neutral-300" />
                <span className="font-serif text-sm text-neutral-900">Filtro Moduli</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-neutral-300 transition-transform duration-200 ${
                  filterOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="px-2 pb-2 space-y-0.5 border-t border-neutral-50">
              <button
                onClick={() => onSelectModule?.(undefined)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors mt-1 ${
                  !selectedModuleId
                    ? "bg-[#0047FF]/5 text-[#0047FF] font-medium"
                    : "text-neutral-500 hover:bg-neutral-50"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${!selectedModuleId ? "bg-[#0047FF]" : "bg-neutral-200"}`} />
                Tutti i moduli
              </button>

              {modules.map((module) => {
                const isSelected = selectedModuleId === module.id;
                const progress = Math.round(module.totalHours - module.remainingHours);
                return (
                  <button
                    key={module.id}
                    onClick={() => onSelectModule?.(module.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                      isSelected
                        ? "bg-[#0047FF]/5 text-[#0047FF] font-medium"
                        : "text-neutral-500 hover:bg-neutral-50"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-[#0047FF]" : "bg-neutral-200"}`} />
                    <span className="flex-1 truncate text-left">{module.name}</span>
                    <span className="text-[0.6875rem] text-neutral-300" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {progress}/{module.totalHours}
                    </span>
                  </button>
                );
              })}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </aside>
  );
}
