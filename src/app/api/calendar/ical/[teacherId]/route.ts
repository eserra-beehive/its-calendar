import { NextRequest, NextResponse } from "next/server";
import ical, { ICalCalendarMethod } from "ical-generator";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  const { teacherId } = await params;

  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
  });

  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  const lessons = await prisma.lesson.findMany({
    where: {
      module: { teacherId },
    },
    include: {
      module: true,
    },
    orderBy: { date: "asc" },
  });

  const calendar = ical({
    name: `Calendario ${teacher.name} - ITS`,
    method: ICalCalendarMethod.PUBLISH,
    prodId: { company: "ITS Calendar", product: "Calendar" },
    timezone: "Europe/Rome",
  });

  for (const lesson of lessons) {
    const [startHour, startMinute] = lesson.startTime.split(":").map(Number);
    const [endHour, endMinute] = lesson.endTime.split(":").map(Number);

    const start = new Date(lesson.date);
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date(lesson.date);
    end.setHours(endHour, endMinute, 0, 0);

    calendar.createEvent({
      start,
      end,
      summary: `${lesson.module.name}${lesson.isExam ? " (ESAME)" : ""}`,
      description: lesson.notes ?? undefined,
      location: lesson.room ?? undefined,
    });
  }

  const icsContent = calendar.toString();

  return new NextResponse(icsContent, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${teacher.name.replace(/\s+/g, "_")}_calendar.ics"`,
    },
  });
}
