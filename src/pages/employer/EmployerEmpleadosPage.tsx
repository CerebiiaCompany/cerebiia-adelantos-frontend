import { Users } from "lucide-react";
import { EmployerPlaceholderPage } from "./EmployerPlaceholderPage";

export default function EmployerEmpleadosPage() {
  return (
    <EmployerPlaceholderPage
      icon={Users}
      title="Empleados"
      description="Consulta y administra el listado de empleados de tu empresa"
    />
  );
}
