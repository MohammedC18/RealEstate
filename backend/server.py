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
import jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("JWT_SECRET", "super-secret-key-aayat-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

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
    project_name: Optional[str] = None
    rera_number: Optional[str] = None
    tagline: Optional[str] = None
    type: str  # apartment | villa | penthouse
    
    # Location
    location: str
    locality: Optional[str] = None
    landmark: Optional[str] = None
    pincode: Optional[str] = None
    map_link: Optional[str] = None
    
    # Advanced Pricing
    price_type: Optional[str] = "fixed" # fixed | range | starting_from | por
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_price_unit: Optional[str] = "Crore" # Thousand | Lakh | Crore
    max_price_unit: Optional[str] = "Crore"
    price: str = "" # Legacy string, auto-calculated
    price_numeric: float = 0
    
    # Details & Specs
    bhk: int = 0
    area_sqft: int = 0
    carpet_area: Optional[int] = None
    built_up_area: Optional[int] = None
    super_built_up_area: Optional[int] = None
    bathrooms: Optional[int] = None
    balconies: Optional[int] = None
    parking: int = 0
    floor_number: Optional[str] = None
    total_floors: Optional[int] = None
    furnishing_status: Optional[str] = None
    possession: str = ""
    facing_direction: Optional[str] = None
    property_age: Optional[str] = None
    custom_specifications: List[Dict[str, str]] = []
    
    status: str
    collection: Optional[str] = None
    badges: List[str] = []
    images: List[str] = []
    cover_image: Optional[str] = None
    amenities: List[str] = []
    highlights: List[str] = []
    description: str = ""
    builder: str = ""
    
    # Media
    floor_plan: Optional[str] = None
    map_embed: Optional[str] = None
    brochure_pdf: Optional[str] = None
    video_url: Optional[str] = None
    virtual_tour_url: Optional[str] = None
    
    # SEO
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_slug: Optional[str] = None
    seo_og_image: Optional[str] = None
    seo_keywords: Optional[str] = None
    
    featured: bool = False
    views: int = 0
    is_archived: bool = False
    created_at: str = Field(default_factory=now_iso)


class BulkActionRequest(BaseModel):
    action: str
    ids: List[str]


class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    message: Optional[str] = None
    property_id: Optional[str] = None
    source: str = "Direct"
    status: str = "new"  # new | contacted | closed
    created_at: str = Field(default_factory=now_iso)


class HeroBanner(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    desktop_media: str
    mobile_media: str
    heading: str
    subheading: str
    cta_text: str = "Explore Portfolio"
    cta_link: str = "/properties"
    is_active: bool = True
    is_default: bool = False
    sort_order: int = 0
    created_at: str = Field(default_factory=now_iso)


class AdminUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    hashed_password: str
    created_at: str = Field(default_factory=now_iso)


class LeadCreate(BaseModel):
    name: str
    phone: str
    email: EmailStr
    message: Optional[str] = None
    property_id: Optional[str] = None
    source: str = "Direct"


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
# Auth (JWT + Bcrypt)
# ============================================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def require_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

@api_router.post("/admin/login")
async def admin_login(payload: LoginRequest):
    admin = await db.admins.find_one({"email": payload.email})
    if not admin or not pwd_context.verify(payload.password, admin["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": admin["email"]}, expires_delta=access_token_expires
    )
    return {"token": access_token, "email": admin["email"]}

@app.on_event("startup")
async def startup_db_client():
    # Seed default admin if none exists
    admin_count = await db.admins.count_documents({})
    if admin_count == 0:
        hashed = pwd_context.hash("aayat2026")
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "email": "admin@aayat.com",
            "hashed_password": hashed,
            "created_at": now_iso()
        })
    # Seed default hero if none exists
    hero_count = await db.hero_banners.count_documents({})
    if hero_count == 0:
        await db.hero_banners.insert_one(HeroBanner(
            desktop_media="https://images.pexels.com/photos/5414582/pexels-photo-5414582.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=1920",
            mobile_media="https://images.pexels.com/photos/5414582/pexels-photo-5414582.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=1920",
            heading="Live Mumbai. Elevated.",
            subheading="A curated portfolio of luxury apartments, penthouses and villas.",
            is_default=True
        ).model_dump())


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
    return doc

@api_router.post("/properties/{property_id}/view")
async def increment_property_view(property_id: str):
    # Increment view counter securely
    r = await db.properties.update_one({"id": property_id}, {"$inc": {"views": 1}})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"status": "ok"}


@api_router.post("/properties", response_model=Property, dependencies=[Depends(require_admin)])
async def create_property(prop: Property):
    # Auto-calculate price string and numeric based on advanced fields
    doc = prop.model_dump()
    
    # Helper to calculate numeric
    def get_num(val, unit):
        if not val: return 0
        if unit == "Crore": return val * 10000000
        if unit == "Lakh": return val * 100000
        if unit == "Thousand": return val * 1000
        return val
        
    def format_price(val, unit):
        if not val: return ""
        u = "Cr" if unit == "Crore" else "Lakh" if unit == "Lakh" else "K"
        return f"₹{val} {u}"

    if prop.price_type == "por":
        doc["price"] = "Price On Request"
        doc["price_numeric"] = 0
    elif prop.price_type == "fixed":
        doc["price"] = format_price(prop.min_price, prop.min_price_unit)
        doc["price_numeric"] = get_num(prop.min_price, prop.min_price_unit)
    elif prop.price_type == "range":
        doc["price"] = f"{format_price(prop.min_price, prop.min_price_unit)} – {format_price(prop.max_price, prop.max_price_unit)}"
        doc["price_numeric"] = get_num(prop.min_price, prop.min_price_unit)
    elif prop.price_type == "starting_from":
        doc["price"] = f"{format_price(prop.min_price, prop.min_price_unit)} onwards"
        doc["price_numeric"] = get_num(prop.min_price, prop.min_price_unit)

    await db.properties.insert_one(doc)
    return Property(**doc)


@api_router.put("/properties/{property_id}", response_model=Property, dependencies=[Depends(require_admin)])
async def update_property(property_id: str, prop: Property):
    doc = prop.model_dump()
    doc["id"] = property_id
    
    def get_num(val, unit):
        if not val: return 0
        if unit == "Crore": return val * 10000000
        if unit == "Lakh": return val * 100000
        if unit == "Thousand": return val * 1000
        return val
        
    def format_price(val, unit):
        if not val: return ""
        # Handle int/float formatting (e.g. 2.5 vs 2)
        val_str = f"{val:g}" 
        u = "Cr" if unit == "Crore" else "Lakh" if unit == "Lakh" else "K"
        return f"₹{val_str} {u}"

    if prop.price_type == "por":
        doc["price"] = "Price On Request"
        doc["price_numeric"] = 0
    elif prop.price_type == "fixed":
        doc["price"] = format_price(prop.min_price, prop.min_price_unit)
        doc["price_numeric"] = get_num(prop.min_price, prop.min_price_unit)
    elif prop.price_type == "range":
        doc["price"] = f"{format_price(prop.min_price, prop.min_price_unit)} – {format_price(prop.max_price, prop.max_price_unit)}"
        doc["price_numeric"] = get_num(prop.min_price, prop.min_price_unit)
    elif prop.price_type == "starting_from":
        doc["price"] = f"{format_price(prop.min_price, prop.min_price_unit)} onwards"
        doc["price_numeric"] = get_num(prop.min_price, prop.min_price_unit)

    await db.properties.update_one({"id": property_id}, {"$set": doc}, upsert=True)
    return Property(**doc)


@api_router.delete("/properties/{property_id}", dependencies=[Depends(require_admin)])
async def delete_property(property_id: str):
    r = await db.properties.delete_one({"id": property_id})
    return {"deleted": r.deleted_count}

@api_router.post("/properties/bulk", dependencies=[Depends(require_admin)])
async def bulk_properties_action(req: BulkActionRequest):
    action = req.action
    ids = req.ids
    if not ids:
        return {"updated": 0}
        
    if action == "delete":
        r = await db.properties.delete_many({"id": {"$in": ids}})
        return {"modified": r.deleted_count}
    elif action == "archive":
        r = await db.properties.update_many({"id": {"$in": ids}}, {"$set": {"is_archived": True}})
        return {"modified": r.modified_count}
    elif action == "publish" or action == "unarchive":
        r = await db.properties.update_many({"id": {"$in": ids}}, {"$set": {"is_archived": False}})
        return {"modified": r.modified_count}
    elif action == "feature":
        r = await db.properties.update_many({"id": {"$in": ids}}, {"$set": {"featured": True}})
        return {"modified": r.modified_count}
    elif action == "unfeature":
        r = await db.properties.update_many({"id": {"$in": ids}}, {"$set": {"featured": False}})
        return {"modified": r.modified_count}
    elif action == "duplicate":
        # fetch, modify IDs, insert
        docs = await db.properties.find({"id": {"$in": ids}}, {"_id": 0}).to_list(100)
        new_docs = []
        for d in docs:
            d["id"] = str(uuid.uuid4())
            d["name"] = f"{d.get('name', 'Property')} (Copy)"
            d["is_archived"] = True # duplicates are archived/drafts by default
            d["created_at"] = now_iso()
            new_docs.append(d)
        if new_docs:
            await db.properties.insert_many(new_docs)
        return {"modified": len(new_docs)}
        
    raise HTTPException(status_code=400, detail="Invalid bulk action")


# ============================================================
# Leads
# ============================================================
@api_router.post("/leads", response_model=Lead)
async def create_lead(payload: LeadCreate):
    lead = Lead(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        message=payload.message,
        property_id=payload.property_id,
        source=payload.source,
    )
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


# ============================================================
# Hero Banners (Phase 4 CMS)
# ============================================================
@api_router.get("/hero", response_model=List[HeroBanner])
async def list_heroes():
    docs = await db.hero_banners.find({}, {"_id": 0}).sort("sort_order", 1).to_list(100)
    return docs

@api_router.post("/hero", response_model=HeroBanner, dependencies=[Depends(require_admin)])
async def create_hero(hero: HeroBanner):
    doc = hero.model_dump()
    if doc.get("is_default"):
        await db.hero_banners.update_many({}, {"$set": {"is_default": False}})
    await db.hero_banners.insert_one(doc)
    return HeroBanner(**doc)

@api_router.put("/hero/{hero_id}", response_model=HeroBanner, dependencies=[Depends(require_admin)])
async def update_hero(hero_id: str, hero: HeroBanner):
    doc = hero.model_dump()
    doc["id"] = hero_id
    if doc.get("is_default"):
        await db.hero_banners.update_many({"id": {"$ne": hero_id}}, {"$set": {"is_default": False}})
    await db.hero_banners.update_one({"id": hero_id}, {"$set": doc}, upsert=True)
    return HeroBanner(**doc)

@api_router.delete("/hero/{hero_id}", dependencies=[Depends(require_admin)])
async def delete_hero(hero_id: str):
    r = await db.hero_banners.delete_one({"id": hero_id})
    return {"deleted": r.deleted_count}

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
