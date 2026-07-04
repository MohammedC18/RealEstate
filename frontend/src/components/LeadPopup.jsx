/**
 * LeadPopup — appears after ~20s or on exit-intent (desktop).
 * Collects: Full Name, Phone, Email, Preferred Location, Budget, Property Type.
 * Uses React Hook Form + Zod. Submits to backend via createLead().
 *
 * SUPABASE MIGRATION: replace createLead() call with supabase.from('leads').insert().
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createLead } from "../lib/api";

const schema = z.object({
  full_name: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(8, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email"),
  location: z.string().min(1, "Select a preferred location"),
  budget: z.string().min(1, "Select a budget"),
  property_type: z.string().min(1, "Select a property type"),
});

const LOCATIONS = ["Bandra West", "Juhu", "Worli", "BKC", "Powai", "South Mumbai"];
const BUDGETS = ["₹ 3 - 5 Cr", "₹ 5 - 10 Cr", "₹ 10 - 20 Cr", "₹ 20 - 50 Cr", "₹ 50 Cr+"];
const TYPES = ["Apartment", "Villa", "Penthouse"];

export default function LeadPopup() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { full_name: "", phone: "", email: "", location: "", budget: "", property_type: "" },
  });

  useEffect(() => {
    if (sessionStorage.getItem("aayat_lead_shown")) return;
    const t = setTimeout(() => { setOpen(true); sessionStorage.setItem("aayat_lead_shown", "1"); }, 20000);

    const onLeave = (e) => {
      if (e.clientY <= 0 && !sessionStorage.getItem("aayat_lead_shown")) {
        setOpen(true); sessionStorage.setItem("aayat_lead_shown", "1");
      }
    };
    document.addEventListener("mouseleave", onLeave);
    return () => { clearTimeout(t); document.removeEventListener("mouseleave", onLeave); };
  }, []);

  const onSubmit = async (data) => {
    try {
      const message = `Location: ${data.location} | Budget: ${data.budget} | Type: ${data.property_type}`;
      await createLead({ name: data.full_name, phone: data.phone, email: data.email, message: message, source: "Popup: Exit Intent/Delay" });
      setSubmitted(true);
      toast.success("Thank you. Our senior advisor will call within 24 hours.");
      reset();
      setTimeout(() => setOpen(false), 2000);
    } catch (e) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-testid="lead-popup-overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            data-testid="lead-popup"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-[#FAFAFA] border border-black/5 shadow-2xl overflow-hidden"
          >
            <button
              data-testid="lead-popup-close"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-black/60 hover:text-black z-10"
              aria-label="Close"
            >
              <X strokeWidth={1.5} />
            </button>

            <div className="grid md:grid-cols-5">
              <div className="md:col-span-2 bg-[#0A0A0A] p-8 md:p-10 text-white flex flex-col justify-between min-h-[280px]">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={16} strokeWidth={1.5} className="text-[#C8A96A]" />
                    <span className="label-eyebrow">Exclusive Access</span>
                  </div>
                  <h3 className="font-serif-luxe text-3xl md:text-4xl leading-tight font-light">
                    Priority access to new luxury launches.
                  </h3>
                </div>
                <ul className="mt-8 space-y-3 text-sm text-white/80 font-light">
                  <li>— Private previews before public launch</li>
                  <li>— Builder-direct pricing & inaugural offers</li>
                  <li>— Complimentary walkthroughs by senior advisor</li>
                </ul>
              </div>

              <div className="md:col-span-3 p-8 md:p-10">
                {submitted ? (
                  <div data-testid="lead-popup-success" className="h-full flex flex-col items-center justify-center text-center py-8">
                    <div className="w-14 h-14 rounded-full bg-[#C8A96A]/15 border border-[#C8A96A] flex items-center justify-center mb-4">
                      <Sparkles size={22} strokeWidth={1.5} className="text-[#C8A96A]" />
                    </div>
                    <h4 className="font-serif-luxe text-2xl text-charcoal">Thank you.</h4>
                    <p className="text-black/60 mt-2 text-sm">A senior advisor will reach out within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="lead-popup-form">
                    <div>
                      <label className="block text-[11px] tracking-widest uppercase text-black/60 mb-1">Full name</label>
                      <input {...register("full_name")} data-testid="lead-input-name"
                        className="w-full h-11 px-3 bg-transparent border border-black/15 focus:border-[#C8A96A] focus:outline-none text-sm"
                        placeholder="Your name" />
                      {errors.full_name && <p className="text-red-600 text-xs mt-1">{errors.full_name.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] tracking-widest uppercase text-black/60 mb-1">Phone</label>
                        <input {...register("phone")} data-testid="lead-input-phone"
                          className="w-full h-11 px-3 bg-transparent border border-black/15 focus:border-[#C8A96A] focus:outline-none text-sm"
                          placeholder="+91" />
                        {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>}
                      </div>
                      <div>
                        <label className="block text-[11px] tracking-widest uppercase text-black/60 mb-1">Email</label>
                        <input {...register("email")} data-testid="lead-input-email"
                          className="w-full h-11 px-3 bg-transparent border border-black/15 focus:border-[#C8A96A] focus:outline-none text-sm"
                          placeholder="you@example.com" />
                        {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] tracking-widest uppercase text-black/60 mb-1">Location</label>
                        <select {...register("location")} data-testid="lead-select-location"
                          className="w-full h-11 px-2 bg-transparent border border-black/15 focus:border-[#C8A96A] focus:outline-none text-sm">
                          <option value="">Select</option>
                          {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] tracking-widest uppercase text-black/60 mb-1">Budget</label>
                        <select {...register("budget")} data-testid="lead-select-budget"
                          className="w-full h-11 px-2 bg-transparent border border-black/15 focus:border-[#C8A96A] focus:outline-none text-sm">
                          <option value="">Select</option>
                          {BUDGETS.map(b => <option key={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] tracking-widest uppercase text-black/60 mb-1">Type</label>
                        <select {...register("property_type")} data-testid="lead-select-type"
                          className="w-full h-11 px-2 bg-transparent border border-black/15 focus:border-[#C8A96A] focus:outline-none text-sm">
                          <option value="">Select</option>
                          {TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <button type="submit" disabled={isSubmitting} data-testid="lead-submit"
                      className="btn-gold w-full mt-2 disabled:opacity-60">
                      {isSubmitting ? "Submitting..." : "Request Priority Access"}
                    </button>
                    <p className="text-[11px] text-black/40 text-center pt-1">
                      By submitting, you consent to our privacy terms. No spam.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
