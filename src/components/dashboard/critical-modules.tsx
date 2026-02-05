"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ModuleWithHours } from "@/types";

interface CriticalModulesProps {
  modules: ModuleWithHours[];
  onModuleClick?: (moduleId: string) => void;
}

export function CriticalModules({ modules, onModuleClick }: CriticalModulesProps) {
  const criticalModules = modules.filter((m) => {
    const percentRemaining = (m.remainingHours / m.totalHours) * 100;
    return percentRemaining < 30 && percentRemaining > 0;
  });

  if (criticalModules.length === 0) {
    return (
      <div className="bg-white border border-neutral-100 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-neutral-300" />
          <span className="text-sm text-neutral-400">Nessun modulo critico</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-100 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <h3 className="font-serif text-sm text-neutral-900">Moduli Critici</h3>
      </div>

      <div className="space-y-2">
        {criticalModules.map((module) => {
          const percentRemaining = (module.remainingHours / module.totalHours) * 100;
          const isVeryCritical = percentRemaining < 15;
          const accentColor = isVeryCritical ? "#DC2626" : "#F59E0B";

          return (
            <button
              key={module.id}
              onClick={() => onModuleClick?.(module.id)}
              className="w-full text-left p-2.5 rounded-lg hover:bg-neutral-50 transition-all group"
              style={{ borderLeft: `3px solid ${accentColor}` }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-neutral-900 truncate group-hover:text-neutral-700">
                  {module.name}
                </p>
                <span
                  className="text-[0.6875rem] font-medium px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${accentColor}10`,
                    color: accentColor,
                  }}
                >
                  {Math.round(module.remainingHours)}h
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${100 - percentRemaining}%`,
                    background: `linear-gradient(90deg, ${accentColor}, ${accentColor}AA)`,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
