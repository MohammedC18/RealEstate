/**
 * Home — editorial cinematic homepage.
 * Sections: Hero (video) · Editorial Intro · Featured Luxury · Apartments Collection ·
 * Villas Collection · Mumbai Locations · Why Choose Us · Animated Stats · Buying Process ·
 * Testimonials · Success Stories · FAQs · Final CTA
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Award, ShieldCheck, Users, Sparkles, ChevronDown, Star, Quote, Building2, MapPinned, Handshake, KeyRound } from "lucide-react";
import { listProperties, listTestimonials, listFaqs, listHeroBanners } from "../lib/api";
import PropertyCard from "../components/PropertyCard";

const HERO_VIDEO = "https://videos.pexels.com/video-files/5182061/5182061-hd_1920_1080_30fps.mp4";
const HERO_FALLBACK = "https://images.pexels.com/photos/5414582/pexels-photo-5414582.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=1920";

const LOCATIONS = [
  { name: "Bandra West", tag: "The Queen of the Suburbs", img: "https://images.unsplash.com/photo-1580785692949-7b5b7fd83d25?auto=format&fit=crop&w=1200&q=80" },
  { name: "Juhu", tag: "Beach & Bollywood", img: "https://images.unsplash.com/photo-1562979314-bee7453e911c?auto=format&fit=crop&w=1200&q=80" },
  { name: "Worli", tag: "Sea Face Sophistication", img: "https://images.unsplash.com/photo-1709257260039-5cc911bbd625?auto=format&fit=crop&w=1200&q=80" },
  { name: "BKC", tag: "Mumbai's Business Capital", img: "https://images.pexels.com/photos/34016939/pexels-photo-34016939.jpeg?auto=compress&cs=tinysrgb&w=1200" },
  { name: "Powai", tag: "Lake-side Modern Living", img: "https://images.pexels.com/photos/16573669/pexels-photo-16573669.jpeg?auto=compress&cs=tinysrgb&w=1200" },
  { name: "South Mumbai", tag: "Heritage Grandeur", img: "https://images.pexels.com/photos/8082227/pexels-photo-8082227.jpeg?auto=compress&cs=tinysrgb&w=1200" },
];

const WHY = [
  { icon: Award, title: "Curated Portfolio", body: "Every residence in our portfolio is personally vetted. Location, craftsmanship, developer track record — nothing is left to chance." },
  { icon: ShieldCheck, title: "Discreet Advisory", body: "A boutique team working with a maximum of twelve active clients at a time. Referral-led, confidential and calm." },
  { icon: Users, title: "NRI-First Concierge", body: "From remote walkthroughs to possession, our NRI desk handles every touchpoint so distance is never a compromise." },
  { icon: Sparkles, title: "Builder-Direct Access", body: "Institutional relationships with Mumbai's leading developers unlock private previews and inaugural pricing." },
];

const STATS = [
  { k: "₹ 2,400 Cr+", v: "Transacted portfolio value" },
  { k: "300+", v: "Curated luxury homes closed" },
  { k: "12", v: "Years advising HNI & NRI clients" },
  { k: "98%", v: "Client referral rate" },
];

const PROCESS = [
  { icon: Handshake, title: "Introduction", body: "A confidential conversation to understand your requirements — location, ticket size, timelines and lifestyle preferences." },
  { icon: MapPinned, title: "Curation", body: "We shortlist 6–10 residences from our vetted portfolio, matched precisely to your brief." },
  { icon: Building2, title: "Private Walkthroughs", body: "Senior-advisor-led site visits, developer meetings and technical diligence — arranged around your calendar." },
  { icon: KeyRound, title: "Closure & Beyond", body: "Legal diligence, negotiation, financing coordination and post-possession concierge — end-to-end." },
];

function Counter({ label, value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}
      className="border-t border-white/10 pt-6">
      <div className="font-serif-luxe text-4xl md:text-5xl text-[#C8A96A] font-light">{value}</div>
      <div className="text-white/60 text-xs md:text-sm tracking-wider uppercase mt-2">{label}</div>
    </motion.div>
  );
}

import SEOHead from "../lib/seo";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [hero, setHero] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  useEffect(() => {
    // Replace with Supabase queries later.
    listProperties({ featured: true }).then(setProperties).catch(() => {});
    listTestimonials().then(setTestimonials).catch(() => {});
    listFaqs().then(setFaqs).catch(() => {});
    listHeroBanners().then(banners => {
      const active = banners.filter(b => b.is_active);
      const defaultBanner = active.find(b => b.is_default) || active[0];
      setHero(defaultBanner);
    }).catch(() => {});
  }, []);

  const apartments = properties.filter(p => p.type === "apartment").slice(0, 3);
  const villas = properties.filter(p => p.type === "villa" || p.type === "penthouse").slice(0, 3);

  return (
    <div>
      <SEOHead title="Aayat Real Estate — Luxury Properties in Mumbai" description="A boutique real estate advisory for luxury apartments, penthouses and villas across Mumbai's most desired addresses." />
      {/* ============================================================ HERO */}
      <section ref={heroRef} data-testid="home-hero" className="relative h-[100svh] min-h-[580px] overflow-hidden bg-[#0A0A0A]">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0">
          {hero?.desktop_media?.endsWith('.mp4') || HERO_VIDEO ? (
            <video autoPlay loop muted playsInline poster={hero?.desktop_media?.endsWith('.mp4') ? undefined : hero?.desktop_media || HERO_FALLBACK}
              className="absolute inset-0 w-full h-full object-cover hidden md:block">
              <source src={hero?.desktop_media || HERO_VIDEO} type="video/mp4" />
            </video>
          ) : (
            <img src={hero?.desktop_media || HERO_FALLBACK} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover hidden md:block ken-burns" />
          )}

          {hero?.mobile_media?.endsWith('.mp4') || HERO_VIDEO ? (
            <video autoPlay loop muted playsInline poster={hero?.mobile_media?.endsWith('.mp4') ? undefined : hero?.mobile_media || HERO_FALLBACK}
              className="absolute inset-0 w-full h-full object-cover md:hidden">
              <source src={hero?.mobile_media || HERO_VIDEO} type="video/mp4" />
            </video>
          ) : (
            <img src={hero?.mobile_media || HERO_FALLBACK} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover md:hidden ken-burns" />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80" />
        </motion.div>

        <div className="relative z-10 h-full max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col justify-end pb-20 md:pb-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}>
            <span className="label-eyebrow text-[#C8A96A]">Aayat Real Estate · Mumbai</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.35 }}
            className="font-serif-luxe text-white text-[44px] sm:text-6xl md:text-7xl lg:text-[92px] leading-[0.98] font-light tracking-tight mt-4 max-w-4xl"
            dangerouslySetInnerHTML={{ __html: (hero?.heading || "Live Mumbai.<br /><em class='not-italic text-[#C8A96A]'>Elevated.</em>").replace(/\n/g, "<br/>") }}
          />
          <motion.p
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.55 }}
            className="mt-6 max-w-xl text-white/75 text-base md:text-lg font-light leading-relaxed">
            {hero?.subheading || "A curated portfolio of luxury apartments, penthouses and villas across the city's most desired addresses — from Bandra to Malabar Hill."}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.75 }}
            className="mt-10 flex flex-wrap gap-4">
            <Link to={hero?.cta_link || "/properties"} data-testid="hero-explore" className="btn-gold">{hero?.cta_text || "Explore Portfolio"}</Link>
            <Link to="/contact?visit=1" data-testid="hero-book" className="btn-outline-light">Book Site Visit</Link>
          </motion.div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-[10px] tracking-[0.4em] uppercase flex flex-col items-center gap-2 z-10">
          Scroll
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown strokeWidth={1.5} size={16} />
          </motion.div>
        </div>
      </section>

      {/* ============================================================ EDITORIAL INTRO */}
      <section className="bg-[#FAFAFA] py-16 md:py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <span className="label-eyebrow">A boutique advisory</span>
            <h2 className="font-serif-luxe text-4xl md:text-5xl lg:text-6xl font-light mt-4 leading-[1.05] text-charcoal">
              We do not sell properties.<br /><em className="not-italic text-[#C8A96A]">We compose homes.</em>
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7 flex flex-col justify-end">
            <p className="text-black/70 text-lg leading-relaxed font-light">
              Aayat is a Mumbai-based boutique real estate advisory serving high-net-worth families, NRIs and institutional clients. Every residence in our portfolio is personally vetted for location, craftsmanship, developer credibility and long-term value.
            </p>
            <Link to="/about" className="mt-6 inline-flex items-center gap-2 text-charcoal hover:text-[#C8A96A] transition-colors text-sm tracking-[0.2em] uppercase font-medium">
              Our Story <ArrowUpRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ FEATURED LUXURY */}
      <section className="bg-[#F5F2EB] py-16 md:py-24 lg:py-32" data-testid="featured-luxury">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <span className="label-eyebrow">Featured luxury properties</span>
              <h2 className="font-serif-luxe text-4xl md:text-5xl lg:text-6xl font-light mt-4 leading-[1.05] text-charcoal max-w-2xl">
                A private collection.
              </h2>
            </div>
            <Link to="/properties" className="text-sm tracking-[0.2em] uppercase font-medium hover:text-[#C8A96A] transition-colors flex items-center gap-2">
              View All <ArrowUpRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {properties.slice(0, 6).map((p, i) => <PropertyCard key={p.id} p={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* ============================================================ APARTMENTS COLLECTION */}
      <section className="bg-[#FAFAFA] py-16 md:py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="mb-12">
            <span className="label-eyebrow">Premium apartments collection</span>
            <h2 className="font-serif-luxe text-4xl md:text-5xl lg:text-6xl font-light mt-4 leading-[1.05] text-charcoal">
              City-facing residences.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {apartments.map((p, i) => <PropertyCard key={p.id} p={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* ============================================================ VILLAS COLLECTION */}
      <section className="bg-[#0A0A0A] py-16 md:py-24 lg:py-32 text-white relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <span className="label-eyebrow">Exclusive villas collection</span>
              <h2 className="font-serif-luxe text-4xl md:text-5xl lg:text-6xl font-light mt-4 leading-[1.05]">
                Standalone <em className="text-[#C8A96A] not-italic">grandeur</em>.
              </h2>
            </div>
            <Link to="/properties?type=villa" className="text-sm tracking-[0.2em] uppercase font-medium hover:text-[#C8A96A] transition-colors flex items-center gap-2">
              View Villas <ArrowUpRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {villas.map((p, i) => <PropertyCard key={p.id} p={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* ============================================================ MUMBAI LOCATIONS */}
      <section className="bg-[#FAFAFA] py-16 md:py-24 lg:py-32" data-testid="home-locations">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="mb-12">
            <span className="label-eyebrow">Featured Mumbai locations</span>
            <h2 className="font-serif-luxe text-4xl md:text-5xl lg:text-6xl font-light mt-4 leading-[1.05] text-charcoal">
              The city's finest addresses.
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {LOCATIONS.map((l, i) => (
              <motion.div key={l.name}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.05 }}>
                <Link to={`/properties?location=${encodeURIComponent(l.name)}`}
                  data-testid={`location-${l.name.toLowerCase().replace(/\s/g, '-')}`}
                  className="group block relative aspect-[3/4] md:aspect-[4/5] overflow-hidden img-reveal">
                  <img src={l.img} alt={l.name} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 text-white">
                    <div className="label-eyebrow mb-1">Mumbai</div>
                    <h3 className="font-serif-luxe text-2xl md:text-3xl font-light">{l.name}</h3>
                    <p className="text-white/70 text-xs md:text-sm mt-1 font-light">{l.tag}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ WHY CHOOSE US + STATS */}
      <section className="bg-[#0A0A0A] text-white py-16 md:py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <span className="label-eyebrow">Why choose Aayat</span>
            <h2 className="font-serif-luxe text-4xl md:text-5xl lg:text-6xl font-light mt-4 leading-[1.05]">
              Discretion is our<br /><em className="not-italic text-[#C8A96A]">first product.</em>
            </h2>
            <p className="mt-8 text-white/70 font-light leading-relaxed">
              We are not brokers. We are a small, referral-led advisory that treats every client engagement with the depth, calm and privacy the ticket size demands.
            </p>
          </div>
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {WHY.map((w, i) => (
              <motion.div key={w.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }}
                className="border border-white/10 p-6 hover:border-[#C8A96A] transition-colors">
                <w.icon size={24} strokeWidth={1.25} className="text-[#C8A96A]" />
                <h3 className="font-serif-luxe text-2xl mt-4 font-light">{w.title}</h3>
                <p className="text-white/60 text-sm mt-2 leading-relaxed font-light">{w.body}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-10 mt-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8" data-testid="home-stats">
            {STATS.map((s) => <Counter key={s.v} value={s.k} label={s.v} />)}
          </div>
        </div>
      </section>

      {/* ============================================================ BUYING PROCESS */}
      <section className="bg-[#F5F2EB] py-16 md:py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="mb-16">
            <span className="label-eyebrow">Our buying process</span>
            <h2 className="font-serif-luxe text-4xl md:text-5xl lg:text-6xl font-light mt-4 leading-[1.05] text-charcoal max-w-3xl">
              Four quiet steps to your Mumbai home.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative">
            <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-[#C8A96A]/40 to-transparent" />
            {PROCESS.map((s, i) => (
              <motion.div key={s.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative">
                <div className="w-16 h-16 border border-[#C8A96A] bg-[#FAFAFA] flex items-center justify-center relative z-10">
                  <s.icon size={22} strokeWidth={1.5} className="text-[#C8A96A]" />
                </div>
                <div className="mt-6">
                  <span className="text-[#C8A96A] text-xs tracking-widest">0{i + 1}</span>
                  <h3 className="font-serif-luxe text-2xl mt-1 font-light text-charcoal">{s.title}</h3>
                  <p className="text-black/60 text-sm mt-2 leading-relaxed font-light">{s.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ TESTIMONIALS */}
      <section className="bg-[#FAFAFA] py-16 md:py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="mb-12">
            <span className="label-eyebrow">Client voices</span>
            <h2 className="font-serif-luxe text-4xl md:text-5xl lg:text-6xl font-light mt-4 leading-[1.05] text-charcoal">
              Words from our clients.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {testimonials.slice(0, 4).map((t, i) => (
              <motion.figure key={t.id}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }}
                className="bg-white border border-black/5 p-8 md:p-10 hover:shadow-xl transition-shadow">
                <Quote size={28} strokeWidth={1} className="text-[#C8A96A]" />
                <blockquote className="font-serif-luxe text-xl md:text-2xl font-light leading-snug mt-4 text-charcoal">
                  “{t.quote}”
                </blockquote>
                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-black/5">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className="font-medium text-charcoal">{t.name}</div>
                    <div className="text-black/50 text-xs tracking-wider">{t.role}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: t.rating || 5 }).map((_, k) => <Star key={k} size={12} className="fill-[#C8A96A] text-[#C8A96A]" strokeWidth={1} />)}
                  </div>
                </div>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ FAQS */}
      <section className="bg-[#F5F2EB] py-16 md:py-24 lg:py-32" data-testid="home-faqs">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <span className="label-eyebrow">Questions</span>
            <h2 className="font-serif-luxe text-4xl md:text-5xl font-light mt-4 leading-[1.05] text-charcoal">
              Frequently asked.
            </h2>
            <p className="mt-6 text-black/60 font-light">Can't find what you're looking for? <Link to="/contact" className="text-[#C8A96A] underline underline-offset-4">Speak to an advisor.</Link></p>
          </div>
          <div className="md:col-span-8">
            {faqs.map((f, i) => (
              <div key={f.id} className="border-b border-black/10">
                <button
                  data-testid={`faq-toggle-${i}`}
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full flex items-center justify-between py-6 text-left group">
                  <span className="font-serif-luxe text-xl md:text-2xl font-light text-charcoal pr-8 group-hover:text-[#C8A96A] transition-colors">
                    {f.question}
                  </span>
                  <ChevronDown strokeWidth={1.5} className={`shrink-0 text-[#C8A96A] transition-transform duration-500 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden">
                  <p className="pb-6 pr-12 text-black/70 leading-relaxed font-light">{f.answer}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ FINAL CTA */}
      <section className="relative bg-[#0A0A0A] text-white py-16 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src="https://images.pexels.com/photos/29334668/pexels-photo-29334668.png?auto=compress&cs=tinysrgb&w=1600" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-[#0A0A0A]/60" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <span className="label-eyebrow">Begin the conversation</span>
          <h2 className="font-serif-luxe text-4xl md:text-6xl lg:text-7xl font-light mt-6 leading-[1.05]">
            Find your <em className="not-italic text-[#C8A96A]">Mumbai address.</em>
          </h2>
          <p className="mt-6 text-white/70 text-lg font-light max-w-xl mx-auto">
            Schedule a private consultation with a senior advisor. No obligation, only insight.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/contact?visit=1" className="btn-gold" data-testid="final-cta-book">Book Private Visit</Link>
            <Link to="/properties" className="btn-outline-light" data-testid="final-cta-explore">Explore Portfolio</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
