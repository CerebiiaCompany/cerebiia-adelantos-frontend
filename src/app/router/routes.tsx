import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";import { AppLayout } from "@/components/AppLayout";
import { EmployerLayout } from "@/components/EmployerLayout";
import Dashboard from "@/pages/Dashboard";
import Adelanto from "@/pages/Adelanto";
import MisAdelantos from "@/pages/MisAdelantos";
import WalletPage from "@/pages/WalletPage";
import Control from "@/pages/Control";
import Asistente from "@/pages/Asistente";
import Logros from "@/pages/Logros";
import Notificaciones from "@/pages/Notificaciones";
import EmployerPanelPage from "@/pages/employer/EmployerPanelPage";
import EmployerMisEmpleadosPage from "@/pages/employer/EmployerMisEmpleadosPage";
import EmployerMonitoreoAdelantosPage from "@/pages/employer/EmployerMonitoreoAdelantosPage";
import EmployerSeguimientoCuotasPage from "@/pages/employer/EmployerSeguimientoCuotasPage";
import EmployerHistorialMovimientosPage from "@/pages/employer/EmployerHistorialMovimientosPage";
import EmployerRetencionesCierresPage from "@/pages/employer/EmployerRetencionesCierresPage";
import NotFound from "@/pages/NotFound";
import LoginPage from "@/pages/public/LoginPage";
import RegisterPage from "@/pages/public/RegisterPage";
import RegisterValidationPendingPage from "@/pages/public/RegisterValidationPendingPage";
import ForgotPasswordPage from "@/pages/public/ForgotPasswordPage";
import { AuthGuard } from "@/app/router/guards/AuthGuard";
import { GuestGuard } from "@/app/router/guards/GuestGuard";
import { ModuleGuard } from "@/app/router/guards/ModuleGuard";
import { RoleGuard } from "@/app/router/guards/RoleGuard";
import { ROUTES } from "@/shared/config/routes";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestGuard />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route
            path={ROUTES.forgotPassword}
            element={<ForgotPasswordPage />}
          />
          <Route path={ROUTES.register} element={<RegisterPage />} />
          <Route
            path={ROUTES.registerValidation}
            element={<RegisterValidationPendingPage />}
          />
        </Route>

        <Route element={<AuthGuard />}>
          <Route element={<RoleGuard allowed={["employee"]} />}>
            <Route element={<AppLayout />}>
              <Route
                path={ROUTES.employee.dashboard}
                element={
                  <ModuleGuard moduleId="employee.dashboard">
                    <Dashboard />
                  </ModuleGuard>
                }
              />
              <Route
                path={ROUTES.employee.adelanto}
                element={
                  <ModuleGuard moduleId="employee.adelanto">
                    <Adelanto />
                  </ModuleGuard>
                }
              />
              <Route
                path={ROUTES.employee.misAdelantos}
                element={
                  <ModuleGuard moduleId="employee.misAdelantos">
                    <MisAdelantos />
                  </ModuleGuard>
                }
              />
              <Route
                path={ROUTES.employee.wallet}
                element={
                  <ModuleGuard moduleId="employee.wallet">
                    <WalletPage />
                  </ModuleGuard>
                }
              />
              <Route
                path={ROUTES.employee.control}
                element={
                  <ModuleGuard moduleId="employee.control">
                    <Control />
                  </ModuleGuard>
                }
              />
              <Route
                path={ROUTES.employee.asistente}
                element={
                  <ModuleGuard moduleId="employee.asistente">
                    <Asistente />
                  </ModuleGuard>
                }
              />
              <Route
                path={ROUTES.employee.logros}
                element={
                  <ModuleGuard moduleId="employee.logros">
                    <Logros />
                  </ModuleGuard>
                }
              />
              <Route
                path={ROUTES.employee.notificaciones}
                element={
                  <ModuleGuard moduleId="employee.notificaciones">
                    <Notificaciones />
                  </ModuleGuard>
                }
              />
            </Route>
          </Route>

          <Route element={<RoleGuard allowed={["employer"]} />}>
            <Route path="/empleador" element={<EmployerLayout />}>
              <Route index element={<Navigate to="panel" replace />} />
              <Route
                path="panel"
                element={
                  <ModuleGuard moduleId="employer.dashboard">
                    <EmployerPanelPage />
                  </ModuleGuard>
                }
              />
              <Route
                path="mis-empleados"
                element={
                  <ModuleGuard moduleId="employer.misEmpleados">
                    <EmployerMisEmpleadosPage />
                  </ModuleGuard>
                }
              />
              <Route
                path="monitoreo-adelantos"
                element={
                  <ModuleGuard moduleId="employer.monitoreoAdelantos">
                    <EmployerMonitoreoAdelantosPage />
                  </ModuleGuard>
                }
              />
              <Route
                path="seguimiento-cuotas"
                element={
                  <ModuleGuard moduleId="employer.seguimientoCuotas">
                    <EmployerSeguimientoCuotasPage />
                  </ModuleGuard>
                }
              />
              <Route
                path="historial-movimientos"
                element={
                  <ModuleGuard moduleId="employer.historialMovimientos">
                    <EmployerHistorialMovimientosPage />
                  </ModuleGuard>
                }
              />
              <Route
                path="retenciones-cierres"
                element={
                  <ModuleGuard moduleId="employer.retencionesCierres">
                    <EmployerRetencionesCierresPage />
                  </ModuleGuard>
                }
              />
            </Route>
          </Route>        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
