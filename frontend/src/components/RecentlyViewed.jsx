/**
 * RecentlyViewed — horizontal strip of recently viewed properties (localStorage-backed).
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listProperties } from "../lib/api";
import { useLocalArray } from "./EnhancedUI";
import { Clock, ArrowUpRight } from "lucide-react";

export default function RecentlyViewed({ excludeId }) {
  const recent = useLocalArray("aayat_recent", 8);
  const [all, setAll] = useState([]);
  useEffect(() => { listProperties().then(setAll).catch(() => {}); }, []);
  const items = recent.ids
    .filter((id) => id !== excludeId)
    .map((id) => all.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 6);

  if (items.length === 0) return null;
  return (
    <section className="py-16 bg-[#FAFAFA] dark:bg-[#0A0A0A]" data-testid="recently-viewed">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="label-eyebrow flex items-center gap-2"><Clock size={12} /> Recently viewed</span>
            <h3 className="font-serif-luxe text-3xl md:text-4xl mt-2 text-charcoal dark:text-white font-light">Where you left off.</h3>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {items.map((p) => (
            <Link key={p.id} to={`/properties/${p.id}`} className="group block overflow-hidden bg-white dark:bg-white/5 border border-black/5 dark:border-white/10">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-3">
                <div className="text-charcoal dark:text-white text-sm font-medium truncate">{p.name}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-black/50 dark:text-white/50 text-[11px]">{p.location}</span>
                  <ArrowUpRight size={12} strokeWidth={1.5} className="text-[#C8A96A]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
