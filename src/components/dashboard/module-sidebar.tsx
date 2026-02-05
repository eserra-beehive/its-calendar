"use client";

import { cn } from "@/lib/utils";
import type { ModuleWithHours } from "@/types";

interface ModuleSidebarProps {
  modules: ModuleWithHours[];
  selectedModuleId?: string;
  onSelectModule?: (moduleId: string | undefined) => void;
}

function getProgressColor(remaining: number, total: number): string {
  const percentage = (remaining / total) * 100;
  if (percentage > 50) return "bg-emerald-500";
  if (percentage > 25) return "bg-amber-500";
  return "bg-red-500";
}

function getProgressBgColor(remaining: number, total: number): string {
  const percentage = (remaining / total) * 100;
  if (percentage > 50) return "bg-emerald-500/10";
  if (percentage > 25) return "bg-amber-500/10";
  return "bg-red-500/10";
}

export function ModuleSidebar({
  modules,
  selectedModuleId,
  onSelectModule,
}: ModuleSidebarProps) {
  const totalHours = modules.reduce((sum, m) => sum + m.totalHours, 0);
  const deliveredHours = modules.reduce((sum, m) => sum + m.deliveredHours, 0);

  return (
    <aside className="no-print flex w-72 flex-col border-r bg-card">
      <div className="border-b p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Monte Ore
        </h2>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <span className="font-mono text-3xl font-bold tabular-nums">
              {deliveredHours}
            </span>
            <span className="text-lg text-muted-foreground">/{totalHours}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ore totali
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="gauge-fill h-full bg-primary transition-all"
            style={{ width: `${(deliveredHours / totalHours) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <button
          onClick={() => onSelectModule?.(undefined)}
          className={cn(
            "mb-2 w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
            !selectedModuleId
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:bg-secondary/50"
          )}
        >
          Tutti i moduli
        </button>

        <div className="space-y-1">
          {modules.map((module) => {
            const percentage = Math.round(
              (module.deliveredHours / module.totalHours) * 100
            );
            const isSelected = selectedModuleId === module.id;

            return (
              <button
                key={module.id}
                onClick={() => onSelectModule?.(module.id)}
                className={cn(
                  "group w-full rounded-md p-3 text-left transition-all",
                  isSelected
                    ? "bg-secondary ring-1 ring-border"
                    : "hover:bg-secondary/50"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {module.name}
                    </p>
                    {module.code && (
                      <p className="font-mono text-xs text-muted-foreground">
                        {module.code}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded px-1.5 py-0.5 font-mono text-xs font-medium",
                      getProgressBgColor(module.remainingHours, module.totalHours)
                    )}
                  >
                    {module.remainingHours}h
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn(
                        "gauge-fill h-full transition-all",
                        getProgressColor(module.remainingHours, module.totalHours)
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {module.deliveredHours}/{module.totalHours}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
