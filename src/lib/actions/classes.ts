"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { classSchema, type ClassInput } from "@/lib/validations";
import type { ActionResult, Class, ClassWithModules } from "@/types";

export async function getClasses(): Promise<Class[]> {
  return prisma.class.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getActiveClass(): Promise<ClassWithModules | null> {
  return prisma.class.findFirst({
    where: { isActive: true },
    include: { modules: true },
  });
}

export async function getClass(id: string): Promise<Class | null> {
  return prisma.class.findUnique({ where: { id } });
}

export async function createClass(data: ClassInput): Promise<ActionResult<Class>> {
  const parsed = classSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const cls = await prisma.class.create({ data: parsed.data });
    revalidatePath("/");
    return { success: true, data: cls };
  } catch {
    return { success: false, error: "Errore durante la creazione" };
  }
}

export async function updateClass(
  id: string,
  data: ClassInput
): Promise<ActionResult<Class>> {
  const parsed = classSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const cls = await prisma.class.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/");
    return { success: true, data: cls };
  } catch {
    return { success: false, error: "Errore durante l'aggiornamento" };
  }
}

export async function deleteClass(id: string): Promise<ActionResult> {
  try {
    await prisma.class.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Errore durante l'eliminazione" };
  }
}
