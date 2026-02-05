import { getTeachersWithModules } from "@/lib/actions";
import { Header } from "@/components/dashboard";
import { TeachersClient } from "./teachers-client";

export const dynamic = "force-dynamic";

export default async function TeachersPage() {
  const teachers = await getTeachersWithModules();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="p-6">
        <TeachersClient initialTeachers={teachers} />
      </main>
    </div>
  );
}
