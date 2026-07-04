/**
 * Properties — advanced filtering listing page.
 * Filters: Location, Type, BHK, Status, Collection.
 */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { listProperties } from "../lib/api";
import PropertyCard from "../components/PropertyCard";
import { PropertySkeleton, EmptyState } from "../components/EnhancedUI";
import SEOHead from "../lib/seo";

const LOCATIONS = ["Bandra West", "Juhu", "Worli", "BKC", "Powai", "South Mumbai"];
const TYPES = [{ v: "apartment", l: "Apartments" }, { v: "villa", l: "Villas" }, { v: "penthouse", l: "Penthouses" }];
const BHKS = [3, 4, 5, 6];
const STATUSES = [{ v: "ready", l: "Ready Possession" }, { v: "under-construction", l: "Under Construction" }];
const COLLECTIONS = [{ v: "luxury", l: "Luxury Collection" }, { v: "signature", l: "Signature" }];

export default function Properties() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [maxPrice, setMaxPrice] = useState(500);
  const [params, setParams] = useSearchParams();

  const filters = {
    location: params.get("location") || "",
    type: params.get("type") || "",
    bhk: params.get("bhk") || "",
    status: params.get("status") || "",
    collection: params.get("collection") || "",
  };

  const setFilter = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next);
  };

  const clearAll = () => setParams(new URLSearchParams());

  useEffect(() => {
    // Replace with Supabase query: supabase.from('properties').select().match(filters)
    setLoading(true);
    listProperties().then((d) => { setAll(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return all.filter(p => {
      if (filters.location && p.location !== filters.location) return false;
      if (filters.type && p.type !== filters.type) return false;
      if (filters.bhk && String(p.bhk) !== String(filters.bhk)) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (filters.collection && p.collection !== filters.collection) return false;
      if (qq && !`${p.name} ${p.location} ${p.tagline || ""}`.toLowerCase().includes(qq)) return false;
      if (maxPrice < 500 && (p.price_numeric || 0) > maxPrice * 10000000) return false;
      return true;
    });
  }, [all, q, maxPrice, filters.location, filters.type, filters.bhk, filters.status, filters.collection]);

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="pt-24 md:pt-28 bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <SEOHead title="Portfolio — Luxury Residences in Mumbai · Aayat Real Estate" description="Browse Aayat's curated portfolio of luxury apartments, penthouses and villas across Mumbai." />
      {/* Header */}
      <section className="bg-[#0A0A0A] text-white py-16 md:py-24 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <span className="label-eyebrow">Portfolio</span>
          <h1 className="font-serif-luxe text-5xl md:text-7xl font-light mt-4 leading-[0.95]">
            Curated luxury <em className="text-[#C8A96A] not-italic">residences</em>.
          </h1>
          <p className="mt-6 text-white/70 font-light max-w-2xl">
            {all.length} residences across Mumbai's most desired addresses. Filter by location, type, configuration and collection.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-20 z-30 bg-[#FAFAFA]/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-b border-black/5 dark:border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-4">
          {/* Row 1: search + price (own row, full width on mobile, half on desktop) */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 mb-3">
            <div className="relative flex-1">
              <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" />
              <input
                data-testid="filter-search"
                value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search residences, locations…"
                className="w-full pl-9 pr-3 h-10 text-sm bg-transparent border border-black/15 dark:border-white/15 focus:border-[#C8A96A] focus:outline-none text-charcoal dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40"
              />
            </div>
            <label className="flex items-center gap-3 text-xs tracking-widest uppercase text-black/60 dark:text-white/60 shrink-0">
              <span className="whitespace-nowrap">Max ₹{maxPrice} Cr</span>
              <input type="range" min="5" max="500" step="5" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}
                data-testid="filter-price" className="w-32 md:w-40 accent-[#C8A96A]" />
            </label>
          </div>
          {/* Row 2: filter chips */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3 pt-3 border-t border-black/5 dark:border-white/5">
            <SlidersHorizontal size={16} strokeWidth={1.5} className="text-black/50 dark:text-white/50 hidden md:block" />
            <FilterSelect testid="filter-location" label="Location" value={filters.location} onChange={(v) => setFilter("location", v)} options={LOCATIONS.map(l => ({ v: l, l }))} />
            <FilterSelect testid="filter-type" label="Type" value={filters.type} onChange={(v) => setFilter("type", v)} options={TYPES} />
            <FilterSelect testid="filter-bhk" label="BHK" value={filters.bhk} onChange={(v) => setFilter("bhk", v)} options={BHKS.map(b => ({ v: String(b), l: `${b} BHK` }))} />
            <FilterSelect testid="filter-status" label="Availability" value={filters.status} onChange={(v) => setFilter("status", v)} options={STATUSES} />
            <FilterSelect testid="filter-collection" label="Collection" value={filters.collection} onChange={(v) => setFilter("collection", v)} options={COLLECTIONS} />
            {(activeCount > 0 || q || maxPrice < 500) && (
              <button onClick={() => { clearAll(); setQ(""); setMaxPrice(500); }} data-testid="filter-clear"
                className="ml-auto text-xs tracking-widest uppercase text-black/60 dark:text-white/60 hover:text-charcoal dark:hover:text-white flex items-center gap-1">
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="mb-8 flex items-center justify-between">
            <p className="text-black/60 text-sm tracking-wider">
              {filtered.length} <span className="uppercase text-[10px] tracking-[0.2em]">residences shown</span>
            </p>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {Array.from({ length: 6 }).map((_, i) => <PropertySkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No matches found." subtitle="Try adjusting your filters or search."
              action={<button className="btn-outline-dark" onClick={() => { clearAll(); setQ(""); setMaxPrice(500); }}>Reset filters</button>} />
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filtered.map((p, i) => <PropertyCard key={p.id} p={p} index={i} />)}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, testid }) {
  return (
    <div className="relative">
      <select
        data-testid={testid}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none pl-3 pr-8 py-2 text-xs tracking-widest uppercase border transition-colors cursor-pointer ${value ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-transparent text-black/70 border-black/15 hover:border-black/40"}`}
      >
        <option value="">{label}</option>
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      <svg className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 ${value ? "text-white" : "text-black/50"}`} viewBox="0 0 20 20" fill="currentColor"><path d="M5 8l5 5 5-5H5z"/></svg>
    </div>
  );
}
