"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createLesson, updateLesson, deleteLesson } from "@/lib/actions";
import type { CalendarEvent, ModuleWithHours } from "@/types";

interface LessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modules: ModuleWithHours[];
  event?: CalendarEvent;
  defaultDate?: Date;
  defaultStartTime?: string;
  defaultEndTime?: string;
}

function calculateHours(start: string, end: string): number {
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  return Math.max(0, (endMinutes - startMinutes) / 60);
}

function formatDateForInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function LessonDialog({
  open,
  onOpenChange,
  modules,
  event,
  defaultDate,
  defaultStartTime,
  defaultEndTime,
}: LessonDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [moduleId, setModuleId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00");
  const [isExam, setIsExam] = useState(false);
  const [room, setRoom] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const isEditing = !!event;
  const selectedModule = modules.find((m) => m.id === moduleId);
  const hours = calculateHours(startTime, endTime);

  useEffect(() => {
    if (event) {
      setModuleId(event.extendedProps.moduleId);
      setDate(formatDateForInput(event.start));
      setStartTime(
        event.start.toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
      setEndTime(
        event.end.toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
      setIsExam(event.extendedProps.isExam);
      setRoom(event.extendedProps.room ?? "");
      setNotes(event.extendedProps.notes ?? "");
    } else {
      setModuleId("");
      setDate(defaultDate ? formatDateForInput(defaultDate) : "");
      setStartTime(defaultStartTime ?? "09:00");
      setEndTime(defaultEndTime ?? "13:00");
      setIsExam(false);
      setRoom("");
      setNotes("");
    }
    setError("");
  }, [event, defaultDate, defaultStartTime, defaultEndTime, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!moduleId || !date || !startTime || !endTime) {
      setError("Compila tutti i campi obbligatori");
      return;
    }

    if (hours <= 0) {
      setError("L'orario di fine deve essere successivo all'orario di inizio");
      return;
    }

    startTransition(async () => {
      const data = {
        moduleId,
        date: new Date(date),
        startTime,
        endTime,
        hours,
        isExam,
        room: room || undefined,
        notes: notes || undefined,
      };

      const result = isEditing
        ? await updateLesson(event.extendedProps.lessonId, data)
        : await createLesson(data);

      if (result.success) {
        onOpenChange(false);
      } else {
        setError(result.error ?? "Errore durante il salvataggio");
      }
    });
  };

  const handleDelete = () => {
    if (!event) return;

    startTransition(async () => {
      const result = await deleteLesson(event.extendedProps.lessonId);
      if (result.success) {
        onOpenChange(false);
      } else {
        setError(result.error ?? "Errore durante l'eliminazione");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifica Lezione" : "Nuova Lezione"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="module">Modulo</Label>
            <Select value={moduleId} onValueChange={setModuleId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un modulo" />
              </SelectTrigger>
              <SelectContent>
                {modules.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    <div className="flex items-center justify-between gap-4">
                      <span>{module.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {module.remainingHours}h rimanenti
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Ora inizio</Label>
              <Input
                id="startTime"
                type="time"
                step="60"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Ora fine</Label>
              <Input
                id="endTime"
                type="time"
                step="60"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {hours > 0 && (
            <p className="text-sm text-muted-foreground">
              Durata: <span className="font-mono font-medium">{hours}h</span>
              {selectedModule && (
                <>
                  {" "}
                  · Rimanenti dopo:{" "}
                  <span className="font-mono font-medium">
                    {selectedModule.remainingHours - hours}h
                  </span>
                </>
              )}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="room">Aula (opzionale)</Label>
            <Input
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Es. Aula 1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note (opzionale)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note aggiuntive"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isExam"
              checked={isExam}
              onCheckedChange={(checked) => setIsExam(checked === true)}
            />
            <Label htmlFor="isExam" className="cursor-pointer">
              Esame finale
            </Label>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                Elimina
              </Button>
            )}
            <Button type="submit" disabled={isPending} className="bg-neutral-900 hover:bg-neutral-800">
              {isPending ? "Salvataggio..." : isEditing ? "Aggiorna" : "Crea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
