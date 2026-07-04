/**
 * Enhanced UI utilities — hooks + tiny components used across the site.
 * Kept in one file to avoid over-fragmentation.
 */
import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, X, Copy, Check, Scale, Heart } from "lucide-react";
import { toast } from "sonner";

/* ============================ HOOKS ============================ */
export function useLocalArray(key, max = 20) {
  const [ids, setIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(ids)); }, [key, ids]);
  const add = (id) => setIds((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, max));
  const remove = (id) => setIds((prev) => prev.filter((x) => x !== id));
  const toggle = (id) => setIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev].slice(0, max));
  const has = (id) => ids.includes(id);
  return { ids, add, remove, toggle, has, clear: () => setIds([]) };
}

/* ============================ SCROLL PROGRESS ============================ */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scale = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return (
    <motion.div
      data-testid="scroll-progress"
      style={{ scaleX: scale, transformOrigin: "0% 50%" }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-[#C8A96A] z-[60]"
    />
  );
}

/* ============================ PROPERTY SKELETON ============================ */
export function PropertySkeleton() {
  return (
    <div className="bg-white border border-black/5 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-black/10" />
      <div className="p-6 space-y-3">
        <div className="h-3 w-24 bg-black/10" />
        <div className="h-6 w-3/4 bg-black/10" />
        <div className="h-4 w-1/2 bg-black/10" />
        <div className="flex justify-between pt-4 border-t border-black/5">
          <div className="h-6 w-24 bg-black/10" />
          <div className="h-6 w-16 bg-black/10" />
        </div>
      </div>
    </div>
  );
}

/* ============================ COMPARE DRAWER ============================ */
export function CompareBar({ compare, properties }) {
  const items = properties.filter((p) => compare.has(p.id));
  if (items.length === 0) return null;
  return (
    <motion.div
      data-testid="compare-bar"
      initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
      className="fixed bottom-0 inset-x-0 z-40 bg-[#0A0A0A] text-white border-t border-[#C8A96A]/30 shadow-2xl"
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 shrink-0"><Scale size={16} strokeWidth={1.5} className="text-[#C8A96A]" /><span className="text-xs tracking-widest uppercase">Compare</span></div>
        <div className="flex-1 flex gap-2 overflow-x-auto">
          {items.map((p) => (
            <div key={p.id} className="flex items-center gap-2 bg-white/5 pl-2 pr-1 py-1 text-xs shrink-0">
              <span className="truncate max-w-[140px]">{p.name}</span>
              <button onClick={() => compare.remove(p.id)} className="text-white/50 hover:text-white p-1"><X size={12} /></button>
            </div>
          ))}
        </div>
        <button onClick={compare.clear} className="text-xs text-white/60 hover:text-white shrink-0">Clear</button>
        <Link to={`/compare?ids=${items.map((i) => i.id).join(",")}`} className="btn-gold shrink-0 !py-2 !px-4 text-[10px]" data-testid="compare-view">
          Compare ({items.length})
        </Link>
      </div>
    </motion.div>
  );
}

/* ============================ SHARE MENU ============================ */
export function ShareMenu({ title, url }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const copy = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); toast.success("Link copied"); setTimeout(() => setCopied(false), 2000); } catch { toast.error("Copy failed"); }
  };
  const wa = `https://wa.me/?text=${encodeURIComponent(`${title} — ${shareUrl}`)}`;
  return (
    <div className="flex items-center gap-2" data-testid="share-menu">
      <button onClick={copy} data-testid="share-copy" className="w-9 h-9 border border-black/15 flex items-center justify-center hover:border-[#C8A96A] hover:text-[#C8A96A]" aria-label="Copy link">
        {copied ? <Check size={14} strokeWidth={1.5} /> : <Copy size={14} strokeWidth={1.5} />}
      </button>
      <a href={wa} target="_blank" rel="noopener noreferrer" data-testid="share-whatsapp" className="w-9 h-9 border border-black/15 flex items-center justify-center hover:border-[#C8A96A] hover:text-[#C8A96A]" aria-label="Share on WhatsApp">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A11.9 11.9 0 0012 0C5.4 0 0 5.4 0 12a12 12 0 001.6 6L0 24l6.2-1.6A11.9 11.9 0 0012 24c6.6 0 12-5.4 12-12a11.9 11.9 0 00-3.5-8.5z"/></svg>
      </a>
    </div>
  );
}

/* ============================ FAVORITE HEART ============================ */
export function FavoriteHeart({ id, favs, className = "" }) {
  const active = favs.has(id);
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); favs.toggle(id); toast.success(active ? "Removed from favourites" : "Saved to favourites"); }}
      className={`w-9 h-9 rounded-full bg-white/95 backdrop-blur flex items-center justify-center hover:bg-white transition-colors ${className}`}
      data-testid={`fav-${id}`}
      aria-label={active ? "Remove from favourites" : "Save to favourites"}
    >
      <Heart size={14} strokeWidth={1.5} className={active ? "fill-[#C8A96A] text-[#C8A96A]" : "text-charcoal"} />
    </button>
  );
}

/* ============================ EMPTY STATE ============================ */
export function EmptyState({ title, subtitle, action }) {
  return (
    <div className="py-20 text-center" data-testid="empty-state">
      <div className="w-16 h-16 mx-auto rounded-full border border-[#C8A96A]/40 flex items-center justify-center mb-6"><Home size={22} strokeWidth={1.25} className="text-[#C8A96A]" /></div>
      <h3 className="font-serif-luxe text-3xl text-charcoal">{title}</h3>
      {subtitle && <p className="text-black/50 mt-2">{subtitle}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
