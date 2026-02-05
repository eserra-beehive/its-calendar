import type { Prisma } from "@/generated/prisma";

export type Teacher = Prisma.TeacherGetPayload<object>;
export type TeacherWithModules = Prisma.TeacherGetPayload<{
  include: { modules: true };
}>;

export type Module = Prisma.ModuleGetPayload<object>;
export type ModuleWithRelations = Prisma.ModuleGetPayload<{
  include: { teacher: true; class: true; lessons: true };
}>;
export type ModuleWithTeacher = Prisma.ModuleGetPayload<{
  include: { teacher: true };
}>;

export type Class = Prisma.ClassGetPayload<object>;
export type ClassWithModules = Prisma.ClassGetPayload<{
  include: { modules: true };
}>;

export type Lesson = Prisma.LessonGetPayload<object>;
export type LessonWithModule = Prisma.LessonGetPayload<{
  include: { module: { include: { teacher: true } } };
}>;

export interface ModuleWithHours extends Module {
  deliveredHours: number;
  remainingHours: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: {
    lessonId: string;
    moduleId: string;
    moduleName: string;
    teacherId: string;
    teacherName: string;
    isInternal: boolean;
    isExam: boolean;
    hours: number;
    room?: string;
    notes?: string;
  };
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
