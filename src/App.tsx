import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Adelanto from "./pages/Adelanto";
import WalletPage from "./pages/WalletPage";
import Control from "./pages/Control";
import Asistente from "./pages/Asistente";
import Logros from "./pages/Logros";
import Notificaciones from "./pages/Notificaciones";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/adelanto" element={<Adelanto />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/control" element={<Control />} />
            <Route path="/asistente" element={<Asistente />} />
            <Route path="/logros" element={<Logros />} />
            <Route path="/notificaciones" element={<Notificaciones />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
