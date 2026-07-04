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
  LogOut, Plus, Trash2, Edit3, X, ExternalLink, BookOpen, ChevronRight, User
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import axios from "axios";
import {
  listProperties, createProperty, updateProperty, deleteProperty,
  listTestimonials, createTestimonial, deleteTestimonial,
  listFaqs, createFaq, deleteFaq,
  listLeads, deleteLead, getSettings, updateSettings, API, bulkPropertyAction,
  listHeroBanners, createHeroBanner, updateHeroBanner, deleteHeroBanner
} from "../../lib/api";
import ImageUploader from "../../components/ImageUploader";
import { compressToDataUrl } from "../../lib/imageUtils";
import PropertyWizard from "../../components/admin/PropertyWizard";
import HeroWizard from "../../components/admin/HeroWizard";

const GOLD = "#C8A96A";
const CHARCOAL = "#0A0A0A";
const PIE_COLORS = ["#C8A96A", "#0A0A0A", "#B08856", "#7A6640", "#DCC28A", "#4A3F2A"];

const NAV = [
  { k: "dashboard",    label: "Dashboard",     icon: LayoutDashboard },
  { k: "properties",   label: "Properties",    icon: Building2 },
  { k: "leads",        label: "Leads",         icon: Inbox },
  { k: "testimonials", label: "Testimonials",  icon: MessageSquareQuote },
  { k: "faqs",         label: "FAQs",          icon: HelpCircle },
  { k: "heroes",       label: "Hero Banners",  icon: ExternalLink },
  { k: "cms",          label: "Site Content",  icon: SettingsIcon },
  { k: "help",         label: "User Guide",    icon: BookOpen },
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
      <TourOverlay />
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
        {tab === "heroes" && <HeroBannersTab />}
        {tab === "cms" && <CMSTab />}
        {tab === "help" && <HelpTab />}
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
      headers: { "Authorization": `Bearer ${localStorage.getItem("aayat_admin_token") || ""}` },
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
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const load = () => listProperties().then(setList).catch(() => {});
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this property?")) return;
    await deleteProperty(id); toast.success("Property Deleted", { description: "The listing has been permanently removed." }); load();
  };

  const save = async (data) => {
    try {
      if (editing?.id) { await updateProperty(editing.id, { ...editing, ...data }); toast.success("Property Updated", { description: "Changes are live on the website." }); }
      else { await createProperty({ ...data }); toast.success("Property Published", { description: "The new listing is now live in the portfolio." }); }
      setEditing(null); load();
    } catch { toast.error("Save failed"); }
  };

  const handleBulk = async (action) => {
    if (selected.length === 0) return;
    if (action === 'delete' && !window.confirm(`Delete ${selected.length} properties?`)) return;
    try {
      await bulkPropertyAction(action, selected);
      toast.success(`Bulk ${action} successful`);
      setSelected([]);
      load();
    } catch {
      toast.error("Bulk action failed");
    }
  };

  const toggleSelect = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };
  
  const filteredList = list.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !(p.project_name || "").toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== "all" && p.type !== filterType) return false;
    if (filterStatus !== "all") {
      if (filterStatus === "archived" && !p.is_archived) return false;
      if (filterStatus === "featured" && !p.featured) return false;
      if (filterStatus === "ready" && p.status !== "ready") return false;
      if (filterStatus === "under-construction" && p.status !== "under-construction") return false;
    }
    return true;
  });

  const stats = {
    total: list.length,
    featured: list.filter(p => p.featured).length,
    archived: list.filter(p => p.is_archived).length,
    ready: list.filter(p => p.status === 'ready').length
  };

  return (
    <Section title="Properties" right={
      <button className="btn-gold" onClick={() => setEditing({})} data-testid="admin-add-property">
        <Plus size={14} /> Add Property
      </button>
    }>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-black/5 p-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-black/50">Total Properties</div>
          <div className="text-2xl font-serif-luxe text-charcoal">{stats.total}</div>
        </div>
        <div className="bg-white border border-black/5 p-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-black/50">Featured</div>
          <div className="text-2xl font-serif-luxe text-[#C8A96A]">{stats.featured}</div>
        </div>
        <div className="bg-white border border-black/5 p-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-black/50">Ready to Move</div>
          <div className="text-2xl font-serif-luxe text-charcoal">{stats.ready}</div>
        </div>
        <div className="bg-white border border-black/5 p-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-black/50">Archived</div>
          <div className="text-2xl font-serif-luxe text-red-800/60">{stats.archived}</div>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-4 bg-white p-3 border border-black/5 gap-3">
        <div className="flex flex-wrap gap-3">
          <input placeholder="Search properties..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 px-3 border border-black/15 text-sm w-64" />
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="h-9 px-3 border border-black/15 text-sm bg-white">
            <option value="all">All Types</option><option value="apartment">Apartment</option><option value="villa">Villa</option><option value="penthouse">Penthouse</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-9 px-3 border border-black/15 text-sm bg-white">
            <option value="all">All Status</option><option value="featured">Featured</option><option value="archived">Archived</option><option value="ready">Ready</option><option value="under-construction">Under Construction</option>
          </select>
        </div>
        
        {selected.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#C8A96A] mr-2">{selected.length} selected</span>
            <select onChange={e => { handleBulk(e.target.value); e.target.value=""; }} className="h-9 px-3 border border-black/15 text-sm bg-white">
              <option value="">Bulk Actions...</option>
              <option value="feature">Feature</option>
              <option value="unfeature">Unfeature</option>
              <option value="archive">Archive</option>
              <option value="unarchive">Unarchive (Publish)</option>
              <option value="duplicate">Duplicate</option>
              <option value="delete">Delete</option>
            </select>
          </div>
        )}
      </div>

      {/* ---- Mobile card grid ---- */}
      <div className="md:hidden space-y-3">
        {filteredList.length === 0 && (
          <div className="bg-white border border-black/5 p-12 text-center flex flex-col items-center justify-center text-black/40">
            <Building2 size={40} strokeWidth={1} className="mb-3 text-[#C8A96A]/50" />
            <p className="font-serif-luxe text-2xl text-charcoal mb-1">No properties found</p>
            <button className="btn-gold !py-2 !text-xs mt-4" onClick={() => setEditing({})}>Add Property</button>
          </div>
        )}
        {filteredList.map(p => (
          <div key={p.id} className={`bg-white border border-black/5 p-4 ${p.is_archived ? 'opacity-60' : ''}`}>
            <div className="flex gap-3">
              <input type="checkbox" className="mt-1" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} />
              {(p.cover_image || p.images?.[0])
                ? <img src={p.cover_image || p.images[0]} alt="" className="w-16 h-12 object-cover border border-black/10 shrink-0" />
                : <div className="w-16 h-12 bg-black/5 shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-charcoal text-sm truncate">
                  {p.name} {p.featured && <span className="text-[9px] bg-[#C8A96A] text-charcoal px-1 py-0.5 uppercase tracking-widest ml-1">Featured</span>}
                </div>
                <div className="text-xs text-black/50">{p.type} {p.bhk ? `• ${p.bhk} BHK` : ''} • {p.location}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[#C8A96A] font-medium text-sm">{p.price}</span>
                  <span className="text-xs text-black/40">{p.views || 0} views</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border ${p.is_archived ? 'border-red-300 text-red-700' : 'border-[#C8A96A]/40 text-[#C8A96A]'}`}>
                    {p.is_archived ? 'Archived' : 'Published'}
                  </span>
                  <div className="flex gap-3">
                    <button onClick={() => setEditing(p)} className="text-black/60 hover:text-charcoal"><Edit3 size={15} /></button>
                    <button onClick={() => remove(p.id)} className="text-black/60 hover:text-red-600"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---- Desktop table ---- */}
      <div className="hidden md:block bg-white border border-black/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F2EB] text-black/60 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 w-12 text-center">
                <input type="checkbox" checked={selected.length === filteredList.length && filteredList.length > 0} onChange={(e) => setSelected(e.target.checked ? filteredList.map(x=>x.id) : [])} />
              </th>
              <th className="text-left p-4">Cover</th>
              <th className="text-left p-4">Property</th>
              <th className="text-left p-4">Location</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4">Views</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((p) => (
              <tr key={p.id} className={`border-t border-black/5 ${p.is_archived ? 'opacity-60 bg-black/5' : ''}`}>
                <td className="p-4 text-center">
                  <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                </td>
                <td className="p-4">
                  {(p.cover_image || p.images?.[0]) ? <img src={p.cover_image || p.images[0]} alt="" className="w-14 h-10 object-cover border border-black/10" /> : <div className="w-14 h-10 bg-black/5" />}
                </td>
                <td className="p-4">
                  <div className="font-medium text-charcoal">{p.name} {p.featured && <span className="ml-1 text-[9px] bg-[#C8A96A] text-charcoal px-1 py-0.5 uppercase tracking-widest">Featured</span>}</div>
                  <div className="text-xs text-black/50">{p.type} • {p.bhk ? p.bhk + " BHK" : ""}</div>
                </td>
                <td className="p-4 text-black/60">{p.location}</td>
                <td className="p-4 text-[#C8A96A] font-medium">{p.price}</td>
                <td className="p-4 text-black/60">{p.views || 0}</td>
                <td className="p-4 text-black/60 capitalize">
                  {p.is_archived ? <span className="text-red-700 font-medium">Archived</span> : "Published"}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => setEditing(p)} className="text-black/60 hover:text-charcoal mr-3" data-testid={`admin-edit-${p.id}`}><Edit3 size={14} /></button>
                  <button onClick={() => remove(p.id)} className="text-black/60 hover:text-red-600" data-testid={`admin-delete-${p.id}`}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {filteredList.length === 0 && (
              <tr>
                <td colSpan={8} className="p-20 text-center">
                  <div className="flex flex-col items-center justify-center text-black/40">
                    <Building2 size={48} strokeWidth={1} className="mb-4 text-[#C8A96A]/50" />
                    <p className="font-serif-luxe text-3xl text-charcoal mb-2">No properties found</p>
                    <p className="text-sm max-w-sm mx-auto mb-6">Adjust your search/filters or click "Add Property" to curate a listing.</p>
                    <button className="btn-gold !py-2 !text-xs" onClick={() => setEditing({})}>Add Property</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && <PropertyWizard initial={editing} onSubmit={save} onClose={() => setEditing(null)} />}
    </Section>
  );
}

/* -------------------- LEADS -------------------- */
function LeadsTab() {
  const [list, setList] = useState([]);
  const load = () => listLeads().then(setList).catch(() => {});
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("aayat_admin_token") || "";
      await axios.put(`${API}/leads/${id}`, { status },
        { headers: { "Authorization": `Bearer ${token}` } });
      toast.success("Lead Status Updated", { description: "The customer's inquiry status has been changed." }); load();
    } catch { toast.error("Failed"); }
  };

  return (
    <Section title="Leads">
      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {list.length === 0 && (
          <div className="bg-white border border-black/5 p-12 text-center flex flex-col items-center justify-center text-black/40">
            <Inbox size={40} strokeWidth={1} className="mb-3 text-[#C8A96A]/50" />
            <p className="font-serif-luxe text-2xl text-charcoal mb-1">No inquiries yet</p>
            <p className="text-xs max-w-xs mx-auto">When clients fill out the contact form, their details will appear here.</p>
          </div>
        )}
        {list.map(l => (
          <div key={l.id} className="bg-white border border-black/5 p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-charcoal">{l.name}</div>
                <a href={`tel:${l.phone}`} className="text-sm text-[#C8A96A]">{l.phone}</a>
              </div>
              <button onClick={async () => { await deleteLead(l.id); load(); }} className="text-black/40 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
            <a href={`mailto:${l.email}`} className="text-xs text-black/60 mt-1 block hover:text-[#C8A96A]">{l.email}</a>
            {l.message && <p className="text-xs text-black/50 mt-2 line-clamp-2">{l.message}</p>}
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] tracking-widest uppercase bg-[#F5F2EB] px-2 py-1">{l.source}</span>
              <select value={l.status} onChange={(e) => updateStatus(l.id, e.target.value)} className="border border-black/15 h-8 px-2 text-xs">
                <option value="new">New</option><option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option><option value="closed">Closed</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white border border-black/5 overflow-x-auto">
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
                <td className="p-4 font-medium">{l.name}</td>
                <td className="p-4 text-black/60"><a href={`tel:${l.phone}`} className="hover:text-[#C8A96A]">{l.phone}</a></td>
                <td className="p-4 text-black/60"><a href={`mailto:${l.email}`} className="hover:text-[#C8A96A]">{l.email}</a></td>
                <td className="p-4"><span className="text-[10px] tracking-widest uppercase bg-[#F5F2EB] px-2 py-1">{l.source}</span></td>
                <td className="p-4 text-black/60 max-w-xs truncate" title={l.message || "—"}>{l.message || "—"}</td>
                <td className="p-4">
                  <select value={l.status} onChange={(e) => updateStatus(l.id, e.target.value)} className="border border-black/15 h-8 px-2 text-xs">
                    <option value="new">New</option><option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option><option value="closed">Closed</option>
                  </select>
                </td>
                <td className="p-4 text-right"><button onClick={async () => { await deleteLead(l.id); load(); }} className="text-black/50 hover:text-red-600"><Trash2 size={14} /></button></td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="p-20 text-center">
                  <div className="flex flex-col items-center justify-center text-black/40">
                    <Inbox size={48} strokeWidth={1} className="mb-4 text-[#C8A96A]/50" />
                    <p className="font-serif-luxe text-3xl text-charcoal mb-2">No inquiries yet</p>
                    <p className="text-sm max-w-sm mx-auto mb-6">When prospective clients fill out the contact form or request a site visit, their details will appear here.</p>
                  </div>
                </td>
              </tr>
            )}
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
    await createTestimonial(f); toast.success("Testimonial Published", { description: "Client quote is now visible on the site." });
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
      
      {list.length === 0 && (
        <div className="bg-white border border-black/5 p-16 text-center flex flex-col items-center justify-center text-black/40">
          <MessageSquareQuote size={48} strokeWidth={1} className="mb-4 text-[#C8A96A]/50" />
          <p className="font-serif-luxe text-3xl text-charcoal mb-2">No client stories</p>
          <p className="text-sm max-w-sm mx-auto">Use the form above to add your first client testimonial and build trust.</p>
        </div>
      )}

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
  const submit = async (e) => { e.preventDefault(); await createFaq(f); toast.success("FAQ Added", { description: "Question is now live." }); setF({ question: "", answer: "", order: 100 }); load(); };
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

      {list.length === 0 && (
        <div className="bg-white border border-black/5 p-16 text-center flex flex-col items-center justify-center text-black/40 mb-3">
          <HelpCircle size={48} strokeWidth={1} className="mb-4 text-[#C8A96A]/50" />
          <p className="font-serif-luxe text-3xl text-charcoal mb-2">No FAQs</p>
          <p className="text-sm max-w-sm mx-auto">Add frequently asked questions to help your customers quickly find answers.</p>
        </div>
      )}

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
  const save = async (e) => { e.preventDefault(); await updateSettings(s); toast.success("Site Content Saved", { description: "Changes have been successfully applied." }); };

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

/* -------------------- TOUR OVERLAY -------------------- */
function TourOverlay() {
  const [show, setShow] = useState(() => !localStorage.getItem("aayat_admin_tour"));
  const [step, setStep] = useState(0);

  if (!show) return null;

  const steps = [
    { title: "Welcome to Aayat Admin", text: "This is your premium command center for managing the portfolio. Let's take a quick tour." },
    { title: "Dashboard", text: "View high-level analytics, lead sources, and portfolio mix at a glance." },
    { title: "Properties", text: "Add, edit, or remove luxury listings. You can crop, compress, and reorder images effortlessly." },
    { title: "Leads", text: "Manage incoming inquiries and track their status from 'New' to 'Closed'." },
    { title: "Site Content", text: "Control the hero section, about details, and footer directly without writing code." },
    { title: "User Guide", text: "Need help? The comprehensive user guide is always available here." }
  ];

  const next = () => {
    if (step === steps.length - 1) {
      localStorage.setItem("aayat_admin_tour", "1");
      setShow(false);
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="bg-white max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-black/5">
          <motion.div className="h-full bg-[#C8A96A]" initial={{ width: 0 }} animate={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
        <span className="label-eyebrow mb-2 block">Step {step + 1} of {steps.length}</span>
        <h3 className="font-serif-luxe text-3xl mb-3 text-charcoal">{steps[step].title}</h3>
        <p className="text-sm text-black/60 leading-relaxed mb-8">{steps[step].text}</p>
        <div className="flex justify-between items-center">
          <button onClick={() => { localStorage.setItem("aayat_admin_tour", "1"); setShow(false); }} className="text-xs tracking-widest uppercase text-black/40 hover:text-charcoal transition-colors">Skip Tour</button>
          <button onClick={next} className="btn-gold !py-2 !px-6 !text-xs">
            {step === steps.length - 1 ? "Get Started" : "Next"} <ChevronRight size={14} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* -------------------- HELP / USER GUIDE -------------------- */
function HelpTab() {
  return (
    <Section title="User Guide">
      <div className="max-w-4xl bg-white border border-black/5 p-8 md:p-12 space-y-12">
        <div>
          <h2 className="font-serif-luxe text-3xl border-b border-black/10 pb-4 mb-6">Login & Security</h2>
          <div className="space-y-4 text-sm text-black/70 font-light">
            <p><strong className="font-medium text-charcoal">Login:</strong> Access the portal via <code className="bg-black/5 px-1 py-0.5 text-xs text-charcoal">/admin/login</code> using your secure credentials.</p>
            <p><strong className="font-medium text-charcoal">Logout:</strong> Click the "Sign out" button at the bottom of the sidebar. This clears your active session securely.</p>
            <p><strong className="font-medium text-charcoal">Change Password:</strong> The authentication architecture is currently API-driven. Future iterations will expose this in Settings. Contact development for urgent resets.</p>
          </div>
        </div>

        <div>
          <h2 className="font-serif-luxe text-3xl border-b border-black/10 pb-4 mb-6">Dashboard</h2>
          <div className="space-y-4 text-sm text-black/70 font-light">
            <p>The dashboard provides a bird's-eye view of your operations:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="font-medium text-charcoal">KPI Cards:</strong> Track total published properties, overall lead volume, fresh leads, and cumulative portfolio views.</li>
              <li><strong className="font-medium text-charcoal">Leads Series Chart:</strong> Visualize inquiry volume over the last 30 days to gauge marketing performance.</li>
              <li><strong className="font-medium text-charcoal">Sources & Status:</strong> Analyze which channels (e.g., Contact Form vs Book Visit) drive the most value.</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="font-serif-luxe text-3xl border-b border-black/10 pb-4 mb-6">Properties</h2>
          <div className="space-y-4 text-sm text-black/70 font-light">
            <p><strong className="font-medium text-charcoal">Adding/Editing:</strong> Click "Add Property" to open the rich editor. Fill in specifications, pricing, builder, and possession date.</p>
            <p><strong className="font-medium text-charcoal">Featured Status:</strong> Check "Featured on homepage" to display the listing prominently in the main hero carousel.</p>
            <p><strong className="font-medium text-charcoal">Images & Uploads:</strong> The image uploader automatically compresses large files (up to 1600px width/height and &lt; 400KB) to maintain rapid page load times. Supported formats include JPG, PNG, and WebP. Drag to reorder images; the first image acts as the primary cover.</p>
            <p><strong className="font-medium text-charcoal">Deletion:</strong> Clicking the trash icon permanently removes a listing. This action cannot be undone.</p>
          </div>
        </div>

        <div>
          <h2 className="font-serif-luxe text-3xl border-b border-black/10 pb-4 mb-6">Leads & Customers</h2>
          <div className="space-y-4 text-sm text-black/70 font-light">
            <p><strong className="font-medium text-charcoal">Viewing:</strong> All inquiries appear instantly in the table.</p>
            <p><strong className="font-medium text-charcoal">Status Updates:</strong> Use the dropdown to update a lead's status (New → Contacted → Qualified → Closed) to keep your pipeline organized.</p>
            <p><strong className="font-medium text-charcoal">Follow-up:</strong> Click on a phone number to launch your dialer, or email to launch your mail client. For WhatsApp, ensure the number format includes the country code.</p>
          </div>
        </div>
        
        <div>
          <h2 className="font-serif-luxe text-3xl border-b border-black/10 pb-4 mb-6">Testimonials & FAQs</h2>
          <div className="space-y-4 text-sm text-black/70 font-light">
            <p><strong className="font-medium text-charcoal">Testimonials:</strong> Add client name, their role/company, a 1-5 star rating, and their quote. The avatar upload follows the same compression rules as property images.</p>
            <p><strong className="font-medium text-charcoal">FAQs:</strong> Add questions and answers. Use the "Sort order" field (lower numbers appear first) to arrange them logically on the frontend.</p>
          </div>
        </div>

        <div>
          <h2 className="font-serif-luxe text-3xl border-b border-black/10 pb-4 mb-6">Site Content (CMS)</h2>
          <div className="space-y-4 text-sm text-black/70 font-light">
            <p>Control global text and settings centrally without touching code. Update your phone number, social links, hero text, and SEO metadata. Save to instantly reflect changes on the live site.</p>
            <p><strong className="font-medium text-charcoal">Analytics IDs:</strong> Paste your Google Analytics (G-XXXX), Tag Manager, Meta Pixel, or Microsoft Clarity IDs here to automatically enable telemetry and tracking.</p>
          </div>
        </div>

        <div className="bg-[#F5F2EB] p-8 text-center mt-12 border border-black/5">
          <p className="text-sm font-medium text-charcoal mb-2">Need technical support?</p>
          <p className="text-xs text-black/60 font-light">Contact your designated development partner: <a href="https://yourportfolio.com" className="text-[#C8A96A] hover:underline">Mohammed Chunawala</a></p>
        </div>
      </div>
    </Section>
  );
}


/* -------------------- HERO BANNERS TAB -------------------- */
function HeroBannersTab() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => listHeroBanners().then(setList).catch(() => {});
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    await deleteHeroBanner(id); toast.success("Banner deleted"); load();
  };

  const save = async (data) => {
    try {
      if (editing?.id) { await updateHeroBanner(editing.id, data); toast.success("Banner updated"); }
      else { await createHeroBanner(data); toast.success("Banner created"); }
      setEditing(null); load();
    } catch { toast.error("Save failed"); }
  };

  return (
    <Section title="Hero Banners" right={<button className="btn-gold" onClick={() => setEditing({})}><Plus size={14} /> Add Banner</button>}>
      <div className="bg-white border border-black/5 overflow-hidden">
        <table className="w-full text-sm hidden md:table">
          <thead className="bg-[#F5F2EB] text-black/60 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-4">Desktop / Mobile</th>
              <th className="text-left p-4">Content</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((h) => (
              <tr key={h.id} className="border-t border-black/5">
                <td className="p-4 flex gap-2 items-center">
                  <div className="relative w-20 h-12 bg-black/5 border border-black/10 flex items-center justify-center overflow-hidden">
                    {h.desktop_media.endsWith('.mp4') ? <span className="text-[9px] uppercase tracking-widest text-black/40">Video</span> : <img src={h.desktop_media} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="relative w-8 h-12 bg-black/5 border border-black/10 flex items-center justify-center overflow-hidden">
                    {h.mobile_media.endsWith('.mp4') ? <span className="text-[9px] uppercase tracking-widest text-black/40">Video</span> : <img src={h.mobile_media} alt="" className="w-full h-full object-cover" />}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-serif-luxe text-lg text-charcoal">{h.heading}</div>
                  <div className="text-xs text-black/50 line-clamp-1">{h.subheading}</div>
                </td>
                <td className="p-4">
                  {h.is_default && <span className="text-[10px] uppercase tracking-widest bg-[#C8A96A] text-charcoal px-2 py-1 mr-2">Default</span>}
                  {h.is_active ? <span className="text-green-700 font-medium">Active</span> : <span className="text-red-700 font-medium">Inactive</span>}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => setEditing(h)} className="text-black/60 hover:text-charcoal mr-3"><Edit3 size={14} /></button>
                  <button onClick={() => remove(h.id)} className="text-black/60 hover:text-red-600"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={4} className="p-10 text-center text-black/50">No hero banners found.</td></tr>
            )}
          </tbody>
        </table>
        <div className="md:hidden flex flex-col">
          {list.map(h => (
            <div key={h.id} className="p-4 border-b border-black/5 flex flex-col gap-3">
              <div className="flex gap-2">
                <img src={h.desktop_media} className="w-16 h-10 object-cover border border-black/10" />
                <div className="flex-1">
                  <div className="font-serif-luxe text-base text-charcoal">{h.heading}</div>
                  <div className="text-xs text-black/50 line-clamp-1">{h.subheading}</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  {h.is_default && <span className="text-[10px] uppercase tracking-widest bg-[#C8A96A] text-charcoal px-2 py-1 mr-2">Default</span>}
                  {h.is_active ? <span className="text-green-700 text-xs">Active</span> : <span className="text-red-700 text-xs">Inactive</span>}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setEditing(h)}><Edit3 size={16} /></button>
                  <button onClick={() => remove(h.id)} className="text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {editing && <HeroWizard initial={editing} onSubmit={save} onClose={() => setEditing(null)} />}
    </Section>
  );
}
