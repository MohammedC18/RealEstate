/**
 * SEOHead — dynamic <head> tags via react-helmet-async.
 * Emits Open Graph, Twitter Card, JSON-LD, and canonical link tags.
 */
import { Helmet } from "react-helmet-async";

export default function SEOHead({
  title = "Aayat Real Estate — Luxury Homes in Mumbai",
  description = "Boutique advisory for luxury apartments, penthouses and villas in Mumbai's finest addresses.",
  image = "https://images.unsplash.com/photo-1580785692949-7b5b7fd83d25?auto=format&fit=crop&w=1600&q=80",
  url,
  type = "website",
  jsonLd,
}) {
  const href = url || (typeof window !== "undefined" ? window.location.href : "");
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={href} />
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={href} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Aayat Real Estate" />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

export function propertyJsonLd(p) {
  return {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: p.name,
    description: p.description,
    address: { "@type": "PostalAddress", addressLocality: p.location, addressRegion: "Maharashtra", addressCountry: "IN" },
    numberOfRooms: p.bhk,
    floorSize: { "@type": "QuantitativeValue", value: p.area_sqft, unitCode: "FTK" },
    image: (p.images || []).slice(0, 6),
  };
}
