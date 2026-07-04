/**
 * MainLayout — wraps public pages with Nav, floating buttons, lead popup and Footer.
 */
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingActions from "../components/FloatingActions";
import LeadPopup from "../components/LeadPopup";
import { ScrollProgress, CompareBar } from "../components/EnhancedUI";
import { useLocalArray } from "../components/EnhancedUI";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { listProperties } from "../lib/api";

export default function MainLayout() {
  const { pathname } = useLocation();
  const compare = useLocalArray("aayat_compare", 4);
  const [allProps, setAllProps] = useState([]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [pathname]);
  useEffect(() => { listProperties().then(setAllProps).catch(() => {}); }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] text-charcoal dark:text-[#F5F1E9] transition-colors duration-500">
      <ScrollProgress />
      <Navbar />
      <main><Outlet context={{ compare, allProps }} /></main>
      <Footer />
      <FloatingActions />
      <LeadPopup />
      <CompareBar compare={compare} properties={allProps} />
    </div>
  );
}
