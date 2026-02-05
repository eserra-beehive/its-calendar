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
import { createTeacher, updateTeacher } from "@/lib/actions";
import type { TeacherWithModules } from "@/types";

interface TeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher?: TeacherWithModules;
}

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#6366f1",
];

export function TeacherDialog({
  open,
  onOpenChange,
  teacher,
}: TeacherDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isInternal, setIsInternal] = useState(true);
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState("");

  const isEditing = !!teacher;

  useEffect(() => {
    if (teacher) {
      setName(teacher.name);
      setEmail(teacher.email);
      setPhone(teacher.phone ?? "");
      setIsInternal(teacher.isInternal);
      setColor(teacher.color);
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setIsInternal(true);
      setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }
    setError("");
  }, [teacher, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email) {
      setError("Nome e email sono obbligatori");
      return;
    }

    startTransition(async () => {
      const data = {
        name,
        email,
        phone: phone || undefined,
        isInternal,
        color,
      };

      const result = isEditing
        ? await updateTeacher(teacher.id, data)
        : await createTeacher(data);

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
            {isEditing ? "Modifica Docente" : "Nuovo Docente"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mario Rossi"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mario.rossi@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefono (opzionale)</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+39 123 456 7890"
            />
          </div>

          <div className="space-y-2">
            <Label>Colore</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full transition-transform ${
                    color === c ? "scale-110 ring-2 ring-offset-2 ring-primary" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isInternal"
              checked={isInternal}
              onCheckedChange={(checked) => setIsInternal(checked === true)}
            />
            <Label htmlFor="isInternal" className="cursor-pointer">
              Docente interno
            </Label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="bg-neutral-900 hover:bg-neutral-800">
              {isPending ? "Salvataggio..." : isEditing ? "Aggiorna" : "Crea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
