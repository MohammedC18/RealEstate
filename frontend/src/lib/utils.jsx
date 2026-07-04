import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** WhatsApp deeplink builder */
export function waLink(phone, text = "Hi Aayat, I'm interested in a luxury property.") {
  const clean = (phone || "").replace(/[^0-9]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

/** Tel deeplink */
export function telLink(phone) {
  return `tel:${(phone || "").replace(/[^0-9+]/g, "")}`;
}

/** Format INR nicely */
export function inr(n) {
  if (!n && n !== 0) return "";
  if (n >= 10000000) return `₹ ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹ ${(n / 100000).toFixed(1)} L`;
  return `₹ ${n.toLocaleString("en-IN")}`;
}
