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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createModule, updateModule, createClass } from "@/lib/actions";
import type { ModuleWithRelations, Teacher, Class } from "@/types";

interface ModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module?: ModuleWithRelations;
  teachers: Teacher[];
  classes: Class[];
}

export function ModuleDialog({
  open,
  onOpenChange,
  module,
  teachers,
  classes,
}: ModuleDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [totalHours, setTotalHours] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [classId, setClassId] = useState("");
  const [error, setError] = useState("");

  const isEditing = !!module;

  useEffect(() => {
    if (module) {
      setName(module.name);
      setCode(module.code ?? "");
      setTotalHours(module.totalHours.toString());
      setTeacherId(module.teacherId);
      setClassId(module.classId);
    } else {
      setName("");
      setCode("");
      setTotalHours("");
      setTeacherId("");
      setClassId(classes[0]?.id ?? "");
    }
    setError("");
  }, [module, classes, open]);

  useEffect(() => {
    if (classes.length === 0 && open) {
      startTransition(async () => {
        await createClass({ name: "Classe Principale", isActive: true });
      });
    }
  }, [classes.length, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !totalHours || !teacherId || !classId) {
      setError("Compila tutti i campi obbligatori");
      return;
    }

    const hours = parseInt(totalHours, 10);
    if (isNaN(hours) || hours <= 0) {
      setError("Le ore totali devono essere un numero positivo");
      return;
    }

    startTransition(async () => {
      const data = {
        name,
        code: code || undefined,
        totalHours: hours,
        teacherId,
        classId,
      };

      const result = isEditing
        ? await updateModule(module.id, data)
        : await createModule(data);

      if (result.success) {
        onOpenChange(false);
      } else {
        setError(result.error ?? "Errore durante il salvataggio");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifica Modulo" : "Nuovo Modulo"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Modulo</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cloud Computing"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Codice (opzionale)</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="MOD-001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalHours">Monte Ore Totale</Label>
            <Input
              id="totalHours"
              type="number"
              min="1"
              value={totalHours}
              onChange={(e) => setTotalHours(e.target.value)}
              placeholder="40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher">Docente</Label>
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un docente" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: teacher.color }}
                      />
                      {teacher.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {teachers.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Aggiungi prima un docente dalla sezione Docenti
              </p>
            )}
          </div>

          {classes.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="class">Classe</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona una classe" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isPending || teachers.length === 0} className="bg-neutral-900 hover:bg-neutral-800">
              {isPending ? "Salvataggio..." : isEditing ? "Aggiorna" : "Crea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
