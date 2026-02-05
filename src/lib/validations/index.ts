import { z } from "zod";

export const teacherSchema = z.object({
  name: z.string().min(2, "Nome richiesto"),
  email: z.string().email("Email non valida"),
  phone: z.string().optional(),
  isInternal: z.boolean().default(true),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Colore non valido").default("#3b82f6"),
});

export const moduleSchema = z.object({
  name: z.string().min(2, "Nome richiesto"),
  code: z.string().optional(),
  totalHours: z.number().int().positive("Ore totali devono essere positive"),
  teacherId: z.string().min(1, "Docente richiesto"),
  classId: z.string().min(1, "Classe richiesta"),
});

export const classSchema = z.object({
  name: z.string().min(2, "Nome richiesto"),
  year: z.number().int().optional(),
  isActive: z.boolean().default(true),
});

export const lessonSchema = z.object({
  moduleId: z.string().min(1, "Modulo richiesto"),
  date: z.coerce.date(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Orario non valido"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Orario non valido"),
  hours: z.number().positive("Ore devono essere positive"),
  isExam: z.boolean().default(false),
  room: z.string().optional(),
  notes: z.string().optional(),
});

export type TeacherInput = z.infer<typeof teacherSchema>;
export type ModuleInput = z.infer<typeof moduleSchema>;
export type ClassInput = z.infer<typeof classSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
