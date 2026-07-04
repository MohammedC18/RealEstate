/**
 * AdminLogin — mock login screen. Credentials seeded in backend:
 *   admin@aayat.com / aayat2026
 * Stores token in localStorage. Replace with supabase.auth.signIn later.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { adminLogin } from "../../lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@aayat.com");
  const [pw, setPw] = useState("aayat2026");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const { token } = await adminLogin(email, pw);
      localStorage.setItem("aayat_admin_token", token);
      localStorage.setItem("aayat_admin_email", email);
      toast.success("Welcome back.");
      nav("/admin");
    } catch {
      setErrorMsg("Invalid email or password.");
      toast.error("Invalid credentials.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        data-testid="admin-login-form"
        className="w-full max-w-md bg-[#111] border border-white/10 p-8 md:p-10">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-serif-luxe text-3xl text-white">Aayat</span>
          <span className="label-eyebrow">Admin</span>
        </Link>
        <div className="mt-8 flex items-center gap-2 text-[#C8A96A]"><ShieldCheck size={16} strokeWidth={1.5} /> <span className="text-xs tracking-widest uppercase">Secure area</span></div>
        <h1 className="font-serif-luxe text-3xl text-white mt-3 font-light">Sign in.</h1>
        <div className="mt-8 space-y-4">
          <div>
            <label className="block text-[11px] tracking-widest uppercase text-white/50 mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} data-testid="admin-email"
              className="w-full h-11 px-3 bg-transparent border border-white/15 text-white focus:border-[#C8A96A] focus:outline-none text-sm" />
          </div>
          <div>
            <label className="block text-[11px] tracking-widest uppercase text-white/50 mb-1">Password</label>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} data-testid="admin-password"
              className="w-full h-11 px-3 bg-transparent border border-white/15 text-white focus:border-[#C8A96A] focus:outline-none text-sm" />
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full mt-2" data-testid="admin-login-submit">
            {loading ? "Signing in…" : "Sign in"}
          </button>
          {errorMsg && (
            <p data-testid="admin-login-error" role="alert" className="text-red-400 text-xs text-center pt-1">
              {errorMsg}
            </p>
          )}
          <p className="text-[11px] text-white/40 text-center pt-2">Demo — admin@aayat.com / aayat2026</p>
        </div>
      </motion.form>
    </div>
  );
}
