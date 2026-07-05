import { Link, useLocation } from "react-router-dom";
import { Home, Building2, Heart, Phone, Mail } from "lucide-react";
import { cn } from "../lib/utils";

export default function BottomNav() {
  const { pathname } = useLocation();

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/properties", label: "Properties", icon: Building2 },
    { to: "/favorites", label: "Favs", icon: Heart },
    { to: "/contact?visit=1", label: "Contact", icon: Mail },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-[#0A0A0A] border-t border-black/10 dark:border-white/10 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.05)] transition-colors duration-500">
      <div className="flex items-center justify-around h-16 px-2">
        {links.map((l) => {
          const active = pathname === l.to || (l.to !== "/" && pathname.startsWith(l.to.split('?')[0]));
          return (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors min-h-[44px] min-w-[44px]",
                active ? "text-[#C8A96A]" : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
              )}
            >
              <l.icon size={20} strokeWidth={active ? 2 : 1.5} className={cn("transition-transform duration-300", active && "scale-110")} />
              <span className="text-[10px] font-medium tracking-wide">{l.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
