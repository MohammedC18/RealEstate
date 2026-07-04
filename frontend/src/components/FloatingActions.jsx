/**
 * FloatingActions — sticky WhatsApp, Call, Back-to-top buttons.
 * Only visible after scrolling a bit.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ArrowUp } from "lucide-react";
import { waLink, telLink } from "../lib/utils";

const PHONE = "+919004625459";

export default function FloatingActions() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const on = () => setVisible(window.scrollY > 400);
    on();
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-40 flex flex-col gap-3 items-end">
      <AnimatePresence>
        {visible && (
          <motion.button
            data-testid="floating-back-to-top"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="w-12 h-12 rounded-full bg-[#0A0A0A] text-white border border-white/10 hover:bg-[#C8A96A] hover:text-[#0A0A0A] transition-colors flex items-center justify-center shadow-lg"
          >
            <ArrowUp strokeWidth={1.5} size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      <a
        data-testid="floating-call"
        href={telLink(PHONE)}
        aria-label="Call Aayat"
        className="w-14 h-14 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform border border-[#C8A96A]/40"
      >
        <Phone strokeWidth={1.5} size={20} />
      </a>

      <a
        data-testid="floating-whatsapp"
        href={waLink(PHONE)}
        target="_blank" rel="noopener noreferrer"
        aria-label="WhatsApp Aayat"
        className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
      >
        {/* WhatsApp SVG (avoids emoji + brand-accurate) */}
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 0 5.37 0 12a11.94 11.94 0 001.64 6L0 24l6.2-1.62A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12a11.94 11.94 0 00-3.48-8.52zM12 21.82a9.8 9.8 0 01-5-1.36l-.36-.21-3.68.96.98-3.58-.23-.37A9.83 9.83 0 1121.82 12 9.83 9.83 0 0112 21.82zm5.4-7.36c-.3-.15-1.77-.87-2.04-.97s-.47-.15-.67.15-.77.97-.94 1.17-.35.22-.65.07a8.06 8.06 0 01-2.38-1.47 8.87 8.87 0 01-1.64-2.05c-.17-.3 0-.46.13-.6.13-.14.3-.35.45-.52a2 2 0 00.3-.5.55.55 0 00-.03-.52c-.07-.15-.67-1.62-.92-2.22s-.5-.5-.67-.5h-.57a1.1 1.1 0 00-.8.37 3.35 3.35 0 00-1.05 2.5 5.83 5.83 0 001.22 3.1c.15.2 2.1 3.2 5.08 4.5.71.3 1.27.48 1.7.62a4.1 4.1 0 001.88.12 3.08 3.08 0 002-1.42 2.5 2.5 0 00.17-1.42c-.07-.13-.27-.2-.57-.35z" />
        </svg>
      </a>
    </div>
  );
}
