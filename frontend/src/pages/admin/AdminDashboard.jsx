/**
 * AdminDashboard — full-featured admin for Aayat Real Estate.
 * Sections:
 *   · Overview: KPIs + Charts (leads-over-time, sources, statuses, property types, top viewed)
 *   · Properties: table + rich editor with ImageUploader (upload/crop/compress/reorder) + SEO
 *   · Leads: table, mark status, delete
 *   · Testimonials: CRUD with avatar upload
 *   · FAQs: CRUD
 *   · Site Content (CMS): hero / about / footer + analytics IDs + social links
 */
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  LayoutDashboard, Building2, MessageSquareQuote, HelpCircle, Inbox, Settings as SettingsIcon,
  LogOut, Plus, Trash2, Edit3, X, ExternalLink,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import axios from "axios";
import {
  listProperties, createProperty, updateProperty, deleteProperty,
  listTestimonials, createTestimonial, deleteTestimonial,
  listFaqs, createFaq, deleteFaq,
  listLeads, deleteLead, getSettings, updateSettings, API,
} from "../../lib/api";
import ImageUploader from "../../components/ImageUploader";
import { compressToDataUrl } from "../../lib/imageUtils";

const GOLD = "#C8A96A";
const CHARCOAL = "#0A0A0A";
const PIE_COLORS = ["#C8A96A", "#0A0A0A", "#B08856", "#7A6640", "#DCC28A", "#4A3F2A"];

const NAV = [
  { k: "dashboard",    label: "Dashboard",     icon: LayoutDashboard },
  { k: "properties",   label: "Properties",    icon: Building2 },
  { k: "leads",        label: "Leads",         icon: Inbox },
  { k: "testimonials", label: "Testimonials",  icon: MessageSquareQuote },
  { k: "faqs",         label: "FAQs",          icon: HelpCircle },
  { k: "cms",          label: "Site Content",  icon: SettingsIcon },
];

export default function AdminDashboard() {
  const nav = useNavigate();
  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    if (!localStorage.getItem("aayat_admin_token")) nav("/admin/login");
  }, [nav]);

  const logout = () => {
    localStorage.removeItem("aayat_admin_token");
    localStorage.removeItem("aayat_admin_email");
    nav("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex" data-testid="admin-dashboard">
      <aside className="w-64 bg-[#0A0A0A] text-white p-6 hidden md:flex flex-col">
        <Link to="/" className="flex items-baseline gap-2 mb-10" target="_blank" rel="noopener noreferrer">
          <span className="font-serif-luxe text-3xl">Aayat</span>
          <span className="label-eyebrow">Admin</span>
          <ExternalLink size={12} className="ml-1 text-white/40" />
        </Link>
        <nav className="flex-1 space-y-1">
          {NAV.map((n) => (
            <button key={n.k} onClick={() => setTab(n.k)} data-testid={`admin-tab-${n.k}`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors ${tab === n.k ? "bg-[#C8A96A] text-charcoal" : "text-white/70 hover:text-white"}`}>
              <n.icon size={16} strokeWidth={1.5} /> {n.label}
            </button>
          ))}
        </nav>
        <button onClick={logout} data-testid="admin-logout" className="flex items-center gap-2 text-white/60 hover:text-white text-sm mt-6">
          <LogOut size={14} strokeWidth={1.5} /> Sign out
        </button>
      </aside>

      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-[#0A0A0A] text-white overflow-x-auto flex">
        {NAV.map((n) => (
          <button key={n.k} onClick={() => setTab(n.k)}
            className={`px-4 py-3 text-xs whitespace-nowrap ${tab === n.k ? "text-[#C8A96A] border-b border-[#C8A96A]" : "text-white/60"}`}>
            {n.label}
          </button>
        ))}
      </div>

      <main className="flex-1 p-6 md:p-10 pt-16 md:pt-10 overflow-x-hidden">
        {tab === "dashboard" && <Overview />}
        {tab === "properties" && <PropertiesTab />}
        {tab === "leads" && <LeadsTab />}
        {tab === "testimonials" && <TestimonialsTab />}
        {tab === "faqs" && <FaqsTab />}
        {tab === "cms" && <CMSTab />}
      </main>
    </div>
  );
}

function Section({ title, right, children }) {
  return (
    <section>
      <header className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <span className="label-eyebrow">Admin</span>
          <h1 className="font-serif-luxe text-4xl md:text-5xl mt-2 font-light text-charcoal">{title}</h1>
        </div>
        {right}
      </header>
      {children}
    </section>
  );
}

/* -------------------- OVERVIEW WITH CHARTS -------------------- */
function Overview() {
  const [a, setA] = useState(null);
  useEffect(() => {
    axios.get(`${API}/admin/analytics`, {
      headers: { "X-Admin-Token": localStorage.getItem("aayat_admin_token") || "" },
    }).then((r) => setA(r.data)).catch(() => {});
  }, []);
  if (!a) return <Section title="Overview"><div className="text-black/40">Loading analytics…</div></Section>;

  const kpis = [
    { k: a.kpis.properties, l: "Properties" },
    { k: a.kpis.total_leads, l: "Total leads" },
    { k: a.kpis.new_leads, l: "New leads" },
    { k: a.kpis.total_views, l: "Total views" },
  ];

  return (
    <Section title="Overview">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="admin-kpis">
        {kpis.map((k) => (
          <div key={k.l} className="bg-white border border-black/5 p-6">
            <div className="text-xs tracking-widest uppercase text-black/50">{k.l}</div>
            <div className="font-serif-luxe text-4xl mt-2 text-charcoal">{k.k}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <div className="bg-white border border-black/5 p-6 lg:col-span-2">
          <h3 className="font-serif-luxe text-2xl mb-2">Leads · last 30 days</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={a.leads_series}>
              <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="leads" stroke={GOLD} strokeWidth={2} dot={{ r: 3, fill: GOLD }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-black/5 p-6">
          <h3 className="font-serif-luxe text-2xl mb-2">Lead sources</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={a.leads_by_source} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {a.leads_by_source.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-black/5 p-6">
          <h3 className="font-serif-luxe text-2xl mb-2">Portfolio mix</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={a.props_by_type}>
              <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="value" fill={CHARCOAL} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-black/5 p-6">
          <h3 className="font-serif-luxe text-2xl mb-2">Lead status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={a.leads_by_status} layout="vertical">
              <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="value" fill={GOLD} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-black/5 p-6">
          <h3 className="font-serif-luxe text-2xl mb-4">Top viewed</h3>
          <ul className="divide-y divide-black/5">
            {a.top_views.length === 0 && <li className="py-3 text-black/40 text-sm">No views yet.</li>}
            {a.top_views.map((t) => (
              <li key={t.name} className="py-2 flex justify-between text-sm">
                <span className="text-charcoal font-medium truncate">{t.name}</span>
                <span className="text-[#C8A96A]">{t.views}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

/* -------------------- PROPERTIES TAB -------------------- */
function PropertiesTab() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => listProperties().then(setList).catch(() => {});
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this property?")) return;
    await deleteProperty(id); toast.success("Deleted"); load();
  };

  const save = async (data) => {
    try {
      if (editing?.id) await updateProperty(editing.id, { ...editing, ...data });
      else await createProperty({ ...data });
      toast.success("Saved");
      setEditing(null); load();
    } catch { toast.error("Save failed"); }
  };

  return (
    <Section title="Properties" right={
      <button className="btn-gold" onClick={() => setEditing({})} data-testid="admin-add-property">
        <Plus size={14} /> Add Property
      </button>
    }>
      <div className="bg-white border border-black/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F2EB] text-black/60 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-4">Cover</th>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Location</th>
              <th className="text-left p-4">Type</th>
              <th className="text-left p-4">BHK</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4">Views</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t border-black/5">
                <td className="p-4">
                  {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-14 h-10 object-cover" /> : <div className="w-14 h-10 bg-black/5" />}
                </td>
                <td className="p-4 font-medium">{p.name} {p.featured && <span className="ml-1 text-[9px] bg-[#C8A96A] text-charcoal px-1 py-0.5 uppercase tracking-widest">Featured</span>}</td>
                <td className="p-4 text-black/60">{p.location}</td>
                <td className="p-4 text-black/60 capitalize">{p.type}</td>
                <td className="p-4 text-black/60">{p.bhk}</td>
                <td className="p-4 text-[#C8A96A]">{p.price}</td>
                <td className="p-4 text-black/60">{p.views || 0}</td>
                <td className="p-4 text-right">
                  <button onClick={() => setEditing(p)} className="text-black/60 hover:text-charcoal mr-3" data-testid={`admin-edit-${p.id}`}><Edit3 size={14} /></button>
                  <button onClick={() => remove(p.id)} className="text-black/60 hover:text-red-600" data-testid={`admin-delete-${p.id}`}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-black/40">No properties yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && <PropertyForm initial={editing} onSubmit={save} onClose={() => setEditing(null)} />}
    </Section>
  );
}

function PropertyForm({ initial, onSubmit, onClose }) {
  const [f, setF] = useState({
    name: initial.name || "", type: initial.type || "apartment", location: initial.location || "Bandra West",
    price: initial.price || "", price_numeric: initial.price_numeric || 0,
    bhk: initial.bhk || 3, area_sqft: initial.area_sqft || 1500,
    status: initial.status || "ready", collection: initial.collection || "luxury",
    tagline: initial.tagline || "", description: initial.description || "",
    images: initial.images || [], possession: initial.possession || "Ready to Move",
    builder: initial.builder || "", parking: initial.parking || 2,
    featured: initial.featured || false,
    highlights: (initial.highlights || []).join("\n"),
    amenities: (initial.amenities || []).join("\n"),
    badges: (initial.badges || []).join(", "),
    seo_title: initial.seo_title || "",
    seo_description: initial.seo_description || "",
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      ...f,
      bhk: Number(f.bhk), area_sqft: Number(f.area_sqft), parking: Number(f.parking), price_numeric: Number(f.price_numeric || 0),
      highlights: f.highlights.split("\n").map((s) => s.trim()).filter(Boolean),
      amenities: f.amenities.split("\n").map((s) => s.trim()).filter(Boolean),
      badges: f.badges.split(",").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
        className="bg-white w-full max-w-4xl p-8 max-h-[92vh] overflow-y-auto" data-testid="admin-property-form">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif-luxe text-3xl">{initial.id ? "Edit" : "Add"} Property</h3>
          <button type="button" onClick={onClose}><X /></button>
        </div>

        <div className="mb-6">
          <div className="text-[11px] tracking-widest uppercase text-black/60 mb-2">Images</div>
          <ImageUploader value={f.images} onChange={(imgs) => set("images", imgs)} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {[
            ["name", "Name", "text"], ["tagline", "Tagline", "text"], ["location", "Location", "text"],
            ["price", "Price (display, e.g. ₹ 12 Cr onwards)", "text"], ["price_numeric", "Price numeric (₹)", "number"],
            ["bhk", "BHK", "number"], ["area_sqft", "Area (sqft)", "number"],
            ["parking", "Parking", "number"], ["builder", "Builder", "text"], ["possession", "Possession", "text"],
          ].map(([k, l, t]) => (
            <label key={k} className="block">
              <span className="text-[11px] tracking-widest uppercase text-black/60">{l}</span>
              <input type={t} value={f[k]} onChange={(e) => set(k, e.target.value)} className="w-full h-10 px-2 border border-black/15 mt-1" />
            </label>
          ))}
          <label className="block">
            <span className="text-[11px] tracking-widest uppercase text-black/60">Type</span>
            <select value={f.type} onChange={(e) => set("type", e.target.value)} className="w-full h-10 px-2 border border-black/15 mt-1">
              <option value="apartment">Apartment</option><option value="villa">Villa</option><option value="penthouse">Penthouse</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] tracking-widest uppercase text-black/60">Status</span>
            <select value={f.status} onChange={(e) => set("status", e.target.value)} className="w-full h-10 px-2 border border-black/15 mt-1">
              <option value="ready">Ready</option><option value="under-construction">Under Construction</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] tracking-widest uppercase text-black/60">Collection</span>
            <select value={f.collection} onChange={(e) => set("collection", e.target.value)} className="w-full h-10 px-2 border border-black/15 mt-1">
              <option value="luxury">Luxury</option><option value="signature">Signature</option><option value="classic">Classic</option>
            </select>
          </label>
          <label className="flex items-center gap-2 mt-6">
            <input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} />
            <span className="text-[11px] tracking-widest uppercase text-black/60">Featured on homepage</span>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-[11px] tracking-widest uppercase text-black/60">Badges (comma-separated)</span>
            <input value={f.badges} onChange={(e) => set("badges", e.target.value)} className="w-full h-10 px-2 border border-black/15 mt-1" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-[11px] tracking-widest uppercase text-black/60">Highlights (one per line)</span>
            <textarea value={f.highlights} onChange={(e) => set("highlights", e.target.value)} rows={4} className="w-full px-2 py-1 border border-black/15 mt-1" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-[11px] tracking-widest uppercase text-black/60">Amenities (one per line)</span>
            <textarea value={f.amenities} onChange={(e) => set("amenities", e.target.value)} rows={4} className="w-full px-2 py-1 border border-black/15 mt-1" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-[11px] tracking-widest uppercase text-black/60">Description</span>
            <textarea value={f.description} onChange={(e) => set("description", e.target.value)} rows={4} className="w-full px-2 py-1 border border-black/15 mt-1" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-[11px] tracking-widest uppercase text-black/60">SEO title (optional)</span>
            <input value={f.seo_title} onChange={(e) => set("seo_title", e.target.value)} className="w-full h-10 px-2 border border-black/15 mt-1" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-[11px] tracking-widest uppercase text-black/60">SEO description (optional)</span>
            <textarea value={f.seo_description} onChange={(e) => set("seo_description", e.target.value)} rows={2} className="w-full px-2 py-1 border border-black/15 mt-1" />
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button type="button" onClick={onClose} className="btn-outline-dark !py-2 !px-6 text-xs">Cancel</button>
          <button type="submit" className="btn-gold" data-testid="admin-property-save">Save Property</button>
        </div>
      </form>
    </div>
  );
}

/* -------------------- LEADS -------------------- */
function LeadsTab() {
  const [list, setList] = useState([]);
  const load = () => listLeads().then(setList).catch(() => {});
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/leads/${id}`, { status },
        { headers: { "X-Admin-Token": localStorage.getItem("aayat_admin_token") || "" } });
      toast.success("Status updated"); load();
    } catch { toast.error("Failed"); }
  };

  return (
    <Section title="Leads">
      <div className="bg-white border border-black/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F2EB] text-black/60 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-4">Name</th><th className="text-left p-4">Phone</th>
              <th className="text-left p-4">Email</th><th className="text-left p-4">Source</th>
              <th className="text-left p-4">Message</th><th className="text-left p-4">Status</th>
              <th className="text-right p-4"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((l) => (
              <tr key={l.id} className="border-t border-black/5">
                <td className="p-4 font-medium">{l.full_name}</td>
                <td className="p-4 text-black/60"><a href={`tel:${l.phone}`} className="hover:text-[#C8A96A]">{l.phone}</a></td>
                <td className="p-4 text-black/60"><a href={`mailto:${l.email}`} className="hover:text-[#C8A96A]">{l.email}</a></td>
                <td className="p-4"><span className="text-[10px] tracking-widest uppercase bg-[#F5F2EB] px-2 py-1">{l.source}</span></td>
                <td className="p-4 text-black/60 max-w-xs truncate">{l.message || "—"}</td>
                <td className="p-4">
                  <select value={l.status} onChange={(e) => updateStatus(l.id, e.target.value)} className="border border-black/15 h-8 px-2 text-xs">
                    <option value="new">New</option><option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option><option value="closed">Closed</option>
                  </select>
                </td>
                <td className="p-4 text-right"><button onClick={async () => { await deleteLead(l.id); load(); }} className="text-black/50 hover:text-red-600"><Trash2 size={14} /></button></td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-black/40">No leads yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

/* -------------------- TESTIMONIALS -------------------- */
function TestimonialsTab() {
  const [list, setList] = useState([]);
  const [f, setF] = useState({ name: "", role: "", avatar: "", quote: "", rating: 5 });
  const load = () => listTestimonials().then(setList).catch(() => {});
  useEffect(() => { load(); }, []);

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { const dataUrl = await compressToDataUrl(file, { maxSizeMB: 0.15, maxWidthOrHeight: 400 }); setF((p) => ({ ...p, avatar: dataUrl })); }
    catch { toast.error("Upload failed"); }
  };
  const submit = async (e) => {
    e.preventDefault();
    await createTestimonial(f); toast.success("Added");
    setF({ name: "", role: "", avatar: "", quote: "", rating: 5 }); load();
  };

  return (
    <Section title="Testimonials">
      <form onSubmit={submit} className="bg-white border border-black/5 p-6 mb-6 grid sm:grid-cols-2 gap-3 text-sm">
        <input placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="h-10 px-2 border border-black/15" required />
        <input placeholder="Role (e.g. Director, TCS)" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} className="h-10 px-2 border border-black/15" />
        <label className="sm:col-span-2 flex items-center gap-3">
          {f.avatar && <img src={f.avatar} alt="" className="w-12 h-12 object-cover rounded-full" />}
          <input type="file" accept="image/*" onChange={uploadAvatar} className="text-xs" />
          <span className="text-[10px] tracking-widest uppercase text-black/50">Avatar (compressed)</span>
        </label>
        <textarea placeholder="Quote" value={f.quote} onChange={(e) => setF({ ...f, quote: e.target.value })} rows={3} className="px-2 py-2 border border-black/15 sm:col-span-2" required />
        <label className="sm:col-span-2 flex items-center gap-3">
          <span className="text-[10px] tracking-widest uppercase text-black/50">Rating</span>
          <input type="number" min={1} max={5} value={f.rating} onChange={(e) => setF({ ...f, rating: Number(e.target.value) })} className="h-9 w-20 px-2 border border-black/15" />
        </label>
        <button className="btn-gold sm:col-span-2 w-fit">Add Testimonial</button>
      </form>
      <div className="space-y-3">
        {list.map((t) => (
          <div key={t.id} className="bg-white border border-black/5 p-4 flex justify-between items-start gap-4">
            <div className="flex gap-4 items-start">
              {t.avatar ? <img src={t.avatar} alt="" className="w-12 h-12 object-cover rounded-full" /> : <div className="w-12 h-12 bg-[#C8A96A]/10 rounded-full" />}
              <div>
                <div className="font-medium">{t.name} <span className="text-black/50 text-xs">— {t.role}</span></div>
                <p className="text-sm text-black/60 mt-1 max-w-2xl">{t.quote}</p>
              </div>
            </div>
            <button onClick={async () => { await deleteTestimonial(t.id); load(); }} className="text-black/50 hover:text-red-600"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* -------------------- FAQS -------------------- */
function FaqsTab() {
  const [list, setList] = useState([]);
  const [f, setF] = useState({ question: "", answer: "", order: 100 });
  const load = () => listFaqs().then(setList).catch(() => {});
  useEffect(() => { load(); }, []);
  const submit = async (e) => { e.preventDefault(); await createFaq(f); toast.success("Added"); setF({ question: "", answer: "", order: 100 }); load(); };
  return (
    <Section title="FAQs">
      <form onSubmit={submit} className="bg-white border border-black/5 p-6 mb-6 space-y-3 text-sm">
        <input placeholder="Question" value={f.question} onChange={(e) => setF({ ...f, question: e.target.value })} className="w-full h-10 px-2 border border-black/15" required />
        <textarea placeholder="Answer" value={f.answer} onChange={(e) => setF({ ...f, answer: e.target.value })} rows={3} className="w-full px-2 py-2 border border-black/15" required />
        <label className="flex items-center gap-3"><span className="text-[10px] tracking-widest uppercase text-black/50">Sort order</span>
          <input type="number" value={f.order} onChange={(e) => setF({ ...f, order: Number(e.target.value) })} className="h-9 w-24 px-2 border border-black/15" />
        </label>
        <button className="btn-gold">Add FAQ</button>
      </form>
      {list.map((x) => (
        <div key={x.id} className="bg-white border border-black/5 p-4 mb-3 flex justify-between items-start gap-4">
          <div>
            <div className="font-medium">{x.question}</div>
            <p className="text-sm text-black/60 mt-1">{x.answer}</p>
          </div>
          <button onClick={async () => { await deleteFaq(x.id); load(); }} className="text-black/50 hover:text-red-600"><Trash2 size={14} /></button>
        </div>
      ))}
    </Section>
  );
}

/* -------------------- CMS / SITE CONTENT -------------------- */
function CMSTab() {
  const [s, setS] = useState(null);
  useEffect(() => { getSettings().then(setS); }, []);
  if (!s) return <div className="text-black/40">Loading…</div>;
  const set = (k, v) => setS((p) => ({ ...p, [k]: v }));
  const save = async (e) => { e.preventDefault(); await updateSettings(s); toast.success("Saved"); };

  const uploadAbout = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const dataUrl = await compressToDataUrl(file, { maxSizeMB: 0.4, maxWidthOrHeight: 1600 });
    set("about_image", dataUrl); toast.success("About image uploaded");
  };

  return (
    <Section title="Site Content">
      <form onSubmit={save} className="grid lg:grid-cols-2 gap-6 max-w-6xl">
        <Panel title="Company · Contact">
          {["company_name", "phone", "whatsapp", "email", "address"].map((k) => (
            <Field key={k} label={k.replace(/_/g, " ")} value={s[k] || ""} onChange={(v) => set(k, v)} testid={`cms-${k}`} />
          ))}
        </Panel>

        <Panel title="Social Links">
          {["instagram", "linkedin", "facebook"].map((k) => (
            <Field key={k} label={k} value={s[k] || ""} onChange={(v) => set(k, v)} />
          ))}
        </Panel>

        <Panel title="Hero Section">
          <Field label="Hero eyebrow" value={s.hero_eyebrow || ""} onChange={(v) => set("hero_eyebrow", v)} />
          <Field label="Hero headline" value={s.hero_headline || ""} onChange={(v) => set("hero_headline", v)} />
          <Field label="Hero sub-headline" value={s.hero_subheadline || ""} onChange={(v) => set("hero_subheadline", v)} multiline />
          <Field label="Hero video URL" value={s.hero_video_url || ""} onChange={(v) => set("hero_video_url", v)} />
          <Field label="Hero fallback image URL" value={s.hero_fallback_image || ""} onChange={(v) => set("hero_fallback_image", v)} />
        </Panel>

        <Panel title="About Section">
          <Field label="About headline" value={s.about_headline || ""} onChange={(v) => set("about_headline", v)} />
          <Field label="About body" value={s.about_body || ""} onChange={(v) => set("about_body", v)} multiline />
          <div>
            <div className="text-[11px] tracking-widest uppercase text-black/60 mb-1">About image</div>
            {s.about_image && <img src={s.about_image} alt="" className="w-40 h-24 object-cover mb-2 border border-black/10" />}
            <input type="file" accept="image/*" onChange={uploadAbout} className="text-xs" />
          </div>
        </Panel>

        <Panel title="Footer">
          <Field label="Footer tagline" value={s.footer_tagline || ""} onChange={(v) => set("footer_tagline", v)} multiline />
          <Field label="Footer copyright" value={s.footer_note || ""} onChange={(v) => set("footer_note", v)} />
        </Panel>

        <Panel title="Analytics IDs (leave blank to disable)">
          <Field label="Google Analytics 4 ID (G-…)" value={s.ga_id || ""} onChange={(v) => set("ga_id", v)} />
          <Field label="Google Tag Manager ID (GTM-…)" value={s.gtm_id || ""} onChange={(v) => set("gtm_id", v)} />
          <Field label="Microsoft Clarity ID" value={s.clarity_id || ""} onChange={(v) => set("clarity_id", v)} />
          <Field label="Meta Pixel ID" value={s.meta_pixel_id || ""} onChange={(v) => set("meta_pixel_id", v)} />
          <p className="text-[10px] text-black/50 mt-2">Also configurable via REACT_APP_GA_ID / GTM_ID / CLARITY_ID / META_PIXEL_ID env vars.</p>
        </Panel>

        <div className="lg:col-span-2">
          <button className="btn-gold" data-testid="cms-save">Save Site Content</button>
        </div>
      </form>
    </Section>
  );
}

function Panel({ title, children }) {
  return (
    <div className="bg-white border border-black/5 p-6 space-y-3">
      <h3 className="font-serif-luxe text-2xl">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, multiline, testid }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-widest uppercase text-black/60">{label}</span>
      {multiline ? (
        <textarea data-testid={testid} value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full px-2 py-2 border border-black/15 mt-1 text-sm" />
      ) : (
        <input data-testid={testid} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-10 px-2 border border-black/15 mt-1 text-sm" />
      )}
    </label>
  );
}
