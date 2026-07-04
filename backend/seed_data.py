"""Seed data for Aayat Real Estate. Populated into MongoDB on first startup."""
import uuid
from datetime import datetime, timezone


def _now(): return datetime.now(timezone.utc).isoformat()


def prop(**kwargs):
    base = {
        "id": str(uuid.uuid4()),
        "tagline": None, "price_numeric": 0, "parking": 2,
        "collection": "luxury", "badges": [], "images": [],
        "amenities": [], "highlights": [], "description": "",
        "builder": "Aayat Signature Developers", "possession": "Ready to Move",
        "floor_plan": None, "map_embed": None, "featured": False,
        "created_at": _now(),
    }
    base.update(kwargs)
    return base


LUX_IMG = [
    "https://images.pexels.com/photos/8082227/pexels-photo-8082227.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400",
    "https://images.pexels.com/photos/8135492/pexels-photo-8135492.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400",
    "https://images.pexels.com/photos/16573669/pexels-photo-16573669.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400",
    "https://images.pexels.com/photos/29334668/pexels-photo-29334668.png?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400",
    "https://images.pexels.com/photos/29012720/pexels-photo-29012720.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400",
    "https://images.pexels.com/photos/7377669/pexels-photo-7377669.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1400&q=80",
]

AMENITIES = ["Infinity Pool", "Sky Lounge", "Private Cinema", "Spa & Wellness", "Concierge",
             "24/7 Security", "Valet Parking", "Private Elevator", "EV Charging", "Rooftop Garden"]

seed_properties = [
    prop(name="The Bandra Skyline Residences", tagline="Sea-facing 4 & 5 BHK",
         type="apartment", location="Bandra West", price="₹ 8.5 Cr onwards", price_numeric=85000000,
         bhk=4, area_sqft=2400, status="ready", collection="luxury",
         badges=["Sea-facing", "New Launch"], featured=True,
         images=LUX_IMG[:5], amenities=AMENITIES,
         highlights=["Panoramic Arabian Sea views", "Private lift lobby", "Italian marble finishes"],
         description="Perched on Mumbai's most coveted address, The Bandra Skyline Residences offer sea-facing homes crafted in collaboration with award-winning European architects."),
    prop(name="Juhu Beach Sanctuary", tagline="Ultra-luxury 5 BHK penthouses",
         type="penthouse", location="Juhu", price="₹ 22 Cr onwards", price_numeric=220000000,
         bhk=5, area_sqft=5200, status="ready", collection="luxury",
         badges=["Penthouse", "Sea-facing"], featured=True,
         images=[LUX_IMG[1], LUX_IMG[3], LUX_IMG[4], LUX_IMG[6]], amenities=AMENITIES,
         highlights=["Duplex terrace", "Private pool", "Beach access"],
         description="A collection of just eight duplex penthouses opening directly onto Juhu Beach with private plunge pools and cinematic ocean vistas."),
    prop(name="Worli Sea Face Villas", tagline="Standalone luxury villas",
         type="villa", location="Worli", price="₹ 35 Cr onwards", price_numeric=350000000,
         bhk=6, area_sqft=8500, status="under-construction", collection="luxury",
         badges=["Villa", "Bespoke"], featured=True,
         images=[LUX_IMG[2], LUX_IMG[4], LUX_IMG[7], LUX_IMG[0]], amenities=AMENITIES,
         highlights=["Standalone plot", "Home automation", "Private garden"],
         description="Five villas on Worli sea face — each a bespoke architectural composition with private landscaped gardens and infinity pools overlooking the Arabian Sea."),
    prop(name="BKC Signature Towers", tagline="Business district luxury",
         type="apartment", location="BKC", price="₹ 6.2 Cr onwards", price_numeric=62000000,
         bhk=3, area_sqft=1850, status="ready", collection="signature",
         badges=["Business district"], featured=True,
         images=[LUX_IMG[5], LUX_IMG[1], LUX_IMG[6]], amenities=AMENITIES,
         highlights=["Concierge tower", "Sky club", "5-min to BKC offices"],
         description="Steps from Mumbai's business capital, BKC Signature Towers deliver refined city living for the discerning executive."),
    prop(name="Powai Lakeview Estates", tagline="Lake-facing 3 & 4 BHK",
         type="apartment", location="Powai", price="₹ 3.9 Cr onwards", price_numeric=39000000,
         bhk=3, area_sqft=1650, status="under-construction", collection="signature",
         badges=["Lake-facing"], featured=False,
         images=[LUX_IMG[3], LUX_IMG[0], LUX_IMG[7]], amenities=AMENITIES,
         highlights=["Lake promenade", "International school nearby", "Green podium"],
         description="Modern lake-facing residences in one of Mumbai's most planned neighbourhoods."),
    prop(name="South Mumbai Heritage Homes", tagline="Colonial-era luxury reimagined",
         type="apartment", location="South Mumbai", price="₹ 12 Cr onwards", price_numeric=120000000,
         bhk=4, area_sqft=3200, status="ready", collection="luxury",
         badges=["Heritage", "Iconic address"], featured=False,
         images=[LUX_IMG[4], LUX_IMG[2], LUX_IMG[5]], amenities=AMENITIES,
         highlights=["Heritage precinct", "20-ft ceilings", "Restored façade"],
         description="A sensitive restoration of a landmark South Mumbai address delivering a rare collection of grand residences."),
    prop(name="Bandra West Boutique Villas", tagline="6 villas. One address.",
         type="villa", location="Bandra West", price="₹ 28 Cr onwards", price_numeric=280000000,
         bhk=5, area_sqft=6500, status="under-construction", collection="luxury",
         badges=["Boutique", "Villa"], featured=False,
         images=[LUX_IMG[6], LUX_IMG[7], LUX_IMG[1]], amenities=AMENITIES,
         highlights=["Boutique community", "Bespoke interiors", "Landscaped courtyards"],
         description="An intimate enclave of six villas in the heart of Bandra West."),
    prop(name="Malabar Hill Sky Penthouse", tagline="Single-floor penthouse",
         type="penthouse", location="South Mumbai", price="₹ 45 Cr onwards", price_numeric=450000000,
         bhk=5, area_sqft=7800, status="ready", collection="luxury",
         badges=["Penthouse", "Iconic"], featured=True,
         images=[LUX_IMG[7], LUX_IMG[4], LUX_IMG[3]], amenities=AMENITIES,
         highlights=["Full-floor residence", "360° city + sea", "Private elevator"],
         description="A rare full-floor penthouse atop one of Malabar Hill's most iconic towers."),
]


seed_testimonials = [
    {"id": str(uuid.uuid4()), "name": "Rohan & Meera Kapoor", "role": "Homeowners, Bandra",
     "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
     "quote": "Aayat didn't just find us a home — they curated an experience. From the first walkthrough to handover, every detail was considered.",
     "rating": 5, "created_at": _now()},
    {"id": str(uuid.uuid4()), "name": "Aditya Shah", "role": "NRI investor, London",
     "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
     "quote": "Buying from overseas felt seamless. Aayat's team handled the diligence, paperwork and possession — impeccable service.",
     "rating": 5, "created_at": _now()},
    {"id": str(uuid.uuid4()), "name": "Dr. Priya Menon", "role": "Homeowner, Worli",
     "avatar": "https://images.pexels.com/photos/37148308/pexels-photo-37148308.jpeg?auto=compress&cs=tinysrgb&w=200",
     "quote": "The attention to interior finishes and after-sales concierge is genuinely at par with anything I've seen in Dubai or Singapore.",
     "rating": 5, "created_at": _now()},
    {"id": str(uuid.uuid4()), "name": "Vikram Malhotra", "role": "Founder & CEO",
     "avatar": "https://images.pexels.com/photos/15780889/pexels-photo-15780889.jpeg?auto=compress&cs=tinysrgb&w=200",
     "quote": "Discreet, professional and deeply knowledgeable about Mumbai's luxury market. Aayat is the only firm I recommend to my peers.",
     "rating": 5, "created_at": _now()},
]


seed_faqs = [
    {"id": str(uuid.uuid4()), "order": 1,
     "question": "Which Mumbai locations does Aayat Real Estate cover?",
     "answer": "We focus exclusively on Mumbai's most premium residential precincts — Bandra West, Juhu, Worli, BKC, Powai and South Mumbai (Malabar Hill, Napean Sea Road, Altamount Road)."},
    {"id": str(uuid.uuid4()), "order": 2,
     "question": "Do you assist NRIs with property purchases?",
     "answer": "Yes. We have a dedicated NRI desk handling remote walkthroughs, legal diligence, banking coordination and possession — all handled end-to-end."},
    {"id": str(uuid.uuid4()), "order": 3,
     "question": "What is the typical ticket size of your portfolio?",
     "answer": "Our curated portfolio starts at ₹3.5 Cr and extends beyond ₹50 Cr for iconic penthouses and standalone villas."},
    {"id": str(uuid.uuid4()), "order": 4,
     "question": "Can I book a private site visit?",
     "answer": "Absolutely. Every walkthrough is scheduled by appointment and led by a senior advisor. Use the Book Site Visit CTA anywhere on the website."},
    {"id": str(uuid.uuid4()), "order": 5,
     "question": "Do you offer financing assistance?",
     "answer": "Yes. We have institutional relationships with leading private and public banks and can structure competitive financing across ready and under-construction inventory."},
    {"id": str(uuid.uuid4()), "order": 6,
     "question": "How is Aayat different from other brokers?",
     "answer": "We are a boutique, referral-led firm. Every property in our portfolio is personally vetted, and our advisors work with a maximum of 12 active clients at a time — ensuring the depth of service you expect at this ticket size."},
]
