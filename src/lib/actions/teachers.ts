"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { teacherSchema, type TeacherInput } from "@/lib/validations";
import type { ActionResult, Teacher, TeacherWithModules } from "@/types";

export async function getTeachers(): Promise<Teacher[]> {
  return prisma.teacher.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getTeachersWithModules(): Promise<TeacherWithModules[]> {
  return prisma.teacher.findMany({
    include: { modules: true },
    orderBy: { name: "asc" },
  });
}

export async function getTeacher(id: string): Promise<Teacher | null> {
  return prisma.teacher.findUnique({ where: { id } });
}

export async function createTeacher(data: TeacherInput): Promise<ActionResult<Teacher>> {
  const parsed = teacherSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const teacher = await prisma.teacher.create({ data: parsed.data });
    revalidatePath("/teachers");
    revalidatePath("/");
    return { success: true, data: teacher };
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return { success: false, error: "Email già esistente" };
    }
    return { success: false, error: "Errore durante la creazione" };
  }
}

export async function updateTeacher(
  id: string,
  data: TeacherInput
): Promise<ActionResult<Teacher>> {
  const parsed = teacherSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const teacher = await prisma.teacher.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/teachers");
    revalidatePath("/");
    return { success: true, data: teacher };
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return { success: false, error: "Email già esistente" };
    }
    return { success: false, error: "Errore durante l'aggiornamento" };
  }
}

export async function deleteTeacher(id: string): Promise<ActionResult> {
  try {
    await prisma.teacher.delete({ where: { id } });
    revalidatePath("/teachers");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Errore durante l'eliminazione" };
  }
}
