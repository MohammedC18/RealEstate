"""
Aayat Real Estate — Backend API
FastAPI + MongoDB. Full CRUD + CMS blocks + admin analytics.
All routes prefixed with /api.
"""
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from collections import Counter

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=8000)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Aayat Real Estate API", version="2.0.0")
api_router = APIRouter(prefix="/api")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ============================================================
# Models
# ============================================================
class Property(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    tagline: Optional[str] = None
    type: str  # apartment | villa | penthouse
    location: str
    price: str
    price_numeric: float = 0
    bhk: int
    area_sqft: int
    parking: int = 1
    status: str
    collection: Optional[str] = None
    badges: List[str] = []
    images: List[str] = []
    amenities: List[str] = []
    highlights: List[str] = []
    description: str = ""
    builder: str = ""
    possession: str = ""
    floor_plan: Optional[str] = None
    map_embed: Optional[str] = None
    featured: bool = False
    views: int = 0
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    phone: str
    email: EmailStr
    location: Optional[str] = None
    budget: Optional[str] = None
    property_type: Optional[str] = None
    message: Optional[str] = None
    source: str = "website"
    status: str = "new"
    created_at: str = Field(default_factory=now_iso)


class LeadCreate(BaseModel):
    full_name: str
    phone: str
    email: EmailStr
    location: Optional[str] = None
    budget: Optional[str] = None
    property_type: Optional[str] = None
    message: Optional[str] = None
    source: str = "website"


class LeadUpdate(BaseModel):
    status: Optional[str] = None


class Testimonial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str
    avatar: str = ""
    quote: str
    rating: int = 5
    created_at: str = Field(default_factory=now_iso)


class FAQ(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str
    order: int = 0


class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "singleton"
    company_name: str = "Aayat Real Estate"
    phone: str = "+91 90046 25459"
    whatsapp: str = "+919004625459"
    email: str = "khangufran18182@gmail.com"
    address: str = "St Mary Road, Mumbai – 400010, Maharashtra, India"
    hero_headline: str = "Live Mumbai. Elevated."
    hero_subheadline: str = "A curated portfolio of luxury apartments, penthouses and villas across the city's most desired addresses."
    hero_eyebrow: str = "Aayat Real Estate · Mumbai"
    hero_video_url: str = "https://videos.pexels.com/video-files/5182061/5182061-hd_1920_1080_30fps.mp4"
    hero_fallback_image: str = "https://images.pexels.com/photos/5414582/pexels-photo-5414582.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=1920"
    about_headline: str = "A boutique advisory since 2013."
    about_body: str = "Aayat is a Mumbai-based boutique real estate advisory serving high-net-worth families, NRIs and institutional clients."
    about_image: str = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80"
    footer_tagline: str = "A curated portfolio of luxury residences across Mumbai's finest addresses."
    footer_note: str = "© Aayat Real Estate. Boutique advisory. RERA-registered."
    instagram: str = "https://instagram.com"
    linkedin: str = "https://linkedin.com"
    facebook: str = "https://facebook.com"
    # Analytics IDs (empty = disabled)
    ga_id: str = ""
    clarity_id: str = ""
    meta_pixel_id: str = ""
    gtm_id: str = ""


class LoginRequest(BaseModel):
    email: str
    password: str


# ============================================================
# Auth (Phase 3 will replace with JWT+bcrypt)
# ============================================================
ADMIN_EMAIL = "admin@aayat.com"
ADMIN_PASSWORD = "aayat2026"
ADMIN_TOKEN = "aayat-admin-mock-token"


def require_admin(x_admin_token: Optional[str] = Header(None)):
    if x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True


@api_router.post("/admin/login")
async def admin_login(payload: LoginRequest):
    if payload.email == ADMIN_EMAIL and payload.password == ADMIN_PASSWORD:
        return {"token": ADMIN_TOKEN, "email": ADMIN_EMAIL}
    raise HTTPException(status_code=401, detail="Invalid credentials")


# ============================================================
# Properties
# ============================================================
@api_router.get("/properties", response_model=List[Property])
async def list_properties(
    type: Optional[str] = None,
    location: Optional[str] = None,
    status: Optional[str] = None,
    collection: Optional[str] = None,
    bhk: Optional[int] = None,
    featured: Optional[bool] = None,
):
    query = {}
    if type: query["type"] = type
    if location: query["location"] = location
    if status: query["status"] = status
    if collection: query["collection"] = collection
    if bhk is not None: query["bhk"] = bhk
    if featured is not None: query["featured"] = featured
    docs = await db.properties.find(query, {"_id": 0}).to_list(500)
    return docs


@api_router.get("/properties/{property_id}", response_model=Property)
async def get_property(property_id: str):
    doc = await db.properties.find_one({"id": property_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Property not found")
    # Increment view counter (best-effort)
    try:
        await db.properties.update_one({"id": property_id}, {"$inc": {"views": 1}})
    except Exception:
        pass
    return doc


@api_router.post("/properties", response_model=Property, dependencies=[Depends(require_admin)])
async def create_property(prop: Property):
    doc = prop.model_dump()
    await db.properties.insert_one(doc)
    return prop


@api_router.put("/properties/{property_id}", response_model=Property, dependencies=[Depends(require_admin)])
async def update_property(property_id: str, prop: Property):
    doc = prop.model_dump()
    doc["id"] = property_id
    await db.properties.update_one({"id": property_id}, {"$set": doc}, upsert=True)
    return Property(**doc)


@api_router.delete("/properties/{property_id}", dependencies=[Depends(require_admin)])
async def delete_property(property_id: str):
    r = await db.properties.delete_one({"id": property_id})
    return {"deleted": r.deleted_count}


# ============================================================
# Leads
# ============================================================
@api_router.post("/leads", response_model=Lead)
async def create_lead(payload: LeadCreate):
    lead = Lead(**payload.model_dump())
    await db.leads.insert_one(lead.model_dump())
    return lead


@api_router.get("/leads", response_model=List[Lead], dependencies=[Depends(require_admin)])
async def list_leads():
    docs = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs


@api_router.put("/leads/{lead_id}", dependencies=[Depends(require_admin)])
async def update_lead(lead_id: str, payload: LeadUpdate):
    upd = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not upd:
        return {"updated": 0}
    r = await db.leads.update_one({"id": lead_id}, {"$set": upd})
    return {"updated": r.modified_count}


@api_router.delete("/leads/{lead_id}", dependencies=[Depends(require_admin)])
async def delete_lead(lead_id: str):
    r = await db.leads.delete_one({"id": lead_id})
    return {"deleted": r.deleted_count}


# ============================================================
# Testimonials
# ============================================================
@api_router.get("/testimonials", response_model=List[Testimonial])
async def list_testimonials():
    return await db.testimonials.find({}, {"_id": 0}).to_list(200)


@api_router.post("/testimonials", response_model=Testimonial, dependencies=[Depends(require_admin)])
async def create_testimonial(t: Testimonial):
    await db.testimonials.insert_one(t.model_dump())
    return t


@api_router.put("/testimonials/{tid}", response_model=Testimonial, dependencies=[Depends(require_admin)])
async def update_testimonial(tid: str, t: Testimonial):
    doc = t.model_dump(); doc["id"] = tid
    await db.testimonials.update_one({"id": tid}, {"$set": doc}, upsert=True)
    return Testimonial(**doc)


@api_router.delete("/testimonials/{tid}", dependencies=[Depends(require_admin)])
async def delete_testimonial(tid: str):
    r = await db.testimonials.delete_one({"id": tid})
    return {"deleted": r.deleted_count}


# ============================================================
# FAQs
# ============================================================
@api_router.get("/faqs", response_model=List[FAQ])
async def list_faqs():
    return await db.faqs.find({}, {"_id": 0}).sort("order", 1).to_list(200)


@api_router.post("/faqs", response_model=FAQ, dependencies=[Depends(require_admin)])
async def create_faq(f: FAQ):
    await db.faqs.insert_one(f.model_dump())
    return f


@api_router.put("/faqs/{fid}", response_model=FAQ, dependencies=[Depends(require_admin)])
async def update_faq(fid: str, f: FAQ):
    doc = f.model_dump(); doc["id"] = fid
    await db.faqs.update_one({"id": fid}, {"$set": doc}, upsert=True)
    return FAQ(**doc)


@api_router.delete("/faqs/{fid}", dependencies=[Depends(require_admin)])
async def delete_faq(fid: str):
    r = await db.faqs.delete_one({"id": fid})
    return {"deleted": r.deleted_count}


# ============================================================
# Settings (public read, admin write)
# ============================================================
@api_router.get("/settings", response_model=Settings)
async def get_settings():
    doc = await db.settings.find_one({"id": "singleton"}, {"_id": 0})
    if not doc:
        s = Settings()
        await db.settings.insert_one(s.model_dump())
        return s
    # Backfill missing fields
    defaults = Settings().model_dump()
    for k, v in defaults.items():
        doc.setdefault(k, v)
    return doc


@api_router.put("/settings", response_model=Settings, dependencies=[Depends(require_admin)])
async def update_settings(s: Settings):
    doc = s.model_dump()
    doc["id"] = "singleton"
    await db.settings.update_one({"id": "singleton"}, {"$set": doc}, upsert=True)
    return Settings(**doc)


# ============================================================
# Admin Analytics
# ============================================================
@api_router.get("/admin/analytics", dependencies=[Depends(require_admin)])
async def analytics() -> Dict[str, Any]:
    leads = await db.leads.find({}, {"_id": 0}).to_list(5000)
    props = await db.properties.find({}, {"_id": 0}).to_list(500)

    # Leads by day (last 30 days)
    by_day: Dict[str, int] = {}
    now = datetime.now(timezone.utc)
    for i in range(29, -1, -1):
        d = (now - timedelta(days=i)).strftime("%b %d")
        by_day[d] = 0
    for l in leads:
        try:
            ts = l.get("created_at", "")
            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            k = dt.strftime("%b %d")
            if k in by_day:
                by_day[k] += 1
        except Exception:
            continue
    leads_series = [{"date": k, "leads": v} for k, v in by_day.items()]

    # Leads by source
    src_counter = Counter([(l.get("source") or "website").split(":")[0] for l in leads])
    leads_by_source = [{"name": k, "value": v} for k, v in src_counter.items()]

    # Leads by status
    stat_counter = Counter([l.get("status") or "new" for l in leads])
    leads_by_status = [{"name": k, "value": v} for k, v in stat_counter.items()]

    # Properties by type
    type_counter = Counter([p.get("type") or "other" for p in props])
    props_by_type = [{"name": k, "value": v} for k, v in type_counter.items()]

    # Top viewed properties
    top_views = sorted(props, key=lambda p: p.get("views", 0), reverse=True)[:5]
    top_views_out = [{"name": p["name"], "views": p.get("views", 0)} for p in top_views]

    total_views = sum(p.get("views", 0) for p in props)
    new_leads = sum(1 for l in leads if l.get("status") == "new")

    return {
        "kpis": {
            "properties": len(props),
            "total_leads": len(leads),
            "new_leads": new_leads,
            "total_views": total_views,
        },
        "leads_series": leads_series,
        "leads_by_source": leads_by_source,
        "leads_by_status": leads_by_status,
        "props_by_type": props_by_type,
        "top_views": top_views_out,
    }


# ============================================================
# Seed
# ============================================================
@app.on_event("startup")
async def seed_db():
    try:
        if await db.properties.count_documents({}) == 0:
            from seed_data import seed_properties, seed_testimonials, seed_faqs
            if seed_properties:
                await db.properties.insert_many([p.copy() for p in seed_properties])
            if seed_testimonials:
                await db.testimonials.insert_many([t.copy() for t in seed_testimonials])
            if seed_faqs:
                await db.faqs.insert_many([f.copy() for f in seed_faqs])
        if await db.settings.count_documents({"id": "singleton"}) == 0:
            await db.settings.insert_one(Settings().model_dump())
    except Exception as e:
        logging.getLogger(__name__).warning(f"Seed skipped: {e}")


@api_router.get("/")
async def root():
    return {"message": "Aayat Real Estate API", "version": "2.0.0"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
