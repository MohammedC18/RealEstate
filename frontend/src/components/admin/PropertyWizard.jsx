import { useState } from "react";
import { X, ChevronRight, ChevronLeft, Check, UploadCloud } from "lucide-react";
import ImageUploader from "../../components/ImageUploader";
import { toast } from "sonner";

const TABS = ["Basic", "Location", "Pricing", "Specs", "Amenities", "Media", "SEO"];

export default function PropertyWizard({ initial, onSubmit, onClose }) {
  const [step, setStep] = useState(0);
  
  const [f, setF] = useState({
    name: initial.name || "",
    project_name: initial.project_name || "",
    rera_number: initial.rera_number || "",
    tagline: initial.tagline || "",
    type: initial.type || "apartment",
    status: initial.status || "ready",
    collection: initial.collection || "luxury",
    is_archived: initial.is_archived || false,
    featured: initial.featured || false,

    location: initial.location || "",
    locality: initial.locality || "",
    landmark: initial.landmark || "",
    pincode: initial.pincode || "",
    map_link: initial.map_link || "",

    price_type: initial.price_type || "fixed",
    min_price: initial.min_price || "",
    max_price: initial.max_price || "",
    min_price_unit: initial.min_price_unit || "Crore",
    max_price_unit: initial.max_price_unit || "Crore",

    bhk: initial.bhk || "",
    area_sqft: initial.area_sqft || "",
    carpet_area: initial.carpet_area || "",
    built_up_area: initial.built_up_area || "",
    bathrooms: initial.bathrooms || "",
    balconies: initial.balconies || "",
    parking: initial.parking || "",
    floor_number: initial.floor_number || "",
    total_floors: initial.total_floors || "",
    furnishing_status: initial.furnishing_status || "unfurnished",
    possession: initial.possession || "",
    facing_direction: initial.facing_direction || "",
    property_age: initial.property_age || "",
    
    amenities: (initial.amenities || []).join("\n"),
    highlights: (initial.highlights || []).join("\n"),
    description: initial.description || "",
    builder: initial.builder || "",
    
    images: initial.images || [],
    cover_image: initial.cover_image || "",
    video_url: initial.video_url || "",
    virtual_tour_url: initial.virtual_tour_url || "",
    brochure_pdf: initial.brochure_pdf || "",
    floor_plan: initial.floor_plan || "",
    
    seo_title: initial.seo_title || "",
    seo_description: initial.seo_description || "",
    seo_slug: initial.seo_slug || "",
    seo_keywords: initial.seo_keywords || "",
  });

  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const generateSEO = () => {
    set("seo_title", `${f.name} | Luxury ${f.type} in ${f.location}`);
    set("seo_description", `Discover ${f.name} by ${f.builder}, a premium ${f.type} located in ${f.location}. Explore prices, amenities, and floor plans.`);
    set("seo_slug", f.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    toast.success("SEO details generated automatically.");
  };

  const submit = (e) => {
    e.preventDefault();
    if (f.price_type === "range" && Number(f.min_price) > Number(f.max_price)) {
      toast.error("Minimum price cannot exceed maximum price.");
      setStep(2);
      return;
    }
    
    onSubmit({
      ...f,
      bhk: Number(f.bhk || 0),
      area_sqft: Number(f.area_sqft || 0),
      carpet_area: Number(f.carpet_area || 0),
      built_up_area: Number(f.built_up_area || 0),
      bathrooms: Number(f.bathrooms || 0),
      balconies: Number(f.balconies || 0),
      parking: Number(f.parking || 0),
      total_floors: Number(f.total_floors || 0),
      min_price: Number(f.min_price || 0),
      max_price: Number(f.max_price || 0),
      highlights: f.highlights.split("\n").map(s => s.trim()).filter(Boolean),
      amenities: f.amenities.split("\n").map(s => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden relative shadow-2xl">
        <header className="px-8 py-5 border-b border-black/5 flex justify-between items-center bg-[#F5F2EB]">
          <div>
            <h3 className="font-serif-luxe text-3xl text-charcoal">{initial.id ? "Edit Property" : "Add Property"}</h3>
            <p className="text-xs text-black/50 tracking-widest uppercase mt-1">Multi-step Configuration Wizard</p>
          </div>
          <button type="button" onClick={onClose} className="text-black/40 hover:text-charcoal transition-colors"><X size={24} strokeWidth={1} /></button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-64 border-r border-black/5 bg-white p-6 hidden md:block overflow-y-auto">
            <ul className="space-y-2">
              {TABS.map((t, i) => (
                <li key={t}>
                  <button type="button" onClick={() => setStep(i)} className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors ${step === i ? "bg-[#C8A96A]/10 text-[#C8A96A] font-medium" : "text-black/50 hover:bg-black/5"}`}>
                    {t} {i < step && <Check size={14} />}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <main className="flex-1 p-8 overflow-y-auto bg-white">
            {step === 0 && (
              <div className="space-y-5 animate-in fade-in">
                <h4 className="font-serif-luxe text-2xl mb-6">Basic Information</h4>
                <div className="grid grid-cols-2 gap-5">
                  <Field label="Property Name *" value={f.name} onChange={v => set("name", v)} required />
                  <Field label="Project / Society Name" value={f.project_name} onChange={v => set("project_name", v)} />
                  <Field label="Builder / Developer" value={f.builder} onChange={v => set("builder", v)} />
                  <Field label="RERA Number" value={f.rera_number} onChange={v => set("rera_number", v)} />
                  <label className="block">
                    <span className="text-[11px] tracking-widest uppercase text-black/60">Property Type</span>
                    <select value={f.type} onChange={e => set("type", e.target.value)} className="w-full h-10 px-2 border border-black/15 mt-1 text-sm bg-white">
                      <option value="apartment">Apartment</option><option value="villa">Villa</option><option value="penthouse">Penthouse</option><option value="plot">Plot</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[11px] tracking-widest uppercase text-black/60">Construction Status</span>
                    <select value={f.status} onChange={e => set("status", e.target.value)} className="w-full h-10 px-2 border border-black/15 mt-1 text-sm bg-white">
                      <option value="ready">Ready to Move</option><option value="under-construction">Under Construction</option>
                    </select>
                  </label>
                  <label className="block col-span-2">
                    <span className="text-[11px] tracking-widest uppercase text-black/60">Tagline</span>
                    <input value={f.tagline} onChange={e => set("tagline", e.target.value)} placeholder="e.g. The pinnacle of sea-facing luxury" className="w-full h-10 px-2 border border-black/15 mt-1 text-sm" />
                  </label>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5 animate-in fade-in">
                <h4 className="font-serif-luxe text-2xl mb-6">Location</h4>
                <div className="grid grid-cols-2 gap-5">
                  <Field label="City/Region *" value={f.location} onChange={v => set("location", v)} required />
                  <Field label="Locality / Micro-market" value={f.locality} onChange={v => set("locality", v)} placeholder="e.g. Bandra West" />
                  <Field label="Landmark" value={f.landmark} onChange={v => set("landmark", v)} />
                  <Field label="Pincode" value={f.pincode} onChange={v => set("pincode", v)} />
                  <Field label="Google Maps Link" value={f.map_link} onChange={v => set("map_link", v)} colSpan={2} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-in fade-in">
                <h4 className="font-serif-luxe text-2xl mb-6">Structured Pricing</h4>
                <div className="bg-[#F5F2EB] p-5 border border-black/5 mb-6">
                  <label className="block mb-4">
                    <span className="text-[11px] tracking-widest uppercase text-black/60">Pricing Structure</span>
                    <select value={f.price_type} onChange={e => set("price_type", e.target.value)} className="w-full h-10 px-2 border border-black/15 mt-1 text-sm bg-white">
                      <option value="fixed">Fixed Price (e.g. ₹ 75 Lakh)</option>
                      <option value="range">Price Range (e.g. ₹ 75 Lakh – ₹ 95 Lakh)</option>
                      <option value="starting_from">Starting From (e.g. ₹ 2.5 Cr onwards)</option>
                      <option value="por">Price On Request (POR)</option>
                    </select>
                  </label>

                  {f.price_type !== "por" && (
                    <div className="grid grid-cols-2 gap-5">
                      <div className="flex gap-2">
                        <Field label="Min Price" value={f.min_price} onChange={v => set("min_price", v)} type="number" />
                        <label className="block w-32">
                          <span className="text-[11px] tracking-widest uppercase text-black/60">Unit</span>
                          <select value={f.min_price_unit} onChange={e => set("min_price_unit", e.target.value)} className="w-full h-10 px-2 border border-black/15 mt-1 text-sm bg-white">
                            <option value="Thousand">Thousand</option><option value="Lakh">Lakh</option><option value="Crore">Crore</option>
                          </select>
                        </label>
                      </div>
                      
                      {f.price_type === "range" && (
                        <div className="flex gap-2">
                          <Field label="Max Price" value={f.max_price} onChange={v => set("max_price", v)} type="number" />
                          <label className="block w-32">
                            <span className="text-[11px] tracking-widest uppercase text-black/60">Unit</span>
                            <select value={f.max_price_unit} onChange={e => set("max_price_unit", e.target.value)} className="w-full h-10 px-2 border border-black/15 mt-1 text-sm bg-white">
                              <option value="Thousand">Thousand</option><option value="Lakh">Lakh</option><option value="Crore">Crore</option>
                            </select>
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-black/50 mt-4">The exact legacy price string will be automatically calculated and displayed on the website.</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate-in fade-in">
                <h4 className="font-serif-luxe text-2xl mb-6">Details & Specifications</h4>
                <div className="grid grid-cols-3 gap-5">
                  <Field label="BHK" value={f.bhk} onChange={v => set("bhk", v)} type="number" />
                  <Field label="Bathrooms" value={f.bathrooms} onChange={v => set("bathrooms", v)} type="number" />
                  <Field label="Balconies" value={f.balconies} onChange={v => set("balconies", v)} type="number" />
                  <Field label="Total Area (sqft) *" value={f.area_sqft} onChange={v => set("area_sqft", v)} type="number" required />
                  <Field label="Carpet Area (sqft)" value={f.carpet_area} onChange={v => set("carpet_area", v)} type="number" />
                  <Field label="Built-up Area (sqft)" value={f.built_up_area} onChange={v => set("built_up_area", v)} type="number" />
                  <Field label="Parking Spaces" value={f.parking} onChange={v => set("parking", v)} type="number" />
                  <Field label="Floor Number" value={f.floor_number} onChange={v => set("floor_number", v)} />
                  <Field label="Total Floors" value={f.total_floors} onChange={v => set("total_floors", v)} type="number" />
                  
                  <label className="block">
                    <span className="text-[11px] tracking-widest uppercase text-black/60">Furnishing</span>
                    <select value={f.furnishing_status} onChange={e => set("furnishing_status", e.target.value)} className="w-full h-10 px-2 border border-black/15 mt-1 text-sm bg-white">
                      <option value="unfurnished">Unfurnished</option><option value="semi">Semi-Furnished</option><option value="fully">Fully Furnished</option>
                    </select>
                  </label>
                  <Field label="Facing Direction" value={f.facing_direction} onChange={v => set("facing_direction", v)} />
                  <Field label="Possession Date" value={f.possession} onChange={v => set("possession", v)} placeholder="e.g. Dec 2026" />
                </div>
                <Field label="Description" value={f.description} onChange={v => set("description", v)} multiline colSpan={3} />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5 animate-in fade-in">
                <h4 className="font-serif-luxe text-2xl mb-6">Amenities & Highlights</h4>
                <Field label="Amenities (One per line)" value={f.amenities} onChange={v => set("amenities", v)} multiline placeholder="Swimming Pool\nGym\nClub House\nSecurity" />
                <Field label="Key Highlights (One per line)" value={f.highlights} onChange={v => set("highlights", v)} multiline placeholder="Sea facing\nNear Metro\nPremium Italian Marble" />
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5 animate-in fade-in">
                <h4 className="font-serif-luxe text-2xl mb-6">Rich Media</h4>
                <div>
                  <span className="text-[11px] tracking-widest uppercase text-black/60 mb-2 block">Property Gallery</span>
                  <ImageUploader value={f.images} onChange={imgs => set("images", imgs)} />
                </div>
                <div className="grid grid-cols-2 gap-5 mt-6">
                  <Field label="YouTube Video Walkthrough URL" value={f.video_url} onChange={v => set("video_url", v)} />
                  <Field label="360° Virtual Tour URL" value={f.virtual_tour_url} onChange={v => set("virtual_tour_url", v)} />
                  <Field label="Floor Plan URL (Image/PDF)" value={f.floor_plan} onChange={v => set("floor_plan", v)} />
                  <Field label="Brochure PDF URL" value={f.brochure_pdf} onChange={v => set("brochure_pdf", v)} />
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-serif-luxe text-2xl">Search Engine Optimization</h4>
                  <button type="button" onClick={generateSEO} className="text-xs text-[#C8A96A] font-medium tracking-widest uppercase hover:text-charcoal transition-colors">Auto-generate</button>
                </div>
                <Field label="Meta Title" value={f.seo_title} onChange={v => set("seo_title", v)} />
                <Field label="Meta Description" value={f.seo_description} onChange={v => set("seo_description", v)} multiline />
                <Field label="URL Slug" value={f.seo_slug} onChange={v => set("seo_slug", v)} />
                <Field label="Keywords (Comma separated)" value={f.seo_keywords} onChange={v => set("seo_keywords", v)} />
                
                <div className="mt-8 pt-8 border-t border-black/5">
                  <h4 className="font-serif-luxe text-2xl mb-6">Publish Settings</h4>
                  <label className="flex items-center gap-3 p-4 border border-black/10 bg-[#F5F2EB]">
                    <input type="checkbox" checked={f.featured} onChange={e => set("featured", e.target.checked)} className="w-5 h-5 accent-[#C8A96A]" />
                    <span className="text-sm font-medium">Feature on Homepage</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-black/10 mt-3">
                    <input type="checkbox" checked={f.is_archived} onChange={e => set("is_archived", e.target.checked)} className="w-5 h-5 accent-red-600" />
                    <span className="text-sm font-medium">Save as Draft (Archive / Unpublish)</span>
                  </label>
                </div>
              </div>
            )}
          </main>
        </div>

        <footer className="px-8 py-5 border-t border-black/5 bg-white flex justify-between items-center">
          <button type="button" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="btn-outline-dark !py-2 !px-6 disabled:opacity-30 flex items-center gap-2">
            <ChevronLeft size={16} /> Previous
          </button>
          
          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="text-sm text-black/50 hover:text-black">Cancel</button>
            {step === TABS.length - 1 ? (
              <button type="submit" className="btn-gold !py-2 !px-8 text-sm">Save & Publish</button>
            ) : (
              <button type="button" onClick={() => setStep(s => s + 1)} className="btn-gold !py-2 !px-6 flex items-center gap-2 text-sm">
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </footer>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", multiline = false, required = false, colSpan = 1, placeholder = "" }) {
  return (
    <label className={`block ${colSpan > 1 ? `col-span-${colSpan}` : ""}`}>
      <span className="text-[11px] tracking-widest uppercase text-black/60">{label}</span>
      {multiline ? (
        <textarea required={required} value={value} onChange={e => onChange(e.target.value)} rows={4} placeholder={placeholder} className="w-full px-2 py-2 border border-black/15 mt-1 text-sm bg-white" />
      ) : (
        <input required={required} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full h-10 px-2 border border-black/15 mt-1 text-sm bg-white" />
      )}
    </label>
  );
}
