import { getModulesWithRelations, getTeachers, getClasses } from "@/lib/actions";
import { Header } from "@/components/dashboard";
import { ModulesClient } from "./modules-client";

export const dynamic = "force-dynamic";

export default async function ModulesPage() {
  const [modules, teachers, classes] = await Promise.all([
    getModulesWithRelations(),
    getTeachers(),
    getClasses(),
  ]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="p-6">
        <ModulesClient
          initialModules={modules}
          teachers={teachers}
          classes={classes}
        />
      </main>
    </div>
  );
}
