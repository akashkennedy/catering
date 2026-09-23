import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `site-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

export type DishLine = { en: string; ta: string };

export type SiteTestimonial = {
  id: string;
  rating: number;
  /** English only — the landing translates when a visitor picks Tamil. */
  review: string;
  author: string;
  location: string;
};

export type SiteMenu = {
  id: string;
  nameEn: string;
  nameTa: string;
  imageUrl: string;
  mainDishes: DishLine[];
  sideDishes: DishLine[];
  /** Price per plate in ₹ (0 hides the price). */
  price: number;
};

export type SiteGalleryItem = {
  id: string;
  /** Public Instagram post link, e.g. https://www.instagram.com/p/…. */
  instagramUrl: string;
  /** Shown when the embed fails to load. */
  altTitle: string;
  /** Old default image shown when the embed fails. */
  fallbackImage: string;
};

export type SiteBusiness = {
  phones: string[];
  whatsapp: string;
  addressEn: string;
  addressTa: string;
  serviceZones: string[];
};

export const DEFAULT_SERVICE_ZONES = [
  "Thiruvarambu",
  "Marthandam",
  "Nagercoil",
  "Thuckalay",
  "Kulasekharam",
  "Kanyakumari",
  "Karungal",
  "Trivandrum Border",
];

/** Fallback pool shown when an Instagram embed fails (old default images). */
export const DEFAULT_GALLERY_FALLBACKS = [
  "/images/img_02.jpg",
  "/images/img_03.jpg",
  "/images/img_04.jpg",
  "/images/img_05.jpg",
  "/images/img_06.jpg",
  "/images/img_07.jpg",
];

export const INSTAGRAM_PLACEHOLDER_URL = "https://www.instagram.com/p/PLACEHOLDER/";

export type SiteMenuInput = Omit<SiteMenu, "id">;
export type SiteTestimonialInput = Omit<SiteTestimonial, "id">;
export type SiteGalleryInput = Omit<SiteGalleryItem, "id">;

const IMG = "/images";

function seedTestimonials(): SiteTestimonial[] {
  return [
    {
      id: newId(),
      rating: 5,
      review:
        "For our daughter's wedding at Marthandam, we booked Mampalli for 1,800 guests. The Kerala Sadya was flawless! Guests were praising the Ada Pradhaman and fresh crispy chips for weeks.",
      author: "Anand & Priya Ramachandran",
      location: "Marthandam",
    },
    {
      id: newId(),
      rating: 5,
      review:
        "We held my father's 60th Shashti Poorthi pooja at Thiruvarambu. The traditional Tamil Virundhu was pure nostalgia — drumstick sambar with authentic ghee aroma, just like grandmother's feast!",
      author: "Dr. K. Sundaram",
      location: "Nagercoil",
    },
    {
      id: newId(),
      rating: 5,
      review:
        "From morning filter coffee and fluffy poori masala to the grand evening Biryani live counters, Mampalli managed our housewarming seamlessly. Spotlessly clean kitchen afterward!",
      author: "Meera & Navin",
      location: "Thuckalay",
    },
  ];
}

function seedMenus(): SiteMenu[] {
  return [
    {
      id: newId(),
      nameEn: "Royal Travancore Wedding Sadya",
      nameTa: "ராயல் திருவிதாங்கூர் திருமண சாத்யா",
      imageUrl: `${IMG}/img_03.jpg`,
      price: 280,
      mainDishes: [
        { en: "Kerala Red Matta Rice & Ponni Rice", ta: "கேரள மட்டை அரிசி & பொன்னி அரிசி" },
        { en: "Parippu Curry & Steaming Fresh Cow Ghee", ta: "பருப்பு குழம்பு & தூய பசும் நெய்" },
        { en: "Travancore Drumstick & Pumpkin Sambar", ta: "முருங்கை & பூசணி சாம்பார்" },
        { en: "Pepper Cumin Rasam & Moru Kachiathu", ta: "மிளகு சீரக ரசம் & மோர்" },
        { en: "Traditional Kalan & Tender Ash Gourd Olan", ta: "பாரம்பரிய காளன் & ஓலன்" },
      ],
      sideDishes: [
        { en: "Classic Avial in Cold-Pressed Coconut Oil", ta: "செக்கு எண்ணெய் அவியல்" },
        { en: "Beetroot & Cabbage Coconut Thoran", ta: "பீட்ரூட் & முட்டைகோஸ் தோரன்" },
        { en: "Nendran Banana Chips & Sharkara Varatti", ta: "நேந்திரன் சிப்ஸ் & சர்க்கரை வரட்டி" },
        { en: "Ada Pradhaman & Palada Payasam", ta: "அட பிரதமன் & பாலடை பாயசம்" },
      ],
    },
    {
      id: newId(),
      nameEn: "Tamil Virundhu Sappadu",
      nameTa: "தமிழ் விருந்து சாப்பாடு",
      imageUrl: `${IMG}/img_02.jpg`,
      price: 250,
      mainDishes: [
        { en: "Ponni Rice & Paruppu Nei", ta: "பொன்னி அரிசி & பருப்பு நெய்" },
        { en: "Drumstick Sambar & Rasam", ta: "முருங்கை சாம்பார் & ரசம்" },
        { en: "Kalyana Poriyal & Kootu", ta: "கல்யாண பொரியல் & கூட்டு" },
      ],
      sideDishes: [
        { en: "Paruppu Payasam & Kesari", ta: "பருப்பு பாயசம் & கேசரி" },
        { en: "Curd Rice & Pickle", ta: "தயிர் சாதம் & ஊறுகாய்" },
      ],
    },
    {
      id: newId(),
      nameEn: "Live Tiffin & Evening Counters",
      nameTa: "நேரடி டிபன் & மாலை கவுண்டர்கள்",
      imageUrl: `${IMG}/img_06.jpg`,
      price: 180,
      mainDishes: [
        { en: "Filter Coffee & Poori Masala", ta: "பில்டர் காபி & பூரி மசாலா" },
        { en: "Ghee Roast & Ven Pongal", ta: "நெய் ரோஸ்ட் & வெண் பொங்கல்" },
      ],
      sideDishes: [
        { en: "Veg Biryani & Chaat Live", ta: "வெஜ் பிரியாணி & சாட்" },
      ],
    },
  ];
}

function seedGallery(): SiteGalleryItem[] {
  const item = (
    instagramUrl: string,
    altTitle: string,
    fallbackImage: string
  ): SiteGalleryItem => ({ id: newId(), instagramUrl, altTitle, fallbackImage });
  return [
    item(
      "https://www.instagram.com/p/PLACEHOLDER_SADYA/",
      "2,500 Guests Vazhaillai Virundhu",
      `${IMG}/img_02.jpg`
    ),
    item(
      "https://www.instagram.com/p/PLACEHOLDER_URULI/",
      "Pure Brass Uruli Cooking",
      `${IMG}/img_04.jpg`
    ),
    item(
      "https://www.instagram.com/p/PLACEHOLDER_TIFFIN/",
      "Interactive Live Tiffin Experience",
      `${IMG}/img_06.jpg`
    ),
  ];
}

function seedBusiness(): SiteBusiness {
  return {
    phones: ["919443210000", "919842120000"],
    whatsapp: "919443210000",
    addressEn:
      "Mampalli Central Kitchen, Main Road, Thiruvarambu, Kanyakumari District, Tamil Nadu - 629161",
    addressTa:
      "மாம்பள்ளி மத்திய சமையலறை, மெயின் ரோடு, திருவரம்பு, கன்னியாகுமரி மாவட்டம், தமிழ் நாடு - 629161",
    serviceZones: [...DEFAULT_SERVICE_ZONES],
  };
}

export type RemoteSiteContent = {
  business: SiteBusiness;
  menus: SiteMenu[];
  gallery: SiteGalleryItem[];
  testimonials: SiteTestimonial[];
};

type SiteContentState = RemoteSiteContent & {
  /** Local-only publish metadata; never sent to the database. */
  lastPublishedAt: string | null;
  setLastPublishedAt: (value: string | null) => void;
  replaceAll: (input: RemoteSiteContent) => void;
  setBusiness: (input: SiteBusiness) => void;
  addMenu: (input: SiteMenuInput) => void;
  updateMenu: (id: string, input: SiteMenuInput) => void;
  deleteMenu: (id: string) => void;
  addGalleryItem: (input: SiteGalleryInput) => void;
  updateGalleryItem: (id: string, input: SiteGalleryInput) => void;
  deleteGalleryItem: (id: string) => void;
  addTestimonial: (input: SiteTestimonialInput) => void;
  updateTestimonial: (id: string, input: SiteTestimonialInput) => void;
  deleteTestimonial: (id: string) => void;
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asDishLines(value: unknown): DishLine[] {
  if (!Array.isArray(value)) return [];
  return (value as Record<string, unknown>[])
    .map((item) => ({ en: asString(item.en), ta: asString(item.ta) }))
    .filter((item) => item.en !== "");
}

/** Flatten legacy course groups (or any item list) into dish lines. */
function flattenLegacyCourses(courses: unknown): DishLine[] {
  if (!Array.isArray(courses)) return [];
  const lines: DishLine[] = [];
  for (const course of courses as Record<string, unknown>[]) {
    if (Array.isArray(course.items)) lines.push(...asDishLines(course.items));
  }
  return lines;
}

/**
 * Validate + normalize a content doc pulled from the database.
 * Returns null when the payload is unusable. Missing ids are regenerated
 * so older payloads still load safely (legacy courses flatten into Main
 * Dishes; legacy photo gallery items become embed-failure fallbacks).
 */
export function normalizeRemoteContent(data: unknown): RemoteSiteContent | null {
  if (!data || typeof data !== "object") return null;
  const doc = data as Record<string, unknown>;
  if (!doc.business || typeof doc.business !== "object") return null;
  if (!Array.isArray(doc.menus) || !Array.isArray(doc.gallery) || !Array.isArray(doc.testimonials)) {
    return null;
  }
  const businessRaw = doc.business as Record<string, unknown>;
  const business: SiteBusiness = {
    phones: asStringArray(businessRaw.phones),
    whatsapp: asString(businessRaw.whatsapp),
    addressEn: asString(businessRaw.addressEn),
    addressTa: asString(businessRaw.addressTa),
    serviceZones: asStringArray(businessRaw.serviceZones).length
      ? asStringArray(businessRaw.serviceZones)
      : [...DEFAULT_SERVICE_ZONES],
  };
  const strOr = (value: unknown, fallback: string): string => {
    const s = asString(value).trim();
    return s || fallback;
  };
  const menus: SiteMenu[] = (doc.menus as Record<string, unknown>[]).map((raw) => {
    const nameEn = asString(raw.nameEn);
    const legacyMains = flattenLegacyCourses(raw.courses);
    return {
      id: asString(raw.id) || newId(),
      nameEn,
      nameTa: strOr(raw.nameTa, nameEn),
      imageUrl: asString(raw.imageUrl) || asString(raw.photoUrl) || `${IMG}/img_02.jpg`,
      mainDishes: asDishLines(raw.mainDishes).length
        ? asDishLines(raw.mainDishes)
        : legacyMains,
      sideDishes: asDishLines(raw.sideDishes),
      price: asNumber(raw.price, 0),
    };
  });
  const gallery: SiteGalleryItem[] = (doc.gallery as Record<string, unknown>[]).map(
    (raw, index) => {
      const instagramUrl = asString(raw.instagramUrl) || asString(raw.url);
      const isInsta = instagramUrl.toLowerCase().includes("instagram.com/");
      return {
        id: asString(raw.id) || newId(),
        instagramUrl,
        altTitle:
          asString(raw.altTitle) ||
          asString(raw.captionEn) ||
          `Gallery post ${index + 1}`,
        // Legacy photo items (and anything non-Instagram) become the
        // fallback image shown when the embed fails.
        fallbackImage:
          asString(raw.fallbackImage) ||
          (!isInsta && instagramUrl
            ? instagramUrl
            : DEFAULT_GALLERY_FALLBACKS[index % DEFAULT_GALLERY_FALLBACKS.length]),
      };
    }
  );
  const testimonials: SiteTestimonial[] = (doc.testimonials as Record<string, unknown>[]).map(
    (raw) => {
      const nested = raw.quote;
      const review =
        nested && typeof nested === "object"
          ? asString((nested as Record<string, unknown>).en) || asString(raw.quoteEn)
          : asString(raw.review) || asString(raw.quoteEn);
      return {
        id: asString(raw.id) || newId(),
        rating: Math.min(5, Math.max(1, Math.round(asNumber(raw.rating, 5)))),
        review,
        author: asString(raw.author),
        location:
          asString(raw.location) || asString(raw.place) || asString(raw.event),
      };
    }
  );
  return { business, menus, gallery, testimonials };
}

export function defaultSiteContent(): Pick<
  SiteContentState,
  "business" | "menus" | "gallery" | "testimonials"
> {
  return {
    business: seedBusiness(),
    menus: seedMenus(),
    gallery: seedGallery(),
    testimonials: seedTestimonials(),
  };
}

export const useSiteContentStore = create<SiteContentState>()(
  persist(
    (set) => ({
      ...defaultSiteContent(),
      lastPublishedAt: null,
      setLastPublishedAt: (value) => set({ lastPublishedAt: value }),
      replaceAll: (input) =>
        set({
          business: input.business,
          menus: input.menus,
          gallery: input.gallery,
          testimonials: input.testimonials,
        }),
      setBusiness: (input) => set({ business: input }),
      addMenu: (input) =>
        set((state) => ({ menus: [...state.menus, { ...input, id: newId() }] })),
      updateMenu: (id, input) =>
        set((state) => ({
          menus: state.menus.map((menu) => (menu.id === id ? { ...input, id } : menu)),
        })),
      deleteMenu: (id) =>
        set((state) => ({ menus: state.menus.filter((menu) => menu.id !== id) })),
      addGalleryItem: (input) =>
        set((state) => ({ gallery: [...state.gallery, { id: newId(), ...input }] })),
      updateGalleryItem: (id, input) =>
        set((state) => ({
          gallery: state.gallery.map((item) => (item.id === id ? { ...input, id } : item)),
        })),
      deleteGalleryItem: (id) =>
        set((state) => ({ gallery: state.gallery.filter((item) => item.id !== id) })),
      addTestimonial: (input) =>
        set((state) => ({ testimonials: [...state.testimonials, { id: newId(), ...input }] })),
      updateTestimonial: (id, input) =>
        set((state) => ({
          testimonials: state.testimonials.map((item) =>
            item.id === id ? { ...input, id } : item
          ),
        })),
      deleteTestimonial: (id) =>
        set((state) => ({
          testimonials: state.testimonials.filter((item) => item.id !== id),
        })),
    }),
    {
      name: "catering-site",
      storage: createJSONStorage(() => localStorage),
      version: 5,
      migrate: (persistedState) => {
        const state = persistedState as {
          menus?: Array<Record<string, unknown>> | null;
          gallery?: Array<Record<string, unknown>> | null;
          testimonials?: Array<Record<string, unknown>> | null;
          business?: Record<string, unknown> | null;
          lastPublishedAt?: unknown;
        } & Record<string, unknown>;
        const normalized = normalizeRemoteContent({
          business: state.business ?? {},
          menus: state.menus ?? [],
          gallery: state.gallery ?? [],
          testimonials: state.testimonials ?? [],
        });
        return {
          ...state,
          lastPublishedAt:
            typeof state.lastPublishedAt === "string" ? state.lastPublishedAt : null,
          business: normalized?.business ?? seedBusiness(),
          menus: normalized?.menus ?? [],
          gallery: normalized?.gallery ?? [],
          testimonials: normalized?.testimonials ?? [],
        };
      },
    }
  )
);
