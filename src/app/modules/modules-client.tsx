"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ModuleDialog } from "./module-dialog";
import { deleteModule } from "@/lib/actions";
import type { ModuleWithRelations, Teacher, Class } from "@/types";

interface ModulesClientProps {
  initialModules: ModuleWithRelations[];
  teachers: Teacher[];
  classes: Class[];
}

function getProgressColor(remaining: number, total: number): string {
  const percentage = (remaining / total) * 100;
  if (percentage > 50) return "bg-emerald-500";
  if (percentage > 25) return "bg-amber-500";
  return "bg-red-500";
}

export function ModulesClient({
  initialModules,
  teachers,
  classes,
}: ModulesClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleWithRelations>();
  const [isPending, startTransition] = useTransition();

  const handleEdit = (module: ModuleWithRelations) => {
    setSelectedModule(module);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo modulo?")) return;

    startTransition(async () => {
      await deleteModule(id);
    });
  };

  const handleAdd = () => {
    setSelectedModule(undefined);
    setDialogOpen(true);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Moduli</h1>
          <p className="text-sm text-neutral-500">
            Gestisci i moduli formativi e il monte ore
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 bg-neutral-900 hover:bg-neutral-800">
          <Plus className="h-4 w-4" />
          Nuovo Modulo
        </Button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-100">
          <span className="text-sm font-medium text-neutral-900">
            {initialModules.length} modul{initialModules.length === 1 ? "o" : "i"}
          </span>
        </div>

        {initialModules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-neutral-300" />
            <h3 className="mt-4 text-sm font-medium text-neutral-900">Nessun modulo</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Inizia aggiungendo il primo modulo formativo
            </p>
            <Button onClick={handleAdd} className="mt-4 gap-2 bg-neutral-900 hover:bg-neutral-800" size="sm">
              <Plus className="h-4 w-4" />
              Aggiungi Modulo
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50 hover:bg-neutral-50">
                <TableHead className="text-neutral-500 font-medium">Modulo</TableHead>
                <TableHead className="text-neutral-500 font-medium">Docente</TableHead>
                <TableHead className="text-neutral-500 font-medium">Classe</TableHead>
                <TableHead className="text-neutral-500 font-medium">Monte Ore</TableHead>
                <TableHead className="text-neutral-500 font-medium w-[100px]">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialModules.map((module) => {
                const deliveredHours = module.lessons.reduce(
                  (sum, l) => sum + l.hours,
                  0
                );
                const remainingHours = module.totalHours - deliveredHours;
                const percentage = Math.round(
                  (deliveredHours / module.totalHours) * 100
                );

                return (
                  <TableRow key={module.id} className="hover:bg-neutral-50">
                    <TableCell>
                      <div>
                        <span className="font-medium text-neutral-900">{module.name}</span>
                        {module.code && (
                          <span className="ml-2 font-mono text-xs text-neutral-400">
                            {module.code}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: module.teacher.color }}
                        />
                        <span className="text-neutral-700">{module.teacher.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-neutral-700">{module.class.name}</span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1 text-neutral-600">
                            <Clock className="h-3 w-3" />
                            <span className="font-mono">
                              {deliveredHours}/{module.totalHours}h
                            </span>
                          </span>
                          <span className={`font-mono text-xs ${
                            remainingHours <= module.totalHours * 0.25
                              ? "text-red-600 font-medium"
                              : "text-neutral-400"
                          }`}>
                            {remainingHours}h rimanenti
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className={`h-full transition-all ${getProgressColor(
                              remainingHours,
                              module.totalHours
                            )}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(module)}
                          title="Modifica"
                          className="h-8 w-8 hover:bg-neutral-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(module.id)}
                          disabled={isPending || module.lessons.length > 0}
                          title="Elimina"
                          className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <ModuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        module={selectedModule}
        teachers={teachers}
        classes={classes}
      />
    </div>
  );
}
