/**
 * Navbar — sticky, transparent-to-solid on scroll.
 * Includes live search (Cmd/Ctrl+K), dark mode toggle and favorites shortcut.
 */
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, Heart } from "lucide-react";
import { cn } from "../lib/utils";
import LiveSearch from "./LiveSearch";
import DarkModeToggle from "./DarkModeToggle";
import { useLocalArray } from "./EnhancedUI";

const links = [
  { to: "/", label: "Home" },
  { to: "/properties", label: "Properties" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const favs = useLocalArray("aayat_favs", 50);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const forceSolid = pathname !== "/";

  return (
    <>
      <motion.header
        data-testid="site-navbar"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          (scrolled || forceSolid)
            ? "bg-[#0A0A0A]/85 backdrop-blur-xl border-b border-white/5"
            : "bg-transparent"
        )}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
          <Link to="/" data-testid="nav-logo" className="flex items-baseline gap-2 group">
            <span className="font-serif-luxe text-2xl md:text-3xl font-light tracking-tight text-white">
              Aayat
            </span>
            <span className="label-eyebrow hidden sm:block">Real Estate</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                data-testid={`nav-link-${l.label.toLowerCase()}`}
                className={({ isActive }) => cn(
                  "text-[13px] tracking-[0.18em] uppercase font-sans-luxe font-medium transition-colors",
                  "text-white/70 hover:text-[#C8A96A]",
                  isActive && "text-[#C8A96A]"
                )}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <LiveSearch />
            <DarkModeToggle />
            <Link
              to="/favorites"
              data-testid="nav-favorites"
              className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-[#C8A96A] transition-colors relative"
              aria-label="Favourites"
            >
              <Heart size={16} strokeWidth={1.5} />
              {favs.ids.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C8A96A] text-charcoal text-[9px] font-medium flex items-center justify-center">{favs.ids.length}</span>
              )}
            </Link>
            <a href="tel:+919004625459" data-testid="nav-call" className="hidden lg:flex items-center gap-2 text-white/70 hover:text-[#C8A96A] text-sm">
              <Phone strokeWidth={1.5} size={16} /> +91 90046 25459
            </a>
            <Link to="/contact?visit=1" data-testid="nav-book-visit" className="btn-gold !py-2.5 !px-5 text-[11px]">
              Book Visit
            </Link>
          </div>
        </div>
      </motion.header>
    </>
  );
}
