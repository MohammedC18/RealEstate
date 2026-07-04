/**
 * NotFound — 404 page.
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6" data-testid="not-found">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        className="text-center max-w-lg">
        <span className="label-eyebrow">Lost in the city</span>
        <h1 className="font-serif-luxe text-7xl md:text-9xl font-light mt-6"><em className="not-italic text-[#C8A96A]">404</em></h1>
        <p className="text-white/60 mt-4 font-light">The address you're looking for doesn't exist in our portfolio.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-gold">Back Home</Link>
          <Link to="/properties" className="btn-outline-light">Browse Residences</Link>
        </div>
      </motion.div>
    </div>
  );
}
