/**
 * Footer — CMS-driven luxury editorial footer.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Linkedin, Facebook, MapPin, Phone, Mail } from "lucide-react";
import { getSettings } from "../lib/api";

export default function Footer() {
  const [s, setS] = useState(null);
  useEffect(() => { getSettings().then(setS).catch(() => {}); }, []);

  const company = s?.company_name || "Aayat Real Estate";
  const tagline = s?.footer_tagline || "A curated portfolio of luxury residences across Mumbai's finest addresses.";
  const note = s?.footer_note || `© ${new Date().getFullYear()} Aayat Real Estate. All rights reserved.`;

  return (
    <footer data-testid="site-footer" className="bg-[#0A0A0A] text-white/80 pt-20 pb-10 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
          <div className="md:col-span-5">
            <div className="flex items-baseline gap-3">
              <span className="font-serif-luxe text-4xl md:text-5xl font-light text-white">Aayat</span>
              <span className="label-eyebrow">Real Estate</span>
            </div>
            <p className="mt-6 max-w-md text-white/60 text-base leading-relaxed font-light">
              {tagline}
            </p>
            <div className="flex gap-3 mt-8">
              {s?.instagram && (
                <a data-testid="footer-instagram" href={s.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 flex items-center justify-center border border-white/10 hover:border-[#C8A96A] hover:text-[#C8A96A] transition-colors">
                  <Instagram size={16} strokeWidth={1.5} />
                </a>
              )}
              {s?.linkedin && (
                <a data-testid="footer-linkedin" href={s.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 flex items-center justify-center border border-white/10 hover:border-[#C8A96A] hover:text-[#C8A96A] transition-colors">
                  <Linkedin size={16} strokeWidth={1.5} />
                </a>
              )}
              {s?.facebook && (
                <a data-testid="footer-facebook" href={s.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 flex items-center justify-center border border-white/10 hover:border-[#C8A96A] hover:text-[#C8A96A] transition-colors">
                  <Facebook size={16} strokeWidth={1.5} />
                </a>
              )}
              {s?.whatsapp && (
                <a data-testid="footer-whatsapp" href={`https://wa.me/${s.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-10 h-10 flex items-center justify-center border border-white/10 hover:border-[#C8A96A] hover:text-[#C8A96A] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 0 5.37 0 12a11.94 11.94 0 001.64 6L0 24l6.2-1.62A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12a11.94 11.94 0 00-3.48-8.52zM12 21.82a9.8 9.8 0 01-5-1.36l-.36-.21-3.68.96.98-3.58-.23-.37A9.83 9.83 0 1121.82 12 9.83 9.83 0 0112 21.82z"/></svg>
                </a>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="label-eyebrow mb-6">Navigate</h4>
            <ul className="space-y-3">
              {[["/", "Home"], ["/properties", "Properties"], ["/favorites", "Favourites"], ["/about", "About"], ["/contact", "Contact"], ["/contact?visit=1", "Book Site Visit"]].map(([to, label]) => (
                <li key={label}>
                  <Link to={to} className="text-white/70 hover:text-[#C8A96A] transition-colors font-light">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="label-eyebrow mb-6">Contact</h4>
            <ul className="space-y-4 text-white/70 font-light">
              <li className="flex items-start gap-3">
                <MapPin size={16} strokeWidth={1.5} className="text-[#C8A96A] mt-1 shrink-0" />
                <span>{s?.address || "St Mary Road, Mumbai — 400010, Maharashtra, India"}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} strokeWidth={1.5} className="text-[#C8A96A] mt-1 shrink-0" />
                <a href={`tel:${(s?.phone || "").replace(/[^0-9+]/g, "") || "+919004625459"}`} className="hover:text-[#C8A96A]">{s?.phone || "+91 90046 25459"}</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} strokeWidth={1.5} className="text-[#C8A96A] mt-1 shrink-0" />
                <a href={`mailto:${s?.email || "khangufran18182@gmail.com"}`} className="hover:text-[#C8A96A] break-all">{s?.email || "khangufran18182@gmail.com"}</a>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#C8A96A] mt-1 shrink-0 text-xs tracking-widest uppercase">Hours</span>
                <span>Daily · 11:00 AM – 8:00 PM IST</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="hairline-dark mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs tracking-wider">{note}</p>
          <p className="text-white/40 text-xs tracking-wider">
            RERA Registered · Boutique Advisory · {company}
          </p>
        </div>
      </div>
    </footer>
  );
}
