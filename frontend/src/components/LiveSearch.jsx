/**
 * LiveSearch — instant autocomplete search across properties + locations.
 * Used in the Navbar (opens a command palette) and inline on the Properties page.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, ArrowUpRight, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { listProperties } from "../lib/api";

const LOCATION_TAGS = ["Bandra West", "Juhu", "Worli", "BKC", "Powai", "South Mumbai", "Malabar Hill"];

export default function LiveSearch({ triggerClass = "" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const nav = useNavigate();

  useEffect(() => {
    if (open) {
      listProperties().then(setItems).catch(() => {});
      setTimeout(() => inputRef.current?.focus(), 60);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Cmd/Ctrl+K to open
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); setOpen((v) => !v);
      }
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const results = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const props = items.filter((p) =>
      !qq || `${p.name} ${p.location} ${p.tagline || ""} ${p.type}`.toLowerCase().includes(qq)
    ).slice(0, 6);
    const locs = LOCATION_TAGS.filter((l) => !qq || l.toLowerCase().includes(qq)).slice(0, 4);
    return { props, locs };
  }, [q, items]);

  const totalResults = results.props.length + results.locs.length;

  const handleKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, totalResults - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Enter" && totalResults > 0) {
      e.preventDefault();
      if (active < results.props.length) { nav(`/properties/${results.props[active].id}`); }
      else { nav(`/properties?location=${encodeURIComponent(results.locs[active - results.props.length])}`); }
      setOpen(false); setQ("");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        data-testid="live-search-trigger"
        className={`inline-flex items-center gap-2 text-white/70 hover:text-[#C8A96A] transition-colors ${triggerClass}`}
        aria-label="Search"
      >
        <Search size={16} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[95] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-2xl bg-[#FAFAFA] dark:bg-[#0F0F0F] border border-black/10 dark:border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()} data-testid="live-search-panel">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-black/10 dark:border-white/10">
              <Search size={16} strokeWidth={1.5} className="text-[#C8A96A]" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => { setQ(e.target.value); setActive(0); }}
                onKeyDown={handleKey}
                placeholder="Search residences, locations…"
                className="flex-1 bg-transparent outline-none text-charcoal dark:text-white text-lg placeholder:text-black/30 dark:placeholder:text-white/30"
                data-testid="live-search-input"
              />
              <kbd className="hidden sm:inline text-[10px] tracking-widest uppercase text-black/40 dark:text-white/40 border border-black/10 dark:border-white/10 px-2 py-0.5">Esc</kbd>
              <button onClick={() => setOpen(false)} className="text-black/40 dark:text-white/40 hover:text-charcoal dark:hover:text-white p-1"><X size={16} /></button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto py-2">
              {results.props.length > 0 && (
                <div className="px-2">
                  <div className="px-3 py-2 text-[10px] tracking-widest uppercase text-black/40 dark:text-white/40">Residences</div>
                  {results.props.map((p, i) => (
                    <Link
                      key={p.id}
                      to={`/properties/${p.id}`}
                      onClick={() => { setOpen(false); setQ(""); }}
                      className={`flex items-center gap-3 px-3 py-2.5 group ${i === active ? "bg-[#C8A96A]/10" : "hover:bg-black/5 dark:hover:bg-white/5"}`}
                      onMouseEnter={() => setActive(i)}
                      data-testid={`live-search-result-${p.id}`}
                    >
                      <img src={p.images?.[0]} alt="" className="w-12 h-12 object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-charcoal dark:text-white text-sm font-medium truncate">{p.name}</div>
                        <div className="text-black/50 dark:text-white/50 text-xs flex items-center gap-1"><MapPin size={11} /> {p.location} · {p.bhk} BHK</div>
                      </div>
                      <span className="text-[#C8A96A] text-sm font-serif-luxe shrink-0">{p.price}</span>
                      <ArrowUpRight size={14} strokeWidth={1.5} className="text-black/30 dark:text-white/30 group-hover:text-[#C8A96A]" />
                    </Link>
                  ))}
                </div>
              )}

              {results.locs.length > 0 && (
                <div className="px-2 mt-2">
                  <div className="px-3 py-2 text-[10px] tracking-widest uppercase text-black/40 dark:text-white/40">Locations</div>
                  {results.locs.map((l, i) => {
                    const idx = results.props.length + i;
                    return (
                      <Link
                        key={l}
                        to={`/properties?location=${encodeURIComponent(l)}`}
                        onClick={() => { setOpen(false); setQ(""); }}
                        onMouseEnter={() => setActive(idx)}
                        className={`flex items-center gap-3 px-3 py-2.5 ${idx === active ? "bg-[#C8A96A]/10" : "hover:bg-black/5 dark:hover:bg-white/5"}`}
                      >
                        <div className="w-12 h-12 border border-[#C8A96A]/30 flex items-center justify-center shrink-0"><MapPin size={16} className="text-[#C8A96A]" /></div>
                        <div className="flex-1">
                          <div className="text-charcoal dark:text-white text-sm font-medium">{l}</div>
                          <div className="text-black/50 dark:text-white/50 text-xs">Explore residences in {l}</div>
                        </div>
                        <ArrowUpRight size={14} strokeWidth={1.5} className="text-black/30 dark:text-white/30" />
                      </Link>
                    );
                  })}
                </div>
              )}

              {q && totalResults === 0 && (
                <div className="px-6 py-10 text-center text-black/50 dark:text-white/50 text-sm">
                  No matches for “{q}”. Try a location or a BHK.
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px] tracking-widest uppercase text-black/40 dark:text-white/40">
              <span>↑↓ navigate · ↵ open</span>
              <span>⌘K to reopen</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
