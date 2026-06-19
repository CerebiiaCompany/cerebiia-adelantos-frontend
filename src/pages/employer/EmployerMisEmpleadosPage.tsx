import { useState } from "react";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/features/auth";
import {
  CreateEmpleadoButton,
  CreateEmpleadoDialog,
  EmpleadosTable,
} from "@/features/employer-panel";
import { isSystemUserSession } from "@/shared/api";

export default function EmployerMisEmpleadosPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { session } = useAuth();
  const companyName =
    session && isSystemUserSession(session)
      ? session.user.full_name
      : "Tu empresa";

  return (
    <div className="mx-auto max-w-6xl animate-fade-in space-y-6">
      <PageHeader
        icon={Users}
        title="Mis empleados"
        description={`Listado de empleados vinculados a ${companyName}`}
        actions={
          <CreateEmpleadoButton onClick={() => setCreateDialogOpen(true)} />
        }
      />

      <EmpleadosTable />

      <CreateEmpleadoDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
