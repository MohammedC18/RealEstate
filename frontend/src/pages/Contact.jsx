/**
 * Contact + Book Site Visit page.
 * When ?visit=1 in URL, we emphasise the "Book Site Visit" heading.
 */
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Instagram, Linkedin } from "lucide-react";
import { createLead } from "../lib/api";
import { waLink } from "../lib/utils";

const schema = z.object({
  full_name: z.string().min(2, "Please enter your name"),
  phone: z.string().min(8, "Enter a valid phone"),
  email: z.string().email("Enter a valid email"),
  location: z.string().optional(),
  budget: z.string().optional(),
  property_type: z.string().optional(),
  message: z.string().optional(),
});

const LOCATIONS = ["Bandra West", "Juhu", "Worli", "BKC", "Powai", "South Mumbai"];
const BUDGETS = ["₹ 3 - 5 Cr", "₹ 5 - 10 Cr", "₹ 10 - 20 Cr", "₹ 20 - 50 Cr", "₹ 50 Cr+"];
const TYPES = ["Apartment", "Villa", "Penthouse"];

export default function Contact() {
  const [params] = useSearchParams();
  const isVisit = params.get("visit") === "1";

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => { document.title = isVisit ? "Book Site Visit — Aayat" : "Contact — Aayat"; }, [isVisit]);

  const onSubmit = async (data) => {
    try {
      await createLead({ ...data, source: isVisit ? "book_visit" : "contact" });
      toast.success("Thank you. A senior advisor will reach you shortly.");
      reset();
    } catch { toast.error("Failed. Please try again."); }
  };

  return (
    <div className="pt-24 md:pt-28 bg-[#FAFAFA]">
      <section className="py-16 md:py-24 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <span className="label-eyebrow">{isVisit ? "Book Site Visit" : "Get in touch"}</span>
            <h1 className="font-serif-luxe text-5xl md:text-6xl font-light mt-4 leading-[1.02] text-charcoal">
              {isVisit ? "Schedule a private walkthrough." : "Speak to a senior advisor."}
            </h1>
            <p className="mt-6 text-black/70 font-light leading-relaxed">
              Share a few details and we'll arrange a confidential conversation at your convenience — over a call, at our St Mary Road office, or on-site.
            </p>

            <div className="mt-10 space-y-5">
              <ContactRow icon={MapPin} label="Office" value="St Mary Road, Mumbai — 400010, Maharashtra" />
              <ContactRow icon={Phone} label="Call" value="+91 90046 25459" href="tel:+919004625459" />
              <ContactRow icon={Mail} label="Email" value="khangufran18182@gmail.com" href="mailto:khangufran18182@gmail.com" />
              <ContactRow icon={Clock} label="Hours" value="Daily · 11:00 AM – 8:00 PM IST" />
            </div>

            <div className="mt-8 flex gap-3">
              <a href={waLink("+919004625459")} target="_blank" rel="noopener noreferrer" data-testid="contact-whatsapp"
                className="btn-outline-dark">WhatsApp</a>
              <a href="https://instagram.com/aayat.real.estate" target="_blank" rel="noopener noreferrer" aria-label="Instagram @aayat.real.estate"
                className="w-11 h-11 border border-black/15 flex items-center justify-center hover:border-[#C8A96A] hover:text-[#C8A96A]"><Instagram size={16} strokeWidth={1.5} /></a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                className="w-11 h-11 border border-black/15 flex items-center justify-center hover:border-[#C8A96A] hover:text-[#C8A96A]"><Linkedin size={16} strokeWidth={1.5} /></a>
            </div>
          </div>

          <div className="md:col-span-7">
            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              data-testid="contact-form"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
              className="bg-white border border-black/5 p-6 md:p-10 shadow-sm">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name" error={errors.full_name?.message}>
                  <input {...register("full_name")} data-testid="contact-name" className="input" />
                </Field>
                <Field label="Phone" error={errors.phone?.message}>
                  <input {...register("phone")} data-testid="contact-phone" className="input" />
                </Field>
                <Field label="Email" error={errors.email?.message} className="sm:col-span-2">
                  <input {...register("email")} data-testid="contact-email" className="input" />
                </Field>
                <Field label="Preferred Location">
                  <select {...register("location")} data-testid="contact-location" className="input">
                    <option value="">Select</option>
                    {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Budget">
                  <select {...register("budget")} data-testid="contact-budget" className="input">
                    <option value="">Select</option>
                    {BUDGETS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </Field>
                <Field label="Property Type" className="sm:col-span-2">
                  <select {...register("property_type")} data-testid="contact-type" className="input">
                    <option value="">Select</option>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Message" className="sm:col-span-2">
                  <textarea {...register("message")} rows={4} className="input resize-none" placeholder="Anything specific you'd like us to know…" />
                </Field>
              </div>
              <button type="submit" disabled={isSubmitting} data-testid="contact-submit"
                className="btn-gold mt-6 w-full sm:w-auto">
                {isSubmitting ? "Sending…" : (isVisit ? "Request Site Visit" : "Send Message")}
              </button>
              <p className="text-xs text-black/40 mt-3">Your details are handled with utmost confidentiality.</p>
            </motion.form>
          </div>
        </div>
      </section>

      {/* Google Maps — office location */}
      <section className="pb-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <iframe
            title="Aayat Real Estate — St Mary Road, Mumbai"
            data-testid="contact-map"
            src="https://www.google.com/maps?q=St+Mary+Road,+Mumbai+400010,+Maharashtra&output=embed"
            className="w-full aspect-[21/9] border border-black/10"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>

      <style>{`.input{width:100%;height:44px;padding:0 12px;background:transparent;border:1px solid rgba(0,0,0,0.15);font-size:14px}.input:focus{border-color:#C8A96A;outline:none}textarea.input{height:auto;padding:12px}`}</style>
    </div>
  );
}

function Field({ label, error, className = "", children }) {
  return (
    <div className={className}>
      <label className="block text-[11px] tracking-widest uppercase text-black/60 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}

function ContactRow({ icon: Icon, label, value, href }) {
  const inner = (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 border border-[#C8A96A]/40 flex items-center justify-center text-[#C8A96A] shrink-0">
        <Icon size={16} strokeWidth={1.5} />
      </div>
      <div>
        <div className="text-[10px] tracking-widest uppercase text-black/50">{label}</div>
        <div className="font-serif-luxe text-xl text-charcoal">{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href} className="block hover:opacity-80">{inner}</a> : inner;
}
