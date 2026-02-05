"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { moduleSchema, type ModuleInput } from "@/lib/validations";
import type { ActionResult, Module, ModuleWithRelations, ModuleWithHours } from "@/types";

export async function getModules(): Promise<Module[]> {
  return prisma.module.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getModulesWithRelations(): Promise<ModuleWithRelations[]> {
  return prisma.module.findMany({
    include: {
      teacher: true,
      class: true,
      lessons: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getModulesWithHours(classId?: string): Promise<ModuleWithHours[]> {
  const modules = await prisma.module.findMany({
    where: classId ? { classId } : undefined,
    include: {
      lessons: {
        select: { hours: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return modules.map((mod) => {
    const deliveredHours = mod.lessons.reduce((sum, l) => sum + l.hours, 0);
    return {
      id: mod.id,
      name: mod.name,
      code: mod.code,
      totalHours: mod.totalHours,
      teacherId: mod.teacherId,
      classId: mod.classId,
      createdAt: mod.createdAt,
      updatedAt: mod.updatedAt,
      deliveredHours,
      remainingHours: mod.totalHours - deliveredHours,
    };
  });
}

export async function getModule(id: string): Promise<ModuleWithRelations | null> {
  return prisma.module.findUnique({
    where: { id },
    include: {
      teacher: true,
      class: true,
      lessons: true,
    },
  });
}

export async function createModule(data: ModuleInput): Promise<ActionResult<Module>> {
  const parsed = moduleSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const mod = await prisma.module.create({ data: parsed.data });
    revalidatePath("/modules");
    revalidatePath("/");
    return { success: true, data: mod };
  } catch {
    return { success: false, error: "Errore durante la creazione" };
  }
}

export async function updateModule(
  id: string,
  data: ModuleInput
): Promise<ActionResult<Module>> {
  const parsed = moduleSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const mod = await prisma.module.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/modules");
    revalidatePath("/");
    return { success: true, data: mod };
  } catch {
    return { success: false, error: "Errore durante l'aggiornamento" };
  }
}

export async function deleteModule(id: string): Promise<ActionResult> {
  try {
    await prisma.module.delete({ where: { id } });
    revalidatePath("/modules");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Errore durante l'eliminazione" };
  }
}
