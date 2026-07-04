# Aayat Real Estate — PRD

## Original Problem Statement
Award-winning luxury real estate website for Aayat Real Estate, a premium boutique advisory in Mumbai. Editorial homepage, curated property portfolio (apartments, villas, penthouses only), Mumbai-only locations, advanced filters, property details with lightbox gallery, sticky inquiry sidebar, About + Contact pages, lead-gen popup, gated admin dashboard. Frontend-first architecture ready for Supabase.

## Architecture
- React (CRA) + Tailwind CSS + Framer Motion + React Router + React Hook Form + Zod + Lucide + Shadcn.
- FastAPI + MongoDB backend as substitute for Supabase (all service functions in `/lib/api.js` labeled for future migration).
- Fonts: Cormorant Garamond (headings) + Manrope (body). Palette: charcoal + off-white + gold #C8A96A.

## Personas
- HNIs & UHNIs buying primary/second homes in Mumbai
- NRIs seeking discreet advisory + remote transactions
- Investors targeting luxury residential

## Implemented (2026-02-04)
- Cinematic video hero with parallax + fallback image
- Featured / Apartments / Villas collections (data-driven)
- Mumbai locations grid (Bandra, Juhu, Worli, BKC, Powai, South Mumbai)
- Why Choose Us + animated stats (framer-motion whileInView)
- 4-step buying process timeline
- Testimonials, FAQs (accordion), final CTA
- Properties page with filters (Location, Type, BHK, Status, Collection) via URL params
- Property details: lightbox gallery, sticky inquiry sidebar (desktop), mobile bottom CTA, related residences
- About + Contact + Book Site Visit pages, form validation with Zod
- Lead popup (20s + exit-intent), sticky WhatsApp/Call/Back-to-top buttons
- Admin login (`admin@aayat.com` / `aayat2026`) + dashboard (Properties/Testimonials/FAQs/Leads/Settings CRUD)
- Backend seeded with 8 curated properties, 4 testimonials, 6 FAQs

## Backlog (P1/P2)
- Real Google Maps embed & floor plan uploads
- Property image upload via object storage
- Email/WhatsApp notification on new lead
- SEO structured data + sitemap generation
- Property gallery lightbox with Swiper keyboard controls
