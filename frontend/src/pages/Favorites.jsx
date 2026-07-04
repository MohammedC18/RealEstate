/**
 * Favorites — properties the user has hearted (localStorage).
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listProperties } from "../lib/api";
import { useLocalArray } from "../components/EnhancedUI";
import PropertyCard from "../components/PropertyCard";
import { Heart } from "lucide-react";
import SEOHead from "../lib/seo";

export default function Favorites() {
  const favs = useLocalArray("aayat_favs", 50);
  const [all, setAll] = useState([]);
  useEffect(() => { listProperties().then(setAll).catch(() => {}); }, []);
  const items = all.filter((p) => favs.has(p.id));

  return (
    <div className="pt-24 md:pt-28 bg-[#FAFAFA] dark:bg-[#0A0A0A] min-h-screen">
      <SEOHead title="Your Favourites · Aayat Real Estate" description="Residences you've saved from our curated portfolio." />
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="label-eyebrow flex items-center gap-2"><Heart size={12} /> Your favourites</span>
            <h1 className="font-serif-luxe text-5xl md:text-6xl font-light mt-3 text-charcoal dark:text-white">Saved residences.</h1>
          </div>
          <span className="text-black/50 dark:text-white/50 text-sm">{items.length} saved</span>
        </div>

        {items.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 mx-auto rounded-full border border-[#C8A96A]/40 flex items-center justify-center mb-6">
              <Heart size={22} strokeWidth={1.25} className="text-[#C8A96A]" />
            </div>
            <h3 className="font-serif-luxe text-3xl text-charcoal dark:text-white">No favourites yet.</h3>
            <p className="text-black/50 dark:text-white/50 mt-2">Tap the heart on any residence to save it here.</p>
            <Link to="/properties" className="btn-outline-dark mt-6 inline-flex">Browse Portfolio</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {items.map((p, i) => <PropertyCard key={p.id} p={p} index={i} />)}
          </div>
        )}
      </section>
    </div>
  );
}
