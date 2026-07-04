/**
 * PremiumLoader — cinematic Aayat splash used on initial mount and route transitions.
 */
import { motion } from "framer-motion";

export default function PremiumLoader({ label = "Preparing your portfolio" }) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#0A0A0A] flex flex-col items-center justify-center" data-testid="premium-loader">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="font-serif-luxe text-6xl md:text-7xl text-[#C8A96A] font-light tracking-tight">
          Aayat
        </div>
        <div className="mt-3 text-white/50 text-[10px] tracking-[0.4em] uppercase">
          Real Estate · Mumbai
        </div>
      </motion.div>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 240 }}
        transition={{ duration: 1.8, ease: [0.2, 0.8, 0.2, 1] }}
        className="mt-10 h-px bg-[#C8A96A]"
      />
      <div className="mt-6 text-white/40 text-[10px] tracking-[0.3em] uppercase">{label}</div>
    </div>
  );
}

export function InlineLoader({ label = "Loading" }) {
  return (
    <div className="flex flex-col items-center justify-center py-24" data-testid="inline-loader">
      <div className="w-10 h-10 border border-[#C8A96A]/30 border-t-[#C8A96A] rounded-full animate-spin" />
      <div className="mt-4 text-black/40 text-[10px] tracking-[0.3em] uppercase">{label}</div>
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", subtitle = "Please try again.", onRetry }) {
  return (
    <div className="py-20 text-center" data-testid="error-state">
      <div className="w-16 h-16 mx-auto rounded-full border border-red-400/30 flex items-center justify-center mb-6">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h3 className="font-serif-luxe text-2xl text-charcoal">{title}</h3>
      <p className="text-black/50 mt-2">{subtitle}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline-dark mt-6">Try again</button>
      )}
    </div>
  );
}
