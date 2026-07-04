/**
 * brochure — generate a luxury 1-page PDF brochure per property (client-side).
 * No server round-trip — uses jsPDF and inlines the first two images (base64 or URL).
 */
import jsPDF from "jspdf";

const GOLD = [200, 169, 106];
const CHARCOAL = [10, 10, 10];

async function toDataUrl(src) {
  if (!src) return null;
  if (src.startsWith("data:")) return src;
  try {
    const res = await fetch(src, { mode: "cors" });
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  } catch { return null; }
}

export async function downloadBrochure(p) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  // Hero image
  const hero = await toDataUrl(p.images?.[0]);
  if (hero) {
    try { doc.addImage(hero, "JPEG", 0, 0, pw, 110, undefined, "FAST"); } catch { /* ignore */ }
  }
  // Overlay gradient bar
  doc.setFillColor(...CHARCOAL);
  doc.rect(0, 100, pw, 12, "F");
  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("AAYAT REAL ESTATE  ·  MUMBAI", 12, 108);

  // Title
  doc.setTextColor(...CHARCOAL);
  doc.setFontSize(24);
  doc.setFont("helvetica", "normal");
  doc.text(p.name || "Residence", 12, 128);

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`${p.location || ""} · Mumbai`, 12, 135);

  // Price row
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.line(12, 142, pw - 12, 142);
  doc.setFontSize(14);
  doc.setTextColor(...GOLD);
  doc.text(p.price || "Price on request", 12, 152);
  doc.setFontSize(9);
  doc.setTextColor(...CHARCOAL);
  doc.text(`${p.bhk || "—"} BHK   ·   ${p.area_sqft || "—"} sqft   ·   ${p.parking || 1} parking   ·   ${p.status || ""}`.toUpperCase(), 12, 158);

  // Description
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const desc = doc.splitTextToSize(p.description || "", pw - 24);
  doc.text(desc.slice(0, 8), 12, 168);

  // Highlights
  if (p.highlights?.length) {
    doc.setFontSize(9);
    doc.setTextColor(...GOLD);
    doc.text("HIGHLIGHTS", 12, 210);
    doc.setTextColor(...CHARCOAL);
    doc.setFontSize(9);
    p.highlights.slice(0, 6).forEach((h, i) => {
      doc.text(`•  ${h}`, 12, 216 + i * 5);
    });
  }

  // Second image (small)
  const second = await toDataUrl(p.images?.[1]);
  if (second) {
    try { doc.addImage(second, "JPEG", pw - 82, 205, 70, 45, undefined, "FAST"); } catch { /* ignore */ }
  }

  // Footer
  doc.setDrawColor(200, 200, 200);
  doc.line(12, ph - 20, pw - 12, ph - 20);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Aayat Real Estate  ·  +91 90046 25459  ·  khangufran18182@gmail.com", 12, ph - 12);
  doc.setTextColor(...GOLD);
  doc.text("aayatrealestate.com", pw - 12, ph - 12, { align: "right" });

  doc.save(`${(p.name || "aayat-residence").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-brochure.pdf`);
}
