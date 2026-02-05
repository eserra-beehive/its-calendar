"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { lessonSchema, type LessonInput } from "@/lib/validations";
import type { ActionResult, Lesson, LessonWithModule, CalendarEvent } from "@/types";

function parseTimeToDate(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export async function getLessons(): Promise<Lesson[]> {
  return prisma.lesson.findMany({
    orderBy: { date: "asc" },
  });
}

export async function getLessonsWithModule(): Promise<LessonWithModule[]> {
  return prisma.lesson.findMany({
    include: {
      module: {
        include: { teacher: true },
      },
    },
    orderBy: { date: "asc" },
  });
}

export async function getLessonsForCalendar(
  startDate?: Date,
  endDate?: Date
): Promise<CalendarEvent[]> {
  const lessons = await prisma.lesson.findMany({
    where: {
      date: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      },
    },
    include: {
      module: {
        include: { teacher: true },
      },
    },
    orderBy: { date: "asc" },
  });

  return lessons.map((lesson) => ({
    id: lesson.id,
    title: `${lesson.module.name}${lesson.isExam ? " (ESAME)" : ""}`,
    start: parseTimeToDate(lesson.date, lesson.startTime),
    end: parseTimeToDate(lesson.date, lesson.endTime),
    backgroundColor: lesson.module.teacher.isInternal ? "#3b82f6" : "#f97316",
    borderColor: lesson.isExam ? "#dc2626" : undefined,
    extendedProps: {
      lessonId: lesson.id,
      moduleId: lesson.moduleId,
      moduleName: lesson.module.name,
      teacherId: lesson.module.teacherId,
      teacherName: lesson.module.teacher.name,
      isInternal: lesson.module.teacher.isInternal,
      isExam: lesson.isExam,
      hours: lesson.hours,
      room: lesson.room ?? undefined,
      notes: lesson.notes ?? undefined,
    },
  }));
}

export async function getLessonsByTeacher(teacherId: string): Promise<LessonWithModule[]> {
  return prisma.lesson.findMany({
    where: {
      module: { teacherId },
    },
    include: {
      module: {
        include: { teacher: true },
      },
    },
    orderBy: { date: "asc" },
  });
}

export async function getLesson(id: string): Promise<LessonWithModule | null> {
  return prisma.lesson.findUnique({
    where: { id },
    include: {
      module: {
        include: { teacher: true },
      },
    },
  });
}

export async function createLesson(data: LessonInput): Promise<ActionResult<Lesson>> {
  const parsed = lessonSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const lesson = await prisma.lesson.create({ data: parsed.data });
    revalidatePath("/");
    return { success: true, data: lesson };
  } catch {
    return { success: false, error: "Errore durante la creazione" };
  }
}

export async function updateLesson(
  id: string,
  data: Partial<LessonInput>
): Promise<ActionResult<Lesson>> {
  const existingLesson = await prisma.lesson.findUnique({ where: { id } });
  if (!existingLesson) {
    return { success: false, error: "Lezione non trovata" };
  }

  const mergedData = { ...existingLesson, ...data };
  const parsed = lessonSchema.safeParse(mergedData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const lesson = await prisma.lesson.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/");
    return { success: true, data: lesson };
  } catch {
    return { success: false, error: "Errore durante l'aggiornamento" };
  }
}

export async function deleteLesson(id: string): Promise<ActionResult> {
  try {
    await prisma.lesson.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Errore durante l'eliminazione" };
  }
}

// ═══ DASHBOARD STATS ═══

export interface DashboardStats {
  totalHours: number;
  deliveredHours: number;
  lessonsThisWeek: number;
  activeModules: number;
  nextExam: { date: Date; moduleName: string } | null;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const [modules, lessonsThisWeek, nextExam] = await Promise.all([
    prisma.module.findMany({
      include: {
        lessons: true,
      },
    }),
    prisma.lesson.count({
      where: {
        date: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
    }),
    prisma.lesson.findFirst({
      where: {
        isExam: true,
        date: { gte: now },
      },
      include: {
        module: true,
      },
      orderBy: { date: "asc" },
    }),
  ]);

  const totalHours = modules.reduce((sum, m) => sum + m.totalHours, 0);
  const deliveredHours = modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + l.hours, 0),
    0
  );

  return {
    totalHours,
    deliveredHours,
    lessonsThisWeek,
    activeModules: modules.length,
    nextExam: nextExam
      ? { date: nextExam.date, moduleName: nextExam.module.name }
      : null,
  };
}

export interface UpcomingLesson {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  moduleName: string;
  teacherName: string;
  room: string | null;
  isExam: boolean;
  moduleId: string;
}

export async function getUpcomingLessons(limit = 5): Promise<UpcomingLesson[]> {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const lessons = await prisma.lesson.findMany({
    where: {
      date: { gte: now },
    },
    include: {
      module: {
        include: { teacher: true },
      },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    take: limit,
  });

  return lessons.map((l) => ({
    id: l.id,
    date: l.date,
    startTime: l.startTime,
    endTime: l.endTime,
    moduleName: l.module.name,
    teacherName: l.module.teacher.name,
    room: l.room,
    isExam: l.isExam,
    moduleId: l.moduleId,
  }));
}
