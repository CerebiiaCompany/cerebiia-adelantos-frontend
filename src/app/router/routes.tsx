import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Adelanto from "@/pages/Adelanto";
import WalletPage from "@/pages/WalletPage";
import Control from "@/pages/Control";
import Asistente from "@/pages/Asistente";
import Logros from "@/pages/Logros";
import Notificaciones from "@/pages/Notificaciones";
import Perfil from "@/pages/Perfil";
import NotFound from "@/pages/NotFound";
import LoginPage from "@/pages/public/LoginPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/adelanto" element={<Adelanto />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/control" element={<Control />} />
          <Route path="/asistente" element={<Asistente />} />
          <Route path="/logros" element={<Logros />} />
          <Route path="/notificaciones" element={<Notificaciones />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
