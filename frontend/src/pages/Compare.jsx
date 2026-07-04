/**
 * Compare — side-by-side comparison of up to 4 properties.
 */
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { listProperties } from "../lib/api";
import { motion } from "framer-motion";

const ROWS = [
  ["Location", "location"], ["Type", "type"], ["BHK", "bhk"],
  ["Area (sqft)", "area_sqft"], ["Parking", "parking"], ["Status", "status"],
  ["Collection", "collection"], ["Builder", "builder"], ["Possession", "possession"], ["Price", "price"],
];

export default function Compare() {
  const [params] = useSearchParams();
  const ids = (params.get("ids") || "").split(",").filter(Boolean);
  const [items, setItems] = useState([]);

  useEffect(() => {
    listProperties().then((all) => setItems(all.filter((p) => ids.includes(p.id)))).catch(() => {});
  }, [params]);

  return (
    <div className="pt-24 md:pt-28 bg-[#FAFAFA] min-h-screen">
      <section className="py-12 md:py-16 max-w-[1400px] mx-auto px-6 md:px-10">
        <span className="label-eyebrow">Comparison</span>
        <h1 className="font-serif-luxe text-4xl md:text-6xl font-light mt-3 text-charcoal">Side-by-side.</h1>
        {items.length === 0 ? (
          <p className="mt-10 text-black/50">No properties selected. <Link to="/properties" className="text-[#C8A96A] underline">Browse</Link> and tap the compare toggle.</p>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm bg-white border border-black/5">
              <thead>
                <tr>
                  <th className="p-4 text-left text-xs uppercase tracking-wider text-black/50 border-b border-black/5">Attribute</th>
                  {items.map((p) => (
                    <th key={p.id} className="p-4 text-left border-b border-black/5">
                      <img src={p.images?.[0]} alt="" className="w-full h-28 object-cover mb-3" />
                      <Link to={`/properties/${p.id}`} className="font-serif-luxe text-xl font-light text-charcoal hover:text-[#C8A96A]">{p.name}</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([label, key]) => (
                  <tr key={key} className="border-b border-black/5">
                    <td className="p-4 text-xs uppercase tracking-wider text-black/50">{label}</td>
                    {items.map((p) => <td key={p.id} className="p-4 text-charcoal">{String(p[key] ?? "—")}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </section>
    </div>
  );
}
