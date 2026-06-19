import { ClipboardList } from "lucide-react";
import { EmployerPlaceholderPage } from "./EmployerPlaceholderPage";

export default function EmployerSolicitudesPage() {
  return (
    <EmployerPlaceholderPage
      icon={ClipboardList}
      title="Solicitudes de adelanto"
      description="Revisa y gestiona las solicitudes enviadas por tus empleados"
    />
  );
}
