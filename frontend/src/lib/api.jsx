/**
 * Aayat Real Estate — API service layer
 * Frontend-first architecture. Currently wired to our FastAPI backend.
 *
 * SUPABASE MIGRATION NOTE:
 *   Every function below is written so it can be replaced by a Supabase
 *   equivalent later (e.g. supabase.from('properties').select()). The
 *   consuming components will not need to change — they only import
 *   the exported service functions.
 */
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({ baseURL: API, timeout: 15000 });

// Attach admin token if present
client.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("aayat_admin_token");
  if (token) cfg.headers["Authorization"] = `Bearer ${token}`;
  return cfg;
});

/* ---------------- Properties ---------------- */
// Replace with: supabase.from('properties').select('*').match(filters)
export const listProperties = (params = {}) =>
  client.get("/properties", { params }).then((r) => r.data);

export const getProperty = (id) =>
  client.get(`/properties/${id}`).then((r) => r.data);

export const createProperty = (payload) =>
  client.post("/properties", payload).then((r) => r.data);

export const updateProperty = (id, payload) =>
  client.put(`/properties/${id}`, payload).then((r) => r.data);

export const deleteProperty = (id) =>
  client.delete(`/properties/${id}`).then((r) => r.data);

export const bulkPropertyAction = (action, ids) =>
  client.post("/properties/bulk", { action, ids }).then((r) => r.data);

export const incrementPropertyView = (id) =>
  client.post(`/properties/${id}/view`).then((r) => r.data).catch(() => {});

/* ---------------- Leads ---------------- */
// Replace with: supabase.from('leads').insert(payload)
export const createLead = (payload) =>
  client.post("/leads", payload).then((r) => r.data);

export const listLeads = () =>
  client.get("/leads").then((r) => r.data);

export const deleteLead = (id) =>
  client.delete(`/leads/${id}`).then((r) => r.data);

/* ---------------- Testimonials ---------------- */
// Replace with: supabase.from('testimonials').select()
export const listTestimonials = () =>
  client.get("/testimonials").then((r) => r.data);

export const createTestimonial = (payload) =>
  client.post("/testimonials", payload).then((r) => r.data);

export const deleteTestimonial = (id) =>
  client.delete(`/testimonials/${id}`).then((r) => r.data);

/* ---------------- FAQs ---------------- */
// Replace with: supabase.from('faqs').select().order('order')
export const listFaqs = () =>
  client.get("/faqs").then((r) => r.data);

export const createFaq = (payload) =>
  client.post("/faqs", payload).then((r) => r.data);

export const deleteFaq = (id) =>
  client.delete(`/faqs/${id}`).then((r) => r.data);

/* ---------------- Hero Banners ---------------- */
export const listHeroBanners = () =>
  client.get("/hero").then((r) => r.data);

export const createHeroBanner = (payload) =>
  client.post("/hero", payload).then((r) => r.data);

export const updateHeroBanner = (id, payload) =>
  client.put(`/hero/${id}`, payload).then((r) => r.data);

export const deleteHeroBanner = (id) =>
  client.delete(`/hero/${id}`).then((r) => r.data);

/* ---------------- Settings ---------------- */
// Replace with: supabase.from('settings').select().eq('id','singleton').single()
export const getSettings = () =>
  client.get("/settings").then((r) => r.data);

export const updateSettings = (payload) =>
  client.put("/settings", payload).then((r) => r.data);

/* ---------------- Admin auth ---------------- */
// Replace with: supabase.auth.signInWithPassword()
export const adminLogin = (email, password) =>
  client.post("/admin/login", { email, password }).then((r) => r.data);
