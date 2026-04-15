import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import Dashboard from "@/pages/Dashboard";
import Billing from "@/pages/Billing";
import Products from "@/pages/Products";
import Reports from "@/pages/Reports";
import Insights from "@/pages/Insights";
import Returns from "@/pages/Returns";
import Customers from "@/pages/Customers";
import SettingsPage from "@/pages/Settings";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import NotFound from "@/pages/NotFound";
import { RequireAuth, RoleGuard } from "@/components/shared/RoleGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Main app routes */}
              <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
                <Route path="/dashboard" element={<RoleGuard><Dashboard /></RoleGuard>} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/products" element={<Products />} />
                <Route path="/reports" element={<RoleGuard><Reports /></RoleGuard>} />
                <Route path="/insights" element={<RoleGuard><Insights /></RoleGuard>} />
                <Route path="/returns" element={<RoleGuard><Returns /></RoleGuard>} />
                <Route path="/customers" element={<RoleGuard><Customers /></RoleGuard>} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
