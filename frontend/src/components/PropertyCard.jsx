/**
 * PropertyCard — used across Home & Properties list.
 * Editorial-style card with hover reveal, luxury badges, and quick actions.
 */
import { Link, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, BedDouble, Maximize, ArrowUpRight, Scale } from "lucide-react";
import { waLink } from "../lib/utils";
import { FavoriteHeart, useLocalArray } from "./EnhancedUI";

export default function PropertyCard({ p, index = 0 }) {
  const favs = useLocalArray("aayat_favs", 50);
  const ctx = useOutletContext();
  const compare = ctx?.compare;
  const inCompare = compare?.has(p.id);
  return (
    <motion.article
      data-testid={`property-card-${p.id}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: index * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
      className="group bg-white border border-black/5 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
    >
      <Link to={`/properties/${p.id}`} className="block">
        <div className="relative img-reveal aspect-[4/3] bg-black/5 overflow-hidden group/gallery">
          <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar">
            {p.images?.length > 0 ? (
              p.images.slice(0, 3).map((img, idx) => (
                <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
                  <img src={img} alt={`${p.name} - ${idx}`} loading="lazy" className="w-full h-full object-cover" />
                </div>
              ))
            ) : (
              <div className="w-full h-full flex-shrink-0 bg-black/10 flex items-center justify-center text-xs text-black/40">No Image</div>
            )}
          </div>
          {p.images?.length > 1 && (
            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5 z-20 pointer-events-none md:opacity-0 group-hover/gallery:opacity-100 transition-opacity">
              {p.images.slice(0, 3).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/70 shadow-sm" />
              ))}
            </div>
          )}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4 z-10">
            <div className="flex flex-wrap gap-2">
              {p.badges?.slice(0, 2).map((b) => (
                <span key={b} className="text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 bg-white/95 text-charcoal font-medium">
                  {b}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <FavoriteHeart id={p.id} favs={favs} />
              {compare && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); compare.toggle(p.id); }}
                  data-testid={`compare-${p.id}`}
                  className={`w-9 h-9 rounded-full backdrop-blur flex items-center justify-center transition-colors ${inCompare ? "bg-[#C8A96A] text-charcoal" : "bg-white/95 text-charcoal hover:bg-white"}`}
                  aria-label={inCompare ? "Remove from compare" : "Add to compare"}
                >
                  <Scale size={14} strokeWidth={1.5} />
                </button>
              )}
              <span className="text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 bg-[#0A0A0A] text-[#C8A96A] font-medium">
                {p.status === "ready" ? "Ready" : "Under Construction"}
              </span>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 text-black/50 text-xs">
            <MapPin size={13} strokeWidth={1.5} />
            <span className="tracking-wider">{p.location}</span>
          </div>
          <h3 className="mt-2 font-serif-luxe text-2xl md:text-[26px] font-light text-charcoal leading-tight">
            {p.name}
          </h3>
          {p.tagline && <p className="text-black/50 text-sm mt-1 font-light">{p.tagline}</p>}

          <div className="flex items-center justify-between mt-6 pt-5 border-t border-black/5">
            <div>
              <span className="text-[10px] tracking-widest uppercase text-black/40">Starting</span>
              <p className="font-serif-luxe text-xl text-[#C8A96A] font-medium">{p.price}</p>
            </div>
            <div className="text-right text-xs text-black/60 space-y-1">
              <div className="flex items-center justify-end gap-1.5">
                <BedDouble size={13} strokeWidth={1.5} /> {p.bhk} BHK
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <Maximize size={13} strokeWidth={1.5} /> {p.area_sqft} sqft
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-2 border-t border-black/5">
        <Link
          to={`/properties/${p.id}`}
          data-testid={`property-view-${p.id}`}
          className="flex items-center justify-center gap-2 py-3.5 text-[11px] tracking-[0.2em] uppercase font-medium text-charcoal hover:bg-[#0A0A0A] hover:text-white transition-colors"
        >
          View <ArrowUpRight size={14} strokeWidth={1.5} />
        </Link>
        <a
          href={waLink("+919004625459", `Hi Aayat, I'm interested in ${p.name}.`)}
          target="_blank" rel="noopener noreferrer"
          data-testid={`property-whatsapp-${p.id}`}
          className="flex items-center justify-center gap-2 py-3.5 text-[11px] tracking-[0.2em] uppercase font-medium text-charcoal border-l border-black/5 hover:bg-[#C8A96A] hover:text-charcoal transition-colors"
        >
          WhatsApp
        </a>
      </div>
    </motion.article>
  );
}
