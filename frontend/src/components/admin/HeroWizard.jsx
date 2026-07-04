import { useState } from "react";
import { X, Check } from "lucide-react";
import ImageUploader from "../../components/ImageUploader";
import { toast } from "sonner";

export default function HeroWizard({ initial, onSubmit, onClose }) {
  const [f, setF] = useState({
    heading: initial.heading || "",
    subheading: initial.subheading || "",
    cta_text: initial.cta_text || "Explore Portfolio",
    cta_link: initial.cta_link || "/properties",
    is_active: initial.is_active !== undefined ? initial.is_active : true,
    is_default: initial.is_default || false,
    desktop_media: initial.desktop_media || "",
    mobile_media: initial.mobile_media || "",
    sort_order: initial.sort_order || 0
  });

  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!f.desktop_media || !f.mobile_media) {
      toast.error("Please upload both desktop and mobile media.");
      return;
    }
    onSubmit({
      ...f,
      sort_order: Number(f.sort_order)
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden relative shadow-2xl">
        <header className="px-8 py-5 border-b border-black/5 flex justify-between items-center bg-[#F5F2EB]">
          <div>
            <h3 className="font-serif-luxe text-3xl text-charcoal">{initial.id ? "Edit Hero Banner" : "Add Hero Banner"}</h3>
            <p className="text-xs text-black/50 tracking-widest uppercase mt-1">Manage Homepage Media</p>
          </div>
          <button type="button" onClick={onClose} className="text-black/40 hover:text-charcoal transition-colors"><X size={24} strokeWidth={1} /></button>
        </header>

        <main className="flex-1 p-8 overflow-y-auto bg-white grid grid-cols-2 gap-8">
          
          <div className="col-span-2 md:col-span-1 space-y-6">
            <div>
              <span className="text-[11px] tracking-widest uppercase text-black/60 mb-2 block">Desktop Media (16:9 / 1920x1080) *</span>
              <ImageUploader 
                value={f.desktop_media ? [f.desktop_media] : []} 
                onChange={imgs => set("desktop_media", imgs[0] || "")} 
              />
            </div>
            
            <div>
              <span className="text-[11px] tracking-widest uppercase text-black/60 mb-2 block">Mobile Media (9:16 / 1080x1920) *</span>
              <ImageUploader 
                value={f.mobile_media ? [f.mobile_media] : []} 
                onChange={imgs => set("mobile_media", imgs[0] || "")} 
              />
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 space-y-5">
            <Field label="Heading *" value={f.heading} onChange={v => set("heading", v)} required />
            <Field label="Subheading *" value={f.subheading} onChange={v => set("subheading", v)} multiline required />
            
            <div className="grid grid-cols-2 gap-4">
              <Field label="CTA Button Text" value={f.cta_text} onChange={v => set("cta_text", v)} />
              <Field label="CTA Button Link" value={f.cta_link} onChange={v => set("cta_link", v)} />
            </div>

            <Field label="Sort Order" value={f.sort_order} onChange={v => set("sort_order", v)} type="number" />
            
            <div className="pt-4 mt-4 border-t border-black/5 space-y-3">
              <label className="flex items-center gap-3 p-3 border border-black/10 bg-[#F5F2EB]">
                <input type="checkbox" checked={f.is_active} onChange={e => set("is_active", e.target.checked)} className="w-5 h-5 accent-[#C8A96A]" />
                <span className="text-sm font-medium">Banner is Active</span>
              </label>
              
              <label className="flex items-center gap-3 p-3 border border-black/10">
                <input type="checkbox" checked={f.is_default} onChange={e => set("is_default", e.target.checked)} className="w-5 h-5 accent-[#C8A96A]" />
                <span className="text-sm font-medium">Set as Default Banner (replaces others)</span>
              </label>
            </div>
          </div>

        </main>

        <footer className="px-8 py-5 border-t border-black/5 bg-white flex justify-end items-center gap-4">
          <button type="button" onClick={onClose} className="text-sm text-black/50 hover:text-black">Cancel</button>
          <button type="submit" className="btn-gold !py-2 !px-8 text-sm">Save Banner</button>
        </footer>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", multiline = false, required = false }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-widest uppercase text-black/60">{label}</span>
      {multiline ? (
        <textarea required={required} value={value} onChange={e => onChange(e.target.value)} rows={3} className="w-full px-2 py-2 border border-black/15 mt-1 text-sm bg-white" />
      ) : (
        <input required={required} type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-10 px-2 border border-black/15 mt-1 text-sm bg-white" />
      )}
    </label>
  );
}
