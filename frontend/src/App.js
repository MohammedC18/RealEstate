import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./contexts/ThemeContext";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Compare from "./pages/Compare";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import "@/App.css";

function RequireAdmin({ children }) {
  const token = localStorage.getItem("aayat_admin_token");
  return token ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <div className="App">
          <BrowserRouter>
            <Toaster position="top-right" richColors closeButton
              toastOptions={{ style: { fontFamily: "'Manrope', sans-serif" } }} />
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/:id" element={<PropertyDetails />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/favorites" element={<Favorites />} />
              </Route>

              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </ThemeProvider>
    </HelmetProvider>
  );
}
