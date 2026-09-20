import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `site-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

export type TestimonialSource = "manual" | "google";

export type SiteTestimonial = {
  id: string;
  quoteEn: string;
  quoteTa: string;
  author: string;
  event: string;
  place: string;
  rating: number;
  source: TestimonialSource;
  profileUrl: string;
  authorPhotoUrl: string;
  googleReviewId: string;
};

export type SiteCourseGroup = {
  id: string;
  nameEn: string;
  nameTa: string;
  items: { en: string; ta: string }[];
};

export type SiteMenu = {
  id: string;
  nameEn: string;
  nameTa: string;
  tagEn: string;
  tagTa: string;
  descEn: string;
  descTa: string;
  price: number;
  photoUrl: string;
  templateId: string | null;
  courses: SiteCourseGroup[];
};

export type GalleryKind = "photo" | "instagram";

export function isGalleryKind(value: unknown): value is GalleryKind {
  return value === "photo" || value === "instagram";
}

export type SiteGalleryItem = {
  id: string;
  kind: GalleryKind;
  url: string;
  captionEn: string;
  captionTa: string;
  category: string;
};

export type SiteBusiness = {
  phones: string[];
  whatsapp: string;
  addressEn: string;
  addressTa: string;
};

export type SiteMenuInput = Omit<SiteMenu, "id" | "courses"> & {
  courses: Omit<SiteCourseGroup, "id">[];
};

export type SiteTestimonialInput = Omit<SiteTestimonial, "id">;
export type SiteGalleryInput = Omit<SiteGalleryItem, "id">;

const IMG = "https://mampallicatering.vercel.app/images";

function seedTestimonials(): SiteTestimonial[] {
  return [
    {
      id: newId(),
      quoteEn:
        "For our daughter's wedding at Marthandam, we booked Mampalli for 1,800 guests. The Kerala Sadya was flawless! Guests from Trivandrum were praising the Ada Pradhaman and fresh crispy chips for weeks. The servers were so kind.",
      quoteTa: "",
      author: "Anand & Priya Ramachandran",
      event: "Daughter's Wedding Reception",
      place: "Marthandam",
      rating: 5,
      source: "manual",
      profileUrl: "",
      authorPhotoUrl: "",
      googleReviewId: "",
    },
    {
      id: newId(),
      quoteEn:
        "We held my father's 60th Shashti Poorthi pooja at Thiruvarambu. The traditional Tamil Virundhu was pure nostalgia. Drumstick sambar with authentic ghee aroma felt like our grandmother's feast. Truly exceptional service!",
      quoteTa: "",
      author: "Dr. K. Sundaram",
      event: "60th Birthday Celebration (Shashti Poorthi)",
      place: "Nagercoil",
      rating: 5,
      source: "manual",
      profileUrl: "",
      authorPhotoUrl: "",
      googleReviewId: "",
    },
    {
      id: newId(),
      quoteEn:
        "From the morning filter coffee and fluffy poori masala to the grand evening Biryani live counters, Mampalli managed our housewarming seamlessly. The kitchen space was left spotlessly clean afterward!",
      quoteTa: "",
      author: "Meera & Navin",
      event: "Housewarming Ceremony (Grahapravesam)",
      place: "Thuckalay",
      rating: 5,
      source: "manual",
      profileUrl: "",
      authorPhotoUrl: "",
      googleReviewId: "",
    },
  ];
}

function seedMenus(): SiteMenu[] {
  return [
    {
      id: newId(),
      nameEn: "Royal Travancore Wedding Sadya",
      nameTa: "ராயல் திருவிதாங்கூர் திருமண சாத்யா",
      tagEn: "26 Items Traditional",
      tagTa: "26 வகை பாரம்பரியம்",
      descEn: "Authentic 26-course Grand Feast on Fresh Banana Leaf. Served ceremoniously with pure cow ghee poured atop steaming parippu and Kerala Red Matta / Ponni rice.",
      descTa: "",
      price: 280,
      photoUrl: `${IMG}/img_03.jpg`,
      templateId: null,
      courses: [
        {
          id: newId(),
          nameEn: "Core Feasts & Curries",
          nameTa: "முக்கிய குழம்புகள்",
          items: [
            { en: "Kerala Red Matta Rice & Ponni Rice", ta: "" },
            { en: "Parippu Curry & Steaming Fresh Cow Ghee", ta: "" },
            { en: "Travancore Drumstick & Pumpkin Sambar", ta: "" },
            { en: "Pepper Cumin Rasam & Moru Kachiathu", ta: "" },
            { en: "Traditional Kalan & Tender Ash Gourd Olan", ta: "" },
          ],
        },
        {
          id: newId(),
          nameEn: "Accompaniments & Crisps",
          nameTa: "துணை உணவுகள்",
          items: [
            { en: "Classic Avial in Cold-Pressed Coconut Oil", ta: "" },
            { en: "Beetroot & Cabbage Coconut Thoran", ta: "" },
            { en: "Pineapple Kichadi & White Pumpkin Pachadi", ta: "" },
            { en: "Nendran Banana Chips & Sharkara Varatti", ta: "" },
            { en: "Ginger Puli Inji & Large Crispy Appalam", ta: "" },
          ],
        },
        {
          id: newId(),
          nameEn: "Signature Double Payasam Finale",
          nameTa: "இரட்டை பாயசம்",
          items: [
            { en: "Ada Pradhaman: rice flakes in dark jaggery, thick coconut milk & fried cashews", ta: "" },
            { en: "Palada Payasam: slow-simmered rich milk delight", ta: "" },
          ],
        },
      ],
    },
    {
      id: newId(),
      nameEn: "Tamil Virundhu Sappadu",
      nameTa: "தமிழ் விருந்து சாப்பாடு",
      tagEn: "Kalyana Virundhu",
      tagTa: "கல்யாண விருந்து",
      descEn: "Grand Tamil wedding feast on fresh banana leaf with drumstick sambar, variety pachadis, poriyals and double payasam.",
      descTa: "",
      price: 0,
      photoUrl: `${IMG}/img_02.jpg`,
      templateId: null,
      courses: [],
    },
    {
      id: newId(),
      nameEn: "Grand Celebration Feast",
      nameTa: "பிரமாண்ட கொண்டாட்ட விருந்து",
      tagEn: "Mega Events",
      tagTa: "பெரிய நிகழ்வுகள்",
      descEn: "Banquet-style feasts for 500 to 5,000+ guests with live counters and uniformed service.",
      descTa: "",
      price: 0,
      photoUrl: `${IMG}/img_05.jpg`,
      templateId: null,
      courses: [],
    },
    {
      id: newId(),
      nameEn: "Live Tiffin & Evening Counters",
      nameTa: "நேரடி டிபன் & மாலை கவுண்டர்கள்",
      tagEn: "Interactive Counters",
      tagTa: "நேரடி கவுண்டர்கள்",
      descEn: "Filter coffee, poori masala, dosa varieties, Biryani and chaat counters served live.",
      descTa: "",
      price: 0,
      photoUrl: `${IMG}/img_06.jpg`,
      templateId: null,
      courses: [],
    },
  ];
}

function seedGallery(): SiteGalleryItem[] {
  const photo = (
    url: string,
    captionEn: string,
    category: string
  ): SiteGalleryItem => ({ id: newId(), kind: "photo", url, captionEn, captionTa: "", category });
  return [
    photo(`${IMG}/img_02.jpg`, "2,500 Guests Vazhaillai Virundhu", "sadya"),
    photo(`${IMG}/img_03.jpg`, "Heirloom Red Rice & Payasams", "sadya"),
    photo(`${IMG}/img_04.jpg`, "Pure Brass Uruli Cooking", "kitchens"),
    photo(`${IMG}/img_05.jpg`, "Marthandam Wedding Mandapam", "receptions"),
    photo(`${IMG}/img_06.jpg`, "Interactive Live Tiffin Experience", "live"),
    photo(`${IMG}/img_07.jpg`, "Ada Pradhaman & Ghee Halwa", "sadya"),
  ];
}

function seedBusiness(): SiteBusiness {
  return {
    phones: ["+91 94432 10000", "+91 98421 20000"],
    whatsapp: "919443210000",
    addressEn:
      "Mampalli Central Kitchen, Main Road, Thiruvarambu, Kanyakumari District, Tamil Nadu - 629161",
    addressTa: "",
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

function withIds(input: SiteMenuInput): SiteMenu {
  return {
    ...input,
    id: newId(),
    courses: input.courses.map((course) => ({ ...course, id: newId() })),
  };
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/**
 * Validate + normalize a content doc pulled from the database.
 * Returns null when the payload is unusable. Missing ids are regenerated
 * so older/alien payloads still load safely.
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
  };
  const menus: SiteMenu[] = (doc.menus as Record<string, unknown>[]).map((raw) => ({
    id: asString(raw.id) || newId(),
    nameEn: asString(raw.nameEn),
    nameTa: asString(raw.nameTa),
    tagEn: asString(raw.tagEn),
    tagTa: asString(raw.tagTa),
    descEn: asString(raw.descEn),
    descTa: asString(raw.descTa),
    price: asNumber(raw.price, 0),
    photoUrl: asString(raw.photoUrl),
    templateId: typeof raw.templateId === "string" ? raw.templateId : null,
    courses: Array.isArray(raw.courses)
      ? (raw.courses as Record<string, unknown>[]).map((course) => ({
          id: asString(course.id) || newId(),
          nameEn: asString(course.nameEn),
          nameTa: asString(course.nameTa),
          items: Array.isArray(course.items)
            ? (course.items as Record<string, unknown>[])
                .map((item) => ({ en: asString(item.en), ta: asString(item.ta) }))
                .filter((item) => item.en !== "")
            : [],
        }))
      : [],
  }));
  const gallery: SiteGalleryItem[] = (doc.gallery as Record<string, unknown>[]).map((raw) => ({
    id: asString(raw.id) || newId(),
    kind: isGalleryKind(raw.kind) ? raw.kind : "photo",
    url: asString(raw.url),
    captionEn: asString(raw.captionEn),
    captionTa: asString(raw.captionTa),
    category: asString(raw.category) || "sadya",
  }));
  const testimonials: SiteTestimonial[] = (doc.testimonials as Record<string, unknown>[]).map(
    (raw) => ({
      id: asString(raw.id) || newId(),
      quoteEn: asString(raw.quoteEn),
      quoteTa: asString(raw.quoteTa),
      author: asString(raw.author),
      event: asString(raw.event),
      place: asString(raw.place),
      rating: Math.min(5, Math.max(1, Math.round(asNumber(raw.rating, 5)))),
      source: raw.source === "google" ? "google" : "manual",
      profileUrl: asString(raw.profileUrl),
      authorPhotoUrl: asString(raw.authorPhotoUrl),
      googleReviewId: asString(raw.googleReviewId),
    })
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
        set((state) => ({ menus: [...state.menus, withIds(input)] })),
      updateMenu: (id, input) =>
        set((state) => ({
          menus: state.menus.map((menu) =>
            menu.id === id
              ? {
                  ...input,
                  id,
                  courses: input.courses.map((course) => ({
                    ...course,
                    id:
                      menu.courses.find(
                        (c) => c.nameEn === course.nameEn && c.nameTa === course.nameTa
                      )?.id ?? newId(),
                  })),
                }
              : menu
          ),
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
      version: 3,
      migrate: (persistedState) => {
        const state = persistedState as {
          gallery?: Array<Record<string, unknown>> | null;
          business?: Record<string, unknown> | null;
          lastPublishedAt?: unknown;
        } & Record<string, unknown>;
        return {
          ...state,
          lastPublishedAt:
            typeof state.lastPublishedAt === "string" ? state.lastPublishedAt : null,
          business: {
            phones: [],
            whatsapp: "",
            addressEn: "",
            addressTa: "",
            ...(state.business ?? {}),
          },
          gallery: (state.gallery ?? []).map((raw) => ({
            ...raw,
            kind: isGalleryKind(raw.kind) ? raw.kind : "photo",
          })),
        };
      },
    }
  )
);
