/**
 * About — Aayat Real Estate story.
 */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="pt-24 md:pt-28 bg-[#FAFAFA]">
      <section className="py-16 md:py-24 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-6">
            <span className="label-eyebrow">About Aayat</span>
            <h1 className="font-serif-luxe text-5xl md:text-7xl font-light mt-4 leading-[0.98] text-charcoal">
              A quiet obsession with <em className="not-italic text-[#C8A96A]">Mumbai's finest homes</em>.
            </h1>
          </div>
          <div className="md:col-span-6 flex items-end">
            <p className="text-lg text-black/70 font-light leading-relaxed">
              Founded in 2013, Aayat is a boutique advisory serving Mumbai's most discerning families. We are proudly small — deliberately capped at twelve active engagements at a time — because considered service demands presence, not scale.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-6">
          {[
            "https://images.pexels.com/photos/29012720/pexels-photo-29012720.jpeg?auto=compress&cs=tinysrgb&w=1600",
            "https://images.pexels.com/photos/16573669/pexels-photo-16573669.jpeg?auto=compress&cs=tinysrgb&w=1200",
            "https://images.pexels.com/photos/7377669/pexels-photo-7377669.jpeg?auto=compress&cs=tinysrgb&w=1200",
          ].map((img, i) => (
            <motion.div key={img}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className={`overflow-hidden img-reveal ${i === 0 ? "md:col-span-7 aspect-[16/10]" : "md:col-span-5 aspect-[4/3]"}`}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-[#0A0A0A] text-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <span className="label-eyebrow">Our values</span>
          </div>
          <div className="md:col-span-8 space-y-10">
            {[
              { t: "Discretion", d: "Every conversation, walkthrough and transaction is handled with the confidentiality our clients expect." },
              { t: "Craft", d: "We evaluate every residence for architectural quality, developer credibility and long-term liveability." },
              { t: "Time", d: "The right home is worth waiting for. We work only with clients who value considered choice over urgency." },
            ].map((v) => (
              <div key={v.t} className="border-t border-white/10 pt-6">
                <h3 className="font-serif-luxe text-3xl md:text-4xl font-light">{v.t}</h3>
                <p className="text-white/60 mt-3 max-w-xl font-light">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-serif-luxe text-4xl md:text-6xl font-light text-charcoal">Begin the conversation.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn-gold">Contact Aayat</Link>
            <Link to="/properties" className="btn-outline-dark">Explore Portfolio</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
