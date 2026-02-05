import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Email service not configured" },
      { status: 500 }
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const teacher = await prisma.teacher.findUnique({
    where: { id },
  });

  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const calendarUrl = `${appUrl}/api/calendar/ical/${teacher.id}`;

  try {
    await resend.emails.send({
      from: `${process.env.EMAIL_SENDER_NAME || "ITS Calendar"} <${process.env.EMAIL_SENDER_ADDRESS || "onboarding@resend.dev"}>`,
      to: teacher.email,
      subject: "Il tuo calendario lezioni ITS",
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0f172a; font-size: 24px; margin-bottom: 20px;">
            Ciao ${teacher.name}!
          </h1>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Ecco il link per sincronizzare il tuo calendario lezioni con Google Calendar, Outlook o altri calendari.
          </p>

          <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">
              Link iCal (copia e incolla nel tuo calendario):
            </p>
            <code style="color: #0f172a; font-size: 14px; word-break: break-all;">
              ${calendarUrl}
            </code>
          </div>

          <h2 style="color: #0f172a; font-size: 18px; margin-top: 32px;">
            Come aggiungere il calendario:
          </h2>

          <h3 style="color: #334155; font-size: 16px; margin-top: 16px;">
            Google Calendar:
          </h3>
          <ol style="color: #475569; font-size: 14px; line-height: 1.8;">
            <li>Apri Google Calendar</li>
            <li>Clicca su "+" accanto a "Altri calendari"</li>
            <li>Seleziona "Da URL"</li>
            <li>Incolla il link sopra</li>
          </ol>

          <h3 style="color: #334155; font-size: 16px; margin-top: 16px;">
            Outlook:
          </h3>
          <ol style="color: #475569; font-size: 14px; line-height: 1.8;">
            <li>Vai su Calendario</li>
            <li>Clicca "Aggiungi calendario" → "Abbonati da web"</li>
            <li>Incolla il link sopra</li>
          </ol>

          <p style="color: #64748b; font-size: 14px; margin-top: 32px;">
            Il calendario si aggiornerà automaticamente quando vengono modificate le lezioni.
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />

          <p style="color: #94a3b8; font-size: 12px;">
            Questa email è stata inviata automaticamente dal sistema ITS Calendar.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
