/**
 * PropertyDetails — premium residence view.
 * Includes:
 *   · Masonry gallery + fullscreen viewer (pinch/zoom/keyboard/swipe)
 *   · Sticky luxury inquiry sidebar with WhatsApp deep-link & callback form
 *   · EMI calculator, Brochure download, Share/Copy link, Favourite, Compare
 *   · Nearby amenities, interactive Google Maps embed
 *   · Recently viewed strip, related residences
 *   · Dynamic SEO tags + JSON-LD Residence schema
 */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, BedDouble, Maximize, Car, CheckCircle2, ArrowUpRight,
  School, Hospital, Train, ShoppingBag, Utensils, Trees,
  Download, Heart, Scale, Share2, Copy, Check,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useOutletContext } from "react-router-dom";
import { getProperty, listProperties, createLead, getSettings, incrementPropertyView } from "../lib/api";
import { waLink } from "../lib/utils";
import PropertyCard from "../components/PropertyCard";
import PropertyGallery from "../components/PropertyGallery";
import EMICalculator from "../components/EMICalculator";
import RecentlyViewed from "../components/RecentlyViewed";
import { useLocalArray } from "../components/EnhancedUI";
import { InlineLoader } from "../components/PremiumLoader";
import { downloadBrochure } from "../lib/brochure";
import { track } from "../lib/telemetry";
import SEOHead, { propertyJsonLd } from "../lib/seo";

const schema = z.object({
  full_name: z.string().min(2, "Please enter your name"),
  phone: z.string().min(8, "Please enter a phone"),
  email: z.string().email(),
  message: z.string().optional(),
});

const NEARBY = [
  { icon: School,      label: "International Schools", items: ["Dhirubhai Ambani (2.4 km)", "Bombay Scottish (1.8 km)", "Ecole Mondiale (3.1 km)"] },
  { icon: Hospital,    label: "Hospitals",             items: ["Lilavati (1.2 km)", "Kokilaben Ambani (3.6 km)", "Holy Family (0.9 km)"] },
  { icon: Train,       label: "Metro & Transit",       items: ["Bandra Metro (0.9 km)", "Bandra Station (1.5 km)", "Sea Link entry (0.6 km)"] },
  { icon: ShoppingBag, label: "Retail & Malls",        items: ["Palladium (4.0 km)", "Linking Road (0.7 km)", "Phoenix (5.2 km)"] },
  { icon: Utensils,    label: "Fine Dining",           items: ["Bandra Bhaji (1.2 km)", "Olive (0.4 km)", "Bastian (0.8 km)"] },
  { icon: Trees,       label: "Parks & Beaches",       items: ["Bandstand (0.5 km)", "Carter Road (0.8 km)", "Joggers Park (1.1 km)"] },
];

function buildWhatsAppMessage(p) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  return [
    `*Hello Aayat Real Estate,*`,
    ``,
    `I'm interested in the following residence:`,
    ``,
    `🏛 *${p.name}*`,
    `📍 ${p.location}, Mumbai`,
    `🛏 ${p.bhk} BHK  ·  📐 ${p.area_sqft} sqft`,
    `💰 ${p.price}`,
    p.status ? `🕒 ${p.status === "ready" ? "Ready to Move" : "Under Construction"}` : "",
    ``,
    `Link: ${url}`,
    ``,
    `Kindly share more details and schedule a visit at your convenience.`,
  ].filter(Boolean).join("\n");
}

export default function PropertyDetails() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [related, setRelated] = useState([]);
  const [settings, setSettings] = useState(null);
  const [copied, setCopied] = useState(false);
  const ctx = useOutletContext();
  const compare = ctx?.compare;
  const favs = useLocalArray("aayat_favs", 50);
  const recent = useLocalArray("aayat_recent", 8);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    getProperty(id).then((data) => { setP(data); track("view_property", { id: data.id, name: data.name }); }).catch(() => {});
    listProperties().then((list) => setRelated(list.filter((x) => x.id !== id).slice(0, 3))).catch(() => {});
    incrementPropertyView(id);
    getSettings().then(setSettings).catch(() => {});
  }, [id]);

  useEffect(() => { if (p?.id) recent.add(p.id); /* eslint-disable-next-line */ }, [p?.id]);

  const onSubmit = async (data) => {
    try {
      await createLead({ ...data, source: `Property: ${p?.name || id}`, property_id: id });
      toast.success("Enquiry received. Our advisor will call within 24 hours.");
      track("lead_submit", { source: `property:${id}` });
      reset();
    } catch { toast.error("Failed. Please try again."); }
  };

  const wa = settings?.whatsapp || "+919004625459";
  const waMsg = p ? waLink(wa, buildWhatsAppMessage(p)) : "#";
  const inFavs = p && favs.has(p.id);
  const inCompare = p && compare?.has(p.id);

  const share = async () => {
    if (!p) return;
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: p.name, text: p.tagline || "", url }); track("share_property", { method: "native", id: p.id }); return; }
      catch { /* user cancelled */ }
    }
    try { await navigator.clipboard.writeText(url); setCopied(true); toast.success("Link copied"); setTimeout(() => setCopied(false), 2000); track("share_property", { method: "copy", id: p.id }); }
    catch { toast.error("Copy failed"); }
  };

  if (!p) return <div className="pt-32 bg-[#FAFAFA] dark:bg-[#0A0A0A] min-h-screen"><InlineLoader label="Preparing residence" /></div>;

  return (
    <div className="pt-20 pb-24 md:pb-0 bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <SEOHead
        title={p.seo_title || `${p.name} — ${p.location} · Aayat Real Estate`}
        description={p.seo_description || (p.tagline || `${p.bhk} BHK ${p.type} in ${p.location}, Mumbai — ${p.price}. ${p.description?.slice(0, 140) || ""}`)}
        image={p.images?.[0]}
        type="article"
        jsonLd={propertyJsonLd(p)}
      />

      {/* Gallery */}
      <PropertyGallery images={p.images || []} name={p.name} />

      {/* Body */}
      <section className="py-14 md:py-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-10 md:gap-12">
          <div className="md:col-span-8">
            <div className="flex items-center gap-3 text-black/50 dark:text-white/50 text-xs">
              <MapPin size={13} strokeWidth={1.5} />
              <span className="tracking-wider">{p.location}, Mumbai</span>
              <span className="w-1 h-1 bg-black/30 dark:bg-white/30 rounded-full" />
              <span className="tracking-wider uppercase text-[10px]">{p.status === "ready" ? "Ready Possession" : "Under Construction"}</span>
            </div>
            <h1 className="font-serif-luxe text-4xl md:text-6xl font-light mt-3 leading-[1.02] text-charcoal dark:text-white">{p.name}</h1>
            {p.tagline && <p className="text-black/60 dark:text-white/60 text-lg font-light mt-2">{p.tagline}</p>}

            {/* Quick action bar */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <button onClick={() => favs.toggle(p.id)} data-testid="pd-favorite"
                className={`inline-flex items-center gap-2 px-3 py-2 border text-xs tracking-widest uppercase transition-colors ${inFavs ? "bg-[#C8A96A] text-charcoal border-[#C8A96A]" : "border-black/15 dark:border-white/15 text-black/70 dark:text-white/70 hover:border-[#C8A96A] hover:text-[#C8A96A]"}`}>
                <Heart size={12} strokeWidth={1.5} className={inFavs ? "fill-charcoal" : ""} /> {inFavs ? "Saved" : "Save"}
              </button>
              {compare && (
                <button onClick={() => compare.toggle(p.id)} data-testid="pd-compare"
                  className={`inline-flex items-center gap-2 px-3 py-2 border text-xs tracking-widest uppercase transition-colors ${inCompare ? "bg-[#C8A96A] text-charcoal border-[#C8A96A]" : "border-black/15 dark:border-white/15 text-black/70 dark:text-white/70 hover:border-[#C8A96A] hover:text-[#C8A96A]"}`}>
                  <Scale size={12} strokeWidth={1.5} /> {inCompare ? "In Compare" : "Compare"}
                </button>
              )}
              <button onClick={share} data-testid="pd-share"
                className="inline-flex items-center gap-2 px-3 py-2 border border-black/15 dark:border-white/15 text-black/70 dark:text-white/70 hover:border-[#C8A96A] hover:text-[#C8A96A] text-xs tracking-widest uppercase transition-colors">
                {copied ? <Check size={12} /> : <Share2 size={12} strokeWidth={1.5} />} Share
              </button>
              <button onClick={async () => { await navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }} data-testid="pd-copy"
                className="inline-flex items-center gap-2 px-3 py-2 border border-black/15 dark:border-white/15 text-black/70 dark:text-white/70 hover:border-[#C8A96A] hover:text-[#C8A96A] text-xs tracking-widest uppercase transition-colors">
                <Copy size={12} strokeWidth={1.5} /> Copy link
              </button>
              <button onClick={() => { downloadBrochure(p); track("download_brochure", { id: p.id }); }} data-testid="pd-brochure"
                className="inline-flex items-center gap-2 px-3 py-2 bg-charcoal dark:bg-white/10 text-white text-xs tracking-widest uppercase hover:bg-[#C8A96A] hover:text-charcoal transition-colors">
                <Download size={12} strokeWidth={1.5} /> Download Brochure
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Stat icon={BedDouble} label="Bedrooms" value={`${p.bhk} BHK`} />
              <Stat icon={Maximize} label="Carpet" value={`${p.area_sqft} sqft`} />
              <Stat icon={Car} label="Parking" value={`${p.parking} bays`} />
              <Stat icon={MapPin} label="Location" value={p.location} />
            </div>

            <div className="mt-12">
              <span className="label-eyebrow">Overview</span>
              <p className="mt-4 text-black/75 dark:text-white/75 leading-relaxed font-light text-lg">{p.description}</p>
            </div>

            {p.highlights?.length > 0 && (
              <div className="mt-12">
                <span className="label-eyebrow">Highlights</span>
                <ul className="mt-4 grid sm:grid-cols-2 gap-3">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3 text-black/75 dark:text-white/75 font-light">
                      <CheckCircle2 size={16} strokeWidth={1.5} className="text-[#C8A96A] mt-1 shrink-0" /> {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {p.amenities?.length > 0 && (
              <div className="mt-12">
                <span className="label-eyebrow">Amenities</span>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                  {p.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 text-black/75 dark:text-white/75 font-light text-sm">
                      <span className="w-1 h-1 bg-[#C8A96A]" /> {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby amenities */}
            <div className="mt-12">
              <span className="label-eyebrow">Nearby amenities</span>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {NEARBY.map((n) => (
                  <motion.div key={n.label}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="border border-black/10 dark:border-white/10 p-5 hover:border-[#C8A96A] transition-colors">
                    <div className="flex items-center gap-2 text-[#C8A96A]"><n.icon size={16} strokeWidth={1.5} /><span className="text-xs tracking-widest uppercase">{n.label}</span></div>
                    <ul className="mt-3 text-sm text-black/70 dark:text-white/70 space-y-1.5 font-light">
                      {n.items.map((i) => <li key={i} className="flex gap-2"><span className="text-[#C8A96A]">—</span> {i}</li>)}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Location on map */}
            <div className="mt-12">
              <span className="label-eyebrow">Location on map</span>
              <div className="mt-4">
                <iframe
                  title={`${p.name} on Google Maps`}
                  data-testid="property-map"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(p.name + ", " + p.location + ", Mumbai, India")}&output=embed`}
                  className="w-full aspect-video border border-black/10 dark:border-white/10"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>

            {/* EMI Calculator */}
            <div className="mt-12">
              <EMICalculator defaultPrice={Math.max(p.price_numeric || 50000000, 10000000)} />
            </div>

            <div className="mt-12 grid sm:grid-cols-2 gap-4">
              <div className="border border-black/10 dark:border-white/10 p-6">
                <span className="label-eyebrow">Builder</span>
                <p className="mt-2 font-serif-luxe text-xl text-charcoal dark:text-white">{p.builder || "Aayat curated"}</p>
              </div>
              <div className="border border-black/10 dark:border-white/10 p-6">
                <span className="label-eyebrow">Possession</span>
                <p className="mt-2 font-serif-luxe text-xl text-charcoal dark:text-white">{p.possession || "—"}</p>
              </div>
            </div>
          </div>

          {/* Sticky inquiry sidebar */}
          <aside className="md:col-span-4">
            <div className="md:sticky md:top-28 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-6 md:p-8 shadow-sm">
              <span className="label-eyebrow">Starting from</span>
              <p className="font-serif-luxe text-4xl text-[#C8A96A] mt-1">{p.price}</p>
              <div className="text-xs text-black/50 dark:text-white/50 mt-1 tracking-wider">All-inclusive · negotiable</div>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3" data-testid="pd-inquiry-form">
                <div>
                  <input {...register("full_name")} placeholder="Full name" data-testid="pd-name"
                    className="w-full h-11 px-3 bg-transparent border border-black/15 dark:border-white/15 focus:border-[#C8A96A] focus:outline-none text-sm text-charcoal dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40" />
                  {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                </div>
                <div>
                  <input {...register("phone")} placeholder="Phone (with country code)" data-testid="pd-phone"
                    className="w-full h-11 px-3 bg-transparent border border-black/15 dark:border-white/15 focus:border-[#C8A96A] focus:outline-none text-sm text-charcoal dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <input {...register("email")} placeholder="Email" data-testid="pd-email"
                    className="w-full h-11 px-3 bg-transparent border border-black/15 dark:border-white/15 focus:border-[#C8A96A] focus:outline-none text-sm text-charcoal dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <textarea {...register("message")} rows={3} placeholder="I'd like to know more…"
                  className="w-full px-3 py-2 bg-transparent border border-black/15 dark:border-white/15 focus:border-[#C8A96A] focus:outline-none text-sm resize-none text-charcoal dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40" />
                <button type="submit" disabled={isSubmitting} className="btn-gold w-full" data-testid="pd-submit">
                  {isSubmitting ? "Sending…" : "Request Callback"}
                </button>
                <a href={waMsg} target="_blank" rel="noopener noreferrer"
                  className="btn-outline-dark w-full dark:!text-white dark:!border-white/40 dark:hover:!bg-white dark:hover:!text-charcoal"
                  data-testid="pd-whatsapp"
                  onClick={() => track("whatsapp_click", { id: p.id })}>
                  WhatsApp Enquiry
                </a>
                <Link to="/contact?visit=1" className="w-full block text-center text-xs uppercase tracking-[0.2em] pt-2 hover:text-[#C8A96A] text-charcoal dark:text-white/70">
                  Book Private Visit →
                </Link>
              </form>
            </div>
          </aside>
        </div>
      </section>

      {/* Recently viewed */}
      <RecentlyViewed excludeId={p.id} />

      {/* Related */}
      {related.length > 0 && (
        <section className="py-16 md:py-20 bg-[#F5F2EB] dark:bg-[#0F0F0F]">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <div className="mb-10">
              <span className="label-eyebrow">You may also like</span>
              <h2 className="font-serif-luxe text-4xl md:text-5xl font-light mt-3 text-charcoal dark:text-white">Related residences</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {related.map((r, i) => <PropertyCard key={r.id} p={r} index={i} />)}
            </div>
            <div className="mt-10 text-center">
              <Link to="/properties" className="btn-outline-dark dark:!text-white dark:!border-white/40 inline-flex items-center gap-2">
                Explore all residences <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Mobile sticky bottom bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0A0A0A] text-white p-3 flex gap-2">
        <a href={waMsg} target="_blank" rel="noopener noreferrer"
          className="btn-outline-light flex-1 py-3 !text-xs" data-testid="pd-whatsapp-mobile">WhatsApp</a>
        <Link to="/contact?visit=1" className="btn-gold flex-1 py-3 !text-xs">Book Visit</Link>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="border border-black/10 dark:border-white/10 p-4">
      <Icon size={16} strokeWidth={1.5} className="text-[#C8A96A]" />
      <div className="text-[10px] tracking-widest uppercase text-black/50 dark:text-white/50 mt-2">{label}</div>
      <div className="font-serif-luxe text-lg mt-0.5 text-charcoal dark:text-white">{value}</div>
    </div>
  );
}
