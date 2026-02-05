"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Mail, UserCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeacherDialog } from "./teacher-dialog";
import { deleteTeacher } from "@/lib/actions";
import type { TeacherWithModules } from "@/types";

interface TeachersClientProps {
  initialTeachers: TeacherWithModules[];
}

export function TeachersClient({ initialTeachers }: TeachersClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherWithModules>();
  const [isPending, startTransition] = useTransition();

  const handleEdit = (teacher: TeacherWithModules) => {
    setSelectedTeacher(teacher);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo docente?")) return;

    startTransition(async () => {
      await deleteTeacher(id);
    });
  };

  const handleAdd = () => {
    setSelectedTeacher(undefined);
    setDialogOpen(true);
  };

  const handleSendCalendar = async (id: string) => {
    if (!confirm("Inviare il link del calendario a questo docente?")) return;

    try {
      const res = await fetch(`/api/teachers/${id}/send-calendar`, {
        method: "POST",
      });
      if (res.ok) {
        alert("Email inviata con successo!");
      } else {
        const data = await res.json();
        alert(data.error ?? "Errore nell'invio dell'email");
      }
    } catch {
      alert("Errore nell'invio dell'email");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Docenti</h1>
          <p className="text-sm text-neutral-500">
            Gestisci l&apos;anagrafica dei docenti
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 bg-neutral-900 hover:bg-neutral-800">
          <Plus className="h-4 w-4" />
          Nuovo Docente
        </Button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-100">
          <span className="text-sm font-medium text-neutral-900">
            {initialTeachers.length} docent{initialTeachers.length === 1 ? "e" : "i"}
          </span>
        </div>

        {initialTeachers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UserCircle className="h-12 w-12 text-neutral-300" />
            <h3 className="mt-4 text-sm font-medium text-neutral-900">Nessun docente</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Inizia aggiungendo il primo docente
            </p>
            <Button onClick={handleAdd} className="mt-4 gap-2 bg-neutral-900 hover:bg-neutral-800" size="sm">
              <Plus className="h-4 w-4" />
              Aggiungi Docente
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50 hover:bg-neutral-50">
                <TableHead className="text-neutral-500 font-medium">Nome</TableHead>
                <TableHead className="text-neutral-500 font-medium">Email</TableHead>
                <TableHead className="text-neutral-500 font-medium">Tipo</TableHead>
                <TableHead className="text-neutral-500 font-medium">Moduli</TableHead>
                <TableHead className="text-neutral-500 font-medium w-[100px]">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialTeachers.map((teacher) => (
                <TableRow key={teacher.id} className="hover:bg-neutral-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: teacher.color }}
                      />
                      <span className="font-medium text-neutral-900">{teacher.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`mailto:${teacher.email}`}
                      className="flex items-center gap-1 text-neutral-500 hover:text-blue-600"
                    >
                      <Mail className="h-3 w-3" />
                      {teacher.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      teacher.isInternal
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-600"
                    }`}>
                      {teacher.isInternal ? "Interno" : "Esterno"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-neutral-600">
                      {teacher.modules.length}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSendCalendar(teacher.id)}
                        title="Invia calendario"
                        className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(teacher)}
                        title="Modifica"
                        className="h-8 w-8 hover:bg-neutral-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(teacher.id)}
                        disabled={isPending || teacher.modules.length > 0}
                        title="Elimina"
                        className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <TeacherDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        teacher={selectedTeacher}
      />
    </div>
  );
}
